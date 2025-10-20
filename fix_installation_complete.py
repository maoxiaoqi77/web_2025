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
        
        # 1. 修改project-content的间距：从calc(100vh + 40px)改为calc(100vh + 20px)，左右margin改为90px
        content = re.sub(
            r'margin: calc\(100vh \+ \d+px\) auto 80px;',
            'margin: calc(100vh + 20px) 90px 80px;',
            content
        )
        
        # 2. 移除max-width限制
        content = re.sub(
            r'max-width: 1400px;',
            'max-width: none;',
            content
        )
        
        # 3. 修改padding从90px改为0
        content = re.sub(
            r'padding: 0 90px;',
            'padding: 0;',
            content
        )
        
        # 4. 修改响应式的padding
        content = re.sub(
            r'padding: 0 60px;',
            'margin: calc(100vh + 20px) 60px 80px;\n                padding: 0;',
            content
        )
        
        content = re.sub(
            r'padding: 0 40px;',
            'margin: calc(100vh + 20px) 40px 80px;\n                padding: 0;',
            content
        )
        
        content = re.sub(
            r'padding: 0 20px;',
            'margin: calc(100vh + 20px) 20px 40px;\n                padding: 0;',
            content
        )
        
        # 5. 修复768px的media query中margin可能重复的问题
        content = re.sub(
            r'(\.project-content \{[^}]*?)margin: 40px auto;',
            r'\1margin: calc(100vh + 20px) 20px 40px;',
            content
        )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已修复: {page}")
        
    except Exception as e:
        print(f"❌ 修复失败 {page}: {str(e)}")

print("\n🎉 完整修复完成！")
