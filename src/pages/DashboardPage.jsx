import { Link } from 'react-router-dom';

import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';
import {
  allocationByCategory,
  formatMoney,
  formatPercent,
  gainPercent,
  portfolioTotals,
} from '../domain/assetCalculations';
import { sortAssets } from '../domain/assetFilters';
import { useAssets } from '../state/AssetsContext';

export function DashboardPage() {
  const { assets } = useAssets();
  const totals = portfolioTotals(assets);
  const allocation = allocationByCategory(assets);
  const movers = sortAssets(assets, 'gain-desc');
  const best = movers[0];
  const worst = movers[movers.length - 1];

  const gainTone = totals.totalGain > 0 ? 'positive' : totals.totalGain < 0 ? 'negative' : undefined;

  if (assets.length === 0) {
    return (
      <>
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Portfolio overview</p>
          </div>
        </div>
        <div className="card">
          <EmptyState
            title="No assets yet"
            message="Add your first holding to see portfolio totals and allocation."
            action={<Link className="btn btn-primary" to="/assets/new">Add asset</Link>}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Portfolio overview across {totals.count} holdings</p>
        </div>
        <Link className="btn btn-primary" to="/assets/new">Add asset</Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Market value" value={formatMoney(totals.totalValue)} sub={`${totals.count} holdings`} />
        <StatCard label="Cost basis" value={formatMoney(totals.totalCost)} sub="Total invested" />
        <StatCard
          label="Unrealised gain"
          value={formatMoney(totals.totalGain)}
          sub={formatPercent(totals.totalGainPercent)}
          tone={gainTone}
        />
        <StatCard
          label="Best performer"
          value={best ? best.ticker : '—'}
          sub={best ? formatPercent(gainPercent(best)) : undefined}
          tone={best && gainPercent(best) >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <div className="card">
        <h2 className="card-title">Allocation by category</h2>
        {allocation.map((row) => (
          <div className="alloc-row" key={row.category}>
            <span className="pill">{row.category}</span>
            <div className="alloc-track">
              <div className="alloc-fill" style={{ width: `${Math.max(row.percent, 1.5)}%` }} />
            </div>
            <span className="alloc-value">{formatMoney(row.value)} · {row.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="card-title">Movers</h2>
        <div className="stat-grid" style={{ marginBottom: 0 }}>
          <StatCard
            label="Biggest gain"
            value={best.ticker}
            sub={`${best.name} · ${formatPercent(gainPercent(best))}`}
            tone="positive"
          />
          <StatCard
            label="Biggest loss"
            value={worst.ticker}
            sub={`${worst.name} · ${formatPercent(gainPercent(worst))}`}
            tone={gainPercent(worst) < 0 ? 'negative' : undefined}
          />
        </div>
      </div>
    </>
  );
}
