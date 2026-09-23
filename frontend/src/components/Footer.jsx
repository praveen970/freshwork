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
export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <Link className="logo" to="/">
          freshwork<span>✳</span>
        </Link>
        <p>Good things, for everyday.</p>
        <div>
          <Link to="/">Shop the collection</Link>
          <Link to="/account">Your account</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Freshwork. A thoughtfully made demo.
        </span>
        <span>
          USD $ <span className="footer-dot">•</span> Designed for the everyday
        </span>
      </div>
    </footer>
  );
}
