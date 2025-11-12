// 轮播图功能（优化版 - 真正的延迟加载）
document.addEventListener('DOMContentLoaded', function() {
    const slidesContainer = document.querySelector('.slides');
    if (!slidesContainer) return; // 没有轮播容器，直接返回
    
    let slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    let currentSlide = 0;
    let totalSlides = slides.length;

    // 延迟加载图片（核心优化）
    function lazyLoadImage(slide, priority) {
        const img = slide.querySelector('img');
        if (!img) {
            console.log('[LazyLoad] 未找到img元素');
            return;
        }
        
        const dataSrc = img.getAttribute('data-src');
        const currentSrc = img.getAttribute('src');
        const actualSrc = img.src; // 浏览器实际使用的src
        
        // 如果有data-src，检查是否需要加载
        if (dataSrc) {
            // 构建完整的URL用于比较（相对路径转绝对路径）
            const dataSrcUrl = dataSrc.startsWith('http') ? dataSrc : 
                              (dataSrc.startsWith('/') ? window.location.origin + dataSrc : 
                               window.location.origin + '/' + dataSrc);
            
            // 检查actualSrc是否有效（不是空、不是当前页面、等于dataSrc）
            // actualSrc可能是：空字符串、file://路径、当前页面URL、或实际的图片URL
            const isEmptyOrPage = !actualSrc || 
                                  actualSrc === '' || 
                                  actualSrc === window.location.href ||
                                  actualSrc.endsWith(window.location.pathname) ||
                                  actualSrc.endsWith('/') ||
                                  actualSrc.startsWith('file://') && actualSrc.endsWith('.html');
            
            const matchesDataSrc = actualSrc === dataSrc || actualSrc === dataSrcUrl;
            
            // 如果需要加载：空或页面URL，或者不匹配dataSrc
            if (isEmptyOrPage || !matchesDataSrc) {
                // 【关键修复】移除 loading="lazy" 属性，避免浏览器误判图片在视口外而阻止加载
                // 问题：浏览器看到 opacity:0 + loading="lazy" 会认为图片在视口外，拒绝加载
                if (img.hasAttribute('loading')) {
                    img.removeAttribute('loading');
                }
                
                // 设置优先级属性
                if (priority === 'high') {
                    img.setAttribute('fetchpriority', 'high');
                    img.setAttribute('loading', 'eager');
                } else {
                    // 对于预加载的情况，也确保移除lazy，但不设置eager（让浏览器决定）
                    // 可以设置fetchpriority为low，但先不设置loading属性
                    img.setAttribute('fetchpriority', 'low');
                }
                
                // 加载图片（设置src会触发浏览器加载）
                img.src = dataSrc;
                img.removeAttribute('data-src');
                console.log('[LazyLoad] 加载图片:', dataSrc, 'Priority:', priority, '已移除loading="lazy"');
            } else {
                // 已经有正确的src，移除data-src避免重复加载
                img.removeAttribute('data-src');
                console.log('[LazyLoad] 图片已有src，跳过:', actualSrc);
            }
        } else if (currentSrc && currentSrc !== '') {
            // 没有data-src但有src属性，确保图片正确显示
            const currentSrcUrl = currentSrc.startsWith('http') ? currentSrc : 
                                 (currentSrc.startsWith('/') ? window.location.origin + currentSrc : 
                                  window.location.origin + '/' + currentSrc);
            
            const needsSet = !actualSrc || 
                            actualSrc === '' || 
                            actualSrc === window.location.href ||
                            actualSrc.endsWith(window.location.pathname) ||
                            actualSrc !== currentSrc && actualSrc !== currentSrcUrl;
            
            if (needsSet) {
                img.src = currentSrc;
                console.log('[LazyLoad] 设置src:', currentSrc, 'actualSrc was:', actualSrc);
            }
        }
    }

    // 随机化幻灯片顺序（优先静态图片）- 使用sessionStorage保持一致性
    function shuffleSlides() {
        if (!slidesContainer || slides.length === 0) return;
        
        const slidesArray = Array.from(slides);
        
        // 获取当前页面的唯一标识
        const pageKey = 'slideshow_order_' + window.location.pathname;
        
        // 分离静态图片和视频 webp
        const staticImages = [];
        const videoImages = [];
        
        slidesArray.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                // 检查src或data-src（HTML中已经设置好了）
                const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                
                // 为每个slide添加唯一标识（用于sessionStorage）
                if (!slide.dataset.slideId) {
                    slide.dataset.slideId = src;
                }
                
                // 检测是否为视频 webp（文件名包含 webvideo）
                if (/webvideo/i.test(src)) {
                    videoImages.push(slide);
                } else {
                    staticImages.push(slide);
                }
            }
        });
        
        // 分别打乱两组（使用seeded random保持一致性）
        function shuffle(arr, seed) {
            // 如果有保存的顺序，使用保存的顺序
            const savedOrder = sessionStorage.getItem(pageKey);
            if (savedOrder) {
                return arr; // 稍后会重新排序
            }
            
            // 否则随机打乱
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }
        
        // 检查是否有保存的顺序
        const savedOrder = sessionStorage.getItem(pageKey);
        let orderedSlides;
        
        if (savedOrder) {
            // 使用保存的顺序
            console.log('[Slideshow] 使用保存的顺序:', pageKey);
            const orderArray = JSON.parse(savedOrder);
            orderedSlides = [];
            
            // 按保存的顺序重新排列
            orderArray.forEach(slideId => {
                const slide = slidesArray.find(s => s.dataset.slideId === slideId);
                if (slide) {
                    orderedSlides.push(slide);
                }
            });
            
            // 如果有新的slide，添加到末尾
            slidesArray.forEach(slide => {
                if (!orderedSlides.includes(slide)) {
                    orderedSlides.push(slide);
                }
            });
        } else {
            // 第一次访问，生成新的随机顺序
            console.log('[Slideshow] 生成新的随机顺序:', pageKey);
            shuffle(staticImages);
            shuffle(videoImages);
            
            // 需求1：如果同时有图片和视频，静态图片在前，视频在后（确保首张是静态图）
            // 需求2：如果全部是视频，优先选择较小的视频作为首张
            if (staticImages.length > 0) {
                // 有静态图片，直接合并：静态图片在前，视频在后
                orderedSlides = [...staticImages, ...videoImages];
                console.log('[Slideshow] 有静态图片，首张为静态图片');
            } else if (videoImages.length > 0) {
                // 全部是视频，需要优先选择较小的视频作为首张
                
                // 检查是否是installation页面
                const isInstallationPage = /installation/i.test(window.location.pathname);
                
                let selectedIndex = 0;
                
                if (isInstallationPage) {
                    // Installation页面特殊处理：从前三个最小的视频中随机选一个
                    // 三个最小的视频（根据文件大小）：
                    // 1. 2524_webvideo_008.webp (1.5 MB)
                    // 2. 2524_webvideo_009.webp (1.9 MB)
                    // 3. 2541_webvideo_009.webp (2 MB)
                    const smallestVideoPatterns = [
                        /2524_webvideo_008/i,
                        /2524_webvideo_009/i,
                        /2541_webvideo_009/i
                    ];
                    
                    // 找到这三个视频的索引
                    const smallestVideoIndices = [];
                    videoImages.forEach((slide, idx) => {
                        const img = slide.querySelector('img');
                        if (!img) return;
                        
                        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                        if (smallestVideoPatterns.some(pattern => pattern.test(src))) {
                            smallestVideoIndices.push(idx);
                        }
                    });
                    
                    if (smallestVideoIndices.length > 0) {
                        // 从这三个最小的视频中随机选一个
                        const randomIndex = Math.floor(Math.random() * smallestVideoIndices.length);
                        selectedIndex = smallestVideoIndices[randomIndex];
                        const selectedSrc = videoImages[selectedIndex].querySelector('img')?.getAttribute('src') || 
                                          videoImages[selectedIndex].querySelector('img')?.getAttribute('data-src') || 'unknown';
                        console.log('[Slideshow] Installation页面：从前三个最小的视频中随机选择了:', selectedSrc);
                    } else {
                        // 如果找不到这三个文件，使用通用策略
                        console.log('[Slideshow] Installation页面：未找到指定的三个最小视频，使用通用策略');
                        function getVideoPriority(slide) {
                            const img = slide.querySelector('img');
                            if (!img) return Infinity;
                            
                            const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                            
                            let priority = 1000;
                            
                            if (/compressed|small/i.test(src)) {
                                priority -= 100;
                            }
                            
                            const match = src.match(/_0*(\d+)/);
                            if (match) {
                                const num = parseInt(match[1]);
                                priority += num;
                            }
                            
                            return priority;
                        }
                        
                        let bestPriority = getVideoPriority(videoImages[0]);
                        for (let i = 1; i < videoImages.length; i++) {
                            const priority = getVideoPriority(videoImages[i]);
                            if (priority < bestPriority) {
                                bestPriority = priority;
                                selectedIndex = i;
                            }
                        }
                    }
                } else {
                    // 其他页面使用通用策略
                    function getVideoPriority(slide) {
                        const img = slide.querySelector('img');
                        if (!img) return Infinity;
                        
                        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                        
                        // 优先级评分：分数越小优先级越高
                        let priority = 1000;
                        
                        // 优先：包含"compressed"或"small"的文件
                        if (/compressed|small/i.test(src)) {
                            priority -= 100;
                        }
                        
                        // 其次：文件名中包含较小数字编号的（如_001, _002, _008）
                        const match = src.match(/_0*(\d+)/);
                        if (match) {
                            const num = parseInt(match[1]);
                            priority += num; // 编号越小，priority越小
                        }
                        
                        return priority;
                    }
                    
                    // 找到优先级最高（priority最小）的视频
                    let bestPriority = getVideoPriority(videoImages[0]);
                    
                    for (let i = 1; i < videoImages.length; i++) {
                        const priority = getVideoPriority(videoImages[i]);
                        if (priority < bestPriority) {
                            bestPriority = priority;
                            selectedIndex = i;
                        }
                    }
                    
                    const bestSrc = videoImages[selectedIndex].querySelector('img')?.getAttribute('src') || 
                                   videoImages[selectedIndex].querySelector('img')?.getAttribute('data-src') || 'unknown';
                    console.log('[Slideshow] 全部是视频，已优先选择较小的视频作为首张:', bestSrc);
                }
                
                // 将选中的视频放到第一个位置，其他保持随机顺序
                orderedSlides = [
                    videoImages[selectedIndex],
                    ...videoImages.slice(0, selectedIndex),
                    ...videoImages.slice(selectedIndex + 1)
                ];
            } else {
                orderedSlides = [];
            }
            
            // 保存顺序到sessionStorage
            const orderArray = orderedSlides.map(slide => slide.dataset.slideId);
            sessionStorage.setItem(pageKey, JSON.stringify(orderArray));
            
            // 同时保存首图路径（供预加载使用）
            if (orderedSlides.length > 0) {
                const firstImg = orderedSlides[0].querySelector('img');
                if (firstImg) {
                    const firstSrc = firstImg.getAttribute('src') || firstImg.getAttribute('data-src');
                    sessionStorage.setItem(pageKey + '_first', firstSrc);
                    console.log('[Slideshow] 保存首图:', firstSrc);
                }
            }
        }
        
        // 使用 DocumentFragment 避免多次重排
        const fragment = document.createDocumentFragment();
        orderedSlides.forEach((slide, idx) => {
            slide.classList.remove('active');
            const img = slide.querySelector('img');
            if (img) {
                // 第一张保持src，其他清空src（只保留data-src用于懒加载）
                if (idx === 0) {
                    slide.classList.add('active');
                    currentSlide = 0;
                    // 确保第一张有src
                    const firstSrc = img.getAttribute('src') || img.getAttribute('data-src');
                    if (firstSrc) {
                        // 同时设置HTML属性和DOM属性，确保图片能立即加载
                        img.setAttribute('src', firstSrc);
                        img.src = firstSrc; // 确保DOM属性也被设置
                        img.removeAttribute('data-src');
                        console.log('[Shuffle] 第一张slide设置src:', firstSrc);
                    }
                } else {
                    // 非第一张：清空src（HTML属性和DOM属性都要清空），确保只有data-src
                    const dataSrc = img.getAttribute('data-src');
                    if (dataSrc) {
                        // 清空HTML属性
                        img.removeAttribute('src');
                        // 清空DOM属性（重要！removeAttribute不会清空img.src）
                        img.src = '';
                        img.setAttribute('data-src', dataSrc);
                        console.log('[Shuffle] 清空src，保留data-src:', dataSrc);
                    }
                }
            }
            fragment.appendChild(slide);
        });
        
        // 一次性替换
        slidesContainer.innerHTML = '';
        slidesContainer.appendChild(fragment);
        
        // 标记已随机化
        slidesContainer.setAttribute('data-shuffled', '1');
        
        // 重新获取 slides 引用
        slides = document.querySelectorAll('.slide');
        totalSlides = slides.length;
        
        // 立即加载首张图片
        if (slides.length > 0) {
            const firstImg = slides[0].querySelector('img');
            lazyLoadImage(slides[0], 'high');
            
            // 确保第一张slide立即显示（隐藏loading）
            // 如果图片已加载，立即隐藏loading；否则等待加载完成
            if (firstImg && firstImg.complete && firstImg.naturalHeight !== 0) {
                slidesContainer.setAttribute('data-loaded', '1');
            } else if (firstImg) {
                firstImg.addEventListener('load', function() {
                    slidesContainer.setAttribute('data-loaded', '1');
                }, { once: true });
                // 超时保护：3秒后强制隐藏loading
                setTimeout(function() {
                    slidesContainer.setAttribute('data-loaded', '1');
                }, 3000);
            } else {
                // 没有图片，立即隐藏loading
                slidesContainer.setAttribute('data-loaded', '1');
            }
            
            // 预加载第2-3张（延迟稍长，确保shuffleSlides完全完成）
            if (slides.length > 1) {
                setTimeout(function() { 
                    const secondSlide = document.querySelectorAll('.slide')[1];
                    if (secondSlide) {
                        lazyLoadImage(secondSlide, 'low');
                        console.log('[Preload] 预加载第2张图片');
                    }
                }, 300);
            }
            if (slides.length > 2) {
                setTimeout(function() { 
                    const thirdSlide = document.querySelectorAll('.slide')[2];
                    if (thirdSlide) {
                        lazyLoadImage(thirdSlide, 'low');
                        console.log('[Preload] 预加载第3张图片');
                    }
                }, 400);
            }
        }
        
        // shuffleSlides后，重新绑定点击事件（因为innerHTML被清空，事件监听器丢失）
        // 重新获取slides和按钮的引用
        const newSlides = document.querySelectorAll('.slide');
        const newPrevBtn = document.querySelector('.slider-nav.prev');
        const newNextBtn = document.querySelector('.slider-nav.next');
        
        // 重新绑定按钮点击事件
        if (newPrevBtn && newNextBtn && prevBtn && nextBtn) {
            // 移除旧的事件监听器（如果有）
            const newPrevClone = newPrevBtn.cloneNode(true);
            newPrevBtn.parentNode.replaceChild(newPrevClone, newPrevBtn);
            const newNextClone = newNextBtn.cloneNode(true);
            newNextBtn.parentNode.replaceChild(newNextClone, newNextBtn);
            
            // 获取新的按钮引用
            const finalPrevBtn = document.querySelector('.slider-nav.prev');
            const finalNextBtn = document.querySelector('.slider-nav.next');
            
            if (finalPrevBtn && finalNextBtn) {
                finalPrevBtn.addEventListener('click', function() {
                    handleManualSlide('prev');
                });
                finalNextBtn.addEventListener('click', function() {
                    handleManualSlide('next');
                });
            }
        }
        
        // 重新绑定slide点击事件（点击slide切换到下一张）
        newSlides.forEach(slide => {
            slide.addEventListener('click', function() {
                handleManualSlide('next');
            });
        });
    }
    
    // 等待首张图片加载完成后再启动自动轮播
    let slideInterval;
    let autoplayStarted = false;
    let firstImageLoadTime = 0;
    let firstImageLoadStartTime = 0;
    let firstTransitionTimeout = null;
    let waitingForFirstTransition = false;
    
    function startAutoplay(delay = 0) {
        if (autoplayStarted) return;

        autoplayStarted = true;
        slidesContainer.setAttribute('data-loaded', '1');

        // 如果需要延迟首轮切换，则等待后再开始常规轮播
        if (delay > 0) {
            waitingForFirstTransition = true;
            firstTransitionTimeout = setTimeout(function() {
                waitingForFirstTransition = false;
                firstTransitionTimeout = null;
                nextSlide();
                // 对于首轮切换后的常规轮播，交由handleVideoSlide中统一设置
            }, delay);
            console.log('Autoplay first transition scheduled after:', delay + 'ms');
        } else {
            waitingForFirstTransition = false;
            if (firstTransitionTimeout) {
                clearTimeout(firstTransitionTimeout);
                firstTransitionTimeout = null;
            }
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 6000);
            console.log('Autoplay started immediately');
        }
    }
    
    // 检测首张图片加载并启动自动播放的函数
    function checkFirstImageAndStartAutoplay() {
        // 如果没有幻灯片，不启动轮播
        if (totalSlides === 0) return;
        
        // 等待一小段时间，确保 shuffleSlides 完全完成
        setTimeout(function() {
            const firstSlide = slidesContainer.querySelector('.slide.active');
            if (firstSlide) {
                const firstImg = firstSlide.querySelector('img');
                if (firstImg) {
                    firstImageLoadStartTime = Date.now();
                    
                    // 检查图片是否已经加载完成
                    if (firstImg.complete && firstImg.naturalHeight !== 0) {
                        // 图片已加载完成
                        firstImageLoadTime = Date.now() - firstImageLoadStartTime;
                        console.log('First image already loaded, load time:', firstImageLoadTime + 'ms');
                        
                        // 确保第一张图片在加载完成后至少展示 6 秒
                        const desiredDisplayTime = 6000;
                        const waitTime = Math.max(0, desiredDisplayTime - firstImageLoadTime);
                        startAutoplay(waitTime);
                    } else {
                        // 等待图片加载
                        firstImg.addEventListener('load', function() {
                            firstImageLoadTime = Date.now() - firstImageLoadStartTime;
                            console.log('First image loaded in', firstImageLoadTime + 'ms');
                            
                            // 确保第一张图片在加载完成后至少展示 6 秒
                            const desiredDisplayTime = 6000;
                            const waitTime = Math.max(0, desiredDisplayTime - firstImageLoadTime);
                            startAutoplay(waitTime);
                        }, { once: true });
                        
                        // 超时保护：最多等待 8 秒，然后至少再等 4 秒
                        setTimeout(function() {
                            if (!autoplayStarted) {
                                console.log('Timeout protection triggered after 8s');
                                // 即使图片未加载完成，也给予短暂缓冲后启动
                                startAutoplay(3000);
                            }
                        }, 8000);
                    }
                } else {
                    // 没有图片，直接启动
                    startAutoplay();
                }
            } else {
                // 没有激活的 slide，直接启动
                startAutoplay();
            }
        }, 100); // 等待100ms确保DOM完全更新
    }
    
    // 页面加载后立即执行随机化，然后检查第一张图片
    if (slides.length > 0) {
        shuffleSlides();
        // shuffleSlides 完成后，检查第一张图片并启动自动播放
        checkFirstImageAndStartAutoplay();
    } else {
        // 没有幻灯片，不启动轮播
        if (totalSlides === 0) return;
        checkFirstImageAndStartAutoplay();
    }

    // 显示指定索引的幻灯片
    function showSlide(index) {
        // 动态获取最新的 slides（每次切换时重新获取，确保获取到最新的DOM）
        const currentSlides = document.querySelectorAll('.slide');
        
        if (currentSlides.length === 0) return;
        
        // 更新totalSlides
        totalSlides = currentSlides.length;
        
        // 【关键修复】在给targetSlide加active之前，先把所有slide的行内样式重置，并移除active
        // 问题：之前设置了行内style.opacity='1'，切换时没有清除，导致所有slide都保持opacity:1
        // 解决：清除所有slide的行内样式，让CSS的.slide和.slide.active类来控制显示隐藏
        currentSlides.forEach(s => {
            s.classList.remove('active');
            s.style.opacity = '';
            s.style.zIndex = '';
        });
        
        // 处理循环
        if (index >= totalSlides) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = totalSlides - 1;
        } else {
            currentSlide = index;
        }
        
        // 使用当前的 slides 引用
        if (currentSlides[currentSlide]) {
            const targetSlide = currentSlides[currentSlide];
            // 只给目标slide加active类，不再写任何行内opacity
            // 显示隐藏统一交给CSS中的.slide和.slide.active来管理
            targetSlide.classList.add('active');
            
            // 延迟加载当前图片
            lazyLoadImage(targetSlide, 'high');
            console.log('[ShowSlide] 切换到slide', currentSlide, '，加载图片');
            
            // 【已删除】不再设置行内style.opacity，由CSS类控制显示
            // CSS: .slide { opacity: 0 } .slide.active { opacity: 1 !important; z-index: 2; }
            
            // 添加图片加载错误处理（不涉及显示控制）
            const targetImg = targetSlide.querySelector('img');
            if (targetImg && !targetImg.complete) {
                targetImg.addEventListener('error', function() {
                    console.error('[ShowSlide] 图片加载失败:', targetImg.src || targetImg.getAttribute('data-src'));
                }, { once: true });
            }
            
            // 预加载后续2-3张
            for (let i = 1; i <= 3; i++) {
                const nextIndex = (currentSlide + i) % totalSlides;
                if (currentSlides[nextIndex]) {
                    setTimeout(function() {
                        lazyLoadImage(currentSlides[nextIndex], 'low');
                    }, i * 50);
                }
            }
            
            // 处理视频播放
            handleVideoSlide(targetSlide);
        }
    }
    
    // 处理视频幻灯片
    function handleVideoSlide(slide) {
        // 清除之前的定时器
        if (window.videoTimeout) {
            clearTimeout(window.videoTimeout);
            window.videoTimeout = null;
        }
        
        // 清除自动轮播定时器
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
        if (firstTransitionTimeout) {
            clearTimeout(firstTransitionTimeout);
            firstTransitionTimeout = null;
        }
        
        // 检查当前幻灯片是否包含视频或动态webp
        const video = slide.querySelector('video');
        const img = slide.querySelector('img');
        
        // 检测是否是动态webp（文件名包含webvideo或路径包含webvideo）
        let isAnimatedWebp = false;
        if (img) {
            const imgSrc = img.getAttribute('src') || img.getAttribute('data-src') || img.src || '';
            if (imgSrc && (imgSrc.includes('webvideo') || imgSrc.includes('_webvideo_'))) {
                isAnimatedWebp = true;
                console.log("检测到动态webp:", imgSrc);
            }
        }
        
        // 暂停所有视频
        document.querySelectorAll('.slide video').forEach(v => {
            try {
                v.pause();
                // 如果视频有ended事件监听器，移除它
                v.onended = null;
            } catch (e) {
                console.error("暂停视频时出错:", e);
            }
        });
        
        if (video) {
            try {
                // 先移除旧的事件监听器
                video.onloadeddata = null;
                video.onended = null;
                video.onerror = null;
                
                // 延迟一小段时间确保DOM渲染完成
                setTimeout(() => {
                    // 重置视频时间
                    video.currentTime = 0;
                    
                    // 尝试播放视频
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log("视频成功播放");
                        }).catch(e => {
                            console.error("视频播放失败，尝试重试", e);
                            // 如果播放失败，再延迟重试一次
                            setTimeout(() => {
                                video.play().catch(e2 => {
                                    console.error("视频重试播放也失败，恢复自动轮播", e2);
                                    // 视频失败时，恢复6秒自动轮播
                                    if (autoplayStarted) {
                                        slideInterval = setInterval(nextSlide, 6000);
                                    }
                                });
                            }, 500);
                        });
                    }
                    
                    // 视频结束时切换到下一张
                    video.onended = function() {
                        nextSlide();
                    };
                    
                    // 视频加载错误时处理
                    video.onerror = function() {
                        console.error("视频加载错误");
                        // 视频错误时，恢复6秒自动轮播
                        if (autoplayStarted) {
                            slideInterval = setInterval(nextSlide, 6000);
                        }
                    };
                }, 100); // 延迟100ms确保DOM渲染
                
            } catch (e) {
                console.error("处理视频时出错:", e);
                // 出错时，恢复6秒自动轮播
                if (autoplayStarted) {
                    slideInterval = setInterval(nextSlide, 6000);
                }
            }
        } else if (isAnimatedWebp) {
            // 如果是动态webp，固定6秒切换（不启动自动轮播，用单独的定时器）
            console.log("检测到动态webp，将在6秒后切换");
            window.videoTimeout = setTimeout(() => {
                nextSlide();
            }, 6000);
        } else {
            // 如果不是视频/动态webp幻灯片，恢复6秒自动轮播
            if (autoplayStarted) {
                if (waitingForFirstTransition) {
                    return;
                }
                if (slideInterval) {
                    clearInterval(slideInterval);
                }
                slideInterval = setInterval(nextSlide, 6000);
            }
        }
    }

    // 下一张幻灯片
    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    // 上一张幻灯片
    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // 重置自动轮播
    function resetAutoSlide() {
        if (!autoplayStarted) return; // 如果还没启动，不重置
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
        if (firstTransitionTimeout) {
            clearTimeout(firstTransitionTimeout);
            firstTransitionTimeout = null;
        }
        waitingForFirstTransition = false;
        slideInterval = setInterval(nextSlide, 6000);
    }

    // 处理手动切换
    function handleManualSlide(direction) {
        // 清除自动轮播
        if (slideInterval) clearInterval(slideInterval);
        if (firstTransitionTimeout) {
            clearTimeout(firstTransitionTimeout);
            firstTransitionTimeout = null;
        }
        waitingForFirstTransition = false;
        
        // 清除视频定时器
        if (window.videoTimeout) {
            clearTimeout(window.videoTimeout);
            window.videoTimeout = null;
        }
        
        if (direction === 'next') {
            nextSlide();
        } else {
            prevSlide();
        }
        
        // 如果自动播放已启动，延迟后恢复（确保所有slide都使用6秒间隔）
        if (autoplayStarted) {
            // 统一使用6秒自动轮播，延迟3秒恢复（给用户时间查看当前slide）
            setTimeout(() => {
                resetAutoSlide();
            }, 3000);
        }
    }

    // 添加点击事件监听器
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            handleManualSlide('prev');
        });

        nextBtn.addEventListener('click', function() {
            handleManualSlide('next');
        });
    }

    // 为所有幻灯片添加点击事件，点击切换到下一张
    slides.forEach(slide => {
        slide.addEventListener('click', function() {
            handleManualSlide('next');
        });
    });
    
    // 初始化处理当前幻灯片（如果是视频）
    if (slides.length > 0) {
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            handleVideoSlide(activeSlide);
        }
    }
    
    // 确保所有视频元素都已正确加载
    document.querySelectorAll('video').forEach(video => {
        // 添加加载元数据事件处理
        video.addEventListener('loadedmetadata', function() {
            console.log("视频元数据已加载");
        });
        
        // 添加加载完成事件处理
        video.addEventListener('loadeddata', function() {
            console.log("视频数据已加载");
        });
        
        // 添加播放事件处理
        video.addEventListener('play', function() {
            console.log("视频开始播放");
        });
        
        // 添加错误事件处理
        video.addEventListener('error', function(e) {
            console.error("视频加载错误:", e);
            // 尝试显示替代图像
            const poster = video.getAttribute('poster');
            if (poster) {
                video.style.backgroundImage = `url(${poster})`;
                video.style.backgroundSize = 'cover';
                video.style.backgroundPosition = 'center';
            }
        });
    });
});

