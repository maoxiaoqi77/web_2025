#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

# Installation详情页面列表（排除已经手动修改的）
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
    # 'leading-to-k-shoppingstreat-kanazawa.html',  # 已经手动修改
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
        
        # 检查是否已经有project-info
        if '<div class="project-info">' in content:
            print(f"⏭️  已包含project-info: {page}")
            continue
        
        # 查找并替换标题和描述部分
        # 匹配从<h1 class="project-title">到</p>之后，直到<div class="media-gallery">之前
        pattern = r'(<div class="project-content">\s*)(<h1 class="project-title">.*?</h1>\s*<p class="project-description">.*?</p>)(\s*<div class="media-gallery">)'
        
        replacement = r'\1<div class="project-info">\n                \2\n            </div>\n\n\3'
        
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        if new_content != content:
            # 保存修改后的文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ 已添加project-info: {page}")
        else:
            print(f"⚠️  未找到匹配模式: {page}")
        
    except Exception as e:
        print(f"❌ 处理失败 {page}: {str(e)}")

print("\n🎉 project-info包装添加完成！")

