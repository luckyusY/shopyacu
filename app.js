const products = [
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
  images: [`./public/products/${image}`],
}));

const galleryImages = {
  1: ["product-01-2.jpg", "product-01-3.jpg"],
  2: ["product-02-2.jpg", "product-02-3.jpg"],
  4: ["product-04-2.jpg"],
  5: ["product-05-2.jpg"],
  6: ["product-06-2.jpg"],
  8: ["product-08-2.jpg", "product-08-3.jpg"],
  9: ["product-09-2.jpg", "product-09-3.jpg"],
  10: ["product-10-2.jpg", "product-10-3.jpg"],
  11: ["product-11-2.jpg", "product-11-3.jpg"],
  12: ["product-12-2.jpg", "product-12-3.jpg"],
  13: ["product-13-2.jpg"],
  14: ["product-14-2.jpg"],
  15: ["product-15-2.jpg", "product-15-3.jpg"],
  16: ["product-16-2.jpg"],
  18: ["product-18-2.jpg"],
  19: ["product-19-2.jpg", "product-19-3.jpg"],
  20: ["product-20-2.jpg"],
  22: ["product-22-2.jpg"],
  23: ["product-23-2.jpg"],
  24: ["product-24-2.jpg", "product-24-3.jpg"],
  27: ["product-27-2.jpg"],
  29: ["product-29-2.jpg"],
  30: ["product-30-2.jpg", "product-30-3.jpg"],
  31: ["product-31-2.jpg", "product-31-3.jpg"],
  32: ["product-32-2.jpg", "product-32-3.jpg"],
};

products.forEach((product) => {
  product.images = [product.image, ...(galleryImages[product.id] || []).map((image) => `./public/products/${image}`)];
});

const whatsappNumber = "250789448107";
const grid = document.querySelector("#product-grid");
const filterContainer = document.querySelector("#category-filters");
const searchInput = document.querySelector("#search-input");
const searchControls = document.querySelectorAll("[data-search-input]");
const searchForms = document.querySelectorAll("[data-search-form]");
const searchSuggestions = document.querySelector("#search-suggestions");
const cartPanel = document.querySelector("#cart-panel");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const checkoutLink = document.querySelector("#checkout-link");
const productResultCount = document.querySelector("#product-result-count");
const productEmpty = document.querySelector("#product-empty");
const mobileNav = document.querySelector("#mobile-nav");
const mobileMenuButton = document.querySelector("[data-toggle-nav]");
const cartToast = document.querySelector("#cart-toast");
const assistantCopy = document.querySelector("#assistant-copy");
const smartCopy = document.querySelector("#smart-copy");
const smartPickGrid = document.querySelector("#smart-pick-grid");
const resetCatalogButton = document.querySelector("[data-reset-catalog]");
const clearCartButton = document.querySelector("[data-clear-cart]");
const cartStorageKey = "shopyacu_cart_v1";

let activeCategory = "All";
let cart = loadCart();
let isLoadingProducts = true;
let toastTimeout = 0;
let swiperLoaderPromise = null;
let productSwipers = [];

function formatPrice(price) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
}

function loadCart() {
  try {
    const savedCart = window.localStorage.getItem(cartStorageKey);
    if (!savedCart) return [];

    const parsed = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      const product = products.find((candidate) => candidate.id === Number(item.id));
      const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      return product ? [{ ...product, quantity }] : [];
    });
  } catch {
    window.localStorage.removeItem(cartStorageKey);
    return [];
  }
}

function persistCart() {
  const savedCart = cart.map((item) => ({ id: item.id, quantity: item.quantity }));
  if (savedCart.length) {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(savedCart));
  } else {
    window.localStorage.removeItem(cartStorageKey);
  }
}

function getSearchQuery() {
  return searchInput.value.trim().toLowerCase();
}

function syncSearchInputs(value) {
  searchControls.forEach((control) => {
    if (control.value !== value) control.value = value;
  });
}

