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
// [UPDATED] Admin: updateProduct (Partial Updates)
// ─────────────────────────────────────────────────────────────
async function updateProduct() {
  const id = document.getElementById("upid").value;
  if (!id) { toast("Product ID required", "error"); return; }

  const updatedData = {};

  const name = document.getElementById("upname").value.trim();
  if (name) updatedData.name = name;

  const price = document.getElementById("upprice").value;
  if (price) updatedData.price = Number(price);

  const category = document.getElementById("upcat").value.trim();
  if (category) updatedData.category = category;

  const stock = document.getElementById("upstock").value;
  if (stock !== "") updatedData.stock = Number(stock);

  const desc = document.getElementById("updesc").value.trim();
  if (desc) updatedData.description = desc;

  if (Object.keys(updatedData).length === 0) {
    toast("Please enter at least one field to update", "warning");
    return;
  }

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
    let todayRevenue = 0;
    
    // Get today's date prefix (YYYY-MM-DD) in local time
    const today = new Date();
    // Use the exact date component in UTC format to match ISO strings from dynamo
    const todayStr = today.toISOString().split("T")[0];

    if (oJson.data) {
       oJson.data.forEach(o => {
         const amt = Number(o.total || 0);
         totalRevenue += amt;
         
         // If createdAt exists and starts with today's date
         if (o.createdAt && o.createdAt.startsWith(todayStr)) {
           todayRevenue += amt;
         }
       });
    }

    const tEl = document.getElementById("adminTotalProducts");
    if (tEl) tEl.textContent = productCount;
    
    const trEl = document.getElementById("adminTodayRevenue");
    if (trEl) trEl.textContent = "₹" + todayRevenue.toLocaleString("en-IN");

    const rEl = document.getElementById("adminTotalRevenue");
    if (rEl) rEl.textContent = "₹" + totalRevenue.toLocaleString("en-IN");

  } catch (err) {
    console.error("Admin dashboard load error:", err);
  }
}
