// ============================================================
//  app.js — All original functions UNCHANGED
//  Only UI rendering upgraded
// ============================================================

const BASE_URL = "https://lcksw1qszg.execute-api.ap-southeast-1.amazonaws.com";
const USER_ID  = "u1";

// ── Category emoji helper ───────────────────────────────
function catEmoji(cat = "") {
  const m = { electronics:"⚡", fashion:"👟", sports:"🏃", home:"🏠",
              food:"🍜", beauty:"✨", books:"📚", toys:"🎮", health:"💊" };
  return m[cat.toLowerCase()] || "📦";
}

// ── Toast ───────────────────────────────────────────────
function toast(msg, type = "info") {
  const wrap = document.getElementById("toastWrap");
  const el   = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div>${msg}`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ── Tab switching ────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(`page-${name}`).classList.add("active");
  document.querySelector(`.tab[data-page="${name}"]`).classList.add("active");

  if (name === "products") loadProducts();
  if (name === "cart")     viewCart();
  if (name === "orders")   loadOrders();
}

// ── 🔥 LOAD PRODUCTS (original function, upgraded UI) ───
async function loadProducts() {
  const container = document.getElementById("products");
  container.innerHTML = `<div class="skeleton-grid">
    ${[1,2,3,4,5,6].map(()=>`
      <div class="skeleton-card">
        <div class="sk-img"></div>
        <div class="sk-line w70"></div>
        <div class="sk-line w40"></div>
      </div>`).join("")}
  </div>`;

  try {
    const res  = await fetch(`${BASE_URL}/products/`);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">📦</div><p>No products found</p></div>`;
      return;
    }

    container.innerHTML = "";
    data.data.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="product-img">${catEmoji(p.category)}</div>
        <div class="product-body">
          <div class="product-cat">${p.category || "General"}</div>
          <div class="product-id">ID: ${p.id}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.description || ""}</div>
          <div class="product-footer">
            <div class="product-price">₹${Number(p.price).toLocaleString("en-IN")}</div>
            <div class="product-stock ${p.stock < 5 ? "low" : ""}">
              ${p.stock > 0 ? `${p.stock} left` : "Out of stock"}
            </div>
          </div>
          <button 
          class="add-cart-btn" 
          ${p.stock <= 0 ? "disabled style='opacity:0.5;cursor:not-allowed'" : `onclick="addToCart('${p.id}', ${p.stock})"`}>
          ${p.stock <= 0 ? "Out of Stock" : "+ Add to Cart"}
          </button>
        </div>`;
      container.appendChild(card);
    });

    updateBadge();
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">⚠️</div><p>${err.message}</p></div>`;
    toast(err.message, "error");
  }
}

// ── 🛒 ADD TO CART (original logic, UNCHANGED) ──────────
async function addToCart(productId, stock) {

  try {
    // 🔥 STEP 1: GET CURRENT CART
    const res = await fetch(`${BASE_URL}/cart/${USER_ID}`);
    const data = await res.json();

    const items = Array.isArray(data.data)
      ? data.data
      : (data.data?.items || []);

    // 🔥 STEP 2: FIND CURRENT QUANTITY IN CART
    const existingItem = items.find(i => i.productId === productId);
    const currentQty = existingItem ? existingItem.quantity : 0;

    // 🔥 STEP 3: VALIDATION
    if (currentQty >= stock) {
      toast("No more stock available!", "error");
      return;
    }

    // 🔥 STEP 4: ADD TO CART
    await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        productId,
        quantity: 1
      })
    });

    toast("Added to cart!", "success");

    // 🔥 STEP 5: REFRESH PRODUCTS (to disable button if needed)
    loadProducts();
    updateBadge();

  } catch (err) {
    toast("Error adding to cart", "error");
  }
}

