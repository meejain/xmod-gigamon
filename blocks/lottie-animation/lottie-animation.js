/**
 * Lottie animation block — EDS/DA.
 * Authors set animation path/URL in block table: animation | /video/dop.json (or full URL).
 *
 * Runtime debug (blank section):
 * - Network: dop.json must be 200 OK.
 * - Console: window.lottie.getRegisteredAnimations() — if empty, animation never initialized.
 * - Elements: #lottie-main .lottie-inner must have non-zero height (inspect computed style).
 * - Isolation: open page with ?lottie=immediate to load without IntersectionObserver.
 * - JSON: if dop.json fails in https://lottiefiles.com/preview → unsupported AE features.
 */
import { readBlockConfig } from '../../scripts/aem.js';

const LOTTIE_WEB_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
const LOTTIE_PLAYER_SCRIPT = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
const DEBUG = true; // set false in production; helps trace "Lottie:" in console

function log(...args) {
  if (DEBUG && typeof console !== 'undefined' && console.info) {
    console.info('[Lottie]', ...args);
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      log('script already on page');
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => { log('script loaded'); resolve(); };
    script.onerror = () => reject(new Error(`Script failed: ${src}`));
    document.body.appendChild(script);
  });
}

function toAbsoluteJsonUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (typeof window !== 'undefined' && window.hlx?.codeBasePath) ? window.hlx.codeBasePath.replace(/\/$/, '') : '';
  const path = trimmed.startsWith('/')
    ? trimmed
    : (`${base ? `/${base}` : ''}/${trimmed.replace(/^\//, '')}`).replace(/\/+/g, '/');
  try {
    return new URL(path, typeof window !== 'undefined' ? window.location.origin : '').href;
  } catch {
    return trimmed;
  }
}

/**
 * Expand loopOut('cycle') tm expressions into explicit keyframes.
 *
 * lottie-web's expression evaluator silently fails on EDS, crashing the
 * SVG element builder.  Instead of stripping the expression (which kills
 * the cycling animation), we replicate the loopOut('cycle') behaviour by
 * duplicating the original keyframe cycle across the full layer duration.
 */
function expandTmCycles(data) {
  const walk = (layers) => {
    if (!Array.isArray(layers)) return;
    layers.forEach((layer) => {
      const { tm } = layer;
      if (!tm || !tm.x || !tm.x.includes('loopOut')) return;
      const kfs = tm.k;
      if (!Array.isArray(kfs) || kfs.length < 2) return;

      const cycleDur = kfs[kfs.length - 1].t - kfs[0].t;
      if (cycleDur <= 0) return;

      const dur = (layer.op || 900) - (layer.ip || 0);
      const cycles = Math.ceil(dur / cycleDur) + 1;
      const expanded = [];

      for (let c = 0; c < cycles; c += 1) {
        const off = c * cycleDur;
        kfs.forEach((kf) => {
          const copy = JSON.parse(JSON.stringify(kf));
          copy.t = kf.t + off;
          expanded.push(copy);
        });
      }

      tm.k = expanded;
      delete tm.x;
    });
  };
  walk(data.layers);
  if (Array.isArray(data.assets)) {
    data.assets.forEach((a) => walk(a.layers));
  }
}

