/* ============================================================
   BENTENTRADE - hydrate catalog & PDP prices/names from the API.
   The static HTML remains the fallback; when the backend is
   reachable it becomes the source of truth (so prices edited in
   the CRM show up on the site without touching the markup).
   ============================================================ */
(function () {
  "use strict";
  if (!window.BTT_API) return;

  const U = window.BTT_UTIL || {};
  const money = (n) => (window.BTT_UTIL && window.BTT_UTIL.formatMoney)
    ? window.BTT_UTIL.formatMoney(n)
    : (String(Math.round(Number(n) * 12500)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + "\u00a0сум");
  const mediaUrl = (key) => {
    if (!key) return "";
    if (key.startsWith("assets/") || key.startsWith("/assets/") || key.startsWith("http://") || key.startsWith("https://") || key.startsWith("/")) {
      return key;
    }
    return "/media/" + key;
  };
  const esc = U.esc || ((s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  const idFromHref = (href) => {
    if (!href) return null;
    const m = href.match(/[?&]id=([^&#]+)/);
    if (m) return decodeURIComponent(m[1]);
    const m2 = href.match(/\/catalog\/([^/?#]+)/);
    if (m2) return decodeURIComponent(m2[1]);
    return null;
  };

  const FAV_SVG = U.FAV_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>';
  const ADD_SVG = U.ADD_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>';

  const lang = U.lang || function () { const s = localStorage.getItem("btt_lang"); return ["ru", "uz", "en"].includes(s) ? s : "ru"; };
  const t = U.t || function (k) { const I = window.BTT_I18N || {}; const d = I[lang()] || {}; if (d[k] != null) return d[k]; const ru = I.ru || {}; return ru[k] != null ? ru[k] : k; };

  // Best image for a product: CRM upload → deterministic placeholder → generic.
  function productImg(p) {
    if (p.image) return mediaUrl(p.image);
    if (window.BTT_PRODUCT_IMG) { const im = window.BTT_PRODUCT_IMG(p.id); if (im && im[0]) return im[0].full; }
    const cat = p.category || "tables";
    const C = window.BTT_CAT_IMG || {};
    return C[cat] || C["wicker-chairs"] || "assets/hero-garden-furniture.png";
  }

  function hydrateStaticProductImgs(root) {
    if (!window.BTT_PRODUCT_IMG || !root) return;
    root.querySelectorAll("[data-product]").forEach((card) => {
      let id = card.dataset.slug || card.dataset.id;
      if (!id) {
        const see = card.querySelector("a[href*='product.html?id='], a[href*='/catalog/']");
        id = see && idFromHref(see.getAttribute("href"));
      }
      if (!id) return;
      const im = window.BTT_PRODUCT_IMG(id);
      const img = card.querySelector(".product__media img");
      const activeSwatch = card.querySelector(".product-swatch.is-active");
      if (img) {
        if (activeSwatch && activeSwatch.dataset.img) {
          img.src = activeSwatch.dataset.img;
        } else if (im && im[0]) {
          img.src = im[0].full;
        }
        img.removeAttribute("onerror");
      }
    });
    if (window.BTT_INIT_SWATCHES) window.BTT_INIT_SWATCHES(root);
  }

  function buildCard(p) {
    const art = document.createElement("article");
    art.className = "product reveal";
    art.setAttribute("data-product", "");
    art.setAttribute("data-cat", p.category || "");
    art.setAttribute("data-slug", p.slug || p.id);
    art.setAttribute("data-id", p.id);
    art.setAttribute("data-price", String(p.price_now));
    const disc = p.price_old && p.price_old > p.price_now
      ? Math.round((1 - p.price_now / p.price_old) * 100) : 0;
    const sale = disc ? '<span class="badge-sale">-' + disc + "%</span>" : "";
    const avail = p.availability || "unknown";
    let availBadge = "";
    if (avail === "on_request" || (avail === "unknown" && p.stock === 0)) {
      availBadge = '<span class="badge-mto" data-i18n="mto.badge">' + esc(t("mto.badge") || "Под заказ") + "</span>";
    } else if (avail === "out_of_stock") {
      availBadge = '<span class="badge-mto badge-oos">' + esc(t("availability.out_of_stock") || "Нет в наличии") + "</span>";
    } else if (avail === "low_stock") {
      availBadge = '<span class="badge-sale badge-low">' + esc(t("availability.low_stock") || "Осталось мало") + "</span>";
    }
    const old = p.price_old ? '<span class="price__old">' + money(p.price_old) + "</span>" : "";
    const href = p.slug ? ("/catalog/" + encodeURIComponent(p.slug)) : ("product.html?id=" + esc(p.id));
    const masterProd = (window.BTT_PRODUCTS && (window.BTT_PRODUCTS[p.slug] || window.BTT_PRODUCTS[p.id])) || p;
    const confirmed = masterProd.confirmedColors || [];
    let swatchesHtml = "";
    if (confirmed.length > 0) {
      swatchesHtml =
        '<div class="product-swatches" aria-label="' + esc(t("colors.label") || "Цвета") + '">' +
        confirmed.map(function(c, idx) {
          const cName = (c.name && (c.name[lang()] || c.name.ru)) || c.id;
          const cImg = c.image || (idx === 0 ? productImg(p) : "");
          return '<button type="button" class="product-swatch' + (idx === 0 ? ' is-active' : '') +
            '" style="--swatch-color:' + esc(c.hex) +
            '" data-color="' + esc(c.id) +
            '" data-img="' + esc(cImg) +
            '" title="' + esc(cName) +
            '" aria-label="' + esc(cName) + '"></button>';
        }).join('') +
        '</div>';
    } else {
      swatchesHtml =
        '<div class="product__color-note" data-i18n="pdp.askColors">' + esc(t("pdp.askColors") || "Цвета уточняйте у менеджера") + '</div>';
    }

    art.setAttribute("data-colors", confirmed.map(function(c){ return c.id; }).join(" "));

    art.innerHTML =
      '<div class="product__media media">' + sale + availBadge +
      '<button class="fav" data-fav data-i18n-aria="a11y.fav" aria-label="' + esc(t("a11y.fav")) + '">' + FAV_SVG + "</button>" +
      '<img src="' + esc(productImg(p)) + '" alt="' + esc(p.name || "") + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">' +
      '<a class="see" href="' + href + '" data-i18n="see">' + esc(t("see")) + "</a>" +
      '<button class="add" data-add data-i18n-aria="a11y.add" aria-label="' + esc(t("a11y.add")) + '" title="' + esc(t("a11y.add")) + '">' + ADD_SVG + "</button>" +
      "</div><div>" +
      '<div class="product__cat">' + esc(p.category_label || "") + "</div>" +
      '<div class="product__name">' + esc(p.name || "") + "</div>" +
      swatchesHtml +
      '<div class="price" style="margin-top:8px"><span class="price__now">' + money(p.price_now) + "</span>" + old + "</div>" +
      "</div>";
    return art;
  }

  // Patch one card in place from the CRM data. Returns { id, product } or null.
  function patchCard(card, map) {
    let id = card.dataset.slug || card.dataset.id;
    if (!id) {
      const see = card.querySelector("a[href*='product.html?id='], a[href*='/catalog/']");
      id = see && idFromHref(see.getAttribute("href"));
    }
    if (!id) return null;
    const p = map[id] || (window.BTT_PRODUCTS && window.BTT_PRODUCTS[id] ? map[window.BTT_PRODUCTS[id].slug] : null);
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

    // Ensure swatches match master confirmedColors
    const masterProd = (window.BTT_PRODUCTS && (window.BTT_PRODUCTS[id] || (p.slug && window.BTT_PRODUCTS[p.slug]))) || p;
    const confirmed = (masterProd && masterProd.confirmedColors) || [];
    if (confirmed.length > 0) {
      const colorIds = confirmed.map(function(c){ return c.id; });
      if (colorIds.indexOf("black-marble") !== -1 && colorIds.indexOf("black") === -1) colorIds.push("black");
      if (colorIds.indexOf("white-marble") !== -1 && colorIds.indexOf("white") === -1) colorIds.push("white");
      card.setAttribute("data-colors", colorIds.join(" "));

      let swWrap = card.querySelector(".product-swatches");
      if (!swWrap || swWrap.children.length !== confirmed.length) {
        if (!swWrap) {
          swWrap = document.createElement("div");
          swWrap.className = "product-swatches";
          swWrap.setAttribute("aria-label", t("colors.label") || "Цвета");
          const nEl = card.querySelector(".product__name");
          if (nEl && nEl.parentNode) {
            nEl.parentNode.insertBefore(swWrap, nEl.nextSibling);
          }
        }
        swWrap.innerHTML = confirmed.map(function(c, idx) {
          const cName = (c.name && (c.name[lang()] || c.name.ru)) || c.id;
          const cImg = c.image || (idx === 0 ? productImg(p) : "");
          return '<button type="button" class="product-swatch' + (idx === 0 ? ' is-active' : '') +
            '" style="--swatch-color:' + esc(c.hex) +
            '" data-color="' + esc(c.id) +
            '" data-img="' + esc(cImg) +
            '" title="' + esc(cName) +
            '" aria-label="' + esc(cName) + '"></button>';
        }).join('');
      }
    }

    const img = card.querySelector(".product__media img");
    const localized = t(id + ".name");
    if (img && localized) img.setAttribute("alt", localized);
    else if (img && p.name && !img.getAttribute("alt")) img.setAttribute("alt", p.name);

    const activeSwatch = card.querySelector(".product-swatch.is-active");
    if (img) {
      if (activeSwatch && activeSwatch.dataset.img) {
        img.src = mediaUrl(activeSwatch.dataset.img);
      } else if (p.image) {
        img.src = mediaUrl(p.image);
      }
      img.style.display = "";
    }
    return { id: id, product: p };
  }

  // Curated grids (e.g. home featured): patch prices/names/photos only.
  function patchGrid(grid, map) {
    grid.querySelectorAll("[data-product]").forEach((card) => patchCard(card, map));
    if (window.BTT_INIT_SWATCHES) window.BTT_INIT_SWATCHES(grid);
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
      const active = document.querySelector('[data-chips] .chip.is-active') || document.querySelector('.cat-chips .chip.is-active') || document.querySelector('[data-chips] .chip[data-cat="all"]') || document.querySelector('.cat-chips .chip[data-cat="all"]');
      if (active) active.click();
    }
    if (window.BTT_INIT_SWATCHES) window.BTT_INIT_SWATCHES(grid);
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

  function syncCatalogCount() {
    const el = document.querySelector("[data-cat-count]");
    const mobEl = document.querySelector("[data-mob-count]");
    const grid = document.querySelector("#catalog-grid");
    if (!el && !mobEl) return;
    let countStr = "16";
    if (grid) {
      const cards = Array.from(grid.querySelectorAll("[data-product]"));
      const shown = cards.filter(c => c.style.display !== "none").length;
      countStr = String(shown || (window.BTT_CANONICAL_SLUGS && window.BTT_CANONICAL_SLUGS.length) || 16);
    } else {
      const n = (window.BTT_CANONICAL_SLUGS && window.BTT_CANONICAL_SLUGS.length) || 16;
      countStr = String(n);
    }
    if (el) el.textContent = countStr;
    if (mobEl) mobEl.textContent = countStr;
  }

  function appendMissingStaticProducts(grid) {
    const P = window.BTT_PRODUCTS;
    const slugs = window.BTT_CANONICAL_SLUGS || [];
    if (!grid || !P) return false;
    const seen = new Set();
    grid.querySelectorAll("[data-product]").forEach((card) => {
      const slug = card.dataset.slug || card.dataset.id;
      if (slug) seen.add(slug);
      const see = card.querySelector("a[href*='product.html?id='], a[href*='/catalog/']");
      const pid = see && idFromHref(see.getAttribute("href"));
      if (pid) seen.add(pid);
    });
    const frag = document.createDocumentFragment();
    let added = false;
    const list = slugs.length ? slugs : Object.keys(P);
    list.forEach((pid) => {
      if (seen.has(pid)) return;
      const row = P[pid];
      if (!row) return;
      frag.appendChild(buildCard({
        id: pid,
        slug: row.slug || pid,
        category: row.cat || row.category,
        category_label: t(pid + ".cat"),
        name: t(pid + ".name"),
        price_now: row.now || row.price,
        price_old: row.old || 0,
        stock: row.stock,
        availability: row.availability,
      }));
      seen.add(pid);
      if (row.slug) seen.add(row.slug);
      if (row.legacyId) seen.add(row.legacyId);
      added = true;
    });
    if (added) {
      grid.appendChild(frag);
      document.dispatchEvent(new CustomEvent("btt:related-rendered", { detail: { grid } }));
    }
    return added;
  }

  async function hydrateCatalog() {
    const catGrid = document.querySelector("#catalog-grid");
    const homeGrid = document.querySelector("#home-grid");
    const rattanGrid = document.querySelector("#rattan-grid");
    if (!catGrid && !homeGrid && !rattanGrid) return;
    const { list, map } = await ensureMap();
    if (!list.length) {
      if (catGrid) appendMissingStaticProducts(catGrid);
      syncCatalogCount();
      return;
    }
    if (homeGrid) patchGrid(homeGrid, map);
    if (rattanGrid) patchGrid(rattanGrid, map);
    if (catGrid) hydrateCatalogGrid(catGrid, list, map);
    syncCatalogCount();
  }

  // Pull CRM images/prices/names into any product grid rendered after us -
  // most importantly the PDP "related" grid built by pdp.js.
  document.addEventListener("btt:related-rendered", async (e) => {
    const grid = e.detail && e.detail.grid;
    if (!grid || grid.id === "catalog-grid") return;
    const { map } = await ensureMap();
    patchGrid(grid, map);
  });

  function knownStatic(id) {
    if (!id) return false;
    const k = String(id).toLowerCase().trim();
    if (window.BTT_PRODUCTS && window.BTT_PRODUCTS[k]) return true;
    if (window.BTT_RESOLVE_PRODUCT) {
      const r = window.BTT_RESOLVE_PRODUCT(k);
      if (r && window.BTT_PRODUCTS && window.BTT_PRODUCTS[r]) return true;
    }
    return false;
  }

  function showPdp404() {
    const main = document.querySelector("main.pdp-flow");
    if (!main) return;
    main.innerHTML =
      '<section class="pdp-404" style="text-align:center;padding:96px 0 120px">' +
      '<h1 style="margin-bottom:12px">' + esc(t("pdp.notFound") || "Товар не найден") + "</h1>" +
      '<p class="muted" style="margin:0 auto 26px;max-width:420px">' + esc(t("pdp.notFoundSub") || "Возможно, товар снят с продажи или ссылка устарела.") + "</p>" +
      '<a class="btn btn--dark" href="catalog.html">' + esc(t("nav.catalog2") || "Каталог") + "</a>" +
      "</section>";
    document.title = "BTT - 404";
  }

  // Per-language cache so language switches never refetch or flash a 404.
  const _pdpCache = {};
  let _pdp404 = false;

  async function hydratePDP() {
    if (!document.querySelector(".pdp-info")) return;
    if (_pdp404) return;
    const catMatch = location.pathname.match(/\/catalog\/([a-z0-9-]+)/i);
    const rawId = (catMatch && catMatch[1]) || new URLSearchParams(location.search).get("id") || new URLSearchParams(location.search).get("slug");
    if (!rawId) return;
    const id = rawId.toLowerCase().trim();
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
    if (!window.BTT_PRODUCTS) window.BTT_PRODUCTS = {};
    const existing = window.BTT_PRODUCTS[p.id] || (p.slug && window.BTT_PRODUCTS[p.slug]) || {};
    const updated = Object.assign({}, existing, {
      cat: p.category || existing.cat || "furniture",
      look: p.look || existing.look || "sofa",
      now: p.price_now != null ? p.price_now : existing.now,
      price: p.price_now != null ? p.price_now : existing.price,
      old: p.price_old != null ? p.price_old : (existing.old || 0),
      availability: p.availability || existing.availability || "unknown",
      stock: p.stock != null ? p.stock : existing.stock
    });
    window.BTT_PRODUCTS[p.id] = updated;
    if (p.slug) window.BTT_PRODUCTS[p.slug] = updated;

    // Availability badge
    const availEl = document.querySelector("[data-pdp-avail]");
    const avail = p.availability || "unknown";
    if (availEl) {
      if (avail === "unknown") {
        availEl.style.display = "none";
      } else {
        availEl.style.display = "";
        availEl.className = "badge-avail badge-avail--" + avail;
        availEl.textContent = t("availability." + avail) || avail;
      }
    }

    // Name / breadcrumb / category / description straight from the CRM.
    const h1 = document.querySelector(".pdp-info h1");
    if (h1 && p.name) { h1.textContent = p.name; document.title = "BTT - " + p.name; }
    const crumb = document.querySelector(".crumb .cur");
    if (crumb && p.name) crumb.textContent = p.name;
    const catEl = document.querySelector(".pdp-info .product__cat");
    if (catEl && p.category_label) catEl.textContent = p.category_label;
    const desc = document.querySelector(".pdp-desc");
    if (desc && p.description) desc.textContent = p.description;

    // Specifications from CRM.
    if (p.specs && typeof p.specs === "object") {
      const keys = ["mat", "dim", "fin", "wt", "seat", "made"];
      const specVals = document.querySelectorAll(".pdp-detail .spec-row .v");
      keys.forEach((k, idx) => {
        if (p.specs[k] && specVals[idx]) {
          specVals[idx].textContent = p.specs[k];
        }
      });
    }

    // Sizes (index-based, mirrors pdp.js).
    if (Array.isArray(p.sizes) && p.sizes.length) {
      document.querySelectorAll(".size-row .size-btn").forEach((b, i) => {
        if (p.sizes[i] != null) { b.textContent = p.sizes[i]; b.style.display = ""; }
        else b.style.display = "none";
      });
    }

    // Hydrate confirmed color swatches from CRM specs only if pdp.js hasn't already loaded confirmed colors
    let cColors = null;
    if (p.specs && typeof p.specs === "object" && Array.isArray(p.specs.confirmed_colors) && p.specs.confirmed_colors.length) {
      cColors = p.specs.confirmed_colors;
    }
    if (cColors && window.BTT_PDP_PRODUCT && (!window.BTT_PDP_PRODUCT.confirmedColors || !window.BTT_PDP_PRODUCT.confirmedColors.length)) {
      window.BTT_PDP_PRODUCT.confirmedColors = cColors;
      const wrap = document.querySelector("[data-pdp-swatches]");
      const note = document.querySelector("[data-pdp-color-note]");
      const valEl = document.querySelector("[data-finish-val]");
      if (wrap) {
        wrap.innerHTML = "";
        const curLang = lang();
        // Respect ?color= URL parameter already applied by pdp.js
        const requestedColor = new URLSearchParams(window.location.search).get("color") || "";
        let activeIdx = 0;
        if (requestedColor) {
          const found = cColors.findIndex(c =>
            (c.id && c.id.toLowerCase() === requestedColor.toLowerCase()) ||
            (c.hex && c.hex.toLowerCase() === requestedColor.toLowerCase())
          );
          if (found >= 0) activeIdx = found;
        }
        cColors.forEach((c, idx) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "swatch" + (idx === activeIdx ? " is-active" : "");
          btn.style.background = c.hex;
          const cName = (c.name && (c.name[curLang] || c.name.ru)) || c[curLang] || c.ru || c.id;
          btn.setAttribute("aria-label", cName);
          btn.title = cName;
          btn.dataset.colorName = cName;
          btn.dataset.colorId = c.id || "";
          btn.addEventListener("click", () => {
            wrap.querySelectorAll(".swatch").forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            if (valEl) valEl.textContent = cName;
            const colorImages = (c.images && c.images.length)
              ? c.images
              : (c.image ? [c.image] : null);
            if (colorImages && window.BTT_PDP_PRODUCT && typeof window.setGallery === "function") {
              window.setGallery(colorImages, 0);
            } else if (c.image) {
              const cleanImg = (c.image.startsWith("/") || c.image.startsWith("http")) ? c.image : ("/" + c.image);
              const thumbs = document.querySelectorAll("[data-thumb]");
              let matchedIdx = -1;
              thumbs.forEach((th, i) => {
                const tImg = th.querySelector("img");
                if (tImg) {
                  const tSrc = tImg.getAttribute("src") || tImg.src || "";
                  const cleanTSrc = (tSrc.startsWith("/") || tSrc.startsWith("http")) ? tSrc : ("/" + tSrc);
                  if (cleanTSrc === cleanImg || cleanTSrc.endsWith(cleanImg) || cleanImg.endsWith(cleanTSrc)) {
                    matchedIdx = i;
                  }
                }
              });
              if (matchedIdx >= 0) {
                thumbs[matchedIdx].click();
              } else {
                const stageImg = document.querySelector(".pdp-stage img.is-on") || document.querySelector(".pdp-stage img");
                if (stageImg) stageImg.src = cleanImg;
                const stickyImg = document.querySelector("[data-sticky-img]");
                if (stickyImg) stickyImg.src = cleanImg;
              }
            }
            try {
              const u = new URL(window.location.href);
              u.searchParams.set("color", c.id || "");
              window.history.replaceState({}, "", u.toString());
            } catch(e) {}
          });
          wrap.appendChild(btn);
        });
        const activeColor = cColors[activeIdx];
        const activeColorName = (activeColor.name && (activeColor.name[curLang] || activeColor.name.ru)) || activeColor[curLang] || activeColor.ru || activeColor.id;
        if (valEl) valEl.textContent = activeColorName;
        if (note) note.style.display = "none";
      }
    }

    const now = document.querySelector(".pdp-price .now");
    if (now) now.textContent = money(p.price_now);
    const old = document.querySelector(".pdp-price .old");
    if (old) {
      if (p.price_old) { old.textContent = money(p.price_old); old.style.display = ""; }
      else old.style.display = "none";
    }
    const save = document.querySelector(".pdp-price .save");
    if (save) {
      if (p.price_old && p.price_old > p.price_now) {
        save.style.display = "";
        const word = t("pdp.save");
        save.textContent = word + "\u00a0" + money(p.price_old - p.price_now);
      } else save.style.display = "none";
    }

    // Mobile sticky dock & lightbox.
    const stickyTitle = document.querySelector("[data-sticky-title]");
    if (stickyTitle && p.name) stickyTitle.textContent = p.name;
    const stickyPrice = document.querySelector("[data-sticky-price]");
    if (stickyPrice) stickyPrice.textContent = money(p.price_now);
    const stickyOld = document.querySelector("[data-sticky-old]");
    if (stickyOld) {
      if (p.price_old) { stickyOld.textContent = money(p.price_old); stickyOld.style.display = ""; }
      else stickyOld.style.display = "none";
    }

    // Real gallery from the CRM: override placeholder images only if pdp.js setGallery is not active
    if (!window.setGallery && !window.BTT_SET_GALLERY) {
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
        const stickyImg = document.querySelector("[data-sticky-img]");
        if (stickyImg) stickyImg.src = urls[0];
        const lbImg = document.querySelector("[data-lightbox-img]");
        if (lbImg) lbImg.src = urls[0];
      }
    }
  }

  function run() {
    hydrateStaticProductImgs(document.querySelector("#catalog-grid"));
    hydrateStaticProductImgs(document.querySelector("#home-grid"));
    hydrateStaticProductImgs(document.querySelector("#rattan-grid"));
    hydrateStaticProductImgs(document.querySelector("#indoor-grid"));
    hydrateCatalog();
    hydratePDP();
  }

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

  document.addEventListener("btt:cookies-accepted", function () {
    Object.keys(_mapCache).forEach(function (k) { delete _mapCache[k]; });
    Object.keys(_pdpCache).forEach(function (k) { delete _pdpCache[k]; });
    _pdp404 = false;
    run();
  });
})();
