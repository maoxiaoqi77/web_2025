#!/bin/bash

# 将lightbox-fix.css引用添加到所有安装详情页
# 此脚本会在所有安装详情页的<head>部分添加CSS引用

echo "开始添加lightbox-fix.css引用到所有安装详情页..."

# 安装详情页目录
INSTALLATION_DIR="installation"

# 获取所有HTML文件
for file in "$INSTALLATION_DIR"/*.html; do
    echo "处理文件: $file"
    
    # 检查文件是否为空
    if [ ! -s "$file" ]; then
        echo "文件为空，跳过: $file"
        continue
    fi
    
    # 检查文件是否已经包含了CSS引用
    if grep -q "lightbox-fix.css" "$file"; then
        echo "文件已包含CSS引用，跳过: $file"
        continue
    fi
    
    # 检查文件是否包含lightbox
    if grep -q "lightbox" "$file"; then
        # 备份原始文件
        cp "$file" "${file}.bak"
        
        # 在最后一个CSS引用后添加新的CSS引用
        sed -i '' 's|<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">|<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">\n    <link rel="stylesheet" href="../css/lightbox-fix.css">|' "$file"
        
        echo "已更新: $file"
    else
        echo "文件不包含lightbox，跳过: $file"
    fi
done

echo "所有安装详情页的lightbox-fix.css引用已添加完成！" 