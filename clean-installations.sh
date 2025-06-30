#!/bin/bash

# 清理安装页面中的多余大模块
# 此脚本会：
# 1. 保留other-installations容器和标题
# 2. 删除容器中的所有其他内容
# 3. 添加注释，表明此部分将由other-installations.js自动生成

# 安装页面目录
INSTALLATION_DIR="installation"

# 遍历所有安装页面
for file in "$INSTALLATION_DIR"/*.html; do
  echo "处理文件: $file"
  
  # 使用awk处理文件
  awk '
  BEGIN { print_mode = 1; in_other_installations = 0; printed_comment = 0; }
  
  # 检测other-installations容器的开始
  /<div class="other-installations">/ { 
    print $0;
    in_other_installations = 1;
    print_mode = 1;
  }
  
  # 打印标题
  /<h3>Other Installations<\/h3>/ && in_other_installations == 1 { 
    print $0;
    if (printed_comment == 0) {
      print "                <!-- 此部分将由other-installations.js自动生成 -->";
      printed_comment = 1;
    }
    print_mode = 0;
  }
  
  # 检测other-installations容器的结束
  /<\/div>/ && in_other_installations == 1 { 
    in_other_installations = 0;
    print_mode = 1;
    print $0;
    next;
  }
  
  # 打印非other-installations部分的内容
  (print_mode == 1 && in_other_installations == 0) { print $0; }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  
  echo "已清理: $file"
done

echo "所有安装页面已清理完成！" 