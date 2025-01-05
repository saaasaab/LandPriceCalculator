import { useEffect, useRef, useState } from 'react';
import p5 from "p5";
// Node class for the grid

interface Point {
  x: number;
  y: number;
}

interface PathfindingState {
  openSet: Node[];
  closedSet: Node[];
  current: Node | null;
  path: Point[];
  done: boolean;
}


class Node {
  x: number;
  y: number;
  f: number = 0;
  g: number = 0;
  h: number = 0;
  neighbors: Node[] = [];
  previous: Node | null = null;
  children: Node[] | null = null;
  wall: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  addNeighbors(grid: Node[][], cols: number, rows: number) {
    const { x, y } = this;
    if (x < cols - 1) this.neighbors.push(grid[x + 1][y]);
    if (x > 0) this.neighbors.push(grid[x - 1][y]);
    if (y < rows - 1) this.neighbors.push(grid[x][y + 1]);
    if (y > 0) this.neighbors.push(grid[x][y - 1]);
    // Diagonals
    if (x > 0 && y > 0) this.neighbors.push(grid[x - 1][y - 1]);
    if (x < cols - 1 && y > 0) this.neighbors.push(grid[x + 1][y - 1]);
    if (x > 0 && y < rows - 1) this.neighbors.push(grid[x - 1][y + 1]);
    if (x < cols - 1 && y < rows - 1) this.neighbors.push(grid[x + 1][y + 1]);
  }
}

export class AStar {
  cols: number;
  rows: number;
  startPoints: Point[];
  endPoints: Point[]
  grid: Node[][];
  pathStates: PathfindingState[];
  width: number;
  height: number;
  w: number;
  h: number;

  constructor(cols: number, rows: number, startPoints: Point[], endPoints: Point[], width: number, height: number) {
    this.cols = Math.round(cols);
    this.rows = Math.round(rows);
    this.startPoints = startPoints;
    this.endPoints = endPoints;
    this.grid = [];
    this.pathStates = []
    this.width = width;
    this.height = height;
    this.w = Math.round(width / cols);
    this.h = Math.round(height / rows);



  }

  heuristic = (a: Node, b: Node) => {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };

  areAllPointsConnected = (paths: PathfindingState[]): boolean => {
    const adjacencyList = new Map<string, Set<string>>(); // Graph representation

    // Helper function to serialize a point as a string

    // Build the adjacency list from paths
    paths.forEach((pathState) => {
      const path = pathState.path;
      for (let i = 0; i < path.length - 1; i++) {
        const pointA = this.pointKey(path[i]);
        const pointB = this.pointKey(path[i + 1]);

        // Add the connection in both directions (undirected graph)
        if (!adjacencyList.has(pointA)) adjacencyList.set(pointA, new Set());
        if (!adjacencyList.has(pointB)) adjacencyList.set(pointB, new Set());
        adjacencyList.get(pointA)!.add(pointB);
        adjacencyList.get(pointB)!.add(pointA);
      }
    });

    // Get all unique points in the graph
    const allPoints = Array.from(adjacencyList.keys());

    if (allPoints.length === 0) return true; // No points, trivially connected

    // Perform BFS or DFS to check connectivity
    const visited = new Set<string>();
    const stack = [allPoints[0]]; // Start from the first point

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (!visited.has(current)) {
        visited.add(current);
        const neighbors = adjacencyList.get(current);
        if (neighbors) {
          neighbors.forEach((neighbor) => {
            if (!visited.has(neighbor)) {
              stack.push(neighbor);
            }
          });
        }
      }
    }

