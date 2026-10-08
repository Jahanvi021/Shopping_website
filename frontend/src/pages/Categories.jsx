import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../api/products";
import Spinner from "../components/Spinner";
import { toTitleCase } from "../utils/format";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <h1 className="page-title">All Categories</h1>
      <div className="category-grid">
        {categories.map((cat) => (
          <Link key={cat.category} to={`/category/${cat.category}`} className="category-tile">
            <span className="category-tile-name">{toTitleCase(cat.category)}</span>
            <span className="category-tile-count">{cat.count} items</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
