
import React, { useEffect, useRef } from "react";
import p5 from "p5";

import crosses from "robust-segment-intersect"
import classifyPoint from "robust-point-in-polygon"
import { findShortestPaths, TNode } from "../utils/AstarBiDirectional";




export type TPoint = { x: number; y: number };
type Point = [number, number];

export class Node {
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
  nodes: Node[];
  edges: [Node, Node][];
  obstaclesOffset: Node[][];
  obstacles: TPoint[][];
  boundary: TPoint[];
  nodeCount: number;
  shortestPaths: {
    start: TNode;
    end: TNode;
    path: TNode[];
  }[]





  constructor(startPoints: TPoint[], endPoints: TPoint[], obstacles: TPoint[][], boundary: TPoint[]) {
    // Initialize nodes
    this.nodes = [];
    this.obstaclesOffset = [];
    this.obstacles = obstacles;
    this.boundary = boundary;
    this.nodeCount = 0;
    this.shortestPaths = []



    const _boundary: Point[] = boundary.map(point => [point.x, point.y]);
    const startIndices: number[] = [];
    const endIndices: number[] = [];
    for (const point of startPoints) {
      const isOutsideBoundary = classifyPoint(_boundary, [point.x, point.y]) === 1 || boundary.length === 0
      if (!isOutsideBoundary) {
        this.nodes.push(new Node(point.x, point.y, this.nodeCount, "startNode"));
        startIndices.push(this.nodeCount)
        this.nodeCount++;

      }
    }

    for (const point of endPoints) {
      const isOutsideBoundary = classifyPoint(_boundary, [point.x, point.y]) === 1 || boundary.length === 0
      if (!isOutsideBoundary) {
        this.nodes.push(new Node(point.x, point.y, this.nodeCount, "endNode"));
        endIndices.push(this.nodeCount)

        this.nodeCount++;
      }
    }


    for (const obstacle of this.obstacles) {
      const _obstacle: Node[] = []
      for (const vertex of obstacle) {

        const newNode = new Node(vertex.x, vertex.y, Infinity)
        // this.nodes.push(newNode);
        _obstacle.push(newNode);
      }

      const offset = this.expandPolygon(_obstacle, 20);
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

    // Build the visibility graph
    this.shortestPaths = findShortestPaths(
      this.nodes as TNode[],
      startIndices,
      endIndices
    )




    this.calculateEdges();


  }


  calculateEdgeNormal(p1: Node, p2: Node) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Swap dx and dy and negate one to create a perpendicular vector
    const length = Math.sqrt(dx ** 2 + dy ** 2);
    return { x: dy / length, y: -dx / length }
  }



