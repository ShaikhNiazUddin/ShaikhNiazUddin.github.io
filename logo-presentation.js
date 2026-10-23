document.querySelectorAll('.process-grid').forEach(track => {
  track.tabIndex = 0;
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', 'Design presentation, scroll or drag left and right');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hint = document.createElement('p');
  hint.className = 'presentation-hint';
  hint.textContent = 'Drag or scroll to explore →';
  track.before(hint);
  let target = track.scrollLeft, frame = 0, lastTime = 0, drag, moved = false;
  const clamp = value => Math.max(0, Math.min(track.scrollWidth - track.clientWidth, value));
  function animate(now) {
    frame = 0;
    const dt = Math.min(40, now - (lastTime || now - 16));
    lastTime = now;
    target = clamp(target);
    const next = track.scrollLeft + (target - track.scrollLeft) * (reduced.matches ? 1 : 1 - Math.exp(-dt / 100));
    track.scrollLeft = Math.abs(target - next) < .75 ? target : next;
    if (Math.abs(target-track.scrollLeft) > .75) frame = requestAnimationFrame(animate);
    else lastTime = 0;
  }
  function glide(value) { target = clamp(value); if (!frame) frame = requestAnimationFrame(animate); }
  track.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
    const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1);
    if ((delta > 0 && target >= track.scrollWidth-track.clientWidth-1) || (delta < 0 && target <= 0)) return;
    event.preventDefault();
    glide(target + delta);
  }, {passive:false});
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    glide(target + (event.key === 'ArrowRight' ? 1 : -1) * track.querySelector('figure').offsetWidth);
  });
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = {x:event.clientX, left:track.scrollLeft};
    target = track.scrollLeft;
    moved = false;
  });
  track.addEventListener('pointermove', event => {
    if (!drag) return;
    if (Math.abs(event.clientX-drag.x) > 6) {
      moved = true;
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    }
    if (moved) glide(drag.left - (event.clientX-drag.x));
  });
  function stop() { drag = null; track.classList.remove('is-dragging'); }
  track.addEventListener('pointerup', stop);
  track.addEventListener('pointercancel', stop);
  track.addEventListener('pointerleave', () => { if (!moved) stop(); });
  track.addEventListener('scroll', () => { if (!frame && !drag) target = track.scrollLeft; }, {passive:true});
  track.addEventListener('click', event => {
    if (moved) { event.preventDefault(); moved = false; }
  }, true);
});