# SIH26191 – Intelligent GIS-Enabled Disaster Management & Relocation Decision Support Platform

**Smart India Hackathon 2026 Problem Statement:** `SIH26191 [SW]`  
**Operational Status:** **Phases 1–9 Complete, Verified & Production-Hardened**  
**Core Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript Strict · Tailwind CSS v4 · PostgreSQL + PostGIS · Drizzle ORM · Vitest · Playwright

---

## 1. System Architecture & End-to-End Decision Pipeline

The platform is designed as an authority-facing command system integrating spatial analysis, multi-hazard risk assessment, carrying-capacity modeling, relocation site matching, statutory reporting, climate scenario simulation, and grounded AI briefings into a unified, single-source-of-truth architecture.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               AUTHORITY COMMAND CENTER                                 │
│                                      (/dashboard)                                      │
└───────────────────────────────────────────▲────────────────────────────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        ▼                                   ▼                                   ▼
┌──────────────────┐             ┌─────────────────────┐             ┌──────────────────┐
│   GIS ENGINE     │             │ MULTI-HAZARD RISK   │             │   RELOCATION     │
│      (/map)      │             │      ENGINE         │             │    CAPACITY &    │
│  WGS84 EPSG:4326 │────────────►│   (/habitations)    │────────────►│ MATCHING ENGINE  │
│   Red Zones &    │             │ 5-Factor Score &    │             │   (/relocation)  │
│ Critical Infra   │             │ Prioritization      │             │ 10-Dim Headroom  │
└──────────────────┘             └─────────────────────┘             └──────────────────┘
        │                                   │                                   │
        └───────────────────────────────────┼───────────────────────────────────┘
                                            │
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │  SCENARIO SIMULATOR & GROUNDED AI LAYER │
                       │              (/scenarios)               │
                       │  Deterministic Stress Testing & Proofs  │
                       └────────────────────┬────────────────────┘
                                            │
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │  AUTHORITY REPORTS & STATUTORY EXPORTS  │
                       │               (/reports)                │
                       │  A4 Print, Dossiers, RFC 4180 CSV, JSON │
                       └─────────────────────────────────────────┘
