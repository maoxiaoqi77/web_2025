#!/bin/bash

# 批量压缩替换所有图片和视频
# 规则：
# 1. Slideshow的图片/视频 → webp格式压缩替换
# 2. 非slideshow的图片 → webp格式压缩替换
# 3. 非slideshow的视频 → mp4格式压缩替换

# set -e  # 不自动停止，允许记录错误后继续

cd "$(dirname "$0")"

QUALITY=60  # 压缩质量
BACKUP_DIR="backup_all_$(date +%Y%m%d_%H%M%S)"
REPORT_FILE="compression_report_$(date +%Y%m%d_%H%M%S).txt"
MISSING_FILE="missing_sources_$(date +%Y%m%d_%H%M%S).txt"

echo "======================================"
echo "  批量压缩所有图片和视频"
echo "======================================"
echo ""
echo "质量: $QUALITY"
echo "备份目录: $BACKUP_DIR"
echo "报告文件: $REPORT_FILE"
echo ""

mkdir -p "$BACKUP_DIR"

# 初始化统计
TOTAL_FILES=0
SUCCESS_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0
MISSING_COUNT=0
TOTAL_SAVED=0

# 初始化报告
echo "压缩报告 - $(date)" > "$REPORT_FILE"
echo "======================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "缺失源文件列表 - $(date)" > "$MISSING_FILE"
echo "======================================" >> "$MISSING_FILE"
echo "" >> "$MISSING_FILE"

# 函数：查找源文件
find_source_file() {
    local webp_file="$1"
    local dir=$(dirname "$webp_file")
    local basename=$(basename "$webp_file" .webp)
    
    # 可能的源文件扩展名
    local extensions=("jpg" "jpeg" "JPG" "JPEG" "png" "PNG" "tif" "tiff" "TIF" "TIFF")
    
    for ext in "${extensions[@]}"; do
        local source="$dir/$basename.$ext"
        if [ -f "$source" ]; then
            echo "$source"
            return 0
        fi
    done
    
    return 1
}

# 函数：查找视频源文件
find_video_source() {
    local webp_file="$1"
    local dir=$(dirname "$webp_file")
    local basename=$(basename "$webp_file" .webp)
    
    # 查找mp4源文件
    local mp4_source="$dir/$basename.mp4"
    if [ -f "$mp4_source" ]; then
        echo "$mp4_source"
        return 0
    fi
    
    # 查找其他视频格式
    local video_exts=("mov" "MOV" "avi" "AVI" "mkv" "MKV")
    for ext in "${video_exts[@]}"; do
        local source="$dir/$basename.$ext"
        if [ -f "$source" ]; then
            echo "$source"
            return 0
        fi
    done
    
    return 1
}

