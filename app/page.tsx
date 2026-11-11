'use client';

import { useState } from 'react';

const defaultPrompt = "I'm selling 30 UCD hoodies for €25 each, collection on Friday.";

const starterProduct = {
  name: 'UCD Hoodie Drop',
  description: 'Premium student hoodie with a clean unisex fit. Ideal for campus wear, sports socials and chilly evenings around the city.',
  price: 25,
  currency: 'EUR',
  quantity: 30,
  collectionDetails: 'Collection on Friday from the Student Centre lobby, 4pm–6pm.',
  imageEmoji: '🧥',
  category: 'Campus merch',
  sellerLabel: 'Student Society',
};

export default function HomePage() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(starterProduct);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Ready to generate a new storefront.');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus('Reading your listing and generating the storefront...');

    try {
      const res = await fetch('/api/parse-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to generate listing.');
      }

      setProduct(data.product);
      setStatus('Storefront preview generated.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setStatus('Could not generate a listing right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    setStatus('Opening secure checkout...');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to create Stripe Checkout session.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown checkout error';
      setError(message);
      setStatus('Checkout could not be started.');
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">P</span>
          PocketDrop
        </div>
        <div className="topbar-actions">
          <span className="tag">AI storefronts</span>
          <span className="tag">Stripe checkout</span>
        </div>
      </header>

      <section className="hero">
        <div className="panel form-panel">
          <span className="eyebrow">Sell in minutes</span>
          <h1>Turn a sentence into a live product drop.</h1>
          <p className="lead">
            Describe your offer in plain English and PocketDrop will structure the listing,
            estimate the right price and turn it into a premium storefront instantly.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="seller-input">Your product description</label>
              <textarea
                id="seller-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="I’m selling 20 vintage camera straps for £18 each, collection in Dublin city centre."
              />
            </div>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate listing'}
            </button>

            {status && <div className="status">{status}</div>}
            {error && <div className="error">{error}</div>}
          </form>
        </div>

        <aside className="panel preview-panel">
          <div className="product-card">
            <div className="product-visual">
              <div className="product-pill">{product.category || 'Featured drop'}</div>
              <div className="product-art">{product.imageEmoji || '✨'}</div>
            </div>
            <div className="product-body">
              <div className="product-head">
                <h2 className="product-name">{product.name}</h2>
                <span className="product-tag">{product.sellerLabel || 'Seller'}</span>
              </div>

              <p className="product-description">{product.description}</p>

              <div className="meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Available</span>
                  <span className="meta-value">{product.quantity} left</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Collection</span>
                  <span className="meta-value">{product.collectionDetails}</span>
                </div>
              </div>

              <div className="checkout-row">
                <div className="product-price">
                  €{product.price.toFixed(2)} <small>{product.currency}</small>
                </div>
                <button className="buy-button" onClick={handleCheckout} type="button">
                  Buy now
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
