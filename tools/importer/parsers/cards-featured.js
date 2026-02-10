/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-featured block
 * Source: https://www.gigamon.com/
 * Base Block: cards
 * 
 * Block Structure:
 * - Row: image | label + logo + quote + author + CTA
 * 
 * Generated: 2026-02-04
 */
export default function parse(element, { document }) {
  const cells = [];
  
  // Find featured case study container
  const container = element.closest('.rhs-feature-grid') || element.parentElement;
  
  // Extract image
  const image = container.querySelector('img.rhs-feature-image, .component-image img');
  
  // Extract content
  const logo = container.querySelector('.wyndham-logo, img[class*="logo"]');
  const quote = container.querySelector('blockquote, .quote-text, p');
  const author = container.querySelector('.author, .attribution');
  const cta = container.querySelector('a.btn, .btn-link-with-arrow');
  
  // Build image cell
  const imageCell = document.createElement('div');
  if (image) {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt || 'Case Study';
    picture.appendChild(img);
    imageCell.appendChild(picture);
  }
  
  // Build content cell
  const contentCell = document.createElement('div');
  
  const labelP = document.createElement('p');
  labelP.textContent = 'FEATURED CASE STUDY';
  contentCell.appendChild(labelP);
  
  if (logo) {
    const logoP = document.createElement('p');
    const logoImg = document.createElement('img');
    logoImg.src = logo.src;
    logoImg.alt = logo.alt || '';
    logoP.appendChild(logoImg);
    contentCell.appendChild(logoP);
  }
  
  if (quote) {
    const quoteP = document.createElement('p');
    quoteP.textContent = quote.textContent.trim();
    contentCell.appendChild(quoteP);
  }
  
  if (author) {
    const authorP = document.createElement('p');
    authorP.textContent = author.textContent.trim();
    contentCell.appendChild(authorP);
  }
  
  if (cta) {
    const ctaP = document.createElement('p');
    const strong = document.createElement('strong');
    const link = document.createElement('a');
    link.href = cta.href;
    link.textContent = 'Read Case Study';
    strong.appendChild(link);
    ctaP.appendChild(strong);
    contentCell.appendChild(ctaP);
  }
  
  cells.push([imageCell, contentCell]);
  
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Featured', cells });
  element.replaceWith(block);
}