# 函数：压缩图片为webp
compress_image_to_webp() {
    local source="$1"
    local target="$2"
    local quality="$3"
    
    echo "  压缩: $(basename "$source") → $(basename "$target")"
    
    # 备份原文件
    if [ -f "$target" ]; then
        local backup_path="$BACKUP_DIR/$(dirname "$target")"
        mkdir -p "$backup_path"
        cp "$target" "$backup_path/"
        local old_size=$(stat -f%z "$target" 2>/dev/null || stat -c%s "$target")
    else
        local old_size=0
    fi
    
    # 生成新webp
    local temp_file="${target}.tmp"
    cwebp -q $quality "$source" -o "$temp_file" 2>&1 | grep -E "(Saving|Error)" || true
    
    if [ $? -eq 0 ] && [ -f "$temp_file" ]; then
        local new_size=$(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file")
        
        # 判断是否更小或者是新文件
        if [ $old_size -eq 0 ] || [ $new_size -lt $old_size ]; then
            mv "$temp_file" "$target"
            
            if [ $old_size -gt 0 ]; then
                local saved=$((old_size - new_size))
                TOTAL_SAVED=$((TOTAL_SAVED + saved))
                local saved_kb=$((saved / 1024))
                echo "    ✓ 节省 ${saved_kb}KB"
                echo "✓ $target (节省 ${saved_kb}KB)" >> "$REPORT_FILE"
            else
                echo "    ✓ 新生成"
                echo "✓ $target (新生成)" >> "$REPORT_FILE"
            fi
            return 0
        else
            rm "$temp_file"
            echo "    ⚠ 新文件更大，保留原文件"
            echo "⚠ $target (新文件更大)" >> "$REPORT_FILE"
            return 1
        fi
    else
        rm -f "$temp_file"
        echo "    ✗ 压缩失败"
        echo "✗ $target (压缩失败)" >> "$REPORT_FILE"
        return 2
    fi
}

# 函数：压缩视频为webp（动画）
compress_video_to_webp() {
    local source="$1"
    local target="$2"
    local quality="$3"
    
    echo "  转换视频: $(basename "$source") → $(basename "$target")"
    
    # 备份原文件
    if [ -f "$target" ]; then
        local backup_path="$BACKUP_DIR/$(dirname "$target")"
        mkdir -p "$backup_path"
        cp "$target" "$backup_path/"
        local old_size=$(stat -f%z "$target" 2>/dev/null || stat -c%s "$target")
    else
        local old_size=0
    fi
    
    # 使用ffmpeg转换
    local temp_file="${target}.tmp"
    ffmpeg -i "$source" -vcodec libwebp_anim -lossless 0 -compression_level 6 -quality $quality -loop 0 "$temp_file" -y 2>&1 | grep -E "(Output|error)" || true
    
    if [ -f "$temp_file" ]; then
        local new_size=$(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file")
        
        if [ $old_size -eq 0 ] || [ $new_size -lt $old_size ]; then
            mv "$temp_file" "$target"
            
            if [ $old_size -gt 0 ]; then
                local saved=$((old_size - new_size))
                TOTAL_SAVED=$((TOTAL_SAVED + saved))
                local saved_mb=$(echo "scale=1; $saved / 1024 / 1024" | bc)
                echo "    ✓ 节省 ${saved_mb}MB"
                echo "✓ $target (节省 ${saved_mb}MB)" >> "$REPORT_FILE"
            else
                echo "    ✓ 新生成"
                echo "✓ $target (新生成)" >> "$REPORT_FILE"
            fi
            return 0
        else
            rm "$temp_file"
            echo "    ⚠ 新文件更大，保留原文件"
            echo "⚠ $target (新文件更大)" >> "$REPORT_FILE"
            return 1
        fi
    else
        echo "    ✗ 转换失败"
        echo "✗ $target (转换失败)" >> "$REPORT_FILE"
        return 2
    fi
}

# 函数：压缩mp4视频
compress_mp4_video() {
    local source="$1"
    local target="$2"
    
    echo "  压缩MP4: $(basename "$source")"
    
    # 备份原文件
    if [ -f "$target" ]; then
        local backup_path="$BACKUP_DIR/$(dirname "$target")"
        mkdir -p "$backup_path"
        cp "$target" "$backup_path/"
        local old_size=$(stat -f%z "$target" 2>/dev/null || stat -c%s "$target")
    else
        local old_size=0
    fi
    
    # 压缩mp4
    local temp_file="${target}.tmp"
    ffmpeg -i "$source" -vcodec libx264 -crf 28 -preset medium -acodec aac -b:a 128k "$temp_file" -y 2>&1 | grep -E "(Output|error)" || true
    
    if [ -f "$temp_file" ]; then
        local new_size=$(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file")
        
        if [ $old_size -eq 0 ] || [ $new_size -lt $old_size ]; then
            mv "$temp_file" "$target"
            
            if [ $old_size -gt 0 ]; then
                local saved=$((old_size - new_size))
                TOTAL_SAVED=$((TOTAL_SAVED + saved))
                local saved_mb=$(echo "scale=1; $saved / 1024 / 1024" | bc)
                echo "    ✓ 节省 ${saved_mb}MB"
                echo "✓ $target (节省 ${saved_mb}MB)" >> "$REPORT_FILE"
            else
                echo "    ✓ 新生成"
                echo "✓ $target (新生成)" >> "$REPORT_FILE"
            fi
            return 0
        else
            rm "$temp_file"
            echo "    ⚠ 新文件更大，保留原文件"
            echo "⚠ $target (新文件更大)" >> "$REPORT_FILE"
            return 1
        fi
    else
        rm -f "$temp_file"
        echo "    ✗ 压缩失败"
        echo "✗ $target (压缩失败)" >> "$REPORT_FILE"
        return 2
    fi
}

echo "正在扫描images目录..."
echo ""

# 处理所有SLIDESHOW目录中的webp文件
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "第1步: 处理Slideshow的图片和视频"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

find images -type f -path "*/SLIDESHOW/*.webp" -o -path "*/slideshow/*.webp" -o -path "*slide show*.webp" 2>/dev/null | while read webp_file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    echo "[$TOTAL_FILES] 处理: $webp_file"
    
    # 先查找图片源文件
    source_file=$(find_source_file "$webp_file")
    
    if [ -n "$source_file" ]; then
        # 找到图片源文件
        if compress_image_to_webp "$source_file" "$webp_file" $QUALITY; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        fi
    else
        # 没找到图片，尝试查找视频源文件
        video_source=$(find_video_source "$webp_file")
        
        if [ -n "$video_source" ]; then
            # 找到视频源文件，转换为动画webp
            if compress_video_to_webp "$video_source" "$webp_file" $QUALITY; then
                SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            else
                SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
            fi
        else
            # 完全找不到源文件
            echo "    ✗ 找不到源文件"
            echo "$webp_file" >> "$MISSING_FILE"
            echo "✗ $webp_file (找不到源文件)" >> "$REPORT_FILE"
            MISSING_COUNT=$((MISSING_COUNT + 1))
        fi
    fi
    
    echo ""
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "第2步: 处理非Slideshow的图片"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 处理非SLIDESHOW目录中的webp文件（排除已处理的）
find images -type f -name "*.webp" | grep -v -i "slideshow" | while read webp_file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    echo "[$TOTAL_FILES] 处理: $webp_file"
    
    source_file=$(find_source_file "$webp_file")
    
    if [ -n "$source_file" ]; then
        if compress_image_to_webp "$source_file" "$webp_file" $QUALITY; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        fi
    else
        echo "    ✗ 找不到源文件"
        echo "$webp_file" >> "$MISSING_FILE"
        echo "✗ $webp_file (找不到源文件)" >> "$REPORT_FILE"
        MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
    
    echo ""
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "第3步: 处理非Slideshow的视频(mp4)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 处理非SLIDESHOW目录中的mp4文件
find images -type f -name "*.mp4" | grep -v -i "slideshow" | while read mp4_file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    echo "[$TOTAL_FILES] 处理: $mp4_file"
    
    # MP4的源文件可能是自己或者更高质量的版本
    dir=$(dirname "$mp4_file")
    basename=$(basename "$mp4_file" .mp4)
    
    # 查找可能的源文件
    source_found=false
    for suffix in "_original" "_source" "_raw" ""; do
        for ext in "mov" "MOV" "avi" "AVI" "mkv" "MKV"; do
            source="$dir/${basename}${suffix}.$ext"
            if [ -f "$source" ]; then
                if compress_mp4_video "$source" "$mp4_file"; then
                    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
                else
                    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
                fi
                source_found=true
                break 2
            fi
        done
    done
    
    if [ "$source_found" = false ]; then
        # 没找到其他格式的源文件，尝试压缩自己
        if [ -f "$mp4_file" ]; then
            # 检查是否有_compressed标记
            if [[ ! "$basename" =~ _compressed ]]; then
                echo "  使用自身作为源文件压缩"
                temp_source="${mp4_file}.source"
                cp "$mp4_file" "$temp_source"
                if compress_mp4_video "$temp_source" "$mp4_file"; then
                    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
                else
                    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
                fi
                rm "$temp_source"
            else
                echo "    ⚠ 已经是压缩版本，跳过"
                SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
            fi
        else
            echo "    ✗ 找不到源文件"
            echo "$mp4_file" >> "$MISSING_FILE"
            echo "✗ $mp4_file (找不到源文件)" >> "$REPORT_FILE"
            MISSING_COUNT=$((MISSING_COUNT + 1))
        fi
    fi
    
    echo ""
done

# 生成最终报告
echo "" >> "$REPORT_FILE"
echo "======================================" >> "$REPORT_FILE"
echo "统计信息" >> "$REPORT_FILE"
echo "======================================" >> "$REPORT_FILE"
echo "总文件数: $TOTAL_FILES" >> "$REPORT_FILE"
echo "成功: $SUCCESS_COUNT" >> "$REPORT_FILE"
echo "跳过: $SKIPPED_COUNT" >> "$REPORT_FILE"
echo "失败: $FAILED_COUNT" >> "$REPORT_FILE"
echo "缺失源文件: $MISSING_COUNT" >> "$REPORT_FILE"
if [ $TOTAL_SAVED -gt 0 ]; then
    SAVED_MB=$(echo "scale=1; $TOTAL_SAVED / 1024 / 1024" | bc)
    echo "总节省: ${SAVED_MB}MB" >> "$REPORT_FILE"
fi

echo ""
echo "======================================"
echo "  处理完成"
echo "======================================"
echo ""
echo "📊 统计:"
echo "  - 总文件数: $TOTAL_FILES"
echo "  - 成功: $SUCCESS_COUNT"
echo "  - 跳过: $SKIPPED_COUNT"  
echo "  - 失败: $FAILED_COUNT"
echo "  - 缺失源文件: $MISSING_COUNT"
if [ $TOTAL_SAVED -gt 0 ]; then
    SAVED_MB=$(echo "scale=1; $TOTAL_SAVED / 1024 / 1024" | bc)
    echo "  - 总节省: ${SAVED_MB}MB"
fi
echo ""
echo "📄 详细报告: $REPORT_FILE"
if [ $MISSING_COUNT -gt 0 ]; then
    echo "⚠️  缺失源文件列表: $MISSING_FILE"
    echo ""
    echo "请检查以下文件的源文件:"
    cat "$MISSING_FILE"
fi
echo ""
echo "💾 备份位置: $BACKUP_DIR"
echo ""

