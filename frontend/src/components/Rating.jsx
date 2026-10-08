export default function Rating({ value = 0, count = 0, size = "sm" }) {
  if (!value) {
    return <span className="rating rating-empty">No ratings yet</span>;
  }
  return (
    <span className={`rating rating-${size}`}>
      <span className="rating-badge">
        {value.toFixed(1)} <span className="star">★</span>
      </span>
      {count > 0 && <span className="rating-count">{count.toLocaleString("en-IN")}</span>}
    </span>
  );
}
