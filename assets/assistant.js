/* ============================================================
   BENTENTRADE - site assistant "Бен"
   Self-injecting glass chat widget. Scripted, multilingual,
   segments the visitor and routes to catalog / manager.
   No backend - deterministic intent tree.
   ============================================================ */
(function(){
  const T = {
    ru:{
      name:"Бен", role:"Онлайн-помощник BTT", badge:"1",
      ph:"Напишите сообщение…",
      hi:"Здравствуйте! Я помощник BTT 🌿 Помогу подобрать обеденные столы, плетёные, пластиковые и мягкие стулья. С чего начнём?",
      quick:["Плетёные стулья","Пластиковые стулья","Мягкие стулья","Обеденные столы","Доставка","Связаться с менеджером"],
      ans:{
        "Плетёные стулья":"Плетёные стулья Vertex и Corda на прочном металлокаркасе с мягкими текстильными подушками в комплекте. Смотрите в <a href='catalog.html?cat=wicker-chairs'>каталоге</a>. Подсказать характеристики?",
        "Пластиковые стулья":"Практичные пластиковые стулья: ROERO и NOERO (до 120 кг), JARDIN (до 150 кг) и усиленный TODO (до 180 кг). Все модели в <a href='catalog.html?cat=plastic-chairs'>каталоге</a>. Какая нагрузка требуется?",
        "Мягкие стулья":"Элегантные стулья LIRA и комфортные кресла COMO на прочном металлокаркасе - идеальны для дома и HoReCa. Смотрите в <a href='catalog.html?cat=upholstered-chairs'>каталоге</a>.",
        "Обеденные столы":"Столы на металлокаркасе со столешницей из ЛДСП (Taper, Vertex, Corda) размерами 80×80 см, 135×80 см и круглый Ø90 см. Рекомендуются для помещений и крытых пространств. Смотрите в <a href='catalog.html?cat=tables'>каталоге</a>.",
        "Доставка":"Доставка по Ташкенту осуществляется за 1-2 рабочих дня по прямому тарифу сервиса доставки (Яндекс / Labo / Porter). Также возможен самовывоз со склада в Ташкенте по предварительной договорённости.",
        "Связаться с менеджером":"Конечно! Мы на связи в Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> и по телефону <a href='tel:+998771044422'>+998 77 104 44 22</a>. Ответим на любые вопросы!"
      },
      fallback:"Спасибо за вопрос! Я передам его менеджеру - он ответит детально. Пока можете посмотреть <a href='catalog.html'>каталог BTT</a> или выбрать категорию ниже 👇",
      reply:"Понял! Менеджер свяжется с вами в ближайшее время. Что-нибудь ещё?"
    },
    uz:{
      name:"Ben", role:"BTT onlayn yordamchisi", badge:"1",
      ph:"Xabar yozing…",
      hi:"Salom! Men BTT yordamchisiman 🌿 Ovqat stollari, to‘qilgan, plastik va yumshoq stullarni tanlashda yordam beraman. Nimadan boshlaymiz?",
      quick:["To‘qilgan stullar","Plastik stullar","Yumshoq stullar","Ovqat stollari","Yetkazib berish","Menejer bilan bog‘lanish"],
      ans:{
        "To‘qilgan stullar":"Metall karkasli va yumshoq yostiqchali Vertex va Corda to‘qilgan stullari. <a href='catalog.html?cat=wicker-chairs'>Katalog</a>da ko‘ring.",
        "Plastik stullar":"Amaliy plastik stullar: ROERO va NOERO (120 kg gacha), JARDIN (150 kg gacha) va baquvvat TODO (180 kg gacha). <a href='catalog.html?cat=plastic-chairs'>Katalog</a>da tanlang.",
        "Yumshoq stullar":"Uylar va kafelar uchun qulay metall karkasli LIRA stullari va COMO kreslolari. <a href='catalog.html?cat=upholstered-chairs'>Katalog</a>da ko‘ring.",
        "Ovqat stollari":"LDSP ustki qismli va metall karkasli Taper, Vertex, Corda stollari (80×80 sm, 135×80 sm va dumaloq Ø90 sm). <a href='catalog.html?cat=tables'>Katalog</a>da ko‘ring.",
        "Yetkazib berish":"Toshkent bo‘ylab yetkazish 1-2 ish kunida to‘g‘ridan-to‘g‘ri kuryer tarifi bo‘yicha amalga oshiriladi. Toshkentdagi ombordan kelishuv asosida olib ketish ham mumkin.",
        "Menejer bilan bog‘lanish":"Albatta! Telegramda <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> va telefon <a href='tel:+998771044422'>+998 77 104 44 22</a> orqali bog‘laning."
      },
      fallback:"Savolingiz uchun rahmat! Tez orada javob beramiz. Hozircha <a href='catalog.html'>BTT katalogi</a>ni ko‘rishingiz mumkin 👇",
      reply:"Tushunarli! Menejer tez orada bog‘lanadi. Yana biror narsa kerakmi?"
    },
    en:{
      name:"Ben", role:"BTT Assistant", badge:"1",
      ph:"Type a message…",
      hi:"Hello! I'm your BTT assistant 🌿 I can help you choose dining tables, wicker, plastic, and upholstered chairs. Where shall we start?",
      quick:["Wicker chairs","Plastic chairs","Upholstered chairs","Dining tables","Delivery","Talk to a manager"],
      ans:{
        "Wicker chairs":"Vertex and Corda wicker chairs on sturdy metal frames with soft cushions included. Browse them in the <a href='catalog.html?cat=wicker-chairs'>catalog</a>.",
        "Plastic chairs":"Durable plastic chairs: ROERO and NOERO (up to 120 kg), JARDIN (up to 150 kg), and reinforced TODO (up to 180 kg). View all in the <a href='catalog.html?cat=plastic-chairs'>catalog</a>.",
        "Upholstered chairs":"Elegant LIRA chairs and comfortable COMO armchairs on sturdy metal frames - perfect for home and HoReCa. See the <a href='catalog.html?cat=upholstered-chairs'>catalog</a>.",
        "Dining tables":"Chipboard dining tables on metal frames (Taper, Vertex, Corda) in 80×80 cm, 135×80 cm, and Ø90 cm round. Best for indoor and covered spaces. View in the <a href='catalog.html?cat=tables'>catalog</a>.",
        "Delivery":"Delivery across Tashkent in 1-2 business days at direct courier rates (Yandex / Labo / Porter). Warehouse pickup in Tashkent is also available by appointment.",
        "Talk to a manager":"Of course! Reach us on Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> or call <a href='tel:+998771044422'>+998 77 104 44 22</a>."
      },
      fallback:"Thank you for reaching out! You can explore the <a href='catalog.html'>BTT catalog</a> or choose a topic below 👇",
      reply:"Understood! Our manager will get back to you shortly. Can I help with anything else?"
    }
  };

  function lang(){ var s=localStorage.getItem("btt_lang"); return T[s]?s:"ru"; }

  document.addEventListener("DOMContentLoaded", function(){
    if(document.querySelector(".bot-fab")) return;

    const fab=document.createElement("button");
    fab.className="bot-fab"; fab.setAttribute("aria-label","Чат-помощник");
    fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.4-5.2A8.4 8.4 0 0 1 3.5 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg><span class="bot-fab__badge">1</span>';

    const panel=document.createElement("div");
    panel.className="bot-panel liquid spatial"; panel.setAttribute("role","dialog"); panel.setAttribute("aria-label","Bententrade assistant");
    panel.innerHTML=
      '<div class="bot-head"><div class="bot-head__ava">Б</div>'+
      '<div><div class="bot-head__t" data-bot-name>Бен</div><div class="bot-head__s" data-bot-role>Онлайн-помощник</div></div>'+
      '<button class="bot-head__x" data-bot-close aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
      '<div class="bot-msgs" data-bot-msgs></div>'+
      '<div class="bot-quick" data-bot-quick></div>'+
      '<form class="bot-input" data-bot-form><input type="text" data-bot-input autocomplete="off"><button class="bot-send" type="submit" aria-label="Отправить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg></button></form>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const msgs=panel.querySelector("[data-bot-msgs]");
    const quick=panel.querySelector("[data-bot-quick]");
    const input=panel.querySelector("[data-bot-input]");
    let started=false;

    function add(text, who){
      const m=document.createElement("div");
      m.className="bot-msg bot-msg--"+who;
      if(who === "user") m.textContent = text;
      else m.innerHTML = text;
      msgs.appendChild(m); msgs.scrollTop=msgs.scrollHeight;
      return m;
    }
    function typing(){
      const t=document.createElement("div");
      t.className="bot-typing"; t.innerHTML="<span></span><span></span><span></span>";
      msgs.appendChild(t); msgs.scrollTop=msgs.scrollHeight; return t;
    }
    function botSay(text, delay){
      const t=typing();
      setTimeout(()=>{ t.remove(); add(text,"bot"); }, delay||650);
    }
    function renderQuick(){
      const d=T[lang()]; quick.innerHTML="";
      d.quick.forEach(label=>{
        const c=document.createElement("button");
        c.className="bot-chip"; c.type="button"; c.textContent=label;
        c.addEventListener("click",()=> handle(label));
        quick.appendChild(c);
      });
    }
    function applyLang(){
      const d=T[lang()];
      const I = window.BTT_I18N || {};
      const tr = (k, fb) => (I.t ? I.t(k) : (I[lang()] && I[lang()][k]) || fb);
      panel.querySelector("[data-bot-name]").textContent=d.name;
      panel.querySelector("[data-bot-role]").textContent=d.role;
      input.placeholder=d.ph;
      fab.setAttribute("aria-label", tr("bot.aria.fab", "Чат-помощник"));
      panel.querySelector("[data-bot-close]")?.setAttribute("aria-label", tr("bot.aria.close", "Закрыть"));
      panel.querySelector(".bot-send")?.setAttribute("aria-label", tr("bot.aria.send", "Отправить"));
      renderQuick();
    }
    function handle(text){
      add(text,"user");
      const d=T[lang()];
      const ans = d.ans[text];
      botSay(ans || d.fallback, ans?700:600);
    }
    function open(){
      panel.classList.add("open"); fab.classList.add("hidden");
      if(!started){ started=true; setTimeout(()=> botSay(T[lang()].hi, 500), 250); }
      setTimeout(()=> input.focus(), 320);
    }
    function close(){ panel.classList.remove("open"); fab.classList.remove("hidden"); }

    fab.addEventListener("click", open);
    panel.querySelector("[data-bot-close]").addEventListener("click", close);
    panel.querySelector("[data-bot-form]").addEventListener("submit",(e)=>{
      e.preventDefault();
      const v=input.value.trim(); if(!v) return;
      input.value="";
      add(v,"user");
      const d=T[lang()];
      botSay(d.fallback, 700);
      setTimeout(()=> botSay(d.reply, 1500), 900);
    });

    function syncDynamicSettings(s) {
      if (!s) return;
      const phone = s.phone || "+998 77 104 44 22";
      const tg = (s.telegram || "bententradeuz").replace(/^@/, "");
      T.ru.ans["Связаться с менеджером"] = "Конечно! На связи в Telegram <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> и по телефону <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a>. Оформить заказ через корзину?";
      T.uz.ans["Menejer bilan bog‘lanish"] = "Albatta! Telegramda <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> va telefon <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a>. Buyurtmani savat orqali rasmiylashtiraymi?";
      T.en.ans["Talk to a manager"] = "Of course! We are on Telegram <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> and phone <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a>. Want to place the order via the cart?";
    }
    document.addEventListener("btt:settings", (e) => syncDynamicSettings(e.detail));
    try {
      const cached = sessionStorage.getItem("btt_settings");
      if (cached) syncDynamicSettings(JSON.parse(cached));
    } catch (_) {}

    document.addEventListener("btt:lang", applyLang);
    new MutationObserver(()=> applyLang()).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    applyLang();
  });
})();
