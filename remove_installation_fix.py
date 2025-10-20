#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

# 需要修复的页面列表
pages = [
    'blink-blink-blink-to-forget.html',
    'chasing-little-pasts-tws.html',
    'i_m_just_a_dog_superbien!.html',
    'im_just_a_dog_tws.html',
    'im-just-a-dog-k51.html',
    'in-the-bush.html',
    'leading-to-k-shoppingstreat-kanazawa.html',
    'never-talk-in-the-garden.html',
    'still-sigh-with-water.html'
]

installation_dir = 'installation'

print("🔧 删除导致封面图左右空白的CSS引用...")

for page in pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 删除 installation-fix.css 的引用
        original_content = content
        content = re.sub(
            r'\s*<link rel="stylesheet" href="\.\./css/installation-fix\.css">\s*',
            '\n',
            content
        )
        
        if content != original_content:
            # 保存修改后的文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ 已修复: {page}")
        else:
            print(f"ℹ️  无需修改: {page}")
        
    except Exception as e:
        print(f"❌ 修复失败 {page}: {str(e)}")

print("\n🎉 所有页面的封面图CSS引用已修复！")
print("📝 已删除 installation-fix.css 引用，封面图现在应该能占满全屏了")

