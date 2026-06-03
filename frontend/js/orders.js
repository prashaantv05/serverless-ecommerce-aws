async function checkout() {
  const shippingAddress = document.getElementById("shippingInput").value.trim() || "Chennai";
  const paymentMethod = document.getElementById("paymentSelect").value;

  try {
    const res = await fetch(`${BASE_URL}/orders/checkout/${USER_ID}`, {
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

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] loadOrders
// ─────────────────────────────────────────────────────────────
async function loadOrders() {
  const container = document.getElementById("ordersList");
  container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading orders…</p></div>`;

  try {
    const res = await fetch(`${BASE_URL}/orders/user/${USER_ID}`);
    const data = await res.json();
    const orders = data.data || [];

    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">📋</div><p>No orders yet</p></div>`;
      return;
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
          ${(o.items || []).map(i => `${i.name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString("en-IN")}`).join("<br>")}
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