import { writeFileSync } from "fs";

const IMG = {
  garden: "assets/hero-garden-furniture.png",
  home: "assets/hero-home-furniture.png",
  rattan: "assets/hero-rattan.png",
  planter: "assets/bento-planter.png",
  bento: "assets/bento-rattan.png",
  warm: "assets/scene-dining-warm.png",
  teal: "assets/scene-dining-teal.png",
  cream: "assets/scene-dining-cream.png",
  palette: "assets/rattan-palette-hero.png",
  tobacco: "assets/rattan-profile-0609-tobacco.png",
  woody: "assets/rattan-profile-1505-woody.png",
  heroPlanter: "assets/hero-planter.png",
  twisted: "assets/bento-twisted-rattan.png",
};

function art(slug, date, cover, keywords, ru, uz, en) {
  return { slug, published_at: date, cover_media: cover, keywords, i18n: { ru, uz, en } };
}

const articles = [
  art("sadovaya-mebel-rotang-tashkent", "2026-04-22", IMG.garden,
    "садовая мебель ротанг ташкент, купить садовую мебель узбекистан, плетеная мебель терраса",
    {
      title: "Садовая мебель из ротанга в Ташкенте: как выбрать комплект",
      excerpt: "Диваны, кресла и обеденные группы для террасы и дачи — на что смотреть перед покупкой в Узбекистане.",
      body: `Садовая мебель из искусственного ротанга — один из самых частых запросов в Ташкенте: жаркий климат, яркое солнце и перепады температур требуют материала, который не выцветает и не требует ежегодного ухода маслом.

## Почему ротанг подходит для улицы Узбекистана

Искусственный ротанг (PE) окрашен в массе, не впитывает влагу и выдерживает ультрафиолет. В отличие от натурального плетения, ему не страшны ночная роса и летние ливни — достаточно протереть влажной тканью.

- Не гниёт и не трескается на морозе
- Каркас из алюминия не ржавеет
- Плетение держит форму 5–10 лет при нормальной эксплуатации

![Садовая обеденная группа](${IMG.warm})

## Какой комплект выбрать

Для небольшой террасы подойдут два кресла и журнальный столик. Для семьи из 4–6 человек — угловой диван или обеденная группа на 4–8 мест.

### Размеры и эргономика

Перед заказом измерьте площадку: оставьте 70–90 см прохода вокруг стола. Сиденья с глубиной 48–52 см удобнее для длительных посиделок.

## Цвет и плетение

Для улицы лучше Tobacco, Woody или Graphite — меньше видны пыль и следы от рук. Плотное плетение полумесяц 10 мм выглядит премиально и служит дольше рыхлого.

![Палитра профилей](${IMG.palette})

## Где купить в Ташкенте

В Bententrade мебель плетётся в мастерской в Ташкенте — можно посмотреть образцы, подобрать комплект и заказать доставку по городу и области. Напишите в Telegram @bententradeuz — менеджер рассчитает комплект и сроки.`,
    },
    {
      title: "Toshkentda bog‘ mebeli: rotang to‘plamini qanday tanlash",
      excerpt: "Terassa va dacha uchun divan, kreslo va ovqat guruhlari — O‘zbekistonda xarid qilishdan oldin.",
      body: `Sun’iy rotangdan bog‘ mebeli Toshkentda eng ko‘p qidiriladigan mahsulotlardan biri.

## Nima uchun rotang mos

PE tolasi quyosh va yomg‘irga chidamli, massada bo‘yalgan.

- Chirmaydi
- Alyumin karkas zanglamaydi
- 5–10 yil xizmat qiladi

![Ovqat guruhi](${IMG.warm})

## Qanday to‘plam

Kichik terassa — 2 kreslo va stol. Katta oila — burchakli divan yoki 6–8 o‘rinli stol.

## Qayerdan sotib olish

Bententrade Toshkentda ishlab chiqaradi. Telegram @bententradeuz.`,
    },
    {
      title: "Garden rattan furniture in Tashkent: how to choose a set",
      excerpt: "Sofas, chairs and dining groups for terrace and dacha — what to check before buying in Uzbekistan.",
      body: `Synthetic rattan garden furniture is a top search in Tashkent because heat and UV demand a low-maintenance material.

## Why rattan works outdoors

PE fibre is coloured through, won't rot, and aluminium frames don't rust.

![Dining set](${IMG.warm})

## Which set to pick

Small terrace: two chairs and a coffee table. Family of six: corner sofa or dining for eight.

## Buy in Tashkent

Bententrade weaves in our Tashkent workshop. Message @bententradeuz on Telegram.`,
    }),
  art("kashpo-iz-iskusstvennogo-rotanga", "2026-04-28", IMG.planter,
    "кашпо из ротанга, кашпо искусственный ротанг, плетеные кашпо ташкент",
    {
      title: "Кашпо из искусственного ротанга: для сада, террасы и интерьера",
      excerpt: "Плетёные кашпо не боятся дождя, легко моются и подчёркивают зелень — гид по размерам и формам.",
      body: `Кашпо из искусственного ротанга совмещают декоративное плетение и практичность: влага не разрушает материал, а вес меньше, чем у керамики того же объёма.

## Преимущества перед керамикой и пластиком

- Устойчивы к УФ и морозу
- Не трескаются от перепадов температуры
- Можно мыть из шланга (без агрессивной химии)
- Выглядят как премиальное плетение

![Кашпо для террасы](${IMG.heroPlanter})

## Размеры под растения

Для фикуса и монстеры — кашпо от 35 см диаметра с дренажом. Для трав и суккулентов — низкие широкие модели. На балконе используйте кашпо с поддоном.

### Комплекты

Набор из 3–5 кашпо одного стиля визуально собирает зону отдыха. В каталоге Bententrade есть готовые комплекты и индивидуальные размеры.

## Уход

Раз в месяц протрите плетение мягкой щёткой. Зимой кашпо можно оставить с растениями, если дренаж не застаивается.

## Заказ в Ташкенте

Подберём форму и цвет под ваш проект — @bententradeuz в Telegram.`,
    },
    { title: "Sun’iy rotang gultuvaklari", excerpt: "Bog‘, terassa va interyer uchun.", body: `Rotang gultuvaklari namlikka chidamli.\n\n![Gultuvak](${IMG.heroPlanter})\n\nBententrade — @bententradeuz.` },
    { title: "Synthetic rattan planters", excerpt: "For garden, terrace and interior.", body: `Won't crack in frost, easy to wash.\n\n![Planter](${IMG.heroPlanter})\n\nOrder via @bententradeuz.` }),
  art("korziny-sunduki-rotang", "2026-05-05", IMG.home,
    "корзины из ротанга, плетеные корзины, сундук ротанг хранение",
    {
      title: "Корзины и сундуки из ротанга для хранения",
      excerpt: "Плетёные корзины для белья, игрушек и пикника — аккуратный дом и терраса без визуального шума.",
      body: `Корзины и сундуки из искусственного ротанга решают задачу хранения без «пластикового» вида. Их ставят в спальню, ванную, на террасу и в детскую.

## Где использовать

- Корзина для белья в ванной — материал не боится влажности
- Сундук на балконе — подушки и текстиль
- Корзина для пикника — лёгкая, с крышкой

![Мебель и хранение](${IMG.home})

## На что обратить внимание

Выбирайте плотное дно и усиленный каркас, если планируете тяжёлые вещи. Крышка на сундуке защищает от пыли и дождя на открытой террасе.

### Размеры

Измерьте нишу под сундук заранее — мы делаем нестандартные габариты на заказ в Ташкенте.

## Уход

Протирка влажной тканью раз в 2–3 недели. Не ставьте острые предметы вплотную к плетению без прокладки.

Закажите в каталоге или напишите @bententradeuz.`,
    },
    { title: "Rotang savatlar va sandiqlar", excerpt: "Uy va terassa uchun saqlash.", body: `Savatlar namlikka chidamli.\n\n![Saqlash](${IMG.home})\n\n@bententradeuz` },
    { title: "Rattan baskets and chests", excerpt: "Storage for home and terrace.", body: `Woven storage without plastic look.\n\n![Storage](${IMG.home})\n\n@bententradeuz` }),
  art("kupit-rotang-buhtami", "2026-05-12", IMG.rattan,
    "купить ротанг бухтами, искусственный ротанг оптом ташкент, ротанг для плетения",
    {
      title: "Купить искусственный ротанг бухтами в Ташкенте",
      excerpt: "Профили полумесяц, круг и плоский — для мастерских, мебельщиков и B2B. Палитра и образцы.",
      body: `Если вы мебельщик, дизайнер или открываете мастерскую, ротанг бухтами выгоднее готовой мебели: вы контролируете форму и маржу.

## Какие профили бывают

- Полумесяц 8–10 мм — мебель и сиденья
- Круглый 6–8 мм — декор и детали
- Плоский — обивка и рамки

![Ротанг бухтами](${IMG.rattan})

## Как заказать

1. Выберите профиль и цвет из палитры Tobacco, Woody, Brown, Graphite, Choco
2. Укажите метраж или число бухт
3. Получите образец перед крупной партией

### Для B2B

Стабильные партии, артикулы 0609, 1505, 0704, 2404. Склад в Ташкенте — самовывоз или доставка по Узбекистану.

## Качество Bententrade

Собственное производство — окраска в массе, контроль диаметра, без «пустого» ядра. Напишите @bententradeuz для прайса.`,
    },
    { title: "Toshkentda rotang g‘iloflab sotib olish", excerpt: "Ustalar va B2B uchun.", body: `Profil va rang tanlang.\n\n![Rotang](${IMG.rattan})\n\n@bententradeuz` },
    { title: "Buy synthetic rattan by the coil in Tashkent", excerpt: "Profiles for workshops and B2B.", body: `Half-moon, round and flat profiles.\n\n![Coils](${IMG.rattan})\n\n@bententradeuz` }),
  art("mebel-rotang-dlya-kafe", "2026-05-20", IMG.teal,
    "мебель ротанг для кафе, уличная мебель ресторан, терраса кафе узбекистан",
    {
      title: "Мебель из ротанга для кафе и ресторанов",
      excerpt: "Уличные зоны, веранды и летние площадки — износостойкое плетение и быстрая замена подушек.",
      body: `Для HoReCa в Ташкенте и по Узбекистану мебель из искусственного ротанга — баланс между эстетикой и износостойкостью. Гости видят «премиальное плетение», а персонал тратит минимум времени на уход.

## Что ставят чаще всего

- Обеденные группы на 4 места — для витрин и улицы
- Барные стулья у стойки
- Угловые диваны для lounge-зон

![Зона кафе](${IMG.teal})

## Коммерческая эксплуатация

- Плотное плетение выдерживает ежедневную нагрузку
- Подушки меняются по сезону (чехлы в комплекте)
- Алюминиевый каркас — без коррозии от напитков и влаги

### Логистика

Поставляем партиями, собираем на объекте. Возможен нестандарт под планировку зала.

## Связь с Bententrade

Коммерческое предложение и 3D-подбор по фото зала — @bententradeuz.`,
    },
    { title: "Kafe va restoranlar uchun rotang mebel", excerpt: "Ko‘cha zonalar va verandalar.", body: `Izosh qoplamasi va tez parvarish.\n\n![Kafe](${IMG.teal})\n\n@bententradeuz` },
    { title: "Rattan furniture for cafés and restaurants", excerpt: "Outdoor seating that lasts.", body: `Dense weave, aluminium frame.\n\n![Café](${IMG.teal})\n\n@bententradeuz` }),
  art("pletennaya-mebel-dlya-doma", "2026-05-28", IMG.cream,
    "плетеная мебель для дома, ротанг интерьер, мебель для гостиной ротанг",
    {
      title: "Плетёная мебель из ротанга для дома и гостиной",
      excerpt: "Кресла, комоды и стеллажи — тёплая фактура без тяжёлого ухода, подходит для квартиры.",
      body: `Плетёная мебель в интерьере возвращает ощущение натуральности, но искусственный ротанг не требует климат-контроля как лоза.

## Куда ставить в квартире

- Гостиная — кресло-качалка или пара кресел у окна
- Прихожая — узкий комод для обуви и аксессуаров
- Спальня — корзины и прикроватные столики

![Интерьер с плетением](${IMG.cream})

## Стиль и сочетания

Ротанг хорошо работает с льном, хлопком и светлым деревом. Цвета Woody и Tobacco тёплые; Graphite — для современных интерьеров.

### Размеры для типовых квартир

Компактные модели не перегружают пространство 18–25 м². Закажите индивидуальный размер под нишу.

## Доставка

По Ташкенту — 1–3 дня после готовности. @bententradeuz`,
    },
    { title: "Uy va mehmonxona uchun to‘qima mebel", excerpt: "Kreslo, komod, javon.", body: `Interyerda tabiiy ko‘rinish.\n\n![Uy](${IMG.cream})\n\n@bententradeuz` },
    { title: "Woven rattan furniture for home", excerpt: "Living room chairs and storage.", body: `Warm texture, easy care.\n\n![Home](${IMG.cream})\n\n@bententradeuz` }),
  art("dostavka-rotanga-po-uzbekistanu", "2026-06-05", IMG.garden,
    "доставка мебели ротанг узбекистан, доставка ротанга ташкент, bententrade доставка",
    {
      title: "Доставка мебели и ротанга по Узбекистану",
      excerpt: "Ташкент, область и регионы — сборка, упаковка и сроки. Как мы организуем логистику.",
      body: `Bententrade доставляет плетёную мебель, кашпо и ротанг бухтами по Узбекистану. Ниже — как устроен процесс, чтобы вы заранее планировали сроки.

## Ташкент и Ташкентская область

- Доставка 1–3 рабочих дня после готовности
- Сборка на месте для крупной мебели
- Оплата по договорённости: наличные, перевод

## Регионы

Отправляем в Самарканд, Бухару, Фергану, Наманган и другие города. Срок зависит от объёма — менеджер назовёт дату при оформлении.

![Доставка комплекта](${IMG.garden})

## Упаковка

Мебель фиксируется стрейч-плёнкой и картоном на углах. Бухты ротанга — в плотной упаковке, без перегибов.

### Самовывоз

Шоурум в Ташкенте — можно забрать заказ самостоятельно по согласованию.

## Оформить доставку

Telegram @bententradeuz или форма на сайте после принятия cookie.`,
    },
    { title: "O‘zbekiston bo‘ylab yetkazib berish", excerpt: "Toshkent va viloyatlar.", body: `1–3 kun ichida Toshkent.\n\n![Yetkazish](${IMG.garden})\n\n@bententradeuz` },
    { title: "Delivery across Uzbekistan", excerpt: "Tashkent and regions.", body: `Assembly on site in capital.\n\n![Delivery](${IMG.garden})\n\n@bententradeuz` }),
  art("rotang-dlya-balkona", "2026-06-12", IMG.bento,
    "ротанг для балкона, мебель балкон узбекистан, компактная мебель терраса",
    {
      title: "Мебель из ротанга для балкона и лоджии",
      excerpt: "Компактные кресла, столики и кашпо — легко переставить и не боится перепадов температуры.",
      body: `Балкон и лоджия в многоэтажках Ташкента — мини-терраса. Мебель должна быть лёгкой, узкой и устойчивой к солнцу через стекло.

## Оптимальные модели

- Складное или узкое кресло 55–60 см шириной
- Прикроватный/балконный столик 40×40 см
- Высокое кашпо для вертикального озеленения

![Компактный ротанг](${IMG.bento})

## Материалы

Искусственный ротанг не высыхает как натуральный при нагреве от панорамного окна. Металлический каркас фиксируйте от опрокидывания ветром.

### Хранение

На зиму кресла можно оставить на застеклённом балконе; подушки — в квартиру.

## Заказ

Подберём габариты по вашим замерам — @bententradeuz.`,
    },
    { title: "Balkon va lodjiya uchun rotang", excerpt: "Ixcham kreslo va stol.", body: `Quyoshga chidamli.\n\n![Balkon](${IMG.bento})\n\n@bententradeuz` },
    { title: "Rattan for balcony and loggia", excerpt: "Compact chairs and tables.", body: `UV-stable PE weave.\n\n![Balcony](${IMG.bento})\n\n@bententradeuz` }),
  art("palitra-tsvetov-rotanga-bententrade", "2026-06-20", IMG.palette,
    "палитра ротанга, цвета искусственного ротанга, tobacco woody graphite",
    {
      title: "Палитра цветов искусственного ротанга Bententrade",
      excerpt: "Tobacco, Woody, Brown, Graphite, Choco — как выбрать оттенок под интерьер и фасад.",
      body: `Цвет ротанга задаёт характер всей зоны отдыха. В Bententrade палитра построена на натуральных древесных тонах — без кислотных оттенков, которые выгорают неравномерно.

## Базовые цвета

- **Tobacco (0609)** — тёплый табак, универсален для сада
- **Woody (1505)** — светлое дерево, освежает интерьер
- **Brown (0704)** — глубокий коричневый для контраста с бетоном
- **Graphite** — современный серо-коричневый
- **Choco (2404)** — насыщенный шоколад для акцентов

![Палитра профилей](${IMG.palette})

## Как сочетать

На открытом воздухе Tobacco и Graphite меньше маркие. В интерьере Woody визуально расширяет пространство.

### Образцы

Закажите набор образцов 15–20 см — привезём в Ташкент или отправим с заказом. @bententradeuz

## Нестандарт

Любой цвет под заказ от одной бухты — согласуем эталон до производства.`,
    },
    { title: "Bententrade rotang rang palitrasi", excerpt: "Tobacco, Woody, Graphite.", body: `5 asosiy rang.\n\n![Palitra](${IMG.palette})\n\n@bententradeuz` },
    { title: "Bententrade rattan colour palette", excerpt: "Wood tones for outdoor and indoor.", body: `Five base shades plus custom.\n\n![Palette](${IMG.palette})\n\n@bententradeuz` }),
  art("oformlenie-terassi-rotangom", "2026-06-28", IMG.warm,
    "оформление террасы ротанг, дизайн террасы узбекистан, зона отдыха терраса",
    {
      title: "Как оформить террасу ротанговой мебелью",
      excerpt: "Зонирование, свет, текстиль и растения — пошаговый гид для уютной террасы в Ташкенте.",
      body: `Терраса — продолжение гостиной на воздухе. Ротанговая мебель задаёт стиль, но важны пропорции, свет и аксессуары.

## Шаг 1: зонирование

Выделите dining (стол+стулья), lounge (диван+кресла) и green (кашпо). Между зонами оставьте проход 80 см.

## Шаг 2: мебель

Выберите один цвет плетения — Tobacco или Woody для тепла. Добавьте один акцент: кашпо или столик другого оттенка.

![Терраса с обеденной зоной](${IMG.warm})

## Шаг 3: текстиль

Подушки из Sunbrella или аналога, светлые покрывала. Храните в чехлах на зиму.

### Освещение

Тёплый LED 2700–3000K по периметру — терраса usable вечером.

## Шаг 4: растения

Высокие кашпо из ротанга с фикусом или оливой визуально «потолок» зоны.

## Реализация с Bententrade

Комплект под ключ + доставка — @bententradeuz. Можем изготовить нестандартные размеры под вашу планировку.`,
    },
    { title: "Terassani rotang bilan bezash", excerpt: "Zonalar va yoritish.", body: `4 qadamli qo‘llanma.\n\n![Terassa](${IMG.warm})\n\n@bententradeuz` },
    { title: "Terrace styling with rattan furniture", excerpt: "Zones, light and plants.", body: `Step-by-step guide.\n\n![Terrace](${IMG.warm})\n\n@bententradeuz` }),
];

writeFileSync("data/articles-seo.json", JSON.stringify({ articles }, null, 2), "utf8");
console.log("Wrote", articles.length, "articles to data/articles-seo.json");
