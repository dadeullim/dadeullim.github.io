/* =========================================================
   DADEULLIM ABOUT — problem.html / user.html 공통 JS
   공통 헤더는 script.js에서 관리합니다.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  if (!body.classList.contains("about-page")) return;

  body.classList.add("has-about-js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  initAboutReveal();

  if (body.classList.contains("problem-page")) initProblemPage();
  if (body.classList.contains("user-page")) initUserPage();

  /* =======================================================
     공통 스크롤 등장
  ======================================================= */
  function initAboutReveal() {
    const revealItems = Array.from(document.querySelectorAll("[data-about-reveal]"));
    const cards = Array.from(document.querySelectorAll('[data-about-reveal="card"]'));

    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 90}ms`;
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px"
    });

    revealItems.forEach((item) => observer.observe(item));
  }

  /* =======================================================
     01. 문제 정의 — problem.html
  ======================================================= */
  function initProblemPage() {
    initProblemHeroText();
    initProblemOpeningParallax();
    initProblemCardFocus();
    initProblemDangerTabs();
    initProblemConclusionFocus();
    initProblemMarqueeVisibility();
  }

  /* 01-1. 히어로 텍스트 등장 */
  function initProblemHeroText() {
    const opening = document.querySelector(".problem-opening");
    if (!opening || reduceMotion) return;

    const items = Array.from(opening.querySelectorAll(".problem-opening__intro-item"));

    function replay() {
      items.forEach((item) => item.style.setProperty("transition", "none", "important"));
      opening.classList.remove("is-motion-visible");
      opening.classList.add("is-motion-ready");
      void opening.offsetWidth;
      items.forEach((item) => item.style.removeProperty("transition"));

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => opening.classList.add("is-motion-visible"));
      });
    }

    replay();

    window.addEventListener("pageshow", (event) => {
      if (event.persisted) replay();
    });
  }

  /* 01-2. 히어로 이미지 패럴랙스 */
  function initProblemOpeningParallax() {
    const stage = document.querySelector("[data-about-parallax]");
    const media = stage?.querySelector(".problem-opening__media");
    if (reduceMotion || !stage || !media) return;

    let ticking = false;

    function update() {
      const rect = stage.getBoundingClientRect();

      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        const center = rect.top + rect.height / 2;
        const distance = window.innerHeight / 2 - center;
        media.style.translate = `0 ${clamp(distance * 0.018, -10, 10)}px`;
      }

      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    update();
  }

  /* 01-3. 문제 카드에 마우스를 올렸을 때 나머지 카드 낮추기 */
  function initProblemCardFocus() {
    const cards = Array.from(document.querySelectorAll("[data-problem-card]"));
    if (!canHover || !cards.length) return;

    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        cards.forEach((other) => {
          if (other !== card) other.classList.add("is-muted");
        });
      });

      card.addEventListener("mouseleave", () => {
        cards.forEach((other) => other.classList.remove("is-muted"));
      });
    });
  }

  /* 01-4. 위험 영상 두 개: 자동 전환·탭 클릭·화면 밖 일시 정지 */
  function initProblemDangerTabs() {
    const section = document.querySelector(".problem-page .dz");
    if (!section) return;

    const medias = Array.from(section.querySelectorAll(".dz-media"));
    const tabs = Array.from(section.querySelectorAll(".dz-tab"));
    if (!medias.length || medias.length !== tabs.length) return;

    const INTERVAL = 5000;
    let index = 0;
    let timer = null;
    let inView = false;

    const videos = medias.map((media) => media.querySelector("video"));

    videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      video.pause();
    });

    function pauseVideos() {
      videos.forEach((video) => video.pause());
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = null;

      if (!inView || document.hidden || reduceMotion) return;
      timer = window.setTimeout(() => show((index + 1) % medias.length), INTERVAL);
    }

    function show(nextIndex) {
      index = nextIndex;

      medias.forEach((media, mediaIndex) => {
        const active = mediaIndex === index;
        media.classList.toggle("is-on", active);
        media.setAttribute("aria-hidden", String(!active));

        const video = videos[mediaIndex];

        if (active) {
          try {
            video.currentTime = 0;
          } catch (_) {
            /* 영상이 아직 로드되지 않은 경우 */
          }

          if (inView && !document.hidden) {
            const playRequest = video.play();

            if (playRequest && typeof playRequest.catch === "function") {
              playRequest.catch(() => {});
            }
          }
        } else {
          video.pause();
        }
      });

      tabs.forEach((tab) => tab.classList.remove("is-on"));
      void section.offsetWidth;

      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.classList.toggle("is-on", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      schedule();
    }

    tabs.forEach((tab, tabIndex) => {
      tab.addEventListener("click", () => show(tabIndex));

      tab.addEventListener("keydown", (event) => {
        let nextIndex;

        if (event.key === "ArrowRight") {
          nextIndex = (tabIndex + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        show(nextIndex);
        tabs[nextIndex].focus();
      });
    });

    function setVisible(visible) {
      if (inView === visible) return;

      inView = visible;
      section.classList.toggle("is-paused", !visible || document.hidden);

      if (visible && !document.hidden) {
        show(index);
      } else {
        window.clearTimeout(timer);
        timer = null;
        pauseVideos();
      }
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      }, {
        threshold: [0, 0.35]
      }).observe(section);
    } else {
      function checkVisibility() {
        const rect = section.getBoundingClientRect();
        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
        );

        setVisible(
          visibleHeight /
          Math.max(1, Math.min(rect.height, window.innerHeight)) >= 0.35
        );
      }

      window.addEventListener("scroll", checkVisibility, { passive: true });
      window.addEventListener("resize", checkVisibility);
      checkVisibility();
    }

    document.addEventListener("visibilitychange", () => {
      section.classList.toggle("is-paused", document.hidden || !inView);

      if (document.hidden) {
        window.clearTimeout(timer);
        timer = null;
        pauseVideos();
      } else if (inView) {
        show(index);
      }
    });
  }

  /* 01-5. 문제 정의 결론 문장 밝기 */
  function initProblemConclusionFocus() {
    const section = document.querySelector(".problem-conclusion");
    const texts = Array.from(document.querySelectorAll(".problem-conclusion__korean"));
    if (reduceMotion || !section || !texts.length) return;

    let ticking = false;

    function update() {
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(
        window.innerHeight / 2 - (rect.top + rect.height / 2)
      );
      const progress = 1 - clamp(
        distance / (window.innerHeight * 0.8),
        0,
        1
      );
      const opacity = 0.68 + progress * 0.32;

      texts.forEach((text) => {
        text.style.opacity = opacity;
      });

      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    update();
  }

  /* 01-6. 창이 숨겨지면 영문 마키 일시 정지 */
  function initProblemMarqueeVisibility() {
    const marquee = document.querySelector(".problem-marquee__track");
    if (!marquee) return;

    document.addEventListener("visibilitychange", () => {
      marquee.style.animationPlayState =
        document.hidden ? "paused" : "running";
    });
  }

  /* =======================================================
     02. 사용자 분석 — user.html
  ======================================================= */
  function initUserPage() {
    initUserOpeningSequence();
    initUserCharacterCarousel();
    initUserGaze();
    initUserEmotionSlider();
  }

  /* 02-1. 사용자 분석 히어로 */
  function initUserOpeningSequence() {
    const section = document.querySelector(".user-opening");
    const cards = Array.from(
      document.querySelectorAll("[data-user-opening-card]")
    ).sort(
      (a, b) =>
        Number(a.dataset.userOpeningCard) -
        Number(b.dataset.userOpeningCard)
    );
    const copyItems = Array.from(
      document.querySelectorAll("[data-user-opening-copy]")
    );

    if (!section || !cards.length) return;

    if (reduceMotion) {
      [...cards, ...copyItems].forEach((item) => {
        item.classList.add("is-sequence-visible");
      });
      return;
    }

    section.classList.add("is-sequence-ready");
    void section.offsetWidth;

    cards.forEach((card, index) => {
      window.setTimeout(
        () => card.classList.add("is-sequence-visible"),
        140 + index * 190
      );
    });

    const copyStart = 140 + cards.length * 190 + 100;

    copyItems.forEach((item, index) => {
      window.setTimeout(
        () => item.classList.add("is-sequence-visible"),
        copyStart + index * 90
      );
    });
  }

  /* 02-2. 운전자 카드 캐러셀: 3초 자동 전환 + 좌우 버튼 */
  function initUserCharacterCarousel() {
    const carousel = document.querySelector("[data-user-carousel]");
    if (!carousel) return;

    const slides = Array.from(
      carousel.querySelectorAll("[data-user-slide]")
    );
    const descriptions = Array.from(
      document.querySelectorAll("[data-user-description]")
    );
    const prevButton = carousel.querySelector("[data-user-prev]");
    const nextButton = carousel.querySelector("[data-user-next]");

    if (!slides.length) return;

    const AUTO_INTERVAL = 3000;
    let activeIndex = 0;
    let autoTimer = null;

    function render() {
      slides.forEach((slide, index) => {
        const relative =
          (index - activeIndex + slides.length) % slides.length;

        slide.dataset.userPosition =
          relative === 0
            ? "center"
            : relative === 1
              ? "right"
              : "left";

        slide.classList.toggle("is-active", relative === 0);
      });

      descriptions.forEach((description, index) => {
        description.classList.toggle(
          "is-active",
          index === activeIndex
        );
      });
    }

    function stopAuto() {
      if (autoTimer === null) return;
      window.clearInterval(autoTimer);
      autoTimer = null;
    }

    function startAuto() {
      stopAuto();

      if (reduceMotion || document.hidden) return;

      autoTimer = window.setInterval(() => {
        activeIndex = (activeIndex + 1) % slides.length;
        render();
      }, AUTO_INTERVAL);
    }

    function goToSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      render();
      startAuto();
    }

    prevButton?.addEventListener("click", () => {
      goToSlide(activeIndex - 1);
    });

    nextButton?.addEventListener("click", () => {
      goToSlide(activeIndex + 1);
    });

    slides.forEach((slide, index) => {
      slide.addEventListener("click", () => {
        if (index !== activeIndex) goToSlide(index);
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    render();
    startAuto();
  }

  /* =======================================================
     02-3. 새 시선 분석: HUD → DISPLAY → HANDLE
     데스크톱 스크롤 위치에 따라 강조 영역과 문장을 전환
  ======================================================= */
  function initUserGaze() {
    const section = document.querySelector("[data-user-gaze]");
    if (!section) return;

    const lits = Array.from(
      section.querySelectorAll("[data-gaze-lit]")
    );
    const spots = Array.from(
      section.querySelectorAll("[data-gaze-spot]")
    );
    const caps = Array.from(
      section.querySelectorAll("[data-gaze-cap]")
    );
    const dots = Array.from(
      section.querySelectorAll(".user-gaze__dots i")
    );

    const desktop = window.matchMedia("(min-width:1001px)");
    const steps = Math.min(lits.length, spots.length);

    if (!steps) return;

    let current = null;
    let ticking = false;

    function setStep(step) {
      if (step === current) return;
      current = step;

      lits.forEach((element, index) => {
        element.classList.toggle("is-on", index === step);
      });

      spots.forEach((element, index) => {
        element.classList.toggle("is-on", index === step);
      });

      caps.forEach((element) => {
        element.classList.toggle(
          "is-on",
          Number(element.dataset.gazeCap) === step
        );
      });

      dots.forEach((element, index) => {
        element.classList.toggle("is-on", index <= step);
      });

      section.classList.remove("is-final");
      section.style.setProperty(
        "--gaze-dim",
        step < 0 ? ".82" : ".5"
      );
    }

    function update() {
      ticking = false;

      if (!desktop.matches || reduceMotion) return;

      const rect = section.getBoundingClientRect();
      const total = Math.max(
        1,
        rect.height - window.innerHeight
      );
      const progress = clamp(
        -rect.top / total,
        0,
        1
      );

      const step =
        progress < 0.12
          ? -1
          : Math.min(
              steps - 1,
              Math.floor(
                (progress - 0.12) / (0.88 / steps)
              )
            );

      setStep(step);
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    if (reduceMotion) {
      lits.forEach((element) => element.classList.add("is-on"));
      spots.forEach((element) => element.classList.add("is-on"));
      caps.forEach((element) => element.classList.add("is-on"));
      section.style.setProperty("--gaze-dim", ".82");
      return;
    }

    window.addEventListener(
      "scroll",
      requestUpdate,
      { passive: true }
    );
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("pageshow", requestUpdate);

    update();
  }

  /* 02-4. 감정 카드: 휠·트랙패드 가로 이동 + 좌우 버튼 */
  function initUserEmotionSlider() {
    const viewport = document.querySelector(
      ".user-emotion__viewport"
    );
    const slides = Array.from(
      document.querySelectorAll(".user-emotion__panel")
    );
    const prevButton = document.querySelector(
      "[data-user-horizontal-prev]"
    );
    const nextButton = document.querySelector(
      "[data-user-horizontal-next]"
    );

    if (
      !viewport ||
      !slides.length ||
      !prevButton ||
      !nextButton
    ) {
      return;
    }

    let currentIndex = 0;
    let scrollTimer = null;
    let resizeTimer = null;

    function getSlidePosition(index) {
      return (
        slides[index].offsetLeft -
        slides[0].offsetLeft
      );
    }

    function updateActiveSlide() {
      slides.forEach((slide, index) => {
        slide.classList.toggle(
          "is-active",
          index === currentIndex
        );
      });
    }

    function updateButtons() {
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === slides.length - 1;

      prevButton.style.opacity =
        prevButton.disabled ? "0.45" : "1";
      nextButton.style.opacity =
        nextButton.disabled ? "0.45" : "1";
    }

    function moveToSlide(index) {
      currentIndex = clamp(
        index,
        0,
        slides.length - 1
      );

      viewport.scrollTo({
        left: getSlidePosition(currentIndex),
        behavior: reduceMotion ? "auto" : "smooth"
      });

      updateActiveSlide();
      updateButtons();
    }

    prevButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        moveToSlide(currentIndex - 1);
      }
    });

    nextButton.addEventListener("click", () => {
      if (currentIndex < slides.length - 1) {
        moveToSlide(currentIndex + 1);
      }
    });

    viewport.addEventListener("wheel", (event) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      const maxScroll =
        viewport.scrollWidth - viewport.clientWidth;
      const atStart = viewport.scrollLeft <= 2;
      const atEnd = viewport.scrollLeft >= maxScroll - 2;

      if (
        (delta < 0 && atStart) ||
        (delta > 0 && atEnd)
      ) {
        return;
      }

      event.preventDefault();
      viewport.scrollLeft += delta * 1.05;
    }, { passive: false });

    viewport.addEventListener("scroll", () => {
      window.clearTimeout(scrollTimer);

      scrollTimer = window.setTimeout(() => {
        const scrollLeft = viewport.scrollLeft;
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        slides.forEach((slide, index) => {
          const distance = Math.abs(
            scrollLeft - getSlidePosition(index)
          );

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        currentIndex = nearestIndex;
        updateActiveSlide();
        updateButtons();
      }, 80);
    });

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        viewport.scrollLeft =
          getSlidePosition(currentIndex);
      }, 150);
    });

    moveToSlide(0);
  }
});

/* =========================================================
   PROBLEM FIGURES — 수치로 보는 문제 (82% · 1.5m · 55m)
   2026.10.07 추가 (문제정의 .zip figures.js 정리)
   ---------------------------------------------------------
   스크롤 진행에 따라 82% → 1.5m → 55m 장면 전환,
   숫자 카운트업, 오른쪽 단계 표시.
   스타일 : about.css 맨 아래 [PROBLEM FIGURES]
========================================================= */
(() => {
  "use strict";

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const initFigures = () => {
    document.querySelectorAll("[data-figures]").forEach((root) => {
      const track = root.querySelector("[data-figures-track]");
      const figures = Array.from(root.querySelectorAll("[data-figure]"));
      const medias = Array.from(root.querySelectorAll("[data-figure-media]"));
      const steps = Array.from(root.querySelectorAll("[data-figure-step]"));

      if (!track || !figures.length) return;

      let current = -1;
      let ticking = false;

      /* -----------------------------------------------------
         01. 숫자 카운트업 — 장면에 들어올 때마다 0부터 다시
      ----------------------------------------------------- */
      const countUp = (value) => {
        const target = parseFloat(value.getAttribute("data-count"));
        const decimals = parseInt(
          value.getAttribute("data-count-decimals") || "0",
          10
        );
        const startedAt = performance.now();

        const run = (now) => {
          const t = Math.min(((now || performance.now()) - startedAt) / 1100, 1);
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

          value.textContent = (target * eased).toFixed(decimals);

          if (t < 1) window.requestAnimationFrame(run);
        };

        run();
      };

      /* -----------------------------------------------------
         02. 장면 바꾸기 (글 / 배경 사진 / 단계 표시)
      ----------------------------------------------------- */
      const apply = (next) => {
        if (next === current) return;
        current = next;

        figures.forEach((figure, i) => {
          figure.classList.toggle("is-on", i === next);
        });

        medias.forEach((media, i) => {
          media.classList.toggle("is-on", i === next);

          /* 영상은 보일 때만 재생 */
          if (media.tagName === "VIDEO") {
            if (i === next) {
              const played = media.play();
              if (played && played.catch) played.catch(() => {});
            } else {
              media.pause();
            }
          }
        });

        steps.forEach((step, i) => {
          step.classList.toggle("is-on", i === next);
        });

        const value =
          figures[next] && figures[next].querySelector("[data-count]");

        if (value && !reduceMotion) countUp(value);
      };

      /* -----------------------------------------------------
         03. 스크롤 → 몇 번째 장면인지 계산
      ----------------------------------------------------- */
      const update = () => {
        ticking = false;

        const rect = track.getBoundingClientRect();
        const total = rect.height - window.innerHeight;

        if (total <= 0) {
          apply(0);
          return;
        }

        const progress = Math.min(Math.max(-rect.top / total, 0), 0.9999);
        apply(Math.floor(progress * figures.length));
      };

      const onScroll = () => {
        if (ticking) return;

        ticking = true;
        window.requestAnimationFrame(update);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);

      update();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFigures);
  } else {
    initFigures();
  }
})();


/* =========================================================
   USER DEFINITION — 사용자 정의 조합안 / 2026.10.07
   (dadeulrim_user_mix_final.zip → about.js 로 정리)
   ---------------------------------------------------------
   zip 의 ud.js / ud-v1·v2·v4·v5.js / ud-mix.js 중
   user.html 에서 실제로 쓰는 동작만 모음.

   00 공통 도구 (UD)
   01 HERO       : 문장 속 창이 화면 전체로 커짐
   02 DEFINITION : 소리 파형이 잦아들며 문장 등장 (0.zip)
   03 CONTEXT    : 장면 4개 교체 + 진행 막대
   04 EMOTION    : 단어 + 이미지 줄이 옆으로 흐름
   05 배경 섞기  : 섹션마다 배경색이 천천히 섞임
   06 NEEDS      : 고정 화면 3단계

   스타일 : about.css 맨 아래 [USER DEFINITION]
========================================================= */
(() => {
  "use strict";

  const main = document.querySelector("[data-mix]");
  if (!main) return;

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ---------------------------------------------------------
     00. 공통 도구
  --------------------------------------------------------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOut = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* 모바일 기준 — CSS 의 900px 과 같음 */
  const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

  /* 고정(sticky) 트랙 안에서 진행도 0 ~ 1 */
  const progress = (el) => {
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;

    if (total > 0) return clamp(-r.top / total);
    return r.top < 0 ? 1 : 0;
  };

  /* 화면을 지나가는 진행도 : 아래에서 들어올 때 0 → 위로 나갈 때 1 */
  const pass = (el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;

    return clamp((vh - r.top) / (vh + r.height));
  };

  /* 스크롤 / 크기 변경마다 한 프레임에 한 번 실행 */
  const onScroll = (fn) => {
    let ticking = false;

    const run = () => {
      ticking = false;
      fn();
    };

    const request = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(run);
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    fn();
  };

  /* [data-split] 문장을 단어 단위 span 으로 나눔 */
  const splitWords = (el) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();

          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;

            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }

            const word = document.createElement("span");
            const inner = document.createElement("span");

            word.className = "ud-w";
            inner.className = "ud-w__i";
            inner.textContent = part;

            word.appendChild(inner);
            frag.appendChild(word);
          });

          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    };

    walk(el);
  };

  $$("[data-split]", main).forEach(splitWords);

  /* [data-reveal] 화면에 들어오면 .is-in */
  const revealItems = $$("[data-reveal]", main);

  if (reduce || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((el) => io.observe(el));
  }


  /* ---------------------------------------------------------
     01. HERO — 문장 속 작은 창이 화면 전체로 커짐
  --------------------------------------------------------- */

  const hero = $("[data-v2-hero]");
  const win = $("[data-v2-win]");
  const slot = hero && $(".v2-hero__slot", hero);
  const wordL = $("[data-v2-l]");
  const wordR = $("[data-v2-r]");
  const shade = $("[data-v2-shade]");
  const after = $("[data-v2-after]");
  const hint = $("[data-v2-hint]");

  let slotBox = null;

  /* 창이 시작하는 자리 = 제목 가운데 빈칸(slot) */
  const measureHero = () => {
    if (!slot) return;

    const sticky = hero.firstElementChild.getBoundingClientRect();
    const r = slot.getBoundingClientRect();

    slotBox = {
      x: r.left - sticky.left,
      y: r.top - sticky.top,
      w: r.width,
      h: r.height,
    };
  };

  const updateHero = () => {
    if (!hero || !win || !slotBox) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const p = reduce ? 1 : progress(hero);
    const t = inOut(clamp(p / 0.62));

    /* 빈칸 → 화면 전체 */
    win.style.left = `${lerp(slotBox.x, 0, t)}px`;
    win.style.top = `${lerp(slotBox.y, 0, t)}px`;
    win.style.width = `${lerp(slotBox.w, vw, t)}px`;
    win.style.height = `${lerp(slotBox.h, vh, t)}px`;
    /* 2026.10.07 : 시작 라운드 14px → 6px (덜 둥글게, about.css 맨 끝 블록과 맞춤) */
    win.style.borderRadius = `${lerp(6, 0, t)}px`;

    /* 양옆 단어는 밀려나며 사라짐 (모바일은 제자리) */
    const spread = isMobile() ? 0 : t * vw * 0.32;
    wordL.style.transform = `translate3d(${-spread}px, 0, 0)`;
    wordR.style.transform = `translate3d(${spread}px, 0, 0)`;
    wordL.style.opacity = wordR.style.opacity = String(1 - clamp(t * 1.6));

    /* 커진 뒤 어둡게 + 정의 문장 */
    shade.style.opacity = String(clamp((p - 0.5) / 0.25));

    const a = clamp((p - 0.62) / 0.22);
    after.style.opacity = String(a);
    after.style.transform = `translateY(${(1 - a) * 20}px)`;

    if (hint) hint.style.opacity = String(1 - clamp(p * 6));
  };


  /* ---------------------------------------------------------
     02. DEFINITION — 소리 파형이 잦아들며 문장이 나타남
     2026.10.07 수정 (0.zip wave-definition)
     스크롤 0 → 55% : 파형 크기 120 → 0
     35% / 47%      : 문장 → 해시태그 순서로 나타남
  --------------------------------------------------------- */

  const wd = $("[data-wd]");
  const wdWaves = wd ? $$("[data-wd-wave]", wd) : [];
  const wdFades = wd ? $$("[data-wd-fade]", wd) : [];

  let wdProgress = 0;
  const wdStart = performance.now();

  /* 가운데가 크고 양 끝은 0 인 파형 */
  const wavePath = (amp, freq, phase, k) => {
    const W = 1440;
    const mid = 150;
    let d = "";

    for (let x = 0; x <= W; x += 8) {
      const env = Math.sin((Math.PI * x) / W);
      const y =
        mid +
        amp *
          env *
          (Math.sin(x * freq + phase) * 0.7 +
            Math.sin(x * freq * 2.3 + phase * 1.7 + k) * 0.3);

      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }

    return d;
  };

  /* 파형은 시간에 따라 계속 출렁임 (스크롤할수록 잦아듦) */
  const drawWaves = (now) => {
    const t = (now - wdStart) / 1000;
    const amp = reduce ? 0 : 120 * Math.pow(1 - clamp(wdProgress / 0.55), 1.6);

    wdWaves.forEach((wave, i) => {
      wave.setAttribute(
        "d",
        wavePath(amp * (1 - i * 0.22), 0.012 + i * 0.002, t * (1.6 + i * 0.4), i)
      );
    });

    window.requestAnimationFrame(drawWaves);
  };

  if (wdWaves.length) window.requestAnimationFrame(drawWaves);

  const updateDefinition = () => {
    if (!wd) return;

    wdProgress = progress(wd);

    wdFades.forEach((el, i) => {
      el.classList.toggle("is-on", reduce || wdProgress > 0.35 + i * 0.12);
    });
  };


  /* ---------------------------------------------------------
     03. CONTEXT — 장면 4개 교체 + 진행 막대
  --------------------------------------------------------- */

  const ctx = $("[data-v4-ctx]");
  const scenes = $$("[data-v4-scene]");
  const items = $$("[data-v4-item]");
  const bar = $("[data-v4-bar]");

  let ctxCurrent = -1;

  const updateContext = () => {
    if (!ctx) return;

    const p = progress(ctx);
    const i = Math.min(3, Math.floor(p * 4));

    if (i !== ctxCurrent) {
      ctxCurrent = i;
      scenes.forEach((s, n) => s.classList.toggle("is-on", n === i));
      items.forEach((s, n) => s.classList.toggle("is-on", n === i));
    }

    if (bar) bar.style.width = `${(p * 100).toFixed(2)}%`;
  };


  /* ---------------------------------------------------------
     04. EMOTION — 단어 + 이미지 줄이 옆으로 흐름
  --------------------------------------------------------- */

  const emo = $("[data-v5-emo]");
  const emoTrack = $("[data-v5-emo-track]");
  const emoLine = emo && $(".v5-emo__line", emo);

  /*
   * 2026.10.07 수정 — 흐르기 시작하는 타이밍
   * 기존 : 섹션 윗부분이 화면에 들어오는 순간부터 흐름
   *        → 단어 줄이 보일 때쯤 이미 FOCUS 까지 지나가 TENSION 이 안 보임
   * 변경 : 단어 줄(.v5-emo__line) 위치 기준
   *        줄 윗변이 화면 70% 지점에 올 때 시작 → 화면 맨 위(0)에 닿을 때 끝
   *        (그 전까지는 TENSION 이 처음 자리에 그대로)
   */
  const updateEmotion = () => {
    if (!emo || !emoTrack || reduce) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const lineTop = (emoLine || emo).getBoundingClientRect().top;
    const p = clamp((vh * 0.7 - lineTop) / (vh * 0.7));
    const max = Math.max(0, emoTrack.scrollWidth - vw * 0.6);

    emoTrack.style.transform =
      `translate3d(${-inOut(p) * max}px, 0, 0)`;
  };


  /* ---------------------------------------------------------
     05. 배경 섞기 — 섹션마다 배경색이 천천히 섞임
     다음 섹션 윗변이 화면 80% → 20% 지점을 지나는 동안 섞임
  --------------------------------------------------------- */

  const css = getComputedStyle(main);
  const hex = (value, fallback) => {
    const h = (value || fallback).trim().replace("#", "");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  };

  const COLORS = {
    dark: hex(css.getPropertyValue("--mix-dark"), "#050505"),
    night: hex(css.getPropertyValue("--mix-night"), "#0a0c0f"),
    gray: hex(css.getPropertyValue("--mix-gray"), "#17191c"),
  };

  const mixSections = $$(":scope > [data-mix-bg]", main);

  const updateBackground = () => {
    if (!mixSections.length) return;

    const vh = window.innerHeight;
    let color = COLORS[mixSections[0].dataset.mixBg].slice();

    for (let i = 1; i < mixSections.length; i++) {
      const top = mixSections[i].getBoundingClientRect().top;
      const t = inOut(clamp((vh * 0.8 - top) / (vh * 0.6)));

      if (t <= 0) break;

      const next = COLORS[mixSections[i].dataset.mixBg];
      color = [0, 1, 2].map((k) => color[k] + (next[k] - color[k]) * t);
    }

    main.style.backgroundColor = `rgb(${color.map(Math.round).join(",")})`;
  };


  /* ---------------------------------------------------------
     06. NEEDS — 고정 화면 3단계
     ① 0 ~ .28  이미지가 화면 가득 커짐
     ② .32 ~    어둡게 + 흐리게, 세 가지 포인트
     ③ .74 ~    마무리 문장 + 인터페이스 보러가기
  --------------------------------------------------------- */

  const needs = $("[data-mx-needs]");
  const needsHead = needs && $("[data-mx-head]", needs);
  const needsMedia = needs && $("[data-mx-media]", needs);
  const needsImg = needs && $("[data-mx-img]", needs);
  const needsVeil = needs && $("[data-mx-veil]", needs);
  const needsPoints = needs && $("[data-mx-points]", needs);
  const needsEnd = needs && $("[data-mx-end]", needs);

  const updateNeeds = () => {
    if (!needs) return;

    const p = reduce ? 0.5 : progress(needs);
    const mobile = isMobile();

    /* ① 확장 */
    const a = inOut(clamp(p / 0.28));
    const top = lerp(mobile ? 34 : 30, 0, a);
    const side = lerp(mobile ? 4 : 6, 0, a);
    const bottom = lerp(mobile ? 20 : 6, 0, a);

    needsMedia.style.clipPath =
      `inset(${top}% ${side}% ${bottom}% ${side}% round ${lerp(18, 0, a)}px)`;

    const headOut = clamp((p - 0.06) / 0.16);
    needsHead.style.opacity = String(1 - headOut);
    needsHead.style.transform = `translateY(${-headOut * 30}px)`;

    /* ② 어둡게 + 흐리게 */
    const d = inOut(clamp((p - 0.32) / 0.14));
    const d2 = clamp((p - 0.66) / 0.12);

    needsVeil.style.opacity = String(d * 0.62 + d2 * 0.2);
    needsImg.style.filter = d > 0 ? `blur(${(d * 10 + d2 * 6).toFixed(1)}px)` : "";
    needsImg.style.transform = `scale(${1.04 + d * 0.04})`;

    needsPoints.classList.toggle("is-in", p > 0.4 && p < 0.68);
    needsPoints.classList.toggle("is-out", p >= 0.68);

    /* ③ 마무리 */
    needsEnd.classList.toggle("is-in", p >= 0.74);
  };


  /* ---------------------------------------------------------
     실행
  --------------------------------------------------------- */

  measureHero();

  onScroll(() => {
    updateHero();
    updateDefinition();
    updateContext();
    updateEmotion();
    updateBackground();
    updateNeeds();
  });

  const remeasure = () => {
    measureHero();
    updateHero();
  };

  window.addEventListener("resize", remeasure);
  window.addEventListener("load", remeasure);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(remeasure);
  }
})();
