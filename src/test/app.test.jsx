import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { makeAsset, renderApp } from './renderWithProviders';

const portfolio = [
  makeAsset({ id: '1', ticker: 'AAPL', name: 'Apple Inc.', category: 'Equity', quantity: 10, purchasePrice: 100, currentPrice: 150 }),
  makeAsset({ id: '2', ticker: 'BTC', name: 'Bitcoin', category: 'Crypto', quantity: 1, purchasePrice: 100, currentPrice: 50 }),
];

describe('navigation', () => {
  it('moves between features using the menu', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio });

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Assets' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'About' }));
    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument();
  });

  it('shows every team member with their student id', () => {
    renderApp({ assets: portfolio, route: '/about' });
    expect(screen.getByText('Ibrahim Alhalaki')).toBeInTheDocument();
    expect(screen.getByText('Muhammad Abanmi')).toBeInTheDocument();
    expect(screen.getByText('Firas Ehab Mustafa Ismail')).toBeInTheDocument();
    expect(screen.getByText('223110482')).toBeInTheDocument();
    expect(screen.getByText('222110412')).toBeInTheDocument();
    expect(screen.getByText('222110757')).toBeInTheDocument();
  });

  it('shows no shortfall note now the team is complete', () => {
    renderApp({ assets: portfolio, route: '/about' });
    expect(screen.queryByText(/of 3 members/)).not.toBeInTheDocument();
  });

  it('leaves no placeholder text on the about page', () => {
    renderApp({ assets: portfolio, route: '/about' });
    expect(screen.queryByText(/TODO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument();
  });
});

describe('dashboard', () => {
  it('shows portfolio totals', () => {
    renderApp({ assets: portfolio });
    expect(screen.getByText('$1,550.00')).toBeInTheDocument();
    expect(screen.getByText('$1,100.00')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
  });

  it('prompts to add an asset when the portfolio is empty', () => {
    renderApp({ assets: [] });
    expect(screen.getByText('No assets yet')).toBeInTheDocument();
  });
});

describe('displaying and searching', () => {
  it('lists every asset', () => {
    renderApp({ assets: portfolio, route: '/assets' });
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(3);
  });

  it('filters the table as the user types', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets' });

    await user.type(screen.getByRole('searchbox'), 'bitcoin');

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
  });

  it('shows an empty state and can clear filters when nothing matches', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets' });

    await user.type(screen.getByRole('searchbox'), 'zzzzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets' });

    await user.selectOptions(screen.getByLabelText('Filter by category'), 'Crypto');

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
  });
});

describe('adding an asset', () => {
  it('rejects an empty form and does not navigate away', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets/new' });

    await user.click(screen.getByRole('button', { name: 'Add asset' }));

    expect(await screen.findByText('Ticker is required')).toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Add asset' })).toBeInTheDocument();
  });

  it('adds a valid asset and shows it in the table', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets/new' });

    await user.type(screen.getByLabelText('Ticker'), 'msft');
    await user.type(screen.getByLabelText('Name'), 'Microsoft Corporation');
    await user.type(screen.getByLabelText('Quantity'), '5');
    await user.type(screen.getByLabelText('Purchase price (USD)'), '400');
    await user.type(screen.getByLabelText('Current price (USD)'), '430');
    await user.type(screen.getByLabelText('Purchase date'), '2025-01-10');

    await user.click(screen.getByRole('button', { name: 'Add asset' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
    expect(screen.getByText('MSFT')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
  });

  it('blocks a duplicate ticker', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets/new' });

    await user.type(screen.getByLabelText('Ticker'), 'AAPL');
    await user.tab();

    expect(await screen.findByText('AAPL is already in the portfolio')).toBeInTheDocument();
  });
});

describe('updating an asset', () => {
  it('pre-fills the form and saves changes', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets/1/edit' });

    const priceInput = screen.getByLabelText('Current price (USD)');
    expect(priceInput).toHaveValue(150);

    await user.clear(priceInput);
    await user.type(priceInput, '200');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
  });

  it('redirects to the list for an unknown id', () => {
    renderApp({ assets: portfolio, route: '/assets/does-not-exist/edit' });
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
  });
});

describe('deleting an asset', () => {
  it('asks for confirmation and can be cancelled', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets' });

    await user.click(screen.getByRole('button', { name: 'Delete AAPL' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('removes the asset once confirmed', async () => {
    const user = userEvent.setup();
    renderApp({ assets: portfolio, route: '/assets' });

    await user.click(screen.getByRole('button', { name: 'Delete AAPL' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByText('AAPL')).not.toBeInTheDocument());
    expect(screen.getByText(/AAPL removed from the portfolio/)).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
  });
});

describe('active navigation state', () => {
  it('marks only one menu item current at a time', () => {
    renderApp({ assets: portfolio, route: '/assets/new' });
    const current = screen.getAllByRole('link').filter((el) => el.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Add asset');
  });

  it('keeps Assets current while editing', () => {
    renderApp({ assets: portfolio, route: '/assets/1/edit' });
    const current = screen.getAllByRole('link').filter((el) => el.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Assets');
  });
});
