import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Provider, useStore } from "./store.jsx";
import "./styles.css";
import Header from "./components/Header.jsx";
import Cart from "./components/Cart.jsx";
import Footer from "./components/Footer.jsx";
import Catalog from "./pages/Catalog.jsx";
import Auth from "./pages/Auth.jsx";
import Checkout from "./pages/Checkout.jsx";
import Product from "./pages/Product.jsx";
import Account from "./pages/Account.jsx";
function App() {
  const { toast } = useStore();
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/products/:id" element={<Product />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route
          path="*"
          element={
            <main className="page empty">
              <h1>Page not found.</h1>
              <Link to="/">Back to the collection</Link>
            </main>
          }
        />
      </Routes>
      <Footer />
      <Cart />
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider>
      <App />
    </Provider>
  </BrowserRouter>,
);