```

---

## 2. Mathematical Formulations & Decision Engines

### A. Multi-Hazard Composite Vulnerability Score ($S_{\text{comp}}$)
Evaluates habitations across 5 weighted dimensions (0–100 scale):

$$S_{\text{comp}} = \sum_{i=1}^{5} w_i \cdot S_i = 0.35 \cdot S_{\text{haz}} + 0.25 \cdot S_{\text{vuln}} + 0.20 \cdot S_{\text{hist}} + 0.10 \cdot S_{\text{exp}} + 0.10 \cdot S_{\text{infra}}$$

- **$S_{\text{comp}} \ge 75$:** `CRITICAL` Priority $\to$ Immediate Relocation (0–6 months)
- **$50 \le S_{\text{comp}} < 75$:** `HIGH` Priority $\to$ Short-term Relocation (6–18 months)
- **$25 \le S_{\text{comp}} < 50$:** `MEDIUM` Priority $\to$ Medium-term Relocation (18–36 months)
- **$S_{\text{comp}} < 25$:** `LOW` Priority $\to$ Seasonal Monitoring

### B. Relocation Carrying Capacity & Headroom Formula
Determines true population absorption headroom across 10 critical service dimensions:

$$C_{\text{eff}} = \min_{j=1}^{10} \left( C_j \right), \quad \text{Headroom} = \max\left(0, C_{\text{eff}} - \text{Current Occupancy}\right)$$

$$\text{Capacity Bottleneck} = \arg\min_{j} \left( C_j \right) \quad (\text{e.g., Emergency Shelter Structures, Potable Water})$$

> [!IMPORTANT]
> **Capacity $\neq$ Suitability:** Carrying capacity is an absolute physical headcount threshold. Suitability is a multi-criteria score (0–100) factoring distance, terrain safety, and social cohesion.

### C. Multi-Criteria Site Matching Suitability ($S_{\text{match}}$)
Evaluates candidate relocation sites across 10 weighted criteria:

$$S_{\text{match}} = 0.20 \cdot S_{\text{dist}} + 0.15 \cdot S_{\text{hazard\_safety}} + 0.15 \cdot S_{\text{land}} + 0.10 \cdot S_{\text{water}} + 0.10 \cdot S_{\text{shelter}} + 0.08 \cdot S_{\text{road}} + 0.07 \cdot S_{\text{health}} + 0.05 \cdot S_{\text{school}} + 0.05 \cdot S_{\text{power}} + 0.05 \cdot S_{\text{livelihood}}$$

### D. Climate Stress Scenario Simulation Modifiers
$$S_{\text{hazard}}^{\text{scenario}} = \min\left(100, \operatorname{round}\left(S_{\text{hazard}}^{\text{base}} \cdot M_{\text{rain}} \cdot M_{\text{slope}} + \Delta_{\text{cloudburst}} \cdot 0.35\right)\right)$$

---

## 3. Controlled Deterministic Dataset (6 High-Risk Regions)

| District / Region | State | Primary Hazard | Assessed Settlements | Key Candidate Sector |
| :--- | :--- | :--- | :---: | :--- |
| **Wayanad (Meppadi)** | Kerala | Landslide / Debris Flow | Chooralmala (`HAB-WY-01`) | Meppadi High Ridge (`SITE-WY-01`) |
| **Chamoli (Joshimath)** | Uttarakhand | Slope Subsidence / Slide | Sunil Ward (`HAB-CH-01`) | Pipalkoti Uplands (`SITE-CH-01`) |
| **Rudraprayag (Kedarnath)** | Uttarakhand | Flash Flood / Cloudburst | Rambara (`HAB-RP-01`) | Guptkashi Foothills (`SITE-RP-01`) |
| **Majuli Island** | Assam | Riverbank Erosion / Inundation | Kamalabari (`HAB-MJ-01`) | Jorhat North Bank (`SITE-MJ-01`) |
| **Kendrapara (Satabhaya)** | Odisha | Sea Inundation / Storm Surge | Satabhaya (`HAB-KP-01`) | Bagapatia Resettlement (`SITE-KP-01`) |
| **Pithoragarh (Munsiari)** | Uttarakhand | Seismic / Landslide | Sarmoli (`HAB-PG-01`) | Madkot Terrace (`SITE-PG-01`) |

---

## 4. Provenance Discipline & Data Honesty

Every screen, report, CSV export, and JSON API response explicitly carries:
```
DEMO / SEEDED DATA — NOT AN OFFICIAL GOVERNMENT RECORD.
Generated by SIH26191 Deterministic Decision-Support Engine for operational planning and evaluation purposes.
```
- **No Fabricated Live Data:** No mock API claims to be a live IMD/CWC telemetry feed.
- **Data Completeness:** Missing or unassessed attributes are tagged as `DATA SOURCE REQUIRED`.
- **Statutory Language:** Outputs are titled *Decision-Support Reports* or *Draft Relocation Justifications* pursuant to Sections 30 & 34 of the Disaster Management Act 2005.

---

## 5. SIH 6-Step Judge Demo Walkthrough

### Step 1: Command Center Overview (`/dashboard`)
1. Open `/dashboard`. Observe the 6-card KPI strip: 7 habitations evaluated, 2 Critical, 5,126 population evaluated, 5,126 relocation headroom.
2. Review the **Operational Priority Queue**: Chooralmala Town Settlement is ranked #1 ($85.8$ Risk Score, CRITICAL).
3. Review the **Authority Action Queue**: Directives derived from live assessments.

### Step 2: Global Authority Search (`Ctrl+K` / `⌘K`)
1. Press `Ctrl+K` or click the search bar in the header.
2. Type `Chooralmala` $\to$ instant deep link to Habitation Dossier.
3. Type `SITE-WY-01` $\to$ instant deep link to Relocation Planning.

### Step 3: Operational Multi-Hazard GIS (`/map`)
1. Open `/map`. Inspect the 8 vector GIS layer toggles.
2. Click **Chooralmala Town Settlement** centroid to open the Inspector panel (shows Coordinates, Elevation, Distance to river, and Risk factor breakdown).

### Step 4: Habitation Prioritization & Relocation Planning (`/habitations` & `/relocation`)
1. Open `/habitations`. Select `Chooralmala Town Settlement`.
2. Inspect the 5-factor mathematical score breakdown ($w_i \cdot S_i$).
3. Click **"Find Relocation Options"** $\to$ transitions to `/relocation?habitationId=HAB-WY-01`.
4. Observe **Meppadi High Ridge Rehabilitation Complex** recommended with $90/100$ suitability, $5.9\text{ km}$ transit distance, and $959$ persons available headroom constrained by Emergency Shelter Structures.

### Step 5: Climate Stress Scenario Simulator (`/scenarios`)
1. Open `/scenarios`. Select `+20% Monsoon Extreme Rainfall Escalation`.
2. Observe live impact deltas: +7 habitations escalated, +2 newly critical, +3,900 population shift.
3. Inspect the **Grounded AI Briefing Panel**: Displays exact mathematical proofs ($\Delta w_i \cdot S_i$) with guaranteed offline fallback.

### Step 6: Official Statutory Reports & Exports (`/reports`)
1. Open `/reports`. Select **Executive Summary**, **Vulnerability Dossier**, or **Relocation Justification**.
2. Click **Export CSV** $\to$ streams RFC 4180 escaped CSV attachment.
3. Click **Export JSON** $\to$ streams structured JSON envelope (`schemaVersion: 1.0.0`) with WGS84 GIS coordinate appendix.
4. Click **Print Report (A4)** $\to$ opens clean high-contrast A4 print preview with chrome suppression.

---

## 6. REST API Catalog

| Route | Method | Description |
| :--- | :---: | :--- |
| `/api/search` | `GET` | Universal multi-entity search across habitations, zones, sites, and districts |
| `/api/scenarios` | `GET` | Lists all 5 climate scenario presets |
| `/api/scenarios/:id` | `GET` | Preset detail (404 on invalid ID) |
| `/api/scenarios/simulate` | `POST` | Executes simulation with custom modifier payload |
| `/api/scenarios/impact` | `GET` | Aggregate impact & district rollups |
| `/api/scenarios/explanation/:habitationId` | `GET` | Grounded explanation for a settlement under simulation |
| `/api/ai/explain` | `POST` | Generalized grounded AI briefing generation |
| `/api/risk/habitations` | `GET` | Evaluates all habitations with composite risk scores |
| `/api/risk/habitations/:id` | `GET` | Individual habitation risk assessment |
| `/api/relocation/sites` | `GET` | Carrying-capacity assessments for all sites |
| `/api/relocation/matches` | `GET` | Multi-criteria matching allocations |
| `/api/reports/summary` | `GET` | Executive Authority Summary report |
| `/api/reports/vulnerability/:habitationId` | `GET` | Habitation Vulnerability Dossier report |
| `/api/reports/relocation/:habitationId` | `GET` | Statutory Relocation Justification report |
| `/api/reports/export/csv` | `GET` | Downloadable RFC 4180 CSV export |
| `/api/reports/export/json` | `GET` | Machine-readable JSON report export |
| `/api/gis/features` | `GET` | GeoJSON FeatureCollection (EPSG:4326) |
| `/api/health` | `GET` | Application & database connectivity health |

---

## 7. Local Setup & Verification

```bash
# 1. Install dependencies
pnpm install

# 2. Run TypeScript strict typecheck
pnpm typecheck

# 3. Run ESLint validation
pnpm lint

# 4. Run Vitest automated test suite (100+ tests)
pnpm test

# 5. Compile production build (Next.js 16 Turbopack)
pnpm build

# 6. Start production server
pnpm start
```

---

## 8. Data Integration Readiness & Future Live Telemetry

The platform includes server-side provider interfaces under `src/server/integrations/`:
- `HazardDataProvider` (Ready for IMD Doppler Radar & ISRO Bhuvan GeoPortals)
- `RainfallProvider` (Ready for Automatic Weather Station API feeds)
- `RiverGaugeProvider` (Ready for CWC Hydro-Meteorological Gauge network)
- `validateExternalHazardRecord()` (Spatial validator enforcing WGS84 EPSG:4326 bounds and rejecting malformed records)
