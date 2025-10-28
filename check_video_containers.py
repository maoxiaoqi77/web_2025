#!/usr/bin/env python3
import os
import re

def check_video_containers():
    installation_dir = "installation"
    files_with_video_containers = []
    files_with_actual_videos = []
    
    for filename in os.listdir(installation_dir):
        if filename.endswith('.html'):
            filepath = os.path.join(installation_dir, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 检查是否有视频容器
            if 'video-section' in content or 'videos-grid' in content:
                files_with_video_containers.append(filename)
                
                # 检查是否有实际的video标签
                if '<video' in content:
                    files_with_actual_videos.append(filename)
                    print(f"✅ {filename}: 有视频容器且有实际视频内容")
                else:
                    print(f"❌ {filename}: 有视频容器但无实际视频内容")
    
    print(f"\n📋 总结:")
    print(f"   有视频容器的文件: {len(files_with_video_containers)}")
    print(f"   有实际视频的文件: {len(files_with_actual_videos)}")
    print(f"   需要移除视频容器的文件: {len(files_with_video_containers) - len(files_with_actual_videos)}")
    
    files_to_fix = [f for f in files_with_video_containers if f not in files_with_actual_videos]
    print(f"\n📋 需要修复的文件:")
    for f in files_to_fix:
        print(f"   - {f}")

if __name__ == "__main__":
    check_video_containers()
