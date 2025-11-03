#!/bin/bash

# 生成响应式图片（多尺寸版本）
# 为每个源图片生成 480px, 960px, 1440px 三个版本

if [ $# -lt 1 ]; then
    echo "用法: $0 <目录路径> [质量(默认75)]"
    echo ""
    echo "示例: $0 images/02installation/02_036_chasing_a_little_past_KANAZAWA 70"
    exit 1
fi

DIR="$1"
QUALITY="${2:-75}"

echo "======================================"
echo "  生成响应式图片"
echo "======================================"
echo ""
echo "目录: $DIR"
echo "质量: $QUALITY"
echo "尺寸: 480px, 960px, 1440px"
echo ""

if [ ! -d "$DIR" ]; then
    echo "❌ 错误: 目录不存在"
    exit 1
fi

cd "$DIR" || exit 1

SUCCESS=0
SKIPPED=0
FAILED=0

# 处理JPG文件
shopt -s nullglob
for jpg in *.jpg *.jpeg; do
    [ ! -f "$jpg" ] && continue
    
    BASE_NAME="${jpg%.*}"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "处理: $jpg"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 获取原始尺寸
    ORIGINAL_WIDTH=$(identify -format "%w" "$jpg" 2>/dev/null)
    if [ -z "$ORIGINAL_WIDTH" ]; then
        echo "❌ 无法获取图片尺寸"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    echo "原始宽度: ${ORIGINAL_WIDTH}px"
    
    # 生成 480px 版本（手机）
    if [ $ORIGINAL_WIDTH -gt 480 ]; then
        echo "  → 生成 480px 版本..."
        cwebp -resize 480 0 -q $QUALITY "$jpg" -o "${BASE_NAME}-480.webp" 2>&1 | tail -2
        if [ $? -eq 0 ]; then
            SIZE=$(stat -f%z "${BASE_NAME}-480.webp" 2>/dev/null || stat -c%s "${BASE_NAME}-480.webp")
            SIZE_KB=$((SIZE / 1024))
            echo "     ✓ ${SIZE_KB}KB"
        fi
    else
        echo "  ⚠ 原图小于480px，跳过"
    fi
    
    # 生成 960px 版本（平板/小屏电脑）
    if [ $ORIGINAL_WIDTH -gt 960 ]; then
        echo "  → 生成 960px 版本..."
        cwebp -resize 960 0 -q $QUALITY "$jpg" -o "${BASE_NAME}-960.webp" 2>&1 | tail -2
        if [ $? -eq 0 ]; then
            SIZE=$(stat -f%z "${BASE_NAME}-960.webp" 2>/dev/null || stat -c%s "${BASE_NAME}-960.webp")
            SIZE_KB=$((SIZE / 1024))
            echo "     ✓ ${SIZE_KB}KB"
        fi
    else
        echo "  ⚠ 原图小于960px，跳过"
    fi
    
    # 生成 1440px 版本（大屏）
    if [ $ORIGINAL_WIDTH -gt 1440 ]; then
        echo "  → 生成 1440px 版本..."
        cwebp -resize 1440 0 -q $QUALITY "$jpg" -o "${BASE_NAME}-1440.webp" 2>&1 | tail -2
        if [ $? -eq 0 ]; then
            SIZE=$(stat -f%z "${BASE_NAME}-1440.webp" 2>/dev/null || stat -c%s "${BASE_NAME}-1440.webp")
            SIZE_KB=$((SIZE / 1024))
            echo "     ✓ ${SIZE_KB}KB"
        fi
    else
        echo "  ⚠ 原图小于1440px，跳过"
    fi
    
    # 生成或更新主WebP（原始尺寸）
    MAIN_WEBP="${BASE_NAME}.webp"
    if [ ! -f "$MAIN_WEBP" ] || [ "$jpg" -nt "$MAIN_WEBP" ]; then
        echo "  → 生成原始尺寸版本..."
        cwebp -q $QUALITY "$jpg" -o "$MAIN_WEBP" 2>&1 | tail -2
        if [ $? -eq 0 ]; then
            SIZE=$(stat -f%z "$MAIN_WEBP" 2>/dev/null || stat -c%s "$MAIN_WEBP")
            SIZE_KB=$((SIZE / 1024))
            echo "     ✓ ${SIZE_KB}KB"
        fi
    fi
    
    SUCCESS=$((SUCCESS + 1))
    echo "✅ 完成"
done

# 处理PNG文件
for png in *.png; do
    [ ! -f "$png" ] && continue
    
    BASE_NAME="${png%.*}"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "处理: $png"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    ORIGINAL_WIDTH=$(identify -format "%w" "$png" 2>/dev/null)
    if [ -z "$ORIGINAL_WIDTH" ]; then
        echo "❌ 无法获取图片尺寸"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    echo "原始宽度: ${ORIGINAL_WIDTH}px"
    
    # 生成各尺寸
    if [ $ORIGINAL_WIDTH -gt 480 ]; then
        echo "  → 生成 480px 版本..."
        cwebp -resize 480 0 -q $QUALITY "$png" -o "${BASE_NAME}-480.webp" 2>&1 | tail -2
    fi
    
    if [ $ORIGINAL_WIDTH -gt 960 ]; then
        echo "  → 生成 960px 版本..."
        cwebp -resize 960 0 -q $QUALITY "$png" -o "${BASE_NAME}-960.webp" 2>&1 | tail -2
    fi
    
    if [ $ORIGINAL_WIDTH -gt 1440 ]; then
        echo "  → 生成 1440px 版本..."
        cwebp -resize 1440 0 -q $QUALITY "$png" -o "${BASE_NAME}-1440.webp" 2>&1 | tail -2
    fi
    
    MAIN_WEBP="${BASE_NAME}.webp"
    if [ ! -f "$MAIN_WEBP" ] || [ "$png" -nt "$MAIN_WEBP" ]; then
        echo "  → 生成原始尺寸版本..."
        cwebp -q $QUALITY "$png" -o "$MAIN_WEBP" 2>&1 | tail -2
    fi
    
    SUCCESS=$((SUCCESS + 1))
    echo "✅ 完成"
done

echo ""
echo "======================================"
echo "  生成完成"
echo "======================================"
echo ""
echo "📊 统计:"
echo "  - 成功: $SUCCESS 个文件"
echo "  - 失败: $FAILED 个文件"
echo ""
echo "📝 生成的文件:"
echo "  - *-480.webp  (手机)"
echo "  - *-960.webp  (平板)"
echo "  - *-1440.webp (电脑)"
echo "  - *.webp      (原始)"
echo ""
echo "🎯 下一步: 更新HTML使用响应式图片"
echo ""

