#!/bin/bash

# 更新所有I'M JUST A DOG开头的installation详情页面
for file in installation/*dog*.html; do
  echo "处理文件: $file"
  
  # 创建临时文件
  tmp_file=$(mktemp)
  
  # 读取文件内容
  content=$(cat "$file")
  
  # 在日语描述中加粗I'M JUST A DOG
  content=$(echo "$content" | sed -E '/<p class="project-description">/,/<\/p>/ s/(I'"'"'M JUST A DOG) は、/<strong>\1<\/strong> は、/')
  
  # 在英语描述中加粗I'M JUST A DOG
  content=$(echo "$content" | sed -E '/<p class="project-description">/,/<\/p>/ s/(I'"'"'M JUST A DOG) is a/<strong>\1<\/strong> is a/')
  
  # 加粗"Everyday life, spoken in the voice of a dog"
  content=$(echo "$content" | sed -E '/<p class="project-description">/,/<\/p>/ s/("Everyday life, spoken in the voice of a dog")/<strong>\1<\/strong>/')
  
  # 写入临时文件
  echo "$content" > "$tmp_file"
  
  # 替换原文件
  mv "$tmp_file" "$file"
  
  echo "已更新文件: $file"
done

echo "所有文件处理完成!" 