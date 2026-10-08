import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProduct, fetchSimilarProducts } from "../api/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Rating from "../components/Rating";
import Spinner from "../components/Spinner";
import { formatPrice, toTitleCase } from "../utils/format";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setMessage(null);
    fetchProduct(id)
      .then((data) => {
        setProduct(data);
        setSelectedSize(data.sizes[0] || "Onesize");
      })
      .finally(() => setLoading(false));
    fetchSimilarProducts(id, 8).then(setSimilar);
  }, [id]);

  async function handleAddToCart() {
    try {
      await addItem(product.id, 1, selectedSize);
      setMessage({ type: "success", text: "Added to bag" });
    } catch (err) {
      if (err.code === "AUTH_REQUIRED") {
        navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
      } else {
        setMessage({ type: "error", text: "Could not add to bag. Please try again." });
      }
    }
  }

  if (loading) return <Spinner />;
  if (!product) return <p className="empty-state">Product not found.</p>;

  const starEntries = Object.entries(product.star_breakdown || {}).reverse();

  return (
    <div className="page product-detail">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> / <Link to={`/category/${product.category}`}>{toTitleCase(product.category)}</Link>
      </div>

      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="product-gallery-main">
            {product.images.length > 0 ? (
              <img src={product.images[activeImage]} alt={product.name} />
            ) : (
              <div className="product-card-image-fallback">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="product-gallery-thumbs">
              {product.images.slice(0, 6).map((img, idx) => (
                <button
                  key={img}
                  className={idx === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <p className="product-brand">{product.brand}</p>
          <h1 className="product-name">{product.name}</h1>
          <Rating value={product.rating} count={product.ratings_count} size="lg" />

          <div className="product-price">
            <span className="price-sale">{formatPrice(product.sale_price)}</span>
            {product.discount_percent > 0 && (
              <>
                <span className="price-original">{formatPrice(product.price)}</span>
                <span className="price-discount">{Math.round(product.discount_percent)}% OFF</span>
              </>
            )}
          </div>
          <p className="tax-note">Inclusive of all taxes</p>

          {product.sizes.length > 0 && product.sizes[0] !== "Onesize" && (
            <div className="size-selector">
              <p>Select Size</p>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={size === selectedSize ? "active" : ""}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-block" onClick={handleAddToCart}>
            Add to Bag
          </button>
          {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

          <div className="product-sold-by">Sold by {product.seller_name}</div>

          {product.description && (
            <div className="product-section">
              <h3>Product Details</h3>
              <p>{product.description}</p>
            </div>
          )}
          {product.material_and_care && (
            <div className="product-section">
              <h3>Material &amp; Care</h3>
              <p>{product.material_and_care}</p>
            </div>
          )}
          {product.size_and_fit && (
            <div className="product-section">
              <h3>Size &amp; Fit</h3>
              <p>{product.size_and_fit}</p>
            </div>
          )}

          {product.specifications.length > 0 && (
            <div className="product-section">
              <h3>Specifications</h3>
              <table className="spec-table">
                <tbody>
                  {product.specifications
                    .filter((s) => s.specification_value && s.specification_value !== "NA")
                    .map((s) => (
                      <tr key={s.specification_name}>
                        <td>{s.specification_name}</td>
                        <td>{s.specification_value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {starEntries.length > 0 && (
            <div className="product-section">
              <h3>Rating Breakdown</h3>
              <div className="star-breakdown">
                {starEntries.map(([key, value]) => (
                  <div key={key} className="star-row">
                    <span>{key.replace("_", " ")}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="product-grid">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
