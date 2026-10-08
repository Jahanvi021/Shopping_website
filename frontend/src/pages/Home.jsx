import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, fetchFeaturedProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import { toTitleCase } from "../utils/format";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchFeaturedProducts(12), fetchCategories()])
      .then(([products, cats]) => {
        setFeatured(products);
        setCategories(cats.slice(0, 12));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>Fashion that fits your story</h1>
          <p>Discover thousands of styles across clothing, footwear, accessories and more.</p>
          <Link to="/category/dresses" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Shop by Category</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="category-grid">
            {categories.map((cat) => (
              <Link key={cat.category} to={`/category/${cat.category}`} className="category-tile">
                <span className="category-tile-name">{toTitleCase(cat.category)}</span>
                <span className="category-tile-count">{cat.count} items</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Top Rated Picks</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
