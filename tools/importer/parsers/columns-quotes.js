/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-quotes block
 * Source: https://www.gigamon.com/
 * Base Block: columns
 * 
 * Block Structure:
 * - Row: column1 (logo + quote + author + CTA) | column2 (logo + quote + author + CTA)
 * 
 * Generated: 2026-02-04
 */
export default function parse(element, { document }) {
  const cells = [];
  
  // Find quote columns
  const columns = element.querySelectorAll('.column, [class*="col-"]');
  const row = [];
  
  columns.forEach(column => {
    const logo = column.querySelector('img[class*="logo"], .component-image img');
    const quoteText = column.querySelector('blockquote, .quote, p');
    const author = column.querySelector('.author, .attribution, strong');
    const cta = column.querySelector('a.btn, .btn-link-with-arrow');
    
    const cell = document.createElement('div');
    
    if (logo) {
      const logoP = document.createElement('p');
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = logo.src;
      img.alt = logo.alt || '';
      picture.appendChild(img);
      logoP.appendChild(picture);
      cell.appendChild(logoP);
    }
    
    if (quoteText) {
      const quoteP = document.createElement('p');
      quoteP.textContent = quoteText.textContent.trim();
      cell.appendChild(quoteP);
    }
    
    if (author) {
      const authorP = document.createElement('p');
      authorP.textContent = author.textContent.trim();
      cell.appendChild(authorP);
    }
    
    if (cta) {
      const ctaP = document.createElement('p');
      const strong = document.createElement('strong');
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.textContent.trim() || 'Read More';
      strong.appendChild(link);
      ctaP.appendChild(strong);
      cell.appendChild(ctaP);
    }
    
    if (cell.hasChildNodes()) {
      row.push(cell);
    }
  });
  
  if (row.length > 0) {
    cells.push(row);
  }
  
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Quotes', cells });
  element.replaceWith(block);
}
