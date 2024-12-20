import React, { useRef, useEffect } from 'react';

interface LotGridDrawerProps {
  polygonCoordinates: { x: number; y: number }[];
  scale: number; // Scale from the line-drawing component
}

const LotGridDrawer: React.FC<LotGridDrawerProps> = ({ polygonCoordinates }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellSize = 1; // Constant grid cell size in pixels

  const isPointInPolygon = (x: number, y: number, polygon: { x: number; y: number }[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    const rows = Math.ceil(canvas.height / cellSize);
    const cols = Math.ceil(canvas.width / cellSize);
    // const feetPerCell = (scale / 100) * cellSize; // Adjust number of feet each cell represents

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;

        if (isPointInPolygon(x, y, polygonCoordinates)) {
          ctx.fillStyle = 'green';
        } else {
          ctx.fillStyle = 'white';
        }

        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        // ctx.strokeStyle = 'gray';
        // ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);

        // // Draw feet per cell
        // ctx.fillStyle = 'black';
        // ctx.font = '10px Arial';
        // ctx.fillText(`${feetPerCell.toFixed(2)} ft`, col * cellSize + 2, row * cellSize + 10);
      }
    }
  }, [polygonCoordinates, cellSize]);

  return <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />;
};

export default LotGridDrawer;
