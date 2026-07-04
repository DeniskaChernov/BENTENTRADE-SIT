/* ============================================================
   BENTENTRADE — hero (switchable worlds, reference layout)
   Worlds: garden · home · rattan · planters — L-form overlay, 4 slides.
   Multilingual (RU/UZ/EN); reacts to the global language switch.
   ============================================================ */
(function(){
  const SLIDES = [
    {
      cat: "furniture",
      mainImg: "https://loremflickr.com/800/800/rattan,sofa/all?lock=11",
      sideImg: "https://loremflickr.com/800/800/patio,furniture/all?lock=31",
      badge:   {ru:"Живи на воздухе",        uz:"Ochiq havoda yasha",     en:"Live outdoors"},
      t1:      {ru:"Мебель",                 uz:"Mebel",                  en:"Furniture"},
      t2:      {ru:"для дачи и сада",         uz:"dala va bog‘ uchun",     en:"for patio & garden"},
      interior:{ru:"Садовая коллекция",      uz:"Bog‘ to‘plami",          en:"Garden collection"},
      bestS:   {ru:"Лучшая мебель",          uz:"Eng yaxshi mebel",       en:"Best furniture"},
      bestB:   {ru:"ДЛЯ ОТДЫХА НА ВОЗДУХЕ",  uz:"OCHIQ HAVODA DAM OLISH", en:"FOR OUTDOOR LIVING"},
      store:   {ru:"Смотреть садовую мебель", uz:"Bog‘ mebelini ko‘rish", en:"Shop garden furniture"},
      href:    "catalog.html?cat=furniture",
      stats: [
        {num:"10k", suf:"+", label:{ru:"Довольных клиентов", uz:"Mamnun mijozlar",   en:"Happy clients"}},
        {num:"12",  suf:"+", label:{ru:"Лет на рынке",        uz:"Yillik tajriba",    en:"Years on market"}},
        {num:"35",  suf:"+", label:{ru:"Премиум-изделий",     uz:"Premium mahsulot",  en:"Premium pieces"}}
      ]
    },
    {
      cat: "indoor",
      mainImg: "https://loremflickr.com/800/800/rattan,cabinet/all?lock=95",
      sideImg: "https://loremflickr.com/800/800/rattan,rocking,chair/all?lock=90",
      badge:   {ru:"Уют дома",             uz:"Uy qulayligi",           en:"Home comfort"},
      t1:      {ru:"Мебель",                 uz:"Mebel",                  en:"Furniture"},
      t2:      {ru:"для дома",              uz:"uy uchun",               en:"for the home"},
      interior:{ru:"Домашняя коллекция",     uz:"Uy to‘plami",           en:"Home collection"},
      bestS:   {ru:"Ротанг в интерьере",     uz:"Interyerda rotang",      en:"Rattan indoors"},
      bestB:   {ru:"ДЛЯ ГОСТИНОЙ И СПАЛЬНИ", uz:"MEHMONXONA VA YOTOQ UCHUN", en:"FOR LIVING & BEDROOM"},
      store:   {ru:"Смотреть мебель для дома", uz:"Uy mebelini ko‘rish", en:"Shop home furniture"},
      href:    "catalog.html?cat=indoor",
      stats: [
        {num:"4",   suf:"",  label:{ru:"Вида изделий",     uz:"Mahsulot turi",    en:"Item types"}},
        {num:"3",   suf:"",  label:{ru:"Размера",           uz:"O‘lcham",         en:"Sizes"}},
        {num:"100", suf:"%", label:{ru:"Ручная работа",       uz:"Qo‘l mehnati",     en:"Handmade"}}
      ]
    },
    {
      cat: "rattan",
      mainImg: "https://loremflickr.com/800/800/rattan,weave/all?lock=21",
      sideImg: "https://loremflickr.com/800/800/wicker,chair/all?lock=2",
      badge:   {ru:"Своё производство",      uz:"O‘z ishlab chiqarish",   en:"Own production"},
      t1:      {ru:"Искусственный",          uz:"Sun’iy",                 en:"Synthetic"},
      t2:      {ru:"ротанг",                 uz:"rotang",                 en:"rattan"},
      interior:{ru:"Плетёная мебель",        uz:"To‘qilgan mebel",        en:"Woven furniture"},
      bestS:   {ru:"Стойко к погоде",       uz:"Ob-havoga chidamli",     en:"Weather-proof"},
      bestB:   {ru:"СЛУЖИТ ГОДАМИ",          uz:"YILLAB XIZMAT QILADI",   en:"LASTS FOR YEARS"},
      store:   {ru:"Смотреть ротанг",         uz:"Rotangni ko‘rish",      en:"Shop the rattan"},
      href:    "catalog.html?cat=rattan",
      stats: [
        {num:"50", suf:"+", label:{ru:"Моделей плетения",  uz:"To‘quv modellari",  en:"Weave models"}},
        {num:"8",  suf:"",  label:{ru:"Лет на улице",       uz:"Yil ko‘chada",      en:"Years outdoors"}},
        {num:"100",suf:"%", label:{ru:"Влагостойкость",     uz:"Namlikka chidamli", en:"Water resistant"}}
      ]
    },
    {
      cat: "planter",
      mainImg: "https://loremflickr.com/800/800/woven,basket/all?lock=34",
      sideImg: "https://loremflickr.com/800/800/wicker,planter/all?lock=4",
      badge:   {ru:"Уют в деталях",          uz:"Tafsilotlardagi qulaylik", en:"Comfort in details"},
      t1:      {ru:"Кашпо, сундуки",          uz:"Gultuvak, sandiq",        en:"Planters, chests"},
      t2:      {ru:"и корзины для белья",     uz:"va kir savatlari",        en:"& laundry baskets"},
      interior:{ru:"Декор и хранение",       uz:"Dekor va saqlash",        en:"Decor & storage"},
      bestS:   {ru:"Ручное плетение",        uz:"Qo‘l to‘quvi",            en:"Hand-woven"},
      bestB:   {ru:"ДЛЯ ДОМА И ДАЧИ",        uz:"UY VA DALA UCHUN",        en:"FOR HOME & DACHA"},
      store:   {ru:"Смотреть кашпо и корзины", uz:"Gultuvak va savatlar",  en:"Shop planters & baskets"},
      href:    "catalog.html?cat=planter",
      stats: [
        {num:"120",suf:"+", label:{ru:"Изделий в наличии", uz:"Mavjud mahsulot",   en:"Items in stock"}},
        {num:"6",  suf:"",  label:{ru:"Форм и размеров",    uz:"Shakl va o‘lcham",  en:"Shapes & sizes"}},
        {num:"24", suf:"ч", label:{ru:"Отгрузка заказа",    uz:"Buyurtma jo‘natish", en:"Order dispatch"}}
      ]
    }
  ];

  const root = document.querySelector("[data-hero]");
  if(!root || SLIDES.length < 2) return;
  const $ = (s) => root.querySelector(s);

  const els = {
    mainImgs:[$('[data-h="mainImg"]'), $('[data-h="mainImgB"]')],
    sideImgs:[$('[data-h="sideImg"]'), $('[data-h="sideImgB"]')],
    badge:$('[data-h="badge"]'), t1:$('[data-h="t1"]'), t2:$('[data-h="t2"]'),
    interior:$('[data-h="interior"]'), bestS:$('[data-h="bestS"]'), bestB:$('[data-h="bestB"]'),
    store:$('[data-h="store"]'), storeLink:$('[data-h="storeLink"]'), storeOrb:$('[data-h="storeOrb"]'),
    lead:$('[data-h-lead]'), pocketInner:$('[data-h-inner]'), photo:$('.hero__photo'), stats:$('[data-hero-stats]'),
    dots:$('[data-hero-dots]')
  };
  const statNum=[$('[data-h="s0n"]'),$('[data-h="s1n"]'),$('[data-h="s2n"]')];
  const statLbl=[$('[data-h="s0l"]'),$('[data-h="s1l"]'),$('[data-h="s2l"]')];

  let idx=0, timer=null;
  const DUR=7000;
  let lang=(function(){var s=localStorage.getItem("btt_lang");return ["ru","uz","en"].includes(s)?s:"ru";})();
  const L=(o)=> (o && (o[lang]||o.ru)) || "";
  function T(k, vars){
    const d=(window.BTT_I18N&&window.BTT_I18N[lang])||(window.BTT_I18N&&window.BTT_I18N.ru)||{};
    let s=d[k]!=null?d[k]:k;
    if(vars) Object.keys(vars).forEach(key=>{ s=s.replace("{"+key+"}", vars[key]); });
    return s;
  }

  SLIDES.forEach((s,i)=>{
    const b=document.createElement("button");
    b.className="hero__sw-dot";
    b.setAttribute("aria-label", T("hero.slide", { n: i+1 }));
    b.addEventListener("click",()=>go(i,true));
    els.dots.appendChild(b);
  });
  const dotEls=Array.from(els.dots.children);
  function syncDotLabels(){
    dotEls.forEach((b,i)=> b.setAttribute("aria-label", T("hero.slide", { n: i+1 })));
  }

  function anim(){
    [els.pocketInner, els.stats, els.lead].forEach(el=>{
      if(!el) return; el.classList.remove("is-swap"); void el.offsetWidth; el.classList.add("is-swap");
    });
  }
  // crossfade two stacked <img> layers — old stays painted until new loads
  function crossfade(layers, src){
    const on = layers.find(i=>i.classList.contains("is-on")) || layers[0];
    const off = layers.find(i=>i!==on);
    if(on.getAttribute("src")===src){ return; }
    const show=()=>{ off.classList.add("is-on"); on.classList.remove("is-on"); off.onload=null; off.onerror=null; };
    off.onload=show; off.onerror=show;
    off.src=src;
    if(off.complete && off.naturalWidth) show();
  }
  function render(animate){
    const s=SLIDES[idx];
    crossfade(els.mainImgs, s.mainImg);
    crossfade(els.sideImgs, s.sideImg);
    els.badge.textContent=L(s.badge);
    els.t1.textContent=L(s.t1); els.t2.textContent=L(s.t2);
    els.interior.textContent=L(s.interior);
    els.bestS.textContent=L(s.bestS); els.bestB.textContent=L(s.bestB);
    els.store.textContent=L(s.store);
    els.storeLink.href=s.href;
    if(els.storeOrb){ els.storeOrb.href=s.href; els.storeOrb.setAttribute("aria-label", L(s.store)); }
    s.stats.forEach((st,i)=>{ if(!statNum[i])return;
      statNum[i].innerHTML=st.num+"<span>"+(st.suf||"")+"</span>";
      statLbl[i].textContent=L(st.label);
    });
    dotEls.forEach((d,i)=>d.classList.toggle("is-active",i===idx));
    if(animate) anim();
  }
  function go(n,user){ idx=(n+SLIDES.length)%SLIDES.length; render(true); if(user) start(); }
  function next(user){ go(idx+1,user); }
  function prev(user){ go(idx-1,user); }
  function start(){ stop(); timer=setInterval(()=>next(false),DUR); }
  function stop(){ if(timer){clearInterval(timer);timer=null;} }

  root.querySelector("[data-hero-next]").addEventListener("click",()=>next(true));
  root.querySelector("[data-hero-prev]").addEventListener("click",()=>prev(true));
  root.addEventListener("mouseenter",stop);
  root.addEventListener("mouseleave",start);

  let sx=null;
  root.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;},{passive:true});
  root.addEventListener("touchend",e=>{ if(sx===null)return;
    const dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)>45){ dx<0?next(true):prev(true); } sx=null;
  },{passive:true});

  new MutationObserver(()=>{
    const nl=document.documentElement.lang;
    if(nl && nl!==lang && ["ru","uz","en"].includes(nl)){ lang=nl; render(false); syncDotLabels(); }
  }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});

  render(false);
  const card=root.querySelector("[data-hero-card]");
  function enterHero(){
    if(!card) return;
    card.classList.add("is-entered");
  }
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    enterHero();
  }else{
    setTimeout(enterHero, 200);
  }
  if(!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) start();
})();
