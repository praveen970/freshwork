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
export default function Account() {
  const { user, setUser } = useStore();
  const [orders, setOrders] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    api("/orders")
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);
  return (
    <main className="page account-page">
      <div className="account-title">
        <div>
          <div className="eyebrow">YOUR LITTLE CORNER</div>
          <h1>
            {user ? `Hello, ${user.name.split(" ")[0]}.` : "Your account"}
          </h1>
        </div>
        {user && (
          <button
            className="secondary"
            onClick={async () => {
              try {
                await api("/auth/logout", { method: "POST" });
                setUser(null);
                navigate("/");
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        )}
      </div>
      <h2>Your orders</h2>
      {error && (
        <p className="error">
          {error} {!user && <Link to="/login">Sign in</Link>}
        </p>
      )}
      {loading ? (
        <p>Loading your orders…</p>
      ) : !orders.length ? (
        <div className="empty">
          <Package size={32} />
          <h3>Your next good thing is waiting.</h3>
          <p>No orders yet. Start with something you'll love.</p>
          <Link className="primary" to="/">
            Explore the collection
          </Link>
        </div>
      ) : (
        orders.map((o) => (
          <article className="order-card" key={o.id}>
            <div>
              <b>{o.id}</b>
              <p>
                {new Date(o.createdAt).toLocaleDateString()} ·{" "}
                {o.items.reduce((s, p) => s + p.quantity, 0)} items
              </p>
            </div>
            <span className="status">{o.status}</span>
            <strong>{money(o.total)}</strong>
          </article>
        ))
      )}
    </main>
  );
}
