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

    calculate();
    document.addEventListener("btt:lang", calculate);
  }

  document.addEventListener("DOMContentLoaded", initCalculator);
})();
