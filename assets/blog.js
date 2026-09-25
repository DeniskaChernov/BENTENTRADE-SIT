/* ============================================================
   BENTENTRADE — public articles/blog (list + single), API-driven.
   Robust fail-safe dictionary, automatic fallback covers,
   3-column luxury grid, editorial hero story, instant search.
   ============================================================ */
(function () {
  "use strict";

  const SITE = "https://bententrade.uz";

  /* Embedded fail-safe dictionary so raw keys never leak */
  const BLOG_DICT = {
    ru: {
      "blog.k": "Журнал",
      "blog.title": "Статьи и вдохновение",
      "blog.sub": "Идеи обустройства террасы, секреты ухода за плетением и всё о долговечном искусственном ротанге.",
      "blog.countPrefix": "Опубликовано:",
      "blog.countSuffix": "статей",
      "blog.topic.all": "Все статьи",
      "blog.topic.furniture": "Садовая мебель",
      "blog.topic.care": "Уход и советы",
      "blog.topic.planter": "Кашпо и декор",
      "blog.topic.production": "О производстве",
      "blog.searchPh": "Поиск по статьям...",
      "blog.featured": "Главная статья",
      "blog.readTime": "мин чтения",
      "blog.noResults": "Статьи по вашему запросу не найдены.",
      "blog.cta.title": "Нужен совет по выбору мебели или кашпо?",
      "blog.cta.sub": "Мастер Bententrade поможет подобрать гарнитур под размер террасы, подскажет оттенок ротанга и рассчитает стоимость.",
      "blog.cta.btn": "Консультация в Telegram",
      "blog.read": "Читать",
      "blog.back": "Все статьи",
      "blog.loading": "Загрузка…",
      "blog.error": "Не удалось загрузить статьи. Проверьте соединение.",
      "blog.retry": "Повторить",
      "blog.notFound": "Статья не найдена.",
      "nav.home": "Главная",
      "nav.blog": "Статьи",
      "nav.catalog": "Каталог",
      "nav.catalog2": "В каталог"
    },
    uz: {
      "blog.k": "Jurnal",
      "blog.title": "Maqolalar va ilhom",
      "blog.sub": "Terrasa g‘oyalari, to‘quv parvarishi sirlari va sun’iy rotang haqida barcha ma’lumotlar.",
      "blog.countPrefix": "Chop etilgan:",
      "blog.countSuffix": "ta maqola",
      "blog.topic.all": "Barcha maqolalar",
      "blog.topic.furniture": "Bog‘ mebeli",
      "blog.topic.care": "Parvarish va maslahat",
      "blog.topic.planter": "Gultuvak va savatlar",
      "blog.topic.production": "Ishlab chiqarish",
      "blog.searchPh": "Maqolalardan qidirish...",
      "blog.featured": "Asosiy maqola",
      "blog.readTime": "daqiqa o‘qish",
      "blog.noResults": "So‘rovingiz bo‘yicha maqolalar topilmadi.",
      "blog.cta.title": "To‘quv tanlashda maslahat kerakmi?",
      "blog.cta.sub": "Toshkentdagi mutaxassisimiz terassangiz uchun to‘plam, gultuvak shakli yoki rangni tanlashda yordam beradi.",
      "blog.cta.btn": "Telegram’da maslahat",
      "blog.read": "O‘qish",
      "blog.back": "Barcha maqolalar",
      "blog.loading": "Yuklanmoqda…",
      "blog.error": "Yuklab bo‘lmadi. Ulanishni tekshiring.",
      "blog.retry": "Qayta urinish",
      "blog.notFound": "Maqola topilmadi.",
      "nav.home": "Bosh sahifa",
      "nav.blog": "Maqolalar",
      "nav.catalog": "Katalog",
      "nav.catalog2": "Katalogga"
    },
    en: {
      "blog.k": "Journal",
      "blog.title": "Articles & Inspiration",
      "blog.sub": "Terrace ideas, weave care advice and synthetic rattan guide.",
      "blog.countPrefix": "Published:",
      "blog.countSuffix": "articles",
      "blog.topic.all": "All Articles",
      "blog.topic.furniture": "Garden Furniture",
      "blog.topic.care": "Care & Advice",
      "blog.topic.planter": "Planters & Baskets",
      "blog.topic.production": "Craft & Making",
      "blog.searchPh": "Search articles...",
      "blog.featured": "Featured Story",
      "blog.readTime": "min read",
      "blog.noResults": "No articles found matching your query.",
      "blog.cta.title": "Need advice on rattan furniture?",
      "blog.cta.sub": "Our Tashkent design specialist will help you choose the right set, planter style or weave hue for your space.",
      "blog.cta.btn": "Consult on Telegram",
      "blog.read": "Read",
      "blog.back": "All articles",
      "blog.loading": "Loading…",
      "blog.error": "Couldn't load content. Check your connection.",
      "blog.retry": "Try again",
      "blog.notFound": "Article not found.",
      "nav.home": "Home",
      "nav.blog": "Articles",
      "nav.catalog": "Catalog",
      "nav.catalog2": "To catalog"
    }
  };

  /* Default high-res photography cover for every article topic */
  const DEFAULT_COVERS = {
    "sadovaya-mebel-rotang-tashkent": "assets/hero-garden-furniture.png",
    "uhod-za-rotangom-zimoy": "assets/scene-dining-warm.png",
    "iskusstvennyy-rotang": "assets/hero-rattan.png",
    "zachem-iskusstvennyy-rotang": "assets/hero-rattan.png",
    "kak-vybrat-luchshiy-rotang": "assets/rattan-palette-hero.png",
    "pochemu-rabotayut-s-bententrade": "assets/hero-garden-furniture.png",
    "kashpo-iz-iskusstvennogo-rotanga": "assets/bento-planter.png",
    "korziny-sunduki-rotang": "assets/hero-home-furniture.png",
    "kupit-rotang-buhtami": "assets/hero-rattan.png",
    "mebel-rotang-dlya-kafe": "assets/scene-dining-teal.png",
    "pletennaya-mebel-dlya-doma": "assets/scene-dining-cream.png",
    "dostavka-rotanga-po-uzbekistanu": "assets/hero-garden-furniture.png",
    "rotang-dlya-balkona": "assets/bento-rattan.png",
    "palitra-tsvetov-rotanga-bententrade": "assets/rattan-palette-hero.png",
    "oformlenie-terassi-rotangom": "assets/scene-dining-warm.png"
  };

  function lang() {
    try {
      if (window.BTT_UTIL && window.BTT_UTIL.lang) return window.BTT_UTIL.lang();
      const s = localStorage.getItem("btt_lang");
      if (s === "uz" || s === "en") return s;
    } catch (e) { /* ignore */ }
    return "ru";
  }

  function t(k) {
    const l = lang();
    const I = window.BTT_I18N || {};
    const d = I[l] || {};
    if (d[k] != null) return d[k];
    const ru = I.ru || {};
    if (ru[k] != null) return ru[k];
    const loc = BLOG_DICT[l] || {};
    if (loc[k] != null) return loc[k];
    const def = BLOG_DICT.ru || {};
    if (def[k] != null) return def[k];
    return k;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function cover(media, slug) {
    if (!media) {
      media = DEFAULT_COVERS[slug] || "assets/hero-garden-furniture.png";
    }
    return media.indexOf("/") === 0 || media.indexOf("http") === 0 ? media : "/" + media.replace(/^\//, "");
  }

  function fmtDate(s) {
    try {
      const d = new Date(String(s || "").replace(" ", "T") + "Z");
      if (isNaN(d.getTime())) return "";
      const loc = lang() === "en" ? "en-GB" : lang() === "uz" ? "uz-UZ" : "ru-RU";
      return d.toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return ""; }
  }

  function fmtArticlesCount(n) {
    const l = lang();
    if (l === "uz") return n + " ta maqola";
    if (l === "en") return n + " " + (n === 1 ? "article" : "articles");
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return n + " статей";
    if (mod10 === 1) return n + " статья";
    if (mod10 >= 2 && mod10 <= 4) return n + " статьи";
    return n + " статей";
  }

  function getTopic(a) {
    const s = ((a.slug || "") + " " + (a.keywords || "") + " " + (a.title || "")).toLowerCase();
    if (s.includes("kashpo") || s.includes("кашпо") || s.includes("gultuvak") || s.includes("planter") ||
        s.includes("sunduk") || s.includes("сундук") || s.includes("korzin") || s.includes("корзин") ||
        s.includes("savat") || s.includes("basket")) {
      return "planter";
    }
    if (s.includes("uhod") || s.includes("уход") || s.includes("parvarish") || s.includes("care") ||
        s.includes("palitr") || s.includes("палитр") || s.includes("rang") || s.includes("palette")) {
      return "care";
    }
    if (s.includes("buht") || s.includes("бухт") || s.includes("zachem") || s.includes("зачем") ||
        s.includes("pochemu") || s.includes("почему") || s.includes("vybrat") || s.includes("выбрать") ||
        s.includes("dostavka") || s.includes("доставка") || s.includes("yetkaz")) {
      return "production";
    }
    return "furniture";
  }

  function getTopicLabel(topic) {
    return t("blog.topic." + topic) || topic;
  }

  function getReadTime(a) {
    const text = ((a.body || "") + " " + (a.excerpt || "")).trim();
    const words = text ? text.split(/\s+/).length : 220;
    const mins = Math.max(2, Math.round(words / 140));
    return mins + " " + t("blog.readTime");
  }

  let staticArticlesCache = null;

  async function loadStaticArticles() {
    if (staticArticlesCache) return staticArticlesCache;
    try {
      const fetchOne = async (url) => {
        try {
          const fn = (window.BTT_COOKIES && window.BTT_COOKIES.guardedFetch) || fetch;
          const res = await fn(url, { cache: "default" });
          if (!res.ok) return [];
          const data = await res.json();
          return (data && data.articles) || [];
        } catch (e) { return []; }
      };
      const [base, extra] = await Promise.all([
        fetchOne("data/articles.json"),
        fetchOne("data/articles-seo.json").catch(() => []),
      ]);
      const seen = new Set();
      staticArticlesCache = base.concat(extra).filter((a) => {
        if (!a || !a.slug || seen.has(a.slug)) return false;
        seen.add(a.slug);
        return true;
      });
      return staticArticlesCache;
    } catch (e) { return []; }
  }

  function localizeArticle(a) {
    if (!a) return null;
    const loc = (a.i18n && (a.i18n[lang()] || a.i18n.ru)) || {};
    const coverMedia = a.cover_media || DEFAULT_COVERS[a.slug] || "assets/hero-garden-furniture.png";
    return {
      slug: a.slug,
      published_at: a.published_at,
      cover_media: coverMedia,
      title: loc.title || a.title || a.slug,
      excerpt: loc.excerpt || a.excerpt || "",
      body: loc.body || a.body || "",
      keywords: a.keywords || loc.keywords || "",
      i18n: a.i18n,
    };
  }

  async function fetchArticles() {
    // 1. Always load rich static articles (11+ articles)
    const rawStatic = await loadStaticArticles();
    const staticMap = new Map();
    rawStatic.forEach((item) => {
      if (item && item.slug) staticMap.set(item.slug, item);
    });

    // 2. Fetch server API articles if available and merge
    if (window.BTT_API) {
      try {
        const res = await window.BTT_API.articles(lang());
        const apiArticles = (res && res.articles) || [];
        apiArticles.forEach((apiItem) => {
          if (!apiItem || !apiItem.slug) return;
          const existing = staticMap.get(apiItem.slug);
          if (existing) {
            // merge
            staticMap.set(apiItem.slug, {
              ...existing,
              ...apiItem,
              cover_media: apiItem.cover_media || existing.cover_media || DEFAULT_COVERS[apiItem.slug],
              body: existing.body || apiItem.body
            });
          } else {
            staticMap.set(apiItem.slug, {
              ...apiItem,
              cover_media: apiItem.cover_media || DEFAULT_COVERS[apiItem.slug] || "assets/hero-garden-furniture.png"
            });
          }
        });
      } catch (e) { /* fallback to static */ }
    }

    const merged = Array.from(staticMap.values()).map(localizeArticle);
    merged.sort((a, b) => String(b.published_at || "").localeCompare(String(a.published_at || "")));
    return merged;
  }

  function formatInline(str) {
    let s = esc(str);
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      const cleanSrc = src.indexOf("http") === 0 ? src : (src.startsWith("/") ? src : "/" + src);
      return (
        '<figure class="article__figure"><img src="' + esc(cleanSrc) + '" alt="' + esc(alt || "") +
        '" loading="lazy" decoding="async" width="1280" height="720"></figure>'
      );
    });
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return s;
  }

  function renderBody(text) {
    if (!text) return "";
    return String(text).split(/\n{2,}/).map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("## ")) {
        return '<h2 class="article__h2">' + formatInline(trimmed.slice(3)) + "</h2>";
      }
      if (trimmed.startsWith("### ")) {
        return '<h3 class="article__h3">' + formatInline(trimmed.slice(4)) + "</h3>";
      }
      if (trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)) {
        return formatInline(trimmed);
      }
      if (/^- /.test(trimmed)) {
        const items = trimmed.split("\n")
          .filter((l) => l.startsWith("- "))
          .map((l) => "<li>" + formatInline(l.slice(2)) + "</li>")
          .join("");
        return '<ul class="article__list">' + items + "</ul>";
      }
      return "<p>" + formatInline(trimmed).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  function setMeta(name, content, attr) {
    attr = attr || "name";
    if (!content) return;
    let el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function setCanonical(href) {
    if (!href) return;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function showState(root, kind, retryFn) {
    if (kind === "loading") {
      root.innerHTML = '<p class="blog-state blog-state--loading" aria-live="polite">' + esc(t("blog.loading")) + "</p>";
      return;
    }
    if (kind === "error") {
      root.innerHTML =
        '<div class="blog-state blog-state--error">' +
        '<p>' + esc(t("blog.error")) + "</p>" +
        '<button type="button" class="btn btn--ghost btn--sm" data-blog-retry>' + esc(t("blog.retry")) + "</button></div>";
      root.querySelector("[data-blog-retry]")?.addEventListener("click", retryFn);
      return;
    }
    root.innerHTML = '<p class="blog-state blog-state--empty">' + esc(t("blog.empty")) + "</p>";
  }

  function renderFeaturedCard(a) {
    const img = cover(a.cover_media, a.slug);
    const title = a.title || a.slug || "";
    const topic = getTopic(a);
    const topicLabel = getTopicLabel(topic);
    const readTime = getReadTime(a);
    const dateStr = fmtDate(a.published_at);
    return (
      '<a class="blog-featured reveal" href="article.html?slug=' + encodeURIComponent(a.slug) + '">' +
        '<div class="blog-featured__media">' +
          '<img src="' + esc(img) + '" alt="' + esc(title) + '" loading="eager" decoding="async" width="960" height="600">' +
        "</div>" +
        '<div class="blog-featured__body">' +
          '<div class="blog-featured__badge">' +
            "<span>★ " + esc(t("blog.featured")) + "</span>" +
          "</div>" +
          '<h2 class="blog-featured__title">' + esc(title) + "</h2>" +
          (a.excerpt ? '<p class="blog-featured__excerpt">' + esc(a.excerpt) + "</p>" : "") +
          '<div class="blog-featured__meta">' +
            "<span>" + esc(topicLabel) + "</span>" +
            '<span aria-hidden="true">•</span>' +
            "<span>" + esc(readTime) + "</span>" +
            (dateStr ? '<span aria-hidden="true">•</span><span>' + esc(dateStr) + "</span>" : "") +
            '<span class="blog-featured__more">' + esc(t("blog.read")) + " →</span>" +
          "</div>" +
        "</div>" +
      "</a>"
    );
  }

  function renderGridCard(a) {
    const img = cover(a.cover_media, a.slug);
    const title = a.title || a.slug || "";
    const topic = getTopic(a);
    const topicLabel = getTopicLabel(topic);
    const readTime = getReadTime(a);
    const dateStr = fmtDate(a.published_at);
    return (
      '<a class="blog-card reveal" href="article.html?slug=' + encodeURIComponent(a.slug) + '">' +
        '<div class="blog-card__img">' +
          '<img src="' + esc(img) + '" alt="' + esc(title) + '" loading="lazy" decoding="async" width="640" height="400">' +
          '<span class="blog-card__tag">' + esc(topicLabel) + "</span>" +
        "</div>" +
        '<div class="blog-card__body">' +
          '<div class="blog-card__meta-bar">' +
            "<span>" + esc(dateStr) + "</span>" +
            '<span class="blog-card__readtime">⏱ ' + esc(readTime) + "</span>" +
          "</div>" +
          "<h3>" + esc(title) + "</h3>" +
          (a.excerpt ? "<p>" + esc(a.excerpt) + "</p>" : "") +
          '<div class="blog-card__footer">' +
            '<span class="blog-card__more">' + esc(t("blog.read")) + " →</span>" +
          "</div>" +
        "</div>" +
      "</a>"
    );
  }

  function renderCtaBanner() {
    return (
      '<aside class="blog-cta-banner reveal" aria-label="Консультация">' +
        '<div class="blog-cta-banner__content">' +
          '<h3 class="blog-cta-banner__title">' + esc(t("blog.cta.title")) + "</h3>" +
          '<p class="blog-cta-banner__sub">' + esc(t("blog.cta.sub")) + "</p>" +
        "</div>" +
        '<a class="blog-cta-banner__btn" href="https://t.me/bententradeuz" target="_blank" rel="noopener noreferrer">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>' +
          "<span>" + esc(t("blog.cta.btn")) + "</span>" +
        "</a>" +
      "</aside>"
    );
  }

  let allArticlesCache = null;
  let currentTopic = "all";
  let currentSearch = "";
  let toolbarInitialized = false;

  function updateCountBadge(n) {
    const badge = document.querySelector("[data-blog-count-num]");
    const suffix = document.querySelector("[data-blog-count-suffix]");
    if (badge) badge.textContent = String(n);
    if (suffix) {
      const l = lang();
      if (l === "ru") {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod100 >= 11 && mod100 <= 19) suffix.textContent = "статей";
        else if (mod10 === 1) suffix.textContent = "статья";
        else if (mod10 >= 2 && mod10 <= 4) suffix.textContent = "статьи";
        else suffix.textContent = "статей";
      } else if (l === "uz") {
        suffix.textContent = "ta maqola";
      } else {
        suffix.textContent = n === 1 ? "article" : "articles";
      }
    }
  }

  function filterArticles(list) {
    let res = list;
    if (currentTopic && currentTopic !== "all") {
      res = res.filter((a) => getTopic(a) === currentTopic);
    }
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      res = res.filter((a) => {
        const hay = ((a.title || "") + " " + (a.excerpt || "") + " " + (a.keywords || "")).toLowerCase();
        return hay.includes(q);
      });
    }
    return res;
  }

  function renderListContent(root, items) {
    updateCountBadge(items.length);
    if (!items.length) {
      root.innerHTML =
        '<div class="blog-no-results reveal">' +
          '<h3 class="blog-no-results__title">' + esc(t("blog.noResults")) + "</h3>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-blog-reset-filter>' + esc(t("blog.topic.all")) + "</button>" +
        "</div>";
      root.querySelector("[data-blog-reset-filter]")?.addEventListener("click", () => {
        currentTopic = "all";
        currentSearch = "";
        const searchInput = document.querySelector("[data-blog-search]");
        if (searchInput) searchInput.value = "";
        const clearBtn = document.querySelector("[data-blog-search-clear]");
        if (clearBtn) clearBtn.hidden = true;
        document.querySelectorAll("[data-blog-chips] .chip").forEach((btn) => {
          btn.classList.toggle("is-active", btn.getAttribute("data-topic") === "all");
        });
        renderListContent(root, allArticlesCache);
      });
      return;
    }

    let html = "";
    if (currentTopic === "all" && !currentSearch && items.length > 1) {
      const lead = items[0];
      const rest = items.slice(1);
      html += renderFeaturedCard(lead);
      html += '<div class="blog-grid">';
      html += rest.map(renderGridCard).join("");
      html += "</div>";
    } else {
      html += '<div class="blog-grid">';
      html += items.map(renderGridCard).join("");
      html += "</div>";
    }

    html += renderCtaBanner();
    root.innerHTML = html;

    const cards = root.querySelectorAll(".reveal");
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      cards.forEach((el) => el.classList.add("is-in"));
    } else {
      cards.forEach((el, i) => { el.style.transitionDelay = (i * 60) + "ms"; });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -4% 0px", threshold: 0.05 });
      cards.forEach((el) => io.observe(el));
    }
    if (window.BTT_FX) window.BTT_FX.refresh(root);
  }

  function setupToolbar(root) {
    if (toolbarInitialized) return;
    toolbarInitialized = true;

    const chips = document.querySelectorAll("[data-blog-chips] .chip");
    chips.forEach((btn) => {
      btn.addEventListener("click", () => {
        const topic = btn.getAttribute("data-topic") || "all";
        if (topic === currentTopic) return;
        currentTopic = topic;
        chips.forEach((c) => c.classList.toggle("is-active", c === btn));
        if (allArticlesCache) {
          renderListContent(root, filterArticles(allArticlesCache));
        }
      });
    });

    const searchInput = document.querySelector("[data-blog-search]");
    const clearBtn = document.querySelector("[data-blog-search-clear]");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentSearch = (e.target.value || "").trim().toLowerCase();
        if (clearBtn) clearBtn.hidden = !currentSearch;
        if (allArticlesCache) {
          renderListContent(root, filterArticles(allArticlesCache));
        }
      });
    }
    if (clearBtn && searchInput) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        currentSearch = "";
        clearBtn.hidden = true;
        if (allArticlesCache) {
          renderListContent(root, filterArticles(allArticlesCache));
        }
      });
    }
  }

  async function renderList(root) {
    showState(root, "loading");
    let list;
    try {
      list = await fetchArticles();
    } catch (e) {
      showState(root, "error", () => renderList(root));
      return;
    }
    if (!list || !list.length) {
      showState(root, "empty");
      return;
    }
    allArticlesCache = list;
    setupToolbar(root);
    renderListContent(root, filterArticles(allArticlesCache));
  }

  async function renderSingle(root) {
    const slug = new URLSearchParams(location.search).get("slug");
    if (!slug) { showState(root, "empty"); return; }
    showState(root, "loading");
    let a = null;

    // 1. Try server API first so CMS edits show immediately
    if (window.BTT_API) {
      try {
        const res = await window.BTT_API.article(slug, lang());
        if (res && res.article && (res.article.body || res.article.title)) {
          a = localizeArticle(res.article);
        }
      } catch (e) { /* fallback to static */ }
    }

    // 2. Fallback to static articles for offline/graceful degradation
    if (!a) {
      const raw = await loadStaticArticles();
      const found = raw.find((x) => x.slug === slug);
      if (found) a = localizeArticle(found);
    }

    if (!a) {
      root.innerHTML = '<p class="blog-state blog-state--empty">' + esc(t("blog.notFound")) + "</p>";
      return;
    }

    const title = a.title || a.slug || "Bententrade";
    const desc = (a.excerpt || "").slice(0, 160) || t("blog.sub");
    const pageUrl = SITE + "/article.html?slug=" + encodeURIComponent(a.slug);
    const topic = getTopic(a);
    const topicLabel = getTopicLabel(topic);
    const readTime = getReadTime(a);
    const dateStr = fmtDate(a.published_at);

    document.title = title + " — Bententrade";
    setMeta("description", desc);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:url", pageUrl, "property");
    setCanonical(pageUrl);
    const kwTpl = t("meta.article.keywords") || "{title}, rotang, bententrade";
    const kw = (a.keywords || kwTpl.replace(/\{title\}/g, title)).slice(0, 200);
    setMeta("keywords", kw);

    const SEO = window.BTT_SEO || {};
    if (SEO.injectJsonLd) {
      SEO.injectJsonLd("btt-page-bc", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("nav.home"), item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: t("nav.blog"), item: SITE + "/blog.html" },
          { "@type": "ListItem", position: 3, name: title, item: pageUrl },
        ],
      });
    }

    const img = cover(a.cover_media, a.slug);
    if (img) {
      const abs = img.indexOf("http") === 0 ? img : SITE + img;
      setMeta("og:image", abs, "property");
    }

    const bodyHtml = renderBody(a.body || "");
    let schemaEl = document.getElementById("article-schema");
    if (!schemaEl) {
      schemaEl = document.createElement("script");
      schemaEl.type = "application/ld+json";
      schemaEl.id = "article-schema";
      document.head.appendChild(schemaEl);
    }
    schemaEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": desc,
      "datePublished": a.published_at || "",
      "author": { "@type": "Organization", "name": "Bententrade" },
      "publisher": {
        "@type": "Organization",
        "name": "Bententrade",
        "logo": { "@type": "ImageObject", "url": SITE + "/assets/btt-logo.png" },
      },
      "mainEntityOfPage": pageUrl,
      "image": img ? (img.indexOf("http") === 0 ? img : SITE + "/" + img.replace(/^\//, "")) : SITE + "/assets/btt-logo.png",
    });

    root.innerHTML =
      '<article class="article reveal">' +
      '<nav class="blog-breadcrumbs" aria-label="Хлебные крошки" style="margin-bottom:24px;">' +
        '<a href="index.html">' + esc(t("nav.home")) + "</a>" +
        '<span class="blog-breadcrumbs__sep" aria-hidden="true">/</span>' +
        '<a href="blog.html">' + esc(t("nav.blog")) + "</a>" +
        '<span class="blog-breadcrumbs__sep" aria-hidden="true">/</span>' +
        '<span class="blog-breadcrumbs__current">' + esc(title) + "</span>" +
      "</nav>" +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap;">' +
        '<span class="blog-card__tag" style="position:static;display:inline-block;">' + esc(topicLabel) + "</span>" +
        (dateStr ? '<span class="article__date" style="margin:0;">' + esc(dateStr) + "</span>" : "") +
        '<span style="color:var(--muted);font-size:13px;">⏱ ' + esc(readTime) + "</span>" +
      "</div>" +
      "<h1>" + esc(title) + "</h1>" +
      (img ? '<div class="article__cover"><img src="' + esc(img) + '" alt="' + esc(title) + '" loading="eager" decoding="async" fetchpriority="high"></div>' : "") +
      '<div class="article__body">' + bodyHtml + "</div>" +
      '<div class="article__cta">' +
      '<a class="btn btn--copper" href="catalog.html">' + esc(t("nav.catalog2")) + "</a>" +
      '<a class="btn btn--ghost" href="https://t.me/bententradeuz" target="_blank" rel="noopener noreferrer">Telegram</a>' +
      '<a class="btn btn--ghost" href="blog.html">' + esc(t("blog.back")) + "</a>" +
      "</div></article>";
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    const list = document.querySelector("[data-blog-list]");
    const single = document.querySelector("[data-blog-single]");
    if (list) renderList(list);
    if (single) renderSingle(single);
    document.querySelectorAll(".lang button").forEach((b) =>
      b.addEventListener("click", () => setTimeout(() => {
        if (list) renderList(list);
        if (single) renderSingle(single);
      }, 40))
    );
    document.addEventListener("btt:lang", () => {
      if (list) renderList(list);
      if (single) renderSingle(single);
    });
    document.addEventListener("btt:cookies-accepted", () => {
      staticArticlesCache = null;
      allArticlesCache = null;
      if (list) renderList(list);
      if (single) renderSingle(single);
    });
  });
})();
