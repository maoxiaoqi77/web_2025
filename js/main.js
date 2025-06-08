// 移动端菜单切换
const menuBtn = document.querySelector('.menu-btn');
const navMobile = document.querySelector('.nav-mobile');

menuBtn.addEventListener('click', () => {
    navMobile.classList.toggle('active');
    // 添加菜单按钮动画效果
    menuBtn.classList.toggle('active');
});

// 轮播图功能
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.slider-nav.prev');
const nextBtn = document.querySelector('.slider-nav.next');
let currentSlide = 0;
const totalSlides = slides.length;

function showSlide(n) {
    // 处理边界情况
    if (n >= totalSlides) {
        currentSlide = 0;
    } else if (n < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = n;
    }

    // 移除所有幻灯片的active类
    slides.forEach(slide => slide.classList.remove('active'));
    
    // 显示当前幻灯片
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
    slideInterval = setInterval(nextSlide, 5000);
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
prevBtn.addEventListener('click', () => handleManualSlide('prev'));
nextBtn.addEventListener('click', () => handleManualSlide('next'));

// 自动播放
let slideInterval = setInterval(nextSlide, 5000);

// 鼠标悬停时暂停自动播放
const slider = document.querySelector('.slider');
slider.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
});

// 鼠标离开时恢复自动播放
slider.addEventListener('mouseleave', () => {
    resetAutoSlide();
});

// 导航栏滚动效果
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
        // 向下滚动
        header.style.transform = 'translateY(-100%)';
    } else {
        // 向上滚动
        header.style.transform = 'translateY(0)';
    }
    
    // 当滚动到顶部时，移除阴影效果
    if (currentScroll === 0) {
        header.style.boxShadow = 'none';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }

    lastScrollTop = currentScroll;
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 