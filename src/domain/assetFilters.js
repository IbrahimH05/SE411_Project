import { gainPercent, marketValue } from './assetCalculations';

export const SORT_OPTIONS = [
  { value: 'ticker', label: 'Ticker (A-Z)' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'value-desc', label: 'Market value (high to low)' },
  { value: 'value-asc', label: 'Market value (low to high)' },
  { value: 'gain-desc', label: 'Return (best first)' },
  { value: 'gain-asc', label: 'Return (worst first)' },
];

export function searchAssets(assets, query) {
  const term = query.trim().toLowerCase();
  if (!term) return assets;

  return assets.filter((asset) =>
    [asset.ticker, asset.name, asset.category, asset.notes]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term)),
  );
}

export function filterByCategory(assets, category) {
  if (!category || category === 'All') return assets;
  return assets.filter((asset) => asset.category === category);
}

export function sortAssets(assets, sortBy) {
  const sorted = [...assets];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'value-desc':
      return sorted.sort((a, b) => marketValue(b) - marketValue(a));
    case 'value-asc':
      return sorted.sort((a, b) => marketValue(a) - marketValue(b));
    case 'gain-desc':
      return sorted.sort((a, b) => gainPercent(b) - gainPercent(a));
    case 'gain-asc':
      return sorted.sort((a, b) => gainPercent(a) - gainPercent(b));
    case 'ticker':
    default:
      return sorted.sort((a, b) => a.ticker.localeCompare(b.ticker));
  }
}

export function applyFilters(assets, { query = '', category = 'All', sortBy = 'ticker' } = {}) {
  return sortAssets(filterByCategory(searchAssets(assets, query), category), sortBy);
}
