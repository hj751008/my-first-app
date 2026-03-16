export const SUJI_MATH_AI_STORAGE_PREFIX = "suji-math-ai:";
export const UNIT_PROGRESS_STORAGE_KEY = `${SUJI_MATH_AI_STORAGE_PREFIX}unit-progress`;
export const UNIT_MASTERY_STORAGE_KEY = `${SUJI_MATH_AI_STORAGE_PREFIX}unit-mastery`;

export type UnitProgressMap = Record<string, number>;

export type UnitMastery = {
  reachedGuidedPractice: boolean;
  usedHint: boolean;
  recoveredOnce: boolean;
  reachedReflection: boolean;
  summaryAttempted: boolean;
  quizCompleted: boolean;
  quizScore: number;
  lastState: string;
};

export type UnitMasteryMap = Record<string, UnitMastery>;

const defaultMastery: UnitMastery = {
  reachedGuidedPractice: false,
  usedHint: false,
  recoveredOnce: false,
  reachedReflection: false,
  summaryAttempted: false,
  quizCompleted: false,
  quizScore: 0,
  lastState: "diagnose",
};

export function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function readUnitProgressMap(storage: Storage): UnitProgressMap {
  try {
    const raw = storage.getItem(UNIT_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return (JSON.parse(raw) as UnitProgressMap) ?? {};
  } catch {
    return {};
  }
}

export function readUnitMasteryMap(storage: Storage): UnitMasteryMap {
  try {
    const raw = storage.getItem(UNIT_MASTERY_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return (JSON.parse(raw) as UnitMasteryMap) ?? {};
  } catch {
    return {};
  }
}

export function writeUnitProgress(
  storage: Storage,
  unitKey: string,
  progress: number
) {
  const current = readUnitProgressMap(storage);
  current[unitKey] = clampProgress(progress);
  storage.setItem(UNIT_PROGRESS_STORAGE_KEY, JSON.stringify(current));
}

export function writeUnitMastery(
  storage: Storage,
  unitKey: string,
  mastery: Partial<UnitMastery>
) {
  const current = readUnitMasteryMap(storage);
  const next: UnitMastery = {
    ...defaultMastery,
    ...current[unitKey],
    ...mastery,
  };

  current[unitKey] = next;
  storage.setItem(UNIT_MASTERY_STORAGE_KEY, JSON.stringify(current));
}

export function getUnitProgress(
  map: UnitProgressMap,
  unitKey: string,
  fallback = 0
) {
  return clampProgress(map[unitKey] ?? fallback);
}

export function getUnitMastery(
  map: UnitMasteryMap,
  unitKey: string
): UnitMastery {
  return {
    ...defaultMastery,
    ...map[unitKey],
  };
}
