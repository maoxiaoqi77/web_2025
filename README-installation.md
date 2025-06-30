# 安装项目管理说明

## 自动更新的"Other Installations"部分

网站中的所有安装详情页面都使用自动生成的"Other Installations"部分，这样当添加新的安装项目时，所有详情页面的"Other Installations"部分都会自动更新。

## 如何添加新的安装项目

1. 创建新的安装详情页面HTML文件（可以复制现有页面并修改）
2. 在`js/installation-data.js`文件中添加新项目的信息，格式如下：

```javascript
{
    id: "新项目的文件名（不含.html后缀）",
    title: "新项目的标题",
    thumbnail: "../images/路径/到/缩略图.jpg",
    year: "项目年份"
}
```

3. 确保新页面中包含以下JavaScript引用：

```html
<script src="../js/script.js"></script>
<script src="../js/installation-data.js"></script>
<script src="../js/other-installations.js"></script>
```

4. 确保新页面中包含如下结构的"Other Installations"部分：

```html
<div class="other-installations">
    <h3>Other Installations</h3>
    <!-- 此部分将由other-installations.js自动生成 -->
</div>
```

5. 在`installation.html`主页面中添加新项目的链接

## 工作原理

- `js/installation-data.js`：包含所有安装项目的数据
- `js/other-installations.js`：自动生成"Other Installations"部分的脚本
- 当页面加载时，脚本会自动生成"Other Installations"部分，显示除当前页面外的所有其他安装项目

## 批量更新脚本

如果需要批量更新所有安装页面，可以使用以下脚本：

### update-installations.sh

这个脚本用于初始设置，会在所有安装页面中添加必要的引用和HTML结构：

```bash
./update-installations.sh
```

### fix-other-installations.sh

这个脚本用于修复可能出现的问题，如重复的JavaScript引用或缺少必要的引用：

```bash
./fix-other-installations.sh
```

这个脚本会：
1. 删除重复的JavaScript引用
2. 确保所有页面都引用了`installation-data.js`和`other-installations.js`
3. 确保"Other Installations"部分的HTML结构正确

### clean-installations.sh

这个脚本用于清理安装页面中的多余大模块：

```bash
./clean-installations.sh
```

这个脚本会：
1. 保留other-installations容器和标题
2. 删除容器中的所有其他内容
3. 添加注释，表明此部分将由other-installations.js自动生成

如果发现"Other Installations"部分显示了多余的大模块，可以运行这个脚本进行清理。

## 注意事项

1. 确保每个安装页面只引用一次`installation-data.js`和`other-installations.js`
2. 如果发现"Other Installations"部分显示了重复的内容，可以运行`fix-other-installations.sh`脚本修复
3. 添加新的安装页面后，记得更新`js/installation-data.js`文件 