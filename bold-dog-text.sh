#!/bin/bash

# 更新所有I'M JUST A DOG开头的installation详情页面
for file in installation/*dog*.html; do
  echo "处理文件: $file"
  
  # 将"I'M JUST A DOG"加粗
  sed -i '' 's/I'"'"'M JUST A DOG/<strong>I'"'"'M JUST A DOG<\/strong>/g' "$file"
  
  # 将"Everyday life, spoken in the voice of a dog"加粗
  sed -i '' 's/"Everyday life, spoken in the voice of a dog"/<strong>"Everyday life, spoken in the voice of a dog"<\/strong>/g' "$file"
  
  echo "已更新文件: $file"
done

echo "所有文件处理完成!" 