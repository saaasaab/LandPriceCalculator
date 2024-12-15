import { AdjacencyGraph } from "./AdjacencyGraph";


type Point = { x: number, y: number };
type Positions = Record<string, Point>


export type SitePlanObjects = "Parking1" | "Parking2" | "Driveway" | "Bike Parking" | "Approach" | "Garbage" | "Building";

type DimensionValue = {
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
  dragging: boolean;
  [key: string]: any;
  normalParkingSpots?: number;
};

type Dimensions = Record<SitePlanObjects, DimensionValue>;

// Visualization module using p5.js
export class AdjacencyGraphVisualizer {
  private graph: AdjacencyGraph;
  private iteration: number;


  constructor(graph: AdjacencyGraph) {
    this.graph = graph;
    this.iteration = 0;

  }

  solver(
    p: any,
    dimensions: Dimensions,
  ): void {
    // const vertices = Object.keys(this.graph["adjacencyList"]);


    const numParkingSpots = 10;
    const buildingSQFT = 5000;


    const possiblePoints: Positions[] = [];
    const possibleDimensions: Dimensions[] = [];

    const numChildren = 10;



    // Initialize the potential children
    for (let i = 0; i < numChildren; i++) {
      possiblePoints.push(JSON.parse(JSON.stringify(dimensions)));
    }

    for (let i = 0; i < numChildren; i++) {
      possibleDimensions.push(JSON.parse(JSON.stringify(dimensions)));
    }



    const nudgeStrength = 2;
    // create a new variation of each child. Let the first child be an exact clone of the parent
    for (let i = 1; i < numChildren; i++) {
      for (let vertex in this.graph["adjacencyList"]) {

        const randomNudge = arrayOfRandomNudges(nudgeStrength, 2)
        // [Math.random() * nudgeStrength * 2 - nudgeStrength, Math.random() * nudgeStrength * 2 - nudgeStrength];

        const newPoint = { x: possiblePoints[i][vertex].x + randomNudge[0], y: possiblePoints[i][vertex].y + randomNudge[1] };

        //  && Math.abs(newPoint.x - possiblePoints[i][vertex].x ) > 40)
        if (checkIfInBoundryWidth(newPoint, p.width, 40)) {
          possiblePoints[i][vertex].x = newPoint.x
        }
        if (checkIfInBoundryHeight(newPoint, p.height, 40)) {
          possiblePoints[i][vertex].y = newPoint.y
        }
      }
    }
    

    const nudgeStrengthDimensions = 1;
    const parkingNudge = [-1, 0, 1];

    const getRandomElement = (items: number[]) => items[Math.floor(Math.random() * items.length)];
    // create a new variation of each child. Let the first child be an exact clone of the parent
    for (let i = 1; i < numChildren; i++) {
      const randomNudge = arrayOfRandomNudges(nudgeStrengthDimensions, 8);

      const newApproach = {
        width: possibleDimensions[i]["Approach"].width + randomNudge[0],
        height: possibleDimensions[i]["Approach"].height + randomNudge[1],
      }
      const newDriveway = {
        width: possibleDimensions[i]["Driveway"].width + randomNudge[0],
        height: possibleDimensions[i]["Driveway"].height + randomNudge[1],
      }
      const newParking1 = {
        normalParkingSpots: possibleDimensions[i]["Parking1"].normalParkingSpots || 0 + getRandomElement(parkingNudge),
      }
      const newParking2 = {
        normalParkingSpots: possibleDimensions[i]["Parking2"].normalParkingSpots || 0 + getRandomElement(parkingNudge),
      }

      const boundary = [
        { x: 40, y: 40 },
        { x: p.width - 40, y: 40 },
        { x: p.width - 40, y: p.height - 40 },
        { x: 40, y: p.height }
      ];

      const newParking1Dimensions = {
        width: 190,
        height: 80 * newParking1.normalParkingSpots,
      }

      const newParking2Dimensions = {
        width: 190,
        height: 80 * newParking2.normalParkingSpots,
      }

      if (isRectangleWithinBoundary(possiblePoints[i]["Approach"], newApproach.width, newApproach.height, boundary)) {
        possibleDimensions[i]["Approach"] = { ...possibleDimensions[i]["Approach"], ...newApproach }
      }
      if (isRectangleWithinBoundary(possiblePoints[i]["Driveway"], newDriveway.width, newDriveway.height, boundary)) {
        possibleDimensions[i]["Driveway"] = { ...possibleDimensions[i]["Driveway"], ...newDriveway }
      }
      if (isRectangleWithinBoundary(possiblePoints[i]["Parking1"], newParking1Dimensions.width, newParking1Dimensions.height, boundary)) {
        possibleDimensions[i]["Parking1"] = { ...possibleDimensions[i]["Parking1"], ...newParking1 }
      }
      if (isRectangleWithinBoundary(possiblePoints[i]["Parking2"], newParking2Dimensions.width, newParking2Dimensions.height, boundary)) {
        possibleDimensions[i]["Parking2"] = { ...possibleDimensions[i]["Parking2"], ...newParking2 }
      }
    }


    // Calculate the base angles, areas, distances, and scores

    let closestTo180ParkingAngleIndex = 0;
    let closestTo180DrivewayAngleIndex = 0;
    let closestTo90ApproachDrivewayParkingAngleIndex = 0;
    let closestTo90ApproachDrivewayParkingAngle2Index = 0;
    let closestDistanceParking1ToDrivewayIndex = 0;
    let closestDistanceParking2ToDrivewayIndex = 0;
    let currentMaxParkingIndex = 0;
    let currentMaxParking2Index = 0;


    let closestTo180ParkingAngle = calculateAngle(dimensions["Parking1"], dimensions["Driveway"], dimensions["Parking2"])
    let closestTo180DrivewayAngle = calculateAngle(dimensions["Approach"], dimensions["Driveway"], dimensions["Garbage"])
    let closestTo90ApproachDrivewayParkingAngle = calculateAngle(dimensions["Approach"], dimensions["Driveway"], dimensions["Parking1"])
    let closestTo90ApproachDrivewayParkingAngle2 = calculateAngle(dimensions["Approach"], dimensions["Driveway"], dimensions["Parking2"])
    let closestDistanceParking1ToDriveway = calculateDistanceBetweenPoints(dimensions["Parking1"], dimensions["Driveway"]);
    let closestDistanceParking2ToDriveway = calculateDistanceBetweenPoints(dimensions["Parking2"], dimensions["Driveway"]);

    let currentMaxParking = possibleDimensions[0]["Parking1"].normalParkingSpots || 0;
    let currentMaxParking2 = possibleDimensions[0]["Parking2"].normalParkingSpots || 0;


    for (let i = 0; i < numChildren; i++) {

      const p1 = possiblePoints[i]["Parking1"];
      const p2 = possiblePoints[i]["Parking2"];
      const driveway = possiblePoints[i]["Driveway"];
      const garbage = possiblePoints[i]["Garbage"]
      const approach = possiblePoints[i]["Approach"]


      // Calculate the angle betwene parking and driveway
      const parkingAngle = calculateAngle(p1, driveway, p2)
      const drivewayAngle = calculateAngle(approach, driveway, garbage);
      const approachDrivewayParkingAngle = calculateAngle(approach, driveway, p1);
      const approachDrivewayParkingAngle2 = calculateAngle(approach, driveway, p2);
      const distanceParking1ToDriveway = calculateDistanceBetweenPoints(p1, driveway);
      const distanceParking2ToDriveway = calculateDistanceBetweenPoints(p2, driveway);



      // Calculate the angle betwene parking and driveway
      const parkingSpots = possibleDimensions[i]["Parking1"].normalParkingSpots || 0;
      const parkingSpots2 = possibleDimensions[i]["Parking2"].normalParkingSpots || 0;


      if (Math.abs(parkingSpots || 0 - numParkingSpots) < Math.abs(currentMaxParking - numParkingSpots) && currentMaxParking + currentMaxParking2 <= numParkingSpots) {
        currentMaxParking = parkingSpots
        currentMaxParkingIndex = i;
      }

      if (Math.abs(parkingSpots2 || 0 - numParkingSpots) < Math.abs(currentMaxParking2 - numParkingSpots) && currentMaxParking + currentMaxParking2 <= numParkingSpots) {
        currentMaxParking2 = parkingSpots2
        currentMaxParking2Index = i;
      }



      if (Math.abs(parkingAngle - 180) < Math.abs(closestTo180ParkingAngle - 180)) {
        closestTo180ParkingAngle = parkingAngle
        closestTo180ParkingAngleIndex = i;
      }

      if (Math.abs(drivewayAngle - 180) < Math.abs(closestTo180DrivewayAngle - 180)) {
        closestTo180DrivewayAngle = drivewayAngle
        closestTo180DrivewayAngleIndex = i;
      }

      if (Math.abs(approachDrivewayParkingAngle - 90) < Math.abs(closestTo90ApproachDrivewayParkingAngle - 90)) {
        closestTo90ApproachDrivewayParkingAngle = approachDrivewayParkingAngle
        closestTo90ApproachDrivewayParkingAngleIndex = i;
      }

      if (Math.abs(approachDrivewayParkingAngle2 - 90) < Math.abs(closestTo90ApproachDrivewayParkingAngle2 - 90)) {
        closestTo90ApproachDrivewayParkingAngle2 = approachDrivewayParkingAngle2
        closestTo90ApproachDrivewayParkingAngle2Index = i;
      }


      // Chcking that the parking stalls are not that far from the driveway. 

      if (distanceParking1ToDriveway < closestDistanceParking1ToDriveway && distanceParking1ToDriveway > 150) {
        closestDistanceParking1ToDriveway = distanceParking1ToDriveway
        closestDistanceParking1ToDrivewayIndex = i;
      }
      else if (distanceParking1ToDriveway < 150 && distanceParking1ToDriveway > closestDistanceParking1ToDriveway) {
        closestDistanceParking1ToDriveway = distanceParking1ToDriveway
        closestDistanceParking1ToDrivewayIndex = i;
      }



      if (distanceParking2ToDriveway < closestDistanceParking2ToDriveway && distanceParking2ToDriveway > 150) {
        closestDistanceParking2ToDriveway = distanceParking2ToDriveway
        closestDistanceParking2ToDrivewayIndex = i;
      }
      else if (distanceParking2ToDriveway > closestDistanceParking2ToDriveway && distanceParking2ToDriveway < 150) {
        closestDistanceParking2ToDriveway = distanceParking2ToDriveway
        closestDistanceParking2ToDrivewayIndex = i;
      }
    }




    for (let vertex in this.graph["adjacencyList"]) {
      if (vertex === "Parking1") {
        // Calculate the averate of the best answers
        const indices = [
          closestTo180ParkingAngleIndex,
          closestTo90ApproachDrivewayParkingAngleIndex,
          closestDistanceParking1ToDrivewayIndex
        ];
        const weights = [0.3, 0.3, 0.4];
        const weightedPoint = calculateWeightedPoint(possiblePoints, indices, vertex, weights);

        dimensions[vertex].x = weightedPoint.x
        dimensions[vertex].y = weightedPoint.y

        dimensions[vertex].normalParkingSpots = possibleDimensions[currentMaxParkingIndex][vertex].normalParkingSpots

        
      }
      if (vertex === "Parking2") {

        const indices = [
          closestTo180ParkingAngleIndex,
          closestTo90ApproachDrivewayParkingAngle2Index,
          closestDistanceParking2ToDrivewayIndex
        ];
        const weights = [0.3, 0.3, 0.4];
        const weightedPoint = calculateWeightedPoint(possiblePoints, indices, vertex, weights);
        dimensions[vertex].x = weightedPoint.x
        dimensions[vertex].y = weightedPoint.y

        dimensions[vertex].normalParkingSpots = possibleDimensions[currentMaxParking2Index][vertex].normalParkingSpots

      }

      if (vertex === "Driveway") {
        const indices = [
          closestTo180ParkingAngleIndex,
          closestTo180DrivewayAngleIndex
        ];
        const weights = [0.4, 0.6];
        const weightedPoint = calculateWeightedPoint(possiblePoints, indices, vertex, weights);

        dimensions[vertex].x = weightedPoint.x
        dimensions[vertex].y = weightedPoint.y
      }

      if (vertex === "Garbage") {
        const indices = [
          closestTo180DrivewayAngleIndex
        ];
        const weights = [1];
        const weightedPoint = calculateWeightedPoint(possiblePoints, indices, vertex, weights);

        dimensions[vertex].x = weightedPoint.x
        dimensions[vertex].y = weightedPoint.y

      }

      if (vertex === "Approach") {

      }


      else {

      }
    }






    if (this.iteration % 200 === 0) {
      // console.log(` closestTo90ApproachDrivewayParkingAngle2`, polyPointsOffset)
    }



  }


