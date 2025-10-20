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

# 滚动监听脚本
scroll_script = '''
    <script>
        // 监听滚动，当滑出封面图后改变导航栏样式
        window.addEventListener('scroll', function() {
            const header = document.querySelector('.header');
            const projectHeader = document.querySelector('.project-header');
            
            if (header && projectHeader) {
                const headerHeight = projectHeader.offsetHeight;
                const scrollPosition = window.scrollY || window.pageYOffset;
                
                // 当滚动超过封面图高度的80%时，添加scrolled类
                if (scrollPosition > headerHeight * 0.8) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        });
    </script>'''

for page in pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. 在CSS中添加scrolled状态的样式
        # 找到.header.scrolled的样式，如果不存在则添加
        if '.header.scrolled' not in content:
            # 在.header样式后添加scrolled样式
            content = re.sub(
                r'(\.header\.scrolled \.menu-btn span \{[^}]*\})',
                r'''\1

        /* 滚动后：导航栏恢复底色 */
        .header.scrolled {
            background: rgba(255, 255, 255, 0.95) !important;
        }''',
                content
            )
        
        # 2. 删除旧的滚动监听脚本（如果存在）
        content = re.sub(
            r'<script>\s*//\s*监听滚动.*?</script>',
            '',
            content,
            flags=re.DOTALL
        )
        
        # 3. 在</body>前添加新的滚动监听脚本
        if 'window.addEventListener' not in content or 'projectHeader.offsetHeight' not in content:
            content = re.sub(
                r'(</body>)',
                scroll_script + r'\n\1',
                content
            )
        
        # 保存修改后的文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已添加滚动监听: {page}")
        
    except Exception as e:
        print(f"❌ 添加失败 {page}: {str(e)}")

print("\n🎉 滚动监听添加完成！")

