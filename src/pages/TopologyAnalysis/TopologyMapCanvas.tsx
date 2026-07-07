import { useEffect, useMemo, useRef, useState } from 'react';
import p5 from 'p5';
import type { BoundaryCorner, BoundaryPoint, ContourLine } from '../../utils/siteMapCalculations';
import { distancePointToSegment } from '../../utils/siteMapCalculations';
import {
  aspectColor,
  elevationColor,
  slopeColor,
  type GeneratedContour,
  type TerrainGridCell,
  type TopologyWorkflowStep,
  type DrainagePath,
} from '../../utils/topologyAnalysis';
import {
  buildElevPoints,
  calculateTinCutFill,
  drapePolylineOnTin,
  triangulateSurface,
  triangleCutFillDelta,
  type ElevPoint,
  type TinTriangle,
} from '../../utils/cutFillTin';
import {
  computeImageTransform,
  imagePointToScreen,
  type ImageTransform,
} from '../CutFillCalculator/cutFillImageLayout';
import {
  computeScene3dCamera,
  defaultOrbitDistance,
  feetToScene3d,
  type Scene3dCamera,
} from '../CutFillCalculator/cutFillScene3d';

const SNAP_DISTANCE = 14;
const VERTEX_HIT = 18;
const EDGE_HIT = 12;
const TERRAIN_FILL: [number, number, number] = [26, 72, 44];
const BOUNDARY_STROKE: [number, number, number] = [20, 48, 100];
const BOUNDARY_STROKE_SELECTED: [number, number, number] = [28, 65, 130];
const BOUNDARY_VERTEX: [number, number, number] = [16, 40, 85];
const CONTOUR_STROKE: [number, number, number] = [166, 124, 82];
const CONTOUR_LABEL: [number, number, number] = [92, 64, 38];
const CUT_COLOR: [number, number, number] = [220, 50, 45];
const FILL_COLOR: [number, number, number] = [37, 99, 235];

const VIEW_3D: TopologyWorkflowStep[] = ['overview', 'terrain3d', 'hillshade', 'cutfill'];
const VIEW_2D_ANALYSIS: TopologyWorkflowStep[] = [
  'elevation',
  'slope',
  'aspect',
  'buildable',
  'drainage',
  'generated-contours',
];

function is3dStep(step: TopologyWorkflowStep) {
  return VIEW_3D.includes(step);
}

function is2dAnalysisStep(step: TopologyWorkflowStep) {
  return VIEW_2D_ANALYSIS.includes(step);
}

type TopologyMapCanvasProps = {
  imageUrl: string | null;
  step: TopologyWorkflowStep;
  boundary: BoundaryPoint[];
  boundaryClosed: boolean;
  corners: BoundaryCorner[];
  contours: ContourLine[];
  ftPerPixel: number | null;
  scaleMode: boolean;
  selectedScaleEdge: number | null;
  draftContourPoints: BoundaryPoint[];
  targetElevationFt: number;
  zScaleMultiplier: number;
  terrainGrid: TerrainGridCell[];
  buildableSlopePct: number;
  contourIntervalFt: number;
  elevationMinFt: number;
  elevationMaxFt: number;
  generatedContours: GeneratedContour[];
  drainagePaths: DrainagePath[];
  onBoundaryChange: (boundary: BoundaryPoint[], closed: boolean) => void;
  onScaleEdgeSelect: (edgeIndex: number) => void;
  onDraftContourChange: (points: BoundaryPoint[]) => void;
  onCornerElevChange: (index: number, elevationFt: number) => void;
};

function getImageTransform(p: p5, imgW: number, imgH: number, pad = 16): ImageTransform {
  return computeImageTransform(p.width, p.height, imgW, imgH, pad);
}

function imageToScreen(p: BoundaryPoint, t: ImageTransform) {
  return imagePointToScreen(p, t);
}

function screenToImage(sx: number, sy: number, t: ImageTransform): BoundaryPoint | null {
  const x = (sx - t.offsetX) / t.scale;
  const y = (sy - t.offsetY) / t.scale;
  if (x < 0 || y < 0) return null;
  return { x, y };
}

