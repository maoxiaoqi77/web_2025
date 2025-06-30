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
            try {
                v.pause();
                // 如果视频有ended事件监听器，移除它
                v.onended = null;
            } catch (e) {
                console.error("暂停视频时出错:", e);
            }
        });
        
        // 如果当前幻灯片包含视频
        if (video) {
            try {
                // 重置视频时间并播放
                video.currentTime = 0;
                
                // 尝试播放视频
                const playPromise = video.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // 视频成功播放
                        console.log("视频成功播放");
                    }).catch(e => {
                        console.error("视频播放失败，恢复自动轮播", e);
                        // 如果视频播放失败，恢复自动轮播
                        resetAutoSlide();
                    });
                }
                
                // 视频结束时切换到下一张
                video.onended = function() {
                    nextSlide();
                    // 视频播放完毕后，重新开始自动轮播
                    resetAutoSlide();
                };
                
                // 视频加载错误时处理
                video.onerror = function() {
                    console.error("视频加载错误");
                    resetAutoSlide();
                };
            } catch (e) {
                console.error("处理视频时出错:", e);
                resetAutoSlide();
            }
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

    // 鼠标悬停时暂停自动轮播
    const slider = document.querySelector('.slider');
    if (slider) {
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
    }
    
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

// 查找所有gallery-item元素
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    let currentIndex = 0;
    let images = [];
    let indexMap = {}; // 用于存储onclick索引到images数组索引的映射
    
    // Sculpture artwork信息
    const sculptureInfo = [
        { 
            src: "images/02sculpture/01_images/S_2022/2527_webpic_IMG_0757_03.jpg",
            title: "sound of kettle", 
            year: "2020", 
            medium: "kettle, sound, soundsystem", 
            size: "W: 200mm, H: 600mm, D: 200mm" 
        },
        { 
            src: "images/02sculpture/01_images/S_2022/2527_webpic_IMG_0772.jpg",
            title: "sound of a dog", 
            year: "2020", 
            medium: "mixed media (cotton, glue, sound, soundsystem, lamp, sound-synchronized lighting)", 
            size: "Variable Dimensions" 
        },
        { 
            src: "images/02sculpture/01_images/S_2017/2527_webpic_IMG_5545.jpg",
            title: "anonymous_bob with bangs", 
            year: "2017", 
            medium: "cotton, glue, brass", 
            size: "W: 350mm, H: 350mm, D: 250mm" 
        },
        { 
            src: "images/02sculpture/01_images/S_2017/2527_webpic_IMG_5562.jpg",
            title: "anonymous_braided hair", 
            year: "2017", 
            medium: "cotton, glue, brass", 
            size: "W: 350mm, H: 350mm, D: 250mm" 
        },
        { 
            src: "images/02sculpture/01_images/S_2017/2527_webpic_IMG_5573.jpg",
            title: "anonymous girl_billiards ball", 
            year: "2017", 
            medium: "cotton, glue, billiards ball", 
            size: "W: 250mm, H: 500mm, D: 200mm" 
        }
    ];
    
    // Drawing 2025 - Swimmer artwork信息
    const drawingSwimmerInfo = [
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_01.jpg",
            title: "dropping swimmer_01",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_02.jpg",
            title: "dropping swimmer_02",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_03.jpg",
            title: "dropping swimmer_03",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_04.jpg",
            title: "dropping swimmer_04",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_05.jpg",
            title: "dropping swimmer_05",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_06.jpg",
            title: "dropping swimmer_06",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_07.jpg",
            title: "dropping swimmer_07",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_08.jpg",
            title: "dropping swimmer_08",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_09.jpg",
            title: "dropping swimmer_09",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/01_dropping_swimmer/2505_ipad_2504_kiyomi_drawing_swimmer_10.jpg",
            title: "dropping swimmer_10",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        }
    ];
    
    // Drawing 2025 - Object artwork信息
    const drawingObjectInfo = [
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_1.jpg",
            title: "corner scissors",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_2.jpg",
            title: "hole puncher",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_3.jpg",
            title: "paint roller",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_4.jpg",
            title: "kettle",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_5.jpg",
            title: "mailbox",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_6.jpg",
            title: "cup",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_7.jpg",
            title: "Screw-cap container",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_8.jpg",
            title: "Elementary school student",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_9.jpg",
            title: "Japanese pillar box",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_10.jpg",
            title: "hand mirror",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_11.jpg",
            title: "iron kettle",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_12.jpg",
            title: "Tools for picking blueberries",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_13.jpg",
            title: "glasses",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_14.jpg",
            title: "shade lamp",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_15.jpg",
            title: "glass",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_16.jpg",
            title: "paper fan",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_17.jpg",
            title: "Comb",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_18.jpg",
            title: "spatula",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_19.jpg",
            title: "pliers",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_20.jpg",
            title: "Broken telephone",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_21.jpg",
            title: "reagent bottle",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_22.jpg",
            title: "Glasses case",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_23.jpg",
            title: "Lamp shade",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_24.jpg",
            title: "Plastic container",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_25.jpg",
            title: "torch",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_26.jpg",
            title: "clip wallet",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_27.jpg",
            title: "fruit basket",
            year: "2025",
            medium: "oil pastel, paper",
            size: "W: 210mm, H: 297mm"
        },
        {
            src: "images/02drawing/01_images/D_2025/02_object/2504_ipad_kiyomi_drawing_object_28.jpg",
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
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8890.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8887.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8878.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8872.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8866.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8863.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8854.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8860.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2502_ipad_IMG_8851.jpg",
            title: "Just a Small Part of the Story",
            year: "2024",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9102.jpg",
            title: "turn around_bobbed hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9105.jpg",
            title: "turn around_straight hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9108.jpg",
            title: "turn around_twintail hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9110.jpg",
            title: "turn around_bobbed hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9113.jpg",
            title: "turn around_straight hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9116.jpg",
            title: "turn around_twintail hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9174.jpg",
            title: "turn around_One Length Bob Hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9180.jpg",
            title: "turn around_glasses",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9189.jpg",
            title: "turn around_long hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9200.jpg",
            title: "turn around_One Length Bob Hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9206.jpg",
            title: "turn around_long hair",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2024/2521_webpic_IMG_9212.jpg",
            title: "turn around_glasses",
            year: "2024",
            medium: "acrylic paint, ply-wood",
            size: "W: 720mm, H: 960mm, D: 12mm"
        }
    ];

    // Drawing 2023 artwork信息
    const drawing2023Info = [
        {
            src: "images/02drawing/01_images/D_2023/2501_web_IMG_8733_02.jpg",
            title: "little off_there are seven",
            year: "2023",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 1340mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2501_web_IMG_8727_02.jpg",
            title: "little off_there are nine",
            year: "2023",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 1340mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2501_web_IMG_8721_02.jpg",
            title: "little off_there are eight",
            year: "2023",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 1340mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_01.jpg",
            title: "When a necklace breaks,..._01",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_02.jpg",
            title: "When a necklace breaks,..._02",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_03.jpg",
            title: "When a necklace breaks,..._03",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_04.jpg",
            title: "When a necklace breaks,..._04",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_05.jpg",
            title: "When a necklace breaks,..._05",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        },
        {
            src: "images/02drawing/01_images/D_2023/2504_ipad_2351_drawing_06.jpg",
            title: "When a necklace breaks,..._06",
            year: "2023",
            medium: "acrylic paint, permanent marker, ply-wood with a slit on the back",
            size: "W: 210mm, H: 280mm, D: 12mm"
        }
    ];

    // Drawing 2022 artwork信息
    const drawing2022Info = [
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8715.jpg",
            title: "Endless_Untitled 2",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 760mm, H: 760mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8712.jpg",
            title: "Endless_Untitled 1",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 960mm, H: 960mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8707.jpg",
            title: "little off_there are five",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8710.jpg",
            title: "little off_there are six",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2022/2521_webpic_IMG_8652.jpg",
            title: "Endless_Untitled 3",
            year: "2022",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 950mm, D: 10mm"
        }
    ];

    // Drawing 2021 artwork信息
    const drawing2021Info = [
        {
            src: "images/02drawing/01_images/D_2021/2521_webpic_IMG_8608.jpg",
            title: "little off_there are two",
            year: "2021",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 650mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2021/2521_webpic_IMG_8600.jpg",
            title: "little off_there are three",
            year: "2021",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 650mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2021/2521_webpic_IMG_8612.jpg",
            title: "little off_there are four",
            year: "2021",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 950mm, D: 10mm"
        }
    ];

    // Drawing 2019 artwork信息
    const drawing2019Info = [
        {
            src: "images/02drawing/01_images/D_2019/1939_ipad_IMG_7941.jpg",
            title: "little off_DIVE",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 573mm, H: 720mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1939_ipad_IMG_7715.jpg",
            title: "little off_SWIN",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 960mm, H: 670mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7929.jpg",
            title: "little off_SPIKE",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 573mm, H: 720mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7897.jpg",
            title: "little off_BLACK SWAN",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 570mm, H: 570mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7902.jpg",
            title: "little off_BARD CAGE",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 570mm, H: 475mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7909.jpg",
            title: "little off_BLACK SWANS",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 570mm, H: 570mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7893.jpg",
            title: "little off_BLACK BARD",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 570mm, H: 405mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1939_ipad_IMG_7742.jpg",
            title: "little off_FLY",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 950mm, H: 650mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7887.jpg",
            title: "little off_there is one",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 650mm, H: 950mm, D: 10mm"
        },
        {
            src: "images/02drawing/01_images/D_2019/1938_ipad_IMG_7923.jpg",
            title: "little off_FLY",
            year: "2019",
            medium: "pencil, oil pastel, ply-wood with a slit on the back",
            size: "W: 573mm, H: 720mm, D: 10mm"
        }
    ];

    // Drawing 2016 artwork信息
    const drawing2016Info = [
        {
            src: "images/02drawing/01_images/D_2016/2521_webpic_drawing_IMG_3891.jpg",
            title: "on the stage_yellow skirt",
            year: "2016",
            medium: "pencil, oil pastel, pin hole, paper",
            size: "W: 650mm, H: 500mm"
        },
        {
            src: "images/02drawing/01_images/D_2016/2521_webpic_drawing_IMG_3892.jpg",
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
            // 处理懒加载图片，使用data-src属性或者src属性
            const imgSrc = img.dataset.src || img.src;
            
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
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    
    // 为前进后退按钮添加事件
    document.getElementById('lightbox-prev').addEventListener('click', function() {
        changeImage(-1);
    });
    
    document.getElementById('lightbox-next').addEventListener('click', function() {
        changeImage(1);
    });

    // 直接通过索引打开灯箱
    window.openLightbox = function(index) {
        console.log("打开灯箱，索引:", index);
        
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