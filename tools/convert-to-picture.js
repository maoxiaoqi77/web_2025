#!/usr/bin/env node

/**
 * HTML图片标签转换工具
 * 将 <img> 自动转换为 <picture> + srcset/sizes
 * 仅处理非slideshow的本地图片
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const SIZES = [400, 960, 1600];
const HTML_PATTERNS = [
  '*.html',
  'installation/*.html'
];
const DRY_RUN = process.argv.includes('--dry-run');
const REVERT = process.argv.includes('--revert');

// 统计
let stats = {
  files: 0,
  images: 0,
  converted: 0,
  skipped: 0
};

/**
 * 检查是否是本地图片
 */
function isLocalImage(src) {
  if (!src) return false;
  if (src.startsWith('data:')) return false;
  if (src.startsWith('http://')) return false;
  if (src.startsWith('https://')) return false;
  if (src.startsWith('//')) return false;
  return true;
}

/**
 * 检查是否是slideshow图片
 */
function isSlideshowImage(src) {
  if (!src) return false;
  const lowerSrc = src.toLowerCase();
  return lowerSrc.includes('/slideshow/') || 
         lowerSrc.includes('/00_slideshow/') ||
         lowerSrc.includes('/slide show/');
}

/**
 * 生成srcset字符串
 */
function generateSrcset(imgSrc, ext, isWebP = true) {
  const dir = path.dirname(imgSrc);
  const basename = path.basename(imgSrc, path.extname(imgSrc));
  const format = isWebP ? 'webp' : ext;
  
  const responsiveDir = dir.replace(/^images\//, 'images/_responsive/');
  
  return SIZES
    .map(size => `${responsiveDir}/${basename}-${size}.${format} ${size}w`)
    .join(', ');
}

/**
 * 转换img为picture
 */
function convertImgToPicture($, img) {
  const $img = $(img);
  const src = $img.attr('src') || $img.attr('data-src');
  
  if (!src) return false;
  if (!isLocalImage(src)) {
    stats.skipped++;
    return false;
  }
  if (isSlideshowImage(src)) {
    stats.skipped++;
    return false;
  }

  // 获取所有属性
  const attrs = img.attribs || {};
  const loading = attrs.loading || 'lazy';
  const fetchpriority = attrs.fetchpriority || attrs['data-priority'] ? 'high' : undefined;
  
  // 确定扩展名
  const ext = path.extname(src).substring(1);
  const fallbackExt = ext === 'png' ? 'png' : 'jpg';

  // 生成srcset
  const webpSrcset = generateSrcset(src, ext, true);
  const fallbackSrcset = generateSrcset(src, ext, false);

  // 构建picture标签
  let pictureHtml = '<picture>';
  
  // WebP source
  pictureHtml += `<source srcset="${webpSrcset}" type="image/webp">`;
  
  // Fallback img
  pictureHtml += '<img';
  pictureHtml += ` src="${src}"`;
  pictureHtml += ` srcset="${fallbackSrcset}"`;
  pictureHtml += ` sizes="(max-width: 768px) 100vw, (max-width: 1200px) 960px, 1600px"`;
  
  // 保留原有属性
  if (attrs.alt) pictureHtml += ` alt="${attrs.alt}"`;
  if (attrs.class) pictureHtml += ` class="${attrs.class}"`;
  if (attrs.id) pictureHtml += ` id="${attrs.id}"`;
  if (attrs.style) pictureHtml += ` style="${attrs.style}"`;
  if (attrs.width) pictureHtml += ` width="${attrs.width}"`;
  if (attrs.height) pictureHtml += ` height="${attrs.height}"`;
  
  // loading属性（data-priority的图片不加lazy）
  if (!attrs['data-priority']) {
    pictureHtml += ` loading="${loading}"`;
  }
  
  // fetchpriority
  if (fetchpriority) {
    pictureHtml += ` fetchpriority="${fetchpriority}"`;
  }
  
  // decoding
  pictureHtml += ` decoding="async"`;
  
  // 保留其他data-*属性
  Object.keys(attrs).forEach(key => {
    if (key.startsWith('data-') && key !== 'data-src' && key !== 'data-priority') {
      pictureHtml += ` ${key}="${attrs[key]}"`;
    }
  });
  
  pictureHtml += '>';
  pictureHtml += '</picture>';

  // 替换
  $img.replaceWith(pictureHtml);
  stats.converted++;
  return true;
}

/**
 * 还原picture为img
 */
function revertPictureToImg($, picture) {
  const $picture = $(picture);
  const $img = $picture.find('img');
  
  if ($img.length === 0) return false;
  
  // 提取原始img标签（移除srcset和sizes）
  $img.removeAttr('srcset');
  $img.removeAttr('sizes');
  
  // 替换picture为img
  $picture.replaceWith($img);
  stats.converted++;
  return true;
}

/**
 * 处理单个HTML文件
 */
async function processHtmlFile(filePath) {
  console.log(`\n📄 处理: ${path.relative(process.cwd(), filePath)}`);
  stats.files++;

  try {
    const html = await fs.readFile(filePath, 'utf-8');
    const $ = cheerio.load(html, {
      decodeEntities: false,
      xmlMode: false
    });

    if (REVERT) {
      // 还原模式
      const pictures = $('picture');
      console.log(`  找到 ${pictures.length} 个<picture>标签`);
      
      pictures.each((i, picture) => {
        revertPictureToImg($, picture);
      });
    } else {
      // 转换模式
      const images = $('img');
      console.log(`  找到 ${images.length} 个<img>标签`);
      stats.images += images.length;

      images.each((i, img) => {
        convertImgToPicture($, img);
      });
    }

    // 保存文件
    if (!DRY_RUN) {
      const output = $.html();
      await fs.writeFile(filePath, output, 'utf-8');
      console.log(`  ✓ 已保存`);
    } else {
      console.log(`  ⊘ 干运行模式，未保存`);
    }
  } catch (error) {
    console.error(`  ❌ 处理失败: ${error.message}`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('═══════════════════════════════════════');
  if (REVERT) {
    console.log('  HTML还原工具 (<picture> → <img>)');
  } else {
    console.log('  HTML转换工具 (<img> → <picture>)');
  }
  console.log('═══════════════════════════════════════');
  console.log(`模式: ${DRY_RUN ? '干运行（不保存）' : '正常（会修改文件）'}`);
  console.log('');

  // 查找所有HTML文件
  console.log('🔍 扫描HTML文件...');
  const files = await glob(HTML_PATTERNS, {
    cwd: process.cwd()
  });

  console.log(`📊 找到 ${files.length} 个HTML文件\n`);

  // 处理所有HTML文件
  for (const file of files) {
    await processHtmlFile(path.join(process.cwd(), file));
  }

  // 输出统计
  console.log('\n═══════════════════════════════════════');
  console.log('  处理完成');
  console.log('═══════════════════════════════════════');
  console.log(`处理文件: ${stats.files}`);
  if (!REVERT) {
    console.log(`总图片数: ${stats.images}`);
    console.log(`已转换: ${stats.converted}`);
    console.log(`跳过: ${stats.skipped}`);
  } else {
    console.log(`已还原: ${stats.converted}`);
  }
  console.log('');
}

// 运行
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});

