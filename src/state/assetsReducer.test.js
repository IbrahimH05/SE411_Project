import { describe, expect, it } from 'vitest';

import { ACTIONS, assetsReducer } from './assetsReducer';
import { makeAsset } from '../test/renderWithProviders';

describe('assetsReducer', () => {
  const initial = [makeAsset({ id: 'a', ticker: 'AAPL' })];

  it('adds an asset and assigns an id', () => {
    const next = assetsReducer(initial, {
      type: ACTIONS.ADD,
      payload: { ticker: 'TSLA', name: 'Tesla', category: 'Equity', quantity: 1, purchasePrice: 1, currentPrice: 2 },
    });

    expect(next).toHaveLength(2);
    expect(next[1].id).toBeTruthy();
    expect(next[1].id).not.toBe('a');
  });

  it('does not mutate the previous state', () => {
    assetsReducer(initial, { type: ACTIONS.ADD, payload: { ticker: 'X' } });
    expect(initial).toHaveLength(1);
  });

  it('updates only the targeted asset', () => {
    const state = [...initial, makeAsset({ id: 'b', ticker: 'BTC' })];
    const next = assetsReducer(state, {
      type: ACTIONS.UPDATE,
      payload: { id: 'b', changes: { currentPrice: 999 } },
    });

    expect(next[0].currentPrice).toBe(150);
    expect(next[1].currentPrice).toBe(999);
    expect(next[1].ticker).toBe('BTC');
  });

  it('deletes by id', () => {
    expect(assetsReducer(initial, { type: ACTIONS.DELETE, payload: { id: 'a' } })).toEqual([]);
  });

  it('ignores a delete for an unknown id', () => {
    expect(assetsReducer(initial, { type: ACTIONS.DELETE, payload: { id: 'nope' } })).toHaveLength(1);
  });

  it('replaces everything on reset', () => {
    const replacement = [makeAsset({ id: 'z' })];
    expect(assetsReducer(initial, { type: ACTIONS.RESET, payload: { assets: replacement } })).toEqual(replacement);
  });

  it('returns the same state for an unknown action', () => {
    expect(assetsReducer(initial, { type: 'nonsense' })).toBe(initial);
  });
});
