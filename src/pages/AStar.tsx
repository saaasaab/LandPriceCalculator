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

const AStarPathfinding = () => {
  const sketchRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const gridRef = useRef<Node[][]>();
  const pathIndexRef = useRef<number[]>([]);
  const animationSpeedRef = useRef(1);
  const pathStatesRef = useRef<PathfindingState[]>([]);


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
    { x: 20, y: 12 },
    // { x: 23, y: 4 },
    // { x: 29, y: 19 },
  ];

  const heuristic = (a: Node, b: Node) => {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };

  const areAllPointsConnected = (paths: PathfindingState[]): boolean => {
    const adjacencyList = new Map<string, Set<string>>(); // Graph representation

    // Helper function to serialize a point as a string
    const pointKey = (point: Point) => `${point.x},${point.y}`;

    // Build the adjacency list from paths
    paths.forEach((pathState) => {
      const path = pathState.path;
      for (let i = 0; i < path.length - 1; i++) {
        const pointA = pointKey(path[i]);
        const pointB = pointKey(path[i + 1]);

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


  const findPathStep = (
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
            neighbor.h = heuristic(neighbor, end);
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

  const initializePathfinding = (start: Node, end: Node, grid: Node[][]) => {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
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

  const createGrid = () => {
    const grid: Node[][] = new Array(cols);
    for (let i = 0; i < cols; i++) {
      grid[i] = new Array(rows);
      for (let j = 0; j < rows; j++) {
        grid[i][j] = new Node(i, j);
      }
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j].addNeighbors(grid, cols, rows);
      }
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (Math.random() < 0.3) {
          grid[i][j].wall = true;
        }
      }
    }

    [...startPoints, ...endPoints].forEach(point => {
      if (grid[point.x] && grid[point.x][point.y]) {
        grid[point.x][point.y].wall = false;
        const clearRadius = 2;
        for (let dx = -clearRadius; dx <= clearRadius; dx++) {
          for (let dy = -clearRadius; dy <= clearRadius; dy++) {
            const nx = point.x + dx;
            const ny = point.y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
              grid[nx][ny].wall = false;
            }
          }
        }
      }
    });

    return grid;
  };

  const mergePaths = (paths: PathfindingState[]): PathfindingState[] => {
    const visitedCells = new Set<string>(); // Tracks cells already included in a path
    const mergedPaths: PathfindingState[] = [];

    // Helper function to serialize a point as a string
    const pointKey = (point: Point) => `${point.x},${point.y}`;


    // Process each path
    // console.log(`[...paths].length`, paths)
    paths.forEach((currentPath) => {
      let merged = false;



      // Check for overlap with existing merged paths
      for (let i = 0; i < mergedPaths.length; i++) {
        const mergedPath = mergedPaths[i];


        // Find overlap
        const overlap = currentPath.path.some((point) =>
          visitedCells.has(pointKey(point))
        );

        if (overlap) {
          // Merge non-overlapping points into the existing path
          const nonOverlappingPoints = currentPath.path.filter(
            (point) => !visitedCells.has(pointKey(point))
          );
          mergedPath.path.push(...nonOverlappingPoints);

          // Add the new points to the visited set
          nonOverlappingPoints.forEach((point) =>
            visitedCells.add(pointKey(point))
          );

          merged = true;
          break; // Stop checking other paths once merged
        }
      }

      // If not merged, add it as a new path
      if (!merged) {
        mergedPaths.push(currentPath);

        // Add all points in this path to the visited set
        currentPath.path.forEach((point) => visitedCells.add(pointKey(point)));
      }
    });

    return mergedPaths;
  };



  const startNewPathfinding = () => {
    const grid = createGrid(); // Generate a new grid
    gridRef.current = grid;

    const newPathStates: PathfindingState[] = [];

    // Loop through all combinations of start and end points
    for (let startIndex = 0; startIndex < startPoints.length; startIndex++) {
      for (let endIndex = 0; endIndex < endPoints.length; endIndex++) {
        const start = grid[startPoints[startIndex].x][startPoints[startIndex].y];
        const end = grid[endPoints[endIndex].x][endPoints[endIndex].y];

        // Initialize the pathfinding state for the current pair
        let state: PathfindingState = initializePathfinding(start, end, grid);

        // Solve A* for this start-end pair
        while (!state.done) {
          const result = findPathStep(
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
    pathStatesRef.current = newPathStates;

    // mergePaths(pathStatesRef.current)
    


  };

  const sketch = (p: p5) => {

    p.setup = () => {
      const canvas = p.createCanvas(width, height);

      if (containerRef.current) {
        canvas.parent(containerRef.current);
      }
      startNewPathfinding();
    };

    p.draw = () => {
      if (!gridRef.current) return;

      const grid = gridRef.current;
      const pathStates = pathStatesRef.current;

      p.background(255);

      // Draw grid and walls
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          p.stroke(0);
          p.strokeWeight(0.5);
          if (grid[i][j].wall) {
            p.fill(0);
          } else {
            p.fill(255);
          }
          p.rect(i * w, j * h, w, h);
        }
      }

      // Draw all paths with unique colors and thicknesses
      const maxThickness = 10; // Thickest line
      const minThickness = 2; // Thinnest line
      let totalPathLength = 0; // Keep track of the total path length

      pathStates.forEach((state, index) => {
        const colorHue = (index * 60) % 360; // Unique hue for each path
        const lineThickness = maxThickness - (index * (maxThickness - minThickness) / pathStates.length);

        // Add this path's length to the total
        totalPathLength += state.path.length;

        // Draw the final path
        if (state.path.length > 0) {
          p.beginShape();
          p.noFill();
          p.strokeWeight(lineThickness); // Set line thickness
          p.stroke(p.color(`hsl(${colorHue}, 100%, 50%)`)); // Set color using HSL
          state.path.forEach(point => {
            p.vertex(point.x * w + w / 2, point.y * h + h / 2);
          });
          p.endShape();
        }
      });

      // Draw start points
      startPoints.forEach(point => {
        p.fill(0, 255, 0);
        p.noStroke();
        p.circle(point.x * w + w / 2, point.y * h + h / 2, w * 0.8);
      });

      // Draw end points
      endPoints.forEach(point => {
        p.fill(255, 0, 0);
        p.noStroke();
        p.circle(point.x * w + w / 2, point.y * h + h / 2, w * 0.8);
      });

      // Display total path length at the bottom of the screen
      p.fill(0); // Black text
      p.noStroke();
      p.fill(10, 120, 230);
      p.textSize(24);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text(`Total Path Length: ${totalPathLength}`, p.width / 2, p.height - 10);
    };



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
          onClick={() => startNewPathfinding()}
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