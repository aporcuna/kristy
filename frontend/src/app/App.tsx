import { Navigate, Route, Routes } from 'react-router-dom';
import { AuctionPage } from '../pods/auction/pages/AuctionPage';
import { BidderListPage } from '../pods/bidders/pages/BidderListPage';
import { ToyListPage } from '../pods/toys/pages/ToyListPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ToyListPage />} />
      <Route path="/bidders" element={<BidderListPage />} />
      <Route path="/auction" element={<AuctionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
