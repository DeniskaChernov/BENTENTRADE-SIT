import { Hono } from "hono";
import type { Env, Variables } from "./types";
import { sessionMiddleware, requireAuth } from "./auth";

import products from "./routes/products";
import articles from "./routes/articles";
import contact from "./routes/contact";
import orders from "./routes/orders";
import authRoutes from "./routes/authRoutes";
import account from "./routes/account";
import admin from "./routes/admin";
import media from "./routes/media";
import reviews from "./routes/reviews";
import categories from "./routes/categories";
import { ADMIN_HTML } from "./admin-ui";
import { ADMIN_APP_JS } from "./admin-app";
import { applySecurityHeaders, applyCacheHeaders } from "./security-headers";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", async (c, next) => {
  const path = c.req.path;
  // Block directory traversal or hidden/dot files (.env, .git, etc.)
  if (path.startsWith("/.") || path.includes("/.")) {
    return c.text("Not found", 404);
  }
  // Block sensitive file extension probes
  if (/\.(sql|db|sqlite|env|bak|log|conf|config|pem|key|crt|cert|sh|ps1|ts|yml|yaml|ini|lock|dist)$/i.test(path)) {
    return c.text("Not found", 404);
  }
  // Block common CMS/admin/scanner probes
  if (/(?:wp-admin|wp-login|wp-content|wp-includes|xmlrpc\.php|phpmyadmin|cgi-bin|\.aws|\.svn|actuator|composer\.(?:json|lock)|package-lock\.json|Dockerfile|web\.config|server-status)/i.test(path)) {
    return c.text("Not found", 404);
  }
  await next();
  try {
    applySecurityHeaders(c.res.headers, c.req.path);
    applyCacheHeaders(c.res.headers, c.req.path);
  } catch {
    const newHeaders = new Headers(c.res.headers);
    applySecurityHeaders(newHeaders, c.req.path);
    applyCacheHeaders(newHeaders, c.req.path);
    c.res = new Response(c.res.body, {
      status: c.res.status,
      statusText: c.res.statusText,
      headers: newHeaders,
    });
  }
});

// CSRF & Cross-Origin Mutation Protection & Payload Limiting for API requests
app.use("/api/*", async (c, next) => {
  const method = c.req.method.toUpperCase();
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    // Payload size limiting (defense against memory exhaustion / DOS)
    const contentLength = c.req.header("content-length");
    if (contentLength) {
      const len = parseInt(contentLength, 10);
      if (!isNaN(len)) {
        // Media uploads in admin allow up to 10MB; all other API mutations capped at 512KB
        const maxBytes = c.req.path.startsWith("/api/admin/media") ? 10 * 1024 * 1024 : 512 * 1024;
        if (len > maxBytes) {
          return c.json({ error: "payload_too_large", maxBytes }, 413);
        }
      }
    }

    const origin = c.req.header("origin");
    const referer = c.req.header("referer");
    const sourceUrl = origin || referer;
    if (sourceUrl) {
      const allowedHosts = new Set([
        "btt.uz",
        "www.btt.uz",
        "localhost",
        "127.0.0.1",
      ]);
      if (c.env.SITE_ORIGIN) {
        try { allowedHosts.add(new URL(c.env.SITE_ORIGIN).host); } catch {}
      }
      try {
        const sourceHost = new URL(sourceUrl).host;
        const isAllowed =
          allowedHosts.has(sourceHost) ||
          sourceHost.endsWith(".workers.dev") ||
          sourceHost.startsWith("localhost:") ||
          sourceHost.startsWith("127.0.0.1:");
        if (!isAllowed) {
          return c.json({ error: "forbidden_origin", message: "Cross-site request blocked" }, 403);
        }
      } catch {
        return c.json({ error: "bad_origin" }, 400);
      }
    }
  }
  await next();
});

app.onError((err, c) => {
  console.error("Worker unhandled error:", err);
  return c.json({ error: "server_error", message: err.message }, 500);
});

// Resolve the session for every request (cookie -> KV).
app.use("*", sessionMiddleware);

// Health check.
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Strict whitelist of public settings keys exposed to the storefront
const PUBLIC_SETTINGS_KEYS = new Set([
  "brand",
  "phone",
  "whatsapp",
  "telegram",
  "email",
  "working_hours",
  "address",
  "delivery_terms",
]);

