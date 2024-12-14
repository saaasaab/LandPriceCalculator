import { AdjacencyGraph } from "./AdjacencyGraph";


type Point = { x: number, y: number };
type Positions = Record<string, Point>
// Visualization module using p5.js
export class AdjacencyGraphVisualizer {
  private graph: AdjacencyGraph;
  private iteration: number;


  constructor(graph: AdjacencyGraph) {
    this.graph = graph;
    this.iteration = 0;

  }

  solver(p: any, positions: Positions, polyPointsOffset: Record<string, Point[]>): void {
    // const vertices = Object.keys(this.graph["adjacencyList"]);


    const possiblePoints: Positions[] = [];

    const possibleOffsets: Record<string, Point[]>[] = [];
    const numChildren = 10;
    const nudgeStrength = 2;


    // Initialize the potential children
    for (let i = 0; i < numChildren; i++) {
      possiblePoints.push(JSON.parse(JSON.stringify(positions)));
    }
    for (let i = 0; i < numChildren; i++) {
      possibleOffsets.push(JSON.parse(JSON.stringify(polyPointsOffset)));
    }

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



    // create a new variation of each poly point offset. Let the first child be an exact clone of the parent
    for (let i = 1; i < numChildren; i++) {
      for (let vertex in this.graph["adjacencyList"]) {
        for (let offset = 0; offset < possibleOffsets[i][vertex].length; offset++) {
          const randomNudge = arrayOfRandomNudges(nudgeStrength, 2)
          const newOffset = {
            x: possibleOffsets[i][vertex][offset].x + randomNudge[0],
            y: possibleOffsets[i][vertex][offset].y + randomNudge[1]
          };

          const newPoint = {
            x: possiblePoints[i][vertex].x + newOffset.x,
            y: possiblePoints[i][vertex].y + newOffset.y
          }

          // console.log(`newOffset`, newOffset)

          if (checkIfInBoundryWidth(newPoint, p.width, 40)) {
            possibleOffsets[i][vertex][offset].x = newOffset.x
          }
          if (checkIfInBoundryHeight(newPoint, p.height, 40)) {
            possibleOffsets[i][vertex][offset].y = newOffset.y
          }
        }
      }
    }




    // Calculate the base angles, areas, distances, and scores

    let closestTo180ParkingAngle = calculateAngle(positions["Parking1"], positions["Driveway"], positions["Parking2"])
    let closestTo180ParkingAngleIndex = 0;

    let closestTo180DrivewayAngle = calculateAngle(positions["Approach"], positions["Driveway"], positions["Garbage"])
    let closestTo180DrivewayAngleIndex = 0;

    let closestTo90ApproachDrivewayParkingAngle = calculateAngle(positions["Approach"], positions["Driveway"], positions["Parking1"])
    let closestTo90ApproachDrivewayParkingAngle2 = calculateAngle(positions["Approach"], positions["Driveway"], positions["Parking2"])

    let closestTo90ApproachDrivewayParkingAngleIndex = 0;
    let closestTo90ApproachDrivewayParkingAngle2Index = 0;


    let closestDistanceParking1ToDriveway = calculateDistanceBetweenPoints(positions["Parking1"], positions["Driveway"]);
    let closestDistanceParking2ToDriveway = calculateDistanceBetweenPoints(positions["Parking2"], positions["Driveway"]);
    let closestDistanceParking1ToDrivewayIndex = 0;
    let closestDistanceParking2ToDrivewayIndex = 0;



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

        positions[vertex].x = weightedPoint.x
        positions[vertex].y = weightedPoint.y
      }
      if (vertex === "Parking2") {

        const indices = [
          closestTo180ParkingAngleIndex,
          closestTo90ApproachDrivewayParkingAngle2Index,
          closestDistanceParking2ToDrivewayIndex
        ];
        const weights = [0.3, 0.3, 0.4];
        const weightedPoint = calculateWeightedPoint(possiblePoints, indices, vertex, weights);
        positions[vertex].x = weightedPoint.x
        positions[vertex].y = weightedPoint.y
      }

      if (vertex === "Driveway") {
        const indices = [
          closestTo180ParkingAngleIndex,
          closestTo180DrivewayAngleIndex
        ];
        const weights = [0.4, 0.6];
        const weightedPoint = calculateWeightedPoint(possiblePoints, indices, vertex, weights);

        positions[vertex].x = weightedPoint.x
        positions[vertex].y = weightedPoint.y
      }

      if (vertex === "Garbage") {
        const indices = [
          closestTo180DrivewayAngleIndex
        ];
        const weights = [1];
        const weightedPoint = calculateWeightedPoint(possiblePoints, indices, vertex, weights);

        positions[vertex].x = weightedPoint.x
        positions[vertex].y = weightedPoint.y

      }

      if (vertex === "Approach") {

      }


