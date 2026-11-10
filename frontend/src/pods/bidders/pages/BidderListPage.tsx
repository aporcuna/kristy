import { useCallback, useEffect, useState } from 'react';
import type { Bidder } from '@kristy/shared';
import { errorMessage } from '../../../core/api';
import { Button } from '../../../ui/atoms/Button';
import { ConfirmDialog } from '../../../ui/molecules/ConfirmDialog';
import { NameDialog } from '../../../ui/molecules/NameDialog';
import { PageTemplate } from '../../../ui/templates/PageTemplate';
import { BidderTable } from '../components/BidderTable';
import { biddersService } from '../services/biddersService';

type Dialog = { kind: 'form'; bidder?: Bidder } | { kind: 'delete'; bidder: Bidder } | null;

export function BidderListPage() {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    biddersService.list().then(setBidders).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const closeDialog = () => { setDialog(null); setError(null); };

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
      closeDialog();
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <PageTemplate title="Bidders" actions={<Button variant="primary" onClick={() => setDialog({ kind: 'form' })}>Add bidder</Button>}>
      {error && !dialog && <div className="error">{error}</div>}
      <div className="card">
        <BidderTable
          bidders={bidders}
          onEdit={(bidder) => setDialog({ kind: 'form', bidder })}
          onDelete={(bidder) => setDialog({ kind: 'delete', bidder })}
        />
      </div>

      {dialog?.kind === 'form' && (
        <NameDialog
          key={dialog.bidder?.id ?? 'new'}
          title={dialog.bidder ? 'Edit bidder' : 'Add bidder'}
          label="Name"
          submitLabel="Save bidder"
          error={error}
          initialName={dialog.bidder?.name}
          onSubmit={(name) =>
            run(() => (dialog.bidder ? biddersService.update(dialog.bidder.id, name) : biddersService.create(name)))
          }
          onCancel={closeDialog}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Delete bidder"
          message={`Delete "${dialog.bidder.name}"?`}
          confirmLabel="Delete"
          onConfirm={() => run(() => biddersService.remove(dialog.bidder.id))}
          onCancel={closeDialog}
        />
      )}
    </PageTemplate>
  );
}
