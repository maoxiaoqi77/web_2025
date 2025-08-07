#!/bin/bash

# 更新top页面的slideshow，使用images/02top/slide show目录中的图片和视频
# 此脚本会修改index.html文件，更新slideshow部分

echo "开始更新top页面的slideshow..."

# 备份原始文件
cp index.html index.html.bak

# 创建新的slideshow HTML内容
SLIDESHOW_HTML=$(cat << 'EOL'
        <!-- Slider -->
        <div class="slider">
            <div class="slides">
                <div class="slide active">
                    <img src="images/02top/slide show/001_2021_webpic_IMG_5824_02.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/002_2526_webpic_slideshow_sketch_aoikoya_basic.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/003_2523_webpic_slidshow_IMG_5384.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/004_2527_webvideo_stillsignwithwater.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/005_2021_webpic_IMG_6367.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/006_2527_webvideo_sound_of_a_kettle.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/007_2524_webvideo_003.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/008_2523_webpic_slidshow_IMG_3628.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/009_2524_webvideo_004.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/010_2236_webpic_slidshow_IMG_3602_installation_000.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/011_2524_webvideo_005.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/012_2524_webvideo_018.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/012_NTIG_3.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/013_2523_webpic_slidshow_IMG_1510_02.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/014_2526_webpic_slideshow_IMG_1115.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/015_2521_webpic_IMG_9146.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/016_2320_ig_charsingalittlepast_openart_01.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/017_2527_webpic_slideshow_IMG_0757_04.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/018_2527_webvideo_soundogdog.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
                <div class="slide">
                    <img src="images/02top/slide show/019_2521_webpic_IMG_9145.webp" alt="KIYOMI+TETSUHIRO UOZUMI Artwork">
                </div>
            </div>
            <button class="slider-nav prev">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="slider-nav next">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
EOL
)

# 替换index.html中的slideshow部分
sed -i '' '/<div class="slider">/,/<\/div>.*<section class="news">/c\
'"$SLIDESHOW_HTML"'\

        <section class="news">' index.html

echo "更新完成！" 