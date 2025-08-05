/**
 * 自动生成"Other Installations"部分的脚本
 * 此脚本会自动为每个安装详情页生成"Other Installations"部分
 * 使用installation-data.js中的数据
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取当前页面的文件名（不包含路径和扩展名）
    const currentPath = window.location.pathname;
    const currentPageName = currentPath.split('/').pop().replace('.html', '');
    
    // 查找other-installations容器
    const otherInstallationsContainer = document.querySelector('.other-installations');
    if (!otherInstallationsContainer) return;
    
    // 清空现有内容，保留标题
    const title = otherInstallationsContainer.querySelector('h3');
    otherInstallationsContainer.innerHTML = '';
    if (title) {
        otherInstallationsContainer.appendChild(title);
    } else {
        const newTitle = document.createElement('h3');
        newTitle.textContent = 'Other Installations';
        otherInstallationsContainer.appendChild(newTitle);
    }
    
    // 过滤掉当前页面
    const filteredInstallations = installationData.filter(item => {
        // 使用解码后的当前页面名称进行比较，以处理URL编码的特殊字符
        const decodedCurrentPageName = decodeURIComponent(currentPageName);
        return item.id !== decodedCurrentPageName;
    });
    
    // 创建单个网格容器
    const grid = document.createElement('div');
    grid.className = 'thumbnails-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    grid.style.gap = '20px';
    grid.style.width = '100%';
    
    // 添加所有项目到网格
    filteredInstallations.forEach(item => {
        const thumbnailItem = document.createElement('a');
        // 确保正确编码URL中的特殊字符
        thumbnailItem.href = `../installation/${encodeURIComponent(item.id)}.html`;
        thumbnailItem.className = 'thumbnail-item';
        thumbnailItem.style.display = 'flex';
        thumbnailItem.style.flexDirection = 'column';
        thumbnailItem.style.height = '100%';
        thumbnailItem.style.width = '100%';
        thumbnailItem.style.textDecoration = 'none';
        thumbnailItem.style.color = 'inherit';
        
        const thumbnailImage = document.createElement('div');
        thumbnailImage.className = 'thumbnail-image';
        thumbnailImage.style.width = '100%';
        thumbnailImage.style.aspectRatio = '4/3';
        thumbnailImage.style.marginBottom = '10px';
        thumbnailImage.style.overflow = 'hidden';
        
        const img = document.createElement('img');
        img.src = item.thumbnail;
        img.alt = item.title;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center center';
        
        const title = document.createElement('p');
        title.className = 'thumbnail-title';
        title.textContent = item.title;
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
        
        thumbnailImage.appendChild(img);
        thumbnailItem.appendChild(thumbnailImage);
        thumbnailItem.appendChild(title);
        grid.appendChild(thumbnailItem);
    });
    
    // 添加网格到容器
    otherInstallationsContainer.appendChild(grid);
    
    // 添加响应式布局
    const mediaQueryHandler = () => {
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
        } else {
            grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
        }
    };
    
    // 初始化响应式布局
    mediaQueryHandler();
    
    // 监听窗口大小变化
    window.addEventListener('resize', mediaQueryHandler);
});