    // Check if all points were visited
    return visited.size === allPoints.length;
  };

  findPathStep = (
    start: Node,
    end: Node,
    grid: Node[][],
    openSet: Node[],
    closedSet: Node[]
  ): PathfindingState | null => {
    if (openSet.length > 0) {
      let winner = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }

      const current = openSet[winner];

      if (current === end) {
        const path: Point[] = [];
        let temp: Node | null = current;
        const visited = new Set<Node>(); // Track visited nodes to prevent cycles

        while (temp && !visited.has(temp)) {
          visited.add(temp);
          path.push({ x: temp.x, y: temp.y });
          temp = temp.previous;
        }

        return {
          openSet,
          closedSet,
          current,
          path: path.reverse(),
          done: true
        };
      }

      openSet.splice(winner, 1);
      closedSet.push(current);

      const neighbors = current.neighbors;
      for (const neighbor of neighbors) {
        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          // Calculate the cost of movement
          const isDiagonal = current.x !== neighbor.x && current.y !== neighbor.y;
          const moveCost = isDiagonal ? Math.SQRT2 : 1; // √2 for diagonal, 1 for orthogonal
          const tempG = current.g + moveCost;

          let newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }

          if (newPath) {
            neighbor.h = this.heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }

      const path: Point[] = [];
      let temp: Node | null = current;
      const visited = new Set<Node>(); // Track visited nodes to prevent cycles

      while (temp && !visited.has(temp)) {
        visited.add(temp);
        path.push({ x: temp.x, y: temp.y });
        temp = temp.previous;
      }

      return {
        openSet,
        closedSet,
        current,
        path: path.reverse(),
        done: false
      };
    }

    return null;
  };

  initializePathfinding = (start: Node, end: Node, grid: Node[][]) => {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        grid[i][j].f = 0;
        grid[i][j].g = 0;
        grid[i][j].h = 0;
        grid[i][j].previous = null;
      }
    }

    const openSet: Node[] = [start];
    const closedSet: Node[] = [];

    return {
      openSet,
      closedSet,
      current: null,
      path: [],
      done: false
    };
  };

  pointKey = (point: Point) => `${point.x},${point.y}`;

  sFact(num: number) {
    var rval = 1;
    for (var i = 2; i <= num; i++)
      rval = rval * i;
    return rval;
  }

  mergePaths = (paths: PathfindingState[]): PathfindingState[] => {
    const visitedCells = new Set<string>(); // Tracks cells already included in a path
    const mergedPaths: PathfindingState[] = [];
    const segments: Point[] = [];
    return mergedPaths;
  };

  createGrid = () => {
    const grid: Node[][] = new Array(this.cols);
    for (let i = 0; i < this.cols; i++) {
      grid[i] = new Array(this.rows);
      for (let j = 0; j < this.rows; j++) {
        grid[i][j] = new Node(i, j);
      }
    }

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        grid[i][j].addNeighbors(grid, this.cols, this.rows);
      }
    }

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (Math.random() < 0.3) {
          grid[i][j].wall = true;
        }
      }
    }

    [...this.startPoints, ...this.endPoints].forEach(point => {
      if (grid[point.x] && grid[point.x][point.y]) {
        grid[point.x][point.y].wall = false;
        const clearRadius = 1;
        for (let dx = -clearRadius; dx <= clearRadius; dx++) {
          for (let dy = -clearRadius; dy <= clearRadius; dy++) {
            const nx = point.x + dx;
            const ny = point.y + dy;
            if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
              grid[nx][ny].wall = false;
            }
          }
        }
      }
    });

    return grid;
  };

  checkPair(mainArray: string[][], inputArray: string[]) {
    // Sort the input array for comparison
    const sortedInputArray = inputArray.slice().sort();

    // Loop through the main array and check if any pair matches the input pair
    for (let pair of mainArray) {
      if (pair.slice().sort().toString() === sortedInputArray.toString()) {
        return true;
      }
    }
    return false;
  }

  startNewPathfinding = () => {
    const grid = this.createGrid(); // Generate a new grid
    this.grid = grid;

    const newPathStates: PathfindingState[] = [];


    // Loop through all combinations of start and end points
    for (let startIndex = 0; startIndex < this.startPoints.length; startIndex++) {
      for (let endIndex = 0; endIndex < this.endPoints.length; endIndex++) {
        // if(startIndex === startIndex2 || endIndex === endIndex2 ) continue;

        const start = grid[this.startPoints[startIndex].x][this.startPoints[startIndex].y];
        const end = grid[this.endPoints[endIndex].x][this.endPoints[endIndex].y];

        // Initialize the pathfinding state for the current pair
        let state: PathfindingState = this.initializePathfinding(start, end, grid);

        // Solve A* for this start-end pair
        while (!state.done) {
          const result = this.findPathStep(
            start,
            end,
            grid,
            state.openSet,
            state.closedSet
          );

          if (result) {
            state = result; // Update state
          } else {
            break; // Exit if no valid path found
          }
        }



        // Store the result of this pair
        newPathStates.push(state);
      }
    }

    const startEndPairs: string[][] = []



    for (let startIndex = 0; startIndex < this.startPoints.length; startIndex++) {
      for (let startIndex2 = 0; startIndex2 < this.startPoints.length; startIndex2++) {

        if (startIndex === startIndex2) continue;


        const start = grid[this.startPoints[startIndex].x][this.startPoints[startIndex].y];
        const end = grid[this.startPoints[startIndex2].x][this.startPoints[startIndex2].y];
        const pair = [this.pointKey(start), this.pointKey(end)]

        if (this.checkPair(startEndPairs, pair)) {
          continue
        }
        else {
          startEndPairs.push(pair)
        }

        // Initialize the pathfinding state for the current pair
        let state: PathfindingState = this.initializePathfinding(start, end, grid);

        // Solve A* for this start-end pair
        while (!state.done) {
          const result = this.findPathStep(
            start,
            end,
            grid,
            state.openSet,
            state.closedSet
          );

          if (result) {
            state = result; // Update state
          } else {
            break; // Exit if no valid path found
          }
        }



        // Store the result of this pair
        newPathStates.push(state);
      }
    }


    for (let endIndex = 0; endIndex < this.endPoints.length; endIndex++) {
      for (let endIndex2 = 0; endIndex2 < this.endPoints.length; endIndex2++) {

        if (endIndex === endIndex2) continue;

        const start = grid[this.endPoints[endIndex].x][this.endPoints[endIndex].y];
        const end = grid[this.endPoints[endIndex2].x][this.endPoints[endIndex2].y];
        const pair = [this.pointKey(start), this.pointKey(end)]

        if (this.checkPair(startEndPairs, pair)) {
          continue
        }
        else {
          startEndPairs.push(pair)
        }


        // Initialize the pathfinding state for the current pair
        let state: PathfindingState = this.initializePathfinding(start, end, grid);

        // Solve A* for this start-end pair
        while (!state.done) {
          const result = this.findPathStep(
            start,
            end,
            grid,
            state.openSet,
            state.closedSet
          );

          if (result) {
            state = result; // Update state
          } else {
            break; // Exit if no valid path found
          }
        }



        // Store the result of this pair
        newPathStates.push(state);
      }
    }






    // Update the reference to all pathfinding states
    this.pathStates = newPathStates;

    this.mergePaths(this.pathStates);

  };

  displaySolutions(p: p5, pathCellIndex: number, showGrid = false) {


    if (!this.grid) return;

    const grid = this.grid;
    const pathStates = this.pathStates;


    if (showGrid) {
      // Draw grid and walls
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          p.stroke(0);
          p.strokeWeight(0.5);
          if (grid[i][j].wall) {
            p.fill(0);
          } else {
            p.fill(255);
          }
          p.rect(i * this.w, j * this.h, this.w, this.h);
        }
      }
    }

    // Draw all paths with unique colors and thicknesses
    const maxThickness = 10; // Thickest line
    const minThickness = 2; // Thinnest line
    let totalPathLength = 0; // Keep track of the total path length
    let maxLengthPath = 0

    let animate = true
    pathStates.forEach((state, index) => {
      const colorHue = (index * 60) % 360; // Unique hue for each path
      const lineThickness = maxThickness - (index * (maxThickness - minThickness) / pathStates.length);
      if (state.path.length > maxLengthPath) {
        maxLengthPath = state.path.length;
      }

      // Add this path's length to the total
      totalPathLength += state.path.length;

      // Draw the final path
      if (state.path.length > 0) {
        p.beginShape();
        p.noFill();
        p.strokeWeight(lineThickness); // Set line thickness
        p.stroke(p.color(`hsl(${colorHue}, 100%, 50%)`)); // Set color using HSL
        // state.path[pathCellIndex]


        
        if (!animate) {
          pathCellIndex = state.path.length
        }
        for (let i = 0; i < pathCellIndex; i++) {
          if (i < state.path.length) {
            const point = state.path[i];
            p.vertex(point.x * this.w + this.w / 2, point.y * this.h + this.h / 2);
          }
        }

        p.endShape();
      }
    });



    // Draw start points
    this.startPoints.forEach(point => {
      p.fill(0, 255, 0);
      p.noStroke();
      p.circle(point.x * this.w + this.w / 2, point.y * this.h + this.h / 2, this.w * 0.8);
    });

    // Draw end points
    this.endPoints.forEach(point => {
      p.fill(255, 0, 0);
      p.noStroke();
      p.circle(point.x * this.w + this.w / 2, point.y * this.h + this.h / 2, this.w * 0.8);
    });

    // Display total path length at the bottom of the screen
    p.fill(0); // Black text
    p.noStroke();
    p.fill(10, 120, 230);
    p.textSize(24);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(`Total Path Length: ${totalPathLength}`, p.width / 2, p.height - 10);



  }
}




