# 服务器优化指南

## 🎯 优化目标

通过服务器端配置，实现：
- **文件大小再减20%**（Gzip/Brotli压缩）
- **加载速度提升30-50%**（缓存策略）
- **全球访问加速**（CDN建议）

---

## 📊 优化收益

| 优化项 | 效果 | 难度 | 时间 |
|--------|------|------|------|
| Gzip压缩 | 文件小70% | ⭐ | 5分钟 |
| Brotli压缩 | 文件小80% | ⭐⭐ | 10分钟 |
| 缓存策略 | 速度快90% | ⭐ | 5分钟 |
| CDN | 全球快50% | ⭐⭐⭐ | 30分钟 |

---

## 1️⃣ 压缩优化

### Nginx配置

创建或编辑`nginx.conf`或站点配置文件：

```nginx
# Gzip压缩
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
  text/plain
  text/css
  text/xml
  text/javascript
  application/json
  application/javascript
  application/xml+rss
  application/rss+xml
  font/truetype
  font/opentype
  application/vnd.ms-fontobject
  image/svg+xml;

# Brotli压缩（需要安装brotli模块）
brotli on;
brotli_comp_level 6;
brotli_types
  text/plain
  text/css
  text/xml
  text/javascript
  application/json
  application/javascript
  application/xml+rss
  application/rss+xml
  font/truetype
  font/opentype
  application/vnd.ms-fontobject
  image/svg+xml;
```

### Apache配置

创建或编辑`.htaccess`：

```apache
# Gzip压缩
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
  AddOutputFilterByType DEFLATE application/javascript application/json application/xml
  AddOutputFilterByType DEFLATE image/svg+xml
  AddOutputFilterByType DEFLATE font/truetype font/opentype application/vnd.ms-fontobject
</IfModule>

# Brotli压缩（需要mod_brotli）
<IfModule mod_brotli.c>
  SetOutputFilter BROTLI_COMPRESS
  AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/xml text/css text/javascript
  AddOutputFilterByType BROTLI_COMPRESS application/javascript application/json
</IfModule>
```

---

## 2️⃣ 缓存策略

### Nginx配置

```nginx
location ~* \.(jpg|jpeg|png|gif|webp|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
  access_log off;
}

location ~* \.(css|js)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location ~* \.(woff|woff2|ttf|otf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
  add_header Access-Control-Allow-Origin "*";
}

location ~* \.(mp4|webm|ogg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
  mp4;
  mp4_buffer_size 1m;
  mp4_max_buffer_size 5m;
}

location / {
  expires 1h;
  add_header Cache-Control "public, must-revalidate";
}
```

### Apache配置（.htaccess）

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  
  # 图片 - 1年
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  
  # CSS/JS - 1年
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  
  # 字体 - 1年
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/ttf "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
  
  # 视频 - 1年
  ExpiresByType video/mp4 "access plus 1 year"
  ExpiresByType video/webm "access plus 1 year"
  
  # HTML - 1小时
  ExpiresByType text/html "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
  # 图片
  <FilesMatch "\.(jpg|jpeg|png|gif|webp|ico|svg)$">
    Header set Cache-Control "public, immutable"
  </FilesMatch>
  
  # CSS/JS
  <FilesMatch "\.(css|js)$">
    Header set Cache-Control "public, immutable"
  </FilesMatch>
  
  # 字体
  <FilesMatch "\.(woff|woff2|ttf|otf|eot)$">
    Header set Cache-Control "public, immutable"
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
  
  # 视频
  <FilesMatch "\.(mp4|webm|ogg)$">
    Header set Cache-Control "public, immutable"
  </FilesMatch>
  
  # HTML
  <FilesMatch "\.html$">
    Header set Cache-Control "public, must-revalidate"
  </FilesMatch>
</IfModule>
```

---

## 3️⃣ HTTP/2 & HTTP/3

### Nginx配置

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;

# HTTP/3 (QUIC)
listen 443 quic reuseport;
listen [::]:443 quic reuseport;

# 添加Alt-Svc header
add_header Alt-Svc 'h3=":443"; ma=86400';
```

### Apache配置

```apache
# 确保启用了mod_http2
Protocols h2 h2c http/1.1
```

---

## 4️⃣ 安全头部

### 通用安全配置

**Nginx:**

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
```

**Apache:**

```apache
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "no-referrer-when-downgrade"
  Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
