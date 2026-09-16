import { useEffect, useMemo, useRef, useState } from 'react';
import { roundToDecimal } from '../../utils/utils';
import './RangeSimulation.scss';

export type RangeSimulationVariable = {
  id: string;
  label: string;
  isPercent?: boolean;
};

export type RangeSimulationColumn = {
  id: string;
  label: string;
  format: (value: number) => string;
};

type RangeSimulationProps = {
  pageTitle?: string;
  variables: RangeSimulationVariable[];
  columns: RangeSimulationColumn[];
  currentValues: Record<string, number>;
  run: (values: Record<string, number>) => Record<string, number>;
};

const MAX_STEPS = 500;

const defaultStep = (value: number, isPercent?: boolean) => {
  if (isPercent) return 0.5;
  if (value >= 1000) return 50;
  if (value >= 100) return 10;
  return 1;
};

const suggestedRange = (value: number, isPercent?: boolean) => {
  if (isPercent) {
    return {
      min: roundToDecimal(Math.max(0, value - 2), 2),
      max: roundToDecimal(Math.min(100, value + 2), 2),
    };
  }

  const spread = Math.max(value * 0.2, defaultStep(value));
  return {
    min: roundToDecimal(Math.max(0, value - spread), 2),
    max: roundToDecimal(value + spread, 2),
  };
};

const stepCount = (min: number, max: number, step: number) =>
  Math.floor((max - min) / step + 1e-9) + 1;

const buildSteps = (min: number, max: number, step: number): number[] => {
  if (!(step > 0) || max < min) return [];

  const decimals = step < 1 ? 4 : 2;
  const requested = stepCount(min, max, step);

  if (requested <= MAX_STEPS) {
    const values: number[] = [];
    for (let i = 0; i < requested; i++) {
      values.push(roundToDecimal(min + i * step, decimals));
    }
    const last = values[values.length - 1];
    if (last != null && Math.abs(last - max) > step * 0.01) {
      values.push(roundToDecimal(max, decimals));
    }
    return values;
  }

  const values: number[] = [];
  for (let i = 0; i < MAX_STEPS; i++) {
    values.push(roundToDecimal(min + ((max - min) * i) / (MAX_STEPS - 1), decimals));
  }
  return values;
};

const printSimulation = () => {
  window.print();
};

const CHART_WIDTH = 400;
const CHART_HEIGHT = 200;
const CHART_PAD = { top: 10, right: 12, bottom: 28, left: 52 };

