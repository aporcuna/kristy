import { useEffect, useState, type FormEvent } from 'react';
import type { Toy } from '@kristy/shared';
import { Button } from '../../../ui/atoms/Button';
import { ImageFrame } from '../../../ui/atoms/ImageFrame';
import { TextArea, TextInput } from '../../../ui/atoms/TextInput';
import { FormField } from '../../../ui/molecules/FormField';

interface ToyFormProps {
  toy?: Toy;
  error?: string | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export function ToyForm({ toy, error, onSubmit, onCancel }: ToyFormProps) {
  const [name, setName] = useState(toy?.name ?? '');
  const [model, setModel] = useState(toy?.model ?? '');
  const [description, setDescription] = useState(toy?.description ?? '');
  const [startPrice, setStartPrice] = useState(toy ? String(toy.startPrice) : '');
  const [file, setFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownPhoto = preview ?? (removePhoto ? null : (toy?.photo ?? null));
  const valid = name.trim() !== '' && startPrice !== '' && Number(startPrice) >= 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.set('name', name.trim());
    data.set('model', model.trim());
    data.set('description', description.trim());
    data.set('startPrice', startPrice);
    if (file) data.set('photo', file);
    if (removePhoto && !file) data.set('removePhoto', 'true');
    onSubmit(data);
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form__row">
        <FormField label="Name *" htmlFor="toy-name">
          <TextInput id="toy-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Model" htmlFor="toy-model">
          <TextInput id="toy-model" value={model} onChange={(e) => setModel(e.target.value)} />
        </FormField>
        <FormField label="Start price (€) *" htmlFor="toy-price">
          <TextInput id="toy-price" type="number" min="0" step="1" value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Description" htmlFor="toy-description">
        <TextArea id="toy-description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
      <div className="form__photo">
        <ImageFrame src={shownPhoto} alt="Toy preview" />
        <div className="form">
          <FormField label="Photo" htmlFor="toy-photo">
            <input id="toy-photo" type="file" accept="image/*"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setRemovePhoto(false); }} />
          </FormField>
          {toy?.photo && !file && (
            <Button small variant="ghost" onClick={() => setRemovePhoto((v) => !v)}>
              {removePhoto ? 'Keep photo' : 'Remove photo'}
            </Button>
          )}
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="form__actions">
        <Button variant="primary" type="submit" disabled={!valid}>Save toy</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