// Public settings (contact info, manager telegram, whatsapp, phone).
app.get("/api/settings", async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<{ key: string; value: string }>();
  const map: Record<string, string> = {
    brand: "BTT - мебель для дома и сада",
    phone: "+998 77 104 44 22",
    whatsapp: "998771044422",
    telegram: "btt_uz",
    email: "hello@btt.uz",
  };
  for (const r of results) {
    if (r.key && r.value && PUBLIC_SETTINGS_KEYS.has(r.key)) {
      map[r.key] = r.value;
    }
  }
  return c.json({ ok: true, settings: map });
});

// Public API.
app.route("/api/products", products);
app.route("/api/articles", articles);
app.route("/api/contact", contact);
app.route("/api/orders", orders); // POST public; GET checks session internally
app.route("/api/auth", authRoutes);
app.route("/api/reviews", reviews);
app.route("/api/categories", categories);


// Authenticated customer API.
app.use("/api/account/*", requireAuth);
app.route("/api/account", account);

// Admin CRM API (guarded inside the router).
app.route("/api/admin", admin);

// R2 media.
app.route("/media", media);

// CRM UI (strictly guarded for authenticated administrators only).
app.get("/admin", (c) => {
  const s = c.get("session");
  if (!s || s.role !== "admin") {
    return c.redirect("/login.html?redirect=/admin", 302);
  }
  return c.html(ADMIN_HTML, 200, {
    "x-robots-tag": "noindex, nofollow",
  });
});
app.get("/admin/", (c) => {
  const s = c.get("session");
  if (!s || s.role !== "admin") {
    return c.redirect("/login.html?redirect=/admin", 302);
  }
  return c.html(ADMIN_HTML, 200, {
    "x-robots-tag": "noindex, nofollow",
  });
});
app.get("/admin/app.js", (c) => {
  const s = c.get("session");
  if (!s || s.role !== "admin") {
    return c.text("Unauthorized", 401, {
      "x-robots-tag": "noindex, nofollow",
    });
  }
  return new Response(ADMIN_APP_JS, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-cache",
      "x-robots-tag": "noindex, nofollow",
    },
  });
});

function escHtml(s: string): string {
  return String(s || "").replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}

// Catalog storefront route: /catalog -> serves catalog.html preserving query params
app.get("/catalog", async (c) => {
  const url = new URL("/catalog.html", c.req.url);
  const reqUrl = new URL(c.req.url);
  for (const [k, v] of reqUrl.searchParams.entries()) {
    url.searchParams.set(k, v);
  }
  return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
});

