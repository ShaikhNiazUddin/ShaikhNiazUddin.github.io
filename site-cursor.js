(() => {
  if (!matchMedia('(pointer: fine)').matches) return;
  const root = document.documentElement;
  const ring = document.createElement('div');
  const dot = document.createElement('div');
  ring.className = 'site-cursor-ring';
  dot.className = 'site-cursor-dot';
  ring.innerHTML = '<i></i>';
  ring.setAttribute('aria-hidden', 'true');
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(ring, dot);
  root.classList.add('site-has-cursor');
  let x = -100, y = -100, rx = -100, ry = -100, frame;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function draw() {
    rx += (x - rx) * (reduce.matches ? 1 : .16);
    ry += (y - ry) * (reduce.matches ? 1 : .16);
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    if (Math.abs(x-rx)+Math.abs(y-ry) > .1) frame = requestAnimationFrame(draw);
    else frame = null;
  }
  addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    x = event.clientX; y = event.clientY;
    root.classList.add('site-cursor-on');
    root.classList.toggle('site-cursor-link', !!event.target.closest('a, button, [role="button"]'));
    if (!frame) frame = requestAnimationFrame(draw);
  }, {passive:true});
  root.addEventListener('mouseleave', () => root.classList.remove('site-cursor-on'));
  addEventListener('blur', () => root.classList.remove('site-cursor-on'));
  addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    root.classList.add('site-cursor-down');
    const ripple = document.createElement('span');
    ripple.className = 'site-click-ripple';
    ripple.setAttribute('aria-hidden','true');
    ripple.style.left = event.clientX + 'px';
    ripple.style.top = event.clientY + 'px';
    (document.querySelector('dialog[open]') || document.body).append(ripple);
    setTimeout(() => ripple.remove(), 500);
  }, {passive:true});
  addEventListener('pointerup', () => root.classList.remove('site-cursor-down'));
  // Dialogs use the browser's top layer; keep the custom cursor in that layer too.
  new MutationObserver(() => {
    const host = document.querySelector('dialog[open]') || document.body;
    if (ring.parentNode !== host) host.append(ring, dot);
  }).observe(document.body, {subtree:true, attributes:true, attributeFilter:['open']});
})();
