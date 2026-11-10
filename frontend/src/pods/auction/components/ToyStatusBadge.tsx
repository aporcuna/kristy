import type { AuctionToyStatus } from '@kristy/shared';

interface ToyStatusBadgeProps {
  status: AuctionToyStatus;
}

/** Soft pastel badge showing whether a toy is New, Active, On hold or Sold. */
export function ToyStatusBadge({ status }: ToyStatusBadgeProps) {
  const modifier = status.toLowerCase().replace(' ', '-');
  return <span className={`status-badge status-badge--${modifier}`}>{status}</span>;
}
