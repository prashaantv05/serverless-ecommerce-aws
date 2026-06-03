async function checkout() {
  const shippingAddress = document.getElementById("shippingInput").value.trim() || "Chennai";
  const paymentMethod = document.getElementById("paymentSelect").value;
  const promoCode = document.getElementById("promoInput") ? document.getElementById("promoInput").value.trim().toUpperCase() : "";

  try {
    const res = await fetch(`${BASE_URL}/orders/checkout/${getCurrentUserId()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingAddress, paymentMethod, promoCode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Checkout failed");

    const orderId = data.data?.orderId || data.order?.orderId || "placed";
    document.getElementById("order").innerHTML =
      `<div class="order-result">✅ Order placed! ID: <strong>${orderId}</strong></div>`;

    toast("Order placed successfully! 🎉", "success");
    if(document.getElementById("promoInput")) document.getElementById("promoInput").value = "";
    if(document.getElementById("promoSuggestion")) document.getElementById("promoSuggestion").classList.remove("show");
    
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
    const res = await fetch(`${BASE_URL}/orders/user/${getCurrentUserId()}`);
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
          <div class="order-total-val">₹${Number(o.total).toLocaleString("en-IN")} ${o.discountAmount ? `<span style="font-size:0.85rem;color:#10b981;font-weight:normal;margin-left:8px;">(Saved ₹${Number(o.discountAmount).toLocaleString("en-IN")})</span>` : ""}</div>
          <div class="order-payment">${o.promoApplied ? `<span class="badge" style="background:#10b981;color:#fff;border:none;">${o.promoApplied}</span> ` : ""}${o.paymentMethod || "COD"}</div>
        </div>
      </div>`).join("");
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${err.message}</p></div>`;
    toast(err.message, "error");
  }
}