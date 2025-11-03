const fs = require('fs');
const path = require('path');

const htmlPath = 'drawing.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 对于gallery-item中的picture标签，移除1600w引用
// 匹配模式：gallery-item内的picture标签
html = html.replace(
  /(<div class="gallery-item">[\s\S]*?<picture>[\s\S]*?<source srcset=")([^"]*?)(-1600\.webp 1600w[\s]*)([^"]*?)(" type="image\/webp">[\s\S]*?<img[^>]*srcset=")([^"]*?)(-1600\.webp 1600w[\s]*)([^"]*?)(")/g,
  (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
    // 移除source和img中的1600w引用
    return p1 + p2 + p4 + p5 + p6 + p8 + p9;
  }
);

// 同时修改sizes，去掉1600px
html = html.replace(
  /(<div class="gallery-item">[\s\S]*?sizes=")(\(max-width: 768px\) 100vw, \(max-width: 1200px\) 960px, 1600px)("/g,
  '$1(max-width: 768px) 100vw, 960px$3'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✅ 已移除drawing.html中gallery-item的1600w引用');
