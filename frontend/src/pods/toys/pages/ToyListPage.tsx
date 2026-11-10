import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Toy } from '@kristy/shared';
import { errorMessage } from '../../../core/api';
import { Button } from '../../../ui/atoms/Button';
import { ConfirmDialog } from '../../../ui/molecules/ConfirmDialog';
import { Modal } from '../../../ui/molecules/Modal';
import { NameDialog } from '../../../ui/molecules/NameDialog';
import { PageTemplate } from '../../../ui/templates/PageTemplate';
import { auctionService } from '../../auction/services/auctionService';
import { ToyForm } from '../components/ToyForm';
import { ToyTable } from '../components/ToyTable';
import { toysService } from '../services/toysService';

type Dialog =
  | { kind: 'form'; toy?: Toy }
  | { kind: 'delete'; toy: Toy }
  | { kind: 'auction' }
  | null;

export function ToyListPage() {
  const navigate = useNavigate();
  const [toys, setToys] = useState<Toy[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    toysService.list().then(setToys).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const closeDialog = () => { setDialog(null); setError(null); };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const saveToy = async (data: FormData, toy?: Toy) => {
    try {
      if (toy) await toysService.update(toy.id, data);
      else await toysService.create(data);
      closeDialog();
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const deleteToy = async (toy: Toy) => {
    try {
      await toysService.remove(toy.id);
      setSelected((prev) => { const next = new Set(prev); next.delete(toy.id); return next; });
      closeDialog();
      load();
    } catch (e) {
      setError(errorMessage(e));
      setDialog(null);
    }
  };

  const createAuction = async (name: string) => {
    try {
      // Keep the list order for the auction's toys.
      const toyIds = toys.filter((t) => selected.has(t.id)).map((t) => t.id);
      await auctionService.create({ name, toyIds });
      navigate('/auction');
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <PageTemplate
      title="Toys"
      actions={
        <>
          <Button onClick={() => setDialog({ kind: 'form' })}>Add toy</Button>
          <Button variant="primary" disabled={selected.size === 0} onClick={() => setDialog({ kind: 'auction' })}>
            Create auction{selected.size > 0 ? ` (${selected.size})` : ''}
          </Button>
        </>
      }
    >
      {error && !dialog && <div className="error">{error}</div>}
      <div className="card">
        <ToyTable
          toys={toys}
          selected={selected}
          onToggle={toggle}
          onEdit={(toy) => setDialog({ kind: 'form', toy })}
          onDelete={(toy) => setDialog({ kind: 'delete', toy })}
        />
      </div>

      {dialog?.kind === 'form' && (
        <Modal title={dialog.toy ? 'Edit toy' : 'Add toy'} onClose={closeDialog}>
          <ToyForm toy={dialog.toy} error={error} onSubmit={(d) => saveToy(d, dialog.toy)} onCancel={closeDialog} />
        </Modal>
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Delete toy"
          message={`Delete "${dialog.toy.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteToy(dialog.toy)}
          onCancel={closeDialog}
        />
      )}
      {dialog?.kind === 'auction' && (
        <NameDialog
          title="Create auction"
          label="Auction name"
          submitLabel="Create auction"
          error={error}
          onSubmit={createAuction}
          onCancel={closeDialog}
        />
      )}
    </PageTemplate>
  );
}
