# Bententrade — Design Code / Дизайн-система

Полное описание дизайна и кода сайта Bententrade для дальнейшей работы.
Сайт: мебель, кашпо и корзины из **искусственного ротанга**. Гео — Узбекистан + экспорт.
Стиль по референсу **CAIRIS / Apple**: светлая тёплая база, медный (copper) акцент, крупная типографика, органичные формы, **liquid-поверхности без blur**. Поддержаны **тёмная тема** и **3 языка (RU / UZ / EN)**.

---

## 1. Структура файлов

```
index.html        Главная — герой L-форма (4 слайда), промо, коллекция, материалы
catalog.html      Каталог — герой, sticky-фильтры, сетка товаров
about.html        О нас — история, ценности, статистика (reveal)
product.html      PDP — галерея, опции, характеристики, похожие; гидратация ?id=p1…p15
contacts.html     Контакты — форма с валидацией, карта, реквизиты
account.html      Личный кабинет — обзор, заказы, избранное (из localStorage), адреса, настройки

assets/
  styles.css      Токены, типографика, кнопки, шапка, карточки, футер, тёмная тема, liquid-поверхности
  pages.css       Раскладки страниц: герой, промо, каталог, about, контакты, аккаунт, PDP, drawer, бот
  i18n.js         Словарь RU/UZ/EN (window.BTT_I18N)
  site.js         Язык, тема, reveal, фильтры каталога, формы, --head-h, бургер
  hero.js         Герой — 4 слайда, L-форма, автоплей, свайп
  catalog-hero.js Синхронизация героя каталога с фильтрами (btt:cat-change)
  products.js     Каталог данных — BTT_PRODUCTS, BTT_PRODUCT_IMG, BTT_PRODUCT_CAT
  pdp.js          PDP: гидратация, галерея, похожие товары
  cart.js         Корзина + избранное (localStorage), drawer, wireProductButtons
  account.js      Вкладки кабинета, динамическое избранное, мобильный drawer
  search.js       Spotlight-поиск
  assistant.js    Чат-помощник «Бен»
  fx.js           Микро-анимации входа страницы
  btt-logo.png    Логотип
```

### Порядок скриптов (типичная страница)

```html
<head>
  <link rel="stylesheet" href="assets/styles.css">
  <link rel="stylesheet" href="assets/pages.css">
  <!-- анти-FOUC тёмной темы -->
  <script>(function(){try{if(localStorage.getItem('btt_theme')==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();</script>
</head>
<body>
  …
  <script src="assets/i18n.js"></script>
  <script src="assets/products.js"></script>   <!-- каталог, PDP, account -->
  <script src="assets/hero.js"></script>       <!-- только index -->
  <script src="assets/catalog-hero.js"></script> <!-- только catalog -->
  <script src="assets/pdp.js"></script>        <!-- только product -->
  <script src="assets/assistant.js"></script>
  <script src="assets/search.js"></script>
  <script src="assets/site.js"></script>
  <script src="assets/cart.js"></script>       <!-- до account.js -->
  <script src="assets/account.js"></script>    <!-- только account -->
  <script src="assets/fx.js"></script>
</body>
```

---

## 2. Цвет и токены

Базовая палитра (`:root` в `styles.css`):

| Токен | Светлая | Назначение |
|---|---|---|
| `--ink` | `#1b1916` | тёмный текст, кнопки, футер |
| `--copper` / `--copper-bright` | `#bd7335` / `#e27c3d` | акцент бренда, скидки |
| `--cream` / `--cream-2` | `#f4f1ea` / `#efe9df` | тёплый фон, плейсхолдеры |
| `--paper` | `#ffffff` | фон страницы |
| `--text` / `--muted` | `#1b1916` / `#736c61` | основной и вторичный текст |
| `--line` / `--line-2` | `#e7e1d6` / `#ded7ca` | разделители |
| `--on-dark` | `#f4f1ea` | текст на тёмном |

**Liquid-поверхности** (без `backdrop-filter`):

| Токен | Назначение |
|---|---|
| `--surface-bg` | фон панелей (карточки, сайдбар, формы) |
| `--surface-brd` | бордер |
| `--liquid-sheen` | верхний блик (::before) |
| `--liquid-edge` | inset highlight |
| `--spatial-shadow` | тень глубины |

Классы: `.liquid`, `.liquid-glass`, `.glass`, `.surface` — сплошной фон + sheen, **blur отключён**.

**Тёмная тема** — `[data-theme="dark"]` переопределяет все токены выше (`--paper:#141109`, светлый `--text`, ярче медь). Переключатель — `[data-theme-toggle]`, значение в `localStorage.btt_theme`. Анти-FOUC — inline `<script>` в `<head>` каждой страницы.

Правило: **новые цвета не выдумывать** — только токены или `color-mix(in oklab, var(--copper) …)`.

---

## 3. Типографика

