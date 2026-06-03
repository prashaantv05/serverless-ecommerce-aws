async function addProduct() {
  await fetch(`${BASE_URL}/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: document.getElementById("pname").value,
      price: Number(document.getElementById("pprice").value),
      description: document.getElementById("pdesc").value,
      category: document.getElementById("pcat").value,
      stock: Number(document.getElementById("pstock").value)
    })
  });
  toast("Product added successfully!", "success");
  ["pname", "pprice", "pdesc", "pcat", "pstock"].forEach(id => document.getElementById(id).value = "");
}

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] Admin: deleteProduct
// ─────────────────────────────────────────────────────────────
async function deleteProduct() {
  const id = prompt("Enter Product ID to delete:");
  if (!id) return;
  await fetch(`${BASE_URL}/products/${id}`, { method: "DELETE" });
  toast("Product deleted", "info");
}

// ─────────────────────────────────────────────────────────────
// [UNCHANGED] Admin: updateProduct
// ─────────────────────────────────────────────────────────────
async function updateProduct() {
  const id = document.getElementById("upid").value;
  if (!id) { toast("Product ID required", "error"); return; }

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");

    toast("Product updated successfully!", "success");
    ["upid", "upname", "upprice", "upcat", "upstock", "updesc"]
      .forEach(id => document.getElementById(id).value = "");
    loadProducts();
  } catch (err) {

    toast(err.message, "error");
  }
}


// -------------------------------------------------------------
// -------------------------------------------------------------
// [NEW] Admin: loadAdminDashboard (Powered by BFF)
// -------------------------------------------------------------
async function loadAdminDashboard() {
  try {
    const pRes = await fetch(`${BASE_URL}/products/`);
    const pJson = await pRes.json();
    let productCount = pJson.data ? pJson.data.length : 0;

    const oRes = await fetch(`${BASE_URL}/orders/`);
    const oJson = await oRes.json();
    let totalRevenue = 0;
    if (oJson.data) {
       oJson.data.forEach(o => totalRevenue += Number(o.total || 0));
    }

    const tEl = document.getElementById("adminTotalProducts");
    if (tEl) tEl.textContent = productCount;
    const rEl = document.getElementById("adminTotalRevenue");
    if (rEl) rEl.textContent = "₹" + totalRevenue.toLocaleString("en-IN");

  } catch (err) {
    console.error("Admin dashboard load error:", err);
  }
}
