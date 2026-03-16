import { UnitOverview } from "@/app/middle-1/_shared/UnitOverview";
import { getUnitDefinition } from "@/lib/units";

export default function DataInterpretationPage() {
  return <UnitOverview unit={getUnitDefinition("middle-1-data-interpretation")} />;
}
