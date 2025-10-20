#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

# Installation详情页面列表
installation_pages = [
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

print("🔧 修复Installation详情页面导航栏选中样式...")
for page in installation_pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 修改 .header.scrolled .nav-desktop a.active 的颜色
        # 从 color: #fff; 改为 color: #333;
        content = re.sub(
            r'(\.header\.scrolled \.nav-desktop a\.active \{)\s*color:\s*#fff;',
            r'\1\n            color: #333;',
            content
        )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已修复: {page}")
        
    except Exception as e:
        print(f"❌ 修复失败 {page}: {str(e)}")

print("\n🔧 修复TOP页面导航栏选中样式...")

# 修复TOP页面 (index.html)
index_path = 'index.html'
try:
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 修改 .header.scrolled .nav-desktop a.active 的颜色
    # 从 color: #fff; 改为 color: #333;
    content = re.sub(
        r'(\.header\.scrolled \.nav-desktop a\.active \{)\s*color:\s*#fff;',
        r'\1\n            color: #333;',
        content
    )
    
    # 保存修改后的文件
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 已修复: {index_path}")
    
except Exception as e:
    print(f"❌ 修复失败 {index_path}: {str(e)}")

print("\n🎉 所有页面导航栏选中样式已修复！")
print("📝 滚动后的选中样式现在统一为: color: #333; (与installation主页面一致)")

