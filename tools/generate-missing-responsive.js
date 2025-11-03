#!/usr/bin/env node

/**
 * 补充缺失的响应式图片版本
 * 1. 为slideshow图片生成响应式版本
 * 2. 为已有部分版本的图片补充缺失版本（如只有400/960，缺少1600）
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

// 统计
let stats = {
  total: 0,
  generated: 0,
  skipped: 0,
  errors: 0,
  missingSizes: { 400: 0, 960: 0, 1600: 0 }
};

/**
 * 检查响应式版本是否存在
 */
function checkResponsiveExists(sourcePath, size) {
  const relativePath = path.relative(SOURCE_DIR, sourcePath);
  const ext = path.extname(sourcePath);
  const basename = path.basename(sourcePath, ext);
  const dirname = path.dirname(relativePath);
  
  const outputDir = path.join(OUTPUT_DIR, dirname);
  const webpPath = path.join(outputDir, `${basename}-${size}.webp`);
  
  return fs.pathExists(webpPath);
}

/**
 * 生成响应式图片
 */
async function generateResponsiveImage(sourcePath, size) {
  try {
    const image = sharp(sourcePath);
    const metadata = await image.metadata();

    // 如果原图宽度小于目标尺寸，跳过
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

    // 检查是否已存在
    const webpPath = path.join(outputDir, `${basename}-${size}.webp`);
    if (await fs.pathExists(webpPath)) {
      return null; // 已存在，跳过
    }

    // 生成WebP版本
    await image
      .clone()
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
        .clone()
        .resize(size, null, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .png({ quality: 90 })
        .toFile(fallbackPath);
    } else {
      await image
        .clone()
        .resize(size, null, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(fallbackPath);
    }

    const webpSize = (await fs.stat(webpPath)).size;
    return { webpPath, fallbackPath, size: webpSize };
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
  
  stats.total++;

  try {
    const image = sharp(sourcePath);
    const metadata = await image.metadata();

    let missingSizes = [];
    let generatedCount = 0;

    // 检查哪些尺寸缺失
    for (const size of SIZES) {
      const exists = await checkResponsiveExists(sourcePath, size);
      if (!exists && metadata.width >= size) {
        missingSizes.push(size);
      }
    }

    if (missingSizes.length === 0) {
      stats.skipped++;
      return; // 所有版本都已存在
    }

    // 生成缺失的版本
    console.log(`\n📸 ${relativePath} (${metadata.width}x${metadata.height})`);
    console.log(`  缺失: ${missingSizes.join('px, ')}px`);
    
    for (const size of missingSizes) {
      const result = await generateResponsiveImage(sourcePath, size);
      if (result) {
        generatedCount++;
        stats.missingSizes[size]++;
        console.log(`  ✓ 生成 ${size}px: ${(result.size / 1024).toFixed(1)}KB`);
      }
    }

    if (generatedCount > 0) {
      stats.generated++;
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
  console.log('  补充缺失的响应式图片版本');
  console.log('═══════════════════════════════════════');
  console.log(`源目录: ${SOURCE_DIR}`);
  console.log(`输出目录: ${OUTPUT_DIR}`);
  console.log(`尺寸: ${SIZES.join('px, ')}px`);
  console.log('');

  await fs.ensureDir(OUTPUT_DIR);

  // 查找所有图片（包括slideshow）
  console.log('🔍 扫描图片文件...');
  const patterns = [
    'images/**/*.webp',
    'images/**/*.jpg',
    'images/**/*.jpeg',
    'images/**/*.png'
  ];

  const excludePatterns = [
    '**/_responsive/**',
    '**/backup*/**'
  ];

  const files = await glob(patterns, {
    ignore: excludePatterns,
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
  console.log(`新生成: ${stats.generated}`);
  console.log(`跳过（已完整）: ${stats.skipped}`);
  console.log(`错误: ${stats.errors}`);
  console.log(`\n缺失版本统计:`);
  console.log(`  400px: ${stats.missingSizes[400]} 个`);
  console.log(`  960px: ${stats.missingSizes[960]} 个`);
  console.log(`  1600px: ${stats.missingSizes[1600]} 个`);
  console.log('');
  console.log(`✅ 响应式图片已保存到: ${OUTPUT_DIR}`);
  console.log('');
}

// 运行
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});

