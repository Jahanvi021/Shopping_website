import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const NAV_CATEGORIES = [
  { label: "Tops", value: "tops" },
  { label: "Dresses", value: "dresses" },
  { label: "Shirts", value: "shirts" },
  { label: "Jeans", value: "jeans" },
  { label: "T-Shirts", value: "tshirts" },
  { label: "Sarees", value: "sarees" },
  { label: "Sports Shoes", value: "sports-shoes" },
  { label: "Watches", value: "watches" },
];

export default function Navbar() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-top">
        <Link to="/" className="brand-logo">
          Shop<span>verse</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            🔍
          </button>
        </form>

        <nav className="navbar-actions">
          {user ? (
            <div className="navbar-account">
              <span className="navbar-account-name">Hi, {user.full_name || user.email.split("@")[0]}</span>
              <div className="navbar-account-menu">
                <Link to="/orders">Orders</Link>
                <button onClick={logout}>Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="navbar-link">
              Login
            </Link>
          )}
          <Link to="/cart" className="navbar-cart">
            🛒 Bag
            {cart.total_items > 0 && <span className="cart-count">{cart.total_items}</span>}
          </Link>
        </nav>
      </div>

      <nav className="navbar-categories">
        {NAV_CATEGORIES.map((cat) => (
          <Link key={cat.value} to={`/category/${cat.value}`}>
            {cat.label}
          </Link>
        ))}
        <Link to="/categories">All Categories</Link>
      </nav>
    </header>
  );
}
