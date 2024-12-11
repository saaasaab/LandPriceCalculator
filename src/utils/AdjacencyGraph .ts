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
  
    // Display the graph
    display(): void {
      for (let vertex in this.adjacencyList) {
        console.log(`${vertex} -> ${this.adjacencyList[vertex].join(", ")}`);
      }
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
  