// ── 👀 VIEW CART (original logic, upgraded UI) ──────────
async function viewCart() {
  const container = document.getElementById("cart");
  container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading cart...</p></div>`;

  try {
    const res  = await fetch(`${BASE_URL}/cart/${USER_ID}`);
    const data = await res.json();

    const items = Array.isArray(data.data)
      ? data.data
      : (data.data?.items || []);

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <button class="btn btn-primary" onclick="switchTab('products')">Start Shopping</button>
      </div>`;
      document.getElementById("subtotal").textContent = "₹0";
      document.getElementById("cartTotal").textContent = "₹0";
      updateBadge(0);
      return;
    }

    let total = 0;
    container.innerHTML = items.map(item => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      return `
        <div class="cart-item">
          <div class="cart-item-thumb">${catEmoji()}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-sub">₹${Number(item.price).toLocaleString("en-IN")} × ${item.quantity}</div>
          </div>
          <div class="cart-item-price">₹${lineTotal.toLocaleString("en-IN")}</div>
        </div>`;
    }).join("");

    const fmt = `₹${total.toLocaleString("en-IN")}`;
    document.getElementById("subtotal").textContent = fmt;
    document.getElementById("cartTotal").textContent = fmt;
    updateBadge(items.length);

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${err.message}</p></div>`;
    toast(err.message, "error");
  }
}

// ── 📦 CHECKOUT (original logic, UNCHANGED) ─────────────
async function checkout() {
  const shippingAddress = document.getElementById("shippingInput").value.trim() || "Chennai";
  const paymentMethod   = document.getElementById("paymentSelect").value;

  try {
    const res  = await fetch(`${BASE_URL}/orders/checkout/${USER_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingAddress, paymentMethod })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Checkout failed");

    const orderId = data.data?.orderId || data.order?.orderId || "placed";
    document.getElementById("order").innerHTML =
      `<div class="order-result">✅ Order placed! ID: <strong>${orderId}</strong></div>`;

    toast("Order placed successfully! 🎉", "success");
    updateBadge(0);
    loadOrders();
  } catch (err) {
    toast(err.message, "error");
  }
}

// ── 📋 LOAD ORDERS ───────────────────────────────────────
async function loadOrders() {
  const container = document.getElementById("ordersList");
  container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading orders...</p></div>`;

  try {
    const res  = await fetch(`${BASE_URL}/orders/user/${USER_ID}`);
    const data = await res.json();
    const orders = data.data || [];

    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">📋</div><p>No orders yet</p></div>`;
      return;
    }

    orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    container.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-card-top">
          <div>
            <div class="order-id">${o.orderId}</div>
            <div class="order-date">${o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : ""}</div>
          </div>
          <span class="order-status s-${o.status}">${o.status}</span>
        </div>
        <div class="order-items">
          ${(o.items||[]).map(i=>`${i.name} × ${i.quantity} — ₹${(i.price*i.quantity).toLocaleString("en-IN")}`).join("<br>")}
        </div>
        <div class="order-card-bottom">
          <div class="order-total-val">₹${Number(o.total).toLocaleString("en-IN")}</div>
          <div class="order-payment">${o.paymentMethod || "COD"}</div>
        </div>
      </div>`).join("");
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${err.message}</p></div>`;
    toast(err.message, "error");
  }
}

// ── 🔥 ADMIN: ADD PRODUCT (original logic, UNCHANGED) ───
async function addProduct() {
  await fetch(`${BASE_URL}/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name:        document.getElementById("pname").value,
      price:       Number(document.getElementById("pprice").value),
      description: document.getElementById("pdesc").value,
      category:    document.getElementById("pcat").value,
      stock:       Number(document.getElementById("pstock").value)
    })
  });
  toast("Product added successfully!", "success");
  ["pname","pprice","pdesc","pcat","pstock"].forEach(id => document.getElementById(id).value = "");
}

// ── 🔥 ADMIN: DELETE PRODUCT (original logic, UNCHANGED) 
async function deleteProduct() {
  const id = prompt("Enter Product ID to delete:");
  if (!id) return;

  await fetch(`${BASE_URL}/products/${id}`, { method: "DELETE" });
  toast("Product deleted", "info");
}
// ── 🔥 ADMIN: UPDATE PRODUCT (NEW FUNCTION) ───
async function updateProduct() {
  const id = document.getElementById("upid").value;

  if (!id) {
    toast("Product ID required", "error");
    return;
  }

  const updatedData = {
    name: document.getElementById("upname").value,
    price: Number(document.getElementById("upprice").value),
    category: document.getElementById("upcat").value,
    stock: Number(document.getElementById("upstock").value),
    description: document.getElementById("updesc").value
  };

  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Update failed");

    toast("Product updated successfully!", "success");

    // clear fields
    ["upid","upname","upprice","upcat","upstock","updesc"]
      .forEach(id => document.getElementById(id).value = "");

    loadProducts(); // refresh UI

  } catch (err) {
    toast(err.message, "error");
  }
}

// ── Badge updater ────────────────────────────────────────
async function updateBadge(count = null) {
  const badge = document.getElementById("cartBadge");
  if (count !== null) { badge.textContent = count; return; }
  try {
    const res  = await fetch(`${BASE_URL}/cart/${USER_ID}`);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : (data.data?.items || []);
    badge.textContent = items.length;
  } catch { badge.textContent = 0; }
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateBadge();
});
