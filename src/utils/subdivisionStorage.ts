import type { BoundaryPoint } from './siteMapCalculations';
import type { TopoDigitizationSnapshot } from './topoWorkflow';
import {
  emptyRoadNetwork,
  migrateLinearRoadPoints,
  migrateWorkflowStep,
  type RoadDrawingState,
  type RoadNetwork,
} from './roadNetwork';
import { DEFAULT_ROAD_WIDTH_FT } from './subdivisionRoadPolygon';
import { DEFAULT_TARGET_LOT_SIZE_SQFT, type LotCell, type SpawnPoint } from './subdivisionLotLayout';

export type SubdivisionWorkflowStep =
  | 'upload'
  | 'boundary'
  | 'scale'
  | 'place-road'
  | 'reposition-road'
  | 'road-polygon'
  | 'lot-layout';

export const SUBDIVISION_STORAGE_KEY = 'subdivision-generator-project';

export type SubdivisionSavedProject = TopoDigitizationSnapshot<SubdivisionWorkflowStep> & {
  version: 5;
  savedAt: string;
  roadNetwork: RoadNetwork;
  roadDrawing: RoadDrawingState | null;
  roadComplete: boolean;
  roadWidthFt: number;
  targetLotSizeSqFt: number;
  lotPairCountOverride: number | null;
  growthProgress: number;
};

type SubdivisionSavePayload = Omit<SubdivisionSavedProject, 'version' | 'savedAt'>;

type LegacySavedProject = TopoDigitizationSnapshot<SubdivisionWorkflowStep> & {
  version?: number;
  savedAt?: string;
  roadPoints?: BoundaryPoint[];
  roadComplete?: boolean;
  roadWidthFt?: number;
  spawnCountPerSide?: number;
  targetLotSizeSqFt?: number;
  lotPairCountOverride?: number | null;
  growthProgress?: number;
};

