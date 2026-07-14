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

  const bot = document.createElement('div');
  bot.className = 'arcade-bot';
  bot.setAttribute('aria-hidden', 'true');
  bot.innerHTML = '<span class="sprite-halo"></span><span class="sprite-wing sprite-wing-left"></span><span class="sprite-wing sprite-wing-right"></span><span class="sprite-tail"></span><div class="arcade-bot-body"><span class="bot-eye"></span><span class="bot-eye"></span><span class="sprite-cheek sprite-cheek-left"></span><span class="sprite-cheek sprite-cheek-right"></span><span class="bot-mouth"></span></div><span class="bot-sleep">Z</span>';
  document.body.appendChild(bot);

  let pointerX = window.innerWidth * .8;
  let pointerY = window.innerHeight * .3;
  let botX = pointerX + 24;
  let botY = pointerY + 24;
  let lastSpark = 0;
  let tiltedItem = null;
  let moveTimer = 0;
  let sleepTimer = 0;
  let boostTimer = 0;

  const wakeBot = () => {
    bot.classList.remove('is-sleepy');
    window.clearTimeout(sleepTimer);
    sleepTimer = window.setTimeout(() => bot.classList.add('is-sleepy'), 3600);
  };

  const blink = () => {
    if (!bot.classList.contains('is-sleepy')) {
      bot.classList.add('is-blinking');
      window.setTimeout(() => bot.classList.remove('is-blinking'), 130);
    }
    window.setTimeout(blink, 1800 + Math.random() * 2800);
  };
  window.setTimeout(blink, 1200);
  wakeBot();

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

  const animateBot = () => {
    botX += (pointerX + 24 - botX) * .12;
    botY += (pointerY + 22 - botY) * .12;
    const clampedX = Math.min(window.innerWidth - 88, Math.max(6, botX));
    const clampedY = Math.min(window.innerHeight - 76, Math.max(6, botY));
    bot.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
    requestAnimationFrame(animateBot);
  };
  requestAnimationFrame(animateBot);

  document.addEventListener('pointermove', (event) => {
    wakeBot();
    pointerX = event.clientX;
    pointerY = event.clientY;

    bot.classList.add('is-moving');
    window.clearTimeout(moveTimer);
    moveTimer = window.setTimeout(() => bot.classList.remove('is-moving'), 170);

    const lookX = Math.max(-2.5, Math.min(2.5, (pointerX - botX) / 45));
    const lookY = Math.max(-2, Math.min(2, (pointerY - botY) / 45));
    bot.style.setProperty('--look-x', `${lookX}px`);
    bot.style.setProperty('--look-y', `${lookY}px`);

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

  window.addEventListener('scroll', () => {
    wakeBot();
    bot.classList.add('is-boosting');
    window.clearTimeout(boostTimer);
    boostTimer = window.setTimeout(() => bot.classList.remove('is-boosting'), 180);
  }, { passive: true });

  document.addEventListener('pointerdown', (event) => {
    wakeBot();
    bot.classList.remove('is-excited');
    void bot.offsetWidth;
    bot.classList.add('is-excited');
    burstConfetti(event.clientX, event.clientY);
    window.setTimeout(() => bot.classList.remove('is-excited'), 480);
  }, { passive: true });
})();
