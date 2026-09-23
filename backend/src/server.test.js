import { test, before, after } from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
process.env.DB_PATH = ":memory:";
const { app } = await import("./server.js");
let server, base;
before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());
async function request(path, body, cookie) {
  const r = await fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
const shipping = {
  name: "Guest User",
  email: "guest@example.com",
  address: "10 Demo Lane",
  city: "Austin",
  postal: "78701",
};
test("combines filters and sorting", async () => {
  const { data } = await request(
    "/products?category=Home%20%26%20Living&collection=deal&max=200&sort=price-asc",
  );
  assert.ok(data.products.length > 0);
  assert.ok(
    data.products.every(
      (p) =>
        p.category === "Home & Living" &&
        p.collection === "deal" &&
        p.price <= 20000,
    ),
  );
  assert.deepEqual(
    data.products.map((p) => p.price),
    data.products.map((p) => p.price).sort((a, b) => a - b),
  );
  assert.equal((await request("/products?q=wireless")).data.total, 3);
});
test("guest order ignores client prices", async () => {
  const { status, data } = await request("/orders", {
    items: [{ id: 2, quantity: 1, price: 1 }],
    shipping,
    payment: "success",
    total: 1,
  });
  assert.equal(status, 201);
  assert.equal(data.order.subtotal, 3800);
  assert.equal(data.order.total, 4600);
});
test("invalid quantities, duplicate items and declined payments", async () => {
  for (const items of [
    [{ id: 1, quantity: -1 }],
    [{ id: 1, quantity: 1000 }],
    [
      { id: 1, quantity: 1 },
      { id: 1, quantity: 1 },
    ],
  ])
    assert.equal(
      (await request("/orders", { items, shipping, payment: "success" }))
        .status,
      400,
    );
  assert.equal(
    (
      await request("/orders", {
        items: [{ id: 1, quantity: 1 }],
        shipping,
        payment: "decline",
      })
    ).status,
    402,
  );
});
test("auth, private order history and logout", async () => {
  const r = await request("/auth/register", {
    name: "Test User",
    email: "test@example.com",
    password: "testpass123",
  });
  assert.equal(r.status, 200);
  const cookie = r.cookie;
  assert.equal(
    (await request("/auth/me", null, cookie)).data.user.email,
    "test@example.com",
  );
  await request(
    "/orders",
    { items: [{ id: 1, quantity: 1 }], shipping, payment: "success" },
    cookie,
  );
  assert.equal((await request("/orders", null, cookie)).data.orders.length, 1);
  assert.equal((await request("/orders")).status, 401);
  assert.equal(
    (
      await request("/auth/login", {
        email: "test@example.com",
        password: "incorrect",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/auth/login", {
        email: "test@example.com",
        password: "testpass123",
      })
    ).status,
    200,
  );
  await request("/auth/logout", {}, cookie);
  assert.equal((await request("/auth/me", null, cookie)).data.user, null);
});
