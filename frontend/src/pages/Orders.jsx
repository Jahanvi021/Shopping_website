import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../api/orders";
import Spinner from "../components/Spinner";
import { formatPrice } from "../utils/format";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">My Orders</h1>
        <p>You haven't placed any orders yet.</p>
        <Link to="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">My Orders</h1>
      <div className="order-list">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="order-row">
            <div>
              <p className="order-row-id">Order #{order.id}</p>
              <p className="order-row-date">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
            </div>
            <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
            <p>{order.item_count} items</p>
            <p className="order-row-amount">{formatPrice(order.total_amount)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