const TopologyMapCanvas = ({
  imageUrl,
  step,
  boundary,
  boundaryClosed,
  corners,
  contours,
  ftPerPixel,
  scaleMode,
  selectedScaleEdge,
  draftContourPoints,
  targetElevationFt,
  zScaleMultiplier,
  terrainGrid,
  buildableSlopePct,
  contourIntervalFt,
  elevationMinFt,
  elevationMaxFt,
  generatedContours,
  drainagePaths,
  onBoundaryChange,
  onScaleEdgeSelect,
  onDraftContourChange,
  onCornerElevChange,
}: TopologyMapCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const propsRef = useRef({
    imageUrl,
    step,
    boundary,
    boundaryClosed,
    corners,
    contours,
    ftPerPixel,
    scaleMode,
    selectedScaleEdge,
    draftContourPoints,
    targetElevationFt,
    zScaleMultiplier,
    terrainGrid,
    buildableSlopePct,
    contourIntervalFt,
    elevationMinFt,
    elevationMaxFt,
    generatedContours,
    drainagePaths,
    onBoundaryChange,
    onScaleEdgeSelect,
    onDraftContourChange,
    onCornerElevChange,
  });
  propsRef.current = {
    imageUrl,
    step,
    boundary,
    boundaryClosed,
    corners,
    contours,
    ftPerPixel,
    scaleMode,
    selectedScaleEdge,
    draftContourPoints,
    targetElevationFt,
    zScaleMultiplier,
    terrainGrid,
    buildableSlopePct,
    contourIntervalFt,
    elevationMinFt,
    elevationMaxFt,
    generatedContours,
    drainagePaths,
    onBoundaryChange,
    onScaleEdgeSelect,
    onDraftContourChange,
    onCornerElevChange,
  };

  useEffect(() => {
    if (!imageUrl) {
      setImageSize(null);
      return;
    }
    const img = new Image();
    img.onload = () => setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [step]);

  const cornerScreenPositions = useMemo(() => {
    if (step !== 'corners' || !imageSize || canvasSize.w === 0 || boundary.length === 0) {
      return [];
    }
    const transform = computeImageTransform(canvasSize.w, canvasSize.h, imageSize.w, imageSize.h);
    return boundary.map((pt) => imagePointToScreen(pt, transform));
  }, [step, imageSize, canvasSize, boundary]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const is3d = is3dStep(step);
    let removeOrbitListeners: (() => void) | null = null;
    let removeWheelListener: (() => void) | null = null;

    const sketch = (p: p5) => {
      let bgImage: p5.Image | null = null;
      let imgW = 1;
      let imgH = 1;
      let orbitYaw = Math.PI / 4;
      let orbitPitch = -Math.PI / 4;
      let orbitDistance = 400;
      let orbitDistanceInitialized = false;
      let lastOrbitX = 0;
      let lastOrbitY = 0;
      let isOrbiting = false;
      let tinPoints: ElevPoint[] = [];
      let tinTriangles: TinTriangle[] = [];
      let draggingVertex: number | null = null;
      let dragStartBoundary: BoundaryPoint[] = [];
      let dragStartMouse: BoundaryPoint | null = null;

      const setHud = (msg: string) => {
        if (hudRef.current) hudRef.current.textContent = msg;
      };

      const rebuildTin = () => {
        const props = propsRef.current;
        if (!props.ftPerPixel || props.boundary.length < 3) {
          tinPoints = [];
          tinTriangles = [];
          return;
        }
        tinPoints = buildElevPoints(props.boundary, props.corners, props.contours, props.ftPerPixel);
        tinTriangles = triangulateSurface(tinPoints, props.boundary, props.ftPerPixel);
        if (tinPoints.length > 0 && !orbitDistanceInitialized) {
          orbitDistance = defaultOrbitDistance(tinPoints);
          orbitDistanceInitialized = true;
        }
      };

      const loadImage = (url: string) => {
        p.loadImage(url, (img) => {
          bgImage = img;
          imgW = img.width;
          imgH = img.height;
        });
      };

      p.setup = () => {
        p.createCanvas(parent.clientWidth, parent.clientHeight, is3d ? p.WEBGL : p.P2D);
        if (propsRef.current.imageUrl) loadImage(propsRef.current.imageUrl);

        const canvas = parent.querySelector('canvas');
        if (!canvas) return;

        const handleWheel = (event: WheelEvent) => {
          const props = propsRef.current;
          if (!is3dStep(props.step)) return;

          event.preventDefault();
          event.stopPropagation();
          orbitDistance *= 1 - event.deltaY * 0.001;
          orbitDistance = Math.max(80, Math.min(orbitDistance, 4000));
        };
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        removeWheelListener = () => canvas.removeEventListener('wheel', handleWheel);
      };

      p.windowResized = () => {
        p.resizeCanvas(parent.clientWidth, parent.clientHeight);
      };

      const pickBoundary = (mx: number, my: number, t: ImageTransform) => {
        const props = propsRef.current;
        for (let i = 0; i < props.boundary.length; i++) {
          const s = imageToScreen(props.boundary[i], t);
          if (p.dist(mx, my, s.x, s.y) <= VERTEX_HIT) return { kind: 'vertex' as const, index: i };
        }
        if (props.boundaryClosed && props.boundary.length >= 2) {
          for (let i = 0; i < props.boundary.length; i++) {
            const s0 = imageToScreen(props.boundary[i], t);
            const s1 = imageToScreen(props.boundary[(i + 1) % props.boundary.length], t);
            if (distancePointToSegment(mx, my, s0.x, s0.y, s1.x, s1.y) <= EDGE_HIT) {
              return { kind: 'edge' as const, index: i };
            }
          }
        }
        return null;
      };

      const stopOrbit = () => {
        isOrbiting = false;
      };

      p.mousePressed = () => {
        const props = propsRef.current;
        if (is3dStep(props.step)) {
          const onCanvas =
            p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
          if (onCanvas) {
            isOrbiting = true;
            lastOrbitX = p.mouseX;
            lastOrbitY = p.mouseY;
          }
          return;
        }
        if (!bgImage) return;
        const t = getImageTransform(p, imgW, imgH);
        const imgPt = screenToImage(p.mouseX, p.mouseY, t);
        if (!imgPt) return;

        if (props.step === 'boundary') {
          if (props.scaleMode && props.boundaryClosed) {
            const pick = pickBoundary(p.mouseX, p.mouseY, t);
            if (pick?.kind === 'edge') props.onScaleEdgeSelect(pick.index);
            return;
          }
          if (!props.boundaryClosed) {
            if (props.boundary.length >= 3) {
              const first = imageToScreen(props.boundary[0], t);
              if (p.dist(p.mouseX, p.mouseY, first.x, first.y) <= SNAP_DISTANCE) {
                props.onBoundaryChange(props.boundary, true);
                return;
              }
            }
            props.onBoundaryChange([...props.boundary, imgPt], false);
            return;
          }
          const pick = pickBoundary(p.mouseX, p.mouseY, t);
          if (pick?.kind === 'vertex') {
            draggingVertex = pick.index;
            dragStartBoundary = props.boundary.map((pt) => ({ ...pt }));
            dragStartMouse = imgPt;
          }
        }
        if (props.step === 'contours') {
          props.onDraftContourChange([...props.draftContourPoints, imgPt]);
        }
      };

      p.mouseDragged = () => {
        const props = propsRef.current;
        if (is3dStep(props.step)) {
          if (!isOrbiting || !p.mouseIsPressed) {
            isOrbiting = false;
            return;
          }
          const onCanvas =
            p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
          if (!onCanvas) {
            isOrbiting = false;
            return;
          }
          orbitYaw -= (p.mouseX - lastOrbitX) * 0.008;
          orbitPitch = Math.max(-1.35, Math.min(-0.15, orbitPitch - (p.mouseY - lastOrbitY) * 0.008));
          lastOrbitX = p.mouseX;
          lastOrbitY = p.mouseY;
          return;
        }
        if (
          props.step === 'boundary' &&
          draggingVertex !== null &&
          dragStartMouse &&
          props.boundaryClosed
        ) {
          const t = getImageTransform(p, imgW, imgH);
          const imgPt = screenToImage(p.mouseX, p.mouseY, t);
          if (!imgPt) return;
          const dx = imgPt.x - dragStartMouse.x;
          const dy = imgPt.y - dragStartMouse.y;
          const next = dragStartBoundary.map((pt, i) =>
            i === draggingVertex ? { x: pt.x + dx, y: pt.y + dy } : pt,
          );
          props.onBoundaryChange(next, true);
        }
      };

      p.mouseReleased = () => {
        draggingVertex = null;
        dragStartBoundary = [];
        dragStartMouse = null;
        isOrbiting = false;
      };

      window.addEventListener('mouseup', stopOrbit);
      window.addEventListener('blur', stopOrbit);
      removeOrbitListeners = () => {
        window.removeEventListener('mouseup', stopOrbit);
        window.removeEventListener('blur', stopOrbit);
      };

      const applyOrbitCamera = () => {
        const cosPitch = Math.cos(orbitPitch);
        p.camera(
          orbitDistance * cosPitch * Math.sin(orbitYaw),
          orbitDistance * Math.sin(orbitPitch),
          orbitDistance * cosPitch * Math.cos(orbitYaw),
          0,
          0,
          0,
          0,
          1,
          0,
        );
      };

      const drawPolyline3d = (
        points: ElevPoint[],
        camera: Scene3dCamera,
        closed: boolean,
      ) => {
        if (points.length < 2) return;
        p.beginShape();
        for (const pt of points) {
          const s = feetToScene3d(pt, camera);
          p.vertex(s.x, s.y, s.z);
        }
        if (closed) p.endShape(p.CLOSE);
        else p.endShape();
      };

      const drawTerrainOverlays = (
        props: typeof propsRef.current,
        camera: Scene3dCamera,
        surfacePoints: ElevPoint[],
        surfaceTriangles: TinTriangle[],
      ) => {
        if (!props.ftPerPixel) return;

        const boundaryFt = props.boundary.map((pt) => ({
          x: pt.x * props.ftPerPixel!,
          y: pt.y * props.ftPerPixel!,
        }));

        const drapedBoundary = drapePolylineOnTin(
          boundaryFt,
          surfacePoints,
          surfaceTriangles,
          true,
          24,
          props.corners.map((c) => c.elevationFt),
        );

        p.stroke(BOUNDARY_STROKE[0], BOUNDARY_STROKE[1], BOUNDARY_STROKE[2]);
        p.strokeWeight(2.5);
        p.noFill();
        drawPolyline3d(drapedBoundary, camera, false);

        for (const contour of props.contours) {
          if (contour.points.length < 2) continue;
          p.stroke(CONTOUR_STROKE[0], CONTOUR_STROKE[1], CONTOUR_STROKE[2]);
          p.strokeWeight(2);
          const contourPts: ElevPoint[] = contour.points.map((pt) => ({
            x: pt.x * props.ftPerPixel!,
            y: pt.y * props.ftPerPixel!,
            z: contour.elevationFt,
          }));
          drawPolyline3d(contourPts, camera, false);
        }
      };

      const drawImagePlan = () => {
        const props = propsRef.current;
        p.background(248, 250, 252);
        if (!bgImage) {
          setHud('Upload a property image to begin.');
          return;
        }
        const t = getImageTransform(p, imgW, imgH);
        p.image(bgImage, t.offsetX, t.offsetY, t.drawW, t.drawH);

        if (props.boundary.length > 0) {
          if (props.boundaryClosed && props.scaleMode) {
            for (let i = 0; i < props.boundary.length; i++) {
              const s0 = imageToScreen(props.boundary[i], t);
              const s1 = imageToScreen(props.boundary[(i + 1) % props.boundary.length], t);
              const selected = props.selectedScaleEdge === i;
              const stroke = selected ? BOUNDARY_STROKE_SELECTED : BOUNDARY_STROKE;
              p.stroke(stroke[0], stroke[1], stroke[2]);
              p.strokeWeight(selected ? 4 : 2);
              p.line(s0.x, s0.y, s1.x, s1.y);
            }
          } else {
            p.stroke(BOUNDARY_STROKE[0], BOUNDARY_STROKE[1], BOUNDARY_STROKE[2]);
            p.strokeWeight(2);
            p.noFill();
            p.beginShape();
            for (const pt of props.boundary) {
              const s = imageToScreen(pt, t);
              p.vertex(s.x, s.y);
            }
            if (props.boundaryClosed) p.endShape(p.CLOSE);
            else p.endShape();
          }

          props.boundary.forEach((pt, i) => {
            const s = imageToScreen(pt, t);
            p.noStroke();
            p.fill(
              i === 0 ? BOUNDARY_STROKE[0] : BOUNDARY_VERTEX[0],
              i === 0 ? BOUNDARY_STROKE[1] : BOUNDARY_VERTEX[1],
              i === 0 ? BOUNDARY_STROKE[2] : BOUNDARY_VERTEX[2],
            );
            p.circle(s.x, s.y, i === 0 && !props.boundaryClosed && props.boundary.length >= 3 ? 14 : 12);
          });
        }

        for (const contour of props.contours) {
          if (contour.points.length < 2) continue;
          p.stroke(CONTOUR_STROKE[0], CONTOUR_STROKE[1], CONTOUR_STROKE[2]);
          p.strokeWeight(2);
          p.noFill();
          p.beginShape();
          for (const pt of contour.points) {
            const s = imageToScreen(pt, t);
            p.vertex(s.x, s.y);
          }
          p.endShape();
          const mid = contour.points[Math.floor(contour.points.length / 2)];
          const ms = imageToScreen(mid, t);
          p.fill(CONTOUR_LABEL[0], CONTOUR_LABEL[1], CONTOUR_LABEL[2]);
          p.noStroke();
          p.textSize(12);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(`${contour.elevationFt.toFixed(1)}′`, ms.x, ms.y);
        }

        if (props.step === 'contours' && props.draftContourPoints.length > 0) {
          p.stroke(234, 179, 8);
          p.strokeWeight(2);
          p.noFill();
          p.beginShape();
          for (const pt of props.draftContourPoints) {
            const s = imageToScreen(pt, t);
            p.vertex(s.x, s.y);
          }
          p.endShape();
        }

        if (props.step === 'boundary') {
          if (props.scaleMode) setHud('Click a boundary edge, then enter its real-world length in feet.');
          else if (!props.boundaryClosed) setHud('Click to place corners. Click the first point (blue) to close.');
          else setHud('Drag corners to adjust the boundary.');
        } else if (props.step === 'corners') {
          setHud('Enter elevation at each corner on the map.');
        } else if (props.step === 'contours') {
          setHud('Click to trace contour lines. Finish each line in the sidebar.');
        }
      };

      const feetToImagePoint = (xFt: number, yFt: number, ftPerPx: number): BoundaryPoint => ({
        x: xFt / ftPerPx,
        y: yFt / ftPerPx,
      });

      const drawAnalysisPlan = () => {
        const props = propsRef.current;
        p.background(248, 250, 252);
        const t = bgImage
          ? getImageTransform(p, imgW, imgH)
          : computeImageTransform(p.width, p.height, 800, 600);
        if (bgImage) p.image(bgImage, t.offsetX, t.offsetY, t.drawW, t.drawH);
        if (!props.ftPerPixel || props.terrainGrid.length === 0) {
          setHud('Complete setup steps to generate terrain analysis.');
          return;
        }

        const elevRange = Math.max(props.elevationMaxFt - props.elevationMinFt, 1);
        const cellPx = props.terrainGrid.length > 1
          ? Math.abs(props.terrainGrid[1].xFt - props.terrainGrid[0].xFt) / props.ftPerPixel * t.scale
          : 6;

        for (const cell of props.terrainGrid) {
          const imgPt = feetToImagePoint(cell.xFt, cell.yFt, props.ftPerPixel);
          const s = imageToScreen(imgPt, t);
          let color: [number, number, number] = [140, 145, 155];

          if (props.step === 'elevation' && cell.elevationFt !== null) {
            const tVal = (cell.elevationFt - props.elevationMinFt) / elevRange;
            color = elevationColor(tVal);
          } else if (props.step === 'slope' && cell.slopePct !== null) {
            color = slopeColor(cell.slopePct);
          } else if (props.step === 'aspect' && cell.aspectDeg !== null) {
            color = aspectColor(cell.aspectDeg);
          } else if (props.step === 'buildable' && cell.slopePct !== null) {
            color = cell.slopePct <= props.buildableSlopePct ? [34, 139, 34] : [220, 50, 45];
          }

          p.noStroke();
          p.fill(color[0], color[1], color[2], props.step === 'buildable' ? 170 : 200);
          p.rect(s.x - cellPx / 2, s.y - cellPx / 2, cellPx, cellPx);
        }

        if (props.step === 'drainage') {
          p.stroke(37, 99, 235);
          p.strokeWeight(2);
          for (const path of props.drainagePaths) {
            p.noFill();
            p.beginShape();
            for (const pt of path.points) {
              const s = imageToScreen(feetToImagePoint(pt.xFt, pt.yFt, props.ftPerPixel), t);
              p.vertex(s.x, s.y);
            }
            p.endShape();
          }
        }

        if (props.step === 'generated-contours') {
          p.stroke(CONTOUR_STROKE[0], CONTOUR_STROKE[1], CONTOUR_STROKE[2]);
          p.strokeWeight(1.5);
          for (const contour of props.generatedContours) {
            for (const seg of contour.segments) {
              const a = imageToScreen(
                feetToImagePoint(seg.x1, seg.y1, props.ftPerPixel),
                t,
              );
              const b = imageToScreen(
                feetToImagePoint(seg.x2, seg.y2, props.ftPerPixel),
                t,
              );
              p.line(a.x, a.y, b.x, b.y);
            }
          }
        }

        if (props.boundary.length > 0 && props.boundaryClosed) {
          p.stroke(BOUNDARY_STROKE[0], BOUNDARY_STROKE[1], BOUNDARY_STROKE[2]);
          p.strokeWeight(2.5);
          p.noFill();
          p.beginShape();
          for (const pt of props.boundary) {
            const s = imageToScreen(pt, t);
            p.vertex(s.x, s.y);
          }
          p.endShape(p.CLOSE);
        }

        const labels: Record<string, string> = {
          elevation: 'Elevation heat map',
          slope: 'Slope heat map — green flat, yellow moderate, red steep',
          aspect: 'Aspect map — color shows slope direction',
          buildable: `Buildable area — green under ${props.buildableSlopePct}% slope`,
          drainage: 'Drainage flow paths from high points',
          'generated-contours': `Generated contours every ${props.contourIntervalFt} ft`,
        };
        setHud(labels[props.step] ?? 'Terrain analysis');
      };

      const triangleHillshade = (a: ElevPoint, b: ElevPoint, c: ElevPoint) => {
        const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
        const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
        const nx = ab.y * ac.z - ab.z * ac.y;
        const ny = ab.z * ac.x - ab.x * ac.z;
        const nz = ab.x * ac.y - ab.y * ac.x;
        const len = Math.hypot(nx, ny, nz) || 1;
        const lx = 0.35;
        const ly = 0.85;
        const lz = -0.55;
        const dot = (nx * lx + ny * ly + nz * lz) / len;
        const shade = Math.max(0.25, Math.min(1, 0.55 + dot * 0.45));
        return [
          Math.round(TERRAIN_FILL[0] * shade),
          Math.round(TERRAIN_FILL[1] * shade),
          Math.round(TERRAIN_FILL[2] * shade),
        ] as [number, number, number];
      };

      const drawTerrain3d = () => {
        const props = propsRef.current;
        p.background(248, 250, 252);
        p.ambientLight(200);
        p.directionalLight(255, 255, 255, 0.35, 0.85, -0.55);
        rebuildTin();
        if (tinTriangles.length === 0) {
          setHud('Complete boundary, corners, and contours to generate terrain.');
          return;
        }

        const camera = computeScene3dCamera(tinPoints, props.zScaleMultiplier);
        if (!camera) return;

        applyOrbitCamera();

        for (const tri of tinTriangles) {
          const verts = [tinPoints[tri.a], tinPoints[tri.b], tinPoints[tri.c]].map((pt) =>
            feetToScene3d(pt, camera),
          );
          if (props.step === 'cutfill') {
            const delta = triangleCutFillDelta(tinPoints, tri, props.targetElevationFt);
            if (delta > 0.05) p.fill(CUT_COLOR[0], CUT_COLOR[1], CUT_COLOR[2]);
            else if (delta < -0.05) p.fill(FILL_COLOR[0], FILL_COLOR[1], FILL_COLOR[2]);
            else p.fill(140, 145, 155);
          } else if (props.step === 'hillshade') {
            const p1 = tinPoints[tri.a];
            const p2 = tinPoints[tri.b];
            const p3 = tinPoints[tri.c];
            const hs = triangleHillshade(p1, p2, p3);
            p.fill(hs[0], hs[1], hs[2], 235);
          } else {
            p.fill(TERRAIN_FILL[0], TERRAIN_FILL[1], TERRAIN_FILL[2], 235);
          }
          p.noStroke();
          p.beginShape(p.TRIANGLES);
          for (const v of verts) p.vertex(v.x, v.y, v.z);
          p.endShape();
        }

        drawTerrainOverlays(props, camera, tinPoints, tinTriangles);

        if (props.step === 'cutfill' && props.ftPerPixel) {
          const totals = calculateTinCutFill(
            tinPoints,
            tinTriangles,
            props.targetElevationFt,
            props.boundary,
            props.ftPerPixel,
          );
          setHud(`Drag to orbit · scroll to zoom · Cut ${totals.cutCuYd.toFixed(1)} cu yd · Fill ${totals.fillCuYd.toFixed(1)} cu yd`);
        } else if (is3dStep(props.step)) {
          setHud('Drag to orbit · scroll to zoom');
        }
      };

      p.draw = () => {
        const props = propsRef.current;
        if (props.imageUrl && !bgImage) loadImage(props.imageUrl);
        if (is3dStep(props.step)) drawTerrain3d();
        else if (is2dAnalysisStep(props.step)) drawAnalysisPlan();
        else drawImagePlan();
      };
    };

    const instance = new p5(sketch, parent);
    return () => {
      removeOrbitListeners?.();
      removeWheelListener?.();
      instance.remove();
    };
  }, [step]);

  return (
    <div className="topology-map-canvas-wrap">
      <div className="topology-map-canvas" ref={containerRef} />
      {step === 'corners' && cornerScreenPositions.length > 0 && (
        <div className="topology-corner-overlays">
          {corners.map((corner, i) => {
            const pos = cornerScreenPositions[i];
            if (!pos) return null;
            return (
              <div
                key={i}
                className="topology-corner-input"
                style={{ left: pos.x, top: pos.y }}
              >
                <label htmlFor={`topo-map-corner-${i}`}>Corner {i + 1}</label>
                <div className="topology-corner-input-row">
                  <input
                    id={`topo-map-corner-${i}`}
                    type="number"
                    step={0.1}
                    value={corner.elevationFt}
                    onChange={(e) => onCornerElevChange(i, Number(e.target.value) || 0)}
                  />
                  <span className="topology-corner-unit">ft</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="topology-canvas-hud" ref={hudRef} />
    </div>
  );
};

export default TopologyMapCanvas;
