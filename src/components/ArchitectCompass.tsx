import React, { useState, useEffect, useRef } from 'react';

interface CompassProps {
  initialRotation?: number;
  size?: number;
  onRotationChange?: (rotation: number) => void;
}

const ArchitectCompass = ({ 
  initialRotation = 0, 
  size = 200, 
  onRotationChange 
}: CompassProps) => {
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const compassRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !compassRef.current) return;

    const rect = compassRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate angle based on mouse position relative to center
    const angle = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX
    ) * (180 / Math.PI) + 90;

    // Normalize angle to 0-360 range
    const normalizedAngle = (angle + 360) % 360;
    setRotation(normalizedAngle);
    onRotationChange?.(normalizedAngle);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="relative inline-block">
      <svg
        ref={compassRef}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="cursor-pointer"
        style={{ transform: `rotate(${rotation}deg)` }}
        onMouseDown={handleMouseDown}
      >
        {/* Outer circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#2a4365"
          strokeWidth="0.5"
          className="pointer-events-none"
        />
        
        {/* Inner circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#2a4365"
          strokeWidth="0.25"
          className="pointer-events-none"
        />

        {/* Cardinal directions */}
        <text x="50" y="15" textAnchor="middle" className="text-xs fill-current text-blue-900">N</text>
        <text x="85" y="52" textAnchor="middle" className="text-xs fill-current text-blue-900">E</text>
        <text x="50" y="89" textAnchor="middle" className="text-xs fill-current text-blue-900">S</text>
        <text x="15" y="52" textAnchor="middle" className="text-xs fill-current text-blue-900">W</text>

        {/* Compass needle */}
        <g className="pointer-events-none">
          {/* North pointer */}
          <path
            d="M 50 10 L 45 50 L 50 45 L 55 50 L 50 10"
            fill="#dc2626"
            stroke="#dc2626"
            strokeWidth="0.5"
          />
          {/* South pointer */}
          <path
            d="M 50 90 L 45 50 L 50 55 L 55 50 L 50 90"
            fill="#1e40af"
            stroke="#1e40af"
            strokeWidth="0.5"
          />
        </g>

        {/* Degree markers */}
        {[...Array(72)].map((_, i) => {
          const angle = (i * 5) * (Math.PI / 180);
          const isMainDirection = i % 18 === 0;
          const length = isMainDirection ? 5 : 3;
          const x1 = 50 + 42 * Math.sin(angle);
          const y1 = 50 - 42 * Math.cos(angle);
          const x2 = 50 + (42 - length) * Math.sin(angle);
          const y2 = 50 - (42 - length) * Math.cos(angle);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#2a4365"
              strokeWidth={isMainDirection ? "0.5" : "0.25"}
              className="pointer-events-none"
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-blue-900">
        {Math.round(rotation)}°
      </div>
    </div>
  );
};

export default ArchitectCompass;