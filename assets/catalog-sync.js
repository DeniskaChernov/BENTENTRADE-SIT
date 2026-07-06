/* ============================================================
   BENTENTRADE — hydrate catalog & PDP prices/names from the API.
   The static HTML remains the fallback; when the backend is
   reachable it becomes the source of truth (so prices edited in
   the CRM show up on the site without touching the markup).
   ============================================================ */
(function () {
  "use strict";
  if (!window.BTT_API) return;

  const U = window.BTT_UTIL || {};
  const money = (n) => "$" + n;
  const mediaUrl = (key) => (key ? "/media/" + key : "");
  const esc = U.esc || ((s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])));
  const idFromHref = (href) => { const m = (href || "").match(/[?&]id=([^&]+)/); return m ? decodeURIComponent(m[1]) : null; };

  const FAV_SVG = U.FAV_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>';
  const ADD_SVG = U.ADD_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>';

  const lang = U.lang || function () { const s = localStorage.getItem("btt_lang"); return ["ru", "uz", "en"].includes(s) ? s : "ru"; };
  const t = U.t || function (k) { const I = window.BTT_I18N || {}; const d = I[lang()] || {}; if (d[k] != null) return d[k]; const ru = I.ru || {}; return ru[k] != null ? ru[k] : k; };

  // Best image for a product: CRM upload → deterministic placeholder → generic.
  function productImg(p) {
    if (p.image) return mediaUrl(p.image);
    if (window.BTT_PRODUCT_IMG) { const im = window.BTT_PRODUCT_IMG(p.id); if (im && im[0]) return im[0].full; }
    return "https://loremflickr.com/800/800/rattan,furniture/all?lock=" + (String(p.id).replace(/\D/g, "") || "1");
  }

  function buildCard(p) {
    const art = document.createElement("article");
    art.className = "product reveal";
    art.setAttribute("data-product", "");
    art.setAttribute("data-cat", p.category || "");
    const disc = p.price_old && p.price_old > p.price_now
      ? Math.round((1 - p.price_now / p.price_old) * 100) : 0;
    const sale = disc ? '<span class="badge-sale">-' + disc + "%</span>" : "";
    const old = p.price_old ? '<span class="price__old">' + money(p.price_old) + "</span>" : "";
    art.innerHTML =
      '<div class="product__media media">' + sale +
      '<button class="fav" data-fav data-i18n-aria="a11y.fav" aria-label="' + esc(t("a11y.fav")) + '">' + FAV_SVG + "</button>" +
      '<img src="' + esc(productImg(p)) + '" alt="' + esc(p.name || "") + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">' +
      '<a class="see" href="product.html?id=' + esc(p.id) + '" data-i18n="see">' + esc(t("see")) + "</a>" +
      '<button class="add" data-add data-i18n-aria="a11y.add" aria-label="' + esc(t("a11y.add")) + '">' + ADD_SVG + "</button>" +
      "</div><div>" +
      '<div class="product__cat">' + esc(p.category_label || "") + "</div>" +
      '<div class="product__name" style="margin-top:4px">' + esc(p.name || "") + "</div>" +
      '<div class="price" style="margin-top:8px"><span class="price__now">' + money(p.price_now) + "</span>" + old + "</div>" +
      "</div>";
    return art;
  }

  // Patch one card in place from the CRM data. Returns { id, product } or null.
  function patchCard(card, map) {
    const see = card.querySelector("a[href*='product.html?id=']");
    const id = see && idFromHref(see.getAttribute("href"));
    if (!id) return null;
    const p = map[id];
    if (!p) return { id: id, product: null };
    const now = card.querySelector(".price__now");
    if (now) now.textContent = money(p.price_now);
    const old = card.querySelector(".price__old");
    if (old) {
      if (p.price_old) { old.textContent = money(p.price_old); old.style.display = ""; }
      else old.style.display = "none";
    }
    const nameEl = card.querySelector(".product__name");
    if (nameEl && p.name) nameEl.textContent = p.name;
    const catEl = card.querySelector(".product__cat");
    if (catEl && !catEl.hasAttribute("data-i18n") && p.category_label) catEl.textContent = p.category_label;
    const img = card.querySelector(".product__media img");
    if (img && p.name && !img.getAttribute("alt")) img.setAttribute("alt", p.name);
    if (p.image && img) { img.src = mediaUrl(p.image); img.style.display = ""; }
    return { id: id, product: p };
  }

  // Curated grids (e.g. home featured): patch prices/names/photos only.
  function patchGrid(grid, map) {
    grid.querySelectorAll("[data-product]").forEach((card) => patchCard(card, map));
  }

  // Catalog grid: patch + drop products removed in the CRM + append new ones.
  function hydrateCatalogGrid(grid, list, map) {
    let changed = false;
    grid.querySelectorAll("[data-product]").forEach((card) => {
      const r = patchCard(card, map);
      if (!r) return;
      if (!r.product) { card.remove(); changed = true; return; }
      r.product._seen = true;
    });
    const frag = document.createDocumentFragment();
    list.forEach((p) => { if (!p._seen) { frag.appendChild(buildCard(p)); changed = true; } });
    if (frag.childNodes.length) grid.appendChild(frag);
    if (changed) {
      document.dispatchEvent(new CustomEvent("btt:related-rendered", { detail: { grid } }));
      const active = document.querySelector('.cat-chips .chip.is-active') || document.querySelector('.cat-chips .chip[data-cat="all"]');
      if (active) active.click();
    }
  }

  // One source of truth for the CRM product list, cached per language so that
  // every surface (catalog, home, related, search) shares the same data and
  // language switches stay correct without re-fetching within a language.
  const _mapCache = {};
  function ensureMap() {
    const lg = lang();
    if (_mapCache[lg]) return _mapCache[lg];
    const pr = window.BTT_API.products("all")
      .then((res) => {
        const list = res.products || [];
        const map = {};
        list.forEach((p) => { map[p.id] = p; });
        return { list, map };
      })
      .catch(() => ({ list: [], map: {} }));
    _mapCache[lg] = pr;
    return pr;
  }

  async function hydrateCatalog() {
    const catGrid = document.querySelector("#catalog-grid");
    const homeGrid = document.querySelector("#home-grid");
    if (!catGrid && !homeGrid) return;
    const { list, map } = await ensureMap();
    if (!list.length) return; // never blank the storefront on an empty/bad response
    if (homeGrid) patchGrid(homeGrid, map);
    if (catGrid) hydrateCatalogGrid(catGrid, list, map);
  }

  // Pull CRM images/prices/names into any product grid rendered after us —
  // most importantly the PDP "related" grid built by pdp.js.
  document.addEventListener("btt:related-rendered", async (e) => {
    const grid = e.detail && e.detail.grid;
    if (!grid || grid.id === "catalog-grid") return;
    const { map } = await ensureMap();
    patchGrid(grid, map);
  });

  function knownStatic(id) { return !!(window.BTT_PRODUCTS && window.BTT_PRODUCTS[id]); }

  function showPdp404() {
    const main = document.querySelector("main.pdp-flow");
    if (!main) return;
    main.innerHTML =
      '<section class="pdp-404" style="text-align:center;padding:96px 0 120px">' +
      '<h1 style="margin-bottom:12px">' + esc(t("pdp.notFound") || "Товар не найден") + "</h1>" +
      '<p class="muted" style="margin:0 auto 26px;max-width:420px">' + esc(t("pdp.notFoundSub") || "Возможно, товар снят с продажи или ссылка устарела.") + "</p>" +
      '<a class="btn btn--dark" href="catalog.html">' + esc(t("nav.catalog2") || "Каталог") + "</a>" +
      "</section>";
    document.title = "Bententrade — 404";
  }

  // Per-language cache so language switches never refetch or flash a 404.
  const _pdpCache = {};
  let _pdp404 = false;

  async function hydratePDP() {
    if (!document.querySelector(".pdp-info")) return;
    if (_pdp404) return;
    const id = new URLSearchParams(location.search).get("id") || "p1";
    const lg = lang();
    if (_pdpCache[lg]) { applyPDP(_pdpCache[lg]); return; }
    let res;
    try {
      res = await window.BTT_API.product(id);
    } catch (e) {
      // API said "not found" (or is unreachable): only hard-404 for ids that
      // aren't part of the built-in static catalogue (offline safety net).
      if (!knownStatic(id)) { _pdp404 = true; showPdp404(); }
      return;
    }
    const p = res && res.product;
    if (!p) { if (!knownStatic(id)) { _pdp404 = true; showPdp404(); } return; }
    _pdpCache[lg] = p;
    applyPDP(p);
  }

  // Apply a CRM product onto the static PDP markup (runs after pdp.js re-render).
  function applyPDP(p) {
    // Name / breadcrumb / category / description straight from the CRM.
    const h1 = document.querySelector(".pdp-info h1");
    if (h1 && p.name) { h1.textContent = p.name; document.title = "Bententrade — " + p.name; }
    const crumb = document.querySelector(".crumb .cur");
    if (crumb && p.name) crumb.textContent = p.name;
    const catEl = document.querySelector(".pdp-info .product__cat");
    if (catEl && p.category_label) catEl.textContent = p.category_label;
    const desc = document.querySelector(".pdp-desc");
    if (desc && p.description) desc.textContent = p.description;

    // Sizes (index-based, mirrors pdp.js).
    if (Array.isArray(p.sizes) && p.sizes.length) {
      document.querySelectorAll(".size-row .size-btn").forEach((b, i) => {
        if (p.sizes[i] != null) { b.textContent = p.sizes[i]; b.style.display = ""; }
        else b.style.display = "none";
      });
    }

    const now = document.querySelector(".pdp-price .now");
    if (now) now.textContent = money(p.price_now);
    const old = document.querySelector(".pdp-price .old");
    if (old) {
      if (p.price_old) { old.textContent = money(p.price_old); old.style.display = ""; }
      else old.style.display = "none";
    }
    // Real gallery from the CRM: override the placeholder images when media exist.
    const urls = (p.media || []).map((m) => mediaUrl(m.key)).filter(Boolean);
    if (urls.length) {
      const stage = document.querySelectorAll("[data-stage] img");
      const thumbs = document.querySelectorAll("[data-thumb]");
      stage.forEach((im, i) => {
        if (urls[i]) { im.src = urls[i]; im.style.display = ""; im.classList.toggle("is-on", i === 0); }
        else { im.style.display = "none"; im.classList.remove("is-on"); }
      });
      thumbs.forEach((btn, i) => {
        const tImg = btn.querySelector("img");
        if (urls[i]) { if (tImg) tImg.src = urls[i]; btn.style.display = ""; btn.classList.toggle("is-active", i === 0); }
        else { btn.style.display = "none"; btn.classList.remove("is-active"); }
      });
    }
  }

  function run() { hydrateCatalog(); hydratePDP(); }

  document.addEventListener("DOMContentLoaded", function () {
    run();
    // Re-apply after language switches. We observe the <html lang> attribute
    // (registered after pdp.js's observer, so our CRM data lands *after* the
    // static re-render) instead of listening to individual buttons.
    new MutationObserver(() => run()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  });
})();
