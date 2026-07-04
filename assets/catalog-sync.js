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
  const mediaUrl = (key) => (key ? "/media/" + key : "");

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
      // Real photo from the CRM (falls back to the existing placeholder image).
      if (p.image) {
        const img = card.querySelector(".product__media img");
        if (img) { img.src = mediaUrl(p.image); img.style.display = ""; }
      }
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
    // Re-apply after language switches (PDP re-renders from local data).
    document.querySelectorAll(".lang button").forEach((b) =>
      b.addEventListener("click", () => setTimeout(run, 30)),
    );
  });
})();
