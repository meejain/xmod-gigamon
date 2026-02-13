import { getMetadata } from '../../scripts/aem.js';

/** Gigamon Drift embed ID from original site (controller iframe src). */
const GIGAMON_DRIFT_EMBED_ID = 'iu3bua46tv44';

/**
 * Load real Drift widget (injects drift-frame-controller + drift-frame-chat).
 * @param {string} embedId - Drift embed ID (e.g. iu3bua46tv44)
 * @returns {Promise<boolean>} true if script load started successfully
 */
async function loadDrift(embedId) {
  if (!embedId || typeof embedId !== 'string' || !embedId.trim()) return false;
  const id = embedId.trim();
  return new Promise((resolve) => {
    window.driftt = window.drift = window.driftt || [];
    if (window.drift.init) {
      resolve(true);
      return;
    }
    window.drift.load = function loadDriftScript(eid) {
      const script = document.createElement('script');
      script.src = `https://js.driftt.com/include/${eid}/${eid}.js`;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    };
    window.drift.load(id);
    resolve(true);
  });
}

/**
 * Check if Drift actually injected its widget (controller iframe in DOM).
 */
function isDriftWidgetInDom() {
  return !!document.getElementById('drift-frame-controller');
}

/**
 * Keep Drift widget visible. Drift can hide the widget after bootstrap; we call show() on ready and once after delay.
 */
function pinDriftWidgetVisible() {
  if (typeof window.drift === 'undefined') return;
  const show = () => {
    try {
      if (window.drift.api && window.drift.api.widget && typeof window.drift.api.widget.show === 'function') {
        window.drift.api.widget.show();
      }
    } catch (e) {
      // ignore
    }
  };
  if (window.drift.on) {
    window.drift.on('ready', show);
  }
  setTimeout(show, 500);
  setTimeout(show, 1500);
}

/**
 * Wait for Drift to inject the widget.
 * @param {number} ms - Max wait in ms
 * @returns {Promise<boolean>} true if #drift-frame-controller appeared
 */
function waitForDriftWidget(ms = 2500) {
  return new Promise((resolve) => {
    if (isDriftWidgetInDom()) {
      resolve(true);
      return;
    }
    const end = Date.now() + ms;
    const check = () => {
      if (isDriftWidgetInDom()) {
        resolve(true);
        return;
      }
      if (Date.now() < end) {
        requestAnimationFrame(check);
      } else {
        resolve(false);
      }
    };
    requestAnimationFrame(check);
  });
}

/**
 * Decorate chat widget block. Drift injects its own divs into body. No fallback UI.
 */
export default async function decorate(block) {
  const driftEmbedId = getMetadata('drift-id') || getMetadata('drift-embed-id') || GIGAMON_DRIFT_EMBED_ID;
  const useDrift = driftEmbedId.trim().length > 0;

  if (useDrift) {
    if (typeof window.drift === 'undefined' || !window.drift.invoked) {
      await loadDrift(driftEmbedId.trim());
    }
    const driftShown = await waitForDriftWidget(2500);
    if (driftShown) {
      pinDriftWidgetVisible();
    }
  }

  block.classList.add('chat-widget--drift-loaded');
  block.setAttribute('aria-hidden', 'true');
}
