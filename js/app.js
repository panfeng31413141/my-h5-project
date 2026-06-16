/**
 * Jay H5 — V0.1
 * 周杰伦 16 套播放器皮肤宣发 H5
 */
(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 配置常量
   * -------------------------------------------------------------------------- */
  var PAGE = {
    HOME: 0,
    SKIN: 1,
    PLAYER: 2,
    SHARE: 3,
    FINAL: 4
  };

  var SKIN_COUNT = 16;

  var SKIN_NAMES = [
    '八度空间', '叶惠美', '七里香', '十一月的萧邦',
    '依然范特西', '我很忙', '魔杰座', '跨时代',
    '惊叹号', '十二新作', '哎呦不错哦', '周杰伦的床边故事',
    '最伟大的作品', '嘉年华', '范特西', 'JAY'
  ];

  var SKIN_COLORS = [
    '#6b4c2a', '#4a3728', '#3d5a4a', '#2c3e50',
    '#5c3d2e', '#4e342e', '#37474f', '#455a64',
    '#bf360c', '#33691e', '#4a148c', '#1a237e',
    '#b8860b', '#8b4513', '#2f4f4f', '#800020'
  ];

  var ANSWER_DATA = {
    A: {
      cover: 'assets/card-p4-cover.png',
      album: 'JAY',
      song: '可爱女人',
      desc: '2000年音乐梦境起点，青涩漂浮、天马行空'
    },
    B: {
      cover: 'assets/card-p4-cover.png', // TODO: 替换半岛铁盒专辑封面
      album: '八度空间',
      song: '半岛铁盒',
      desc: '2002年音乐梦境延伸，迷离叙事、复古未来'
    }
  };

  // TODO: 替换为正式 LRC 歌词
  var LYRICS = [
    { time: 0, text: '想要和你飞到宇宙中' },
    { time: 5, text: '想要和你融化在一起' },
    { time: 10, text: '想要和你到永远' },
    { time: 15, text: '想要和你到永远' },
    { time: 20, text: '想要和你飞到宇宙中' },
    { time: 25, text: '想要和你融化在一起' },
    { time: 30, text: '想要和你到永远' },
    { time: 35, text: '想要和你到永远' },
    { time: 40, text: '想要和你飞到宇宙中' },
    { time: 45, text: '想要和你融化在一起' },
    { time: 50, text: '想要和你到永远' },
    { time: 55, text: '想要和你到永远' }
  ];

  /* --------------------------------------------------------------------------
   * 运行时状态
   * -------------------------------------------------------------------------- */
  var state = {
    selectedSkinIndex: 0,
    selectedAnswer: null,
    audioPlaying: false,
    cardFlipped: false,
    shareReturnPage: PAGE.PLAYER,
    currentLyricIndex: 0
  };

  var mainSwiper = null;
  var skinSwiper = null;
  var skinSwiperInited = false;

  var dom = {};

  /* --------------------------------------------------------------------------
   * 工具函数
   * -------------------------------------------------------------------------- */
  function bindTap(el, handler) {
    if (!el) return;
    var locked = false;
    function run(e) {
      if (locked) return;
      locked = true;
      setTimeout(function () { locked = false; }, 350);
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      handler();
    }
    el.addEventListener('click', run);
    el.addEventListener('touchend', run, { passive: false });
  }

  function bindTapAll(selector, handler) {
    document.querySelectorAll(selector).forEach(function (el) {
      bindTap(el, handler);
    });
  }

  /* --------------------------------------------------------------------------
   * 页面导航
   * -------------------------------------------------------------------------- */
  function goToPage(index, instant) {
    if (mainSwiper) {
      mainSwiper.slideTo(index, instant ? 0 : undefined);
    } else {
      document.querySelectorAll('.main-swiper .swiper-slide').forEach(function (slide, i) {
        slide.style.display = i === index ? 'block' : 'none';
      });
    }
    if (index === PAGE.SKIN && !instant) initSkinSwiper();
  }

  function getCurrentPageIndex() {
    if (mainSwiper) return mainSwiper.activeIndex;
    var slides = document.querySelectorAll('.main-swiper .swiper-slide');
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].style.display !== 'none') return i;
    }
    return PAGE.HOME;
  }

  function goBack() {
    var idx = getCurrentPageIndex();
    if (idx === PAGE.HOME) return;
    if (idx === PAGE.SHARE) {
      goToPage(state.shareReturnPage, true);
      return;
    }
    if (idx === PAGE.PLAYER) {
      if (state.audioPlaying) toggleAudio();
      goToPage(PAGE.SKIN);
      resetQuizCard();
      return;
    }
    goToPage(idx - 1);
  }

  function openPage5(returnPage) {
    if (returnPage !== undefined) state.shareReturnPage = returnPage;
    if (state.audioPlaying) toggleAudio();
    goToPage(PAGE.SHARE, true);
  }

  function closePage5() {
    if (state.shareReturnPage === PAGE.HOME) {
      goToPage(PAGE.HOME, true);
      return;
    }
    goToPage(PAGE.FINAL);
    setTimeout(function () {
      if (dom.page6) dom.page6.scrollTop = 0;
    }, 300);
  }

  /* --------------------------------------------------------------------------
   * Page2 皮肤轮播
   * -------------------------------------------------------------------------- */
  function buildSkinPlaceholder(index) {
    var c1 = SKIN_COLORS[index];
    var c2 = SKIN_COLORS[(index + 3) % SKIN_COUNT];
    return '<div class="skin-placeholder" style="background:linear-gradient(160deg,' + c1 + ',' + c2 + ')">' +
      '<span class="skin-placeholder__num">' + (index + 1) + '</span>' +
      '<span class="skin-placeholder__hint">占位素材</span></div>';
  }

  function buildSkinSlides() {
    var html = '';
    for (var i = 0; i < SKIN_COUNT; i++) {
      var isAnimated = i % 4 === 1 || i % 4 === 3;
      var isDesignAsset = i === 0;
      var inner = '';

      if (isDesignAsset) {
        inner = '<img src="assets/skin-sample.png" alt="' + SKIN_NAMES[i] + '">';
      } else if (isAnimated) {
        inner = '<img class="is-pulse" src="assets/skin-sample.png" alt="' + SKIN_NAMES[i] + '">';
      } else {
        inner = buildSkinPlaceholder(i);
      }

      html += '<div class="swiper-slide">' +
        '<div class="skin-slide-inner' + (isAnimated ? ' is-animated' : '') + '">' +
        inner +
        '<span class="skin-label">' + SKIN_NAMES[i] + '</span>' +
        '</div></div>';
    }
    dom.skinSlides.innerHTML = html;
  }

  function initSkinSwiper() {
    if (skinSwiperInited || typeof Swiper === 'undefined') return;
    if (!document.querySelector('.skin-swiper')) return;
    skinSwiperInited = true;
    skinSwiper = new Swiper('.skin-swiper', {
      nested: true,
      slidesPerView: 'auto',
      centeredSlides: true,
      loop: true,
      spaceBetween: 12,
      slideToClickedSlide: true,
      observer: true,
      observeParents: true,
      on: {
        slideChange: function () {
          state.selectedSkinIndex = this.realIndex;
        }
      }
    });
  }

  function initMainSwiper() {
    if (typeof Swiper === 'undefined') return;
    try {
      mainSwiper = new Swiper('.main-swiper', {
        allowTouchMove: false,
        speed: 500,
        effect: 'slide',
        observer: true,
        observeParents: true,
        on: {
          slideChange: function () {
            if (this.activeIndex === PAGE.SKIN) initSkinSwiper();
          }
        }
      });
    } catch (err) {
      console.error('[JayH5] mainSwiper init failed:', err);
    }
  }

  /* --------------------------------------------------------------------------
   * Page3 播放器 & 音频
   * -------------------------------------------------------------------------- */
  function updatePlayerSkin(index) {
    if (index === 0) {
      dom.playerSkinDisplay.innerHTML = '<img src="assets/skin-sample.png" alt="播放器皮肤">';
      return;
    }
    var c1 = SKIN_COLORS[index];
    var c2 = SKIN_COLORS[(index + 3) % SKIN_COUNT];
    dom.playerSkinDisplay.innerHTML =
      '<div class="skin-placeholder" style="background:linear-gradient(160deg,' + c1 + ',' + c2 + ')">' +
      SKIN_NAMES[index] + '</div>';
  }

  function updateLyrics() {
    var t = dom.audio.currentTime;
    for (var i = LYRICS.length - 1; i >= 0; i--) {
      if (t >= LYRICS[i].time) {
        if (i !== state.currentLyricIndex) {
          state.currentLyricIndex = i;
          dom.lyricsCurrent.textContent = LYRICS[i].text;
          dom.lyricsCurrent.classList.remove('inactive');
          dom.lyricsCurrent.classList.add('active');
        }
        break;
      }
    }
  }

  function toggleAudio() {
    if (state.audioPlaying) {
      dom.audio.pause();
      dom.audioToggle.textContent = '▶';
      state.audioPlaying = false;
    } else {
      dom.audio.play().catch(function () {});
      dom.audioToggle.textContent = '❚❚';
      state.audioPlaying = true;
    }
  }

  /* --------------------------------------------------------------------------
   * Page3/4 答题卡片
   * -------------------------------------------------------------------------- */
  function resetQuizCard() {
    state.cardFlipped = false;
    state.selectedAnswer = null;
    dom.quizCard.classList.remove('is-flipped');
    dom.cardFlipWrap.classList.remove('is-flipped');
    dom.page3.classList.remove('card-flipped-state');
    document.querySelectorAll('.option').forEach(function (el) {
      el.classList.remove('selected');
    });
  }

  function updateCardBackContent(answerKey) {
    var data = ANSWER_DATA[answerKey];
    if (!data) return;
    dom.resultCover.src = data.cover;
    dom.resultTitle.innerHTML =
      '<span>' + data.album + '</span><span>·</span><span>周杰伦的播放器</span>';
    dom.resultSong.innerHTML =
      '<span class="label">灵感歌曲：</span><span class="value">' + data.song + '</span>';
    dom.resultDesc.textContent = data.desc;
  }

  function flipCardToPage4(answerKey) {
    updateCardBackContent(answerKey);
    state.cardFlipped = true;
    dom.quizCard.classList.add('is-flipped');
    dom.cardFlipWrap.classList.add('is-flipped');
    dom.page3.classList.add('card-flipped-state');
  }

  function onQuizOptionClick(opt) {
    if (state.cardFlipped) return;
    var answerKey = opt.dataset.answer;
    state.selectedAnswer = answerKey;
    document.querySelectorAll('.option').forEach(function (el) {
      el.classList.remove('selected');
    });
    opt.classList.add('selected');
    setTimeout(function () {
      flipCardToPage4(answerKey);
    }, 280);
  }

  function onContinueClick() {
    if (!dom.page3.classList.contains('card-flipped-state')) return;
    openPage5(PAGE.PLAYER);
  }

  function goToQuizFromPage6() {
    resetQuizCard();
    goToPage(PAGE.PLAYER);
  }

  /* --------------------------------------------------------------------------
   * DOM 缓存 & 事件绑定
   * -------------------------------------------------------------------------- */
  function cacheDom() {
    dom.skinSlides = document.getElementById('skin-slides');
    dom.audio = document.getElementById('bg-audio');
    dom.lyricsCurrent = document.getElementById('lyrics-current');
    dom.audioToggle = document.getElementById('audio-toggle');
    dom.playerSkinDisplay = document.getElementById('player-skin-display');
    dom.page3 = document.getElementById('page3');
    dom.page6 = document.getElementById('page6');
    dom.quizCard = document.getElementById('quiz-card');
    dom.cardFlipWrap = document.getElementById('card-flip-wrap');
    dom.btnContinue = document.getElementById('btn-continue');
    dom.btnCloseShare = document.getElementById('btn-close-share');
    dom.resultCover = document.getElementById('result-cover');
    dom.resultTitle = document.getElementById('result-title');
    dom.resultSong = document.getElementById('result-song');
    dom.resultDesc = document.getElementById('result-desc');
  }

  function bindEvents() {
    document.getElementById('btn-enter').addEventListener('click', function () {
      goToPage(PAGE.SKIN);
    });

    document.getElementById('btn-select-skin').addEventListener('click', function () {
      state.selectedSkinIndex = skinSwiper ? skinSwiper.realIndex : state.selectedSkinIndex;
      updatePlayerSkin(state.selectedSkinIndex);
      resetQuizCard();
      goToPage(PAGE.PLAYER);
      setTimeout(function () {
        if (!state.audioPlaying) toggleAudio();
      }, 600);
    });

    bindTapAll('.btn-back', goBack);
    bindTap(document.getElementById('btn-page1-share'), function () {
      openPage5(PAGE.HOME);
    });

    document.querySelectorAll('.option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        onQuizOptionClick(this);
      });
    });

    bindTap(dom.btnContinue, onContinueClick);
    bindTap(dom.btnCloseShare, closePage5);
    bindTap(document.getElementById('btn-page6-continue1'), goToQuizFromPage6);
    bindTap(document.getElementById('btn-page6-continue2'), goToQuizFromPage6);
    bindTapAll('.p6-btn3', function () {}); // TODO: 收藏专辑解锁播放器

    dom.audio.addEventListener('timeupdate', updateLyrics);
    dom.audioToggle.addEventListener('click', toggleAudio);
  }

  /* --------------------------------------------------------------------------
   * 初始化
   * -------------------------------------------------------------------------- */
  function init() {
    if (window._jayH5Inited) return;
    window._jayH5Inited = true;

    cacheDom();
    buildSkinSlides();
    initMainSwiper();
    bindEvents();
  }

  window.initJayH5 = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (typeof Swiper !== 'undefined') init();
    });
  } else if (typeof Swiper !== 'undefined') {
    init();
  }
})();
