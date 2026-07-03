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

## Языки и тема

- **RU / UZ / EN** — `assets/i18n.js`, переключатель в шапке
- **Светлая / тёмная** — `[data-theme-toggle]`, `localStorage.btt_theme`

## Ключевые скрипты

- `site.js` — язык, тема, reveal, фильтры, a11y
- `hero.js` — слайдер героя (только главная)
- `cart.js` — корзина и избранное (localStorage)
- `pdp.js` — гидратация PDP
- `products.js` — каталог данных

Подробная дизайн-система — в [`DESIGN.md`](DESIGN.md).

## Запуск

Откройте `index.html` в браузере или разверните как статический сайт (GitHub Pages, Cloudflare Pages и т.п.).

## Бренд

- Шрифты: Hanken Grotesque, Cormorant Garamond (Google Fonts)
- Цвета: `--ink`, `--copper`, `--cream`, `--paper` — см. `assets/styles.css`
- Фото: loremflickr (заглушки); заменить на реальные снимки в `products.js` / `hero.js`
