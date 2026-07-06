import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const cartOld =
  '<a class="icon-btn" href="catalog.html" data-i18n-aria="tool.cart" aria-label="Корзина"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span class="count" data-cart-count style="display:none">0</span></a>';

const cartNew =
  '<button type="button" class="icon-btn" data-cart-open data-i18n-aria="tool.cart" aria-label="Корзина"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span class="count" data-cart-count style="display:none">0</span></button>';

const drawerTools = `  <div class="mobile-drawer__tools">
    <button type="button" class="mobile-drawer__tool" data-cart-open>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
      <span data-i18n="tool.cart">Корзина</span>
      <span class="count" data-cart-count style="display:none">0</span>
    </button>
    <button type="button" class="mobile-drawer__tool" data-fav-open>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>
      <span data-i18n="tool.fav">Избранное</span>
      <span class="count" data-fav-count style="display:none">0</span>
    </button>
  </div>
`;

let n = 0;
for (const f of readdirSync(root)) {
  if (!f.endsWith(".html")) continue;
  const p = join(root, f);
  let html = readFileSync(p, "utf8");
  const before = html;
  if (html.includes(cartOld)) html = html.replace(cartOld, cartNew);
  if (!html.includes("mobile-drawer__tools")) {
    html = html.replace(
      /data-i18n="nav\.contacts">Контакты<\/a>\r?\n<\/nav>/,
      'data-i18n="nav.contacts">Контакты</a>\n' + drawerTools + "</nav>",
    );
  }
  if (html !== before) {
    writeFileSync(p, html, "utf8");
    n++;
  }
}
console.log("updated " + n + " html files");