      else {

      }
    }

    
    const drivewayDefault = possiblePoints[0]["Driveway"];
    const drivewayOffsetsDefault = possibleOffsets[0]["Driveway"];

    // console.log(`drivewayDefault `, drivewayDefault )
    const drivewayPolygonDefault = drivewayOffsetsDefault.map(offset => {
      return { x: drivewayDefault.x + offset.x, y: drivewayDefault.y + offset.y }
    })

    let drivewayAreaDefault = calculateArea(drivewayPolygonDefault);

    let largestDrivewayAreaIndex = 0;
    for (let i = 0; i < numChildren; i++) {
      // const approach = possiblePoints[i]["Approach"];
      const driveway = possiblePoints[i]["Driveway"];
      const drivewayOffsets = possibleOffsets[i]["Driveway"];


      const drivewayPolygon = drivewayOffsets.map(offset => {
        return { x: driveway.x + offset.x, y: driveway.y + offset.y }
      })

      // const drivewayWidth = calculateDistanceBetweenPoints()
      const drivewayArea = calculateArea(drivewayPolygon);


      if(drivewayArea < drivewayAreaDefault){
        largestDrivewayAreaIndex = i;
        drivewayAreaDefault = drivewayArea;
      }

      
      // Width of approach needs to be 24. Width needs to be inline with the approach and garbage

      
    }

    for (let vertex in this.graph["adjacencyList"]) {
      if (vertex === "Driveway") {
    
        console.log(`drivewayAreaDefault`, drivewayAreaDefault)
        polyPointsOffset[vertex][0].x = possibleOffsets[largestDrivewayAreaIndex]["Approach"][0].x;
        polyPointsOffset[vertex][1].x = possibleOffsets[largestDrivewayAreaIndex]["Approach"][1].x;
        polyPointsOffset[vertex][2].x = possibleOffsets[largestDrivewayAreaIndex]["Approach"][2].x;
        polyPointsOffset[vertex][3].x = possibleOffsets[largestDrivewayAreaIndex]["Approach"][3].x;

        polyPointsOffset[vertex][0].y = possibleOffsets[largestDrivewayAreaIndex]["Approach"][0].y;
        polyPointsOffset[vertex][1].y = possibleOffsets[largestDrivewayAreaIndex]["Approach"][1].y;
        polyPointsOffset[vertex][2].y = possibleOffsets[largestDrivewayAreaIndex]["Approach"][2].y;
        polyPointsOffset[vertex][3].y = possibleOffsets[largestDrivewayAreaIndex]["Approach"][3].y;


      }

    }

    if (this.iteration % 200 === 0) {
      // console.log(`area `, closestTo90ApproachDrivewayParkingAngle)
      console.log(` closestTo90ApproachDrivewayParkingAngle2`, polyPointsOffset)
    }

  }


  visualize(p: any): void {
    const vertices = Object.keys(this.graph["adjacencyList"]);
    const positions: Record<string, { x: number; y: number }> = {};
    const dragging: Record<string, boolean> = {};
    const polyPointsOffset: Record<string, { x: number; y: number }[]> = {};


    // Assign random positions to vertices
    vertices.forEach((vertex) => {

      if (vertex === "Approach") {
        positions[vertex] = {
          x: p.width / 2,
          y: p.height - 40
        };
      }
      else {
        positions[vertex] = {
          x: getRandomNumber(100, p.width - 100),
          y: getRandomNumber(100, p.height - 100)
        };
      }

      dragging[vertex] = false;
      polyPointsOffset[vertex] = [
        { x: 10, y: 10 },
        { x: -10, y: 10 },
        { x: -10, y: -10 },
        { x: 10, y: -10 }
      ];
    });


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

      this.solver(p, positions, polyPointsOffset)


      p.background(240);
      p.stroke(0);
      // Update positions if dragging
      vertices.forEach((vertex) => {
        if (dragging[vertex]) {
          positions[vertex].x = p.mouseX;
          positions[vertex].y = p.mouseY;
        }
      });

      // Draw edges
      for (let vertex in this.graph["adjacencyList"]) {
        this.graph["adjacencyList"][vertex].forEach((adjacent: string) => {
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


        p.beginShape();
        // p.ellipse(positions[vertex].x, positions[vertex].y, 20, 20);

        // Add vertices.
        p.vertex(positions[vertex].x + polyPointsOffset[vertex][0].x, positions[vertex].y + polyPointsOffset[vertex][0].y);
        p.vertex(positions[vertex].x + polyPointsOffset[vertex][1].x, positions[vertex].y + polyPointsOffset[vertex][1].y);
        p.vertex(positions[vertex].x + polyPointsOffset[vertex][2].x, positions[vertex].y + polyPointsOffset[vertex][2].y);
        p.vertex(positions[vertex].x + polyPointsOffset[vertex][3].x, positions[vertex].y + polyPointsOffset[vertex][3].y);

        // Stop drawing the shape.
        p.endShape(p.CLOSE);

        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(0);
        p.textSize(18);
        p.text(vertex, positions[vertex].x, positions[vertex].y);
      });



      this.iteration++;
    };
  }
}


function arrayOfRandomNudges(nudgeStrength: number, numberOfRandomNumbers: number) {
  const arr = new Array(numberOfRandomNumbers).fill(0)
  return arr.map(() => Math.random() * nudgeStrength * 2 - nudgeStrength)
}

// function calculateCollinearity(p1: Point, p2: Point, p3: Point): number {
//   // Use the area of the triangle formula: (1/2) * |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)|
//   const area = Math.abs(
//     p1.x * (p2.y - p3.y) +
//     p2.x * (p3.y - p1.y) +
//     p3.x * (p1.y - p2.y)
//   ) / 2;

//   return area; // Area will be 0 if the points are collinear
// }

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