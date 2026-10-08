export function formatPrice(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function toTitleCase(text) {
  return (text || "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
