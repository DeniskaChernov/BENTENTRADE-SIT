/* Bententrade — HowTo schema for the care page. */
(function () {
  "use strict";
  if (!document.querySelector(".info-doc")) return;
  if (!location.pathname.endsWith("care.html")) return;

  const DICT = window.BTT_I18N || {};
  const SEO = window.BTT_SEO || {};

  function lang() {
    const l = document.documentElement.lang;
    return DICT[l] ? l : "ru";
  }
  function t(k) {
    return (DICT[lang()] || DICT.ru || {})[k] || "";
  }

  function steps() {
    const out = [];
    ["care.b1.l1", "care.b1.l2", "care.b1.l3", "care.b2.l1", "care.b2.l2", "care.b2.l3"].forEach((k, i) => {
      const text = t(k);
      if (text) out.push({ "@type": "HowToStep", position: i + 1, text: text });
    });
    const winter = t("care.b3.p");
    if (winter) out.push({ "@type": "HowToStep", position: out.length + 1, text: winter });
    return out;
  }

  function render() {
    if (!SEO.injectJsonLd) return;
    SEO.injectJsonLd("care-howto-schema", {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: t("care.title"),
      description: t("care.sub"),
      step: steps(),
    });
  }

  document.addEventListener("DOMContentLoaded", render);
  document.querySelectorAll(".lang button").forEach((b) => {
    b.addEventListener("click", () => setTimeout(render, 40));
  });
})();
