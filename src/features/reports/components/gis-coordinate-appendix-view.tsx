import type { GisCoordinateAppendix } from '@/server/reports/report-types';

export interface GisCoordinateAppendixViewProps {
  appendix: GisCoordinateAppendix;
}

export function GisCoordinateAppendixView({ appendix }: GisCoordinateAppendixViewProps) {
  const allFeatures = [
    ...appendix.redZoneFeatures,
    ...appendix.candidateSiteFeatures,
    ...appendix.infrastructureFeatures,
  ];

  return (
    <div className="space-y-2 border-t border-[var(--border)] pt-4">
      <div className="flex items-baseline justify-between">
        <h3 className="label-xs text-[var(--text)]">
          Appendix A: Spatial Coordinates & GIS Registry
        </h3>
        <span className="text-[10px] text-[var(--text-muted)]">
          CRS: <strong>{appendix.crs}</strong>
        </span>
      </div>

      <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
            <tr>
              <th className="px-2.5 py-1.5 font-bold">Feature ID</th>
              <th className="px-2.5 py-1.5 font-bold">Type</th>
              <th className="px-2.5 py-1.5 font-bold">Feature Name</th>
              <th className="px-2.5 py-1.5 font-bold">Latitude (N)</th>
              <th className="px-2.5 py-1.5 font-bold">Longitude (E)</th>
              <th className="px-2.5 py-1.5 font-bold">Attributes / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            <tr className="bg-[var(--accent-soft)]/20 font-medium">
              <td className="px-2.5 py-1.5 font-mono text-[11px] text-[var(--accent-strong)]">
                SUBJECT-COORDS
              </td>
              <td className="px-2.5 py-1.5 capitalize text-[var(--text)]">Habitation Point</td>
              <td className="px-2.5 py-1.5 text-[var(--text)]">Target Settlement Centroid</td>
              <td className="tabnum px-2.5 py-1.5 font-mono">
                {appendix.subjectCoordinates.latitude.toFixed(4)}°
              </td>
              <td className="tabnum px-2.5 py-1.5 font-mono">
                {appendix.subjectCoordinates.longitude.toFixed(4)}°
              </td>
              <td className="px-2.5 py-1.5 text-[10px] text-[var(--text-muted)]">
                Direct spatial centroid reference
              </td>
            </tr>

            {allFeatures.map((f) => (
              <tr key={f.featureId} className="hover:bg-[var(--surface-muted)]">
                <td className="px-2.5 py-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                  {f.featureId}
                </td>
                <td className="px-2.5 py-1.5 capitalize text-[var(--text)]">
                  {f.featureType.replace('_', ' ')}
                </td>
                <td className="px-2.5 py-1.5 font-medium text-[var(--text)]">{f.name}</td>
                <td className="tabnum px-2.5 py-1.5 font-mono">
                  {f.coordinates.latitude.toFixed(4)}°
                </td>
                <td className="tabnum px-2.5 py-1.5 font-mono">
                  {f.coordinates.longitude.toFixed(4)}°
                </td>
                <td className="px-2.5 py-1.5 text-[10px] text-[var(--text-muted)]">
                  {f.notes || `${f.district}, ${f.state}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
