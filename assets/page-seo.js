(function () {
  var SEO = window.BTT_SEO;
  var t = window.BTT_I18N && window.BTT_I18N.t;
  if (!SEO || !SEO.injectJsonLd || !t) return;

  var SITE = "https://bententrade.uz";
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function orgRef() {
    return { "@id": SITE + "/#org" };
  }

  function aboutSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: t("meta.about.title"),
      description: t("meta.about.desc"),
      url: SITE + "/about.html",
      inLanguage: document.documentElement.lang || "ru",
      mainEntity: {
        "@type": "Organization",
        "@id": SITE + "/#org",
        name: "Bententrade",
        description: t("meta.about.desc"),
        foundingDate: "2024",
        areaServed: { "@type": "Country", name: "Uzbekistan" },
      },
    };
  }

  function contactsSchema() {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ContactPage",
          name: t("meta.contacts.title"),
          description: t("meta.contacts.desc"),
          url: SITE + "/contacts.html",
          inLanguage: document.documentElement.lang || "ru",
          isPartOf: orgRef(),
        },
        {
          "@type": "LocalBusiness",
          "@id": SITE + "/#org",
          name: "Bententrade",
          telephone: "+998771044422",
          email: "hello@bententrade.uz",
          url: SITE + "/",
          address: {
            "@type": "PostalAddress",
            streetAddress: "ул. Амира Темура, 15",
            addressLocality: "Ташкент",
            addressCountry: "UZ",
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "09:00",
            closes: "18:00",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+998771044422",
            contactType: "customer service",
            availableLanguage: ["Russian", "Uzbek", "English"],
          },
        },
      ],
    };
  }

  function blogListSchema(articles) {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: t("meta.blog.title"),
      description: t("meta.blog.desc"),
      url: SITE + "/blog.html",
      publisher: orgRef(),
      blogPost: articles.map(function (a, i) {
        var loc = a.i18n && a.i18n[document.documentElement.lang || "ru"];
        var ru = (a.i18n && a.i18n.ru) || {};
        var block = loc || ru;
        return {
          "@type": "BlogPosting",
          headline: block.title || a.slug,
          description: block.excerpt || "",
          datePublished: a.published_at || "",
          url: SITE + "/article.html?slug=" + encodeURIComponent(a.slug),
          position: i + 1,
          image: a.cover_media ? SITE + "/" + String(a.cover_media).replace(/^\//, "") : SITE + "/assets/btt-logo.png",
        };
      }),
    };
  }

  function renderAbout() {
    SEO.injectJsonLd("btt-page-about", aboutSchema());
  }

  function renderContacts() {
    SEO.injectJsonLd("btt-page-contacts", contactsSchema());
  }

  function renderBlog() {
    fetch("/data/articles.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var list = (data && data.articles) || [];
        SEO.injectJsonLd("btt-page-blog", blogListSchema(list));
      })
      .catch(function () {});
  }

  function render() {
    if (page === "about.html") renderAbout();
    else if (page === "contacts.html") renderContacts();
    else if (page === "blog.html") renderBlog();
  }

  render();
  document.addEventListener("btt:lang", render);
})();
