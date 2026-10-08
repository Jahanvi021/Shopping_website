import { Link } from "react-router-dom";
import Rating from "./Rating";
import { formatPrice } from "../utils/format";

export default function ProductCard({ product }) {
  const hasDiscount = product.discount_percent > 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-image">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-image-fallback">No image</div>
        )}
        {hasDiscount && <span className="badge badge-discount">{Math.round(product.discount_percent)}% OFF</span>}
      </div>
      <div className="product-card-body">
        <p className="product-card-brand">{product.brand}</p>
        <p className="product-card-name">{product.name}</p>
        <div className="product-card-price">
          <span className="price-sale">{formatPrice(product.sale_price)}</span>
          {hasDiscount && <span className="price-original">{formatPrice(product.price)}</span>}
        </div>
        <Rating value={product.rating} count={product.ratings_count} />
      </div>
    </Link>
  );
}
