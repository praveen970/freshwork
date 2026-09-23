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
export default function Cart() {
  const { cart, cartOpen, setCartOpen, quantity } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.activeElement;
    const fn = (e) => {
      if (e.key === "Escape") setCartOpen(false);
      if (e.key === "Tab") {
        const nodes = [
          ...document.querySelectorAll(
            ".cart-drawer button:not(:disabled), .cart-drawer a[href]",
          ),
        ];
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", fn);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, [cartOpen]);
  if (!cartOpen) return null;
  const subtotal = cart.reduce((s, p) => s + p.price * p.quantity, 0);
  return (
    <div className="overlay" onClick={() => setCartOpen(false)}>
      <section
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-heading">
          <h2>
            Your bag <span>({cart.length})</span>
          </h2>
          <button
            autoFocus
            className="icon-button"
            aria-label="Close bag"
            onClick={() => setCartOpen(false)}
          >
            <X />
          </button>
        </div>
        {cart.length ? (
          <>
            <div className="shipping-message">
              <Truck size={18} />
              {subtotal >= 10000
                ? "Your order ships free!"
                : `You're ${money(10000 - subtotal)} away from free shipping.`}
            </div>
            <div className="cart-lines">
              {cart.map((p) => (
                <div className="cart-line" key={p.id}>
                  <img src={p.image} alt={p.name} />
                  <div>
                    <h3>{p.name}</h3>
                    <p>{p.variant}</p>
                    <div className="quantity">
                      <button
                        aria-label={"Decrease " + p.name}
                        onClick={() => quantity(p.id, p.quantity - 1)}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{p.quantity}</span>
                      <button
                        disabled={p.quantity >= p.stock}
                        aria-label={"Increase " + p.name}
                        onClick={() => quantity(p.id, p.quantity + 1)}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="line-end">
                    <b>{money(p.price * p.quantity)}</b>
                    <button onClick={() => quantity(p.id, 0)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <div>
                <span>Subtotal</span>
                <b>{money(subtotal)}</b>
              </div>
              <p>Shipping calculated at checkout.</p>
              <button
                className="primary full"
                onClick={() => {
                  setCartOpen(false);
                  navigate("/checkout");
                }}
              >
                Continue to checkout <ArrowRight size={18} />
              </button>
              <button
                className="text-button full"
                onClick={() => setCartOpen(false)}
              >
                Keep exploring
              </button>
            </div>
          </>
        ) : (
          <div className="empty">
            <ShoppingBag size={36} />
            <h3>A little room for good things.</h3>
            <p>Your bag is waiting for its first favorite.</p>
            <button className="primary" onClick={() => setCartOpen(false)}>
              Explore the collection
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
