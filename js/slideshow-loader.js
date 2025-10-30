/* Slideshow Loader (seeded shuffle + first image prioritization)
 * - Reads data from <script type="application/json" id="slideshow-data"> or from existing DOM (.slider .slides)
 * - Session-scoped seeded shuffle to keep order stable within a session
 * - Put first 'image' item as first; if none, use 'anim' poster first
 * - Prefetch next (index+1) after load; others remain lazy
 * - Respect prefers-reduced-motion: show poster only for anim
 * - Idempotent: no-op if already initialized
 */
(function(){
  if (document.documentElement.dataset.slideshowLoaderInit === '1') return;
  document.documentElement.dataset.slideshowLoaderInit = '1';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  function init(){
    var slider = document.querySelector('.slider .slides');
    if (!slider) return;
    if (slider.dataset.loaderInitialized === '1') return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var items = readFromJson() || readFromDom(slider);
    if (!items || items.length === 0) return;

    // seeded shuffle (session-scoped)
    var seed = getSessionSeed();
    items = seededShuffle(items.slice(), seed);

    // prioritize first image
    var firstImgIndex = items.findIndex(function(it){ return it.kind === 'image'; });
    if (firstImgIndex > 0) {
      var first = items.splice(firstImgIndex,1)[0];
      items.unshift(first);
    }

    // Build DOM idempotently
    slider.innerHTML = '';
    slider.dataset.loaderInitialized = '1';

    items.forEach(function(it, idx){
      var slide = document.createElement('div');
      slide.className = 'slide' + (idx === 0 ? ' active' : '');
      // aspect ratio guard
      if (it.width && it.height) {
        slide.style.position = 'relative';
        slide.style.width = '100%';
        slide.style.height = '0';
        slide.style.paddingTop = (it.height / it.width * 100).toFixed(4) + '%';
        slide.style.overflow = 'hidden';
      }

      var inner;
      if (it.kind === 'image') {
        inner = buildPicture(it, idx === 0 /*eager*/);
      } else { // anim
        inner = buildPoster(it, /*eager*/ idx === 0, prefersReducedMotion);
      }
      // absolute fill for media
      inner.style.position = 'absolute';
      inner.style.top = '0';
      inner.style.left = '0';
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.objectFit = 'cover';

      slide.appendChild(inner);
      slider.appendChild(slide);
    });

    // Prefetch next
    window.addEventListener('load', function(){
      prefetchIndex(1);
    });

    // Observe active slide changes to swap poster->anim
    var obs = new MutationObserver(function(){
      var active = slider.querySelector('.slide.active');
      if (!active) return;
      // find anim poster with data-anim
      var img = active.querySelector('img[data-anim]');
      if (img && !img.dataset.animApplied && !prefersReducedMotion) {
        img.dataset.animApplied = '1';
        img.src = img.getAttribute('data-anim');
        if (img.srcset) img.removeAttribute('srcset');
      }
      // prefetch next
      var all = Array.from(slider.children);
      var idx = all.indexOf(active);
      prefetchIndex((idx+1)%all.length);
    });
    obs.observe(slider, { subtree: true, attributes: true, attributeFilter: ['class'] });

    function prefetchIndex(i){
      var sl = slider.children[i];
      if (!sl) return;
      var img = sl.querySelector('img[data-anim]');
      if (img && !img.dataset.prefetched && !prefersReducedMotion) {
        var url = img.getAttribute('data-anim');
        var im = new Image();
        im.src = url; // browser caches
        img.dataset.prefetched = '1';
      }
      var picImg = sl.querySelector('img[data-kind="image"]');
      if (picImg && !picImg.dataset.prefetched) {
        // Let browser resolve srcset via sizes; a simple hint is enough
        var tmp = new Image();
        tmp.sizes = picImg.sizes || '(max-width: 768px) 100vw, 100vw';
        tmp.srcset = picImg.srcset || '';
        tmp.src = picImg.currentSrc || picImg.src;
        picImg.dataset.prefetched = '1';
      }
    }
  }

  function getSessionSeed(){
    var key = 'slideshowSeed';
    var s = sessionStorage.getItem(key);
    if (!s) {
      s = String(Math.floor(Math.random()*1e9));
      sessionStorage.setItem(key, s);
    }
    return parseInt(s,10) || 1;
  }

  // LCG rng
  function seededShuffle(arr, seed){
    function rand(){ seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildPicture(it, eager){
    var pic = document.createElement('picture');
    var srcsetWebp = it.srcsetWebp || it.srcset || '';
    if (srcsetWebp) {
      var source = document.createElement('source');
      source.type = 'image/webp';
      source.srcset = srcsetWebp;
      pic.appendChild(source);
    }
    var img = document.createElement('img');
    img.setAttribute('data-kind','image');
    img.src = it.src || '';
    if (it.srcsetJpg) img.srcset = it.srcsetJpg;
    img.sizes = it.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 960px, 1600px';
    img.alt = it.alt || '';
    if (it.width && it.height){ img.width = it.width; img.height = it.height; }
    img.decoding = 'async';
    if (eager) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    } else {
      img.loading = 'lazy';
    }
    pic.appendChild(img);
    return pic;
  }

  function buildPoster(it, eager, prefersReducedMotion){
    var img = document.createElement('img');
    img.alt = it.alt || '';
    if (it.width && it.height){ img.width = it.width; img.height = it.height; }
    img.decoding = 'async';
    img.setAttribute('data-kind','anim');
    img.setAttribute('data-anim', it.anim || '');
    img.src = it.poster || '';
    if (eager) { img.loading = 'eager'; img.fetchPriority = 'high'; } else { img.loading = 'lazy'; }
    if (prefersReducedMotion) {
      // keep poster only
      img.removeAttribute('data-anim');
    }
    return img;
  }

  function readFromJson(){
    var tag = document.getElementById('slideshow-data');
    if (!tag) return null;
    try { return JSON.parse(tag.textContent).items || null; } catch { return null; }
  }

  function readFromDom(slidesContainer){
    // Use existing <img> under .slides to build image items
    var imgs = Array.from(slidesContainer.querySelectorAll('img'));
    if (imgs.length === 0) return null;
    return imgs.map(function(img){
      var w = toInt(img.getAttribute('width')) || undefined;
      var h = toInt(img.getAttribute('height')) || undefined;
      var src = img.getAttribute('src');
      var item = { kind: 'image', src: src, srcset: img.getAttribute('srcset') || '', width: w, height: h, alt: img.getAttribute('alt') || '' };
      return item;
    });
  }

  function toInt(v){ var n = parseInt(v,10); return isNaN(n)?0:n; }
})();
