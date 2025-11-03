#!/bin/bash
# 快速验证脚本

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              🔍 快速验证所有优化功能                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. 检查响应式图片
echo "1️⃣  响应式图片:"
if [ -d "images/_responsive" ]; then
    echo "   ✅ 目录存在: $(du -sh images/_responsive/ 2>/dev/null | cut -f1)"
else
    echo "   ❌ 目录不存在"
fi

# 2. 检查HTML转换
echo ""
echo "2️⃣  HTML转换 (<picture>标签):"
total=0
for file in index.html installation.html sculpture.html drawing.html project.html; do
    count=$(grep -c "<picture>" $file 2>/dev/null || echo 0)
    total=$((total + count))
    echo "   ✓ $file: $count 个"
done
echo "   总计: $total 个picture标签"

# 3. 检查骨架屏集成
echo ""
echo "3️⃣  骨架屏集成:"
css_count=0
js_count=0
for file in index.html installation.html sculpture.html drawing.html project.html; do
    if grep -q "skeleton.css" $file 2>/dev/null && grep -q "skeleton.js" $file 2>/dev/null; then
        echo "   ✅ $file"
        css_count=$((css_count + 1))
    else
        echo "   ❌ $file"
    fi
done
echo "   已集成: $css_count/5 个页面"

# 4. 检查JavaScript
echo ""
echo "4️⃣  JavaScript语法:"
if node -c js/skeleton.js 2>/dev/null; then
    echo "   ✅ skeleton.js 无错误"
else
    echo "   ❌ skeleton.js 有错误"
fi

if node -c js/script.js 2>/dev/null; then
    echo "   ✅ script.js 无错误"
else
    echo "   ❌ script.js 有错误"
fi

# 5. 检查服务器配置
echo ""
echo "5️⃣  服务器配置:"
if [ -f ".htaccess" ]; then
    echo "   ✅ .htaccess 存在"
else
    echo "   ❌ .htaccess 不存在"
fi

if [ -f "nginx.conf.example" ]; then
    echo "   ✅ nginx.conf.example 存在"
else
    echo "   ❌ nginx.conf.example 不存在"
fi

# 6. 检查预加载优化器
echo ""
echo "6️⃣  智能预加载优化器:"
if [ -f "js/preload-optimizer.js" ]; then
    echo "   ✅ preload-optimizer.js 存在"
    if node -c js/preload-optimizer.js 2>/dev/null; then
        echo "   ✅ 语法正确"
    else
        echo "   ❌ 语法错误"
    fi
else
    echo "   ❌ preload-optimizer.js 不存在"
fi

preload_count=0
for file in index.html installation.html sculpture.html drawing.html project.html; do
    if grep -q "preload-optimizer.js" $file 2>/dev/null; then
        preload_count=$((preload_count + 1))
    fi
done
echo "   已集成: $preload_count/5 个页面"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 验证完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 快速测试："
echo "   python3 -m http.server 8000"
echo "   然后访问 http://localhost:8000"
echo ""
echo "💡 测试预加载效果："
echo "   1. 打开Console（F12）"
echo "   2. 等待2-3秒"
echo "   3. 观察预加载日志"
echo "   4. 点击导航 → 页面秒开！"
echo ""

