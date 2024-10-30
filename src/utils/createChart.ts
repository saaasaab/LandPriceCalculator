import * as d3 from 'd3';

interface ChartMargins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}



interface ChartOptions {
    margins: ChartMargins;
    width: number;
    height: number;
    xLabel: string;
    yLabel: string;
}

const createChart = (
    data: number[], 
    chartRef: React.RefObject<SVGSVGElement>, 
    { margins, width, height, xLabel, yLabel }: ChartOptions
): void => {
    const bins = d3.bin().thresholds(50)(data);

    const chartWidth = width - margins.left - margins.right;
    const chartHeight = height - margins.top - margins.bottom;

    // Clear the previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Create SVG container
    const svg = d3.select(chartRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margins.left},${margins.top})`);

    // Define scales
    const x = d3.scaleLinear()
        .domain([d3.min(data) || 0, d3.max(data) || 0])
        .range([0, chartWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length) || 0])
        .nice()
        .range([chartHeight, 0]);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add bars
    svg.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("x", d => x(d.x0 || 0))
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1 || 0) - x(d.x0 || 0) - 1)
        .attr("height", d => chartHeight - y(d.length))
        .attr("fill", "steelblue");

    // Add X axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", chartWidth)
        .attr("y", chartHeight + margins.top + 20)
        .text(xLabel);

    // Add Y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", -margins.left)
        .attr("y", -margins.top + 20)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(yLabel);
};

export default createChart;
