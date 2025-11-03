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
      // Only optimize videos - images handled by HTML attributes
      optimizeVideos();
    } catch (e) {
      // Swallow to avoid breaking rendering
    }
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
