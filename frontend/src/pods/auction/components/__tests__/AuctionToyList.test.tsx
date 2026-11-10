import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { AuctionToyDetail, AuctionToyStatus } from '@kristy/shared';
import { AuctionToyList } from '../AuctionToyList';

const makeLot = (
  id: string,
  name: string,
  photo: string | null,
  status: AuctionToyStatus,
): AuctionToyDetail => ({
  toyId: id,
  status,
  nextBidPrice: 10,
  salePrice: null,
  currentBidderId: null,
  toy: { id, name, photo, description: '', model: '', startPrice: 10 },
});

describe('AuctionToyList', () => {
  it('renders one list item per auction toy', () => {
    render(
      <AuctionToyList
        toys={[
          makeLot('a', 'Bear', '/a.png', 'New'),
          makeLot('b', 'Robot', '/b.png', 'Active'),
        ]}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows each toy name', () => {
    render(
      <AuctionToyList
        toys={[
          makeLot('a', 'Bear', '/a.png', 'New'),
          makeLot('b', 'Robot', '/b.png', 'Active'),
        ]}
      />,
    );
    expect(screen.getByText('Bear')).toBeInTheDocument();
    expect(screen.getByText('Robot')).toBeInTheDocument();
  });

  it('shows the status of each toy', () => {
    render(
      <AuctionToyList
        toys={[
          makeLot('a', 'Bear', '/a.png', 'New'),
          makeLot('b', 'Robot', '/b.png', 'Active'),
          makeLot('c', 'Kite', '/c.png', 'On hold'),
          makeLot('d', 'Car', '/d.png', 'Sold'),
        ]}
      />,
    );
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('On hold')).toBeInTheDocument();
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });

  it('highlights the active toy', () => {
    render(
      <AuctionToyList
        toys={[
          makeLot('a', 'Bear', '/a.png', 'New'),
          makeLot('b', 'Robot', '/b.png', 'Active'),
        ]}
      />,
    );
    const activeItem = screen.getByText('Robot').closest('li');
    expect(activeItem).toHaveClass('toy-list__item--active');
  });

  it('shows "No image available" when a toy has no photo', () => {
    render(<AuctionToyList toys={[makeLot('a', 'Bear', null, 'New')]} />);
    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('shows the toy photo inside the 4:3 thumbnail frame when a photo exists', () => {
    render(<AuctionToyList toys={[makeLot('a', 'Bear', '/a.png', 'New')]} />);
    expect(screen.getByAltText('Bear')).toHaveAttribute('src', '/a.png');
  });
});
