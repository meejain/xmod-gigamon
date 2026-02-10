/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hero block
 * Source: https://www.gigamon.com/
 * Base Block: carousel
 * 
 * Block Structure:
 * - Row per slide: image | heading + description + CTA
 * 
 * Source HTML Pattern:
 * <section class="component-carousel slick-dotted">
 *   <div class="slick-slide">
 *     <section class="component-mega-banner">
 *       <h1>Heading</h1>
 *       <p>Description</p>
 *       <a class="btn">CTA</a>
 *     </section>
 *   </div>
 * </section>
 * 
 * Generated: 2026-02-04
 */
export default function parse(element, { document }) {
  const cells = [];
  
  // Find all slides (excluding cloned slides)
  const slides = element.querySelectorAll('.slick-slide:not(.slick-cloned)');
  
  slides.forEach(slide => {
    // Extract content from each slide
    const megaBanner = slide.querySelector('.component-mega-banner');
    if (!megaBanner) return;
    
    const heading = megaBanner.querySelector('h1, h2, .brand-copy');
    const description = megaBanner.querySelector('p.brand-copy, .component-text p');
    const cta = megaBanner.querySelector('a.btn, .component-cta-button a');
    
    // Build content cell
    const contentCell = document.createElement('div');
    if (heading) {
      const h1 = document.createElement('h1');
      h1.textContent = heading.textContent.trim();
      contentCell.appendChild(h1);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentCell.appendChild(p);
    }
    if (cta) {
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.textContent.trim();
      const strong = document.createElement('strong');
      strong.appendChild(link);
      const p = document.createElement('p');
      p.appendChild(strong);
      contentCell.appendChild(p);
    }
    
    // Add row for this slide
    cells.push([contentCell]);
  });
  
  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel-Hero', cells });
  element.replaceWith(block);
}
