#!/bin/bash

# 快速测试脚本 - 只压缩一个小文件测试

cd "$(dirname "$0")"

echo "======================================"
echo "  快速测试压缩"
echo "======================================"
echo ""
echo "压缩一个较小的文件测试（2MB）..."
echo ""

./compress-one-webp.sh "images/02installation/00_SLIDESHOW/2524_webvideo_008.webp" 60

echo ""
echo "======================================"
echo "  测试完成"
echo "======================================"
echo ""
echo "📝 如果压缩成功且效果满意："
echo "   可以运行: ./batch-compress.sh"
echo "   批量压缩所有文件"
echo ""

