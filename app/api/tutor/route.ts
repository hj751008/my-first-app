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
    const body = (await request.json()) as TutorRequestBody;
    const messages = body.messages ?? [];
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
          error: data.error?.message ?? "OpenAI 응답을 불러오는 중 문제가 생겼어.",
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
