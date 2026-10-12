import fs from 'fs';
import path from 'path';

const funnelHtml = `<!-- ===== PRE-FOOTER CONVERSION FUNNEL ===== -->
<section class="prefoot-funnel reveal" aria-labelledby="funnel-title">
  <div class="prefoot-funnel__card">
    <div class="prefoot-funnel__header">
      <div class="prefoot-funnel__badge" data-i18n="funnel.badge">ЭКСПРЕСС-ПОДБОР МЕБЕЛИ</div>
      <h2 class="prefoot-funnel__title" id="funnel-title" data-i18n="funnel.title">Подберите комплект мебели со скидкой за 2 минуты</h2>
      <p class="prefoot-funnel__sub" data-i18n="funnel.subtitle">Рассчитаем точную стоимость в сумах, проверим складской остаток в Ташкенте и отправим персональную подборку.</p>
    </div>

    <div class="prefoot-funnel__quiz">
      <div class="prefoot-funnel__field-group">
        <span class="prefoot-funnel__field-label" data-i18n="funnel.space_label">1. Для какого пространства?</span>
        <div class="prefoot-funnel__chips" role="radiogroup" aria-label="Пространство">
          <label class="prefoot-funnel__chip">
            <input type="radio" name="funnel-space" value="Дом / терраса" checked>
            <span class="prefoot-funnel__chip-text" data-i18n="funnel.opt_terrace">Дом / терраса</span>
          </label>
          <label class="prefoot-funnel__chip">
            <input type="radio" name="funnel-space" value="Кафе / HoReCa">
            <span class="prefoot-funnel__chip-text" data-i18n="funnel.opt_horeca">Кафе / HoReCa</span>
          </label>
          <label class="prefoot-funnel__chip">
            <input type="radio" name="funnel-space" value="Сад / дача">
            <span class="prefoot-funnel__chip-text" data-i18n="funnel.opt_garden">Сад / дача</span>
          </label>
        </div>
      </div>

      <div class="prefoot-funnel__field-group">
        <span class="prefoot-funnel__field-label" data-i18n="funnel.capacity_label">2. Сколько посадочных мест?</span>
        <div class="prefoot-funnel__chips" role="radiogroup" aria-label="Вместимость">
          <label class="prefoot-funnel__chip">
            <input type="radio" name="funnel-capacity" value="4 персоны" checked>
            <span class="prefoot-funnel__chip-text" data-i18n="funnel.opt_4seats">4 персоны (стол + 4 стула)</span>
          </label>
          <label class="prefoot-funnel__chip">
            <input type="radio" name="funnel-capacity" value="6+ персон">
            <span class="prefoot-funnel__chip-text" data-i18n="funnel.opt_6seats">6+ персон (большой стол)</span>
          </label>
          <label class="prefoot-funnel__chip">
            <input type="radio" name="funnel-capacity" value="Партия от 10 комплектов">
            <span class="prefoot-funnel__chip-text" data-i18n="funnel.opt_b2b_batch">Партия от 10 комплектов</span>
          </label>
        </div>
      </div>
    </div>

    <form class="prefoot-funnel__form" novalidate>
      <div class="prefoot-funnel__input-wrap">
        <span class="prefoot-funnel__input-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </span>
        <input class="prefoot-funnel__input" type="tel" name="phone" placeholder="+998 __ ___ __ __" data-i18n-ph="funnel.phone_placeholder" autocomplete="tel" required>
      </div>
      <button class="btn btn--copper prefoot-funnel__btn" type="submit">
        <span data-i18n="funnel.btn_submit">Получить расчет в 1 клик</span>
      </button>
    </form>

    <div class="prefoot-funnel__success" role="alert">
      <h4 data-i18n="funnel.success_title">Заявка успешно принята!</h4>
      <p data-i18n="funnel.success_text">Наш менеджер свяжется с вами в течение 10-15 минут и отправит готовый расчет со спецценами.</p>
      <a class="btn btn--ghost" href="https://t.me/btt_uz" target="_blank" rel="noopener noreferrer">
        <span data-i18n="funnel.open_tg">Написать сразу в Telegram</span>
      </a>
    </div>

    <div class="prefoot-funnel__perks">
      <div class="prefoot-funnel__perk">
        <svg class="prefoot-funnel__perk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span data-i18n="funnel.perk1">Комплекты от 1 352 000 сум</span>
      </div>
      <div class="prefoot-funnel__perk">
        <svg class="prefoot-funnel__perk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <span data-i18n="funnel.perk2">Специальные цены при покупке со столом</span>
      </div>
      <div class="prefoot-funnel__perk">
        <svg class="prefoot-funnel__perk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span data-i18n="funnel.perk3">Отгрузка со склада в Ташкенте</span>
      </div>
    </div>
  </div>
</section>`;

