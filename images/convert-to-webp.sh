#!/bin/bash

# 创建 webp 输出文件夹
mkdir -p webp-output

# 遍历 jpg、jpeg、png 文件
for img in *.jpg *.jpeg *.png; do
  if [ -f "$img" ]; then
    filename=$(basename "$img")
    name="${filename%.*}"
    cwebp "$img" -q 80 -o "webp-output/$name.webp"
    echo "转换完成: $img -> webp-output/$name.webp"
  fi
done


