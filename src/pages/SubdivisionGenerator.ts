import p5 from "p5";

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: p5.Vector;
  end: p5.Vector;
}

interface PolygonData {
  lines: Line[];
  approachLines: Line[];
}



// Visualization module using p5.js
export class SubdivisionGenerator {
  private iteration: number;


  constructor() {
    this.iteration = 0;
  }

  subdivide(p: p5): void {

    const polygonData: PolygonData = {
      lines: [
        {
          start: p.createVector(262, 141),
          end: p.createVector(233.99609375, 392),
        },
        {
          start: p.createVector(234, 392),
          end: p.createVector(680, 417),
        },
        {
          start: p.createVector(680, 417),
          end: p.createVector(685, 94),
        },
        {
          start: p.createVector(685, 94),
          end: p.createVector(262, 141),
        },
      ],
      approachLines: [
        {
          start: p.createVector(234, 392),
          end: p.createVector(680, 417),
        },
      ],
    };

    p.angleMode(p.DEGREES);





    p.mouseDragged = () => {

    };


    p.mousePressed = () => {

    };

    p.mouseReleased = () => {

    };

    p.draw = () => {
      p.background(240);

      // Draw the main polygon
      p.stroke(0);
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      polygonData.lines.forEach((line) => {
        p.vertex(line.start.x, line.start.y);
        p.vertex(line.end.x, line.end.y);
      });
      p.endShape(p.CLOSE);

      // Draw the approach line (road)
      let approach = polygonData.approachLines[0];
      let road = {
        start: getCenterPoint(approach.start, approach.end),
        end: p.createVector(p.width * 3 / 4, p.height * 1 / 4)
      }

      p.stroke(255, 0, 0);
      p.strokeWeight(4);
      p.line(approach.start.x, approach.start.y, approach.end.x, approach.end.y);

      p.stroke(200, 255, 0);
      p.line(road.start.x, road.start.y, road.end.x, road.end.y);


      // Divide the polygon into sub-polygons
      const subPolygons = dividePolygon(p, polygonData.lines, road);

      // Draw the sub-polygons
      p.stroke(0, 100, 255);
      p.strokeWeight(1);
      subPolygons.forEach((subPoly) => {
        p.beginShape();
        subPoly.forEach((pt) => {
          p.vertex(pt.x, pt.y);
        });
        p.endShape(p.CLOSE);
      });
    };
  }
}



const dividePolygon = (p: p5, lines: Line[], road: Line): Point[][] => {
  const subPolygons: Point[][] = [];
  const roadStart = road.start;
  const roadEnd = road.end;
  const roadLength = dist(roadStart.x, roadStart.y, roadEnd.x, roadEnd.y);
  const segmentLength = roadLength / 4;
  const roadAngle =  calculateAngle(p, roadStart,roadEnd)


  
  // console.log(`roadAngle`, roadAngle)



  const roadSegments: Line[] = [];
  for (let i = 0; i < 8; i++) {
    const t1 = i / 8;
    const t2 = (i + 1) / 8;
    const x1 = lerp(roadStart.x, roadEnd.x, t1);
    const y1 = lerp(roadStart.y, roadEnd.y, t1);
    const x2 = lerp(roadStart.x, roadEnd.x, t2);
    const y2 = lerp(roadStart.y, roadEnd.y, t2);

    
    roadSegments.push({
      start: p.createVector(x1, y1),
      end: p.createVector(x2, y2),
    });
  }

  // Assign lines to connect the road to the polygon boundary
  roadSegments.forEach((segment, idx) => {
    const boundaryLine = lines[idx % lines.length];

    let polygon = [
      segment.start,
      segment.end,
      boundaryLine.end,
      boundaryLine.start,
    ]
    // Create sub-polygon
    subPolygons.push(polygon);
  });

  return subPolygons;
};

const dist = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

const lerp = (start: number, end: number, amt: number): number => {
  return (1 - amt) * start + amt * end;
};


function getCenterPoint(p1: p5.Vector, p2: p5.Vector): p5.Vector {
  return p5.Vector.add(p1, p2).div(2);
}



function  calculateAngle(p:p5, point1: p5.Vector,point2:p5.Vector): number {
  const deltaY = point2.y - point1.y;
  const deltaX = point2.x - point1.x;

  // atan2 handles quadrants and division by zero
  const angleInRadians = Math.atan2(deltaY, deltaX);

  // Convert radians to degrees
  const angleInDegrees = p.degrees(angleInRadians);


  return normalizeAngle(angleInDegrees);
}
function normalizeAngle(angle: number): number {
  return (angle + 360) % 360;
}