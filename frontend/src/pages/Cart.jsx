import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="page empty-cart">
        <h1 className="page-title">Your Bag is Empty</h1>
        <p>Looks like you haven't added anything to your bag yet.</p>
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h1 className="page-title">My Bag ({cart.total_items} items)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.product.image} alt={item.product.name} />
              <div className="cart-item-info">
                <p className="product-card-brand">{item.product.brand}</p>
                <p className="product-card-name">{item.product.name}</p>
                <p className="cart-item-size">Size: {item.size}</p>
                <div className="cart-item-price">
                  <span className="price-sale">{formatPrice(item.product.sale_price)}</span>
                  {item.product.discount_percent > 0 && (
                    <span className="price-original">{formatPrice(item.product.price)}</span>
                  )}
                </div>
                <div className="cart-item-actions">
                  <div className="qty-selector">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => updateItem(item.id, { quantity: item.quantity - 1 })}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}>+</button>
                  </div>
                  <button className="link-btn" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Price Details</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.total_items} items)</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Charges</span>
            <span className="free-text">FREE</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate("/checkout")}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
