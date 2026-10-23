(() => {
  const intro = document.querySelector('.case-intro');
  if (!intro || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const heading = intro.querySelector('h1');
  const lead = intro.querySelector('.case-lead');
  const text = heading.textContent;
  heading.setAttribute('aria-label', text);
  const fragment = document.createDocumentFragment();
  const letters = [];
  // Reserve the full heading layout throughout the typing animation.
  text.split(/(\s+)/).forEach(word => {
    if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(word)); return; }
    const wrapper = document.createElement('span');
    wrapper.className = 'typed-word';
    wrapper.setAttribute('aria-hidden', 'true');
    [...word].forEach(character => {
      const letter = document.createElement('span');
      letter.className = 'typed-letter';
      letter.textContent = character;
      wrapper.append(letter);
      letters.push(letter);
    });
    fragment.append(wrapper);
  });
  heading.replaceChildren(fragment);
  intro.classList.add('intro-typing');
  let start;
  const duration = Math.min(1700, Math.max(850, letters.length * 35));
  function type(now) {
    if (!start) start = now;
    const count = Math.min(letters.length, Math.floor((now - start) / duration * letters.length));
    letters.forEach((letter, index) => letter.classList.toggle('typed-visible', index < count));
    if (count < letters.length) requestAnimationFrame(type);
    else {
      intro.classList.add('intro-complete');
      // Restore normal selectable text after the reveal finishes.
      heading.textContent = text;
    }
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      requestAnimationFrame(type);
    }
  }, {threshold:.2});
  if (document.fonts) document.fonts.ready.then(() => observer.observe(intro));
  else observer.observe(intro);
})();
