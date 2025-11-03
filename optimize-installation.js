#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const installationDir = path.join(__dirname, 'installation');

// 智能poster查找函数的代码
const posterFunctionCode = `        window.openSimpleVideoLightbox = function(videoSrc) {
            const videoLightbox = document.getElementById('video-lightbox');
            const videoPlayer = document.getElementById('simple-video-player');
            const source = videoPlayer.querySelector('source');
            
            if (!videoLightbox || !videoPlayer) return;
            
            // 设置视频源
            source.src = videoSrc;
            source.type = 'video/mp4';
            
            // 清空之前的状态
            videoPlayer.currentTime = 0;
            
            // 智能设置poster：查找同目录下的第一张图片
            try {
                const pathParts = videoSrc.split('/');
                const dirPath = pathParts.slice(0, -1).join('/');
                
                // 尝试从页面中的图片找到同目录的第一张图片作为poster
                const allImages = document.querySelectorAll('img[src]');
                let posterPath = '';
                
                for (let img of allImages) {
                    const imgSrc = img.getAttribute('src');
                    if (imgSrc && imgSrc.includes(dirPath)) {
                        // 优先使用00开头的图片
                        if (imgSrc.includes('/00_')) {
                            posterPath = imgSrc.replace('.webp', '.jpg');
                            break;
                        } else if (!posterPath) {
                            posterPath = imgSrc;
                        }
                    }
                }
                
                if (posterPath) {
                    videoPlayer.setAttribute('poster', posterPath);
                }
            } catch (e) {
                // 如果设置poster失败，不影响视频播放
            }`;

console.log('开始优化installation详情页...\n');

// 读取所有installation页面
const files = fs.readdirSync(installationDir).filter(f => f.endsWith('.html'));

let processedCount = 0;

files.forEach(filename => {
    const filepath = path.join(installationDir, filename);
    console.log(`处理: ${filename}`);
    
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;
    
    // 1. 替换openSimpleVideoLightbox函数为智能版本
    const oldFunctionRegex = /window\.openSimpleVideoLightbox = function\(videoSrc\) \{[\s\S]*?\/\/ 清空之前的状态[\s\S]*?videoPlayer\.currentTime = 0;[\s\S]*?\/\/ 设置poster[^}]*?\}[\s\S]*?\} catch[^}]*?\}/;
    
    if (oldFunctionRegex.test(content)) {
        content = content.replace(oldFunctionRegex, posterFunctionCode);
        modified = true;
        console.log('  ✓ 更新了视频poster逻辑');
    }
    
    // 2. 为图片添加loading属性
    // 查找所有的<img src...onclick="openLightbox(
    const imgRegex = /<img\s+src="[^"]+"\s+alt="[^"]*"\s+onclick="openLightbox\((\d+)\)"([^>]*)>/g;
    let match;
    const imgMatches = [];
    
    while ((match = imgRegex.exec(content)) !== null) {
        imgMatches.push({
            fullMatch: match[0],
            index: parseInt(match[1]),
            attributes: match[2],
            position: match.index
        });
    }
    
    if (imgMatches.length > 0) {
        // 从后往前处理，避免位置偏移
        imgMatches.reverse().forEach(img => {
            const hasLazy = img.attributes.includes('loading=');
            const hasFetchpriority = img.attributes.includes('fetchpriority=');
            
            let newImg = img.fullMatch;
            
            // 第一张图片添加fetchpriority="high"
            if (img.index === 0 && !hasFetchpriority) {
                newImg = newImg.replace(/onclick="openLightbox\(0\)"/, 'onclick="openLightbox(0)" fetchpriority="high"');
                modified = true;
            }
            // 第4张及以后添加loading="lazy"
            else if (img.index >= 3 && !hasLazy) {
                newImg = newImg.replace(/onclick="openLightbox\((\d+)\)"/, 'onclick="openLightbox($1)" loading="lazy"');
                modified = true;
            }
            
            if (newImg !== img.fullMatch) {
                content = content.substring(0, img.position) + newImg + content.substring(img.position + img.fullMatch.length);
            }
        });
        
        console.log(`  ✓ 优化了 ${imgMatches.length} 张图片的加载策略`);
    }
    
    // 保存修改
    if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
        processedCount++;
        console.log(`  ✓ 已保存\n`);
    } else {
        console.log(`  - 无需修改\n`);
    }
});

console.log(`\n完成！共处理 ${processedCount}/${files.length} 个文件。`);

