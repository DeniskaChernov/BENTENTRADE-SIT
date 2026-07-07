(function () {
  var SEO = window.BTT_SEO;
  var t = window.BTT_I18N && window.BTT_I18N.t;
  if (!SEO || !SEO.injectJsonLd || !t) return;

  var PROFILES = [
    { sku: "0609", color: "pal.c0609", img: "rattan-profile-0609-tobacco.png" },
    { sku: "1505", color: "pal.c1505", img: "rattan-profile-1505-woody.png" },
    { sku: "0704", color: "pal.c0704b", img: "rattan-profile-0704-brown.png" },
    { sku: "0704g", color: "pal.c0704g", img: "rattan-profile-0704-graphite.png" },
    { sku: "2404", color: "pal.c2404", img: "rattan-profile-2404-choco.png" },
  ];

  function paletteSchema() {
    var spec = t("pal.spec");
    var base = "https://bententrade.uz/assets/";
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: t("pal.title"),
      description: t("pal.hero.alt"),
      numberOfItems: PROFILES.length,
      itemListElement: PROFILES.map(function (p, i) {
        var color = t(p.color);
        return {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: color + " — " + spec,
            sku: p.sku.replace("g", ""),
            image: base + p.img,
            brand: { "@type": "Brand", name: "Bententrade" },
            category: "Synthetic rattan profile",
            material: "PE rattan",
            description: spec + " — " + color + " (" + t("pal.art") + " " + p.sku.replace("g", "") + ")",
          },
        };
      }),
    };
  }

  function render() {
    SEO.injectJsonLd("btt-home-palette-list", paletteSchema());
  }

  render();
  document.addEventListener("btt:lang", render);
})();
