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
export default function Auth() {
  const { setUser } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [register, setRegister] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api("/auth/" + (register ? "register" : "login"), {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      });
      setUser(d.user);
      navigate(params.get("next") === "/checkout" ? "/checkout" : "/account");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page auth-page">
      <section className="auth-art">
        <Leaf size={38} />
        <h1>
          Your everyday,
          <br />a little better.
        </h1>
        <p>
          A place for considered essentials
          <br />
          and your next favorite things.
        </p>
      </section>
      <section className="auth-form">
        <div className="eyebrow">WELCOME TO FRESHWORK</div>
        <h1>
          {register ? "Make yourself at home." : "Good to see you again."}
        </h1>
        <p>
          {register
            ? "Create an account to keep your favorites close."
            : "Sign in to view your orders and keep exploring."}
        </p>
        <form onSubmit={submit}>
          {register && (
            <label>
              Full name
              <input name="name" autoComplete="name" required maxLength={100} />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={register ? 8 : 1}
              maxLength={128}
              autoComplete={register ? "new-password" : "current-password"}
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="primary full">
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
            <ArrowRight size={18} />
          </button>
        </form>
        <button
          className="text-button"
          onClick={() => {
            setRegister(!register);
            setError("");
          }}
        >
          {register
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
        <Link
          className="guest-link"
          to={params.get("next") === "/checkout" ? "/checkout" : "/"}
        >
          Continue as a guest <ArrowRight size={14} />
        </Link>
        <div className="demo-note">
          Try the demo: <b>demo@freshwork.store</b>
          <br />
          Password: <b>Freshwork123!</b>
        </div>
      </section>
    </main>
  );
}
