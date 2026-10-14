/* =========================================================

   BRAND 1 — 이미지 슬라이더

========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const sliderViewport = document.querySelector(".brand-slider-viewport");

  const slides = Array.from(document.querySelectorAll(".brand-slide"));

  const prevButton = document.querySelector(".brand-slider-prev");

  const nextButton = document.querySelector(".brand-slider-next");

  const sliderSection = document.querySelector(".brand1-page .brand-change");



  if (

    !sliderViewport ||

    slides.length === 0 ||

    !prevButton ||

    !nextButton ||

    !sliderSection

  ) {

    return;

  }



  const AUTO_INTERVAL = 3000;

  let currentIndex = 0;

  let autoTimer = null;

  let isSectionVisible = false;



  function getSlidePosition(index) {

    return slides[index].offsetLeft - slides[0].offsetLeft;

  }



  function moveToSlide(index, behavior = "smooth") {

    currentIndex = (index + slides.length) % slides.length;

    sliderViewport.scrollTo({

      left: getSlidePosition(currentIndex),

      behavior

    });

  }



  function stopAutoSlide() {

    if (autoTimer) {

      window.clearInterval(autoTimer);

      autoTimer = null;

    }

  }



  function startAutoSlide() {

    stopAutoSlide();

    if (!isSectionVisible || document.hidden) return;



    autoTimer = window.setInterval(() => {

      if (!isSectionVisible || document.hidden) return;

      moveToSlide(currentIndex + 1);

    }, AUTO_INTERVAL);

  }



  function restartAutoSlide() {

    if (isSectionVisible) startAutoSlide();

  }



  prevButton.addEventListener("click", () => {

    moveToSlide(currentIndex - 1);

    restartAutoSlide();

  });



  nextButton.addEventListener("click", () => {

    moveToSlide(currentIndex + 1);

    restartAutoSlide();

  });



  const observer = new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (entry.target !== sliderSection) return;



        const shouldPlay =

          entry.isIntersecting && entry.intersectionRatio >= 0.35;



        if (shouldPlay === isSectionVisible) return;

        isSectionVisible = shouldPlay;



        if (isSectionVisible) {

          startAutoSlide();

        } else {

          stopAutoSlide();

        }

      });

    },

    {

      threshold: [0, 0.35, 0.6]

    }

  );



  observer.observe(sliderSection);



  let sliderResizeTimer = null;



  window.addEventListener("resize", () => {

    window.clearTimeout(sliderResizeTimer);



    sliderResizeTimer = window.setTimeout(() => {

      sliderViewport.scrollTo({

        left: getSlidePosition(currentIndex),

        behavior: "auto"

      });

    }, 150);

  });



  document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

      stopAutoSlide();

    } else if (isSectionVisible) {

      startAutoSlide();

    }

  });



  moveToSlide(0, "auto");

});



/* =========================================================

   BRAND 1 — 안전한 이동의 흐름

========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const safeFlow = document.querySelector(

    ".brand1-page .brand-safe-flow"

  );

  const safeFlowStage = document.querySelector(

    ".brand1-page .brand-safe-flow__stage"

  );

  const safeFlowVideo = document.querySelector(

    ".brand1-page .brand-safe-flow__video"

  );

  const safeFlowOverlay = document.querySelector(

    ".brand1-page .brand-safe-flow__overlay"

  );

  const safeFlowCopy = document.querySelector(

    ".brand1-page .brand-safe-flow__copy"

  );



  if (

    !safeFlow ||

    !safeFlowStage ||

    !safeFlowVideo ||

    !safeFlowOverlay ||

    !safeFlowCopy

  ) {

    return;

  }



  if (

    typeof gsap === "undefined" ||

    typeof ScrollTrigger === "undefined"

  ) {

    console.warn(

      "Brand1 Safe Flow: GSAP / ScrollTrigger가 로드되지 않았습니다."

    );

    return;

  }



  gsap.registerPlugin(ScrollTrigger);

  safeFlowVideo.muted = true;

  safeFlowVideo.playsInline = true;

  safeFlowVideo.pause();



  let safeFlowVideoStarted = false;



  function setSafeFlowVideoToStart() {

    safeFlowVideo.pause();



    try {

      safeFlowVideo.currentTime = 0;

    } catch (error) {

      // 메타데이터가 아직 준비되지 않은 경우 그대로 둔다.

    }

  }



  function playSafeFlowVideo() {

    if (safeFlowVideoStarted) return;

    safeFlowVideoStarted = true;



    const playPromise = safeFlowVideo.play();



    if (

      playPromise &&

      typeof playPromise.catch === "function"

    ) {

      playPromise.catch(() => {

        safeFlowVideoStarted = false;

      });

    }

  }



  function resetSafeFlowVideo() {

    safeFlowVideoStarted = false;

    setSafeFlowVideoToStart();

  }



  function resetSafeFlowVisual() {

    gsap.set(safeFlowCopy, {

      y: 0,

      opacity: 1

    });

    gsap.set(safeFlowOverlay, {

      yPercent: 0,

      opacity: 1

    });

    gsap.set(safeFlowVideo, {

      scale: 1.025

    });

  }



  resetSafeFlowVisual();



  const safeFlowTimeline = gsap.timeline({

    scrollTrigger: {

      trigger: safeFlow,

      start: "top top",

      end: "bottom bottom",

      scrub: 1,

      invalidateOnRefresh: true,



      onUpdate: self => {

        const progress = self.progress;



        if (progress >= 0.10) {

          playSafeFlowVideo();

        }



        if (progress <= 0.012) {

          resetSafeFlowVideo();

        }

      },



      onLeaveBack: () => {

        resetSafeFlowVideo();

        resetSafeFlowVisual();

      }

    }

  });



  safeFlowTimeline.to({}, {

    duration: 0.08

  });



  safeFlowTimeline.to(

    safeFlowCopy,

    {

      y: -90,

      opacity: 0,

      duration: 0.20,

      ease: "power2.in"

    },

    0.08

  );



  safeFlowTimeline.to(

    safeFlowOverlay,

    {

      yPercent: -100,

      duration: 0.34,

      ease: "power2.inOut"

    },

    0.10

  );



  safeFlowTimeline.to(

    safeFlowVideo,

    {

      scale: 1,

      duration: 0.34,

      ease: "power2.out"

    },

    0.10

  );



  safeFlowTimeline.to({}, {

    duration: 0.45

  });



  safeFlowVideo.addEventListener("ended", () => {

    safeFlowVideoStarted = false;

  });



  if (safeFlowVideo.readyState >= 1) {

    setSafeFlowVideoToStart();

  } else {

    safeFlowVideo.addEventListener(

      "loadedmetadata",

      setSafeFlowVideoToStart,

      { once: true }

    );

  }



  window.addEventListener("pageshow", event => {

    if (!document.body.classList.contains("brand1-page")) return;



    if (event.persisted) {

      resetSafeFlowVideo();

      resetSafeFlowVisual();

    }

  });



  let safeFlowResizeTimer = null;



  window.addEventListener(

    "resize",

    () => {

      window.clearTimeout(safeFlowResizeTimer);



      safeFlowResizeTimer = window.setTimeout(() => {

        ScrollTrigger.refresh();

      }, 160);

    },

    { passive: true }

  );

});



/* =========================================================

   BRAND 2 — 히어로 영상과 키워드

========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const brand2Page = document.querySelector(".brand2-page");

  if (!brand2Page) return;



  const brand2Hero = brand2Page.querySelector(".philosophy-hero");

  const brand2HeroVideo = brand2Page.querySelector(

    "[data-brand2-hero-video]"

  );

  const brand2Keywords = brand2Page.querySelector(

    "[data-brand2-keywords]"

  );



  let brand2VideoStarted = false;

  let brand2VideoCompleted = false;

  let brand2VideoPlaying = false;

  let brand2ReturningToHero = false;

  let brand2TouchStartY = null;

  let brand2HeroTop = null;

  let brand2ReturnTimer = null;



  const brand2KeywordButtons = Array.from(

    brand2Page.querySelectorAll("[data-keyword]")

  );

  const brand2KeywordMedia = Array.from(

    brand2Page.querySelectorAll("[data-keyword-media]")

  );

  const brand2KeywordCopies = Array.from(

    brand2Page.querySelectorAll("[data-keyword-copy]")

  );

  const brand2KeywordProgress = Array.from(

    brand2Page.querySelectorAll("[data-keyword-progress]")

  );



  const brand2KeywordNames = [

    "inclusive",

    "intuitive",

    "connected"

  ];



  let activeBrand2KeywordIndex = -1;

  let brand2KeywordTicking = false;



  function setBrand2Keyword(index) {

    const nextIndex = Math.max(

      0,

      Math.min(index, brand2KeywordNames.length - 1)

    );



    if (nextIndex === activeBrand2KeywordIndex) return;



    activeBrand2KeywordIndex = nextIndex;

    const activeName = brand2KeywordNames[nextIndex];



    brand2KeywordButtons.forEach(button => {

      const isActive = button.dataset.keyword === activeName;

      button.classList.toggle("is-active", isActive);

      button.setAttribute(

        "aria-selected",

        isActive ? "true" : "false"

      );

    });



    brand2KeywordMedia.forEach(media => {

      media.classList.toggle(

        "is-active",

        media.dataset.keywordMedia === activeName

      );

    });



    brand2KeywordCopies.forEach(copy => {

      copy.classList.toggle(

        "is-active",

        copy.dataset.keywordCopy === activeName

      );

    });



    brand2KeywordProgress.forEach(progress => {

      progress.classList.toggle(

        "is-active",

        progress.dataset.keywordProgress === activeName

      );

    });

  }



  function getBrand2HeroTop() {

    if (!brand2Hero) return 0;



    brand2HeroTop =

      window.scrollY +

      brand2Hero.getBoundingClientRect().top;



    return brand2HeroTop;

  }



  function isBrand2HeroCurrent() {

    if (!brand2Hero) return false;



    const rect = brand2Hero.getBoundingClientRect();



    return (

      rect.top <= 12 &&

      rect.bottom > window.innerHeight * 0.58

    );

  }



  function getBrand2KeywordScrollData() {

    if (!brand2Keywords) return null;



    const rect = brand2Keywords.getBoundingClientRect();

    const sectionTop = window.scrollY + rect.top;

    const scrollDistance = Math.max(

      1,

      brand2Keywords.offsetHeight - window.innerHeight

    );



    const progress = Math.max(

      0,

      Math.min(

        1,

        (window.scrollY - sectionTop) / scrollDistance

      )

    );



    return {

      sectionTop,

      scrollDistance,

      progress

    };

  }



  function isBrand2KeywordsVisible() {

    if (!brand2Keywords) return false;



    const rect = brand2Keywords.getBoundingClientRect();



    return (

      rect.top < window.innerHeight * 0.55 &&

      rect.bottom > window.innerHeight * 0.45

    );

  }



  function updateBrand2KeywordByScroll() {

    brand2KeywordTicking = false;



    if (

      !brand2Keywords ||

      brand2KeywordNames.length === 0

    ) {

      return;

    }



    const rect = brand2Keywords.getBoundingClientRect();



    if (

      rect.bottom <= 0 ||

      rect.top >= window.innerHeight

    ) {

      return;

    }



    const data = getBrand2KeywordScrollData();

    if (!data) return;



    const rawIndex = Math.floor(

      data.progress * brand2KeywordNames.length

    );

    const index = Math.min(

      brand2KeywordNames.length - 1,

      rawIndex

    );



    setBrand2Keyword(index);

  }



  function requestBrand2KeywordUpdate() {

    if (brand2KeywordTicking) return;



    brand2KeywordTicking = true;

    window.requestAnimationFrame(

      updateBrand2KeywordByScroll

    );

  }



  function resetBrand2HeroState() {

    brand2VideoStarted = false;

    brand2VideoCompleted = false;

    brand2VideoPlaying = false;



    if (brand2HeroVideo) {

      brand2HeroVideo.pause();



      try {

        brand2HeroVideo.currentTime = 0;

      } catch (error) {

        // 영상이 아직 준비되지 않은 경우 그대로 둔다.

      }

    }



    if (brand2Hero) {

      brand2Hero.classList.remove(

        "is-video-playing",

        "is-video-complete"

      );

    }



    brand2Page.classList.remove(

      "is-brand2-video-playing",

      "is-brand2-video-complete"

    );



    setBrand2Keyword(0);

  }



  function returnBrand2ToHero() {

    if (!brand2Hero || brand2ReturningToHero) return;



    brand2ReturningToHero = true;



    if (brand2ReturnTimer) {

      window.clearTimeout(brand2ReturnTimer);

      brand2ReturnTimer = null;

    }



    resetBrand2HeroState();



    window.scrollTo({

      top: getBrand2HeroTop(),

      left: 0,

      behavior: "smooth"

    });



    brand2ReturnTimer = window.setTimeout(() => {

      brand2ReturningToHero = false;

      brand2ReturnTimer = null;

    }, 850);

  }



  function completeBrand2Video() {

    if (brand2VideoCompleted) return;



    brand2VideoPlaying = false;

    brand2VideoCompleted = true;



    if (brand2Hero) {

      brand2Hero.classList.remove("is-video-playing");

      brand2Hero.classList.add("is-video-complete");

    }



    brand2Page.classList.remove("is-brand2-video-playing");

    brand2Page.classList.add("is-brand2-video-complete");



    setBrand2Keyword(0);



    if (brand2Keywords) {

      window.setTimeout(() => {

        brand2Keywords.scrollIntoView({

          behavior: "smooth",

          block: "start"

        });

      }, 120);

    }

  }



  function startBrand2Video() {

    if (

      !brand2HeroVideo ||

      brand2VideoStarted ||

      brand2VideoCompleted ||

      brand2ReturningToHero

    ) {

      return;

    }



    brand2VideoStarted = true;

    brand2VideoPlaying = true;



    if (brand2Hero) {

      brand2Hero.classList.add("is-video-playing");

      brand2Hero.classList.remove("is-video-complete");

    }



    brand2Page.classList.add("is-brand2-video-playing");

    brand2Page.classList.remove("is-brand2-video-complete");



    try {

      brand2HeroVideo.currentTime = 0;

    } catch (error) {

      // 영상이 아직 준비되지 않은 경우 그대로 둔다.

    }



    const playPromise = brand2HeroVideo.play();



    if (

      playPromise &&

      typeof playPromise.catch === "function"

    ) {

      playPromise.catch(() => {

        resetBrand2HeroState();

      });

    }

  }



  function handleBrand2HeroForwardIntent(event) {

    if (

      !brand2HeroVideo ||

      brand2VideoCompleted ||

      brand2ReturningToHero ||

      !isBrand2HeroCurrent()

    ) {

      return false;

    }



    if (event && event.cancelable) {

      event.preventDefault();

    }



    if (!brand2VideoStarted) {

      startBrand2Video();

    }



    return true;

  }



  function handleBrand2ReverseIntent(event) {

    if (brand2ReturningToHero) {

      if (event && event.cancelable) {

        event.preventDefault();

      }

      return true;

    }



    if (

      brand2VideoPlaying &&

      isBrand2HeroCurrent()

    ) {

      if (event && event.cancelable) {

        event.preventDefault();

      }



      resetBrand2HeroState();



      window.scrollTo({

        top: getBrand2HeroTop(),

        left: 0,

        behavior: "smooth"

      });



      return true;

    }



    if (

      brand2VideoCompleted &&

      activeBrand2KeywordIndex === 0 &&

      isBrand2KeywordsVisible()

    ) {

      if (event && event.cancelable) {

        event.preventDefault();

      }



      returnBrand2ToHero();

      return true;

    }



    return false;

  }



  if (brand2HeroVideo) {

    brand2HeroVideo.muted = true;

    brand2HeroVideo.playsInline = true;

    brand2HeroVideo.pause();

    brand2HeroVideo.addEventListener(

      "ended",

      completeBrand2Video

    );

  }



  if (brand2KeywordButtons.length > 0) {

    setBrand2Keyword(0);

  }



  window.addEventListener(

    "wheel",

    event => {

      const delta =

        Math.abs(event.deltaY) >= Math.abs(event.deltaX)

          ? event.deltaY

          : event.deltaX;



      if (delta === 0) return;



      if (delta < 0) {

        handleBrand2ReverseIntent(event);

        return;

      }



      if (

        brand2VideoPlaying &&

        isBrand2HeroCurrent()

      ) {

        if (event.cancelable) {

          event.preventDefault();

        }

        return;

      }



      handleBrand2HeroForwardIntent(event);

    },

    {

      passive: false,

      capture: true

    }

  );



  window.addEventListener(

    "touchstart",

    event => {

      if (event.touches.length !== 1) return;

      brand2TouchStartY = event.touches[0].clientY;

    },

    { passive: true }

  );



  window.addEventListener(

    "touchmove",

    event => {

      if (

        brand2TouchStartY === null ||

        event.touches.length !== 1

      ) {

        return;

      }



      const currentY = event.touches[0].clientY;

      const delta = brand2TouchStartY - currentY;

      if (Math.abs(delta) < 8) return;



      if (delta < 0) {

        if (handleBrand2ReverseIntent(event)) {

          brand2TouchStartY = currentY;

        }

        return;

      }



      if (

        brand2VideoPlaying &&

        isBrand2HeroCurrent()

      ) {

        if (event.cancelable) {

          event.preventDefault();

        }

        brand2TouchStartY = currentY;

        return;

      }



      if (handleBrand2HeroForwardIntent(event)) {

        brand2TouchStartY = currentY;

      }

    },

    {

      passive: false,

      capture: true

    }

  );



  window.addEventListener(

    "touchend",

    () => {

      brand2TouchStartY = null;

    },

    { passive: true }

  );



  window.addEventListener(

    "keydown",

    event => {

      const forwardKeys = [

        "ArrowDown",

        "PageDown",

        " ",

        "Spacebar"

      ];

      const reverseKeys = [

        "ArrowUp",

        "PageUp"

      ];



      if (reverseKeys.includes(event.key)) {

        handleBrand2ReverseIntent(event);

        return;

      }



      if (!forwardKeys.includes(event.key)) return;



      if (

        brand2VideoPlaying &&

        isBrand2HeroCurrent()

      ) {

        event.preventDefault();

        return;

      }



      handleBrand2HeroForwardIntent(event);

    },

    { capture: true }

  );



  if (

    brand2Keywords &&

    brand2KeywordButtons.length > 0

  ) {

    window.addEventListener(

      "scroll",

      requestBrand2KeywordUpdate,

      { passive: true }

    );

    window.addEventListener(

      "resize",

      requestBrand2KeywordUpdate,

      { passive: true }

    );



    brand2KeywordButtons.forEach((button, index) => {

      button.addEventListener("click", () => {

        const data = getBrand2KeywordScrollData();



        if (!data) {

          setBrand2Keyword(index);

          return;

        }



        const targetProgress =

          (index + 0.5) / brand2KeywordNames.length;

        const targetScroll =

          data.sectionTop +

          data.scrollDistance * targetProgress;



        window.scrollTo({

          top: targetScroll,

          left: 0,

          behavior: "smooth"

        });

      });

    });



    requestBrand2KeywordUpdate();

  }



  window.addEventListener(

    "resize",

    () => {

      brand2HeroTop = null;

    },

    { passive: true }

  );



  /* =========================================================

     BRAND 2 — 03. 확장 아코디언

     마우스 올리기 / 클릭 / 탭 / 키보드로 카드 펼침

  ========================================================= */

  const accordion = document.querySelector(

    ".brand2-page [data-philosophy-accordion]"

  );



  if (!accordion) return;



  const cards = Array.from(

    accordion.querySelectorAll(".philosophy-accordion__card")

  );



  function activate(card) {

    cards.forEach(item => {

      const isActive = item === card;

      item.classList.toggle("is-active", isActive);

      item.setAttribute("aria-expanded", isActive ? "true" : "false");

    });

  }



  const canHover = window.matchMedia(

    "(hover: hover) and (pointer: fine)"

  ).matches;



  cards.forEach((card, index) => {

    if (canHover) {

      card.addEventListener("mouseenter", () => activate(card));

    }



    card.addEventListener("click", () => activate(card));

    card.addEventListener("focus", () => activate(card));



    card.addEventListener("keydown", event => {

      if (event.key === "Enter" || event.key === " ") {

        event.preventDefault();

        activate(card);

        return;

      }



      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {

        event.preventDefault();



        const step = event.key === "ArrowRight" ? 1 : -1;

        const next = cards[(index + step + cards.length) % cards.length];



        next.focus();

      }

    });

  });

});