const compactAxisValue = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${roundToDecimal(value / 1_000_000, 1)}M`;
  if (abs >= 10_000) return `${roundToDecimal(value / 1_000, 1)}k`;
  if (abs >= 100) return String(Math.round(value));
  return String(roundToDecimal(value, 2));
};

const CONSTANT_RELATIVE_SPAN = 0.0005;

const stabilizeSeries = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const magnitude = Math.max(Math.abs(min), Math.abs(max), 1e-9);
  const isConstant =
    compactAxisValue(min) === compactAxisValue(max) ||
    (max - min) / magnitude < CONSTANT_RELATIVE_SPAN;

  if (!isConstant) {
    return { min, max, values };
  }

  return {
    min: mean,
    max: mean,
    values: values.map(() => mean),
  };
};

const OutputLineChart = ({
  title,
  points,
  formatX,
  formatY,
}: {
  title: string;
  points: { x: number; y: number }[];
  formatX: (value: number) => string;
  formatY: (value: number) => string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{
    displayX: string;
    displayY: string;
    svgX: number;
    svgY: number;
  } | null>(null);

  const xs = points.map((point) => point.x);
  const finitePoints = points.filter((point) => Number.isFinite(point.y));

  if (finitePoints.length < 2) {
    return (
      <article className="range-simulation-chart">
        <h4>{title}</h4>
        <p>No graphable values for this output.</p>
      </article>
    );
  }

  const stabilized = stabilizeSeries(finitePoints.map((point) => point.y));
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const dataMin = stabilized.min;
  const dataMax = stabilized.max;
  const plotPoints = finitePoints.map((point, index) => ({
    x: point.x,
    plotY: stabilized.values[index],
    valueY: point.y,
  }));

  const innerWidth = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
  const innerHeight = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;
  let padAmount = (dataMax - dataMin) * 0.08;
  if (dataMin === dataMax) {
    padAmount = Math.abs(dataMin) * 0.08 || 1;
  }
  const yMin = dataMin - padAmount;
  const yMax = dataMax + padAmount;
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const xScale = (value: number) => CHART_PAD.left + ((value - xMin) / xRange) * innerWidth;
  const yScale = (value: number) => CHART_PAD.top + innerHeight - ((value - yMin) / yRange) * innerHeight;
  const line = plotPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${xScale(point.x)} ${yScale(point.plotY)}`)
    .join(' ');
  const firstPoint = plotPoints[0];
  const lastPoint = plotPoints[plotPoints.length - 1];
  const area = `${line} L${xScale(lastPoint.x)} ${yScale(yMin)} L${xScale(firstPoint.x)} ${yScale(yMin)} Z`;
  const yTicks = Array.from(new Set([dataMin, (dataMin + dataMax) / 2, dataMax]));
  const showZero = yMin < 0 && yMax > 0;

  const handleMouseMove = (event: { clientX: number }) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    if (!(rect.width > 0)) return;

    const viewX = ((event.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const dataX = xMin + ((viewX - CHART_PAD.left) / innerWidth) * xRange;
    let nearest = plotPoints[0];
    let nearestDistance = Infinity;
    for (const point of plotPoints) {
      const distance = Math.abs(point.x - dataX);
      if (distance >= nearestDistance) continue;
      nearest = point;
      nearestDistance = distance;
    }

    setHover({
      displayX: formatX(nearest.x),
      displayY: formatY(nearest.valueY),
      svgX: xScale(nearest.x),
      svgY: yScale(nearest.plotY),
    });
  };

  let tooltipTransform = 'translate(-50%, calc(-100% - 8px))';
  if (hover && hover.svgY < 36) {
    tooltipTransform = 'translate(-50%, 12px)';
  }

  return (
    <article className="range-simulation-chart">
      <h4>{title}</h4>
      <div className="range-simulation-chart-plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={title}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHover(null)}
        >
          <line
            x1={CHART_PAD.left}
            y1={CHART_PAD.top}
            x2={CHART_PAD.left}
            y2={CHART_PAD.top + innerHeight}
            className="range-simulation-chart-axis"
          />
          <line
            x1={CHART_PAD.left}
            y1={CHART_PAD.top + innerHeight}
            x2={CHART_PAD.left + innerWidth}
            y2={CHART_PAD.top + innerHeight}
            className="range-simulation-chart-axis"
          />
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={CHART_PAD.left}
                y1={yScale(tick)}
                x2={CHART_PAD.left + innerWidth}
                y2={yScale(tick)}
                className="range-simulation-chart-grid"
              />
              <text x={CHART_PAD.left - 6} y={yScale(tick)} dy="0.35em" textAnchor="end" className="range-simulation-chart-label">
                {compactAxisValue(tick)}
              </text>
            </g>
          ))}
          {showZero ? (
            <line
              x1={CHART_PAD.left}
              y1={yScale(0)}
              x2={CHART_PAD.left + innerWidth}
              y2={yScale(0)}
              className="range-simulation-chart-zero"
            />
          ) : null}
          <path d={area} className="range-simulation-chart-area" />
          <path d={line} className="range-simulation-chart-line" />
          {hover ? (
            <g className="range-simulation-chart-hover">
              <line
                x1={hover.svgX}
                y1={CHART_PAD.top}
                x2={hover.svgX}
                y2={CHART_PAD.top + innerHeight}
                className="range-simulation-chart-crosshair"
              />
              <circle cx={hover.svgX} cy={hover.svgY} r="4" className="range-simulation-chart-dot" />
            </g>
          ) : null}
          <text x={CHART_PAD.left} y={CHART_HEIGHT - 6} className="range-simulation-chart-label">
            {formatX(xMin)}
          </text>
          <text x={CHART_PAD.left + innerWidth} y={CHART_HEIGHT - 6} textAnchor="end" className="range-simulation-chart-label">
            {formatX(xMax)}
          </text>
        </svg>
        {hover ? (
          <div
            className="range-simulation-chart-tooltip"
            style={{
              left: `${(hover.svgX / CHART_WIDTH) * 100}%`,
              top: `${(hover.svgY / CHART_HEIGHT) * 100}%`,
              transform: tooltipTransform,
            }}
          >
            <span>{hover.displayX}</span>
            <strong>{hover.displayY}</strong>
          </div>
        ) : null}
      </div>
    </article>
  );
};