const footerHtml = `<footer class="site-foot">
  <div class="site-foot__top">
    <!-- Col 1: Бренд и склад -->
    <div class="foot-col">
      <img src="assets/btt-logo.png" alt="BTT - мебель для дома и сада">
      <p class="muted" data-i18n="foot.tag">BTT - мебель для дома и сада. Собственное производство в Ташкенте. Столы, стулья, готовые комплекты и искусственный ротанг.</p>
      <div class="foot-info-list">
        <div class="foot-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span data-i18n="foot.warehouse">Ташкент, Сергелийский р-н (Сергели-4)</span>
        </div>
        <div class="foot-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span data-i18n="foot.hours">Пн-Сб 09:00 - 19:00, Вс 10:00 - 17:00</span>
        </div>
      </div>
    </div>

    <!-- Col 2: Каталог -->
    <div class="foot-col">
      <h5 data-i18n="foot.catalog">Каталог</h5>
      <a href="catalog.html#sets" data-i18n="foot.cat_sets">Готовые комплекты</a>
      <a href="catalog.html?category=wicker" data-i18n="foot.cat_wicker">Плетёные стулья</a>
      <a href="catalog.html?category=plastic" data-i18n="foot.cat_plastic">Пластиковые стулья</a>
      <a href="catalog.html?category=tables" data-i18n="foot.cat_tables">Столы для дома и сада</a>
      <a href="catalog.html?category=lamps" data-i18n="foot.cat_lamps">Настольные лампы</a>
      <a href="catalog.html?category=rattan" data-i18n="foot.cat_rattan">Искусственный ротанг</a>
    </div>

    <!-- Col 3: Покупателям -->
    <div class="foot-col">
      <h5 data-i18n="foot.buyers">Покупателям</h5>
      <a href="catalog.html#sets" data-i18n="foot.sets_calc">Конструктор комплектов</a>
      <a href="delivery.html" data-i18n="foot.delivery">Доставка</a>
      <a href="returns.html" data-i18n="foot.returns">Возврат</a>
      <a href="care.html" data-i18n="foot.care">Уход за мебелью</a>
      <a href="faq.html" data-i18n="foot.faq">Вопросы и ответы</a>
    </div>

    <!-- Col 4: Для бизнеса -->
    <div class="foot-col">
      <h5 data-i18n="foot.b2b">Для бизнеса</h5>
      <a href="horeca.html" data-i18n="foot.b2b_horeca">Мебель для HoReCa</a>
      <a href="horeca.html#pricing" data-i18n="foot.b2b_wholesale">Оптовые поставки</a>
      <a href="catalog.html?category=rattan" data-i18n="foot.b2b_fabrics">Ротанг для фабрик</a>
      <a href="contacts.html" data-i18n="foot.b2b_quote">Запрос коммерческого КП</a>
      <a href="about.html" data-i18n="nav.about">О производстве BTT</a>
    </div>

    <!-- Col 5: Прямая связь -->
    <div class="foot-col">
      <h5 data-i18n="foot.contacts">Контакты</h5>
      <a href="tel:+998771044422" data-i18n="co.i.phone.v">+998 77 104 44 22</a>
      <a href="mailto:hello@btt.uz">hello@btt.uz</a>
      <p style="font-size:13px;color:var(--on-dark-muted);margin-top:6px;">Telegram: @btt_uz</p>
      <div class="foot-social">
        <a class="foot-social__link" href="https://www.instagram.com/btt_uz/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
        </a>
        <a class="foot-social__link" href="https://t.me/btt_uz" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.16-.04-.23-.02-.1.02-1.74 1.1-4.91 3.25-.46.32-.88.47-1.26.46-.42-.01-1.22-.24-1.82-.43-.73-.24-1.31-.37-1.26-.78.03-.21.32-.43.88-.66 3.44-1.5 5.74-2.49 6.89-2.97 3.28-1.37 3.97-1.61 4.41-1.62.1 0 .32.02.46.14.12.1.15.24.17.34-.01.07.01.22 0 .34z"/></svg>
        </a>
        <a class="foot-social__link" href="https://wa.me/998771044422" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.197 8.197 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m-3.53 4.27c-.19 0-.5.07-.76.35-.26.28-1 1-1 2.43s1.02 2.82 1.16 3.02c.14.19 2.01 3.07 4.87 4.31.68.29 1.21.47 1.63.6.68.22 1.3.19 1.79.12.55-.08 1.69-.69 1.93-1.36.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.33-.28-.14-1.69-.83-1.95-.93-.26-.09-.45-.14-.64.14-.19.28-.74.93-.9 1.12-.17.19-.33.21-.62.07-.28-.14-1.2-.44-2.28-1.41-.85-.75-1.42-1.68-1.59-1.96-.17-.28-.02-.44.12-.58.13-.13.28-.33.43-.5.14-.17.19-.28.28-.47.1-.19.05-.35-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49-.17-.01-.36-.01-.56-.01z"/></svg>
        </a>
      </div>
    </div>
  </div>

  <!-- Trust & Payments row -->
  <div class="site-foot__trust-bar">
    <div class="site-foot__trust-items">
      <div class="site-foot__trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span data-i18n="foot.trust_prod">Собственное производство в Узбекистане</span>
      </div>
      <div class="site-foot__trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <span data-i18n="foot.trust_price">Честные цены производителя без переплат</span>
      </div>
      <div class="site-foot__trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span data-i18n="foot.trust_speed">Прямая отгрузка со склада в Ташкенте</span>
      </div>
    </div>
    <div class="site-foot__payments">
      <span class="site-foot__pay-badge">Click</span>
      <span class="site-foot__pay-badge">Payme</span>
      <span class="site-foot__pay-badge">Uzcard / Humo</span>
      <span class="site-foot__pay-badge">Наличные</span>
      <span class="site-foot__pay-badge">Банковский перевод</span>
    </div>
  </div>

  <!-- Sub-footer -->
  <div class="site-foot__bottom">
    <span data-i18n="foot.copy">© 2026 BTT. ВСЕ ПРАВА ЗАЩИЩЕНЫ.</span>
    <span class="foot-legal"><a href="cookies.html" data-i18n="foot.cookies">ФАЙЛЫ COOKIE</a><a href="privacy.html" data-i18n="foot.privacy">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</a></span>
  </div>
</footer>`;

