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

print("🔍 检查HTML结构问题...\n")

issues_found = []

for page in pages:
    file_path = os.path.join(installation_dir, page)
    
    if not os.path.exists(file_path):
        print(f"⚠️  文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        has_issues = False
        issue_list = []
        
        # 检查是否有 gallery-container
        if 'gallery-container' in content:
            issue_list.append("❌ 包含多余的 gallery-container")
            has_issues = True
        
        # 检查 other-installations 是否在 project-content 内部
        # 通过查找 </div> 的顺序来判断
        project_content_match = re.search(r'<div class="project-content">(.*?)</div>\s*</div>\s*</main>', content, re.DOTALL)
        if project_content_match:
            inner_content = project_content_match.group(1)
            if 'other-installations' in inner_content:
                issue_list.append("❌ other-installations 在 project-content 内部（应该在外部）")
                has_issues = True
        
        if has_issues:
            print(f"🔴 {page}")
            for issue in issue_list:
                print(f"   {issue}")
            issues_found.append(page)
        else:
            print(f"✅ {page}")
    
    except Exception as e:
        print(f"❌ 检查失败 {page}: {str(e)}")

print(f"\n📊 检查完成!")
print(f"   总共检查: {len(pages)} 个页面")
print(f"   发现问题: {len(issues_found)} 个页面")

if issues_found:
    print(f"\n需要修复的页面:")
    for page in issues_found:
        print(f"   - {page}")

