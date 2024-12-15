import { AdjacencyGraph } from "./AdjacencyGraph";
import classifyPoint from "robust-point-in-polygon"

type TPointObject = { x: number, y: number };
type Point = [number, number]
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


    const vertices = Object.keys(this.graph["adjacencyList"]) as SitePlanObjects[];

    const numParkingSpots = 10;
    const buildingSQFT = 5000;


    const possibleDimensions: Dimensions[] = [];
    const numChildren = 10;





    // Step 1: Untangle nodes
    // Step 2: Prevent any overlapping Areas.




    // Initialize the potential children
    for (let i = 0; i < numChildren; i++) {
      possibleDimensions.push(JSON.parse(JSON.stringify(dimensions)));
    }

    const nudgeStrength = 2;
    const nudgeStrengthDimensions = 1;
    const parkingNudge = [-1, 0, 1];
    const angleNudge = 2;

    const boundary = [
      { x: 40, y: 40 },
      { x: p.width - 40, y: 40 },
      { x: p.width - 40, y: p.height - 40 },
      { x: 40, y: p.height }
    ];


    const getRandomElement = (items: number[]) => items[Math.floor(Math.random() * items.length)];
    // create a new variation of each child. Let the first child be an exact clone of the parent
    for (let i = 1; i < numChildren; i++) {

      const randomNudge = arrayOfRandomNudges(nudgeStrengthDimensions, 8);
      const randomAnglesNudge = arrayOfRandomNudges(angleNudge, vertices.length);


      vertices.forEach((vertex: SitePlanObjects, index: number) => {
        const randomNudgePosition = arrayOfRandomNudges(nudgeStrength, 2)
        const newPoint = { x: possibleDimensions[i][vertex].x + randomNudgePosition[0], y: possibleDimensions[i][vertex].y + randomNudgePosition[1] };

        // if (checkIfInBoundryWidth(newPoint, p.width, 40)) {
        possibleDimensions[i][vertex].x = newPoint.x
        // if (checkIfInBoundryHeight(newPoint, p.height, 40)) {
        possibleDimensions[i][vertex].y = newPoint.y;

        possibleDimensions[i][vertex].angle = possibleDimensions[i][vertex].angle + randomAnglesNudge[index];

        // }
      })


      const newApproach = {
        width: possibleDimensions[i]["Approach"].width + randomNudge[0],
        height: possibleDimensions[i]["Approach"].height + randomNudge[1],
      }
      const newDriveway = {
        width: possibleDimensions[i]["Driveway"].width + randomNudge[0],
        height: possibleDimensions[i]["Driveway"].height + randomNudge[1],
      }
      const newParking1 = {
        normalParkingSpots: (possibleDimensions[i]["Parking1"].normalParkingSpots || 0) + getRandomElement(parkingNudge),
      }
      const newParking2 = {
        normalParkingSpots: (possibleDimensions[i]["Parking2"].normalParkingSpots || 0) + getRandomElement(parkingNudge),
      }

      const newParking1Dimensions = {
        width: 190,
        height: 80 * newParking1.normalParkingSpots,
      }

      const newParking2Dimensions = {
        width: 190,
        height: 80 * newParking2.normalParkingSpots,
      }

      if (isRectangleWithinBoundary(possibleDimensions[i]["Approach"], newApproach.width, newApproach.height, boundary, possibleDimensions[i]["Approach"].angle)) {
        possibleDimensions[i]["Approach"] = { ...possibleDimensions[i]["Approach"], ...newApproach }
      }
      if (isRectangleWithinBoundary(possibleDimensions[i]["Driveway"], newDriveway.width, newDriveway.height, boundary, possibleDimensions[i]["Driveway"].angle)) {
        possibleDimensions[i]["Driveway"] = { ...possibleDimensions[i]["Driveway"], ...newDriveway }
      }

      possibleDimensions[i]["Parking1"] = { ...possibleDimensions[i]["Parking1"], ...newParking1, ...newParking1Dimensions }


      possibleDimensions[i]["Parking2"] = { ...possibleDimensions[i]["Parking2"], ...newParking2, ...newParking2Dimensions }

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

      const p1 = possibleDimensions[i]["Parking1"];
      const p2 = possibleDimensions[i]["Parking2"];
      const driveway = possibleDimensions[i]["Driveway"];
      const garbage = possibleDimensions[i]["Garbage"]
      const approach = possibleDimensions[i]["Approach"]



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

      const polygon1 = getRectangleCorners(
        { x: dimensions["Parking1"].x, y: dimensions["Parking1"].y },
        dimensions["Parking1"].width,
        dimensions["Parking1"].height,
        dimensions["Parking1"].angle
      )

      const polygon2 = getRectangleCorners(
        { x: dimensions["Parking2"].x, y: dimensions["Parking2"].y },
        dimensions["Parking2"].width,
        dimensions["Parking2"].height,
        dimensions["Parking1"].angle
      )


      // console.log({polygon2, polygon1})

      const minDistance = getMinimumPolygonDistance(polygon1, polygon2)

      if
        (Math.abs((parkingSpots || 0) - numParkingSpots) < Math.abs(currentMaxParking - numParkingSpots) &&
        currentMaxParking + currentMaxParking2 <= numParkingSpots &&
        isRectangleWithinBoundary(possibleDimensions[i]["Parking1"], possibleDimensions[i]["Parking1"].width, possibleDimensions[i]["Parking1"].height, boundary, possibleDimensions[i]["Parking1"].angle)
      ) {
        currentMaxParking = parkingSpots
        currentMaxParkingIndex = i;
      }

      if (Math.abs((parkingSpots2 || 0) - numParkingSpots) < Math.abs(currentMaxParking2 - numParkingSpots) &&
        currentMaxParking + currentMaxParking2 <= numParkingSpots &&
        isRectangleWithinBoundary(possibleDimensions[i]["Parking2"], possibleDimensions[i]["Parking2"].width, possibleDimensions[i]["Parking2"].height, boundary, possibleDimensions[i]["Parking2"].angle)
      ) {
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

      if (distanceParking1ToDriveway < closestDistanceParking1ToDriveway && minDistance > 240) {
        closestDistanceParking1ToDriveway = distanceParking1ToDriveway
        closestDistanceParking1ToDrivewayIndex = i;
      }
      else if (minDistance < 240 && distanceParking1ToDriveway > closestDistanceParking1ToDriveway) {
        closestDistanceParking1ToDriveway = distanceParking1ToDriveway
        closestDistanceParking1ToDrivewayIndex = i;
      }



      if (distanceParking2ToDriveway < closestDistanceParking2ToDriveway && minDistance > 240) {
        closestDistanceParking2ToDriveway = distanceParking2ToDriveway
        closestDistanceParking2ToDrivewayIndex = i;
      }
      else if (distanceParking2ToDriveway > closestDistanceParking2ToDriveway && minDistance < 240) {
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
        const weightedPoint = calculateWeightedPoint(possibleDimensions, indices, vertex, weights);

        dimensions[vertex].x = weightedPoint.x
        dimensions[vertex].y = weightedPoint.y

        dimensions[vertex].angle = possibleDimensions[closestTo180ParkingAngleIndex][vertex].angle;
        // dimensions[vertex].normalParkingSpots = possibleDimensions[currentMaxParkingIndex][vertex].normalParkingSpots
        // dimensions[vertex].height = (possibleDimensions[currentMaxParkingIndex][vertex].normalParkingSpots || 0) * 90



      }
      if (vertex === "Parking2") {

        const indices = [
          closestTo180ParkingAngleIndex,
          closestTo90ApproachDrivewayParkingAngle2Index,
          closestDistanceParking2ToDrivewayIndex
        ];
        const weights = [0.3, 0.3, 0.4];
        const weightedPoint = calculateWeightedPoint(possibleDimensions, indices, vertex, weights);
        dimensions[vertex].x = weightedPoint.x
        dimensions[vertex].y = weightedPoint.y

        dimensions[vertex].angle = possibleDimensions[closestTo180ParkingAngleIndex][vertex].angle;
        // dimensions[vertex].normalParkingSpots = possibleDimensions[currentMaxParking2Index][vertex].normalParkingSpots
        // dimensions[vertex].height = (possibleDimensions[currentMaxParkingIndex][vertex].normalParkingSpots || 0) * 90

      }

      if (vertex === "Driveway") {
        const indices = [
          closestTo180ParkingAngleIndex,
          closestTo180DrivewayAngleIndex
        ];
        const weights = [0.4, 0.6];
        const weightedPoint = calculateWeightedPoint(possibleDimensions, indices, vertex, weights);

        dimensions[vertex].x = weightedPoint.x
        dimensions[vertex].y = weightedPoint.y

        dimensions[vertex].angle = possibleDimensions[closestTo180ParkingAngleIndex][vertex].angle;
        if (dimensions[vertex].width < 240) {
          // dimensions[vertex].width += 1
        }








        // console.log(`object`,boundingBox)
      }

      if (vertex === "Garbage") {
        const indices = [
          closestTo180DrivewayAngleIndex
        ];
        const weights = [1];
        const weightedPoint = calculateWeightedPoint(possibleDimensions, indices, vertex, weights);

        dimensions[vertex].x = weightedPoint.x
        dimensions[vertex].y = weightedPoint.y
        // dimensions[vertex].angle =  possibleDimensions[currentMaxParkingIndex][vertex].angle;

        // if (dimensions[vertex].width < 50) {
        //   dimensions[vertex].width += 1
        // }
        // if (dimensions[vertex].height < 50) {
        //   dimensions[vertex].height += 1
        // }


      }

      if (vertex === "Approach") {
        if (dimensions[vertex].width < 200) {
          // dimensions[vertex].width += 1

        }
      }


      else {

      }
    }






    if (this.iteration % 200 === 0) {

      console.log(`dimensions["Parking1"].angle`, dimensions["Parking1"].angle)
      // console.log(` closestTo90ApproachDrivewayParkingAngle2`, polyPointsOffset)
    }



  }


  visualize(p: any): void {
    const vertices = Object.keys(this.graph["adjacencyList"]) as SitePlanObjects[];

    const boundary = [
      { x: 40, y: 40 },
      { x: p.width - 40, y: 40 },
      { x: p.width - 40, y: p.height - 40 },
      { x: 40, y: p.height }
    ];



    const dimensions: Dimensions = {
      Parking1: {
        x: 0,
        y: 0,
        normalParkingSpots: 0,
        angle: 0,
        dragging: false,
        width: 190, height: 80,
      },

      Parking2: {
        x: 0,
        y: 0,
        normalParkingSpots: 0,
        angle: 0,
        dragging: false,
        width: 30, height: 30,
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

      // Prevent all new points and rectangles from overlapping eachother
      if (vertex === "Approach") {
        dimensions[vertex] = {
          ...dimensions[vertex],
          x: p.width / 2,
          y: p.height - 10
        };
      }
      else {
        let count = 0;
        let searchingForSafePoint = true;
        while (searchingForSafePoint) {



          // Picks a random point in the canvase
          const newPoint = {
            x: getRandomNumber(100, p.width - 100),
            y: getRandomNumber(100, p.height - 100)
          };

          if (checkNoOverlap(p, dimensions, vertex, newPoint, vertices)) {

            searchingForSafePoint = false;
            dimensions[vertex] = {
              ...dimensions[vertex],
              ...newPoint
            };
          }
          count++

          if (count > 10) {
            searchingForSafePoint = false;
          }
        }
      }

      dimensions[vertex as SitePlanObjects].dragging = false;
    });


    p.mousePressed = () => {
      vertices.forEach((vertex) => {
        const d = p.dist(p.mouseX, p.mouseY, dimensions[vertex].x, dimensions[vertex].y);
        if (d < 20) {

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

      // this.solver(p, dimensions)


      p.background(240);
      p.stroke(0);
      // Update dimensions if dragging
      vertices.forEach((vertex) => {
        if (dimensions[vertex].dragging) {

          // TODO: Speed this up by checking the distance to the closest polygon instead.
          const newPoint = { x: p.mouseX, y: p.mouseY };
          if (checkNoOverlap(p, dimensions, vertex, newPoint, vertices)) {
            dimensions[vertex].x = p.mouseX;
            dimensions[vertex].y = p.mouseY;
          }

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

        const angle = dimensions[vertex].angle || 0;

        p.stroke(0);
        p.fill(30, 200, 45);

        p.rectMode(p.CENTER)

        p.push();
        // Translate to the rectangle's center
        p.translate(dimensions[vertex].x, dimensions[vertex].y);

        // Rotate by the angle (convert to radians)
        p.rotate(p.radians(angle));

        // Draw the rectangle at the origin (center already translated)

        p.rect(0, 0, dimensions[vertex].width, dimensions[vertex].height);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(0);
        p.textSize(18);
        p.text(vertex, 0, 0);


        p.pop(); // Restore the previous drawing state

      });



      this.iteration++;
    };
  }
}


function arrayOfRandomNudges(nudgeStrength: number, numberOfRandomNumbers: number) {
  const arr = new Array(numberOfRandomNumbers).fill(0)
  return arr.map(() => Math.random() * nudgeStrength * 2 - nudgeStrength)
}

function calculateAngle(p1: TPointObject, p2: TPointObject, p3: TPointObject): number {
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

function calculateDistanceBetweenPoints(p1: TPointObject, p2: TPointObject) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function checkIfInBoundry(p1: TPointObject, bWidth: number, bHeight: number, offset = 0) {
  return p1.x > 0 + offset && p1.x < bWidth - offset && p1.y > 0 + offset && p1.y < bHeight - offset;
}

function checkIfInBoundryWidth(p1: TPointObject, bWidth: number, offset = 0) {
  return p1.x > 0 + offset && p1.x < bWidth - offset;
}

function checkIfInBoundryHeight(p1: TPointObject, bHeight: number, offset = 0) {
  return p1.y > 0 + offset && p1.y < bHeight - offset;
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function arePointsWithinBoundary(point1: TPointObject, point2: TPointObject, boundary: number): boolean {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y) <= boundary;
}


function calculateWeightedPoint(
  possibleDimensions: { [key: string]: TPointObject }[],
  indices: number[],
  vertex: string,
  weights: number[]
): TPointObject {
  if (indices.length !== weights.length) {
    throw new Error("Indices and weights arrays must have the same length.");
  }

  let weightedX = 0;
  let weightedY = 0;

  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const weight = weights[i];
    const point = possibleDimensions[index][vertex];

    weightedX += point.x * weight;
    weightedY += point.y * weight;
  }

  return { x: weightedX, y: weightedY };
}



const calculateArea = (polygon: TPointObject[]): number => {
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(total / 2);
};



function getBoundingBox(polygon: TPointObject[]): { width: number, height: number } {
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
  center: TPointObject,
  width: number,
  height: number,
  boundary: TPointObject[],
  angle: number
): boolean {

  const rectangleCorners = getRectangleCorners(center, width, height, angle)

  // Check if all corners are inside the boundary
  return rectangleCorners.every(corner => isPointInsidePolygon(corner, boundary));
}


function getRectangleCorners(
  center: TPointObject,
  width: number,
  height: number,
  angle: number
): TPointObject[] {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Calculate the corners of the rectangle relative to its center
  const rectangleCorners: TPointObject[] = [
    { x: -halfWidth, y: -halfHeight }, // Bottom-left
    { x: halfWidth, y: -halfHeight },  // Bottom-right
    { x: halfWidth, y: halfHeight },   // Top-right
    { x: -halfWidth, y: halfHeight },  // Top-left
  ];

  // Convert the angle to radians
  const angleRad = (angle * Math.PI) / 180;

  // Rotate and translate each corner
  const rotatedCorners = rectangleCorners.map((corner) => {
    const rotatedX =
      corner.x * Math.cos(angleRad) - corner.y * Math.sin(angleRad);
    const rotatedY =
      corner.x * Math.sin(angleRad) + corner.y * Math.cos(angleRad);

    // Translate back to the rectangle's center
    return {
      x: rotatedX + center.x,
      y: rotatedY + center.y,
    };
  });

  return rotatedCorners;
}


function isPointInsidePolygon(point: TPointObject, polygon: TPointObject[]): boolean {
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




function calculateDistance(p1: TPointObject, p2: TPointObject): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function pointToEdgeDistance(point: TPointObject, edgeStart: TPointObject, edgeEnd: TPointObject): number {
  const edgeLengthSquared = calculateDistance(edgeStart, edgeEnd) ** 2;
  if (edgeLengthSquared === 0) {
    return calculateDistance(point, edgeStart); // The edge is a single point
  }

  // Projection of the point onto the edge (normalized t)
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - edgeStart.x) * (edgeEnd.x - edgeStart.x) +
        (point.y - edgeStart.y) * (edgeEnd.y - edgeStart.y)) /
      edgeLengthSquared
    )
  );

  // Closest point on the edge
  const projection = {
    x: edgeStart.x + t * (edgeEnd.x - edgeStart.x),
    y: edgeStart.y + t * (edgeEnd.y - edgeStart.y),
  };

  return calculateDistance(point, projection);
}