</IfModule>
```

---

## 5️⃣ CDN推荐方案

### 选项1：Cloudflare（免费 + 强大）

**优点：**
- ✅ 免费套餐功能强大
- ✅ 自动Brotli压缩
- ✅ 全球节点
- ✅ 自动HTTPS
- ✅ 防DDoS攻击

**设置步骤：**
1. 注册Cloudflare账号
2. 添加你的域名
3. 修改DNS服务器为Cloudflare提供的
4. 开启以下功能：
   - Auto Minify (CSS, JS, HTML)
   - Brotli压缩
   - 浏览器缓存TTL: 4小时
   - 缓存级别: 标准

**Cloudflare推荐配置：**

- **缓存规则：**
  - `*.jpg, *.png, *.webp, *.gif` → 缓存1个月
  - `*.css, *.js` → 缓存1个月
  - `*.mp4, *.webm` → 缓存1个月
  - `*.html` → 缓存1小时

- **Page Rules：**
  ```
  /*
  Cache Level: Cache Everything
  Edge Cache TTL: a month
  Browser Cache TTL: 4 hours
  ```

### 选项2：Vercel（简单部署）

**优点：**
- ✅ Git集成，自动部署
- ✅ 全球Edge Network
- ✅ 自动HTTPS
- ✅ 免费额度充足

**部署方法：**
```bash
npm install -g vercel
cd /Users/maoxiaoqi/Desktop/网页/web-2025
vercel
```

### 选项3：Netlify

**优点：**
- ✅ Git集成
- ✅ 自动构建
- ✅ 表单处理
- ✅ 免费SSL

**配置文件 (`netlify.toml`)：**

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.webp"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.mp4"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 6️⃣ 预加载关键资源

在HTML `<head>`中添加：

```html
<!-- 预加载关键CSS -->
<link rel="preload" href="css/style.css" as="style">
<link rel="preload" href="css/skeleton.css" as="style">

<!-- 预连接到CDN -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>

<!-- DNS预解析 -->
<link rel="dns-prefetch" href="https://your-cdn.com">

<!-- 预加载关键字体 -->
<link rel="preload" href="fonts/your-font.woff2" as="font" type="font/woff2" crossorigin>
```

---

## 7️⃣ 图片服务优化

### 响应式图片服务

如果使用图片CDN（如Cloudflare Images），可以动态调整尺寸：

```html
<!-- Cloudflare Images示例 -->
<img src="https://your-domain.com/cdn-cgi/image/width=800,format=auto,quality=85/images/photo.jpg" alt="...">
```

### imgproxy (自托管)

部署imgproxy服务，动态生成响应式图片：

```nginx
location /imgproxy/ {
  proxy_pass http://localhost:8080/;
  proxy_cache_valid 200 30d;
}
```

---

## 8️⃣ 监控 & 分析

### 推荐工具

1. **Google PageSpeed Insights**
   - https://pagespeed.web.dev/
   - 检查移动端和桌面端性能

2. **WebPageTest**
   - https://www.webpagetest.org/
   - 详细的瀑布图分析

3. **GTmetrix**
   - https://gtmetrix.com/
   - 综合性能评分

4. **Chrome DevTools**
   - Network面板：检查资源加载
   - Lighthouse：性能审计
   - Coverage：找出未使用的CSS/JS

### 性能监控脚本

添加到页面（已包含在`skeleton.js`中）：

```javascript
window.addEventListener('load', () => {
  setTimeout(() => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    
    // 发送到分析服务
    console.log('Page Load Time:', pageLoadTime + 'ms');
  }, 0);
});
```

---

## 9️⃣ 快速检查清单

部署后检查：

- [ ] Gzip/Brotli压缩已启用
- [ ] 缓存headers正确设置
- [ ] HTTP/2已启用
- [ ] HTTPS已配置
- [ ] 安全headers已添加
- [ ] CDN已配置（可选）
- [ ] PageSpeed分数 > 90

### 验证命令

**检查Gzip:**
```bash
curl -H "Accept-Encoding: gzip" -I https://your-domain.com/css/style.css | grep -i "content-encoding"
```

**检查Brotli:**
```bash
curl -H "Accept-Encoding: br" -I https://your-domain.com/css/style.css | grep -i "content-encoding"
```

**检查缓存:**
```bash
curl -I https://your-domain.com/images/photo.jpg | grep -i "cache-control"
```

---

## 🔟 预期效果

### 压缩效果

| 文件类型 | 原始大小 | Gzip后 | Brotli后 | 节省 |
|----------|---------|--------|----------|------|
| HTML | 100KB | 20KB | 18KB | 82% |
| CSS | 50KB | 10KB | 8KB | 84% |
| JavaScript | 200KB | 60KB | 50KB | 75% |
| JSON | 30KB | 5KB | 4KB | 87% |

### 缓存效果

| 访问类型 | 无缓存 | 有缓存 | 提升 |
|----------|--------|--------|------|
| 首次访问 | 5-8秒 | 5-8秒 | - |
| 二次访问 | 5-8秒 | 0.5秒 | 90% |
| 资源加载 | 3-5秒 | 0秒 | 100% |

### CDN效果

| 地区 | 无CDN | 有CDN | 提升 |
|------|-------|-------|------|
| 本地 | 1秒 | 0.5秒 | 50% |
| 国内 | 3秒 | 1秒 | 67% |
| 海外 | 5秒 | 1.5秒 | 70% |

---

## 🎉 完成！

现在你的服务器已经达到最佳配置！🚀

**最终性能预期：**
- 手机LCP < 2.5秒 ✅
- 桌面LCP < 1.5秒 ✅
- PageSpeed分数 > 90 ✅
- 全球访问流畅 ✅

