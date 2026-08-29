'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  MapPoint,
} from '@/types/domain';
import {
  criticalInfrastructureFixture,
  habitationsFixture,
  redZonesFixture,
  relocationSitesFixture,
} from '@/server/db/fixtures/disaster-data';
import {
  CrosshairIcon,
  LayersIcon,
  MaximizeIcon,
  MinimizeIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
} from '@/components/ui/icons';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import {
  GisFeatureInspector,
  type SelectedFeature,
} from './gis-feature-inspector';

const VIEW_W = 800;
const VIEW_H = 850;

// Geographic bounding box for India coordinate transformation (EPSG:4326)
const GEO_BBOX = {
  minLng: 68.0,
  maxLng: 97.5,
  minLat: 8.0,
  maxLat: 37.5,
};

function projectGeoToSvg(point: MapPoint): { x: number; y: number } {
  const x = ((point.longitude - GEO_BBOX.minLng) / (GEO_BBOX.maxLng - GEO_BBOX.minLng)) * 740 + 30;
  const y = ((GEO_BBOX.maxLat - point.latitude) / (GEO_BBOX.maxLat - GEO_BBOX.minLat)) * 790 + 30;
  return { x, y };
}

// Stylized national boundary path for vector backdrop
const INDIA_VECTOR_PATH =
  'M 260 70 L 310 55 L 340 90 L 410 105 L 435 140 L 485 160 L 535 150 L 575 185 L 620 190 L 650 225 L 620 250 L 640 285 L 605 310 L 580 300 L 550 330 L 525 310 L 490 330 L 475 370 L 490 430 L 475 480 L 450 550 L 420 630 L 385 710 L 365 755 L 350 710 L 320 620 L 290 540 L 250 480 L 220 430 L 205 385 L 180 350 L 170 310 L 195 275 L 170 240 L 205 210 L 220 160 L 245 130 Z';

export type LayerKey =
  | 'red_zones'
  | 'flood'
  | 'landslide'
  | 'coastal_erosion'
  | 'cloudburst'
  | 'habitations'
  | 'relocation_sites'
  | 'infrastructure';

const MAP_STYLES = [
  { key: 'terrain', label: 'Topographic' },
  { key: 'administrative', label: 'Administrative' },
  { key: 'satellite', label: 'Satellite Dark' },
] as const;

type MapStyleKey = (typeof MAP_STYLES)[number]['key'];

const STYLE_PALETTES: Record<MapStyleKey, { canvas: string; land: string; stroke: string; graticule: string }> = {
  terrain: {
    canvas: '#eaf2f8',
    land: '#f0f7ed',
    stroke: '#94a3b8',
    graticule: 'rgba(75, 93, 115, 0.12)',
  },
  administrative: {
    canvas: '#f8fafc',
    land: '#ffffff',
    stroke: '#64748b',
    graticule: 'rgba(75, 93, 115, 0.15)',
  },
  satellite: {
    canvas: '#0b1526',
    land: '#17253b',
    stroke: '#334155',
    graticule: 'rgba(148, 163, 184, 0.12)',
  },
};

export interface OperationalGisMapProps {
  className?: string;
  initialSelectedId?: string | null;
  onSelectFeature?: (feature: SelectedFeature | null) => void;
}

