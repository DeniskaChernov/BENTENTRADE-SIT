/** Admin SPA logic, served as /admin/app.js. Dependency-free modern vanilla JS. */
export const ADMIN_APP_JS = String.raw`
(function(){
  "use strict";

  var app = document.getElementById("app");
  var LANGS = ["ru", "uz", "en"];
  var CATS = [
    { id: "furniture", label: "Садовая мебель" },
    { id: "planter", label: "Кашпо" },
    { id: "basket", label: "Корзины и сундуки" },
    { id: "indoor", label: "Мебель для дома" }
  ];

  var ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>',
    products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    requests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    articles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  };

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtMoney(val, cur){
    var n = Math.round(Number(val) || 0);
    var c = cur || "сум";
    return n.toLocaleString("ru-RU") + " " + c;
  }

  function catFallback(cat){
    if (cat === "planter") return "/assets/hero-planter.png";
    if (cat === "indoor") return "/assets/hero-home-furniture.png";
    return "/assets/hero-garden-furniture.png";
  }

  function catName(catId){
    var c = CATS.find(function(x){ return x.id === catId; });
    return c ? c.label : catId;
  }

  function translit(str){
    var ru = ["а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь","э","ю","я"];
    var en = ["a","b","v","g","d","e","yo","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","h","ts","ch","sh","shch","","y","","e","yu","ya"];
    var s = String(str || "").toLowerCase();
    for (var i = 0; i < ru.length; i++) {
      s = s.split(ru[i]).join(en[i]);
    }
    return s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function toast(msg, type){
    var wrap = document.getElementById("toasts");
    if (!wrap) return;
    var el = document.createElement("div");
    el.className = "toast " + (type || "ok");
    el.textContent = msg;
    wrap.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add("show"); });
    setTimeout(function(){
      el.classList.remove("show");
      setTimeout(function(){ el.remove(); }, 300);
    }, 3000);
  }

  function confirmModal(title, text, confirmText, isDanger){
    return new Promise(function(resolve){
      var dlg = document.createElement("dialog");
      dlg.innerHTML =
        '<div class="dlg-header"><h2>' + esc(title) + '</h2></div>' +
        '<div class="dlg-body"><p style="color:var(--ink-soft);font-size:14px">' + esc(text) + '</p></div>' +
        '<div class="dlg-foot">' +
          '<button class="btn ghost" id="c-cancel">Отмена</button>' +
          '<button class="btn ' + (isDanger ? 'danger' : '') + '" id="c-ok">' + esc(confirmText || "Подтвердить") + '</button>' +
        '</div>';
      document.body.appendChild(dlg);
      dlg.showModal();
      dlg.querySelector("#c-cancel").onclick = function(){ dlg.close(); dlg.remove(); resolve(false); };
      dlg.querySelector("#c-ok").onclick = function(){ dlg.close(); dlg.remove(); resolve(true); };
    });
  }

  function renderSimpleMarkdown(md){
    if (!md) return '<p class="hint">Текст статьи пуст.</p>';
    var html = esc(md);
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<div style="margin:14px 0;text-align:center"><img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><div style="font-size:11.5px;color:var(--muted);margin-top:4px">$1</div></div>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:underline">$1</a>');
    html = html.replace(/### (.*?)\n/g, "<h3>$1</h3>");
    html = html.replace(/## (.*?)\n/g, "<h2>$1</h2>");
    html = html.replace(/# (.*?)\n/g, "<h1>$1</h1>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");
    return '<p>' + html + '</p>';
  }

  async function api(path, opts){
    opts = opts || {};
    var init = { method: opts.method || "GET", headers: {}, credentials: "same-origin" };
    if (opts.body !== undefined) {
      init.headers["content-type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }
    if (opts.form) {
      init.body = opts.form;
    }
    var r = await fetch(path, init);
    var data = null;
    try { data = await r.json(); } catch(e) {}
    if (!r.ok) {
      throw Object.assign(new Error((data && data.error) || ("HTTP " + r.status)), { status: r.status, data: data });
    }
    return data;
  }

  /* ------------------------------ Login ------------------------------ */
  var currentUser = null;
  function renderLogin(err){
    app.innerHTML =
      '<div class="login-wrap">' +
        '<div class="login-card">' +
          '<div class="brand">' +
            '<div class="brand-logo">B</div>' +
            '<div class="brand-text"><h1>Bententrade</h1><span>Панель управления</span></div>' +
          '</div>' +
          '<div class="field"><label>Email</label><input id="l-email" type="email" placeholder="admin@bententrade.uz" autocomplete="username"></div>' +
          '<div class="field"><label>Пароль</label><input id="l-pass" type="password" placeholder="••••••••" autocomplete="current-password"></div>' +
          (err ? '<div style="color:var(--err);font-size:12.5px;margin-bottom:12px;font-weight:600">' + esc(err) + '</div>' : '') +
          '<button class="btn" id="l-go" style="width:100%">Войти в систему</button>' +
        '</div>' +
      '</div>';
    document.getElementById("l-go").onclick = doLogin;
    document.getElementById("l-pass").addEventListener("keydown", function(e){ if (e.key === "Enter") doLogin(); });
    document.getElementById("l-email").addEventListener("keydown", function(e){ if (e.key === "Enter") doLogin(); });
  }

  async function doLogin(){
    var email = document.getElementById("l-email").value.trim();
    var password = document.getElementById("l-pass").value;
    if (!email || !password) { renderLogin("Введите email и пароль."); return; }
    try {
      var res = await api("/api/auth/login", { method: "POST", body: { email: email, password: password } });
      if (res.user && res.user.role === "admin") {
        currentUser = res.user;
        renderShell();
      } else {
        await api("/api/auth/logout", { method: "POST" });
        renderLogin("Требуются права администратора.");
      }
    } catch(e) {
      renderLogin(e.message === "invalid_credentials" ? "Неверный email или пароль." : e.message);
    }
  }

  /* ------------------------------ Shell ------------------------------ */
  var SECTIONS = [
    { id: "dashboard", label: "Сводка", icon: ICONS.dashboard },
    { id: "products", label: "Товары", icon: ICONS.products },
    { id: "articles", label: "Статьи (Блог)", icon: ICONS.articles },
    { id: "media", label: "Медиатека", icon: ICONS.media },
    { id: "orders", label: "Заказы", icon: ICONS.orders },
    { id: "requests", label: "Заявки", icon: ICONS.requests },
    { id: "reviews", label: "Отзывы", icon: ICONS.star },
    { id: "settings", label: "Настройки", icon: ICONS.settings }
  ];
  var currentSection = "dashboard";
  var badgeCounts = { ordersNew: 0, requestsNew: 0 };

  function renderShell(){
    app.innerHTML =
      '<div class="app-wrap">' +
        '<aside id="sidebar">' +
          '<div class="brand">' +
            '<div class="brand-logo">B</div>' +
            '<div class="brand-text"><h1>Bententrade</h1><span>Панель управления</span></div>' +
          '</div>' +
          '<div class="nav-group">' +
            '<div class="nav-title">Управление сайтом</div>' +
            '<nav id="nav">' +
              SECTIONS.map(function(s){
                var badge = '';
                if (s.id === "orders" && badgeCounts.ordersNew > 0) {
                  badge = '<span class="badge-count warn">' + badgeCounts.ordersNew + '</span>';
                } else if (s.id === "requests" && badgeCounts.requestsNew > 0) {
                  badge = '<span class="badge-count warn">' + badgeCounts.requestsNew + '</span>';
                }
                return '<button data-sec="' + s.id + '" class="' + (s.id === currentSection ? 'active' : '') + '">' +
                  s.icon + '<span>' + s.label + '</span>' + badge +
                '</button>';
              }).join("") +
            '</nav>' +
          '</div>' +
          '<div class="aside-foot">' +
            '<a href="/" target="_blank" class="btn ghost sm" style="width:100%">' + ICONS.external + ' В магазин</a>' +
            '<div class="user-badge">' +
              '<div class="user-ava">' + esc((currentUser && currentUser.name ? currentUser.name[0] : "A").toUpperCase()) + '</div>' +
              '<div class="user-info">' +
                '<div class="user-name">' + esc((currentUser && currentUser.name) || "Администратор") + '</div>' +
                '<div class="user-role">Главный админ</div>' +
              '</div>' +
            '</div>' +
            '<button class="btn ghost sm danger" id="btn-logout" style="width:100%">Выйти</button>' +
          '</div>' +
        '</aside>' +
        '<div class="main-wrap">' +
          '<header class="top-bar">' +
            '<div class="top-left">' +
              '<button class="mob-menu-btn" id="mob-toggle">' + ICONS.menu + '</button>' +
              '<h2 class="page-title" id="page-title">Сводка</h2>' +
            '</div>' +
            '<div class="top-actions" id="top-actions"></div>' +
          '</header>' +
          '<main id="content"></main>' +
        '</div>' +
      '</div>';

    document.getElementById("nav").addEventListener("click", function(e){
      var btn = e.target.closest("button[data-sec]");
      if (!btn) return;
      currentSection = btn.getAttribute("data-sec");
      document.querySelectorAll("#nav button").forEach(function(b){
        b.classList.toggle("active", b.getAttribute("data-sec") === currentSection);
      });
      document.getElementById("sidebar").classList.remove("open");
      route();
    });

    document.getElementById("btn-logout").onclick = async function(){
      await api("/api/auth/logout", { method: "POST" });
      currentUser = null;
      renderLogin();
      toast("Вы вышли из системы");
    };

    var mobToggle = document.getElementById("mob-toggle");
    if (mobToggle) {
      mobToggle.onclick = function(){
        document.getElementById("sidebar").classList.toggle("open");
      };
    }

    route();
  }

  function route(){
    var titles = {
      dashboard: "Сводка магазина",
      products: "Управление товарами",
      articles: "Статьи и Блог",
      media: "Медиатека",
      orders: "Заказы клиентов",
      requests: "Заявки с форм",
      reviews: "Отзывы покупателей",
      settings: "Настройки сайта"
    };
    var tEl = document.getElementById("page-title");
    if (tEl) tEl.textContent = titles[currentSection] || "Панель";
    var actionsEl = document.getElementById("top-actions");
    if (actionsEl) actionsEl.innerHTML = "";

    var main = document.getElementById("content");
    main.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Загрузка данных…</div>';

    ({
      dashboard: secDashboard,
      products: secProducts,
      articles: secArticles,
      media: secMedia,
      orders: secOrders,
      requests: secRequests,
      reviews: secReviews,
      settings: secSettings
    }[currentSection])();

  }

  /* ---------------------------- Dashboard ---------------------------- */
  async function secDashboard(){
    var main = document.getElementById("content");
    var s = await api("/api/admin/stats");
    badgeCounts.ordersNew = s.ordersNew || 0;
    badgeCounts.requestsNew = s.requestsNew || 0;

    var topActions = document.getElementById("top-actions");
    if (topActions) {
      topActions.innerHTML =
        '<button class="btn sm" id="d-new-prod">' + ICONS.plus + ' Новый товар</button>' +
        '<button class="btn sm ghost" id="d-new-art">' + ICONS.plus + ' Новая статья</button>';
      document.getElementById("d-new-prod").onclick = function(){ editProduct(null); };
      document.getElementById("d-new-art").onclick = function(){ editArticle(null); };
    }

    main.innerHTML =
      '<div class="kpis">' +
        '<div class="kpi">' +
          '<div class="kpi-h"><span>Заказы</span><div class="kpi-icon">' + ICONS.orders + '</div></div>' +
          '<div class="kpi-n">' + (s.orders || 0) + '</div>' +
          '<div class="kpi-sub ' + (s.ordersNew ? 'warn' : '') + '">' + (s.ordersNew ? '⚡ ' + s.ordersNew + ' новых требуют обработки' : 'Все обработаны') + '</div>' +
        '</div>' +
        '<div class="kpi">' +
          '<div class="kpi-h"><span>Заявки</span><div class="kpi-icon">' + ICONS.requests + '</div></div>' +
          '<div class="kpi-n">' + (s.requests || 0) + '</div>' +
          '<div class="kpi-sub ' + (s.requestsNew ? 'warn' : '') + '">' + (s.requestsNew ? '⚡ ' + s.requestsNew + ' новых контактов' : 'Нет новых заявок') + '</div>' +
        '</div>' +
        '<div class="kpi">' +
          '<div class="kpi-h"><span>Товары</span><div class="kpi-icon">' + ICONS.products + '</div></div>' +
          '<div class="kpi-n">' + (s.products || 0) + '</div>' +
          '<div class="kpi-sub">В каталоге магазина</div>' +
        '</div>' +
        '<div class="kpi">' +
          '<div class="kpi-h"><span>Статьи</span><div class="kpi-icon">' + ICONS.articles + '</div></div>' +
          '<div class="kpi-n">' + (s.articles || 0) + '</div>' +
          '<div class="kpi-sub">Опубликовано в блоге</div>' +
        '</div>' +
        '<div class="kpi">' +
          '<div class="kpi-h"><span>Клиенты</span><div class="kpi-icon">' + ICONS.dashboard + '</div></div>' +
          '<div class="kpi-n">' + (s.users || 0) + '</div>' +
          '<div class="kpi-sub">Зарегистрировано</div>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
        '<h3 style="font-size:16px;font-weight:700">Последние заказы</h3>' +
        '<button class="btn ghost sm" id="d-all-orders">Все заказы →</button>' +
      '</div>' +
      '<div id="dash-orders-wrap" class="table-card"><div style="padding:20px;text-align:center;color:var(--muted)">Загрузка заказов…</div></div>';

    document.getElementById("d-all-orders").onclick = function(){
      currentSection = "orders";
      document.querySelectorAll("#nav button").forEach(function(b){ b.classList.toggle("active", b.getAttribute("data-sec") === "orders"); });
      route();
    };

    var ordData = await api("/api/admin/orders");
    var orders = (ordData.orders || []).slice(0, 5);
    var oWrap = document.getElementById("dash-orders-wrap");
    if (!orders.length) {
      oWrap.innerHTML = '<div style="padding:30px;text-align:center;color:var(--muted)">Заказов пока нет. При оформлении заказа клиентом он сразу появится здесь.</div>';
      return;
    }

    oWrap.innerHTML =
      '<table>' +
        '<thead><tr><th>Номер</th><th>Клиент</th><th>Сумма</th><th>Статус</th><th>Дата</th><th></th></tr></thead>' +
        '<tbody>' +
          orders.map(function(o){
            return '<tr>' +
              '<td><span style="font-weight:700;color:var(--copper)">' + esc(o.public_id) + '</span></td>' +
              '<td><b>' + esc(o.customer_name || "—") + '</b><br><small class="hint">' + esc(o.customer_phone || "") + '</small></td>' +
              '<td><span style="font-weight:700">' + fmtMoney(o.total, o.currency) + '</span></td>' +
              '<td><span class="pill ' + esc(o.status) + '">' + esc(o.status) + '</span></td>' +
              '<td><small class="hint">' + esc((o.created_at || "").slice(0, 16)) + '</small></td>' +
              '<td style="text-align:right"><button class="btn ghost sm" data-v-order="' + o.id + '">Открыть</button></td>' +
            '</tr>';
          }).join("") +
        '</tbody>' +
      '</table>';

    oWrap.addEventListener("click", function(e){
      var v = e.target.closest("[data-v-order]");
      if (v) viewOrder(v.getAttribute("data-v-order"));
    });
  }

  /* ---------------------------- Products ---------------------------- */
  var allProducts = [];
  var prodSearch = "";
  var prodCat = "all";
  var prodStatus = "all";

  
  function openMediaPicker(cb){
    var dlg = document.createElement("dialog");
    dlg.className = "dlg-wide";
    dlg.innerHTML =
      '<div class="dlg-header">' +
        '<h2>Медиатека — Выбор изображения</h2>' +
        '<button class="dlg-close" id="mp-close">' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="dlg-body">' +
        '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
          '<div class="search-box" style="flex:2;min-width:200px">' +
            ICONS.search +
            '<input type="text" id="mp-search" placeholder="Поиск фото по имени файла…">' +
          '</div>' +
          '<div style="flex:3;min-width:240px;display:flex;gap:6px">' +
            '<input type="text" id="mp-url-inp" placeholder="Или вставьте прямую ссылку (https://…)">' +
            '<button type="button" class="btn sm" id="mp-use-url">Применить</button>' +
          '</div>' +
        '</div>' +

        '<div class="dropzone" id="mp-drop" style="padding:14px;margin-bottom:14px">' +
          ICONS.upload +
          '<div style="font-weight:600;font-size:13px">Быстрая загрузка нового фото в медиатеку (или перетащите файлы)</div>' +
          '<input type="file" id="mp-file" accept="image/*" multiple style="display:none">' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '<span style="font-size:12px;color:var(--muted)">Нажмите на фото, чтобы выбрать его:</span>' +
          '<span style="font-size:11.5px;color:var(--muted)" id="mp-count"></span>' +
        '</div>' +
        '<div class="picker-grid" id="mp-grid">Загрузка медиатеки…</div>' +
      '</div>' +
      '<div class="dlg-foot">' +
        '<button class="btn ghost" id="mp-cancel">Отмена</button>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.showModal();

    dlg.querySelector("#mp-close").onclick = function(){ dlg.close(); dlg.remove(); };
    dlg.querySelector("#mp-cancel").onclick = function(){ dlg.close(); dlg.remove(); };

    // Direct URL usage
    dlg.querySelector("#mp-use-url").onclick = function(){
      var u = dlg.querySelector("#mp-url-inp").value.trim();
      if (!u) { toast("Введите ссылку на фото", "err"); return; }
      dlg.close(); dlg.remove();
      cb(u, { url: u });
    };

    var mpFile = dlg.querySelector("#mp-file");
    var mpDrop = dlg.querySelector("#mp-drop");
    mpDrop.onclick = function(){ mpFile.click(); };
    mpDrop.ondragover = function(e){ e.preventDefault(); mpDrop.classList.add("dragover"); };
    mpDrop.ondragleave = function(){ mpDrop.classList.remove("dragover"); };
    mpDrop.ondrop = function(e){
      e.preventDefault();
      mpDrop.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
    };
    mpFile.onchange = function(){
      if (mpFile.files && mpFile.files[0]) handleUpload(mpFile.files[0]);
    };

    async function handleUpload(file){
      var fd = new FormData();
      fd.append("file", file);
      toast("Загрузка фото…");
      try {
        var up = await api("/api/admin/media", { method: "POST", form: fd });
        dlg.close(); dlg.remove();
        cb(up.url || ("/media/" + up.key), up);
        toast("Фото загружено и выбрано ✓");
      } catch(e){ toast("Ошибка: " + e.message, "err"); }
    }

    var allMediaList = [];
    var grid = dlg.querySelector("#mp-grid");
    var countEl = dlg.querySelector("#mp-count");

    function renderPickerGrid(filterQ){
      var list = allMediaList;
      if (filterQ) {
        list = list.filter(function(m){ return String(m.key || "").toLowerCase().includes(filterQ); });
      }
      countEl.textContent = "Найдено: " + list.length;
      if (!list.length) {
        grid.innerHTML = '<span class="hint" style="grid-column:1/-1;text-align:center;padding:20px">Файлы не найдены.</span>';
        return;
      }
      grid.innerHTML = list.map(function(m){
        var url = "/media/" + esc(m.key);
        return '<div class="picker-item" data-url="' + url + '" data-id="' + m.id + '" title="' + esc(m.key) + '">' +
          '<img src="' + url + '" loading="lazy">' +
        '</div>';
      }).join("");
      grid.querySelectorAll(".picker-item").forEach(function(item){
        item.onclick = function(){
          var url = item.getAttribute("data-url");
          var id = item.getAttribute("data-id");
          dlg.close(); dlg.remove();
          cb(url, { id: id, url: url });
        };
      });
    }

    dlg.querySelector("#mp-search").oninput = function(e){
      renderPickerGrid(e.target.value.toLowerCase().trim());
    };

    api("/api/admin/media").then(function(res){
      allMediaList = (res.media || []);
      renderPickerGrid("");
    }).catch(function(e){
      if (grid) grid.innerHTML = '<span class="hint" style="color:var(--err)">Ошибка загрузки: ' + esc(e.message) + '</span>';
    });
  }
  async function secProducts(){
    var topActions = document.getElementById("top-actions");
    if (topActions) {
      topActions.innerHTML = '<button class="btn" id="p-add-top">' + ICONS.plus + ' Добавить товар</button>';
      document.getElementById("p-add-top").onclick = function(){ editProduct(null); };
    }

    var main = document.getElementById("content");
    main.innerHTML =
      '<div class="toolbar">' +
        '<div class="search-box">' +
          ICONS.search +
          '<input type="text" id="p-search" placeholder="Поиск по названию или ID…" value="' + esc(prodSearch) + '">' +
        '</div>' +
        '<div class="filters-group">' +
          '<span class="filter-chip ' + (prodCat === "all" ? 'active' : '') + '" data-pcat="all">Все категории</span>' +
          CATS.map(function(c){
            return '<span class="filter-chip ' + (prodCat === c.id ? 'active' : '') + '" data-pcat="' + c.id + '">' + c.label + '</span>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="toolbar" style="margin-top:-8px;margin-bottom:16px">' +
        '<div class="filters-group">' +
          '<span class="filter-chip ' + (prodStatus === "all" ? 'active' : '') + '" data-pst="all">Все статусы</span>' +
          '<span class="filter-chip ' + (prodStatus === "active" ? 'active' : '') + '" data-pst="active">✓ Только активные</span>' +
          '<span class="filter-chip ' + (prodStatus === "hidden" ? 'active' : '') + '" data-pst="hidden">Скрытые</span>' +
        '</div>' +
        '<div style="font-size:12.5px;color:var(--muted)" id="p-count"></div>' +
      '</div>' +
      '<div class="table-card" id="p-table-wrap"><div style="padding:40px;text-align:center;color:var(--muted)">Загрузка товаров…</div></div>';

    document.getElementById("p-search").addEventListener("input", function(e){
      prodSearch = e.target.value.toLowerCase().trim();
      renderProductTable();
    });

    document.querySelectorAll("[data-pcat]").forEach(function(el){
      el.addEventListener("click", function(){
        prodCat = el.getAttribute("data-pcat");
        document.querySelectorAll("[data-pcat]").forEach(function(x){ x.classList.toggle("active", x === el); });
        renderProductTable();
      });
    });

    document.querySelectorAll("[data-pst]").forEach(function(el){
      el.addEventListener("click", function(){
        prodStatus = el.getAttribute("data-pst");
        document.querySelectorAll("[data-pst]").forEach(function(x){ x.classList.toggle("active", x === el); });
        renderProductTable();
      });
    });

    var res = await api("/api/admin/products");
    allProducts = res.products || [];
    renderProductTable();
  }

  function renderProductTable(){
    var wrap = document.getElementById("p-table-wrap");
    var countEl = document.getElementById("p-count");
    if (!wrap) return;

    var filtered = allProducts.filter(function(p){
      var matchCat = (prodCat === "all" || p.category === prodCat);
      var matchSt = (prodStatus === "all" || (prodStatus === "active" ? p.active === 1 : p.active === 0));
      var matchQ = (!prodSearch || p.id.toLowerCase().includes(prodSearch) || (p.name && p.name.toLowerCase().includes(prodSearch)));
      return matchCat && matchSt && matchQ;
    });

    if (countEl) countEl.textContent = "Показано: " + filtered.length + " из " + allProducts.length;

    // Update filter counts
    document.querySelectorAll(".filters-group .filter-chip[data-cat]").forEach(function(chip){
      var cat = chip.getAttribute("data-cat");
      var n = cat === "all" ? allProducts.length : allProducts.filter(function(p){ return p.category === cat; }).length;
      var label = cat === "all" ? "Все категории" : catName(cat);
      chip.innerHTML = esc(label) + '<span class="chip-cnt">' + n + '</span>';
    });

    if (!filtered.length) {
      wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Товаров по заданным фильтрам не найдено.</div>';
      return;
    }

    wrap.innerHTML =
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th style="width:60px">Фото</th>' +
            '<th>Товар</th>' +
            '<th>Категория</th>' +
            '<th>Цена</th>' +
            '<th style="width:90px">Видимость</th>' +
            '<th style="width:140px;text-align:right">Действия</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          filtered.map(function(p){
            var imgUrl = p.image ? '/media/' + esc(p.image) : catFallback(p.category);
            var disc = (p.price_old && p.price_old > p.price_now) ? Math.round((1 - p.price_now / p.price_old) * 100) : 0;
            return '<tr data-row-id="' + esc(p.id) + '">' +
              '<td><img src="' + imgUrl + '" class="tbl-thumb" onerror="this.src=\'/assets/favicon.png\'"></td>' +
              '<td>' +
                '<div class="tbl-prod-name">' + esc(p.name || "—") + '</div>' +
                '<div class="tbl-prod-id">ID: ' + esc(p.id) + ' · сорт: ' + p.sort + (p.look ? ' · ' + esc(p.look) : '') + '</div>' +
              '</td>' +
              '<td><span class="pill">' + esc(catName(p.category)) + '</span></td>' +
              '<td>' +
                '<span style="font-weight:700;font-size:14.5px;color:var(--ink)">' + fmtMoney(p.price_now < 10000 ? p.price_now * 12500 : p.price_now, "сум") + '</span>' +
                (p.price_old ? ' <span style="text-decoration:line-through;color:var(--muted);font-size:12px">' + fmtMoney(p.price_old < 10000 ? p.price_old * 12500 : p.price_old, "сум") + '</span>' : '') +
                (disc ? ' <span style="color:var(--ok);font-weight:700;font-size:11px">-' + disc + '%</span>' : '') +
              '</td>' +
              '<td>' +
                '<button class="switch ' + (p.active ? 'on' : '') + '" data-toggle-act="' + esc(p.id) + '" title="Переключить видимость">' +
                  '<span class="switch-dot"></span>' +
                '</button>' +
              '</td>' +
              '<td style="text-align:right">' +
                '<div style="display:flex;gap:5px;justify-content:flex-end">' +
                  '<a href="/catalog.html#p=' + encodeURIComponent(p.id) + '" target="_blank" class="btn ghost sm icon-only" title="Открыть на витрине">' + ICONS.external + '</a>' +
                  '<button class="btn ghost sm icon-only" data-p-edit="' + esc(p.id) + '" title="Редактировать">' + ICONS.edit + '</button>' +
                  '<button class="btn ghost sm icon-only" data-p-clone="' + esc(p.id) + '" title="Клонировать товар">' + ICONS.copy + '</button>' +
                  '<button class="btn ghost sm danger icon-only" data-p-del="' + esc(p.id) + '" title="Удалить">' + ICONS.trash + '</button>' +
                '</div>' +
              '</td>' +
            '</tr>';
          }).join("") +
        '</tbody>' +
      '</table>';

    wrap.onclick = async function(e){
      var tBtn = e.target.closest("[data-toggle-act]");
      if (tBtn) {
        var id = tBtn.getAttribute("data-toggle-act");
        var item = allProducts.find(function(x){ return x.id === id; });
        if (!item) return;
        var nextState = item.active === 1 ? 0 : 1;
        try {
          await api("/api/admin/products/" + encodeURIComponent(id) + "/active", { method: "PUT", body: { active: nextState } });
          item.active = nextState;
          tBtn.classList.toggle("on", nextState === 1);
          toast(nextState === 1 ? "Товар «" + (item.name || id) + "» включён в каталоге" : "Товар «" + (item.name || id) + "» скрыт");
        } catch(err){ toast("Ошибка: " + err.message, "err"); }
        return;
      }

      var editBtn = e.target.closest("[data-p-edit]");
      if (editBtn) { editProduct(editBtn.getAttribute("data-p-edit")); return; }

      var cloneBtn = e.target.closest("[data-p-clone]");
      if (cloneBtn) { cloneProduct(cloneBtn.getAttribute("data-p-clone")); return; }

      var delBtn = e.target.closest("[data-p-del]");
      if (delBtn) {
        var did = delBtn.getAttribute("data-p-del");
        var pItem = allProducts.find(function(x){ return x.id === did; });
        var ok = await confirmModal("Удаление товара", "Вы точно хотите удалить товар «" + esc((pItem && pItem.name) || did) + "»? Это действие нельзя отменить.", "Удалить навсегда", true);
        if (ok) {
          try {
            await api("/api/admin/products/" + encodeURIComponent(did), { method: "DELETE" });
            allProducts = allProducts.filter(function(x){ return x.id !== did; });
            renderProductTable();
            toast("Товар удалён");
          } catch(err){ toast("Ошибка: " + err.message, "err"); }
        }
      }
    };
  }
  async function cloneProduct(id){
    var orig = await api("/api/admin/products/" + encodeURIComponent(id));
    var p = orig.product || {};
    var newId = p.id + "-copy";
    var num = 1;
    while (allProducts.some(function(x){ return x.id === newId; })) {
      num++;
      newId = p.id + "-copy" + num;
    }
    var byLang = {};
    (orig.i18n || []).forEach(function(r){ byLang[r.lang] = r; });

    var payload = {
      id: newId,
      category: p.category,
      look: p.look,
      price_now: p.price_now,
      price_old: p.price_old,
      default_size: p.default_size,
      active: 0,
      sort: (p.sort || 0) + 1,
      i18n: {
        ru: { name: (byLang.ru && byLang.ru.name ? byLang.ru.name + " (Копия)" : ""), category_label: (byLang.ru && byLang.ru.category_label) || "", description: (byLang.ru && byLang.ru.description) || "", sizes: (byLang.ru && byLang.ru.sizes) || "[]" },
        uz: { name: (byLang.uz && byLang.uz.name ? byLang.uz.name + " (Nusxa)" : ""), category_label: (byLang.uz && byLang.uz.category_label) || "", description: (byLang.uz && byLang.uz.description) || "", sizes: (byLang.uz && byLang.uz.sizes) || "[]" },
        en: { name: (byLang.en && byLang.en.name ? byLang.en.name + " (Copy)" : ""), category_label: (byLang.en && byLang.en.category_label) || "", description: (byLang.en && byLang.en.description) || "", sizes: (byLang.en && byLang.en.sizes) || "[]" }
      }
    };

    try {
      await api("/api/admin/products", { method: "POST", body: payload });
      toast("Товар склонирован как " + newId);
      var res = await api("/api/admin/products");
      allProducts = res.products || [];
      renderProductTable();
      editProduct(newId);
    } catch(err) {
      toast("Ошибка клонирования: " + err.message, "err");
    }
  }

  async function editProduct(id){
    var isNew = !id;
    var data = id ? await api("/api/admin/products/" + encodeURIComponent(id)) : { product: {}, i18n: [], media: [] };
    var p = data.product || {};
    var byLang = {};
    (data.i18n || []).forEach(function(r){ byLang[r.lang] = r; });
    var attachedMedia = (data.media || []).slice();

    var draftKey = "btt_draft_prod_" + (id || "new");
    var savedDraft = null;
    try {
      var rawDraft = localStorage.getItem(draftKey);
      if (rawDraft) savedDraft = JSON.parse(rawDraft);
    } catch(e){}

    // Parse initial sizes
    var currentSizes = [];
    try {
      var ruSizes = byLang.ru && byLang.ru.sizes;
      if (Array.isArray(ruSizes)) currentSizes = ruSizes.slice();
      else if (typeof ruSizes === "string" && ruSizes.trim()) currentSizes = JSON.parse(ruSizes);
    } catch(e){
      if (byLang.ru && byLang.ru.sizes) {
        currentSizes = String(byLang.ru.sizes).split(",").map(function(s){ return s.trim(); }).filter(Boolean);
      }
    }
    if (!currentSizes.length) currentSizes = ["200×90×75 см"];

    // Parse initial specs
    var currentSpecs = [];
    try {
      var spObj = byLang.ru && byLang.ru.specs;
      var parsed = typeof spObj === "object" ? spObj : (spObj ? JSON.parse(spObj) : null);
      if (parsed && typeof parsed === "object") {
        Object.keys(parsed).forEach(function(k){ currentSpecs.push({ k: k, v: String(parsed[k]) }); });
      }
    } catch(e){}
    if (!currentSpecs.length) {
      currentSpecs = [
        { k: "Материал", v: "Премиальный эко-ротанг, алюминиевый каркас" },
        { k: "Покрытие", v: "Порошковое антикоррозийное" },
        { k: "Срок службы", v: "Более 10 лет при любой погоде" },
        { k: "Производитель", v: "Bententrade (Узбекистан)" }
      ];
    }

    var dlg = document.createElement("dialog");
    dlg.className = "dlg-wide";
    dlg.innerHTML =
      '<div class="dlg-header">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<h2>' + (isNew ? "Создание нового товара" : "Редактирование: " + esc(id)) + '</h2>' +
          '<span class="autosave-pill" id="p-autosave">Синхронизировано</span>' +
        '</div>' +
        '<button class="dlg-close" id="f-close">' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="dlg-body">' +

        (savedDraft ?
          '<div id="p-draft-bar" style="background:var(--panel3);border:1px solid var(--copper);padding:10px 14px;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">' +
            '<span style="font-size:13px;color:var(--ink)">Обнаружен несохранённый локальный черновик (' + esc(new Date(savedDraft._savedAt || Date.now()).toLocaleTimeString()) + ')</span>' +
            '<div style="display:flex;gap:6px">' +
              '<button type="button" class="btn sm" id="p-restore-draft">Восстановить черновик</button>' +
              '<button type="button" class="btn ghost sm" id="p-discard-draft">Отклонить</button>' +
            '</div>' +
          '</div>' : '') +

        '<div class="editor-grid">' +
          '<!-- MAIN LEFT COLUMN -->' +
          '<div class="editor-main">' +

            '<!-- CARD 1: CONTENT & TRANSLATIONS -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-header">' +
                '<div class="editor-card-title">' + ICONS.edit + ' Описание и переводы</div>' +
                '<div style="display:flex;gap:8px;align-items:center">' +
                  '<button type="button" class="btn ghost sm" id="p-fill-all-langs" title="Заполнить UZ и EN из RU в один клик">' + ICONS.sparkles + ' Заполнить все языки из RU</button>' +
                  '<div class="tabs" id="p-lang-tabs" style="margin:0;padding:2px">' +
                    '<button type="button" data-ptab="ru" class="active">RU</button>' +
                    '<button type="button" data-ptab="uz">UZ</button>' +
                    '<button type="button" data-ptab="en">EN</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<!-- RU PANE -->' +
              '<div class="p-pane" data-pl="ru">' +
                '<div class="field">' +
                  '<label>Название товара (RU)</label>' +
                  '<input class="p-name-inp" data-lang="ru" value="' + esc((byLang.ru && byLang.ru.name) || "") + '" placeholder="например: Садовый диван «Лагуна»">' +
                '</div>' +
                '<div class="field">' +
                  '<label>Подпись категории / Бейдж (RU)</label>' +
                  '<input class="p-cat-inp" data-lang="ru" value="' + esc((byLang.ru && byLang.ru.category_label) || "") + '" placeholder="Садовая мебель">' +
                '</div>' +
                '<div class="field">' +
                  '<label>Описание товара (RU)</label>' +
                  '<textarea class="p-desc-inp" data-lang="ru" style="min-height:110px" placeholder="Подробное описание комфорта, устойчивости к солнцу и осадкам…">' + esc((byLang.ru && byLang.ru.description) || "") + '</textarea>' +
                '</div>' +
              '</div>' +

              '<!-- UZ PANE -->' +
              '<div class="p-pane" data-pl="uz" style="display:none">' +
                '<div style="margin-bottom:12px;display:flex;justify-content:flex-end">' +
                  '<button type="button" class="btn ghost sm" data-copy-from-ru="uz">' + ICONS.copy + ' Скопировать из RU</button>' +
                '</div>' +
                '<div class="side-by-side">' +
                  '<div class="ref-panel">' +
                    '<div class="ref-panel-title">Оригинал (RU)</div>' +
                    '<div style="font-weight:600;margin-bottom:6px" id="ref-name-uz">' + esc((byLang.ru && byLang.ru.name) || "—") + '</div>' +
                    '<div style="font-size:12px;color:var(--muted);margin-bottom:8px" id="ref-cat-uz">' + esc((byLang.ru && byLang.ru.category_label) || "—") + '</div>' +
                    '<div style="font-size:12px;line-height:1.5" id="ref-desc-uz">' + esc((byLang.ru && byLang.ru.description) || "—") + '</div>' +
                  '</div>' +
                  '<div>' +
                    '<div class="field">' +
                      '<label>Nomi (UZ)</label>' +
                      '<input class="p-name-inp" data-lang="uz" value="' + esc((byLang.uz && byLang.uz.name) || "") + '" placeholder="Bog\' mebeli «Laguna»">' +
                    '</div>' +
                    '<div class="field">' +
                      '<label>Kategoriya belgisi (UZ)</label>' +
                      '<input class="p-cat-inp" data-lang="uz" value="' + esc((byLang.uz && byLang.uz.category_label) || "") + '" placeholder="Bog\' mebellari">' +
                    '</div>' +
                    '<div class="field">' +
                      '<label>Tavsif (UZ)</label>' +
                      '<textarea class="p-desc-inp" data-lang="uz" style="min-height:110px" placeholder="Tavsif…">' + esc((byLang.uz && byLang.uz.description) || "") + '</textarea>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<!-- EN PANE -->' +
              '<div class="p-pane" data-pl="en" style="display:none">' +
                '<div style="margin-bottom:12px;display:flex;justify-content:flex-end">' +
                  '<button type="button" class="btn ghost sm" data-copy-from-ru="en">' + ICONS.copy + ' Скопировать из RU</button>' +
                '</div>' +
                '<div class="side-by-side">' +
                  '<div class="ref-panel">' +
                    '<div class="ref-panel-title">Original (RU)</div>' +
                    '<div style="font-weight:600;margin-bottom:6px" id="ref-name-en">' + esc((byLang.ru && byLang.ru.name) || "—") + '</div>' +
                    '<div style="font-size:12px;color:var(--muted);margin-bottom:8px" id="ref-cat-en">' + esc((byLang.ru && byLang.ru.category_label) || "—") + '</div>' +
                    '<div style="font-size:12px;line-height:1.5" id="ref-desc-en">' + esc((byLang.ru && byLang.ru.description) || "—") + '</div>' +
                  '</div>' +
                  '<div>' +
                    '<div class="field">' +
                      '<label>Product Title (EN)</label>' +
                      '<input class="p-name-inp" data-lang="en" value="' + esc((byLang.en && byLang.en.name) || "") + '" placeholder="Laguna Outdoor Sofa">' +
                    '</div>' +
                    '<div class="field">' +
                      '<label>Category label (EN)</label>' +
                      '<input class="p-cat-inp" data-lang="en" value="' + esc((byLang.en && byLang.en.category_label) || "") + '" placeholder="Outdoor Furniture">' +
                    '</div>' +
                    '<div class="field">' +
                      '<label>Description (EN)</label>' +
                      '<textarea class="p-desc-inp" data-lang="en" style="min-height:110px" placeholder="Product details…">' + esc((byLang.en && byLang.en.description) || "") + '</textarea>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<!-- CARD 2: GALLERY (SHOPIFY STYLE) -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-header">' +
                '<div class="editor-card-title">' + ICONS.image + ' Фотогалерея товара</div>' +
                '<button type="button" class="btn ghost sm" id="p-pick-media">' + ICONS.plus + ' Выбрать из медиатеки</button>' +
              '</div>' +
              '<div class="dropzone" id="p-dropzone" style="padding:16px;margin-bottom:12px">' +
                ICONS.upload +
                '<div style="font-weight:600;font-size:13px;margin-bottom:2px">Перетащите сюда фото (можно несколько сразу)</div>' +
                '<div class="hint">WebP, PNG, JPEG (до 8 МБ каждый). Главное фото выбирается автоматически.</div>' +
                '<input type="file" id="p-file-input" accept="image/*" multiple style="display:none">' +
              '</div>' +
              '<div class="gallery-grid" id="p-gallery-grid"></div>' +
            '</div>' +

            '<!-- CARD 3: SIZES & VARIANTS CHIPS -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-header">' +
                '<div class="editor-card-title">📏 Размеры и модификации</div>' +
              '</div>' +
              '<div class="field">' +
                '<label>Текущие размеры (нажмите Enter для добавления)</label>' +
                '<div class="chips-box" id="p-chips-box">' +
                  '<input class="chip-inp" id="p-chip-inp" placeholder="+ Добавить размер (например: 200×90×75 см)">' +
                '</div>' +
              '</div>' +
              '<div>' +
                '<div class="hint" style="margin-bottom:6px">Быстрые шаблоны размеров:</div>' +
                '<div style="display:flex;gap:6px;flex-wrap:wrap" id="p-size-presets">' +
                  '<button type="button" class="btn ghost sm" data-preset="200×90×75 см">+ 200×90×75</button>' +
                  '<button type="button" class="btn ghost sm" data-preset="180×80×75 см">+ 180×80×75</button>' +
                  '<button type="button" class="btn ghost sm" data-preset="160×80×75 см">+ 160×80×75</button>' +
                  '<button type="button" class="btn ghost sm" data-preset="D100×75 см">+ D100×75</button>' +
                  '<button type="button" class="btn ghost sm" data-preset="D120×75 см">+ D120×75</button>' +
                  '<button type="button" class="btn ghost sm" data-preset="60×60×45 см">+ 60×60×45</button>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<!-- CARD 4: TECHNICAL SPECIFICATIONS -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-header">' +
                '<div class="editor-card-title">⚙ Характеристики изделия (Спецификация)</div>' +
                '<button type="button" class="btn ghost sm" id="p-add-spec">' + ICONS.plus + ' Характеристика</button>' +
              '</div>' +
              '<div class="spec-grid" id="p-specs-grid"></div>' +
            '</div>' +

          '</div>' +

          '<!-- SIDEBAR RIGHT COLUMN -->' +
          '<div class="editor-side">' +

            '<!-- STATUS CARD -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-title">Статус и видимость</div>' +
              '<div class="field" style="margin-top:10px">' +
                '<label>Видимость в каталоге</label>' +
                '<select id="p-active">' +
                  '<option value="1" ' + (p.active !== 0 ? 'selected' : '') + '>Активен (виден клиентам)</option>' +
                  '<option value="0" ' + (p.active === 0 ? 'selected' : '') + '>Скрыт (черновик / архив)</option>' +
                '</select>' +
              '</div>' +
              '<div class="field">' +
                '<label>Порядок сортировки</label>' +
                '<input id="p-sort" type="number" value="' + (p.sort || 0) + '">' +
              '</div>' +
            '</div>' +

            '<!-- PRICING CARD -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-title">💰 Ценообразование</div>' +
              '<div class="field" style="margin-top:10px">' +
                '<label>Цена со скидкой (сум / UZS)</label>' +
                '<input id="p-now" type="number" value="' + (p.price_now || 0) + '">' +
              '</div>' +
              '<div class="field">' +
                '<label>Старая цена (до скидки, сум / UZS)</label>' +
                '<input id="p-old" type="number" value="' + (p.price_old || 0) + '">' +
                '<div class="disc-presets">' +
                  '<span class="disc-preset" data-disc="10">-10%</span>' +
                  '<span class="disc-preset" data-disc="15">-15%</span>' +
                  '<span class="disc-preset" data-disc="20">-20%</span>' +
                  '<span class="disc-preset" data-disc="25">-25%</span>' +
                  '<span class="disc-preset" data-disc="30">-30%</span>' +
                  '<span class="disc-preset" data-disc="40">-40%</span>' +
                '</div>' +
              '</div>' +
              '<div id="p-disc-badge" style="padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;text-align:center;background:var(--panel3);color:var(--muted)">Скидка не применяется</div>' +
            '</div>' +

            '<!-- CLASSIFICATION CARD -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-title">📁 Классификация</div>' +
              '<div class="field" style="margin-top:10px">' +
                '<label>Уникальный ID / Артикул</label>' +
                '<input id="p-id" ' + (isNew ? '' : 'disabled') + ' value="' + esc(p.id || "") + '" placeholder="например: p16 или sofa-venice">' +
              '</div>' +
              '<div class="field">' +
                '<label>Категория каталога</label>' +
                '<select id="p-cat">' +
                  CATS.map(function(c){ return '<option value="' + c.id + '" ' + (p.category === c.id ? 'selected' : '') + '>' + c.label + '</option>'; }).join("") +
                '</select>' +
              '</div>' +
              '<div class="field">' +
                '<label>Коллекция / Look</label>' +
                '<input id="p-look" value="' + esc(p.look || "") + '" placeholder="sofa, chair, lounge, planter…">' +
              '</div>' +
            '</div>' +

            '<!-- LIVE STOREFRONT CARD PREVIEW -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-header">' +
                '<div class="editor-card-title">' + ICONS.eye + ' Витрина (Live Card)</div>' +
                (!isNew ? '<a href="/catalog.html#p=' + esc(p.id) + '" target="_blank" class="btn ghost sm" style="padding:2px 8px;font-size:11px">' + ICONS.external + ' В каталоге</a>' : '') +
              '</div>' +
              '<div class="store-card-preview" id="p-store-card">' +
                '<div class="store-card-img-wrap">' +
                  '<img id="prev-img" src="/assets/hero-garden-furniture.png">' +
                  '<span class="store-card-badge" id="prev-badge">Садовая мебель</span>' +
                '</div>' +
                '<div class="store-card-body">' +
                  '<div class="store-card-cat" id="prev-cat">Коллекция: —</div>' +
                  '<div class="store-card-name" id="prev-name">Название товара</div>' +
                  '<div class="store-card-pricing">' +
                    '<span class="store-card-now" id="prev-now">0 UZS</span>' +
                    '<span class="store-card-old" id="prev-old"></span>' +
                    '<span class="store-card-disc" id="prev-disc" style="display:none"></span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +

          '</div>' +
        '</div>' +

      '</div>' +
      '<div class="dlg-foot">' +
        (!isNew ? '<button class="btn danger sm" id="f-del">' + ICONS.trash + ' Удалить</button>' : '') +
        '<span class="kbd-hint" style="margin-right:auto;margin-left:8px"><kbd>Ctrl</kbd>+<kbd>S</kbd> сохранить &nbsp;·&nbsp; <kbd>Esc</kbd> закрыть</span>' +
        '<button class="btn ghost" id="f-cancel">Отмена</button>' +
        '<button class="btn" id="f-save">' + ICONS.check + ' ' + (isNew ? 'Создать товар' : 'Сохранить изменения') + '</button>' +
      '</div>';

    document.body.appendChild(dlg);
    dlg.showModal();

    // Hotkeys: Ctrl+S and Esc
    dlg.addEventListener("keydown", function(e){
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        dlg.querySelector("#f-save").click();
      }
    });

    // Auto-suggest ID when typing Russian name (if new)
    var autoIdAllowed = isNew && !dlg.querySelector("#p-id").value;
    dlg.querySelector('.p-name-inp[data-lang="ru"]').addEventListener("input", function(e){
      if (autoIdAllowed && isNew) {
        var tSlug = translit(e.target.value);
        if (tSlug) dlg.querySelector("#p-id").value = tSlug;
      }
    });
    dlg.querySelector("#p-id").addEventListener("input", function(){
      autoIdAllowed = false;
    });

    // 1-click Auto-fill UZ and EN from RU
    dlg.querySelector("#p-fill-all-langs").onclick = function(){
      var ruN = dlg.querySelector('.p-name-inp[data-lang="ru"]').value;
      var ruC = dlg.querySelector('.p-cat-inp[data-lang="ru"]').value;
      var ruD = dlg.querySelector('.p-desc-inp[data-lang="ru"]').value;
      if (!ruN) { toast("Сначала заполните название в RU!", "err"); return; }
      ["uz", "en"].forEach(function(l){
        dlg.querySelector('.p-name-inp[data-lang="' + l + '"]').value = ruN;
        dlg.querySelector('.p-cat-inp[data-lang="' + l + '"]').value = ruC;
        dlg.querySelector('.p-desc-inp[data-lang="' + l + '"]').value = ruD;
      });
      toast("Все языки успешно заполнены из RU ✓");
      triggerAutosave();
    };

    // 1. Language tab switching
    dlg.querySelector("#p-lang-tabs").addEventListener("click", function(e){
      var b = e.target.closest("button[data-ptab]");
      if (!b) return;
      var lang = b.getAttribute("data-ptab");
      dlg.querySelectorAll("#p-lang-tabs button").forEach(function(x){ x.classList.toggle("active", x === b); });
      dlg.querySelectorAll(".p-pane").forEach(function(p){ p.style.display = p.getAttribute("data-pl") === lang ? "" : "none"; });

      // Update RU references for UZ and EN
      if (lang === "uz" || lang === "en") {
        var ruN = dlg.querySelector('.p-name-inp[data-lang="ru"]').value || "—";
        var ruC = dlg.querySelector('.p-cat-inp[data-lang="ru"]').value || "—";
        var ruD = dlg.querySelector('.p-desc-inp[data-lang="ru"]').value || "—";
        var refN = dlg.querySelector("#ref-name-" + lang); if (refN) refN.textContent = ruN;
        var refC = dlg.querySelector("#ref-cat-" + lang); if (refC) refC.textContent = ruC;
        var refD = dlg.querySelector("#ref-desc-" + lang); if (refD) refD.textContent = ruD;
      }
    });

    // Copy RU values to single target language
    dlg.querySelectorAll("[data-copy-from-ru]").forEach(function(btn){
      btn.onclick = function(){
        var targetLang = btn.getAttribute("data-copy-from-ru");
        var ruN = dlg.querySelector('.p-name-inp[data-lang="ru"]').value;
        var ruC = dlg.querySelector('.p-cat-inp[data-lang="ru"]').value;
        var ruD = dlg.querySelector('.p-desc-inp[data-lang="ru"]').value;
        dlg.querySelector('.p-name-inp[data-lang="' + targetLang + '"]').value = ruN;
        dlg.querySelector('.p-cat-inp[data-lang="' + targetLang + '"]').value = ruC;
        dlg.querySelector('.p-desc-inp[data-lang="' + targetLang + '"]').value = ruD;
        toast("Данные скопированы в " + targetLang.toUpperCase() + " ✓");
        triggerAutosave();
      };
    });

    // 2. Chips logic
    var chipsBox = dlg.querySelector("#p-chips-box");
    var chipInp = dlg.querySelector("#p-chip-inp");
    function renderChips(){
      chipsBox.querySelectorAll(".chip-pill").forEach(function(c){ c.remove(); });
      currentSizes.forEach(function(sz, idx){
        var el = document.createElement("span");
        el.className = "chip-pill";
        el.innerHTML = '<span>' + esc(sz) + '</span><button type="button" class="chip-del" data-chip-del="' + idx + '">✕</button>';
        chipsBox.insertBefore(el, chipInp);
      });
      chipsBox.querySelectorAll("[data-chip-del]").forEach(function(b){
        b.onclick = function(){
          var idx = +b.getAttribute("data-chip-del");
          currentSizes.splice(idx, 1);
          renderChips();
          triggerAutosave();
        };
      });
    }
    chipInp.onkeydown = function(e){
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        var val = chipInp.value.trim().replace(/,/g, "");
        if (val && currentSizes.indexOf(val) === -1) {
          currentSizes.push(val);
          chipInp.value = "";
          renderChips();
          triggerAutosave();
        }
      }
    };
    dlg.querySelector("#p-size-presets").onclick = function(e){
      var btn = e.target.closest("[data-preset]");
      if (!btn) return;
      var val = btn.getAttribute("data-preset");
      if (currentSizes.indexOf(val) === -1) {
        currentSizes.push(val);
        renderChips();
        triggerAutosave();
        toast("Размер «" + val + "» добавлен ✓");
      }
    };
    renderChips();

    // 3. Specs Key-Value Table
    var specsGrid = dlg.querySelector("#p-specs-grid");
    function renderSpecs(){
      specsGrid.innerHTML = currentSpecs.map(function(s, idx){
        return '<div class="spec-row" data-spec-idx="' + idx + '">' +
          '<input class="spec-k" value="' + esc(s.k) + '" placeholder="Свойство">' +
          '<input class="spec-v" value="' + esc(s.v) + '" placeholder="Значение">' +
          '<button type="button" class="btn ghost icon-only spec-del" style="color:var(--err)" title="Удалить">✕</button>' +
        '</div>';
      }).join("");

      specsGrid.querySelectorAll(".spec-k").forEach(function(inp){
        inp.oninput = function(){
          var idx = +inp.closest(".spec-row").getAttribute("data-spec-idx");
          currentSpecs[idx].k = inp.value;
          triggerAutosave();
        };
      });
      specsGrid.querySelectorAll(".spec-v").forEach(function(inp){
        inp.oninput = function(){
          var idx = +inp.closest(".spec-row").getAttribute("data-spec-idx");
          currentSpecs[idx].v = inp.value;
          triggerAutosave();
        };
      });
      specsGrid.querySelectorAll(".spec-del").forEach(function(btn){
        btn.onclick = function(){
          var idx = +btn.closest(".spec-row").getAttribute("data-spec-idx");
          currentSpecs.splice(idx, 1);
          renderSpecs();
          triggerAutosave();
        };
      });
    }
    dlg.querySelector("#p-add-spec").onclick = function(){
      currentSpecs.push({ k: "", v: "" });
      renderSpecs();
      triggerAutosave();
    };
    renderSpecs();

    // 4. Gallery & Media Management
    var galleryGrid = dlg.querySelector("#p-gallery-grid");
    function renderGallery(){
      if (!attachedMedia.length) {
        galleryGrid.innerHTML = '<span class="hint" style="grid-column:1/-1">Нет загруженных фотографий. Загрузите файлы выше или выберите из медиатеки.</span>';
        updateStorefrontPreview();
        return;
      }
      galleryGrid.innerHTML = attachedMedia.map(function(m, idx){
        var isPrimary = idx === 0;
        var src = m.url || ("/media/" + esc(m.key));
        return '<div class="gallery-item ' + (isPrimary ? 'is-primary' : '') + '">' +
          '<img src="' + src + '" loading="lazy">' +
          (isPrimary ? '<span class="gallery-badge">⭐ Главное</span>' : '') +
          '<div class="gallery-actions">' +
            (!isPrimary ? '<button type="button" class="gallery-btn" data-make-primary="' + m.id + '" title="Сделать главным">⭐</button>' : '') +
            '<button type="button" class="gallery-btn del" data-del-img="' + m.id + '" title="Удалить">✕</button>' +
          '</div>' +
        '</div>';
      }).join("");

      galleryGrid.querySelectorAll("[data-make-primary]").forEach(function(btn){
        btn.onclick = async function(){
          var mid = btn.getAttribute("data-make-primary");
          var item = attachedMedia.find(function(x){ return String(x.id) === mid; });
          if (!item) return;
          attachedMedia = [item].concat(attachedMedia.filter(function(x){ return String(x.id) !== mid; }));
          try {
            await api("/api/admin/media/" + mid + "/primary", { method: "PUT" });
          } catch(e){}
          renderGallery();
          updateStorefrontPreview();
          triggerAutosave();
          toast("Главное фото обновлено ⭐");
        };
      });

      galleryGrid.querySelectorAll("[data-del-img]").forEach(function(btn){
        btn.onclick = async function(){
          var mid = btn.getAttribute("data-del-img");
          var ok = await confirmModal("Удаление фотографии", "Удалить это фото товара?", "Удалить", true);
          if (!ok) return;
          try {
            await api("/api/admin/media/" + mid, { method: "DELETE" });
            attachedMedia = attachedMedia.filter(function(x){ return String(x.id) !== mid; });
            renderGallery();
            updateStorefrontPreview();
            triggerAutosave();
            toast("Фото удалено");
          } catch(err){ toast("Ошибка: " + err.message, "err"); }
        };
      });

      updateStorefrontPreview();
    }
    renderGallery();

    // Multi-file Dropzone upload
    var drop = dlg.querySelector("#p-dropzone");
    var finp = dlg.querySelector("#p-file-input");
    drop.onclick = function(){ finp.click(); };
    drop.ondragover = function(e){ e.preventDefault(); drop.classList.add("dragover"); };
    drop.ondragleave = function(){ drop.classList.remove("dragover"); };
    drop.ondrop = function(e){
      e.preventDefault();
      drop.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length) handleUploadFiles(e.dataTransfer.files);
    };
    finp.onchange = function(){
      if (finp.files && finp.files.length) handleUploadFiles(finp.files);
    };

    async function handleUploadFiles(files){
      var pid = dlg.querySelector("#p-id").value.trim();
      if (!pid) {
        pid = "p" + (allProducts.length + 1) + "-" + Date.now().toString(36).slice(-4);
        dlg.querySelector("#p-id").value = pid;
        autoIdAllowed = false;
        toast("Сформирован артикул: " + pid);
      }
      var fileArr = Array.from(files || []);
      if (!fileArr.length) return;
      toast("Загрузка " + fileArr.length + " фото…");
      var uploaded = 0;
      for (var i = 0; i < fileArr.length; i++) {
        var f = fileArr[i];
        var fd = new FormData();
        fd.append("file", f);
        fd.append("product_id", pid);
        try {
          var up = await api("/api/admin/media", { method: "POST", form: fd });
          attachedMedia.push({ id: up.id, key: up.key, url: up.url });
          uploaded++;
        } catch(err){
          toast("Ошибка файла " + f.name + ": " + err.message, "err");
        }
      }
      renderGallery();
      triggerAutosave();
      if (uploaded > 0) toast("Загружено " + uploaded + " из " + fileArr.length + " фото ✓");
    }

    // Media picker button
    dlg.querySelector("#p-pick-media").onclick = function(){
      openMediaPicker(async function(url, mediaItem){
        var pid = dlg.querySelector("#p-id").value.trim();
        if (pid && mediaItem && mediaItem.id) {
          try {
            await api("/api/admin/media/" + mediaItem.id + "/link", { method: "PUT", body: { product_id: pid } });
          } catch(e){}
        }
        attachedMedia.push({ id: mediaItem.id, url: url, key: url.replace(/^\/media\//, "") });
        renderGallery();
        toast("Фото добавлено в галерею ✓");
        triggerAutosave();
      });
    };

    // 5. Pricing & discount presets
    var nowInp = dlg.querySelector("#p-now");
    var oldInp = dlg.querySelector("#p-old");
    var discBadge = dlg.querySelector("#p-disc-badge");

    function updatePricing(){
      var nw = +nowInp.value || 0;
      var ol = +oldInp.value || 0;
      if (ol > nw && nw > 0) {
        var pct = Math.round((1 - nw / ol) * 100);
        discBadge.textContent = "Скидка: -" + pct + "% (экономия " + (ol - nw).toLocaleString() + " UZS)";
        discBadge.style.background = "var(--ok-soft)";
        discBadge.style.color = "var(--ok)";
      } else {
        discBadge.textContent = "Скидка не применяется";
        discBadge.style.background = "var(--panel3)";
        discBadge.style.color = "var(--muted)";
      }
      updateStorefrontPreview();
    }
    nowInp.oninput = function(){ updatePricing(); triggerAutosave(); };
    oldInp.oninput = function(){ updatePricing(); triggerAutosave(); };

    // Preset discount clicks
    dlg.querySelectorAll(".disc-preset").forEach(function(pBtn){
      pBtn.onclick = function(){
        var pct = +pBtn.getAttribute("data-disc");
        var ol = +oldInp.value || 0;
        if (!ol) {
          ol = (+nowInp.value || 0) * (1 + pct / 100);
          oldInp.value = Math.round(ol);
        }
        nowInp.value = Math.round(ol * (1 - pct / 100));
        updatePricing();
        triggerAutosave();
        toast("Применена скидка -" + pct + "% ✓");
      };
    });
    updatePricing();

    // 6. Live Storefront Card Preview
    function updateStorefrontPreview(){
      var name = dlg.querySelector('.p-name-inp[data-lang="ru"]').value.trim() || "Название товара";
      var cat = dlg.querySelector("#p-cat").value;
      var catLabel = dlg.querySelector('.p-cat-inp[data-lang="ru"]').value.trim() || catName(cat);
      var look = dlg.querySelector("#p-look").value.trim();
      var nw = +nowInp.value || 0;
      var ol = +oldInp.value || 0;

      dlg.querySelector("#prev-name").textContent = name;
      dlg.querySelector("#prev-badge").textContent = catLabel;
      dlg.querySelector("#prev-cat").textContent = look ? "Коллекция: " + look : catName(cat);
      dlg.querySelector("#prev-now").textContent = fmtMoney(nw);

      var pOldEl = dlg.querySelector("#prev-old");
      var pDiscEl = dlg.querySelector("#prev-disc");
      if (ol > nw && nw > 0) {
        var pct = Math.round((1 - nw / ol) * 100);
        pOldEl.textContent = fmtMoney(ol);
        pOldEl.style.display = "";
        pDiscEl.textContent = "-" + pct + "%";
        pDiscEl.style.display = "";
      } else {
        pOldEl.style.display = "none";
        pDiscEl.style.display = "none";
      }

      var prevImg = dlg.querySelector("#prev-img");
      if (attachedMedia.length > 0) {
        prevImg.src = attachedMedia[0].url || ("/media/" + attachedMedia[0].key);
      } else {
        prevImg.src = catFallback(cat);
      }
    }

    dlg.querySelector('.p-name-inp[data-lang="ru"]').oninput = function(){ updateStorefrontPreview(); triggerAutosave(); };
    dlg.querySelector('.p-cat-inp[data-lang="ru"]').oninput = function(){ updateStorefrontPreview(); triggerAutosave(); };
    dlg.querySelector('#p-cat').onchange = function(){ updateStorefrontPreview(); triggerAutosave(); };
    dlg.querySelector('#p-look').oninput = function(){ updateStorefrontPreview(); triggerAutosave(); };

    // 7. Autosave draft mechanism
    var autoTimer = null;
    var autosavePill = dlg.querySelector("#p-autosave");
    function triggerAutosave(){
      autosavePill.textContent = "Сохранение…";
      autosavePill.classList.remove("saved");
      clearTimeout(autoTimer);
      autoTimer = setTimeout(function(){
        try {
          var draftData = {
            id: dlg.querySelector("#p-id").value.trim(),
            category: dlg.querySelector("#p-cat").value,
            look: dlg.querySelector("#p-look").value.trim(),
            price_now: +nowInp.value || 0,
            price_old: +oldInp.value || 0,
            sort: +dlg.querySelector("#p-sort").value || 0,
            active: +dlg.querySelector("#p-active").value,
            sizes: currentSizes,
            specs: currentSpecs,
            names: {
              ru: dlg.querySelector('.p-name-inp[data-lang="ru"]').value,
              uz: dlg.querySelector('.p-name-inp[data-lang="uz"]').value,
              en: dlg.querySelector('.p-name-inp[data-lang="en"]').value
            },
            cats: {
              ru: dlg.querySelector('.p-cat-inp[data-lang="ru"]').value,
              uz: dlg.querySelector('.p-cat-inp[data-lang="uz"]').value,
              en: dlg.querySelector('.p-cat-inp[data-lang="en"]').value
            },
            descs: {
              ru: dlg.querySelector('.p-desc-inp[data-lang="ru"]').value,
              uz: dlg.querySelector('.p-desc-inp[data-lang="uz"]').value,
              en: dlg.querySelector('.p-desc-inp[data-lang="en"]').value
            },
            _savedAt: Date.now()
          };
          localStorage.setItem(draftKey, JSON.stringify(draftData));
          autosavePill.textContent = "Черновик сохранён";
          autosavePill.classList.add("saved");
        } catch(e){}
      }, 500);
    }

    // Restore or discard draft
    if (savedDraft) {
      var rBtn = dlg.querySelector("#p-restore-draft");
      var dBtn = dlg.querySelector("#p-discard-draft");
      if (rBtn) {
        rBtn.onclick = function(){
          if (savedDraft.category) dlg.querySelector("#p-cat").value = savedDraft.category;
          if (savedDraft.look) dlg.querySelector("#p-look").value = savedDraft.look;
          if (savedDraft.price_now != null) nowInp.value = savedDraft.price_now;
          if (savedDraft.price_old != null) oldInp.value = savedDraft.price_old;
          if (savedDraft.sort != null) dlg.querySelector("#p-sort").value = savedDraft.sort;
          if (savedDraft.active != null) dlg.querySelector("#p-active").value = savedDraft.active;
          if (savedDraft.sizes) { currentSizes = savedDraft.sizes; renderChips(); }
          if (savedDraft.specs) { currentSpecs = savedDraft.specs; renderSpecs(); }
          LANGS.forEach(function(l){
            if (savedDraft.names && savedDraft.names[l]) dlg.querySelector('.p-name-inp[data-lang="' + l + '"]').value = savedDraft.names[l];
            if (savedDraft.cats && savedDraft.cats[l]) dlg.querySelector('.p-cat-inp[data-lang="' + l + '"]').value = savedDraft.cats[l];
            if (savedDraft.descs && savedDraft.descs[l]) dlg.querySelector('.p-desc-inp[data-lang="' + l + '"]').value = savedDraft.descs[l];
          });
          updatePricing();
          updateStorefrontPreview();
          dlg.querySelector("#p-draft-bar").remove();
          toast("Черновик успешно восстановлен ✓");
        };
      }
      if (dBtn) {
        dBtn.onclick = function(){
          try { localStorage.removeItem(draftKey); } catch(e){}
          dlg.querySelector("#p-draft-bar").remove();
          toast("Черновик отклонён");
        };
      }
    }

    // Dialog close / cancel
    dlg.querySelector("#f-close").onclick = function(){ dlg.close(); dlg.remove(); };
    dlg.querySelector("#f-cancel").onclick = function(){ dlg.close(); dlg.remove(); };

    // Delete product
    var delBtn = dlg.querySelector("#f-del");
    if (delBtn) {
      delBtn.onclick = async function(){
        var ok = await confirmModal("Удаление товара", "Вы действительно хотите удалить товар «" + esc(id) + "»? Это действие необратимо.", "Удалить навсегда", true);
        if (!ok) return;
        try {
          await api("/api/admin/products/" + encodeURIComponent(id), { method: "DELETE" });
          try { localStorage.removeItem(draftKey); } catch(e){}
          dlg.close(); dlg.remove();
          toast("Товар удалён");
          var res = await api("/api/admin/products");
          allProducts = res.products || [];
          renderProductTable();
        } catch(err){ toast("Ошибка удаления: " + err.message, "err"); }
      };
    }

    // 8. Save product
    dlg.querySelector("#f-save").onclick = async function(){
      var pid = dlg.querySelector("#p-id").value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      if (!pid) {
        toast("Введите артикул (ID) товара!", "err");
        dlg.querySelector("#p-id").focus();
        return;
      }

      var specsObj = {};
      currentSpecs.forEach(function(s){
        if (s.k.trim()) specsObj[s.k.trim()] = s.v.trim();
      });

      var i18n = {};
      LANGS.forEach(function(l){
        i18n[l] = {
          name: dlg.querySelector('.p-name-inp[data-lang="' + l + '"]').value.trim(),
          category_label: dlg.querySelector('.p-cat-inp[data-lang="' + l + '"]').value.trim(),
          description: dlg.querySelector('.p-desc-inp[data-lang="' + l + '"]').value.trim(),
          sizes: currentSizes,
          specs: specsObj
        };
      });

      var payload = {
        id: pid,
        category: dlg.querySelector("#p-cat").value,
        look: dlg.querySelector("#p-look").value.trim(),
        price_now: +nowInp.value || 0,
        price_old: +oldInp.value || 0,
        sort: +dlg.querySelector("#p-sort").value || 0,
        active: +dlg.querySelector("#p-active").value,
        i18n: i18n
      };

      try {
        if (isNew) {
          await api("/api/admin/products", { method: "POST", body: payload });
          toast("Товар «" + (i18n.ru.name || pid) + "» успешно создан! ✓");
        } else {
          await api("/api/admin/products/" + encodeURIComponent(id), { method: "PUT", body: payload });
          toast("Товар «" + (i18n.ru.name || pid) + "» успешно обновлён! ✓");
        }
        try { localStorage.removeItem(draftKey); } catch(e){}
        dlg.close(); dlg.remove();
        var res = await api("/api/admin/products");
        allProducts = res.products || [];
        renderProductTable();
      } catch(err) {
        toast("Ошибка сохранения: " + err.message, "err");
      }
    };
  }
  /* ---------------------------- Articles ---------------------------- */
  var allArticles = [];
  var artSearch = "";
  var artStatus = "all";

  async function secArticles(){
    var topActions = document.getElementById("top-actions");
    if (topActions) {
      topActions.innerHTML = '<button class="btn" id="a-add-top">' + ICONS.plus + ' Новая статья</button>';
      document.getElementById("a-add-top").onclick = function(){ editArticle(null); };
    }

    var main = document.getElementById("content");
    main.innerHTML =
      '<div class="toolbar">' +
        '<div class="search-box">' +
          ICONS.search +
          '<input type="text" id="a-search" placeholder="Поиск по статьям…" value="' + esc(artSearch) + '">' +
        '</div>' +
        '<div class="filters-group">' +
          '<span class="filter-chip ' + (artStatus === "all" ? 'active' : '') + '" data-ast="all">Все статьи</span>' +
          '<span class="filter-chip ' + (artStatus === "published" ? 'active' : '') + '" data-ast="published">✓ Опубликованные</span>' +
          '<span class="filter-chip ' + (artStatus === "draft" ? 'active' : '') + '" data-ast="draft">Черновики</span>' +
        '</div>' +
      '</div>' +
      '<div class="table-card" id="a-table-wrap"><div style="padding:40px;text-align:center;color:var(--muted)">Загрузка статей…</div></div>';

    document.getElementById("a-search").addEventListener("input", function(e){
      artSearch = e.target.value.toLowerCase().trim();
      renderArticleTable();
    });

    document.querySelectorAll("[data-ast]").forEach(function(el){
      el.addEventListener("click", function(){
        artStatus = el.getAttribute("data-ast");
        document.querySelectorAll("[data-ast]").forEach(function(x){ x.classList.toggle("active", x === el); });
        renderArticleTable();
      });
    });

    var res = await api("/api/admin/articles");
    allArticles = res.articles || [];
    renderArticleTable();
  }

  function renderArticleTable(){
    var wrap = document.getElementById("a-table-wrap");
    if (!wrap) return;

    var filtered = allArticles.filter(function(a){
      var matchSt = (artStatus === "all" || a.status === artStatus);
      var matchQ = (!artSearch || a.slug.toLowerCase().includes(artSearch) || (a.title && a.title.toLowerCase().includes(artSearch)));
      return matchSt && matchQ;
    });

    // Update filter counts
    var pubN = allArticles.filter(function(a){ return a.status === "published"; }).length;
    var draftN = allArticles.filter(function(a){ return a.status !== "published"; }).length;
    var cAll = document.querySelector('[data-ast="all"]'); if (cAll) cAll.innerHTML = 'Все статьи <span class="chip-cnt">' + allArticles.length + '</span>';
    var cPub = document.querySelector('[data-ast="published"]'); if (cPub) cPub.innerHTML = '✓ Опубликовано <span class="chip-cnt">' + pubN + '</span>';
    var cDr = document.querySelector('[data-ast="draft"]'); if (cDr) cDr.innerHTML = 'Черновики <span class="chip-cnt">' + draftN + '</span>';

    if (!filtered.length) {
      wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Статей по заданным фильтрам не найдено.</div>';
      return;
    }

    wrap.innerHTML =
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th style="width:60px">Обложка</th>' +
            '<th>Заголовок статьи</th>' +
            '<th>Слаг (URL)</th>' +
            '<th style="width:110px">Публикация</th>' +
            '<th style="width:130px">Дата</th>' +
            '<th style="width:130px;text-align:right">Действия</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          filtered.map(function(a){
            var coverSrc = a.cover_media ? (a.cover_media.startsWith("/") || a.cover_media.startsWith("http") ? a.cover_media : "/media/" + a.cover_media) : "/assets/hero-rattan.png";
            var isPub = a.status === "published";
            return '<tr data-art-id="' + a.id + '">' +
              '<td><img src="' + coverSrc + '" class="tbl-thumb" onerror="this.src=\'/assets/hero-rattan.png\'"></td>' +
              '<td>' +
                '<div style="font-weight:700;color:var(--ink);font-size:14.5px">' + esc(a.title || "Без заголовка") + '</div>' +
                (a.excerpt ? '<div class="hint" style="max-width:440px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(a.excerpt) + '</div>' : '') +
              '</td>' +
              '<td><code style="background:var(--panel2);padding:2px 6px;border-radius:4px;color:var(--copper)">/' + esc(a.slug) + '</code></td>' +
              '<td>' +
                '<button class="switch ' + (isPub ? 'on' : '') + '" data-toggle-art="' + a.id + '" title="' + (isPub ? 'Снять с публикации' : 'Опубликовать на сайте') + '">' +
                  '<span class="switch-dot"></span>' +
                '</button>' +
              '</td>' +
              '<td><small class="hint">' + esc((a.published_at || "—").slice(0, 10)) + '</small></td>' +
              '<td style="text-align:right">' +
                '<div style="display:flex;gap:5px;justify-content:flex-end">' +
                  '<a href="/article.html?slug=' + encodeURIComponent(a.slug) + '" target="_blank" class="btn ghost sm icon-only" title="Открыть в блоге">' + ICONS.external + '</a>' +
                  '<button class="btn ghost sm icon-only" data-a-edit="' + a.id + '" title="Редактировать">' + ICONS.edit + '</button>' +
                  '<button class="btn ghost sm danger icon-only" data-a-del="' + a.id + '" title="Удалить">' + ICONS.trash + '</button>' +
                '</div>' +
              '</td>' +
            '</tr>';
          }).join("") +
        '</tbody>' +
      '</table>';

    wrap.onclick = async function(e){
      var tBtn = e.target.closest("[data-toggle-art]");
      if (tBtn) {
        var aid = Number(tBtn.getAttribute("data-toggle-art"));
        var item = allArticles.find(function(x){ return x.id === aid; });
        if (!item) return;
        var nextSt = item.status === "published" ? "draft" : "published";
        try {
          await api("/api/admin/articles/" + aid + "/status", { method: "PUT", body: { status: nextSt } });
          item.status = nextSt;
          tBtn.classList.toggle("on", nextSt === "published");
          toast(nextSt === "published" ? "Статья «" + (item.title || item.slug) + "» опубликована на сайте ✓" : "Статья переведена в черновики");
          renderArticleTable();
        } catch(err){ toast("Ошибка: " + err.message, "err"); }
        return;
      }

      var editBtn = e.target.closest("[data-a-edit]");
      if (editBtn) { editArticle(Number(editBtn.getAttribute("data-a-edit"))); return; }

      var delBtn = e.target.closest("[data-a-del]");
      if (delBtn) {
        var did = Number(delBtn.getAttribute("data-a-del"));
        var aItem = allArticles.find(function(x){ return x.id === did; });
        var ok = await confirmModal("Удаление статьи", "Удалить статью «" + esc((aItem && aItem.title) || did) + "» навсегда?", "Удалить", true);
        if (ok) {
          try {
            await api("/api/admin/articles/" + did, { method: "DELETE" });
            allArticles = allArticles.filter(function(x){ return x.id !== did; });
            renderArticleTable();
            toast("Статья удалена");
          } catch(err){ toast("Ошибка: " + err.message, "err"); }
        }
      }
    };
  }
  async function editArticle(id){
    var isNew = !id;
    var data = id ? await api("/api/admin/articles/" + id) : { article: {}, i18n: [] };
    var a = data.article || {};
    var byLang = {};
    (data.i18n || []).forEach(function(r){ byLang[r.lang] = r; });
    var coverUrl = a.cover_media || "";

    var draftKey = "btt_draft_art_" + (id || "new");
    var savedDraft = null;
    try {
      var rawDraft = localStorage.getItem(draftKey);
      if (rawDraft) savedDraft = JSON.parse(rawDraft);
    } catch(e){}

    var dlg = document.createElement("dialog");
    dlg.className = "dlg-wide";
    dlg.innerHTML =
      '<div class="dlg-header">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<h2>' + (isNew ? "Новая статья в блог" : "Редактор статьи: " + esc(a.slug || id)) + '</h2>' +
          '<span class="autosave-pill" id="a-autosave">Синхронизировано</span>' +
        '</div>' +
        '<button class="dlg-close" id="a-close">' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="dlg-body">' +

        (savedDraft ?
          '<div id="a-draft-bar" style="background:var(--panel3);border:1px solid var(--copper);padding:10px 14px;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">' +
            '<span style="font-size:13px;color:var(--ink)">Обнаружен сохранённый черновик статьи (' + esc(new Date(savedDraft._savedAt || Date.now()).toLocaleTimeString()) + ')</span>' +
            '<div style="display:flex;gap:6px">' +
              '<button type="button" class="btn sm" id="a-restore-draft">Восстановить черновик</button>' +
              '<button type="button" class="btn ghost sm" id="a-discard-draft">Отклонить</button>' +
            '</div>' +
          '</div>' : '') +

        '<div class="editor-grid">' +
          '<!-- MAIN CONTENT (GHOST STYLE) -->' +
          '<div class="editor-main">' +

            '<!-- CARD 1: TITLE & EXCERPT -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-header">' +
                '<div class="editor-card-title">' + ICONS.edit + ' Заголовок и краткий анонс</div>' +
                '<div style="display:flex;gap:8px;align-items:center">' +
                  '<button type="button" class="btn ghost sm" id="a-fill-all-langs" title="Скопировать заголовок, анонс и текст в UZ и EN">' + ICONS.sparkles + ' Заполнить все языки из RU</button>' +
                  '<div class="tabs" id="a-lang-tabs" style="margin:0;padding:2px">' +
                    '<button type="button" data-atab="ru" class="active">RU</button>' +
                    '<button type="button" data-atab="uz">UZ</button>' +
                    '<button type="button" data-atab="en">EN</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<!-- RU PANE -->' +
              '<div class="art-pane" data-al="ru">' +
                '<div class="field">' +
                  '<label>Заголовок статьи (RU)</label>' +
                  '<input class="art-title" data-lang="ru" style="font-size:16px;font-weight:700" value="' + esc((byLang.ru && byLang.ru.title) || "") + '" placeholder="Введите цепляющий заголовок…">' +
                '</div>' +
                '<div class="field">' +
                  '<div style="display:flex;justify-content:space-between;align-items:center">' +
                    '<label>Краткий анонс / Excerpt (RU)</label>' +
                    '<span class="char-counter" id="cnt-exc-ru">0 / 160</span>' +
                  '</div>' +
                  '<textarea class="art-exc" data-lang="ru" style="min-height:65px" placeholder="Краткая суть статьи для поисковиков и карточки в блоге…">' + esc((byLang.ru && byLang.ru.excerpt) || "") + '</textarea>' +
                '</div>' +
              '</div>' +

              '<!-- UZ PANE -->' +
              '<div class="art-pane" data-al="uz" style="display:none">' +
                '<div style="margin-bottom:12px;display:flex;justify-content:flex-end">' +
                  '<button type="button" class="btn ghost sm" data-art-copy="uz">' + ICONS.copy + ' Скопировать из RU</button>' +
                '</div>' +
                '<div class="side-by-side">' +
                  '<div class="ref-panel">' +
                    '<div class="ref-panel-title">Оригинал (RU)</div>' +
                    '<div style="font-weight:700;margin-bottom:6px" id="art-ref-title-uz">' + esc((byLang.ru && byLang.ru.title) || "—") + '</div>' +
                    '<div style="font-size:12px;color:var(--ink-soft);line-height:1.4" id="art-ref-exc-uz">' + esc((byLang.ru && byLang.ru.excerpt) || "—") + '</div>' +
                  '</div>' +
                  '<div>' +
                    '<div class="field">' +
                      '<label>Maqola sarlavhasi (UZ)</label>' +
                      '<input class="art-title" data-lang="uz" value="' + esc((byLang.uz && byLang.uz.title) || "") + '" placeholder="Sarlavha…">' +
                    '</div>' +
                    '<div class="field">' +
                      '<label>Qisqacha mazmun (UZ)</label>' +
                      '<textarea class="art-exc" data-lang="uz" style="min-height:65px" placeholder="Qisqacha…">' + esc((byLang.uz && byLang.uz.excerpt) || "") + '</textarea>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<!-- EN PANE -->' +
              '<div class="art-pane" data-al="en" style="display:none">' +
                '<div style="margin-bottom:12px;display:flex;justify-content:flex-end">' +
                  '<button type="button" class="btn ghost sm" data-art-copy="en">' + ICONS.copy + ' Скопировать из RU</button>' +
                '</div>' +
                '<div class="side-by-side">' +
                  '<div class="ref-panel">' +
                    '<div class="ref-panel-title">Original (RU)</div>' +
                    '<div style="font-weight:700;margin-bottom:6px" id="art-ref-title-en">' + esc((byLang.ru && byLang.ru.title) || "—") + '</div>' +
                    '<div style="font-size:12px;color:var(--ink-soft);line-height:1.4" id="art-ref-exc-en">' + esc((byLang.ru && byLang.ru.excerpt) || "—") + '</div>' +
                  '</div>' +
                  '<div>' +
                    '<div class="field">' +
                      '<label>Article Title (EN)</label>' +
                      '<input class="art-title" data-lang="en" value="' + esc((byLang.en && byLang.en.title) || "") + '" placeholder="Article Headline…">' +
                    '</div>' +
                    '<div class="field">' +
                      '<label>Excerpt / Summary (EN)</label>' +
                      '<textarea class="art-exc" data-lang="en" style="min-height:65px" placeholder="Short excerpt…">' + esc((byLang.en && byLang.en.excerpt) || "") + '</textarea>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<!-- CARD 2: EDITORIAL CONTENT & MARKDOWN TOOLBAR -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-header">' +
                '<div style="display:flex;align-items:center;gap:6px">' +
                  '<button type="button" class="btn ghost sm active-mode" data-art-mode="edit">Редактор</button>' +
                  '<button type="button" class="btn ghost sm" data-art-mode="prev">Предпросмотр</button>' +
                  '<button type="button" class="btn ghost sm" data-art-mode="split">Сплит (Бок о бок)</button>' +
                '</div>' +
                '<div class="writing-meter" id="art-meter" style="margin:0;padding:4px 10px">' +
                  '<span id="art-word-count">0 слов</span>' +
                  '<span style="margin:0 6px">·</span>' +
                  '<span id="art-read-time">~1 мин чтения</span>' +
                '</div>' +
              '</div>' +

              '<div class="md-toolbar" id="a-toolbar">' +
                '<button type="button" class="md-btn" data-ins="**" title="Жирный"><b>B</b></button>' +
                '<button type="button" class="md-btn" data-ins="*" title="Курсив"><i>I</i></button>' +
                '<button type="button" class="md-btn" data-ins="## " title="Заголовок H2">H2</button>' +
                '<button type="button" class="md-btn" data-ins="### " title="Заголовок H3">H3</button>' +
                '<button type="button" class="md-btn" data-ins="- " title="Список">• Список</button>' +
                '<button type="button" class="md-btn" data-ins="1. " title="Нумерованный список">1. Список</button>' +
                '<button type="button" class="md-btn" data-ins="> " title="Цитата">“ Цитата</button>' +
                '<button type="button" class="md-btn" id="a-insert-img" title="Вставить фото">' + ICONS.image + ' Фото</button>' +
                '<button type="button" class="md-btn" id="a-insert-link" title="Вставить ссылку">' + ICONS.link + ' Ссылка</button>' +
              '</div>' +

              '<div id="art-editor-container" style="display:flex;gap:12px">' +
                '<div style="flex:1;min-width:0">' +
                  LANGS.map(function(l){
                    var t = byLang[l] || {};
                    return '<textarea class="art-body md-textarea" data-lang="' + l + '" style="' + (l === "ru" ? '' : 'display:none;') + 'min-height:260px;font-family:monospace;font-size:13px;line-height:1.6" placeholder="Пишите статью здесь. Используйте Markdown для оформления заголовков (##, ###), списков и выделения.">' + esc(t.body || "") + '</textarea>';
                  }).join("") +
                '</div>' +
                '<div class="preview-box" id="art-prev-box" style="flex:1;min-width:0;display:none;margin-top:0;max-height:380px;overflow-y:auto"></div>' +
              '</div>' +
            '</div>' +

            '<!-- CARD 3: GOOGLE SERP PREVIEW -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-header">' +
                '<div class="editor-card-title">🔍 Google Поиск — Сниппет предпросмотра</div>' +
                '<span class="hint" id="serp-status">Оптимальная длина</span>' +
              '</div>' +
              '<div class="serp-box">' +
                '<div class="serp-url">' +
                  '<span>https://bententrade.uz</span> › blog › <span id="serp-slug-preview">' + esc(a.slug || "statya") + '</span>' +
                '</div>' +
                '<div class="serp-title" id="serp-title-preview">' + esc((byLang.ru && byLang.ru.title) || "Заголовок статьи") + ' — Блог Bententrade</div>' +
                '<div class="serp-desc" id="serp-desc-preview">' + esc((byLang.ru && byLang.ru.excerpt) || "Краткое описание публикации в поисковой выдаче Google…") + '</div>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--muted)">' +
                '<span>Заголовок: <b id="serp-title-cnt">0</b>/60 симв.</span>' +
                '<span>Описание: <b id="serp-desc-cnt">0</b>/160 симв.</span>' +
              '</div>' +
            '</div>' +

          '</div>' +

          '<!-- SIDEBAR RIGHT COLUMN -->' +
          '<div class="editor-side">' +

            '<!-- STATUS & URL -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-title">Статус и адрес (URL)</div>' +
              '<div class="field" style="margin-top:10px">' +
                '<label>Статус публикации</label>' +
                '<select id="a-status">' +
                  '<option value="published" ' + (a.status === "published" ? 'selected' : '') + '>Опубликовано (видно в блоге)</option>' +
                  '<option value="draft" ' + (a.status !== "published" ? 'selected' : '') + '>Черновик (скрыто)</option>' +
                '</select>' +
              '</div>' +
              '<div class="field">' +
                '<label>Слаг статьи (URL)</label>' +
                '<div style="display:flex;gap:6px">' +
                  '<input id="a-slug" value="' + esc(a.slug || "") + '" placeholder="kak-vybrat-rotang">' +
                  '<button type="button" class="btn ghost sm" id="a-gen-slug" title="Сформировать слаг из заголовка RU">⚡ Авто</button>' +
                '</div>' +
                '<div class="hint" id="a-full-url" style="margin-top:4px;word-break:break-all">/blog.html#' + esc(a.slug || "") + '</div>' +
              '</div>' +
            '</div>' +

            '<!-- COVER MEDIA -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-title">' + ICONS.image + ' Обложка публикации</div>' +
              '<div id="a-cover-drop" style="margin-top:10px;margin-bottom:10px;border-radius:8px;overflow:hidden;height:140px;background:var(--panel3);border:2px dashed var(--line);display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;transition:border-color .2s,background .2s" title="Перетащите изображение сюда или кликните">' +
                '<img id="a-cover-img" src="' + (coverUrl || "/assets/hero-rattan.png") + '" style="width:100%;height:100%;object-fit:cover;' + (coverUrl ? '' : 'opacity:0.4') + '">' +
                '<div id="a-cover-drop-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.45);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-size:12px;opacity:0;transition:opacity .2s;pointer-events:none">' +
                  ICONS.upload + '<span style="margin-top:4px;font-weight:600">Перетащите обложку</span>' +
                '</div>' +
              '</div>' +
              '<div class="field">' +
                '<label>URL или путь к файлу</label>' +
                '<input id="a-cover-input" value="' + esc(coverUrl) + '" placeholder="/media/articles/...">' +
              '</div>' +
              '<div style="display:flex;gap:6px">' +
                '<button type="button" class="btn ghost sm" id="a-pick-cover" style="flex:1">' + ICONS.plus + ' Медиатека</button>' +
                '<button type="button" class="btn ghost sm" id="a-upload-cover" style="flex:1">' + ICONS.upload + ' Загрузить</button>' +
                '<input type="file" id="a-cover-file" accept="image/*" style="display:none">' +
              '</div>' +
            '</div>' +

            '<!-- QUALITY CHECKLIST CARD -->' +
            '<div class="editor-card">' +
              '<div class="editor-card-title">✅ Чек-лист качества</div>' +
              '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;font-size:12.5px" id="a-checklist">' +
                '<div id="chk-title" style="display:flex;align-items:center;gap:6px;color:var(--muted)">○ Заголовок задан (30–60 симв.)</div>' +
                '<div id="chk-slug" style="display:flex;align-items:center;gap:6px;color:var(--muted)">○ Слаг (URL) статьи настроен</div>' +
                '<div id="chk-exc" style="display:flex;align-items:center;gap:6px;color:var(--muted)">○ Краткий анонс (до 160 симв.)</div>' +
                '<div id="chk-cover" style="display:flex;align-items:center;gap:6px;color:var(--muted)">○ Обложка статьи выбрана</div>' +
                '<div id="chk-len" style="display:flex;align-items:center;gap:6px;color:var(--muted)">○ Объем текста (> 60 слов)</div>' +
              '</div>' +
            '</div>' +

          '</div>' +
        '</div>' +

      '</div>' +
      '<div class="dlg-foot">' +
        (!isNew ? '<button class="btn danger sm" id="a-del">' + ICONS.trash + ' Удалить</button>' : '') +
        '<span class="kbd-hint" style="margin-right:auto;margin-left:8px"><kbd>Ctrl</kbd>+<kbd>S</kbd> сохранить &nbsp;·&nbsp; <kbd>Esc</kbd> закрыть</span>' +
        '<button class="btn ghost" id="a-cancel">Отмена</button>' +
        '<button class="btn" id="a-save">' + ICONS.check + ' ' + (isNew ? 'Опубликовать статью' : 'Сохранить изменения') + '</button>' +
      '</div>';

    document.body.appendChild(dlg);
    dlg.showModal();

    // Hotkeys: Ctrl+S and Esc
    dlg.addEventListener("keydown", function(e){
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        dlg.querySelector("#a-save").click();
      }
    });

    // Auto-suggest slug from Russian title
    var autoSlugAllowed = isNew && !dlg.querySelector("#a-slug").value;
    dlg.querySelector('.art-title[data-lang="ru"]').addEventListener("input", function(e){
      if (autoSlugAllowed && isNew) {
        var tSlug = translit(e.target.value);
        if (tSlug) {
          dlg.querySelector("#a-slug").value = tSlug;
          updateSerpPreview();
        }
      }
    });
    dlg.querySelector("#a-slug").addEventListener("input", function(){
      autoSlugAllowed = false;
    });

    // 1-click Auto-fill UZ and EN from RU
    dlg.querySelector("#a-fill-all-langs").onclick = function(){
      var ruT = dlg.querySelector('.art-title[data-lang="ru"]').value;
      var ruE = dlg.querySelector('.art-exc[data-lang="ru"]').value;
      var ruB = dlg.querySelector('.art-body[data-lang="ru"]').value;
      if (!ruT) { toast("Сначала заполните заголовок RU!", "err"); return; }
      ["uz", "en"].forEach(function(l){
        dlg.querySelector('.art-title[data-lang="' + l + '"]').value = ruT;
        dlg.querySelector('.art-exc[data-lang="' + l + '"]').value = ruE;
        dlg.querySelector('.art-body[data-lang="' + l + '"]').value = ruB;
      });
      toast("Все языки статьи заполнены из RU ✓");
      triggerArtAutosave();
    };

    // 1. Language tabs
    var currentActiveLang = "ru";
    dlg.querySelector("#a-lang-tabs").addEventListener("click", function(e){
      var b = e.target.closest("button[data-atab]");
      if (!b) return;
      var lang = b.getAttribute("data-atab");
      currentActiveLang = lang;
      dlg.querySelectorAll("#a-lang-tabs button").forEach(function(x){ x.classList.toggle("active", x === b); });
      dlg.querySelectorAll(".art-pane").forEach(function(p){ p.style.display = p.getAttribute("data-al") === lang ? "" : "none"; });
      dlg.querySelectorAll(".art-body").forEach(function(p){ p.style.display = p.getAttribute("data-lang") === lang ? "" : "none"; });

      if (lang === "uz" || lang === "en") {
        var ruT = dlg.querySelector('.art-title[data-lang="ru"]').value || "—";
        var ruE = dlg.querySelector('.art-exc[data-lang="ru"]').value || "—";
        var rTitle = dlg.querySelector("#art-ref-title-" + lang); if (rTitle) rTitle.textContent = ruT;
        var rExc = dlg.querySelector("#art-ref-exc-" + lang); if (rExc) rExc.textContent = ruE;
      }
      updateReadingMeter();
      updateSerpPreview();
    });

    dlg.querySelectorAll("[data-art-copy]").forEach(function(btn){
      btn.onclick = function(){
        var targetLang = btn.getAttribute("data-art-copy");
        var ruT = dlg.querySelector('.art-title[data-lang="ru"]').value;
        var ruE = dlg.querySelector('.art-exc[data-lang="ru"]').value;
        var ruB = dlg.querySelector('.art-body[data-lang="ru"]').value;
        dlg.querySelector('.art-title[data-lang="' + targetLang + '"]').value = ruT;
        dlg.querySelector('.art-exc[data-lang="' + targetLang + '"]').value = ruE;
        dlg.querySelector('.art-body[data-lang="' + targetLang + '"]').value = ruB;
        toast("Текст и заголовки скопированы в " + targetLang.toUpperCase() + " ✓");
        triggerArtAutosave();
      };
    });

    // 2. Editor mode switcher (Edit, Preview, Split)
    var activeMode = "edit";
    var edContainer = dlg.querySelector("#art-editor-container");
    var prevBox = dlg.querySelector("#art-prev-box");
    var toolbar = dlg.querySelector("#a-toolbar");

    dlg.querySelectorAll("[data-art-mode]").forEach(function(btn){
      btn.onclick = function(){
        activeMode = btn.getAttribute("data-art-mode");
        dlg.querySelectorAll("[data-art-mode]").forEach(function(x){ x.classList.toggle("active-mode", x === btn); });

        var curTa = dlg.querySelector('.art-body[data-lang="' + currentActiveLang + '"]');
        if (activeMode === "prev") {
          toolbar.style.display = "none";
          curTa.style.display = "none";
          prevBox.style.display = "block";
          prevBox.innerHTML = renderSimpleMarkdown(curTa.value);
        } else if (activeMode === "split") {
          toolbar.style.display = "flex";
          curTa.style.display = "block";
          prevBox.style.display = "block";
          prevBox.innerHTML = renderSimpleMarkdown(curTa.value);
        } else {
          toolbar.style.display = "flex";
          curTa.style.display = "block";
          prevBox.style.display = "none";
        }
      };
    });

    // 3. Formatting toolbar
    toolbar.addEventListener("click", function(e){
      var b = e.target.closest("[data-ins]");
      if (!b) return;
      var curTa = dlg.querySelector('.art-body[data-lang="' + currentActiveLang + '"]');
      var tag = b.getAttribute("data-ins");
      var start = curTa.selectionStart;
      var end = curTa.selectionEnd;
      var sel = curTa.value.substring(start, end);
      var rep = tag.endsWith(" ") ? tag + sel : tag + (sel || "текст") + tag;
      curTa.setRangeText(rep, start, end, "end");
      curTa.focus();
      if (activeMode !== "edit") prevBox.innerHTML = renderSimpleMarkdown(curTa.value);
      updateReadingMeter();
      triggerArtAutosave();
    });

    // Insert Image
    dlg.querySelector("#a-insert-img").onclick = function(){
      openMediaPicker(function(url){
        var curTa = dlg.querySelector('.art-body[data-lang="' + currentActiveLang + '"]');
        var start = curTa.selectionStart;
        var end = curTa.selectionEnd;
        var sel = curTa.value.substring(start, end) || "Фотография Bententrade";
        var snippet = "\n\n![" + sel + "](" + url + ")\n\n";
        curTa.setRangeText(snippet, start, end, "end");
        curTa.focus();
        if (activeMode !== "edit") prevBox.innerHTML = renderSimpleMarkdown(curTa.value);
        updateReadingMeter();
        triggerArtAutosave();
        toast("Фото вставлено в текст статьи ✓");
      });
    };

    // Insert Link
    dlg.querySelector("#a-insert-link").onclick = function(){
      var curTa = dlg.querySelector('.art-body[data-lang="' + currentActiveLang + '"]');
      var start = curTa.selectionStart;
      var end = curTa.selectionEnd;
      var sel = curTa.value.substring(start, end) || "ссылка";
      var url = prompt("Введите адрес ссылки (URL):", "https://bententrade.uz");
      if (url) {
        var snippet = "[" + sel + "](" + url + ")";
        curTa.setRangeText(snippet, start, end, "end");
        curTa.focus();
        if (activeMode !== "edit") prevBox.innerHTML = renderSimpleMarkdown(curTa.value);
        triggerArtAutosave();
      }
    };

    // 4. Reading meter and live updates
    function updateReadingMeter(){
      var curTa = dlg.querySelector('.art-body[data-lang="' + currentActiveLang + '"]');
      var text = curTa.value.trim();
      var words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      var mins = Math.max(1, Math.ceil(words / 150));
      dlg.querySelector("#art-word-count").textContent = words + " слов";
      dlg.querySelector("#art-read-time").textContent = "~" + mins + " мин чтения";

      if (activeMode === "split" || activeMode === "prev") {
        prevBox.innerHTML = renderSimpleMarkdown(text);
      }
      updateChecklist();
    }

    dlg.querySelectorAll(".art-body").forEach(function(ta){
      ta.oninput = function(){
        updateReadingMeter();
        triggerArtAutosave();
      };
      ta.ondragover = function(e){
        if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files")) {
          e.preventDefault();
          ta.style.borderColor = "var(--primary)";
          ta.style.boxShadow = "0 0 0 2px rgba(184, 115, 51, 0.2)";
        }
      };
      ta.ondragleave = function(){
        ta.style.borderColor = "";
        ta.style.boxShadow = "";
      };
      ta.ondrop = async function(e){
        ta.style.borderColor = "";
        ta.style.boxShadow = "";
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          var file = e.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            e.preventDefault();
            var fd = new FormData();
            fd.append("file", file);
            if (id) fd.append("article_id", id);
            toast("Загрузка изображения в статью…");
            try {
              var up = await api("/api/admin/media", { method: "POST", form: fd });
              var imgUrl = up.url || ("/media/" + up.key);
              var altText = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") || "Изображение";
              var tag = "\n\n![" + altText + "](" + imgUrl + ")\n\n";

              var start = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
              var end = ta.selectionEnd != null ? ta.selectionEnd : ta.value.length;
              ta.setRangeText(tag, start, end, "end");
              ta.focus();
              if (activeMode !== "edit") prevBox.innerHTML = renderSimpleMarkdown(ta.value);
              updateReadingMeter();
              triggerArtAutosave();
              toast("Изображение загружено и вставлено в статью ✓");
            } catch(err){
              toast("Ошибка загрузки: " + err.message, "err");
            }
          }
        }
      };
    });

    // 5. SERP Preview & Slug Generation
    function updateSerpPreview(){
      var slug = dlg.querySelector("#a-slug").value.trim() || "statya";
      var title = dlg.querySelector('.art-title[data-lang="ru"]').value.trim() || "Заголовок статьи";
      var exc = dlg.querySelector('.art-exc[data-lang="ru"]').value.trim() || "Краткое описание статьи…";

      dlg.querySelector("#serp-slug-preview").textContent = slug;
      dlg.querySelector("#serp-title-preview").textContent = title + " — Блог Bententrade";
      dlg.querySelector("#serp-desc-preview").textContent = exc;

      var tLen = title.length;
      var eLen = exc.length;
      var tCntEl = dlg.querySelector("#serp-title-cnt");
      var eCntEl = dlg.querySelector("#serp-desc-cnt");
      tCntEl.textContent = tLen;
      eCntEl.textContent = eLen;

      tCntEl.style.color = (tLen > 60) ? "var(--err)" : (tLen < 20 ? "var(--warn)" : "var(--ok)");
      eCntEl.style.color = (eLen > 160) ? "var(--err)" : (eLen < 80 ? "var(--warn)" : "var(--ok)");

      var excCntEl = dlg.querySelector("#cnt-exc-ru");
      if (excCntEl) {
        excCntEl.textContent = eLen + " / 160";
        excCntEl.className = "char-counter " + (eLen > 160 ? "err" : (eLen > 140 ? "warn" : ""));
      }

      dlg.querySelector("#a-full-url").textContent = "/blog.html#" + slug;
      updateChecklist();
    }

    dlg.querySelector("#a-slug").oninput = function(){ updateSerpPreview(); triggerArtAutosave(); };
    dlg.querySelector('.art-title[data-lang="ru"]').oninput = function(){ updateSerpPreview(); triggerArtAutosave(); };
    dlg.querySelector('.art-exc[data-lang="ru"]').oninput = function(){ updateSerpPreview(); triggerArtAutosave(); };

    // Auto Slug
    dlg.querySelector("#a-gen-slug").onclick = function(){
      var ruT = dlg.querySelector('.art-title[data-lang="ru"]').value.trim();
      if (!ruT) { toast("Сначала введите заголовок статьи RU!", "err"); return; }
      dlg.querySelector("#a-slug").value = translit(ruT);
      updateSerpPreview();
      triggerArtAutosave();
      toast("Слаг сформирован: " + dlg.querySelector("#a-slug").value);
    };

    // 6. Cover Media Picker / Upload
    var coverInp = dlg.querySelector("#a-cover-input");
    var coverImg = dlg.querySelector("#a-cover-img");

    function updateCoverImg(url){
      coverInp.value = url;
      coverImg.src = url || "/assets/hero-rattan.png";
      coverImg.style.opacity = url ? "1" : "0.4";
      updateChecklist();
      triggerArtAutosave();
    }
    coverInp.oninput = function(){ updateCoverImg(coverInp.value.trim()); };

    dlg.querySelector("#a-pick-cover").onclick = function(){
      openMediaPicker(function(url){
        updateCoverImg(url);
        toast("Обложка статьи выбрана ✓");
      });
    };

    var cFile = dlg.querySelector("#a-cover-file");
    dlg.querySelector("#a-upload-cover").onclick = function(){ cFile.click(); };

    var cDrop = dlg.querySelector("#a-cover-drop");
    var cOverlay = dlg.querySelector("#a-cover-drop-overlay");

    async function uploadCoverFile(file){
      if (!file || !file.type.startsWith("image/")) {
        toast("Пожалуйста, выберите файл изображения", "err");
        return;
      }
      var fd = new FormData();
      fd.append("file", file);
      if (id) fd.append("article_id", id);
      toast("Загрузка обложки…");
      try {
        var up = await api("/api/admin/media", { method: "POST", form: fd });
        updateCoverImg(up.url || ("/media/" + up.key));
        toast("Обложка успешно загружена ✓");
      } catch(e){ toast("Ошибка: " + e.message, "err"); }
    }

    if (cDrop) {
      cDrop.onclick = function(){ cFile.click(); };
      cDrop.ondragover = function(e){
        e.preventDefault();
        cDrop.style.borderColor = "var(--primary)";
        if (cOverlay) cOverlay.style.opacity = "1";
      };
      cDrop.ondragleave = function(){
        cDrop.style.borderColor = "var(--line)";
        if (cOverlay) cOverlay.style.opacity = "0";
      };
      cDrop.ondrop = async function(e){
        e.preventDefault();
        cDrop.style.borderColor = "var(--line)";
        if (cOverlay) cOverlay.style.opacity = "0";
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          await uploadCoverFile(e.dataTransfer.files[0]);
        }
      };
    }

    cFile.onchange = async function(){
      if (cFile.files && cFile.files[0]) {
        await uploadCoverFile(cFile.files[0]);
      }
    };

    // 7. Checklist verification
    function updateChecklist(){
      var title = dlg.querySelector('.art-title[data-lang="ru"]').value.trim();
      var slug = dlg.querySelector("#a-slug").value.trim();
      var exc = dlg.querySelector('.art-exc[data-lang="ru"]').value.trim();
      var cov = coverInp.value.trim();
      var text = dlg.querySelector('.art-body[data-lang="ru"]').value.trim();
      var words = text ? text.split(/\s+/).filter(Boolean).length : 0;

      function setChk(id, ok, label){
        var el = dlg.querySelector("#" + id);
        if (!el) return;
        el.innerHTML = (ok ? '<span style="color:var(--ok)">✓</span> ' : '<span style="color:var(--muted)">○</span> ') + label;
        el.style.color = ok ? "var(--ink)" : "var(--muted)";
      }

      setChk("chk-title", title.length >= 10, "Заголовок задан (" + title.length + " симв.)");
      setChk("chk-slug", slug.length >= 3, "Слаг (URL) статьи настроен");
      setChk("chk-exc", exc.length >= 30, "Краткий анонс (" + exc.length + " симв.)");
      setChk("chk-cover", !!cov, "Обложка статьи выбрана");
      setChk("chk-len", words >= 50, "Объем текста (" + words + " слов)");
    }
    updateSerpPreview();
    updateReadingMeter();

    // 8. Autosave
    var artAutoTimer = null;
    var aAutosavePill = dlg.querySelector("#a-autosave");
    function triggerArtAutosave(){
      aAutosavePill.textContent = "Сохранение…";
      aAutosavePill.classList.remove("saved");
      clearTimeout(artAutoTimer);
      artAutoTimer = setTimeout(function(){
        try {
          var draftData = {
            slug: dlg.querySelector("#a-slug").value.trim(),
            status: dlg.querySelector("#a-status").value,
            cover_media: coverInp.value.trim(),
            titles: {
              ru: dlg.querySelector('.art-title[data-lang="ru"]').value,
              uz: dlg.querySelector('.art-title[data-lang="uz"]').value,
              en: dlg.querySelector('.art-title[data-lang="en"]').value
            },
            excerpts: {
              ru: dlg.querySelector('.art-exc[data-lang="ru"]').value,
              uz: dlg.querySelector('.art-exc[data-lang="uz"]').value,
              en: dlg.querySelector('.art-exc[data-lang="en"]').value
            },
            bodies: {
              ru: dlg.querySelector('.art-body[data-lang="ru"]').value,
              uz: dlg.querySelector('.art-body[data-lang="uz"]').value,
              en: dlg.querySelector('.art-body[data-lang="en"]').value
            },
            _savedAt: Date.now()
          };
          localStorage.setItem(draftKey, JSON.stringify(draftData));
          aAutosavePill.textContent = "Черновик сохранён";
          aAutosavePill.classList.add("saved");
        } catch(e){}
      }, 500);
    }

    // Restore draft
    if (savedDraft) {
      var rBtn = dlg.querySelector("#a-restore-draft");
      var dBtn = dlg.querySelector("#a-discard-draft");
      if (rBtn) {
        rBtn.onclick = function(){
          if (savedDraft.slug) dlg.querySelector("#a-slug").value = savedDraft.slug;
          if (savedDraft.status) dlg.querySelector("#a-status").value = savedDraft.status;
          if (savedDraft.cover_media) updateCoverImg(savedDraft.cover_media);
          LANGS.forEach(function(l){
            if (savedDraft.titles && savedDraft.titles[l]) dlg.querySelector('.art-title[data-lang="' + l + '"]').value = savedDraft.titles[l];
            if (savedDraft.excerpts && savedDraft.excerpts[l]) dlg.querySelector('.art-exc[data-lang="' + l + '"]').value = savedDraft.excerpts[l];
            if (savedDraft.bodies && savedDraft.bodies[l]) dlg.querySelector('.art-body[data-lang="' + l + '"]').value = savedDraft.bodies[l];
          });
          updateSerpPreview();
          updateReadingMeter();
          dlg.querySelector("#a-draft-bar").remove();
          toast("Черновик статьи восстановлен ✓");
        };
      }
      if (dBtn) {
        dBtn.onclick = function(){
          try { localStorage.removeItem(draftKey); } catch(e){}
          dlg.querySelector("#a-draft-bar").remove();
          toast("Черновик отклонён");
        };
      }
    }

    // Close & Cancel
    dlg.querySelector("#a-close").onclick = function(){ dlg.close(); dlg.remove(); };
    dlg.querySelector("#a-cancel").onclick = function(){ dlg.close(); dlg.remove(); };

    // Delete article
    var delBtn = dlg.querySelector("#a-del");
    if (delBtn) {
      delBtn.onclick = async function(){
        var ok = await confirmModal("Удаление статьи", "Удалить эту статью навсегда?", "Удалить", true);
        if (!ok) return;
        try {
          await api("/api/admin/articles/" + id, { method: "DELETE" });
          try { localStorage.removeItem(draftKey); } catch(e){}
          dlg.close(); dlg.remove();
          toast("Статья удалена");
          var res = await api("/api/admin/articles");
          allArticles = res.articles || [];
          renderArticleTable();
        } catch(err){ toast("Ошибка: " + err.message, "err"); }
      };
    }

    // 9. Save article
    dlg.querySelector("#a-save").onclick = async function(){
      var slug = dlg.querySelector("#a-slug").value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      if (!slug) {
        toast("Введите слаг статьи (URL)!", "err");
        dlg.querySelector("#a-slug").focus();
        return;
      }

      var i18n = {};
      LANGS.forEach(function(l){
        i18n[l] = {
          title: dlg.querySelector('.art-title[data-lang="' + l + '"]').value.trim(),
          excerpt: dlg.querySelector('.art-exc[data-lang="' + l + '"]').value.trim(),
          body: dlg.querySelector('.art-body[data-lang="' + l + '"]').value.trim()
        };
      });

      var payload = {
        slug: slug,
        status: dlg.querySelector("#a-status").value,
        cover_media: coverInp.value.trim() || null,
        i18n: i18n
      };

      try {
        if (isNew) {
          await api("/api/admin/articles", { method: "POST", body: payload });
          toast("Статья «" + (i18n.ru.title || slug) + "» успешно создана! ✓");
        } else {
          await api("/api/admin/articles/" + id, { method: "PUT", body: payload });
          toast("Статья «" + (i18n.ru.title || slug) + "» успешно обновлена! ✓");
        }
        try { localStorage.removeItem(draftKey); } catch(e){}
        dlg.close(); dlg.remove();
        var res = await api("/api/admin/articles");
        allArticles = res.articles || [];
        renderArticleTable();
      } catch(err) {
        toast("Ошибка сохранения: " + err.message, "err");
      }
    };
  }
  /* ------------------------------ Media ------------------------------ */
  async function secMedia(){
    var main = document.getElementById("content");
    main.innerHTML =
      '<div class="toolbar">' +
        '<h3 style="font-size:16px;font-weight:700">Загрузка файлов</h3>' +
      '</div>' +
      '<div class="dropzone" id="m-global-drop">' +
        ICONS.upload +
        '<div style="font-weight:700;font-size:15px;margin-bottom:6px">Перетащите изображения сюда для загрузки</div>' +
        '<div class="hint">Поддерживаются JPEG, PNG, WebP, AVIF до 8 МБ</div>' +
        '<div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<input id="m-global-pid" placeholder="ID товара (например, p1)" style="max-width:200px">' +
          '<button class="btn sm" id="m-global-btn">' + ICONS.plus + ' Выбрать файл на диске</button>' +
        '</div>' +
        '<input type="file" id="m-global-file" accept="image/*" style="display:none">' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
        '<h3 style="font-size:16px;font-weight:700">Все файлы медиатеки</h3>' +
        '<span class="hint" id="m-count"></span>' +
      '</div>' +
      '<div id="m-grid-wrap" class="media-grid"><div style="padding:40px;color:var(--muted)">Загрузка медиа…</div></div>';

    var drop = document.getElementById("m-global-drop");
    var finp = document.getElementById("m-global-file");
    var btn = document.getElementById("m-global-btn");

    btn.onclick = function(e){ e.stopPropagation(); finp.click(); };
    drop.onclick = function(){ finp.click(); };
    drop.ondragover = function(e){ e.preventDefault(); drop.classList.add("dragover"); };
    drop.ondragleave = function(){ drop.classList.remove("dragover"); };
    drop.ondrop = function(e){
      e.preventDefault();
      drop.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
    };
    finp.onchange = function(){
      if (finp.files && finp.files[0]) uploadFile(finp.files[0]);
    };

    async function uploadFile(file){
      var pid = document.getElementById("m-global-pid").value.trim();
      var fd = new FormData();
      fd.append("file", file);
      if (pid) fd.append("product_id", pid);
      toast("Загрузка файла…");
      try {
        await api("/api/admin/media", { method: "POST", form: fd });
        toast("Файл загружен успешно! ✓");
        loadMediaList();
      } catch(err) {
        toast("Ошибка загрузки: " + err.message, "err");
      }
    }

    await loadMediaList();
  }

  async function loadMediaList(){
    var wrap = document.getElementById("m-grid-wrap");
    var countEl = document.getElementById("m-count");
    if (!wrap) return;
    var res = await api("/api/admin/media");
    var media = res.media || [];
    if (countEl) countEl.textContent = "Всего файлов: " + media.length;

    if (!media.length) {
      wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);grid-column:1/-1">Медиатека пуста. Загрузите первое изображение выше.</div>';
      return;
    }

    wrap.innerHTML = media.map(function(m){
      var url = '/media/' + esc(m.key);
      return '<div class="media-card">' +
        '<img src="' + url + '" loading="lazy" onerror="this.src=\'/assets/favicon.png\'">' +
        '<div class="media-meta">' +
          '<div style="font-weight:600;truncate:ellipsis;white-space:nowrap;overflow:hidden">' + (m.product_id ? 'Товар: ' + esc(m.product_id) : 'Файл') + '</div>' +
          '<div style="display:flex;gap:4px;margin-top:6px">' +
            '<button class="btn ghost sm" style="flex:1;padding:4px" data-copy-url="' + url + '" title="Скопировать прямую ссылку">Ссылка</button>' +
            '<button class="btn ghost sm" style="padding:4px 8px;font-size:11px;font-weight:700" data-copy-md="![' + esc(m.product_id || (m.article_id ? 'Статья #' + m.article_id : 'bententrade')) + '](' + url + ')" title="Скопировать Markdown тег">MD</button>' +
            '<button class="btn ghost sm danger icon-only" data-del-m="' + m.id + '" title="Удалить">✕</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");

    wrap.onclick = async function(e){
      var cpMd = e.target.closest("[data-copy-md]");
      if (cpMd) {
        var mdTag = cpMd.getAttribute("data-copy-md");
        try {
          await navigator.clipboard.writeText(mdTag);
          toast("Markdown скопирован: " + mdTag);
        } catch(x) {
          toast("Markdown: " + mdTag);
        }
        return;
      }

      var cp = e.target.closest("[data-copy-url]");
      if (cp) {
        var u = cp.getAttribute("data-copy-url");
        try {
          await navigator.clipboard.writeText(location.origin + u);
          toast("Ссылка скопирована: " + u);
        } catch(x) {
          toast("Ссылка: " + u);
        }
        return;
      }

      var dm = e.target.closest("[data-del-m]");
      if (dm) {
        var mid = dm.getAttribute("data-del-m");
        var ok = await confirmModal("Удалить файл?", "Этот файл будет удалён с сервера.", "Удалить", true);
        if (ok) {
          try {
            await api("/api/admin/media/" + mid, { method: "DELETE" });
            toast("Файл удалён");
            loadMediaList();
          } catch(err) {
            toast("Ошибка: " + err.message, "err");
          }
        }
      }
    };
  }

  /* ------------------------------ Orders ------------------------------ */
  var allOrders = [];
  var orderFilter = "all";
  var orderSearch = "";
  var ORDER_STATUSES = ["new", "processing", "shipped", "delivered", "cancelled"];
  var ORDER_STATUS_LABELS = {
    new: "Новый",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменён"
  };

  async function secOrders(){
    var main = document.getElementById("content");
    main.innerHTML =
      '<div class="toolbar">' +
        '<div class="search-box">' +
          ICONS.search +
          '<input type="text" id="o-search" placeholder="Поиск по имени, телефону или номеру заказа…" value="' + esc(orderSearch) + '">' +
        '</div>' +
        '<div class="filters-group">' +
          '<span class="filter-chip ' + (orderFilter === "all" ? 'active' : '') + '" data-ofilt="all">Все заказы</span>' +
          ORDER_STATUSES.map(function(s){
            return '<span class="filter-chip ' + (orderFilter === s ? 'active' : '') + '" data-ofilt="' + s + '">' + ORDER_STATUS_LABELS[s] + '</span>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="table-card" id="o-table-wrap"><div style="padding:40px;text-align:center;color:var(--muted)">Загрузка заказов…</div></div>';

    document.getElementById("o-search").addEventListener("input", function(e){
      orderSearch = e.target.value.toLowerCase().trim();
      renderOrderTable();
    });

    document.querySelectorAll("[data-ofilt]").forEach(function(el){
      el.addEventListener("click", function(){
        orderFilter = el.getAttribute("data-ofilt");
        document.querySelectorAll("[data-ofilt]").forEach(function(x){ x.classList.toggle("active", x === el); });
        renderOrderTable();
      });
    });

    var res = await api("/api/admin/orders");
    allOrders = res.orders || [];
    renderOrderTable();
  }

  function renderOrderTable(){
    var wrap = document.getElementById("o-table-wrap");
    if (!wrap) return;

    var filtered = allOrders.filter(function(o){
      var matchSt = (orderFilter === "all" || o.status === orderFilter);
      var matchQ = (!orderSearch ||
        (o.public_id && o.public_id.toLowerCase().includes(orderSearch)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(orderSearch)) ||
        (o.customer_phone && o.customer_phone.toLowerCase().includes(orderSearch))
      );
      return matchSt && matchQ;
    });

    if (!filtered.length) {
      wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Заказов не найдено.</div>';
      return;
    }

    wrap.innerHTML =
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th>Номер</th>' +
            '<th>Клиент</th>' +
            '<th>Сумма</th>' +
            '<th>Статус заказа</th>' +
            '<th>Дата</th>' +
            '<th style="text-align:right">Действия</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          filtered.map(function(o){
            return '<tr data-ord-id="' + o.id + '">' +
              '<td><span style="font-weight:700;color:var(--copper)">' + esc(o.public_id) + '</span>' + (o.delivery_method === "quick_order" ? '<span class="pill" style="font-size:10.5px;padding:1px 6px;background:rgba(184,115,51,0.15);color:var(--copper);font-weight:700;margin-left:6px">⚡ 1 клик</span>' : '') + '</td>' +
              '<td>' +
                '<div style="font-weight:600">' + esc(o.customer_name || "—") + '</div>' +
                '<div class="hint">' + esc(o.customer_phone || "") + (o.customer_email ? ' · ' + esc(o.customer_email) : '') + '</div>' +
              '</td>' +
              '<td><span style="font-weight:700;font-size:15px">' + fmtMoney(o.total, o.currency) + '</span></td>' +
              '<td>' +
                '<select data-st-change="' + o.id + '" style="padding:5px 8px;font-size:12.5px;max-width:140px">' +
                  ORDER_STATUSES.map(function(s){
                    return '<option value="' + s + '" ' + (o.status === s ? 'selected' : '') + '>' + ORDER_STATUS_LABELS[s] + '</option>';
                  }).join("") +
                '</select>' +
              '</td>' +
              '<td><small class="hint">' + esc((o.created_at || "").slice(0, 16)) + '</small></td>' +
              '<td style="text-align:right">' +
                '<button class="btn ghost sm" data-open-order="' + o.id + '">Подробнее</button>' +
              '</td>' +
            '</tr>';
          }).join("") +
        '</tbody>' +
      '</table>';

    wrap.onchange = async function(e){
      var sel = e.target.closest("[data-st-change]");
      if (sel) {
        var oid = sel.getAttribute("data-st-change");
        var nStatus = sel.value;
        try {
          await api("/api/admin/orders/" + oid + "/status", { method: "PUT", body: { status: nStatus } });
          var ord = allOrders.find(function(x){ return String(x.id) === String(oid); });
          if (ord) ord.status = nStatus;
          toast("Статус заказа обновлён на «" + ORDER_STATUS_LABELS[nStatus] + "» ✓");
        } catch(err) {
          toast("Ошибка: " + err.message, "err");
        }
      }
    };

    wrap.onclick = function(e){
      var btn = e.target.closest("[data-open-order]");
      if (btn) viewOrder(btn.getAttribute("data-open-order"));
    };
  }

  async function viewOrder(id){
    var d = await api("/api/admin/orders/" + id);
    var o = d.order || {};
    var items = d.items || [];

    var cleanPhone = String(o.customer_phone || "").replace(/[^0-9+]/g, "");
    var waUrl = cleanPhone ? "https://wa.me/" + cleanPhone.replace("+", "") : "";

    function formatOpts(optStr){
      if (!optStr) return "";
      try {
        var obj = typeof optStr === "string" ? JSON.parse(optStr) : optStr;
        if (obj && typeof obj === "object") {
          var pairs = Object.entries(obj).map(function(pair){
            var k = pair[0], v = pair[1];
            var label = k === "finish" ? "Цвет" : (k === "size" ? "Размер" : k);
            return label + ": " + v;
          });
          if (pairs.length) return pairs.join(", ");
        }
      } catch(e){}
      return String(optStr);
    }

    var dlg = document.createElement("dialog");
    dlg.innerHTML =
      '<div class="dlg-header">' +
        '<h2>Заказ ' + esc(o.public_id) + '</h2>' +
        '<button class="dlg-close" id="o-close">' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="dlg-body">' +
        '<div style="background:var(--panel2);border:1px solid var(--line);border-radius:var(--radius);padding:16px;margin-bottom:18px">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
            '<div style="font-size:16px;font-weight:700">' + esc(o.customer_name || "Клиент") + '</div>' +
            '<div style="display:flex;gap:8px">' +
              (waUrl ? '<a href="' + waUrl + '" target="_blank" class="btn sm" style="background:#25D366;color:#fff">' + ICONS.whatsapp + ' WhatsApp</a>' : '') +
              (o.customer_phone ? '<a href="tel:' + esc(o.customer_phone) + '" class="btn ghost sm">' + ICONS.phone + ' Позвонить</a>' : '') +
            '</div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;color:var(--ink-soft)">' +
            '<div><b>Телефон:</b> ' + esc(o.customer_phone || "—") + '</div>' +
            '<div><b>Email:</b> ' + esc(o.customer_email || "—") + '</div>' +
            '<div><b>Способ получения:</b> <span class="pill" style="vertical-align:middle">' + (o.delivery_method === "pickup" ? "Самовывоз" : (o.delivery_method === "quick_order" ? "⚡ Быстрый заказ" : "Доставка курьером")) + '</span></div>' +
            '<div><b>Оплата:</b> <span class="pill" style="vertical-align:middle;background:var(--copper-bg);color:var(--copper);font-weight:600">' + (o.payment_method === "click_payme" ? "Click / Payme" : (o.payment_method === "card_or_invoice" ? "Перевод / Счёт" : "При получении")) + '</span></div>' +
            '<div><b>Валюта:</b> ' + esc(o.currency || "сум") + '</div>' +
            '<div><b>Статус:</b> <span class="pill" style="vertical-align:middle">' + (ORDER_STATUS_LABELS[o.status] || o.status) + '</span></div>' +
            '<div style="grid-column:1/-1"><b>Адрес доставки:</b> ' + esc(o.address || (o.delivery_method === "pickup" ? "Самовывоз (склад Ташкент)" : (o.delivery_method === "quick_order" ? "Уточнить у клиента" : "Не указан"))) + '</div>' +
            (o.comment ? '<div style="grid-column:1/-1"><b>Комментарий:</b> ' + esc(o.comment) + '</div>' : '') +
          '</div>' +
        '</div>' +

        '<h4 style="margin-bottom:10px;font-size:14px">Состав заказа</h4>' +
        '<div class="table-card" style="margin-bottom:16px">' +
          '<table>' +
            '<thead><tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>' +
            '<tbody>' +
              items.map(function(it){
                return '<tr>' +
                  '<td><b>' + esc(it.name) + '</b>' + (it.options ? '<br><small class="hint" style="color:var(--copper);font-weight:600">' + esc(formatOpts(it.options)) + '</small>' : '') + '</td>' +
                  '<td>' + it.qty + ' шт.</td>' +
                  '<td>' + fmtMoney(it.unit_price, o.currency) + '</td>' +
                  '<td><b>' + fmtMoney(it.unit_price * it.qty, o.currency) + '</b></td>' +
                '</tr>';
              }).join("") +
            '</tbody>' +
          '</table>' +
        '</div>' +

        '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--panel2);border-radius:var(--radius)">' +
          '<div><b>Итого к оплате:</b></div>' +
          '<div style="font-size:20px;font-weight:800;color:var(--copper)">' + fmtMoney(o.total, o.currency) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dlg-foot">' +
        '<button class="btn ghost" id="o-dlg-close">Закрыть</button>' +
      '</div>';

    document.body.appendChild(dlg);
    dlg.showModal();
    dlg.querySelector("#o-close").onclick = function(){ dlg.close(); dlg.remove(); };
    dlg.querySelector("#o-dlg-close").onclick = function(){ dlg.close(); dlg.remove(); };
  }

  /* ------------------------------ Requests --------------------------- */
  async function secRequests(){
    var main = document.getElementById("content");
    main.innerHTML =
      '<div class="toolbar"><h3 style="font-size:16px;font-weight:700">Заявки на консультацию и подбор</h3></div>' +
      '<div class="table-card" id="r-table-wrap"><div style="padding:40px;color:var(--muted)">Загрузка заявок…</div></div>';

    var res = await api("/api/admin/requests");
    var requests = res.requests || [];
    var wrap = document.getElementById("r-table-wrap");

    if (!requests.length) {
      wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Заявок пока нет. Заполненные формы на сайте отобразятся здесь.</div>';
      return;
    }

    wrap.innerHTML =
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th>Клиент</th>' +
            '<th>Контакты</th>' +
            '<th>Сообщение / Вопрос</th>' +
            '<th>Статус</th>' +
            '<th>Дата</th>' +
            '<th style="text-align:right">Связь</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          requests.map(function(r){
            var clean = String(r.phone || "").replace(/[^0-9+]/g, "");
            var wa = clean ? "https://wa.me/" + clean.replace("+", "") : "";
            return '<tr data-req-id="' + r.id + '">' +
              '<td><b>' + esc(r.name) + '</b></td>' +
              '<td>' +
                (r.phone ? '<div>' + esc(r.phone) + '</div>' : '') +
                (r.email ? '<div class="hint">' + esc(r.email) + '</div>' : '') +
              '</td>' +
              '<td><div style="max-width:320px;line-height:1.4">' + esc(r.message || "—") + '</div></td>' +
              '<td>' +
                '<select data-r-status="' + r.id + '" style="padding:4px 8px;font-size:12px">' +
                  '<option value="new" ' + (r.status === "new" ? 'selected' : '') + '>Новая</option>' +
                  '<option value="in_progress" ' + (r.status === "in_progress" ? 'selected' : '') + '>В работе</option>' +
                  '<option value="done" ' + (r.status === "done" ? 'selected' : '') + '>Обработана</option>' +
                '</select>' +
              '</td>' +
              '<td><small class="hint">' + esc((r.created_at || "").slice(0, 16)) + '</small></td>' +
              '<td style="text-align:right">' +
                '<div style="display:flex;gap:6px;justify-content:flex-end">' +
                  (wa ? '<a href="' + wa + '" target="_blank" class="btn sm" style="background:#25D366;color:#fff;padding:6px 10px" title="WhatsApp">' + ICONS.whatsapp + '</a>' : '') +
                  (r.phone ? '<a href="tel:' + esc(r.phone) + '" class="btn ghost sm" style="padding:6px 10px" title="Позвонить">' + ICONS.phone + '</a>' : '') +
                '</div>' +
              '</td>' +
            '</tr>';
          }).join("") +
        '</tbody>' +
      '</table>';

    wrap.onchange = async function(e){
      var sel = e.target.closest("[data-r-status]");
      if (sel) {
        var rid = sel.getAttribute("data-r-status");
        try {
          await api("/api/admin/requests/" + rid + "/status", { method: "PUT", body: { status: sel.value } });
          toast("Статус заявки обновлён ✓");
        } catch(err) {
          toast("Ошибка: " + err.message, "err");
        }
      }
    };
  }

  /* ------------------------------ Reviews ------------------------------ */
  var allReviews = [];
  var reviewFilter = "all";
  var reviewSearch = "";

  async function secReviews(){
    var main = document.getElementById("content");
    main.innerHTML =
      '<div class="toolbar">' +
        '<div class="search-box">' +
          ICONS.search +
          '<input type="text" id="rev-admin-search" placeholder="Поиск по автору, тексту или товару…" value="' + esc(reviewSearch) + '">' +
        '</div>' +
        '<div class="filters-group">' +
          '<span class="filter-chip ' + (reviewFilter === "all" ? 'active' : '') + '" data-rfilt="all">Все отзывы</span>' +
          '<span class="filter-chip ' + (reviewFilter === "approved" ? 'active' : '') + '" data-rfilt="approved">Одобренные</span>' +
          '<span class="filter-chip ' + (reviewFilter === "pending" ? 'active' : '') + '" data-rfilt="pending">На проверке</span>' +
          '<span class="filter-chip ' + (reviewFilter === "rejected" ? 'active' : '') + '" data-rfilt="rejected">Отклонённые</span>' +
        '</div>' +
      '</div>' +
      '<div class="table-card" id="rev-table-wrap"><div style="padding:40px;text-align:center;color:var(--muted)">Загрузка отзывов…</div></div>';

    document.getElementById("rev-admin-search").addEventListener("input", function(e){
      reviewSearch = e.target.value.toLowerCase().trim();
      renderReviewsTable();
    });

    document.querySelectorAll("[data-rfilt]").forEach(function(el){
      el.addEventListener("click", function(){
        reviewFilter = el.getAttribute("data-rfilt");
        document.querySelectorAll("[data-rfilt]").forEach(function(x){ x.classList.toggle("active", x === el); });
        renderReviewsTable();
      });
    });

    try {
      var res = await api("/api/admin/reviews");
      allReviews = res.reviews || [];
    } catch(e) {
      allReviews = [];
    }
    renderReviewsTable();
  }

  function renderReviewsTable(){
    var wrap = document.getElementById("rev-table-wrap");
    if (!wrap) return;

    var filtered = allReviews.filter(function(r){
      var matchSt = (reviewFilter === "all" || r.status === reviewFilter);
      var matchQ = (!reviewSearch ||
        (r.author_name && r.author_name.toLowerCase().includes(reviewSearch)) ||
        (r.product_id && r.product_id.toLowerCase().includes(reviewSearch)) ||
        (r.text && r.text.toLowerCase().includes(reviewSearch))
      );
      return matchSt && matchQ;
    });

    if (!filtered.length) {
      wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Отзывов не найдено.</div>';
      return;
    }

    wrap.innerHTML =
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th>ID</th>' +
            '<th>Товар</th>' +
            '<th>Автор / Город</th>' +
            '<th>Оценка</th>' +
            '<th>Текст отзыва</th>' +
            '<th>Статус</th>' +
            '<th style="text-align:right">Действия</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          filtered.map(function(r){
            var stars = "★".repeat(r.rating || 5) + "☆".repeat(5 - (r.rating || 5));
            var verifiedBadge = r.is_verified ? '<span class="status-pill ok" style="font-size:10px;margin-left:4px">Покупка ✓</span>' : '';
            return '<tr>' +
              '<td><span style="font-family:monospace;color:var(--muted)">#' + r.id + '</span></td>' +
              '<td><strong>' + esc(r.product_name || r.product_id) + '</strong><br><span style="font-size:11px;color:var(--muted)">' + esc(r.product_id) + '</span></td>' +
              '<td><strong>' + esc(r.author_name) + '</strong>' + verifiedBadge + '<br><span style="font-size:12px;color:var(--muted)">' + esc(r.city || "—") + '</span></td>' +
              '<td><span style="color:#f2a71b;font-size:14px">' + stars + '</span></td>' +
              '<td><div style="max-width:320px;font-size:13px;line-height:1.4;color:var(--ink-soft)">' + esc(r.text) + '</div></td>' +
              '<td>' +
                '<select class="input sm" data-rev-status="' + r.id + '" style="padding:4px 8px;font-size:12px;width:auto;background:var(--panel2)">' +
                  '<option value="approved"' + (r.status === "approved" ? " selected" : "") + '>Одобрен</option>' +
                  '<option value="pending"' + (r.status === "pending" ? " selected" : "") + '>На проверке</option>' +
                  '<option value="rejected"' + (r.status === "rejected" ? " selected" : "") + '>Отклонён</option>' +
                '</select>' +
              '</td>' +
              '<td style="text-align:right">' +
                '<button class="btn ghost sm danger icon-only" data-rev-del="' + r.id + '" title="Удалить отзыв">✕</button>' +
              '</td>' +
            '</tr>';
          }).join("") +
        '</tbody>' +
      '</table>';

    wrap.querySelectorAll("[data-rev-status]").forEach(function(sel){
      sel.onchange = async function(){
        var id = sel.getAttribute("data-rev-status");
        var st = sel.value;
        try {
          await api("/api/admin/reviews/" + id + "/status", { method: "PUT", body: { status: st } });
          toast("Статус отзыва обновлён ✓");
          var found = allReviews.find(function(x){ return String(x.id) === String(id); });
          if (found) found.status = st;
        } catch(err) {
          toast("Ошибка обновления: " + err.message, "err");
        }
      };
    });

    wrap.querySelectorAll("[data-rev-del]").forEach(function(btn){
      btn.onclick = async function(){
        var id = btn.getAttribute("data-rev-del");
        var ok = await confirmModal("Удалить отзыв?", "Этот отзыв будет безвозвратно удалён из базы данных.", "Удалить", true);
        if (ok) {
          try {
            await api("/api/admin/reviews/" + id, { method: "DELETE" });
            toast("Отзыв удалён");
            allReviews = allReviews.filter(function(x){ return String(x.id) !== String(id); });
            renderReviewsTable();
          } catch(err) {
            toast("Ошибка удаления: " + err.message, "err");
          }
        }
      };
    });
  }

  /* ------------------------------ Settings --------------------------- */

  async function secSettings(){
    var main = document.getElementById("content");
    main.innerHTML =
      '<div class="toolbar"><h3 style="font-size:16px;font-weight:700">Настройки и интеграции сайта</h3></div>' +
      '<div id="s-wrap" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(380px, 1fr));gap:20px;max-width:1160px">' +
        '<div style="color:var(--muted);padding:40px;text-align:center;grid-column:1/-1">Загрузка настроек…</div>' +
      '</div>';

    var res = await api("/api/admin/settings");
    var s = res.settings || {};
    var wrap = document.getElementById("s-wrap");

    var curProvider = s.sms_provider || "disabled";

    wrap.innerHTML =
      '<!-- CARD 1: CONTACTS -->' +
      '<div style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius-lg);padding:24px;display:flex;flex-direction:column;gap:16px">' +
        '<div style="display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--line)">' +
          '<div style="width:34px;height:34px;border-radius:8px;background:var(--panel3);display:flex;align-items:center;justify-content:center;color:var(--primary)">' + ICONS.phone + '</div>' +
          '<div>' +
            '<h4 style="font-size:15px;font-weight:700;margin:0">Контакты и мессенджеры</h4>' +
            '<div class="hint" style="font-size:12px">Отображаются в шапке, подвале и контактах сайта</div>' +
          '</div>' +
        '</div>' +

        '<div class="field">' +
          '<label>Основной телефон</label>' +
          '<input id="st-phone" value="' + esc(s.phone || "+998 77 104 44 22") + '">' +
        '</div>' +
        '<div class="field">' +
          '<label>Номер WhatsApp (для чатов)</label>' +
          '<input id="st-wa" value="' + esc(s.whatsapp || "998771044422") + '" placeholder="998771044422">' +
        '</div>' +
        '<div class="field">' +
          '<label>Telegram аккаунт или бот</label>' +
          '<input id="st-tg" value="' + esc(s.telegram || "bententradeuz") + '" placeholder="username без @">' +
        '</div>' +
        '<div class="field">' +
          '<label>Контактный Email</label>' +
          '<input id="st-email" value="' + esc(s.email || "hello@bententrade.uz") + '">' +
        '</div>' +

        '<div style="margin-top:auto;padding-top:14px">' +
          '<button class="btn" id="st-save-contacts" style="width:100%">' + ICONS.check + ' Сохранить контакты</button>' +
        '</div>' +
      '</div>' +

      '<!-- CARD 2: SMS GATEWAY -->' +
      '<div style="background:var(--panel);border:1px solid var(--line);border-radius:var(--radius-lg);padding:24px;display:flex;flex-direction:column;gap:16px">' +
        '<div style="display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--line)">' +
          '<div style="width:34px;height:34px;border-radius:8px;background:var(--panel3);display:flex;align-items:center;justify-content:center;color:var(--primary)">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:18px;height:18px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></svg>' +
          '</div>' +
          '<div>' +
            '<h4 style="font-size:15px;font-weight:700;margin:0">SMS-шлюз (Eskiz.uz)</h4>' +
            '<div class="hint" style="font-size:12px">Автоматические SMS покупателям в Узбекистане</div>' +
          '</div>' +
        '</div>' +

        '<div class="field">' +
          '<label>Режим работы SMS</label>' +
          '<select id="st-sms-provider">' +
            '<option value="disabled"' + (curProvider === "disabled" ? ' selected' : '') + '>Отключено (SMS не отправляются)</option>' +
            '<option value="mock"' + (curProvider === "mock" ? ' selected' : '') + '>Тестовый режим (логирование в консоль сервера)</option>' +
            '<option value="eskiz"' + (curProvider === "eskiz" ? ' selected' : '') + '>Eskiz.uz (Реальные SMS через шлюз)</option>' +
          '</select>' +
          '<div class="hint">В тестовом режиме SMS эмулируются и пишутся в журнал сервера.</div>' +
        '</div>' +

        '<div id="st-eskiz-creds" style="' + (curProvider === "eskiz" ? '' : 'display:none;') + 'display:flex;flex-direction:column;gap:10px;padding:12px;background:var(--panel2);border:1px solid var(--line);border-radius:8px">' +
          '<div class="field">' +
            '<label>Email аккаунта в Eskiz.uz</label>' +
            '<input id="st-sms-email" value="' + esc(s.sms_email || "") + '" placeholder="user@domain.com">' +
          '</div>' +
          '<div class="field">' +
            '<label>Пароль / API-токен Eskiz.uz</label>' +
            '<input id="st-sms-pass" type="password" value="' + esc(s.sms_password || "") + '" placeholder="••••••••">' +
          '</div>' +
          '<div class="field">' +
            '<label>Имя отправителя (Sender ID)</label>' +
            '<input id="st-sms-from" value="' + esc(s.sms_from || "4546") + '" placeholder="4546">' +
            '<div class="hint">По умолчанию 4546 или утверждённое буквенное имя в Eskiz</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:8px">' +
          '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">' +
            '<input type="checkbox" id="st-sms-nc"' + (s.sms_notify_created !== "0" ? ' checked' : '') + '> ' +
            '<span>Отправлять SMS клиенту при создании заказа</span>' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">' +
            '<input type="checkbox" id="st-sms-ns"' + (s.sms_notify_status !== "0" ? ' checked' : '') + '> ' +
            '<span>Отправлять SMS клиенту при смене статуса заказа</span>' +
          '</label>' +
        '</div>' +

        '<details style="font-size:13px;border:1px solid var(--line);border-radius:8px;padding:10px 14px;background:var(--panel2)">' +
          '<summary style="font-weight:600;cursor:pointer">Настройка шаблонов SMS-сообщений</summary>' +
          '<div style="margin-top:12px;display:flex;flex-direction:column;gap:12px">' +
            '<div class="hint" style="font-size:11.5px">Доступные переменные: <code>{order_id}</code>, <code>{name}</code>, <code>{total}</code>, <code>{status}</code></div>' +
            '<div class="field">' +
              '<label>Новый заказ (принят)</label>' +
              '<textarea id="st-tpl-created" rows="2" style="font-size:12px">' + esc(s.sms_tpl_created || "Bententrade: Ваш заказ #{order_id} на сумму {total} принят! Скоро свяжемся с вами.") + '</textarea>' +
            '</div>' +
            '<div class="field">' +
              '<label>Статус: В обработке</label>' +
              '<textarea id="st-tpl-processing" rows="2" style="font-size:12px">' + esc(s.sms_tpl_processing || "Bententrade: Заказ #{order_id} взят в работу мастерами производства. Срок готовности уточнит менеджер.") + '</textarea>' +
            '</div>' +
            '<div class="field">' +
              '<label>Статус: Отправлен</label>' +
              '<textarea id="st-tpl-shipped" rows="2" style="font-size:12px">' + esc(s.sms_tpl_shipped || "Bententrade: Заказ #{order_id} передан курьеру/в службу доставки. Ожидайте прибытия.") + '</textarea>' +
            '</div>' +
            '<div class="field">' +
              '<label>Статус: Доставлен</label>' +
              '<textarea id="st-tpl-delivered" rows="2" style="font-size:12px">' + esc(s.sms_tpl_delivered || "Bententrade: Заказ #{order_id} успешно доставлен! Гарантия 3 года. Спасибо за выбор Bententrade.") + '</textarea>' +
            '</div>' +
            '<div class="field">' +
              '<label>Статус: Отменён</label>' +
              '<textarea id="st-tpl-cancelled" rows="2" style="font-size:12px">' + esc(s.sms_tpl_cancelled || "Bententrade: Заказ #{order_id} отменен. Свяжитесь с нами при любых вопросах: +998 77 104 44 22") + '</textarea>' +
            '</div>' +
          '</div>' +
        '</details>' +

        '<!-- TEST SMS SECTION -->' +
        '<div style="padding:12px;background:var(--panel2);border:1px solid var(--line);border-radius:8px">' +
          '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Проверка тестового SMS</label>' +
          '<div style="display:flex;gap:8px">' +
            '<input id="st-sms-test-phone" placeholder="+998 90 123 45 67" style="flex:1;font-size:13px">' +
            '<button type="button" class="btn sm ghost" id="st-sms-test-btn" style="white-space:nowrap">Отправить тест</button>' +
          '</div>' +
          '<div id="st-sms-test-res" style="font-size:12px;margin-top:8px;line-height:1.4;display:none"></div>' +
        '</div>' +

        '<div style="margin-top:auto;padding-top:14px">' +
          '<button class="btn" id="st-save-sms" style="width:100%">' + ICONS.check + ' Сохранить настройки SMS</button>' +
        '</div>' +
      '</div>';

    // Toggle Eskiz fields display
    var provSelect = document.getElementById("st-sms-provider");
    var credsBox = document.getElementById("st-eskiz-creds");
    provSelect.onchange = function(){
      if (credsBox) credsBox.style.display = provSelect.value === "eskiz" ? "flex" : "none";
    };

    // Save contacts
    document.getElementById("st-save-contacts").onclick = async function(){
      var payload = {
        phone: document.getElementById("st-phone").value.trim(),
        whatsapp: document.getElementById("st-wa").value.trim(),
        telegram: document.getElementById("st-tg").value.trim(),
        email: document.getElementById("st-email").value.trim()
      };
      try {
        await api("/api/admin/settings", { method: "PUT", body: payload });
        toast("Контакты успешно сохранены! ✓");
      } catch(err) {
        toast("Ошибка сохранения: " + err.message, "err");
      }
    };

    // Save SMS settings
    document.getElementById("st-save-sms").onclick = async function(){
      var payload = {
        sms_provider: provSelect.value,
        sms_email: document.getElementById("st-sms-email") ? document.getElementById("st-sms-email").value.trim() : "",
        sms_password: document.getElementById("st-sms-pass") ? document.getElementById("st-sms-pass").value : "",
        sms_from: document.getElementById("st-sms-from") ? document.getElementById("st-sms-from").value.trim() : "4546",
        sms_notify_created: document.getElementById("st-sms-nc").checked ? "1" : "0",
        sms_notify_status: document.getElementById("st-sms-ns").checked ? "1" : "0",
        sms_tpl_created: document.getElementById("st-tpl-created").value.trim(),
        sms_tpl_processing: document.getElementById("st-tpl-processing").value.trim(),
        sms_tpl_shipped: document.getElementById("st-tpl-shipped").value.trim(),
        sms_tpl_delivered: document.getElementById("st-tpl-delivered").value.trim(),
        sms_tpl_cancelled: document.getElementById("st-tpl-cancelled").value.trim()
      };
      try {
        await api("/api/admin/settings", { method: "PUT", body: payload });
        toast("Настройки SMS сохранены! ✓");
      } catch(err) {
        toast("Ошибка сохранения: " + err.message, "err");
      }
    };

    // Test SMS
    document.getElementById("st-sms-test-btn").onclick = async function(){
      var btn = document.getElementById("st-sms-test-btn");
      var phoneInp = document.getElementById("st-sms-test-phone");
      var resEl = document.getElementById("st-sms-test-res");
      var phoneVal = phoneInp.value.trim();

      if (!phoneVal) {
        toast("Введите номер телефона получателя", "err");
        phoneInp.focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = "Отправка…";
      resEl.style.display = "block";
      resEl.textContent = "Отправка тестового SMS…";
      resEl.style.color = "var(--ink-soft)";

      try {
        var resp = await api("/api/admin/sms/test", {
          method: "POST",
          body: {
            phone: phoneVal,
            message: "Bententrade: Тестовое SMS-сообщение. Сервис уведомлений работает корректно!"
          }
        });
        if (resp.ok) {
          resEl.textContent = "✓ SMS успешно отправлено! Провайдер: " + resp.provider + (resp.details && resp.details.messageId ? " (ID: " + resp.details.messageId + ")" : "");
          resEl.style.color = "var(--ok)";
          toast("Тестовое SMS успешно отправлено ✓");
        } else {
          resEl.textContent = "✕ Ошибка: " + (resp.error || "Неизвестная ошибка") + " (провайдер: " + resp.provider + ")";
          resEl.style.color = "var(--err)";
          toast("Ошибка отправки SMS: " + (resp.error || "failed"), "err");
        }
      } catch(err) {
        resEl.textContent = "✕ Ошибка: " + err.message;
        resEl.style.color = "var(--err)";
        toast("Ошибка: " + err.message, "err");
      } finally {
        btn.disabled = false;
        btn.textContent = "Отправить тест";
      }
    };
  }

  /* ------------------------------- Boot ------------------------------ */
  async function boot(){
    try {
      var me = await api("/api/auth/me");
      if (me.user && me.user.role === "admin") {
        currentUser = me.user;
        renderShell();
      } else {
        renderLogin();
      }
    } catch(e) {
      renderLogin();
    }
  }

  boot();
})();
`;
