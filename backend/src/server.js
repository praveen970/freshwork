import express from "express";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { catalog } from "./catalog.js";
const root = fileURLToPath(new URL("../", import.meta.url));
mkdirSync(path.join(root, "data"), { recursive: true });
const db = new DatabaseSync(
  process.env.DB_PATH || path.join(root, "data/store.sqlite"),
);
db.exec(
  `PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT UNIQUE,name TEXT,password TEXT); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,userId INTEGER,expires INTEGER); CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,userId INTEGER,email TEXT,data TEXT);`,
);
function hash(password, salt = randomBytes(16).toString("hex")) {
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
if (
  !db.prepare("SELECT id FROM users WHERE email=?").get("demo@freshwork.store")
)
  db.prepare("INSERT INTO users(email,name,password) VALUES(?,?,?)").run(
    "demo@freshwork.store",
    "Alex Morgan",
    hash("Freshwork123!"),
  );
export const app = express();
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  const token = (req.headers.cookie || "")
    .split("; ")
    .find((v) => v.startsWith("session="))
    ?.slice(8);
  const session =
    token &&
    db
      .prepare("SELECT userId FROM sessions WHERE token=? AND expires>?")
      .get(token, Date.now());
  req.user = session
    ? db
        .prepare("SELECT id,name,email FROM users WHERE id=?")
        .get(session.userId)
    : null;
  req.token = token;
  next();
});
const attempts = new Map();
app.use("/api/auth", (req, res, next) => {
  if (req.method !== "POST") return next();
  const key = req.ip;
  const a = attempts.get(key) || { count: 0, time: Date.now() };
  if (Date.now() - a.time > 600000) {
    a.count = 0;
    a.time = Date.now();
  }
  a.count++;
  attempts.set(key, a);
  if (a.count > 40)
    return res
      .status(429)
      .json({ error: "Too many attempts. Please try again in 10 minutes." });
  next();
});
app.get("/api/products", (req, res) => {
  let products = [...catalog];
  const {
    q = "",
    category,
    collection,
    min,
    max,
    sort = "featured",
  } = req.query;
  if (typeof q !== "string")
    return res.status(400).json({ error: "Invalid search" });
  products = products.filter(
    (p) =>
      (p.name + " " + p.description).toLowerCase().includes(q.toLowerCase()) &&
      (!category || p.category === category) &&
      (!collection || p.collection === collection) &&
      (!min || p.price >= Number(min) * 100) &&
      (!max || p.price <= Number(max) * 100),
  );
  const sorts = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  };
  if (sorts[sort]) products.sort(sorts[sort]);
  res.json({ products, total: products.length });
});
app.get("/api/products/:id", (req, res) => {
  const p = catalog.find((p) => p.id === +req.params.id);
  p ? res.json(p) : res.status(404).json({ error: "Product not found" });
});
function login(res, user) {
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
    token,
    user.id,
    Date.now() + 7 * 86400000,
  );
  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 86400000,
    path: "/",
  });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 100 ||
    typeof email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    email.length > 254 ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  )
    return res
      .status(400)
      .json({
        error: "Enter a name, valid email, and password with 8–128 characters.",
      });
  try {
    const info = db
      .prepare("INSERT INTO users(name,email,password) VALUES(?,?,?)")
      .run(name.trim(), email.toLowerCase().trim(), hash(password));
    login(res, {
      id: Number(info.lastInsertRowid),
      name: name.trim(),
      email: email.toLowerCase().trim(),
    });
  } catch {
    return res
      .status(409)
      .json({ error: "An account with this email already exists." });
  }
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length > 128
  )
    return res.status(400).json({ error: "Enter your email and password." });
  const u = db
    .prepare("SELECT * FROM users WHERE email=?")
    .get(email.toLowerCase().trim());
  if (!u)
    return res.status(401).json({ error: "Email or password is incorrect." });
  const [salt, digest] = u.password.split(":");
  if (
    !timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(hash(password, salt).split(":")[1], "hex"),
    )
  )
    return res.status(401).json({ error: "Email or password is incorrect." });
  login(res, u);
});
app.post("/api/auth/logout", (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token=?").run(req.token || "");
  res.clearCookie("session", { path: "/" });
  res.json({ ok: true });
});
app.get("/api/auth/me", (req, res) => res.json({ user: req.user }));
app.post("/api/orders", (req, res) => {
  const { items, shipping, payment } = req.body;
  if (
    !shipping ||
    !["name", "email", "address", "city", "postal"].every(
      (k) =>
        typeof shipping[k] === "string" &&
        shipping[k].trim() &&
        shipping[k].length < 255,
    ) ||
    !/^\S+@\S+\.\S+$/.test(shipping.email)
  )
    return res
      .status(400)
      .json({ error: "Please complete your shipping information." });
  if (
    !Array.isArray(items) ||
    !items.length ||
    items.length > 36 ||
    new Set(items.map((i) => i.id)).size !== items.length
  )
    return res.status(400).json({ error: "Invalid cart." });
  const lines = [];
  for (const item of items) {
    const p = catalog.find((p) => p.id === item.id);
    if (
      !p ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > p.stock
    )
      return res
        .status(400)
        .json({ error: "A product quantity is unavailable." });
    lines.push({ ...p, quantity: item.quantity });
  }
  if (payment === "decline")
    return res
      .status(402)
      .json({
        error: "Demo payment declined. Choose successful payment to try again.",
      });
  if (payment !== "success")
    return res.status(400).json({ error: "Choose a demo payment method." });
  const subtotal = lines.reduce((s, p) => s + p.price * p.quantity, 0);
  const order = {
    id: "FW-" + randomBytes(4).toString("hex").toUpperCase(),
    items: lines,
    shipping,
    subtotal,
    shippingCost: subtotal >= 10000 ? 0 : 800,
    total: subtotal + (subtotal >= 10000 ? 0 : 800),
    createdAt: new Date().toISOString(),
    status: "Confirmed",
  };
  db.prepare("INSERT INTO orders VALUES(?,?,?,?)").run(
    order.id,
    req.user?.id || null,
    shipping.email,
    JSON.stringify(order),
  );
  res.status(201).json({ order });
});
app.get("/api/orders", (req, res) => {
  if (!req.user)
    return res.status(401).json({ error: "Please log in to see your orders." });
  res.json({
    orders: db
      .prepare("SELECT data FROM orders WHERE userId=? ORDER BY rowid DESC")
      .all(req.user.id)
      .map((r) => JSON.parse(r.data)),
  });
});
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "API endpoint not found." }),
);
app.use(express.static(path.resolve(root, "../frontend/dist")));
app.get("/{*path}", (_req, res) =>
  res.sendFile(path.resolve(root, "../frontend/dist/index.html")),
);
app.use((err, req, res, next) => {
  console.error(err.message);
  res
    .status(err.status || 500)
    .json({
      error:
        err.status === 400
          ? "Invalid request."
          : "Something went wrong. Please try again.",
    });
});
if (process.env.NODE_ENV !== "test")
  app.listen(process.env.PORT || 3001, () =>
    console.log("Freshwork API: http://localhost:3001"),
  );
