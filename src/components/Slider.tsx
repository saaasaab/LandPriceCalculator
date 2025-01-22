import React, { useState } from "react";

interface SliderProps {
  id: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  id,
  label,
  min = 0,
  max = 100,
  step = 1,
  value = 50,
  onChange,
}) => {
  const [sliderValue, setSliderValue] = useState<number>(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setSliderValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="slider">
      <label htmlFor={id} className="slider__label">
        {label}: {sliderValue}%
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={handleChange}
        className="slider__input"
      />
    </div>
  );
};


export default Slider;