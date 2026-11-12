import type { AuctionToyListItem as AuctionToyListItemData } from '@kristy/shared';
import { ImageFrame } from '../../../ui/atoms/ImageFrame';
import { ToyStatusBadge } from './ToyStatusBadge';

interface AuctionToyListItemProps {
  item: AuctionToyListItemData;
  onSelect: (toyId: string) => void;
}

/** One toy in the auction left panel: proportional thumbnail, name and status. */
export function AuctionToyListItem({ item, onSelect }: AuctionToyListItemProps) {
  return (
    <li
      className={`toy-list__item${item.isActive ? ' toy-list__item--active' : ''}`}
      aria-current={item.isActive ? 'true' : undefined}
    >
      <button
        type="button"
        className="toy-list__select"
        onClick={() => onSelect(item.toyId)}
        disabled={item.isActive}
      >
        <ImageFrame size="thumb" src={item.photo} alt={item.name} />
        <div className="toy-list__meta">
          <span className="toy-list__name">{item.name}</span>
          <ToyStatusBadge status={item.status} />
        </div>
      </button>
    </li>
  );
}