  visualize(p: any): void {
    const vertices = Object.keys(this.graph["adjacencyList"]) as SitePlanObjects[] ;

    const dimensions: Dimensions = {
      Parking1: {
        x: 0,
        y: 0,
        normalParkingSpots: 0,
        angle: 0,
        dragging: false,
        width: 20, height: 20,
      },

      Parking2: {
        x: 0,
        y: 0,
        normalParkingSpots: 0,
        angle: 0,
        dragging: false,
        width: 20, height: 20,
      },

      Driveway: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,


      },
      "Bike Parking": {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,

      },
      Approach: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,

      },
      Garbage: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,

      },
      Building: {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        rotation: 0,
        dragging: false,
        angle: 0,
      },
    };

    // compactParkingSpots: 1,
    // handicappedParkingSpots: 0,
    // isShown: 1,





    // Assign random positions to vertices
    vertices.forEach((vertex) => {

      if (vertex === "Approach") {
        dimensions[vertex] = {
          ...dimensions[vertex],
          x: p.width / 2,
          y: p.height - 40
        };
      }
      else {
        dimensions[vertex] = {
          ...dimensions[vertex],
          x: getRandomNumber(100, p.width - 100),
          y: getRandomNumber(100, p.height - 100)
        };
      }

      dimensions[vertex as SitePlanObjects].dragging = false;
    });


    p.mousePressed = () => {
      vertices.forEach((vertex) => {
        const d = p.dist(p.mouseX, p.mouseY, dimensions[vertex].x, dimensions[vertex].y);
        if (d < 20) {

          console.log(`true`, true)
          dimensions[vertex].dragging = true;
        }
      });
    };

    p.mouseReleased = () => {
      vertices.forEach((vertex) => {
        dimensions[vertex].dragging = false;
      });
    };

    p.draw = () => {

      this.solver(p,  dimensions)


      p.background(240);
      p.stroke(0);
      // Update dimensions if dragging
      vertices.forEach((vertex) => {
        if (dimensions[vertex].dragging) {
          dimensions[vertex].x = p.mouseX;
          dimensions[vertex].y = p.mouseY;
        }
      });

      // Draw edges
      for (let vertex in this.graph["adjacencyList"]) {
        this.graph["adjacencyList"][vertex].forEach((adjacent: string) => {
          p.line(
            dimensions[vertex as SitePlanObjects].x,
            dimensions[vertex as SitePlanObjects].y,
            dimensions[adjacent as SitePlanObjects].x,
            dimensions[adjacent as SitePlanObjects].y
          );
        });
      }

      // Draw vertices
      p.fill(255);
      p.stroke(0);
      p.strokeWeight(2);

      vertices.forEach((vertex) => {


        p.fill(255, 0, 0); // Text color red

        p.ellipse(dimensions[vertex].x,dimensions[vertex].y,dimensions[vertex].width,dimensions[vertex].height);

 


        // console.log(`dimensions[vertex].normalParkingSpots`, dimensions["Parking1"].normalParkingSpots)
        if (vertex === "Parking1" || vertex === "Parking2") {
          p.stroke(0);
          p.fill(30, 200, 45);
          for (let i = 0; i < (dimensions[vertex].normalParkingSpots || 0); i++) {
            const tempPoint = {
              x: dimensions[vertex].x,
              y: dimensions[vertex].y + i * 80

            }
            const rectCorners = getRectangleCorners(
              tempPoint,
              190,
              80
            )

            p.beginShape();
            p.vertex(rectCorners[0].x, rectCorners[0].y);
            p.vertex(rectCorners[1].x, rectCorners[1].y);

            p.vertex(rectCorners[2].x, rectCorners[2].y);

            p.vertex(rectCorners[3].x, rectCorners[3].y);
            p.endShape(p.CLOSE);
          }
        }


        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(0);
        p.textSize(18);
        p.text(vertex, dimensions[vertex].x, dimensions[vertex].y);
      });



      this.iteration++;
    };
  }
}