function scrollToCatalog() {
  document.querySelector("#products")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function applySmartSearch(query, category = "All") {
  activeCategory = category;
  syncSearchInputs(query);
  renderFilters();
  renderProducts();
  scrollToCatalog();
}

function getAssistantCopy(visibleCount) {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const query = getSearchQuery();

  if (count) return `${count} item${count === 1 ? "" : "s"} saved. Your cart stays after refresh.`;
  if (query) return `${visibleCount} match${visibleCount === 1 ? "" : "es"} ready in the catalog.`;
  return "Try bathroom storage, kitchen deals, rainy day, or work setup.";
}

function renderFilters() {
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  filterContainer.innerHTML = categories
    .map((category) => `<button class="${category === activeCategory ? "active" : ""}" type="button" data-category="${category}">${category}</button>`)
    .join("");
}

function renderSkeletons() {
  grid.innerHTML = Array.from({ length: 8 })
    .map(
      () => `
        <article class="product-card skeleton-card" aria-hidden="true">
          <div class="skeleton-media"></div>
          <div class="product-info">
            <span class="skeleton-line short"></span>
            <span class="skeleton-line title"></span>
            <span class="skeleton-line price-skeleton"></span>
            <span class="skeleton-button"></span>
          </div>
        </article>
      `,
    )
    .join("");
}

function getSearchSuggestions() {
  const query = getSearchQuery();

  return products
    .map((product) => {
      const name = product.name.toLowerCase();
      const haystack = `${product.name} ${product.category}`.toLowerCase();
      let score = 0;

      if (query) {
        if (name.startsWith(query)) score += 8;
        if (name.includes(query)) score += 5;
        if (haystack.includes(query)) score += 3;
      } else if ([21, 19, 1, 31].includes(product.id)) {
        score += 4;
      }

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 4)
    .map(({ product }) => product);
}

function renderSearchSuggestions() {
  if (!searchSuggestions) return;

  const suggestions = getSearchSuggestions();
  searchSuggestions.innerHTML = suggestions
    .map(
      (product) => `
        <button type="button" data-smart-query="${product.name}">
          <span>${product.name}</span>
          <strong>${formatPrice(product.price)}</strong>
        </button>
      `,
    )
    .join("");
}

function getSmartPicks() {
  const query = getSearchQuery();
  const cartIds = new Set(cart.map((item) => item.id));
  const preferredCategory = cart[0]?.category || (activeCategory !== "All" ? activeCategory : "");

  return products
    .filter((product) => !cartIds.has(product.id))
    .map((product) => {
      const searchMatch = query && `${product.name} ${product.category}`.toLowerCase().includes(query);
      return {
        product,
        score: (product.category === preferredCategory ? 5 : 0) + (searchMatch ? 3 : 0) + ([21, 19, 1, 31].includes(product.id) ? 2 : 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 3)
    .map(({ product }) => product);
}

function renderSmartPicks(visibleCount = products.length) {
  const copy = getAssistantCopy(visibleCount);
  if (assistantCopy) assistantCopy.textContent = copy;
  if (smartCopy) smartCopy.textContent = copy;
  if (!smartPickGrid) return;

  smartPickGrid.innerHTML = getSmartPicks()
    .map(
      (product) => `
        <article>
          <button type="button" data-smart-query="${product.name}">
            <img src="${product.image}" alt="${product.name}">
            <span>
              <small>${product.category}</small>
              <strong>${product.name}</strong>
              <b>${formatPrice(product.price)}</b>
            </span>
          </button>
        </article>
      `,
    )
    .join("");
}

function renderProducts() {
  if (isLoadingProducts) {
    productResultCount.textContent = "Loading catalog...";
    productEmpty.hidden = true;
    renderSkeletons();
    return;
  }

  const query = getSearchQuery();
  const visibleProducts = products.filter((product) => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const queryMatch = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });

  productResultCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"} shown`;
  renderSearchSuggestions();
  renderSmartPicks(visibleProducts.length);
  productEmpty.hidden = visibleProducts.length > 0;
  grid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card" data-card-id="${product.id}" style="--slide-count: ${product.images.length}">
          <div class="product-gallery swiper">
            <div class="product-track swiper-wrapper">
              ${product.images
                .map(
                  (image, index) => `
                    <div class="swiper-slide">
                      <img class="product-image" src="${image}" alt="${product.name}${index > 0 ? ` view ${index + 1}` : ""}" loading="lazy">
                    </div>
                  `,
                )
                .join("")}
            </div>
            <span class="stock-badge">In stock</span>
            ${
              product.images.length > 1
                ? `
                  <button class="gallery-button prev swiper-button-prev" type="button" aria-label="Previous image"></button>
                  <button class="gallery-button next swiper-button-next" type="button" aria-label="Next image"></button>
                  <div class="gallery-dots swiper-pagination"></div>
                `
                : ""
            }
          </div>
          <div class="product-info">
            <p class="category">${product.category}</p>
            <h2>${product.name}</h2>
            <p class="price">${formatPrice(product.price)}</p>
            <button class="add-button" type="button" data-product-id="${product.id}">Add to cart</button>
          </div>
        </article>
      `,
    )
    .join("");
  initProductSwipers();
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  cartToast.textContent = message;
  cartToast.classList.add("show");
  toastTimeout = window.setTimeout(() => cartToast.classList.remove("show"), 2200);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  showToast(`${product.name} added to cart`);
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  renderCart();
}

function updateCartQuantity(productId, change) {
  cart = cart.flatMap((item) => {
    if (item.id !== productId) return [item];
    const quantity = item.quantity + change;
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
  showToast("Cart cleared");
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  persistCart();
  renderSmartPicks();
  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p><small class="cart-save-note">Saved on this device, so refresh will not empty it.</small>';
    checkoutLink.href = "#products";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h3>${item.name}</h3>
            <p>Qty ${item.quantity} - ${formatPrice(item.price * item.quantity)}</p>
            <div class="quantity-controls">
              <button type="button" data-quantity-id="${item.id}" data-quantity-change="-1" aria-label="Decrease ${item.name}">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-quantity-id="${item.id}" data-quantity-change="1" aria-label="Increase ${item.name}">+</button>
              <button type="button" data-remove-id="${item.id}">Remove</button>
            </div>
          </div>
        </div>
      `,
    )
    .join("");

  const message = encodeURIComponent(
    `Hello Shopyacu, I want to order:\n${cart
      .map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`)
      .join("\n")}\nTotal: ${formatPrice(total)}`,
  );
  checkoutLink.href = `https://wa.me/${whatsappNumber}?text=${message}`;
}

function initSmoothScroll() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let currentY = window.scrollY;
  let targetY = window.scrollY;
  let rafId = 0;

  function animate() {
    currentY += (targetY - currentY) * 0.16;
    window.scrollTo(0, currentY);
    if (Math.abs(targetY - currentY) > 0.5) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = 0;
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      targetY = target.getBoundingClientRect().top + window.scrollY - 72;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });
  });
}

