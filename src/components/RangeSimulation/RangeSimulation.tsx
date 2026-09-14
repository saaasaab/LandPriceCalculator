import { useEffect, useMemo, useState } from 'react';
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

const MAX_STEPS = 40;

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

const buildSteps = (min: number, max: number, step: number): number[] => {
  if (!(step > 0) || max < min) return [];

  const values: number[] = [];
  const decimals = step < 1 ? 4 : 2;
  for (let value = min; value <= max + step * 0.0001; value += step) {
    values.push(roundToDecimal(value, decimals));
    if (values.length >= MAX_STEPS) break;
  }
  return values;
};

const printSimulation = () => {
  window.print();
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
              {resultCount >= MAX_STEPS ? ` (capped at ${MAX_STEPS})` : ''}
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

          <button type="button" className="range-simulation-print" onClick={printSimulation}>
            Print simulation
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default RangeSimulation;