const AStarPathfinding = () => {
  const sketchRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const animationSpeedRef = useRef(1);


  // Constants
  const width = 600;
  const height = 400;
  const cols = 30;
  const rows = 20;
  const w = width / cols;
  const h = height / rows;

  // Starting and ending points
  const startPoints = [
    { x: 5, y: 5 },
    { x: 10, y: 15 },
    // { x: 25, y: 10 },
    // { x: 13, y: 1 },
    // { x: 2, y: 4 },
  ];

  const endPoints = [
    { x: 24, y: 17 },
    { x: 22, y: 5 },
    // { x: 20, y: 12 },
    // { x: 23, y: 4 },
    // { x: 29, y: 19 },
  ];






  // const width = 600;
  // const height = 400;
  // const cols = 300;
  // const rows = 200;
  // const w = width / cols;
  // const h = height / rows;

  // // Starting and ending points
  // const startPoints = [
  //   { x: 5, y: 5 },
  //   { x: 10, y: 15 },
  //   { x: 25, y: 10 },
  //   { x: 13, y: 1 },
  //   { x: 2, y: 4 },
  // ];

  // const endPoints = [
  //   { x: 124, y: 170 },
  //   { x: 222, y: 50 },
  //   { x: 120, y: 112 },
  //   { x: 230, y: 40 },
  //   { x: 291, y: 190 },
  // ];


  const Astar = new AStar(cols, rows, startPoints, endPoints, width, height);

  const sketch = (p: p5) => {

    p.setup = () => {
      const canvas = p.createCanvas(width, height);

      if (containerRef.current) {
        canvas.parent(containerRef.current);
      }
      p.frameRate(10)
      Astar.startNewPathfinding();
    };

    let pathCellIndex = 0;

    p.draw = () => {

      p.background(220)
      Astar.displaySolutions(p, pathCellIndex,)
      pathCellIndex++
      const maxPathStatesLength = Math.max( ...Astar.pathStates.map(state=>state.path.length)) 


      if (pathCellIndex > maxPathStatesLength  + 10) {
        pathCellIndex = 0
      }
    }



  };


  useEffect(() => {
    // let mounted = true;
    const p5Instance = new p5(sketch);
    return () => {
      p5Instance.remove();
    };
  }, []);




  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">A* Pathfinding Visualization</h1>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => Astar.startNewPathfinding()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Regenerate
        </button>
        <button
          onClick={() => {
            animationSpeedRef.current = Math.max(1, animationSpeedRef.current - 1);
          }}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Speed Up
        </button>
        <button

          onClick={() => {
            animationSpeedRef.current += 1;
          }}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Slow Down
        </button>
      </div>
      <div ref={containerRef} className="border rounded overflow-hidden" />
    </div>
  );
};

export default AStarPathfinding;