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
export default function Product() {
  const id = location.pathname.split("/").pop();
  const [product, setProduct] = useState(null),
    [error, setError] = useState("");
  const { add } = useStore();
  useEffect(() => {
    api("/products/" + id)
      .then(setProduct)
      .catch((e) => setError(e.message));
  }, [id]);
  return (
    <main className="page">
      <Link className="back-link" to="/">
        ← Back to collection
      </Link>
      {error ? (
        <div className="empty">{error}</div>
      ) : !product ? (
        <div className="empty">Loading product…</div>
      ) : (
        <section className="detail">
          <img src={product.image} alt={product.name} />
          <div>
            <div className="eyebrow">{product.category}</div>
            <h1>{product.name}</h1>
            <p>{product.variant}</p>
            <div className="detail-rating">
              <Star size={16} fill="currentColor" />
              {product.rating} · {product.reviews} reviews
            </div>
            <h2>
              {money(product.price)}{" "}
              {product.originalPrice > product.price && (
                <del>{money(product.originalPrice)}</del>
              )}
            </h2>
            <p className="detail-description">{product.description}</p>
            <p className="stock">
              <span /> In stock · Ready for your everyday
            </p>
            <button className="primary full" onClick={() => add(product)}>
              Add to bag <Plus size={18} />
            </button>
            <p className="muted">
              Free shipping over $100. Easy 30-day returns.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
