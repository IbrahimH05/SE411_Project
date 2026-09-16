import { createId } from '../domain/assetModel';

// Part 1 keeps the portfolio as a plain in-memory collection - no database.
export const seedAssets = [
  { ticker: 'AAPL', name: 'Apple Inc.', category: 'Equity', quantity: 50, purchasePrice: 178.2, currentPrice: 214.6, purchaseDate: '2025-03-14', notes: 'Core holding' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', category: 'Equity', quantity: 25, purchasePrice: 402.75, currentPrice: 431.1, purchaseDate: '2025-01-22', notes: '' },
  { ticker: 'VWRA', name: 'Vanguard FTSE All-World UCITS ETF', category: 'Fund', quantity: 120, purchasePrice: 118.4, currentPrice: 132.85, purchaseDate: '2024-11-05', notes: 'Global index tracker' },
  { ticker: 'BTC', name: 'Bitcoin', category: 'Crypto', quantity: 0.35, purchasePrice: 61250, currentPrice: 58400, purchaseDate: '2025-06-02', notes: 'High volatility' },
  { ticker: 'SA10Y', name: 'Saudi Government Bond 2035', category: 'Bond', quantity: 40, purchasePrice: 1000, currentPrice: 1042.5, purchaseDate: '2024-09-18', notes: 'Held to maturity' },
  { ticker: 'USD', name: 'Cash reserve', category: 'Cash', quantity: 8500, purchasePrice: 1, currentPrice: 1, purchaseDate: '2025-01-02', notes: 'Settlement buffer' },
].map((asset) => ({ ...asset, id: createId() }));
