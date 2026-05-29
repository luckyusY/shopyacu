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
const cartPanel = document.querySelector("#cart-panel");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const checkoutLink = document.querySelector("#checkout-link");

let activeCategory = "All";
let cart = [];
let isLoadingProducts = true;

function formatPrice(price) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
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

function renderProducts() {
  if (isLoadingProducts) {
    renderSkeletons();
    return;
  }

  const query = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const queryMatch = product.name.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });

  grid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card" data-card-id="${product.id}" style="--slide-count: ${product.images.length}">
          <div class="product-gallery" data-slide="0">
            <div class="product-track">
              ${product.images
                .map(
                  (image, index) => `
                    <img class="product-image" src="${image}" alt="${product.name}${index > 0 ? ` view ${index + 1}` : ""}" loading="lazy">
                  `,
                )
                .join("")}
            </div>
            <span class="stock-badge">In stock</span>
            ${
              product.images.length > 1
                ? `
                  <button class="gallery-button prev" type="button" data-slide-action="prev" aria-label="Previous image">&lsaquo;</button>
                  <button class="gallery-button next" type="button" data-slide-action="next" aria-label="Next image">&rsaquo;</button>
                  <div class="gallery-dots">
                    ${product.images.map((_, index) => `<button class="${index === 0 ? "active" : ""}" type="button" data-slide-dot="${index}" aria-label="Show image ${index + 1}"></button>`).join("")}
                  </div>
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
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
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
            <button type="button" data-remove-id="${item.id}">Remove</button>
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

function setCardSlide(card, nextIndex) {
  const gallery = card.querySelector(".product-gallery");
  const track = card.querySelector(".product-track");
  const dots = [...card.querySelectorAll("[data-slide-dot]")];
  const count = Number(card.style.getPropertyValue("--slide-count")) || 1;
  const normalized = (nextIndex + count) % count;

  gallery.dataset.slide = normalized;
  track.style.transform = `translateX(-${normalized * 100}%)`;
  dots.forEach((dot, index) => dot.classList.toggle("active", index === normalized));
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

function initInstagramEmbed() {
  const processEmbeds = () => window.instgrm?.Embeds?.process?.();

  if (window.instgrm?.Embeds) {
    processEmbeds();
    return;
  }

  if (document.querySelector('script[src*="instagram.com/embed.js"]')) {
    window.setTimeout(processEmbeds, 800);
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.instagram.com/embed.js";
  script.onload = processEmbeds;
  document.body.appendChild(script);
}

function openCart() {
  cartPanel.hidden = false;
}

function closeCart() {
  cartPanel.hidden = true;
}

filterContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderProducts();
});

grid.addEventListener("click", (event) => {
  const slideButton = event.target.closest("[data-slide-action]");
  if (slideButton) {
    const card = slideButton.closest(".product-card");
    const current = Number(card.querySelector(".product-gallery").dataset.slide || 0);
    setCardSlide(card, current + (slideButton.dataset.slideAction === "next" ? 1 : -1));
    return;
  }

  const dot = event.target.closest("[data-slide-dot]");
  if (dot) {
    const card = dot.closest(".product-card");
    setCardSlide(card, Number(dot.dataset.slideDot));
    return;
  }

  const button = event.target.closest("[data-product-id]");
  if (!button) return;
  addToCart(Number(button.dataset.productId));
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-id]");
  if (!button) return;
  removeFromCart(Number(button.dataset.removeId));
});

searchInput.addEventListener("input", renderProducts);
document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));

renderFilters();
renderProducts();
renderCart();
initSmoothScroll();
initInstagramEmbed();

window.setTimeout(() => {
  isLoadingProducts = false;
  renderProducts();
}, 650);
