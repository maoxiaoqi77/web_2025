#!/bin/bash

# 处理特殊情况下的jpg到webp替换
# 作者：Claude
# 日期：2023-08-07

echo "开始处理特殊情况下的jpg到webp替换..."

# 备份所有HTML文件
echo "备份所有HTML文件..."
mkdir -p backups-special
cp installation/*.html backups-special/

# 处理chasing-little-pasts-tws.html文件中的图片引用
echo "处理chasing-little-pasts-tws.html文件中的图片引用..."
sed -i '' 's|/1934_ipad_IMG_\([0-9]*\)\.jpg|/1934_ipad_IMG_\1.webp|g' installation/chasing-little-pasts-tws.html

# 处理sculpture.html中的03_2527_webpic_slideshow_IMG_0757_04.jpg
echo "处理sculpture.html中的03_2527_webpic_slideshow_IMG_0757_04.jpg..."
sed -i '' 's|03_2527_webpic_slideshow_IMG_0757_04\.jpg|03_2527_webpic_slideshow_IMG_0757_04.webp|g' sculpture.html

# 删除已替换的jpg文件
echo "删除已替换的jpg文件..."

# 删除charsing_little_pasts_TWS目录中的jpg文件
echo "删除charsing_little_pasts_TWS目录中的jpg文件..."
rm -f "images/02installation/02_027_charsing_little_pasts_TWS /1934_ipad_IMG_"*.jpg
rm -f "images/02installation/02_027_charsing_little_pasts_TWS /00_2236_webpic_IMG_1890_installation_000.jpg"

# 删除sculpture目录中的03_2527_webpic_slideshow_IMG_0757_04.jpg
echo "删除sculpture目录中的03_2527_webpic_slideshow_IMG_0757_04.jpg..."
rm -f images/02sculpture/00_SLIDESHOW/03_2527_webpic_slideshow_IMG_0757_04.jpg

echo "处理完成!" 