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
const categories = [
  "Home & Living",
  "Clothing & Shoes",
  "Accessories",
  "Electronics",
  "Wellness",
];
export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [mobile, setMobile] = useState(false),
    [retry, setRetry] = useState(0);
  const { add } = useStore();
  function filter(key, value) {
    const p = new URLSearchParams(params);
    value ? p.set(key, value) : p.delete(key);
    setParams(p);
  }
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api("/products?" + params, { signal: controller.signal })
      .then((d) => setProducts(d.products))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [params, retry]);
  return (
    <main className="storefront">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> THE EVERYDAY, ELEVATED
          </div>
          <h1>
            Good things.
            <br />
            For your <em>everyday.</em>
          </h1>
          <p>
            Considered essentials. Beautiful finds.
            <br />A little something to make life feel better.
          </p>
          <button
            className="primary"
            onClick={() => {
              document
                .getElementById("collection")
                .scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore the collection <ArrowRight size={17} />
          </button>
          <div className="hero-note">
            <span className="avatars">✦</span> Little upgrades. Lasting
            favorites.
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=90"
            alt="Sunlit living room with natural textures and considered furniture"
          />
          <div className="image-label">
            <span>MAKE ROOM FOR BETTER</span>
            <b>Your space. Your sanctuary.</b>
          </div>
          <Link
            className="hero-circle"
            to="/?category=Home+%26+Living"
            aria-label="Shop home and living"
          >
            <ArrowUpRight />
          </Link>
        </div>
      </section>
      <section className="benefits">
        <span>
          <Truck /> Free shipping over $100
        </span>
        <span>
          <RotateCcw /> 30-day easy returns
        </span>
        <span>
          <ShieldCheck /> Secure demo checkout
        </span>
        <span>
          <Leaf /> Chosen with care
        </span>
      </section>
      <section id="collection" className="collection">
        <div className="collection-heading">
          <div>
            <div className="eyebrow">FIND YOUR NEXT FAVORITE</div>
            <h2>
              The everyday collection<span>.</span>
            </h2>
          </div>
          <p>Good design. Great quality. Just right.</p>
        </div>
        <div className="shop-layout">
          <aside className={mobile ? "filters mobile-open" : "filters"}>
            <div className="filter-heading">
              <b>Filters</b>
              <button
                onClick={() => {
                  setParams({});
                  setMobile(false);
                }}
              >
                Reset all
              </button>
              <button
                className="mobile-close icon-button"
                aria-label="Close filters"
                onClick={() => setMobile(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="filter-group">
              <h3>
                Collections <ChevronDown size={14} />
              </h3>
              {[
                ["", "All products"],
                ["deal", "Deals"],
                ["new", "New arrivals"],
                ["clearance", "Clearance"],
              ].map(([v, label]) => (
                <label className="filter-option" key={v}>
                  <input
                    type="radio"
                    name="collection"
                    checked={(params.get("collection") || "") === v}
                    onChange={() => filter("collection", v)}
                  />
                  <span>{label}</span>
                  {v === "deal" && <small className="deal-tag">SAVE</small>}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h3>
                Category <ChevronDown size={14} />
              </h3>
              {categories.map((c) => (
                <label className="filter-option" key={c}>
                  <input
                    type="checkbox"
                    checked={params.get("category") === c}
                    onChange={() =>
                      filter("category", params.get("category") === c ? "" : c)
                    }
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h3>
                Price range <ChevronDown size={14} />
              </h3>
              <input
                className="price-range"
                type="range"
                min="0"
                max="800"
                step="10"
                aria-label="Maximum price"
                value={params.get("max") || 800}
                onChange={(e) => filter("max", e.target.value)}
              />
              <div className="price-labels">
                <span>$0</span>
                <span>${params.get("max") || 800}</span>
              </div>
            </div>
            <div className="sidebar-note">
              <Leaf size={24} />
              <h4>Less, but better.</h4>
              <p>Thoughtful finds you'll reach for, again and again.</p>
              <span>That's the freshwork way.</span>
            </div>
          </aside>
          <div className="catalog-main">
            <div className="catalog-toolbar">
              <div>
                <button
                  className="filter-toggle"
                  onClick={() => setMobile(true)}
                >
                  <SlidersHorizontal size={16} /> Filters
                </button>
                <span>
                  <b>{loading ? "…" : products.length}</b> products{" "}
                  {params.get("q") && <>for “{params.get("q")}”</>}
                </span>
              </div>
              <label className="sort">
                Sort by:{" "}
                <select
                  aria-label="Sort products"
                  value={params.get("sort") || "featured"}
                  onChange={(e) => filter("sort", e.target.value)}
                >
                  <option value="featured">Recommended</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Top rated</option>
                  <option value="newest">Newest first</option>
                </select>
              </label>
            </div>
            {[...params].filter(([k]) => k !== "sort").length > 0 && (
              <div className="chips">
                {[...params]
                  .filter(([k]) => k !== "sort")
                  .map(([k, v]) => (
                    <button key={k} onClick={() => filter(k, "")}>
                      {k === "max" ? "Under $" + v : v}
                      <X size={12} />
                    </button>
                  ))}
              </div>
            )}
            {error ? (
              <div className="empty">
                <h3>We couldn't load the collection.</h3>
                <p>{error}</p>
                <button
                  className="primary"
                  onClick={() => setRetry((n) => n + 1)}
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="product-grid">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="skeleton" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty">
                <Search size={32} />
                <h3>No matches just yet.</h3>
                <p>
                  Try a different search or give your filters a little more
                  room.
                </p>
                <button className="primary" onClick={() => setParams({})}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((p) => (
                  <article className="product-card" key={p.id}>
                    <Link className="product-image" to={"/products/" + p.id}>
                      <img loading="lazy" src={p.image} alt={p.name} />
                      <span className={"badge " + p.collection}>
                        {p.collection === "new"
                          ? "NEW ARRIVAL"
                          : p.collection === "clearance"
                            ? "LAST CHANCE"
                            : Math.round(
                                (1 - p.price / p.originalPrice) * 100,
                              ) + "% OFF"}
                      </span>
                    </Link>
                    <div className="product-meta">
                      <span>{p.category}</span>
                      <span className="rating">
                        <Star size={11} fill="currentColor" />
                        {p.rating} <i>({p.reviews})</i>
                      </span>
                    </div>
                    <h3>
                      <Link to={"/products/" + p.id}>{p.name}</Link>
                    </h3>
                    <p className="variant">{p.variant}</p>
                    <div className="product-bottom">
                      <span className="price">
                        {money(p.price)}{" "}
                        {p.originalPrice > p.price && (
                          <del>{money(p.originalPrice)}</del>
                        )}
                      </span>
                      <button
                        className="add-button"
                        aria-label={"Add " + p.name + " to bag"}
                        onClick={() => add(p)}
                      >
                        <Plus size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="collection-end">
              Thoughtfully selected. Made for real life.
              <Leaf size={16} />
            </div>
          </div>
        </div>
      </section>
      <section className="editorial">
        <div>
          <div className="eyebrow">A LITTLE LESS ORDINARY</div>
          <h2>
            Surround yourself
            <br />
            with things you love.
          </h2>
        </div>
        <p>
          From your first coffee to your last call,
          <br />
          find the essentials that make the everyday yours.
        </p>
        <Link
          to="/?collection=new"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Discover what's new <ArrowUpRight size={19} />
        </Link>
      </section>
    </main>
  );
}
