// DOM Elements
const elements = {
  title: document.getElementById("title"),
  price: document.getElementById("price"),
  taxes: document.getElementById("taxes"),
  ads: document.getElementById("ads"),
  discount: document.getElementById("discount"),
  total: document.getElementById("total"),
  category: document.getElementById("category"),
  count: document.getElementById("count"),
  search: document.getElementById("search"),
  submit: document.getElementById("submit"),
  deleteAllBtn: document.getElementById("deleteAll"),
  tbody: document.getElementById("tBody"),
  themeToggle: document.getElementById("btnChangeTheme"),
  form: document.getElementById("productForm"),
  noProducts: document.getElementById("noProducts"),
  themeIcon: document.querySelector(".theme-icon"),
};

// Theme Toggle Functionality
elements.themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light-mode") ? "light" : "dark"
  );
  updateThemeToggleText();
});

function updateThemeToggleText() {
  const themeToggleText =
    elements.themeToggle.querySelector(".theme-toggle-text");
  const isLightMode = document.body.classList.contains("light-mode");

  themeToggleText.textContent = isLightMode ? "Dark Mode" : "Light Mode";
  elements.themeIcon.className = isLightMode
    ? "fas fa-moon theme-icon"
    : "fas fa-sun theme-icon";
}

// Check for saved theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
} else {
  document.body.classList.remove("light-mode");
}
updateThemeToggleText();

// Global Variables
let products = JSON.parse(localStorage.getItem("product")) || [];
let searchMode = "title";
let temp;

// Helper Functions
function getTotal() {
  const price = parseFloat(elements.price.value) || 0;
  const taxes = parseFloat(elements.taxes.value) || 0;
  const ads = parseFloat(elements.ads.value) || 0;
  const discount = parseFloat(elements.discount.value) || 0;

  const result = price + taxes + ads - discount;

  if (price > 0 || taxes > 0 || ads > 0 || discount > 0) {
    elements.total.innerHTML = `Total: $${result.toFixed(2)}`;
    elements.total.style.display = "block";
    elements.total.style.backgroundColor =
      result > 0 ? "rgb(26, 165, 165)" : "crimson";
    elements.total.style.border = "none";
  } else {
    elements.total.style.display = "none";
  }
}

function clearInputs() {
  elements.form.reset();
  elements.total.innerHTML = "";
  elements.total.style.display = "none";
  elements.submit.innerHTML = '<i class="fas fa-plus-circle"></i> Create';
  elements.count.style.display = "block";

  // Reset focus to the title field
  elements.title.focus();
}

function saveToLocalStorage() {
  localStorage.setItem("product", JSON.stringify(products));
}

