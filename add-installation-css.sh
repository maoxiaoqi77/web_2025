#!/bin/bash

# 为所有安装详情页面添加CSS引用
for file in installation/*.html; do
  # 检查文件是否已经包含installation-fix.css引用
  if ! grep -q "installation-fix.css" "$file"; then
    # 在lightbox-fix.css后面添加installation-fix.css引用
    sed -i '' 's|<link rel="stylesheet" href="../css/lightbox-fix.css">|<link rel="stylesheet" href="../css/lightbox-fix.css">\n    <link rel="stylesheet" href="../css/installation-fix.css">|' "$file"
    echo "Added CSS reference to $file"
  else
    echo "CSS reference already exists in $file"
  fi
done

echo "Done!" 