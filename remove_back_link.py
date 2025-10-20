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
        
        # 删除back-link的HTML标签
        content = re.sub(
            r'<a href="\.\.\/installation\.html[^"]*" class="back-link">.*?</a>\s*',
            '',
            content,
            flags=re.DOTALL
        )
        
        # 删除back-link的CSS样式
        content = re.sub(
            r'\.back-link \{[^}]*\}',
            '',
            content,
            flags=re.DOTALL
        )
        
        # 删除back-link相关的hover和scrolled样式
        content = re.sub(
            r'\.back-link[^{]*\{[^}]*\}',
            '',
            content,
            flags=re.DOTALL
        )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已删除back-link: {page}")
        
    except Exception as e:
        print(f"❌ 删除失败 {page}: {str(e)}")

print("\n🎉 back-link删除完成！")

