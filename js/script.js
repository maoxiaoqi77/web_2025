// 轮播图功能
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    let currentSlide = 0;
    const totalSlides = slides.length;

    // 自动轮播定时器
    let slideInterval = setInterval(nextSlide, 6000);

    // 显示指定索引的幻灯片
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        
        // 处理循环
        if (index >= totalSlides) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = totalSlides - 1;
        } else {
            currentSlide = index;
        }
        
        slides[currentSlide].classList.add('active');
        
        // 处理视频播放
        handleVideoSlide(slides[currentSlide]);
    }
    
    // 处理视频幻灯片
    function handleVideoSlide(slide) {
        // 清除之前的定时器
        if (window.videoTimeout) {
            clearTimeout(window.videoTimeout);
            window.videoTimeout = null;
        }
        
        // 清除自动轮播定时器
        clearInterval(slideInterval);
        
        // 检查当前幻灯片是否包含视频
        const video = slide.querySelector('video');
        
        // 暂停所有视频
        document.querySelectorAll('.slide video').forEach(v => {
            v.pause();
            // 如果视频有ended事件监听器，移除它
            v.onended = null;
        });
        
        // 如果当前幻灯片包含视频
        if (video) {
            // 重置视频时间并播放
            video.currentTime = 0;
            video.play().catch(e => {
                console.log("视频播放失败，恢复自动轮播", e);
                // 如果视频播放失败，恢复自动轮播
                resetAutoSlide();
            });
            
            // 视频结束时切换到下一张
            video.onended = function() {
                nextSlide();
                // 视频播放完毕后，重新开始自动轮播
                resetAutoSlide();
            };
        } else {
            // 如果不是视频幻灯片，恢复自动轮播
            resetAutoSlide();
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
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 6000);
    }

    // 处理手动切换
    function handleManualSlide(direction) {
        // 清除自动轮播
        clearInterval(slideInterval);
        
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
        
        // 3秒后恢复自动轮播，但如果当前是视频幻灯片则不恢复
        const currentSlideElement = slides[currentSlide];
        if (!currentSlideElement.classList.contains('video-slide')) {
            setTimeout(() => {
                resetAutoSlide();
            }, 3000);
        }
    }

    // 添加点击事件监听器
    prevBtn.addEventListener('click', function() {
        handleManualSlide('prev');
    });

    nextBtn.addEventListener('click', function() {
        handleManualSlide('next');
    });

    // 为所有幻灯片添加点击事件，点击切换到下一张
    slides.forEach(slide => {
        slide.addEventListener('click', function() {
            handleManualSlide('next');
        });
    });

    // 鼠标悬停时暂停自动轮播
    const slider = document.querySelector('.slider');
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
        // 不暂停视频播放
    });
    slider.addEventListener('mouseleave', () => {
        // 如果当前不是视频幻灯片，则恢复自动轮播
        const currentSlideElement = slides[currentSlide];
        if (!currentSlideElement.classList.contains('video-slide')) {
            resetAutoSlide();
        }
    });
    
    // 初始化处理当前幻灯片（如果是视频）
    if (slides.length > 0) {
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            handleVideoSlide(activeSlide);
        }
    }
});

// 移动端菜单功能
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navMobile = document.querySelector('.nav-mobile');
    
    menuBtn.addEventListener('click', function() {
        navMobile.classList.toggle('active');
    });

    // 点击页面其他区域关闭菜单
    document.addEventListener('click', function(event) {
        if (!menuBtn.contains(event.target) && !navMobile.contains(event.target)) {
            navMobile.classList.remove('active');
        }
    });
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