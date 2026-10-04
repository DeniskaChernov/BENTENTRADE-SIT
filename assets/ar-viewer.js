/* ============================================================
   BTT - 3D & Augmented Reality (WebXR / QuickLook) Viewer
   Uses Google <model-viewer> Web Component with lazy loading
   ============================================================ */
(function() {
  "use strict";

  let modelViewerLoaded = false;
  let arModal = null;

  function loadModelViewerScript(cb) {
    if (modelViewerLoaded || customElements.get("model-viewer")) {
      modelViewerLoaded = true;
      if (cb) cb();
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.onload = () => {
      modelViewerLoaded = true;
      if (cb) cb();
    };
    script.onerror = () => {
      console.warn("Could not load model-viewer from CDN");
      if (cb) cb();
    };
    document.head.appendChild(script);
  }

  function getLang() {
    return (window.BTT_UTIL && window.BTT_UTIL.lang) ? window.BTT_UTIL.lang() : "ru";
  }

  function t(k) {
    return (window.BTT_UTIL && window.BTT_UTIL.t) ? window.BTT_UTIL.t(k) : k;
  }

  function esc(s) {
    return (window.BTT_UTIL && window.BTT_UTIL.esc) ? window.BTT_UTIL.esc(s) : String(s || "");
  }

  function openArModal(prod) {
    if (!prod) return;

    loadModelViewerScript(() => {
      createOrUpdateModal(prod);
    });
  }

  function createOrUpdateModal(prod) {
    if (!arModal) {
      arModal = document.createElement("div");
      arModal.className = "btt-ar-modal-backdrop";
      arModal.setAttribute("role", "dialog");
      arModal.setAttribute("aria-modal", "true");
      arModal.setAttribute("aria-label", t("ar.title") || "3D / AR Примерка");
      document.body.appendChild(arModal);

      arModal.addEventListener("click", (e) => {
        if (e.target === arModal || e.target.closest("[data-ar-close]")) {
          closeArModal();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && arModal && arModal.classList.contains("is-open")) {
          closeArModal();
        }
      });
    }

    const curUrl = window.location.href;
    const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(curUrl);
    const modelSrc = "assets/models/chair.glb";
    const dimText = prod.dimensions || "82 × 48 × 49 см";
    const prodName = (window.BTT_I18N && window.BTT_I18N.t) ? window.BTT_I18N.t(prod.slug + ".name") : (prod.name || prod.model);

    arModal.innerHTML = `
      <div class="btt-ar-dialog">
        <div class="btt-ar-header">
          <div class="btt-ar-title-group">
            <span class="eyebrow">${t("ar.scale") || "Масштаб 1:1"}</span>
            <h3 class="btt-ar-title">${esc(prodName)}</h3>
          </div>
          <button type="button" class="btt-ar-close" data-ar-close aria-label="${t("ar.close") || "Закрыть"}">&times;</button>
        </div>

        <div class="btt-ar-body">
          <!-- 3D Model Stage -->
          <div class="btt-ar-stage">
            <model-viewer
              src="${modelSrc}"
              alt="${esc(prodName)}"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1.2"
              shadow-softness="0.8"
              exposure="1"
              camera-orbit="45deg 55deg 2.5m"
              style="width:100%;height:100%;background-color:var(--surface);"
            >
              <button slot="ar-button" class="btn btn--copper btt-ar-launch-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="margin-right:8px"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                <span>${t("ar.btn") || "Примерить в комнате (AR)"}</span>
              </button>
            </model-viewer>
          </div>

          <!-- Info Sidebar -->
          <div class="btt-ar-sidebar">
            <div class="btt-ar-dim-box">
              <span class="btt-ar-dim-label">${t("ar.dimensions") || "Габариты:"}</span>
              <strong class="btt-ar-dim-val">${dimText}</strong>
              <p class="btt-ar-dim-desc">${t("ar.desc") || "Оцените габариты и дизайн мебели в масштабе 1:1 прямо в вашей комнате."}</p>
            </div>

            <!-- Desktop QR code for phone scan -->
            <div class="btt-ar-qr-box">
              <p class="btt-ar-qr-tip">${t("ar.scan") || "Отсканируйте QR-код камерой телефона для примерки в AR"}</p>
              <div class="btt-ar-qr-img-wrap">
                <img src="${qrUrl}" alt="QR код для примерки" width="140" height="140" loading="lazy">
              </div>
            </div>

            <div class="btt-ar-cta-box" style="margin-top:auto">
              <button type="button" class="btn btn--copper" data-ar-buy style="width:100%">
                ${t("buy") || "Купить"}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const buyBtn = arModal.querySelector("[data-ar-buy]");
    if (buyBtn) {
      buyBtn.onclick = () => {
        closeArModal();
        if (window.BTT_CART && window.BTT_CART.openQuickOrder) {
          window.BTT_CART.openQuickOrder(prod);
        }
      };
    }

    arModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeArModal() {
    if (arModal) {
      arModal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }

  function initTriggers() {
    document.querySelectorAll("[data-pdp-ar-trigger]").forEach(btn => {
      btn.onclick = () => {
        // Resolve current product from window.BTT_PDP_CURRENT or fallback
        const p = window.BTT_PDP_CURRENT || (window.BTT_PRODUCTS && window.BTT_PRODUCTS["stul-vertex"]);
        if (p) openArModal(p);
      };
    });
  }

  window.BTT_AR = {
    open: openArModal,
    close: closeArModal,
    init: initTriggers
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTriggers);
  } else {
    initTriggers();
  }
})();
