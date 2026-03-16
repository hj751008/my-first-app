"use client";

import { UnitQuizClient } from "@/app/middle-1/_shared/UnitQuizClient";
import { getUnitDefinition } from "@/lib/units";

export function QuizClient() {
  return <UnitQuizClient unit={getUnitDefinition("middle-1-data-interpretation")} />;
}
