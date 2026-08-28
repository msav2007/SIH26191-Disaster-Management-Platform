/**
 * Formatting utilities for presentation boundaries.
 * Calculations must remain in full floating-point precision internally;
 * rounding is performed strictly at the display layer via these helpers.
 */

export function formatScore(score: number, decimals = 1): string {
  if (isNaN(score)) return '0.0';
  return score.toFixed(decimals);
}

export function formatDelta(delta: number, decimals = 1): string {
  if (isNaN(delta)) return '0.0';
  if (delta > 0) return `+${delta.toFixed(decimals)}`;
  if (delta < 0) return delta.toFixed(decimals);
  return '0.0';
}

export function formatPercent(val: number, decimals = 1, showSign = true): string {
  if (isNaN(val)) return '0.0%';
  const formatted = val.toFixed(decimals);
  if (showSign && val > 0) return `+${formatted}%`;
  return `${formatted}%`;
}

export function formatPopulation(pop: number): string {
  if (isNaN(pop)) return '0';
  return Math.round(pop).toLocaleString('en-IN');
}

export function formatHeadroom(headroom: number): string {
  if (isNaN(headroom)) return '0';
  return Math.round(headroom).toLocaleString('en-IN');
}