function arrayOfRandomNudges(nudgeStrength: number, numberOfRandomNumbers: number) {
  const arr = new Array(numberOfRandomNumbers).fill(0)
  return arr.map(() => Math.random() * nudgeStrength * 2 - nudgeStrength)
}

function calculateAngle(p1: Point, p2: Point, p3: Point): number {
  // Calculate vectors
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  // Calculate the dot product
  const dotProduct = v1.x * v2.x + v1.y * v2.y;

  // Calculate the magnitudes of the vectors
  const magnitudeV1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const magnitudeV2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  // Calculate the cosine of the angle
  const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);

  // Handle potential floating-point errors (e.g., rounding errors that push cosTheta slightly out of [-1, 1])
  const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));

  // Calculate the angle in radians and convert to degrees
  const angleInRadians = Math.acos(clampedCosTheta);
  const angleInDegrees = angleInRadians * (180 / Math.PI);

  return angleInDegrees;
}

function calculateDistanceBetweenPoints(p1: Point, p2: Point) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}


function checkIfInBoundry(p1: Point, bWidth: number, bHeight: number, offset = 0) {
  return p1.x > 0 + offset && p1.x < bWidth - offset && p1.y > 0 + offset && p1.y < bHeight - offset;
}


function checkIfInBoundryWidth(p1: Point, bWidth: number, offset = 0) {
  return p1.x > 0 + offset && p1.x < bWidth - offset;
}

