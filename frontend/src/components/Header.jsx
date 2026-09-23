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
export default function Header() {
  const { cart, user, setCartOpen } = useStore();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const navigate = useNavigate();
  useEffect(() => setSearch(params.get("q") || ""), [params]);
  return (
    <>
      <div className="announcement">
        A little more everyday joy. <span>Free shipping on orders $100+</span>
        <ArrowUpRight size={12} />
      </div>
      <header>
        <div className="header-inner">
          <Link to="/" className="logo">
            freshwork<span>✳</span>
          </Link>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/?q=" + encodeURIComponent(search));
            }}
          >
            <Search size={19} />
            <input
              aria-label="Search products"
              placeholder="Find your next everyday favorite"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd>↵</kbd>
          </form>
          <div className="header-actions">
            <Link to={user ? "/account" : "/login"} className="account-link">
              <User size={20} />
              <span>{user ? user.name.split(" ")[0] : "Sign in"}</span>
            </Link>
            <span className="divider" />
            <button className="bag-button" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} />
              <span>Bag</span>
              <b>{cart.reduce((s, p) => s + p.quantity, 0)}</b>
            </button>
          </div>
        </div>
        <nav>
          <div>
            <Link to="/">Shop all</Link>
            <Link to="/?collection=new">
              New arrivals <small>NEW</small>
            </Link>
            <Link to="/?category=Home+%26+Living">Home & living</Link>
            <Link to="/?category=Clothing+%26+Shoes">Clothing & shoes</Link>
            <Link to="/?category=Accessories">Accessories</Link>
            <Link to="/?category=Electronics">Electronics</Link>
            <Link className="sale-link" to="/?collection=deal">
              The good deals
            </Link>
          </div>
          <span>
            <Leaf size={14} /> Thoughtfully picked. Everyday loved.
          </span>
        </nav>
      </header>
    </>
  );
}
