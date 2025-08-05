#!/bin/bash

# 修复所有I'M JUST A DOG开头的installation详情页面中的标题
for file in installation/*dog*.html; do
  echo "修复文件标题: $file"
  
  # 移除标题中的<strong>标签
  sed -i '' 's/<h1 class="project-title"><strong>I'"'"'M JUST A DOG<\/strong>/<h1 class="project-title">I'"'"'M JUST A DOG/g' "$file"
  
  echo "已修复文件标题: $file"
done

echo "所有文件标题修复完成!" 