/* Slideshow optimization for pages with many slides (drawing, project)
 * - DISABLED to avoid conflicts and black screen
 * - Minimal intervention strategy
 */
(function(){
  // Delay to not block initial render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(init, 500);
    });
  } else {
    setTimeout(init, 500);
  }

  function init(){
    // Only run on drawing or project pages with many slides
    var isTarget = window.location.pathname.includes('drawing') || window.location.pathname.includes('project');
    if (!isTarget) return;

    var slider = document.querySelector('.slider .slides');
    if (!slider) return;
    if (slider.dataset.drawingOptimized === '1') return;

    // DISABLED: DOM manipulation causes black screen and conflicts
    // Just mark as processed
    slider.dataset.drawingOptimized = '1';
    
    // Do nothing - let native HTML + CSS handle everything
  }
})();