function loadSwiper() {
  if (window.Swiper) return Promise.resolve(window.Swiper);
  if (swiperLoaderPromise) return swiperLoaderPromise;

  swiperLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
    script.onload = () => resolve(window.Swiper);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return swiperLoaderPromise;
}

async function initProductSwipers() {
  productSwipers.forEach((swiper) => swiper.destroy(true, true));
  productSwipers = [];

  const galleries = [...document.querySelectorAll(".product-gallery.swiper")].filter((gallery) => gallery.querySelectorAll(".swiper-slide").length > 1);
  if (!galleries.length) return;

  try {
    const Swiper = await loadSwiper();
    productSwipers = galleries.map((gallery) => new Swiper(gallery, {
      grabCursor: true,
      loop: true,
      speed: 360,
      slidesPerView: 1,
      spaceBetween: 0,
      keyboard: { enabled: true },
      pagination: {
        el: gallery.querySelector(".swiper-pagination"),
        clickable: true,
      },
      navigation: {
        nextEl: gallery.querySelector(".swiper-button-next"),
        prevEl: gallery.querySelector(".swiper-button-prev"),
      },
    }));
  } catch {
    productSwipers = [];
  }
}

function openCart() {
  cartPanel.hidden = false;
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartPanel.hidden = true;
  document.body.classList.remove("cart-open");
}

function setMobileNav(open) {
  mobileNav.hidden = !open;
  mobileMenuButton.setAttribute("aria-expanded", String(open));
  mobileMenuButton.textContent = open ? "Close" : "Menu";
}

filterContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderProducts();
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-id]");
  if (!button) return;
  addToCart(Number(button.dataset.productId));
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity-id]");
  if (quantityButton) {
    updateCartQuantity(Number(quantityButton.dataset.quantityId), Number(quantityButton.dataset.quantityChange));
    return;
  }

  const button = event.target.closest("[data-remove-id]");
  if (!button) return;
  removeFromCart(Number(button.dataset.removeId));
});

searchControls.forEach((control) => {
  control.addEventListener("input", () => {
    syncSearchInputs(control.value);
    renderProducts();
  });
});
searchForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderProducts();
    scrollToCatalog();
    setMobileNav(false);
  });
});
document.addEventListener("click", (event) => {
  const smartButton = event.target.closest("[data-smart-query]");
  if (!smartButton) return;
  applySmartSearch(smartButton.dataset.smartQuery || "", smartButton.dataset.smartCategory || "All");
});
resetCatalogButton?.addEventListener("click", () => applySmartSearch("", "All"));
clearCartButton?.addEventListener("click", clearCart);
document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));
mobileMenuButton.addEventListener("click", () => setMobileNav(mobileNav.hidden));
mobileNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMobileNav(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeCart();
  setMobileNav(false);
});

renderFilters();
renderProducts();
renderCart();
initSmoothScroll();

window.setTimeout(() => {
  isLoadingProducts = false;
  renderProducts();
}, 650);
