#!/usr/bin/env node
/*
Rewrite local <img> to responsive <picture> with srcset/sizes.
- Only rewrite local images under /images (no http/data/svg)
- Use generated outputs from images/_gen created by gen-images.js
- Idempotent: marks with data-responsive="1" and avoids double rewrite
- Supports --dry (print summary) and --revert (restore to <img>)
- By default processes all html under project root; use env HTML_GLOB to limit
*/

const path = require('path');
const fs = require('fs-extra');
const fg = require('fast-glob');
const cheerio = require('cheerio');

const ROOT = process.cwd();
const IMG_ROOT = path.join(ROOT, 'images');
const GEN_ROOT = path.join(IMG_ROOT, '_gen');
const MANIFEST = path.join(GEN_ROOT, 'manifest.json');
const DRY = process.argv.includes('--dry');
const REVERT = process.argv.includes('--revert');
const SAMPLE_ONLY = process.argv.includes('--sample');

const DEFAULT_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 960px, 1600px';
const WIDTHS = [400, 960, 1600];

function isLocalSrc(src) {
  if (!src) return false;
  if (/^https?:/i.test(src)) return false;
  if (/^data:/i.test(src)) return false;
  if (/\.svg(\?.*)?$/i.test(src)) return false;
  return src.startsWith('images/') || src.startsWith('/images/');
}

function normLocal(src) {
  if (src.startsWith('/')) return src.slice(1);
  return src;
}

async function loadManifest() {
  try { return await fs.readJson(MANIFEST); } catch { return {}; }
}

function buildSrcsets(rel, isWebpOrig) {
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  const toPath = (ext, w) => `images/_gen/${dir === '.' ? '' : dir + '/'}${base}-${w}.${ext}`;
  const available = WIDTHS.map(w => ({ w, webp: toPath('webp', w), jpg: toPath('jpg', w) }));
  const webp = available.map(it => `${'/' + it.webp} ${it.w}w`).join(', ');
  const jpg = available.map(it => `${'/' + it.jpg} ${it.w}w`).join(', ');
  return { webp, jpg, paths: available };
}

async function rewriteFile(file, manifest) {
  const html = await fs.readFile(file, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  if (REVERT) {
    const pics = $('picture[data-responsive="1"]');
    if (pics.length === 0) return { file, changed: 0 };
    let changed = 0;
    pics.each((_, el) => {
      const img = $(el).children('img').first();
      if (img.length === 0) return;
      // Drop generated srcset/sizes/fetchpriority if present
      img.removeAttr('srcset');
      img.removeAttr('sizes');
      img.removeAttr('fetchpriority');
      img.removeAttr('decoding');
      // Replace picture with img
      $(el).replaceWith(img);
      changed++;
    });
    if (!DRY && changed > 0) {
      await fs.writeFile(file, $.html());
    }
    return { file, changed };
  }

  let changed = 0;
  // Only rewrite <img> not already wrapped
  $('img').each((_, el) => {
    const img = $(el);
    if (img.parents('picture[data-responsive="1"]').length) return;
    const src = normLocal(img.attr('src'));
    if (!isLocalSrc(src)) return;

    const rel = src.replace(/^\//, '');
    const ext = path.extname(rel).toLowerCase();
    const isWebpOrig = ext === '.webp';

    // Build srcsets
    const { webp, jpg } = buildSrcsets(rel, isWebpOrig);

    // Determine width/height from manifest or probing the original file
    const meta = manifest[rel] || {};
    const width = meta.width || undefined;
    const height = meta.height || undefined;

    // Build new picture
    const picture = $('<picture/>').attr('data-responsive', '1');
    const sourceWebp = $('<source/>').attr('srcset', webp).attr('type', 'image/webp');
    picture.append(sourceWebp);

    // Clone attributes to new <img>
    const newImg = $('<img/>');
    // Preserve attributes
    const attrs = el.attribs || {};
    Object.keys(attrs).forEach((k) => {
      if (k === 'src' || k === 'srcset' || k === 'sizes' || k === 'loading' || k === 'decoding' || k === 'fetchpriority') return;
      newImg.attr(k, attrs[k]);
    });
    // original src remains as fallback
    newImg.attr('src', '/' + rel);
    newImg.attr('decoding', 'async');
    if (width && height) {
      newImg.attr('width', width);
      newImg.attr('height', height);
    }
    // sizes and srcset fallback
    newImg.attr('sizes', DEFAULT_SIZES);
    if (isWebpOrig) {
      // no jpg fallback srcset needed
    } else {
      newImg.attr('srcset', jpg);
    }

    // priority logic
    if (img.is('[data-priority]')) {
      newImg.removeAttr('loading');
      newImg.attr('fetchpriority', 'high');
    } else {
      newImg.attr('loading', 'lazy');
    }

    picture.append(newImg);

    // If the <img> was inside <a>, keep the link outer structure
    const parent = img.parent();
    if (parent.is('a[href]')) {
      img.replaceWith(picture);
    } else {
      img.replaceWith(picture);
    }
    changed++;
  });

  if (!DRY && changed > 0) {
    await fs.writeFile(file, $.html());
  }
  return { file, changed };
}

async function main() {
  const manifest = await loadManifest();
  let patterns = process.env.HTML_GLOB || '**/*.html';
  // Always exclude node_modules
  const files = await fg(patterns, { cwd: ROOT, onlyFiles: true, absolute: true, ignore: ['**/node_modules/**'] });

  // First try: dry run on project.html and installation.html if --sample
  let targetFiles = files;
  if (SAMPLE_ONLY) {
    targetFiles = files.filter(f => /(?:^|\/)project\.html$/.test(f) || /(?:^|\/)installation\.html$/.test(f));
  }

  let total = 0;
  for (const f of targetFiles) {
    const res = await rewriteFile(f, manifest);
    if (res.changed) {
      console.log(`${DRY ? '[dry] ' : ''}rewritten: ${path.relative(ROOT, res.file)} (+${res.changed})`);
      total += res.changed;
    }
  }
  console.log(`Done. Changed: ${total}`);
}

main().catch(err => { console.error(err); process.exit(1); });
