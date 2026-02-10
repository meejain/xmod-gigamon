/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-news block
 * Source: https://www.gigamon.com/
 * Base Block: carousel
 * 
 * Block Structure:
 * - Row per card: image | category + title + description + CTA
 * 
 * Generated: 2026-02-04
 */
export default function parse(element, { document }) {
  const cells = [];
  
  // Find all news card items (excluding cloned)
  const cards = element.querySelectorAll('.slick-slide:not(.slick-cloned) .card, .slick-slide:not(.slick-cloned) .news-item');
  
  cards.forEach(card => {
    const image = card.querySelector('img');
    const category = card.querySelector('.category, .label, .tag');
    const title = card.querySelector('h3, h4, .title');
    const description = card.querySelector('p, .description');
    const cta = card.querySelector('a.btn, a.cta');
    
    // Build image cell
    const imageCell = document.createElement('div');
    if (image) {
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt || '';
      picture.appendChild(img);
      imageCell.appendChild(picture);
    }
    
    // Build content cell
    const contentCell = document.createElement('div');
    if (category) {
      const catP = document.createElement('p');
      catP.textContent = category.textContent.trim();
      contentCell.appendChild(catP);
    }
    if (title) {
      const titleP = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      titleP.appendChild(strong);
      contentCell.appendChild(titleP);
    }
    if (description) {
      const descP = document.createElement('p');
      descP.textContent = description.textContent.trim();
      contentCell.appendChild(descP);
    }
    if (cta) {
      const ctaP = document.createElement('p');
      const strong = document.createElement('strong');
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.textContent.trim();
      strong.appendChild(link);
      ctaP.appendChild(strong);
      contentCell.appendChild(ctaP);
    }
    
    if (imageCell.hasChildNodes() || contentCell.hasChildNodes()) {
      cells.push([imageCell, contentCell]);
    }
  });
  
  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel-News', cells });
  element.replaceWith(block);
}
