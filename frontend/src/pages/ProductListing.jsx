import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import { toTitleCase } from "../utils/format";

export default function ProductListing() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  const title = useMemo(() => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    return toTitleCase(category);
  }, [category, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [category, searchQuery, sort, minPrice, maxPrice, minRating]);

  useEffect(() => {
    setLoading(true);
    const params = { page, page_size: 24 };
    if (category) params.category = category;
    if (searchQuery) params.search = searchQuery;
    if (sort) params.sort = sort;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (minRating) params.min_rating = minRating;

    fetchProducts(params)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [category, searchQuery, page, sort, minPrice, maxPrice, minRating]);

  return (
    <div className="page listing-page">
      <h1 className="page-title">{title}</h1>

      <div className="listing-layout">
        <aside className="filters">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Min Price</label>
            <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
          </div>
          <div className="filter-group">
            <label>Max Price</label>
            <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="10000" />
          </div>
          <div className="filter-group">
            <label>Minimum Rating</label>
            <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value="">Any</option>
              <option value="4">4★ &amp; above</option>
              <option value="3">3★ &amp; above</option>
              <option value="2">2★ &amp; above</option>
            </select>
          </div>
        </aside>

        <div className="listing-main">
          <div className="listing-toolbar">
            <span>{result ? `${result.total} items found` : ""}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {loading ? (
            <Spinner />
          ) : result && result.items.length > 0 ? (
            <>
              <div className="product-grid">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={result.page} totalPages={result.total_pages} onChange={setPage} />
            </>
          ) : (
            <p className="empty-state">No products found. Try adjusting your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {pages.map((p) => (
        <button key={p} className={p === page ? "active" : ""} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
