/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-banner block
 * Source: https://www.gigamon.com/
 * Base Block: columns
 * 
 * Block Structure:
 * - Row: logo image | heading + description + CTA
 * 
 * Generated: 2026-02-04
 */
export default function parse(element, { document }) {
  const cells = [];
  
  // Find logo image
  const logo = element.querySelector('img[class*="frost"], img[alt*="frost"], .component-image img');
  
  // Find text content
  const heading = element.querySelector('h2, h3, .component-text h2');
  const description = element.querySelector('p:not(:has(img)), .component-text p');
  const cta = element.querySelector('a.btn, .component-cta-button a');
  
  // Build logo cell
  const logoCell = document.createElement('div');
  if (logo) {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = logo.src;
    img.alt = logo.alt || 'Award Logo';
    picture.appendChild(img);
    logoCell.appendChild(picture);
  }
  
  // Build content cell
  const contentCell = document.createElement('div');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    contentCell.appendChild(h2);
  }
  if (description) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    contentCell.appendChild(p);
  }
  if (cta) {
    const ctaP = document.createElement('p');
    const strong = document.createElement('strong');
    const link = document.createElement('a');
    link.href = cta.href;
    link.textContent = cta.textContent.trim() || 'READ NOW';
    strong.appendChild(link);
    ctaP.appendChild(strong);
    contentCell.appendChild(ctaP);
  }
  
  cells.push([logoCell, contentCell]);
  
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Banner', cells });
  element.replaceWith(block);
}
