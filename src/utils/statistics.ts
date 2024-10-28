import * as d3 from 'd3';

// Helper function to calculate median
export const calculateMedian = (data: number[]): number => {
    const sorted = [...data].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
        return sorted[middle];
    }
};

// Helper function to calculate mode
export const calculateMode = (data: number[]): number  => {
    const frequency: { [key: number]: number } = {};
    let maxFreq = 0;
    let mode = null;

    data.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
        if (frequency[num] > maxFreq) {
            maxFreq = frequency[num];
            mode = num;
        }
    });

    return mode || 0;
};

// Helper function to calculate standard deviation
export const calculateStandardDeviation = (data: number[]): number => {
    const mean = d3.mean(data) || 0;
    const variance = d3.mean(data.map(x => Math.pow(x - mean, 2))) || 0;
    return Math.sqrt(variance);
};

// Other useful metrics (min, max, mean) can be calculated directly using D3