function getMinimumPolygonDistance(polygon1: TPointObject[], polygon2: TPointObject[]): number {
  let minDistance = Infinity;

  // Check distances from each vertex in polygon1 to every edge in polygon2
  for (const point1 of polygon1) {
    for (let i = 0; i < polygon2.length; i++) {
      const edgeStart = polygon2[i];
      const edgeEnd = polygon2[(i + 1) % polygon2.length];
      const distance = pointToEdgeDistance(point1, edgeStart, edgeEnd);
      minDistance = Math.min(minDistance, distance);
    }
  }

  // Check distances from each vertex in polygon2 to every edge in polygon1
  for (const point2 of polygon2) {
    for (let i = 0; i < polygon1.length; i++) {
      const edgeStart = polygon1[i];
      const edgeEnd = polygon1[(i + 1) % polygon1.length];
      const distance = pointToEdgeDistance(point2, edgeStart, edgeEnd);
      minDistance = Math.min(minDistance, distance);
    }
  }

  return minDistance;
}


let truthChecker = (arr: boolean[]) => arr.every(v => v === true);





function checkNoOverlap(p: any, dimensions: Dimensions, vertex: SitePlanObjects, newPoint: TPointObject, vertices: SitePlanObjects[]) {



  // Gets the points of the rectangle that the new point creates
  const rectCorners = getRectangleCorners(newPoint,
    dimensions[vertex].width,
    dimensions[vertex].height,
    dimensions[vertex].angle)


  // COULD BE A PROBLEM WHERE THE POINTS ARE DOING A ZIG ZAG.
  const rectCorners1AsPoints = [
    [rectCorners[0].x, rectCorners[0].y],
    [rectCorners[1].x, rectCorners[1].y],
    [rectCorners[2].x, rectCorners[2].y],
    [rectCorners[3].x, rectCorners[3].y]
  ]

  //  go through all the site plan objects to see if the new rectangle intersects with any existing object.


  // This is checking if rectangle's points are in all the other polygons, BUT we need to check if 
  // any of their points are this rectangle.


  const everyObjectCheck = vertices.map((vertex2) => {
    // Skip the current vertex
    if (vertex !== vertex2) {

      // Get the corner points of another object.
      const rectCorners2 = getRectangleCorners(
        dimensions[vertex2],
        dimensions[vertex2].width,
        dimensions[vertex2].height,
        dimensions[vertex2].angle)

      const rectCorners2AsPoints = [
        [rectCorners2[0].x, rectCorners2[0].y],
        [rectCorners2[1].x, rectCorners2[1].y],
        [rectCorners2[2].x, rectCorners2[2].y],
        [rectCorners2[3].x, rectCorners2[3].y]
      ]


      const allPointsOutOfPolygon = rectCorners.map(corner => {

        const point = [corner.x, corner.y];
        const pointClassification = classifyPoint(rectCorners2AsPoints as Point[], point as Point)
        // 1 = outside
        // 0 = on the border
        // -1 = inside
        return pointClassification === 1
      })

      return truthChecker(allPointsOutOfPolygon)
    }
    else {
      return true;
    }
  })


  const everyObjectCheck2 = vertices.map((vertex2) => {
    // Skip the current vertex
    if (vertex !== vertex2) {

      // Get the corner points of another object.
      const rectCorners2 = getRectangleCorners(
        dimensions[vertex2],
        dimensions[vertex2].width,
        dimensions[vertex2].height,
        dimensions[vertex2].angle)




      const allPointsOutOfPolygon = rectCorners2.map(corner => {

        const point = [corner.x, corner.y];
        const pointClassification = classifyPoint(rectCorners1AsPoints as Point[], point as Point)
        // 1 = outside
        // 0 = on the border
        // -1 = inside
        return pointClassification === 1
      })

      return truthChecker(allPointsOutOfPolygon)
    }
    else {
      return true;
    }
  })



  const allRectPointsInBoundary = rectCorners1AsPoints.map((point) =>
    classifyPoint(
      [
        [40, 40],
        [p.width - 40, 40],
        [p.width - 40, p.height - 40],
        [40, p.height - 40]] as Point[],

      point as Point
    ) === -1
  )

  if (truthChecker(everyObjectCheck) && truthChecker(allRectPointsInBoundary) &&  truthChecker(everyObjectCheck2)) {
    return true
  }

}