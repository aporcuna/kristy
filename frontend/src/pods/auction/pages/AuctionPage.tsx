import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findActiveToy, findAdjacentPendingIndex, type AuctionDetail, type Direction } from '@kristy/shared';
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
  const [confirmSelectToyId, setConfirmSelectToyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the running auction; it opens on its first toy.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let current = await auctionService.get();
        if (!findActiveToy(current.toys) && current.toys.length > 0) {
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

  const confirmSelect = async () => {
    if (!confirmSelectToyId) return;
    const toyId = confirmSelectToyId;
    const sold = auction?.toys.find((t) => t.toyId === toyId)?.status === 'Sold';
    try {
      setAuction(sold ? await auctionService.reopen(toyId) : await auctionService.setActive(toyId));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setConfirmSelectToyId(null);
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

  const active = findActiveToy(auction.toys);
  const canPrevious = findAdjacentPendingIndex(auction.toys, 'previous') !== -1;
  const canNext = findAdjacentPendingIndex(auction.toys, 'next') !== -1;
  const reopening = confirmSelectToyId !== null
    && auction.toys.find((t) => t.toyId === confirmSelectToyId)?.status === 'Sold';

  return (
    <PageTemplate title={auction.name} hideNav>
      <div className="auction">
        {error && <div className="error">{error}</div>}
        <div className="auction__body">
          <AuctionToyList toys={auction.toys} onSelect={setConfirmSelectToyId} />
          {active ? <ToyDetailPanel lot={active} /> : <p className="muted">No toy selected.</p>}
        </div>
        <div className="auction__controls">
          <Button disabled={!canPrevious} onClick={() => move('previous')}>Previous</Button>
          <Button disabled={!canNext} onClick={() => move('next')}>Next</Button>
          <Button variant="danger" className="auction__spacer" onClick={() => setConfirmClose(true)}>Close auction</Button>
        </div>
      </div>

      {confirmSelectToyId && (
        <ConfirmDialog
          title={reopening ? 'Reopen sold toy' : 'Change active toy'}
          message={reopening
            ? 'This toy is sold. Reopening it will restart its auction from the start price. Are you sure?'
            : 'Are you sure to change the active toy?'}
          confirmLabel={reopening ? 'Reopen toy' : 'Change toy'}
          onConfirm={confirmSelect}
          onCancel={() => setConfirmSelectToyId(null)}
        />
      )}

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
