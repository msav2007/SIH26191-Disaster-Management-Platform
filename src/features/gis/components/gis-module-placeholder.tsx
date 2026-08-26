import { ModulePlaceholder } from '@/components/status/module-placeholder';
import { gisLayerRoadmap } from '@/server/gis/layer-registry';

export function GisModulePlaceholder() {
  return (
    <ModulePlaceholder
      currentScope="This route proves the GIS section exists in the application shell, but it does not fake map intelligence. The later GIS phase will introduce real layers, viewport-aware APIs, and spatial interactions."
      deliveryPhase="Phase 3"
      description="Future home of the interactive GIS surface for hazard layers, Red Zones, habitations, and relocation sites."
      nextMilestones={gisLayerRoadmap.map((layer) => `${layer.label}: ${layer.description}`)}
      responsibilities={[
        'Reserve the GIS navigation and layout surface for future MapLibre integration.',
        'Document the first layer roadmap without simulating analytics.',
        'Keep the module honest about current implementation status.',
      ]}
      title="GIS Risk Map"
    />
  );
}

