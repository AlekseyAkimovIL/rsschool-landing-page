const STORAGE_KEY = "theme";
const root = document.documentElement;
const themeToggle = document.querySelector(".header__theme-toggle");
const themeButtons = themeToggle ? themeToggle.querySelectorAll(".header__theme-btn") : [];
const themedImages = document.querySelectorAll("[data-src]");

function applyTheme(theme) {
  root.dataset.theme = theme;

  themeButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.themeValue === theme));
  });

  themedImages.forEach((img) => {
    img.src = img.dataset.src.replace("{theme}", theme);
  });
}

function getSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

applyTheme(getSavedTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-value]");
    if (!btn) return;

    const theme = btn.dataset.themeValue;
    applyTheme(theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  });
}

const header = document.querySelector(".header");
const burger = document.querySelector(".header__burger");
const headerNav = document.querySelector(".header__nav");

function setMenuOpen(open) {
  header.classList.toggle("header--menu-open", open);
  document.body.classList.toggle("is-menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (header && burger && headerNav) {
  burger.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("header--menu-open"));
  });
  headerNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenuOpen(false);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });
  window.matchMedia("(min-width: 1025px)").addEventListener("change", (e) => {
    if (e.matches) setMenuOpen(false);
  });
}

const chooseSlider = document.querySelector(".choose__slider");

if (chooseSlider) {
  const track = chooseSlider.querySelector(".choose__track");
  const slides = Array.from(track.children);
  const prevBtn = chooseSlider.querySelector(".choose__arrow--prev");
  const nextBtn = chooseSlider.querySelector(".choose__arrow--next");
  const dots = Array.from(document.querySelectorAll(".choose__dot"));
  const slidesCount = slides.length;
  let current = 0;

  function goToSlide(index) {
    current = (index + slidesCount) % slidesCount;
    track.style.setProperty("--slide", String(current));

    slides.forEach((slide, i) => {
      slide.setAttribute("aria-hidden", String(i !== current));
    });

    dots.forEach((dot, i) => {
      const isCurrent = i === current;
      dot.setAttribute("aria-current", String(isCurrent));
    });
  }

  prevBtn.addEventListener("click", () => goToSlide(current - 1));
  nextBtn.addEventListener("click", () => goToSlide(current + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goToSlide(i));
  });

  goToSlide(0);
}

const menuGrid = document.querySelector(".menu__grid");
const menuRefresh = document.querySelector(".menu__refresh");
const menuTabs = document.querySelectorAll(".menu__tab");
const CATALOG_INITIAL_COUNT = 8;

let activeCategory = "coffee";
let isExpanded = false;

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function renderCard(product) {
  return `
    <li class="menu__card" data-id="${product.id}" tabindex="0" role="button" aria-label="Open ${product.name}">
      <img
        class="menu__card-img"
        src="${product.image}"
        alt="${product.name}"
        width="310"
        height="310">
      <div class="menu__card-body">
        <div class="menu__card-info">
          <h2 class="menu__card-title">${product.name}</h2>
          <p class="menu__card-text">${product.description}</p>
        </div>
        <p class="menu__card-price">${formatPrice(product.price)}</p>
      </div>
    </li>
  `;
}

function renderCatalog() {
  if (!menuGrid) return;

  const items = PRODUCTS.filter((product) => product.category === activeCategory);
  const visible = isExpanded ? items : items.slice(0, CATALOG_INITIAL_COUNT);

  menuGrid.innerHTML = visible.map(renderCard).join("");

  if (menuRefresh) {
    const hasMore = items.length > CATALOG_INITIAL_COUNT && !isExpanded;
    menuRefresh.hidden = !hasMore;
  }
}

if (menuGrid && typeof PRODUCTS !== "undefined") {
  menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;
      if (!category || category === activeCategory) return;

      activeCategory = category;
      isExpanded = false;

      menuTabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle("menu__tab--active", isActive);
        t.setAttribute("aria-pressed", String(isActive));
      });

      renderCatalog();
    });
  });

  if (menuRefresh) {
    menuRefresh.addEventListener("click", () => {
      isExpanded = true;
      renderCatalog();
    });
  }

  menuGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".menu__card");
    if (!card) return;
    if (typeof window.openModal === "function") window.openModal(card.dataset.id);
  });

  menuGrid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".menu__card");
    if (!card) return;
    e.preventDefault();
    if (typeof window.openModal === "function") window.openModal(card.dataset.id);
  });

  renderCatalog();
}

const modal = document.getElementById("product-modal");

if (modal && typeof PRODUCTS !== "undefined") {
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalSizes = document.getElementById("modal-sizes");
  const modalAdditives = document.getElementById("modal-additives");
  const modalTotal = document.getElementById("modal-total");

  let currentProduct = null;
  let selectedSizeKey = "s";
  let selectedAdditives = new Set();

  function computeTotal() {
    if (!currentProduct) return 0;
    const sizeAddPrice = currentProduct.sizes[selectedSizeKey].addPrice;
    const additivesPrice = Array.from(selectedAdditives).reduce((sum, name) => {
      const additive = currentProduct.additives.find((a) => a.name === name);
      return sum + (additive ? additive.addPrice : 0);
    }, 0);
    return currentProduct.price + sizeAddPrice + additivesPrice;
  }

  function renderSizes() {
    const keys = ["s", "m", "l"];
    modalSizes.innerHTML = keys
      .map((key) => {
        const isActive = key === selectedSizeKey;
        const label = currentProduct.sizes[key].size;
        return `<button type="button" class="modal__tab${isActive ? " modal__tab--active" : ""}" data-size-key="${key}" aria-pressed="${isActive}"><span class="modal__tab-num">${key.toUpperCase()}</span>${label}</button>`;
      })
      .join("");
  }

  function renderAdditives() {
    modalAdditives.innerHTML = currentProduct.additives
      .map((additive, i) => {
        const isActive = selectedAdditives.has(additive.name);
        return `<button type="button" class="modal__tab${isActive ? " modal__tab--active" : ""}" data-additive-name="${additive.name}" aria-pressed="${isActive}"><span class="modal__tab-num">${i + 1}</span>${additive.name}</button>`;
      })
      .join("");
  }

  function updateTotal() {
    modalTotal.textContent = formatPrice(computeTotal());
  }

  function openModal(id) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    currentProduct = product;
    selectedSizeKey = "s";
    selectedAdditives = new Set();

    modalImg.src = product.image;
    modalImg.alt = product.name;
    modalTitle.textContent = product.name;
    modalText.textContent = product.description;

    renderSizes();
    renderAdditives();
    updateTotal();

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.body.classList.add("is-modal-open");
  }
  window.openModal = openModal;

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("is-modal-open");
    window.setTimeout(() => {
      if (!modal.classList.contains("is-open")) modal.hidden = true;
    }, 300);
  }

  modalSizes.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-size-key]");
    if (!btn) return;
    selectedSizeKey = btn.dataset.sizeKey;
    renderSizes();
    updateTotal();
  });

  modalAdditives.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-additive-name]");
    if (!btn) return;
    const name = btn.dataset.additiveName;
    if (selectedAdditives.has(name)) {
      selectedAdditives.delete(name);
    } else {
      selectedAdditives.add(name);
    }
    renderAdditives();
    updateTotal();
  });

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}
