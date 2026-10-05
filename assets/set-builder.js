/* ============================================================
   BTT - Interactive Custom Set Builder (Конструктор комплектов)
   Rules & Pricing strictly adhered to AGENTS.md / GEMINI.md
   ============================================================ */
(function() {
  "use strict";

  const TABLES = [
    {
      id: "stol-vertex-d90",
      name: { ru: "Vertex D90 (круглый Ø90)", uz: "Vertex D90 (dumaloq Ø90)", en: "Vertex D90 (round Ø90)" },
      dim: "Ø90 × 75 см",
      retailPrice: 730000,
      bundlePrice: 680000,
      colors: [
        { id: "white-marble", name: { ru: "Белый мрамор", uz: "Oq marmar", en: "White Marble" }, hex: "#E8E6E1", img: "assets/prod-table-vertex-d90.jpg" },
        { id: "black-marble", name: { ru: "Чёрный мрамор", uz: "Qora marmar", en: "Black Marble" }, hex: "#2B2A29", img: "assets/prod-table-vertex-black.jpg" }
      ]
    },
    {
      id: "stol-taper-80",
      name: { ru: "Taper 80×80 (квадратный)", uz: "Taper 80×80 (kvadrat)", en: "Taper 80×80 (square)" },
      dim: "80 × 80 × 75 см",
      retailPrice: 783000,
      bundlePrice: 733000,
      colors: [
        { id: "white-marble", name: { ru: "Белый мрамор", uz: "Oq marmar", en: "White Marble" }, hex: "#E8E6E1", img: "assets/prod-table-taper-80-white.jpg" },
        { id: "black-marble", name: { ru: "Чёрный мрамор", uz: "Qora marmar", en: "Black Marble" }, hex: "#2B2A29", img: "assets/prod-table-taper-80-black.jpg" }
      ]
    },
    {
      id: "stol-taper-rotang-80",
      name: { ru: "Taper Rotang 80×80", uz: "Taper Rotang 80×80", en: "Taper Rotang 80×80" },
      dim: "80 × 80 × 75 см",
      retailPrice: 904000,
      bundlePrice: 854000,
      colors: [
        { id: "white-marble", name: { ru: "Белый мрамор", uz: "Oq marmar", en: "White Marble" }, hex: "#E8E6E1", img: "assets/prod-table-taper-rotang-80-white.jpg" },
        { id: "black-marble", name: { ru: "Чёрный мрамор", uz: "Qora marmar", en: "Black Marble" }, hex: "#2B2A29", img: "assets/prod-table-taper-rotang-80-black.jpg" }
      ]
    },
    {
      id: "stol-taper-135",
      name: { ru: "Taper 135×80 (прямоугольный)", uz: "Taper 135×80 (to‘g‘ri burchakli)", en: "Taper 135×80 (rectangular)" },
      dim: "135 × 80 × 75 см",
      retailPrice: 910000,
      bundlePrice: 860000,
      colors: [
        { id: "white-marble", name: { ru: "Белый мрамор", uz: "Oq marmar", en: "White Marble" }, hex: "#E8E6E1", img: "assets/prod-table-taper-135-white.jpg" },
        { id: "black-marble", name: { ru: "Чёрный мрамор", uz: "Qora marmar", en: "Black Marble" }, hex: "#2B2A29", img: "assets/prod-table-taper-135-black.jpg" }
      ]
    },
    {
      id: "stol-corda-135",
      name: { ru: "Corda 135×80 (прямоугольный)", uz: "Corda 135×80 (to‘g‘ri burchakli)", en: "Corda 135×80 (rectangular)" },
      dim: "135 × 80 × 75 см",
      retailPrice: 999000,
      bundlePrice: 949000,
      colors: [
        { id: "white-marble", name: { ru: "Белый мрамор", uz: "Oq marmar", en: "White Marble" }, hex: "#E8E6E1", img: "assets/prod-table-corda-135-white.jpg" },
        { id: "black-marble", name: { ru: "Чёрный мрамор", uz: "Qora marmar", en: "Black Marble" }, hex: "#2B2A29", img: "assets/prod-table-corda-135-black.jpg" }
      ]
    },
    {
      id: "stol-taper-rotang-135",
      name: { ru: "Taper Rotang 135×80", uz: "Taper Rotang 135×80", en: "Taper Rotang 135×80" },
      dim: "135 × 80 × 75 см",
      retailPrice: 954000,
      bundlePrice: 954000,
      colors: [
        { id: "white-marble", name: { ru: "Белый мрамор", uz: "Oq marmar", en: "White Marble" }, hex: "#E8E6E1", img: "assets/prod-table-taper-rotang-135-white.jpg" },
        { id: "black-marble", name: { ru: "Чёрный мрамор", uz: "Qora marmar", en: "Black Marble" }, hex: "#2B2A29", img: "assets/prod-table-taper-rotang-135-black.jpg" }
      ]
    }
  ];

  const CHAIRS = [
    {
      id: "stul-vertex",
      name: { ru: "Vertex (плетёный)", uz: "Vertex (to‘qilgan)", en: "Vertex (wicker)" },
      type: "wicker",
      retailPrice: 499000,
      bundlePrice: 499000,
      colors: [
        { id: "beige", name: { ru: "Бежевый", uz: "Bej", en: "Beige" }, hex: "#C2B280", img: "assets/prod-chair-vertex.jpg" }
      ]
    },
    {
      id: "stul-corda",
      name: { ru: "Corda (плетёный)", uz: "Corda (to‘qilgan)", en: "Corda (wicker)" },
      type: "wicker",
      retailPrice: 499000,
      bundlePrice: 499000,
      colors: [
        { id: "beige", name: { ru: "Бежевый", uz: "Bej", en: "Beige" }, hex: "#C4A482", img: "assets/prod-chair-corda.jpg" }
      ]
    },
    {
      id: "stul-roero",
      name: { ru: "ROERO (пластиковый)", uz: "ROERO (plastik)", en: "ROERO (plastic)" },
      type: "plastic",
      retailPrice: 188000,
      bundlePrice: 168000,
      colors: [
        { id: "grey", name: { ru: "Серый", uz: "Kulrang", en: "Grey" }, hex: "#808080", img: "assets/prod-chair-roero.jpg" },
        { id: "black", name: { ru: "Чёрный", uz: "Qora", en: "Black" }, hex: "#222222", img: "assets/prod-chair-roero-black.jpg" },
        { id: "white", name: { ru: "Белый", uz: "Oq", en: "White" }, hex: "#FFFFFF", img: "assets/prod-chair-roero-white.jpg" },
        { id: "orange", name: { ru: "Оранжевый", uz: "To‘q sariq", en: "Orange" }, hex: "#D9633B", img: "assets/prod-chair-roero-orange.jpg" }
      ]
    },
    {
      id: "stul-noero",
      name: { ru: "NOERO (пластиковый)", uz: "NOERO (plastik)", en: "NOERO (plastic)" },
      type: "plastic",
      retailPrice: 212000,
      bundlePrice: 192000,
      colors: [
        { id: "cappuccino", name: { ru: "Капучино", uz: "Kapuchino", en: "Cappuccino" }, hex: "#A88D73", img: "assets/prod-chair-noero.jpg" },
        { id: "blue", name: { ru: "Синий", uz: "Ko‘k", en: "Blue" }, hex: "#4E7D9A", img: "assets/prod-chair-noero-blue.jpg" },
        { id: "orange", name: { ru: "Оранжевый", uz: "To‘q sariq", en: "Orange" }, hex: "#D9633B", img: "assets/prod-chair-noero-orange.jpg" },
        { id: "olive", name: { ru: "Оливковый", uz: "Zaytun", en: "Olive" }, hex: "#8A9364", img: "assets/prod-chair-noero-olive.jpg" }
      ]
    },
    {
      id: "stul-todo",
      name: { ru: "TODO (пластиковый)", uz: "TODO (plastik)", en: "TODO (plastic)" },
      type: "plastic",
      retailPrice: 236000,
      bundlePrice: 216000,
      colors: [
        { id: "coffee", name: { ru: "Кофейный", uz: "Qahva", en: "Coffee" }, hex: "#9E7E6B", img: "assets/prod-chair-todo.jpg" },
        { id: "black", name: { ru: "Чёрный", uz: "Qora", en: "Black" }, hex: "#222222", img: "assets/prod-chair-todo-black.jpg" },
        { id: "yellow", name: { ru: "Жёлтый", uz: "Sariq", en: "Yellow" }, hex: "#EAA824", img: "assets/prod-chair-todo-yellow.jpg" },
        { id: "grey", name: { ru: "Серый", uz: "Kulrang", en: "Grey" }, hex: "#808080", img: "assets/prod-chair-todo-gray.jpg" },
        { id: "red", name: { ru: "Красный", uz: "Qizil", en: "Red" }, hex: "#E32626", img: "assets/prod-chair-todo-red.jpg" },
        { id: "white", name: { ru: "Белый", uz: "Oq", en: "White" }, hex: "#FFFFFF", img: "assets/prod-chair-todo-white.jpg" }
      ]
    },
    {
      id: "stul-jardin",
      name: { ru: "JARDIN (пластиковый)", uz: "JARDIN (plastik)", en: "JARDIN (plastic)" },
      type: "plastic",
      retailPrice: 344000,
      bundlePrice: 324000,
      colors: [
        { id: "cappuccino", name: { ru: "Капучино", uz: "Kapuchino", en: "Cappuccino" }, hex: "#A88D73", img: "assets/prod-chair-jardin.jpg" },
        { id: "olive", name: { ru: "Оливковый", uz: "Zaytun", en: "Olive" }, hex: "#768C65", img: "assets/prod-chair-jardin-olive.jpg" },
        { id: "grey", name: { ru: "Серый", uz: "Kulrang", en: "Grey" }, hex: "#808080", img: "assets/prod-chair-jardin-grey.jpg" }
      ]
    }
  ];

  // Strictly approved prices for known combos (AGENTS.md Rule #4)
  const APPROVED_SPECIAL_PRICES_4 = {
    "stol-vertex-d90+stul-vertex": 2676000,
    "stol-vertex-d90+stul-corda": 2676000,
    "stol-taper-80+stul-vertex": 2850000,
    "stol-taper-80+stul-corda": 2850000,
    "stol-taper-rotang-80+stul-vertex": 2850000,
    "stol-taper-rotang-80+stul-corda": 2850000
  };

  function getLang() {
    return (window.BTT_UTIL && window.BTT_UTIL.lang) ? window.BTT_UTIL.lang() : "ru";
  }

  function t(k) {
    return (window.BTT_UTIL && window.BTT_UTIL.t) ? window.BTT_UTIL.t(k) : k;
  }

  function formatMoney(amount) {
    if (window.BTT_UTIL && window.BTT_UTIL.formatMoney) return window.BTT_UTIL.formatMoney(amount);
    return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " сум";
  }

  function loc(obj) {
    if (!obj) return "";
    const l = getLang();
    return obj[l] || obj.ru || "";
  }

  // Active state
  let selectedTableIndex = 0;
  let selectedTableColorIndex = 0;
  let selectedChairIndex = 2; // Default Roero
  let selectedChairColorIndex = 0;
  let selectedChairQty = 4;

  function calculateSet() {
    const table = TABLES[selectedTableIndex];
    const chair = CHAIRS[selectedChairIndex];
    const qty = selectedChairQty;

    const separateTotal = table.retailPrice + (chair.retailPrice * qty);

    let bundlePrice = 0;
    const comboKey = table.id + "+" + chair.id;

    if (qty === 4 && APPROVED_SPECIAL_PRICES_4[comboKey]) {
      bundlePrice = APPROVED_SPECIAL_PRICES_4[comboKey];
    } else {
      if (chair.type === "plastic") {
        bundlePrice = table.bundlePrice + (chair.bundlePrice * qty);
      } else {
        bundlePrice = table.bundlePrice + (499000 * qty);
      }
    }

    const savings = Math.max(0, separateTotal - bundlePrice);

    return {
      table,
      tableColor: table.colors[selectedTableColorIndex] || table.colors[0],
      chair,
      chairColor: chair.colors[selectedChairColorIndex] || chair.colors[0],
      qty,
      separateTotal,
      bundlePrice,
      savings
    };
  }

  function renderBuilder(container) {
    if (!container) return;

    const prevTotalEl = container.querySelector(".set-builder-total-price");
    const prevTotal = prevTotalEl ? (parseInt(prevTotalEl.textContent.replace(/\D/g, ""), 10) || 0) : 0;

    const calc = calculateSet();

    container.innerHTML = `
      <div class="set-builder-card">
        <div class="set-builder-header">
          <div class="eyebrow">${t("builder.eyebrow")}</div>
          <h2 class="display-2" style="margin-top:6px">${t("builder.title")}</h2>
          <p class="muted" style="max-width:60ch;margin-top:8px;font-size:14px">${t("builder.sub")}</p>
        </div>

        <div class="set-builder-grid">
          <!-- Controls Column -->
          <div class="set-builder-controls">
            <!-- 1. Table Selector -->
            <div class="set-builder-section">
              <label class="set-builder-label">${t("builder.step1")}</label>
              <div class="set-builder-options set-builder-options--tables">
                ${TABLES.map((tb, idx) => `
                  <button type="button" class="set-builder-opt ${idx === selectedTableIndex ? "is-active" : ""}" data-select-table="${idx}">
                    <img src="${tb.colors[0].img}" alt="${loc(tb.name)}" loading="lazy">
                    <span class="set-builder-opt-name">${loc(tb.name)}</span>
                    <span class="set-builder-opt-dim">${tb.dim}</span>
                  </button>
                `).join("")}
              </div>

              <!-- Table Color Swatches -->
              <div class="set-builder-swatches-wrap" style="margin-top:10px">
                <span style="font-size:12px;color:var(--muted);margin-right:8px">${t("cat.colorTitle")}:</span>
                <div class="product-swatches" style="display:inline-flex;gap:6px">
                  ${calc.table.colors.map((c, cIdx) => `
                    <button type="button" class="product-swatch ${cIdx === selectedTableColorIndex ? "is-active" : ""}" 
                            style="--swatch-color:${c.hex}" title="${loc(c.name)}" aria-label="${loc(c.name)}" 
                            data-select-table-color="${cIdx}"></button>
                  `).join("")}
                </div>
                <span style="font-size:12px;font-weight:600;margin-left:6px">${loc(calc.tableColor.name)}</span>
              </div>
            </div>

            <!-- 2. Chair Selector -->
            <div class="set-builder-section" style="margin-top:20px">
              <label class="set-builder-label">${t("builder.step2")}</label>
              <div class="set-builder-options set-builder-options--chairs">
                ${CHAIRS.map((ch, idx) => `
                  <button type="button" class="set-builder-opt ${idx === selectedChairIndex ? "is-active" : ""}" data-select-chair="${idx}">
                    <img src="${ch.colors[0].img}" alt="${loc(ch.name)}" loading="lazy">
                    <span class="set-builder-opt-name">${loc(ch.name)}</span>
                  </button>
                `).join("")}
              </div>

              <!-- Chair Color Swatches -->
              <div class="set-builder-swatches-wrap" style="margin-top:10px">
                <span style="font-size:12px;color:var(--muted);margin-right:8px">${t("cat.colorTitle")}:</span>
                <div class="product-swatches" style="display:inline-flex;gap:6px">
                  ${calc.chair.colors.map((c, cIdx) => `
                    <button type="button" class="product-swatch ${cIdx === selectedChairColorIndex ? "is-active" : ""}" 
                            style="--swatch-color:${c.hex}" title="${loc(c.name)}" aria-label="${loc(c.name)}" 
                            data-select-chair-color="${cIdx}"></button>
                  `).join("")}
                </div>
                <span style="font-size:12px;font-weight:600;margin-left:6px">${loc(calc.chairColor.name)}</span>
              </div>
            </div>

            <!-- 3. Quantity Selector -->
            <div class="set-builder-section" style="margin-top:20px">
              <label class="set-builder-label">${t("builder.step3")}</label>
              <div class="set-builder-qty-group">
                <button type="button" class="set-builder-qty-btn ${selectedChairQty === 4 ? "is-active" : ""}" data-select-qty="4">
                  4 ${t("unit.pcs")} (${t("builder.qty4")})
                </button>
                <button type="button" class="set-builder-qty-btn ${selectedChairQty === 6 ? "is-active" : ""}" data-select-qty="6">
                  6 ${t("unit.pcs")} (${t("builder.qty6")})
                </button>
              </div>
            </div>
          </div>

          <!-- Preview & Total Column -->
          <div class="set-builder-summary">
            <div class="set-builder-preview-box">
              <div class="set-builder-images">
                <div class="set-builder-img-table">
                  <img src="${calc.tableColor.img}" alt="${loc(calc.table.name)}" loading="eager">
                  <span class="set-builder-img-badge">${loc(calc.table.name)}</span>
                </div>
                <div class="set-builder-plus">+</div>
                <div class="set-builder-img-chair">
                  <img src="${calc.chairColor.img}" alt="${loc(calc.chair.name)}" loading="eager">
                  <span class="set-builder-img-badge">× ${calc.qty} ${loc(calc.chair.name)}</span>
                </div>
              </div>

              <div class="set-builder-summary-details">
                <div class="set-builder-breakdown">
                  <div class="set-builder-row">
                    <span class="muted">${t("builder.separate")}</span>
                    <span class="set-builder-old-price">${formatMoney(calc.separateTotal)}</span>
                  </div>
                  <div class="set-builder-row set-builder-row--savings">
                    <span>${t("builder.savings")}</span>
                    <span class="set-builder-savings-val">-${formatMoney(calc.savings)}</span>
                  </div>
                  <div class="set-builder-row set-builder-row--total">
                    <span>${t("builder.bundlePrice")}</span>
                    <span class="set-builder-total-price">${formatMoney(calc.bundlePrice)}</span>
                  </div>
                </div>

                <button type="button" class="btn btn--copper set-builder-buy-action" data-builder-buy>
                  ${t("builder.buy")}
                </button>

                <button type="button" class="btn btn--ghost sm set-builder-ar-btn" data-builder-ar style="margin-top:10px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <span>${t("ar.btn") || "Примерить в комнате (3D / AR)"}</span>
                </button>

                <div class="set-builder-trust-note">
                  <span>🛡️ ${t("quick.trust.no_prepay") || "Оплата строго при получении после осмотра мебели в Ташкенте."}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const totalEl = container.querySelector(".set-builder-total-price");
    if(totalEl && prevTotal > 0 && prevTotal !== calc.bundlePrice && window.BTT_MOTION && window.BTT_MOTION.animateNumber){
      window.BTT_MOTION.animateNumber(totalEl, prevTotal, calc.bundlePrice, 280, formatMoney);
    }

    // Event listeners
    container.querySelectorAll("[data-select-table]").forEach(btn => {
      btn.onclick = () => {
        selectedTableIndex = parseInt(btn.dataset.selectTable, 10);
        selectedTableColorIndex = 0;
        renderBuilder(container);
      };
    });

    container.querySelectorAll("[data-select-table-color]").forEach(btn => {
      btn.onclick = () => {
        selectedTableColorIndex = parseInt(btn.dataset.selectTableColor, 10);
        renderBuilder(container);
      };
    });

    container.querySelectorAll("[data-select-chair]").forEach(btn => {
      btn.onclick = () => {
        selectedChairIndex = parseInt(btn.dataset.selectChair, 10);
        selectedChairColorIndex = 0;
        renderBuilder(container);
      };
    });

    container.querySelectorAll("[data-select-chair-color]").forEach(btn => {
      btn.onclick = () => {
        selectedChairColorIndex = parseInt(btn.dataset.selectChairColor, 10);
        renderBuilder(container);
      };
    });

    container.querySelectorAll("[data-select-qty]").forEach(btn => {
      btn.onclick = () => {
        selectedChairQty = parseInt(btn.dataset.selectQty, 10);
        renderBuilder(container);
      };
    });

    const buyBtn = container.querySelector("[data-builder-buy]");
    if (buyBtn) {
      buyBtn.onclick = () => {
        const c = calculateSet();
        const comboName = "Комплект: 1 стол " + loc(c.table.name) + " (" + loc(c.tableColor.name) + ") + " + c.qty + " стульев " + loc(c.chair.name) + " (" + loc(c.chairColor.name) + ")";
        if (window.BTT_CART && window.BTT_CART.openQuickOrder) {
          window.BTT_CART.openQuickOrder({
            id: "bundle-" + c.table.id + "-" + c.chair.id + "-" + c.qty,
            slug: c.table.id,
            name: comboName,
            price: c.bundlePrice,
            now: c.bundlePrice,
            img: c.tableColor.img,
            selectedColor: loc(c.tableColor.name) + " / " + loc(c.chairColor.name)
          });
        }
      };
    }

    const arBtn = container.querySelector("[data-builder-ar]");
    if (arBtn) {
      arBtn.onclick = () => {
        if (window.BTT_AR && window.BTT_AR.open) {
          const c = calculateSet();
          const chairSlug = c.chair.id;
          const chairObj = window.BTT_PRODUCTS ? window.BTT_PRODUCTS[chairSlug] : null;
          const tableSlug = c.table.id;
          const tableObj = window.BTT_PRODUCTS ? window.BTT_PRODUCTS[tableSlug] : null;
          const prodToPreview = chairObj || tableObj || {
            slug: chairSlug,
            name: loc(c.chair.name),
            model: loc(c.chair.name),
            dimensions: "82 × 48 × 49 см"
          };
          window.BTT_AR.open(prodToPreview);
        }
      };
    }
  }

  function init() {
    const targets = document.querySelectorAll("[data-set-builder-root]");
    targets.forEach(el => renderBuilder(el));
  }

  window.BTT_SET_BUILDER = {
    init: init,
    render: renderBuilder,
    calculate: calculateSet
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
