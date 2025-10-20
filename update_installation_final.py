#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

# Installation详情页面列表
pages = [
    'blink-blink-blink-to-forget.html',
    'chasing-a-little-past-kanazawa.html',
    'chasing-a-little-past-lad.html',
    'chasing-a-little-past-openart.html',
    'chasing-a-little-past-ostrale.html',
    'chasing-a-little-past-titanik.html',
    'chasing-little-pasts-tws.html',
    'i_m_just_a_dog_superbien!.html',
    'im_just_a_dog_tws.html',
    'im-just-a-dog-k51.html',
    'im-just-a-dog.html',
    'in-the-bush.html',
    'leading-to-k-shoppingstreat-kanazawa.html',
    'never-talk-in-the-garden.html',
    'still-sigh-with-water.html'
]

installation_dir = 'installation'

# 新的CSS样式
new_styles = '''    <style>
        /* 全屏封面图样式 */
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            overflow-x: hidden;
        }

        body {
            overflow-y: auto;
            min-height: 100vh;
        }

        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: transparent;
            transition: background 0.3s ease;
        }

        /* 封面图区域：导航栏文字为白色 */
        .header .logo {
            color: #fff;
            transition: color 0.3s ease;
        }

        .header .nav-desktop a {
            color: #fff;
            transition: color 0.3s ease;
        }

        .header .nav-desktop a.active {
            color: #fff;
        }

        .header .menu-btn span {
            background: #fff;
            transition: background 0.3s ease;
        }

        /* 滚动后：导航栏背景和文字颜色变化 */
        .header.scrolled {
            background: rgba(255, 255, 255, 0.95);
        }

        .header.scrolled .logo {
            color: #333;
        }

        .header.scrolled .nav-desktop a {
            color: #333;
        }

        .header.scrolled .nav-desktop a.active {
            color: #fff;
        }

        .header.scrolled .menu-btn span {
            background: #333;
        }

        main {
            padding: 0;
            margin: 0;
        }

        .back-link {
            display: inline-block;
            color: #fff;
            text-decoration: none;
            margin-bottom: 20px;
            transition: color 0.3s;
            margin-left: 50px;
            position: fixed;
            top: 100px;
            left: 0;
            z-index: 999;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        }

        .back-link:hover {
            color: rgba(255,255,255,0.8);
        }

        .back-link.scrolled {
            color: #666;
            text-shadow: none;
        }

        .back-link.scrolled:hover {
            color: #333;
        }

        /* 全屏封面图 */
        .project-header {
            width: 100vw;
            height: 100vh;
            margin: 0;
            position: relative;
            overflow: hidden;
        }

        .project-header img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            display: block;
        }

        /* 内容区域 - 左右布局 */
        .project-content {
            max-width: 1400px;
            margin: 80px auto;
            padding: 0 90px;
            display: grid;
            grid-template-columns: 2fr 3fr;
            gap: 80px;
            align-items: start;
        }

        /* 左侧：标题和描述 */
        .project-title {
            font-size: 32px;
            color: #333;
            margin-bottom: 30px;
            font-weight: 400;
        }

        .project-description {
            font-size: 16px;
            line-height: 1.8;
            color: #666;
            white-space: pre-line;
        }

        /* 右侧：视频和画廊 */
        .media-gallery {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }

        /* 视频区域 - 每个视频占一排 */
        .video-section {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .videos-grid {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .video-item {
            width: 100%;
        }

        .video-item video {
            width: 100%;
            height: auto;
            max-height: 70vh;
            object-fit: contain;
            display: block;
        }

        /* 画廊网格 */
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .gallery-item {
            aspect-ratio: 1;
            overflow: hidden;
            cursor: pointer;
            transition: opacity 0.3s;
        }

        .gallery-item:hover {
            opacity: 0.8;
        }

        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Other Installations */
        .other-installations {
            grid-column: 1 / -1;
            margin-top: 80px;
            padding-top: 40px;
            border-top: 1px solid #eee;
        }

        .other-installations h3 {
            font-size: 20px;
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }

        .thumbnails-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 20px;
        }

        .thumbnail-item {
            text-decoration: none;
            color: inherit;
            transition: opacity 0.3s;
        }

        .thumbnail-item:hover {
            opacity: 0.8;
        }

        .thumbnail-image {
            width: 100%;
            aspect-ratio: 4/3;
            margin-bottom: 10px;
            overflow: hidden;
        }

        .thumbnail-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: left center;
        }

        .thumbnail-title {
            font-size: 14px;
            color: #333;
            text-align: center;
            line-height: 1.4;
        }

        /* 响应式设计 */
        @media (max-width: 1400px) {
            .project-content {
                padding: 0 60px;
                gap: 60px;
            }
        }

        @media (max-width: 1024px) {
            .project-content {
                grid-template-columns: 1fr;
                padding: 0 40px;
                gap: 50px;
            }

            .gallery-grid {
                grid-template-columns: repeat(3, 1fr);
            }

            .thumbnails-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }

        @media (max-width: 768px) {
            .back-link {
                margin-left: 20px;
                top: 80px;
            }

            .project-content {
                padding: 0 20px;
                margin: 40px auto;
            }

            .project-title {
                font-size: 24px;
            }

            .gallery-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }

            .thumbnails-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
        }

        @media (max-width: 480px) {
            .gallery-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .thumbnails-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>'''

# 添加滚动监听脚本
scroll_script = '''    <script>
        // 监听滚动，控制导航栏和返回链接样式
        window.addEventListener('scroll', function() {
            const header = document.querySelector('.header');
            const backLink = document.querySelector('.back-link');
            const projectHeader = document.querySelector('.project-header');
            const headerHeight = projectHeader ? projectHeader.offsetHeight : window.innerHeight;
            const scrollPosition = window.scrollY || window.pageYOffset;
            
            // 当滚动超过封面图高度的80%时，添加scrolled类
            if (scrollPosition > headerHeight * 0.8) {
                header.classList.add('scrolled');
                if (backLink) backLink.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
                if (backLink) backLink.classList.remove('scrolled');
            }
        });
    </script>'''

for page in pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. 替换style标签
        content = re.sub(
            r'<style>.*?</style>',
            new_styles,
            content,
            flags=re.DOTALL
        )
        
        # 2. 添加滚动监听脚本（如果还没有）
        if 'header.classList.add' not in content or 'backLink.classList' not in content:
            # 在</body>前添加脚本
            content = re.sub(
                r'(<script src="\.\./js/installation-fix\.js"></script>)',
                r'\1\n' + scroll_script,
                content
            )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已更新: {page}")
        
    except Exception as e:
        print(f"❌ 更新失败 {page}: {str(e)}")

print("\n🎉 批量更新完成！")

