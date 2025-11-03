// 骨架屏加载器
// 为图片添加骨架屏效果

(function() {
    'use strict';
    
    // 为所有图片添加加载监听
    function initSkeletonScreen() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // 跳过已经加载的图片
            if (img.complete && img.naturalHeight !== 0) {
                img.setAttribute('data-loaded', '');
                return;
            }
            
            // 监听加载完成
            img.addEventListener('load', function onLoad() {
                img.setAttribute('data-loaded', '');
                img.classList.add('skeleton-loaded');
                img.removeEventListener('load', onLoad);
            }, { once: true });
            
            // 监听加载错误
            img.addEventListener('error', function onError() {
                img.setAttribute('data-loaded', '');
                img.classList.add('skeleton-loaded');
                img.removeEventListener('error', onError);
            }, { once: true });
        });
        
        // 标记slideshow容器为已加载
        const firstSlideImg = document.querySelector('.slide.active img');
        if (firstSlideImg) {
            firstSlideImg.addEventListener('load', function() {
                const slidesContainer = document.querySelector('.slides');
                if (slidesContainer) {
                    slidesContainer.setAttribute('data-loaded', '');
                }
            }, { once: true });
        }
    }
    
    // DOM加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSkeletonScreen);
    } else {
        initSkeletonScreen();
    }
    
    // 处理动态添加的图片（如slideshow切换）
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.tagName === 'IMG') {
                    if (!node.complete) {
                        node.addEventListener('load', function() {
                            node.setAttribute('data-loaded', '');
                            node.classList.add('skeleton-loaded');
                        }, { once: true });
                    } else {
                        node.setAttribute('data-loaded', '');
                    }
                } else if (node.querySelectorAll) {
                    const imgs = node.querySelectorAll('img');
                    imgs.forEach(img => {
                        if (!img.complete) {
                            img.addEventListener('load', function() {
                                img.setAttribute('data-loaded', '');
                                img.classList.add('skeleton-loaded');
                            }, { once: true });
                        } else {
                            img.setAttribute('data-loaded', '');
                        }
                    });
                }
            });
        });
    });
    
    // 开始观察
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

