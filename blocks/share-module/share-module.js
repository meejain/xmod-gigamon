import { getMetadata } from '../../scripts/aem.js';

/**
 * Share icon SVG (three dots connected by lines).
 */
function getShareIconSVG() {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>`;
}

function getFacebookIconSVG() {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="18" height="18"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
}

function getTwitterIconSVG() {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="18" height="18"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
}

function getLinkedInIconSVG() {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="18" height="18"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
}

/**
 * Build share URLs for current page.
 */
function getShareUrls() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(getMetadata('og:title') || document.title || 'Gigamon');
  const summary = encodeURIComponent(getMetadata('og:description') || document.title || 'The Gigamon Deep Observability Pipeline delivers network-derived telemetry to cloud, security, and observability tools for visibility into all data in motion.');
  const text = summary;
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter: `https://twitter.com/intent/tweet?text=${text}&source=sharethiscom&related=sharethis&via=Gigamon&url=${url}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}&source=Gigamon`,
  };
}

/**
 * Decorate share module block: fixed left, vertically centered, expand on hover.
 * @param {Element} block - The share-module block element
 */
export default function decorate(block) {
  const urls = getShareUrls();
  block.id = 'ShareThisModule';
  block.classList.add('share-module');

  const shareIcon = document.createElement('div');
  shareIcon.className = 'share-icon';
  shareIcon.innerHTML = `
    <span aria-label="share-icon" class="share-icon-sprite" role="button">${getShareIconSVG()}</span>
    <b>SHARE</b>
  `;

  const list = document.createElement('ul');
  list.id = 'SharethisItems';
  list.innerHTML = `
    <li><a aria-label="Share on Facebook" href="${urls.facebook}" target="_blank" rel="noopener noreferrer" class="facebook" role="button"><span class="share-icon-inner">${getFacebookIconSVG()}</span></a></li>
    <li><a aria-label="Share on Twitter" href="${urls.twitter}" target="_blank" rel="noopener noreferrer" class="twitter" role="button"><span class="share-icon-inner">${getTwitterIconSVG()}</span></a></li>
    <li><a aria-label="Share on LinkedIn" href="${urls.linkedin}" target="_blank" rel="noopener noreferrer" class="linkedin" role="button"><span class="share-icon-inner">${getLinkedInIconSVG()}</span></a></li>
  `;

  block.append(shareIcon, list);
}
