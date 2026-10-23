(() => {
  const section=document.querySelector('#passion');
  if(!section)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>section.classList.toggle('passion-visible',entry.isIntersecting));
  },{threshold:.2});
  observer.observe(section);
  let opening=false;
  section.querySelector('.passion-knob').addEventListener('click',()=>{
    if(opening)return;
    opening=true;
    if(reduced){location.href='passions.html';return;}
    section.classList.add('passion-opening');
    section.querySelector('.passion-knob').disabled=true;
    setTimeout(()=>{
      const stage=section.querySelector('.passion-door-stage');
      const rect=stage.getBoundingClientRect();
      const zoom=document.createElement('div');
      zoom.className='passion-zoom passion-opening';
      zoom.setAttribute('aria-hidden','true');
      Object.assign(zoom.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
      zoom.append(stage.cloneNode(true));
      zoom.querySelectorAll('button').forEach(button=>button.tabIndex=-1);
      document.body.append(zoom);
      const scale=Math.max(innerWidth/rect.width,innerHeight/rect.height)*2.5;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        zoom.style.transform=`translate(${innerWidth/2-rect.left-rect.width/2}px,${innerHeight/2-rect.top-rect.height/2}px) scale(${scale})`;
      }));
      setTimeout(()=>{location.href='passions.html';},1150);
    },1000);
  });
  addEventListener('pageshow',event=>{if(event.persisted){opening=false;section.classList.remove('passion-opening');section.querySelector('.passion-knob').disabled=false;document.querySelector('.passion-zoom')?.remove();}});
})();
