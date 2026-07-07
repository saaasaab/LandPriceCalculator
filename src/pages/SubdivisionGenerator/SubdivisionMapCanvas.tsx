import { useEffect, useMemo, useRef } from 'react';
import p5 from 'p5';
import type { BoundaryPoint } from '../../utils/siteMapCalculations';
import {
  addDrawingPoint,
  buildDrawingPreviewPath,
  buildRoadPathOptionsForDrawing,
  findNode,
  findRoadDragTarget,
  getNodeRoles,
  moveRoadDragTarget,
  promoteJunctionAtPoint,
  snapRoadPoint,
  tryInsertPointOnSegment,
  type RoadDragTarget,
  type RoadDrawingState,
  type RoadEndpointRole,
  type RoadNetwork,
} from '../../utils/roadNetwork';
import {
  getPlanTransform,
  imagePointToScreen,
  type ImageTransform,
} from '../CutFillCalculator/cutFillImageLayout';
import { buildNetworkCenterlinePaths, type RoadPolygonPiece } from '../../utils/subdivisionRoadPolygon';
import type { RoadPathSegment } from '../../utils/roadGeometry';
import type { LotCell, SpawnPoint } from '../../utils/subdivisionLotLayout';
import '../CutFillCalculator/CutFillMapCanvas.scss';

const BOUNDARY_STROKE: [number, number, number] = [20, 48, 100];
const ROAD_STROKE: [number, number, number] = [71, 85, 105];
const ROAD_CONTROL: [number, number, number] = [180, 83, 9];
const ROAD_PREVIEW: [number, number, number] = [148, 163, 184];
const ROAD_POLYGON_FILL: [number, number, number] = [51, 65, 85];
const ROAD_OPACITY = 128;
const SPAWN_LEFT_FILL: [number, number, number] = [20, 184, 166];
const SPAWN_RIGHT_FILL: [number, number, number] = [56, 189, 248];
const LOT_LEFT_FILL: [number, number, number] = [94, 234, 212];
const LOT_RIGHT_FILL: [number, number, number] = [125, 211, 252];
const LOT_LEFT_STROKE: [number, number, number] = [13, 148, 136];
const LOT_RIGHT_STROKE: [number, number, number] = [2, 132, 199];
const NODE_ENTRANCE: [number, number, number] = [22, 163, 74];
const NODE_DEAD_END: [number, number, number] = [220, 38, 38];
const NODE_JUNCTION: [number, number, number] = [37, 99, 235];
const NODE_DRAGGING: [number, number, number] = [124, 58, 237];

export type SubdivisionMapMode = 'place' | 'reposition';

type SubdivisionMapCanvasProps = {
  imageUrl: string | null;
  boundary: BoundaryPoint[];
  boundaryClosed: boolean;
  ftPerPixel: number | null;
  mode: SubdivisionMapMode;
  roadNetwork: RoadNetwork;
  roadDrawing: RoadDrawingState | null;
  roadPolygonOuters: BoundaryPoint[][];
  roadPolygonHoles: BoundaryPoint[][];
  roadPolygonPieces: RoadPolygonPiece[];
  spawnPoints: SpawnPoint[];
  lotCells: LotCell[];

  onRoadNetworkChange: (network: RoadNetwork) => void;
  onRoadDrawingChange: (drawing: RoadDrawingState | null) => void;
};

