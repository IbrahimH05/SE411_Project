import { describe, expect, it } from 'vitest';

import { isValid, validateAsset } from './assetValidation';
import { makeAsset } from '../test/renderWithProviders';

const validForm = {
  ticker: 'TSLA',
  name: 'Tesla Inc.',
  category: 'Equity',
  quantity: '10',
  purchasePrice: '200',
  currentPrice: '250',
  purchaseDate: '2025-01-15',
  notes: '',
};

describe('validateAsset', () => {
  it('accepts a valid form', () => {
    expect(isValid(validateAsset(validForm))).toBe(true);
  });

  it('requires ticker, name, quantity, prices and date', () => {
    const errors = validateAsset({
      ticker: '', name: '', category: 'Equity',
      quantity: '', purchasePrice: '', currentPrice: '', purchaseDate: '', notes: '',
    });

    expect(Object.keys(errors).sort()).toEqual(
      ['currentPrice', 'name', 'purchaseDate', 'purchasePrice', 'quantity', 'ticker'],
    );
  });

  it('rejects a malformed ticker', () => {
    expect(validateAsset({ ...validForm, ticker: 'not a ticker!' }).ticker).toMatch(/1-10 letters/);
  });

  it('rejects a duplicate ticker', () => {
    const errors = validateAsset(validForm, { existingAssets: [makeAsset({ ticker: 'TSLA' })] });
    expect(errors.ticker).toBe('TSLA is already in the portfolio');
  });

  it('allows an asset to keep its own ticker while editing', () => {
    const existing = makeAsset({ id: 'keep-me', ticker: 'TSLA' });
    const errors = validateAsset(validForm, { existingAssets: [existing], editingId: 'keep-me' });
    expect(errors.ticker).toBeUndefined();
  });

  it('rejects negative and zero quantity', () => {
    expect(validateAsset({ ...validForm, quantity: '-5' }).quantity).toMatch(/cannot be negative/);
    expect(validateAsset({ ...validForm, quantity: '0' }).quantity).toMatch(/greater than zero/);
  });

  it('rejects non-numeric prices', () => {
    expect(validateAsset({ ...validForm, purchasePrice: 'abc' }).purchasePrice).toMatch(/must be a number/);
  });

  it('allows a current price of zero but not a purchase price of zero', () => {
    expect(validateAsset({ ...validForm, currentPrice: '0' }).currentPrice).toBeUndefined();
    expect(validateAsset({ ...validForm, purchasePrice: '0' }).purchasePrice).toBeDefined();
  });

  it('rejects a future purchase date', () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const errors = validateAsset({ ...validForm, purchaseDate: nextYear.toISOString().slice(0, 10) });
    expect(errors.purchaseDate).toMatch(/cannot be in the future/);
  });

  it('caps notes length', () => {
    expect(validateAsset({ ...validForm, notes: 'x'.repeat(281) }).notes).toMatch(/280 characters/);
  });
});
