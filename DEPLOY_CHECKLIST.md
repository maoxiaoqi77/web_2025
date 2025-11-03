# 🚀 部署检查清单

## ⚠️ 重要提醒

**`node_modules` 目录不应该上传到生产服务器！**

### 为什么？

1. **太大了**：31MB，2049个文件
2. **不需要**：这些是开发工具，网站运行不需要
3. **上传慢**：2049个小文件 = 极慢
4. **浪费空间**：占用服务器存储

---

## ✅ 必须上传的文件

### 核心文件

- [x] 所有 `.html` 文件
- [x] `css/` 目录（所有CSS文件）
- [x] `js/` 目录（所有JS文件，但不包括`node_modules/`）
- [x] `images/` 目录（包括`_responsive/`子目录）
- [x] `.htaccess`（Apache服务器）

### Installation详情页

- [x] `installation/` 目录（所有HTML文件）

---

## ❌ 不应该上传的文件

### 开发工具（不需要）

- [ ] `node_modules/` ❌ **31MB，2049个文件**
- [ ] `tools/` ❌ 开发工具脚本
- [ ] `verify.sh` ❌ 验证脚本

### 版本控制（不需要）

- [ ] `.git/` ❌ Git仓库
- [ ] `.gitignore` ❌
- [ ] `.gitattributes` ❌

### 日志和备份（不需要）

- [ ] `logs/` ❌ 日志文件
- [ ] `backup_all_*/` ❌ 备份目录
- [ ] `*.log` ❌ 日志文件

### 文档（可选）

- [ ] `*.md` ❌ 文档文件（可选）
- [ ] `README*` ❌

### 系统文件（不需要）

- [ ] `.DS_Store` ❌ macOS系统文件
- [ ] `.Rhistory` ❌ R语言历史

---

## 📋 FileZilla 设置方法

### 方法1：使用.ftpignore（推荐）

1. 在FileZilla中，`服务器(S)` → `输入自定义命令(I)`
2. 输入：
   ```
   ignore -R node_modules
   ignore -R tools
   ignore -R logs
   ignore -R backup_all_*
   ignore -R .git
   ```

### 方法2：手动排除

在FileZilla中：

1. 点击 `视图(V)` → `文件列表筛选器(F)`
2. 点击 `编辑筛选器...`
3. 添加排除规则：
   ```
   node_modules
   tools
   logs
   backup_all_*
   .git
   *.md
   ```

### 方法3：只选择需要的文件夹上传

**推荐方式：** 只拖拽以下文件夹和文件：

```
✅ 上传这些：
├── *.html（所有HTML文件）
├── css/
├── js/（不包括node_modules/）
├── images/（包括_responsive/）
├── installation/
└── .htaccess

❌ 不要上传：
├── node_modules/ ← 这个！
├── tools/
├── logs/
├── backup_all_*/
├── .git/
└── *.md
```

---

## 📊 文件大小对比

### 实际上传大小

| 类型 | 大小 | 文件数 |
|------|------|--------|
| **需要上传** | ~150MB | ~1500 |
| node_modules | 31MB | 2049 |
| **上传node_modules后** | ~181MB | ~3500 |

**节省：** 不传`node_modules`可节省31MB和2049个文件！

---

## ⚡ 快速解决方案

### 立即停止上传node_modules

1. **在FileZilla中：**
   - 右键点击队列中的`node_modules`相关文件
   - 选择"从队列中移除"

2. **创建.ftpignore：**
   - 已为你创建了`.ftpignore`文件
   - FileZilla可能需要重启才能识别

3. **重新上传：**
   - 只选择需要的文件夹
   - 跳过`node_modules/`

---

## 🔍 验证上传内容

### 上传后检查服务器

在服务器上应该看到：

```
public_html/
├── index.html
├── installation.html
├── sculpture.html
├── drawing.html
├── project.html
├── about.html
├── css/
│   ├── style.css
│   └── skeleton.css
├── js/
│   ├── script.js
│   ├── skeleton.js
│   └── preload-optimizer.js
├── images/
│   ├── _responsive/  ← 这个很重要！
│   ├── 02installation/
│   ├── 02project/
│   └── ...
├── installation/
│   └── *.html
└── .htaccess
```

**不应该看到：**
- ❌ `node_modules/`
- ❌ `tools/`
- ❌ `logs/`
- ❌ `backup_all_*/`

---

## 💡 为什么上传慢？

### 主要原因

1. **文件数量多**：2049个文件（node_modules）
   - 每个文件需要：连接 + 认证 + 传输 + 确认
   - 小文件越多，总时间越长

2. **小文件开销大**：
   - 一个1KB的文件传输时间 = 连接时间 + 传输时间
   - 1000个小文件 >> 1个大文件的时间

3. **网络延迟**：
   - 每个文件都需要往返通信
   - 2049个文件 = 2049次往返

### 对比

| 场景 | 文件数 | 总大小 | 上传时间 |
|------|--------|--------|----------|
| 只上传需要的 | ~1500 | ~150MB | **5-10分钟** |
| 包括node_modules | ~3500 | ~181MB | **30-60分钟** |

---

## ✅ 正确上传步骤

### 推荐流程

1. **停止当前上传**
   - 如果正在上传`node_modules`，先停止

2. **清理队列**
   - 移除所有`node_modules`相关文件

3. **重新选择文件**
   - 只选择以下内容：
     - 所有`.html`文件
     - `css/`文件夹
     - `js/`文件夹（但不包括里面的`node_modules/`）
     - `images/`文件夹（包括`_responsive/`）
     - `installation/`文件夹
     - `.htaccess`文件

4. **开始上传**
   - 预计时间：5-10分钟

---

## 🎯 快速检查清单

上传前确认：

- [ ] ❌ `node_modules/` 已排除
- [ ] ✅ `images/_responsive/` 已包含
- [ ] ✅ `.htaccess` 已包含
- [ ] ✅ 所有`.html`文件已包含
- [ ] ✅ `css/skeleton.css` 已包含
- [ ] ✅ `js/skeleton.js` 已包含
- [ ] ✅ `js/preload-optimizer.js` 已包含

---

## 🎉 总结

**关键点：**

1. ❌ **不要上传`node_modules/`**
   - 31MB，2049个文件
   - 网站运行不需要
   - 上传极慢

2. ✅ **只上传网站运行需要的文件**
   - HTML, CSS, JS, Images
   - 预计大小：~150MB
   - 预计时间：5-10分钟

3. 📋 **已创建`.ftpignore`**
   - 自动排除不需要的文件
   - FileZilla可能需要配置才能使用

现在停止上传`node_modules`，只上传需要的文件，速度会快很多！🚀