const RangeSimulation = ({ pageTitle, variables, columns, currentValues, run }: RangeSimulationProps) => {
  const [variableId, setVariableId] = useState(variables[0]?.id ?? '');
  const selectedVariable = variables.find((variable) => variable.id === variableId) ?? variables[0];
  const currentValue = selectedVariable ? currentValues[selectedVariable.id] ?? 0 : 0;
  const initialRange = suggestedRange(currentValue, selectedVariable?.isPercent);

  const [min, setMin] = useState(String(initialRange.min));
  const [max, setMax] = useState(String(initialRange.max));
  const [step, setStep] = useState(String(defaultStep(currentValue, selectedVariable?.isPercent)));
  const [rows, setRows] = useState<{ input: number; outputs: Record<string, number> }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rows) return undefined;

    const onBeforePrint = () => {
      document.documentElement.classList.add('is-printing-simulation');
      if (!document.head.querySelector('[data-simulation-print]')) {
        const style = document.createElement('style');
        style.setAttribute('data-simulation-print', 'true');
        style.textContent = '@page { size: landscape; margin: 0.35in; }';
        document.head.appendChild(style);
      }
    };

    const onAfterPrint = () => {
      document.documentElement.classList.remove('is-printing-simulation');
      document.querySelectorAll('[data-simulation-print]').forEach((node) => node.remove());
    };

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      onAfterPrint();
    };
  }, [rows]);

  const handleVariableChange = (nextId: string) => {
    const nextVariable = variables.find((variable) => variable.id === nextId);
    const nextValue = nextVariable ? currentValues[nextVariable.id] ?? 0 : 0;
    const nextRange = suggestedRange(nextValue, nextVariable?.isPercent);
    setVariableId(nextId);
    setMin(String(nextRange.min));
    setMax(String(nextRange.max));
    setStep(String(defaultStep(nextValue, nextVariable?.isPercent)));
    setRows(null);
    setError(null);
  };

  const handleRun = () => {
    const minValue = Number(min);
    const maxValue = Number(max);
    const stepValue = Number(step);

    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue) || !Number.isFinite(stepValue)) {
      setError('Enter numeric min, max, and step values.');
      setRows(null);
      return;
    }

    const steps = buildSteps(minValue, maxValue, stepValue);
    if (steps.length === 0) {
      setError('Max must be greater than min, and step must be greater than 0.');
      setRows(null);
      return;
    }

    setError(null);
    setRows(
      steps.map((input) => ({
        input,
        outputs: run({
          ...currentValues,
          [variableId]: input,
        }),
      })),
    );
  };

  const formatInput = (value: number) => {
    if (selectedVariable?.isPercent) return `${roundToDecimal(value, 2)}%`;
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const resultCount = rows?.length ?? 0;
  const assumptions = useMemo(
    () =>
      variables
        .filter((variable) => variable.id !== variableId)
        .map((variable) => ({
          label: variable.label,
          value: variable.isPercent
            ? `${roundToDecimal(currentValues[variable.id] ?? 0, 2)}%`
            : (currentValues[variable.id] ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 }),
        })),
    [variables, variableId, currentValues],
  );

  return (
    <section className="range-simulation">
      <div className="range-simulation-header">
        <h2>Range simulation</h2>
        <p>Sweep one input and compare every output below.</p>
      </div>

      <div className="range-simulation-controls">
        <label className="range-simulation-field">
          <span>Variable</span>
          <select value={variableId} onChange={(event) => handleVariableChange(event.target.value)}>
            {variables.map((variable) => (
              <option key={variable.id} value={variable.id}>
                {variable.label}
              </option>
            ))}
          </select>
        </label>
        <label className="range-simulation-field">
          <span>Min</span>
          <input type="text" inputMode="decimal" value={min} onChange={(event) => setMin(event.target.value)} />
        </label>
        <label className="range-simulation-field">
          <span>Max</span>
          <input type="text" inputMode="decimal" value={max} onChange={(event) => setMax(event.target.value)} />
        </label>
        <label className="range-simulation-field">
          <span>Step</span>
          <input type="text" inputMode="decimal" value={step} onChange={(event) => setStep(event.target.value)} />
        </label>
        <button type="button" className="range-simulation-run" onClick={handleRun}>
          Run simulation
        </button>
      </div>

      {error ? <p className="range-simulation-error">{error}</p> : null}

      {rows ? (
        <div className="range-simulation-results">
          {pageTitle ? <h1 className="range-simulation-print-title">{pageTitle}</h1> : null}
          <div className="range-simulation-summary">
            <h3>
              {selectedVariable?.label} from {formatInput(rows[0].input)} to {formatInput(rows[rows.length - 1].input)}
            </h3>
            <p>
              {resultCount} scenario{resultCount === 1 ? '' : 's'}
              {resultCount >= MAX_STEPS ? ` (showing ${MAX_STEPS} evenly spaced values from min to max)` : ''}
            </p>
          </div>

          <div className="range-simulation-table-wrap">
            <ul
              className="range-simulation-assumptions"
              style={{ gridTemplateColumns: `repeat(${assumptions.length}, minmax(0, 1fr))` }}
            >
              {assumptions.map((assumption) => (
                <li key={assumption.label}>
                  <span>{assumption.label}</span>
                  <strong>{assumption.value}</strong>
                </li>
              ))}
            </ul>
            <table>
              <thead>
                <tr>
                  <th>{selectedVariable?.label}</th>
                  {columns.map((column) => (
                    <th key={column.id}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.input}>
                    <td>{formatInput(row.input)}</td>
                    {columns.map((column) => (
                      <td key={column.id}>{column.format(row.outputs[column.id])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="range-simulation-charts">
            {columns.map((column) => (
              <OutputLineChart
                key={column.id}
                title={column.label}
                formatX={formatInput}
                formatY={column.format}
                points={rows.map((row) => ({ x: row.input, y: row.outputs[column.id] }))}
              />
            ))}
          </div>

          <button type="button" className="range-simulation-print" onClick={printSimulation}>
            Print simulation
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default RangeSimulation;
