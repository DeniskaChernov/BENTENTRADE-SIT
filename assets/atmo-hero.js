/* Bententrade — mid-page atmosphere hero (lifestyle carousel) */
(function(){
  const SLIDES = [
    {
      img: "assets/scene-dining-beige.png",
      loc: { ru:"Гостиная", uz:"Mehmonxona", en:"Living room" },
      title: { ru:"Уют, в который хочется вернуться", uz:"Qaytishni xohlagan qulaylik", en:"Comfort you want to come home to" },
      sub: { ru:"Мягкий свет, натуральные фактуры и мебель, которая живёт в интерьере, а не на белом фоне.", uz:"Yumshoq yorug‘lik, tabiiy tekstura va ichkarida yashaydigan mebel.", en:"Soft light, natural textures and furniture that lives in the room — not on a white backdrop." },
      href: "catalog.html?cat=indoor"
    },
    {
      img: "assets/scene-dining-warm.png",
      loc: { ru:"Вечер дома", uz:"Uyda kechki vaqt", en:"Evening at home" },
      title: { ru:"Тепло вечернего света", uz:"Kechki yorug‘lik iliqligi", en:"The warmth of evening light" },
      sub: { ru:"Обеденная зона как центр семейных встреч — спокойно, стильно, по-настоящему.", uz:"Oila uchrashuvlari markazi — xotirjam va zamonaviy.", en:"A dining zone as the heart of family gatherings — calm, stylish, real." },
      href: "catalog.html?cat=indoor"
    },
    {
      img: "assets/scene-dining-teal.png",
      loc: { ru:"Кухня-столовая", uz:"Oshxona-zal", en:"Kitchen-dining" },
      title: { ru:"Современная открытая планировка", uz:"Zamonaviy ochiq reja", en:"Modern open plan" },
      sub: { ru:"Светлые деревянные поверхности и акцентная обивка — интерьер с характером.", uz:"Yorug‘ yog‘och va ta’kidli qoplamalar — xarakterli interyer.", en:"Light wood surfaces and bold upholstery — an interior with character." },
      href: "catalog.html?cat=furniture"
    },
    {
      img: "assets/scene-dining-azure.png",
      loc: { ru:"Светлый зал", uz:"Yorug‘ zal", en:"Bright dining hall" },
      title: { ru:"Воздух и пространство", uz:"Havo va makon", en:"Air and space" },
      sub: { ru:"Большие окна, рассеянный дневной свет — мебель, которая не перегружает комнату.", uz:"Katta derazalar, yumshoq kunduzgi yorug‘lik — xonani bosib olmaydigan mebel.", en:"Large windows, diffused daylight — furniture that never overwhelms the room." },
      href: "catalog.html?cat=indoor"
    },
    {
      img: "assets/scene-dining-marble.png",
      loc: { ru:"Патио-столовая", uz:"Patio-ovqat", en:"Patio dining" },
      title: { ru:"Мрамор и плетение", uz:"Mramor va to‘quv", en:"Marble and weave" },
      sub: { ru:"Контраст фактур: холодный камень, тёплая обивка и ротанг, который служит годами.", uz:"Tekstura kontrasti: sovuq tosh, iliq qoplama va yillar xizmat qiladigan rotang.", en:"A play of textures: cool stone, warm upholstery and rattan built to last." },
      href: "catalog.html?cat=furniture"
    },
    {
      img: "assets/scene-dining-contrast.png",
      loc: { ru:"Дизайн-интерьер", uz:"Dizayn-interyer", en:"Design interior" },
      title: { ru:"Смелые акценты", uz:"Jasur ta’kidlar", en:"Bold accents" },
      sub: { ru:"Оранжевая обивка, графичные линии стола — атмосфера, а не просто каталог.", uz:"To‘q sariq qoplama, grafik chiziqlar — atmosfera, shunchaki katalog emas.", en:"Orange upholstery, graphic table lines — atmosphere, not just a catalog." },
      href: "catalog.html?cat=indoor"
    }
  ];

  const root = document.querySelector("[data-atmo-hero]");
  if(!root || SLIDES.length < 2) return;
  const $ = (s) => root.querySelector(s);

  const els = {
    imgs: [$('[data-a="img"]'), $('[data-a="imgB"]')],
    loc: $('[data-a="loc"]'),
    title: $('[data-a="title"]'),
    sub: $('[data-a="sub"]'),
    cta: $('[data-a="cta"]'),
    link: $('[data-a="link"]'),
    dots: $('[data-atmo-dots]')
  };

  let idx = 0, timer = null;
  const DUR = 8000;
  let lang = (function(){ var s = localStorage.getItem("btt_lang"); return ["ru","uz","en"].includes(s) ? s : "ru"; })();
  const L = (o) => (o && (o[lang] || o.ru)) || "";

  els.dots.setAttribute("role", "tablist");
  SLIDES.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "hero__sw-dot";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Слайд " + (i + 1));
    b.addEventListener("click", () => go(i, true));
    els.dots.appendChild(b);
  });
  const dotEls = Array.from(els.dots.children);

  function crossfade(layers, src){
    const on = layers.find(i => i.classList.contains("is-on")) || layers[0];
    const off = layers.find(i => i !== on);
    if(on.getAttribute("src") === src) return;
    const show = () => { off.classList.add("is-on"); on.classList.remove("is-on"); off.onload = null; off.onerror = null; };
    off.onload = show; off.onerror = show;
    off.src = src;
    if(off.complete && off.naturalWidth) show();
  }

  function anim(){
    [els.loc, els.title, els.sub, els.cta].forEach(el => {
      if(!el) return;
      el.classList.remove("is-swap");
      void el.offsetWidth;
      el.classList.add("is-swap");
    });
  }

  function render(user){
    const s = SLIDES[idx];
    crossfade(els.imgs, s.img);
    if(els.loc) els.loc.textContent = L(s.loc);
    if(els.title) els.title.textContent = L(s.title);
    if(els.sub) els.sub.textContent = L(s.sub);
    if(els.link) els.link.href = s.href;
    dotEls.forEach((d, i) => {
      const on = i === idx;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });
    if(user) anim();
  }

  function go(n, user){ idx = (n + SLIDES.length) % SLIDES.length; render(user); if(user) start(); }
  function next(user){ go(idx + 1, user); }
  function prev(user){ go(idx - 1, user); }
  function start(){ stop(); timer = setInterval(() => next(false), DUR); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  root.querySelector("[data-atmo-next]").addEventListener("click", () => next(true));
  root.querySelector("[data-atmo-prev]").addEventListener("click", () => prev(true));
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);

  new MutationObserver(() => {
    const nl = document.documentElement.lang;
    if(nl && nl !== lang && ["ru","uz","en"].includes(nl)){ lang = nl; render(false); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const card = root.querySelector(".atmo-hero__card");
  function enter(){
    if(card) card.classList.add("is-entered");
  }
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) enter();
  else setTimeout(enter, 120);

  render(false);
  if(!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) start();
})();
