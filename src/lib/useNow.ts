import React from 'react';
import { useHarmonicIntervalFn } from 'react-use';

export function useNow(msPrecision: number = 1000): Date {
  const [now, setNow] = React.useState(new Date());
  useHarmonicIntervalFn(() => setNow(new Date()), msPrecision);
  return now;
}
