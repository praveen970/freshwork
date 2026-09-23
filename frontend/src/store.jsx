import React, { useState, useEffect, createContext, useContext } from "react";
export const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n / 100);
export async function api(url, options = {}) {
  const r = await fetch("/api" + url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}
const Store = createContext();
export const useStore = () => useContext(Store);
export function Provider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem("freshwork-cart") || "[]");
      return Array.isArray(v)
        ? v.filter(
            (p) =>
              Number.isInteger(p.id) &&
              Number.isInteger(p.quantity) &&
              p.quantity > 0 &&
              Number.isFinite(p.price),
          )
        : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState(null),
    [toast, setToast] = useState(""),
    [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);
  useEffect(() => {
    localStorage.setItem("freshwork-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  function add(p) {
    setCart((c) => {
      const found = c.find((x) => x.id === p.id);
      return found
        ? c.map((x) =>
            x.id === p.id
              ? { ...x, quantity: Math.min(x.stock, x.quantity + 1) }
              : x,
          )
        : [...c, { ...p, quantity: 1 }];
    });
    setToast(p.name + " added to your bag");
  }
  function quantity(id, n) {
    setCart((c) =>
      c
        .map((p) =>
          p.id === id ? { ...p, quantity: Math.min(p.stock, n) } : p,
        )
        .filter((p) => p.quantity > 0),
    );
  }
  return (
    <Store.Provider
      value={{
        cart,
        setCart,
        user,
        setUser,
        add,
        quantity,
        toast,
        setToast,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </Store.Provider>
  );
}
