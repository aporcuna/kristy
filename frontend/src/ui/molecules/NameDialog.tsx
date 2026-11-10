import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { FormField } from './FormField';
import { Modal } from './Modal';

interface NameDialogProps {
  title: string;
  label: string;
  submitLabel: string;
  error?: string | null;
  initialName?: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function NameDialog({ title, label, submitLabel, error, initialName = '', onSubmit, onCancel }: NameDialogProps) {
  const [name, setName] = useState(initialName);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <Modal title={title} onClose={onCancel}>
      <form className="form" onSubmit={submit}>
        <FormField label={label} htmlFor="dialog-name">
          <TextInput id="dialog-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        {error && <div className="error">{error}</div>}
        <div className="modal__actions">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={!name.trim()}>{submitLabel}</Button>
        </div>
      </form>
    </Modal>
  );
}
