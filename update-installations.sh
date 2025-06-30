#!/bin/bash

# 更新所有安装页面，使用自动生成的"Other Installations"部分
# 此脚本会：
# 1. 在所有安装页面中添加对installation-data.js和other-installations.js的引用
# 2. 将现有的"Other Installations"部分替换为自动生成的版本

# 安装页面目录
INSTALLATION_DIR="installation"

# 遍历所有安装页面
for file in "$INSTALLATION_DIR"/*.html; do
  echo "处理文件: $file"
  
  # 1. 添加JavaScript引用（如果不存在）
  if ! grep -q "installation-data.js" "$file"; then
    sed -i '' 's|<script src="../js/script.js"></script>|<script src="../js/script.js"></script>\n    <script src="../js/installation-data.js"></script>\n    <script src="../js/other-installations.js"></script>|g' "$file"
  fi
  
  # 2. 替换"Other Installations"部分
  # 使用awk查找和替换多行内容
  awk '
  BEGIN { print_mode = 1 }
  /<div class="other-installations">/ { 
    print $0
    print "                <h3>Other Installations</h3>"
    print "                <!-- 此部分将由other-installations.js自动生成 -->"
    print_mode = 0 
  }
  /<\/div>/ && print_mode == 0 { 
    print $0
    print_mode = 1 
    next
  }
  print_mode == 1 { print $0 }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  
  echo "已更新: $file"
done

echo "所有安装页面已更新完成！" 