// Clean PDP URLs: /catalog/:slug -> serves product.html with status 200 & authoritative SSR SEO & preloaded runtime product DTO
app.get("/catalog/:slug", async (c) => {
  const rawSlug = c.req.param("slug");
  const slug = (rawSlug || "").toLowerCase().trim();

  // 1. Alias lookup in D1
  const aliasRow = await c.env.DB.prepare(
    `SELECT product_id FROM product_aliases WHERE alias = ?`
  ).bind(slug).first<{ product_id: string }>();

  if (aliasRow?.product_id) {
    return c.redirect(`/catalog/${aliasRow.product_id}`, 301);
  }

  // 2. Fetch canonical product from D1
  const product = await c.env.DB.prepare(
    `SELECT id, category, look, price_now, price_old, default_size,
            COALESCE(availability, 'unknown') AS availability, active, sort,
            COALESCE(product_type, 'simple') AS product_type,
            COALESCE(unit, 'pcs') AS unit,
            featured, created_at, updated_at
     FROM products WHERE id = ?`
  ).bind(slug).first<{
    id: string;
    category: string;
    look?: string;
    price_now: number;
    price_old: number;
    default_size?: string;
    availability: string;
    active: number;
    sort?: number;
    product_type: string;
    unit: string;
    featured: number;
    created_at?: string;
    updated_at?: string;
  }>();

  if (!product || product.active === 0) {
    const notFoundUrl = new URL("/404.html", c.req.url);
    const notFoundRes = await c.env.ASSETS.fetch(new Request(notFoundUrl.toString(), c.req.raw));
    return new Response(notFoundRes.body, {
      status: 404,
      headers: {
        ...Object.fromEntries(notFoundRes.headers.entries()),
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

  // 3. Uppercase slug redirect to canonical lowercase
  if (rawSlug !== slug) {
    return c.redirect(`/catalog/${slug}`, 301);
  }

  // 4. Fetch product.html template from assets
  const url = new URL("/product.html", c.req.url);
  url.searchParams.set("id", slug);
  const reqUrl = new URL(c.req.url);
  for (const [k, v] of reqUrl.searchParams.entries()) {
    if (k !== "id") url.searchParams.set(k, v);
  }
  const assetRes = await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  if (assetRes.status === 304) {
    return new Response(null, { status: 304, headers: assetRes.headers });
  }

  let baseHtml = "";
  if ((assetRes.status === 301 || assetRes.status === 302 || assetRes.status === 307 || assetRes.status === 308) && assetRes.headers.get("Location")) {
    const loc = assetRes.headers.get("Location")!;
    const followUrl = new URL(loc, c.req.url);
    const followedRes = await c.env.ASSETS.fetch(new Request(followUrl.toString(), c.req.raw));
    if (followedRes.status === 304) return new Response(null, { status: 304, headers: followedRes.headers });
    baseHtml = await followedRes.text();
  } else if (assetRes.status === 200) {
    baseHtml = await assetRes.text();
  } else {
    return assetRes;
  }

  // 5. Fetch i18n, media, variants, bundle items, and category for runtime hydration & SEO
  const { results: i18nRows } = await c.env.DB.prepare(
    `SELECT lang, name, category_label, description, sizes, specs, seo_title, seo_description FROM product_i18n WHERE product_id = ?`
  ).bind(slug).all<{
    lang: string;
    name: string;
    category_label: string;
    description: string;
    sizes?: string;
    specs?: string;
    seo_title?: string;
    seo_description?: string;
  }>();

  const i18nMap: Record<string, any> = {};
  for (const row of i18nRows) {
    let sizesArr: string[] = [];
    try {
      if (row.sizes) sizesArr = JSON.parse(row.sizes);
    } catch {}
    let specsObj: Record<string, string> = {};
    try {
      if (row.specs) specsObj = JSON.parse(row.specs);
    } catch {}
    i18nMap[row.lang] = {
      ...row,
      sizes: sizesArr,
      specs: specsObj,
    };
  }

  const i18nRu = i18nMap.ru || i18nRows[0] || null;

  const { results: mediaRows } = await c.env.DB.prepare(
    `SELECT key FROM media WHERE product_id = ? ORDER BY sort ASC, id ASC`
  ).bind(slug).all<{ key: string }>();

  const images = mediaRows.map(m => m.key);

  const { results: variantRows } = await c.env.DB.prepare(
    `SELECT variant_code, name_ru, name_uz, name_en, hex, image, images, price_modifier, sort
     FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY sort ASC, id ASC`
  ).bind(slug).all<{
    variant_code: string;
    name_ru: string;
    name_uz: string;
    name_en: string;
    hex: string;
    image: string;
    images?: string;
    price_modifier: number;
    sort: number;
  }>();

  const confirmedColors = variantRows.map(v => {
    let vImgs: string[] = [];
    try {
      if (v.images) vImgs = JSON.parse(v.images);
    } catch {}
    if (!vImgs.length && v.image) vImgs = [v.image];
    return {
      id: v.variant_code,
      hex: v.hex || "#768C65",
      name: { ru: v.name_ru, uz: v.name_uz || v.name_ru, en: v.name_en || v.name_ru },
      image: v.image || (vImgs[0] || ""),
      images: vImgs,
      price_modifier: v.price_modifier || 0,
      sort: v.sort
    };
  });

  const { results: bundleRows } = await c.env.DB.prepare(
    `SELECT bi.component_product_id, bi.quantity, bi.sort,
            COALESCE(i.name, bi.component_product_id) AS component_name
     FROM bundle_items bi
     LEFT JOIN product_i18n i ON i.product_id = bi.component_product_id AND i.lang = 'ru'
     WHERE bi.bundle_product_id = ?
     ORDER BY bi.sort ASC, bi.id ASC`
  ).bind(slug).all<{
    component_product_id: string;
    quantity: number;
    sort: number;
    component_name: string;
  }>();

  const bundleItems = bundleRows.map(b => ({
    product_id: b.component_product_id,
    quantity: b.quantity,
    sort: b.sort,
    name: b.component_name
  }));

  const catRow = await c.env.DB.prepare(
    `SELECT c.slug, ci.name as name_ru FROM categories c LEFT JOIN category_i18n ci ON ci.category_id = c.id AND ci.lang = 'ru' WHERE c.slug = ?`
  ).bind(product.category).first<{ slug: string; name_ru?: string }>();

  const catLabel = i18nRu?.category_label || catRow?.name_ru || product.category;
  const productName = i18nRu?.name || slug;
  const pageTitle = i18nRu?.seo_title || `BTT - ${productName}`;
  const pageDesc = i18nRu?.seo_description || `${productName} - купить в Ташкенте. Характеристики, размеры, цена в сумах, доставка BTT.`;
  const canonicalUrl = `https://btt.uz/catalog/${slug}`;
  const rawImg = images[0] || "assets/btt-logo.png";
  const imageUrl = rawImg.startsWith("http") ? rawImg : `https://btt.uz/${rawImg.replace(/^\//, "")}`;

  let specs: Record<string, string> = {};
  if (i18nRu?.specs && typeof i18nRu.specs === "object") {
    specs = i18nRu.specs;
  }
  const materials: string[] = specs.mat ? specs.mat.split(",").map((s: string) => s.trim()) : [];

  const unitLabels: Record<string, Record<string, string>> = {
    pcs: { ru: "шт.", uz: "dona", en: "pcs" },
    set: { ru: "комплект", uz: "to'plam", en: "set" },
    kg: { ru: "кг", uz: "kg", en: "kg" }
  };
  const unitLabel = (unitLabels[product.unit] && unitLabels[product.unit].ru) || product.unit;

  const runtimeProduct = {
    id: product.id,
    slug: product.id,
    category: product.category,
    category_label: catLabel,
    product_type: product.product_type,
    unit: product.unit,
    unit_label: unitLabel,
    model: productName,
    name: productName,
    description: i18nRu?.description || "",
    seo_title: pageTitle,
    seo_description: pageDesc,
    price: product.price_now,
    price_now: product.price_now,
    price_old: product.price_old,
    now: product.price_now,
    old: product.price_old,
    currency: "UZS",
    dimensions: (specs.dim || specs.dimensions || product.default_size || ""),
    materials: materials,
    specs: specs,
    maxLoad: specs.max_load || null,
    availability: product.availability,
    stock: null,
    active: true,
    featured: product.featured === 1,
    images: images.length ? images : [rawImg],
    confirmedColors: confirmedColors,
    variants: confirmedColors,
    bundle_items: bundleItems,
    i18n: i18nMap,
    created_at: product.created_at,
    updated_at: product.updated_at
  };

  const allImageUrls = (images.length ? images : [rawImg]).map(img =>
    img.startsWith("http") ? img : `https://btt.uz/${img.replace(/^\//, "")}`
  );

  // Build authoritative Schema.org Offer
  const offerObj: Record<string, unknown> = {
    "@type": "Offer",
    "url": canonicalUrl,
    "priceCurrency": "UZS",
    "price": product.price_now,
    "priceValidUntil": "2026-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@type": "Organization", "name": "BTT - мебель для дома и сада" },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "UZ",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14,
      "returnMethod": "https://schema.org/ReturnInStore",
      "returnFees": "https://schema.org/FreeReturn"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "UZS"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "UZ"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "businessDays": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 3,
          "unitCode": "DAY"
        }
      }
    }
  };
  if (product.availability === "in_stock") {
    offerObj.availability = "https://schema.org/InStock";
  } else if (product.availability === "low_stock") {
    offerObj.availability = "https://schema.org/LimitedAvailability";
  } else if (product.availability === "out_of_stock") {
    offerObj.availability = "https://schema.org/OutOfStock";
  } else if (product.availability === "on_request") {
    offerObj.availability = "https://schema.org/PreOrder";
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "image": allImageUrls,
    "description": pageDesc,
    "sku": slug.toUpperCase(),
    "category": catLabel,
    "brand": { "@type": "Brand", "name": "BTT" },
    "manufacturer": { "@type": "Organization", "name": "BTT - мебель для дома и сада" },
    "offers": offerObj
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://btt.uz/" },
      { "@type": "ListItem", "position": 2, "name": "Каталог", "item": "https://btt.uz/catalog.html" },
      { "@type": "ListItem", "position": 3, "name": productName, "item": canonicalUrl }
    ]
  };

  let html = baseHtml;
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escHtml(pageTitle)}</title>`);
  html = html.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${escHtml(pageDesc)}">`);
  html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}">`);
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${escHtml(pageTitle)}">`);
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${escHtml(pageDesc)}">`);
  html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${escHtml(imageUrl)}">`);
  html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${escHtml(pageTitle)}">`);
  html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${escHtml(pageDesc)}">`);
  html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${escHtml(imageUrl)}">`);

  const headInject = [
    `<meta property="og:type" content="product">`,
    `<meta property="og:locale" content="ru_RU">`,
    `<meta property="og:site_name" content="BTT - мебель для дома и сада">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="800">`,
    `<meta property="og:image:alt" content="${escHtml(productName)}">`,
    `<meta property="product:price:amount" content="${product.price_now}">`,
    `<meta property="product:price:currency" content="UZS">`,
    `<meta property="product:availability" content="${product.availability === 'in_stock' ? 'in stock' : 'preorder'}">`,
    `<meta property="product:brand" content="BTT">`,
    `<meta property="product:retailer_item_id" content="${slug}">`,
    `<script type="application/ld+json" id="pdp-schema-product">${JSON.stringify(productJsonLd)}</script>`,
    `<script type="application/ld+json" id="pdp-schema-breadcrumb">${JSON.stringify(breadcrumbJsonLd)}</script>`,
    `<script id="btt-runtime-product" type="application/json">${JSON.stringify(runtimeProduct)}</script>`
  ].join("\n");

  html = html.replace("</head>", `${headInject}\n</head>`);

  const headers = new Headers(assetRes.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(html, {
    status: 200,
    headers
  });
});

