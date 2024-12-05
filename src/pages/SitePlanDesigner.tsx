import React, { useState } from 'react';
import LotLineDrawer from './LotLineDrawer';

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
  selected: boolean; // Indicates if the line is selected for approach
  setback?: number; // Stores the setback value in feet (optional)
}

interface FinalizedData {
  lines: Line[]; // All line data
  approachLines: Line[]; // Lines selected as approaches
  setbacks: { lineIndex: number; setback: number }[]; // Setbacks for each line
}

const ParentComponent: React.FC = () => {
  const [finalizedData, setFinalizedData] = useState<FinalizedData | null>(null);

  const handleFinalize = (data: FinalizedData) => {
    setFinalizedData(data); // Save the finalized data
    console.log('Finalized Data:', data); // Debug or use this data for further processing
  };

  return (
    <div>
      {!finalizedData ? (
        <LotLineDrawer onFinalize={handleFinalize} />
      ) : (
        <div>
          <h2>Finalized Data</h2>
          <pre>{JSON.stringify(finalizedData, null, 2)}</pre>
          {/* Replace this with the next step in your workflow */}
        </div>
      )}
    </div>
  );
};

export default ParentComponent;
