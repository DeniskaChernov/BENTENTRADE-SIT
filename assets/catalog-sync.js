/* ============================================================
   BENTENTRADE — hydrate catalog & PDP prices/names from the API.
   The static HTML remains the fallback; when the backend is
   reachable it becomes the source of truth (so prices edited in
   the CRM show up on the site without touching the markup).
   ============================================================ */
(function () {
  "use strict";
  if (!window.BTT_API) return;

  const money = (n) => "$" + n;

  async function hydrateCatalog() {
    const grid = document.querySelector("#catalog-grid");
    if (!grid) return;
    let res;
    try { res = await window.BTT_API.products("all"); } catch (e) { return; }
    const map = {};
    (res.products || []).forEach((p) => { map[p.id] = p; });
    grid.querySelectorAll("[data-product]").forEach((card) => {
      const see = card.querySelector("a[href*='product.html?id=']");
      const m = see && (see.getAttribute("href") || "").match(/id=(p\d+)/);
      if (!m) return;
      const p = map[m[1]];
      if (!p) return;
      const now = card.querySelector(".price__now");
      if (now) now.textContent = money(p.price_now);
      const old = card.querySelector(".price__old");
      if (old) {
        if (p.price_old) { old.textContent = money(p.price_old); old.style.display = ""; }
        else old.style.display = "none";
      }
      const nameEl = card.querySelector(".product__name");
      if (nameEl && p.name) nameEl.textContent = p.name;
    });
  }

  async function hydratePDP() {
    if (!document.querySelector(".pdp-info")) return;
    const id = new URLSearchParams(location.search).get("id") || "p1";
    let res;
    try { res = await window.BTT_API.product(id); } catch (e) { return; }
    const p = res && res.product;
    if (!p) return;
    const now = document.querySelector(".pdp-price .now");
    if (now) now.textContent = money(p.price_now);
    const old = document.querySelector(".pdp-price .old");
    if (old) {
      if (p.price_old) { old.textContent = money(p.price_old); old.style.display = ""; }
      else old.style.display = "none";
    }
  }

  function run() { hydrateCatalog(); hydratePDP(); }

  document.addEventListener("DOMContentLoaded", function () {
    run();
    // Re-apply after language switches (PDP re-renders from local data).
    document.querySelectorAll(".lang button").forEach((b) =>
      b.addEventListener("click", () => setTimeout(run, 30)),
    );
  });
})();