// Dynamic sitemap.xml generated from D1 active products and categories with static fallback
app.get("/sitemap.xml", async (c) => {
  try {
    const { results: prods } = await c.env.DB.prepare(
      `SELECT id, updated_at FROM products WHERE active = 1 ORDER BY sort ASC, id ASC`
    ).all<{ id: string; updated_at?: string }>();

    const { results: cats } = await c.env.DB.prepare(
      `SELECT slug, updated_at FROM categories WHERE active = 1 ORDER BY sort ASC, id ASC`
    ).all<{ slug: string; updated_at?: string }>();

    if (prods && prods.length > 0) {
      const staticUrls = [
        { loc: "https://btt.uz/", freq: "weekly", priority: "1.0" },
        { loc: "https://btt.uz/catalog.html", freq: "weekly", priority: "0.95" },
        { loc: "https://btt.uz/horeca.html", freq: "weekly", priority: "0.88" },
        { loc: "https://btt.uz/rotang-tashkent.html", freq: "monthly", priority: "0.88" },
        { loc: "https://btt.uz/sadovaya-mebel-rotang.html", freq: "monthly", priority: "0.88" },
        { loc: "https://btt.uz/about.html", freq: "monthly", priority: "0.7" },
        { loc: "https://btt.uz/contacts.html", freq: "monthly", priority: "0.75" },
        { loc: "https://btt.uz/blog.html", freq: "weekly", priority: "0.8" },
        { loc: "https://btt.uz/article.html?slug=zachem-iskusstvennyy-rotang", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/article.html?slug=kak-vybrat-luchshiy-rotang", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/article.html?slug=pochemu-rabotayut-s-btt", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/uhod-za-mebelyu-iz-rotanga", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/profil-polumesyats-dlya-mebeli", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/rotang-dlya-terrasy", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/mebel-iz-rotanga-na-zakaz", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/iskusstvennyy-i-naturalnyy-rotang", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/sadovaya-mebel-rotang-tashkent", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/kashpo-iz-iskusstvennogo-rotanga", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/korziny-sunduki-rotang", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/kupit-rotang-buhtami", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/mebel-rotang-dlya-kafe", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/pletennaya-mebel-dlya-doma", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/dostavka-rotanga-po-uzbekistanu", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/rotang-dlya-balkona", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/palitra-tsvetov-rotanga-btt", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/oformlenie-terassi-rotangom", freq: "monthly", priority: "0.65" },
        { loc: "https://btt.uz/faq.html", freq: "monthly", priority: "0.55" },
        { loc: "https://btt.uz/delivery.html", freq: "monthly", priority: "0.5" },
        { loc: "https://btt.uz/returns.html", freq: "monthly", priority: "0.5" },
        { loc: "https://btt.uz/care.html", freq: "monthly", priority: "0.55" },
        { loc: "https://btt.uz/privacy.html", freq: "monthly", priority: "0.3" },
        { loc: "https://btt.uz/cookies.html", freq: "monthly", priority: "0.3" }
      ];

      const xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      ];
      for (const item of staticUrls) {
        xmlLines.push(`  <url><loc>${item.loc}</loc><changefreq>${item.freq}</changefreq><priority>${item.priority}</priority></url>`);
      }
      if (cats && cats.length) {
        for (const catItem of cats) {
          xmlLines.push(`  <url><loc>https://btt.uz/catalog.html?cat=${encodeURIComponent(catItem.slug)}</loc><changefreq>weekly</changefreq><priority>0.88</priority></url>`);
        }
      }
      for (const p of prods) {
        xmlLines.push(`  <url><loc>https://btt.uz/catalog/${encodeURIComponent(p.id)}</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`);
      }
      xmlLines.push('</urlset>');

      return new Response(xmlLines.join("\n"), {
        headers: {
          "content-type": "application/xml; charset=utf-8",
          "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300"
        }
      });
    }
  } catch (err) {
    console.error("Dynamic sitemap generation error:", err);
  }

  // Fallback to static sitemap.xml in assets
  return c.env.ASSETS.fetch(c.req.raw);
});

