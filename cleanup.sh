#!/bin/bash

# 清理脚本 - 安全删除不需要的文件
# 使用方法: ./cleanup.sh [--dry-run]

DRY_RUN=false
if [ "$1" == "--dry-run" ] || [ "$1" == "-n" ]; then
    DRY_RUN=true
    echo "🔍 干运行模式（只显示将要删除的内容，不实际删除）"
    echo ""
fi

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  文件清理脚本                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_SAVED=0

# 函数：删除目录
delete_dir() {
    local dir="$1"
    local desc="$2"
    
    if [ -d "$dir" ]; then
        local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "🗑️  $desc: $dir ($size)"
        
        if [ "$DRY_RUN" = false ]; then
            rm -rf "$dir"
            echo "   ✅ 已删除"
        else
            echo "   [干运行] 将删除"
        fi
        echo ""
    fi
}

# 函数：删除文件
delete_file() {
    local file="$1"
    local desc="$2"
    
    if [ -f "$file" ]; then
        local size=$(ls -lh "$file" 2>/dev/null | awk '{print $5}')
        echo "🗑️  $desc: $file ($size)"
        
        if [ "$DRY_RUN" = false ]; then
            rm -f "$file"
            echo "   ✅ 已删除"
        else
            echo "   [干运行] 将删除"
        fi
        echo ""
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. 删除备份目录（最大空间）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for dir in backup_all_* images_backup_*; do
    if [ -d "$dir" ]; then
        delete_dir "$dir" "备份目录"
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  2. 删除临时目录"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for dir in temp_frames_*; do
    if [ -d "$dir" ]; then
        delete_dir "$dir" "临时目录"
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  3. 删除日志目录"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

delete_dir "logs" "日志目录"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  4. 删除Node.js依赖（如果不需要在服务器运行npm）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

delete_dir "node_modules" "Node.js依赖"
delete_file "package-lock.json" "依赖锁定文件"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  5. （可选）删除文档文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DRY_RUN" = false ]; then
    read -p "   是否删除所有.md文档文件？(y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find . -maxdepth 1 -name "*.md" -type f ! -name "README.md" -exec rm -f {} \;
        echo "   ✅ 已删除文档文件"
    else
        echo "   ⊘ 跳过"
    fi
else
    echo "   [干运行] 可以删除的文档："
    find . -maxdepth 1 -name "*.md" -type f ! -name "README.md" 2>/dev/null | while read file; do
        echo "      - $(basename $file)"
    done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  6. （可选）删除工具脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DRY_RUN" = false ]; then
    read -p "   是否删除工具脚本（tools/, *.sh, *.py）？(y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf tools/
        find . -maxdepth 1 -name "*.sh" -type f ! -name "cleanup.sh" -exec rm -f {} \;
        find . -maxdepth 1 -name "*.py" -type f -exec rm -f {} \;
        find . -maxdepth 1 -name "optimize-*.js" -type f -exec rm -f {} \;
        echo "   ✅ 已删除工具脚本"
    else
        echo "   ⊘ 跳过"
    fi
else
    echo "   [干运行] 可以删除的工具："
    [ -d "tools" ] && echo "      - tools/ 目录"
    find . -maxdepth 1 -name "*.sh" -type f ! -name "cleanup.sh" 2>/dev/null | while read file; do
        echo "      - $(basename $file)"
    done
    find . -maxdepth 1 -name "*.py" -type f 2>/dev/null | while read file; do
        echo "      - $(basename $file)"
    done
    find . -maxdepth 1 -name "optimize-*.js" -type f 2>/dev/null | while read file; do
        echo "      - $(basename $file)"
    done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  7. 删除系统文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

delete_file ".DS_Store" "macOS系统文件"
delete_file ".Rhistory" "R语言历史文件"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  清理完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔍 这是干运行模式，没有实际删除任何文件"
    echo ""
    echo "要实际删除，请运行:"
    echo "  ./cleanup.sh"
    echo ""
else
    echo "✅ 清理完成！"
    echo ""
    echo "💡 提示："
    echo "   - 备份目录已删除（如果存在）"
    echo "   - 临时文件已清理"
    echo "   - 建议测试网站确保一切正常"
    echo ""
fi

echo "📋 保留的重要文件："
echo "   ✅ 所有 .html 文件"
echo "   ✅ css/ 目录"
echo "   ✅ js/ 目录"
echo "   ✅ images/ 目录（包括 _responsive/）"
echo "   ✅ installation/ 目录"
echo "   ✅ .htaccess"
echo ""

