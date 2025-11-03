#!/bin/bash

# 图片压缩脚本 - 压缩所有slideshow的webp图片
# 使用方法: bash compress-images.sh

# 检查是否安装了cwebp
if ! command -v cwebp &> /dev/null; then
    echo "错误: 未找到cwebp工具"
    echo "请先安装: brew install webp"
    exit 1
fi

# 设置压缩质量（75是平衡质量和大小的好选择）
QUALITY=75

# 备份目录
BACKUP_DIR="images_backup_$(date +%Y%m%d_%H%M%S)"
echo "创建备份目录: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 计数器
COUNT=0
TOTAL_BEFORE=0
TOTAL_AFTER=0

# 压缩函数
compress_webp() {
    local file="$1"
    local temp_file="${file}.tmp.webp"
    
    # 获取原始文件大小
    local size_before=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    TOTAL_BEFORE=$((TOTAL_BEFORE + size_before))
    
    # 备份原文件
    cp "$file" "$BACKUP_DIR/"
    
    # 压缩
    echo "压缩: $file ($(numfmt --to=iec-i --suffix=B $size_before 2>/dev/null || echo "${size_before}B"))"
    cwebp -q $QUALITY "$file" -o "$temp_file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local size_after=$(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file" 2>/dev/null)
        
        # 只有当压缩后文件更小时才替换
        if [ $size_after -lt $size_before ]; then
            mv "$temp_file" "$file"
            TOTAL_AFTER=$((TOTAL_AFTER + size_after))
            local saved=$((size_before - size_after))
            local percent=$((saved * 100 / size_before))
            echo "  ✓ 节省: ${percent}% ($saved bytes)"
            COUNT=$((COUNT + 1))
        else
            rm "$temp_file"
            TOTAL_AFTER=$((TOTAL_AFTER + size_before))
            echo "  - 跳过（压缩后更大）"
        fi
    else
        TOTAL_AFTER=$((TOTAL_AFTER + size_before))
        echo "  ✗ 压缩失败"
    fi
}

echo "开始压缩slideshow图片..."
echo "=========================================="

# 压缩 installation slideshow
echo "处理 installation slideshow..."
for file in images/02installation/00_SLIDESHOW/*.webp; do
    [ -f "$file" ] && compress_webp "$file"
done

# 压缩 top slideshow
echo "处理 top slideshow..."
for file in images/02top/slide\ show/*.webp; do
    [ -f "$file" ] && compress_webp "$file"
done

# 压缩 project slideshow
echo "处理 project slideshow..."
for file in images/02project/slideshow/*.webp; do
    [ -f "$file" ] && compress_webp "$file"
done

# 压缩 sculpture slideshow
echo "处理 sculpture slideshow..."
for file in images/02sculpture/00_SLIDESHOW/*.webp; do
    [ -f "$file" ] && compress_webp "$file"
done

# 压缩 drawing slideshow
echo "处理 drawing slideshow..."
for file in images/02drawing/00_SLIDESHOW/*.webp; do
    [ -f "$file" ] && compress_webp "$file"
done

echo "=========================================="
echo "压缩完成！"
echo "处理文件: $COUNT"
echo "压缩前总大小: $(numfmt --to=iec-i --suffix=B $TOTAL_BEFORE 2>/dev/null || echo "${TOTAL_BEFORE}B")"
echo "压缩后总大小: $(numfmt --to=iec-i --suffix=B $TOTAL_AFTER 2>/dev/null || echo "${TOTAL_AFTER}B")"
if [ $TOTAL_BEFORE -gt 0 ]; then
    SAVED=$((TOTAL_BEFORE - TOTAL_AFTER))
    PERCENT=$((SAVED * 100 / TOTAL_BEFORE))
    echo "节省空间: $(numfmt --to=iec-i --suffix=B $SAVED 2>/dev/null || echo "${SAVED}B") (${PERCENT}%)"
fi
echo "备份位置: $BACKUP_DIR"
echo ""
echo "如需恢复，运行: cp $BACKUP_DIR/* images/相应目录/"