function loadLottieIntoContainer(container) {
  const jsonUrl = container.getAttribute('data-jsonsrc');
  if (!jsonUrl) {
    log('no data-jsonsrc');
    return;
  }
  if (container.dataset.lottieLoaded === 'true') {
    log('already loaded');
    return;
  }
  container.dataset.lottieLoaded = 'true';
  container.dataset.lottieStatus = 'loading';

  const showError = (msg, err) => {
    container.dataset.lottieStatus = 'error';
    container.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'lottie-error';
    p.textContent = msg;
    p.style.cssText = 'padding:1rem;color:#c00;font-size:0.875rem;';
    container.appendChild(p);
    if (err && console && console.error) {
      console.error('[Lottie]', msg, err);
    }
  };

  const absoluteUrl = toAbsoluteJsonUrl(jsonUrl);
  log('loading from', absoluteUrl);

  const usePlayer = container.dataset.lottieRenderer === 'player';
  if (usePlayer) {
    loadScript(LOTTIE_PLAYER_SCRIPT)
      .then(() => customElements.whenDefined('lottie-player'))
      .then(() => {
        const el = document.createElement('lottie-player');
        el.setAttribute('src', absoluteUrl);
        el.setAttribute('background', 'transparent');
        el.setAttribute('speed', '1');
        el.setAttribute('loop', '');
        el.setAttribute('autoplay', '');
        el.setAttribute('renderer', 'svg');
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.minHeight = '250px';
        el.style.display = 'block';
        el.addEventListener('error', () => showError('Animation could not be loaded (player).', null));
        container.appendChild(el);
        container.dataset.lottieStatus = 'loaded';
        if (DEBUG) {
          setTimeout(() => {
            const rect = el.getBoundingClientRect();
            log('lottie-player rect:', rect.width, 'x', rect.height);
          }, 500);
        }
        log('animation started (lottie-player, original site pattern)');
      })
      .catch((err) => showError('Animation could not be loaded.', err));
    return;
  }

  const inner = document.createElement('div');
  inner.className = 'lottie-inner';
  inner.setAttribute('aria-hidden', 'true');
  inner.style.minHeight = '250px';
  inner.style.width = '100%';
  container.appendChild(inner);

  const lottieReady = window.lottie
    && typeof window.lottie.loadAnimation === 'function';
  const scriptPromise = lottieReady
    ? Promise.resolve()
    : loadScript(LOTTIE_WEB_SCRIPT);

  scriptPromise
    .then(() => fetch(absoluteUrl))
    .then((res) => {
      if (!res.ok) throw new Error(`JSON ${res.status}: ${absoluteUrl}`);
      return res.json();
    })
    .then((animationData) => {
      log('JSON loaded, frames/layers:', animationData?.op != null ? 'yes' : 'no');
      expandTmCycles(animationData);
      const { lottie } = window;
      if (!lottie || typeof lottie.loadAnimation !== 'function') {
        throw new Error('lottie-web not available');
      }
      const runInit = () => {
        const useCanvas = container.dataset.lottieRenderer === 'canvas';
        const startFrame = 0;
        const endFrame = animationData.op != null
          ? Math.ceil(animationData.op) : 857;
        const anim = lottie.loadAnimation({
          container: inner,
          renderer: useCanvas ? 'canvas' : 'svg',
          loop: true,
          autoplay: true,
          animationData,
          initialSegment: [startFrame, endFrame],
          rendererSettings: useCanvas
            ? { preserveAspectRatio: 'xMidYMid meet' }
            : { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: false },
        });
        container.dataset.lottieStatus = 'loaded';
        if (anim && typeof anim.play === 'function') {
          anim.play();
        }
        log(
          'animation started',
          useCanvas ? '(canvas)' : '(svg)',
          'segment',
          startFrame,
          '-',
          endFrame,
        );
        if (DEBUG && window.lottie
          && window.lottie.getRegisteredAnimations) {
          setTimeout(() => {
            const count = window.lottie
              .getRegisteredAnimations().length;
            const rect = inner.getBoundingClientRect();
            log(
              'getRegisteredAnimations:',
              count,
              '| container size:',
              rect.width,
              'x',
              rect.height,
            );
          }, 500);
        }
      };
      requestAnimationFrame(() => {
        requestAnimationFrame(runInit);
      });
    })
    .catch((err) => {
      showError('Animation could not be loaded.', err);
    });
}

function initLottieWhenVisible(container) {
  const jsonUrl = container.getAttribute('data-jsonsrc');
  if (!jsonUrl) return;

  let loaded = false;
  const run = () => {
    if (loaded) return;
    loaded = true;
    loadLottieIntoContainer(container);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) run();
    });
  }, { rootMargin: '100px', threshold: 0 });

  observer.observe(container);

  setTimeout(() => {
    if (container.dataset.lottieLoaded !== 'true') run();
  }, 500);
}

function getDefaultDopJsonUrl() {
  const base = (typeof window !== 'undefined' && window.hlx?.codeBasePath) ? window.hlx.codeBasePath.replace(/\/$/, '') : '';
  const path = `${base}/blocks/lottie-animation/dop.json`;
  try {
    return new URL(path, typeof window !== 'undefined' ? window.location.origin : '').href;
  } catch {
    return '/blocks/lottie-animation/dop.json';
  }
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  const raw = (config.animation && config.animation.trim())
    ? config.animation.trim() : getDefaultDopJsonUrl();
  const jsonUrl = toAbsoluteJsonUrl(raw);

  log('block decorate', jsonUrl);

  const container = document.createElement('div');
  container.id = 'lottie-main';
  container.className = 'lottie-lazy lottie-container';
  container.setAttribute('data-jsonsrc', jsonUrl);
  container.setAttribute('data-lottie-renderer', 'svg');
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', 'Deep Observability Pipeline animation');

  block.innerHTML = '';
  block.appendChild(container);

  const immediate = config.immediate === true || config.immediate === 'true'
    || (typeof window !== 'undefined' && window.location?.search?.includes('lottie=immediate'));
  if (immediate) {
    log('immediate load (no lazy)');
    loadLottieIntoContainer(container);
  } else {
    initLottieWhenVisible(container);
  }
}
