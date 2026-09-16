// Rounded at each step so displayed totals match the sum of displayed rows.
export function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function costBasis(asset) {
  return roundMoney(asset.quantity * asset.purchasePrice);
}

export function marketValue(asset) {
  return roundMoney(asset.quantity * asset.currentPrice);
}

export function gain(asset) {
  return roundMoney(marketValue(asset) - costBasis(asset));
}

export function gainPercent(asset) {
  const basis = costBasis(asset);
  if (basis === 0) return 0;
  return roundMoney((gain(asset) / basis) * 100);
}

export function portfolioTotals(assets) {
  const totalCost = roundMoney(assets.reduce((sum, a) => sum + costBasis(a), 0));
  const totalValue = roundMoney(assets.reduce((sum, a) => sum + marketValue(a), 0));
  const totalGain = roundMoney(totalValue - totalCost);

  return {
    count: assets.length,
    totalCost,
    totalValue,
    totalGain,
    totalGainPercent: totalCost === 0 ? 0 : roundMoney((totalGain / totalCost) * 100),
  };
}

export function allocationByCategory(assets) {
  const totalValue = portfolioTotals(assets).totalValue;
  const byCategory = new Map();

  for (const asset of assets) {
    byCategory.set(asset.category, roundMoney((byCategory.get(asset.category) ?? 0) + marketValue(asset)));
  }

  return [...byCategory.entries()]
    .map(([category, value]) => ({
      category,
      value,
      percent: totalValue === 0 ? 0 : roundMoney((value / totalValue) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

export const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export const formatPercent = (value) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

export const formatQuantity = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(value);
