import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

type Point = {
  x: number;
  y: number;
};

type Line = {
  start: Point;
  end: Point;
  isApproach?: boolean;
  setbacks?: number[]; // Array to handle multiple setbacks
};

const RealEstatePolygon: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'setSetbacks' | 'selectApproaches' | 'draw'>('draw'); // Current mode
  const [scale, setScale] = useState(1); // Scale state

  useEffect(() => {
    const sketch = (p: p5) => {
      let points: Point[] = [];
      let lines: Line[] = [];
      let draggingPoint: number | null = null;
      let closed = false;

      p.setup = () => {
        p.createCanvas(800, 600).parent(canvasRef.current!);
      };

      p.draw = () => {
        p.background(240);
        p.fill(255);
        p.strokeWeight(2);

        // Draw lines
        for (const line of lines) {
          p.stroke(line.isApproach ? 'blue' : 'black'); // Highlight approaches in blue
          p.line(line.start.x, line.start.y, line.end.x, line.end.y);

          // Draw setbacks if any
          if (line.setbacks) {
            for (const setback of line.setbacks) {
              drawSetback(line, setback);
            }
          }

          // Display line length
          const length = ((p.dist(line.start.x, line.start.y, line.end.x, line.end.y) * scale) / 100).toFixed(2);
          const midX = (line.start.x + line.end.x) / 2;
          const midY = (line.start.y + line.end.y) / 2;
          p.noStroke();
          p.fill(0);
          p.textSize(12);
          p.text(`${length} ft`, midX, midY);
        }

        // Draw points
        for (const point of points) {
          p.ellipse(point.x, point.y, 10, 10);
        }
      };

      const drawSetback = (line: Line, setback: number) => {
        const angle = Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x);
        const offsetX = Math.sin(angle) * setback;
        const offsetY = -Math.cos(angle) * setback;

        const setbackStart = { x: line.start.x + offsetX, y: line.start.y + offsetY };
        const setbackEnd = { x: line.end.x + offsetX, y: line.end.y + offsetY };

        p.stroke(150);
        p.fill(200, 200, 200, 100);
        p.beginShape();
        p.vertex(line.start.x, line.start.y);
        p.vertex(line.end.x, line.end.y);
        p.vertex(setbackEnd.x, setbackEnd.y);
        p.vertex(setbackStart.x, setbackStart.y);
        p.endShape(p.CLOSE);
      };

      p.mousePressed = () => {
        const mousePos: Point = { x: p.mouseX, y: p.mouseY };
        if (mode === 'draw') {
          // Add point or close polygon
          if (draggingPoint !== null) return;

          for (let i = 0; i < points.length; i++) {
            if (p.dist(mousePos.x, mousePos.y, points[i].x, points[i].y) < 10) {
              if (!closed && points.length > 2 && i === 0) {
                closed = true;
                lines.push({ start: points[points.length - 1], end: points[0] });
                return;
              }
              draggingPoint = i;
              return;
            }
          }

          if (!closed) {
            if (points.length > 0) {
              lines.push({ start: points[points.length - 1], end: mousePos });
            }
            points.push(mousePos);
          }
        } else if (mode === 'setSetbacks') {
          // Set setbacks
          for (const line of lines) {
            const dist = p.dist(
              mousePos.x,
              mousePos.y,
              (line.start.x + line.end.x) / 2,
              (line.start.y + line.end.y) / 2
            );
            if (dist < 10) {
              const setback = parseFloat(prompt('Enter setback width (in ft):') || '0');
              if (!isNaN(setback)) {
                if (!line.setbacks) line.setbacks = [];
                line.setbacks.push(setback);
              }
              return;
            }
          }
        } else if (mode === 'selectApproaches') {
          // Select approaches
          for (const line of lines) {
            const dist = p.dist(
              mousePos.x,
              mousePos.y,
              (line.start.x + line.end.x) / 2,
              (line.start.y + line.end.y) / 2
            );
            if (dist < 10) {
              line.isApproach = !line.isApproach; // Toggle approach state
              return;
            }
          }
        }
      };

      p.mouseDragged = () => {
        if (draggingPoint !== null) {
          points[draggingPoint] = { x: p.mouseX, y: p.mouseY };
          if (draggingPoint > 0) {
            lines[draggingPoint - 1].end = points[draggingPoint];
          }
          if (draggingPoint < points.length - 1) {
            lines[draggingPoint].start = points[draggingPoint];
          }
          if (closed) {
            lines[lines.length - 1].end = points[0];
          }
        }
      };

      p.mouseReleased = () => {
        draggingPoint = null;
      };
    };

    const p5Instance = new p5(sketch);
    return () => p5Instance.remove();
  }, []);

  return (
    <div>
      <div>
        <button onClick={() => setMode('draw')} style={{ background: mode === 'draw' ? 'lightgreen' : 'white' }}>
          Draw
        </button>
        <button
          onClick={() => setMode('setSetbacks')}
          style={{ background: mode === 'setSetbacks' ? 'lightgreen' : 'white' }}
        >
          Set Setbacks
        </button>
        <button
          onClick={() => setMode('selectApproaches')}
          style={{ background: mode === 'selectApproaches' ? 'lightgreen' : 'white' }}
        >
          Select Approaches
        </button>
        <label style={{ marginLeft: '10px' }}>Scale: </label>
        <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
          <option value={1}>100px = 1 ft</option>
          <option value={10}>100px = 10 ft</option>
          <option value={20}>100px = 20 ft</option>
        </select>
      </div>
      <div ref={canvasRef} style={{ marginTop: '20px' }}></div>
    </div>
  );
};

export default RealEstatePolygon;
