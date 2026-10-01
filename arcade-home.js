(() => {
  const data = Array.isArray(window.playablesData) ? window.playablesData : [];
  const count = document.getElementById('playable-count');
  const track = document.getElementById('playablesTrack');
  const filters = document.querySelectorAll('.filter-chip');
  const cards = Array.from(track ? track.children : []);
  const selectedLabel = document.querySelector('.featured-showcase .featured-label');

  const originalLoadPlayable = window.loadPlayable;
  if (typeof originalLoadPlayable === 'function') {
    window.loadPlayable = function (item, scroll = true) {
      originalLoadPlayable(item, scroll);
      const index = data.indexOf(item);
      if (selectedLabel && index >= 0) {
        selectedLabel.innerHTML = `<span class="status-dot"></span> NOW PLAYING / ${String(index + 1).padStart(3, '0')}`;
      }
    };
  }

  const updateFilter = (engine) => {
    let visible = 0;
    cards.forEach((card, index) => {
      const show = engine === 'all' || data[index]?.engine?.toLowerCase() === engine;
      card.hidden = !show;
      if (show) visible += 1;
    });
    filters.forEach((button) => {
      const active = button.dataset.engine === engine;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (count) count.textContent = String(visible).padStart(2, '0');
    if (track) track.parentElement.scrollTo({ left: 0, behavior: 'smooth' });
  };

  filters.forEach((button) => button.addEventListener('click', () => updateFilter(button.dataset.engine)));
  updateFilter('all');

  document.getElementById('surprise-playable')?.addEventListener('click', () => {
    if (!data.length || typeof window.loadPlayable !== 'function') return;
    const current = document.getElementById('active-playable-title')?.textContent;
    const choices = data.filter((item) => item.title !== current && !item.title.includes('?'));
    const pool = choices.length ? choices : data;
    const item = pool[Math.floor(Math.random() * pool.length)];
    window.loadPlayable(item, true);
  });

  document.querySelectorAll('.carousel-item').forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${card.querySelector('img')?.alt || 'Item'} — ${card.closest('#playablesTrack') ? 'play game' : 'watch creative'}`);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });

  const dropdown = document.querySelector('.dropdown');
  const dropdownTrigger = dropdown?.querySelector(':scope > a');
  dropdownTrigger?.setAttribute('aria-haspopup', 'true');
  dropdownTrigger?.setAttribute('aria-expanded', 'false');
  dropdownTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropdown.classList.toggle('show');
    dropdownTrigger.setAttribute('aria-expanded', String(dropdown.classList.contains('show')));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dropdown) {
      dropdown.classList.remove('show');
      dropdownTrigger?.setAttribute('aria-expanded', 'false');
    }
  });
})();
