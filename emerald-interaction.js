(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const glow = document.createElement('div');
  glow.className = 'background-cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  const hero = document.querySelector('.hero-layout');
  const host = hero || document.body;
  host.appendChild(glow);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 3;
  let framePending = false;

  const paint = () => {
    glow.style.setProperty('--glow-x', `${x}px`);
    glow.style.setProperty('--glow-y', `${y}px`);
    glow.classList.add('is-active');
    framePending = false;
  };

  window.addEventListener('pointermove', (event) => {
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      glow.classList.toggle('is-active', inside);
      if (!inside) return;
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else {
      x = event.clientX;
      y = event.clientY;
    }
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(paint);
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
})();
