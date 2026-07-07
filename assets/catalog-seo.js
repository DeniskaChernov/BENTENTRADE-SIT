/* Bententrade — catalog page structured data + category SEO meta. */
(function () {
  "use strict";

  const SITE = "https://bententrade.uz";
  const DICT = window.BTT_I18N || {};
  const CAT_META = {
    furniture: "meta.cat.furniture",
    planterMix: "meta.cat.planterMix",
    indoor: "meta.cat.indoor",
    rattan: "meta.cat.rattan",
    twisted: "meta.cat.twisted",
  };

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

  function activeCategory() {
    const chip = document.querySelector(".cat-chips .chip.is-active");
    if (chip && chip.dataset.cat && chip.dataset.cat !== "all") return chip.dataset.cat;
    const q = new URLSearchParams(location.search).get("cat");
    return q && q !== "all" ? q : "";
  }

  function setMeta(name, content, attr) {
    if (!content) return;
    attr = attr || "name";
    let el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function updateCatalogMeta() {
    const cat = activeCategory();
    const prefix = cat && CAT_META[cat];
    const title = prefix ? t(prefix + ".title") : t("meta.catalog.title");
    const desc = prefix ? t(prefix + ".desc") : t("meta.catalog.desc");
    const kw = prefix ? t(prefix + ".keywords") : t("meta.catalog.keywords");
    const url = cat ? SITE + "/catalog.html?cat=" + encodeURIComponent(cat) : SITE + "/catalog.html";

    document.title = title;
    setMeta("description", desc);
    setMeta("keywords", kw);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:url", url, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }

  function productsForSchema() {
    const P = window.BTT_PRODUCTS || {};
    const cat = activeCategory();
    return Object.keys(P)
      .filter((k) => /^p\d+$/.test(k))
      .filter((id) => !cat || (P[id] && P[id].cat === cat) || (cat === "planterMix" && P[id] && (P[id].cat === "planter" || P[id].cat === "basket")))
      .sort((a, b) => +a.slice(1) - +b.slice(1));
  }

  function injectItemList() {
    const ids = productsForSchema();
    if (!ids.length) return;

    const cat = activeCategory();
    const prefix = cat && CAT_META[cat];
    const listName = prefix ? t(prefix + ".title") : t("meta.catalog.title");
    const listDesc = prefix ? t(prefix + ".desc") : t("meta.catalog.desc");

    const items = ids.map((id, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: SITE + "/product.html?id=" + encodeURIComponent(id),
      name: productName(id),
    }));

    const SEO = window.BTT_SEO || {};
    if (SEO.injectJsonLd) {
      SEO.injectJsonLd("catalog-schema", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: listName,
        description: listDesc,
        numberOfItems: items.length,
        itemListElement: items,
      });

      const crumbs = [
        { "@type": "ListItem", position: 1, name: t("pdp.crumb.home") || "Главная", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: t("nav.catalog") || "Каталог", item: SITE + "/catalog.html" },
      ];
      if (cat && prefix) {
        crumbs.push({
          "@type": "ListItem",
          position: 3,
          name: t(prefix + ".short") || listName,
          item: SITE + "/catalog.html?cat=" + encodeURIComponent(cat),
        });
      }
      SEO.injectJsonLd("btt-page-bc", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs,
      });

      if (cat && prefix) {
        SEO.injectJsonLd("catalog-collection", {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: listName,
          description: listDesc,
          url: SITE + "/catalog.html?cat=" + encodeURIComponent(cat),
          isPartOf: { "@type": "WebSite", name: "Bententrade", url: SITE + "/" },
        });
      } else {
        const old = document.getElementById("catalog-collection");
        if (old) old.remove();
      }
      return;
    }

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
      name: listName,
      description: listDesc,
      numberOfItems: items.length,
      itemListElement: items,
    });
  }

  function refresh() {
    updateCatalogMeta();
    injectItemList();
  }

  document.addEventListener("DOMContentLoaded", refresh);
  document.addEventListener("btt:lang", refresh);
  document.addEventListener("btt:cat-change", () => setTimeout(refresh, 30));
  document.querySelectorAll(".lang button").forEach((b) => {
    b.addEventListener("click", () => setTimeout(refresh, 40));
  });
})();
