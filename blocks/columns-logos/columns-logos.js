export default function decorate(block) {
  // Create marquee container
  const marqueeTrack = document.createElement('div');
  marqueeTrack.className = 'columns-logos-track';

  // Collect all logos from all rows
  const logos = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const logoItem = document.createElement('div');
        logoItem.className = 'columns-logos-item';
        logoItem.appendChild(pic.cloneNode(true));
        logos.push(logoItem);
      }
    });
  });

  // Add logos to track (duplicate for seamless loop)
  logos.forEach((logo) => marqueeTrack.appendChild(logo));
  logos.forEach((logo) => marqueeTrack.appendChild(logo.cloneNode(true)));

  // Clear block and add marquee
  block.innerHTML = '';
  block.appendChild(marqueeTrack);

  // Pause on hover
  block.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  block.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}
