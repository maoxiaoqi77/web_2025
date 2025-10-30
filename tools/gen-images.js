#!/usr/bin/env node
/*
Generate responsive images for local assets under images/.
- Creates 400/960/1600 width variants (no upscaling)
- Outputs into images/_gen/<original_subpath>/<basename>-<w>.<ext>
- WebP priority with quality 75 (fallback try 70 if >220KB). For non-webp originals also output JPG fallback.
- Idempotent: skips if output newer than source and exists.
*/

const path = require('path');
const fs = require('fs-extra');
const fg = require('fast-glob');
const sharp = require('sharp');

const ROOT = process.cwd();
const IMG_ROOT = path.join(ROOT, 'images');
const OUT_ROOT = path.join(IMG_ROOT, '_gen');
const TARGET_WIDTHS = [400, 960, 1600];
const LIMIT_BYTES = 220 * 1024; // 220KB

function isLocalImage(p) {
  const ext = path.extname(p).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
}

async function ensureDir(p) { await fs.mkdirp(p); }

async function statOrNull(p) { try { return await fs.stat(p); } catch { return null; } }

async function processOne(absPath) {
  const rel = path.relative(IMG_ROOT, absPath);
  if (rel.startsWith('..')) return; // outside
  const ext = path.extname(rel).toLowerCase();
  const isWebpOrig = ext === '.webp';
  const baseNoExt = rel.slice(0, -ext.length);

  const img = sharp(absPath);
  const meta = await img.metadata();
  const srcWidth = meta.width || 0;
  const srcHeight = meta.height || 0;

  const widths = TARGET_WIDTHS.filter(w => w <= srcWidth && w > 0);
  if (widths.length === 0) return { rel, generated: [] };

  const outDir = path.join(OUT_ROOT, path.dirname(rel));
  await ensureDir(outDir);

  /**
   * Encode helper: try quality 75, if >220KB then 70.
   */
  async function encodeWebp(pipeline, outFile) {
    let buf = await pipeline.webp({ quality: 75 }).toBuffer();
    if (buf.length > LIMIT_BYTES) {
      buf = await sharp(buf).webp({ quality: 70 }).toBuffer();
    }
    // do not exceed original bytes
    const srcStat = await fs.stat(absPath);
    if (buf.length > srcStat.size) {
      // if still bigger than source, accept source-like recompress with 70 (already attempted). Keep as is but avoid exceeding huge sizes
    }
    await fs.writeFile(outFile, buf);
  }

  async function encodeJpg(pipeline, outFile) {
    let buf = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    if (buf.length > LIMIT_BYTES) {
      buf = await sharp(buf).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
    }
    await fs.writeFile(outFile, buf);
  }

  const generated = [];
  for (const w of widths) {
    const resize = sharp(absPath).resize({ width: w, withoutEnlargement: true });
    const webpOut = path.join(outDir, `${path.basename(baseNoExt)}-${w}.webp`);
    const webpStat = await statOrNull(webpOut);
    if (!webpStat || webpStat.mtimeMs < (await fs.stat(absPath)).mtimeMs) {
      await encodeWebp(resize.clone(), webpOut);
    }
    generated.push(path.relative(IMG_ROOT, webpOut));

    if (!isWebpOrig) {
      const jpgOut = path.join(outDir, `${path.basename(baseNoExt)}-${w}.jpg`);
      const jpgStat = await statOrNull(jpgOut);
      if (!jpgStat || jpgStat.mtimeMs < (await fs.stat(absPath)).mtimeMs) {
        await encodeJpg(resize.clone(), jpgOut);
      }
      generated.push(path.relative(IMG_ROOT, jpgOut));
    }
  }

  return { rel, width: srcWidth, height: srcHeight, generated };
}

async function main() {
  const patterns = ['images/**/*.{jpg,jpeg,png,webp}'];
  const files = await fg(patterns, { cwd: ROOT, onlyFiles: true, dot: false, absolute: true });
  const results = [];
  for (const f of files) {
    try {
      if (!isLocalImage(f)) continue;
      const res = await processOne(f);
      if (res) results.push(res);
    } catch (e) {
      // continue
    }
  }
  // Write a simple manifest to speed up rewriter width/height lookup
  const manifest = {};
  for (const r of results) {
    manifest[r.rel] = { width: r.width, height: r.height };
  }
  await ensureDir(OUT_ROOT);
  await fs.writeJson(path.join(OUT_ROOT, 'manifest.json'), manifest, { spaces: 2 });
  console.log(`Generated responsive variants for ${results.length} images.`);
}

main().catch(err => { console.error(err); process.exit(1); });
