export default function SuccessPage() {
  return (
    <main className="success-shell">
      <div className="success-badge">✓</div>
      <h1>Payment confirmed.</h1>
      <p className="lead" style={{ margin: '0 auto 18px', maxWidth: '52ch' }}>
        Your order has been secured. The seller will be notified and your collection details will be shared after payment.
      </p>
      <a href="/" className="primary-button" style={{ display: 'inline-flex', marginTop: 12 }}>
        Create another drop
      </a>
    </main>
  );
}
