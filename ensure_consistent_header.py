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
        
        # 确保html和body的宽度设置正确
        if 'html, body {' in content:
            # 替换html, body样式，添加position: relative
            content = re.sub(
                r'html, body \{[^}]*\}',
                '''html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            position: relative !important;
        }''',
                content,
                flags=re.DOTALL
            )
        
        # 确保main的宽度设置
        content = re.sub(
            r'(main \{[^}]*?)width: 100vw',
            r'\1width: 100%',
            content
        )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已确保一致性: {page}")
        
    except Exception as e:
        print(f"❌ 处理失败 {page}: {str(e)}")

print("\n🎉 一致性检查完成！")
print("\n请完全清除浏览器缓存并硬刷新（Cmd+Shift+R）所有页面！")

