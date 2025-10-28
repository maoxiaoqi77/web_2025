#!/usr/bin/env python3
import os
import re

def remove_video_containers():
    files_to_fix = [
        'chasing-a-little-past-titanik.html',
        'im-just-a-dog-k51.html', 
        'chasing-a-little-past-lad.html',
        'i_m_just_a_dog_superbien!.html',
        'still-sigh-with-water.html',
        'im-just-a-dog.html',
        'in-the-bush.html',
        'chasing-a-little-past-kanazawa.html',
        'blink-blink-blink-to-forget.html'
    ]
    
    for filename in files_to_fix:
        filepath = os.path.join('installation', filename)
        
        if not os.path.exists(filepath):
            print(f"❌ 文件不存在: {filepath}")
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 移除视频容器部分
        # 匹配从 <div class="video-section"> 到 </div> 的整个视频容器
        pattern = r'<div class="video-section">.*?</div>\s*'
        new_content = re.sub(pattern, '', content, flags=re.DOTALL)
        
        # 如果内容有变化，写回文件
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ 已修复: {filename}")
        else:
            print(f"⚠️  无需修复: {filename}")

if __name__ == "__main__":
    remove_video_containers()
