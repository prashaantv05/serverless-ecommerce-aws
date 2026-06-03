async function addToCart(productId, stock) {
  try {
    const res = await fetch(`${BASE_URL}/cart/${getCurrentUserId()}`);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : (data.data?.items || []);
    const existingItem = items.find(i => i.productId === productId);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty >= stock) {
      toast("No more stock available!", "error");
      return;
    }

    await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: getCurrentUserId(), productId, quantity: 1 })
    });

    toast("Added to cart!", "success");
    loadProducts();
    updateBadge();

  } catch (err) {
    toast("Error adding to cart", "error");
  }
}

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] renderCartControls
// ─────────────────────────────────────────────────────────────
async function renderCartControls(productId, stock) {
  try {
    const res = await fetch(`${BASE_URL}/cart/${getCurrentUserId()}`);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : (data.data?.items || []);
    const item = items.find(i => i.productId === productId);
    const container = document.getElementById(`cart-control-${productId}`);
    if (!container) return;

    if (!item) {
      container.innerHTML = `
        <button class="add-cart-btn" onclick="addToCart('${productId}', ${stock})">
          + Add to Cart
        </button>`;
    } else {
      container.innerHTML = `
        <div class="qty-box">
          <button onclick="decreaseItem('${productId}', ${stock})">−</button>
          <span>${item.quantity}</span>
          <button onclick="addToCart('${productId}', ${stock})">+</button>
        </div>`;
    }
  } catch (err) {
    console.log(err);
  }
}

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] decreaseItem
// ─────────────────────────────────────────────────────────────
async function decreaseItem(productId, stock) {
  try {
    const res = await fetch(`${BASE_URL}/cart/${getCurrentUserId()}`);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : (data.data?.items || []);
    const item = items.find(i => i.productId === productId);

    if (!item) return;
    if (item.quantity <= 0) return;

    await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: getCurrentUserId(), productId, quantity: -1 })
    });

    loadProducts();
    updateBadge();

  } catch (err) {
    toast("Error updating cart", "error");
  }
}

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] viewCart
// ─────────────────────────────────────────────────────────────
async function viewCart() {
  const container = document.getElementById("cart");
  container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading cart…</p></div>`;

  try {
    const res = await fetch(`${BASE_URL}/cart/${getCurrentUserId()}`);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : (data.data?.items || []);
    const filteredItems = items.filter(item => item.quantity > 0);

    if (!filteredItems || filteredItems.length === 0) {
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
    container.innerHTML = filteredItems.map(item => {
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
    
    // Store original total in dataset for promo recalculation
    document.getElementById("cartTotal").dataset.originalTotal = total;
    
    updateBadge(filteredItems.length);
    
    // Trigger promo check when visiting cart
    checkPromoEligibility(total);

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${err.message}</p></div>`;
    toast(err.message, "error");
  }
}
// ─────────────────────────────────────────────────────────────
async function updateBadge(count = null) {
  const badge = document.getElementById("cartBadge");
  if (count !== null) { badge.textContent = count; return; }
  try {
    const res = await fetch(`${BASE_URL}/cart/${getCurrentUserId()}`);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : (data.data?.items || []);
    badge.textContent = items.length;
  } catch { badge.textContent = 0; }
}

// ─────────────────────────────────────────────────────────────
// [NEW] checkPromoEligibility
// ─────────────────────────────────────────────────────────────
function checkPromoEligibility(total) {
  const suggEl = document.getElementById("promoSuggestion");
  if (!suggEl) return;

  let suggestion = null;
  let code = "";
  let discountAmount = 0;

  if (total > 20000) { suggestion = "🎁 Unlock MEGA30 for 30% off!"; code = "MEGA30"; discountAmount = total * 0.30; }
  else if (total > 10000) { suggestion = "🎁 Unlock KART20 for 20% off!"; code = "KART20"; discountAmount = total * 0.20; }
  else if (total > 5000) { suggestion = "🎁 Unlock MINUS500 for flat ₹500 off!"; code = "MINUS500"; discountAmount = 500; }
  else if (total > 2000) { suggestion = "🎁 Unlock FREESHIP for flat ₹100 off!"; code = "FREESHIP"; discountAmount = 100; }

  if (suggestion) {
    suggEl.innerHTML = `<span>${suggestion}</span> <strong>Click to apply</strong>`;
    suggEl.classList.add("show");
    
    suggEl.onclick = () => {
      document.getElementById("promoInput").value = code;
      toast(`Promo code ${code} applied!`, "success");
      suggEl.classList.remove("show");
      
      // Update the total UI
      const finalTotal = total - discountAmount;
      document.getElementById("cartTotal").innerHTML = `
        <span style="text-decoration: line-through; font-size: 0.8rem; color: #888;">₹${total.toLocaleString("en-IN")}</span> 
        ₹${finalTotal.toLocaleString("en-IN")}
      `;
    };
  } else {
    suggEl.classList.remove("show");
  }
  
  // Also add listener to manual input just in case they type it and blur
  const inputEl = document.getElementById("promoInput");
  if (inputEl) {
    inputEl.oninput = () => {
      let val = inputEl.value.trim().toUpperCase();
      let manualDiscount = 0;
      if (val === "MEGA30" && total > 20000) manualDiscount = total * 0.30;
      else if (val === "KART20" && total > 10000) manualDiscount = total * 0.20;
      else if (val === "MINUS500" && total > 5000) manualDiscount = 500;
      else if (val === "FREESHIP" && total > 2000) manualDiscount = 100;
      
      if (manualDiscount > 0) {
        const finalTotal = total - manualDiscount;
        document.getElementById("cartTotal").innerHTML = `
          <span style="text-decoration: line-through; font-size: 0.8rem; color: #888;">₹${total.toLocaleString("en-IN")}</span> 
          ₹${finalTotal.toLocaleString("en-IN")}
        `;
      } else {
        document.getElementById("cartTotal").textContent = `₹${total.toLocaleString("en-IN")}`;
      }
    };
  }
}