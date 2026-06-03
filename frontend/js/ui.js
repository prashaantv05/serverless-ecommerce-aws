window.currentRole = null;
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,166,35,${p.alpha})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────────────────────────────────────
// [NEW] Navbar scroll effect
// ─────────────────────────────────────────────────────────────
function initScrollNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });
}

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] Category emoji helper
// ─────────────────────────────────────────────────────────────
function catEmoji(cat = "") {
  const m = { electronics:"⚡", fashion:"👟", sports:"🏃", home:"🏠",
              food:"🍜", beauty:"✨", books:"📚", toys:"🎮", health:"💊" };
  return m[cat.toLowerCase()] || "📦";
}

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] Toast
// ─────────────────────────────────────────────────────────────
function toast(msg, type = "info") {
  const wrap = document.getElementById("toastWrap");
  const el   = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div>${msg}`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] Tab switching
// ─────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(`page-${name}`).classList.add("active");
  document.querySelector(`.tab[data-page="${name}"]`).classList.add("active");

  if (name === "products") loadProducts();
  if (name === "cart")     viewCart();
  if (name === "orders")   loadOrders();
}

function initCinematicEntrance() {
  const overlay = document.getElementById("cinematicOverlay");
  if (!overlay) return;

  // If user prefers reduced motion, remove immediately
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    overlay.remove();
    document.body.classList.add("intro-done");
    return;
  }

  // Remove overlay from DOM after both door animations finish (0.3s delay + 1.8s anim)
  const totalDuration = (0.3 + 1.8 + 0.15) * 1000; // small buffer
  setTimeout(() => {
    overlay.classList.add("done");
    // Short RAF delay before removing from DOM entirely
    requestAnimationFrame(() => {
      setTimeout(() => {
        overlay.remove();
        document.body.classList.add("intro-done");
      }, 50);
    });
  }, totalDuration);
}

// ─────────────────────────────────────────────────────────────
// [NEW] Enhanced toast — slide from top-right with exit anim
// ─────────────────────────────────────────────────────────────
function toastEnhanced(msg, type = "info") {
  const wrap = document.getElementById("toastWrap");
  const el   = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div>${msg}`;
  wrap.appendChild(el);

  // Slide out before removing
  setTimeout(() => {
    el.classList.add("removing");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }, 2800);
}

// Override the original toast function with the enhanced version
const _originalToast = toast;
window.toast = toastEnhanced;

// ─────────────────────────────────────────────────────────────
// [NEW] Pagination click animation
// ─────────────────────────────────────────────────────────────
function initPaginationAnimations() {
  // Use event delegation on the pagination container
  const paginationEl = document.getElementById("pagination");
  if (!paginationEl) return;

  paginationEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn) return;
    // Pulse scale on click
    btn.style.transform = "scale(0.88)";
    setTimeout(() => { btn.style.transform = ""; }, 180);
  });
}

// ─────────────────────────────────────────────────────────────
// [NEW] Product cards stagger — set CSS custom property delay
// ─────────────────────────────────────────────────────────────
function applyCardStaggerDelays() {
  const cards = document.querySelectorAll(".product-card");
  cards.forEach((card, i) => {
    card.style.setProperty("--card-delay", `${i * 0.07}s`);
  });
}

// ─────────────────────────────────────────────────────────────
// [NEW] Smooth page fade — patch switchTab to add fade class
// ─────────────────────────────────────────────────────────────
const _origSwitchTab = switchTab;
window.switchTab = function(name) {
  // Add a micro-transition by briefly setting opacity before the active swap
  const pages = document.querySelectorAll(".page.active");
  pages.forEach(p => {
    p.style.transition = "opacity 0.18s ease";
    p.style.opacity = "0";
  });
  setTimeout(() => {
    pages.forEach(p => { p.style.opacity = ""; p.style.transition = ""; });
    _origSwitchTab(name);
    // Re-apply card delays after page switch
    requestAnimationFrame(() => applyCardStaggerDelays());
  }, 150);
};

function selectRole(role) {

  document.getElementById("roleSelection").style.display = "none";

  document
    .querySelectorAll(".hidden-app")
    .forEach(el => el.classList.remove("hidden-app"));
  
  if (role === "customer") {
    window.currentRole = "customer";
    document.getElementById("adminTab").style.display = "none";

    loadProducts();
    updateBadge();

    switchTab("products");
}

  if (role === "admin") {
  window.currentRole = "admin";
  document.getElementById("shopTab").style.display = "none";
  document.getElementById("cartTab").style.display = "none";
  document.getElementById("ordersTab").style.display = "none";

  document.getElementById("adminProductsTab").style.display = "flex";

  document.querySelector(".nav-user").style.display = "none";

  loadProducts();
  updateBadge();

  switchTab("admin");
  }
}