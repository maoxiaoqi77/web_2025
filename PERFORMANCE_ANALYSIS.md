# 网站性能分析报告

## 主要问题

### 1. Installation页面 (8.11秒, 23.9MB)
- **问题**：Slideshow文件夹总大小79MB，单个文件最大9.3MB
- **影响**：虽然使用了lazy loading，但首张图片1.5MB仍需较长加载时间
- **最大文件**：
  - 2524_webvideo_019.webp: 9.3MB
  - 2524_webvideo_014.webp: 8.6MB
  - 2524_webvideo_013.webp: 8.1MB
  - 2524_webvideo_011.webp: 5.9MB
  - 2524_webvideo_002.webp: 5.1MB
  - 2524_webvideo_007.webp: 5.1MB

### 2. Top页面 (2.07秒, 1.7MB)
- **问题**：部分slideshow视频webp文件过大
- **最大文件**：
  - 009_2524_webvideo_004.webp: 9.1MB
  - 006_2527_webvideo_sound_of_a_kettle.webp: 4.6MB

### 3. Project页面 (3.56秒, 3.7MB)
- **状态**：图片大小合理（100-500KB）
- **优化**：已移除视频poster，使用浏览器自动显示第一帧

### 4. Drawing页面 (1.51秒, 4.2MB)
- **状态**：图片大小合理（100-860KB）
- **优化**：已有118个lazy loading

## 已完成的优化

### ✅ 1. Project页面视频优化
- 移除poster属性，让浏览器自动显示视频第一帧
- 减少额外图片请求

### ✅ 2. Installation详情页优化
- 为所有15个installation详情页添加智能poster查找逻辑
- 为非首屏图片添加loading="lazy"
- 第一张图片添加fetchpriority="high"
- 第4张及以后的图片添加lazy loading

### ✅ 3. Slideshow Lazy Loading
- 所有主页面的slideshow已使用data-src进行lazy loading
- 只有第一张图片使用src立即加载
- 其他图片等待用户浏览时再加载

## 需要压缩的文件

### 高优先级（>5MB）
\`\`\`bash
# Installation slideshow
images/02installation/00_SLIDESHOW/2524_webvideo_019.webp  (9.3MB)
images/02installation/00_SLIDESHOW/2524_webvideo_014.webp  (8.6MB)
images/02installation/00_SLIDESHOW/2524_webvideo_013.webp  (8.1MB)
images/02installation/00_SLIDESHOW/2524_webvideo_011.webp  (5.9MB)
images/02installation/00_SLIDESHOW/2524_webvideo_002.webp  (5.1MB)
images/02installation/00_SLIDESHOW/2524_webvideo_007.webp  (5.1MB)

# Top slideshow
images/02top/slide\ show/009_2524_webvideo_004.webp  (9.1MB)
images/02top/slide\ show/006_2527_webvideo_sound_of_a_kettle.webp  (4.6MB)
\`\`\`

### 中优先级（2-5MB）
\`\`\`bash
# Installation slideshow
images/02installation/00_SLIDESHOW/2524_webvideo_001.webp  (4.1MB)
images/02installation/00_SLIDESHOW/2524_webvideo_012.webp  (3.9MB)
images/02installation/00_SLIDESHOW/2524_webvideo_017.webp  (2.8MB)
images/02installation/00_SLIDESHOW/2524_webvideo_003.webp  (2.2MB)
images/02installation/00_SLIDESHOW/2524_webvideo_006.webp  (2.5MB)
images/02installation/00_SLIDESHOW/2524_webvideo_016.webp  (3.1MB)
images/02installation/00_SLIDESHOW/2524_webvideo_018.webp  (4.6MB)
images/02installation/00_SLIDESHOW/2524_webvideo_015.webp  (5.0MB)
images/02installation/00_SLIDESHOW/2541_webvideo_007.webp  (3.9MB)
\`\`\`

## 压缩建议

### 方案1：使用cwebp批量压缩
\`\`\`bash
# 进入项目目录
cd /Users/maoxiaoqi/Desktop/网页/web-2025

# 压缩单个文件示例
cwebp -q 70 images/02installation/00_SLIDESHOW/2524_webvideo_019.webp -o images/02installation/00_SLIDESHOW/2524_webvideo_019_compressed.webp

# 批量压缩所有大于2MB的文件
find images/02installation/00_SLIDESHOW -name "*.webp" -size +2M -exec sh -c '
  for file do
    echo "压缩: $file"
    cwebp -q 70 "$file" -o "${file%.webp}_temp.webp"
    if [ -f "${file%.webp}_temp.webp" ]; then
      mv "${file%.webp}_temp.webp" "$file"
    fi
  done
' sh {} +
\`\`\`

### 方案2：使用ffmpeg重新生成动画webp
\`\`\`bash
# 如果还有原始视频文件，可以用更低的质量重新生成
ffmpeg -i input.mp4 -vcodec libwebp_anim -quality 60 -loop 0 output.webp
\`\`\`

## 预期效果

### 压缩后（quality=70）
- 9.3MB → 约3-4MB（减少60-70%）
- 8.6MB → 约3MB
- 8.1MB → 约3MB
- Installation slideshow总大小：79MB → 约30-35MB

### 页面加载改善
- Installation页面：8.11秒 → 约3-4秒
- Top页面：2.07秒 → 约1秒
- 首屏感知速度：显著提升

## 其他优化建议

### 1. 进一步优化script.js
- 延迟预加载下一张图片（当前是立即预加载）
- 只在用户停留在slideshow页面时才预加载

### 2. 考虑使用视频poster
- 为动画webp创建静态封面图（约50-100KB）
- 用户点击或自动播放时才加载动画

### 3. 启用服务器压缩
- 在.htaccess中启用gzip/brotli压缩
- 可以进一步减少20-30%的传输大小

### 4. CDN加速（可选）
- 将图片资源迁移到CDN
- 利用CDN的边缘节点加速全球访问

