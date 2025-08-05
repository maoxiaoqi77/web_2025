#!/bin/bash

# 撤销对所有以chasing-a-little-past开头的页面的修改
for file in installation/chasing-a-little-past*.html; do
  echo "处理文件: $file"
  
  # 创建临时文件
  tmp_file=$(mktemp)
  
  # 移除所有<strong>标签
  sed 's/<strong>//g; s/<\/strong>//g' "$file" > "$tmp_file"
  
  # 替换原文件
  mv "$tmp_file" "$file"
  
  echo "已撤销文件修改: $file"
done

echo "所有chasing-a-little-past页面的修改已撤销!" 