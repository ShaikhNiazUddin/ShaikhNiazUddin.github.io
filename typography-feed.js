(() => {
  const feed = document.querySelector('.typography-masonry');
  const cards = [...feed.querySelectorAll('.type-artwork')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let items = [], columns = [], frame, lastTime = 0, travel = 0, pending = false;
  feed.addEventListener('click', event => {
    const card = event.target.closest('.type-artwork');
    if (card) openArtwork(card.querySelector('img'));
  });
  function paint() {
    items.forEach(item => {
      const offset = reduced.matches ? 0 : travel * item.direction;
      const y = ((item.start + offset) % item.cycle + item.cycle) % item.cycle;
      item.card.style.transform = `translateY(${y}px)`;
      // Only the clipped continuation of a boundary-crossing artwork is repeated.
      const crosses = y + item.height > item.cycle;
      item.edge.style.display = crosses ? 'block' : 'none';
      if (crosses) item.edge.style.transform = `translateY(${y-item.cycle}px)`;
    });
  }
  function tick(now) {
    frame = null;
    const dt = Math.min(50, now - (lastTime || now));
    lastTime = now;
    travel += dt * .014;
    paint();
    if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (frame) cancelAnimationFrame(frame);
    frame = null; lastTime = 0;
    if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
    else paint();
  }
  function build() {
    pending = false;
    const count = Number(getComputedStyle(feed).getPropertyValue('--feed-columns')) || 5;
    const groups = Array.from({length:count}, () => []);
    const remaining = [...cards].sort((a,b) => Number(a.dataset.tone)-Number(b.dataset.tone));
    for (let i=0; remaining.length; i++) {
      const col = i % count, row = Math.floor(i/count);
      groups[col].push((row+col)%2 ? remaining.pop() : remaining.shift());
    }
    feed.replaceChildren(); items = []; columns = []; travel = 0;
    groups.forEach((group,index) => {
      const column = document.createElement('div');
      column.className = 'flow-column unique-flow-column';
      group.forEach(card => { card.style.cssText = ''; column.append(card); });
      feed.append(column);
      columns.push({element:column,group,index});
    });
    const gap = parseFloat(getComputedStyle(feed).columnGap) || 18;
    const heights = columns.map(({element,group}) => group.reduce((sum,card) => {
      const img = card.querySelector('img');
      return sum + element.clientWidth * Number(img.getAttribute('height')) / Number(img.getAttribute('width')) + gap;
    },0));
    const cycle = Math.ceil(Math.max(...heights));
    columns.forEach(({element,group,index},columnIndex) => {
      element.style.height = cycle + 'px';
      const extraGap = (cycle-heights[columnIndex]) / group.length;
      let start = 0;
      group.forEach(card => {
        const img = card.querySelector('img');
        const height = element.clientWidth * Number(img.getAttribute('height')) / Number(img.getAttribute('width'));
        const edge = card.cloneNode(true);
        edge.classList.add('flow-edge-piece'); edge.setAttribute('aria-hidden','true'); edge.tabIndex = -1;
        element.append(edge);
        items.push({card,edge,height,start,cycle,direction:index%2 ? 1 : -1});
        start += height + gap + extraGap;
      });
    });
    paint(); resume();
  }
  function schedule() { if (!pending) { pending=true; requestAnimationFrame(build); } }
  let width = 0;
  new ResizeObserver(entries => {
    const nextWidth = entries[0].contentRect.width;
    if (Math.abs(nextWidth-width) > 1) {width=nextWidth;schedule();}
  }).observe(feed);
  document.addEventListener('visibilitychange',resume);
  reduced.addEventListener('change', () => {travel=0;resume();});
  build();
})();