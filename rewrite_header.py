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

# 新的封面图CSS
new_header_css = '''        /* 封面图 - 16:9比例，宽度占满 */
        .project-header {
            width: 100vw;
            height: 56.25vw;  /* 16:9 = 9/16 = 0.5625 */
            position: relative;
            margin: 0;
            padding: 0;
            background: #000;
        }

        .project-header img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }'''

for page in pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. 删除旧的project-header CSS样式
        content = re.sub(
            r'/\* 全屏封面图 \*/.*?\.project-header \{[^}]*\}',
            new_header_css,
            content,
            flags=re.DOTALL
        )
        
        # 2. 删除project-header img的旧样式
        content = re.sub(
            r'\.project-header img \{[^}]*\}',
            '',
            content,
            flags=re.DOTALL
        )
        
        # 3. 修改project-content的margin-top，从calc(100vh + 20px)改为40px
        content = re.sub(
            r'margin: calc\(100vh \+ 20px\) 90px 80px;',
            'margin: 40px 90px 80px;',
            content
        )
        
        # 4. 修改响应式的margin-top
        content = re.sub(
            r'margin: calc\(100vh \+ 20px\) 60px 80px;',
            'margin: 40px 60px 80px;',
            content
        )
        
        content = re.sub(
            r'margin: calc\(100vh \+ 20px\) 40px 80px;',
            'margin: 40px 40px 80px;',
            content
        )
        
        content = re.sub(
            r'margin: calc\(100vh \+ 20px\) 20px 40px;',
            'margin: 40px 20px 40px;',
            content
        )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已重写header: {page}")
        
    except Exception as e:
        print(f"❌ 重写失败 {page}: {str(e)}")

print("\n🎉 封面图重写完成！")

