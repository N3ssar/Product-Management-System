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
    form: document.getElementById("productForm")
};

// Theme Toggle Functionality
elements.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeToggleText();
});

function updateThemeToggleText() {
    const themeToggleText = elements.themeToggle.querySelector('.theme-toggle-text');
    themeToggleText.textContent = document.body.classList.contains('light-mode') ? 'Switch to Dark Mode' : 'Switch to Light Mode';
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}
updateThemeToggleText();

// Global Variables
let products = JSON.parse(localStorage.getItem('product')) || [];
let searchMode = "title";
let temp;

// Helper Functions
function getTotal() {
    const price = parseFloat(elements.price.value) || 0;
    const taxes = parseFloat(elements.taxes.value) || 0;
    const ads = parseFloat(elements.ads.value) || 0;
    const discount = parseFloat(elements.discount.value) || 0;
    
    const result = price + taxes + ads - discount;
    elements.total.innerHTML = `Total: $${result.toFixed(2)}`;
    elements.total.style.backgroundColor = result > 0 ? "rgb(26, 165, 165)" : "crimson";
}

function clearInputs() {
    elements.form.reset();
    elements.total.innerHTML = "";
    elements.total.style.backgroundColor = "transparent";
    elements.submit.innerHTML = "Create";
    elements.count.style.display = "block";
}

function saveToLocalStorage() {
    localStorage.setItem('product', JSON.stringify(products));
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
        total: parseFloat(elements.total.innerText.replace('Total: $', '')) || 0,
        category: elements.category.value.trim().toUpperCase(),
        count: parseInt(elements.count.value) || 1
    };

    if (newProduct.title && newProduct.price && newProduct.category) {
        if (elements.submit.innerHTML === "Update") {
            products[temp] = newProduct;
        } else {
            if (newProduct.count > 1) {
                for (let i = 0; i < newProduct.count; i++) {
                    products.push({...newProduct, count: 1});
                }
            } else {
                products.push(newProduct);
            }
        }
        clearInputs();
        saveToLocalStorage();
        showData();
    } else {
        alert("Please fill in all required fields (Title, Price, and Category).");
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
    elements.submit.innerHTML = "Update";
    temp = index;
    scroll({ top: 0, behavior: "smooth" });
}

function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        products.splice(index, 1);
        saveToLocalStorage();
        showData();
    }
}

function deleteAllProducts() {
    if (confirm("Are you sure you want to delete all products? This action cannot be undone.")) {
        products = [];
        saveToLocalStorage();
        showData();
    }
}

// Search Functionality
function setSearchMode(mode) {
    searchMode = mode;
    elements.search.placeholder = `Search By ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    elements.search.focus();
    elements.search.value = "";
    showData();
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
    const filteredProducts = products.filter(product => 
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
            <td>$${product.price.toFixed(2)}</td>
            <td>$${product.taxes.toFixed(2)}</td>
            <td>$${product.ads.toFixed(2)}</td>
            <td>$${product.discount.toFixed(2)}</td>
            <td>$${product.total.toFixed(2)}</td>
            <td>${product.category}</td>
            <td><button onclick="updateProduct(${index})" class="update-btn">Update</button></td>
            <td><button onclick="deleteProduct(${index})" class="delete-btn">Delete</button></td>
        </tr>
    `;
}

function displayProducts(productsToShow) {
    let table = "";
    for (let i = 0; i < productsToShow.length; i++) {
        table += createTableRow(i, productsToShow[i]);
    }
    elements.tbody.innerHTML = table;
    
    elements.deleteAllBtn.innerHTML = productsToShow.length > 0
        ? `<button onclick="deleteAllProducts()" class="delete-all-btn">Delete All (${productsToShow.length})</button>`
        : "";
}

function showData() {
    getTotal();
    displayProducts(products);
}

// Event Listeners
elements.form.addEventListener('submit', createProduct);
elements.search.addEventListener('input', (e) => debouncedSearch(e.target.value));

// Price inputs event listeners
[elements.price, elements.taxes, elements.ads, elements.discount].forEach(input => {
    input.addEventListener('input', getTotal);
});

document.getElementById('searchTitle').addEventListener('click', () => setSearchMode('title'));
document.getElementById('searchCategory').addEventListener('click', () => setSearchMode('category'));

// Initialize
showData();