export function OperationalGisMap({
  className,
  initialSelectedId = null,
}: OperationalGisMapProps) {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    red_zones: true,
    landslide: true,
    flood: true,
    coastal_erosion: true,
    cloudburst: true,
    habitations: true,
    relocation_sites: true,
    infrastructure: true,
  });

  const [mapStyle, setMapStyle] = useState<MapStyleKey>('terrain');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(() => {
    if (!initialSelectedId) return null;
    const h = habitationsFixture.find((x) => x.id === initialSelectedId);
    if (h) return { type: 'habitation', data: h };
    const z = redZonesFixture.find((x) => x.id === initialSelectedId);
    if (z) return { type: 'red_zone', data: z };
    return null;
  });

  const [hoverInfo, setHoverInfo] = useState<{ title: string; subtitle: string; x: number; y: number } | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showLayerDrawer, setShowLayerDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const focusCoordinates = useCallback((point: MapPoint, targetZoom = 3.2) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const proj = projectGeoToSvg(point);

    const scaleX = rect.width / VIEW_W;
    const scaleY = rect.height / VIEW_H;
    const base = Math.min(scaleX, scaleY);

    setZoom(targetZoom);
    setOffset({
      x: rect.width / 2 - proj.x * base * targetZoom,
      y: rect.height / 2 - proj.y * base * targetZoom,
    });
  }, []);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.8, Math.min(8.0, Math.round((prev + delta) * 10) / 10)));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const matchedHabitations = habitationsFixture
      .filter((h) => `${h.name} ${h.district} ${h.id}`.toLowerCase().includes(q))
      .map((h) => ({ id: h.id, label: h.name, sub: `Habitation · ${h.district} (${h.priority})`, coords: h.coordinates, feature: { type: 'habitation' as const, data: h } }));

    const matchedZones = redZonesFixture
      .filter((z) => `${z.name} ${z.district} ${z.id}`.toLowerCase().includes(q))
      .map((z) => ({ id: z.id, label: z.name, sub: `Red Zone · ${z.district} (${z.severity})`, coords: z.coordinates, feature: { type: 'red_zone' as const, data: z } }));

    const matchedSites = relocationSitesFixture
      .filter((s) => `${s.name} ${s.district} ${s.id}`.toLowerCase().includes(q))
      .map((s) => ({ id: s.id, label: s.name, sub: `Relocation Site · ${s.district}`, coords: s.coordinates, feature: { type: 'relocation_site' as const, data: s } }));

    return [...matchedHabitations, ...matchedZones, ...matchedSites].slice(0, 6);
  }, [searchQuery]);

  const palette = STYLE_PALETTES[mapStyle];

  return (
    <div
      className={`relative flex flex-col border border-slate-200 bg-white shadow-xs ${
        isFullscreen ? 'fixed inset-3 z-50 rounded-xl' : 'rounded-xl'
      } ${className ?? ''}`}
    >
      {/* Top Header & GIS Controls */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs ring-1 ring-blue-700/30">
            <LayersIcon className="size-4.5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                STATE DISASTER MANAGEMENT AUTHORITY
              </span>
              <ProvenanceTag value="DEMO DATA" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              OPERATIONAL MULTI-HAZARD GIS
            </h2>
            <p className="text-xs text-slate-500">
              Explore statutory red zones, vulnerable habitations, candidate relocation sites and critical infrastructure.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Autocomplete */}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search map settlements and zones"
              className="h-8 w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Chooralmala, Joshimath..."
              value={searchQuery}
            />
            {searchResults.length > 0 && (
              <ul className="absolute left-0 top-9 z-30 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
                {searchResults.map((res) => (
                  <li key={res.id}>
                    <button
                      className="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-slate-50"
                      onClick={() => {
                        focusCoordinates(res.coords, 3.6);
                        setSelectedFeature(res.feature);
                        setSearchQuery('');
                      }}
                      type="button"
                    >
                      <span className="text-xs font-semibold text-slate-900">{res.label}</span>
                      <span className="text-[10px] text-slate-500">{res.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Style Selector */}
          <select
            aria-label="Select base map style"
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-cyan-500"
            onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
            value={mapStyle}
          >
            {MAP_STYLES.map((st) => (
              <option key={st.key} value={st.key}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Layer Control Toggle */}
          <button
            aria-label="Toggle layer visibility panel"
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all ${
              showLayerDrawer
                ? 'border-sky-300 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setShowLayerDrawer((prev) => !prev)}
            type="button"
          >
            <LayersIcon className="size-3.5" />
            Layers
          </button>

          {/* Fullscreen Toggle */}
          <button
            aria-label="Toggle fullscreen map view"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            onClick={() => setIsFullscreen((prev) => !prev)}
            type="button"
          >
            {isFullscreen ? <MinimizeIcon className="size-3.5" /> : <MaximizeIcon className="size-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Map Body: Canvas + Inspection Drawer */}
      <div className="relative flex flex-1 overflow-hidden" style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : '580px' }}>
        <div
          ref={containerRef}
          className="relative flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            isDraggingRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
          }}
          onPointerLeave={() => {
            isDraggingRef.current = null;
            setHoverInfo(null);
            setCursorCoords(null);
          }}
          onPointerMove={(e) => {
            const drag = isDraggingRef.current;
            if (drag) {
              setOffset({
                x: drag.ox + (e.clientX - drag.x),
                y: drag.oy + (e.clientY - drag.y),
              });
            }

            // Calculate Approximate Coordinates at Cursor
            const el = containerRef.current;
            if (el) {
              const rect = el.getBoundingClientRect();
              const svgX = (e.clientX - rect.left - offset.x) / zoom;
              const svgY = (e.clientY - rect.top - offset.y) / zoom;

              const lng = GEO_BBOX.minLng + (svgX / 740) * (GEO_BBOX.maxLng - GEO_BBOX.minLng);
              const lat = GEO_BBOX.maxLat - (svgY / 790) * (GEO_BBOX.maxLat - GEO_BBOX.minLat);

              if (lat >= 6 && lat <= 38 && lng >= 66 && lng <= 99) {
                setCursorCoords({ lat, lng });
              }
            }
          }}
          onPointerUp={() => {
            isDraggingRef.current = null;
          }}
          style={{ backgroundColor: palette.canvas }}
        >
          <svg
            aria-label="Operational GIS Map showing multi-hazard red zones, vulnerable habitations and candidate relocation sites"
            className="size-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          >
            <defs>
              <pattern height="40" id="gis-graticule" patternUnits="userSpaceOnUse" width="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={palette.graticule} strokeWidth="0.75" />
              </pattern>
              <radialGradient id="redZoneGradient">
                <stop offset="20%" stopColor="#dc2626" stopOpacity="0.45" />
                <stop offset="90%" stopColor="#dc2626" stopOpacity="0.05" />
              </radialGradient>
              <radialGradient id="highZoneGradient">
                <stop offset="20%" stopColor="#d97706" stopOpacity="0.4" />
                <stop offset="90%" stopColor="#d97706" stopOpacity="0.05" />
              </radialGradient>
            </defs>

            <rect fill="url(#gis-graticule)" height={VIEW_H} width={VIEW_W} />

            <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
              {/* National Base Vector Outline */}
              <path
                d={INDIA_VECTOR_PATH}
                fill={palette.land}
                stroke={palette.stroke}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />

              {/* 1. Hazard Red Zones (Polygons / Radial Envelopes) */}
              {layers.red_zones &&
                redZonesFixture.map((z) => {
                  const proj = projectGeoToSvg(z.coordinates);
                  const isSelected = selectedFeature?.type === 'red_zone' && selectedFeature.data.id === z.id;
                  const radiusPixels = z.radiusKm * 4.5;
                  const isCritical = z.severity === 'critical';

                  // Hazard Filter match
                  const matchesHazard =
                    (z.primaryHazard === 'landslide' && layers.landslide) ||
                    (z.primaryHazard === 'flood' && layers.flood) ||
                    (z.primaryHazard === 'coastal_erosion' && layers.coastal_erosion) ||
                    (z.primaryHazard === 'cloudburst' && layers.cloudburst);

                  if (!matchesHazard) return null;

                  return (
                    <g key={z.id}>
                      <circle
                        className="cursor-pointer transition-all duration-200"
                        cx={proj.x}
                        cy={proj.y}
                        fill={isCritical ? 'url(#redZoneGradient)' : 'url(#highZoneGradient)'}
                        onClick={() => setSelectedFeature({ type: 'red_zone', data: z })}
                        onMouseEnter={() =>
                          setHoverInfo({
                            title: z.name,
                            subtitle: `${z.severity.toUpperCase()} Red Zone · ${z.primaryHazard} · Pop: ${z.affectedPopulation.toLocaleString('en-IN')}`,
                            x: proj.x,
                            y: proj.y,
                          })
                        }
                        r={radiusPixels}
                        stroke={isCritical ? '#dc2626' : '#d97706'}
                        strokeDasharray={isSelected ? 'none' : '4 3'}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>
                  );
                })}

              {/* 2. Critical Infrastructure Nodes */}
              {layers.infrastructure &&
                criticalInfrastructureFixture.map((inf) => {
                  const proj = projectGeoToSvg(inf.coordinates);
                  const isSelected = selectedFeature?.type === 'infrastructure' && selectedFeature.data.id === inf.id;

                  return (
                    <g
                      className="cursor-pointer"
                      key={inf.id}
                      onClick={() => setSelectedFeature({ type: 'infrastructure', data: inf })}
                      onMouseEnter={() =>
                        setHoverInfo({
                          title: inf.name,
                          subtitle: `Asset: ${inf.kind.toUpperCase()} (${inf.district})`,
                          x: proj.x,
                          y: proj.y,
                        })
                      }
                      transform={`translate(${proj.x}, ${proj.y})`}
                    >
                      <polygon
                        fill="#0284c7"
                        points="0,-6 6,0 0,6 -6,0"
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1}
                      />
                    </g>
                  );
                })}

              {/* 3. Candidate Relocation Sites */}
              {layers.relocation_sites &&
                relocationSitesFixture.map((site) => {
                  const proj = projectGeoToSvg(site.coordinates);
                  const isSelected = selectedFeature?.type === 'relocation_site' && selectedFeature.data.id === site.id;

                  return (
                    <g
                      className="cursor-pointer"
                      key={site.id}
                      onClick={() => setSelectedFeature({ type: 'relocation_site', data: site })}
                      onMouseEnter={() =>
                        setHoverInfo({
                          title: site.name,
                          subtitle: `Relocation Site · Cap: ${site.carryingCapacity.toLocaleString('en-IN')} · ${site.suitability}`,
                          x: proj.x,
                          y: proj.y,
                        })
                      }
                      transform={`translate(${proj.x - 5}, ${proj.y - 5})`}
                    >
                      <rect
                        fill="#16a34a"
                        height={10}
                        rx={1.5}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        width={10}
                      />
                    </g>
                  );
                })}

              {/* 4. Vulnerable Habitations */}
              {layers.habitations &&
                habitationsFixture.map((h) => {
                  const proj = projectGeoToSvg(h.coordinates);
                  const isSelected = selectedFeature?.type === 'habitation' && selectedFeature.data.id === h.id;

                  const color =
                    h.priority === 'CRITICAL'
                      ? '#dc2626'
                      : h.priority === 'HIGH'
                        ? '#d97706'
                        : '#ca8a04';

                  return (
                    <g key={h.id}>
                      {isSelected && (
                        <circle
                          cx={proj.x}
                          cy={proj.y}
                          fill="none"
                          r={11}
                          stroke={color}
                          strokeWidth={2}
                        />
                      )}
                      <circle
                        className="cursor-pointer transition-all duration-150"
                        cx={proj.x}
                        cy={proj.y}
                        fill={color}
                        onClick={() => setSelectedFeature({ type: 'habitation', data: h })}
                        onMouseEnter={() =>
                          setHoverInfo({
                            title: h.name,
                            subtitle: `${h.priority} Priority · ${h.district} · Pop: ${h.population.toLocaleString('en-IN')}`,
                            x: proj.x,
                            y: proj.y,
                          })
                        }
                        r={5}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    </g>
                  );
                })}
            </g>
          </svg>

          {/* Hover Tooltip */}
          {hoverInfo && (
            <div
              className="pointer-events-none absolute z-20 max-w-xs rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm"
              style={{
                left: Math.min(hoverInfo.x * zoom + offset.x + 14, 500),
                top: hoverInfo.y * zoom + offset.y + 14,
              }}
            >
              <p className="text-xs font-bold text-slate-900">{hoverInfo.title}</p>
              <p className="text-[10px] text-slate-500">{hoverInfo.subtitle}</p>
            </div>
          )}

          {/* Map Controls (Zoom, Reset) */}
          <div className="absolute left-3 top-3 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
            <button
              aria-label="Zoom in"
              className="flex size-8 items-center justify-center text-slate-700 hover:bg-slate-50"
              onClick={() => handleZoom(0.4)}
              type="button"
            >
              <PlusIcon className="size-3.5" />
            </button>
            <button
              aria-label="Zoom out"
              className="flex size-8 items-center justify-center border-t border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => handleZoom(-0.4)}
              type="button"
            >
              <MinusIcon className="size-3.5" />
            </button>
            <button
              aria-label="Reset map extent"
              className="flex size-8 items-center justify-center border-t border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={handleReset}
              type="button"
            >
              <CrosshairIcon className="size-3.5" />
            </button>
          </div>

          {/* Scale & Dynamic Cursor Coordinates */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] text-slate-600 shadow-xs backdrop-blur-sm">
            <span className="tabnum font-semibold">Zoom {zoom.toFixed(1)}×</span>
            <span className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-12 bg-slate-400" />
              <span>~100 km</span>
            </div>
            {cursorCoords && (
              <>
                <span className="h-3 w-px bg-slate-200" />
                <span className="tabnum font-mono text-[10px]">
                  {cursorCoords.lat.toFixed(3)}°N, {cursorCoords.lng.toFixed(3)}°E
                </span>
              </>
            )}
          </div>

          {/* Layer Control Drawer */}
          {showLayerDrawer && (
            <div className="absolute left-12 top-3 z-20 w-72 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-900">Map Layers</span>
                <span className="text-[10px] text-slate-500 font-mono">EPSG:4326</span>
              </div>

              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {/* 1. RISK GROUP */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block mb-1.5">
                    1. Risk &amp; Hazard Envelopes
                  </span>
                  <div className="space-y-1">
                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-red-600 shrink-0" />
                        <div>
                          <span className="font-semibold block">Statutory Red Zones</span>
                          <span className="text-[10px] text-slate-400">Restricted runout areas</span>
                        </div>
                      </div>
                      <input
                        checked={layers.red_zones}
                        className="size-3.5 accent-blue-600"
                        onChange={(e) => setLayers((prev) => ({ ...prev, red_zones: e.target.checked }))}
                        type="checkbox"
                      />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-[11px]">Landslide Risk Scarp</span>
                      </div>
                      <input
                        checked={layers.landslide}
                        className="size-3.5 accent-blue-600"
                        onChange={(e) => setLayers((prev) => ({ ...prev, landslide: e.target.checked }))}
                        type="checkbox"
                      />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-blue-600 shrink-0" />
                        <span className="text-[11px]">Flood Inundation Envelope</span>
                      </div>
                      <input
                        checked={layers.flood}
                        className="size-3.5 accent-blue-600"
                        onChange={(e) => setLayers((prev) => ({ ...prev, flood: e.target.checked }))}
                        type="checkbox"
                      />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-sky-600 shrink-0" />
                        <span className="text-[11px]">Coastal Erosion Belt</span>
                      </div>
                      <input
                        checked={layers.coastal_erosion}
                        className="size-3.5 accent-blue-600"
                        onChange={(e) => setLayers((prev) => ({ ...prev, coastal_erosion: e.target.checked }))}
                        type="checkbox"
                      />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-purple-600 shrink-0" />
                        <span className="text-[11px]">Cloudburst Debris Torrent</span>
                      </div>
                      <input
                        checked={layers.cloudburst}
                        className="size-3.5 accent-blue-600"
                        onChange={(e) => setLayers((prev) => ({ ...prev, cloudburst: e.target.checked }))}
                        type="checkbox"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. SETTLEMENTS GROUP */}
                <div className="border-t border-slate-100 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    2. Settlements &amp; Sites
                  </span>
                  <div className="space-y-1">
                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-red-600 shrink-0" />
                        <div>
                          <span className="font-semibold block">Vulnerable Habitations</span>
                          <span className="text-[10px] text-slate-400">Assessed settlements</span>
                        </div>
                      </div>
                      <input
                        checked={layers.habitations}
                        className="size-3.5 accent-blue-600"
                        onChange={(e) => setLayers((prev) => ({ ...prev, habitations: e.target.checked }))}
                        type="checkbox"
                      />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-sm bg-emerald-600 shrink-0" />
                        <div>
                          <span className="font-semibold block">Relocation Sites</span>
                          <span className="text-[10px] text-slate-400">Safer candidate parcels</span>
                        </div>
                      </div>
                      <input
                        checked={layers.relocation_sites}
                        className="size-3.5 accent-blue-600"
                        onChange={(e) => setLayers((prev) => ({ ...prev, relocation_sites: e.target.checked }))}
                        type="checkbox"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. INFRASTRUCTURE GROUP */}
                <div className="border-t border-slate-100 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                    3. Infrastructure
                  </span>
                  <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rotate-45 bg-blue-700 shrink-0" />
                      <div>
                        <span className="font-semibold block">Critical Infrastructure</span>
                        <span className="text-[10px] text-slate-400">Hospitals, helipads, DEOCs</span>
                      </div>
                    </div>
                    <input
                      checked={layers.infrastructure}
                      className="size-3.5 accent-blue-600"
                      onChange={(e) => setLayers((prev) => ({ ...prev, infrastructure: e.target.checked }))}
                      type="checkbox"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side / Responsive Feature Inspector */}
        <aside className="w-80 shrink-0 border-l border-slate-200 bg-white md:w-96">
          <GisFeatureInspector
            feature={selectedFeature}
            onClose={() => setSelectedFeature(null)}
            onSelectFeature={(f) => setSelectedFeature(f)}
          />
        </aside>
      </div>

      {/* Map Legend Footer */}
      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 bg-white px-5 py-3 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-red-600 border border-white shadow-2xs" />
          <span className="text-slate-800 font-medium">🔴 Red Zone <span className="text-slate-500 text-[11px]">(High-Risk / Statutory Restricted Area)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-500 border border-white shadow-2xs" />
          <span className="text-slate-800 font-medium">● Habitation <span className="text-slate-500 text-[11px]">(Vulnerable Settlement)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-600 border border-white shadow-2xs" />
          <span className="text-slate-800 font-medium">◆ Relocation Site <span className="text-slate-500 text-[11px]">(Candidate Safer Resettlement Area)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rotate-45 bg-blue-700 border border-white shadow-2xs" />
          <span className="text-slate-800 font-medium">■ Critical Infrastructure <span className="text-slate-500 text-[11px]">(Hospital / Helipad / DEOC / Shelter)</span></span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span>{redZonesFixture.length} Red Zones</span>
          <span>·</span>
          <span>{habitationsFixture.length} Habitations</span>
          <span>·</span>
          <span>{relocationSitesFixture.length} Sites</span>
        </div>
      </footer>
    </div>
  );
}
