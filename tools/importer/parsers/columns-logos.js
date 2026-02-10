/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-logos block
 * Source: https://www.gigamon.com/
 * Base Block: columns
 * 
 * Block Structure:
 * - Multiple columns, each containing a logo image
 * 
 * Generated: 2026-02-04
 */
export default function parse(element, { document }) {
  const cells = [];
  
  // Find all logo images
  const logoImages = element.querySelectorAll('.component-image img');
  const logos = Array.from(logoImages);
  
  // Group logos into rows of 4
  const rowSize = 4;
  for (let i = 0; i < logos.length; i += rowSize) {
    const rowLogos = logos.slice(i, i + rowSize);
    const row = rowLogos.map(img => {
      const picture = document.createElement('picture');
      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.alt || '';
      picture.appendChild(imgEl);
      return picture;
    });
    cells.push(row);
  }
  
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Logos', cells });
  element.replaceWith(block);
}
