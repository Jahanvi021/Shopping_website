import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page empty-state">
      <h1>404</h1>
      <p>We couldn't find the page you're looking for.</p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
}