// Legacy redirect: /product?id=:slug -> /catalog/:slug
app.get("/product", async (c) => {
  const id = (c.req.query("id") || "").toLowerCase().trim();
  if (id) {
    const alias = await c.env.DB.prepare(
      `SELECT product_id FROM product_aliases WHERE alias = ?`
    ).bind(id).first<{ product_id: string }>();
    if (alias?.product_id) {
      return c.redirect(`/catalog/${alias.product_id}`, 301);
    }
    const prod = await c.env.DB.prepare(
      `SELECT id FROM products WHERE id = ?`
    ).bind(id).first();
    if (prod) {
      return c.redirect(`/catalog/${id}`, 301);
    }
  }
  return c.redirect("/catalog.html", 301);
});

// Legacy article redirects
const ARTICLE_REDIRECTS: Record<string, string> = {
  "/kashpo-iz-iskusstvennogo-rotanga": "/article.html?slug=kashpo-iz-iskusstvennogo-rotanga",
  "/korziny-sunduki-rotang": "/article.html?slug=korziny-sunduki-rotang",
  "/palitra-tsvetov-rotanga-btt": "/article.html?slug=palitra-tsvetov-rotanga-btt",
};

for (const [fromPath, toPath] of Object.entries(ARTICLE_REDIRECTS)) {
  app.get(fromPath, (c) => c.redirect(toPath, 301));
}

