import { describe, expect, it } from 'vitest';

import { applyFilters, filterByCategory, searchAssets, sortAssets } from './assetFilters';
import { makeAsset } from '../test/renderWithProviders';

const portfolio = [
  makeAsset({ id: '1', ticker: 'AAPL', name: 'Apple Inc.', category: 'Equity', quantity: 10, purchasePrice: 100, currentPrice: 150 }),
  makeAsset({ id: '2', ticker: 'BTC', name: 'Bitcoin', category: 'Crypto', quantity: 1, purchasePrice: 100, currentPrice: 50, notes: 'volatile' }),
  makeAsset({ id: '3', ticker: 'VWRA', name: 'Vanguard All-World', category: 'Fund', quantity: 2, purchasePrice: 100, currentPrice: 110 }),
];

describe('searchAssets', () => {
  it('returns everything for an empty query', () => {
    expect(searchAssets(portfolio, '   ')).toHaveLength(3);
  });

  it('matches ticker case-insensitively', () => {
    expect(searchAssets(portfolio, 'aapl').map((a) => a.id)).toEqual(['1']);
  });

  it('matches partial names, category and notes', () => {
    expect(searchAssets(portfolio, 'vanguard').map((a) => a.id)).toEqual(['3']);
    expect(searchAssets(portfolio, 'crypto').map((a) => a.id)).toEqual(['2']);
    expect(searchAssets(portfolio, 'volatile').map((a) => a.id)).toEqual(['2']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchAssets(portfolio, 'zzzz')).toEqual([]);
  });
});

describe('filterByCategory', () => {
  it('passes everything through for All', () => {
    expect(filterByCategory(portfolio, 'All')).toHaveLength(3);
  });

  it('keeps only the chosen category', () => {
    expect(filterByCategory(portfolio, 'Crypto').map((a) => a.id)).toEqual(['2']);
  });
});

describe('sortAssets', () => {
  it('does not mutate the input array', () => {
    const before = portfolio.map((a) => a.id);
    sortAssets(portfolio, 'value-desc');
    expect(portfolio.map((a) => a.id)).toEqual(before);
  });

  it('sorts by ticker, market value and return', () => {
    expect(sortAssets(portfolio, 'ticker').map((a) => a.ticker)).toEqual(['AAPL', 'BTC', 'VWRA']);
    expect(sortAssets(portfolio, 'value-desc').map((a) => a.id)).toEqual(['1', '3', '2']);
    expect(sortAssets(portfolio, 'gain-desc').map((a) => a.id)).toEqual(['1', '3', '2']);
    expect(sortAssets(portfolio, 'gain-asc').map((a) => a.id)).toEqual(['2', '3', '1']);
  });
});

describe('applyFilters', () => {
  it('applies the sort after the search', () => {
    // 'a' matches all three: AAPL, Vanguard, and BTC via its 'volatile' note.
    const result = applyFilters(portfolio, { query: 'a', category: 'All', sortBy: 'value-desc' });
    expect(result.map((a) => a.id)).toEqual(['1', '3', '2']);
  });

  it('narrows by category after searching', () => {
    const result = applyFilters(portfolio, { query: 'a', category: 'Crypto', sortBy: 'ticker' });
    expect(result.map((a) => a.id)).toEqual(['2']);
  });

  it('returns nothing when search and category disagree', () => {
    expect(applyFilters(portfolio, { query: 'bitcoin', category: 'Equity' })).toEqual([]);
  });
});
