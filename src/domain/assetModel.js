export const CATEGORIES = ['Equity', 'Bond', 'Fund', 'Crypto', 'Cash'];

export const EMPTY_ASSET = {
  ticker: '',
  name: '',
  category: 'Equity',
  quantity: '',
  purchasePrice: '',
  currentPrice: '',
  purchaseDate: '',
  notes: '',
};

export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Form fields arrive as strings; the stored collection holds real numbers.
export function normaliseAsset(form) {
  return {
    ticker: form.ticker.trim().toUpperCase(),
    name: form.name.trim(),
    category: form.category,
    quantity: Number(form.quantity),
    purchasePrice: Number(form.purchasePrice),
    currentPrice: Number(form.currentPrice),
    purchaseDate: form.purchaseDate,
    notes: form.notes.trim(),
  };
}

export function toFormValues(asset) {
  return {
    ticker: asset.ticker,
    name: asset.name,
    category: asset.category,
    quantity: String(asset.quantity),
    purchasePrice: String(asset.purchasePrice),
    currentPrice: String(asset.currentPrice),
    purchaseDate: asset.purchaseDate,
    notes: asset.notes ?? '',
  };
}
