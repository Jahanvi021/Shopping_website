import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../api/orders";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Nothing to check out</h1>
        <p>Your bag is empty.</p>
      </div>
    );
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await placeOrder(form);
      await refresh();
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.detail || "Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page checkout-page">
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Shipping Address</h3>
          <label>
            Full Name
            <input name="full_name" value={form.full_name} onChange={handleChange} required />
          </label>
          <label>
            Phone Number
            <input name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10}" title="10 digit phone number" />
          </label>
          <label>
            Address
            <input name="address_line" value={form.address_line} onChange={handleChange} required />
          </label>
          <div className="form-row">
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} required />
            </label>
            <label>
              State
              <input name="state" value={form.state} onChange={handleChange} required />
            </label>
            <label>
              Pincode
              <input name="pincode" value={form.pincode} onChange={handleChange} required pattern="[0-9]{6}" title="6 digit pincode" />
            </label>
          </div>
          {error && <p className="form-message error">{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? "Placing Order..." : `Place Order · ${formatPrice(cart.subtotal)}`}
          </button>
        </form>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {cart.items.map((item) => (
            <div key={item.id} className="summary-row">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.product.sale_price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
