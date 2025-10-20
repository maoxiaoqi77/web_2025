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
        
        # 1. 隐藏back-link
        content = re.sub(
            r'\.back-link \{([^}]*)\}',
            r'.back-link {\1\n            display: none;\n        }',
            content,
            flags=re.DOTALL
        )
        
        # 2. 修改project-header为绝对定位全屏
        old_header_css = r'''\.project-header \{
            width: 100vw;
            height: 100vh;
            margin: 0;
            position: relative;
            overflow: hidden;
        \}'''
        
        new_header_css = '''.project-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            overflow: hidden;
            z-index: 0;
        }'''
        
        content = re.sub(old_header_css, new_header_css, content)
        
        # 3. 确保project-content不被封面图遮挡
        content = re.sub(
            r'(\.project-content \{[^}]*?margin: 80px auto;)',
            r'.project-content {\n            max-width: 1400px;\n            margin: calc(100vh + 80px) auto 80px;',
            content
        )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已修复: {page}")
        
    except Exception as e:
        print(f"❌ 修复失败 {page}: {str(e)}")

print("\n🎉 全屏修复完成！")
