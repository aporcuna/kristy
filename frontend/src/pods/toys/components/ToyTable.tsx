import type { Toy } from '@kristy/shared';
import { formatPrice } from '../../../core/format';
import { Button } from '../../../ui/atoms/Button';
import { Checkbox } from '../../../ui/atoms/Checkbox';
import { ImageFrame } from '../../../ui/atoms/ImageFrame';

interface ToyTableProps {
  toys: Toy[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (toy: Toy) => void;
  onDelete: (toy: Toy) => void;
}

export function ToyTable({ toys, selected, onToggle, onEdit, onDelete }: ToyTableProps) {
  if (toys.length === 0) return <p className="muted">No toys yet. Add the first one!</p>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th aria-label="Select" />
          <th>Photo</th>
          <th>Name</th>
          <th>Model</th>
          <th>Description</th>
          <th>Start price</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {toys.map((toy) => (
          <tr key={toy.id}>
            <td>
              <Checkbox aria-label={`Select ${toy.name}`} checked={selected.has(toy.id)} onChange={() => onToggle(toy.id)} />
            </td>
            <td><ImageFrame size="thumb" src={toy.photo} alt={toy.name} /></td>
            <td><strong>{toy.name}</strong></td>
            <td>{toy.model}</td>
            <td className="muted">{toy.description}</td>
            <td>{formatPrice(toy.startPrice)}</td>
            <td>
              <div className="table__actions">
                <Button small onClick={() => onEdit(toy)}>Edit</Button>
                <Button small variant="danger" onClick={() => onDelete(toy)}>Delete</Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
