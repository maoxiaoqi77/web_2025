/**
 * 骨架屏控制器
 * 智能检测内容加载状态并自动显示/隐藏骨架屏
 */

(function() {
  'use strict';

  /**
   * 骨架屏管理器
   */
  class SkeletonManager {
    constructor() {
      this.observers = new Map();
      this.init();
    }

    /**
     * 初始化
     */
    init() {
      // 等待DOM加载完成
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    /**
     * 设置骨架屏
     */
    setup() {
      // 1. 处理Slideshow
      this.setupSlideshow();
      
      // 2. 处理Gallery图片
      this.setupGallery();
      
      // 3. 处理其他图片
      this.setupImages();
    }

    /**
     * 设置Slideshow骨架屏
     */
    setupSlideshow() {
      const sliders = document.querySelectorAll('.slider');
      
      sliders.forEach(slider => {
        // 添加骨架屏标记
        slider.classList.add('skeleton-loading');
        
        // 查找第一个slide
        const firstSlide = slider.querySelector('.slide');
        if (!firstSlide) return;
        
        // 查找第一个媒体元素（img或video）
        const media = firstSlide.querySelector('img, video');
        if (!media) return;
        
        // 监听加载
        if (media.tagName === 'IMG') {
          this.waitForImage(media).then(() => {
            this.hideSlideshowSkeleton(slider);
          });
        } else if (media.tagName === 'VIDEO') {
          this.waitForVideo(media).then(() => {
            this.hideSlideshowSkeleton(slider);
          });
        }
        
        // 设置超时（8秒后强制隐藏骨架屏）
        setTimeout(() => {
          this.hideSlideshowSkeleton(slider);
        }, 8000);
      });
    }

    /**
     * 隐藏Slideshow骨架屏
     */
    hideSlideshowSkeleton(slider) {
      slider.classList.remove('skeleton-loading');
      slider.classList.add('skeleton-loaded');
      
      // 300ms后移除class
      setTimeout(() => {
        slider.classList.remove('skeleton-loaded');
      }, 300);
    }

    /**
     * 设置Gallery骨架屏
     */
    setupGallery() {
      const galleries = document.querySelectorAll('.gallery-grid, .project-grid');
      
      galleries.forEach(gallery => {
        const images = gallery.querySelectorAll('img');
        if (images.length === 0) return;
        
        // 等待前3张图片加载
        const firstImages = Array.from(images).slice(0, 3);
        const promises = firstImages.map(img => this.waitForImage(img));
        
        Promise.all(promises).then(() => {
          gallery.classList.add('loaded');
        }).catch(() => {
          // 即使失败也标记为已加载
          gallery.classList.add('loaded');
        });
      });
    }

    /**
     * 设置图片骨架屏
     */
    setupImages() {
      // 使用Intersection Observer延迟加载非关键图片
      if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImage(img);
              imageObserver.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px 0px'
        });
        
        lazyImages.forEach(img => {
          imageObserver.observe(img);
        });
      }
    }

    /**
     * 加载图片
     */
    loadImage(img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    }

    /**
     * 等待图片加载
     */
    waitForImage(img) {
      return new Promise((resolve, reject) => {
        // 如果已经加载完成
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
          return;
        }
        
        // 监听加载事件
        const onLoad = () => {
          cleanup();
          resolve();
        };
        
        const onError = () => {
          cleanup();
          reject();
        };
        
        const cleanup = () => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
        };
        
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onError);
        
        // 超时处理
        setTimeout(() => {
          cleanup();
          reject(new Error('Image load timeout'));
        }, 10000);
      });
    }

    /**
     * 等待视频加载
     */
    waitForVideo(video) {
      return new Promise((resolve, reject) => {
        // 如果已经可以播放
        if (video.readyState >= 2) {
          resolve();
          return;
        }
        
        // 监听事件
        const onCanPlay = () => {
          cleanup();
          resolve();
        };
        
        const onError = () => {
          cleanup();
          reject();
        };
        
        const cleanup = () => {
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('error', onError);
        };
        
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('error', onError);
        
        // 超时处理
        setTimeout(() => {
          cleanup();
          reject(new Error('Video load timeout'));
        }, 10000);
      });
    }
  }

  /**
   * 页面性能监控（可选）
   */
  class PerformanceMonitor {
    constructor() {
      this.metrics = {};
      this.init();
    }

    init() {
      if (!('performance' in window)) return;
      
      window.addEventListener('load', () => {
        // 记录性能指标
        setTimeout(() => {
          this.recordMetrics();
        }, 0);
      });
    }

    recordMetrics() {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      
      this.metrics = {
        pageLoadTime,
        connectTime,
        renderTime,
        timestamp: Date.now()
      };
      
      // 可以发送到分析服务
      // console.log('Performance Metrics:', this.metrics);
    }

    getMetrics() {
      return this.metrics;
    }
  }

  // 初始化骨架屏管理器
  window.skeletonManager = new SkeletonManager();
  
  // 初始化性能监控（可选）
  window.performanceMonitor = new PerformanceMonitor();
  
})();