function checkIfInBoundryHeight(p1: Point, bHeight: number, offset = 0) {
  return p1.y > 0 + offset && p1.y < bHeight - offset;
}



function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



function arePointsWithinBoundary(point1: Point, point2: Point, boundary: number): boolean {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y) <= boundary;
}


function calculateWeightedPoint(
  possiblePoints: { [key: string]: Point }[],
  indices: number[],
  vertex: string,
  weights: number[]
): Point {
  if (indices.length !== weights.length) {
    throw new Error("Indices and weights arrays must have the same length.");
  }

  let weightedX = 0;
  let weightedY = 0;

  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const weight = weights[i];
    const point = possiblePoints[index][vertex];

    weightedX += point.x * weight;
    weightedY += point.y * weight;
  }

  return { x: weightedX, y: weightedY };
}



const calculateArea = (polygon: Point[]): number => {
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(total / 2);
};



function getBoundingBox(polygon: Point[]): { width: number, height: number } {
  if (polygon.length === 0) {
    throw new Error("Polygon must have at least one point.");
  }

  // Initialize min and max values
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  // Iterate through each point to find min and max coordinates
  for (const point of polygon) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  // Calculate width and height
  const width = maxX - minX;
  const height = maxY - minY;

  return { width, height };
}


function isRectangleWithinBoundary(
  center: Point,
  width: number,
  height: number,
  boundary: Point[]
): boolean {
  // Calculate the corners of the rectangle
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const rectangleCorners: Point[] = [
    { x: center.x - halfWidth, y: center.y - halfHeight }, // Bottom-left
    { x: center.x + halfWidth, y: center.y - halfHeight }, // Bottom-right
    { x: center.x + halfWidth, y: center.y + halfHeight }, // Top-right
    { x: center.x - halfWidth, y: center.y + halfHeight }  // Top-left
  ];

  // Check if all corners are inside the boundary
  return rectangleCorners.every(corner => isPointInsidePolygon(corner, boundary));
}


