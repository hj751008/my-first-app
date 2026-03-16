"use client";

import { UnitTutorClient } from "@/app/middle-1/_shared/UnitTutorClient";
import { getUnitDefinition } from "@/lib/units";

export function TutorClient() {
  return <UnitTutorClient unit={getUnitDefinition("middle-1-data-interpretation")} />;
}
