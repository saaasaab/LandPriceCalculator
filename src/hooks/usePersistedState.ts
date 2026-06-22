import { useState, useEffect } from 'react';
import { getQueryParamNumber, parseQueryParamValue } from '../utils/utils';

export function usePersistedState2<T>(
  page: string,
  key: string,
  initialValue: T,
  queryParams: URLSearchParams
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const rawQueryParam = getQueryParamNumber(key, queryParams);
  const queryParamValue =
    rawQueryParam !== undefined
      ? parseQueryParamValue<T>(key, rawQueryParam, initialValue)
      : undefined;

  const combinedKey = `${page}_${key}`;
  const fromLocal = localStorage.getItem(combinedKey);
  const storedValue = fromLocal ? fromLocal : null;

  const initial = queryParamValue !== undefined
    ? queryParamValue
    : storedValue
      ? JSON.parse(storedValue)
      : initialValue;

  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (value !== undefined) {
      localStorage.setItem(combinedKey, JSON.stringify(value));
    }
  }, [combinedKey, value]);

  return [value, setValue];
}
