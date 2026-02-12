import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeAllMegaMenus(nav) {
  nav.querySelectorAll('.nav-drop').forEach((drop) => {
    drop.setAttribute('aria-expanded', 'false');
  });
  const overlay = nav.querySelector('.mega-overlay');
  if (overlay) overlay.classList.remove('visible');
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (isDesktop.matches) {
      closeAllMegaMenus(nav);
    } else {
      const navSections = nav.querySelector('.nav-sections');
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    if (isDesktop.matches) {
      closeAllMegaMenus(nav);
    } else {
      const navSections = nav.querySelector('.nav-sections');
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Detect the type of a mega menu list item from its content structure:
 * - 'card': contains a picture/img element
 * - 'category': starts with a bold heading and has a nested link list
 * - 'leadin': text paragraphs with optional CTA link
 */
function detectItemType(li) {
  if (li.querySelector('picture, img')) return 'card';
  const firstP = li.querySelector(':scope > p');
  if (firstP && firstP.querySelector('strong') && li.querySelector(':scope > ul')) return 'category';
  return 'leadin';
}

/**
 * Build a mega menu panel from the nav item's child list
 */
function buildMegaMenu(navItem) {
  const subList = navItem.querySelector(':scope > ul');
  if (!subList) return null;

  const megaPanel = document.createElement('div');
  megaPanel.className = 'mega-menu-panel';

  const megaContent = document.createElement('div');
  megaContent.className = 'mega-menu-content';

  const children = [...subList.children];
  let hasCards = false;

  children.forEach((li) => {
    const type = detectItemType(li);

    if (type === 'leadin') {
      const leadin = document.createElement('div');
      leadin.className = 'mega-leadin';
      const paragraphs = [...li.querySelectorAll(':scope > p')];

      paragraphs.forEach((p, idx) => {
        const link = p.querySelector('a');
        // A paragraph that is purely a link (no surrounding text) is a CTA
        if (link && p.textContent.trim() === link.textContent.trim() && idx > 0) {
          const ctaWrap = document.createElement('div');
          ctaWrap.className = 'mega-cta';
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent;
          const arrow = document.createElement('span');
          arrow.className = 'cta-arrow';
          arrow.textContent = '\u203A';
          a.append(arrow);
          ctaWrap.append(a);
          leadin.append(ctaWrap);
        } else if (idx === 0) {
          const h3 = document.createElement('h3');
          h3.textContent = p.textContent;
          leadin.append(h3);
        } else {
          const desc = document.createElement('p');
          desc.textContent = p.textContent;
          leadin.append(desc);
        }
      });
      megaContent.append(leadin);
    } else if (type === 'category') {
      const col = document.createElement('div');
      col.className = 'mega-category';

      const heading = li.querySelector(':scope > p > strong');
      if (heading) {
        const h4 = document.createElement('h4');
        h4.textContent = heading.textContent;
        col.append(h4);
      }

      const links = li.querySelector(':scope > ul');
      if (links) {
        const ul = document.createElement('ul');
        [...links.children].forEach((linkLi) => {
          const newLi = document.createElement('li');
          const a = linkLi.querySelector('a');
          if (a) {
            const newA = document.createElement('a');
            newA.href = a.href;
            newA.textContent = a.textContent;
            if (a.querySelector('strong')) newA.classList.add('bold-link');
            newLi.append(newA);
          }
          ul.append(newLi);
        });
        col.append(ul);
      }
      megaContent.append(col);
    } else if (type === 'card') {
      hasCards = true;
      const card = document.createElement('div');
      card.className = 'mega-card';

      const imgLink = li.querySelector('a');
      const paragraphs = [...li.querySelectorAll(':scope > p')];
      // First p has image link, subsequent are title and description
      const titleP = paragraphs.length > 1 ? paragraphs[1] : null;
      const descP = paragraphs.length > 2 ? paragraphs[2] : null;

      if (imgLink) {
        const cardLink = document.createElement('a');
        cardLink.href = imgLink.href;
        cardLink.className = 'mega-card-link';

        const imgEl = li.querySelector('img');
        if (imgEl) {
          const img = document.createElement('img');
          img.src = imgEl.src;
          img.alt = imgEl.alt || '';
          img.loading = 'lazy';
          cardLink.append(img);
        }

        const cardBody = document.createElement('div');
        cardBody.className = 'mega-card-body';
        if (titleP) {
          const t = document.createElement('p');
          t.className = 'mega-card-title';
          t.textContent = titleP.textContent;
          cardBody.append(t);
        }
        if (descP) {
          const d = document.createElement('p');
          d.className = 'mega-card-desc';
          d.textContent = descP.textContent;
          cardBody.append(d);
        }
        cardLink.append(cardBody);
        card.append(cardLink);
      }
      megaContent.append(card);
    }
  });

  if (hasCards) megaContent.classList.add('has-cards');
  megaPanel.append(megaContent);

  // Remove the original sub list
  subList.remove();

  return megaPanel;
}

/**
 * Decorate the header block
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Identify the 3 sections: brand, sections, tools
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Clean brand link styling
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const bc = brandLink.closest('.button-container');
      if (bc) bc.className = '';
    }
  }

  // Process nav sections into mega menus
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    // Remove button classes from nav-sections links
    navSections.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const bc = btn.closest('.button-container');
      if (bc) bc.className = '';
    });

    const navList = navSections.querySelector(':scope .default-content-wrapper > ul')
      || navSections.querySelector('ul');

    if (navList) {
      [...navList.children].forEach((navItem) => {
        const hasSubMenu = navItem.querySelector(':scope > ul');
        if (hasSubMenu) {
          navItem.classList.add('nav-drop');

          // Build the mega menu panel
          const megaPanel = buildMegaMenu(navItem);
          if (megaPanel) {
            navItem.append(megaPanel);
          }

          // Create the nav label button
          const label = navItem.querySelector(':scope > p');
          if (label) {
            const btn = document.createElement('button');
            btn.className = 'nav-label';
            btn.textContent = label.textContent;
            btn.setAttribute('aria-expanded', 'false');
            label.replaceWith(btn);

            // Desktop: hover behavior
            navItem.addEventListener('mouseenter', () => {
              if (isDesktop.matches) {
                closeAllMegaMenus(nav);
                navItem.setAttribute('aria-expanded', 'true');
                btn.setAttribute('aria-expanded', 'true');
                const overlay = nav.querySelector('.mega-overlay');
                if (overlay) overlay.classList.add('visible');
              }
            });

            navItem.addEventListener('mouseleave', () => {
              if (isDesktop.matches) {
                navItem.setAttribute('aria-expanded', 'false');
                btn.setAttribute('aria-expanded', 'false');
                const overlay = nav.querySelector('.mega-overlay');
                if (overlay) overlay.classList.remove('visible');
              }
            });

            // Mobile: click behavior
            btn.addEventListener('click', (e) => {
              if (!isDesktop.matches) {
                e.stopPropagation();
                const expanded = navItem.getAttribute('aria-expanded') === 'true';
                closeAllMegaMenus(nav);
                if (!expanded) {
                  navItem.setAttribute('aria-expanded', 'true');
                  btn.setAttribute('aria-expanded', 'true');
                }
              }
            });
          }

          navItem.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  // Process tools section (DEMOS + CONTACT SALES)
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const bc = btn.closest('.button-container');
      if (bc) bc.className = '';
    });

    // Add classes to CTA buttons
    const links = navTools.querySelectorAll('a');
    links.forEach((a) => {
      if (a.textContent.trim().toUpperCase() === 'DEMOS') {
        a.classList.add('cta-demos');
      } else if (a.textContent.trim().toUpperCase() === 'CONTACT SALES') {
        a.classList.add('cta-contact');
      }
    });
  }

  // Background overlay for mega menus
  const overlay = document.createElement('div');
  overlay.className = 'mega-overlay';
  nav.append(overlay);
  overlay.addEventListener('click', () => closeAllMegaMenus(nav));

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
