# Bententrade — сайт

Многостраничный сайт бренда **Bententrade**: мебель, кашпо и корзины из **искусственного ротанга**. Стиль CAIRIS/Apple — светлая тёплая база, медный акцент, крупная типографика, liquid-поверхности без blur.

## Страницы

| Файл | Назначение |
|------|------------|
| `index.html` | Главная — герой L-форма (4 слайда), bento, коллекция |
| `catalog.html` | Каталог — герой по категории, фильтры, 15 товаров |
| `product.html` | Карточка товара — галерея, опции, похожие (`?id=p1…p15`) |
| `about.html` | О нас |
| `contacts.html` | Контакты и форма |
| `account.html` | Личный кабинет |
| `blog.html` / `article.html` | Журнал статей (API) |
| `faq.html`, `delivery.html`, `returns.html`, `care.html`, `privacy.html` | Инфо-страницы |
| `login.html` | Вход / регистрация |

## Языки и тема

- **RU / UZ / EN** — `assets/i18n.js`, переключатель в шапке
- **Светлая / тёмная** — `[data-theme-toggle]`, `localStorage.btt_theme`

## Ключевые скрипты

- `util.js` — общие хелперы (`lang`, `t`, `esc`, SVG-иконки карточек)
- `api.js` + `catalog-sync.js` — CRM API, синхронизация каталога и витрины
- `site.js` — язык, тема, reveal, фильтры, FAQ-аккордеон, a11y
- `hero.js` — слайдер героя (только главная)
- `cart.js` — корзина, checkout, избранное (localStorage + sync с API)
- `pdp.js` — гидратация PDP
- `blog.js` — список и статьи журнала
- `products.js` — статический каталог (фолбэк)

Подробная дизайн-система — в [`DESIGN.md`](DESIGN.md).

## Запуск

Откройте `index.html` в браузере или разверните как статический сайт (GitHub Pages, Cloudflare Pages и т.п.).

## Бренд

- Шрифты: Hanken Grotesque, Cormorant Garamond (Google Fonts)
- Цвета: `--ink`, `--copper`, `--cream`, `--paper` — см. `assets/styles.css`
- Фото: loremflickr (заглушки); заменить на реальные снимки в `products.js` / `hero.js`