/* =========================================================

   공통 헤더 — 스크롤 시 숨김

========================================================= */

(function setupBrandHeaderAutoHide() {

  const body = document.body;

  const header = document.querySelector(".site-header");



  if (!body || !header) return;



  const TOP_VISIBLE_THRESHOLD = 24;

  const DEFAULT_HOT_ZONE = 82;

  const HOT_ZONE_EXTRA = 18;



  let pointerY = Infinity;

  let pointerInsideHeader = false;

  let headerFocused = false;

  let ticking = false;



  function getHotZoneHeight() {

    const headerHeight = header.getBoundingClientRect().height;



    return Math.max(

      DEFAULT_HOT_ZONE,

      headerHeight + HOT_ZONE_EXTRA

    );

  }



  function isAtTop() {

    return window.scrollY <= TOP_VISIBLE_THRESHOLD;

  }



  function isPointerInHotZone() {

    return pointerY <= getHotZoneHeight();

  }



  function showHeader(usePeek = false) {

    body.classList.remove("is-header-hidden");



    if (usePeek) {

      body.classList.add("is-header-peek");

    } else {

      body.classList.remove("is-header-peek");

    }

  }



  function hideHeader() {

    if (isAtTop()) {

      showHeader(false);

      return;

    }



    body.classList.add("is-header-hidden");

    body.classList.remove("is-header-peek");

  }



  function updateHeaderState() {

    ticking = false;



    if (isAtTop()) {

      showHeader(false);

      return;

    }



    if (

      isPointerInHotZone() ||

      pointerInsideHeader ||

      headerFocused

    ) {

      body.classList.add("is-header-hidden");

      body.classList.add("is-header-peek");

      return;

    }



    hideHeader();

  }



  function requestHeaderUpdate() {

    if (ticking) return;



    ticking = true;

    window.requestAnimationFrame(updateHeaderState);

  }



  window.addEventListener(

    "scroll",

    requestHeaderUpdate,

    { passive: true }

  );



  window.addEventListener(

    "mousemove",

    event => {

      pointerY = event.clientY;

      requestHeaderUpdate();

    },

    { passive: true }

  );



  document.documentElement.addEventListener(

    "mouseleave",

    () => {

      pointerY = Infinity;

      requestHeaderUpdate();

    }

  );



  header.addEventListener("mouseenter", () => {

    pointerInsideHeader = true;



    if (!isAtTop()) {

      body.classList.add("is-header-hidden");

      body.classList.add("is-header-peek");

    }

  });



  header.addEventListener("mouseleave", event => {

    pointerInsideHeader = false;

    pointerY = event.clientY;

    requestHeaderUpdate();

  });



  header.addEventListener("focusin", () => {

    headerFocused = true;



    if (!isAtTop()) {

      body.classList.add("is-header-hidden");

      body.classList.add("is-header-peek");

    }

  });



  header.addEventListener("focusout", () => {

    window.setTimeout(() => {

      headerFocused = header.contains(

        document.activeElement

      );

      requestHeaderUpdate();

    }, 0);

  });



  window.addEventListener(

    "resize",

    requestHeaderUpdate,

    { passive: true }

  );



  window.addEventListener(

    "pageshow",

    requestHeaderUpdate

  );



  updateHeaderState();

})();



