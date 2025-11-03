#!/bin/bash

# 从源文件重新生成WebP，如果更小则替换

if [ $# -lt 1 ]; then
    echo "用法: $0 <目录路径> [质量(默认75)]"
    exit 1
fi

DIR="$1"
QUALITY="${2:-75}"

echo "======================================"
echo "  从源文件重新生成WebP"
echo "======================================"
echo ""
echo "目录: $DIR"
echo "质量: $QUALITY"
echo ""

if [ ! -d "$DIR" ]; then
    echo "❌ 错误: 目录不存在"
    exit 1
fi

cd "$DIR" || exit 1

BACKUP_DIR="backup_originals_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

SUCCESS=0
SKIPPED=0
FAILED=0
TOTAL_SAVED=0

# 查找所有JPG文件
shopt -s nullglob
for jpg in *.jpg *.jpeg; do
    [ ! -f "$jpg" ] && continue
    
    # 生成对应的webp文件名
    webp="${jpg%.*}.webp"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "处理: $jpg"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检查源文件大小
    if [ ! -f "$jpg" ]; then
        echo "⚠️  源文件不存在，跳过"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    JPG_SIZE=$(stat -f%z "$jpg" 2>/dev/null || stat -c%s "$jpg")
    JPG_SIZE_MB=$(echo "scale=2; $JPG_SIZE / 1024 / 1024" | bc)
    echo "源JPG: ${JPG_SIZE_MB}MB"
    
    # 如果旧webp存在，记录其大小
    OLD_WEBP_SIZE=0
    if [ -f "$webp" ]; then
        OLD_WEBP_SIZE=$(stat -f%z "$webp" 2>/dev/null || stat -c%s "$webp")
        OLD_SIZE_MB=$(echo "scale=2; $OLD_WEBP_SIZE / 1024 / 1024" | bc)
        echo "旧WebP: ${OLD_SIZE_MB}MB"
        
        # 备份旧webp
        cp "$webp" "$BACKUP_DIR/"
    else
        echo "旧WebP: 不存在"
    fi
    
    # 生成新webp
    echo "生成新WebP (质量$QUALITY)..."
    NEW_WEBP="${jpg%.*}_new.webp"
    cwebp -q $QUALITY "$jpg" -o "$NEW_WEBP" 2>&1 | tail -5
    
    if [ $? -eq 0 ] && [ -f "$NEW_WEBP" ]; then
        NEW_SIZE=$(stat -f%z "$NEW_WEBP" 2>/dev/null || stat -c%s "$NEW_WEBP")
        NEW_SIZE_MB=$(echo "scale=2; $NEW_SIZE / 1024 / 1024" | bc)
        echo "新WebP: ${NEW_SIZE_MB}MB"
        
        # 判断是否应该替换
        SHOULD_REPLACE=false
        
        if [ $OLD_WEBP_SIZE -eq 0 ]; then
            # 旧文件不存在，直接使用新文件
            SHOULD_REPLACE=true
            echo "→ 旧文件不存在，使用新文件"
        elif [ $NEW_SIZE -lt $OLD_WEBP_SIZE ]; then
            # 新文件更小，替换
            SHOULD_REPLACE=true
            SAVED=$((OLD_WEBP_SIZE - NEW_SIZE))
            SAVED_MB=$(echo "scale=2; $SAVED / 1024 / 1024" | bc)
            PERCENT=$(echo "scale=1; $SAVED * 100 / $OLD_WEBP_SIZE" | bc)
            echo "→ 新文件更小，节省 ${SAVED_MB}MB (${PERCENT}%)"
            TOTAL_SAVED=$((TOTAL_SAVED + SAVED))
        else
            # 新文件更大或相同，不替换
            BIGGER=$((NEW_SIZE - OLD_WEBP_SIZE))
            BIGGER_MB=$(echo "scale=2; $BIGGER / 1024 / 1024" | bc)
            echo "→ 新文件更大 (+${BIGGER_MB}MB)，保留旧文件"
        fi
        
        if [ "$SHOULD_REPLACE" = true ]; then
            mv "$NEW_WEBP" "$webp"
            SUCCESS=$((SUCCESS + 1))
            echo "✅ 已替换"
        else
            rm "$NEW_WEBP"
            SKIPPED=$((SKIPPED + 1))
            echo "⚠️  已跳过"
        fi
    else
        echo "❌ 生成失败"
        FAILED=$((FAILED + 1))
        rm -f "$NEW_WEBP"
    fi
done

# 查找PNG文件
for png in *.png; do
    [ ! -f "$png" ] && continue
    
    webp="${png%.*}.webp"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "处理: $png"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    PNG_SIZE=$(stat -f%z "$png" 2>/dev/null || stat -c%s "$png")
    PNG_SIZE_MB=$(echo "scale=2; $PNG_SIZE / 1024 / 1024" | bc)
    echo "源PNG: ${PNG_SIZE_MB}MB"
    
    OLD_WEBP_SIZE=0
    if [ -f "$webp" ]; then
        OLD_WEBP_SIZE=$(stat -f%z "$webp" 2>/dev/null || stat -c%s "$webp")
        OLD_SIZE_MB=$(echo "scale=2; $OLD_WEBP_SIZE / 1024 / 1024" | bc)
        echo "旧WebP: ${OLD_SIZE_MB}MB"
        cp "$webp" "$BACKUP_DIR/"
    else
        echo "旧WebP: 不存在"
    fi
    
    echo "生成新WebP (质量$QUALITY)..."
    NEW_WEBP="${png%.*}_new.webp"
    cwebp -q $QUALITY "$png" -o "$NEW_WEBP" 2>&1 | tail -5
    
    if [ $? -eq 0 ] && [ -f "$NEW_WEBP" ]; then
        NEW_SIZE=$(stat -f%z "$NEW_WEBP" 2>/dev/null || stat -c%s "$NEW_WEBP")
        NEW_SIZE_MB=$(echo "scale=2; $NEW_SIZE / 1024 / 1024" | bc)
        echo "新WebP: ${NEW_SIZE_MB}MB"
        
        SHOULD_REPLACE=false
        
        if [ $OLD_WEBP_SIZE -eq 0 ]; then
            SHOULD_REPLACE=true
            echo "→ 旧文件不存在，使用新文件"
        elif [ $NEW_SIZE -lt $OLD_WEBP_SIZE ]; then
            SHOULD_REPLACE=true
            SAVED=$((OLD_WEBP_SIZE - NEW_SIZE))
            SAVED_MB=$(echo "scale=2; $SAVED / 1024 / 1024" | bc)
            PERCENT=$(echo "scale=1; $SAVED * 100 / $OLD_WEBP_SIZE" | bc)
            echo "→ 新文件更小，节省 ${SAVED_MB}MB (${PERCENT}%)"
            TOTAL_SAVED=$((TOTAL_SAVED + SAVED))
        else
            BIGGER=$((NEW_SIZE - OLD_WEBP_SIZE))
            BIGGER_MB=$(echo "scale=2; $BIGGER / 1024 / 1024" | bc)
            echo "→ 新文件更大 (+${BIGGER_MB}MB)，保留旧文件"
        fi
        
        if [ "$SHOULD_REPLACE" = true ]; then
            mv "$NEW_WEBP" "$webp"
            SUCCESS=$((SUCCESS + 1))
            echo "✅ 已替换"
        else
            rm "$NEW_WEBP"
            SKIPPED=$((SKIPPED + 1))
            echo "⚠️  已跳过"
        fi
    else
        echo "❌ 生成失败"
        FAILED=$((FAILED + 1))
        rm -f "$NEW_WEBP"
    fi
done

echo ""
echo "======================================"
echo "  处理完成"
echo "======================================"
echo ""
echo "📊 统计:"
echo "  - 成功替换: $SUCCESS"
echo "  - 跳过: $SKIPPED"
echo "  - 失败: $FAILED"
if [ $TOTAL_SAVED -gt 0 ]; then
    SAVED_MB=$(echo "scale=2; $TOTAL_SAVED / 1024 / 1024" | bc)
    echo "  - 总节省: ${SAVED_MB}MB"
fi
echo ""
echo "💾 备份位置: $DIR/$BACKUP_DIR"
echo ""

