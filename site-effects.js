(() => {
  const targets = document.querySelectorAll('.card, .showcase, .about-founder, .about, section.testimonials, section.contact');
  targets.forEach((element) => element.classList.add('reveal-ready'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px' });

  targets.forEach((element) => observer.observe(element));
})();
