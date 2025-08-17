// steps-slider.js
(() => {
  const SECTION_ID = 'steps-section';
  const CONTAINER_ID = 'steps-container';

  const makeEl = (tag, cls, html) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  };

  function buildSlider(container){
    if (!container || container.dataset.sliderInitialized) return;

    const stepItems = Array.from(container.querySelectorAll('.step-item'));
    if (!stepItems.length) return;

    const slider = makeEl('div','steps-slider');
    const slides = makeEl('div','slides');

    stepItems.forEach(item => {
      const slide = makeEl('div','slide');
      slide.appendChild(item);
      slides.appendChild(slide);
    });

    slider.appendChild(slides);

    // NAV
    const prev = makeEl('button','steps-nav-btn prev','&#9664;');
    const next = makeEl('button','steps-nav-btn next','&#9654;');
    prev.setAttribute('aria-label','Anterior');
    next.setAttribute('aria-label','Próximo');

    slider.appendChild(prev);
    slider.appendChild(next);

    // DOTS
    const dotsWrap = makeEl('div','steps-dots');
    const dots = stepItems.map((_,i)=>{
      const d = makeEl('button','steps-dot');
      d.setAttribute('aria-label',`Ir para passo ${i+1}`);
      dotsWrap.appendChild(d);
      return d;
    });

    // Mount
    container.innerHTML = '';
    container.appendChild(slider);
    container.appendChild(dotsWrap);

    // State
    let index = 0;
    const total = stepItems.length;
    const section = document.getElementById(SECTION_ID);
    if (section) section.style.display = ''; // revela seção

    function update(){
      slides.style.transform = `translateX(-${index*100}%)`;
      dots.forEach((d,i)=>d.classList.toggle('active', i===index));
      prev.disabled = index === 0;
      next.disabled = index === total-1;
    }

    function goTo(i){
      index = Math.max(0, Math.min(total-1, i));
      update();
    }

    prev.addEventListener('click', ()=>goTo(index-1));
    next.addEventListener('click', ()=>goTo(index+1));
    dots.forEach((d,i)=>d.addEventListener('click', ()=>goTo(i)));

    // Teclado
    slider.setAttribute('tabindex','0');
    slider.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index-1); }
      if (e.key === 'ArrowRight'){ e.preventDefault(); goTo(index+1); }
    });

    // Swipe touch
    let startX = null;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
    slider.addEventListener('touchend', e => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
      startX = null;
    });

    // Prefers-reduced-motion (tira animação)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotion = () => {
      slides.style.transition = media.matches ? 'none' : 'transform .45s cubic-bezier(.22,.61,.36,1)';
    };
    applyMotion();
    media.addEventListener?.('change', applyMotion);

    container.dataset.sliderInitialized = 'true';
    update();
  }

  function initWhenReady(){
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // Caso os passos já existam:
    buildSlider(container);

    // Observa quando seu main.js inserir os passos
    const mo = new MutationObserver(() => {
      // Se ainda não foi inicializado, tenta montar:
      if (!container.dataset.sliderInitialized) buildSlider(container);
    });
    mo.observe(container, {childList:true, subtree:false});
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }
})();
