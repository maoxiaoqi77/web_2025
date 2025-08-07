#!/bin/bash

# 最终清理脚本，处理剩余的特殊情况
# 作者：Claude
# 日期：2023-08-07

echo "开始最终清理..."

# 为包含日语字符的文件创建webp版本
echo "为包含日语字符的文件创建webp版本..."
find images -name "*のコピー*.jpg" | while read file; do
    webp_file="${file%.*}.webp"
    echo "处理: $file -> $webp_file"
    cwebp -q 80 "$file" -o "$webp_file"
    if [ -f "$webp_file" ]; then
        echo "  创建成功，删除原始文件"
        rm "$file"
    else
        echo "  创建失败，保留原始文件"
    fi
done

# 为其他没有webp版本的jpg文件创建webp版本
echo "为其他没有webp版本的jpg文件创建webp版本..."
find images -name "*.jpg" | while read file; do
    webp_file="${file%.*}.webp"
    if [ ! -f "$webp_file" ]; then
        echo "处理: $file -> $webp_file"
        cwebp -q 80 "$file" -o "$webp_file"
        if [ -f "$webp_file" ]; then
            echo "  创建成功，删除原始文件"
            rm "$file"
        else
            echo "  创建失败，保留原始文件"
        fi
    else
        echo "已存在webp版本: $webp_file，删除原始文件: $file"
        rm "$file"
    fi
done

echo "最终清理完成!" 