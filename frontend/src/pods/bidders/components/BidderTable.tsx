import type { Bidder } from '@kristy/shared';
import { Button } from '../../../ui/atoms/Button';

interface BidderTableProps {
  bidders: Bidder[];
  onEdit: (bidder: Bidder) => void;
  onDelete: (bidder: Bidder) => void;
}

export function BidderTable({ bidders, onEdit, onDelete }: BidderTableProps) {
  if (bidders.length === 0) return <p className="muted">No bidders yet. Add the first one!</p>;
  return (
    <table className="table">
      <thead>
        <tr><th>Name</th><th /></tr>
      </thead>
      <tbody>
        {bidders.map((bidder) => (
          <tr key={bidder.id}>
            <td><strong>{bidder.name}</strong></td>
            <td>
              <div className="table__actions">
                <Button small onClick={() => onEdit(bidder)}>Edit</Button>
                <Button small variant="danger" onClick={() => onDelete(bidder)}>Delete</Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
