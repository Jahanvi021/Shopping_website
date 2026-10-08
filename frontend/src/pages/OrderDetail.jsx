import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchOrder } from "../api/orders";
import Spinner from "../components/Spinner";
import { formatPrice } from "../utils/format";

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!order) return <p className="empty-state">Order not found.</p>;

  return (
    <div className="page">
      {location.state?.justPlaced && (
        <div className="banner banner-success">Your order has been placed successfully!</div>
      )}
      <h1 className="page-title">Order #{order.id}</h1>
      <p className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</p>

      <div className="order-detail-layout">
        <div className="order-items">
          {order.items.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.product.image} alt={item.product.name} />
              <div className="cart-item-info">
                <p className="product-card-brand">{item.product.brand}</p>
                <p className="product-card-name">{item.product.name}</p>
                <p className="cart-item-size">
                  Size: {item.size} · Qty: {item.quantity}
                </p>
                <p className="price-sale">{formatPrice(item.price_at_purchase * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Shipping Address</h3>
          <p>{order.full_name}</p>
          <p>{order.address_line}</p>
          <p>
            {order.city}, {order.state} - {order.pincode}
          </p>
          <p>Phone: {order.phone}</p>
          <div className="summary-row total">
            <span>Total Paid</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
