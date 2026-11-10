import { ImageFrame } from '../../../ui/atoms/ImageFrame';
import type { AuctionToyListItem as AuctionToyListItemData } from '../viewModel';
import { ToyStatusBadge } from './ToyStatusBadge';

interface AuctionToyListItemProps {
  item: AuctionToyListItemData;
}

/** One toy in the auction left panel: proportional thumbnail, name and status. */
export function AuctionToyListItem({ item }: AuctionToyListItemProps) {
  const isActive = item.status === 'Active';
  return (
    <li
      className={`toy-list__item${isActive ? ' toy-list__item--active' : ''}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <ImageFrame size="thumb" src={item.photo} alt={item.name} />
      <div className="toy-list__meta">
        <span className="toy-list__name">{item.name}</span>
        <ToyStatusBadge status={item.status} />
      </div>
    </li>
  );
}
