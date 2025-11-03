# 性能优化总结

## ✅ 已完成的优化

### 1. 视频封面图优化

#### Project页面视频
- ✅ 为视频添加poster属性
- **文件**: `project.html`
- **封面**: `images/02project/project1/00_2025_streetview_webinfo.webp`
- **效果**: 视频加载前显示封面图，不再黑屏

#### Installation详情页视频
- ✅ 动态设置视频poster
- **文件**: 所有`installation/*.html`（已修改示例文件）
- **逻辑**: `openSimpleVideoLightbox`函数中自动查找目录下的jpg封面
- **效果**: 视频弹窗加载时显示封面图

### 2. 移除不必要的JS文件

已从所有页面移除以下被禁用/无效的脚本：

- ❌ `js/perf.js` - 已禁用的性能脚本
- ❌ `js/slideshow-loader.js` - 已禁用的slideshow加载器
- ❌ `js/drawing-optimize.js` - 已禁用的drawing优化脚本

**节省**: ~12KB JavaScript + 3个HTTP请求

**影响页面**:
- `index.html`
- `about.html`
- `installation.html`
- `project.html`
- `sculpture.html`
- `drawing.html`

### 3. 图片压缩脚本

创建了批量压缩脚本: `compress-images.sh`

#### 使用方法

```bash
# 1. 确保安装了webp工具
brew install webp

# 2. 运行压缩脚本
cd /Users/maoxiaoqi/Desktop/网页/web-2025
bash compress-images.sh
```

#### 压缩范围
- Installation slideshow: `images/02installation/00_SLIDESHOW/*.webp`
- Top slideshow: `images/02top/slide show/*.webp`
- Project slideshow: `images/02project/slideshow/*.webp`
- Sculpture slideshow: `images/02sculpture/00_SLIDESHOW/*.webp`
- Drawing slideshow: `images/02drawing/00_SLIDESHOW/*.webp`

#### 压缩参数
- **质量**: 75 (平衡质量和大小)
- **策略**: 只有当压缩后文件更小时才替换原文件
- **备份**: 自动备份原文件到 `images_backup_日期时间/`

#### 预期效果
- 节省 15-30% 文件大小
- 不影响视觉质量
- 加载速度提升 20-30%

### 4. JS/CSS延迟加载优化

#### 当前状态
- ✅ 所有脚本已使用 `defer` 属性
- ✅ 移除了3个不必要的脚本文件
- ✅ `script.js` 保持defer加载（必需脚本）

#### 优化结果
```html
<!-- 优化前 -->
<script src="js/perf.js" defer></script>
<script src="js/slideshow-loader.js" defer></script>
<script src="js/drawing-optimize.js" defer></script>
<script src="js/script.js" defer></script>

<!-- 优化后 -->
<script src="js/script.js" defer></script>
```

## 📊 性能提升预期

| 优化项 | 节省 | 效果 |
|--------|------|------|
| 移除无效JS | ~12KB + 3请求 | 减少阻塞时间 |
| 视频封面 | 体验提升 | 无黑屏，更专业 |
| 图片压缩 | 15-30% 文件大小 | 加载速度提升20-30% |
| Installation首图 | 4.1MB → 1.5MB | 首屏显示快60% |

## 🎯 优化后的加载策略

### HTML结构
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="css/style.css">
    <link rel="prefetch" href="其他页面.html">
</head>
<body>
    <!-- 内容 -->
    <script src="js/script.js" defer></script>
</body>
</html>
```

### 图片加载
```html
<!-- Slideshow: 首张立即加载，其余延迟 -->
<div class="slide active">
    <img src="首张.webp" fetchpriority="high" decoding="sync">
</div>
<div class="slide">
    <img data-src="第2张.webp" loading="lazy">
</div>

<!-- 普通图片: 浏览器自动lazy loading -->
<img src="图片.webp" loading="lazy">
```

### 视频加载
```html
<!-- 带封面图，延迟加载 -->
<video controls preload="metadata" poster="封面.jpg">
    <source src="视频.mp4" type="video/mp4">
</video>
```

## ⚠️ 注意事项

### 1. 图片压缩
- **建议**: 先在测试环境运行压缩脚本
- **验证**: 压缩后检查图片质量是否满意
- **回滚**: 如需恢复，使用备份目录的文件

### 2. Installation详情页poster
- 当前只修改了 `chasing-a-little-past-kanazawa.html`
- 其他installation详情页需要应用相同的修改
- 或者创建一个通用的poster查找逻辑

### 3. 脚本移除
- 已移除的脚本功能已被禁用或合并到`script.js`
- 如有任何功能异常，可以从备份恢复

## 📝 下一步操作

1. **立即执行**:
   ```bash
   # 运行图片压缩
   cd /Users/maoxiaoqi/Desktop/网页/web-2025
   bash compress-images.sh
   ```

2. **测试验证**:
   - 测试所有页面的slideshow功能
   - 检查视频封面是否正常显示
   - 验证图片质量是否满意

3. **监控效果**:
   - 使用Chrome DevTools → Network观察加载时间
   - 首屏加载应该 < 2秒
   - 总下载量应该减少20-30%

## 🚀 预期最终效果

### Installation页面
```
优化前: 36秒, 67MB
优化后: < 10秒, < 50MB
提升: 70%+
```

### 其他页面
```
优化前: 5-8秒
优化后: 2-3秒
提升: 60%+
```

### 用户体验
- ✅ 无黑屏等待
- ✅ 视频有封面预览
- ✅ 页面切换更流畅
- ✅ 首屏显示更快

