import { Link } from 'react-router-dom';

import {
  formatMoney,
  formatPercent,
  formatQuantity,
  gain,
  gainPercent,
  marketValue,
} from '../domain/assetCalculations';

export function AssetTable({ assets, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Portfolio assets</caption>
        <thead>
          <tr>
            <th scope="col">Asset</th>
            <th scope="col">Category</th>
            <th scope="col" className="num">Quantity</th>
            <th scope="col" className="num">Buy price</th>
            <th scope="col" className="num">Current</th>
            <th scope="col" className="num">Market value</th>
            <th scope="col" className="num">Return</th>
            <th scope="col" className="num">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const assetGain = gain(asset);
            const tone = assetGain > 0 ? 'positive' : assetGain < 0 ? 'negative' : '';

            return (
              <tr key={asset.id}>
                <td>
                  <div className="ticker">{asset.ticker}</div>
                  <div className="asset-name">{asset.name}</div>
                </td>
                <td><span className="pill">{asset.category}</span></td>
                <td className="num">{formatQuantity(asset.quantity)}</td>
                <td className="num">{formatMoney(asset.purchasePrice)}</td>
                <td className="num">{formatMoney(asset.currentPrice)}</td>
                <td className="num">{formatMoney(marketValue(asset))}</td>
                <td className={`num ${tone}`}>
                  {formatMoney(assetGain)}
                  <div className="asset-name">{formatPercent(gainPercent(asset))}</div>
                </td>
                <td>
                  <div className="row-actions">
                    <Link className="btn btn-secondary btn-sm" to={`/assets/${asset.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(asset)}
                      aria-label={`Delete ${asset.ticker}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