export function saveSubdivisionProject(project: SubdivisionSavePayload): void {
  const payload: SubdivisionSavedProject = {
    version: 5,
    ...project,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(SUBDIVISION_STORAGE_KEY, JSON.stringify(payload));
}

function normalizeStep(step: string): SubdivisionWorkflowStep {
  const migrated = migrateWorkflowStep(step);
  if (migrated === 'road-polygon' || migrated === 'lot-layout') return 'reposition-road';
  if (
    migrated === 'upload' ||
    migrated === 'boundary' ||
    migrated === 'scale' ||
    migrated === 'place-road' ||
    migrated === 'reposition-road' ||
    migrated === 'road-polygon' ||
    migrated === 'lot-layout'
  ) {
    return migrated;
  }
  return 'upload';
}

function migrateLegacyProject(parsed: LegacySavedProject): SubdivisionSavedProject {
  const roadPoints = parsed.roadPoints ?? [];
  return {
    version: 5,
    step: normalizeStep(parsed.step),
    boundary: parsed.boundary ?? [],
    boundaryClosed: parsed.boundaryClosed ?? false,
    ftPerPixel: parsed.ftPerPixel ?? null,
    roadNetwork: roadPoints.length >= 2 ? migrateLinearRoadPoints(roadPoints) : emptyRoadNetwork(),
    roadDrawing: null,
    roadComplete: parsed.roadComplete ?? false,
    roadWidthFt: parsed.roadWidthFt ?? DEFAULT_ROAD_WIDTH_FT,
    targetLotSizeSqFt: parsed.targetLotSizeSqFt ?? DEFAULT_TARGET_LOT_SIZE_SQFT,
    lotPairCountOverride: parsed.lotPairCountOverride ?? null,
    growthProgress: parsed.growthProgress ?? 1,
    savedAt: parsed.savedAt ?? new Date().toISOString(),
  };
}

function migrateV3Project(parsed: LegacySavedProject & {
  roadNetwork?: RoadNetwork;
  roadDrawing?: RoadDrawingState | null;
}): SubdivisionSavedProject {
  return {
    version: 5,
    step: normalizeStep(parsed.step),
    boundary: parsed.boundary ?? [],
    boundaryClosed: parsed.boundaryClosed ?? false,
    ftPerPixel: parsed.ftPerPixel ?? null,
    roadNetwork: parsed.roadNetwork ?? emptyRoadNetwork(),
    roadDrawing: parsed.roadDrawing ?? null,
    roadComplete: parsed.roadComplete ?? false,
    roadWidthFt: parsed.roadWidthFt ?? DEFAULT_ROAD_WIDTH_FT,
    targetLotSizeSqFt: parsed.targetLotSizeSqFt ?? DEFAULT_TARGET_LOT_SIZE_SQFT,
    lotPairCountOverride: parsed.lotPairCountOverride ?? null,
    growthProgress: parsed.growthProgress ?? 1,
    savedAt: parsed.savedAt ?? new Date().toISOString(),
  };
}

function migrateV4Project(parsed: LegacySavedProject & {
  roadNetwork?: RoadNetwork;
  roadDrawing?: RoadDrawingState | null;
}): SubdivisionSavedProject {
  return {
    version: 5,
    step: normalizeStep(parsed.step),
    boundary: parsed.boundary ?? [],
    boundaryClosed: parsed.boundaryClosed ?? false,
    ftPerPixel: parsed.ftPerPixel ?? null,
    roadNetwork: parsed.roadNetwork ?? emptyRoadNetwork(),
    roadDrawing: parsed.roadDrawing ?? null,
    roadComplete: parsed.roadComplete ?? false,
    roadWidthFt: parsed.roadWidthFt ?? DEFAULT_ROAD_WIDTH_FT,
    targetLotSizeSqFt: parsed.targetLotSizeSqFt ?? DEFAULT_TARGET_LOT_SIZE_SQFT,
    lotPairCountOverride: parsed.lotPairCountOverride ?? null,
    growthProgress: parsed.growthProgress ?? 1,
    savedAt: parsed.savedAt ?? new Date().toISOString(),
  };
}

export function loadSubdivisionProject(): SubdivisionSavedProject | null {
  try {
    const raw = localStorage.getItem(SUBDIVISION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LegacySavedProject & {
      roadNetwork?: RoadNetwork;
      roadDrawing?: RoadDrawingState | null;
    };
    if (!parsed.version || parsed.version < 1) return null;

    if (parsed.version < 3 || !parsed.roadNetwork) {
      return migrateLegacyProject(parsed);
    }

    if (parsed.version < 4) {
      return migrateV3Project(parsed);
    }

    if (parsed.version < 5) {
      return migrateV4Project(parsed);
    }

    return {
      version: 5,
      step: normalizeStep(parsed.step),
      boundary: parsed.boundary ?? [],
      boundaryClosed: parsed.boundaryClosed ?? false,
      ftPerPixel: parsed.ftPerPixel ?? null,
      roadNetwork: parsed.roadNetwork ?? emptyRoadNetwork(),
      roadDrawing: parsed.roadDrawing ?? null,
      roadComplete: parsed.roadComplete ?? false,
      roadWidthFt: parsed.roadWidthFt ?? DEFAULT_ROAD_WIDTH_FT,
      targetLotSizeSqFt: parsed.targetLotSizeSqFt ?? DEFAULT_TARGET_LOT_SIZE_SQFT,
      lotPairCountOverride: parsed.lotPairCountOverride ?? null,
      growthProgress: parsed.growthProgress ?? 1,
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearSubdivisionProject(): void {
  localStorage.removeItem(SUBDIVISION_STORAGE_KEY);
}

export function loadSubdivisionSnapshot(): (TopoDigitizationSnapshot<SubdivisionWorkflowStep> & {
  roadNetwork: RoadNetwork;
  roadDrawing: RoadDrawingState | null;
  roadComplete: boolean;
  roadWidthFt: number;
  targetLotSizeSqFt: number;
  lotPairCountOverride: number | null;
  growthProgress: number;
}) | null {
  const saved = loadSubdivisionProject();
  if (!saved) return null;
  return {
    step: saved.step,
    boundary: saved.boundary,
    boundaryClosed: saved.boundaryClosed,
    ftPerPixel: saved.ftPerPixel,
    roadNetwork: saved.roadNetwork,
    roadDrawing: saved.roadDrawing,
    roadComplete: saved.roadComplete,
    roadWidthFt: saved.roadWidthFt,
    targetLotSizeSqFt: saved.targetLotSizeSqFt,
    lotPairCountOverride: saved.lotPairCountOverride,
    growthProgress: saved.growthProgress,
  };
}

export type { LotCell, SpawnPoint };
