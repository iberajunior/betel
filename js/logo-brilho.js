/* Betel Engenharia | Brilho da logo do rodape
   Uma faisca de luz percorre o contorno do simbolo (como um cordao de solda),
   o simbolo acende de leve e um reflexo atravessa a logo. Repete enquanto
   a logo estiver visivel. Respeita "reduzir movimento" do sistema. */
(function () {
  var HOLD = 3800; /* ms com a logo parada antes de repetir */
  var DUR = 3200;  /* duracao de um ciclo (igual ao CSS) */

  /* Contorno do simbolo (vetor original LOGO/SVG/Prancheta 6), encaixado no PNG do rodape (1550x594) */
  var PTS = '979.22 87.8 920.72 121.57 920.72 201.41 920.81 201.36 920.81 268.06 920.81 321.77 920.81 333.8 977.74 366.67 1034.68 333.8 1034.68 268.06 978.41 235.57 978.41 168.1 979.22 167.64 1094.65 234.28 1094.65 367.58 979.22 434.22 863.78 367.58 863.78 352.23 863.11 352.23 863.11 154.83 794.64 194.36 794.64 407.5 979.22 514.06 1163.79 407.5 1163.79 194.36 979.22 87.8';
  var FIT = 'translate(20 20) scale(1.3003) translate(-794.64 -87.8)';

  var css =
    '.bs-wrap{position:relative;display:inline-block;line-height:0;vertical-align:top}' +
    '.bs-wrap img{display:block;position:relative}' +
    '.bs-sheen{position:absolute;inset:0;pointer-events:none;opacity:0;' +
      '-webkit-mask:var(--bs-mask) center/100% 100% no-repeat;mask:var(--bs-mask) center/100% 100% no-repeat;' +
      'background:linear-gradient(105deg,transparent 0%,transparent 38%,rgba(0,219,255,.0) 42%,rgba(120,236,255,.85) 48.5%,#fff 50%,rgba(120,236,255,.85) 51.5%,rgba(0,219,255,0) 58%,transparent 62%,transparent 100%) 160% 0/260% 100% no-repeat}' +
    '.bs-trace{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}' +
    '.bs-trace polygon{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:7 93;stroke-dashoffset:100;opacity:0}' +
    '.bs-trace .bs-glow{stroke:#00DBFF;stroke-width:30;stroke-opacity:.85}' +
    '.bs-trace .bs-core{stroke:#F2FDFF;stroke-width:9}' +
    '.bs-wrap.is-play .bs-trace polygon{animation:bsTrace ' + DUR + 'ms cubic-bezier(.45,.05,.35,1) both}' +
    '.bs-wrap.is-play .bs-sheen{animation:bsSheen ' + DUR + 'ms ease-in-out both}' +
    '.bs-wrap.is-play img{animation:bsGlow ' + DUR + 'ms ease-out both}' +
    '@keyframes bsTrace{0%{stroke-dashoffset:100;opacity:0}6%{opacity:1}58%{opacity:1}66%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:0;opacity:0}}' +
    '@keyframes bsSheen{0%,50%{background-position:160% 0;opacity:0}56%{opacity:1}88%{opacity:1}100%{background-position:-60% 0;opacity:0}}' +
    '@keyframes bsGlow{0%,52%{filter:drop-shadow(0 0 0 rgba(0,219,255,0))}66%{filter:drop-shadow(0 0 7px rgba(0,219,255,.55))}100%{filter:drop-shadow(0 0 0 rgba(0,219,255,0))}}' +
    '@media (prefers-reduced-motion:reduce){.bs-trace,.bs-sheen{display:none}.bs-wrap.is-play img{animation:none}}';

  function init() {
    var img = document.querySelector('.footer-logo img');
    if (!img || img.closest('.bs-wrap')) return;
    if (!document.getElementById('bs-style')) {
      var st = document.createElement('style'); st.id = 'bs-style'; st.textContent = css; document.head.appendChild(st);
    }
    var wrap = document.createElement('span'); wrap.className = 'bs-wrap';
    img.parentNode.insertBefore(wrap, img); wrap.appendChild(img);

    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'bs-trace'); svg.setAttribute('viewBox', '0 0 1550 594');
    svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    var defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = '<filter id="bsBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>';
    svg.appendChild(defs);
    var g = document.createElementNS(ns, 'g'); g.setAttribute('transform', FIT);
    ['bs-glow', 'bs-core'].forEach(function (c) {
      var p = document.createElementNS(ns, 'polygon');
      p.setAttribute('points', PTS); p.setAttribute('pathLength', '100'); p.setAttribute('class', c);
      if (c === 'bs-glow') p.setAttribute('filter', 'url(#bsBlur)');
      g.appendChild(p);
    });
    svg.appendChild(g);
    var sheen = document.createElement('span'); sheen.className = 'bs-sheen';
    wrap.appendChild(sheen); wrap.appendChild(svg);

    function setMask() { wrap.style.setProperty('--bs-mask', 'url("' + (img.currentSrc || img.src) + '")'); }
    setMask(); img.addEventListener('load', setMask);

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var inView = false, running = false, timer = null;
    function play() {
      if (!inView) { running = false; return; }
      running = true;
      wrap.classList.remove('is-play'); void wrap.offsetWidth; wrap.classList.add('is-play');
      clearTimeout(timer);
      timer = setTimeout(function () { running = false; if (inView) timer = setTimeout(play, HOLD); }, DUR);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (inView && !running) { clearTimeout(timer); timer = setTimeout(play, 350); }
      }, { threshold: 0.6 }).observe(img);
    }
    wrap.parentNode.addEventListener('mouseenter', function () { if (!running) { inView = true; clearTimeout(timer); play(); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
