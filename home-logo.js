(() => {
 const original=document.querySelector('#navbar a svg');
 if(!original)return;
 const link=document.createElement('a');
 link.className='corner-home-logo';
 link.href='#';
 link.setAttribute('aria-label','Return to landing page');
 link.title='Back to home';
 const logo=original.cloneNode(true);
 logo.removeAttribute('class');
 link.append(logo);
 const footer=document.querySelector('#contact');
 if(!footer)return;
 const row=footer.lastElementChild;
 row.className='footer-home-row';
 row.append(link);
 link.addEventListener('click',event=>{
  event.preventDefault();
  link.blur();
  history.replaceState(null,'',location.pathname+location.search);
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 });
})();
