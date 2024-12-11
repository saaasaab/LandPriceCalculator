export class AdjacencyGraph {
    private adjacencyList: Record<string, string[]>;
  
    constructor() {
      this.adjacencyList = {};
    }
  
    // Add a vertex to the graph
    addVertex(vertex: string): void {
      if (!this.adjacencyList[vertex]) {
        this.adjacencyList[vertex] = [];
      }
    }
  
    // Add an edge between two vertices (undirected graph)
    addEdge(vertex1: string, vertex2: string): void {
      if (!this.adjacencyList[vertex1]) {
        this.addVertex(vertex1);
      }
      if (!this.adjacencyList[vertex2]) {
        this.addVertex(vertex2);
      }
      this.adjacencyList[vertex1].push(vertex2);
      this.adjacencyList[vertex2].push(vertex1);
    }
  
     // Add multiple edges for a single vertex
    addEdges(vertex: string, edges: string[]): void {
      edges.forEach((edge) => this.addEdge(vertex, edge));
    }
  
    // Display the edges only
    display(): void {
      const edges = new Set<string>();
      for (let vertex in this.adjacencyList) {
        this.adjacencyList[vertex].forEach((adjacent) => {
          const edge = [vertex, adjacent].sort().join(" - ");
          edges.add(edge);
        });
      }
      edges.forEach((edge) => console.log(edge));
    }
  
      // Get edges for a specific vertex
    getEdges(vertex: string): string[] {
      return this.adjacencyList[vertex] || [];
    }



    visualizeGraph(p: any): void {
      const vertices = Object.keys(this.adjacencyList);
      const positions: Record<string, { x: number; y: number }> = {};
      const dragging: Record<string, boolean> = {};
  
      // Assign random positions to vertices
      vertices.forEach((vertex) => {
        positions[vertex] = {
          x: Math.random() * p.width,
          y: Math.random() * p.height,
        };
        dragging[vertex] = false;
      });
  
      p.background(240);
      p.stroke(0);
      p.strokeWeight(1);
  
      p.mousePressed = () => {
        vertices.forEach((vertex) => {
          const d = p.dist(p.mouseX, p.mouseY, positions[vertex].x, positions[vertex].y);
          if (d < 10) {
            dragging[vertex] = true;
          }
        });
      };
  
      p.mouseReleased = () => {
        vertices.forEach((vertex) => {
          dragging[vertex] = false;
        });
      };
  
      p.draw = () => {
        p.background(240);
  
        // Update positions if dragging
        vertices.forEach((vertex) => {
          if (dragging[vertex]) {
            positions[vertex].x = p.mouseX;
            positions[vertex].y = p.mouseY;
          }
        });
  

        // Draw edges
        p.stroke(0);
        for (let vertex in this.adjacencyList) {
          this.adjacencyList[vertex].forEach((adjacent) => {
            p.line(
              positions[vertex].x,
              positions[vertex].y,
              positions[adjacent].x,
              positions[adjacent].y
            );
          });
        }
  
        // Draw vertices
        p.fill(255);
        p.stroke(0);
        p.strokeWeight(2);
        vertices.forEach((vertex) => {
          p.fill(255, 0, 0); // Text color red

          p.ellipse(positions[vertex].x, positions[vertex].y, 20, 20);
          p.noStroke();
          p.fill( 0 );
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(14); // Bigger text
          p.text(vertex, positions[vertex].x, positions[vertex].y);
        });
      };
    }

    
  

    // Remove an edge between two vertices
    removeEdge(vertex1: string, vertex2: string): void {
      this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(
        (v) => v !== vertex2
      );
      this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter(
        (v) => v !== vertex1
      );
    }
  
    // Remove a vertex and all its associated edges
    removeVertex(vertex: string): void {
      while (this.adjacencyList[vertex]?.length) {
        const adjacentVertex = this.adjacencyList[vertex].pop()!;
        this.removeEdge(vertex, adjacentVertex);
      }
      delete this.adjacencyList[vertex];
    }
  }
  
  // // Example usage
  // const graph = new Graph();
  // graph.addVertex("A");
  // graph.addVertex("B");
  // graph.addVertex("C");

  // graph.addEdge("A", "B");
  // graph.addEdge("A", "C");
  // graph.addEdge("B", "C");
  
  // graph.display();
  
  // // Output:
  // // A -> B, C
  // // B -> A, C
  // // C -> A, B
  