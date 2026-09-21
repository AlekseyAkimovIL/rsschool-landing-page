// ===== Тема =====
const STORAGE_KEY = "theme";
const root = document.documentElement;
const themeToggle = document.querySelector(".header__theme-toggle");
const themeButtons = themeToggle.querySelectorAll(".header__theme-btn");
const themedImages = document.querySelectorAll("[data-src]"); //

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

themeToggle.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-theme-value]");
  if (!btn) return;

  const theme = btn.dataset.themeValue;
  applyTheme(theme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
});

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

const menuGrid = document.querySelector(".menu__grid");
const menuRefresh = document.querySelector(".menu__refresh");

if (menuGrid && menuRefresh) {
  if (menuGrid.children.length <= 4) menuRefresh.hidden = true;

  menuRefresh.addEventListener("click", () => {
    menuGrid.classList.add("is-expanded");
    menuRefresh.hidden = true;
  });
}
