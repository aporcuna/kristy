import type { AuctionToyDetail } from '@kristy/shared';
import { formatPrice } from '../../../core/format';
import { ImageFrame } from '../../../ui/atoms/ImageFrame';
import { TextInput } from '../../../ui/atoms/TextInput';

interface ToyDetailPanelProps {
  lot: AuctionToyDetail;
  /** Name of the current bidder, if any. */
  bidderName?: string | null;
}

/** Big frame with the details of the active toy. */
export function ToyDetailPanel({ lot, bidderName }: ToyDetailPanelProps) {
  const { toy } = lot;
  return (
    <section className="detail" aria-label="Active toy">
      <ImageFrame src={toy.photo} alt={toy.name} />
      <div className="detail__info">
        <h2 className="detail__name">{toy.name}</h2>
        {toy.model && <div className="detail__model">{toy.model}</div>}
        {toy.description && <p>{toy.description}</p>}
        <div className="detail__prices">
          <label htmlFor="next-bid-price">Next bid price</label>
          <TextInput id="next-bid-price" className="detail__price-input" readOnly value={formatPrice(lot.nextBidPrice)} />
          <label>Sale price</label>
          <div className="detail__value">{lot.salePrice === null ? '–' : formatPrice(lot.salePrice)}</div>
          <label>Bidder</label>
          <div className="detail__value">{bidderName ?? '–'}</div>
        </div>
      </div>
    </section>
  );
}
