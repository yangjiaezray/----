/*
 script.js
 欧美文艺简约风 — 滚动渐入动画 + 回到顶部
 Lightweight scroll reveal and back-to-top.
*/

(function () {
  'use strict';

  var observer;
  var revealClass = 'reveal';
  var visibleClass = 'visible';

  function init() {
    // 给需要动画的元素添加 reveal class
    var targets = document.querySelectorAll(
      'section, .avatar, .intro h1, .intro .subtitle, .intro .tagline, .intro p:last-child, .trait-card, .timeline-item, .interest-card, .goal-item, .now-item'
    );

    targets.forEach(function (el) {
      el.classList.add(revealClass);
    });

    // 设置 IntersectionObserver
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add(visibleClass);
              // 显示后不再观察，保持可见
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      document.querySelectorAll('.' + revealClass).forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // 低版本浏览器直接显示
      document.querySelectorAll('.' + revealClass).forEach(function (el) {
        el.classList.add(visibleClass);
      });
    }

    // 回到顶部按钮
    initBackToTop();
  }

  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    var ticking = false;

    function updateBtn() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateBtn);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();