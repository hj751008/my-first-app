import { NextResponse } from "next/server";
import {
  buildLessonContext,
  createFallbackReply,
  formatConversation,
  formatLessonContext,
  parseStructuredTutorReply,
  SUJI_SYSTEM_PROMPT,
  type StructuredTutorReply,
  type TutorAction,
  type TutorMessage,
} from "@/lib/tutor";
import { unitDefinitions } from "@/lib/units";

type TutorRequestBody = {
  lesson?: string;
  messages?: TutorMessage[];
  action?: TutorAction;
  hintLevel?: number;
};

type OpenAIResponsePayload = {
  output_text?: string;
  error?: { message?: string };
};

const MAX_REQUEST_BYTES = 16_000;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 500;
const MAX_TOTAL_CONVERSATION_CHARS = 4_000;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const allowedActions = new Set<TutorAction>([
  "default",
  "ask_question",
  "hint_request",
  "dont_know",
  "re_explain",
  "answer_check",
  "emotion_support",
]);
const allowedRoles = new Set<TutorMessage["role"]>(["assistant", "user"]);
const allowedLessons = new Set(Object.keys(unitDefinitions));
const rateLimitStore = new Map<string, number[]>();

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(clientId: string) {
  const now = Date.now();
  const recentRequests = (rateLimitStore.get(clientId) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(clientId, recentRequests);
    return true;
  }

  recentRequests.push(now);
  rateLimitStore.set(clientId, recentRequests);
  return false;
}

function isTutorRole(value: unknown): value is TutorMessage["role"] {
  return typeof value === "string" && allowedRoles.has(value as TutorMessage["role"]);
}

function isTutorAction(value: unknown): value is TutorAction {
  return typeof value === "string" && allowedActions.has(value as TutorAction);
}

function isTutorMessage(value: unknown): value is TutorMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TutorMessage>;
  return (
    isTutorRole(candidate.role) &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0 &&
    candidate.content.length <= MAX_MESSAGE_CHARS
  );
}

function validateBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "요청 형식이 올바르지 않아." };
  }

  const candidate = body as TutorRequestBody;
  const messages = candidate.messages ?? [];

  if (candidate.lesson !== undefined) {
    if (typeof candidate.lesson !== "string" || !allowedLessons.has(candidate.lesson)) {
      return { ok: false as const, error: "lesson 값이 올바르지 않아." };
    }
  }

  if (candidate.action !== undefined && !isTutorAction(candidate.action)) {
    return { ok: false as const, error: "action 값이 올바르지 않아." };
  }

  if (
    candidate.hintLevel !== undefined &&
    (!Number.isInteger(candidate.hintLevel) || candidate.hintLevel < 0 || candidate.hintLevel > 2)
  ) {
    return { ok: false as const, error: "hintLevel 값이 올바르지 않아." };
  }

  if (!Array.isArray(messages)) {
    return { ok: false as const, error: "messages 형식이 올바르지 않아." };
  }

  if (messages.length > MAX_MESSAGES) {
    return { ok: false as const, error: `messages는 최대 ${MAX_MESSAGES}개까지 보낼 수 있어.` };
  }

  if (!messages.every(isTutorMessage)) {
    return { ok: false as const, error: "messages 안에 올바르지 않은 항목이 있어." };
  }

  const totalChars = messages.reduce((sum, message) => sum + message.content.length, 0);
  if (totalChars > MAX_TOTAL_CONVERSATION_CHARS) {
    return {
      ok: false as const,
      error: `대화 전체 길이는 최대 ${MAX_TOTAL_CONVERSATION_CHARS}자까지 보낼 수 있어.`,
    };
  }

  return {
    ok: true as const,
    body: {
      lesson: candidate.lesson,
      messages,
      action: candidate.action,
      hintLevel: candidate.hintLevel,
    },
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY가 아직 설정되지 않았어. Vercel 또는 로컬 환경 변수에 키를 넣으면 실제 튜터와 연결할 수 있어.",
      },
      { status: 503 }
    );
  }

  try {
    const clientId = getClientIdentifier(request);
    if (isRateLimited(clientId)) {
      return NextResponse.json(
        {
          error: "요청이 너무 많아. 잠깐 쉬었다가 다시 시도해보자.",
        },
        { status: 429 }
      );
    }

    const rawBody = await request.text();
    const requestBytes = new TextEncoder().encode(rawBody).length;
    if (requestBytes > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        {
          error: `요청 크기가 너무 커. 최대 ${MAX_REQUEST_BYTES}바이트까지만 보낼 수 있어.`,
        },
        { status: 413 }
      );
    }

    const parsedBody = JSON.parse(rawBody) as unknown;
    const validation = validateBody(parsedBody);
    if (!validation.ok) {
      return NextResponse.json(
        {
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const body = validation.body;
    const messages = body.messages;
    const lessonContext = buildLessonContext({
      lesson: body.lesson,
      messages,
      action: body.action,
      hintLevel: body.hintLevel,
    });

    const input = [
      "[LESSON CONTEXT]",
      formatLessonContext(lessonContext),
      "",
      "[CONVERSATION]",
      formatConversation(messages),
      "",
      "[OUTPUT REMINDER]",
      "반드시 JSON 객체 하나만 출력해.",
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.4",
        instructions: SUJI_SYSTEM_PROMPT,
        input,
      }),
    });

    const data = (await response.json()) as OpenAIResponsePayload;

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "튜터 응답을 불러오는 중 문제가 생겼어.",
        },
        { status: response.status }
      );
    }

    const reply: StructuredTutorReply =
      parseStructuredTutorReply(data.output_text) ??
      createFallbackReply(lessonContext.session_state.tutor_state);

    return NextResponse.json({
      reply,
      lessonContext,
    });
  } catch {
    return NextResponse.json(
      {
        error: "요청을 처리하는 중 문제가 생겼어. 잠깐 뒤에 다시 시도해보자.",
      },
      { status: 500 }
    );
  }
}
