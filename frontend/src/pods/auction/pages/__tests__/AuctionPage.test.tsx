import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import type { AuctionDetail, AuctionToyStatus } from '@kristy/shared';
import { AuctionPage } from '../AuctionPage';
import { auctionService } from '../../services/auctionService';

vi.mock('../../services/auctionService', () => ({
  auctionService: {
    get: vi.fn(),
    setActive: vi.fn(),
    select: vi.fn(),
    navigate: vi.fn(),
    close: vi.fn(),
  },
}));

const makeAuction = (statuses: Record<string, AuctionToyStatus>): AuctionDetail => ({
  id: 'a',
  name: 'Summer',
  toys: Object.entries(statuses).map(([toyId, status]) => ({
    toyId,
    status,
    nextBidPrice: 50,
    salePrice: status === 'Sold' ? 60 : null,
    currentBidderId: status === 'Sold' ? 'tony' : null,
    toy: {
      id: toyId,
      name: `Toy ${toyId.toUpperCase()}`,
      photo: null,
      description: '',
      model: '',
      startPrice: 50,
    },
  })),
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <AuctionPage />
    </MemoryRouter>,
  );

const listButton = (name: RegExp) => screen.getByRole('button', { name });

describe('AuctionPage list selection', () => {
  beforeEach(() => {
    vi.mocked(auctionService.get).mockReset();
    vi.mocked(auctionService.select).mockReset();
  });

  it('shows the change confirmation when a New toy is clicked', async () => {
    vi.mocked(auctionService.get).mockResolvedValue(makeAuction({ A: 'Active', B: 'New' }));
    renderPage();

    await waitFor(() => expect(listButton(/Toy B/)).toBeInTheDocument());
    fireEvent.click(listButton(/Toy B/));

    expect(screen.getByText('Are you sure to change the active toy?')).toBeInTheDocument();
  });

  it('confirms the change and activates the clicked toy', async () => {
    vi.mocked(auctionService.get).mockResolvedValue(makeAuction({ A: 'Active', B: 'New' }));
    vi.mocked(auctionService.select).mockResolvedValue(makeAuction({ A: 'New', B: 'Active' }));
    renderPage();

    await waitFor(() => expect(listButton(/Toy B/)).toBeInTheDocument());
    fireEvent.click(listButton(/Toy B/));
    fireEvent.click(screen.getByRole('button', { name: 'Change toy' }));

    await waitFor(() => expect(auctionService.select).toHaveBeenCalledWith('B'));
    expect(screen.getByRole('heading', { name: 'Toy B' })).toBeInTheDocument();
  });

  it('cancels the change without selecting a toy', async () => {
    vi.mocked(auctionService.get).mockResolvedValue(makeAuction({ A: 'Active', B: 'New' }));
    renderPage();

    await waitFor(() => expect(listButton(/Toy B/)).toBeInTheDocument());
    fireEvent.click(listButton(/Toy B/));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(auctionService.select).not.toHaveBeenCalled();
    expect(screen.queryByText('Are you sure to change the active toy?')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Toy A' })).toBeInTheDocument();
  });

  it('shows the reopen confirmation for a Sold toy and resets it on confirm', async () => {
    vi.mocked(auctionService.get).mockResolvedValue(makeAuction({ A: 'Active', B: 'Sold' }));
    vi.mocked(auctionService.select).mockResolvedValue(makeAuction({ A: 'New', B: 'Active' }));
    renderPage();

    await waitFor(() => expect(listButton(/Toy B/)).toBeInTheDocument());
    fireEvent.click(listButton(/Toy B/));

    expect(screen.getByText(/reopen this sold toy/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reopen toy' }));

    await waitFor(() => expect(auctionService.select).toHaveBeenCalledWith('B'));
    expect(screen.getByRole('heading', { name: 'Toy B' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('€50')).toBeInTheDocument();
  });
});