// Show success notification
function showNotification(message, isSuccess = true) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${isSuccess ? "success" : "error"}`;

  // Add content
  notification.innerHTML = `
        <i class="fas ${
          isSuccess ? "fa-check-circle" : "fa-exclamation-circle"
        }"></i>
        <p>${message}</p>
    `;

  // Add to DOM
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Hide and remove after timeout
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// CRUD Operations
function createProduct(e) {
  e.preventDefault();
  let newProduct = {
    title: elements.title.value.trim().toUpperCase(),
    price: parseFloat(elements.price.value) || 0,
    taxes: parseFloat(elements.taxes.value) || 0,
    ads: parseFloat(elements.ads.value) || 0,
    discount: parseFloat(elements.discount.value) || 0,
    total: parseFloat(elements.total.innerText.replace("Total: $", "")) || 0,
    category: elements.category.value.trim().toUpperCase(),
    count: parseInt(elements.count.value) || 1,
  };

  if (newProduct.title && newProduct.price && newProduct.category) {
    if (elements.submit.innerHTML.includes("Update")) {
      // Update existing product
      products[temp] = newProduct;
      showNotification("Product updated successfully!");
    } else {
      // Create new product(s)
      if (newProduct.count > 1) {
        for (let i = 0; i < newProduct.count; i++) {
          products.push({ ...newProduct, count: 1 });
        }
        showNotification(`${newProduct.count} products created successfully!`);
      } else {
        products.push(newProduct);
        showNotification("Product created successfully!");
      }
    }
    clearInputs();
    saveToLocalStorage();
    showData();
  } else {
    showNotification(
      "Please fill in all required fields (Title, Price, and Category).",
      false
    );
  }
}

function updateProduct(index) {
  let product = products[index];
  elements.title.value = product.title;
  elements.price.value = product.price;
  elements.taxes.value = product.taxes;
  elements.ads.value = product.ads;
  elements.discount.value = product.discount;
  elements.category.value = product.category;
  getTotal();
  elements.count.style.display = "none";
  elements.submit.innerHTML = '<i class="fas fa-save"></i> Update';
  temp = index;
  scroll({ top: 0, behavior: "smooth" });
  elements.title.focus();
}

function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
    products.splice(index, 1);
    saveToLocalStorage();
    showData();
    showNotification("Product deleted!");
  }
}

function deleteAllProducts() {
  if (
    confirm(
      "Are you sure you want to delete all products? This action cannot be undone."
    )
  ) {
    products = [];
    saveToLocalStorage();
    showData();
    showNotification("All products deleted!");
  }
}

// Search Functionality
function setSearchMode(mode) {
  searchMode = mode;
  elements.search.placeholder = `Search By ${
    mode.charAt(0).toUpperCase() + mode.slice(1)
  }`;
  elements.search.focus();
  elements.search.value = "";
  showData();

  // Update active button styling
  document.querySelectorAll(".btn-search button").forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeBtn =
    mode === "title"
      ? document.getElementById("searchTitle")
      : document.getElementById("searchCategory");

  activeBtn.classList.add("active");
}

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const searchProducts = (value) => {
  const searchTerm = value.toLowerCase();
  if (searchTerm.trim() === "") {
    displayProducts(products);
    return;
  }

  const filteredProducts = products.filter((product) =>
    product[searchMode].toLowerCase().includes(searchTerm)
  );
  displayProducts(filteredProducts);
};

const debouncedSearch = debounce(searchProducts, 300);

// Display Data
function createTableRow(index, product) {
  return `
        <tr>
            <td>${index + 1}</td>
            <td>${product.title}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>$${product.taxes.toFixed(2)}</td>
            <td>$${product.ads.toFixed(2)}</td>
            <td>$${product.discount.toFixed(2)}</td>
            <td>$${product.total.toFixed(2)}</td>
            <td><button onclick="updateProduct(${index})" class="update-btn"><i class="fas fa-edit"></i> Edit</button></td>
            <td><button onclick="deleteProduct(${index})" class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button></td>
        </tr>
    `;
}

function displayProducts(productsToShow) {
  let table = "";
  for (let i = 0; i < productsToShow.length; i++) {
    table += createTableRow(i, productsToShow[i]);
  }
  elements.tbody.innerHTML = table;

  // Show/hide no products message
  if (productsToShow.length === 0) {
    elements.noProducts.style.display = "block";
  } else {
    elements.noProducts.style.display = "none";
  }

  // Update Delete All button
  elements.deleteAllBtn.innerHTML =
    productsToShow.length > 0
      ? `<button onclick="deleteAllProducts()" class="delete-all-btn"><i class="fas fa-trash-alt"></i> Delete All (${productsToShow.length})</button>`
      : "";
}

function showData() {
  getTotal();
  displayProducts(products);
}

// Add CSS for notifications
const styleElement = document.createElement("style");
styleElement.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: -300px;
    width: 280px;
    padding: 15px;
    border-radius: var(--border-radius);
    background-color: #fff;
    color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    transition: right 0.3s ease;
}

.notification.show {
    right: 20px;
}

.notification.success i {
    color: #28a745;
}

.notification.error i {
    color: crimson;
}

.notification i {
    font-size: 1.5rem;
}

.notification p {
    margin: 0;
    font-size: 0.95rem;
}

.btn-search button.active {
    background-color: var(--accent-color);
}
`;
document.head.appendChild(styleElement);

// Event Listeners
window.addEventListener("DOMContentLoaded", () => {
  // Display data on page load
  showData();

  // Set up event listeners
  elements.form.addEventListener("submit", createProduct);

  // Calculate total when any price input changes
  [elements.price, elements.taxes, elements.ads, elements.discount].forEach(
    (el) => {
      el.addEventListener("input", getTotal);
    }
  );

  // Set up search event listeners
  elements.search.addEventListener("input", (e) =>
    debouncedSearch(e.target.value)
  );
  document
    .getElementById("searchTitle")
    .addEventListener("click", () => setSearchMode("title"));
  document
    .getElementById("searchCategory")
    .addEventListener("click", () => setSearchMode("category"));

  // Set initial active search button
  document.getElementById("searchTitle").classList.add("active");
});

// Make functions accessible globally for onclick events
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.deleteAllProducts = deleteAllProducts;
