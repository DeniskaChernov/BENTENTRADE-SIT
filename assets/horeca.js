/* ============================================================
   BTT - HoReCa B2B Interactive Seating & Budget Calculator
   Strict pricing policy: verified set prices, zero em-dash.
   ============================================================ */
(function () {
  "use strict";

  const SET_PRICES = {
    cafe: {
      wicker: {
        pricePerSet: 2676000,
        tableNameRu: "Стол Vertex D90 + 4 плетёных стула Vertex / Corda",
        tableNameUz: "Vertex D90 stoli + 4 ta to'qilgan Vertex / Corda stuli",
        tableNameEn: "Vertex D90 table + 4 woven Vertex / Corda chairs"
      },
      plastic: {
        pricePerSet: 1352000,
        tableNameRu: "Стол Vertex D90 + 4 стула Roero",
        tableNameUz: "Vertex D90 stoli + 4 ta Roero stuli",
        tableNameEn: "Vertex D90 table + 4 Roero chairs"
      }
    },
    terrace: {
      wicker: {
        pricePerSet: 2850000,
        tableNameRu: "Стол Taper 80x80 + 4 плетёных стула Vertex / Corda",
        tableNameUz: "Taper 80x80 stoli + 4 ta to'qilgan Vertex / Corda stuli",
        tableNameEn: "Taper 80x80 table + 4 woven Vertex / Corda chairs"
      },
      plastic: {
        pricePerSet: 1405000,
        tableNameRu: "Стол Taper 80x80 + 4 стула Roero",
        tableNameUz: "Taper 80x80 stoli + 4 ta Roero stuli",
        tableNameEn: "Taper 80x80 table + 4 Roero chairs"
      }
    },
    rest: {
      wicker: {
        pricePerSet: 2945000,
        tableNameRu: "Стол Corda 135x80 + 4 плетёных стула Corda / Vertex",
        tableNameUz: "Corda 135x80 stoli + 4 ta to'qilgan Corda / Vertex stuli",
        tableNameEn: "Corda 135x80 table + 4 woven Corda / Vertex chairs"
      },
      plastic: {
        pricePerSet: 1621000,
        tableNameRu: "Стол Corda 135x80 + 4 стула Roero",
        tableNameUz: "Corda 135x80 stoli + 4 ta Roero stuli",
        tableNameEn: "Corda 135x80 table + 4 Roero chairs"
      }
    }
  };

  function getLang() {
    return document.documentElement.lang || "ru";
  }

  function fmtNum(n) {
    return (n || 0).toLocaleString("ru-RU");
  }

  function initCalculator() {
    const calcSection = document.querySelector(".horeca-calc-section");
    if (!calcSection) return;

    const slider = document.getElementById("calc-seats-slider");
    const numDisplay = document.getElementById("calc-seats-val");
    const chips = calcSection.querySelectorAll("[data-seats-chip]");
    const venueRadios = calcSection.querySelectorAll('input[name="hrc-venue-type"]');
    const tierRadios = calcSection.querySelectorAll('input[name="hrc-tier-type"]');

    const outTables = document.getElementById("calc-tables-count");
    const outChairs = document.getElementById("calc-chairs-count");
    const outSeats = document.getElementById("calc-seats-count");
    const outTotal = document.getElementById("calc-total-price");
    const outCombo = document.getElementById("calc-combo-name");
    const tgBtn = document.getElementById("calc-tg-btn");
    const fillBtn = document.getElementById("calc-fill-form-btn");

    function getSelectedVenue() {
      for (const r of venueRadios) {
        if (r.checked) return r.value;
      }
      return "cafe";
    }

    function getSelectedTier() {
      for (const r of tierRadios) {
        if (r.checked) return r.value;
      }
      return "wicker";
    }

    function calculate() {
      const seats = parseInt(slider ? slider.value : 40, 10) || 40;
      const venue = getSelectedVenue();
      const tier = getSelectedTier();

      const conf = (SET_PRICES[venue] && SET_PRICES[venue][tier]) || SET_PRICES.cafe.wicker;

      const tablesCount = Math.max(1, Math.ceil(seats / 4));
      const chairsCount = tablesCount * 4;
      const totalPrice = tablesCount * conf.pricePerSet;

      const curLang = getLang();
      let comboName = conf.tableNameRu;
      if (curLang === "uz") comboName = conf.tableNameUz;
      else if (curLang === "en") comboName = conf.tableNameEn;

      if (numDisplay) numDisplay.textContent = String(seats);
      if (outTables) outTables.textContent = String(tablesCount);
      if (outChairs) outChairs.textContent = String(chairsCount);
      if (outSeats) outSeats.textContent = String(seats);
      if (outTotal) outTotal.textContent = fmtNum(totalPrice);
      if (outCombo) outCombo.textContent = comboName;

      // Update chips active state
      chips.forEach(c => {
        const val = parseInt(c.dataset.seatsChip, 10);
        c.classList.toggle("is-active", val === seats);
      });

      // Prepare Telegram link
      if (tgBtn) {
        let venueLabel = "Кафе";
        if (venue === "terrace") venueLabel = "Летняя терраса";
        if (venue === "rest") venueLabel = "Ресторан";

        let tierLabel = tier === "wicker" ? "Плетёный ротанг" : "Полипропилен";

        const tgText = `Здравствуйте! Интересует коммерческое предложение BTT для проекта HoReCa.\nФормат: ${venueLabel}\nРассадка: ${seats} мест (${tablesCount} столов + ${chairsCount} стульев)\nМодель: ${comboName}\nОриентировочная сумма: ${fmtNum(totalPrice)} сум.\nПрошу связаться для уточнения сроков поставки и условий.`;
        tgBtn.href = "https://t.me/btt_uz?text=" + encodeURIComponent(tgText);
      }
    }

    if (slider) {
      slider.addEventListener("input", calculate);
    }

    chips.forEach(c => {
      c.addEventListener("click", () => {
        const val = parseInt(c.dataset.seatsChip, 10);
        if (slider && val) {
          slider.value = String(val);
          calculate();
        }
      });
    });

    venueRadios.forEach(r => r.addEventListener("change", calculate));
    tierRadios.forEach(r => r.addEventListener("change", calculate));

    if (fillBtn) {
      fillBtn.addEventListener("click", e => {
        e.preventDefault();
        const seats = slider ? slider.value : "40";
        const venue = getSelectedVenue();
        const tier = getSelectedTier();
        const conf = (SET_PRICES[venue] && SET_PRICES[venue][tier]) || SET_PRICES.cafe.wicker;
        const tablesCount = Math.max(1, Math.ceil(parseInt(seats, 10) / 4));
        const chairsCount = tablesCount * 4;
        const totalPrice = tablesCount * conf.pricePerSet;

        let venueLabel = "Кафе";
        if (venue === "terrace") venueLabel = "Летняя терраса";
        if (venue === "rest") venueLabel = "Ресторан";

        const msgText = `Запрос КП по расчёту калькулятора:\nФормат: ${venueLabel}, ${seats} мест (${tablesCount} столов + ${chairsCount} стульев).\nКомплект: ${conf.tableNameRu}.\nСмета: ${fmtNum(totalPrice)} сум.`;

        const msgField = document.getElementById("hrc-msg");
        if (msgField) {
          msgField.value = msgText;
          msgField.dispatchEvent(new Event("input", { bubbles: true }));
        }

        const nameField = document.getElementById("hrc-name");
        if (nameField) {
          nameField.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => nameField.focus(), 400);
        }
      });
    }

    const printBtn = document.getElementById("calc-print-btn");
    if (printBtn) {
      printBtn.addEventListener("click", e => {
        e.preventDefault();
        const seats = parseInt(slider ? slider.value : 40, 10) || 40;
        const venue = getSelectedVenue();
        const tier = getSelectedTier();
        const conf = (SET_PRICES[venue] && SET_PRICES[venue][tier]) || SET_PRICES.cafe.wicker;

        const tablesCount = Math.max(1, Math.ceil(seats / 4));
        const chairsCount = tablesCount * 4;
        const totalPrice = tablesCount * conf.pricePerSet;

        let tableModel = "Стол «Vertex D90» (круглый Ø90 × 75 см, ЛДСП/металл)";
        let tableUnitPrice = 680000;
        let chairModel = "Плетёный стул «Vertex» (кручёный ротанг, металлокаркас, мягкая подушка)";
        let chairUnitPrice = 499000;

        if (venue === "terrace") {
          tableModel = "Стол «Taper 80x80» (квадратный 80 × 80 × 75 см, влагостойкий ЛДСП/металл)";
          tableUnitPrice = 733000;
          if (tier === "wicker") {
            chairModel = "Плетёный стул «Vertex / Corda» (кручёный ротанг, мягкая подушка)";
            chairUnitPrice = (conf.pricePerSet - tableUnitPrice) / 4;
          } else {
            chairModel = "Пластиковый стул «ROERO» (высокопрочный полипропилен)";
            chairUnitPrice = 168000;
          }
        } else if (venue === "rest") {
          tableModel = "Стол «Corda 135x80» (прямоугольный 135 × 80 × 75 см, премиум ЛДСП/металл)";
          tableUnitPrice = 949000;
          if (tier === "wicker") {
            chairModel = "Плетёный стул «Corda» (фактурное плетение, мягкая подушка)";
            chairUnitPrice = 499000;
          } else {
            chairModel = "Пластиковый стул «ROERO» (эргономичный полипропилен)";
            chairUnitPrice = 168000;
          }
        } else {
          if (tier === "plastic") {
            chairModel = "Пластиковый стул «ROERO» (эргономичный полипропилен)";
            chairUnitPrice = 168000;
          }
        }

        const tablesTotal = tablesCount * tableUnitPrice;
        const chairsTotal = totalPrice - tablesTotal;

        let venueLabel = "Кафе / кофейня";
        if (venue === "terrace") venueLabel = "Летняя терраса / открытая веранда";
        if (venue === "rest") venueLabel = "Ресторан / банкетный зал";

        const now = new Date();
        const docDate = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
        const docNum = String(now.getFullYear()).slice(-2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + "-" + String(Math.floor(100 + Math.random() * 900));

        let printBox = document.getElementById("btt-print-estimate");
        if (!printBox) {
          printBox = document.createElement("div");
          printBox.id = "btt-print-estimate";
          document.body.appendChild(printBox);
        }

        printBox.innerHTML = `
          <div class="print-header">
            <div class="print-header__left">
              <div class="print-logo">BTT</div>
              <div class="print-tagline">BTT - мебель для дома, сада и HoReCa</div>
              <div class="print-meta-line">г. Ташкент, ул. Паркентская · Тел: +998 77 104 44 22</div>
              <div class="print-meta-line">Email: hello@btt.uz · Telegram: @btt_uz · btt.uz</div>
            </div>
            <div class="print-header__right">
              <div class="print-doc-num">Смета № КП-BTT-${docNum}</div>
              <div class="print-doc-date">Дата составления: ${docDate}</div>
              <div class="print-doc-valid">Срок действия цен: 14 календарных дней</div>
            </div>
          </div>

          <div class="print-title-box">
            <h1 class="print-doc-title">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ / СПЕЦИФИКАЦИЯ</h1>
            <div class="print-doc-sub">Оснащение мебелью проекта: <strong>${venueLabel}</strong> на <strong>${seats}</strong> посадочных мест</div>
          </div>

          <table class="print-table">
            <thead>
              <tr>
                <th style="width:36px;text-align:center">№</th>
                <th>Наименование изделия и описание</th>
                <th style="width:50px;text-align:center">Ед.</th>
                <th style="width:60px;text-align:center">Кол-во</th>
                <th style="width:120px;text-align:right">Цена (сум)</th>
                <th style="width:140px;text-align:right">Сумма (сум)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align:center">1</td>
                <td>
                  <div class="print-item-name">${tableModel}</div>
                  <div class="print-item-desc">Обеденный стол на прочном металлокаркасе с защитным полимерным покрытием. Столешница ЛДСП с фактурой мрамора.</div>
                </td>
                <td style="text-align:center">шт.</td>
                <td style="text-align:center">${tablesCount}</td>
                <td style="text-align:right">${fmtNum(tableUnitPrice)}</td>
                <td style="text-align:right">${fmtNum(tablesTotal)}</td>
              </tr>
              <tr>
                <td style="text-align:center">2</td>
                <td>
                  <div class="print-item-name">${chairModel}</div>
                  <div class="print-item-desc">Стул повышенной прочности для интенсивной эксплуатации в секторе HoReCa. Устойчив к износу и нагрузкам.</div>
                </td>
                <td style="text-align:center">шт.</td>
                <td style="text-align:center">${chairsCount}</td>
                <td style="text-align:right">${fmtNum(chairUnitPrice)}</td>
                <td style="text-align:right">${fmtNum(chairsTotal)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="print-total-row">
                <td colspan="4" style="text-align:right;font-weight:700">ИТОГО К ОПЛАТЕ:</td>
                <td colspan="2" style="text-align:right;font-weight:800;font-size:15px">${fmtNum(totalPrice)} сум</td>
              </tr>
            </tfoot>
          </table>

          <div class="print-terms">
            <div class="print-terms__title">УСЛОВИЯ ПОСТАВКИ И ГАРАНТИИ:</div>
            <ul class="print-terms__list">
              <li><strong>Комплектация:</strong> в комплект каждого плетёного стула включена мягкая текстильная подушка.</li>
              <li><strong>Сроки поставки:</strong> 1-3 рабочих дня со склада в Ташкенте после согласования спецификации.</li>
              <li><strong>Доставка:</strong> бесплатная доставка собственным автотранспортом по г. Ташкенту при проектном заказе.</li>
              <li><strong>Порядок оплаты:</strong> безналичный расчёт по договору поставки (с оформлением ЭСФ) либо оплата по факту приёма партии.</li>
              <li><strong>Гарантия:</strong> официальная гарантия 12 месяцев на металлокаркас, геометрию и целостность плетения.</li>
            </ul>
          </div>

          <div class="print-signatures">
            <div class="print-sig-col">
              <div class="print-sig-title">Поставщик:</div>
              <div class="print-sig-name">BTT (ООО "BTT Trade")</div>
              <div class="print-sig-line">Отдел корпоративных продаж: ______________ / М.П.</div>
            </div>
            <div class="print-sig-col">
              <div class="print-sig-title">Заказчик:</div>
              <div class="print-sig-name">Представитель заведения / организации</div>
              <div class="print-sig-line">Согласовано: ___________________________ / М.П.</div>
            </div>
          </div>
        `;

        window.print();
      });
    }

    calculate();
    document.addEventListener("btt:lang", calculate);
  }

  document.addEventListener("DOMContentLoaded", initCalculator);
})();
