import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Minus,
  X,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  SlidersHorizontal,
  Star,
  Leaf,
  LogOut,
  Package,
} from "lucide-react";
import { useStore, api, money } from "../store.jsx";
export default function Checkout() {
  const { cart, user, setCart } = useStore();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [order, setOrder] = useState(null);
  const subtotal = cart.reduce((s, p) => s + p.price * p.quantity, 0);
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const d = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((p) => ({ id: p.id, quantity: p.quantity })),
          shipping: data,
          payment: data.payment,
        }),
      });
      setOrder(d.order);
      setCart([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (order)
    return (
      <main className="page confirmation">
        <div className="success-icon">
          <Check size={36} />
        </div>
        <div className="eyebrow">GOOD THINGS ARE ON THEIR WAY</div>
        <h1>You're all set, {order.shipping.name.split(" ")[0]}.</h1>
        <p>
          Your demo order <b>{order.id}</b> is confirmed.
        </p>
        <p>
          Total: <b>{money(order.total)}</b> · No money was charged.
        </p>
        <Link className="primary" to="/">
          Keep exploring <ArrowRight size={18} />
        </Link>
      </main>
    );
  if (!cart.length)
    return (
      <main className="page empty">
        <ShoppingBag size={40} />
        <h1>Your bag is empty.</h1>
        <Link className="primary" to="/">
          Find your next favorite
        </Link>
      </main>
    );
  return (
    <main className="page checkout-page">
      <Link className="back-link" to="/">
        ← Back to the collection
      </Link>
      <div className="eyebrow">A FEW DETAILS, THEN IT'S YOURS</div>
      <h1>
        Checkout<span>.</span>
      </h1>
      <div className="checkout-layout">
        <form onSubmit={submit}>
          <div className="checkout-login">
            {user ? (
              `Checking out as ${user.name}`
            ) : (
              <>
                Shopping as a guest? You're in the right place.{" "}
                <Link to="/login?next=/checkout">Sign in instead</Link>
              </>
            )}
          </div>
          <section className="form-section">
            <h2>
              <span>1</span> Shipping details
            </h2>
            <div className="form-grid">
              {[
                ["name", "Full name", "text"],
                ["email", "Email address", "email"],
                ["address", "Street address", "text"],
                ["city", "City", "text"],
                ["postal", "Postal code", "text"],
              ].map(([key, label, type]) => (
                <label className={key === "address" ? "wide" : ""} key={key}>
                  {label}
                  <input
                    type={type}
                    name={key}
                    required
                    maxLength={254}
                    defaultValue={
                      key === "name"
                        ? user?.name
                        : key === "email"
                          ? user?.email
                          : ""
                    }
                    autoComplete={
                      {
                        name: "name",
                        email: "email",
                        address: "street-address",
                        city: "address-level2",
                        postal: "postal-code",
                      }[key]
                    }
                  />
                </label>
              ))}
            </div>
          </section>
          <section className="form-section">
            <h2>
              <span>2</span> Demo payment
            </h2>
            <p className="muted">
              This is a simulated checkout. No real card details or payments are
              needed.
            </p>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="success"
                defaultChecked
              />
              <span>
                <b>Successful payment</b>
                <small>Complete your demo purchase</small>
              </span>
              <ShieldCheck size={22} />
            </label>
            <label className="payment-option">
              <input type="radio" name="payment" value="decline" />
              <span>
                <b>Declined payment</b>
                <small>Try the payment error experience</small>
              </span>
            </label>
          </section>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="primary full" disabled={busy}>
            {busy
              ? "Placing order…"
              : `Place demo order · ${money(subtotal + (subtotal >= 10000 ? 0 : 800))}`}
            <ArrowRight size={18} />
          </button>
          <p className="checkout-fine">
            Demo only · No charges · No items will be shipped
          </p>
        </form>
        <aside className="order-summary">
          <h2>Order summary</h2>
          {cart.map((p) => (
            <div className="summary-line" key={p.id}>
              <img src={p.image} alt={p.name} />
              <div>
                <b>{p.name}</b>
                <small>Qty {p.quantity}</small>
              </div>
              <span>{money(p.price * p.quantity)}</span>
            </div>
          ))}
          <div className="summary-total">
            <p>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </p>
            <p>
              <span>Shipping</span>
              <b>{subtotal >= 10000 ? "Free" : money(800)}</b>
            </p>
            <p className="grand-total">
              <span>Total</span>
              <b>{money(subtotal + (subtotal >= 10000 ? 0 : 800))}</b>
            </p>
          </div>
          <p className="summary-secure">
            <ShieldCheck size={15} /> A safe space for your demo purchase
          </p>
        </aside>
      </div>
    </main>
  );
}
