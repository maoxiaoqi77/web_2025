# 响应式图片优化指南

## 📱 优化目标

为所有非slideshow图片生成**400px / 960px / 1600px**三档，使用`<picture>`标签 + `srcset`/`sizes`，实现：
- **手机端加载速度提升5-8倍**（加载400px而非原图）
- **自动适配不同屏幕尺寸**
- **WebP优先，保留JPG/PNG作为fallback**
- **完全不影响现有功能和交互**

---

## 🚀 快速开始

### 一键执行（生成 + 转换）

```bash
npm run responsive:build
```

这个命令会：
1. 为所有图片生成三档响应式版本（约30-60分钟）
2. 自动将HTML中的`<img>`转换为`<picture>`标签

---

## 📋 分步执行

### 步骤1：生成响应式图片

```bash
npm run responsive:gen
```

- 输出目录：`images/_responsive/`
- 处理约421个图片
- 生成约1200+个文件（每个图片×3档×2格式）
- 预计时间：30-60分钟

### 步骤2：转换HTML（干运行测试）

```bash
npm run responsive:convert:dry
```

- 只显示会做什么，不实际修改文件
- 用于确认转换效果

### 步骤3：正式转换HTML

```bash
npm run responsive:convert
```

- 将所有符合条件的`<img>`转换为`<picture>`
- 处理文件：所有*.html和installation/*.html

---

## 🔄 紧急回退

如果转换后出现问题，可以立即回退：

```bash
npm run responsive:revert
```

这会将所有`<picture>`标签还原为原始的`<img>`标签。

---

## 🎯 处理规则

### ✅ 会被转换的图片

- 本地图片（以`images/`开头）
- 非slideshow图片（不在slideshow目录中）
- 例如：
  - Installation详情页的图片
  - Sculpture的封面图
  - Project的图片
  - Top的news图片

### ⊘ 不会被转换的图片

- Slideshow中的图片（已有lazy loading优化）
- 外链图片（http/https开头）
- Data URI图片
- SVG图片

---

## 📐 生成的HTML结构

### 转换前

```html
<img src="images/02installation/xxx.webp" 
     alt="描述" 
     class="gallery-image" 
     loading="lazy">
```

### 转换后

```html
<picture>
  <source srcset="images/_responsive/02installation/xxx-400.webp 400w, 
                  images/_responsive/02installation/xxx-960.webp 960w, 
                  images/_responsive/02installation/xxx-1600.webp 1600w" 
          type="image/webp">
  <img src="images/02installation/xxx.webp" 
       srcset="images/_responsive/02installation/xxx-400.jpg 400w, 
               images/_responsive/02installation/xxx-960.jpg 960w, 
               images/_responsive/02installation/xxx-1600.jpg 1600w" 
       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 960px, 1600px"
       alt="描述" 
       class="gallery-image" 
       loading="lazy" 
       decoding="async">
</picture>
```

---

## 🔍 效果验证

### 在手机上测试

1. 打开DevTools → Network
2. 模拟手机设备
3. 刷新页面
4. 查看加载的图片尺寸

**预期效果**：
- 手机（375px宽）：加载400px版本
- 平板（768px宽）：加载960px版本
- 桌面（1920px宽）：加载1600px版本

### 文件大小对比

| 设备 | 加载前 | 加载后 | 节省 |
|------|--------|--------|------|
| 手机 | 2-5MB | 200-500KB | 80-90% |
| 平板 | 2-5MB | 800KB-1.5MB | 50-70% |
| 桌面 | 2-5MB | 1.5-2.5MB | 20-40% |

---

## ⚙️ 高级配置

### 修改生成尺寸

编辑`tools/generate-responsive-images.js`：

```javascript
const SIZES = [400, 960, 1600]; // 修改为你想要的尺寸
```

### 修改WebP质量

编辑`tools/generate-responsive-images.js`：

```javascript
const WEBP_QUALITY = 75; // 50-100，数字越大质量越高
```

### 修改sizes属性

编辑`tools/convert-to-picture.js`，查找：

```javascript
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 960px, 1600px"
```

根据你的布局修改断点和尺寸。

---

## 🐛 常见问题

### Q: 生成时间太长？

A: 这是正常的。处理421个图片×3档需要30-60分钟。可以先去喝杯咖啡☕️

### Q: 生成的文件太多？

A: 是的，会生成1200+个文件。但这会显著提升手机端加载速度。

### Q: 转换后样式错乱？

A: 运行`npm run responsive:revert`立即回退，然后检查CSS是否有针对`<img>`的特殊样式。

### Q: 某些图片不想转换？

A: 给图片添加特殊class或data属性，然后修改`tools/convert-to-picture.js`中的`isLocalImage`函数增加排除规则。

---

## 📊 性能提升预期

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 手机首屏加载 | 8-15秒 | 1-3秒 | **5-8倍** |
| 总下载量（手机） | 10-20MB | 2-4MB | **80%↓** |
| LCP (手机) | 6-10秒 | 1-2秒 | **70%↓** |
| 用户体验 | ⭐⭐ | ⭐⭐⭐⭐⭐ | **质的飞跃** |

---

## ✅ 检查清单

生成后检查：

- [ ] `images/_responsive/`目录存在
- [ ] 每个图片有3档×2格式（webp + jpg/png）
- [ ] 文件大小逐级递增（400 < 960 < 1600）

转换后检查：

- [ ] HTML中出现`<picture>`标签
- [ ] `<source>`标签有webp格式
- [ ] `<img>`标签有srcset和sizes属性
- [ ] 保留了原有的class、alt等属性

测试：

- [ ] 桌面端显示正常
- [ ] 手机端显示正常
- [ ] 图片点击/放大功能正常
- [ ] Slideshow不受影响
- [ ] 所有交互功能正常

---

## 🎉 完成后

恭喜！你的网站现在对手机用户超级友好了！📱✨

可以继续进行：
- 骨架屏优化（提升感知速度）
- 服务器端优化（Gzip/Brotli压缩）

