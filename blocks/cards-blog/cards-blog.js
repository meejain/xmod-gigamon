export default function decorate(block) {
  // Block is already structured correctly from HTML
  // Add any additional decoration if needed
  block.querySelectorAll(':scope > div').forEach((card) => {
    card.classList.add('cards-blog-card');
  });
}
