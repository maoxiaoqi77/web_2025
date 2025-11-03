#!/bin/bash

# 智能压缩 - 根据文件大小自动选择质量

if [ $# -lt 1 ]; then
    echo "用法: $0 <webp文件路径>"
    exit 1
fi

INPUT_FILE="$1"
SIZE_MB=$(echo "scale=1; $(stat -f%z "$INPUT_FILE") / 1024 / 1024" | bc)

echo "文件: $(basename "$INPUT_FILE")"
echo "大小: ${SIZE_MB}MB"

# 根据文件大小智能选择质量
if (( $(echo "$SIZE_MB >= 8" | bc -l) )); then
    QUALITY=50
    echo "→ 超大文件(≥8MB)，使用质量: $QUALITY"
elif (( $(echo "$SIZE_MB >= 5" | bc -l) )); then
    QUALITY=55
    echo "→ 大文件(≥5MB)，使用质量: $QUALITY"
elif (( $(echo "$SIZE_MB >= 3" | bc -l) )); then
    QUALITY=58
    echo "→ 中等文件(≥3MB)，使用质量: $QUALITY"
else
    echo "→ 小文件(<3MB)，不建议压缩"
    echo "⚠️  跳过此文件"
    exit 0
fi

echo ""
./compress-one-webp.sh "$INPUT_FILE" $QUALITY

