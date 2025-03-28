// customers.js
export async function loadCustomers() {
  console.log("loadCustomers function called");
  try {
    console.log("Fetching customers from /customers endpoint...");
    const response = await fetch("/customers");
    console.log("Response status:", response.status);
    const customers = await response.json();
    console.log("Received customers:", customers);
    displayCustomers(customers);
  } catch (error) {
    console.error("Error loading customers:", error);
    showError("Failed to load customers");
  }
}

export function setupCustomerForm() {
  console.log("setupCustomerForm function called");
  const form = document.getElementById("customerForm");
  if (!form) {
    console.error("Customer form not found!");
    return;
  }
  console.log("Customer form found, setting up event listener");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const formData = new FormData(form);
    const customerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      notes: formData.get("notes"),
    };
    console.log("Sending customer data:", customerData);

    try {
      const response = await fetch("/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });
      console.log("Response status:", response.status);

      if (!response.ok) throw new Error("Failed to add customer");

      // Refresh customers list
      loadCustomers();
      form.reset();
      showSuccess("Customer added successfully!");
    } catch (error) {
      console.error("Error adding customer:", error);
      showError("Failed to add customer");
    }
  });
}

function displayCustomers(customers) {
  console.log("displayCustomers called with:", customers);
  const customersContainer = document.getElementById("customers");
  if (!customersContainer) {
    console.error("Customers container not found!");
    return;
  }

  if (customers.length === 0) {
    customersContainer.innerHTML = "<p>No customers found.</p>";
    return;
  }

  const table = document.createElement("table");
  table.className = "customers-table";
  table.innerHTML = `
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
          <td>${escapeHtml(customer.name)}</td>
          <td>${escapeHtml(customer.email || "")}</td>
          <td>${escapeHtml(customer.phone || "")}</td>
          <td>${escapeHtml(customer.notes || "")}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  customersContainer.innerHTML = "";
  customersContainer.appendChild(table);
  console.log("Customers table displayed");
}

function showError(message) {
  console.error("Showing error:", message);
  const notification = document.createElement("div");
  notification.className = "notification error";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function showSuccess(message) {
  console.log("Showing success:", message);
  const notification = document.createElement("div");
  notification.className = "notification success";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
