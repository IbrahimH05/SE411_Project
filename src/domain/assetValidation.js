import { CATEGORIES } from './assetModel';

const TICKER_PATTERN = /^[A-Z0-9.-]{1,10}$/;

function numberField(raw, label, { allowZero = false } = {}) {
  if (raw === '' || raw === null || raw === undefined) return `${label} is required`;
  const value = Number(raw);
  if (Number.isNaN(value)) return `${label} must be a number`;
  if (!Number.isFinite(value)) return `${label} must be a finite number`;
  if (value < 0) return `${label} cannot be negative`;
  if (!allowZero && value === 0) return `${label} must be greater than zero`;
  return null;
}

export function validateAsset(form, { existingAssets = [], editingId = null } = {}) {
  const errors = {};

  const ticker = form.ticker.trim().toUpperCase();
  if (!ticker) {
    errors.ticker = 'Ticker is required';
  } else if (!TICKER_PATTERN.test(ticker)) {
    errors.ticker = 'Use 1-10 letters, digits, dots or hyphens';
  } else if (
    existingAssets.some((a) => a.ticker === ticker && a.id !== editingId)
  ) {
    errors.ticker = `${ticker} is already in the portfolio`;
  }

  if (!form.name.trim()) {
    errors.name = 'Name is required';
  } else if (form.name.trim().length > 80) {
    errors.name = 'Name must be 80 characters or fewer';
  }

  if (!CATEGORIES.includes(form.category)) {
    errors.category = 'Choose a category';
  }

  const quantityError = numberField(form.quantity, 'Quantity');
  if (quantityError) errors.quantity = quantityError;

  const purchaseError = numberField(form.purchasePrice, 'Purchase price');
  if (purchaseError) errors.purchasePrice = purchaseError;

  const currentError = numberField(form.currentPrice, 'Current price', { allowZero: true });
  if (currentError) errors.currentPrice = currentError;

  if (!form.purchaseDate) {
    errors.purchaseDate = 'Purchase date is required';
  } else if (Number.isNaN(Date.parse(form.purchaseDate))) {
    errors.purchaseDate = 'Purchase date is not a valid date';
  } else if (new Date(form.purchaseDate) > new Date()) {
    errors.purchaseDate = 'Purchase date cannot be in the future';
  }

  if (form.notes && form.notes.length > 280) {
    errors.notes = 'Notes must be 280 characters or fewer';
  }

  return errors;
}

export const isValid = (errors) => Object.keys(errors).length === 0;
