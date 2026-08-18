import { useEffect, useId, useState } from "react";
import { formatNumberWithCommas } from "../../utils/utils";

function parseNumericInput(value: string): number | null {
    const cleaned = value.replace(/,/g, "").trim();
    if (cleaned === "" || cleaned === ".") return null;
    if (!/^-?\d*\.?\d*$/.test(cleaned)) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
}

const InputRow = ({
    description,
    setInput,
    cellValues,
    isPercent,
    isGreyedOut,
    min,
    max,
    allowZero = true,
}:
    {
        cellValues: (string | number | boolean | undefined)[];
        description?: string;
        setInput?: (value: string) => void;
        isMobile: boolean;
        isPercent?: boolean;
        isGreyedOut?: boolean;
        min?: number;
        max?: number;
        allowZero?: boolean;
    }) => {
    const label = `${cellValues[0] ?? ""}`;
    const inputId = useId();
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;
    const [cell, setCell] = useState(`${cellValues[1] ?? ""}`);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!error) {
            setCell(`${cellValues[1] ?? ""}`);
        }
    }, [cellValues[1], error]);

    const validate = (rawValue: string): string | null => {
        const parsed = parseNumericInput(rawValue);
        if (parsed === null) {
            return "Enter a number.";
        }
        const percentMax = isPercent ? 100 : max;
        const minimum = min ?? (allowZero ? 0 : 0.0000001);
        if (parsed < minimum) {
            return allowZero && minimum <= 0
                ? "Enter a number of 0 or greater."
                : "Enter a number greater than 0.";
        }
        if (percentMax !== undefined && parsed > percentMax) {
            return isPercent
                ? "Enter a number from 0 to 100."
                : `Enter a number of ${percentMax} or less.`;
        }
        return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setCell(rawValue);

        const trimmed = rawValue.trim();
        if (trimmed === "" || trimmed === "-" || trimmed.endsWith(".")) {
            setError(trimmed === "" ? "Enter a number." : null);
            return;
        }

        const validationError = validate(rawValue);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        const parsed = parseNumericInput(rawValue);
        if (parsed === null) return;
        setInput && setInput(formatNumberWithCommas(rawValue.replace(/,/g, "")));
    };

    return (
        <div className={`input-row ${isGreyedOut ? "is-greyed-out" : ""} ${error ? "has-error" : ""}`}>
            <div className="info-cell">
                <label htmlFor={inputId}>
                    <h4>{label}</h4>
                </label>
                {description ? (
                    <div id={descriptionId} className="description-cell is-visible">
                        {description}
                    </div>
                ) : null}
                {error ? (
                    <p id={errorId} className="input-error" role="alert">{error}</p>
                ) : null}
            </div>

            <div className="input-cell">
                <input
                    id={inputId}
                    className="centered"
                    type="text"
                    inputMode="decimal"
                    value={cell}
                    aria-invalid={Boolean(error)}
                    aria-describedby={[description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
                    onChange={handleChange}
                    onWheel={(value) => (value.target as HTMLElement).blur()}
                    onFocus={(value) => value.target.select()}
                />
            </div>
        </div>
    );
};

export default InputRow;
