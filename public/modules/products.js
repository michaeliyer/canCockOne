// products.js
export async function loadProducts() {
  console.log("📦 Loading products...");
  try {
    const response = await fetch("/products");
    console.log("📡 Fetch response received:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    console.log("📦 Products data received:", products);

    displayProducts(products);
    console.log("✅ Products loaded successfully");
    return products;
  } catch (error) {
    console.error("❌ Error loading products:", error);
    throw error;
  }
}

export function setupProductForm() {
  console.log("🔄 Setting up product form...");
  const form = document.getElementById("productForm");
  if (!form) {
    console.error("❌ Product form not found!");
    return;
  }
  console.log("✅ Product form found, setting up event listener");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📝 Product form submitted");

    const formData = new FormData(form);
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      basePrice: parseFloat(formData.get("basePrice")),
      sku: formData.get("sku"),
      category: formData.get("category"),
    };
    console.log("📤 Sending product data:", productData);

    try {
      const isEditMode = form.dataset.mode === "edit";
      const productId = form.dataset.productId;

      const response = await fetch(
        isEditMode ? `/products/${productId}` : "/products",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );
      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${isEditMode ? "update" : "add"} product`
        );
      }

      const result = await response.json();
      console.log("✅ Server response:", result);

      // Refresh products list
      console.log("🔄 Refreshing products list");
      await loadProducts();

      // Reset form and mode
      form.reset();
      delete form.dataset.mode;
      delete form.dataset.productId;

      showSuccess(`Product ${isEditMode ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error("❌ Error in product operation:", error);
      showError(`Failed to ${isEditMode ? "update" : "add"} product`);
    }
  });
}

function displayProducts(products) {
  console.log("🔄 Displaying products...");
  const productsContainer = document.getElementById("products");
  if (!productsContainer) {
    console.error("❌ Products container not found!");
    return;
  }

  if (!Array.isArray(products) || products.length === 0) {
    console.log("ℹ️ No products to display");
    productsContainer.innerHTML =
      "<p>No products found. Add your first product above!</p>";
    return;
  }

  const table = document.createElement("table");
  table.className = "product-table";

  try {
    const tableHTML = `
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Description</th>
          <th>Price</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products
          .map(
            (product) => `
          <tr>
            <td>${escapeHtml(product.sku)}</td>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.description || "")}</td>
            <td>$${product.basePrice.toFixed(2)}</td>
            <td>${escapeHtml(product.category || "")}</td>
            <td>
              <button onclick="editProduct(${product.id})">Edit</button>
              <button onclick="deleteProduct(${product.id})">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

    table.innerHTML = tableHTML;
    productsContainer.innerHTML = "";
    productsContainer.appendChild(table);
    console.log("✅ Products table displayed");
  } catch (error) {
    console.error("❌ Error creating products table:", error);
    showError("Failed to display products");
  }
}

// Make these functions available globally
window.editProduct = async function (id) {
  console.log(`🔄 Editing product with ID: ${id}`);
  try {
    const response = await fetch(`/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const product = await response.json();

    // Populate the form with product data
    const form = document.getElementById("productForm");
    form.name.value = product.name;
    form.description.value = product.description || "";
    form.basePrice.value = product.basePrice;
    form.sku.value = product.sku;
    form.category.value = product.category || "";

    // Change form to update mode
    form.dataset.mode = "edit";
    form.dataset.productId = id;

    // Scroll to form
    form.scrollIntoView({ behavior: "smooth" });
    showSuccess("Product loaded for editing");
  } catch (error) {
    console.error("❌ Error loading product for editing:", error);
    showError("Failed to load product for editing");
  }
};

window.deleteProduct = async function (id) {
  console.log(`🗑️ Deleting product with ID: ${id}`);
  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }

  try {
    const response = await fetch(`/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Refresh products list
    await loadProducts();
    showSuccess("Product deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    showError("Failed to delete product");
  }
};

function showError(message) {
  console.error("❌ Error:", message);
  const notification = document.createElement("div");
  notification.className = "notification error";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function showSuccess(message) {
  console.log("✅ Success:", message);
  const notification = document.createElement("div");
  notification.className = "notification success";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
