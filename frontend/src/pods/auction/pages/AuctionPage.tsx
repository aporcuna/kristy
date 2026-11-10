import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findAdjacentPendingIndex, type AuctionDetail, type Direction } from '@kristy/shared';
import { ApiError, errorMessage } from '../../../core/api';
import { Button } from '../../../ui/atoms/Button';
import { ConfirmDialog } from '../../../ui/molecules/ConfirmDialog';
import { PageTemplate } from '../../../ui/templates/PageTemplate';
import { AuctionToyList } from '../components/AuctionToyList';
import { ToyDetailPanel } from '../components/ToyDetailPanel';
import { auctionService } from '../services/auctionService';

export function AuctionPage() {
  const navigate = useNavigate();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the running auction; it opens on its first toy.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let current = await auctionService.get();
        if (!current.toys.some((t) => t.status === 'Active') && current.toys.length > 0) {
          current = await auctionService.setActive(current.toys[0].toyId);
        }
        if (!cancelled) setAuction(current);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) navigate('/', { replace: true });
        else if (!cancelled) setError(errorMessage(e));
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const move = async (direction: Direction) => {
    try {
      setAuction(await auctionService.navigate(direction));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const closeAuction = async () => {
    try {
      await auctionService.close();
      navigate('/');
    } catch (e) {
      setError(errorMessage(e));
      setConfirmClose(false);
    }
  };

  if (!auction) return <PageTemplate title="Auction" hideNav>{error ? <div className="error">{error}</div> : <p className="muted">Loading…</p>}</PageTemplate>;

  const active = auction.toys.find((t) => t.status === 'Active');
  const canPrevious = findAdjacentPendingIndex(auction.toys, 'previous') !== -1;
  const canNext = findAdjacentPendingIndex(auction.toys, 'next') !== -1;

  return (
    <PageTemplate title={auction.name} hideNav>
      <div className="auction">
        {error && <div className="error">{error}</div>}
        <div className="auction__body">
          <AuctionToyList toys={auction.toys} />
          {active ? <ToyDetailPanel lot={active} /> : <p className="muted">No toy selected.</p>}
        </div>
        <div className="auction__controls">
          <Button disabled={!canPrevious} onClick={() => move('previous')}>Previous</Button>
          <Button disabled={!canNext} onClick={() => move('next')}>Next</Button>
          <Button variant="danger" className="auction__spacer" onClick={() => setConfirmClose(true)}>Close auction</Button>
        </div>
      </div>

      {confirmClose && (
        <ConfirmDialog
          title="Close auction"
          message="Are you sure you want to close the auction? No record of it will be kept."
          confirmLabel="Close auction"
          onConfirm={closeAuction}
          onCancel={() => setConfirmClose(false)}
        />
      )}
    </PageTemplate>
  );
}
