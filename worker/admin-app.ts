/** Admin SPA logic, served as /admin/app.js. Dependency-free vanilla JS. */
export const ADMIN_APP_JS = String.raw`
(function(){
  "use strict";
  var app = document.getElementById("app");
  var LANGS = ["ru","uz","en"];
  var CATS = ["furniture","planter","basket","indoor"];

  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  async function api(path, opts){
    opts = opts || {};
    var init = { method: opts.method || "GET", headers: {}, credentials:"same-origin" };
    if(opts.body !== undefined){ init.headers["content-type"]="application/json"; init.body = JSON.stringify(opts.body); }
    if(opts.form){ init.body = opts.form; }
    var r = await fetch(path, init);
    var data = null; try{ data = await r.json(); }catch(e){}
    if(!r.ok){ throw Object.assign(new Error((data&&data.error)||("HTTP "+r.status)),{status:r.status,data:data}); }
    return data;
  }

  /* ------------------------------ login ------------------------------ */
  function renderLogin(err){
    app.innerHTML =
      '<div class="login"><h1 style="color:var(--copper);letter-spacing:.14em;text-transform:uppercase;font-size:15px;margin:0 0 18px">Bententrade CRM</h1>'+
      '<label>Email</label><input id="l-email" type="email" autocomplete="username">'+
      '<label>Пароль</label><input id="l-pass" type="password" autocomplete="current-password">'+
      '<div class="msg">'+(err?esc(err):"")+'</div>'+
      '<button class="btn" id="l-go" style="width:100%;margin-top:14px">Войти</button></div>';
    document.getElementById("l-go").onclick = doLogin;
    document.getElementById("l-pass").addEventListener("keydown",function(e){ if(e.key==="Enter") doLogin(); });
  }
  async function doLogin(){
    var email = document.getElementById("l-email").value.trim();
    var password = document.getElementById("l-pass").value;
    try{
      var res = await api("/api/auth/login",{method:"POST",body:{email:email,password:password}});
      if(res.user && res.user.role === "admin"){ boot(); }
      else { await api("/api/auth/logout",{method:"POST"}); renderLogin("Нужен доступ администратора."); }
    }catch(e){ renderLogin(e.message==="invalid_credentials"?"Неверный email или пароль.":e.message); }
  }

  /* ------------------------------ shell ------------------------------ */
  var SECTIONS = [
    ["dashboard","Сводка"],["products","Товары"],["orders","Заказы"],
    ["requests","Заявки"],["articles","Статьи"],["media","Медиа"],["settings","Настройки"]
  ];
  var current = "dashboard";
  function renderShell(){
    app.innerHTML =
      '<div class="wrap"><aside><h1>Bententrade CRM</h1><nav id="nav">'+
      SECTIONS.map(function(s){ return '<button data-sec="'+s[0]+'">'+s[1]+'</button>'; }).join("")+
      '</nav><div style="position:absolute;bottom:18px;left:14px;right:14px"><button class="btn ghost" id="logout" style="width:100%">Выйти</button></div></aside>'+
      '<main id="main"></main></div>';
    document.getElementById("nav").addEventListener("click",function(e){
      var b = e.target.closest("button[data-sec]"); if(!b) return;
      current = b.getAttribute("data-sec"); renderNav(); route();
    });
    document.getElementById("logout").onclick = async function(){ await api("/api/auth/logout",{method:"POST"}); renderLogin(); };
    renderNav(); route();
  }
  function renderNav(){
    Array.prototype.forEach.call(document.querySelectorAll("#nav button"),function(b){
      b.classList.toggle("active", b.getAttribute("data-sec")===current);
    });
  }
  var main;
  function route(){ main = document.getElementById("main"); ({dashboard:secDashboard,products:secProducts,orders:secOrders,requests:secRequests,articles:secArticles,media:secMedia,settings:secSettings}[current])(); }

  /* ---------------------------- dashboard ---------------------------- */
  async function secDashboard(){
    main.innerHTML = "<h2>Сводка</h2><div id=dash>Загрузка…</div>";
    var s = await api("/api/admin/stats");
    var cards = [
      ["Заказы", s.orders, "новых: "+s.ordersNew],
      ["Заявки", s.requests, "новых: "+s.requestsNew],
      ["Товары", s.products, ""],
      ["Статьи", s.articles, ""],
      ["Клиенты", s.users, ""]
    ];
    document.getElementById("dash").innerHTML = '<div class="cards">'+cards.map(function(c){
      return '<div class="card"><div class="n">'+c[1]+'</div><div class="l">'+c[0]+'</div>'+(c[2]?'<small class="muted">'+c[2]+'</small>':"")+'</div>';
    }).join("")+'</div>';
  }

  /* ----------------------------- products ---------------------------- */
  async function secProducts(){
    main.innerHTML = '<h2>Товары</h2><div class="toolbar"><span class="sp"></span><button class="btn" id="p-new">+ Добавить</button></div><div id="p-list">Загрузка…</div>';
    document.getElementById("p-new").onclick = function(){ editProduct(null); };
    var res = await api("/api/admin/products");
    document.getElementById("p-list").innerHTML =
      '<table><thead><tr><th>ID</th><th>Название (RU)</th><th>Категория</th><th>Цена</th><th>Акт.</th><th></th></tr></thead><tbody>'+
      res.products.map(function(p){
        return '<tr><td>'+esc(p.id)+'</td><td>'+esc(p.name||"—")+'</td><td>'+esc(p.category)+'</td><td>$'+p.price_now+(p.price_old?' <small class=muted>$'+p.price_old+'</small>':'')+'</td><td>'+(p.active?"✓":"—")+'</td>'+
          '<td><button class="btn ghost" data-edit="'+esc(p.id)+'">Изм.</button> <button class="btn ghost" data-del="'+esc(p.id)+'">✕</button></td></tr>';
      }).join("")+'</tbody></table>';
    main.querySelector("#p-list").addEventListener("click",function(e){
      var ed=e.target.closest("[data-edit]"), de=e.target.closest("[data-del]");
      if(ed) editProduct(ed.getAttribute("data-edit"));
      if(de) delProduct(de.getAttribute("data-del"));
    });
  }
  async function delProduct(id){
    if(!confirm("Удалить товар "+id+"?")) return;
    await api("/api/admin/products/"+encodeURIComponent(id),{method:"DELETE"}); secProducts();
  }
  async function editProduct(id){
    var data = id ? await api("/api/admin/products/"+encodeURIComponent(id)) : {product:{},i18n:[]};
    var p = data.product||{};
    var byLang = {}; (data.i18n||[]).forEach(function(r){ byLang[r.lang]=r; });
    var dlg = document.createElement("dialog");
    dlg.innerHTML =
      '<h2>'+(id?"Товар "+esc(id):"Новый товар")+'</h2>'+
      '<div class="row"><div><label>ID</label><input id="f-id" '+(id?'disabled':'')+' value="'+esc(p.id||"")+'"></div>'+
      '<div><label>Категория</label><select id="f-cat">'+CATS.map(function(c){return '<option '+(p.category===c?'selected':'')+'>'+c+'</option>';}).join("")+'</select></div></div>'+
      '<div class="row"><div><label>Цена</label><input id="f-now" type="number" value="'+(p.price_now||0)+'"></div>'+
      '<div><label>Старая цена</label><input id="f-old" type="number" value="'+(p.price_old||0)+'"></div>'+
      '<div><label>Look (фото)</label><input id="f-look" value="'+esc(p.look||"")+'"></div></div>'+
      '<div class="row"><div><label>Размер по умолч.</label><input id="f-ds" type="number" value="'+(p.default_size||0)+'"></div>'+
      '<div><label>Сортировка</label><input id="f-sort" type="number" value="'+(p.sort||0)+'"></div>'+
      '<div><label>Активен</label><select id="f-active"><option value="1" '+(p.active!==0?'selected':'')+'>Да</option><option value="0" '+(p.active===0?'selected':'')+'>Нет</option></select></div></div>'+
      '<div class="tabs" id="f-tabs">'+LANGS.map(function(l,i){return '<button data-l="'+l+'" class="'+(i===0?'active':'')+'">'+l.toUpperCase()+'</button>';}).join("")+'</div>'+
      LANGS.map(function(l,i){ var t=byLang[l]||{}; var sizes=""; try{sizes=(JSON.parse(t.sizes||"[]")||[]).join(", ");}catch(e){}
        return '<div class="lpane" data-l="'+l+'" style="'+(i===0?'':'display:none')+'">'+
          '<label>Название</label><input class="i-name" value="'+esc(t.name||"")+'">'+
          '<label>Категория (подпись)</label><input class="i-cat" value="'+esc(t.category_label||"")+'">'+
          '<label>Описание</label><textarea class="i-desc">'+esc(t.description||"")+'</textarea>'+
          '<label>Размеры (через запятую)</label><input class="i-sizes" value="'+esc(sizes)+'"></div>';
      }).join("")+
      '<div class="row" style="margin-top:18px"><button class="btn" id="f-save">Сохранить</button><button class="btn ghost" id="f-cancel">Отмена</button></div><div class="msg" id="f-msg"></div>';
    document.body.appendChild(dlg); dlg.showModal();
    dlg.querySelector("#f-tabs").addEventListener("click",function(e){var b=e.target.closest("button[data-l]");if(!b)return;
      Array.prototype.forEach.call(dlg.querySelectorAll("#f-tabs button"),function(x){x.classList.toggle("active",x===b);});
      Array.prototype.forEach.call(dlg.querySelectorAll(".lpane"),function(x){x.style.display=x.getAttribute("data-l")===b.getAttribute("data-l")?"":"none";});
    });
    dlg.querySelector("#f-cancel").onclick=function(){ dlg.close(); dlg.remove(); };
    dlg.querySelector("#f-save").onclick=async function(){
      var i18n={};
      Array.prototype.forEach.call(dlg.querySelectorAll(".lpane"),function(pane){
        var l=pane.getAttribute("data-l");
        i18n[l]={ name:pane.querySelector(".i-name").value, category_label:pane.querySelector(".i-cat").value,
          description:pane.querySelector(".i-desc").value,
          sizes:pane.querySelector(".i-sizes").value.split(",").map(function(s){return s.trim();}).filter(Boolean) };
      });
      var payload={ id:dlg.querySelector("#f-id").value.trim(), category:dlg.querySelector("#f-cat").value,
        price_now:+dlg.querySelector("#f-now").value, price_old:+dlg.querySelector("#f-old").value,
        look:dlg.querySelector("#f-look").value, default_size:+dlg.querySelector("#f-ds").value,
        sort:+dlg.querySelector("#f-sort").value, active:+dlg.querySelector("#f-active").value, i18n:i18n };
      try{
        if(id) await api("/api/admin/products/"+encodeURIComponent(id),{method:"PUT",body:payload});
        else await api("/api/admin/products",{method:"POST",body:payload});
        dlg.close(); dlg.remove(); secProducts();
      }catch(e){ dlg.querySelector("#f-msg").textContent=e.message; }
    };
  }

  /* ------------------------------ orders ----------------------------- */
  var ORDER_ST=["new","processing","shipped","delivered","cancelled"];
  async function secOrders(){
    main.innerHTML='<h2>Заказы</h2><div id="o-list">Загрузка…</div>';
    var res=await api("/api/admin/orders");
    document.getElementById("o-list").innerHTML= res.orders.length?
      '<table><thead><tr><th>№</th><th>Клиент</th><th>Сумма</th><th>Статус</th><th>Дата</th><th></th></tr></thead><tbody>'+
      res.orders.map(function(o){
        return '<tr><td>'+esc(o.public_id)+'</td><td>'+esc(o.customer_name||"—")+'<br><small class=muted>'+esc(o.customer_phone||"")+'</small></td>'+
          '<td>'+esc(o.currency)+o.total+'</td><td><select data-st="'+o.id+'">'+ORDER_ST.map(function(s){return '<option '+(o.status===s?'selected':'')+'>'+s+'</option>';}).join("")+'</select></td>'+
          '<td><small class=muted>'+esc((o.created_at||"").slice(0,16))+'</small></td>'+
          '<td><button class="btn ghost" data-view="'+o.id+'">Открыть</button></td></tr>';
      }).join("")+'</tbody></table>' : '<p class=muted>Заказов пока нет.</p>';
    document.getElementById("o-list").addEventListener("change",async function(e){
      var sel=e.target.closest("select[data-st]"); if(!sel) return;
      await api("/api/admin/orders/"+sel.getAttribute("data-st")+"/status",{method:"PUT",body:{status:sel.value}});
    });
    document.getElementById("o-list").addEventListener("click",function(e){
      var v=e.target.closest("[data-view]"); if(v) viewOrder(v.getAttribute("data-view"));
    });
  }
  async function viewOrder(id){
    var d=await api("/api/admin/orders/"+id); var o=d.order;
    var dlg=document.createElement("dialog");
    dlg.innerHTML='<h2>Заказ '+esc(o.public_id)+'</h2>'+
      '<p><b>Клиент:</b> '+esc(o.customer_name||"—")+'<br><b>Телефон:</b> '+esc(o.customer_phone||"—")+'<br><b>Email:</b> '+esc(o.customer_email||"—")+'<br><b>Адрес:</b> '+esc(o.address||"—")+'<br><b>Комментарий:</b> '+esc(o.comment||"—")+'</p>'+
      '<table><thead><tr><th>Товар</th><th>Опции</th><th>Цена</th><th>Кол-во</th></tr></thead><tbody>'+
      d.items.map(function(it){return '<tr><td>'+esc(it.name)+'</td><td><small class=muted>'+esc(it.options||"")+'</small></td><td>'+esc(o.currency)+it.unit_price+'</td><td>'+it.qty+'</td></tr>';}).join("")+
      '</tbody></table><p style="text-align:right"><b>Итого: '+esc(o.currency)+o.total+'</b></p>'+
      '<button class="btn" id="o-close">Закрыть</button>';
    document.body.appendChild(dlg); dlg.showModal();
    dlg.querySelector("#o-close").onclick=function(){dlg.close();dlg.remove();};
  }

  /* ------------------------------ requests --------------------------- */
  async function secRequests(){
    main.innerHTML='<h2>Заявки</h2><div id="r-list">Загрузка…</div>';
    var res=await api("/api/admin/requests");
    document.getElementById("r-list").innerHTML= res.requests.length?
      '<table><thead><tr><th>Имя</th><th>Контакты</th><th>Сообщение</th><th>Статус</th><th>Дата</th></tr></thead><tbody>'+
      res.requests.map(function(r){
        return '<tr><td>'+esc(r.name)+'</td><td>'+esc(r.phone||"")+'<br>'+esc(r.email||"")+'</td><td>'+esc(r.message)+'</td>'+
          '<td><select data-rs="'+r.id+'"><option '+(r.status==="new"?"selected":"")+'>new</option><option '+(r.status==="in_progress"?"selected":"")+'>in_progress</option><option '+(r.status==="done"?"selected":"")+'>done</option></select></td>'+
          '<td><small class=muted>'+esc((r.created_at||"").slice(0,16))+'</small></td></tr>';
      }).join("")+'</tbody></table>' : '<p class=muted>Заявок пока нет.</p>';
    document.getElementById("r-list").addEventListener("change",async function(e){
      var s=e.target.closest("select[data-rs]"); if(!s) return;
      await api("/api/admin/requests/"+s.getAttribute("data-rs")+"/status",{method:"PUT",body:{status:s.value}});
    });
  }

  /* ------------------------------ articles --------------------------- */
  async function secArticles(){
    main.innerHTML='<h2>Статьи</h2><div class="toolbar"><span class="sp"></span><button class="btn" id="a-new">+ Новая</button></div><div id="a-list">Загрузка…</div>';
    document.getElementById("a-new").onclick=function(){ editArticle(null); };
    var res=await api("/api/admin/articles");
    document.getElementById("a-list").innerHTML=
      '<table><thead><tr><th>Заголовок (RU)</th><th>Слаг</th><th>Статус</th><th></th></tr></thead><tbody>'+
      res.articles.map(function(a){
        return '<tr><td>'+esc(a.title||"—")+'</td><td>'+esc(a.slug)+'</td><td><span class="pill '+esc(a.status)+'">'+esc(a.status)+'</span></td>'+
          '<td><button class="btn ghost" data-edit="'+a.id+'">Изм.</button> <button class="btn ghost" data-del="'+a.id+'">✕</button></td></tr>';
      }).join("")+'</tbody></table>';
    document.getElementById("a-list").addEventListener("click",function(e){
      var ed=e.target.closest("[data-edit]"), de=e.target.closest("[data-del]");
      if(ed) editArticle(ed.getAttribute("data-edit"));
      if(de) delArticle(de.getAttribute("data-del"));
    });
  }
  async function delArticle(id){ if(!confirm("Удалить статью?"))return; await api("/api/admin/articles/"+id,{method:"DELETE"}); secArticles(); }
  async function editArticle(id){
    var data=id?await api("/api/admin/articles/"+id):{article:{},i18n:[]};
    var a=data.article||{}; var byLang={}; (data.i18n||[]).forEach(function(r){byLang[r.lang]=r;});
    var dlg=document.createElement("dialog");
    dlg.innerHTML='<h2>'+(id?"Статья":"Новая статья")+'</h2>'+
      '<div class="row"><div><label>Слаг</label><input id="a-slug" value="'+esc(a.slug||"")+'"></div>'+
      '<div><label>Статус</label><select id="a-status"><option value="draft" '+(a.status!=="published"?"selected":"")+'>Черновик</option><option value="published" '+(a.status==="published"?"selected":"")+'>Опубликовано</option></select></div></div>'+
      '<div class="tabs" id="a-tabs">'+LANGS.map(function(l,i){return '<button data-l="'+l+'" class="'+(i===0?'active':'')+'">'+l.toUpperCase()+'</button>';}).join("")+'</div>'+
      LANGS.map(function(l,i){var t=byLang[l]||{};
        return '<div class="lpane" data-l="'+l+'" style="'+(i===0?'':'display:none')+'"><label>Заголовок</label><input class="a-title" value="'+esc(t.title||"")+'">'+
          '<label>Краткое описание</label><textarea class="a-exc">'+esc(t.excerpt||"")+'</textarea>'+
          '<label>Текст</label><textarea class="a-body" style="min-height:160px">'+esc(t.body||"")+'</textarea></div>';
      }).join("")+
      '<div class="row" style="margin-top:16px"><button class="btn" id="a-save">Сохранить</button><button class="btn ghost" id="a-cancel">Отмена</button></div><div class="msg" id="a-msg"></div>';
    document.body.appendChild(dlg); dlg.showModal();
    dlg.querySelector("#a-tabs").addEventListener("click",function(e){var b=e.target.closest("button[data-l]");if(!b)return;
      Array.prototype.forEach.call(dlg.querySelectorAll("#a-tabs button"),function(x){x.classList.toggle("active",x===b);});
      Array.prototype.forEach.call(dlg.querySelectorAll(".lpane"),function(x){x.style.display=x.getAttribute("data-l")===b.getAttribute("data-l")?"":"none";});
    });
    dlg.querySelector("#a-cancel").onclick=function(){dlg.close();dlg.remove();};
    dlg.querySelector("#a-save").onclick=async function(){
      var i18n={};
      Array.prototype.forEach.call(dlg.querySelectorAll(".lpane"),function(pane){
        i18n[pane.getAttribute("data-l")]={title:pane.querySelector(".a-title").value,excerpt:pane.querySelector(".a-exc").value,body:pane.querySelector(".a-body").value};
      });
      var payload={slug:dlg.querySelector("#a-slug").value,status:dlg.querySelector("#a-status").value,i18n:i18n};
      try{
        if(id) await api("/api/admin/articles/"+id,{method:"PUT",body:payload});
        else await api("/api/admin/articles",{method:"POST",body:payload});
        dlg.close();dlg.remove();secArticles();
      }catch(e){ dlg.querySelector("#a-msg").textContent=e.message; }
    };
  }

  /* ------------------------------- media ----------------------------- */
  async function secMedia(){
    main.innerHTML='<h2>Медиа</h2>'+
      '<div class="toolbar"><input id="m-file" type="file" accept="image/*"> '+
      '<input id="m-pid" placeholder="product id (необязат.)" style="max-width:190px"> '+
      '<input id="m-alt" placeholder="alt (необязат.)" style="max-width:190px"> '+
      '<button class="btn" id="m-up">Загрузить</button><span class="sp"></span></div>'+
      '<div class="msg" id="m-msg"></div><div id="m-list">Загрузка…</div>';
    document.getElementById("m-up").onclick=uploadMedia;
    await loadMedia();
  }
  async function loadMedia(){
    var res=await api("/api/admin/media");
    document.getElementById("m-list").innerHTML= res.media.length?
      '<div class="cards">'+res.media.map(function(m){
        return '<div class="card" style="text-align:left"><img src="/media/'+esc(m.key)+'" alt="'+esc(m.alt||"")+'" style="width:100%;height:120px;object-fit:cover;border-radius:8px;background:var(--line)">'+
          '<div style="margin-top:8px;display:flex;gap:6px;align-items:center"><input readonly value="/media/'+esc(m.key)+'" style="flex:1;font-size:12px">'+
          '<button class="btn ghost" data-copy="/media/'+esc(m.key)+'">Копир.</button>'+
          '<button class="btn ghost" data-mdel="'+m.id+'">✕</button></div>'+
          (m.product_id?'<small class=muted>товар: '+esc(m.product_id)+'</small>':'')+'</div>';
      }).join("")+'</div>' : '<p class=muted>Файлов пока нет.</p>';
    document.getElementById("m-list").addEventListener("click",async function(e){
      var cp=e.target.closest("[data-copy]"), de=e.target.closest("[data-mdel]");
      if(cp){ try{ await navigator.clipboard.writeText(cp.getAttribute("data-copy")); cp.textContent="✓"; setTimeout(function(){cp.textContent="Копир.";},1200);}catch(x){} }
      if(de){ if(!confirm("Удалить файл?"))return; await api("/api/admin/media/"+de.getAttribute("data-mdel"),{method:"DELETE"}); loadMedia(); }
    });
  }
  async function uploadMedia(){
    var fi=document.getElementById("m-file"); var msg=document.getElementById("m-msg");
    if(!fi.files || !fi.files[0]){ msg.textContent="Выберите файл."; return; }
    var fd=new FormData(); fd.append("file", fi.files[0]);
    var pid=document.getElementById("m-pid").value.trim(); if(pid) fd.append("product_id", pid);
    var alt=document.getElementById("m-alt").value.trim(); if(alt) fd.append("alt", alt);
    msg.textContent="Загрузка…";
    try{ await api("/api/admin/media",{method:"POST",form:fd}); msg.textContent="Готово ✓"; fi.value=""; loadMedia(); }
    catch(e){ msg.textContent=e.message; }
  }

  /* ------------------------------ settings --------------------------- */
  async function secSettings(){
    main.innerHTML='<h2>Настройки</h2><div id="s-form">Загрузка…</div>';
    var res=await api("/api/admin/settings"); var s=res.settings||{};
    var keys=["phone","whatsapp","telegram","email"];
    document.getElementById("s-form").innerHTML= keys.map(function(k){
      return '<label>'+k+'</label><input data-k="'+k+'" value="'+esc(s[k]||"")+'">';
    }).join("")+'<div style="margin-top:16px"><button class="btn" id="s-save">Сохранить</button></div><div class="msg" id="s-msg" style="color:var(--ok)"></div>';
    document.getElementById("s-save").onclick=async function(){
      var body={}; Array.prototype.forEach.call(document.querySelectorAll("#s-form input[data-k]"),function(i){body[i.getAttribute("data-k")]=i.value;});
      await api("/api/admin/settings",{method:"PUT",body:body});
      document.getElementById("s-msg").textContent="Сохранено ✓";
    };
  }

  /* ------------------------------- boot ------------------------------ */
  async function boot(){
    try{
      var me=await api("/api/auth/me");
      if(me.user && me.user.role==="admin") renderShell();
      else renderLogin();
    }catch(e){ renderLogin(); }
  }
  boot();
})();
`;
