#!/bin/bash

echo "🔍 正在查找 images 文件夹中大于 100MB 的 .mp4 文件..."

# 遍历 images 文件夹及其所有子文件夹中的 mp4 文件
find ./images -type f -name "*.mp4" | while read file
do
  size=$(du -m "$file" | cut -f1) # 获取文件大小（单位 MB）
  if [ "$size" -gt 100 ]; then
    echo "📦 准备压缩: $file (${size}MB)"
    output="${file%.mp4}_compressed.mp4"

    if [ -f "$output" ]; then
      echo "⚠️ 已存在压缩文件，跳过: $output"
      continue
    fi

    echo "🔧 开始压缩: $file ➡️ $output"
    ffmpeg -i "$file" -vcodec libx264 -crf 28 "$output"
    echo "✅ 完成: $output"
    echo
  fi
done

echo "🎉 所有大文件处理完毕！"

