#!/bin/bash

# 压缩单个动画WebP文件
# 用法: ./compress-one-webp.sh <文件路径> [质量(默认60)]

if [ $# -lt 1 ]; then
    echo "用法: $0 <webp文件路径> [质量(默认60)]"
    echo "示例: $0 images/02installation/00_SLIDESHOW/2524_webvideo_001.webp 60"
    exit 1
fi

INPUT_FILE="$1"
QUALITY="${2:-60}"
TEMP_DIR="temp_frames_$$"

echo "======================================"
echo "压缩动画WebP: $(basename "$INPUT_FILE")"
echo "======================================"

# 检查文件是否存在
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ 错误: 文件不存在: $INPUT_FILE"
    exit 1
fi

# 显示原始大小
ORIGINAL_SIZE=$(stat -f%z "$INPUT_FILE")
ORIGINAL_SIZE_MB=$(echo "scale=1; $ORIGINAL_SIZE / 1024 / 1024" | bc)
echo "原始大小: ${ORIGINAL_SIZE_MB}MB"

# 获取帧数
FRAME_COUNT=$(webpmux -info "$INPUT_FILE" 2>/dev/null | grep "Number of frames:" | awk '{print $4}')
if [ -z "$FRAME_COUNT" ] || [ "$FRAME_COUNT" -eq 0 ]; then
    echo "❌ 错误: 无法获取帧数"
    exit 1
fi
echo "帧数: $FRAME_COUNT"

# 获取帧延迟（从第一帧的duration列）
DURATION=$(webpmux -info "$INPUT_FILE" 2>/dev/null | grep "^  1:" | awk '{print $6}')
if [ -z "$DURATION" ] || [ "$DURATION" = "0" ]; then
    DURATION=67
fi
echo "帧延迟: ${DURATION}ms"
echo "压缩质量: $QUALITY"
echo ""

# 创建临时目录
mkdir -p "$TEMP_DIR"

# 提取所有帧
echo "步骤 1/3: 提取 $FRAME_COUNT 帧..."
for i in $(seq 1 $FRAME_COUNT); do
    printf "\r  进度: %d/%d" $i $FRAME_COUNT
    webpmux -get frame $i "$INPUT_FILE" -o "$TEMP_DIR/frame_$(printf "%04d" $i).webp" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 提取第 $i 帧失败"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
done
echo " ✓"

# 压缩每一帧
echo "步骤 2/3: 压缩 $FRAME_COUNT 帧..."
FRAME_NUM=0
for frame in "$TEMP_DIR"/frame_*.webp; do
    FRAME_NUM=$((FRAME_NUM + 1))
    printf "\r  进度: %d/%d" $FRAME_NUM $FRAME_COUNT
    cwebp -q $QUALITY "$frame" -o "${frame%.webp}_compressed.webp" 2>/dev/null
    if [ $? -eq 0 ]; then
        mv "${frame%.webp}_compressed.webp" "$frame"
    fi
done
echo " ✓"

# 重新组合
echo "步骤 3/3: 重新组合动画..."
OUTPUT_FILE="${INPUT_FILE%.webp}_compressed.webp"

# 使用排序后的文件列表避免通配符顺序问题
FRAME_LIST=$(ls -1 "$TEMP_DIR"/frame_*.webp | sort)
if [ -z "$FRAME_LIST" ]; then
    echo "❌ 错误: 找不到压缩后的帧文件"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 构建img2webp命令（所有帧使用相同的duration）
img2webp -loop 0 -d $DURATION $FRAME_LIST -o "$OUTPUT_FILE" 2>&1

if [ $? -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
    # 比较大小
    NEW_SIZE=$(stat -f%z "$OUTPUT_FILE")
    NEW_SIZE_MB=$(echo "scale=1; $NEW_SIZE / 1024 / 1024" | bc)
    SAVED=$((ORIGINAL_SIZE - NEW_SIZE))
    SAVED_MB=$(echo "scale=1; $SAVED / 1024 / 1024" | bc)
    PERCENT=$(echo "scale=1; $SAVED * 100 / $ORIGINAL_SIZE" | bc)
    
    echo ""
    echo "压缩后大小: ${NEW_SIZE_MB}MB"
    echo "节省空间: ${SAVED_MB}MB (${PERCENT}%)"
    
    if [ $NEW_SIZE -lt $ORIGINAL_SIZE ]; then
        echo ""
        echo "✅ 压缩成功！"
        echo "   原文件: $INPUT_FILE"
        echo "   新文件: $OUTPUT_FILE"
        echo ""
        echo "如果满意，可以替换原文件:"
        echo "   mv \"$OUTPUT_FILE\" \"$INPUT_FILE\""
    else
        echo ""
        echo "⚠️  压缩后反而更大，已保存到: $OUTPUT_FILE"
        echo "   建议删除: rm \"$OUTPUT_FILE\""
    fi
else
    echo ""
    echo "❌ 重新组合失败"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 清理临时文件
rm -rf "$TEMP_DIR"
echo ""

