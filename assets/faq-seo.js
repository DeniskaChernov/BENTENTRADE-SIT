/* Bententrade — FAQPage schema from i18n (updates on language change). */
(function () {
  "use strict";
  if (!document.querySelector("[data-faq]")) return;

  const DICT = window.BTT_I18N || {};
  const SEO = window.BTT_SEO || {};
  const FAQ_COUNT = 10;

  function lang() {
    const l = document.documentElement.lang;
    return DICT[l] ? l : "ru";
  }
  function t(k) {
    return (DICT[lang()] || DICT.ru || {})[k] || "";
  }
  function plain(k) {
    return SEO.stripHtml ? SEO.stripHtml(t(k)) : t(k);
  }

  function render() {
    const entities = [];
    for (let i = 1; i <= FAQ_COUNT; i++) {
      const q = plain("faq.q" + i);
      const a = plain("faq.a" + i);
      if (!q || !a) continue;
      entities.push({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      });
    }
    if (!entities.length || !SEO.injectJsonLd) return;
    SEO.injectJsonLd("faq-schema", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entities,
    });
    SEO.injectJsonLd("btt-page-bc", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("pdp.crumb.home") || "Главная", item: "https://bententrade.uz/" },
        { "@type": "ListItem", position: 2, name: t("foot.faq") || "FAQ", item: "https://bententrade.uz/faq.html" },
      ],
    });
  }

  document.addEventListener("DOMContentLoaded", render);
  document.querySelectorAll(".lang button").forEach((b) => {
    b.addEventListener("click", () => setTimeout(render, 40));
  });
})();
