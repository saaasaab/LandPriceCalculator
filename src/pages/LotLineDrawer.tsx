import React, { useRef, useState, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
  selected: boolean; // Indicates if the line is selected (e.g., for approach)
  setback?: number; // Stores the setback value in feet
}

interface LotLineDrawerProps {
  onFinalize: (data: { lines: Line[]; approachLines: Line[]; setbacks: { lineIndex: number; setback: number }[] }) => void;
}

const LotLineDrawer: React.FC<LotLineDrawerProps> = ({ onFinalize }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const setbackInputRef = useRef<HTMLInputElement | null>(null);

  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<'adjust' | 'select' | 'setback'>('adjust'); // Interaction mode
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [setbackInput, setSetbackInput] = useState<string>(''); // Temporary input for setback
  const [scale, setScale] = useState<number>(10); // Default scale (100px = 1ft)
  const [area, setArea] = useState<number>(0); // Area of the polygon


  // Ensure the input is focused when a line is selected

  useEffect(() => {
    if (mode === 'setback' && selectedLineIndex !== null && setbackInputRef.current) {
      setbackInputRef.current.focus();
      setSetbackInput(''); // Clear input when a new line is selected
    }
  }, [mode, selectedLineIndex]);

  // Calculate and display the area when the polygon changes
  useEffect(() => {
    if (isPolygonClosed && points.length > 2) {
      const calculateArea = (polygon: Point[]): number => {
        let total = 0;
        for (let i = 0; i < polygon.length; i++) {
          const next = (i + 1) % polygon.length;
          total += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
        }
        return Math.abs(total / 2);
      };
      setArea(calculateArea(points) * Math.pow(scale / 100, 2)); // Convert area to square feet
    }
  }, [points, isPolygonClosed, scale]);

  // Render the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw points and lines
    ctx.lineWidth = 2;

    lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      // 
      ctx.strokeStyle = mode === 'setback' && line.selected ? 'orange' : line.selected ? 'blue' : 'black'; // Orange for setback

      // ctx.strokeStyle = line.selected ? 'blue' : 'black'; // Highlight selected lines in blue
      ctx.stroke();

      // Calculate setback polygon if setbacks exist


      // Calculate setback polygon if setbacks exist
      if (mode === 'setback' && lines.some((line) => typeof line.setback === 'number')) {
        // Create inset lines for each original line with a setback
        const polygonPoints = points;
        const clockwise = isClockwise(polygonPoints);

        const setbackLines = lines.map((line) =>
          typeof line.setback === 'number' ? getPerpendicularOffset(line, line.setback, scale, clockwise) : line
        );

        // Calculate intersection points for the setback polygon
        const setbackPolygon: Point[] = [];
        for (let i = 0; i < setbackLines.length; i++) {
          const currentLine = setbackLines[i];
          const nextLine = setbackLines[(i + 1) % setbackLines.length]; // Wrap around to form a closed shape
          const intersection = getLineIntersection(currentLine, nextLine);
          if (intersection) setbackPolygon.push(intersection);
        }


        // Draw setback polygon with faded color
        if (setbackPolygon.length > 2) {
          ctx.beginPath();
          setbackPolygon.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.closePath();
          ctx.fillStyle = 'rgba(255, 165, 0, 0.3)'; // Light orange with transparency
          ctx.fill();
        }
      }


      // Draw line lengths
      const midX = (line.start.x + line.end.x) / 2;
      const midY = (line.start.y + line.end.y) / 2;
      const length = (Math.hypot(line.end.x - line.start.x, line.end.y - line.start.y) * scale) / 100; // Adjust by scale
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(`${length.toFixed(2)} ft`, midX, midY);

      // Draw setback labels if available
      if (mode === 'setback' && typeof line.setback === 'number') {
        ctx.fillText(`Setback: ${line.setback} ft`, midX, midY + 15);
      }
    });

    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
    });

    // Draw temporary line and hover point
    if (hoverPoint && !isPolygonClosed && points.length > 0) {
      const lastPoint = points[points.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(hoverPoint.x, hoverPoint.y);
      ctx.strokeStyle = 'gray';
      ctx.stroke();

      // Display temporary line length
      const tempLength = (Math.hypot(hoverPoint.x - lastPoint.x, hoverPoint.y - lastPoint.y) * scale) / 100;
      const midX = (hoverPoint.x + lastPoint.x) / 2;
      const midY = (hoverPoint.y + lastPoint.y) / 2;
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(`${tempLength.toFixed(2)} ft`, midX, midY);

      ctx.beginPath();
      ctx.arc(hoverPoint.x, hoverPoint.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'gray';
      ctx.fill();
    }

    // Display the area if the polygon is closed
    if (isPolygonClosed && points.length > 2) {
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(`Area: ${area.toFixed(2)} sq ft`, 10, canvas.height - 20);
    }
  }, [points, lines, hoverPoint, isPolygonClosed, mode, scale, area]);

  const handleMouseDown = handleMouseDownInCanvas(canvasRef, points, setDraggingIndex, isPolygonClosed, lines, mode, setLines, setSelectedLineIndex, setIsPolygonClosed, setPoints);
  // const handleMouseMove = handleMouseMoveInCanvas(canvasRef, draggingIndex, setPoints, setLines, points, isPolygonClosed, setHoverPoint);
  const handleMouseMove = handleMouseMoveInCanvas(
    canvasRef,
    draggingIndex,
    setPoints,
    setLines,
    points,
    isPolygonClosed,
    setHoverPoint,
    mode,
    lines
  );

  const handleMouseUp = () => { setDraggingIndex(null); };
  const saveInputsToParent = saveInputs(lines, onFinalize);
  const updateSetback = updateSetbacksForLotBoundries(setSetbackInput, selectedLineIndex, setLines);

  const clearCanvas = () => {
    setPoints([]);
    setLines([]);
    setHoverPoint(null);
    setIsPolygonClosed(false);
    setDraggingIndex(null);
    setMode('adjust');
    setSelectedLineIndex(null);
    setSetbackInput('');
    setArea(0);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={saveInputsToParent}
          style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}
        >
          {`Save & Return to Parent`}
        </button>
        {['adjust', 'select', 'setback'].map((buttonMode) => (
          <button
            key={buttonMode}
            onClick={() => setMode(buttonMode as 'adjust' | 'select' | 'setback')}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              marginLeft: '10px',
              backgroundColor: mode === buttonMode ? '#cce5ff' : '',
              border: mode === buttonMode ? '2px solid blue' : '',
            }}
          >
            {buttonMode === 'adjust' ? 'Adjust Lines' : buttonMode === 'select' ? 'Select Approach' : 'Set Setbacks'}
          </button>
        ))}
        <button
          onClick={clearCanvas}
          style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}
        >
          Clear
        </button>
        <div style={{ marginTop: '10px' }}>
          <label>Select Scale: </label>
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            style={{ padding: '5px', marginLeft: '10px' }}
          >
            <option value={1}>100px = 1 ft</option>
            <option value={10}>100px = 10 ft</option>
            <option value={50}>100px = 50 ft</option>
            <option value={100}>100px = 100 ft</option>
            <option value={500}>100px = 500 ft</option>
          </select>
        </div>
      </div>
      {mode === 'setback' && selectedLineIndex !== null && (
        <div style={{ marginTop: '10px' }}>
          <label>Setback (ft): </label>
          <input
            ref={setbackInputRef} // Attach ref for auto-focus
            type="number"
            value={setbackInput}
            onChange={(e) => updateSetback(e.target.value)}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default LotLineDrawer;




function saveInputs(lines: Line[], onFinalize: (data: { lines: Line[]; approachLines: Line[]; setbacks: { lineIndex: number; setback: number; }[]; }) => void) {
  return () => {
    const approachLines = lines.filter((line) => line.selected);
    const setbacks = lines
      .map((line, index) => (line.setback !== undefined ? { lineIndex: index, setback: line.setback } : null))
      .filter((item) => item !== null) as { lineIndex: number; setback: number; }[];

    onFinalize({ lines, approachLines, setbacks });
  };
}

function updateSetbacksForLotBoundries(setSetbackInput: React.Dispatch<React.SetStateAction<string>>, selectedLineIndex: number | null, setLines: React.Dispatch<React.SetStateAction<Line[]>>) {
  return (value: string) => {
    setSetbackInput(value);
    if (selectedLineIndex !== null && value.trim() !== '') {
      setLines((prev) => prev.map((line, index) => index === selectedLineIndex ? { ...line, setback: parseFloat(value) } : line
      )
      );
    }
  };
} export const handleMouseMoveInCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  draggingIndex: number | null,
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>,
  setLines: React.Dispatch<React.SetStateAction<Line[]>>,
  points: Point[],
  isPolygonClosed: boolean,
  setHoverPoint: React.Dispatch<React.SetStateAction<Point | null>>,
  mode: 'adjust' | 'select' | 'setback',
  lines: Line[]
) => (event: React.MouseEvent) => {
  if (!canvasRef.current) return;

  const rect = canvasRef.current.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const canvas = canvasRef.current;

  if (draggingIndex !== null) {
    // Update the dragged point
    const updatedPoints = points.map((point, index) =>
      index === draggingIndex ? { x, y } : point
    );

    // Update lines based on the updated points
    const updatedLines = updatedPoints.map((_point, index) => {
      const nextIndex = (index + 1) % updatedPoints.length;
      return {
        start: updatedPoints[index],
        end: updatedPoints[nextIndex],
        selected: false, // Keep selection state as-is
      };
    });

    setPoints(updatedPoints);
    setLines(updatedLines);
    return;
  }

  // Change cursor if hovering over a line in setback mode
  if (mode === 'setback') {
    const hoveredLine = lines.find((line) => {
      const distToLine =
        Math.abs(
          ((y - line.start.y) * (line.end.x - line.start.x) -
            (x - line.start.x) * (line.end.y - line.start.y)) /
          Math.hypot(line.end.x - line.start.x, line.end.y - line.start.y)
        ) < 10; // Buffer is 10 pixels
      const withinLineBounds =
        Math.min(line.start.x, line.end.x) <= x &&
        Math.max(line.start.x, line.end.x) >= x &&
        Math.min(line.start.y, line.end.y) <= y &&
        Math.max(line.start.y, line.end.y) >= y;

      return distToLine && withinLineBounds;
    });

    canvas.style.cursor = hoveredLine ? 'pointer' : 'default';
  } else {
    canvas.style.cursor = 'default';
  }

  // Hover point for adding a new line
  if (!isPolygonClosed && points.length > 0) {
    setHoverPoint({ x, y });
  }
};



function handleMouseDownInCanvas(canvasRef: React.MutableRefObject<HTMLCanvasElement | null>, points: Point[], setDraggingIndex: React.Dispatch<React.SetStateAction<number | null>>, isPolygonClosed: boolean, lines: Line[], mode: string, setLines: React.Dispatch<React.SetStateAction<Line[]>>, setSelectedLineIndex: React.Dispatch<React.SetStateAction<number | null>>, setIsPolygonClosed: React.Dispatch<React.SetStateAction<boolean>>, setPoints: React.Dispatch<React.SetStateAction<Point[]>>) {
  return (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Handle dragging of nodes
    const pointIndex = points.findIndex((point) => Math.hypot(point.x - x, point.y - y) < 5);
    if (pointIndex !== -1) {
      setDraggingIndex(pointIndex);
      return;
    }
    const clickedLineIndex = lines.findIndex((line) => {
      const distToLine = Math.abs(
        ((y - line.start.y) * (line.end.x - line.start.x) -
          (x - line.start.x) * (line.end.y - line.start.y)) /
        Math.hypot(line.end.x - line.start.x, line.end.y - line.start.y)
      ) < 20; // Buffer is 10 pixels

      const withinLineBounds = Math.min(line.start.x, line.end.x) <= x &&
        Math.max(line.start.x, line.end.x) >= x &&
        Math.min(line.start.y, line.end.y) <= y &&
        Math.max(line.start.y, line.end.y) >= y;

      return distToLine && withinLineBounds;
    });


    if (isPolygonClosed) {
      // Handle line selection for "Select approach" or "Set Setbacks"

      if (mode === 'setback') {
        if (clickedLineIndex !== -1) {
          setSelectedLineIndex(clickedLineIndex);

          // Update the line's appearance
          setLines((prevLines) =>
            prevLines.map((line, index) =>
              index === clickedLineIndex ? { ...line, selected: true } : { ...line, selected: false }
            )
          );
          return;
        }
      }
      if (clickedLineIndex !== -1) {
        if (mode === 'select') {
          setLines((prevLines) => prevLines.map((line, index) =>
            index === clickedLineIndex ? { ...line, selected: !line.selected } : line
          )
          );
        }
        else if (mode === 'setback') {
          setSelectedLineIndex(clickedLineIndex);
        }
      }
      return;
    }

    // Close polygon if clicking the first node
    if (points.length > 2 && Math.hypot(points[0].x - x, points[0].y - y) < 10) {

      setLines((prev) => [
        ...prev,
        { start: points[points.length - 1], end: points[0], selected: false },
      ]);
      setIsPolygonClosed(true);
      return;
    }

    // Add points and lines in "Adjust lines" mode
    setPoints((prev) => [...prev, { x, y }]);

    if (points.length > 0) {
      const newLine: Line = {
        start: points[points.length - 1],
        end: { x, y },
        selected: false,
      };
      setLines((prev) => [...prev, newLine]);
    }
  };
}




const getPerpendicularOffset = (line: Line, distance: number, scale: number,isClockwise:boolean): Line => {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  const length = -Math.hypot(dx, dy);
  console.log(`distance`, distance,scale)

 
  const offsetX = (dy / length) * ( 100/scale*distance) * (isClockwise ? -1 : 1);;
  const offsetY = (-dx / length) * ( 100/scale*distance) * (isClockwise ? -1 : 1);;


  
  return {
    start: { x: line.start.x + offsetX, y: line.start.y + offsetY },
    end: { x: line.end.x + offsetX, y: line.end.y + offsetY },
    selected: false,
  };
};

const getLineIntersection = (
  line1: Line,
  line2: Line
): Point | null => {
  const { x: x1, y: y1 } = line1.start;
  const { x: x2, y: y2 } = line1.end;
  const { x: x3, y: y3 } = line2.start;
  const { x: x4, y: y4 } = line2.end;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (denom === 0) return null;

  const intersectX =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  const intersectY =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

  return { x: intersectX, y: intersectY };
};




const isClockwise = (polygon: Point[]): boolean => {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    sum += (next.x - current.x) * (next.y + current.y);
  }
  return sum > 0;
};
