// Spacing algorithm.
//
// WolframAlpha query:
// plot cumulative sum fibonnaci(n + 1) * (0.5 + m/20) / log(2, p + 2) for n in [1,2,3] where m = 10 and p = 0

import { Item } from '@/lib/Item';

export interface SpacingParams {
  /** consecutive review number (number of times this item has been postponed) */
  n: number;
}

export function initialParams(): SpacingParams {
  return {
    n: 0,
  };
}

export interface SpacingResult {
  increment: number;
  params: SpacingParams;
}

export function space(item: Item, params: SpacingParams) {
  const baseIncrement = fibonacci(params.n);
  const ratio = timeToReadRatio(item.meta?.minutes) * pinRatio(item.nPins);
  const jitter = 0.9 + 0.2 * Math.random(); // [0.9, 1.1)
  const increment = baseIncrement * ratio * jitter;
  return { increment, params: { ...params, n: params.n + 1 } };
}

// The more times you pinned the item, the often it will re-appear
// (i.e., you’re definitely interested in it but probably didn’t
// have time to read it)
function pinRatio(nPins: number): number {
  return 1 / Math.log2((nPins ?? 0) + 2);
}

// Shorter items are supposedly easier to pick / commit to reading, so
// we show them more often.
//
// And you’re not interested in reading a 1-minute article after a
// couple of reminders, it’s supposedly not interesting? (Maybe,
// reminders will nudge user to read or delete.)
//
// TODO: hypothesis: if short item is not read after N reminders, it
// likely will never be and we can deprioritize them.
function timeToReadRatio(minutes: number | null | undefined): number {
  if (!minutes) {
    minutes = 10;
  }

  minutes = between(minutes, 1, 60);
  return 0.5 + minutes / 20;
}

// slightly tweaked fibonacci:
// 0 1 2 3 5 8 …
function fibonacci(n: number): number {
  if (n === 0) {
    return 0;
  }

  const sqrt5 = Math.sqrt(5);
  return (
    (Math.pow(1 + sqrt5, n) - Math.pow(1 - sqrt5, n)) / sqrt5 / Math.pow(2, n)
  );
}

function between(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}
