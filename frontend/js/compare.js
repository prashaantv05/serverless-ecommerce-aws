function toggleCompare(productId) {

  const product =
    _allProducts.find(p => p.id === productId);

  const exists =
    compareProducts.some(p => p.id === productId);

  if (exists) {

    compareProducts =
      compareProducts.filter(
        p => p.id !== productId
      );

  } else {

    if (compareProducts.length >= 3) {
      toast("Maximum 3 products");
      return;
    }
    if(product){
   compareProducts.push(product);
}
  }

  updateCompareButton();
}

function updateCompareButton() {

  const btn =
    document.getElementById("compareBtn");

  btn.innerText =
    `Compare Products (${compareProducts.length})`;

  btn.classList.toggle(
    "hidden",
    compareProducts.length < 2
  );
}

function openCompareModal() {

  const table =
    document.getElementById("compareTable");

  table.innerHTML = `
    <table class="compare-table">

      <tr>
        <th>Field</th>
        ${compareProducts.map(
          p => `<th>${p.name}</th>`
        ).join("")}
      </tr>

      <tr>
        <td>Category</td>
        ${compareProducts.map(
          p => `<td>${p.category}</td>`
        ).join("")}
      </tr>

      <tr>
        <td>Price</td>
        ${compareProducts.map(
          p => `<td>₹${p.price}</td>`
        ).join("")}
      </tr>

      <tr>
        <td>Stock</td>
        ${compareProducts.map(
          p => `<td>${p.stock}</td>`
        ).join("")}
      </tr>

      <tr>
        <td>Description</td>
        ${compareProducts.map(
          p => `<td>${p.description || "-"}</td>`
        ).join("")}
      </tr>

    </table>
  `;

  document
    .getElementById("compareModal")
    .classList.remove("hidden");
}

function closeCompareModal() {

  document
    .getElementById("compareModal")
    .classList.add("hidden");
}

document.addEventListener("click", e => {

  if (e.target.id === "compareBtn") {
    openCompareModal();
  }

});