/* =========================================================

   BRAND 1 — 문제 인식 문장 타이핑 효과

========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const section = document.querySelector(

    ".brand1-page .brand-problem-section"

  );



  if (!section) return;



  const targets = [

    section.querySelector(".problem-text-left"),

    section.querySelector(".problem-text-right")

  ].filter(Boolean);



  if (

    !targets.length ||

    targets.some(el => el.querySelector(".tc"))

  ) {

    return;

  }



  const SPEED = 38;

  const LINE_GAP = 180;

  const REPLAY = true;



  if (!document.getElementById("brand1-problem-typing-style")) {

    const style = document.createElement("style");

    style.id = "brand1-problem-typing-style";



    style.textContent = `

      .brand1-page .brand-problem-text .problem-text-left,

      .brand1-page .brand-problem-text .problem-text-right {

        animation: none !important;

        opacity: 1;

        transform: none;

        filter: none;

      }



      .brand1-page .brand-problem-text .tc {

        display: inline-block;

        color: rgba(245, 245, 242, .20);

        transform: translate3d(0, 2px, 0);

        transition:

          color .18s ease,

          transform .22s cubic-bezier(.16, 1, .3, 1);

      }



      .brand1-page .brand-problem-text .tc.on {

        color: rgba(245, 245, 242, .98);

        transform: translate3d(0, 0, 0);

      }



      @media (prefers-reduced-motion: reduce) {

        .brand1-page .brand-problem-text .tc {

          color: rgba(245, 245, 242, .98);

          transform: none;

          transition: none;

        }

      }

    `;



    document.head.appendChild(style);

  }



  const lines = targets.map(el => {

    const label = el.textContent.replace(/\s+/g, " ").trim();

    const chars = [];



    const splitText = node => {

      Array.from(node.childNodes).forEach(child => {

        if (child.nodeType === Node.TEXT_NODE) {

          const fragment = document.createDocumentFragment();



          for (const character of child.textContent) {

            if (/\s/.test(character)) {

              fragment.appendChild(

                document.createTextNode(character)

              );

              continue;

            }



            const span = document.createElement("span");

            span.className = "tc";

            span.setAttribute("aria-hidden", "true");

            span.textContent = character;

            fragment.appendChild(span);

            chars.push(span);

          }



          child.replaceWith(fragment);

        } else if (

          child.nodeType === Node.ELEMENT_NODE &&

          child.tagName !== "BR"

        ) {

          splitText(child);

        }

      });

    };



    splitText(el);

    el.setAttribute("aria-label", label);

    return chars;

  });



  const allChars = lines.flat();

  if (!allChars.length) return;



  if (

    window.matchMedia(

      "(prefers-reduced-motion: reduce)"

    ).matches ||

    !("IntersectionObserver" in window)

  ) {

    allChars.forEach(char => char.classList.add("on"));

    return;

  }



  let timers = [];

  let played = false;



  const reset = () => {

    timers.forEach(window.clearTimeout);

    timers = [];

    played = false;



    allChars.forEach(char => {

      char.classList.remove("on");

    });

  };



  const play = () => {

    if (played) return;

    played = true;



    let delay = 0;



    lines.forEach(chars => {

      chars.forEach(char => {

        timers.push(

          window.setTimeout(

            () => char.classList.add("on"),

            delay

          )

        );

        delay += SPEED;

      });



      delay += LINE_GAP;

    });

  };



  new IntersectionObserver(

    ([entry]) => {

      if (entry.isIntersecting) {

        play();

      } else if (

        REPLAY &&

        entry.boundingClientRect.top > 0

      ) {

        reset();

      }

    },

    {

      rootMargin: "0px 0px -40% 0px"

    }

  ).observe(section);

});



/* =========================================================
   BRAND1 PROLOGUE — “왜, 다들림일까요?” / 2026.10.07
   ---------------------------------------------------------
   다들림 소개 HERO 들어가기 전 스크롤 프롤로그.
   (12.zip prologue 코드 → brand.js 로 정리)
   스타일 : brand.css 맨 아래 [BRAND1 PROLOGUE]

   흐름 (스크롤 = 타임라인) :
   1. 왜, 다들림일까요?
   2. 도로 위의 위험은 언제나 소리로 먼저 다가옵니다.  (단어 점등)
   3. 하지만 그 소리가 모두에게 들리지는 않습니다.     (단어 점등)
   4. 다 + 들림 → 두 글자가 모여 ‘다들림’
   5. 모든 소리가 [창] 닿을 수 있도록. → 창이 커지며 기존 HERO

   마지막 장면은 기존 HERO(#brand-hero)와 픽셀 단위로 같음.
   BRAND2 등 .pl 이 없는 페이지에서는 실행하지 않음.
========================================================= */

