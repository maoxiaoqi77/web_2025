#!/bin/bash

# 修复所有I'M JUST A DOG开头的installation详情页面
for file in installation/*dog*.html; do
  echo "修复文件: $file"
  
  # 1. 先修复重复的<strong>标签
  sed -i '' 's/<strong><strong>/<strong>/g' "$file"
  sed -i '' 's/<\/strong><\/strong>/<\/strong>/g' "$file"
  
  # 2. 修复图片alt属性中的<strong>标签
  sed -i '' 's/alt="<strong>I'"'"'M JUST A DOG<\/strong>/alt="I'"'"'M JUST A DOG/g' "$file"
  
  # 3. 确保日语部分的I'M JUST A DOG也被加粗
  sed -i '' '/<p class="project-description">/,/<\/p>/ s/^<p class="project-description">I'"'"'M JUST A DOG は、/<p class="project-description"><strong>I'"'"'M JUST A DOG<\/strong> は、/' "$file"
  
  echo "已修复文件: $file"
done

echo "所有文件修复完成!" 