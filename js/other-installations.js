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
        thumbnailImage.style.aspectRatio = '16/9';
        thumbnailImage.style.marginBottom = '10px';
        thumbnailImage.style.overflow = 'hidden';
        
        // 将原始图片路径转换为响应式图片路径
        // 从 ../images/02installation/.../filename.webp
        // 转换为 ../images/_responsive/02installation/.../filename-400.webp 和 filename-960.webp
        const originalPath = item.thumbnail;
        const pathParts = originalPath.split('/');
        const filename = pathParts[pathParts.length - 1]; // 获取文件名，如 "00_2540_basic_16x9_IMG_8254.webp"
        const filenameWithoutExt = filename.replace('.webp', ''); // 移除扩展名
        
        // 构建响应式图片路径
        // 找到 "images" 在路径中的位置，替换为 "images/_responsive"
        const imagesIndex = pathParts.findIndex(part => part === 'images');
        const responsivePath = [...pathParts];
        responsivePath[imagesIndex] = 'images/_responsive';
        const responsiveDir = responsivePath.slice(0, -1).join('/'); // 目录路径，不含文件名
        
        // 创建 picture 元素
        const picture = document.createElement('picture');
        
        // 创建 source 元素（WebP 格式）
        const source = document.createElement('source');
        source.type = 'image/webp';
        // srcset: 400w 和 960w 版本（不使用 1600w，因为缩略图很小）
        source.srcset = `${responsiveDir}/${filenameWithoutExt}-400.webp 400w, ${responsiveDir}/${filenameWithoutExt}-960.webp 960w`;
        
        // 创建 img 元素（fallback 和响应式）
        const img = document.createElement('img');
        img.src = originalPath; // fallback 使用原图
        img.srcset = `${responsiveDir}/${filenameWithoutExt}-400.webp 400w, ${responsiveDir}/${filenameWithoutExt}-960.webp 960w`;
        // sizes: 根据响应式布局设置
        // - 手机（≤480px）：2列 → 50vw
        // - 平板（≤992px）：3列 → 33vw
        // - 中等（≤1200px）：4列 → 25vw
        // - 桌面（>1200px）：5列 → 20vw，但设置为 200px 确保选择 400w
        img.sizes = '(max-width: 480px) 50vw, (max-width: 992px) 33vw, (max-width: 1200px) 25vw, 200px';
        img.alt = item.title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center center';
        
        picture.appendChild(source);
        picture.appendChild(img);
        
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
        
        thumbnailImage.appendChild(picture);
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
