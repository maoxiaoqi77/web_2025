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

for page in pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 修复project-content结构
        # 查找project-content开始位置
        content_start = content.find('<div class="project-content">')
        if content_start == -1:
            print(f"⚠️  未找到project-content: {page}")
            continue
        
        # 查找</main>位置
        main_end = content.find('</main>', content_start)
        if main_end == -1:
            print(f"⚠️  未找到</main>: {page}")
            continue
        
        # 提取整个project-content区域
        old_content_section = content[content_start:main_end]
        
        # 提取各个部分
        title_match = re.search(r'<h1 class="project-title">(.*?)</h1>', old_content_section, re.DOTALL)
        title = title_match.group(0) if title_match else ''
        
        desc_match = re.search(r'<p class="project-description">(.*?)</p>', old_content_section, re.DOTALL)
        description = desc_match.group(0) if desc_match else ''
        
        # 查找所有video-section
        video_sections = re.findall(r'<div class="video-section">.*?</div>\s*</div>', old_content_section, re.DOTALL)
        videos_html = ''
        if video_sections:
            # 提取所有video-item
            video_items = []
            for video_section in video_sections:
                items = re.findall(r'<div class="video-item">.*?</div>', video_section, re.DOTALL)
                video_items.extend(items)
            
            if video_items:
                videos_html = '<div class="video-section">\n'
                for item in video_items:
                    videos_html += f'                    {item}\n'
                videos_html += '                </div>\n\n'
        
        # 查找gallery-grid
        gallery_match = re.search(r'<div class="gallery-grid">.*?</div>', old_content_section, re.DOTALL)
        gallery_html = gallery_match.group(0) if gallery_match else ''
        
        # 查找other-installations
        other_match = re.search(r'<div class="other-installations">.*?</div>\s*</div>', old_content_section, re.DOTALL)
        other_html = other_match.group(0) if other_match else ''
        
        # 构建新的HTML结构
        new_content_section = f'''        <div class="project-content">
            <div class="project-info">
                {title}
                {description}
            </div>
            
            <div class="media-gallery">
                {videos_html}                {gallery_html}
            </div>
            
            {other_html}
        </div>'''
        
        # 替换内容
        content = content[:content_start] + new_content_section + content[main_end:]
        
        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已修复: {page}")
        
    except Exception as e:
        print(f"❌ 修复失败 {page}: {str(e)}")

print("\n🎉 结构修复完成！")

