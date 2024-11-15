import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
// import { convertToPercent } from '../utils/utils';

interface AmortizationTableProps {
    loanAmount: number;
    interestRate: number;
    loanTerm: number;
    regularPayment: number;
    constructionPhaseMonths: number; // New prop for construction phase duration
}

interface AmortizationData {
    month: number;
    remainingBalance: number;
    totalPaid: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
}

const AmortizationTable: React.FC<AmortizationTableProps> = ({ loanAmount, interestRate, loanTerm, regularPayment, constructionPhaseMonths }) => {
    const d3Container = useRef<HTMLDivElement | null>(null);

    // Helper function to calculate amortization schedule
    const calculateAmortizationSchedule = (): AmortizationData[] => {
        const schedule: AmortizationData[] = [];
        let balance = loanAmount;
        let totalPaid = 0;
        let totalInterestPaid = 0;
        let totalPrincipalPaid = 0;
        
        const monthlyInterestRate = (interestRate / 100) / 12;
        let interestPayment=balance * monthlyInterestRate;
        let principalPayment: number;


        for (let month = 1; month <= loanTerm; month++) {
            if (month <= constructionPhaseMonths) {
                // Interest-only payments during the construction phase
                principalPayment = 0;
            } else {
                // Regular amortized payments after construction phase
                principalPayment = regularPayment - interestPayment;
            }

            balance += principalPayment;
            totalInterestPaid += interestPayment;
            totalPrincipalPaid -= principalPayment;

            totalPaid += (interestPayment - principalPayment);


            schedule.push({
                month,
                remainingBalance: Math.max(balance, 0), // Prevent negative balance
                totalPaid,
                totalInterestPaid,
                totalPrincipalPaid,
            });

            if (balance <= 0) break; // Stop if the loan is fully paid
        }
        return schedule;
    };

    // Generate amortization data
    const amortizationData = calculateAmortizationSchedule();


    // D3 chart effect
    useEffect(() => {
        const strokeWidth = 5
        if (d3Container.current) {
            const data = amortizationData;

            // Clear any existing SVG before drawing new content
            d3.select(d3Container.current).select("svg").remove();

            // Define SVG dimensions and margins
            const width = 800;
            const height = 400;
            const margin = { top: 20, right: 30, bottom: 40, left: 60 };

            // Create SVG container
            const svg = d3.select(d3Container.current)
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            // Set up x and y scales
            const xScale = d3.scaleLinear()
                .domain([1, loanTerm])
                .range([margin.left, width - margin.right]);

            const yScale = d3.scaleLinear()
                .domain([0, loanAmount*1.3])
                .range([height - margin.bottom, margin.top]);

            // Line generators for different metrics
            const balanceLine = d3.line<AmortizationData>()
                .x(d => xScale(d.month))
                .y(d => yScale(d.remainingBalance));

            const totalPaidLine = d3.line<AmortizationData>()
                .x(d => xScale(d.month))
                .y(d => yScale(d.totalPaid));

            const interestPaidLine = d3.line<AmortizationData>()
                .x(d => xScale(d.month))
                .y(d => yScale(d.totalInterestPaid));

            const principalPaidLine = d3.line<AmortizationData>()
                .x(d => xScale(d.month))
                .y(d => yScale(d.totalPrincipalPaid));

            // Append lines with increased thickness
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width",strokeWidth)
                .attr("d", balanceLine);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width",strokeWidth)
                .attr("d", totalPaidLine);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width",strokeWidth)
                .attr("d", interestPaidLine);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-width",strokeWidth)
                .attr("d", principalPaidLine);

            // Add axes
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(xScale).ticks(loanTerm / 12).tickFormat(d3.format("d")))
                .append("text")
                .attr("fill", "#000")
                .attr("x", width / 2)
                .attr("y", margin.bottom - 10)
                .attr("text-anchor", "middle")
                .text("Months");

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(yScale).tickFormat(d => `$${d3.format(",")(d)}`))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -margin.left + 15)
                .attr("dy", "0.75em")
                .attr("text-anchor", "middle")
                .text("Amount ($)");

            // Add legend
            const legendData = [
                { color: "steelblue", label: "Remaining Balance" },
                { color: "green", label: "Total Paid" },
                { color: "red", label: "Total Interest Paid" },
                { color: "orange", label: "Total Principal Paid" },
            ];

            legendData.forEach((d, i) => {
                svg.append("circle").attr("cx", width - 150).attr("cy", 30 + i * 20).attr("r", 6).style("fill", d.color);
                svg.append("text").attr("x", width - 140).attr("y", 30 + i * 20).text(d.label).style("font-size", "12px").attr("alignment-baseline","middle");
            });
        }
    }, [amortizationData, loanTerm, loanAmount]);

    return (
        <div>
            <div ref={d3Container}></div>
            <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #ccc" }}>
                        <th>Month</th>
                        <th>Remaining Balance ($)</th>
                        <th>Total Paid ($)</th>
                        <th>Total Interest Paid ($)</th>
                        <th>Total Principal Paid ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {amortizationData.map((row) => (
                        <tr key={row.month} style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <td>{row.month}</td>
                            <td>{row.remainingBalance.toFixed(2)}</td>
                            <td>{row.totalPaid.toFixed(2)}</td>
                            <td>{row.totalInterestPaid.toFixed(2)}</td>
                            <td>{row.totalPrincipalPaid.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AmortizationTable;
