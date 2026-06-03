function buildFilterBar(products) {
  const bar = document.getElementById("filterBar");
  if (!bar) return;
  const cats = ["all", ...new Set(products.map(p => (p.category || "General").toLowerCase()))];
  bar.innerHTML = cats.map(c => `
    <button class="filter-pill ${_activeCategory === c ? "active" : ""}"
            data-cat="${c}"
            onclick="filterByCategory('${c}', this)">
      ${c === "all" ? "All" : (catEmoji(c) + " " + c.charAt(0).toUpperCase() + c.slice(1))}
    </button>`).join("");
}

function filterByCategory(cat, btn) {
  _activeCategory = cat;
  currentPage = 1;
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  applyFilters();
}

function filterProducts(query) {
  _searchQuery = (query || "").toLowerCase();
  currentPage = 1;
  applyFilters();
}

function applyFilters() {
  const container = document.getElementById("products");
  if (!container || !_allProducts.length) return;

  let filtered = _allProducts;

  if (_activeCategory !== "all") {
    filtered = filtered.filter(
      p => (p.category || "General").toLowerCase() === _activeCategory
    );
  }

  if (_searchQuery) {
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(_searchQuery) ||
        (p.description || "").toLowerCase().includes(_searchQuery) ||
        (p.category || "").toLowerCase().includes(_searchQuery)
    );
  }

  const totalPages = Math.ceil(filtered.length / productsPerPage);

  if (currentPage > totalPages) {
    currentPage = 1;
  }

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;

  const paginatedProducts = filtered.slice(start, end);

  renderProducts(paginatedProducts);

  renderPagination(totalPages);
}
function renderPagination(totalPages) {
  let pagination = document.getElementById("pagination");

  if (!pagination) return;

  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <button
        class="page-btn ${i === currentPage ? "active" : ""}"
        onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
}

function changePage(page) {
  currentPage = page;
  applyFilters();

  window.scrollTo({
    top: 500,
    behavior: "smooth"
  });
}
// ─────────────────────────────────────────────────────────────
// [NEW] renderProducts — separated so filters can call it
// ─────────────────────────────────────────────────────────────
function renderProducts(products) {
  const container = document.getElementById("products");
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🔍</div><p>No products found</p></div>`;
    return;
  }

  container.innerHTML = "";
  products.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${i * 0.04}s`;

    // [UPDATED] stock class: "in" for enough stock, "low" for scarce
    const stockClass = p.stock > 5 ? "in" : (p.stock > 0 ? "low" : "low");
    const stockText = p.stock > 0 ? `${p.stock} left` : "Out of stock";

    card.innerHTML = `
      <div class="product-img">${catEmoji(p.category)}</div>
      <div class="product-body">
        <div class="product-cat">${p.category || "General"}</div>
        <div class="product-id">ID: ${p.id}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.description || ""}</div>
        <div class="product-footer">
          <div class="product-price">₹${Number(p.price).toLocaleString("en-IN")}</div>
          <div class="product-stock ${stockClass}">${stockText}</div>
        </div>
        ${window.currentRole === "customer" ? `

<label class="compare-check">
  <input
   type="checkbox"
   ${compareProducts.some(cp => cp.id === p.id) ? "checked" : ""}
   onchange="toggleCompare('${p.id}')"
  >
  Compare Product
</label>

${p.stock <= 0
          ? `<button class="add-cart-btn" disabled>Out of Stock</button>`
          : `<div id="cart-control-${p.id}">
      <button class="add-cart-btn"
      onclick="addToCart('${p.id}', ${p.stock})">
      + Add to Cart
      </button>
    </div>`
        }

` : `

<div class="admin-product-meta">
  <div class="product-stock ${stockClass}">
    ${stockText}
  </div>
</div>

`}
      </div>`;
    container.appendChild(card);
    if (p.stock > 0) renderCartControls(p.id, p.stock);
  });

  // Update hero stat
  const statEl = document.getElementById("statProducts");
  if (statEl) statEl.textContent = _allProducts.length;
}

// ─────────────────────────────────────────────────────────────
// [UPDATED] loadProducts — caches products, builds filter bar
// ─────────────────────────────────────────────────────────────
async function loadProducts() {
  const container = document.getElementById("products");
  container.innerHTML = `<div class="skeleton-grid">
    ${[1, 2, 3, 4, 5, 6].map(() => `
      <div class="skeleton-card">
        <div class="sk-img"></div>
        <div class="sk-line w70"></div>
        <div class="sk-line w40"></div>
      </div>`).join("")}
  </div>`;

  try {
    const res = await fetch(`${BASE_URL}/products/`);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">📦</div><p>No products found</p></div>`;
      return;
    }

    _allProducts = data.data;
    buildFilterBar(_allProducts);
    applyFilters();
    updateBadge();

  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">⚠️</div><p>${err.message}</p></div>`;
    toast(err.message, "error");
  }
}

const _origRenderProducts = renderProducts;
window.renderProducts = function (products) {
  _origRenderProducts(products);
  requestAnimationFrame(() => applyCardStaggerDelays());
};