import { UnitOverview } from "@/app/middle-1/_shared/UnitOverview";
import { getUnitDefinition } from "@/lib/units";

export default function BasicGeometryPage() {
  return <UnitOverview unit={getUnitDefinition("middle-1-basic-geometry")} />;
}
