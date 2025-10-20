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
        
        # 查找并重组 project-content 结构
        # 匹配 <div class="project-content"> 到 </div> 之间的内容
        def restructure_content(match):
            original = match.group(0)
            
            # 提取标题
            title_pattern = r'(<h1 class="project-title">.*?</h1>)'
            title_match = re.search(title_pattern, original, re.DOTALL)
            title = title_match.group(1) if title_match else ''
            
            # 提取描述
            desc_pattern = r'(<p class="project-description">.*?</p>)'
            desc_match = re.search(desc_pattern, original, re.DOTALL)
            description = desc_match.group(1) if desc_match else ''
            
            # 提取media-gallery（包括video-section和gallery-grid）
            media_pattern = r'(<div class="media-gallery">.*?</div>\s*</div>)'
            media_match = re.search(media_pattern, original, re.DOTALL)
            media_gallery = media_match.group(1) if media_match else ''
            
            # 提取other-installations
            other_pattern = r'(<div class="other-installations">.*?</div>\s*</div>)'
            other_match = re.search(other_pattern, original, re.DOTALL)
            other_installations = other_match.group(1) if other_match else ''
            
            # 构建新的HTML结构
            new_content = f'''        <div class="project-content">
            <div class="project-info">
                {title}
                {description}
            </div>
            
            {media_gallery}
            
            {other_installations}
        </div>'''
            
            return new_content
        
        # 使用正则表达式匹配并替换project-content部分
        pattern = r'<div class="project-content">.*?</div>\s*</div>\s*</div>'
        content = re.sub(pattern, restructure_content, content, flags=re.DOTALL)
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已重组HTML: {page}")
        
    except Exception as e:
        print(f"❌ 重组失败 {page}: {str(e)}")

print("\n🎉 HTML重组完成！")