- **Дисплей/текст:** `Hanken Grotesque` (`--display`, `--body`).
- **Акцент-курсив:** `Cormorant Garamond` (`--serif`) — eyebrow, подписи героя.
- Заголовки: `font-weight:800`, `letter-spacing:-.02em`.
- Шкала: `.display-1` … `.display-3`, `.lead`, `.eyebrow`, `.kicker`.
- Минимум 12.5px (служебный), основной 16px.

---

## 4. Форма и тень

- Радиусы: `--r-xl:30` / `--r-lg:22` / `--r-md:16` / `--r-sm:12` / `--r-pill:100`.
- Тени: `--shadow-card`, `--shadow-soft`, `--spatial-shadow`.
- Отступы: `--gut`, `--section-y`, `--gap-grid`, `--head-h` (обновляется в `site.js` для sticky).

---

## 5. Компоненты

| Компонент | Классы / атрибуты |
|---|---|
| Кнопки | `.btn`, `.btn--dark`, `.btn--copper`, `.btn--ghost`, `.btn--sm` |
| Чипы | `.chip`, `.chip.is-active`; фильтр — `data-chips` + `data-cat` в `site.js` |
| Карточка товара | `.product`, `.product__media`, `[data-fav]`, `[data-add]`, `.see`, `.price` |
| Шапка | `.site-head` (sticky), `.nav`, `.head-tools`, `[data-cart-count]`, `[data-fav-count]` |
| Футер | `.site-foot` (тёмный), лого с медным filter |
| Герой | `.hero__frame` → `.hero__pocket`, `.hero__peek`, `.hero__base`; 4 слайда в `hero.js` |
| Каталог | `.catalog-flow`, `.cat-toolbar-wrap` (sticky), `[data-cat-count]`, `.cat-empty` |
| PDP | `.pdp-flow`, галерея, `pdp.js` + `btt:related-rendered` |
| Аккаунт | `.account-flow`, `.acc-side` (drawer на моб.), `.acc-panel`, `[data-acc-wishlist]` |
| Drawer | `.drawer`, `.drawer-scrim` — инжектится `cart.js` |
| Бот | `.bot-fab`, `.bot-panel` |

### Корзина и избранное (`cart.js`)

```
localStorage.btt_cart  → { id: {name, price, img, qty} }
localStorage.btt_favs  → { id: {name, price, img} }
```

API: `window.BTT_CART = { openCart, openFav, addToCart, wireProductButtons, getFavs, favCount }`.
Событие `btt:favs-change` — при toggle/delete избранного.
Кнопки `[data-add]` / `[data-fav]` вешает только `cart.js`.

---

## 6. Герой (4 слайда, L-форма)

Раскладка по Figma Union: CSS Grid L-форма (`hero__frame`), серая непрозрачная база (`--hero-surface`), белый «карман» с заголовком, превью справа, блок статистики.

Слайды в `SLIDES` (`hero.js`):
1. Садовая мебель (`furniture`)
2. Мебель для дома (`indoor`)
3. Искусственный ротанг (`rattan`)
4. Кашпо, сундуки и корзины (`planter`)

Автоплей 7 с, пауза на hover, стрелки, точки, свайп. Смена языка — `MutationObserver` на `<html lang>`.

---

## 7. Интернационализация

- `window.BTT_I18N = { ru, uz, en }` в `i18n.js`.
- Разметка: `data-i18n`, `data-i18n-ph`, `data-i18n-aria`.
- `site.js`: `localStorage.btt_lang`, `applyLang()`.
- Товары: `pN.name`, `pN.cat` в i18n; цены/look — в `products.js`.

---

## 8. Анимации

- `.reveal`, `.reveal--left/right`, `[data-stagger]` — появление секций (`site.js`).
- `.spatial` — лёгкий подъём на hover (осторожно на мобильных панелях).
- `prefers-reduced-motion` — отключает автоплей и тяжёлые transition.
- `fx.js` — вход страницы (`body.is-entering`).

---

## 9. Ритм страниц (flow-классы на `<main>`)

| Класс | Страница |
|---|---|
| `.home-flow` | index — секции после героя |
| `.catalog-flow` | catalog |
| `.pdp-flow` | product |
| `.about-flow` | about |
| `.contacts-flow` | contacts |
| `.account-flow` | account |

---

## 10. Как расширять

- **Новая страница:** скопировать шапку/футер, anti-FOUC, подключить CSS + скрипты по образцу.
- **Новый товар:** запись в `BTT_PRODUCTS`, ключи `pN.name`/`pN.cat` в i18n, карточка в `catalog.html` с `data-cat`.
- **PDP:** `product.html?id=pN`, данные подтянет `pdp.js`.
- **Цвета/тип** — только через токены в `styles.css`.
- **Фото** — `loremflickr` с lock в `products.js` / `hero.js`; заменить на реальные при продакшене.

---

## 11. Figma

Главная: [Bententrade — Главная](https://www.figma.com/design/4Y0JGexl7JctEsm9a9PVoB) — герой Union, 4 кадра слайдера, bento-ритм.

При расхождении кода и макета — сверять герой и bento-сетки в первую очередь.
