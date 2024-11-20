// 添加滚动动画
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 优化视差滚动效果
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // 获取各个元素
    const heroContent = document.querySelector('.hero-content');
    const featuresSection = document.querySelector('#features');
    const installSection = document.querySelector('#install');
    
    // 计算每个部分的视差效果
    if (heroContent) {
        // 只在元素可见时应用视差效果
        const heroRect = heroContent.getBoundingClientRect();
        if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
            heroContent.style.transform = `translateY(${scrolled * 0.2}px)`; // 减小视差系数
            heroContent.style.opacity = 1 - (scrolled * 0.002); // 添加淡出效果
        }
    }

    // 为特性卡片添加视差效果
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = (rect.top - window.innerHeight * 0.5) * 0.1;
            card.style.transform = `translateY(${offset}px)`;
        }
    });

    // 为安装步骤添加视差效果
    document.querySelectorAll('.step').forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = (rect.top - window.innerHeight * 0.5) * 0.05;
            step.style.transform = `translateY(${offset}px)`;
        }
    });
});

// 添加入场动画
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // 添加延迟动画
            if (entry.target.classList.contains('feature-card')) {
                const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                entry.target.style.animationDelay = `${index * 0.2}s`;
            }
            if (entry.target.classList.contains('step')) {
                const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                entry.target.style.animationDelay = `${index * 0.3}s`;
            }
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px'
});

document.querySelectorAll('.feature-card, .step').forEach((el) => observer.observe(el));

// 添加平滑滚动处理
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateParallax();
            ticking = false;
        });
        ticking = true;
    }
});

function updateParallax() {
    const scrolled = window.pageYOffset;
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const centerPosition = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distanceFromCenter = centerPosition - viewportCenter;
        
        if (Math.abs(distanceFromCenter) < window.innerHeight) {
            const parallaxElements = section.querySelectorAll('[data-parallax]');
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.2;
                const yOffset = distanceFromCenter * speed;
                element.style.transform = `translateY(${yOffset}px)`;
            });
        }
    });
} 