// HoReCa landing page
app.get("/horeca", async (c) => {
  const url = new URL("/horeca.html", c.req.url);
  const res = await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  return new Response(res.body, {
    status: 200,
    headers: {
      ...Object.fromEntries(res.headers.entries()),
      "content-type": "text/html; charset=utf-8",
    },
  });
});

// Sets / Bundle Calculator page
app.get("/sets", async (c) => {
  const url = new URL("/sets.html", c.req.url);
  const res = await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  return new Response(res.body, {
    status: 200,
    headers: {
      ...Object.fromEntries(res.headers.entries()),
      "content-type": "text/html; charset=utf-8",
    },
  });
});

app.get("/calc", (c) => c.redirect("/sets", 301));

// Anything else that reached the Worker is delegated to the static assets binding.
// On 404 for non-API routes, serve the branded 404.html.
app.all("*", async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status === 404 && !c.req.path.startsWith("/api/")) {
    const notFoundUrl = new URL("/404.html", c.req.url);
    const notFoundRes = await c.env.ASSETS.fetch(new Request(notFoundUrl.toString(), c.req.raw));
    if (notFoundRes.ok) {
      return new Response(notFoundRes.body, {
        status: 404,
        headers: notFoundRes.headers,
      });
    }
  }
  return res;
});

export default app;

