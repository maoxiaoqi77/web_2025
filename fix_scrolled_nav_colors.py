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

print("🔧 修复Installation详情页面导航栏滚动后的颜色区分...")

for page in pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 查找并替换 .header.scrolled .nav-desktop a 的颜色
        # 从 color: #333; 改为 color: #999;
        content = re.sub(
            r'(\.header\.scrolled \.nav-desktop a \{\s*color:\s*)#333;',
            r'\g<1>#999;  /* 普通链接为浅灰色 */',
            content
        )
        
        # 确保 .header.scrolled .nav-desktop a.active 保持 #333
        # 同时添加注释
        content = re.sub(
            r'(\.header\.scrolled \.nav-desktop a\.active \{\s*color:\s*#333;)',
            r'\g<1>  /* 选中状态为深灰色，更突出 */',
            content
        )
        
        # 在 .header.scrolled .nav-desktop a.active 后添加 hover 样式（如果不存在）
        if '.header.scrolled .nav-desktop a:hover' not in content:
            # 在 .header.scrolled .nav-desktop a.active 之后插入
            content = re.sub(
                r'(\.header\.scrolled \.nav-desktop a\.active \{[^\}]*\})',
                r'''\g<1>

        .header.scrolled .nav-desktop a:hover {
            color: #666;  /* hover状态为中灰色 */
        }''',
                content
            )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已修复: {page}")
        
    except Exception as e:
        print(f"❌ 修复失败 {page}: {str(e)}")

print("\n🎉 所有Installation详情页面导航栏颜色已修复！")
print("📝 滚动后的样式:")
print("  - 普通链接: #999 (浅灰色)")
print("  - 选中链接: #333 (深灰色，更突出)")
print("  - Hover状态: #666 (中灰色)")

