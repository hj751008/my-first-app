import { UnitOverview } from "@/app/middle-1/_shared/UnitOverview";
import { getUnitDefinition } from "@/lib/units";

export default function IntegersAndRationalNumbersPage() {
  return (
    <UnitOverview unit={getUnitDefinition("middle-1-integers-and-rational-numbers")} />
  );
}