  expandPolygon(polygon: Node[], offset: number): Node[] {
    const expandedPolygon: Node[] = [];
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
        const newNode = new Node(newX, newY, this.nodeCount)

        this.nodeCount++;
        expandedPolygon.push(newNode);
      }
    }

    return expandedPolygon;
  }


  dfs(nodes: Node[], index: number, component: Set<number>, visited = new Set<number>()) {
    if (visited.has(index)) return;
    visited.add(index);
    component.add(index);

    const node = nodes[index];
    if (!node) return;

    node.children.forEach((childIndex) => {
      this.dfs(nodes, childIndex, component, visited);
    });
  };





  removeDeadEndMidNodes(nodes: Node[],) {








    // const nodesToRemove = new Set();



    // const queue: Node[] = [nodes[0]];
    // const nodesVisited = new Set();
    // // First go through all the nodes, create the graph and remove islands
    // while (queue.length > 0) {
    //   const child = queue.shift();

    //   if (!nodesVisited.has(child?.index)) {
    //     nodesVisited.add(child?.index);
    //     const children = this.nodes.filter(node => child?.children.includes(node.index))
    //     queue.push(...children)
    //   }
    // }


    // this.nodes = nodes.filter(node => nodesVisited.has(node.index));


    // IF THERE IS ONE CHILD, THEN IT MAY BE AN ISLAND, If none of the children have an end



    // // Iterate through the nodes to find dead-end midNodes
    // for (let i = 0; i < nodes.length; i++) {
    //   const node = nodes[i];
    //   nodesVisited.add(node.index);


    //   if (node.nodeType === "midNode" && node.children.length === 0) {
    //     nodesToRemove.add(node.index);
    //   }

    //   else if (node.nodeType === "midNode" && node.children.length === 1) {
    //     const childIndex = node.children[0];
    //     const childNode = nodes[childIndex];

    //     // Check if this node is the only child in the other node's children array
    //     if (childNode && childNode.children.includes(node.index) && childNode.children.length >= 1) {
    //       // Add this node to the removal set

    //       nodesToRemove.add(node.index);
    //       // Remove this node from the childNode's children array
    //       childNode.children = childNode.children.filter(c => c !== node.index);
    //     }
    //   }
    // };
    // this.nodes = nodes.filter(node => !nodesToRemove.has(node.index));



    // if (nodesToRemove.size > 0) {
    //   this.removeDeadEndMidNodes(this.nodes)
    // }
  }



  // Check if a line segment is blocked by any obstacle
  isLineSegmentBlocked(p1: Node, p2: Node): boolean {

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
        if (isConnects) {// Add edge to edges array
          if (!(node1.children.includes(node2.index))) {
            node1.addChild(node2.index);
            node2.addChild(node1.index);
          }
        }
      }
    }




    this.removeDeadEndMidNodes(this.nodes)




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
    const animate = false;

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


  displayShortestPath(p: p5, path: TNode[], thickness = 3) {
    // Draw the shortest path as lines connecting nodes
    p.stroke(255, 0, 0); // Use the provided color (default is red)
    p.strokeWeight(thickness); // Set line thickness

    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = path[i];
      const nextNode = path[i + 1];
      p.line(currentNode.x, currentNode.y, nextNode.x, nextNode.y);
    }
  }

}




interface Props { }

const VisibilityGraphComponent: React.FC<Props> = () => {
  const startPoints: TPoint[] = [{ x: 50, y: 50 }];
  const endPoints: TPoint[] = [{ x: 400, y: 400 }];
  const obstacles: TPoint[][] = [
    [
      { x: 75, y: 150 },
      { x: 150, y: 300 },
      { x: 325, y: 360 },
      { x: 400, y: 150 },
    ],

    // [
    //   { x: 450, y: 450 },
    //   { x: 450, y: 500 },
    //   { x: 700, y: 500 },
    //   { x: 700, y: 450 },
    // ],

    [
      { x: 560, y: 45 },
      { x: 450, y: 220 },
      { x: 750, y: 500 },
    ],


  ];

  const canvasRef = useRef<HTMLDivElement>(null);
  const boundary: TPoint[] = []; //NO LIMITS
  const visibilityGraph = new VisibilityGraph(startPoints, endPoints, obstacles, boundary);

  const sketch = (p: p5) => {
    // const 
    p.preload = () => { };

    p.setup = () => {
      const canvas = p.createCanvas(800, 600);
      if (canvasRef.current) {
        canvas.parent(canvasRef.current);
      }
    };



    p.draw = () => {
      visibilityGraph.displaySolution(p, visibilityGraph.edges.length - 1);
    }
    p.mousePressed = () => {
      const newX = p.mouseX;
      const newY = p.mouseY;
      const newEdge = new Node(newX, newY, visibilityGraph.nodes.length);
      visibilityGraph.nodes.push(newEdge)
      visibilityGraph.calculateEdges();


    }
    p.mouseDragged = () => { };

    p.mouseReleased = () => { };

  };



  useEffect(() => {
    const p5Instance = new p5(sketch);
    return () => {
      p5Instance.remove();
    };
  }, []);




  return <div ref={canvasRef} />;
};

export default VisibilityGraphComponent;

