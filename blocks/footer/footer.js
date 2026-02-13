import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const SOCIAL_ICONS = {
  twitter: '/icons/twitter.svg',
  youtube: '/icons/youtube.svg',
  facebook: '/icons/facebook.svg',
  linkedin: '/icons/linkedin.svg',
};

/**
 * Replaces text social links with SVG icon links
 * @param {Element} container The paragraph containing social links
 */
function decorateSocialLinks(container) {
  if (!container) return;
  const links = [...container.querySelectorAll('a')];
  if (!links.length) return;

  const socialNav = document.createElement('div');
  socialNav.className = 'footer-social';

  links.forEach((link) => {
    const name = link.textContent.trim().toLowerCase();
    const iconPath = SOCIAL_ICONS[name];
    if (iconPath) {
      const iconLink = document.createElement('a');
      iconLink.href = link.href;
      iconLink.target = '_blank';
      iconLink.rel = 'noopener noreferrer';
      iconLink.setAttribute('aria-label', link.textContent.trim());
      iconLink.className = 'footer-social-icon';

      const img = document.createElement('img');
      img.src = iconPath;
      img.alt = link.textContent.trim();
      img.loading = 'lazy';
      iconLink.append(img);
      socialNav.append(iconLink);
    }
  });

  if (socialNav.children.length) {
    container.replaceWith(socialNav);
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  // Convert em elements in columns to orange badge tags
  block.querySelectorAll('.columns em').forEach((em) => {
    const badge = document.createElement('span');
    badge.className = 'footer-tag';
    badge.textContent = em.textContent;
    em.replaceWith(badge);
  });

  // Replace text social links with SVG icons
  const bottomSection = block.querySelector('.default-content-wrapper');
  if (bottomSection) {
    const firstP = bottomSection.querySelector('p:first-child');
    decorateSocialLinks(firstP);
  }
}
