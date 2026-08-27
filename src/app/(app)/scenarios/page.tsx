import {
  listScenarioPresets,
  runScenarioSimulation,
} from '@/server/scenarios/scenario-service';
import { ScenariosWorkspace } from '@/features/scenarios/components/scenarios-workspace';

export interface ScenariosPageProps {
  searchParams?: Promise<{
    scenarioId?: string;
    district?: string;
  }>;
}

export default async function ScenariosPage(props: ScenariosPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const scenarioId = searchParams.scenarioId || 'monsoon_rainfall_20';
  const district = searchParams.district;

  const presets = listScenarioPresets();
  const initialSummary = await runScenarioSimulation(scenarioId, undefined, district);

  return (
    <div className="space-y-4">
      <ScenariosWorkspace
        initialSummary={initialSummary}
        presets={presets}
      />
    </div>
  );
}
