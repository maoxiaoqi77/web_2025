/**
 * 预加载优化器 - 实现智能预加载策略
 * 
 * 策略：
 * 1. 优先加载首屏关键资源
 * 2. 本页加载完后预加载其他页面
 * 3. 智能判断网络环境
 */

(function() {
  'use strict';

  class PreloadOptimizer {
    constructor() {
      this.isPreloading = false;
      this.preloadedImages = new Set();
      this.preloadedPages = new Set(); // 记录已预加载的页面
      this.currentPage = this.getCurrentPageType();
      
      // 配置
      this.config = {
        // 预加载延迟（毫秒）
        preloadDelay: 2000,
        // 是否在移动网络下预加载
        preloadOnMobile: false,
        // 预加载的图片数量限制
        maxPreloadImages: 50 // 增加限制，支持drawing等页面
      };

      this.init();
    }

    /**
     * 初始化
     */
    init() {
      // 等待页面加载完成
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    }

    /**
     * 开始优化
     */
    start() {
      console.log('[Preload] 开始预加载优化');

      // 等待本页加载完成后才开始任何预加载
      window.addEventListener('load', () => {
        console.log('[Preload] 本页加载完成，准备预加载');
        
        // 1. 先预加载本页的后续内容
        this.prioritizeCurrentPage();

        // 2. 再预加载其他页面
        setTimeout(() => {
          this.preloadOtherPages();
        }, this.config.preloadDelay);
      });
    }

    /**
     * 获取当前页面类型
     */
    getCurrentPageType() {
      const path = window.location.pathname;
      if (path.includes('index.html') || path === '/' || path === '') {
        return 'index';
      } else if (path.includes('installation.html')) {
        return 'installation';
      } else if (path.includes('sculpture.html')) {
        return 'sculpture';
      } else if (path.includes('drawing.html')) {
        return 'drawing';
      } else if (path.includes('project.html')) {
        return 'project';
      } else if (path.includes('installation/')) {
        return 'installation-detail';
      }
      return 'other';
    }

    /**
     * 优先加载当前页面的关键资源
     */
    prioritizeCurrentPage() {
      console.log(`[Preload] 优化当前页面: ${this.currentPage}`);

      if (this.currentPage === 'installation-detail') {
        this.prioritizeInstallationDetail();
      } else {
        this.prioritizeSlideshowPage();
      }
    }

    /**
     * 优先加载 slideshow 页面的后续内容
     */
    prioritizeSlideshowPage() {
      console.log('[Preload] 优化slideshow页面的后续内容');
      
      // 1. 预加载第2、3张slide的图片
      const slides = document.querySelectorAll('.slide');
      
      if (slides.length > 0) {
        console.log(`[Preload] 找到 ${slides.length} 个slides，预加载后续2-3张`);

        // 预加载第2-3张
        for (let i = 1; i <= 2 && i < slides.length; i++) {
          const slide = slides[i];
          const img = slide.querySelector('img');
          if (img && img.dataset.src) {
            this.preloadImage(img.dataset.src, 'next-slide');
          }
        }
      }

      // 2. 根据页面类型预加载内容
      if (this.currentPage === 'index') {
        // TOP页面：预加载news图片
        setTimeout(() => {
          console.log('[Preload] TOP页面：预加载news图片');
          const newsImages = document.querySelectorAll('.news-item img');
          newsImages.forEach((img, index) => {
            if (img.src && !img.complete) {
              console.log(`[Preload] ✓ news图片[${index}]已设置src`);
            }
          });
        }, 500);
      } else if (this.currentPage === 'installation') {
        // Installation页面：一行一行预加载项目封面图
        setTimeout(() => {
          this.preloadInstallationCovers();
        }, 500);
      } else if (this.currentPage === 'drawing') {
        // Drawing页面：预加载前1-2行，其余保持懒加载
        setTimeout(() => {
          this.preloadDrawingImages();
        }, 500);
      } else if (this.currentPage === 'project') {
        // Project页面：预加载下方的intro-image前1-2张
        setTimeout(() => {
          this.preloadProjectImages();
        }, 500);
      } else {
        console.log('[Preload] 其他页面，下方内容保持懒加载');
      }
    }

    /**
     * 预加载 installation 页面的项目封面图（一行一行）
     */
    preloadInstallationCovers() {
      const installationImages = document.querySelectorAll('.installation-image img');
      
      if (installationImages.length === 0) {
        console.log('[Preload] Installation: 未找到项目封面图');
        return;
      }

      console.log(`[Preload] Installation: 找到 ${installationImages.length} 个项目封面图，开始逐行预加载`);

      // 一行通常4个项目（可根据实际布局调整）
      const itemsPerRow = 4;
      let currentRow = 0;
      const totalRows = Math.ceil(installationImages.length / itemsPerRow);

      // 递归函数：逐行预加载
      const preloadRow = (rowIndex) => {
        if (rowIndex >= totalRows) {
          console.log('[Preload] Installation: 所有项目封面图预加载完成');
          return;
        }

        const startIndex = rowIndex * itemsPerRow;
        const endIndex = Math.min(startIndex + itemsPerRow, installationImages.length);

        console.log(`[Preload] Installation: 预加载第${rowIndex + 1}行 (${startIndex + 1}-${endIndex})`);

        // 预加载当前行的所有图片
        for (let i = startIndex; i < endIndex; i++) {
          const img = installationImages[i];
          
          // 获取 srcset 中的最小尺寸图片（400w）
          const srcset = img.getAttribute('srcset');
          let imgSrc = img.src;
          
          if (srcset) {
            const sources = srcset.split(',').map(s => s.trim());
            // 找到 400w 的图片
            const smallSource = sources.find(s => s.includes('400w'));
            if (smallSource) {
              imgSrc = smallSource.split(' ')[0];
            }
          }
          
          // 预加载图片
          this.preloadImage(imgSrc, `installation-cover-row${rowIndex + 1}`);
        }

        // 延迟预加载下一行（避免一次性请求太多）
        setTimeout(() => {
          preloadRow(rowIndex + 1);
        }, 800); // 每行间隔800ms
      };

      // 开始预加载第一行
      preloadRow(0);
    }

    /**
     * 预加载 drawing 页面的前1-2行图片
     */
    preloadDrawingImages() {
      // Drawing页面的图片在slideshow下方
      const drawingImages = document.querySelectorAll('.drawing-grid img, .drawing-item img, img[alt*="drawing"]');
      
      if (drawingImages.length === 0) {
        console.log('[Preload] Drawing: 未找到图片');
        return;
      }

      console.log(`[Preload] Drawing: 找到 ${drawingImages.length} 个图片，预加载前1-2行（约10张）`);

      // 预加载前10张（约1-2行）
      const preloadCount = Math.min(10, drawingImages.length);
      
      for (let i = 0; i < preloadCount; i++) {
        const img = drawingImages[i];
        
        // 使用原始src（不是srcset），因为响应式图片有问题
        let imgSrc = img.src;
        
        if (imgSrc) {
          setTimeout(() => {
            this.preloadImage(imgSrc, `drawing-row${Math.floor(i / 5) + 1}`);
          }, i * 100); // 每张间隔100ms
        }
      }

      console.log('[Preload] Drawing: 其余图片保持懒加载');
    }

    /**
     * 预加载 project 页面的下方图片（前1-2张）
     */
    preloadProjectImages() {
      // Project页面下方的intro-image
      const projectImages = document.querySelectorAll('.intro-image img');
      
      if (projectImages.length === 0) {
        console.log('[Preload] Project: 未找到intro-image');
        return;
      }

      console.log(`[Preload] Project: 找到 ${projectImages.length} 个intro-image，预加载前1-2张`);

      // 预加载前2张（首屏可能看到的）
      const preloadCount = Math.min(2, projectImages.length);
      
      for (let i = 0; i < preloadCount; i++) {
        const img = projectImages[i];
        
        // 获取srcset中的400w版本（小文件，快速）
        const srcset = img.getAttribute('srcset');
        let imgSrc = img.src;
        
        if (srcset) {
          const sources = srcset.split(',').map(s => s.trim());
          // 找到 400w 的图片
          const smallSource = sources.find(s => s.includes('400w'));
          if (smallSource) {
            imgSrc = smallSource.split(' ')[0];
          }
        }
        
        if (imgSrc) {
          setTimeout(() => {
            this.preloadImage(imgSrc, `project-intro-${i + 1}`);
          }, i * 200); // 每张间隔200ms
        }
      }

      console.log('[Preload] Project: 其余图片保持懒加载');
    }

    /**
     * 优先加载 installation 详情页
     */
    prioritizeInstallationDetail() {
      console.log('[Preload] 优化installation详情页');

      // 封面图应该已经有 fetchpriority="high"
      // 这里处理下方的懒加载
      const galleryImages = document.querySelectorAll('.gallery-grid img');
      
      // 不立即加载所有图片，让它们保持lazy loading
      console.log(`[Preload] 找到 ${galleryImages.length} 个gallery图片，保持懒加载`);
    }

    /**
     * 预加载其他页面的关键资源（避免重复）
     */
    async preloadOtherPages() {
      // 检查网络环境
      if (!this.shouldPreload()) {
        console.log('[Preload] 网络环境不适合预加载，跳过');
        return;
      }

      if (this.isPreloading) {
        console.log('[Preload] 已在预加载中，跳过');
        return;
      }

      this.isPreloading = true;
      console.log('[Preload] 开始预加载其他页面');

      // 根据当前页面预测用户可能访问的页面
      const nextPages = this.predictNextPages();

      // 只预加载未加载过的页面
      const pagesToPreload = nextPages.filter(page => !this.preloadedPages.has(page.name));
      
      if (pagesToPreload.length === 0) {
        console.log('[Preload] 所有相关页面已预加载，跳过');
        this.isPreloading = false;
        return;
      }

      console.log(`[Preload] 需要预加载 ${pagesToPreload.length} 个页面:`, pagesToPreload.map(p => p.name).join(', '));

      // 预加载这些页面的关键资源
      for (const page of pagesToPreload) {
        await this.preloadPageResources(page);
        // 标记为已预加载
        this.preloadedPages.add(page.name);
      }

      this.isPreloading = false;
      console.log('[Preload] 预加载完成');
    }

    /**
     * 判断是否应该预加载
     */
    shouldPreload() {
      // 检查用户的网络环境
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
          // 如果是慢速网络，不预加载
          if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            return false;
          }

          // 如果是移动网络且配置不允许，不预加载
          if (!this.config.preloadOnMobile && (connection.type === 'cellular' || connection.effectiveType === '3g')) {
            console.log('[Preload] 移动网络，跳过预加载');
            return false;
          }
        }
      }

      return true;
    }

    /**
     * 预测用户可能访问的下一个页面
     */
    predictNextPages() {
      const pages = [];

      // 根据当前页面预测
      switch (this.currentPage) {
        case 'index':
          // 从首页最可能去：installation, project, about
          pages.push(
            { name: 'installation', url: 'installation.html', priority: 1 },
            { name: 'project', url: 'project.html', priority: 2 },
            { name: 'sculpture', url: 'sculpture.html', priority: 3 }
          );
          break;

        case 'installation':
          // 从installation最可能去：首页，详情页，sculpture
          pages.push(
            { name: 'index', url: 'index.html', priority: 1 },
            { name: 'sculpture', url: 'sculpture.html', priority: 2 }
          );
          break;

        case 'installation-detail':
          // 从详情页最可能回到：installation列表
          pages.push(
            { name: 'installation', url: '../installation.html', priority: 1 },
            { name: 'index', url: '../index.html', priority: 2 }
          );
          break;

        case 'sculpture':
          pages.push(
            { name: 'index', url: 'index.html', priority: 1 },
            { name: 'drawing', url: 'drawing.html', priority: 2 }
          );
          break;

        case 'drawing':
          pages.push(
            { name: 'index', url: 'index.html', priority: 1 },
            { name: 'sculpture', url: 'sculpture.html', priority: 2 }
          );
          break;

        case 'project':
          pages.push(
            { name: 'index', url: 'index.html', priority: 1 },
            { name: 'installation', url: 'installation.html', priority: 2 }
          );
          break;

        default:
          pages.push({ name: 'index', url: 'index.html', priority: 1 });
      }

      return pages.sort((a, b) => a.priority - b.priority);
    }

    /**
     * 预加载页面资源
     */
    async preloadPageResources(page) {
      console.log(`[Preload] 预加载页面: ${page.name}`);

      try {
        // 预加载HTML
        await this.preloadHTML(page.url);

        // 预加载该页面的首图
        await this.preloadPageFirstImage(page);

      } catch (error) {
        console.error(`[Preload] 预加载 ${page.name} 失败:`, error);
      }
    }

    /**
     * 预加载HTML
     */
    preloadHTML(url) {
      return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.onload = () => {
          console.log(`[Preload] HTML预加载完成: ${url}`);
          resolve();
        };
        link.onerror = () => resolve(); // 失败也继续
        document.head.appendChild(link);
      });
    }

    /**
     * 预加载页面的首图（从sessionStorage读取实际首图）
     */
    async preloadPageFirstImage(page) {
      // 根据页面URL获取sessionStorage中保存的首图
      let pageUrl = page.url;
      
      // 标准化URL为pathname格式
      if (pageUrl.startsWith('../')) {
        pageUrl = pageUrl.replace('../', '/');
      }
      if (!pageUrl.startsWith('/')) {
        pageUrl = '/' + pageUrl;
      }
      
      const pageKey = 'slideshow_order_' + pageUrl + '_first';
      const savedFirstImage = sessionStorage.getItem(pageKey);
      
      console.log(`[Preload] 查找${page.name}的首图:`, pageKey, savedFirstImage ? '✓找到' : '✗未找到');
      
      if (savedFirstImage) {
        // 如果找到保存的首图，预加载它
        await this.preloadImage(savedFirstImage, `${page.name}-first`);
      } else {
        // 如果没有找到（第一次访问），使用默认首图（静态图片）
        let defaultImage = null;
        
        switch (page.name) {
          case 'index':
            defaultImage = 'images/02top/slide show/001_2540_basic_16x9_IMG_5824_02_000.webp';
            break;
          case 'installation':
            // 使用一个较小的文件作为默认（1.5MB）
            defaultImage = 'images/02installation/00_SLIDESHOW/2524_webvideo_008.webp';
            break;
          case 'sculpture':
            defaultImage = 'images/02sculpture/00_SLIDESHOW/01_2520_weppic_IMG_0772_slide.webp';
            break;
          case 'drawing':
            defaultImage = 'images/02drawing/00_SLIDESHOW/DS_001_1938_ipad_IMG_7887.webp';
            break;
          case 'project':
            defaultImage = 'images/02project/slideshow/2237_webpic_project_002_a_01.webp';
            break;
        }
        
        if (defaultImage) {
          console.log(`[Preload] 使用默认首图:`, defaultImage);
          await this.preloadImage(defaultImage, `${page.name}-first-default`);
        }
      }
    }

    /**
     * 预加载单个图片
     */
    preloadImage(src, type = 'default') {
      // 避免重复预加载
      if (this.preloadedImages.has(src)) {
        return Promise.resolve();
      }

      // 检查数量限制
      if (this.preloadedImages.size >= this.config.maxPreloadImages) {
        console.log('[Preload] 已达到预加载数量限制');
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          this.preloadedImages.add(src);
          console.log(`[Preload] ✓ 图片预加载完成 [${type}]:`, src.substring(src.lastIndexOf('/') + 1));
          resolve();
        };

        img.onerror = () => {
          console.warn(`[Preload] ✗ 图片预加载失败:`, src);
          resolve(); // 失败也继续
        };

        img.src = src;
      });
    }

    /**
     * 手动触发预加载（供外部调用）
     */
    triggerPreload(url) {
      this.preloadImage(url, 'manual');
    }
  }

  // 初始化预加载优化器
  window.preloadOptimizer = new PreloadOptimizer();

  // 暴露全局方法
  window.preloadImage = function(url) {
    if (window.preloadOptimizer) {
      window.preloadOptimizer.triggerPreload(url);
    }
  };

})();