function getRectangleCorners(
  center: Point,
  width: number,
  height: number
): Point[] {
  // Calculate the corners of the rectangle
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const rectangleCorners: Point[] = [
    { x: center.x - halfWidth, y: center.y - halfHeight }, // Bottom-left
    { x: center.x + halfWidth, y: center.y - halfHeight }, // Bottom-right
    { x: center.x + halfWidth, y: center.y + halfHeight }, // Top-right
    { x: center.x - halfWidth, y: center.y + halfHeight }  // Top-left
  ];

  // Check if all corners are inside the boundary
  return rectangleCorners;
}


function isPointInsidePolygon(point: Point, polygon: Point[]): boolean {
  let intersectCount = 0;

  for (let i = 0; i < polygon.length; i++) {
    const vertex1 = polygon[i];
    const vertex2 = polygon[(i + 1) % polygon.length];

    // Check for ray intersection with polygon edge
    if (
      (point.y > Math.min(vertex1.y, vertex2.y) &&
        point.y <= Math.max(vertex1.y, vertex2.y) &&
        point.x <= Math.max(vertex1.x, vertex2.x)) &&
      vertex1.y !== vertex2.y
    ) {
      const xinters =
        (point.y - vertex1.y) * (vertex2.x - vertex1.x) /
        (vertex2.y - vertex1.y) + vertex1.x;

      if (xinters > point.x) {
        intersectCount++;
      }
    }
  }

  // Odd intersections mean the point is inside
  return intersectCount % 2 !== 0;
}

