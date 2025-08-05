#!/bin/bash

# 为所有安装详情页面添加JS引用
for file in installation/*.html; do
  # 检查文件是否已经包含installation-fix.js引用
  if ! grep -q "installation-fix.js" "$file"; then
    # 在other-installations.js后面添加installation-fix.js引用
    sed -i '' 's|<script src="../js/other-installations.js"></script>|<script src="../js/other-installations.js"></script>\n    <script src="../js/installation-fix.js"></script>|' "$file"
    echo "Added JS reference to $file"
  else
    echo "JS reference already exists in $file"
  fi
done

echo "Done!" 