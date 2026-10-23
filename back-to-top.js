(() => {
 const button=document.createElement('button');
 button.className='page-back-top';button.type='button';
 button.setAttribute('aria-label','Scroll to top');button.title='Back to top';
 button.textContent='↑';button.hidden=true;
 document.body.append(button);
 function update(){button.hidden=scrollY<Math.min(400,innerHeight*.5);}
 addEventListener('scroll',update,{passive:true});
 addEventListener('pageshow',update);
 button.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
 update();
})();
