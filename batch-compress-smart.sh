#!/bin/bash

# 智能批量压缩 - 只压缩大文件，根据大小自动选择质量

cd "$(dirname "$0")"

BACKUP_DIR="images_backup_$(date +%Y%m%d_%H%M%S)"

echo "======================================"
echo "  智能批量压缩"
echo "======================================"
echo ""
echo "策略："
echo "  - <3MB: 跳过（太小，压缩效果不明显）"
echo "  - 3-5MB: 质量58"
echo "  - 5-8MB: 质量55"
echo "  - ≥8MB: 质量50"
echo ""
echo "备份目录: $BACKUP_DIR"
echo ""
read -p "确认开始? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

mkdir -p "$BACKUP_DIR"

# 需要处理的大文件（≥3MB）
FILES=(
    # ≥8MB 的超大文件（质量50）
    "images/02installation/00_SLIDESHOW/2524_webvideo_019.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_014.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_013.webp"
    "images/02top/slide show/009_2524_webvideo_004.webp"
    
    # 5-8MB 的大文件（质量55）
    "images/02installation/00_SLIDESHOW/2524_webvideo_011.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_002.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_007.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_011.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_015.webp"
    "images/02top/slide show/006_2527_webvideo_sound_of_a_kettle.webp"
    "images/02top/slide show/012_2524_webvideo_018.webp"
    
    # 3-5MB 的中等文件（质量58）
    "images/02installation/00_SLIDESHOW/2524_webvideo_001.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_012.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_016.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_018.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_003.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_017.webp"
    "images/02installation/00_SLIDESHOW/2541_webvideo_007.webp"
    "images/02top/slide show/007_2541_webvideo_006.webp"
)

TOTAL=${#FILES[@]}
SUCCESS=0
SKIPPED=0
FAILED=0
TOTAL_SAVED=0

for i in "${!FILES[@]}"; do
    FILE="${FILES[$i]}"
    NUM=$((i + 1))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "处理 $NUM/$TOTAL: $(basename "$FILE")"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ ! -f "$FILE" ]; then
        echo "⚠️  文件不存在，跳过"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    # 获取文件大小
    SIZE_MB=$(echo "scale=1; $(stat -f%z "$FILE") / 1024 / 1024" | bc)
    ORIGINAL_SIZE=$(stat -f%z "$FILE")
    
    # 确定质量
    if (( $(echo "$SIZE_MB >= 8" | bc -l) )); then
        QUALITY=50
    elif (( $(echo "$SIZE_MB >= 5" | bc -l) )); then
        QUALITY=55
    elif (( $(echo "$SIZE_MB >= 3" | bc -l) )); then
        QUALITY=58
    else
        echo "⚠️  文件太小(${SIZE_MB}MB)，跳过"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    echo "大小: ${SIZE_MB}MB，质量: $QUALITY"
    
    # 备份原文件
    BACKUP_PATH="$BACKUP_DIR/$(dirname "$FILE")"
    mkdir -p "$BACKUP_PATH"
    cp "$FILE" "$BACKUP_PATH/"
    
    # 压缩
    ./compress-one-webp.sh "$FILE" $QUALITY
    
    # 检查是否生成了压缩文件
    COMPRESSED="${FILE%.webp}_compressed.webp"
    if [ -f "$COMPRESSED" ]; then
        NEW_SIZE=$(stat -f%z "$COMPRESSED")
        
        if [ $NEW_SIZE -lt $ORIGINAL_SIZE ]; then
            # 替换原文件
            mv "$COMPRESSED" "$FILE"
            SAVED=$((ORIGINAL_SIZE - NEW_SIZE))
            TOTAL_SAVED=$((TOTAL_SAVED + SAVED))
            SUCCESS=$((SUCCESS + 1))
            echo "✅ 已自动替换原文件"
        else
            rm "$COMPRESSED"
            echo "⚠️  压缩后更大，已跳过"
            SKIPPED=$((SKIPPED + 1))
        fi
    else
        FAILED=$((FAILED + 1))
        echo "❌ 压缩失败"
    fi
done

echo ""
echo "======================================"
echo "  批量压缩完成"
echo "======================================"
echo ""
echo "📊 统计:"
echo "  - 总文件数: $TOTAL"
echo "  - 成功: $SUCCESS"
echo "  - 跳过: $SKIPPED"
echo "  - 失败: $FAILED"
echo "  - 总节省: $(echo "scale=1; $TOTAL_SAVED / 1024 / 1024" | bc)MB"
echo ""
echo "💾 备份位置: $BACKUP_DIR"
echo ""

