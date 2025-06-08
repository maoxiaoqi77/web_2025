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
        clearInterval(slideInterval); // 暂停自动轮播
        if (direction === 'next') {
            nextSlide();
        } else {
            prevSlide();
        }
        // 3秒后恢复自动轮播
        setTimeout(() => {
            resetAutoSlide();
        }, 3000);
    }

    // 添加点击事件监听器
    prevBtn.addEventListener('click', function() {
        handleManualSlide('prev');
    });

    nextBtn.addEventListener('click', function() {
        handleManualSlide('next');
    });

    // 鼠标悬停时暂停自动轮播
    const slider = document.querySelector('.slider');
    slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slider.addEventListener('mouseleave', () => {
        resetAutoSlide();
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