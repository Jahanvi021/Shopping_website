export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h4>Online Shopping</h4>
          <p>Men · Women · Kids · Home &amp; Living</p>
        </div>
        <div>
          <h4>Customer Policies</h4>
          <p>Contact Us · FAQ · Returns · Terms</p>
        </div>
        <div>
          <h4>About</h4>
          <p>Shopverse is a demo storefront built with React &amp; FastAPI.</p>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Shopverse. For demonstration purposes only.</p>
    </footer>
  );
}
