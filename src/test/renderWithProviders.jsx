import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../App';
import { AssetsProvider } from '../state/AssetsProvider';

export function renderApp({ assets = [], route = '/' } = {}) {
  return render(
    <AssetsProvider initialAssets={assets}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </AssetsProvider>,
  );
}

export function makeAsset(overrides = {}) {
  return {
    id: 'test-1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    category: 'Equity',
    quantity: 10,
    purchasePrice: 100,
    currentPrice: 150,
    purchaseDate: '2025-01-15',
    notes: '',
    ...overrides,
  };
}
