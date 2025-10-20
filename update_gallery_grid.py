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

print("🔧 更新Gallery Grid布局为响应式4-1列...")

for page in pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. 修改默认的 .gallery-grid (从 repeat(3, 1fr) 改为 repeat(4, 1fr))
        # 只匹配第一个出现的（不在media query内的）
        content = re.sub(
            r'(\/\* 画廊网格 \*\/\s*\.gallery-grid \{[^}]*grid-template-columns:\s*)repeat\(3, 1fr\)',
            r'\g<1>repeat(4, 1fr)',
            content,
            count=1
        )
        
        # 2. 在 @media (max-width: 1024px) 中，如果有 gallery-grid，保持为 repeat(3, 1fr)
        # 先查找是否存在
        media_1024_match = re.search(r'@media \(max-width: 1024px\).*?\.gallery-grid \{[^}]*grid-template-columns:\s*repeat\(\d+, 1fr\)', content, re.DOTALL)
        if media_1024_match:
            # 替换为 repeat(3, 1fr)
            content = re.sub(
                r'(@media \(max-width: 1024px\)(?:(?!@media).)*?\.gallery-grid \{[^}]*grid-template-columns:\s*)repeat\(\d+, 1fr\)',
                r'\g<1>repeat(3, 1fr)',
                content,
                flags=re.DOTALL,
                count=1
            )
        
        # 3. 在 @media (max-width: 768px) 中，gallery-grid 改为 repeat(2, 1fr)
        media_768_match = re.search(r'@media \(max-width: 768px\).*?\.gallery-grid \{', content, re.DOTALL)
        if media_768_match:
            content = re.sub(
                r'(@media \(max-width: 768px\)(?:(?!@media).)*?\.gallery-grid \{[^}]*grid-template-columns:\s*)repeat\(\d+, 1fr\)',
                r'\g<1>repeat(2, 1fr)',
                content,
                flags=re.DOTALL,
                count=1
            )
        
        # 4. 在 @media (max-width: 480px) 中，gallery-grid 改为 1fr
        media_480_match = re.search(r'@media \(max-width: 480px\).*?\.gallery-grid \{', content, re.DOTALL)
        if media_480_match:
            content = re.sub(
                r'(@media \(max-width: 480px\)(?:(?!@media).)*?\.gallery-grid \{[^}]*grid-template-columns:\s*)repeat\(\d+, 1fr\)',
                r'\g<1>1fr',
                content,
                flags=re.DOTALL,
                count=1
            )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已更新: {page}")
        
    except Exception as e:
        print(f"❌ 更新失败 {page}: {str(e)}")

print("\n🎉 Gallery Grid布局更新完成！")
print("📝 新的响应式布局:")
print("  - 大屏（默认）: 4列")
print("  - 中等屏幕（≤1024px）: 3列")
print("  - 平板（≤768px）: 2列")
print("  - 手机（≤480px）: 1列")
