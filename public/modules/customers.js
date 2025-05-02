// customers.js
export async function loadCustomers() {
  console.log("🔄 Starting to load customers...");
  try {
    const response = await fetch("/customers");
    console.log("📡 Fetch response received:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const customers = await response.json();
    console.log("📦 Customers data received:", customers);

    const customersList = document.getElementById("customers");
    console.log("🔍 Found customers list element:", customersList);

    if (!customersList) {
      throw new Error("Customers list element not found in DOM");
    }

    // Clear existing content
    customersList.innerHTML = "";
    console.log("🧹 Cleared existing customers list content");

    if (customers.length === 0) {
      console.log("ℹ️ No customers found, displaying empty state");
      customersList.innerHTML =
        "<p>No customers found. Add your first customer above!</p>";
      return;
    }

    // Create table
    const table = document.createElement("table");
    table.className = "customer-table";
    console.log("📊 Created table element:", table);

    // Create table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);
    console.log("📑 Added table header");

    // Create table body
    const tbody = document.createElement("tbody");
    customers.forEach((customer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${customer.phone}</td>
        <td>
          <button onclick="editCustomer(${customer.id})">Edit</button>
          <button onclick="deleteCustomer(${customer.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    console.log("📝 Added table body with customer rows");

    // Append table to customers list
    customersList.appendChild(table);
    console.log("✅ Table appended to customers list");

    // Log the final HTML structure
    console.log("📋 Final customers list HTML:", customersList.innerHTML);
  } catch (error) {
    console.error("❌ Error loading customers:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    const customersList = document.getElementById("customers");
    if (customersList) {
      customersList.innerHTML = `<p class="error">Error loading customers: ${error.message}</p>`;
    }
  }
}

export function setupCustomerForm() {
  console.log("🔄 setupCustomerForm function called");
  const form = document.getElementById("customerForm");
  if (!form) {
    console.error("❌ Customer form not found!");
    return;
  }
  console.log("✅ Customer form found, setting up event listener");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📝 Form submitted");

    const formData = new FormData(form);
    const customerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      notes: formData.get("notes"),
    };
    console.log("📤 Sending customer data:", customerData);

    try {
      const response = await fetch("/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });
      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add customer");
      }

      const result = await response.json();
      console.log("✅ Server response:", result);

      // Refresh customers list
      console.log("🔄 Refreshing customers list after successful add");
      await loadCustomers();
      form.reset();
      showSuccess("Customer added successfully!");
    } catch (error) {
      console.error("❌ Error adding customer:", error);
      showError("Failed to add customer");
    }
  });
}

function displayCustomers(customers) {
  console.log("🔄 displayCustomers called with:", customers);
  const customersContainer = document.getElementById("customers");
  if (!customersContainer) {
    console.error("❌ Customers container not found!");
    return;
  }
  console.log("✅ Customers container found");

  if (!Array.isArray(customers) || customers.length === 0) {
    console.log("ℹ️ No customers to display");
    customersContainer.innerHTML = "<p>No customers found.</p>";
    return;
  }

  console.log(`📊 Creating table for ${customers.length} customers`);
  const table = document.createElement("table");
  table.className = "customers-table";

  try {
    const tableHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${customers
          .map(
            (customer) => `
          <tr>
            <td>${escapeHtml(customer.name || "")}</td>
            <td>${escapeHtml(customer.email || "")}</td>
            <td>${escapeHtml(customer.phone || "")}</td>
            <td>${escapeHtml(customer.notes || "")}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

    console.log("📝 Generated table HTML:", tableHTML);
    table.innerHTML = tableHTML;
    customersContainer.innerHTML = "";
    customersContainer.appendChild(table);
    console.log("✅ Customers table displayed successfully");
  } catch (error) {
    console.error("❌ Error creating customers table:", error);
    console.error("Error details:", error.message);
    showError("Failed to display customers");
  }
}

function showError(message) {
  console.error("❌ Showing error:", message);
  const notification = document.createElement("div");
  notification.className = "notification error";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function showSuccess(message) {
  console.log("✅ Showing success:", message);
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
