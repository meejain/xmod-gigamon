/**
 * Metadata block - hides itself as it's only used for page metadata
 * @param {Element} block
 */
export default function decorate(block) {
  // Metadata block should be hidden - it's only used for storing page metadata
  block.closest('.section').remove();
}
