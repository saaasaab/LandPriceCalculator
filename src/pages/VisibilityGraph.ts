
import p5 from "p5";

import crosses from "robust-segment-intersect"
import classifyPoint from "robust-point-in-polygon"
import { TNode } from "../utils/BreadthFirstSearchBiDirectional";
import { findShortestPathsAstar } from "../utils/AStarBiDirectional";
import { TTwoPoints } from "../utils/SiteplanGeneratorUtils";


interface IPoint {x: number; y: number;}
export type TPoint = { x: number; y: number };
type Point = [number, number];

export class CNode {
  x: number;
  y: number;
  parent: number | null;
  children: number[];
  index: number;
  nodeType: string;


  constructor(x: number, y: number, index: number, nodeType = "midNode") {
    this.x = x;
    this.y = y;
    this.parent = null;
    this.children = [];
    this.index = index;
    this.nodeType = nodeType;
  }

  // Adds a child node to this node
  addChild(node: number) {
    this.children.push(node);
  }
}

export class VisibilityGraph {
  nodes: CNode[];
  edges: [CNode, CNode][];
  obstaclesOffset: CNode[][];
  obstacles: TPoint[][];
  boundary: TPoint[];
  nodeCount: number;
  shortestPaths: {
    start: CNode;
    end: CNode;
    path: CNode[];
  }[];
  startIndices: number[];
  startProjectionIndices: number[];
  endIndices: number[];
  sideWalkPolygons: [number, number][][];//polygonClipping.MultiPolygon
  scale: number;

  

  constructor(startPoints: TTwoPoints[], endPoints: TPoint[], obstacles: TPoint[][], boundary: TPoint[],scale:number) {
    // Initialize nodes
    this.nodes = [];
    this.obstaclesOffset = [];
    this.obstacles = obstacles;
    this.boundary = boundary;
    this.nodeCount = 0;
    this.shortestPaths = []
    this.startIndices = [];
    this.startProjectionIndices = []
    this.endIndices = [];
    this.sideWalkPolygons = [];
    this.scale = scale;

    const _boundary: Point[] = boundary.map(point => [point.x, point.y]);
    const startIndices: number[] = [];

    const startProjectionIndices: number[] = [];
    const endIndices: number[] = [];

    for (const point of startPoints) {
      const isOutsideBoundary = classifyPoint(_boundary, [point.x, point.y]) === 1 || boundary.length === 0
      const isProjectionOutsideBoundary = classifyPoint(_boundary, [point.x2, point.y2]) === 1 || boundary.length === 0

      if (!isOutsideBoundary && !isProjectionOutsideBoundary ) {
        this.nodes.push(new CNode(point.x, point.y, this.nodeCount, "startNode"));
        startIndices.push(this.nodeCount)
        this.nodeCount++;


        this.nodes.push(new CNode(point.x2, point.y2, this.nodeCount, "startProjectionNode"));
        // create on that is pointed out. 
        startProjectionIndices.push(this.nodeCount)
        this.nodeCount++;
      }
    }

    for (const point of endPoints) {
      const isOutsideBoundary = classifyPoint(_boundary, [point.x, point.y]) === 1 || boundary.length === 0
      if (!isOutsideBoundary) {
        this.nodes.push(new CNode(point.x, point.y, this.nodeCount, "endNode"));
        endIndices.push(this.nodeCount)
        this.nodeCount++;
      }
    }


    for (const obstacle of this.obstacles) {
      const _obstacle: CNode[] = []
      for (const vertex of obstacle) {

        const newNode = new CNode(vertex.x, vertex.y, Infinity)
        // this.nodes.push(newNode);
        _obstacle.push(newNode);
      }

      const offset = this.expandPolygon(_obstacle, 7/this.scale);
      this.obstaclesOffset.push(offset);
    }



    // Convert obstacle vertices to nodes
    this.obstaclesOffset.forEach(obstacle => {
      obstacle.forEach(vertex => {
        this.nodes.push(vertex)
      })
    })

    // Initialize edges array
    this.edges = [];

    this.startIndices = startIndices;
    this.startProjectionIndices = startProjectionIndices;
    this.endIndices = endIndices;

    this.calculateEdges();
  }


