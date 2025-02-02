import { useState, useEffect } from 'react';
import { getQueryParamNumber } from '../utils/utils';

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

const booleanStates = ["requiresHandicappedParking"]
const dateStates = ["originalPurchaseDate"]

export function usePersistedState2<T>(
  page: string,
  key: string,
  initialValue: T,
  queryParams: URLSearchParams
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Check if there's a query param value, use it if available

  const _queryParamValue = getQueryParamNumber(key, queryParams);

  let queryParamValue;
  if(booleanStates.includes(key)){
    queryParamValue =  Boolean(_queryParamValue);
  }
  else if(dateStates.includes(key)){
    queryParamValue =  _queryParamValue;
  }
  else{
    queryParamValue =  _queryParamValue;
  }
 


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


