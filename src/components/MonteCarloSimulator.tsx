import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import createChart from '../utils/createChart';
import { calculateMedian, calculateMode, calculateStandardDeviation } from '../utils/statistics';


// Function to generate random values within a range
// const getRandomValue = (value: number) => {
//     const deviation = value * 0.2; // Calculate 20% of the value
//     return value + (Math.random() * 2 - 1) * deviation; // Randomly adjust value by ±20%
// };

interface MonteCarloSimulatorProps {
    grossAcres: number;
    unbuildableAcres: number;
    sqFtPerLot: number;
    unitsPerAcre: number;
    houseSize: number;
    housePricePerSqFt: number;
    hardCostPerSqFt: number;
    permits: number;
    miscCosts: number;
    homeBuilderProfitPercentage: number;
    realEstateCommissionPercentage: number;
    landDeveloperProfitPercentage: number;
    costToDevelopPerLot: number;
}
// const runMonteCarloSimulation = (inputs: MonteCarloSimulatorProps, iterations: number) => {
//     const results: { profit: number; cost: number }[] = [];

//     for (let i = 0; i < iterations; i++) {
//         const adjustedInputs = {
//             grossAcres: inputs.grossAcres,
//             unbuildableAcres: inputs.unbuildableAcres,
//             sqFtPerLot: inputs.sqFtPerLot,
//             unitsPerAcre: inputs.unitsPerAcre,
//             houseSize: getRandomValue(inputs.houseSize),
//             housePricePerSqFt: getRandomValue(inputs.housePricePerSqFt),
//             hardCostPerSqFt: getRandomValue(inputs.hardCostPerSqFt),
//             permits: getRandomValue(inputs.permits),
//             miscCosts: getRandomValue(inputs.miscCosts),
//             homeBuilderProfitPercentage: getRandomValue(inputs.homeBuilderProfitPercentage),
//             realEstateCommissionPercentage: getRandomValue(inputs.realEstateCommissionPercentage),
//             landDeveloperProfitPercentage: getRandomValue(inputs.landDeveloperProfitPercentage),
//             costToDevelopPerLot: getRandomValue(inputs.costToDevelopPerLot)
//         };

//         const result = residentialDevelopmentCalculations(adjustedInputs)
//         results.push({ profit: result.totalProfits, cost: result.totalCosts });
//     }
//     return results;
// };

const MonteCarloSimulator: React.FC<MonteCarloSimulatorProps> = (props) => {
    const [iterations, setIterations] = useState(1000);
    const [results, _setResults] = useState<{ profit: number; cost: number }[]>([]);
    const [metrics, setMetrics] = useState({
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        mode: 0,
        stdDev: 0
    });

    const chartProfitsRef = useRef<SVGSVGElement>(null);
    const chartCostsRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        // const simulationResults = runMonteCarloSimulation(props, iterations);
        // setResults(simulationResults);
    }, [props, iterations]);


    useEffect(() => {
        if (results.length === 0) return;

        // Prepare data for the histogram
        const profits = results.map(result => result.profit);
        const costs = results.map(result => result.cost);
  // Metrics
  const minProfit = d3.min(profits) || 0;
  const maxProfit = d3.max(profits) || 0;
  const meanProfit = d3.mean(profits) || 0;
  const medianProfit = calculateMedian(profits);
  const modeProfit = calculateMode(profits);
  const stdDevProfit = calculateStandardDeviation(profits);

  setMetrics({
      min: minProfit,
      max: maxProfit,
      mean: meanProfit,
      median: medianProfit,
      mode: modeProfit,
      stdDev: stdDevProfit
  });
  
        createChart(profits, chartProfitsRef, {
            margins: { top: 20, right: 30, bottom: 40, left: 40 },
            width: 800,
            height: 400,
            xLabel: "Profit",
            yLabel: "Frequency"
        });
        createChart(costs, chartCostsRef, {
            margins: { top: 20, right: 30, bottom: 40, left: 40 },
            width: 800,
            height: 400,
            xLabel: "Costs",
            yLabel: "Frequency"
        });

    }, [results]);


  


    return (
        <div>
            <h1>Monte Carlo Simulator</h1>
            <label>
                Number of Iterations:
                <input
                    type="number"
                    value={iterations}
                    onChange={(value) => setIterations(Number(value))}
                />
            </label>
            <div>
                <h2>Simulation Results</h2>
                <p><strong>Min Profit:</strong> {metrics.min.toFixed(2)}</p>
                <p><strong>Max Profit:</strong> {metrics.max.toFixed(2)}</p>
                <p><strong>Mean Profit:</strong> {metrics.mean.toFixed(2)}</p>
                <p><strong>Median Profit:</strong> {metrics.median.toFixed(2)}</p>
                <p><strong>Mode Profit:</strong> {metrics.mode?.toFixed(2) || "No Mode"}</p>
                <p><strong>Standard Deviation:</strong> {metrics.stdDev.toFixed(2)}</p>
            </div>
            <div>
                <h2>Results</h2>
                <svg ref={chartProfitsRef}></svg>
            </div>

            <div>
                <h2>Results</h2>
                <svg ref={chartCostsRef}></svg>
            </div>
        </div>
    );
};

export default MonteCarloSimulator;