  calculateSideWalkPolygons(scale: number) {
    const line2Polygon = (points: [number, number][], thickness: number | number[]): [number, number][] => {
      const getOffsets = (a: IPoint, b: IPoint, thickness: number): IPoint => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const scale = thickness / (2 * len);
        return {
          x: -scale * dy,
          y: scale * dx,
        };
      };

      const getIntersection = (
        a1: IPoint,
        b1: IPoint,
        a2: IPoint,
        b2: IPoint,
      ): IPoint | undefined => {
        // directional constants
        const k1 = (b1.y - a1.y) / (b1.x - a1.x);
        const k2 = (b2.y - a2.y) / (b2.x - a2.x);

        // if the directional constants are equal, the lines are parallel
        if (Math.abs(k1 - k2) < 0.00001) {
          return;
        }

        // y offset constants for both lines
        const m1 = a1.y - k1 * a1.x;
        const m2 = a2.y - k2 * a2.x;

        // compute x
        const x = (m1 - m2) / (k2 - k1);

        // use y = k * x + m to get y coordinate
        const y = k1 * x + m1;

        return { x, y };
      };

      const isArray = (obj: any): obj is Array<any> => Array.isArray(obj);

      // Convert points into json notation
      const pointsJson: IPoint[] = points.map((pt) =>
        isArray(pt) ? { x: pt[0], y: pt[1] } : pt,
      );

      // Convert thickness into an array as needed
      const thicknesses: number[] = isArray(thickness)
        ? thickness
        : Array(pointsJson.length).fill(thickness);

      const poly: IPoint[] = [];
      let prevA: [IPoint, IPoint] | undefined;
      let prevB: [IPoint, IPoint] | undefined;

      for (let i = 0, il = pointsJson.length - 1; i < il; i++) {
        const isFirst = i === 0;
        const isLast = i === pointsJson.length - 2;

        const off = getOffsets(pointsJson[i], pointsJson[i + 1], thicknesses[i]);
        const off2 = getOffsets(
          pointsJson[i],
          pointsJson[i + 1],
          thicknesses[i + 1],
        );

        const p0a = {
          x: pointsJson[i].x + off.x,
          y: pointsJson[i].y + off.y,
        };
        const p1a = {
          x: pointsJson[i + 1].x + off2.x,
          y: pointsJson[i + 1].y + off2.y,
        };

        const p0b = {
          x: pointsJson[i].x - off.x,
          y: pointsJson[i].y - off.y,
        };
        const p1b = {
          x: pointsJson[i + 1].x - off2.x,
          y: pointsJson[i + 1].y - off2.y,
        };

        if (!isFirst) {
          const interA = getIntersection(prevA![0], prevA![1], p0a, p1a);
          if (interA) {
            poly.unshift(interA);
          }
          const interB = getIntersection(prevB![0], prevB![1], p0b, p1b);
          if (interB) {
            poly.push(interB);
          }
        }

        if (isFirst) {
          poly.unshift(p0a);
          poly.push(p0b);
        }

        if (isLast) {
          poly.unshift(p1a);
          poly.push(p1b);
        }

        if (!isLast) {
          prevA = [p0a, p1a];
          prevB = [p0b, p1b];
        }
      }

      // Convert back to array notation
      const polyArray: [number, number][] = poly.map((pt) => [pt.x, pt.y]);
      polyArray.push(polyArray[0]); // Close the polygon

      return polyArray;
    };
    const _polys: [number, number][][] = []
    this.shortestPaths.forEach(path => {

      const points = path.path.map(point => [point.x, point.y] as [number, number]) as [number, number][];


      let line = line2Polygon(points, 3 / scale);
      _polys.push(line)
    })
    this.sideWalkPolygons  = _polys// [polygonClipping.union(_polys)]


  }
  calculateEdgeNormal(p1: CNode, p2: CNode) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Swap dx and dy and negate one to create a perpendicular vector
    const length = Math.sqrt(dx ** 2 + dy ** 2);
    return { x: dy / length, y: -dx / length }
  }



  expandPolygon(polygon: CNode[], offset: number): CNode[] {
    const expandedPolygon: CNode[] = [];
    const totalVertices = polygon.length;
    const _boundary: Point[] = this.boundary.map(point => [point.x, point.y]);

    for (let i = 0; i < totalVertices; i++) {
      // Get current, previous, and next points
      const current = polygon[i];
      const prev = polygon[(i - 1 + totalVertices) % totalVertices];
      const next = polygon[(i + 1) % totalVertices];

      // Calculate outward normals for the edges
      const normalPrev = this.calculateEdgeNormal(prev, current);
      const normalNext = this.calculateEdgeNormal(current, next);

      // Calculate the offset direction by averaging the normals
      const offsetNormal = {
        x: normalPrev.x + normalNext.x,
        y: normalPrev.y + normalNext.y,
      }

      // Normalize the offset direction vector
      const length = Math.sqrt(offsetNormal.x ** 2 + offsetNormal.y ** 2);
      offsetNormal.x /= length;
      offsetNormal.y /= length;

      // Calculate the expanded vertex


      const newX = current.x + offsetNormal.x * offset
      const newY = current.y + offsetNormal.y * offset
      const isOutsideBoundary = classifyPoint(_boundary, [newX, newY]) === 1 || this.boundary.length === 0


      if (!isOutsideBoundary) {
        const newNode = new CNode(newX, newY, this.nodeCount)

        this.nodeCount++;
        expandedPolygon.push(newNode);
      }
    }

    return expandedPolygon;
  }


  dfs(nodes: TNode[], index: number, component: Set<number>, visited = new Set<number>()) {
    if (visited.has(index)) return;
    visited.add(index);
    component.add(index);

    const node = nodes[index];
    if (!node) return;

    node.children.forEach((childIndex) => {
      this.dfs(nodes, childIndex, component, visited);
    });
  };





  removeDeadEndMidNodes() {
// nodes: CNode[],
  }



  // Check if a line segment is blocked by any obstacle
  isLineSegmentBlocked(p1: CNode, p2: CNode): boolean {
    let isBlocked = false;
    for (const polygon of this.obstacles) {
      const numVertices = polygon.length;
      for (let i = 0; i < numVertices; i++) {
        const p3 = polygon[i];
        const p4 = polygon[(i + 1) % numVertices];

        //Check if line segment a0, a1  crosses segment b0, b1

        if (crosses([p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], [p4.x, p4.y])) {
          isBlocked = true
        }
      }
      if (isBlocked) break
    }
    return isBlocked;
  }

  // Calculate visibility edges
  calculateEdges(): void {
    this.edges = [];
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {


        // Pick two points to create an edge. 
        const node1 = this.nodes[i];
        const node2 = this.nodes[j];

        // Loop through all the possible edges to make sure it doesn't cross it. 
        const isConnects = !this.isLineSegmentBlocked(node1, node2)
        if (isConnects) {
          // Add edge to edges array
          if (!(node1.children.includes(node2.index))) {
            node1.addChild(node2.index);
            node2.addChild(node1.index);
          }
        }
      }
    }


    // ASTAR

    this.shortestPaths = findShortestPathsAstar(
      this.nodes,
      this.startIndices,
      this.startProjectionIndices,
      this.endIndices
    )



    this.removeDeadEndMidNodes()




    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const node1 = this.nodes[i];
        const node2 = this.nodes[j];
        const isConnects = !this.isLineSegmentBlocked(node1, node2)
        if (isConnects) {// Add edge to edges array
          this.edges.push([node1, node2]);// // Set node1 and node2 as children of each other
        }
      }
    }

    // Now create the edges
  }




  displaySolution(p: p5, pathCellIndex: number) {
    const animate = true;

    if (!animate) {
      pathCellIndex = this.edges.length
    }

    if (pathCellIndex >= this.edges.length) {
      pathCellIndex = this.edges.length
    }



    p.fill(200, 100, 100, 20);
    for (const polygon of this.obstacles) {
      p.beginShape();
      for (const vertex of polygon) {
        p.vertex(vertex.x, vertex.y);
      }
      p.endShape(p.CLOSE);
    }

    // Draw nodes
    p.fill(0);
    for (const node of this.nodes) {

      p.ellipse(node.x, node.y, 10, 10);

      p.noStroke()
      p.fill("gold")
      p.textSize(14)
      p.text(node.index, node.x, node.y)

    }

    // Draw edges
    p.stroke(0, 0, 255);

    for (let i = 0; i < pathCellIndex; i++) {
      const [node1, node2] = this.edges[i];


      p.line(node1.x, node1.y, node2.x, node2.y);
    }
  }


  displayShortestPaths(p: p5, thickness = 3) {
    // Display the shortest path for a specific start-end pair
    if (this.shortestPaths.length > 0) {
      this.shortestPaths.forEach(_path => {
        const path = _path.path;
        // Draw the shortest path as lines connecting nodes
        p.stroke(255, 0, 0); // Use the provided color (default is red)
        p.strokeWeight(thickness); // Set line thickness

        for (let i = 0; i < path.length - 1; i++) {
          const currentNode = path[i];
          const nextNode = path[i + 1];
          p.line(currentNode.x, currentNode.y, nextNode.x, nextNode.y);
        }
      })
    }
  }

  displayPathsAsPolygons(p:p5){
    this.sideWalkPolygons.forEach(polygon => {
      p.push()
      p.fill(150, 150, 150);
      // p.noStroke()
      p.beginShape()

      polygon.forEach(ring => {

        if(!ring) return
        p.vertex(ring[0], ring[1])

        // if (!ring) return


        // ring.forEach(pair => {
        //   if (!pair) return
        //   p.vertex(pair[0], pair[1])

        // })
      })

      p.endShape();
      p.pop();
    })

  }

}



