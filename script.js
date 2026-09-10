/*
 script.js
 欧美文艺简约风 — 滚动渐入动画 + 回到顶部 + 导航高亮 + 草方块
 Lightweight scroll reveal, back-to-top, nav scroll-spy, and floating MC block.
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
      document.querySelectorAll('.' + revealClass).forEach(function (el) {
        el.classList.add(visibleClass);
      });
    }

    initBackToTop();
    initNavScrollSpy();
    initScrollProgress();
  }

  // 回到顶部按钮
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

  // 导航滚动高亮 (scroll-spy)
  function initNavScrollSpy() {
    var navLinks = document.querySelectorAll('.nav-links a');
    if (!navLinks.length) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var section = document.querySelector(href);
        if (section) {
          sections.push({ link: link, section: section });
        }
      }
    });

    if (!sections.length) return;

    var ticking = false;

    function updateActive() {
      var scrollY = window.scrollY + 120; // offset for sticky header

      var active = null;
      sections.forEach(function (item) {
        if (item.section.offsetTop <= scrollY) {
          active = item;
        }
      });

      sections.forEach(function (item) {
        item.link.classList.remove('active');
      });

      if (active) {
        active.link.classList.add('active');
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateActive);
        ticking = true;
      }
    }, { passive: true });

    // 初始调用
    updateActive();
  }

  // 滚动进度条
  function initScrollProgress() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;

    var ticking = false;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(progress, 100) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();