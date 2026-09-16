import { describe, expect, it } from 'vitest';

import {
  allocationByCategory,
  costBasis,
  formatMoney,
  formatPercent,
  gain,
  gainPercent,
  marketValue,
  portfolioTotals,
  roundMoney,
} from './assetCalculations';
import { makeAsset } from '../test/renderWithProviders';

describe('per-asset calculations', () => {
  const asset = makeAsset({ quantity: 10, purchasePrice: 100, currentPrice: 150 });

  it('computes cost basis and market value', () => {
    expect(costBasis(asset)).toBe(1000);
    expect(marketValue(asset)).toBe(1500);
  });

  it('computes gain and percentage', () => {
    expect(gain(asset)).toBe(500);
    expect(gainPercent(asset)).toBe(50);
  });

  it('reports a loss as a negative number', () => {
    const losing = makeAsset({ quantity: 10, purchasePrice: 150, currentPrice: 100 });
    expect(gain(losing)).toBe(-500);
    expect(gainPercent(losing)).toBeCloseTo(-33.33, 2);
  });

  it('does not divide by zero when cost basis is zero', () => {
    expect(gainPercent(makeAsset({ quantity: 10, purchasePrice: 0, currentPrice: 5 }))).toBe(0);
  });

  it('rounds away binary floating point drift', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(marketValue(makeAsset({ quantity: 3, purchasePrice: 0.1, currentPrice: 0.1 }))).toBe(0.3);
  });
});

describe('portfolioTotals', () => {
  it('sums an empty portfolio without NaN', () => {
    expect(portfolioTotals([])).toEqual({
      count: 0, totalCost: 0, totalValue: 0, totalGain: 0, totalGainPercent: 0,
    });
  });

  it('aggregates across holdings', () => {
    const totals = portfolioTotals([
      makeAsset({ id: 'a', quantity: 10, purchasePrice: 100, currentPrice: 150 }),
      makeAsset({ id: 'b', quantity: 5, purchasePrice: 200, currentPrice: 180 }),
    ]);

    expect(totals.count).toBe(2);
    expect(totals.totalCost).toBe(2000);
    expect(totals.totalValue).toBe(2400);
    expect(totals.totalGain).toBe(400);
    expect(totals.totalGainPercent).toBe(20);
  });
});

describe('allocationByCategory', () => {
  it('groups by category and sorts by value descending', () => {
    const rows = allocationByCategory([
      makeAsset({ id: 'a', category: 'Equity', quantity: 1, currentPrice: 100 }),
      makeAsset({ id: 'b', category: 'Crypto', quantity: 1, currentPrice: 300 }),
      makeAsset({ id: 'c', category: 'Equity', quantity: 1, currentPrice: 100 }),
    ]);

    expect(rows.map((r) => r.category)).toEqual(['Crypto', 'Equity']);
    expect(rows[0].percent).toBe(60);
    expect(rows[1].percent).toBe(40);
  });

  it('returns an empty list for an empty portfolio', () => {
    expect(allocationByCategory([])).toEqual([]);
  });
});

describe('formatting', () => {
  it('formats money as USD', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50');
  });

  it('signs percentages', () => {
    expect(formatPercent(12.3)).toBe('+12.30%');
    expect(formatPercent(-4)).toBe('-4.00%');
  });
});
