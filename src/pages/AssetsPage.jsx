import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AssetTable } from '../components/AssetTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { formatMoney, portfolioTotals } from '../domain/assetCalculations';
import { SORT_OPTIONS, applyFilters } from '../domain/assetFilters';
import { CATEGORIES } from '../domain/assetModel';
import { useAssets } from '../state/AssetsContext';

export function AssetsPage() {
  const { assets, deleteAsset } = useAssets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('ticker');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState('');

  const visible = useMemo(
    () => applyFilters(assets, { query, category, sortBy }),
    [assets, query, category, sortBy],
  );

  const visibleTotals = portfolioTotals(visible);

  const confirmDelete = () => {
    deleteAsset(pendingDelete.id);
    setNotice(`${pendingDelete.ticker} removed from the portfolio.`);
    setPendingDelete(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Assets</h1>
          <p>
            Showing {visible.length} of {assets.length} holdings · {formatMoney(visibleTotals.totalValue)}
          </p>
        </div>
        <Link className="btn btn-primary" to="/assets/new">Add asset</Link>
      </div>

      {notice && <div className="banner banner-success" role="status">{notice}</div>}

      <div className="toolbar">
        <div className="field field-search">
          <label className="sr-only" htmlFor="search">Search assets</label>
          <input
            id="search"
            type="search"
            placeholder="Search by ticker, name, category or notes…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="sr-only" htmlFor="category-filter">Filter by category</label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="sr-only" htmlFor="sort-by">Sort by</label>
          <select id="sort-by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState
            title={assets.length === 0 ? 'No assets yet' : 'No matches'}
            message={
              assets.length === 0
                ? 'Add your first holding to start tracking the portfolio.'
                : 'No asset matches the current search and filter. Try a different term.'
            }
            action={
              assets.length === 0 ? (
                <Link className="btn btn-primary" to="/assets/new">Add asset</Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setQuery(''); setCategory('All'); }}
                >
                  Clear filters
                </button>
              )
            }
          />
        </div>
      ) : (
        <AssetTable assets={visible} onDelete={setPendingDelete} />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete ${pendingDelete.ticker}?`}
          message={`${pendingDelete.name} will be removed from the portfolio. This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
