import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { Delaunay } from "d3-delaunay";

type Point = [number, number];

const VoronoiDiagram: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 800;
  const height = 600;

  // Function to add a point where the user clicks
  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setPoints((prevPoints) => [...prevPoints, [offsetX, offsetY]]);
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    if (points.length === 0) return;

    // Create Delaunay triangulation and Voronoi diagram
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    // Draw Voronoi cells
    svg
      .selectAll("path")
      .data(points)
      .enter()
      .append("path")
      .attr("d", (_, i) => voronoi.renderCell(i))
      .attr("stroke", "black")
      .attr("fill", "none");

    // Draw points
    svg
      .selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .attr("r", 3)
      .attr("fill", "red");
  }, [points]);

  return (
    <div>
      <h2>Voronoi Diagram</h2>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: "1px solid black", cursor: "pointer" }}
        onClick={handleSvgClick}
      ></svg>
      <p>Click on the canvas to add points!</p>
    </div>
  );
};

export default VoronoiDiagram;