// 移动端菜单功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否是 sculpture 页面，如果是则跳过（sculpture 页面有自己的菜单处理逻辑）
    if (window.location.pathname.includes('sculpture.html')) {
        return;
    }
    
    const menuBtn = document.querySelector('.menu-btn');
    const navMobile = document.querySelector('.nav-mobile');
    
    // 确保菜单按钮存在后再绑定事件
    if (menuBtn && navMobile) {
        // 菜单点击处理函数（先定义）
        function handleMenuClick(event) {
            event.preventDefault();
            event.stopPropagation();
            navMobile.classList.toggle('active');
            menuBtn.classList.toggle('active');
            console.log('菜单按钮被点击，当前状态:', navMobile.classList.contains('active'));
        }
        
        // 文档点击处理函数（先定义）
        function handleDocumentClick(event) {
            if (menuBtn && navMobile && !menuBtn.contains(event.target) && !navMobile.contains(event.target)) {
                navMobile.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        }
        
        // 绑定点击事件
        menuBtn.addEventListener('click', handleMenuClick);
        
        // 点击页面其他区域关闭菜单
        document.addEventListener('click', handleDocumentClick);
        
        // 添加触摸事件支持（针对平板设备）
        menuBtn.addEventListener('touchstart', function(event) {
            event.preventDefault();
            handleMenuClick(event);
        }, { passive: false });
    }
});

