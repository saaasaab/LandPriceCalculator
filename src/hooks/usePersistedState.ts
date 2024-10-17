import { useState, useEffect } from 'react';

export function usePersistedState<T>(
  page: string,
  key: string,
  initialValue: T,
  queryParamValue: T | undefined
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Check if there's a query param value, use it if available

  const combinedKey = `${page}_${key}`;
  const fromLocal = localStorage.getItem(combinedKey);
  const storedValue = fromLocal ? fromLocal : null;

  const initial = queryParamValue !== undefined ? queryParamValue
    : storedValue ? JSON.parse(storedValue)
      : initialValue;

  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (value !== undefined) {
      localStorage.setItem(combinedKey, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
}
