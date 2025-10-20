#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

print("🔧 检查并更新HTML文件，使用压缩版本的视频...")

# 需要替换的文件路径映射
replacements = {
    # project1
    'images/02project/project1/02_2026_k_02.mp4': 'images/02project/project1/02_2026_k_02_compressed.mp4',
    
    # leading to K
    'images/02installation/02_038_leading_to_K_shoppingstreat_KANAZAWA/02_2026_k_02.mp4': 
        'images/02installation/02_038_leading_to_K_shoppingstreat_KANAZAWA/02_2026_k_02_compressed.mp4',
    
    # I'm just a dog
    'images/02installation/02_025_i_m_just_a_dog_TWS/imjustadog.mp4': 
        'images/02installation/02_025_i_m_just_a_dog_TWS/imjustadog_compressed.mp4',
    
    # chasing a little past OPENART
    'images/02installation/02_034_chasing_a_little_past_OPENART/1742_chasingalittlepast_01_1.mp4': 
        'images/02installation/02_034_chasing_a_little_past_OPENART/1742_chasingalittlepast_01_1_compressed.mp4',
}

# 需要检查的HTML文件
html_files = [
    'project.html',
    'installation/leading-to-k-shoppingstreat-kanazawa.html',
    'installation/im_just_a_dog_tws.html',
    'installation/chasing-a-little-past-openart.html',
]

updated_files = []

for html_file in html_files:
    if not os.path.exists(html_file):
        print(f"⚠️  文件不存在: {html_file}")
        continue
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 执行替换
        for old_path, new_path in replacements.items():
            if old_path in content:
                content = content.replace(old_path, new_path)
                print(f"✅ 在 {html_file} 中替换: {os.path.basename(old_path)}")
        
        # 如果内容有变化，保存文件
        if content != original_content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_files.append(html_file)
        
    except Exception as e:
        print(f"❌ 处理失败 {html_file}: {str(e)}")

print(f"\n📊 总结:")
print(f"   检查了 {len(html_files)} 个文件")
print(f"   更新了 {len(updated_files)} 个文件")

if updated_files:
    print(f"\n✅ 已更新的文件:")
    for f in updated_files:
        print(f"   - {f}")

print("\n⚠️  以下大文件没有压缩版本，需要手动压缩:")
print("   - 2330_sound_of_a_kettle.mp4 (116M)")
print("   - 1630_chasingalittlepastostrale_1.mp4 (73M)")
print("   - NTIG_3.mp4 (51M)")
print("\n建议使用FFmpeg压缩这些文件到100MB以下")

