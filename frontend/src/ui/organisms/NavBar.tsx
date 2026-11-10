import { NavLink } from 'react-router-dom';

export function NavBar() {
  return (
    <nav className="navbar">
      <span className="navbar__brand">Kristy's Garage Auction</span>
      <NavLink to="/" end className="navbar__link">Toys</NavLink>
      <NavLink to="/bidders" className="navbar__link">Bidders</NavLink>
    </nav>
  );
}
