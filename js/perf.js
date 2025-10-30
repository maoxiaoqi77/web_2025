/* Lightweight performance helper for image/video/script loading
 * - Adds loading="lazy" to all non-critical images
 * - Keeps 1~2 above-the-fold images eager (marked via data-priority or heuristics)
 * - Sets decoding="async" and a safe sizes attribute for responsiveness
 * - Defers video loading with preload="none" and optional poster
 */
(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      optimizeImages();
      optimizeVideos();
    } catch (e) {
      // Swallow to avoid breaking rendering
    }
  }

  function optimizeImages() {
    /**
     * Priority images detection:
     * 1) Elements explicitly marked with data-priority
     * 2) First 2 images inside a top .slider or the first image in main
     */
    var imgs = Array.from(document.querySelectorAll('img'));
    if (imgs.length === 0) return;

    var priority = new Set();

    // Explicit priority via data attribute
    imgs.forEach(function (img) {
      if (img.hasAttribute('data-priority')) {
        priority.add(img);
      }
    });

    // Heuristics: top slider first 2 images
    var slider = document.querySelector('.slider .slides');
    if (slider) {
      var sliderImgs = Array.from(slider.querySelectorAll('img')).slice(0, 2);
      sliderImgs.forEach(function (img) { priority.add(img); });
    }

    // Fallback: ensure at least the very first image in the document is priority
    priority.add(imgs[0]);

    // Apply lazy and decoding/sizes defaults
    imgs.forEach(function (img) {
      // decoding
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      // sizes: generic responsive rule (can be overridden in markup)
      if (!img.hasAttribute('sizes')) {
        img.setAttribute('sizes', '(max-width: 768px) 100vw, 100vw');
      }

      // Non-priority => lazy
      if (!priority.has(img)) {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      } else {
        // Priority images should be eager
        if (img.getAttribute('loading') === 'lazy') {
          img.removeAttribute('loading');
        }
        if (!img.hasAttribute('fetchpriority')) {
          img.setAttribute('fetchpriority', 'high');
        }
      }
    });
  }

  function optimizeVideos() {
    var videos = Array.from(document.querySelectorAll('video'));
    if (videos.length === 0) return;

    videos.forEach(function (v) {
      // Avoid auto download
      v.setAttribute('preload', 'none');
      v.setAttribute('playsinline', '');
      // Poster: use data-poster if provided; otherwise try grab first frame source sibling jpg/webp with same base name
      if (!v.hasAttribute('poster')) {
        var poster = v.getAttribute('data-poster');
        if (poster) {
          v.setAttribute('poster', poster);
        }
      }
      // Also pause if somehow autoplay
      if (v.autoplay) {
        v.autoplay = false;
      }
    });
  }
})();
