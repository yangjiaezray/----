/*
 script.js
 欧美文艺简约风 — 滚动渐入动画
 Lightweight scroll reveal for sections and cards.
*/

(function () {
  'use strict';

  var observer;
  var revealClass = 'reveal';
  var visibleClass = 'visible';

  function init() {
    // 给需要动画的元素添加 reveal class
    var targets = document.querySelectorAll(
      'section, .project-card, .avatar, .intro h1, .intro .subtitle, .intro .tagline, .intro p:last-child'
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
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();