const adminProducts = [
  [1, "Multi-function Chopping Vegetable Cutter", "Kitchen", 18000, "product-01.jpg"],
  [2, "Toilet Paper Basket Holder", "Bathroom", 22000, "product-02.jpg"],
  [3, "Double Pole Telescopic Clothes Rack", "Home", 45000, "product-03.jpg"],
  [4, "Mini Stepper", "Fitness", 65000, "product-04.jpg"],
  [5, "4PCS Washing Machine Feet Pad", "Home", 18000, "product-05.jpg"],
  [6, "Multifunctional Movable Base Stand", "Home", 35000, "product-06.jpg"],
  [7, "Clothes Drying Rack", "Home", 42000, "product-07.jpg"],
  [8, "Resistance Band Exercise Straps Set of 5", "Fitness", 28000, "product-08.jpg"],
  [9, "Rain Coat", "Outdoor", 20000, "product-09.jpg"],
  [10, "Shower Caddy 5 Pack", "Bathroom", 38000, "product-10.jpg"],
  [11, "Adjustable Laptop Bed Table", "Office", 36000, "product-11.jpg"],
  [12, "Gushyushya Amazi", "Kitchen", 25000, "product-12.jpg"],
  [13, "3 Nozzle Electric Air Pump", "Outdoor", 30000, "product-13.jpg"],
  [14, "Household Daily Essential", "Home", 15000, "product-14.jpg"],
  [15, "Furniture Mover", "Home", 28000, "product-15.jpg"],
  [16, "Stainless Steel Shoes Rack", "Home", 32000, "product-16.jpg"],
  [17, "Multifunction 8 in 1 Blender", "Kitchen", 75000, "product-17.jpg"],
  [18, "Garden Hose Water Spray Gun 8 Mode", "Outdoor", 22000, "product-18.jpg"],
  [19, "Silver Crest Air Fryer 2400 Watts", "Kitchen", 98000, "product-19.jpg"],
  [20, "Toilet Rack", "Bathroom", 42000, "product-20.jpg"],
  [21, "Corner Shower Caddy", "Bathroom", 30000, "product-21.jpg"],
  [22, "Double Pole Telescopic Rack", "Home", 45000, "product-22.jpg"],
  [23, "Abdominal Wheels", "Fitness", 26000, "product-23.jpg"],
  [24, "Toilet Rack Available", "Bathroom", 42000, "product-24.jpg"],
  [25, "Furniture Mover Set", "Home", 28000, "product-25.jpg"],
  [26, "Plastic Storage Rack", "Home", 26000, "product-26.jpg"],
  [27, "Anti-Vibration Leg Stopper Pads", "Home", 18000, "product-27.jpg"],
  [28, "Bathroom Suction Holder Set of 3", "Bathroom", 24000, "product-28.jpg"],
  [29, "Smart Body Weight Composition Analyzer", "Fitness", 42000, "product-29.jpg"],
  [30, "Waterproof Phone Case", "Outdoor", 12000, "product-30.jpg"],
  [31, "Portable Multi Function Laptop Table", "Office", 36000, "product-31.jpg"],
  [32, "Roller Sunshade", "Outdoor", 28000, "product-32.jpg"],
  [33, "Rain Coat", "Outdoor", 20000, "product-33.jpg"],
].map(([id, name, category, price, image]) => ({
  id,
  name,
  category,
  price,
  image: `./public/products/${image}`,
  status: "In stock",
  featured: id === 19 || id === 21,
}));

const saved = localStorage.getItem("shopyacu-admin-products");
let editableProducts = saved ? JSON.parse(saved) : adminProducts;

const table = document.querySelector("#admin-table");
const search = document.querySelector("#admin-search");
const categorySelect = document.querySelector("#admin-category");
const resetButton = document.querySelector("#admin-reset");
const count = document.querySelector("#admin-product-count");
const categoryCount = document.querySelector("#admin-category-count");
const catalogValue = document.querySelector("#admin-catalog-value");
const whatsappNumber = "250789448107";

function formatPrice(price) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
}

function save() {
  localStorage.setItem("shopyacu-admin-products", JSON.stringify(editableProducts));
}

function renderCategories() {
  const categories = ["All", ...new Set(editableProducts.map((product) => product.category))];
  categorySelect.innerHTML = categories.map((category) => `<option>${category}</option>`).join("");
  categoryCount.textContent = categories.length - 1;
}

function renderStats() {
  count.textContent = editableProducts.length;
  catalogValue.textContent = formatPrice(editableProducts.reduce((total, product) => total + Number(product.price), 0));
}

function renderTable() {
  const query = search.value.trim().toLowerCase();
  const selectedCategory = categorySelect.value || "All";
  const rows = editableProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  table.innerHTML = rows
    .map(
      (product) => `
        <div class="admin-row" data-id="${product.id}">
          <img src="${product.image}" alt="${product.name}">
          <label>
            <span class="sr-only">Name</span>
            <input data-field="name" value="${product.name}">
            <small><input data-field="featured" type="checkbox" ${product.featured ? "checked" : ""}> Featured</small>
          </label>
          <strong>${product.category}</strong>
          <input data-field="price" type="number" value="${product.price}">
          <select data-field="status">
            ${["In stock", "Low stock", "Out of stock"].map((status) => `<option ${status === product.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
          <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Shopyacu, I need an update about ${product.name}.`)}">WhatsApp</a>
        </div>
      `,
    )
    .join("");
}

function updateProduct(id, field, value) {
  editableProducts = editableProducts.map((product) => {
    if (product.id !== id) return product;
    return { ...product, [field]: field === "price" ? Number(value) : value };
  });
  save();
  renderStats();
}

table.addEventListener("input", (event) => {
  const row = event.target.closest("[data-id]");
  if (!row) return;
  updateProduct(Number(row.dataset.id), event.target.dataset.field, event.target.value);
});

table.addEventListener("change", (event) => {
  const row = event.target.closest("[data-id]");
  if (!row) return;
  const field = event.target.dataset.field;
  const value = field === "featured" ? event.target.checked : event.target.value;
  updateProduct(Number(row.dataset.id), field, value);
});

search.addEventListener("input", renderTable);
categorySelect.addEventListener("change", renderTable);
resetButton.addEventListener("click", () => {
  editableProducts = adminProducts;
  localStorage.removeItem("shopyacu-admin-products");
  renderCategories();
  renderStats();
  renderTable();
});

renderCategories();
renderStats();
renderTable();
