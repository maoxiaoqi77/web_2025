#!/usr/bin/env node

/**
 * 响应式图片生成工具
 * 为所有非slideshow图片生成 400px / 960px / 1600px 三档
 * 输出到 images/_responsive/ 目录
 */

import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const SIZES = [400, 960, 1600];
const WEBP_QUALITY = 75;
const JPEG_QUALITY = 80;
const SOURCE_DIR = path.join(__dirname, '../images');
const OUTPUT_DIR = path.join(__dirname, '../images/_responsive');

// 排除slideshow目录
const EXCLUDE_PATTERNS = [
  '**/00_SLIDESHOW/**',
  '**/slideshow/**',
  '**/slide show/**',
  '**/_responsive/**',
  '**/backup*/**'
];

// 统计
let stats = {
  total: 0,
  processed: 0,
  skipped: 0,
  errors: 0
};

/**
 * 生成响应式图片
 */
async function generateResponsiveImage(sourcePath, size) {
  try {
    const image = sharp(sourcePath);
    const metadata = await image.metadata();

    // 如果原图宽度小于目标尺寸，跳过（允许等于，以便生成压缩版本）
    if (metadata.width < size) {
      return null;
    }

    // 计算输出路径
    const relativePath = path.relative(SOURCE_DIR, sourcePath);
    const ext = path.extname(sourcePath);
    const basename = path.basename(sourcePath, ext);
    const dirname = path.dirname(relativePath);
    
    const outputDir = path.join(OUTPUT_DIR, dirname);
    await fs.ensureDir(outputDir);

    // 生成WebP版本
    const webpPath = path.join(outputDir, `${basename}-${size}.webp`);
    await image
      .resize(size, null, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    // 生成JPG/PNG版本（作为fallback）
    const fallbackExt = metadata.format === 'png' ? '.png' : '.jpg';
    const fallbackPath = path.join(outputDir, `${basename}-${size}${fallbackExt}`);
    
    if (fallbackExt === '.png') {
      await image
        .resize(size, null, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .png({ quality: 90 })
        .toFile(fallbackPath);
    } else {
      await image
        .resize(size, null, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(fallbackPath);
    }

    return { webpPath, fallbackPath };
  } catch (error) {
    console.error(`  ❌ 生成失败 (${size}px): ${error.message}`);
    return null;
  }
}

/**
 * 处理单个图片
 */
async function processImage(sourcePath) {
  const relativePath = path.relative(SOURCE_DIR, sourcePath);
  console.log(`\n📸 处理: ${relativePath}`);

  stats.total++;

  try {
    const image = sharp(sourcePath);
    const metadata = await image.metadata();

    console.log(`  尺寸: ${metadata.width}x${metadata.height}`);

    let generated = 0;
    for (const size of SIZES) {
      // 改为 >= 允许生成与原图同尺寸的压缩版本
      if (metadata.width >= size) {
        const result = await generateResponsiveImage(sourcePath, size);
        if (result) {
          generated++;
          const webpSize = (await fs.stat(result.webpPath)).size;
          const fallbackSize = (await fs.stat(result.fallbackPath)).size;
          console.log(`  ✓ ${size}px: ${(webpSize / 1024).toFixed(1)}KB (webp) + ${(fallbackSize / 1024).toFixed(1)}KB (fallback)`);
        }
      } else {
        console.log(`  ⊘ ${size}px: 跳过（原图太小）`);
      }
    }

    if (generated > 0) {
      stats.processed++;
    } else {
      stats.skipped++;
    }
  } catch (error) {
    console.error(`  ❌ 处理失败: ${error.message}`);
    stats.errors++;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  响应式图片生成工具');
  console.log('═══════════════════════════════════════');
  console.log(`源目录: ${SOURCE_DIR}`);
  console.log(`输出目录: ${OUTPUT_DIR}`);
  console.log(`尺寸: ${SIZES.join('px, ')}px`);
  console.log('');

  // 清空输出目录
  if (await fs.pathExists(OUTPUT_DIR)) {
    console.log('🗑️  清空现有输出目录...');
    await fs.remove(OUTPUT_DIR);
  }
  await fs.ensureDir(OUTPUT_DIR);

  // 查找所有图片
  console.log('🔍 扫描图片文件...');
  const patterns = [
    'images/**/*.webp',
    'images/**/*.jpg',
    'images/**/*.jpeg',
    'images/**/*.png'
  ];

  const files = await glob(patterns, {
    ignore: EXCLUDE_PATTERNS,
    cwd: path.join(__dirname, '..')
  });

  console.log(`📊 找到 ${files.length} 个图片文件\n`);

  // 处理所有图片
  for (const file of files) {
    await processImage(path.join(__dirname, '..', file));
  }

  // 输出统计
  console.log('\n═══════════════════════════════════════');
  console.log('  处理完成');
  console.log('═══════════════════════════════════════');
  console.log(`总文件数: ${stats.total}`);
  console.log(`已处理: ${stats.processed}`);
  console.log(`跳过: ${stats.skipped}`);
  console.log(`错误: ${stats.errors}`);
  console.log('');
  console.log(`✅ 响应式图片已保存到: ${OUTPUT_DIR}`);
  console.log('');
}

// 运行
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});

