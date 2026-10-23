document.addEventListener('DOMContentLoaded', () => {
  const data = JSON.parse(document.getElementById('organization-data').textContent);
  const panel = document.createElement('div');
  panel.id = 'org-panel'; panel.className = 'org-panel'; panel.hidden = true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','org-panel-title');
  panel.innerHTML = '<div class="org-panel-content"><button type="button" class="org-panel-close" aria-label="Close organization details">×</button><div class="org-panel-body"></div></div>';
  document.body.append(panel);
  const content = panel.querySelector('.org-panel-body');
  const closeButton = panel.querySelector('button');
  let opener, previousOverflow, tahamsGallery;
  function close() {
    panel.hidden = true;
    document.documentElement.style.overflow = previousOverflow;
    [...document.body.children].forEach(el => { if (el.dataset.orgInert === 'true') { el.inert=false; delete el.dataset.orgInert; } });
    opener?.focus({preventScroll:true});
  }
  function open(id, button) {
    const org = data.find(item => item.id === id);
    if (!org) return;
    opener = button;
    panel.classList.remove('org-tahams-gallery');
    content.replaceChildren();
    const image = document.createElement('img');
    image.className = 'org-panel-brand org-logo' + (org.light ? ' org-logo-invert' : '');image.src=org.logo;image.alt=org.name;
    const kicker=document.createElement('p');kicker.className='org-panel-kicker';kicker.textContent=org.role + (org.status ? ' / '+org.status : '');
    const title=document.createElement('h2');title.id='org-panel-title';title.textContent=org.name;
    content.append(image,kicker,title);
    if (org.description) {const p=document.createElement('p');p.className='org-panel-description';p.textContent=org.description;content.append(p);}
    if (org.timeline?.length) {
      const heading=document.createElement('p');heading.className='org-panel-kicker';heading.textContent='My time here';content.append(heading);
      const timeline=document.createElement('ol');timeline.className='org-timeline';
      org.timeline.forEach(entry=>{const item=document.createElement('li');const date=document.createElement('span');date.className='org-timeline-date';date.textContent=entry.date;const title=document.createElement('h3');title.textContent=entry.title;const text=document.createElement('p');text.textContent=entry.text;item.append(date,title,text);timeline.append(item);});content.append(timeline);
    }
    if (id==='tahams') {
      const label=document.createElement('p');label.className='org-panel-kicker';label.textContent='T-shirt designs';content.append(label);
      panel.classList.add('org-tahams-gallery');
      if(!tahamsGallery){
        tahamsGallery=document.createElement('div');tahamsGallery.className='gallery tahams-gallery';tahamsGallery.dataset.collection='t-shirt-design';tahamsGallery.tabIndex=0;tahamsGallery.setAttribute('role','region');tahamsGallery.setAttribute('aria-label','Tahams T-shirt design collection');
        content.append(tahamsGallery);
        requestAnimationFrame(()=>initializeGallery(tahamsGallery));
      }else content.append(tahamsGallery);
    } else if (org.artworks.length) {
      const label=document.createElement('p');label.className='org-panel-kicker';label.textContent='Selected work';content.append(label);
      const grid=document.createElement('div');grid.className='org-panel-work';
      org.artworks.forEach((src,index) => {const a=document.createElement('a');a.href=src;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','View '+org.name+' artwork '+(index+1));const img=document.createElement('img');img.src=src;img.alt=org.name+' — selected work '+(index+1);img.loading='lazy';a.append(img);grid.append(a);});content.append(grid);
    } else {const note=document.createElement('p');note.className='org-panel-note';note.textContent='More work coming soon.';content.append(note);}
    if (id==='tahams'||id==='mmsrc') {const a=document.createElement('a');a.className='org-panel-link';a.href=id==='tahams'?'t-shirt-design.html':'logo-mmsrc.html';a.textContent='Explore the full collection ↗';content.append(a);}
    if (org.projectLink) {const a=document.createElement('a');a.className='org-panel-link';a.href=org.projectLink;a.textContent='Explore Mukto Pani ↗';content.append(a);}
    if (org.website) {const a=document.createElement('a');a.className='org-panel-link';a.href=org.website;a.target='_blank';a.rel='noopener';a.textContent='Visit organization website ↗';content.append(a);}
    previousOverflow=document.documentElement.style.overflow;
    document.documentElement.style.overflow='hidden';panel.hidden=false;
    [...document.body.children].forEach(el => {if(el!==panel&&!el.inert&&!el.matches('.cursor-dot,.cursor-ring')){el.inert=true;el.dataset.orgInert='true';}});
    closeButton.focus({preventScroll:true});panel.querySelector('.org-panel-content').scrollTop=0;
  }
  document.querySelectorAll('[data-org]').forEach(button => button.addEventListener('click',()=>open(button.dataset.org,button)));
  closeButton.addEventListener('click',close);
  panel.addEventListener('click',event=>{if(event.target===panel)close();});
  panel.addEventListener('keydown',event=>{
    if(document.querySelector('.artwork-lightbox[open]'))return;
    if(event.key==='Escape'){event.preventDefault();close();}
    if(event.key==='Tab'){const links=[...panel.querySelectorAll('button,a[href],[tabindex="0"]')];const first=links[0],last=links.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  });
});
