import type { AuctionToyDetail } from '@kristy/shared';
import { buildAuctionToyListItems } from '../viewModel';
import { AuctionToyListItem } from './AuctionToyListItem';

interface AuctionToyListProps {
  toys: AuctionToyDetail[];
}

/** Left panel listing every toy in the auction with name, image and status. */
export function AuctionToyList({ toys }: AuctionToyListProps) {
  const items = buildAuctionToyListItems(toys);
  return (
    <aside className="toy-list" aria-label="Auction toys">
      <h2 className="toy-list__title">Toys</h2>
      {items.length === 0 ? (
        <p className="muted">No toys in this auction.</p>
      ) : (
        <ol className="toy-list__items">
          {items.map((item) => (
            <AuctionToyListItem key={item.toyId} item={item} />
          ))}
        </ol>
      )}
    </aside>
  );
}
