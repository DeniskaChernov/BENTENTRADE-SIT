/* Bententrade — catalog page structured data (ItemList). */
(function () {
  "use strict";

  const SITE = "https://bententrade.uz";
  const DICT = window.BTT_I18N || {};

  function lang() {
    const l = document.documentElement.lang;
    return DICT[l] ? l : "ru";
  }
  function t(k) {
    return (DICT[lang()] || DICT.ru || {})[k] || k;
  }

  function productName(id) {
    return t(id + ".name") || id;
  }

  function injectItemList() {
    const P = window.BTT_PRODUCTS || {};
    const ids = Object.keys(P).filter((k) => /^p\d+$/.test(k)).sort();
    if (!ids.length) return;

    const items = ids.map((id, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": SITE + "/product.html?id=" + encodeURIComponent(id),
      "name": productName(id),
    }));

    let el = document.getElementById("catalog-schema");
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = "catalog-schema";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": t("meta.catalog.title"),
      "description": t("meta.catalog.desc"),
      "numberOfItems": items.length,
      "itemListElement": items,
    });
  }

  document.addEventListener("DOMContentLoaded", injectItemList);
  document.querySelectorAll(".lang button").forEach((b) => {
    b.addEventListener("click", () => setTimeout(injectItemList, 40));
  });
})();
