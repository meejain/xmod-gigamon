/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Gigamon website cleanup
 * Purpose: Remove non-content elements and fix DOM issues
 * Applies to: www.gigamon.com (all templates)
 * Generated: 2026-02-04
 * 
 * SELECTORS EXTRACTED FROM: Captured DOM during migration workflow
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform'
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove sticky footer and contact sales banner
    // EXTRACTED: Found <section class="component-sticky-footer"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.component-sticky-footer',
      '.sticky-footer'
    ]);
    
    // Remove social share widgets
    // EXTRACTED: Found <div class="socialshare"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.socialshare',
      '#ShareThisModule'
    ]);
    
    // Remove slick carousel cloned slides (duplicates)
    // EXTRACTED: Found .slick-cloned elements in carousel DOM
    WebImporter.DOMUtils.remove(element, [
      '.slick-cloned'
    ]);
    
    // Remove empty component-html sections
    // EXTRACTED: Found empty <section class="component-html"> sections
    const emptyHtmlSections = element.querySelectorAll('section.component-html');
    emptyHtmlSections.forEach(section => {
      if (!section.textContent.trim()) {
        section.remove();
      }
    });
    
    // Re-enable scrolling if blocked
    if (element.style.overflow === 'hidden') {
      element.setAttribute('style', 'overflow: scroll;');
    }
  }
  
  if (hookName === TransformHook.afterTransform) {
    // Clean up tracking attributes
    // EXTRACTED: Found data-component-name, onclick attributes in DOM
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      el.removeAttribute('data-component-name');
      el.removeAttribute('onclick');
      el.removeAttribute('data-slick-index');
      el.removeAttribute('aria-hidden');
      el.removeAttribute('tabindex');
    });
    
    // Remove remaining unwanted elements
    WebImporter.DOMUtils.remove(element, [
      'source',
      'noscript',
      'svg'
    ]);
  }
}
