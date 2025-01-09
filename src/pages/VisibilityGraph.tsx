
import React, { useEffect, useRef } from "react";
import p5 from "p5";

import crosses from "robust-segment-intersect"





export type TPoint = { x: number; y: number };

export class Node {
  x: number;
  y: number;
  parent: Node | null;
  children: Node[];
  index: number;


  constructor(x: number, y: number, index: number) {
    this.x = x;
    this.y = y;
    this.parent = null;
    this.children = [];
    this.index = index
  }

  // Adds a child node to this node
  addChild(node: Node) {
    this.children.push(node);
  }
}

export class VisibilityGraph {
  nodes: Node[];
  edges: [Node, Node][];
  obstaclesOffset: Node[][]
  obstacles:  TPoint[][]


  constructor(startPoints: TPoint[], endPoints: TPoint[], obstacles: TPoint[][]) {
    // Initialize nodes
    this.nodes = [];
    this.obstaclesOffset = [];
    this.obstacles = obstacles;

    // Convert startPoints and endPoints to nodes
    for (const point of [...startPoints, ...endPoints]) {
      this.nodes.push(new Node(point.x, point.y, this.nodes.length));
    }
    for (const obstacle of this.obstacles ) {
      const _obstacle = []
      for (const vertex of obstacle) {
        const newNode = new Node(vertex.x, vertex.y, this.nodes.length)
        // this.nodes.push(newNode);
        _obstacle.push(newNode);
      }

      const offset = this.expandPolygon(_obstacle, 20);
      this.obstaclesOffset.push(offset);
    }


    // Convert obstacle vertices to nodes
    this.obstaclesOffset.forEach(obstacle=>{
      obstacle.forEach(vertex=>{
        this.nodes.push(vertex)
      })
    })


    // Initialize edges array
    this.edges = [];

    // Build the visibility graph
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
      
      const newNode = new Node(current.x + offsetNormal.x * offset,  current.y + offsetNormal.y * offset, this.nodes.length)

      expandedPolygon.push(newNode);
    }

    return expandedPolygon;
  }

  // Check if a line segment is blocked by any obstacle
  isLineSegmentBlocked(p1: Node, p2: Node): boolean {

    let isBlocked = false;
    for (const polygon of this.obstacles ) {
      const numVertices = polygon.length;
      for (let i = 0; i < numVertices; i++) {
        const p3 = polygon[i];
        const p4 = polygon[(i + 1) % numVertices];

        //Check if line segment a0, a1  crosses segment b0, b1

        if (crosses([p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], [p4.x, p4.y]) ) {
          isBlocked = true
        }
      }
      if (isBlocked) break
    }
    return isBlocked;
  }

  // Calculate visibility edges
calculateEdges(): void {
    this.edges=[]
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {


        // Pick two points to create an edge. 
        const node1 = this.nodes[i];
        const node2 = this.nodes[j];

        // Loop through all the possible edges to make sure it doesn't cross it. 

        const isConnects = !this.isLineSegmentBlocked(node1, node2 )
        if (isConnects) {
          // Add edge to edges array
          this.edges.push([node1, node2]);
          // // Set node1 and node2 as children of each other
          // p1.addChild(p2);
          // p2.addChild(p1);
        }
      }
    }
  }


  displaySolution(p: p5,){
    p.fill(200, 100, 100,20);
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
    }

    // Draw edges
    p.stroke(0, 0, 255);
    for (const [node1, node2] of this.edges) {
      p.line(node1.x, node1.y, node2.x, node2.y);
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
  const visibilityGraph = new VisibilityGraph(startPoints, endPoints, obstacles);

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
     visibilityGraph.displaySolution(p);
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