(() => {

  "use strict";


  const root =
    document.querySelector(".pl");

  if (!root) {
    return;
  }


  /* 동작 줄이기 / GSAP 없음 → 기존 HERO만 */

  const reduce =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  if (
    reduce ||
    !window.gsap ||
    !window.ScrollTrigger
  ) {
    return;
  }


  gsap.registerPlugin(ScrollTrigger);


  const $ = (selector, el = root) =>
    el.querySelector(selector);

  const $$ = (selector, el = root) =>
    Array.from(
      el.querySelectorAll(selector)
    );


  /* ---------------------------------------------------------
     01. 기존 HERO 요소
  --------------------------------------------------------- */

  const hero =
    $(".brand-intro-hero");

  const media =
    $(".brand-hero-final__media");

  /* 2026.10.14 : HERO 이미지 → 영상 (img 또는 video 둘 다 찾음) */
  const img =
    $(".brand-hero-final__media img, .brand-hero-final__media video");

  const copy =
    $(".brand-hero-final__copy");

  const copyLines =
    $$(".brand-hero-final__line");

  if (
    !hero ||
    !media ||
    !img
  ) {
    return;
  }


  /* 프롤로그 켜기 → CSS .pl.is-on */
  root.classList.add("is-on");


  /* ---------------------------------------------------------
     02. 기본 도구
  --------------------------------------------------------- */

  const W = () =>
    window.innerWidth;

  const H = () =>
    hero.clientHeight ||
    window.innerHeight;

  const lerp = (a, b, t) =>
    a + (b - a) * t;


  /*
   * clip-path 는 [위, 오른쪽, 아래, 왼쪽, 모서리] 숫자로 직접 보간
   */
  const inset = (a) =>
    `inset(${a[0].toFixed(2)}px ${a[1].toFixed(2)}px ${a[2].toFixed(2)}px ${a[3].toFixed(2)}px round ${a[4].toFixed(2)}px)`;

  const CR = {
    full: () =>
      [0, 0, 0, 0, 0],

    point: (cx, cy) =>
      [cy, W() - cx, H() - cy, cx, 0],

    box: (x, y, w, h, rad = 0) =>
      [y, W() - x - w, H() - y - h, x, rad],
  };

  const setClip = (el, a) => {
    el.style.clipPath =
      inset(a);
  };

  const clipTo = (tl, el, from, to, at, d, ease = "none") => {
    const o = {
      p: 0,
    };

    tl.fromTo(
      o,
      {
        p: 0,
      },
      {
        p: 1,
        duration: d,
        ease,
        immediateRender: false,

        onUpdate: () => {
          const a = from();
          const b = to();

          setClip(
            el,
            a.map(
              (v, i) => lerp(v, b[i], o.p)
            )
          );
        },
      },
      at
    );
  };


  /* ---------------------------------------------------------
     03. [data-words] 문장을 단어 단위로 나눔
     단어마다 .pl-w → 회색에서 흰색으로 점등
  --------------------------------------------------------- */

  $$("[data-words]").forEach((el) => {

    const walk = (node) => {

      Array.from(node.childNodes).forEach((child) => {

        /* 글자 */
        if (child.nodeType === 3) {

          const frag =
            document.createDocumentFragment();

          child.textContent
            .split(/([ \t\n\r]+)/)
            .forEach((part) => {

              if (!part) {
                return;
              }

              if (/^[ \t\n\r]+$/.test(part)) {
                frag.appendChild(
                  document.createTextNode(part)
                );
              } else {
                const word =
                  document.createElement("span");

                word.className =
                  "pl-w";

                word.textContent =
                  part;

                frag.appendChild(word);
              }

            });

          child.replaceWith(frag);
        }

        /* 태그 (br 제외) → 안쪽까지 */
        else if (
          child.nodeType === 1 &&
          child.tagName !== "BR"
        ) {
          walk(child);
        }

      });

    };

    walk(el);

  });


  /* ---------------------------------------------------------
     04. 장면 등장 / 퇴장 / 단어 점등
  --------------------------------------------------------- */

  const sceneIn = (tl, el, at, d = 0.4) =>
    tl.fromTo(
      el,
      {
        autoAlpha: 0,
        y: 26,
        filter: "blur(8px)",
      },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: d,
        ease: "power2.out",
      },
      at
    );

  const sceneOut = (tl, el, at, d = 0.4) =>
    tl.to(
      el,
      {
        autoAlpha: 0,
        y: -26,
        filter: "blur(8px)",
        duration: d,
        ease: "power2.in",
      },
      at
    );

  const lightWords = (tl, el, at, d = 1.2) => {
    const words =
      $$(".pl-w", el);

    tl.to(
      words,
      {
        color: "#f5f5f2",
        duration: 0.25,
        stagger:
          Math.max(
            0.02,
            (d - 0.25) /
              Math.max(1, words.length - 1)
          ),
        ease: "none",
      },
      at
    );
  };


  /* ---------------------------------------------------------
     05. 끝 지점 → HERO를 원래 상태로
  --------------------------------------------------------- */

  let cleared =
    false;

  /* 2026.10.14 : HERO 영상 재생 / 처음으로
     HERO 가 다 열리면 한 번 재생 (마지막 장면에서 멈춤)
     다시 프롤로그 쪽으로 올라가면 첫 장면으로 되돌림 */
  const heroVideo =
    img.tagName === "VIDEO" ? img : null;

  const playHeroVideo = () => {
    if (!heroVideo) {
      return;
    }

    heroVideo.currentTime = 0;

    const req = heroVideo.play();

    if (req && typeof req.catch === "function") {
      req.catch(() => {});
    }
  };

  const resetHeroVideo = () => {
    if (!heroVideo || heroVideo.currentTime === 0) {
      return;
    }

    heroVideo.pause();
    heroVideo.currentTime = 0;
  };

  const clearHero = (tl) => {

    if (tl.progress() >= 0.999) {

      if (cleared) {
        return;
      }

      cleared =
        true;

      [media, img, ...copyLines].forEach((el) => {
        el.style.transform = "";
        el.style.filter = "";
        el.style.clipPath = "";
      });

      /* 확대 중 만들어진 합성 레이어를 버리고 원본 해상도로 다시 그림 */
      [media, img].forEach((el) => {
        el.style.willChange = "auto";
      });

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          [media, img].forEach((el) => {
            el.style.willChange = "";
          });
        })
      );

    } else {
      cleared =
        false;
    }

  };


  /* ---------------------------------------------------------
     06. 프롤로그 요소
  --------------------------------------------------------- */

  const bg =
    $(".pa-bg");

  const bgImg =
    $(".pa-bg img");

  const hint =
    $(".pl-hint");

  const q = $(".pa-q");      // 1. 질문
  const s1 = $(".pa-s1");    // 2. 문장
  const s2 = $(".pa-s2");    // 3. 문장
  const nm = $(".pa-name");  // 4. 다 + 들림
  const fin = $(".pa-final"); // 5. 모든 소리가 [창] 닿을 수 있도록.

  const win = $(".pa-window");
  const L = $(".pa-l");
  const R = $(".pa-r");

  const syl = $$(".pa-syl", nm);
  const defs = $$(".pa-def", nm);
  const plus = $(".pa-plus", nm);
  const means = $$(".pa-mean", nm);


  /* 창(.pa-window) 위치 → HERO 기준 좌표 */

  const winRect = () => {
    const r = win.getBoundingClientRect();
    const hr = hero.getBoundingClientRect();

    return {
      x: r.left - hr.left,
      y: r.top - hr.top,
      w: r.width,
      h: r.height,
    };
  };

  const winBox = () => {
    const r = winRect();

    return CR.box(r.x, r.y, r.w, r.h, r.h * 0.12);
  };

  const winPoint = () => {
    const r = winRect();

    return CR.point(r.x + r.w / 2, r.y + r.h / 2);
  };


  /* ---------------------------------------------------------
     07. 처음 상태
  --------------------------------------------------------- */

  /* HERO는 화면 가운데 점으로 닫혀 있음 */
  setClip(
    media,
    CR.point(W() / 2, H() / 2)
  );

  gsap.set(img, { scale: 1.6 });
  gsap.set(copy, { autoAlpha: 1 });
  gsap.set(copyLines, { autoAlpha: 0 });


  /* 첫 질문과 배경은 페이지에 들어오자마자 등장 (스크롤과 무관) */
  gsap.set(q, { autoAlpha: 1 });

  gsap.timeline({ delay: 0.25 })
    .from(
      $$(".pl-line > span", q),
      {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
      }
    )
    .from(
      $$(".pl-intro-fade", q),
      {
        autoAlpha: 0,
        y: 14,
        duration: 0.9,
        ease: "power3.out",
      },
      0.35
    );

  if (bg) {
    gsap.set(bg, { autoAlpha: 0 });

    gsap.to(
      bg,
      {
        autoAlpha: 1,
        duration: 2.4,
        delay: 0.2,
        ease: "power1.out",
      }
    );
  }


  /* ---------------------------------------------------------
     08. 스크롤 타임라인
     (숫자 = 타임라인 위치, 전체 길이는 CSS --pl-len)
  --------------------------------------------------------- */

  const tl = gsap.timeline({
    defaults: {
      ease: "none",
    },

    onUpdate() {
      clearHero(this);

      /* 2026.10.14 : HERO 영상 재생 시점
         전) 타임라인 맨 끝(progress 0.999, 문구가 다 나오고 한참 뒤)
         후) 오른쪽 HERO 문구가 나타나기 시작하는 순간(10.7)에 바로 재생
             그보다 앞(10.4 전)으로 올라가면 첫 장면으로 되돌림 */
      if (this.time() >= 10.7) {
        if (heroVideo && heroVideo.paused && heroVideo.currentTime === 0) {
          playHeroVideo();
        }
      } else if (this.time() < 10.4) {
        resetHeroVideo();
      }

      /* 2026.10.08 : 밝은 배경(다들림) 동안만 헤더 로고를 원래 컬러 로고로 */
      document.body.classList.toggle(
        "is-pl-light",
        this.time() >= 6.7 &&
        this.time() < 7.6
      );
    },

    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.9,
      invalidateOnRefresh: true,
    },
  });


  /* 스크롤 안내 → 바로 사라짐 */
  if (hint) {
    tl.to(hint, { autoAlpha: 0, duration: 0.25 }, 0);
  }


  /* 흐린 배경 : 천천히 흐르다가 마지막 문장 전에 사라짐 */
  if (bgImg) {
    tl.fromTo(
      bgImg,
      { scale: 1.25, xPercent: 3 },
      { scale: 1.08, xPercent: -3, duration: 7.5 },
      0
    );
  }

  if (bg) {
    tl.to(bg, { autoAlpha: 0, duration: 0.7, ease: "power1.in" }, 7.3);
  }


  /* 1. 질문 */
  tl.to(
    q,
    {
      autoAlpha: 0,
      y: -26,
      filter: "blur(8px)",
      duration: 0.4,
      ease: "power2.in",
    },
    0.6
  );


  /* 2 · 3. 두 문장 (단어가 회색 → 흰색) */
  sceneIn(tl, s1, 1.0, 0.3);
  lightWords(tl, s1, 1.1);
  sceneOut(tl, s1, 2.7);

  sceneIn(tl, s2, 3.1, 0.3);
  lightWords(tl, s2, 3.2);
  sceneOut(tl, s2, 4.8);


  /* 4. 다 + 들림 → 두 글자가 가운데로 모여 ‘다들림’ */
  tl.set(nm, { autoAlpha: 1 }, 5.2);

  tl.fromTo(
    syl,
    { autoAlpha: 0, y: 40, filter: "blur(10px)" },
    {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.45,
      stagger: 0.35,
      ease: "power3.out",
    },
    5.2
  );

  tl.fromTo(plus, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 5.45);

  tl.fromTo(
    means,
    { autoAlpha: 0, y: 12 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.3,
      ease: "power2.out",
    },
    5.6
  );

  /* 다 ↔ 들림 사이 거리의 절반만큼 서로 이동 */
  const gap = () => {
    const a = syl[0].getBoundingClientRect();
    const c = syl[1].getBoundingClientRect();

    return (c.left - a.right) / 2 - a.height * 0.02;
  };

  tl.to(means, { autoAlpha: 0, y: -8, duration: 0.3, ease: "power2.in" }, 6.1);
  tl.to(plus, { autoAlpha: 0, scale: 0.2, duration: 0.35, ease: "power2.in" }, 6.1);
  tl.to(defs[0], { x: () => gap(), duration: 0.8, ease: "power3.inOut" }, 6.2);
  tl.to(defs[1], { x: () => -gap(), duration: 0.8, ease: "power3.inOut" }, 6.2);

  /* 2026.10.08 : 합쳐지는 순간 배경색 전환
     전) 다 · 들림이 모인 뒤 그대로 흐려지며 사라짐
     후) 풀이 · + 는 흐려지며 사라지고(blur 추가),
         두 글자가 붙는 순간 가운데에서 밝은 원이 퍼져 배경이 아이보리로 바뀜
         → 글자는 검정으로 뒤집힘 → 잠깐 머문 뒤 다시 어두워지며 5번 장면으로 */
  const flash =
    $(".pa-flash");

  tl.to(means, { filter: "blur(6px)", duration: 0.3, ease: "power2.in" }, 6.1);
  tl.to(plus, { filter: "blur(6px)", duration: 0.35, ease: "power2.in" }, 6.1);

  if (flash) {
    /* 원으로 퍼지며 배경 전환 (두 글자가 거의 붙는 6.8 지점) */
    /* 2026.10.08 : 딱 잘린 원(clip-path) → 가장자리가 흐린 빛(mask)이 '솨아' 번지듯
       전) circle 0% → 75%, 0.6, power3.out, 6.8 시작
       후) --pf-r 0 → 150vmax, 0.75, sine.inOut, 6.6 시작
          (전체를 흐리게 키우면 중간에 탁한 회색이 돼서 → 가운데는 바로 밝고 가장자리만 번짐) */
    tl.fromTo(
      flash,
      { autoAlpha: 1, "--pf-r": "0vmax" },
      { autoAlpha: 1, "--pf-r": "150vmax", duration: 0.75, ease: "sine.inOut" },
      6.6
    );

    /* 다시 어둡게 — 다들림이 사라질 때 같이 */
    tl.to(flash, { autoAlpha: 0, duration: 0.45, ease: "power1.in" }, 7.4);
  }

  /* 글자 색 뒤집힘 + 살짝 커졌다 돌아오며 '딱 붙는' 느낌 */
  /* 2026.10.08 : 글자색 #0b0c0f(거의 검정) → #2b2d31(차콜, 덜 강하게) */
  /* 2026.10.08 : 밝은 빛이 글자 뒤에 닿는 순간 같이 뒤집힘 (전: 6.82 · 0.35) */
  tl.to(syl, { color: "#2b2d31", duration: 0.3, ease: "sine.inOut" }, 6.68);
  tl.fromTo(nm, { scale: 1 }, { scale: 1.06, duration: 0.3, ease: "power2.out" }, 6.8);
  /* 2026.10.08 : 밝아진 뒤 크기 1 → 1.04 로 살짝 크게 남김
     두께도 450 → 500 (Pretendard Variable 이라 중간 굵기 가능) */
  tl.to(nm, { scale: 1.04, duration: 0.4, ease: "power2.inOut" }, 7.1);
  tl.fromTo(syl, { fontWeight: 450 }, { fontWeight: 500, duration: 0.3, ease: "sine.inOut" }, 6.68);

  sceneOut(tl, nm, 7.4);


  /* 5. 모든 소리가 [창] 닿을 수 있도록. */
  tl.set(fin, { autoAlpha: 1 }, 7.8);

  tl.fromTo(
    [L, R],
    { autoAlpha: 0, filter: "blur(10px)" },
    {
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: 0.45,
      stagger: 0.12,
      ease: "power2.out",
    },
    7.8
  );

  /* 점 → 창 크기로 열림 */
  clipTo(tl, media, winPoint, winBox, 7.95, 0.6, "power3.out");
  tl.to(img, { scale: 1.32, duration: 1.2 }, 7.95);


  /* 창이 화면 전체로 → 기존 HERO */
  tl.to(L, { x: () => -W() * 0.42, autoAlpha: 0, duration: 1.3, ease: "power3.inOut" }, 9.2);
  tl.to(R, { x: () => W() * 0.42, autoAlpha: 0, duration: 1.3, ease: "power3.inOut" }, 9.2);

  clipTo(tl, media, winBox, CR.full, 9.2, 1.5, "power3.inOut");
  tl.to(img, { scale: 1, duration: 1.5, ease: "power3.inOut" }, 9.2);


  /* HERO 문구 등장 후 잠깐 머묾 */
  tl.fromTo(
    copyLines,
    { autoAlpha: 0, yPercent: 55, filter: "blur(10px)" },
    {
      autoAlpha: 1,
      yPercent: 0,
      filter: "blur(0px)",
      duration: 0.6,
      stagger: 0.14,
      ease: "power3.out",
    },
    10.6
  );

  tl.to({}, { duration: 0.0001 }, 12.0);


  /* 이미지 로드 후 위치 다시 계산 */
  window.addEventListener(
    "load",
    () => ScrollTrigger.refresh()
  );

})();
