(() => {
  const targets = document.querySelectorAll('.card, .showcase, .about-founder, .about, section.testimonials, section.contact');
  targets.forEach((element) => element.classList.add('reveal-ready'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });

    targets.forEach((element) => observer.observe(element));
  } else {
    targets.forEach((element) => element.classList.add('is-visible'));
  }

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const funLayer = document.createElement('div');
  funLayer.className = 'fun-layer';
  funLayer.setAttribute('aria-hidden', 'true');
  funLayer.innerHTML = '<span class="ambient-orb"></span><span class="ambient-orb"></span>';
  document.body.appendChild(funLayer);

  const updateProgress = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = available > 0 ? Math.min(1, window.scrollY / available) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* Tiny Web Audio sound engine: generated locally, with no media downloads. */
  let soundEnabled = true;
  try { soundEnabled = localStorage.getItem('ukhti-sound') !== 'off'; } catch (error) { /* Storage can be unavailable. */ }
  let audioContext = null;
  let lastHoverTarget = null;
  let lastScrollSound = 0;
  let previousScrollY = window.scrollY;

  const soundToggle = document.createElement('button');
  soundToggle.className = `sound-toggle${soundEnabled ? '' : ' is-muted'}`;
  soundToggle.type = 'button';
  soundToggle.setAttribute('aria-label', soundEnabled ? 'Mute website sounds' : 'Enable website sounds');
  soundToggle.setAttribute('aria-pressed', (!soundEnabled).toString());
  soundToggle.title = soundEnabled ? 'Mute sounds' : 'Enable sounds';
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
  document.body.appendChild(soundToggle);

  const ensureAudio = () => {
    if (!soundEnabled) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  };

  const tone = (frequency, duration = .08, volume = .025, type = 'sine', endFrequency = frequency) => {
    const context = ensureAudio();
    if (!context) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(40, frequency), now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  };

  const playClick = () => {
    tone(480, .07, .16, 'triangle', 720);
    window.setTimeout(() => tone(880, .055, .11, 'sine', 1040), 35);
  };
  const playHover = () => tone(760, .11, .075, 'sine', 1240);
  const playNavigation = () => {
    tone(520, .13, .14, 'triangle', 690);
    window.setTimeout(() => tone(780, .16, .10, 'sine', 1040), 75);
  };

  soundToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    soundEnabled = !soundEnabled;
    try { localStorage.setItem('ukhti-sound', soundEnabled ? 'on' : 'off'); } catch (error) { /* Ignore storage failures. */ }
    soundToggle.classList.toggle('is-muted', !soundEnabled);
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggle.title = soundEnabled ? 'Mute sounds' : 'Enable sounds';
    soundToggle.setAttribute('aria-label', soundEnabled ? 'Mute website sounds' : 'Enable website sounds');
    soundToggle.setAttribute('aria-pressed', (!soundEnabled).toString());
    if (soundEnabled) playClick();
  });

  document.addEventListener('pointerdown', (event) => {
    if (event.target === soundToggle) return;
    ensureAudio();
    playClick();
  }, { passive: true });

  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest('a, button, .card, .carousel-item');
    if (!target || target === lastHoverTarget || target === soundToggle) return;
    lastHoverTarget = target;
    playHover();
  }, { passive: true });
  document.addEventListener('pointerout', (event) => {
    const target = event.target.closest('a, button, .card, .carousel-item');
    if (target && !target.contains(event.relatedTarget)) lastHoverTarget = null;
  }, { passive: true });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (link && !link.getAttribute('href').startsWith('#')) playNavigation();
  });

  window.addEventListener('scroll', () => {
    if (!audioContext || !soundEnabled) return;
    const now = performance.now();
    const distance = Math.abs(window.scrollY - previousScrollY);
    if (now - lastScrollSound > 150 && distance > 4) {
      const direction = window.scrollY >= previousScrollY ? 1 : -1;
      tone(direction > 0 ? 230 : 310, .06, .11, 'sine', direction > 0 ? 285 : 250);
      lastScrollSound = now;
    }
    previousScrollY = window.scrollY;
  }, { passive: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer || reduceMotion) return;

  let lastSpark = 0;
  let tiltedItem = null;

  const burstConfetti = (x, y) => {
    const colors = ['#00f5d4', '#8b5cf6', '#f43f9e', '#ffe66d', '#ffffff'];
    for (let index = 0; index < 24; index += 1) {
      const piece = document.createElement('span');
      const angle = (Math.PI * 2 * index) / 24 + Math.random() * .25;
      const distance = 55 + Math.random() * 85;
      piece.className = 'confetti-piece';
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.setProperty('--confetti-color', colors[index % colors.length]);
      piece.style.setProperty('--confetti-x', `${Math.cos(angle) * distance}px`);
      piece.style.setProperty('--confetti-y', `${Math.sin(angle) * distance + 45}px`);
      piece.style.setProperty('--confetti-spin', `${Math.round(Math.random() * 720 - 360)}deg`);
      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
    }
  };

  document.addEventListener('pointermove', (event) => {
    const interactive = event.target.closest('.card, .carousel-item');
    if (tiltedItem && tiltedItem !== interactive) {
      tiltedItem.style.setProperty('--tilt-x', '0deg');
      tiltedItem.style.setProperty('--tilt-y', '0deg');
    }
    if (interactive) {
      const rect = interactive.getBoundingClientRect();
      interactive.style.setProperty('--tilt-x', `${((rect.height / 2 - (event.clientY - rect.top)) / rect.height) * 7}deg`);
      interactive.style.setProperty('--tilt-y', `${(((event.clientX - rect.left) - rect.width / 2) / rect.width) * 7}deg`);
    }
    tiltedItem = interactive;

    const now = performance.now();
    if (now - lastSpark < 65) return;
    lastSpark = now;
    const spark = document.createElement('span');
    spark.className = 'cursor-spark';
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.style.color = Math.random() > .5 ? 'var(--cyan)' : 'var(--pink)';
    spark.style.setProperty('--spark-x', `${(Math.random() - .5) * 28}px`);
    spark.style.setProperty('--spark-y', `${12 + Math.random() * 22}px`);
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  }, { passive: true });

  document.addEventListener('pointerdown', (event) => {
    burstConfetti(event.clientX, event.clientY);
  }, { passive: true });
})();
