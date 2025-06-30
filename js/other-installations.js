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
    const filteredInstallations = installationData.filter(item => item.id !== currentPageName);
    
    // 创建单个网格容器，而不是多行
    const grid = document.createElement('div');
    grid.className = 'thumbnails-grid';
    
    // 添加所有项目到网格
    filteredInstallations.forEach(item => {
        const thumbnailItem = document.createElement('a');
        thumbnailItem.href = `../installation/${item.id}.html`;
        thumbnailItem.className = 'thumbnail-item';
        
        const thumbnailImage = document.createElement('div');
        thumbnailImage.className = 'thumbnail-image';
        
        const img = document.createElement('img');
        img.src = item.thumbnail;
        img.alt = item.title;
        
        const title = document.createElement('p');
        title.className = 'thumbnail-title';
        title.textContent = item.title;
        
        thumbnailImage.appendChild(img);
        thumbnailItem.appendChild(thumbnailImage);
        thumbnailItem.appendChild(title);
        grid.appendChild(thumbnailItem);
    });
    
    // 添加网格到容器
    otherInstallationsContainer.appendChild(grid);
});