const SubdivisionMapCanvas = ({
  imageUrl,
  boundary,
  boundaryClosed,
  ftPerPixel,
  mode,
  roadNetwork,
  roadDrawing,
  roadPolygonOuters,
  roadPolygonHoles,
  roadPolygonPieces,
  spawnPoints,
  lotCells,
  onRoadNetworkChange,
  onRoadDrawingChange,
}: SubdivisionMapCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  const nodeRoles = useMemo(
    () => getNodeRoles(roadNetwork, boundary, ftPerPixel),
    [roadNetwork, boundary, ftPerPixel],
  );

  const propsRef = useRef({
    imageUrl,
    boundary,
    boundaryClosed,
    ftPerPixel,
    mode,
    roadNetwork,
    roadDrawing,
    roadPolygonOuters,
    roadPolygonHoles,
    roadPolygonPieces,
    spawnPoints,
    lotCells,
    nodeRoles,
    onRoadNetworkChange,
    onRoadDrawingChange,
  });
  propsRef.current = {
    imageUrl,
    boundary,
    boundaryClosed,
    ftPerPixel,
    mode,
    roadNetwork,
    roadDrawing,
    roadPolygonOuters,
    roadPolygonHoles,
    roadPolygonPieces,
    spawnPoints,
    lotCells,
    nodeRoles,
    onRoadNetworkChange,
    onRoadDrawingChange,
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const instance = p5InstanceRef.current;
      if (instance && w > 0 && h > 0) instance.resizeCanvas(w, h);
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const sketch = (p: p5) => {
      let bgImage: p5.Image | null = null;
      let imgW = 1;
      let imgH = 1;
      let dragTarget: RoadDragTarget | null = null;
      let hudMessage = '';

      const setHud = (msg: string) => {
        if (msg === hudMessage) return;
        hudMessage = msg;
        if (hudRef.current) hudRef.current.textContent = msg;
      };

      const loadImage = (url: string) => {
        p.loadImage(url, (img) => {
          bgImage = img;
          imgW = img.width;
          imgH = img.height;
        });
      };

      const drawBoundary = (t: ImageTransform) => {
        const props = propsRef.current;
        if (props.boundary.length === 0) return;
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
      };

      const drawPolyline = (points: BoundaryPoint[], t: ImageTransform) => {
        if (points.length < 2) return;
        p.beginShape();
        for (const pt of points) {
          const s = imageToScreen(pt, t);
          p.vertex(s.x, s.y);
        }
        p.endShape();
      };

      const drawFilledPolygonPiece = (
        piece: RoadPolygonPiece,
        t: ImageTransform,
        fill: [number, number, number],
        opacity: number,
      ) => {
        if (piece.outer.length < 3) return;
        p.fill(fill[0], fill[1], fill[2], opacity);
        p.noStroke();
        p.beginShape();
        for (const pt of piece.outer) {
          const s = imageToScreen(pt, t);
          p.vertex(s.x, s.y);
        }
        for (const hole of piece.holes) {
          if (hole.length < 3) continue;
          p.beginContour();
          for (let i = hole.length - 1; i >= 0; i--) {
            const s = imageToScreen(hole[i], t);
            p.vertex(s.x, s.y);
          }
          p.endContour();
        }
        p.endShape(p.CLOSE);
      };

      const drawRoadPavement = (t: ImageTransform) => {
        const props = propsRef.current;
        for (const piece of props.roadPolygonPieces) {
          drawFilledPolygonPiece(piece, t, ROAD_POLYGON_FILL, ROAD_OPACITY);
        }
      };

      const nodeColor = (
        role: RoadEndpointRole | undefined,
        isDragging: boolean,
      ): [number, number, number] => {
        if (isDragging) return NODE_DRAGGING;
        if (role === 'entrance') return NODE_ENTRANCE;
        if (role === 'junction') return NODE_JUNCTION;
        if (role === 'dead-end') return NODE_DEAD_END;
        return ROAD_CONTROL;
      };

  

   
      const drawPathSegments = (pathSegments: RoadPathSegment[], t: ImageTransform) => {
        let started = false;
        for (const seg of pathSegments) {
          if (seg.type === 'line') {
            if (!started) {
              p.beginShape();
              const s0 = imageToScreen(seg.from, t);
              p.vertex(s0.x, s0.y);
              started = true;
            }
            const s1 = imageToScreen(seg.to, t);
            p.vertex(s1.x, s1.y);
          } else if (seg.type === 'cubic') {
            if (!started) {
              p.beginShape();
              const s0 = imageToScreen(seg.p0, t);
              p.vertex(s0.x, s0.y);
              started = true;
            }
            const c1 = imageToScreen(seg.p1, t);
            const c2 = imageToScreen(seg.p2, t);
            const s3 = imageToScreen(seg.p3, t);
            p.bezierVertex(c1.x, c1.y, c2.x, c2.y, s3.x, s3.y);
          }
        }
        if (started) p.endShape();
      };

      const drawCenterline = (t: ImageTransform) => {
        const props = propsRef.current;
        if (!props.ftPerPixel) return;

        const isEditing = props.mode === 'place' || props.mode === 'reposition';
        const paths = buildNetworkCenterlinePaths(
          props.roadNetwork,
          props.ftPerPixel,
          props.boundary,
          props.nodeRoles,
        );
        p.stroke(ROAD_STROKE[0], ROAD_STROKE[1], ROAD_STROKE[2]);
        p.strokeWeight(isEditing ? 3 : 2);
        p.noFill();
        for (const { path } of paths) {
          drawPathSegments(path.segments, t);
        }
      };

      const drawRoad = (t: ImageTransform) => {
        const props = propsRef.current;
        if (!props.ftPerPixel) return;

        const isEditing = props.mode === 'place' || props.mode === 'reposition';

        if (isEditing && props.mode === 'place' && props.roadDrawing && props.ftPerPixel) {
          const previewOptions = buildRoadPathOptionsForDrawing(
            props.roadDrawing,
            props.roadNetwork,
            props.boundary,
            props.ftPerPixel,
            props.nodeRoles,
          );
          const preview = buildDrawingPreviewPath(
            props.roadDrawing,
            props.ftPerPixel,
            previewOptions,
          );
          p.stroke(ROAD_PREVIEW[0], ROAD_PREVIEW[1], ROAD_PREVIEW[2]);
          p.strokeWeight(1.5);
          p.noFill();
          p.drawingContext.setLineDash([6, 6]);
          if (preview && preview.segments.length > 0) {
            drawPathSegments(preview.segments, t);
          } else if (props.roadDrawing.points.length >= 2) {
            drawPolyline(props.roadDrawing.points, t);
          }
          p.drawingContext.setLineDash([]);
        }

        drawCenterline(t);

        if (isEditing && props.mode === 'place' && props.roadDrawing) {
          props.roadDrawing.points.forEach((pt, i) => {
            const s = imageToScreen(pt, t);
            p.noStroke();
            p.fill(ROAD_CONTROL[0], ROAD_CONTROL[1], ROAD_CONTROL[2]);
            p.circle(s.x, s.y, i === 0 ? 12 : 10);
          });
        }

        if (!isEditing) return;

        for (const node of props.roadNetwork.nodes) {
          const s = imageToScreen(node, t);
          const role = props.nodeRoles.get(node.id);
          const isDragging = dragTarget?.type === 'node' && dragTarget.nodeId === node.id;
          const color = nodeColor(role, isDragging);
          p.noStroke();
          p.fill(color[0], color[1], color[2]);
          p.circle(s.x, s.y, isDragging ? 16 : 14);
          p.noFill();
          p.stroke(255);
          p.strokeWeight(2);
          p.circle(s.x, s.y, isDragging ? 16 : 14);
        }
      };

      const drawLotCells = (t: ImageTransform) => {
        const props = propsRef.current;
        for (const lot of props.lotCells) {
          if (lot.polygon.length < 3) continue;
          const fill = lot.side === 'left' ? LOT_LEFT_FILL : LOT_RIGHT_FILL;
          const stroke = lot.side === 'left' ? LOT_LEFT_STROKE : LOT_RIGHT_STROKE;
          p.fill(fill[0], fill[1], fill[2], 150);
          p.stroke(stroke[0], stroke[1], stroke[2]);
          p.strokeWeight(2);
          p.beginShape();
          for (const pt of lot.polygon) {
            const s = imageToScreen(pt, t);
            p.vertex(s.x, s.y);
          }
          p.endShape(p.CLOSE);
        }
      };

      const drawSpawnPoints = (t: ImageTransform) => {
        const props = propsRef.current;
        for (const spawn of props.spawnPoints) {
          const s = imageToScreen({ x: spawn.x, y: spawn.y }, t);
          const fill = spawn.side === 'left' ? SPAWN_LEFT_FILL : SPAWN_RIGHT_FILL;
          p.noStroke();
          p.fill(fill[0], fill[1], fill[2]);
          p.circle(s.x, s.y, 10);
          p.noFill();
          p.stroke(255);
          p.strokeWeight(1.5);
          p.circle(s.x, s.y, 10);
        }
      };

      p.setup = () => {
        p.createCanvas(parent.clientWidth, parent.clientHeight);
        if (propsRef.current.imageUrl) loadImage(propsRef.current.imageUrl);
      };

      p.windowResized = () => {
        p.resizeCanvas(parent.clientWidth, parent.clientHeight);
      };

      p.mousePressed = () => {
        const props = propsRef.current;
        if (!props.ftPerPixel) return;
        if (props.mode !== 'place' && props.mode !== 'reposition') return;
        const hasImage = Boolean(bgImage);
        const t = getImageTransform(p, imgW, imgH, hasImage);
        const rawPt = screenToImage(p.mouseX, p.mouseY, t);
        if (!rawPt) return;

        if (props.mode === 'reposition') {
          dragTarget = findRoadDragTarget(props.roadNetwork, rawPt, props.ftPerPixel);
          return;
        }

        const { point, snappedNodeId, snappedToNetworkPoint } = snapRoadPoint(
          props.boundary,
          rawPt,
          props.ftPerPixel,
          props.roadNetwork,
        );

        if (!snappedToNetworkPoint && !props.roadDrawing) {
          const insertResult = tryInsertPointOnSegment(
            props.roadNetwork,
            point,
            props.ftPerPixel,
            props.boundary,
          );
          if (insertResult) {
            const junction = findNode(insertResult.network, insertResult.nodeId);
            const startPoint = junction
              ? { x: junction.x, y: junction.y }
              : insertResult.insertedPoint;
            props.onRoadNetworkChange(insertResult.network);
            props.onRoadDrawingChange({
              points: [startPoint],
              fromNodeId: insertResult.nodeId,
            });
            return;
          }
        }

        let network = props.roadNetwork;
        let activeNodeId = snappedNodeId;
        let startPoint = point;

        if (snappedToNetworkPoint && !activeNodeId) {
          const promoted = promoteJunctionAtPoint(network, point, props.ftPerPixel);
          network = promoted.network;
          activeNodeId = promoted.nodeId;
          const junction = findNode(network, activeNodeId);
          if (junction) {
            startPoint = { x: junction.x, y: junction.y };
          }
        }

        const result = addDrawingPoint(
          network,
          props.roadDrawing,
          startPoint,
          activeNodeId,
          props.ftPerPixel,
        );
        props.onRoadNetworkChange(result.network);
        props.onRoadDrawingChange(result.drawing);
      };

      p.mouseDragged = () => {
        const props = propsRef.current;
        if (!props.ftPerPixel || props.mode !== 'reposition') return;
        if (!dragTarget) return;

        const hasImage = Boolean(bgImage);
        const t = getImageTransform(p, imgW, imgH, hasImage);
        const rawPt = screenToImage(p.mouseX, p.mouseY, t);
        if (!rawPt) return;

        const next = moveRoadDragTarget(
          props.roadNetwork,
          dragTarget,
          rawPt,
          props.boundary,
          props.ftPerPixel,
        );
        props.onRoadNetworkChange(next);
      };

      p.mouseReleased = () => {
        dragTarget = null;
      };

      p.draw = () => {
        const props = propsRef.current;
        const hasImage = Boolean(bgImage);
        p.background(248, 250, 252);
        if (props.imageUrl && !bgImage) loadImage(props.imageUrl);
        if (!hasImage && !props.ftPerPixel) {
          setHud('Set scale on step 3 to begin placing roads, or upload an image from step 1.');
          return;
        }
        const t = getImageTransform(p, imgW, imgH, hasImage);
        if (hasImage && bgImage) {
          p.image(bgImage, t.offsetX, t.offsetY, t.drawW, t.drawH);
        }
        drawBoundary(t);
        drawRoadPavement(t);
        drawLotCells(t);
        drawRoad(t);
        drawSpawnPoints(t);

        if (props.mode === 'reposition') {
          if (props.roadNetwork.segments.length === 0) {
            setHud('Place road points first, then return here to reposition them.');
          } else if (dragTarget) {
            setHud('Drag to adjust the road. Lots and pavement update live.');
          } else {
            setHud('Drag road nodes to reposition the centerline. Lots update automatically.');
          }
        } else if (!props.roadDrawing && props.roadNetwork.segments.length === 0) {
          setHud(
            'Click on the map to place road points. Points on the property boundary connect to an existing road.',
          );
        } else if (!props.roadDrawing) {
          setHud(
            'Click a road line to add a point, a node to branch, or the map to start a new segment.',
          );
        } else if (props.roadDrawing.points.length === 1) {
          setHud('Click to place the next point of this branch.');
        } else {
          setHud('Add points, or click a road node to finish this segment or close a loop.');
        }
      };
    };

    const instance = new p5(sketch, parent);
    p5InstanceRef.current = instance;
    return () => {
      p5InstanceRef.current = null;
      instance.remove();
    };
  }, []);

  return (
    <div className="cut-fill-map-canvas-wrap">
      <div className="cut-fill-map-canvas" ref={containerRef} />
      <div className="cut-fill-canvas-hud" ref={hudRef} />
    </div>
  );
};

function getImageTransform(p: p5, imgW: number, imgH: number, hasImage: boolean, pad = 16) {
  return getPlanTransform(p.width, p.height, imgW, imgH, hasImage, pad);
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

export default SubdivisionMapCanvas;
