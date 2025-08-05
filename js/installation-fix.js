/**
 * Installation页面修复脚本
 * 在页面加载后修复缩略图大小不一致的问题
 */

document.addEventListener('DOMContentLoaded', function() {
    // 等待other-installations.js执行完毕
    setTimeout(function() {
        // 修复Other Installations部分缩略图大小不一致的问题
        const thumbnailItems = document.querySelectorAll('.other-installations .thumbnail-item');
        if (thumbnailItems.length === 0) return;
        
        // 应用样式到所有缩略图项
        thumbnailItems.forEach(item => {
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.height = '100%';
            item.style.width = '100%';
            item.style.textDecoration = 'none';
            item.style.color = 'inherit';
            
            // 修复缩略图容器
            const imageContainer = item.querySelector('.thumbnail-image');
            if (imageContainer) {
                imageContainer.style.width = '100%';
                imageContainer.style.aspectRatio = '4/3';
                imageContainer.style.marginBottom = '10px';
                imageContainer.style.overflow = 'hidden';
                
                // 修复图片
                const img = imageContainer.querySelector('img');
                if (img) {
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.objectPosition = 'center center';
                }
            }
            
            // 修复标题
            const title = item.querySelector('.thumbnail-title');
            if (title) {
                title.style.fontSize = '14px';
                title.style.color = '#333';
                title.style.textAlign = 'center';
                title.style.lineHeight = '1.4';
                title.style.marginTop = 'auto';
                title.style.height = '40px';
                title.style.display = 'flex';
                title.style.alignItems = 'center';
                title.style.justifyContent = 'center';
                title.style.overflow = 'hidden';
            }
        });
        
        // 修复缩略图网格
        const grid = document.querySelector('.other-installations .thumbnails-grid');
        if (grid) {
            grid.style.display = 'grid';
            
            // 根据窗口宽度设置响应式布局
            const width = window.innerWidth;
            if (width <= 480) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                grid.style.gap = '15px';
                document.querySelectorAll('.thumbnail-title').forEach(el => {
                    el.style.height = '32px';
                    el.style.fontSize = '12px';
                });
            } else if (width <= 768) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                grid.style.gap = '15px';
                document.querySelectorAll('.thumbnail-title').forEach(el => {
                    el.style.height = '36px';
                    el.style.fontSize = '12px';
                });
            } else if (width <= 992) {
                grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            } else if (width <= 1200) {
                grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            } else {
                grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
            }
        }
    }, 500); // 延迟500毫秒，确保other-installations.js已执行完毕
    
    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        const grid = document.querySelector('.other-installations .thumbnails-grid');
        if (!grid) return;
        
        const width = window.innerWidth;
        if (width <= 480) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.gap = '15px';
            document.querySelectorAll('.thumbnail-title').forEach(el => {
                el.style.height = '32px';
                el.style.fontSize = '12px';
            });
        } else if (width <= 768) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.gap = '15px';
            document.querySelectorAll('.thumbnail-title').forEach(el => {
                el.style.height = '36px';
                el.style.fontSize = '12px';
            });
        } else if (width <= 992) {
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            document.querySelectorAll('.thumbnail-title').forEach(el => {
                el.style.height = '40px';
                el.style.fontSize = '14px';
            });
        } else if (width <= 1200) {
            grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            document.querySelectorAll('.thumbnail-title').forEach(el => {
                el.style.height = '40px';
                el.style.fontSize = '14px';
            });
        } else {
            grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
            document.querySelectorAll('.thumbnail-title').forEach(el => {
                el.style.height = '40px';
                el.style.fontSize = '14px';
            });
        }
    });
}); 