const mobileBarHtml = `<!-- ===== MOBILE FUNNEL BAR ===== -->
<aside class="mobile-funnel-bar" aria-label="Быстрые действия">
  <a class="mobile-funnel-bar__btn mobile-funnel-bar__btn--ghost" href="tel:+998771044422" aria-label="Позвонить в BTT">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    <span data-i18n="funnel.mobile_call">Звонок</span>
  </a>
  <a class="mobile-funnel-bar__btn mobile-funnel-bar__btn--ghost" href="https://t.me/btt_uz" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.16-.04-.23-.02-.1.02-1.74 1.1-4.91 3.25-.46.32-.88.47-1.26.46-.42-.01-1.22-.24-1.82-.43-.73-.24-1.31-.37-1.26-.78.03-.21.32-.43.88-.66 3.44-1.5 5.74-2.49 6.89-2.97 3.28-1.37 3.97-1.61 4.41-1.62.1 0 .32.02.46.14.12.1.15.24.17.34-.01.07.01.22 0 .34z"/></svg>
    <span data-i18n="funnel.mobile_tg">Telegram</span>
  </a>
  <a class="mobile-funnel-bar__btn mobile-funnel-bar__btn--primary" href="catalog.html#sets" data-funnel-action="sets">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    <span data-i18n="funnel.mobile_sets">Подобрать комплект</span>
  </a>
</aside>`;

const funnelPages = ['index.html', 'catalog.html', 'sets.html', 'horeca.html'];

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const isCrlf = content.includes('\r\n');
  const lfContent = content.replace(/\r\n/g, '\n');

  // Replace <footer class="site-foot">...</footer>
  const footRegex = /<footer class="site-foot">[\s\S]*?<\/footer>/;
  if (!footRegex.test(lfContent)) {
    console.log(`Skipping ${file}: no site-foot found`);
    continue;
  }

  const needsFunnel = funnelPages.includes(file);

  let newSection = '';
  if (needsFunnel && !lfContent.includes('class="prefoot-funnel')) {
    newSection += funnelHtml + '\n\n';
  }
  newSection += footerHtml;
  if (needsFunnel && !lfContent.includes('class="mobile-funnel-bar')) {
    newSection += '\n\n' + mobileBarHtml;
  }

  let updatedLf = lfContent.replace(footRegex, newSection);

  // If mobileBarHtml was already there or if needsFunnel added it, ensure no duplicate
  const finalContent = isCrlf ? updatedLf.replace(/\n/g, '\r\n') : updatedLf;
  fs.writeFileSync(file, finalContent, 'utf8');
  console.log(`Updated footer in ${file}${needsFunnel ? ' (+funnel & mobile-bar)' : ''}`);
}
