#!/bin/bash
# 批量移除drawing.html中gallery-item的1600w引用

sed -i '' \
  -e 's/-1600\.webp 1600w, //g' \
  -e 's/sizes="(max-width: 768px) 100vw, (max-width: 1200px) 960px, 1600px"/sizes="(max-width: 768px) 100vw, 960px"/g' \
  drawing.html

# 为所有gallery-item的img添加data-original-src属性（保存原图路径用于lightbox）
# 这个需要更复杂的处理，用Python
python3 << 'PYEOF'
import re

with open('drawing.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 移除所有1600w引用（如果还没移除）
html = re.sub(r'-1600\.webp 1600w,\s*', '', html)
html = re.sub(r'sizes="\(max-width: 768px\) 100vw, \(max-width: 1200px\) 960px, 1600px"', 'sizes="(max-width: 768px) 100vw, 960px"', html)

# 为gallery-item的img添加data-original-src
def add_original_src(match):
    img_tag = match.group(0)
    # 从src中提取原图路径
    src_match = re.search(r'src="([^"]+)"', img_tag)
    if src_match and 'data-original-src' not in img_tag:
        original_src = src_match.group(1)
        # 在alt后面添加data-original-src
        img_tag = re.sub(r'(alt="[^"]*")', r'\1 data-original-src="' + original_src + '"', img_tag)
    return img_tag

# 只处理gallery-item内的img
html = re.sub(
    r'(<div class="gallery-item">.*?<img[^>]*?>)',
    add_original_src,
    html,
    flags=re.DOTALL
)

with open('drawing.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ 已修复drawing.html')
PYEOF