// 全局 lightbox 图片滑动切换功能
(function() {
    let startX = 0;
    let endX = 0;
    document.addEventListener('DOMContentLoaded', function() {
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg) {
            lightboxImg.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    startX = e.touches[0].clientX;
                }
            });
            lightboxImg.addEventListener('touchmove', function(e) {
                if (e.touches.length === 1) {
                    endX = e.touches[0].clientX;
                }
            });
            lightboxImg.addEventListener('touchend', function(e) {
                if (startX && endX) {
                    let diff = endX - startX;
                    if (Math.abs(diff) > 40) {
                        if (typeof changeImage === 'function') {
                            if (diff < 0) {
                                changeImage(1);
                            } else {
                                changeImage(-1);
                            }
                        }
                    }
                }
                startX = 0;
                endX = 0;
            });
        }
    });
})();

// 查找所有gallery-item元素
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否是 sculpture 页面，如果是则跳过通用 lightbox 逻辑
    // sculpture 页面有自己的 lightbox 处理逻辑
    if (window.location.pathname.includes('sculpture.html')) {
        return;
    }
    
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    let currentIndex = 0;
    let images = [];
    let indexMap = {}; // 用于存储onclick索引到images数组索引的映射
    
    // Sculpture artwork信息（已移至 sculpture.html，此处保留用于其他可能的引用）
    const sculptureInfo = [
        { 
            src: "images/02sculpture/01_images/S_2017/2527_webpic_IMG_5545.webp",
            title: "anonymous_bob with bangs", 
            year: "2017", 
            medium: "cotton, glue, brass", 
            size: "W: 350mm, H: 350mm, D: 250mm" 
        },
        { 
            src: "images/02sculpture/01_images/S_2017/2527_webpic_IMG_5562.webp",
            title: "anonymous_braided hair", 
            year: "2017", 
            medium: "cotton, glue, brass", 
            size: "W: 350mm, H: 350mm, D: 250mm" 
        },
        { 
            src: "images/02sculpture/01_images/S_2017/2527_webpic_IMG_5573.webp",
            title: "anonymous girl_billiards ball", 
            year: "2017", 
            medium: "cotton, glue, billiards ball", 
            size: "W: 250mm, H: 500mm, D: 200mm" 
        }
    ];
    
    // Drawing 2025 - Swimmer artwork信息
    const drawingSwimmerInfo = [
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_01.webp",
            title: "dropping swimmer_01",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_02.webp",
            title: "dropping swimmer_02",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_03.webp",
            title: "dropping swimmer_03",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_04.webp",
            title: "dropping swimmer_04",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_05.webp",
            title: "dropping swimmer_05",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_06.webp",
            title: "dropping swimmer_06",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_07.webp",
            title: "dropping swimmer_07",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_08.webp",
            title: "dropping swimmer_08",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_09.webp",
            title: "dropping swimmer_09",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_10.webp",
            title: "dropping swimmer_10",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        }
    ];
    
    // Drawing 2025 - Object artwork信息
    const drawingObjectInfo = [
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_1.webp",
            title: "corner scissors",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_2.webp",
            title: "hole puncher",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_3.webp",
            title: "paint roller",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_4.webp",
            title: "kettle",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_5.webp",
            title: "mailbox",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_6.webp",
            title: "cup",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_7.webp",
            title: "Screw-cap container",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_8.webp",
            title: "Elementary school student",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_9.webp",
            title: "Japanese pillar box",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_10.webp",
            title: "hand mirror",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_11.webp",
            title: "iron kettle",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_12.webp",
            title: "Tools for picking blueberries",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_13.webp",
            title: "glasses",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_14.webp",
            title: "shade lamp",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_15.webp",
            title: "glass",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_16.webp",
            title: "paper fan",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_17.webp",
            title: "Comb",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_18.webp",
            title: "spatula",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_19.webp",
            title: "pliers",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_20.webp",
            title: "Broken telephone",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_21.webp",
            title: "reagent bottle",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_22.webp",
            title: "Glasses case",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_23.webp",
            title: "Lamp shade",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_24.webp",
            title: "Plastic container",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_25.webp",
            title: "torch",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_26.webp",
            title: "clip wallet",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_27.webp",
            title: "fruit basket",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_28.webp",
            title: "school bag",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        }
    ];
    
    // Dropping Swimmer 2025 artwork信息
    const droppingSwimmerInfo = [
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_01.jpg",
            title: "dropping swimmer_01",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_02.jpg",
            title: "dropping swimmer_02",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_03.jpg",
            title: "dropping swimmer_03",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_04.jpg",
            title: "dropping swimmer_04",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_05.jpg",
            title: "dropping swimmer_05",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_06.jpg",
            title: "dropping swimmer_06",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_07.jpg",
            title: "dropping swimmer_07",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_08.jpg",
            title: "dropping swimmer_08",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_09.jpg",
            title: "dropping swimmer_09",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/dropping_swimmer_10.jpg",
            title: "dropping swimmer_10",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm, D: 0mm"
        }
    ];

    // Drawing 2024 artwork信息
    const drawing2024Info = [
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8890.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8887.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8878.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8872.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8866.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8863.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8854.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8860.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8851.webp",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9102.webp",
            title: "turn around_bobbed hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9105.webp",
            title: "turn around_straight hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9108.webp",
            title: "turn around_twintail hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9110.webp",
            title: "turn around_bobbed hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9113.webp",
            title: "turn around_straight hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9116.webp",
            title: "turn around_twintail hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9174.webp",
            title: "turn around_One Length Bob Hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9180.webp",
            title: "turn around_glasses",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9189.webp",
            title: "turn around_long hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9200.webp",
            title: "turn around_One Length Bob Hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9206.webp",
            title: "turn around_long hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9212.webp",
            title: "turn around_glasses",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        }
    ];

    // Drawing 2023 artwork信息
    const drawing2023Info = [
        {
            src: "images/02drawing/01_images/D_2023/2501_web_IMG_8733_02.webp",
            title: "little off_there are seven",
            year: "2023",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 1340mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2501_web_IMG_8727_02.webp",
            title: "little off_there are nine",
            year: "2023",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 1340mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2501_web_IMG_8721_02.webp",
            title: "little off_there are eight",
            year: "2023",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 1340mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_01.webp",
            title: "When a necklace breaks,..._01",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_02.webp",
            title: "When a necklace breaks,..._02",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_03.webp",
            title: "When a necklace breaks,..._03",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_04.webp",
            title: "When a necklace breaks,..._04",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_05.webp",
            title: "When a necklace breaks,..._05",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_06.webp",
            title: "When a necklace breaks,..._06",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        }
    ];

    // Drawing 2022 artwork信息
    const drawing2022Info = [
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8715.webp",
            title: "Endless_Untitled 2",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 760mm, H: 760mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8712.webp",
            title: "Endless_Untitled 1",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 960mm, H: 960mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8707.webp",
            title: "little off_there are five",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8710.webp",
            title: "little off_there are six",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8652.webp",
            title: "Endless_Untitled 3",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 720mm, D: 10mm"
        }
    ];

    // Drawing 2021 artwork信息
    const drawing2021Info = [
        {
            src: "images/02drawing/01_images/D_2021/2521_webpic_IMG_8608.webp",
            title: "little off_there are two",
            year: "2021",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 650mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2021/2521_webpic_IMG_8600.webp",
            title: "little off_there are three",
            year: "2021",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 650mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2021/2521_webpic_IMG_8612.webp",
            title: "little off_there are four",
            year: "2021",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 950mm, D: 10mm"
        }
    ];

    // Drawing 2019 artwork信息
    const drawing2019Info = [
        {
            src: "images/02drawing/01_images/D_2019/1939_ipad_IMG_7941.webp",
            title: "little off_DIVE",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 573mm, H: 720mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1939_ipad_IMG_7715.webp",
            title: "little off_SWIN",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 960mm, H: 670mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7929.webp",
            title: "little off_SPIKE",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 573mm, H: 720mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7897.webp",
            title: "little off_BLACK SWAN",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 570mm, H: 570mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7902.webp",
            title: "little off_BARD CAGE",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 570mm, H: 475mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7909.webp",
            title: "little off_BLACK SWANS",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 570mm, H: 570mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7893.webp",
            title: "little off_BLACK BARD",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 570mm, H: 405mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1939_ipad_IMG_7742.webp",
            title: "little off_FLY",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 650mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7887.webp",
            title: "little off_there is one",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 650mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7923.webp",
            title: "little off_FLY",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 573mm, H: 720mm, D: 10mm"
        }
    ];

    // Drawing 2016 artwork信息
    const drawing2016Info = [
        {
            src: "images/02drawing/01_images/D_2016/2521_webpic_drawing_IMG_3891.webp",
            title: "on the stage_yellow skirt",
            year: "2016",
            medium: "pencil, oil pastel, pin hole, paper",
            size: "W: 650mm, H: 500mm"
        },
        {
            src: "images/02drawing/01_images/D_2016/2521_webpic_drawing_IMG_3892.webp",
            title: "on the stage_dark bule skirt",
            year: "2016",
            medium: "pencil, oil pastel, pin hole, paper",
            size: "W: 650mm, H: 500mm"
        }
    ];

    // 收集所有图片
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            // 优先使用 data-original-src（用于响应式图片的原图路径）
            // 然后是 data-src（懒加载），最后是 src
            const imgSrc = img.dataset.originalSrc || img.dataset.src || img.src;
            
            // 从onclick属性中提取索引
            let onclickMatch = img.getAttribute('onclick') ? img.getAttribute('onclick').match(/\d+/) : null;
            let onclickIndex = onclickMatch ? parseInt(onclickMatch[0]) : index;
            
            // 查找对应的artwork信息
            let artworkInfo = null;
            
            // 根据图片路径确定作品类型
            if (imgSrc.includes('sculpture')) {
                artworkInfo = sculptureInfo.find(info => imgSrc.includes(info.src.split('/').pop()));
            } else if (imgSrc.includes('dropping_swimmer')) {
                artworkInfo = drawingSwimmerInfo.find(info => imgSrc.includes(info.src.split('/').pop()));
            } else if (imgSrc.includes('object')) {
                artworkInfo = drawingObjectInfo.find(info => imgSrc.includes(info.src.split('/').pop()));
            } else if (imgSrc.includes('D_2024')) {
                artworkInfo = drawing2024Info.find(info => imgSrc.includes(info.src.split('/').pop()));
            } else if (imgSrc.includes('D_2023')) {
                artworkInfo = drawing2023Info.find(info => imgSrc.includes(info.src.split('/').pop()));
            } else if (imgSrc.includes('D_2022')) {
                // 使用文件名精确匹配，避免混淆
                const fileName = imgSrc.split('/').pop();
                artworkInfo = drawing2022Info.find(info => info.src.includes(fileName));
            } else if (imgSrc.includes('D_2021')) {
                // 使用文件名精确匹配，避免混淆
                const fileName = imgSrc.split('/').pop();
                artworkInfo = drawing2021Info.find(info => info.src.includes(fileName));
            } else if (imgSrc.includes('D_2019')) {
                // 使用文件名精确匹配，避免混淆
                const fileName = imgSrc.split('/').pop();
                artworkInfo = drawing2019Info.find(info => info.src.includes(fileName));
            } else if (imgSrc.includes('D_2016')) {
                // 使用文件名精确匹配，避免混淆
                const fileName = imgSrc.split('/').pop();
                artworkInfo = drawing2016Info.find(info => info.src.includes(fileName));
            }
            
            // 存储图片路径、索引和信息
            images.push({
                src: imgSrc,
                index: onclickIndex,
                info: artworkInfo
            });
            
            // 创建索引映射
            indexMap[onclickIndex] = images.length - 1;
            
            // 点击缩略图打开lightbox
            img.addEventListener('click', function(e) {
                e.preventDefault();
                // 使用img元素的onclick属性中的索引
                if (onclickMatch) {
                    currentIndex = indexMap[onclickIndex];
                    openLightboxWithImage(images[currentIndex].src, images[currentIndex].info);
                }
            });
        }
    });

    // 按照onclick索引排序images数组
    images.sort((a, b) => a.index - b.index);

    // 打开lightbox并加载图片
    function openLightboxWithImage(src, info) {
        // 显示lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        // 重置lightbox滚动位置
        lightbox.scrollTop = 0;
        
        // 创建新图片对象预加载
        const img = new Image();
        img.onload = function() {
            // 图片加载完成后设置src
            lightboxImg.src = src;
        };
        img.onerror = function() {
            console.error('图片加载失败:', src);
            lightboxImg.src = ''; // 清空图片源
            lightboxImg.alt = '图片加载失败';
        };
        img.src = src;
        
        // 如果没有找到匹配的info，尝试通过文件名再次查找
        if (!info) {
            const fileName = src.split('/').pop();
            
            // 根据文件名和路径确定作品类型
            if (src.includes('D_2022')) {
                info = drawing2022Info.find(item => item.src.includes(fileName));
            } else if (src.includes('D_2021')) {
                info = drawing2021Info.find(item => item.src.includes(fileName));
            } else if (src.includes('D_2019')) {
                info = drawing2019Info.find(item => item.src.includes(fileName));
            } else if (src.includes('D_2016')) {
                info = drawing2016Info.find(item => item.src.includes(fileName));
            }
        }
        
        // 更新artwork信息
        updateArtworkInfo(info);
    }
    
    // 更新artwork信息
    function updateArtworkInfo(info) {
        const titleElement = document.getElementById('artwork-title');
        const yearElement = document.getElementById('artwork-year');
        const mediumElement = document.getElementById('artwork-medium');
        const sizeElement = document.getElementById('artwork-size');
        
        if (titleElement) {
            titleElement.textContent = info && info.title ? info.title : 'Untitled';
        }
        
        if (yearElement) {
            yearElement.textContent = info && info.year ? info.year : '';
        }
        
        if (mediumElement) {
            mediumElement.textContent = info && info.medium ? info.medium : '';
        }
        
        if (sizeElement) {
            sizeElement.textContent = info && info.size ? info.size : '';
        }
    }

    // 关闭lightbox
    window.closeLightbox = function() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // 恢复滚动
    };

    // 切换图片
    window.changeImage = function(step) {
        currentIndex = (currentIndex + step + images.length) % images.length;
        
        // 重置lightbox滚动位置
        if (lightbox) {
            lightbox.scrollTop = 0;
        }
        
        openLightboxWithImage(images[currentIndex].src, images[currentIndex].info);
        if (event) event.stopPropagation();
    };

    // 键盘导航
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            changeImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeImage(1);
        }
    });
    
    // 为关闭按钮添加事件
    const closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    // 为前进后退按钮添加事件
    const prevBtn_elem = document.getElementById('lightbox-prev');
    if (prevBtn_elem) {
        prevBtn_elem.addEventListener('click', function() {
            changeImage(-1);
        });
    }
    
    const nextBtn_elem = document.getElementById('lightbox-next');
    if (nextBtn_elem) {
        nextBtn_elem.addEventListener('click', function() {
            changeImage(1);
        });
    }

    // 直接通过索引打开灯箱
    window.openLightbox = function(index) {
        console.log("打开灯箱，索引:", index);
        
        // 重置lightbox滚动位置
        if (lightbox) {
            lightbox.scrollTop = 0;
        }
        
        if (indexMap[index] !== undefined) {
            currentIndex = indexMap[index];
            openLightboxWithImage(images[currentIndex].src, images[currentIndex].info);
        } else {
            // 如果找不到映射，尝试直接使用索引或查找最接近的索引
            let foundIndex = -1;
            
            // 首先尝试精确匹配
            for (let i = 0; i < images.length; i++) {
                if (images[i].index === index) {
                    foundIndex = i;
                    break;
                }
            }
            
            // 如果找不到精确匹配，尝试查找最接近的索引
            if (foundIndex === -1) {
                // 获取所有可用的索引
                const availableIndices = Object.keys(indexMap).map(Number);
                
                // 如果有可用索引，找到最接近的一个
                if (availableIndices.length > 0) {
                    // 按照与目标索引的差值排序
                    availableIndices.sort((a, b) => Math.abs(a - index) - Math.abs(b - index));
                    const closestIndex = availableIndices[0];
                    foundIndex = indexMap[closestIndex];
                    console.log("找不到精确索引，使用最接近的索引:", closestIndex);
                }
            }
            
            if (foundIndex !== -1) {
                currentIndex = foundIndex;
                openLightboxWithImage(images[currentIndex].src, images[currentIndex].info);
            } else {
                console.error("无法找到索引:", index);
            }
        }
    };
});