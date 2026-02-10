/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-spotlight block
 * Source: https://www.gigamon.com/
 * Base Block: tabs
 * 
 * Block Structure:
 * - Row per tab: tab label | tab content (title + description + CTA)
 * 
 * Generated: 2026-02-04
 */
export default function parse(element, { document }) {
  const cells = [];
  
  // Find tab labels
  const tabLabels = element.querySelectorAll('.nav-tabs li a');
  // Find tab content panes
  const tabPanes = element.querySelectorAll('.tab-pane');
  
  tabLabels.forEach((label, index) => {
    const labelText = label.textContent.trim();
    const pane = tabPanes[index];
    
    if (!pane) return;
    
    // Extract content from tab pane
    const title = pane.querySelector('h2, h3, .component-text h2');
    const description = pane.querySelector('p, .component-text p');
    const cta = pane.querySelector('a.btn, .component-cta-button a');
    
    // Build content cell
    const contentCell = document.createElement('div');
    if (title) {
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(strong);
      contentCell.appendChild(p);
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
    
    cells.push([labelText, contentCell]);
  });
  
  const block = WebImporter.Blocks.createBlock(document, { name: 'Tabs-Spotlight', cells });
  element.replaceWith(block);
}
