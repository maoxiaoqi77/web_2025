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
        
        # 1. 确保main没有padding和margin
        if 'main {' in content and 'padding: 0;' in content:
            content = re.sub(
                r'main \{\s*padding: 0;\s*margin: 0;\s*\}',
                '''main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100%;
            max-width: none;
        }''',
                content
            )
        
        # 2. 减少内容与封面图之间的间距，从80px改为40px
        content = re.sub(
            r'margin: calc\(100vh \+ 80px\) auto 80px;',
            'margin: calc(100vh + 40px) auto 80px;',
            content
        )
        
        # 3. 确保body没有额外padding
        content = re.sub(
            r'body \{\s*overflow-y: auto;\s*min-height: 100vh;\s*\}',
            '''body {
            overflow-y: auto;
            min-height: 100vh;
            padding: 0 !important;
            margin: 0 !important;
        }''',
            content
        )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已修复间距: {page}")
        
    except Exception as e:
        print(f"❌ 修复失败 {page}: {str(e)}")

print("\n🎉 间距修复完成！")

