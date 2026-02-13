import { readBlockConfig } from '../../scripts/aem.js';

const LOTTIE_PLAYER_SCRIPT = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';

/**
 * Lazy-load Lottie when container enters viewport: load script, create lottie-player, append.
 * @param {Element} container - #lottie-main element with data-jsonsrc
 */
function initLottieWhenVisible(container) {
  const jsonUrl = container.getAttribute('data-jsonsrc');
  if (!jsonUrl) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      if (target.dataset.lottieLoaded === 'true') {
        observer.unobserve(target);
        return;
      }
      target.dataset.lottieLoaded = 'true';
      observer.unobserve(target);

      const loadScript = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      loadScript(LOTTIE_PLAYER_SCRIPT)
        .then(() => {
          const player = document.createElement('lottie-player');
          player.setAttribute('src', jsonUrl);
          player.setAttribute('background', 'transparent');
          player.setAttribute('speed', '1');
          player.setAttribute('loop', '');
          player.setAttribute('autoplay', '');
          player.style.width = '100%';
          player.style.height = '100%';
          container.appendChild(player);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Lottie animation failed to load', err);
        });
    });
  }, { rootMargin: '0px', threshold: 0.1 });

  observer.observe(container);
}

/**
 * Decorate lottie-animation block: single container, lazy-load Lottie on intersect.
 * @param {Element} block - The lottie-animation block element
 */
export default function decorate(block) {
  const config = readBlockConfig(block);
  const jsonUrl = (config.animation && config.animation.trim())
    ? config.animation.trim()
    : `${window.hlx?.codeBasePath || ''}/video/dop.json`;

  const container = document.createElement('div');
  container.id = 'lottie-main';
  container.className = 'lottie-lazy lottie-container';
  container.setAttribute('data-jsonsrc', jsonUrl);
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', 'Deep Observability Pipeline animation');

  block.innerHTML = '';
  block.appendChild(container);

  initLottieWhenVisible(container);
}
