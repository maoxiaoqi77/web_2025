

echo "🔍 正在查找大于 100MB 的 .mp4 文件..."

find . -type f -name "*.mp4" | while read file
do
  size=$(du -m "$file" | cut -f1)
  if [ "$size" -gt 100 ]; then
    echo "📦 发现大文件：$file ($size MB)"
    output="${file%.mp4}_compressed.mp4"

    echo "🎬 开始压缩 $file ➜ $output"
    ffmpeg -y -i "$file" -vcodec libx264 -crf 28 "$output"

    echo "✅ 完成：$output"
    echo
  fi
done

echo "🎉 所有大文件处理完毕！"
#!/bin/bash

echo "🔍 正在查找大于 100MB 的 .mp4 文件..."

# 查找 images 文件夹下所有 .mp4 文件
find ./images -type f -name "*.mp4" | while read file
do
  size=$(du -m "$file" | cut -f1)  # 获取文件大小（单位 MB）
  if [ "$size" -gt 100 ]; then
    echo "📦 准备压缩：$file（${size}MB）"
    output="${file%.mp4}_compressed.mp4"
    echo "⚙️ 压缩输出到：$output"
    ffmpeg -i "$file" -vcodec libx264 -crf 28 "$output"
    echo "✅ 完成：$output"
    echo
  fi
done

echo "🎉 所有大文件处理完毕！"

