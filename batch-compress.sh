#!/bin/bash

# 批量压缩动画WebP文件
# 这个脚本会压缩所有大于2MB的动画webp文件

cd "$(dirname "$0")"

QUALITY=60
BACKUP_DIR="images_backup_$(date +%Y%m%d_%H%M%S)"

echo "======================================"
echo "  批量压缩动画WebP文件"
echo "======================================"
echo ""
echo "压缩质量: $QUALITY"
echo "备份目录: $BACKUP_DIR"
echo ""
read -p "确认开始? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

mkdir -p "$BACKUP_DIR"

# 需要处理的文件列表
FILES=(
    "images/02installation/00_SLIDESHOW/2524_webvideo_019.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_014.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_013.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_011.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_002.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_007.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_001.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_015.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_018.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_012.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_016.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_003.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_006.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_017.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_008.webp"
    "images/02installation/00_SLIDESHOW/2524_webvideo_009.webp"
    "images/02installation/00_SLIDESHOW/2541_webvideo_007.webp"
    "images/02installation/00_SLIDESHOW/2541_webvideo_009.webp"
    "images/02top/slide show/009_2524_webvideo_004.webp"
    "images/02top/slide show/006_2527_webvideo_sound_of_a_kettle.webp"
    "images/02top/slide show/012_2524_webvideo_018.webp"
    "images/02top/slide show/007_2541_webvideo_006.webp"
)

TOTAL=${#FILES[@]}
SUCCESS=0
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
        continue
    fi
    
    # 备份原文件
    BACKUP_PATH="$BACKUP_DIR/$(dirname "$FILE")"
    mkdir -p "$BACKUP_PATH"
    cp "$FILE" "$BACKUP_PATH/"
    
    # 压缩
    ./compress-one-webp.sh "$FILE" $QUALITY
    
    # 检查是否生成了压缩文件
    COMPRESSED="${FILE%.webp}_compressed.webp"
    if [ -f "$COMPRESSED" ]; then
        ORIGINAL_SIZE=$(stat -f%z "$FILE")
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
echo "  - 失败: $FAILED"
echo "  - 总节省: $(echo "scale=1; $TOTAL_SAVED / 1024 / 1024" | bc)MB"
echo ""
echo "💾 备份位置: $BACKUP_DIR"
echo ""

