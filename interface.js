/* =========================================================
   DADEULLIM — INTERFACE
   DISPLAY / HANDLE / HUD 공용 JavaScript
========================================================= */


/* =========================================================
   COMMON HEADER — INTERFACE
   DISPLAY / HANDLE / HUD
   ---------------------------------------------------------
   - 페이지 최상단에서는 전체 헤더 표시
   - 스크롤 시 가운데 NAV / MEGA만 숨김
   - 왼쪽 DADEULLIM 로고는 CSS에서 항상 유지
   - 상단 82px HOT ZONE 진입 시 NAV / MEGA 다시 표시
   - 헤더 hover / focus 중에는 계속 표시
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const page =
      document.body;


    if (
      !page.classList.contains(
        "interface-page"
      )
    ) {
      return;
    }


    const siteHeader =
      document.querySelector(
        ".site-header"
      );


    if (
      !siteHeader
    ) {
      return;
    }


    const HEADER_TOP_THRESHOLD =
      24;

    const HEADER_HOT_ZONE =
      82;


    let headerFrame =
      0;

    let pointerInsideHeader =
      false;

    let pointerInsideHotZone =
      false;


    const isPageTop =
      () =>
        window.scrollY <=
        HEADER_TOP_THRESHOLD;


    const showHeaderAtTop =
      () => {

        page.classList.remove(
          "is-header-hidden",
          "is-header-peek"
        );
      };


    const hideHeader =
      () => {

        if (
          isPageTop() ||
          pointerInsideHeader ||
          pointerInsideHotZone ||
          siteHeader.matches(
            ":focus-within"
          )
        ) {
          return;
        }


        page.classList.add(
          "is-header-hidden"
        );

        page.classList.remove(
          "is-header-peek"
        );
      };


    const peekHeader =
      () => {

        if (
          isPageTop()
        ) {

          showHeaderAtTop();
          return;
        }


        page.classList.add(
          "is-header-hidden",
          "is-header-peek"
        );
      };


    const syncHeaderState =
      () => {

        headerFrame =
          0;


        if (
          isPageTop()
        ) {

          showHeaderAtTop();
          return;
        }


        if (
          pointerInsideHeader ||
          pointerInsideHotZone ||
          siteHeader.matches(
            ":focus-within"
          )
        ) {

          peekHeader();
          return;
        }


        hideHeader();
      };


    const requestHeaderSync =
      () => {

        if (
          headerFrame
        ) {
          return;
        }


        headerFrame =
          window.requestAnimationFrame(
            syncHeaderState
          );
      };


    siteHeader.addEventListener(
      "pointerenter",
      () => {

        pointerInsideHeader =
          true;


        if (
          !isPageTop()
        ) {
          peekHeader();
        }
      }
    );


    siteHeader.addEventListener(
      "pointerleave",
      () => {

        pointerInsideHeader =
          false;


        if (
          !pointerInsideHotZone
        ) {
          requestHeaderSync();
        }
      }
    );


    siteHeader.addEventListener(
      "focusin",
      () => {

        if (
          !isPageTop()
        ) {
          peekHeader();
        }
      }
    );


    siteHeader.addEventListener(
      "focusout",
      () => {

        window.requestAnimationFrame(
          () => {

            if (
              !siteHeader.matches(
                ":focus-within"
              )
            ) {
              requestHeaderSync();
            }
          }
        );
      }
    );


    document.addEventListener(
      "pointermove",
      (
        event
      ) => {

        const nextHotZone =
          !isPageTop() &&
          event.clientY <=
          HEADER_HOT_ZONE;


        if (
          nextHotZone ===
          pointerInsideHotZone
        ) {
          return;
        }


        pointerInsideHotZone =
          nextHotZone;


        if (
          pointerInsideHotZone
        ) {

          peekHeader();

        } else if (
          !pointerInsideHeader
        ) {

          requestHeaderSync();
        }
      },
      {
        passive: true
      }
    );


    window.addEventListener(
      "scroll",
      requestHeaderSync,
      {
        passive: true
      }
    );


    window.addEventListener(
      "resize",
      requestHeaderSync,
      {
        passive: true
      }
    );


    window.addEventListener(
      "pageshow",
      requestHeaderSync
    );


    syncHeaderState();
  }
);


/* =========================================================
   DISPLAY
   ---------------------------------------------------------
   - 공통 헤더 동작 유지
   - 01~05 화면 전환: 실제 step 위치 기준 + 부드러운 crossfade
   - 큰 영문 DRIVE / MULTI VIEW / NAVIGATION / SMART CARE / SOS 복구
   - OVERVIEW 효과 interface.js 내부 통합
   - EXPLORE THE DISPLAY 가로 카드 스크롤 복구
   - HANDLE / HUD 로직은 아래 기존 코드 그대로 유지
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body;
  const displayRoot = document.querySelector(
    ".display-main, .display-concept"
  );

  if (
    !page.classList.contains("display-page") &&
    !displayRoot
  ) {
    return;
  }

  document.documentElement.classList.add("js");


  /* =====================================================
     UTIL
  ===================================================== */

  const clamp = (
    value,
    min = 0,
    max = 1
  ) =>
    Math.min(
      max,
      Math.max(
        min,
        value
      )
    );


  const lerp = (
    start,
    end,
    progress
  ) =>
    start +
    (
      end -
      start
    ) *
    progress;


  const smoothstep = (
    value
  ) => {
    const p =
      clamp(value);

    return (
      p *
      p *
      (
        3 -
        2 *
        p
      )
    );
  };


  const easeOutCubic = (
    value
  ) =>
    1 -
    Math.pow(
      1 -
      clamp(value),
      3
    );


  const padNumber = (
    value
  ) =>
    String(value)
      .padStart(
        2,
        "0"
      );


  const sectionProgress = (
    section
  ) => {

    if (!section) {
      return 0;
    }

    const rect =
      section
        .getBoundingClientRect();

    const distance =
      Math.max(
        1,
        section.offsetHeight -
        window.innerHeight
      );

    return clamp(
      -rect.top /
      distance
    );
  };


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  const mobileLayout =
    window.matchMedia(
      "(max-width: 820px)"
    );



  /* =====================================================
     HERO
  ===================================================== */

  const customHero =
    document.querySelector(
      "[data-display-hero]"
    );


  const customHeroVisual =
    customHero?.querySelector(
      "[data-display-hero-image]"
    );


  const customHeroWord =
    customHero?.querySelector(
      ".display-hero__word"
    );


  const customHeroHeading =
    customHero?.querySelector(
      ".display-hero__heading"
    );


  const ddHero =
    document.querySelector(
      ".dd-hero"
    );


  const resetCustomHero =
    () => {

      if (
        customHeroVisual
      ) {
        customHeroVisual.style
          .transform =
          "";
      }

      if (
        customHeroWord
      ) {
        customHeroWord.style
          .transform =
          "";
      }

      if (
        customHeroHeading
      ) {

        customHeroHeading.style
          .transform =
          "";

        customHeroHeading.style
          .opacity =
          "";
      }
    };


  const updateHero =
    () => {

      if (
        ddHero
      ) {

        const heroDistance =
          Math.max(
            ddHero.offsetHeight -
            window.innerHeight,
            1
          );


        const progress =
          clamp(
            window.scrollY /
            heroDistance
          );


        ddHero.style.setProperty(
          "--hero-progress",
          progress.toFixed(4)
        );


        ddHero.style.setProperty(
          "--hero-x",
          `${(
            progress *
            5
          ).toFixed(3)}vw`
        );


        ddHero.style.setProperty(
          "--hero-y",
          `${(
            progress *
            7
          ).toFixed(3)}vh`
        );


        ddHero.style.setProperty(
          "--hero-scale",
          (
            1 +
            progress *
            0.09
          ).toFixed(4)
        );


        ddHero.style.setProperty(
          "--hero-ambient-opacity",
          (
            1 -
            progress *
            0.55
          ).toFixed(4)
        );
      }


      if (
        !customHero ||
        !customHeroVisual
      ) {
        return;
      }


      if (
        reducedMotion.matches
      ) {

        resetCustomHero();

        return;
      }


      const rect =
        customHero
          .getBoundingClientRect();


      const viewport =
        window.innerHeight;


      if (
        rect.bottom <
        0 ||
        rect.top >
        viewport
      ) {
        return;
      }


      const progress =
        clamp(
          (
            viewport -
            rect.top
          ) /
          Math.max(
            viewport +
            rect.height,
            1
          )
        );


      const visualY =
        lerp(
          18,
          -18,
          progress
        );


      const visualScale =
        lerp(
          0.995,
          1.025,
          progress
        );


      customHeroVisual.style
        .transform =
        `translate3d(0, ${visualY.toFixed(2)}px, 0) ` +
        `scale(${visualScale.toFixed(4)})`;


      if (
        customHeroWord
      ) {

        const wordY =
          lerp(
            16,
            -10,
            progress
          );


        customHeroWord.style
          .transform =
          `translateX(-50%) ` +
          `translate3d(0, ${wordY.toFixed(2)}px, 0)`;
      }


      if (
        customHeroHeading
      ) {

        const headingY =
          lerp(
            8,
            -8,
            progress
          );


        const headingFade =
          clamp(
            (
              progress -
              0.64
            ) /
            0.34
          );


        customHeroHeading.style
          .transform =
          `translate3d(0, ${headingY.toFixed(2)}px, 0)`;


        customHeroHeading.style
          .opacity =
          String(
            lerp(
              1,
              0.72,
              headingFade
            )
          );
      }
    };

      /* =====================================================
     01~05 DISPLAY STORY / SCENES
  ===================================================== */

  const scenes =
    document.querySelector(
      ".display-scenes, " +
      "[data-display-scenes], " +
      "[data-scenes], " +
      ".dd-story, " +
      "[data-story]"
    );


  const sceneNames = [
    "DRIVE",
    "MULTI VIEW",
    "NAVIGATION",
    "SMART CARE",
    "SOS"
  ];


  const sceneTones = [
    "drive",
    "multi",
    "navigation",
    "care",
    "sos"
  ];


  const storyTones = [
    "ice",
    "pearl",
    "blue",
    "graphite",
    "signal"
  ];


  const sceneScreens =
    scenes
      ? Array.from(
          scenes.querySelectorAll(
            "[data-display-screen], " +
            "[data-scene-screen], " +
            "[data-story-image], " +
            ".display-scenes__image, " +
            ".db-screen"
          )
        )
      : [];


  const sceneCopies =
    scenes
      ? Array.from(
          scenes.querySelectorAll(
            "[data-display-copy], " +
            "[data-scene-copy], " +
            "[data-story-step], " +
            ".display-scene, " +
            ".db-scene-copy"
          )
        )
      : [];


  const storyDevice =
    scenes?.querySelector(
      "[data-story-device], " +
      ".dd-device--story"
    );


  const sceneCurrent =
    scenes?.querySelector(
      "[data-display-scene-current], " +
      "[data-scene-current], " +
      "[data-story-current]"
    );


  const sceneVisual =
    scenes?.querySelector(
      ".display-scenes__visual, " +
      ".display-scenes__sticky, " +
      ".db-scenes__sticky, " +
      ".dd-story__visual"
    );


  let sceneWord =
    scenes?.querySelector(
      "[data-display-scene-word], " +
      "[data-scene-giant], " +
      ".display-scenes__word, " +
      ".display-scenes__giant, " +
      ".db-scenes__giant, " +
      ".dd-story__word"
    );


  if (
    scenes &&
    sceneVisual &&
    !sceneWord
  ) {

    sceneWord =
      document.createElement(
        "p"
      );


    sceneWord.setAttribute(
      "aria-hidden",
      "true"
    );


    sceneWord.setAttribute(
      "data-display-scene-word",
      ""
    );


    if (
      scenes.matches(
        ".dd-story, [data-story]"
      )
    ) {

      sceneWord.className =
        "dd-story__word";

    } else if (
      scenes.matches(
        ".db-scenes, [data-scenes]"
      )
    ) {

      sceneWord.className =
        "db-scenes__giant display-scenes__word";

    } else {

      sceneWord.className =
        "display-scenes__word";
    }


    sceneWord.textContent =
      sceneNames[0];


    sceneVisual.prepend(
      sceneWord
    );
  }


  const sceneWordColors = [
    "rgba(116, 133, 255, 0.12)",
    "rgba(164, 170, 255, 0.115)",
    "rgba(104, 166, 255, 0.13)",
    "rgba(179, 151, 255, 0.12)",
    "rgba(255, 142, 151, 0.12)"
  ];


  let lastSceneIndex =
    -1;


  const setSceneTone =
    (
      index
    ) => {

      if (
        !scenes
      ) {
        return;
      }


      const safeIndex =
        clamp(
          index,
          0,
          sceneNames.length -
          1
        );


      const sceneTone =
        sceneTones[
          safeIndex
        ] ||
        "drive";


      const storyTone =
        sceneCopies[
          safeIndex
        ]?.dataset?.tone ||
        storyTones[
          safeIndex
        ] ||
        "ice";


      scenes.dataset
        .displayTone =
        sceneTone;


      scenes.dataset
        .sceneTone =
        sceneTone;


      scenes.dataset
        .storyTone =
        storyTone;


      if (
        sceneWord
      ) {

        sceneWord.textContent =
          sceneNames[
            safeIndex
          ] ||
          "DISPLAY";


        sceneWord.style.color =
          sceneWordColors[
            safeIndex
          ];
      }


      if (
        sceneCurrent
      ) {

        sceneCurrent.textContent =
          padNumber(
            safeIndex +
            1
          );
      }
    };



  const getStepBasedSceneState =
    () => {

      const count =
        Math.min(
          sceneScreens.length,
          sceneCopies.length ||
          sceneScreens.length
        );


      if (
        !count
      ) {

        return {
          lower: 0,
          upper: 0,
          blend: 0,
          active: 0
        };
      }


      const hasRealSteps =
        sceneCopies.length >=
        count &&
        sceneCopies.some(
          (
            copy
          ) =>
            copy.hasAttribute(
              "data-story-step"
            )
        );


      if (
        !hasRealSteps
      ) {

        const progress =
          sectionProgress(
            scenes
          );


        const position =
          progress *
          (
            count -
            1
          );


        const lower =
          Math.floor(
            position
          );


        const upper =
          Math.min(
            count -
            1,
            lower +
            1
          );


        const blend =
          smoothstep(
            position -
            lower
          );


        return {
          lower,
          upper,
          blend,
          active:
            blend <
            0.5
              ? lower
              : upper
        };
      }


      const viewportCenter =
        window.innerHeight *
        (
          mobileLayout.matches
            ? 0.64
            : 0.5
        );


      const centers =
        sceneCopies
          .slice(
            0,
            count
          )
          .map(
            (
              copy
            ) => {

              const rect =
                copy
                  .getBoundingClientRect();


              return (
                rect.top +
                rect.height *
                0.5
              );
            }
          );


      if (
        viewportCenter <=
        centers[0]
      ) {

        return {
          lower: 0,
          upper: 0,
          blend: 0,
          active: 0
        };
      }


      if (
        viewportCenter >=
        centers[
          count -
          1
        ]
      ) {

        return {
          lower:
            count -
            1,

          upper:
            count -
            1,

          blend: 0,

          active:
            count -
            1
        };
      }


      for (
        let i = 0;
        i <
        count -
        1;
        i +=
        1
      ) {

        const currentCenter =
          centers[
            i
          ];


        const nextCenter =
          centers[
            i +
            1
          ];


        if (
          viewportCenter >=
          currentCenter &&
          viewportCenter <=
          nextCenter
        ) {

          const raw =
            clamp(
              (
                viewportCenter -
                currentCenter
              ) /
              Math.max(
                nextCenter -
                currentCenter,
                1
              )
            );


          const blend =
            smoothstep(
              clamp(
                (
                  raw -
                  0.14
                ) /
                0.72
              )
            );


          return {
            lower:
              i,

            upper:
              i +
              1,

            blend,

            active:
              blend <
              0.5
                ? i
                : i +
                  1
          };
        }
      }


      return {
        lower: 0,
        upper: 0,
        blend: 0,
        active: 0
      };
    };



  const setScreenVisual =
    (
      screen,
      opacity,
      active,
      zIndex
    ) => {

      const visible =
        opacity >
        0.002;


      screen.style
        .opacity =
        opacity.toFixed(
          4
        );


      screen.style
        .visibility =
        visible
          ? "visible"
          : "hidden";


      screen.style
        .transition =
        "none";


      screen.style
        .zIndex =
        String(
          zIndex
        );


      screen.style
        .transform =
        "none";


      screen.classList.toggle(
        "is-active",
        active
      );


      screen.setAttribute(
        "aria-hidden",
        active
          ? "false"
          : "true"
      );


      const innerImage =
        screen.matches(
          "img"
        )
          ? null
          : screen.querySelector(
              "img"
            );


      if (
        innerImage
      ) {

        innerImage.style
          .opacity =
          "1";


        innerImage.style
          .visibility =
          "visible";


        innerImage.style
          .transform =
          "none";
      }
    };



  const updateScenes =
    () => {

      if (
        !scenes ||
        !sceneScreens.length
      ) {
        return;
      }


      const count =
        Math.min(
          sceneScreens.length,
          sceneCopies.length ||
          sceneScreens.length
        );


      if (
        !count
      ) {
        return;
      }


      const state =
        getStepBasedSceneState();


      const {
        lower,
        upper
      } =
        state;


      const blend =
        reducedMotion.matches
          ? 0
          : state.blend;


      const activeIndex =
        state.active;


      sceneScreens
        .slice(
          0,
          count
        )
        .forEach(
          (
            screen,
            index
          ) => {

            let opacity =
              0;

            let y =
              0;

            let scale =
              1;


            if (
              lower ===
              upper
            ) {

              opacity =
                index ===
                lower
                  ? 1
                  : 0;

            } else if (
              index ===
              lower
            ) {

              opacity =
                1 -
                blend;


              y =
                lerp(
                  0,
                  -window.innerHeight *
                  0.018,
                  blend
                );


              scale =
                lerp(
                  1,
                  1.012,
                  blend
                );

            } else if (
              index ===
              upper
            ) {

              opacity =
                blend;


              y =
                lerp(
                  window.innerHeight *
                  0.028,
                  0,
                  blend
                );


              scale =
                lerp(
                  0.985,
                  1,
                  blend
                );
            }


            setScreenVisual(
              screen,
              opacity,
              index ===
              activeIndex,
              index ===
              activeIndex
                ? 4
                : 3
            );


            if (
              !screen.matches(
                "img"
              ) &&
              opacity >
              0.002
            ) {

              screen.style
                .transform =
                `translate3d(0, ${y.toFixed(2)}px, 0) ` +
                `scale(${scale.toFixed(4)})`;

            } else {

              screen.style
                .transform =
                "none";
            }
          }
        );


      sceneCopies
        .slice(
          0,
          count
        )
        .forEach(
          (
            copy,
            index
          ) => {

            let opacity =
              0;

            let y =
              0;


            if (
              lower ===
              upper
            ) {

              opacity =
                index ===
                lower
                  ? 1
                  : 0;


              y =
                0;

            } else if (
              index ===
              lower
            ) {

              opacity =
                1 -
                blend;


              y =
                lerp(
                  0,
                  -18,
                  blend
                );

            } else if (
              index ===
              upper
            ) {

              opacity =
                blend;


              y =
                lerp(
                  18,
                  0,
                  blend
                );
            }


            const visible =
              opacity >
              0.002;


            copy.style
              .opacity =
              opacity.toFixed(
                4
              );


            copy.style
              .visibility =
              visible
                ? "visible"
                : "hidden";


            copy.style
              .transform =
              `translate3d(0, ${y.toFixed(2)}px, 0)`;


            copy.style
              .transition =
              "none";


            copy.style
              .zIndex =
              String(
                index ===
                activeIndex
                  ? 7
                  : 6
              );


            copy.classList.toggle(
              "is-active",
              index ===
              activeIndex
            );


            copy.setAttribute(
              "aria-hidden",
              index ===
              activeIndex
                ? "false"
                : "true"
            );
          }
        );


      if (
        storyDevice &&
        !reducedMotion.matches &&
        lower !==
        upper
      ) {

        const pulse =
          Math.sin(
            blend *
            Math.PI
          );


        storyDevice.style
          .transform =
          `translate3d(0, ${(-3 * pulse).toFixed(2)}px, 0) ` +
          `scale(${(1 + 0.0035 * pulse).toFixed(4)})`;

      } else if (
        storyDevice
      ) {

        storyDevice.style
          .transform =
          "";
      }


      if (
        activeIndex !==
        lastSceneIndex
      ) {

        setSceneTone(
          activeIndex
        );


        lastSceneIndex =
          activeIndex;
      }
    };



  if (
    scenes &&
    sceneScreens.length
  ) {

    setSceneTone(
      0
    );


    sceneScreens.forEach(
      (
        screen,
        index
      ) => {

        setScreenVisual(
          screen,
          index ===
          0
            ? 1
            : 0,
          index ===
          0,
          index ===
          0
            ? 4
            : 3
        );
      }
    );


    sceneCopies.forEach(
      (
        copy,
        index
      ) => {

        const active =
          index ===
          0;


        copy.style
          .opacity =
          active
            ? "1"
            : "0";


        copy.style
          .visibility =
          active
            ? "visible"
            : "hidden";


        copy.style
          .transform =
          "none";


        copy.classList.toggle(
          "is-active",
          active
        );
      }
    );


    lastSceneIndex =
      0;
  }
    /* =====================================================
     PASS-BY
  ===================================================== */

  const passby =
    document.querySelector(
      "[data-passby]"
    );


  const passbyProduct =
    passby?.querySelector(
      "[data-passby-product]"
    );


  const updatePassby =
    () => {

      if (
        !passby ||
        !passbyProduct ||
        reducedMotion.matches
      ) {
        return;
      }


      const progress =
        sectionProgress(
          passby
        );


      const viewportWidth =
        window.innerWidth;


      const startX =
        -viewportWidth *
        (
          mobileLayout.matches
            ? 0.95
            : 0.72
        );


      const endX =
        viewportWidth *
        (
          mobileLayout.matches
            ? 0.78
            : 0.96
        );


      const x =
        lerp(
          startX,
          endX,
          progress
        );


      const arc =
        Math.sin(
          progress *
          Math.PI
        );


      const y =
        lerp(
          35,
          -55,
          progress
        ) -
        arc *
        38;


      const scale =
        0.86 +
        arc *
        0.15;


      passbyProduct.style
        .transform =
        `translate3d(${x.toFixed(1)}px, ` +
        `calc(-50% + ${y.toFixed(1)}px), 0) ` +
        `scale(${scale.toFixed(3)})`;
    };



  /* =====================================================
     DISPLAY OVERVIEW
     모든 정보가, 한눈에.
  ===================================================== */

  const overview =
    document.querySelector(
      ".display-overview"
    );


  const overviewIntro =
    overview?.querySelector(
      ".display-overview__intro"
    );


  const overviewEyebrow =
    overview?.querySelector(
      ".display-overview__eyebrow"
    );


  const overviewTitle =
    overview?.querySelector(
      ".display-overview__title"
    );


  const overviewDescription =
    overview?.querySelector(
      ".display-overview__description"
    );


  const overviewVisual =
    overview?.querySelector(
      ".display-overview__visual"
    );


  const overviewBackgroundWord =
    overview?.querySelector(
      ".display-overview__background-word"
    );


  const overviewCards =
    overview
      ? Array.from(
          overview.querySelectorAll(
            ".display-info"
          )
        )
      : [];


  const overviewTexts =
    overview
      ? Array.from(
          overview.querySelectorAll(
            ".display-info__text"
          )
        )
      : [];


  /* 2026.10.27 : 펼친 화면이 너무 커서 줄임 620 → 500 (맥북 기준, 큰 화면은 아래 sc 로 비율대로) */
  const OVERVIEW_CARD_MAX =
    500;


  const OVERVIEW_CARD_ZIGZAG =
    150;


  const OVERVIEW_CARD_STEP =
    0.85;


  const OVERVIEW_STACK_WIDTH =
    0.40;


  const OVERVIEW_STACK_SCALE =
    0.038;


  const OVERVIEW_STACK_DROP =
    0.032;


  const OVERVIEW_STACK_TILT = [
    -2.4,
    2.4,
    -2.4,
    2.4
  ];


  const OVERVIEW_STACK_FADE = [
    1,
    0.6,
    0.38,
    0.22
  ];


  const OVERVIEW_CARD_RATIO =
    1194 /
    834;


  const overviewMetrics = {
    titleBlock: 0
  };


  const ensureOverviewCardStyle =
    () => {

      if (
        !overview ||
        document.getElementById(
          "overview-card-style-integrated"
        )
      ) {
        return;
      }


      const style =
        document.createElement(
          "style"
        );


      style.id =
        "overview-card-style-integrated";


      style.textContent = `
        /* 2026.10.27 : 모서리 둥근 정도 줄임 12px → 5px */
        .display-page .display-overview .display-info__image {
          border-radius: 5px;
          overflow: hidden;
          box-shadow:
            0 30px 70px rgba(0, 0, 0, 0.55),
            0 6px 18px rgba(0, 0, 0, 0.38),
            0 0 0 1px rgba(255, 255, 255, 0.07) !important;
        }

        .display-page .display-overview .display-info__image img {
          display: block;
          border-radius: 5px;   /* 전 12px */
        }
      `;


      document.head.appendChild(
        style
      );
    };


  const prepareOverview =
    () => {

      if (
        !overview
      ) {
        return;
      }


      ensureOverviewCardStyle();


      [
        overviewIntro,
        overviewTitle,
        overviewDescription,
        overviewVisual,
        ...overviewCards,
        ...overviewTexts
      ].forEach(
        (
          element
        ) => {

          if (
            element
          ) {

            element.style
              .transition =
              "none";
          }
        }
      );
    };


  const measureOverview =
    () => {

      if (
        !overview ||
        !overviewIntro ||
        !overviewTitle
      ) {
        return;
      }


      /* 2026.11.03 : 큰 화면(1513 이상)은 980 도 맥북 비율대로 */
      const endWidth =
        Math.min(
          window.innerWidth *
          0.82,
          980 *
          Math.max(
            1,
            window.innerWidth /
            1512
          )
        );


      const previousWidth =
        overviewIntro.style
          .width;


      overviewIntro.style
        .width =
        `${endWidth}px`;


      /*
       * 2026.10.06 수정
       * 소제목(eyebrow)을 숨기면 offsetHeight가 0
       * → 이때는 간격 24px도 더하지 않음
       */
      const eyebrowHeight =
        overviewEyebrow &&
        overviewEyebrow
          .offsetHeight
          ? overviewEyebrow
              .offsetHeight +
            24
          : 0;


      overviewMetrics
        .titleBlock =
        eyebrowHeight +
        overviewTitle
          .offsetHeight *
        0.88;


      overviewIntro.style
        .width =
        previousWidth;
    };


  const clearOverviewInlineStyles =
    () => {

      const wipe =
        (
          element,
          properties
        ) => {

          if (
            !element
          ) {
            return;
          }


          properties.forEach(
            (
              property
            ) => {

              element.style
                .removeProperty(
                  property
                );
            }
          );
        };


      wipe(
        overviewIntro,
        [
          "top",
          "left",
          "width",
          "transform",
          "text-align"
        ]
      );


      wipe(
        overviewTitle,
        [
          "transform"
        ]
      );


      wipe(
        overviewDescription,
        [
          "opacity",
          "transform"
        ]
      );


      wipe(
        overviewVisual,
        [
          "top",
          "left",
          "width",
          "height",
          "transform"
        ]
      );


      wipe(
        overviewBackgroundWord,
        [
          "left",
          "opacity"
        ]
      );


      overviewCards.forEach(
        (
          card
        ) => {

          wipe(
            card,
            [
              "top",
              "left",
              "width",
              "transform",
              "opacity"
            ]
          );
        }
      );


      overviewTexts.forEach(
        (
          text
        ) => {

          wipe(
            text,
            [
              "opacity",
              "transform"
            ]
          );
        }
      );
    };


  const updateOverview =
    () => {

      if (
        !overview ||
        !overviewIntro ||
        !overviewVisual ||
        !overviewCards.length
      ) {
        return;
      }


      if (
        mobileLayout.matches
      ) {

        clearOverviewInlineStyles();

        return;
      }


      const p =
        sectionProgress(
          overview
        );


      const vw =
        window.innerWidth;


      const vh =
        window.innerHeight;


      const titleMove =
        smoothstep(
          clamp(
            (
              p -
              0.03
            ) /
            0.17
          )
        );


      const visualMove =
        smoothstep(
          clamp(
            (
              p -
              0.05
            ) /
            0.18
          )
        );


      const spread =
        smoothstep(
          clamp(
            (
              p -
              0.20
            ) /
            0.24
          )
        );


      const column =
        clamp(
          (
            p -
            0.46
          ) /
          0.46
        );


      /* 2026.10.27 : textGap 은 아래 sc 다음으로 옮김 (큰 화면에서 비율대로) */


      const textWidth =
        overviewTexts[
          0
        ]
          ? overviewTexts[
              0
            ].offsetWidth
          : 190;


      /* 2026.10.27 : 양옆 여백이 좁아 빡빡해 보여서 26px → 화면 폭의 6% (맥북 약 90px)
         큰 화면(1513 이상)은 맥북 비율 그대로 커지게 sc */
      const sc =
        Math.max(
          1,
          vw /
          1512
        );


      const sideMargin =
        Math.max(
          56,
          vw *
          0.06
        );


      const textGap =
        vw >
        1100
          ? 52 *
            sc
          : 34;


      const zigzagTarget =
        Math.min(
          OVERVIEW_CARD_ZIGZAG *
          sc,
          vw *
          0.105
        );


      const cardWidth =
        Math.max(
          260,
          Math.min(
            (
              vw /
              2 -
              sideMargin -
              textWidth -
              textGap -
              zigzagTarget
            ) *
            2,
            vw *
            0.34,   /* 2026.10.27 : 전 0.44 */
            OVERVIEW_CARD_MAX *
            sc
          )
        );


      const cardHeight =
        cardWidth /
        OVERVIEW_CARD_RATIO;


      const zigzag =
        Math.min(
          zigzagTarget,
          vw /
          2 -
          sideMargin -
          textWidth -
          textGap -
          cardWidth /
          2
        );


      const bandTop =
        vh *
        0.085 +
        overviewMetrics
          .titleBlock +
        vh *
        0.028;


      const bandBottom =
        vh *
        0.99;


      const step =
        cardHeight *
        OVERVIEW_CARD_STEP;


      const columnHeight =
        cardHeight +
        step *
        (
          overviewCards.length -
          1
        );


      const travel =
        Math.max(
          0,
          columnHeight -
          (
            bandBottom -
            bandTop
          )
        );


      const shift =
        travel *
        column;


      const shiftPct =
        (
          shift /
          vh
        ) *
        100;


      const firstCenter =
        bandTop +
        cardHeight /
        2;


      overviewIntro.style
        .top =
        `${(
          lerp(
            50,
            8.5,
            titleMove
          ) -
          shiftPct
        ).toFixed(3)}%`;


      overviewIntro.style
        .left =
        `${lerp(
          2,
          50,
          titleMove
        ).toFixed(3)}%`;


      overviewIntro.style
        .width =
        /* 2026.11.03 : 아이맥에서 글씨는 1.35배인데 제목 칸은 370px 그대로라 줄 · 정렬이 어긋남
           → 370 · 980 도 sc 배 (맥북은 sc = 1 그대로) */
        `${lerp(
          370 *
          sc,
          Math.min(
            vw *
            0.82,
            980 *
            sc
          ),
          titleMove
        ).toFixed(1)}px`;


      overviewIntro.style
        .transform =
        `translate(` +
        `${lerp(
          0,
          -50,
          titleMove
        ).toFixed(2)}%, ` +
        `${lerp(
          -50,
          0,
          titleMove
        ).toFixed(2)}%)`;


      overviewIntro.style
        .textAlign =
        titleMove >
        0.62
          ? "center"
          : "left";


      if (
        overviewTitle
      ) {

        overviewTitle.style
          .transform =
          `scale(${lerp(
            1,
            0.88,
            titleMove
          ).toFixed(4)})`;
      }


      if (
        overviewBackgroundWord
      ) {

        overviewBackgroundWord.style
          .opacity =
          lerp(
            0.34,
            1,
            titleMove
          ).toFixed(3);


        overviewBackgroundWord.style
          .left =
          `${lerp(
            62,
            50,
            titleMove
          ).toFixed(2)}%`;
      }


      if (
        overviewDescription
      ) {

        const fade =
          smoothstep(
            clamp(
              (
                p -
                0.05
              ) /
              0.15
            )
          );


        overviewDescription.style
          .opacity =
          (
            1 -
            fade
          ).toFixed(3);


        overviewDescription.style
          .transform =
          `translateY(${lerp(
            0,
            -10,
            fade
          ).toFixed(2)}px)`;
      }


      overviewVisual.style
        .left =
        `${lerp(
          71,
          50,
          visualMove
        ).toFixed(3)}%`;


      overviewVisual.style
        .top =
        `${lerp(
          53,
          50,
          visualMove
        ).toFixed(3)}%`;


      overviewVisual.style
        .width =
        `${lerp(
          /* 2026.11.03 : 760 도 sc 배 (아이맥) */
          Math.min(
            vw *
            0.54,
            760 *
            sc
          ),
          vw,
          visualMove
        ).toFixed(1)}px`;


      overviewVisual.style
        .height =
        `${lerp(
          vh *
          0.72,
          vh,
          visualMove
        ).toFixed(1)}px`;


      overviewVisual.style
        .transform =
        "translate(-50%, -50%)";


      /* 2026.11.03 : 아이맥에서 펼치기 전 화면 4장이 620px 에서 멈춰 작게 모여 보임 → 620 도 sc 배 */
      const stackWidth =
        Math.min(
          vw *
          OVERVIEW_STACK_WIDTH,
          620 *
          sc,
          (
            vw *
            0.29 -
            30
          ) *
          2,
          Math.max(
            260,
            (
              bandBottom -
              bandTop -
              vh *
              OVERVIEW_STACK_DROP *
              (
                overviewCards.length -
                1
              ) -
              24
            ) *
            OVERVIEW_CARD_RATIO
          )
        );


      /* 2026.11.03 : 아이맥은 세로가 짧아 카드 사이가 좁게 모여 보임 → 맥북 간격(860 × 0.032)의 sc 배보다 작지 않게 */
      const stackDrop =
        Math.max(
          vh *
          OVERVIEW_STACK_DROP,
          860 *
          OVERVIEW_STACK_DROP *
          sc
        );


      const stackHeight =
        stackWidth /
        OVERVIEW_CARD_RATIO;


      const stackTailHeight =
        (
          stackWidth *
          (
            1 -
            (
              overviewCards.length -
              1
            ) *
            OVERVIEW_STACK_SCALE
          )
        ) /
        OVERVIEW_CARD_RATIO;


      const stackOffset =
        (
          stackDrop *
          (
            overviewCards.length -
            1
          ) +
          stackTailHeight /
          2 -
          stackHeight /
          2
        ) /
        2;


      const stageHeight =
        lerp(
          vh *
          0.72,
          vh,
          visualMove
        );


      const stageTopEdge =
        (
          vh *
          lerp(
            53,
            50,
            visualMove
          )
        ) /
        100 -
        stageHeight /
        2;


      const stackCenter =
        lerp(
          vh *
          0.53,
          (
            bandTop +
            bandBottom
          ) /
          2,
          visualMove
        ) -
        stackOffset;


      overviewCards.forEach(
        (
          card,
          index
        ) => {

          const stagger =
            index *
            0.07;


          const local =
            smoothstep(
              clamp(
                (
                  spread -
                  stagger
                ) /
                Math.max(
                  1 -
                  stagger,
                  0.01
                )
              )
            );


          const stackTop =
            (
              (
                stackCenter +
                index *
                stackDrop -
                stageTopEdge
              ) /
              stageHeight
            ) *
            100;


          const columnTop =
            (
              (
                firstCenter +
                index *
                step -
                shift
              ) /
              vh
            ) *
            100;


          const top =
            lerp(
              stackTop,
              columnTop,
              local
            );


          const x =
            lerp(
              0,
              index %
              2 ===
              0
                ? -zigzag
                : zigzag,
              local
            );


          const width =
            lerp(
              stackWidth *
              (
                1 -
                index *
                OVERVIEW_STACK_SCALE
              ),
              cardWidth,
              local
            );


          const rotate =
            reducedMotion.matches
              ? 0
              : lerp(
                  OVERVIEW_STACK_TILT[
                    index
                  ] ??
                  0,
                  0,
                  local
                );


          card.style
            .opacity =
            lerp(
              OVERVIEW_STACK_FADE[
                index
              ] ??
              1,
              1,
              local
            ).toFixed(3);


          card.style
            .top =
            `${top.toFixed(3)}%`;


          card.style
            .left =
            "50%";


          card.style
            .width =
            `${width.toFixed(1)}px`;


          card.style
            .transform =
            "translate(-50%, -50%) " +
            `translate3d(${x.toFixed(2)}px, 0, 0) ` +
            `rotate(${rotate.toFixed(2)}deg)`;


          const text =
            overviewTexts[
              index
            ];


          if (
            text
          ) {

            const textProgress =
              smoothstep(
                clamp(
                  (
                    local -
                    0.35
                  ) /
                  0.5
                )
              );


            text.style
              .opacity =
              textProgress
                .toFixed(3);


            text.style
              .transform =
              `translateY(calc(-50% + ${lerp(
                10,
                0,
                textProgress
              ).toFixed(2)}px))`;
          }
        }
      );
    };


  prepareOverview();

  measureOverview();
    /* =====================================================
     EXPLORE THE DISPLAY — HORIZONTAL GALLERY
  ===================================================== */

  const modernGallery =
    document.querySelector(
      ".display-gallery, " +
      "[data-display-gallery]"
    );


  const modernGalleryViewport =
    modernGallery?.querySelector(
      ".display-gallery__viewport"
    );


  const modernGalleryTrack =
    modernGallery?.querySelector(
      ".display-gallery__track, " +
      "[data-display-gallery-track]"
    );


  const modernGalleryProgress =
    modernGallery?.querySelector(
      "[data-display-gallery-progress] span, " +
      ".display-gallery__progress span"
    );


  const legacyFunctions =
    document.querySelector(
      "[data-functions]"
    );


  const legacyFunctionsTrack =
    legacyFunctions?.querySelector(
      "[data-functions-track]"
    );


  const legacyFunctionsProgress =
    legacyFunctions?.querySelector(
      "[data-functions-progress]"
    );


  let modernGalleryMaxShift =
    0;


  let legacyFunctionsMaxShift =
    0;


  const measureHorizontalSections =
    () => {

      if (
        modernGallery &&
        modernGalleryTrack
      ) {

        const viewportWidth =
          modernGalleryViewport?.clientWidth ||
          window.innerWidth;


        modernGalleryMaxShift =
          Math.max(
            modernGalleryTrack.scrollWidth -
            viewportWidth,
            0
          );
      }


      if (
        legacyFunctions &&
        legacyFunctionsTrack
      ) {

        legacyFunctionsMaxShift =
          Math.max(
            legacyFunctionsTrack.scrollWidth -
            window.innerWidth +
            window.innerWidth *
            0.04,
            0
          );
      }
    };


  const updateModernGallery =
    () => {

      if (
        !modernGallery ||
        !modernGalleryTrack
      ) {
        return;
      }


      if (
        mobileLayout.matches ||
        reducedMotion.matches
      ) {

        modernGalleryTrack.style
          .transform =
          "none";


        if (
          modernGalleryProgress
        ) {

          modernGalleryProgress.style
            .transform =
            "scaleX(1)";
        }

        return;
      }


      const progress =
        sectionProgress(
          modernGallery
        );


      const eased =
        easeOutCubic(
          progress
        );


      const shift =
        modernGalleryMaxShift *
        eased;


      modernGalleryTrack.style
        .transform =
        `translate3d(${-shift.toFixed(1)}px, 0, 0)`;


      if (
        modernGalleryProgress
      ) {

        modernGalleryProgress.style
          .transform =
          `scaleX(${progress.toFixed(4)})`;
      }
    };


  const updateLegacyFunctions =
    () => {

      if (
        !legacyFunctions ||
        !legacyFunctionsTrack
      ) {
        return;
      }


      if (
        mobileLayout.matches ||
        reducedMotion.matches
      ) {

        legacyFunctionsTrack.style
          .transform =
          "none";


        if (
          legacyFunctionsProgress
        ) {

          legacyFunctionsProgress.style
            .transform =
            "scaleX(1)";
        }

        return;
      }


      const progress =
        sectionProgress(
          legacyFunctions
        );


      const eased =
        easeOutCubic(
          progress
        );


      const shift =
        legacyFunctionsMaxShift *
        eased;


      legacyFunctionsTrack.style
        .transform =
        `translate3d(${-shift.toFixed(1)}px, 0, 0)`;


      if (
        legacyFunctionsProgress
      ) {

        legacyFunctionsProgress.style
          .transform =
          `scaleX(${progress.toFixed(4)})`;
      }
    };


  const stageGallery =
    modernGallery?.querySelector(
      ".display-gallery__stage"
    );


  const stageGalleryCards =
    stageGallery
      ? Array.from(
          stageGallery.querySelectorAll(
            ".display-gallery__card"
          )
        )
      : [];


  const updateStageGallery =
    () => {

      if (
        !modernGallery ||
        !stageGallery ||
        !stageGalleryCards.length ||
        modernGalleryTrack
      ) {
        return;
      }


      if (
        mobileLayout.matches
      ) {

        stageGalleryCards.forEach(
          (
            card
          ) => {

            card.style
              .opacity =
              "";


            card.style
              .transform =
              "";
          }
        );

        return;
      }


      const progress =
        sectionProgress(
          modernGallery
        );


      const count =
        stageGalleryCards.length;


      const position =
        progress *
        Math.max(
          count -
          1,
          1
        );


      const lower =
        Math.floor(
          position
        );


      const upper =
        Math.min(
          count -
          1,
          lower +
          1
        );


      const blend =
        smoothstep(
          position -
          lower
        );


      stageGalleryCards.forEach(
        (
          card,
          index
        ) => {

          let opacity =
            0;


          let x =
            80;


          if (
            index ===
            lower
          ) {

            opacity =
              1 -
              blend;


            x =
              lerp(
                0,
                -90,
                blend
              );
          }


          if (
            index ===
            upper
          ) {

            opacity =
              upper ===
              lower
                ? 1
                : blend;


            x =
              upper ===
              lower
                ? 0
                : lerp(
                    90,
                    0,
                    blend
                  );
          }


          card.style
            .opacity =
            opacity.toFixed(4);


          card.style
            .transform =
            `translate(-50%, -50%) ` +
            `translate3d(${x.toFixed(2)}px, 0, 0)`;


          card.style
            .zIndex =
            String(
              index ===
              (
                blend <
                0.5
                  ? lower
                  : upper
              )
                ? 5
                : 4
            );
        }
      );
    };



  /* =====================================================
     REVEAL
  ===================================================== */

  const revealElements =
    Array.from(
      document.querySelectorAll(
        ".dd-reveal"
      )
    );


  if (
    revealElements.length
  ) {

    if (
      "IntersectionObserver" in
      window
    ) {

      const revealObserver =
        new IntersectionObserver(
          (
            entries,
            observer
          ) => {

            entries.forEach(
              (
                entry
              ) => {

                if (
                  !entry.isIntersecting
                ) {
                  return;
                }


                entry.target
                  .classList.add(
                    "is-visible"
                  );


                observer.unobserve(
                  entry.target
                );
              }
            );
          },
          {
            threshold: 0.14,
            rootMargin:
              "0px 0px -8% 0px"
          }
        );


      revealElements.forEach(
        (
          element,
          index
        ) => {

          element.style
            .transitionDelay =
            `${Math.min(
              index %
              3,
              2
            ) *
            80}ms`;


          revealObserver.observe(
            element
          );
        }
      );

    } else {

      revealElements.forEach(
        (
          element
        ) => {

          element.classList.add(
            "is-visible"
          );
        }
      );
    }
  }



  /* =====================================================
     DISPLAY RENDER LOOP
  ===================================================== */

  let renderFrame =
    0;


  const render =
    () => {

      renderFrame =
        0;


      updateHero();

      updateScenes();

      updatePassby();

      updateOverview();

      updateModernGallery();

      updateLegacyFunctions();

      updateStageGallery();
    };


  const requestRender =
    () => {

      if (
        renderFrame
      ) {
        return;
      }


      renderFrame =
        window.requestAnimationFrame(
          render
        );
    };


  const refreshLayout =
    () => {

      measureOverview();

      measureHorizontalSections();

      requestRender();
    };


  window.addEventListener(
    "scroll",
    requestRender,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    refreshLayout,
    {
      passive: true
    }
  );


  window.addEventListener(
    "pageshow",
    refreshLayout
  );


  window.addEventListener(
    "load",
    refreshLayout,
    {
      once: true
    }
  );


  const mediaChange =
    () => {

      refreshLayout();
    };


  if (
    reducedMotion
      .addEventListener
  ) {

    reducedMotion.addEventListener(
      "change",
      mediaChange
    );


    mobileLayout.addEventListener(
      "change",
      mediaChange
    );

  } else {

    reducedMotion.addListener(
      mediaChange
    );


    mobileLayout.addListener(
      mediaChange
    );
  }


  document
    .querySelectorAll(
      ".display-main img, " +
      ".display-concept img"
    )
    .forEach(
      (
        image
      ) => {

        if (
          !image.complete
        ) {

          image.addEventListener(
            "load",
            refreshLayout,
            {
              once: true
            }
          );
        }
      }
    );


  measureOverview();

  measureHorizontalSections();

  render();
});

/* =========================================================
   DISPLAY OUTRO — 03 연결 / 2026.10.08
   ---------------------------------------------------------
   화면에 20% 들어오면 둥근 카드 → 풀블리드로 열림 (.is-in)
   스타일 : interface.css 맨 아래 [DISPLAY OUTRO]
   (display-outro.zip 코드 → interface.js 로 정리)
========================================================= */

(() => {

  const outro =
    document.querySelector(
      "[data-display-outro]"
    );

  if (!outro) {
    return;
  }


  /* IntersectionObserver 없는 브라우저 → 바로 열린 상태 */
  if (!("IntersectionObserver" in window)) {
    outro.classList.add("is-in");
    return;
  }


  const io =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            outro.classList.add("is-in");
            io.unobserve(outro);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

  io.observe(outro);

})();


/* =========================================================
   DISPLAY FAN — 부채처럼 펼쳐지는 화면들 / 2026.10.10
   ---------------------------------------------------------
   스크롤 진행도(p 0 → 1)에 따라
   1. 앞부분 45% 동안 접힌 부채가 펼쳐짐 (카드 사이 2° → 11.5°)
   2. 부채 전체가 왼쪽으로 돌며 가운데 카드를 강조 (.is-act)
   스타일 : interface.css 맨 아래 [DISPLAY FAN]
   (12345.zip fan-section.html 코드 → interface.js 로 정리)

   2026.10.10 수정
   ---- 가운데로 올수록 카드가 커짐 (최대 1.14배)
   ---- 마우스를 올리면 한 번 더 커지고 밝아짐 (CSS --fan-hover)
   ---- 밝아지는 게 너무 빠르고 툭툭 바뀜
        전) 카드 번호 기준 0.5 → 1 로 바로 전환, 스크롤 값 그대로 반영
        후) 가운데까지의 '각도' 기준으로 부드럽게 (0.42 → 1)
            + 스크롤 값을 바로 쓰지 않고 따라가듯 보간(lerp)해서 천천히
========================================================= */

(() => {

  const sec =
    document.querySelector("[data-fan]");

  if (!sec) {
    return;
  }


  const cards =
    Array.from(
      sec.querySelectorAll(".fan__card")
    );

  const n =
    cards.length;

  const clamp = (v, a = 0, b = 1) =>
    Math.min(b, Math.max(a, v));

  const ease = (t) =>
    1 - Math.pow(1 - t, 3);

  /* 0 → 1 부드러운 곡선 (가운데 근처에서 천천히 변함) */
  const smooth = (t) =>
    t * t * (3 - 2 * t);


  /* 화면에 그리는 진행도 — 스크롤 값(target)을 천천히 따라감 */
  let shown = null;
  let raf = 0;


  function progress() {
    const r =
      sec.getBoundingClientRect();

    return clamp(-r.top / (r.height - innerHeight));
  }


  function render(p) {

    const H = innerHeight;
    const mob = innerWidth < 900;

    /* 앞부분 45% 동안 펼쳐짐 */
    const open =
      ease(clamp(p * 2.2));

    /* 카드 사이 각도 : 2° → 11.5° (모바일 10°) */
    const step =
      2 + open * (mob ? 8 : 9.5);

    /* 축에서 카드까지 거리 (CSS top 두 번째 값과 같게) */
    const R =
      mob ? H * 0.62 : H * 0.95;

    let best = 0;
    let bestA = Infinity;

    cards.forEach((c, j) => {

      /* 가운데 카드 기준 각도 + 스크롤에 따라 전체가 왼쪽으로 */
      const a =
        (j - (n - 1) / 2) * step -
        (p - 0.45) * open * 24;

      /* 가운데(0°)에 얼마나 가까운지 0 → 1 (카드 1.6장 거리부터 서서히) */
      const near =
        smooth(clamp(1 - Math.abs(a) / (step * 1.6 + 4)));

      /* 크기 : 가장자리 1 → 가운데 1.14 (펼쳐진 뒤에만) */
      const scale =
        1 + near * 0.14 * open;

      /* 밝기 : 가장자리 0.42 → 가운데 1
         2026.10.10 : 너무 밝아서 → 가장자리 0.36 → 가운데 0.86 */
      const light =
        0.36 + near * 0.5;

      c.style.transform =
        `rotate(${a.toFixed(2)}deg) translateY(${-R}px) ` +
        `scale(calc(${scale.toFixed(4)} * var(--fan-hover, 1)))`;

      /* 가장자리로 갈수록 흐려짐 */
      c.style.opacity =
        clamp(1.4 - Math.abs(a) / 60).toFixed(3);

      /* 가운데 카드가 위로 (마우스 올린 카드는 맨 위) */
      c.style.zIndex =
        200 - Math.round(Math.abs(a)) +
        (c.matches(":hover") ? 100 : 0);

      c.style.filter =
        `brightness(calc(${light.toFixed(3)} + var(--fan-hover-light, 0)))`;

      if (Math.abs(a) < bestA) {
        bestA = Math.abs(a);
        best = j;
      }

    });

    cards.forEach((c, j) => {
      c.classList.toggle("is-act", j === best);
    });

  }


  function tick() {

    const target =
      progress();

    if (shown === null) {
      shown = target;
    }

    /* 따라가는 속도 (작을수록 느리고 부드러움) */
    shown += (target - shown) * 0.1;

    if (Math.abs(target - shown) < 0.0005) {
      shown = target;
    }

    render(shown);

    raf =
      shown === target
        ? 0
        : requestAnimationFrame(tick);

  }


  const wake = () => {
    if (!raf) {
      raf = requestAnimationFrame(tick);
    }
  };


  addEventListener("scroll", wake, { passive: true });
  addEventListener("resize", wake);

  /* 마우스 올린 카드 z-index 갱신 */
  cards.forEach((c) => {
    c.addEventListener("mouseenter", () => render(shown ?? progress()));
    c.addEventListener("mouseleave", () => render(shown ?? progress()));
  });

  shown = progress();
  render(shown);

})();


/* =========================================================
   MANIFESTO COUNT — 0.0 → 11.0 / 2026.10.10
   ---------------------------------------------------------
   화면에 40% 들어오면 숫자가 0.0 에서 11.0 까지 올라감 (1.8초, 끝에서 천천히)
   화면 밖으로 완전히 나가면 0.0 으로 돌려 놓아 다시 들어올 때 또 재생
   스타일 : interface.css 맨 아래 [DISPLAY MANIFESTO]
========================================================= */

(() => {

  const el =
    document.querySelector("[data-count-to]");

  if (!el) {
    return;
  }


  const to =
    parseFloat(el.dataset.countTo) || 0;

  const digits =
    (el.dataset.countTo.split(".")[1] || "").length;

  const reduce =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const format = (v) =>
    v.toFixed(digits);

  /* 끝으로 갈수록 천천히 */
  const ease = (t) =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  let raf = 0;


  /* 최종 숫자 폭으로 고정 → 0.0 일 때도 위치가 흔들리지 않음 */
  const lockWidth = () => {
    el.style.width = "";
    el.textContent = format(to);
    el.style.width = `${el.offsetWidth}px`;
  };


  const play = () => {

    cancelAnimationFrame(raf);

    const start =
      performance.now();

    const dur =
      1800;

    el.classList.add("is-counting");

    const step = (now) => {

      const t =
        Math.min(1, (now - start) / dur);

      el.textContent =
        format(to * ease(t));

      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        el.classList.remove("is-counting");
      }

    };

    raf = requestAnimationFrame(step);

  };


  const reset = () => {
    cancelAnimationFrame(raf);
    el.textContent = format(0);
  };


  if (reduce || !("IntersectionObserver" in window)) {
    return;
  }


  lockWidth();
  reset();

  addEventListener("resize", () => {
    const now = el.textContent;
    lockWidth();
    el.textContent = now;
  });


  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        /* 한 번 재생하면 화면 밖으로 완전히 나갈 때까지 다시 재생 안 함 */
        if (entry.intersectionRatio >= 0.4 && !el.dataset.played) {
          el.dataset.played = "1";
          play();
        } else if (!entry.isIntersecting) {
          delete el.dataset.played;
          reset();
        }
      });
    },
    {
      threshold: [0, 0.4],
    }
  ).observe(el.closest("section") || el);

})();


/* =========================================================
   HUD 16 — HUD 페이지 시안 16 / 2026.10.17
   ---------------------------------------------------------
   hud16_code.zip 의 hud16.js → 따로 파일 만들지 않고 interface.js 로 정리
   .hud16 이 없는 페이지(디스플레이 · 핸들)에서는 아무것도 안 함
   스타일 : interface.css 맨 아래 [HUD 16]

   1. 공통 유틸 (스크롤 진행도 · 등장 효과) — window.DD
   2. 히어로 : 완성된 HUD → 스크롤하면 기울어지며 한 장씩 펼쳐짐
   3. Sound → Sight / 단어 섹션 (#words 안에 다섯 섹션 생성)
   4. 반사(하프미러)
   5. 레이어 라벨 · 큰 번호

   ---- 바꾼 곳
        이미지 경로 ./hud16/img/ → ./images/hud16/
        "SCROLL · 01 LAYER" → "01 LAYER"
        반사 복사본 : 매 프레임 계속 → 스크롤할 때만 (가볍게)
========================================================= */

/* =========================================================
   DADEULLIM — HUD (시안 16)
   1. 공통 유틸 (스크롤 진행도 · 등장 효과)
   2. 히어로 : 완성된 HUD → 스크롤하면 기울어지며 한 장씩 펼쳐짐
   3. Sound → Sight / 단어 섹션
   4. 반사(하프미러)
========================================================= */
(() => {
  /* HUD 16 페이지에서만 */
  if (!document.body || !document.body.classList.contains("hud16-page")) return;

  document.documentElement.classList.add("js");
  /* ---------- REVEAL ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  const watch = () => document.querySelectorAll(".rv, .lines").forEach((el) => io.observe(el));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
  else watch();

  /* ---------- 스크롤 유틸 ---------- */
  window.DD = {
    clamp: (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    ease: (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3),
    smooth: (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); },
    /* sticky 섹션 진행도 0~1 */
    progress(el) {
      const r = el.getBoundingClientRect();
      const d = Math.max(1, el.offsetHeight - innerHeight);
      return Math.min(1, Math.max(0, -r.top / d));
    },
    /* 화면 통과 진행도 : 아래에서 들어올 때 0, 위로 나갈 때 1 */
    pass(el) {
      const r = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
    },
    seg: (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a))),
    onFrame(fn) {
      let raf = 0;
      const run = () => { raf = 0; fn(); };
      const req = () => { if (!raf) raf = requestAnimationFrame(run); };
      addEventListener("scroll", req, { passive: true });
      addEventListener("resize", req);
      req();
      return req;
    },
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    asset: "./images/hud16/"   /* 2026.10.17 : 이미지 경로 ./hud16/img/ → ./images/hud16/ */
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector(".hud16")) return;

  /* =====================================================
     [HUD 최종] 2026.10.18 — 히어로 : 시안 E / 두 번째 섹션 : 시안 A
     전) 영상 히어로(.hv) + 다섯 겹 섹션(#hx3 · 떠다니는 라벨 · 가운데 가로줄)
     후) 가운데 빛나는 영상 + 하프미러 반사(.hf-hero)
         다섯 겹 : 왼쪽 고정 무대 + 오른쪽으로 지나가는 설명 블록 (#haLy)
     스타일 : interface.css 맨 아래 [HUD 최종]
  ===================================================== */

  (() => {
    /* 히어로 : 반사 영상을 원본 시간에 맞춤 (1초마다 어긋나면 맞춤) */
    const v1 = document.querySelector(".hf-spec__v video");
    const v2 = document.querySelector(".hf-spec__r video");
    if (!v1 || !v2) return;
    if (DD.reduced) { [v1, v2].forEach((v) => { v.removeAttribute("autoplay"); v.pause(); }); return; }
    setInterval(() => {
      if (Math.abs(v1.currentTime - v2.currentTime) > 0.08) v2.currentTime = v1.currentTime;
    }, 1000);
  })();


  (() => {
    const W = [
      { w: "Siren", c: "var(--ink)", lc: "var(--red)", img: "w-siren", lv: "DANGER", t: "1:35", dir: "우측 20m", src: "구급차 사이렌", h: "사이렌이 울리면,<br>방향부터 보입니다.", p: "귀 아이콘에서 음파가 번지고, 차량 아이콘의 오른쪽 호가 붉게 차오릅니다. 어디서 오는지 먼저 알아야 길을 비켜 줄 수 있기 때문입니다." },
      { w: "Horn", c: "var(--ink)", lc: "var(--amber)", img: "w-horn", lv: "CAUTION", t: "1:01", dir: "후방 5m", src: "뒤차 경적", h: "뒤에서 울린 경적도<br>앞에서 읽습니다.", p: "백미러를 볼 필요 없이, 차량 아이콘 아래쪽 호와 '뒤차가 경적을 울렸어요' 한 문장으로 알려 줍니다." },
      { w: "Stop", c: "var(--ink)", lc: "var(--red)", img: "w-stop", lv: "DANGER", t: "0:54", dir: "전방 12m", src: "이륜차 횡단", h: "멈춰야 할 때는<br>행동을 먼저.", p: "가장 위급한 순간에는 상황 설명보다 '즉시 정지'라는 지시가 앞섭니다. 차로 셰브론 전체가 붉게 바뀝니다." },
      { w: "Gap", c: "var(--ink)", lc: "var(--amber)", img: "w-gap", lv: "CAUTION", t: "0:20", dir: "전방 28m", src: "앞차 감속", h: "앞차가 느려지면<br>거리가 보입니다.", p: "차간거리가 좁아지면 차로가 노랗게 바뀌고, 남은 거리가 숫자로 함께 표시됩니다." },
      { w: "Merge", c: "var(--ink)", lc: "var(--red)", img: "w-merge", lv: "DANGER", t: "1:42", dir: "좌측 3m", src: "차량 끼어들기", h: "옆 차로의 움직임은<br>그쪽 차선으로.", p: "끼어드는 차가 있는 쪽 차선만 붉게 물들어, 위험이 어느 편에 있는지 즉시 구분됩니다." }
    ];
    /* 2026.10.17 : 단어 섹션 — 레퍼런스(01 · 02 · 03 제품 소개 카드) 구조로 변경
       전) 큰 영어 단어(Siren) → HUD 이미지 | 한글 설명 + 정보표
       후) 왼쪽 : 아래가 선에 잘린 큰 번호(01) → 영어 제목 → 한글 제목 · 설명 → 한 줄 정보
                  → 가는 선 → 아이콘 4개(소리 · 단계 · 거리 · 시간)
           오른쪽 : HUD 이미지 크게 (화면 오른쪽 끝까지)
       얇은 세로 · 가로 선이 교차하는 레퍼런스의 선 구조도 같이 */
    const ICON = {
      sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4Z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
      level: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9.5v5"/><path d="M12 17.2v.3"/></svg>',
      distance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18"/><path d="m7 8-4 4 4 4"/><path d="m17 8 4 4-4 4"/><path d="M12 5v3M12 16v3"/></svg>',
      time: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
    };
    /* 2026.11.08 : 작은 영어 글자 빼기 — 영어 제목(.wx__en) 없앰, 단계 DANGER · CAUTION → 위험 · 주의 */
    const LV = { DANGER: "위험", CAUTION: "주의" };
    const wrap = document.getElementById("words");
    wrap.innerHTML = W.map((x, i) => {
      const no = String(i + 1).padStart(2, "0");
      return `
      <section class="w wx" id="w${i + 1}" aria-label="${x.src}" style="--lc:${x.lc}">
        <div class="wx__left">
          <p class="wx__num tnum" aria-hidden="true"><span>${no}</span></p>
          <div class="wx__body rv">
            <h2 class="wx__ko">${x.h.replace("<br>", " ")}</h2>
            <p class="wx__desc">${x.p}</p>
            <p class="wx__meta">${x.src} <i style="background:${x.lc}"></i> ${LV[x.lv]}</p>
          </div>
          <ul class="wx__icons rv" data-d="1">
            <li>${ICON.sound}<span>소리</span><b>${x.src}</b></li>
            <li>${ICON.level}<span>단계</span><b>${LV[x.lv]}</b></li>
            <li>${ICON.distance}<span>거리</span><b>${x.dir}</b></li>
            <li>${ICON.time}<span>시간</span><b class="tnum">${x.t}</b></li>
          </ul>
        </div>
        <figure class="wx__fig"><img src="./images/hud16/${x.img}.webp" alt="${x.src} HUD 경고" loading="lazy"></figure>
      </section>`;
    }).join("");
    wrap.querySelectorAll(".rv").forEach((el) => {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }, { threshold: .1 });
      io.observe(el);
    });

    const secs = [...wrap.querySelectorAll(".w")];
    const br = document.getElementById("br");
    /* 2026.11.08 : 선이 화면에 들어오면 영상처럼 한 번 쭉 재생
       ---- 선이 왼쪽부터 차오름(--b) → 선이 닿은 점 글자가 올라오며 진해짐(--p) → 끝에 Sight 가 왼쪽부터 민트로 차오름(--s)
       ---- 전) 스크롤 위치에 따라 차오름 (const b = DD.smooth(DD.clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.6))))
       스타일 : interface.css [HUD Sound → Sight] */
    const brRule = br.querySelector(".br__rule"), brTicks = [...br.querySelectorAll(".br__ticks a")];
    /* 2026.11.08 : 더 빠르게 + 텐션 — 처음엔 살짝 머뭇거리다 확 차오름 (easeInOutQuart)
       전) 선 2200ms · Sight 900ms · smooth(부드러운 S자) */
    const BR_LINE = 1300, BR_SIGHT = 550;   /* 선 차오르는 시간 · Sight 차오르는 시간 (ms) */
    const brEase = (k) => (k < 0.5 ? 8 * k * k * k * k : 1 - Math.pow(-2 * k + 2, 4) / 2);
    const brSet = (b, sv) => {
      br.style.setProperty("--b", b.toFixed(3));
      const rr = brRule.getBoundingClientRect();
      brTicks.forEach((a) => {
        const ar = a.getBoundingClientRect(), at = (ar.left + ar.width / 2 - rr.left) / (rr.width || 1);   /* 선 위 점 위치 0 ~ 1 */
        a.style.setProperty("--p", DD.smooth(DD.clamp((b - at + 0.03) / 0.07)).toFixed(3));   /* 2026.11.08 점이 더 또렷하게 톡 (전 + 0.04 / 0.1) */
      });
      br.style.setProperty("--s", sv.toFixed(3));
    };
    brSet(0, 0);
    const brPlay = () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { brSet(1, 1); return; }
      const t0 = performance.now();
      const step = (now) => {
        const t = now - t0;
        const b = brEase(DD.clamp(t / BR_LINE));
        const sv = brEase(DD.clamp((t - BR_LINE * 0.8) / BR_SIGHT));
        brSet(b, sv);
        if (t < BR_LINE * 0.8 + BR_SIGHT) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const brIo = new IntersectionObserver(([e]) => { if (e.isIntersecting) { brIo.disconnect(); brPlay(); } }, { threshold: 0, rootMargin: "0px 0px -30% 0px" });
    brIo.observe(brRule.parentElement);
    /* 섹션이 화면 가운데로 올수록 HUD 이미지가 또렷하게 (--f 0 → 1) */
    DD.onFrame(() => {
      secs.forEach((s) => {
        const r = s.getBoundingClientRect();
        const c = r.top + r.height / 2;
        const d = Math.abs(c - innerHeight * 0.5) / (innerHeight * 0.75);
        s.style.setProperty("--f", DD.smooth(1 - d).toFixed(3));
      });
    });
  })();

  (() => {
    /* 브릿지 · 단어 반사 표시 (그대로) */
    document.querySelectorAll(".br__w, .w__word").forEach((el) => { el.classList.add("refl"); el.dataset.t = el.textContent; });
  })();


  (() => {
    /* [HUD 최종] 다섯 겹 — 시안 A
       섹션 진행도 0 ~ 0.10 : 정면 한 장 → 비스듬히 누움
                   0.03 ~ 0.18 : 아래 판부터 차례로 펼쳐짐
       오른쪽 설명 블록 중 화면 가운데에 온 블록의 겹만 밝아짐 (나머지 흐리게)
                   0.86 ~ 0.97 : 다시 정면 한 장으로 */
    const sec = document.getElementById("haLy");
    if (!sec) return;
    const { seg, smooth, progress, onFrame, reduced } = DD;

    const LAYERS = [
      { n: "01", en: "Lane",  ko: "차로 · 노면 위", d: "위험이 있는 차로를 색으로 칠합니다.",       img: "hero-L-lane-red",    z: "노면 위" },
      { n: "02", en: "Speed", ko: "속도 · 고정",   d: "속도와 제한 속도는 늘 같은 자리에 둡니다.", img: "hero-L-speed",       z: "하단 고정" },
      { n: "03", en: "Route", ko: "경로 안내",     d: "다음 회전과 남은 거리를 보여 줍니다.",       img: "hero-L-nav",         z: "좌측 상단" },
      { n: "04", en: "Sound", ko: "소리 상태",     d: "소리를 감지했는지 귀 아이콘으로 알립니다.", img: "hero-L-ear-siren",   z: "좌측" },
      { n: "05", en: "Alert", ko: "상황 경고",     d: "무엇이, 어느 방향에서 오는지 한 단어로.",   img: "hero-L-alert-siren", z: "우측 상단" }
    ];

    /* 다섯 장 */
    const stk = document.getElementById("haStack");
    stk.innerHTML = LAYERS.map((l) =>
      `<div class="hf-pl"><img src="${DD.asset}${l.img}.webp" alt="" draggable="false"></div>`).join("");
    const pls = [...stk.children];

    /* 설명 블록 01~05 — 첫 블록(소개)과 마지막 블록(다시 한 장으로) 사이에 */
    const steps = document.getElementById("haSteps"), outro = steps.lastElementChild;
    LAYERS.forEach((l, i) => {
      const a = document.createElement("article");
      a.className = "ha-st";
      a.dataset.k = i;
      a.innerHTML = `
        <p class="hf-meta"><span class="ha-en">${l.en}</span> — Layer ${l.n} / 05</p>
        <h3>${l.ko}</h3>
        <p class="ha-d">${l.d}</p>
        <dl>
          <div><dt>위치</dt><dd>${l.z}</dd></div>
          <div><dt>순서</dt><dd>${l.n} · 아래에서 ${i + 1}번째</dd></div>
        </dl>`;
      steps.insertBefore(a, outro);
    });
    const arts = [...steps.children];

    /* 왼쪽 세로 목록 · 번호 */
    const rail = document.getElementById("haRail");
    rail.innerHTML = LAYERS.map((l) => `<li>${l.n} ${l.en}</li>`).join("");
    const railLi = [...rail.children];
    const cnt = document.getElementById("haCount");

    /* 펼침 정도 0~1 → 다섯 장 각각 (아래 판부터 차례로) */
    const stagger = (t, spread = 0.5) =>
      LAYERS.map((_, i) => smooth(seg(t, (i - 1) / 4 * spread, (i - 1) / 4 * spread + (1 - spread))));

    onFrame(() => {
      const p = progress(sec);
      const mob = innerWidth < 900;

      /* 지금 화면 가운데(폰은 아래쪽)에 가장 가까운 블록 */
      let on = arts[0], best = Infinity;
      arts.forEach((a) => {
        const r = a.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - innerHeight * (mob ? 0.8 : 0.5));
        if (d < best) { best = d; on = a; }
      });
      arts.forEach((a) => a.classList.toggle("is-on", a === on));
      let k = +on.dataset.k;
      if (k > 4) k = -1;

      const tilt = reduced ? 1 : smooth(seg(p, 0, 0.1));
      const back = smooth(seg(p, 0.86, 0.97));
      const open = stagger(reduced ? 1 : seg(p, 0.03, 0.18)).map((o) => o * (1 - back));
      const gap = mob ? 46 : Math.min(96, innerHeight * 0.1);
      const edge = tilt * (1 - back);

      stk.style.setProperty("--rx", (56 * tilt * (1 - back)).toFixed(2) + "deg");
      stk.style.setProperty("--rz", (-30 * tilt * (1 - back)).toFixed(2) + "deg");
      stk.style.setProperty("--sc", "1");
      /* 펼친 높이의 가운데를 원점으로 — 펼쳐져도 무대 가운데에 머묾 */
      const total = open.slice(1).reduce((a, b) => a + b, 0);
      let acc = 0;
      pls.forEach((pl, i) => {
        if (i > 0) acc += open[i];
        pl.style.setProperty("--z", ((acc - total / 2) * gap).toFixed(1) + "px");
        pl.style.setProperty("--edge", edge.toFixed(3));
        const lit = k < 0 || i === k;
        pl.style.setProperty("--o", lit ? "1" : "0.16");
        pl.classList.toggle("is-cur", i === k);
        pl.classList.toggle("is-dim", !lit);
      });

      railLi.forEach((li, i) => li.classList.toggle("is-on", i === k));
      cnt.textContent = k >= 0 ? LAYERS[k].n : "00";
    });
  })();


});



/* =========================================================
   [HUD 11-08] HUD 페이지 — 히어로 앞유리 사진 · 다섯 겹 제자리 교체 / 2026.11.08
   ---------------------------------------------------------
   hud.html 의 #hsHero · #hbLy 가 있을 때만 실행
   스타일 : interface.css 맨 아래 [HUD 11-08]
   1. 히어로 : 경고 아이콘 위치(원본 1536 × 1024 에서 700, 299)를 사진 크롭에 맞춰 파동을 놓음
   2. 다섯 겹 : 섹션 진행도를 여섯 칸으로 나눠
               0 = 소개(다섯 장 모두 밝게) · 1–5 = 그 겹만 밝게, 목차 선 · 오른쪽 번호와 설명이 함께 바뀜
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  /* 1. 히어로 파동 위치 */
  (() => {
    const hero = document.getElementById("hsHero"), ring = document.getElementById("hsRing");
    if (!hero || !ring) return;
    const img = hero.querySelector(".hs-hero__img");
    const IW = 1536, IH = 1024, PX = 700, PY = 299;
    const place = () => {
      const W = hero.clientWidth, H = hero.clientHeight, s = Math.max(W / IW, H / IH);
      /* object-position 과 같은 값 (CSS 의 --ox · --oy) */
      const cs = getComputedStyle(img), num = (v, d) => (isNaN(parseFloat(v)) ? d : parseFloat(v));
      const ox = num(cs.getPropertyValue("--ox"), 0.5), oy = num(cs.getPropertyValue("--oy"), 0.3);
      ring.style.left = ((W - IW * s) * ox + PX * s).toFixed(1) + "px";
      ring.style.top = ((H - IH * s) * oy + PY * s).toFixed(1) + "px";
    };
    place();
    addEventListener("resize", place);
    if (!img.complete) img.addEventListener("load", place);
  })();

  /* 2. 다섯 겹 — 제자리 교체 */
  (() => {
    const sec = document.getElementById("hbLy");
    if (!sec || !window.DD) return;
    const L = [
      { n: "01", ko: "차로 · 노면 위", d: "위험이 있는 차로를 색으로 칠합니다.",       img: "hero-L-lane-red",    z: "노면 위" },
      { n: "02", ko: "속도 · 고정",   d: "속도와 제한 속도는 늘 같은 자리에 둡니다.", img: "hero-L-speed",       z: "하단 고정" },
      { n: "03", ko: "경로 안내",     d: "다음 회전과 남은 거리를 보여 줍니다.",       img: "hero-L-nav",         z: "좌측 상단" },
      { n: "04", ko: "소리 상태",     d: "소리를 감지했는지 귀 아이콘으로 알립니다.", img: "hero-L-ear-siren",   z: "좌측" },
      { n: "05", ko: "상황 경고",     d: "무엇이, 어느 방향에서 오는지 한 단어로.",   img: "hero-L-alert-siren", z: "우측 상단" }
    ];
    const idx = document.getElementById("hbIdx"), hud = document.getElementById("hbHud"), ref = document.getElementById("hbRef"), txt = document.getElementById("hbTxt");
    idx.innerHTML = L.map((l) => `<li><span>${l.n}</span>${l.ko}</li>`).join("");
    const imgs = L.map((l) => `<img src="${DD.asset}${l.img}.webp" alt="" draggable="false">`).join("");
    hud.innerHTML = imgs;
    ref.innerHTML = imgs;
    txt.innerHTML =
      `<article class="hb-t"><p class="hb-t__no">00 / 05</p><h2>한 장처럼 보이는<br>다섯 겹의 정보.</h2><p class="hb-t__d">차로 · 속도 · 경로 · 소리 · 경고. 서로 다른 거리에 놓인 다섯 장이 겹쳐 하나의 HUD가 됩니다.</p></article>` +
      L.map((l) => `<article class="hb-t"><p class="hb-t__big">${l.n}<small>/ 05</small></p><p class="hb-t__z">${l.z}</p><h3>${l.ko}</h3><p class="hb-t__d">${l.d}</p></article>`).join("");
    const li = [...idx.children], hi = [...hud.children], ri = [...ref.children], ts = [...txt.children];
    let last = -2;
    DD.onFrame(() => {
      const k = Math.min(5, Math.floor(DD.progress(sec) * 6)) - 1;
      if (k === last) return;
      last = k;
      li.forEach((e, i) => e.classList.toggle("is-on", i === k));
      [hi, ri].forEach((a) => a.forEach((e, i) => e.classList.toggle("is-dim", k >= 0 && i !== k)));
      ts.forEach((e, i) => e.classList.toggle("is-on", i === k + 1));
    });
  })();

});


/* =========================================================
   [HUD 11-08 영상] 단어 섹션 — 주행 체험 장면 위의 HUD (시안 1) / 2026.11.08
   ---------------------------------------------------------
   #w1–#w5 (interface.js [HUD 16] 이 만든 단어 섹션) 의 오른쪽 그림을 바꿈
   at = 원본 주행 체험 영상(2:51)에서의 위치 · on = 클립 안에서 HUD 가 켜지는 시각(초)
   스타일 : interface.css 맨 아래 [HUD 11-08 영상]
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("words")) return;
  const DIR = "./images/hud-drive/";
  const SC = [
    { k: "siren", at: "2:34", on: 1.5, dur: 4.79, what: "앞 교차로를 가로지르는 구급차" },
    { k: "horn",  at: "0:40", on: 1.0, dur: 4.42, what: "보이지 않는 뒤차의 경적" },
    { k: "stop",  at: "0:52", on: 0.8, dur: 4.42, what: "오른쪽에서 앞을 가로지르는 이륜차" },
    { k: "gap",   at: "2:10", on: 0.9, dur: 4.79, what: "바로 앞에서 느려지는 흰 차" },
    { k: "merge", at: "2:41", on: 0.8, dur: 4.0,  what: "왼쪽에서 들어오는 차" }
  ];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vids = [];
  let paused = false;

  SC.forEach((s, i) => {
    const sec = document.getElementById("w" + (i + 1));
    const fig = sec && sec.querySelector(".wx__fig");
    if (!fig) return;
    const img = fig.querySelector("img");
    fig.classList.add("hd-fig");

    const box = document.createElement("div");
    box.className = "hd-box";
    const v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none";
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.poster = `${DIR}${s.k}.jpg`;
    v.src = `${DIR}${s.k}.mp4`;
    /* 2026.11.10 : HUD 글 카드(아이콘 · 경고 문장)를 왼쪽 아래 → 영상 가운데로 옮긴 그림으로 교체
       (그림 자체를 다시 만듦 — 카드 밑에 가려졌던 차선은 반대쪽 차선을 뒤집어 복원 / 전 : 카드 왼쪽 아래)
       ?v= 는 예전 그림이 캐시에 남아 있지 않게 */
    /* 2026.11.10 (2) : 가운데 글 카드가 너무 아래라서 120px(1080 기준) 위로 — 그림 다시 만듦 (전 ?v=20261110)
       2026.11.10 (3) : 더 올려서 200px 위로 (전 120px · ?v=20261110b)
       2026.11.10 (4) : 높이도 가운데로 — 카드 세로 가운데 = 영상 세로 가운데 (약 340px 위 / 전 200px · ?v=20261110c) */
    img.src = `${DIR}${s.k}-ar.webp?v=20261110d`;
    img.removeAttribute("loading");
    box.append(v, img);
    fig.append(box);

    const cap = document.createElement("p");
    cap.className = "hd-cap";
    cap.innerHTML = `<span>주행 체험 ${s.at} — ${s.what}</span>`;
    fig.append(cap);

    if (reduced) { box.classList.add("is-on"); return; }

    /* 위험이 보이는 순간 HUD 켜짐, 반복 직전에 꺼짐 */
    v.addEventListener("timeupdate", () => box.classList.toggle("is-on", v.currentTime >= s.on && v.currentTime < s.dur - 0.35));

    /* 화면에 40% 이상 보일 때만 재생 */
    const io = new IntersectionObserver(([e]) => {
      v._vis = e.isIntersecting;
      if (e.isIntersecting && !paused) v.play().catch(() => {});
      else v.pause();
      btn.classList.toggle("is-show", vids.some((x) => x._vis));
    }, { threshold: 0.4 });
    io.observe(box);
    vids.push(v);
  });

  /* 영상 멈춤 버튼 — 단어 섹션이 보일 때만 나타남 */
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hd-pause";
  btn.textContent = "영상 멈춤";
  btn.addEventListener("click", () => {
    paused = !paused;
    btn.textContent = paused ? "영상 재생" : "영상 멈춤";
    vids.forEach((v) => (paused ? v.pause() : v._vis && v.play().catch(() => {})));
  });
  if (!reduced) document.body.appendChild(btn);
});


/* =========================================================
   [DISPLAY 화면들 마키] 02 화면들 — 양방향 마키 / 2026.11.08
   ---------------------------------------------------------
   디스플레이_6안_양방향마키_시안.zip 의 index.html 스크립트를 옮겨 옴
   ---- 윗줄(data-d -1)은 왼쪽으로, 아랫줄(data-d 1)은 오른쪽으로 계속 흐름
        같은 9장을 두 번 이어 붙였으니 절반 너비만큼 가면 처음 자리로 (끊김 없음)
   ---- 기본 속도 0.35px / 프레임 + 스크롤한 만큼 잠깐 빨라짐 · 마우스를 올리면 멈춤
   ---- 바꾼 곳
        화면에 보일 때만 돌림 (IntersectionObserver)
        큰 화면(1513 이상)은 카드가 커진 만큼 속도도 비율대로 (맥북 1512 기준)
        움직임 줄이기 설정이면 멈춘 채로
   스타일 : interface.css [DISPLAY 화면들 마키]
========================================================= */
(() => {
  const sec = document.getElementById("dmq");
  if (!sec) return;

  const wrap = sec.querySelector(".dmq__rows");
  const rows = [...sec.querySelectorAll(".dmq__row")];
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* 2026.11.08 : 처음 돌기 시작하는 게 한참 걸려 보임 (기본 0.35px 라 거의 멈춘 듯)
     ---- 기본 속도 0.35 → 0.6px / 프레임
     ---- 화면에 들어오는 순간 살짝 밀어 줘서(v 3) 바로 흐르는 게 보이고, 곧 기본 속도로 가라앉음
     ---- 화면에 들어오기 300px 전부터 미리 돌기 시작 */
  /* 2026.11.08 (2) : 그래도 가만히 두면 다음 화면이 들어오기까지 한참 (36px/초 → 카드 한 장에 약 10초)
     ---- 프레임마다 0.6px → 1초에 110px (카드 한 장 약 3.5초) · 모니터 주사율(60 · 120Hz)과 상관없이 같은 속도 */
  const SPEED = 110;   /* px / 초 (맥북 기준) */
  let x = 0, v = 0, last = scrollY, hover = false, on = false, raf = 0, prev = 0;
  wrap.addEventListener("mouseenter", () => { hover = true; });
  wrap.addEventListener("mouseleave", () => { hover = false; });

  const loop = (now) => {
    raf = 0;
    const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0;   /* 지난 프레임부터 걸린 시간(초) */
    prev = now;
    const sc = Math.max(1, innerWidth / 1512);   /* 큰 화면은 비율대로 */
    const dy = scrollY - last;
    last = scrollY;
    v += (Math.abs(dy) * 0.15 - v) * 0.1;
    x += hover ? 0 : (SPEED * dt + v) * sc;
    rows.forEach((r) => {
      const W = r.scrollWidth / 2;
      const off = ((x % W) + W) % W;
      r.style.transform = `translateX(${+r.dataset.d < 0 ? -off : off - W}px)`;
    });
    if (on) raf = requestAnimationFrame(loop);
  };

  new IntersectionObserver(([e]) => {
    const was = on;
    on = e.isIntersecting;
    last = scrollY;
    if (on && !was) { v = Math.max(v, 3); prev = 0; }   /* 들어오는 순간 살짝 밀어 줌 · 시간 다시 재기 */
    if (on && !raf) raf = requestAnimationFrame(loop);
  }, { rootMargin: "300px 0px" }).observe(sec);
})();


/* =========================================================
   [HANDLE 5차] 핸들 페이지 5차 시안 — Blueprint (3면 도면) / 2026.11.02
   ---------------------------------------------------------
   dadeullim-handle-5차-v8.zip 의 assets/hero.js · site.js · widgets.js · draw.js
   + index.html 맨 아래 스크립트를 순서 그대로 옮겨 옴
   ---- handle.html 의 .hd5 가 있을 때만 실행
   ---- 히어로 부품 라벨(callouts.json)은 5차에서 비어 있어 불러오지 않음
   ---- Lenis(부드러운 스크롤)는 handle.html 에서 interface.js 보다 먼저 불러옴
   전) [HANDLE 4차] (seq.js 이미지 시퀀스 · 장 표시 · 01~06 섹션 동작) — 5차에서 안 써서 삭제
========================================================= */

(() => {
  if (!document.querySelector(".hd5")) return;


  /* ---------- 영상 히어로 글자 (hero.js) ---------- */
/* DADEULLIM handle — film hero with coded overlays (labels, HW-01, A–G callouts, motor, ending)
   Timing follows assets/vid/film(.av1).mp4 — 17.9s, edited 2026-10-23 */
(() => {
  const root = document.querySelector("[data-hero]");
  if (!root) return;
  const v = root.querySelector("video"), svg = root.querySelector("svg.hero-lines"), NS = "http://www.w3.org/2000/svg";
  const $ = (s) => root.querySelector(s);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const rng = (t, a, b) => clamp((t - a) / (b - a));
  const eo = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const SEC = [[0, "1.0", "Overview"], [2.6, "2.0", "Form"], [4.4, "3.0", "Layers"], [9.5, "4.0", "Calibre"], [14.35, "5.0", "Return"], [17.2, "6.0", "Complete"]];
  // callout layout: side (+1 right / −1 left), elbow dy (px)
  const LAY = { A: [-1, -50], B: [-1, -90], C: [-1, 120], D: [-1, -95], E: [1, -60], F: [-1, 130], G: [1, 80] };   /* 2026.11.08 부터 안 씀 (아래 LBL) */
  /* 2026.11.08 : 라벨 글씨가 핸들 부품 위에 겹쳐 잘 안 보여서 (B 링 · C 스포크 · D 림 · F 스포크 프레임 위)
     ---- 전) 부품 점에서 정해진 px(70 · 110)만큼 떨어진 곳 → 아이맥에서는 핸들만 커지고 거리는 그대로라 더 겹침
     ---- 후) 글자 자리를 영상 안 빈 곳 좌표(0~1)로 정함 → 영상 크기 따라 같이 움직여 어느 화면에서도 안 겹침
          [쪽(-1 글 왼쪽 · 1 글 오른쪽), 선 끝 x, 선 끝 y] */
  /* 2026.11.08 : 너무 멀다 해서 부품 가까이로 · D 는 원래처럼 글 왼쪽
     전) B [-1, .315, .1075] · C [-1, .386, .829] · D [1, .648, .115] · F [-1, .666, .829] */
  const LBL = { A: [-1, .146, .355], B: [-1, .315, .121], C: [-1, .374, .715], D: [-1, .572, .165], E: [-1, .694, .31], F: [-1, .651, .788], G: [-1, .798, .835] };   /* 2026.11.08 E · G 도 글 왼쪽으로 (전 E [1, .759, .36] · G [1, .841, .679]) */
  let CO = null;
  /* 2026.11.02 : 핸들이 펼쳐질 때 부품 라벨 A–G (설명.zip 의 callouts.json) — 파일로 불러오지 않고 아래 값으로
     전) 5차 : 부품 라벨 없음 (패키지 callouts.json 이 비어 있음) */
  const HANDLE_CALLOUTS = {"parts":[{"k":"A","name":"Outer trim"},{"k":"B","name":"Chrome ring"},{"k":"C","name":"Haptic module"},{"k":"D","name":"Leather rim"},{"k":"E","name":"Spoke frame"},{"k":"F","name":"Hub cushion"},{"k":"G","name":"Emblem cover"}],"track":[[5.9,[0.2614,0.3987],[0.4269,0.28],[0.4816,0.5144],[0.5898,0.2945],[0.6472,0.433],[0.6898,0.5862],[0.7829,0.6052]],[5.95,[0.266,0.4025],[0.4279,0.2849],[0.482,0.5142],[0.5876,0.298],[0.6441,0.4333],[0.6861,0.5832],[0.7774,0.6011]],[6.0,[0.2676,0.4041],[0.4282,0.2868],[0.4821,0.5142],[0.5867,0.2991],[0.6429,0.4332],[0.6848,0.5818],[0.7755,0.5992]],[6.05,[0.2675,0.4046],[0.428,0.287],[0.4821,0.5142],[0.5865,0.2989],[0.6429,0.4329],[0.6849,0.5814],[0.7756,0.5987]],[6.1,[0.2674,0.4051],[0.4279,0.2871],[0.4821,0.5143],[0.5864,0.2987],[0.6429,0.4326],[0.685,0.5811],[0.7757,0.5981]],[6.15,[0.2673,0.4055],[0.4277,0.2871],[0.4821,0.5143],[0.5863,0.2984],[0.6429,0.4323],[0.6851,0.5807],[0.7759,0.5976]],[6.2,[0.2671,0.4059],[0.4275,0.2871],[0.4821,0.5143],[0.5863,0.2982],[0.643,0.432],[0.6853,0.5804],[0.7761,0.5972]],[6.25,[0.2669,0.4062],[0.4274,0.2871],[0.4821,0.5144],[0.5862,0.2979],[0.643,0.4317],[0.6855,0.5802],[0.7763,0.5967]],[6.3,[0.2666,0.4065],[0.4272,0.2871],[0.4821,0.5144],[0.5862,0.2976],[0.6431,0.4314],[0.6856,0.5799],[0.7766,0.5963]],[6.35,[0.2664,0.4068],[0.427,0.287],[0.4821,0.5145],[0.5862,0.2972],[0.6432,0.4311],[0.6859,0.5797],[0.7769,0.596]],[6.4,[0.2661,0.4071],[0.4268,0.2868],[0.4821,0.5145],[0.5862,0.2969],[0.6433,0.4308],[0.6861,0.5795],[0.7773,0.5957]],[6.45,[0.2657,0.4073],[0.4266,0.2867],[0.4821,0.5146],[0.5862,0.2965],[0.6435,0.4305],[0.6864,0.5793],[0.7777,0.5954]],[6.5,[0.2654,0.4075],[0.4264,0.2865],[0.4821,0.5146],[0.5862,0.2961],[0.6436,0.4302],[0.6867,0.5792],[0.7781,0.5951]],[6.55,[0.265,0.4077],[0.4262,0.2863],[0.4821,0.5146],[0.5862,0.2957],[0.6438,0.4299],[0.687,0.579],[0.7785,0.5949]],[6.6,[0.2646,0.4078],[0.426,0.286],[0.482,0.5147],[0.5863,0.2953],[0.644,0.4297],[0.6873,0.5789],[0.779,0.5947]],[6.65,[0.2642,0.4079],[0.4258,0.2858],[0.482,0.5147],[0.5864,0.2948],[0.6442,0.4294],[0.6876,0.5788],[0.7795,0.5945]],[6.7,[0.2637,0.408],[0.4256,0.2855],[0.482,0.5148],[0.5864,0.2944],[0.6444,0.4291],[0.688,0.5788],[0.78,0.5944]],[6.75,[0.2632,0.4081],[0.4254,0.2852],[0.482,0.5148],[0.5865,0.2939],[0.6447,0.4288],[0.6884,0.5787],[0.7806,0.5942]],[6.8,[0.2628,0.4082],[0.4252,0.2848],[0.4819,0.5149],[0.5866,0.2934],[0.645,0.4285],[0.6888,0.5787],[0.7812,0.5941]],[6.85,[0.2622,0.4082],[0.425,0.2845],[0.4819,0.5149],[0.5867,0.2929],[0.6452,0.4282],[0.6892,0.5786],[0.7818,0.5941]],[6.9,[0.2617,0.4083],[0.4248,0.2841],[0.4819,0.515],[0.5869,0.2924],[0.6455,0.4279],[0.6896,0.5786],[0.7824,0.594]],[6.95,[0.2612,0.4083],[0.4245,0.2837],[0.4818,0.515],[0.587,0.2919],[0.6458,0.4276],[0.69,0.5786],[0.783,0.5939]],[7.0,[0.2606,0.4083],[0.4243,0.2833],[0.4818,0.5151],[0.5871,0.2913],[0.6461,0.4274],[0.6905,0.5787],[0.7837,0.5939]],[7.05,[0.26,0.4083],[0.4241,0.2828],[0.4818,0.5151],[0.5873,0.2908],[0.6464,0.4271],[0.6909,0.5787],[0.7844,0.5939]],[7.1,[0.2595,0.4082],[0.4239,0.2824],[0.4817,0.5152],[0.5874,0.2902],[0.6468,0.4268],[0.6914,0.5787],[0.7851,0.5939]],[7.15,[0.2589,0.4082],[0.4236,0.2819],[0.4817,0.5152],[0.5876,0.2896],[0.6471,0.4265],[0.6919,0.5788],[0.7858,0.5939]],[7.2,[0.2582,0.4081],[0.4234,0.2814],[0.4816,0.5153],[0.5878,0.2891],[0.6474,0.4262],[0.6924,0.5788],[0.7865,0.5939]],[7.25,[0.2576,0.4081],[0.4231,0.2809],[0.4816,0.5153],[0.5879,0.2885],[0.6478,0.4259],[0.6929,0.5789],[0.7872,0.594]],[7.3,[0.257,0.408],[0.4229,0.2804],[0.4815,0.5154],[0.5881,0.2879],[0.6481,0.4256],[0.6934,0.579],[0.788,0.594]],[7.35,[0.2564,0.4079],[0.4227,0.2799],[0.4815,0.5154],[0.5883,0.2873],[0.6485,0.4254],[0.6939,0.579],[0.7887,0.5941]],[7.4,[0.2557,0.4078],[0.4224,0.2794],[0.4815,0.5155],[0.5885,0.2867],[0.6489,0.4251],[0.6944,0.5791],[0.7895,0.5941]],[7.45,[0.2551,0.4078],[0.4222,0.2789],[0.4814,0.5155],[0.5887,0.2861],[0.6492,0.4248],[0.6949,0.5792],[0.7902,0.5942]],[7.5,[0.2544,0.4077],[0.4219,0.2783],[0.4814,0.5156],[0.5889,0.2855],[0.6496,0.4245],[0.6954,0.5793],[0.791,0.5943]],[7.55,[0.2537,0.4076],[0.4217,0.2778],[0.4813,0.5156],[0.589,0.2848],[0.65,0.4242],[0.696,0.5794],[0.7918,0.5943]],[7.6,[0.2531,0.4075],[0.4214,0.2773],[0.4813,0.5157],[0.5892,0.2842],[0.6504,0.4239],[0.6965,0.5794],[0.7926,0.5944]],[7.65,[0.2524,0.4074],[0.4212,0.2767],[0.4812,0.5157],[0.5894,0.2836],[0.6508,0.4236],[0.697,0.5795],[0.7934,0.5945]],[7.7,[0.2517,0.4073],[0.4209,0.2762],[0.4812,0.5158],[0.5896,0.283],[0.6511,0.4233],[0.6976,0.5796],[0.7942,0.5945]],[7.75,[0.2511,0.4072],[0.4207,0.2757],[0.4811,0.5158],[0.5898,0.2823],[0.6515,0.423],[0.6981,0.5797],[0.7949,0.5946]],[7.8,[0.2504,0.4072],[0.4204,0.2751],[0.4811,0.5159],[0.59,0.2817],[0.6519,0.4227],[0.6986,0.5798],[0.7957,0.5946]],[7.85,[0.2497,0.4071],[0.4202,0.2746],[0.481,0.516],[0.5902,0.2811],[0.6523,0.4224],[0.6991,0.5799],[0.7965,0.5947]],[7.9,[0.2491,0.407],[0.4199,0.2741],[0.481,0.516],[0.5904,0.2805],[0.6526,0.4221],[0.6997,0.5799],[0.7973,0.5947]],[7.95,[0.2484,0.4069],[0.4197,0.2736],[0.481,0.5161],[0.5906,0.2799],[0.653,0.4218],[0.7002,0.58],[0.7981,0.5948]],[8.0,[0.2478,0.4069],[0.4194,0.2731],[0.4809,0.5161],[0.5907,0.2792],[0.6534,0.4215],[0.7007,0.58],[0.7988,0.5948]],[8.05,[0.2471,0.4069],[0.4192,0.2726],[0.4809,0.5162],[0.5909,0.2786],[0.6537,0.4212],[0.7012,0.5801],[0.7996,0.5948]],[8.1,[0.2465,0.4068],[0.4189,0.2721],[0.4808,0.5162],[0.5911,0.278],[0.6541,0.4209],[0.7017,0.5801],[0.8003,0.5948]],[8.15,[0.2459,0.4068],[0.4187,0.2716],[0.4808,0.5163],[0.5912,0.2774],[0.6544,0.4206],[0.7022,0.5802],[0.8011,0.5948]],[8.2,[0.2452,0.4068],[0.4184,0.2711],[0.4807,0.5163],[0.5914,0.2768],[0.6548,0.4203],[0.7027,0.5802],[0.8018,0.5947]],[8.25,[0.2446,0.4068],[0.4182,0.2707],[0.4807,0.5164],[0.5915,0.2762],[0.6551,0.4199],[0.7032,0.5802],[0.8025,0.5947]],[8.3,[0.244,0.4069],[0.4179,0.2703],[0.4807,0.5164],[0.5917,0.2756],[0.6554,0.4196],[0.7037,0.5802],[0.8032,0.5946]],[8.35,[0.2434,0.4069],[0.4177,0.2698],[0.4806,0.5165],[0.5918,0.2751],[0.6557,0.4193],[0.7042,0.5801],[0.8039,0.5945]],[8.4,[0.2428,0.407],[0.4174,0.2694],[0.4806,0.5166],[0.5919,0.2745],[0.6561,0.4189],[0.7047,0.5801],[0.8047,0.5944]],[8.45,[0.2422,0.407],[0.4171,0.2689],[0.4806,0.5166],[0.5921,0.2738],[0.6564,0.4186],[0.7052,0.5801],[0.8054,0.5943]],[8.5,[0.2416,0.4071],[0.4168,0.2685],[0.4805,0.5167],[0.5922,0.2732],[0.6568,0.4182],[0.7057,0.58],[0.8062,0.5942]],[8.55,[0.2409,0.4071],[0.4166,0.268],[0.4805,0.5167],[0.5923,0.2725],[0.6571,0.4179],[0.7062,0.58],[0.8069,0.5941]],[8.6,[0.2402,0.4072],[0.4163,0.2675],[0.4804,0.5168],[0.5925,0.2719],[0.6575,0.4175],[0.7067,0.58],[0.8077,0.594]],[8.65,[0.2395,0.4073],[0.416,0.2671],[0.4804,0.5169],[0.5926,0.2712],[0.6578,0.4171],[0.7073,0.5799],[0.8085,0.5938]],[8.7,[0.2389,0.4074],[0.4157,0.2666],[0.4803,0.5169],[0.5928,0.2705],[0.6582,0.4167],[0.7078,0.5799],[0.8093,0.5937]],[8.75,[0.2382,0.4075],[0.4154,0.2661],[0.4803,0.517],[0.5929,0.2698],[0.6586,0.4163],[0.7084,0.5798],[0.8101,0.5936]],[8.8,[0.2375,0.4075],[0.4151,0.2656],[0.4803,0.5171],[0.5931,0.2691],[0.6589,0.4159],[0.709,0.5798],[0.811,0.5934]],[8.85,[0.2367,0.4076],[0.4148,0.2651],[0.4802,0.5171],[0.5932,0.2684],[0.6593,0.4155],[0.7095,0.5797],[0.8118,0.5933]]]};

  const lab = $(".h-sec"), big = $(".h-big"), mot = $(".h-motor"), end = $(".h-end"), cnt = $(".h-count"), tm = $(".h-time");
  const struct = $(".h-struct"), structN = $(".h-struct b"), bars = [...root.querySelectorAll(".h-pulse i")], rip = $(".h-rip");
  const line = $(".h-rule");
  const cos = [];
  function build() {
    CO.parts.forEach((p) => {
      const g = document.createElementNS(NS, "g");
      g.innerHTML = '<polyline fill="none" stroke="rgba(242,242,239,.7)" stroke-width="1"/><circle r="4" fill="#a9dded"/>';
      svg.appendChild(g);
      const d = document.createElement("div"); d.className = "h-co"; d.dataset.full = `${p.k}.  ${p.name.toUpperCase()}`; root.querySelector(".hero-ui").appendChild(d);
      cos.push({ k: p.k, g, d });
    });
  }
  /* 2026.11.02 : 영상을 CSS 로 키우고 내렸으니(.hd5 .hero video — translateY(5%) scale(1.12)) 라벨 위치도 같이 옮김 */
  const VIDEO_SCALE = 1.12, VIDEO_SHIFT = 0.05;
  function rect() {
    const r = root.getBoundingClientRect(), s = Math.max(r.width / 1920, r.height / 1080);
    const w = 1920 * s * VIDEO_SCALE, h = 1080 * s * VIDEO_SCALE;
    return { w, h, x: (r.width - w) / 2, y: (r.height - h) / 2 + r.height * VIDEO_SHIFT, W: r.width, H: r.height };
  }
  function trackAt(t) {
    const T = CO.track; if (t <= T[0][0]) return T[0]; if (t >= T[T.length - 1][0]) return T[T.length - 1];
    for (let i = 0; i < T.length - 1; i++) if (t <= T[i + 1][0]) {
      const u = (t - T[i][0]) / (T[i + 1][0] - T[i][0]);
      return [t, ...T[i].slice(1).map((p, k) => [p[0] + (T[i + 1][k + 1][0] - p[0]) * u, p[1] + (T[i + 1][k + 1][1] - p[1]) * u])];
    }
  }
  let lastSec = -1;
  function frame() {
    const t = v.currentTime || 0;
    // section label + rule
    let si = 0; SEC.forEach((s, i) => { if (t >= s[0]) si = i; });
    if (si !== lastSec) { lastSec = si; lab.innerHTML = `<b>${SEC[si][1]}</b>${SEC[si][2]}`; }
    line.style.transform = `scaleX(${eo(rng(t, .1, .9)).toFixed(3)})`;
    cnt.textContent = `DADEULLIM HANDLE — ${String(Math.round(t * 60)).padStart(4, "0")}`;
    tm.textContent = `${t.toFixed(2).padStart(5, "0")}s`;
    // HW-01 reveal
    /* 2026.11.02 : 처음부터 글이 있다가 핸들이 펼쳐지기 직전(4.5초)부터 서서히 사라짐
       ---- 전) 1.3~2.0초에 아래서 올라오고 2.35~2.6초에 빠르게 사라짐
       const bu = eo(rng(t, 1.3, 2.0)) * (1 - rng(t, 2.35, 2.6));
       big.style.clipPath = `inset(${(1 - eo(rng(t, 1.3, 2.0))) * 100}% 0 0 0)`;
       big.style.opacity = bu > 0 ? (1 - rng(t, 2.35, 2.6)).toFixed(3) : 0; */
    big.style.clipPath = `inset(${(1 - eo(rng(t, 0.15, 0.85))) * 100}% 0 0 0)`;
    big.style.opacity = (1 - rng(t, 4.5, 5.4)).toFixed(3);
    // structure + callouts
    const sOn = t >= 6.1 && t < 8.8;
    struct.style.opacity = sOn ? (rng(t, 6.1, 6.4) * (1 - rng(t, 8.6, 8.8))).toFixed(3) : 0;
    if (CO && cos.length) {
      const R = rect(), row = sOn ? trackAt(t) : null; let shown = 0;
      cos.forEach((c, i) => {
        const t0 = 6.3 + i * .22, on = sOn && t >= t0, fade = 1 - rng(t, 8.6, 8.8);
        c.g.style.opacity = on ? fade : 0; c.d.style.opacity = on ? fade : 0;
        if (!on) { c.d.textContent = ""; return; }
        shown++;
        const [u, w] = row[i + 1], x = R.x + u * R.w, y = R.y + w * R.h;
        /* 2026.11.02 설명.zip : 화면이 좁으면 지시선 길이도 줄임
           전) const [side, dy] = LAY[c.k], ex = x + side * 70, ey = y + dy, tx = ex + side * 110; */
        /* 2026.11.08 전) const [side, dy0] = LAY[c.k], ks = Math.min(1, R.W / 1440), dy = dy0 * ks, ey = y + dy;
                         let ex = x + side * 70 * ks, tx = ex + side * 110 * ks; */
        const [side, eu, ev] = LBL[c.k], ks = R.w / 1712, ey = R.y + ev * R.h;   /* 1712 = 맥북에서 영상 너비 */
        let tx = R.x + eu * R.w, ex = tx - side * 40 * ks;   /* 꺾이는 가로선 50 → 40 */
        /* 2026.11.02 : 선이 글자를 지나가거나 글자 밖으로 삐져나가지 않게
           ---- 글자 실제 너비를 재고, 글자가 화면 끝에서 밀리면 선 끝도 글자 바로 앞까지로 맞춤
           전) 너비 = 글자 수 × 8.4 어림값, 밀리면 글자만 16px 위로 올리고 선은 그대로 */
        const full = c.d.dataset.full;
        if (!c.w || c.wW !== R.W) { c.d.style.width = ""; c.d.textContent = full; c.w = c.d.offsetWidth; c.wW = R.W; }   /* 화면 크기 바뀌면 다시 잼 */
        const wid = c.w, edge = Math.max(24, R.W * .03);
        let lx = side > 0 ? tx + 10 : tx - 10 - wid;
        lx = Math.min(Math.max(lx, edge), R.W - edge - wid);
        tx = side > 0 ? lx - 10 : lx + wid + 10;
        if (side * (tx - ex) < 16) ex = tx - side * 16;
        const ly = ey;
        const k = eo(rng(t, t0, t0 + .3)), k1 = Math.min(1, k * 2), k2 = Math.max(0, k * 2 - 1);
        const p1x = x + (ex - x) * k1, p1y = y + (ey - y) * k1;
        c.g.firstChild.setAttribute("points", k2 > 0 ? `${x},${y} ${ex},${ey} ${ex + (tx - ex) * k2},${ey}` : `${x},${y} ${p1x},${p1y}`);
        c.g.lastChild.setAttribute("cx", x); c.g.lastChild.setAttribute("cy", y); c.g.lastChild.setAttribute("r", 4 * eo(rng(t, t0, t0 + .15)));
        const n = Math.round(full.length * rng(t, t0 + .18, t0 + .5));
        c.d.textContent = full.slice(0, n);
        /* 왼쪽 라벨은 글자가 선 끝(오른쪽)에 붙어서 써지도록 오른쪽 정렬 */
        c.d.style.width = wid + "px"; c.d.style.textAlign = side > 0 ? "left" : "right";
        c.d.style.left = lx + "px"; c.d.style.top = ly + "px"; c.d.style.transform = "translateY(-50%)";
      });
      structN.textContent = `${shown} / 7`;
    }
    // motor
    const mOn = t >= 9.5 && t < 14.4;
    mot.style.opacity = mOn ? (rng(t, 9.6, 10.0) * (1 - rng(t, 14.2, 14.4))).toFixed(3) : 0;
    rip.textContent = t >= 12.95 ? "Ripple 2 / 2" : t >= 11.95 ? "Ripple 1 / 2" : "Housing open";
    bars.forEach((b, i) => b.style.setProperty("--k", rng(t, 13.5 + i * .28, 13.5 + i * .28 + .22).toFixed(3)));
    // ending
    end.style.opacity = (rng(t, 16.4, 17.0) * (1 - rng(t, 17.75, 17.9))).toFixed(3);
    requestAnimationFrame(frame);
  }
  CO = HANDLE_CALLOUTS; build();   /* 2026.11.02 부품 라벨 만들기 */
  requestAnimationFrame(frame);
})();


  /* ---------- 스크롤 · 나타나기 · 진행도 (site.js) ---------- */
/* DADEULLIM handle pages — smooth inertial scroll (Lenis) + small scroll helpers */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true, anchors: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.__lenis = lenis;
  }
  // reveal on enter
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll("[data-rv]").forEach((el) => io.observe(el));
  // count-up numbers
  const fmt = (v, d) => v.toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const co = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), d = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1400;
    const step = (t) => { const u = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - u, 4); el.textContent = fmt(to * k, d); if (u < 1) requestAnimationFrame(step); };
    reduce ? (el.textContent = fmt(to, d)) : requestAnimationFrame(step);
  }), { threshold: 0.4 });
  document.querySelectorAll("[data-count]").forEach((el) => co.observe(el));
  // per-section scroll progress → --p on [data-prog] (sticky scenes read it)
  const progs = [...document.querySelectorAll("[data-prog]")];
  const upd = () => progs.forEach((el) => {
    const r = el.getBoundingClientRect(), span = Math.max(1, el.offsetHeight - innerHeight);
    const p = Math.min(1, Math.max(0, -r.top / span));
    el.style.setProperty("--p", p.toFixed(4)); el.__p = p; el.dispatchEvent(new CustomEvent("prog", { detail: p }));
  });
  addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); addEventListener("resize", upd); upd();
  window.onProg = (el, fn) => { el.addEventListener("prog", (e) => fn(e.detail)); fn(el.__p || 0); };
  // footnote smooth jumps keep working with Lenis anchors
})();


  /* ---------- 진동 패턴 · PWM 파형 (widgets.js) ---------- */
/* shared widgets: scroll-scrubbed render scenes, wheel pulse player, PWM waveform */
(() => {
  // ---------------- render image-sequence scenes (sticky canvas, scrubbed by section progress)
  document.querySelectorAll(".seqs").forEach((sec) => {
    const cv = sec.querySelector("canvas"); if (!cv || !window.HSeq) return;
    const f0 = +sec.dataset.f0, f1 = +sec.dataset.f1, [s, x, y] = sec.dataset.view.split(",").map(Number);
    const pl = HSeq.Player({ canvas: cv });
    pl.setView(s, x, y, true);
    sec.player = pl;
    onProg(sec, (p) => {
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;   // ease in-out over the section
      const f = f0 + (f1 - f0) * e;
      pl.set(f);
      sec.dispatchEvent(new CustomEvent("frame", { detail: { f, p } }));
    });
  });

  // ---------------- patterns (예시 values — replace with the Arduino sketch)
  window.PATTERNS = {
    1: { name: "주의", en: "Notice", duty: 45, seq: [[150, 140], [150, 140], [150, 700]], use: "경적 · 먼 사이렌" },
    2: { name: "접근", en: "Approach", duty: 70, seq: [[150, 120], [150, 120], [150, 380], [150, 120], [150, 120], [150, 700]], use: "다가오는 사이렌" },
    3: { name: "긴급", en: "Urgent", duty: 100, seq: [[120, 80], [120, 80], [120, 220], [120, 80], [120, 80], [120, 220], [120, 80], [120, 80], [120, 600]], use: "바로 옆 긴급차량" },
  };

  // ---------------- play a pattern on a wheel svg side ("L" | "R")
  window.playWheel = (svg, side, pid = 1, loop = false) => {
    if (!svg) return () => {};
    const dots = [...svg.querySelectorAll(`.${side} .m, .m.${side}`)], P = PATTERNS[pid];
    svg.classList.remove("play-L", "play-R");
    let alive = true, i = 0, timer = 0;
    const op = .35 + .65 * (P.duty / 100);
    svg.classList.add(`play-${side}`);
    const step = () => {
      if (!alive) return;
      const [on, off] = P.seq[i % P.seq.length];
      dots.forEach((d) => { d.classList.add("on"); d.style.opacity = op; });
      timer = setTimeout(() => {
        dots.forEach((d) => d.classList.remove("on"));
        i++;
        if (!loop && i >= P.seq.length) { svg.classList.remove(`play-${side}`); return; }
        timer = setTimeout(step, off);
      }, on);
    };
    step();
    return () => { alive = false; clearTimeout(timer); dots.forEach((d) => d.classList.remove("on")); svg.classList.remove("play-L", "play-R"); };
  };

  // ---------------- PWM waveform into an <svg data-pwm> (viewBox 0 0 600 120)
  window.drawPWM = (svg, duty, periods = 8) => {
    if (!svg) return;
    const W = 600, top = 18, bot = 102, pw = W / periods, d = Math.max(0, Math.min(100, duty)) / 100;
    let path = `M0 ${bot}`;
    for (let k = 0; k < periods; k++) {
      const x0 = k * pw, x1 = x0 + pw * d;
      if (d > 0) path += ` L${x0} ${top} L${x1} ${top} L${x1} ${bot}`;
      path += ` L${x0 + pw} ${bot}`;
    }
    const avgY = bot - (bot - top) * d;
    svg.innerHTML = `<path d="${path}" fill="none" stroke="#f2f2ef" stroke-width="1.5" stroke-opacity=".85"/>` +
      `<line x1="0" x2="${W}" y1="${avgY}" y2="${avgY}" stroke="#a9dded" stroke-dasharray="4 5"/>` +
      `<text x="${W - 4}" y="${avgY - 8}" text-anchor="end" fill="#a9dded" style="font:500 11px 'IBM Plex Mono',monospace">avg ${(5 * d).toFixed(2)} V</text>`;
  };
  document.querySelectorAll("svg[data-pwm]").forEach((s) => drawPWM(s, +s.dataset.pwm));

  // ---------------- waveform strip for a pattern into <svg data-pat="1"> (viewBox 0 0 600 60)
  document.querySelectorAll("svg[data-pat]").forEach((s) => {
    const P = PATTERNS[s.dataset.pat], total = P.seq.reduce((a, [on, off]) => a + on + off, 0);
    let x = 0, h = 10 + 36 * P.duty / 100, out = "";
    P.seq.forEach(([on, off]) => { const w = on / total * 600; out += `<rect x="${x.toFixed(1)}" y="${(50 - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#a9dded"/>`; x += (on + off) / total * 600; });
    s.innerHTML = `<line x1="0" x2="600" y1="50" y2="50" stroke="rgba(242,242,239,.25)"/>` + out;
  });
})();


  /* ---------- 도면 그리기 · 진동 재생 · 울려 보기 (draw.js) ---------- */
/* 5차 도면 시안 공통 스크립트 */
(() => {
  const cl = (v) => Math.max(0, Math.min(1, v));
  // draw-in when visible
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .22 });
  document.querySelectorAll('svg.draw').forEach((s) => io.observe(s));
  // scroll-driven draw: [data-sdraw] wrapper sets --d on its svg.sdraw children from its own scroll progress
  const sd = [...document.querySelectorAll('[data-sdraw]')];
  const upd = () => sd.forEach((w) => {
    const r = w.getBoundingClientRect(), a = +(w.dataset.sdrawStart || .85), b = +(w.dataset.sdrawEnd || .25);
    const d = cl((innerHeight * a - r.top) / (innerHeight * (a - b)));
    w.querySelectorAll('svg.sdraw').forEach((s) => s.style.setProperty('--d', d.toFixed(3)));
  });
  addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); addEventListener('resize', upd); upd();

  // pulse helpers
  const stops = new Map();
  window.light = (el, side, pid, loop) => { if (!el) return; stops.get(el) && stops.get(el)(); stops.set(el, playWheel(el, side, pid, loop)); };
  window.quiet = (el) => { stops.get(el) && stops.get(el)(); stops.delete(el); };

  // configurator: pass the svg that holds the motors
  window.initConfig = (target, onChange) => {
    const root = document.getElementById('cfg'); if (!root || !target) return;
    const st = { side: 'L', snd: 'siren', lv: 2 }, nm = { 1: '주의', 2: '접근', 3: '긴급' }, wave = document.getElementById('o-wave');
    const lvl = () => st.snd === 'horn' ? 1 : +st.lv;
    const render = () => { const P = PATTERNS[lvl()];
      document.getElementById('o-pin').textContent = st.side === 'L' ? 'D5' : 'D6'; document.getElementById('o-pat').textContent = nm[lvl()]; document.getElementById('o-duty').textContent = P.duty + '%';
      /* 2026.11.02 : 네모 막대 → 진동 파형 (울리는 동안만 출렁이고, 쉬는 동안은 평평한 선)
         ---- 세기(duty)가 클수록 진폭이 큼, 울림 앞뒤는 서서히 커졌다 작아짐
         전) 울리는 구간마다 흰 네모 (<rect>) */
      const total = P.seq.reduce((a, [on, off]) => a + on + off, 0), CY = 30, AMP = 5 + 21 * P.duty / 100, LAM = 7;
      const segs = []; let x0 = 0;
      P.seq.forEach(([on, off]) => { segs.push([x0, x0 + on / total * 600]); x0 += (on + off) / total * 600; });
      let d = `M0 ${CY}`;
      for (let x = 0; x <= 600; x += 1) {
        const sg = segs.find(([a, b]) => x >= a && x <= b);
        let y = CY;
        if (sg) { const u = (x - sg[0]) / (sg[1] - sg[0]), env = Math.pow(Math.sin(Math.PI * u), .6); y = CY - AMP * env * Math.sin(2 * Math.PI * (x - sg[0]) / LAM); }
        d += ` L${x} ${y.toFixed(1)}`;
      }
      wave.innerHTML = `<line x1="0" x2="600" y1="${CY}" y2="${CY}" stroke="rgba(244,244,241,.18)"/>` +
        `<path d="${d}" fill="none" stroke="rgba(244,244,241,.9)" stroke-width="1.3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
      onChange && onChange(st, lvl()); };
    const fire = () => light(target, st.side, lvl(), false);
    root.querySelectorAll('[data-g]').forEach((g) => g.querySelectorAll('button').forEach((b) => b.onclick = () => {
      g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); st[g.dataset.g] = b.dataset.v; render(); fire(); }));
    document.getElementById('go').onclick = fire; render();
  };

  // hover link: elements with data-ref ↔ svg .ld.p{ref}
  window.linkRefs = (scope, svg) => {
    const lds = [...svg.querySelectorAll('.ld')];
    scope.querySelectorAll('[data-ref]').forEach((el) => {
      el.addEventListener('mouseenter', () => lds.forEach((g) => { const on = g.classList.contains('p' + el.dataset.ref); g.classList.toggle('on', on); g.classList.toggle('off', !on); }));
      el.addEventListener('mouseleave', () => lds.forEach((g) => g.classList.remove('on', 'off')));
    });
  };
})();


  /* ---------- 섹션별 동작 (index.html 맨 아래 스크립트) ---------- */
(() => {
  /* 2026.11.14 : 01 ~ 06 이 3D 한 장면([HANDLE 3D 한 장면])으로 바뀌어 #ex 가 없음
     ---- 그냥 두면 여기서 오류가 나서 아래 히어로 영상 끝 흐리기까지 멈춤 → 없으면 건너뜀 */
  const ex = document.getElementById('ex');
  if (!ex) return;
  const bals = [...ex.querySelectorAll('.bal')];
  document.querySelectorAll('#bom tr[data-ref]').forEach((tr) => {
    tr.onmouseenter = () => bals.forEach((b) => { const on = b.classList.contains('p' + tr.dataset.ref); b.classList.toggle('on', on); b.classList.toggle('off', !on); });
    tr.onmouseleave = () => bals.forEach((b) => b.classList.remove('on', 'off'));
  });
  const pwm = document.getElementById('pwm');
  document.querySelectorAll('[data-duty]').forEach((b) => b.onclick = () => { document.querySelectorAll('[data-duty]').forEach((x) => x.setAttribute('aria-pressed', x === b)); drawPWM(pwm, +b.dataset.duty); });
  const tf = document.getElementById('tm-front');
  document.querySelectorAll('[data-pp]').forEach((b) => b.onclick = () => light(tf, 'L', +b.dataset.pp, false));
  initConfig(document.getElementById('try-front'));
})();


  /* ---------- 영상 끝 : 어둡게 서서히 사라지기 / 2026.11.02 ----------
     마지막 핸들이 툭 끊기지 않고 바탕색으로 스르륵 → 다시 처음부터 시작할 때도 서서히 밝게
     ---- 16.7초부터 영상 끝(17.9초)까지 opacity 1 → 0, 시작 0 ~ 0.5초 0 → 1
     ---- 2026.11.02 더 확실하게 : 16.1 ~ 17.3초에 부드러운 곡선(smoothstep)으로 완전히 어둡게,
          끝까지 어두운 채로 있다가 다시 시작 (전 16.7 ~ 17.75초, 직선) */
  (() => {
    const v = document.querySelector(".hd5 .hero video");
    if (!v) return;
    const FADE_OUT = [16.1, 17.3];   /* 전 [16.7, 17.75] */
    const FADE_IN = 0.5;
    const clamp = (x) => Math.min(1, Math.max(0, x));
    const tick = () => {
      const t = v.currentTime || 0;
      const fin = clamp(t / FADE_IN);
      const k = clamp((t - FADE_OUT[0]) / (FADE_OUT[1] - FADE_OUT[0]));
      const fout = 1 - k * k * (3 - 2 * k);   /* 처음 · 끝은 천천히, 가운데는 빠르게 */
      v.style.opacity = Math.min(fin, fout).toFixed(3);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();
})();


/* =========================================================
   [DISPLAY 위험 단계] 04 OVERVIEW / 2026.10.27
   ---------------------------------------------------------
   디스플레이_위험단계_레이더.zip 의 display-level.js 를 옮겨 옴
   지금 화면 가운데에 가장 가까운 카드의 단계를 섹션(data-lvnow)에 표시
   → 배경 레이더 · 오른쪽 위 단계 표시 · 카드 빛이 따라 바뀜 (스타일 : interface.css [DISPLAY 위험 단계])
========================================================= */

(() => {
  const ov = document.getElementById("display-overview");
  /* 2026.10.27 : 단계 표시(.lvstep)를 없애서 배경 레이더(.lvbg)로 확인 (전 .lvstep) */
  if (!ov || !ov.querySelector(".lvbg")) return;

  const cards = [...ov.querySelectorAll(".display-info")];
  const steps = [...ov.querySelectorAll(".lvstep li")];
  let cur = 0;

  const tick = () => {
    const r = ov.getBoundingClientRect();
    const inView = r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
    ov.style.setProperty("--stepo", inView ? 1 : 0);   /* 섹션 안에 있을 때만 단계 표시 보임 */

    let best = 1, bd = 1e9;
    const cy = innerHeight * 0.5;
    cards.forEach((c) => {
      const b = c.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) return;
      const d = Math.abs((b.top + b.bottom) / 2 - cy) + (b.width < 1 ? 1e6 : 0);
      if (d < bd) { bd = d; best = +c.dataset.lv; }
    });

    if (best !== cur) {
      cur = best;
      ov.dataset.lvnow = best;
      steps.forEach((s) => s.classList.toggle("on", +s.dataset.lv === best));
      ov.dispatchEvent(new CustomEvent("lv", { detail: best }));
    }
  };

  addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true });
  addEventListener("resize", tick);
  setTimeout(tick, 300);
})();


/* =========================================================
   [DISPLAY HERO — 위험 단계] 히어로 1안 / 2026.10.27
   ---------------------------------------------------------
   디스플레이_히어로1안_위험단계.zip 의 display-hero.js 를 옮겨 옴
   평소 → 주의 → 경고 → 위험 → 반복 (2.2초씩 — 처음 3.4초)
   사진 속 화면 · 제목 · 단계 표시 · 강조 색(data-state)이 함께 바뀜
   히어로가 화면에 보일 때만 돌아가고, 다른 섹션을 볼 땐 멈춤
   (옛 [DISPLAY HERO — 위험 순간] .dh8 코드는 2026.10.27 코드 정리하며 삭제)
========================================================= */

(() => {
  const hero = document.querySelector("[data-dh9]");
  if (!hero) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR = 2200;   /* 한 단계 머무는 시간 (ms) — 2026.10.27 : 느려서 3400 → 2200 */
  const N = 4;        /* 평소 · 주의 · 경고 · 위험 */
  let s = 0;
  let timer = null;

  const show = () => {
    hero.dataset.state = s;
    hero.querySelectorAll("[data-dh9-s]").forEach((el) => {
      const on = +el.dataset.dh9S === s;
      el.classList.toggle("is-on", on);
      if (el.matches("h1, p")) el.setAttribute("aria-hidden", !on);
    });
  };

  const start = () => {
    if (!timer && !reduce) timer = setInterval(() => { s = (s + 1) % N; show(); }, DUR);
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  show();
  new IntersectionObserver(
    (es) => es.forEach((e) => (e.isIntersecting ? start() : stop())),
    { threshold: 0.2 }
  ).observe(hero);
})();


/* =========================================================
   [HANDLE 3D 한 장면] 01 ~ 06 — 3D 핸들 하나가 고정되고 카메라만 돎 / 2026.11.14
   ---------------------------------------------------------
   핸들.zip (dadeullim-handle-sian) 의 src/_head.js (공통 · 글 칸 · 진동) + src/initC.js (3D 핸들)
   + src/_tail.js (스크롤 루프) 를 옮겨 옴 — 시안 04 설계 톤
   ---- 핸들은 C4D 정면 렌더를 보고 코드로 다시 만든 단순화 모델 (three.js r149 · handle.html 에서 먼저 불러옴)
        좌표 : 핸들 중심이 원점 · 림 바깥 반지름 354 · y 는 위 · z 는 운전자 쪽 · 모터 6개는 반지름 323 위
   ---- 카메라 : 정면 → 위에서 → 왼쪽 그립 가까이 → 아래에서 → 옆에서(일곱 겹) → 뒤에서
   ---- 우리 방식으로 바꾼 것
        · 글 · 숫자 · 버튼은 handle.html 에 미리 적어 둠 (zip 은 JS 가 글을 만들어 넣음)
        · 이름은 hx- 로 시작 (핸들 페이지의 다른 .ttl · .cfg · .bom 등과 안 겹치게)
        · 섹션이 화면 근처에 있을 때만 매 프레임 계산 (zip 은 항상 계산)
        · 탭 전환(시안 00 ~ 04)은 빼고 04 설계 톤만 — 03 입체 엑스레이 톤은 아래 TONE 을 0 으로
        · zip 에서 숨겨 둔 것(시점 이름 · 일련번호 · 끌기 안내 · 모터 글자)은 만들지 않음
        · 아이맥(1513px 이상)에서는 핸들도 맥북 비율 그대로 크게 — 최대 1.12배 (CSS [아이맥 화면비] 와 같은 계산)
        · 3D 를 못 그리는 브라우저는 정면 그림 images/handle-ghost.webp 를 대신 보여 줌
        · zip README 대로 유지 : 화면 크기가 0 이면 그리지 않고 다시 잼 · 한 프레임에 오류가 나도 멈추지 않음
   ---- 고치는 곳 (zip README)
        · 카메라 길 : AZ(좌우 각도) · EL(위아래 각도) · DS(거리, 작을수록 크게) · TX TY(바라보는 점)
                      · SP(겹 사이 간격) · SX(화면 좌우 밀기) — 줄마다 [스크롤 위치 0 ~ 1, 값]
        · 장 나누기 : 아래 CHAPTERS + handle.html 글 칸의 data-cue
        · 재질 : mesh(겹 번호, 형태, { fill 면의 빛, edge 가장자리 빛, pow, grid, lit … })
        · 진동 : 위쪽 Vib3 (고리 크기 · 밝기 · 지속 시간)
   스타일 : interface.css [HANDLE 3D 한 장면]
   전) 01 ~ 06 섹션 동작은 [HANDLE 5차] 의 도면 그리기 · initConfig · playWheel (섹션이 없어져서 이제 안 쓰임)
========================================================= */

(() => {
  const sec = document.querySelector(".hd5 .hx");
  if (!sec) return;

  const pin = sec.querySelector(".hx-pin");
  const $ = (s, r = pin) => r.querySelector(s);
  const $$ = (s, r = pin) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a));   /* p 가 a → b 사이 어디쯤인지 0 ~ 1 */
  const mix = (a, b, t) => a + (b - a) * t;
  const sm = (t) => t * t * (3 - 2 * t);                 /* 처음 · 끝은 천천히 */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RAD = Math.PI / 180;

  /* 1 = 시안 04 설계 톤 (윤곽 · 단면 고리 · 층층이 자른 선) / 0 = 시안 03 입체 엑스레이 (면이 은은하게 빛남) */
  const TONE = 1;


  /* ---------- 내용 값 (지금 페이지 숫자 그대로) ---------- */

  /* 모터 여섯 개 — 정면도 좌표 (viewBox 0 0 1440 810 · 핸들 중심 720, 388) */
  const MOT = [
    { id: "L1", x: 409, y: 299, s: "L" }, { id: "L2", x: 397, y: 388, s: "L" }, { id: "L3", x: 409, y: 477, s: "L" },
    { id: "R1", x: 1031, y: 299, s: "R" }, { id: "R2", x: 1043, y: 388, s: "R" }, { id: "R3", x: 1031, y: 477, s: "R" }
  ];

  /* 진동 단계 — duty 세기 · on 울림 · gap 사이 · rest 쉼 (ms, 예시 값) */
  const LV = [
    null,
    { name: "주의", duty: .45, on: 90, gap: 250, rest: 900 },
    { name: "접근", duty: .7, on: 110, gap: 150, rest: 700 },
    { name: "긴급", duty: 1, on: 130, gap: 80, rest: 450 }
  ];

  /* 장 [시작 스크롤 위치, 번호, 이름] */
  const CHAPTERS = [
    [0, "2.0", "Requirement"],
    [.105, "2.1", "Motor arrangement"],
    [.27, "2.2", "Signal timing"],
    [.375, "2.3", "Function test"],
    [.47, "2.4", "Exploded assembly"],
    [.74, "2.5", "Haptic module"]
  ];

  /* 스포크 프레임 윤곽 — 정면 렌더 실루엣 (zip build/shape.json · shapes.py 로 뽑은 값) */
  const SHAPE = {"outer":[[280.8,60.0],[277.6,59.2],[276.0,47.2],[274.4,44.8],[268.8,44.0],[265.6,41.6],[260.8,41.6],[238.4,48.0],[212.8,58.4],[204.0,60.0],[200.0,62.4],[196.0,62.4],[176.8,69.6],[168.0,71.2],[165.6,72.8],[149.6,76.8],[140.0,80.8],[134.4,80.8],[124.0,84.8],[110.4,86.4],[92.8,92.8],[83.2,94.4],[80.8,96.0],[67.2,98.4],[64.0,100.0],[31.2,104.8],[10.4,105.6],[5.6,108.0],[1.6,106.4],[-21.6,105.6],[-54.4,101.6],[-70.4,98.4],[-73.6,96.8],[-81.6,96.0],[-86.4,93.6],[-95.2,92.0],[-108.8,86.4],[-112.0,86.4],[-120.8,83.2],[-131.2,83.2],[-133.6,81.6],[-138.4,81.6],[-140.8,80.0],[-149.6,78.4],[-188.8,66.4],[-196.8,62.4],[-201.6,62.4],[-204.0,60.8],[-212.8,59.2],[-220.8,55.2],[-223.2,55.2],[-227.2,52.8],[-232.0,52.0],[-240.0,48.0],[-252.0,44.0],[-259.2,43.2],[-272.8,44.0],[-275.2,48.0],[-275.2,52.8],[-278.4,58.4],[-278.4,63.2],[-279.2,64.8],[-281.6,64.0],[-281.6,52.0],[-283.2,48.8],[-283.2,44.8],[-286.4,37.6],[-288.0,24.0],[-288.8,-10.4],[-288.0,-11.2],[-287.2,-32.0],[-286.4,-36.0],[-284.8,-37.6],[-277.6,-39.2],[-272.0,-42.4],[-268.8,-45.6],[-268.0,-51.2],[-266.4,-51.2],[-263.2,-46.4],[-257.6,-46.4],[-256.8,-47.2],[-247.2,-47.2],[-228.8,-51.2],[-183.2,-56.0],[-171.2,-60.8],[-167.2,-68.0],[-163.2,-68.0],[-159.2,-71.2],[-158.4,-73.6],[-154.4,-77.6],[-147.2,-92.0],[-140.0,-102.4],[-105.6,-164.0],[-94.4,-187.2],[-93.6,-191.2],[-84.8,-211.2],[-83.2,-219.2],[-80.8,-223.2],[-80.8,-226.4],[-76.0,-237.6],[-74.4,-248.8],[-71.2,-255.2],[-69.6,-263.2],[-67.2,-267.2],[-64.0,-279.2],[-62.4,-281.6],[-38.4,-286.4],[-24.0,-288.0],[-11.2,-288.0],[-10.4,-288.8],[10.4,-288.8],[11.2,-288.0],[24.0,-288.0],[57.6,-283.2],[61.6,-280.8],[64.8,-268.8],[71.2,-253.6],[72.8,-242.4],[78.4,-228.0],[78.4,-224.8],[80.8,-220.8],[80.8,-216.8],[88.0,-202.4],[89.6,-196.0],[97.6,-178.4],[97.6,-176.0],[101.6,-170.4],[108.8,-155.2],[111.2,-152.8],[136.8,-106.4],[145.6,-92.8],[154.4,-75.2],[163.2,-68.8],[169.6,-68.0],[173.6,-60.0],[186.4,-56.0],[204.0,-55.2],[235.2,-50.4],[241.6,-50.4],[252.0,-48.0],[263.2,-48.0],[266.4,-52.8],[268.0,-52.8],[268.8,-47.2],[271.2,-44.0],[280.8,-39.2],[283.2,-39.2],[286.4,-36.8],[288.0,-24.0],[288.0,-11.2],[288.8,-10.4],[288.8,10.4],[286.4,35.2],[285.6,36.8],[281.6,38.4],[280.0,40.8],[280.0,47.2],[281.6,51.2],[281.6,59.2]],"holes":[{"c":[-1.0,-48.6],"a":80276,"pts":[[-108.0,87.2],[-97.6,88.8],[-89.6,92.0],[-56.8,96.8],[-52.8,98.4],[-45.6,98.4],[-41.6,100.0],[-24.0,100.8],[-23.2,101.6],[6.4,102.4],[7.2,101.6],[23.2,101.6],[30.4,100.0],[52.0,98.4],[65.6,95.2],[83.2,92.8],[86.4,91.2],[90.4,91.2],[92.8,89.6],[102.4,88.0],[104.8,86.4],[108.0,86.4],[127.2,77.6],[140.8,65.6],[149.6,48.8],[153.6,30.4],[155.2,2.4],[156.0,1.6],[156.0,-19.2],[154.4,-30.4],[148.8,-48.0],[133.6,-80.0],[133.6,-82.4],[131.2,-86.4],[131.2,-88.8],[124.8,-102.4],[124.0,-111.2],[122.4,-113.6],[120.0,-123.2],[111.2,-141.6],[100.8,-156.0],[90.4,-166.4],[84.0,-171.2],[72.0,-177.6],[59.2,-181.6],[55.2,-181.6],[50.4,-184.8],[45.6,-184.8],[43.2,-182.4],[43.2,-180.0],[42.4,-179.2],[40.8,-180.0],[40.8,-186.4],[39.2,-188.8],[38.4,-196.8],[36.8,-199.2],[36.0,-213.6],[33.6,-220.8],[30.4,-245.6],[28.0,-250.4],[27.2,-256.8],[21.6,-263.2],[20.8,-268.0],[17.6,-271.2],[-9.6,-272.0],[-16.8,-271.2],[-21.6,-267.2],[-23.2,-262.4],[-29.6,-254.4],[-34.4,-229.6],[-36.0,-213.6],[-39.2,-201.6],[-39.2,-191.2],[-41.6,-185.6],[-41.6,-180.8],[-43.2,-180.0],[-44.0,-185.6],[-46.4,-188.0],[-52.8,-188.0],[-68.0,-182.4],[-91.2,-164.8],[-104.0,-152.0],[-113.6,-139.2],[-124.0,-120.8],[-125.6,-115.2],[-133.6,-99.2],[-136.0,-91.2],[-136.0,-85.6],[-137.6,-79.2],[-152.0,-44.0],[-156.0,-31.2],[-156.8,0.0],[-156.0,0.8],[-156.0,12.8],[-153.6,36.8],[-149.6,52.8],[-141.6,65.6],[-134.4,72.8],[-126.4,78.4]]}]};


  /* ---------- 화면 요소 ---------- */
  const cv = $(".hx-gl"), bl = $(".hx-bloom"), haze = $(".hx-haze"), scrim = $(".hx-scrim");
  const tags = $$(".hx-tag"), rows = $$(".hx-bom li");
  const chap = $(".hx-chap"), chB = $(".hx-chap-sec b", chap), chN = $(".hx-chap-nm", chap), chI = $(".hx-chap-rule i", chap);
  let vib = null;   /* 진동 (아래 Vib3 — 3D 를 못 그리면 아무것도 안 하는 대신 것) */

  /* 장마다 선 위 작은 눈금 */
  CHAPTERS.forEach((c) => {
    if (c[0] <= 0) return;
    const u = document.createElement("u");
    u.style.left = c[0] * 100 + "%";
    $(".hx-chap-rule", chap).appendChild(u);
  });


  /* ---------- 글 칸 : data-cue 위치에서 나타났다 사라짐 ---------- */
  const cues = $$(".hx-cue[data-cue]").map((el) => {
    const [a, b, c, d] = el.dataset.cue.split(",").map(Number);
    return { el, a, b, c, d, v: -1, live: false, on: [] };   /* on : 글 칸이 다 보일 때 할 일 */
  });
  const cueOf = (el) => cues.find((c) => c.el === el.closest(".hx-cue"));

  /* 2.0 숫자 — 글 칸이 보일 때 0 부터 올라감 */
  $$(".hx-kvl .hx-v[data-n]").forEach((v) => {
    const n = +v.dataset.n, s = v.dataset.s || "";
    cueOf(v).on.push(() => {
      const t0 = performance.now();
      const step = (now) => {
        const k = clamp((now - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        v.textContent = (n * e).toFixed(1) + s;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });


  /* ---------- 2.2 세기 읽기 : 숫자 굴리기 · 단계 · 파형 줄 ---------- */
  const lv = $(".hx-lv"), lvN = $(".hx-n span", lv), lvLi = $$("ol li", lv), lvP = $(".hx-strip path", lv), lvH = $(".hx-strip .hx-ph", lv);
  let lvCur = 0;

  const stripPath = (L) => {
    const cyc = 3 * L.on + 2 * L.gap + L.rest, sx = 300 / cyc, y = 36 - 31 * L.duty;
    let d = "M0 36";
    for (let i = 0; i < 3; i++) {
      const x0 = i * (L.on + L.gap) * sx, x1 = x0 + L.on * sx;
      d += ` H${x0.toFixed(1)} V${y.toFixed(1)} H${x1.toFixed(1)} V36`;
    }
    return d + " H300";
  };

  const setLevel = (n) => {
    if (!n || n === lvCur) return;
    lvCur = n;
    const L = LV[n];
    lvN.textContent = Math.round(L.duty * 100);
    lvN.style.animation = "none";
    void lvN.offsetWidth;   /* 애니메이션 다시 시작 */
    lvN.style.animation = "hxRoll .5s cubic-bezier(.2,.7,.1,1) both";
    lvLi.forEach((li, i) => li.classList.toggle("on", i === n - 1));
    lvP.setAttribute("d", stripPath(L));
  };


  /* ---------- 2.3 직접 울려 보기 : 고르면 그 패턴으로 두 번 울림 ---------- */
  const cfgEl = $(".hx-cfg"), goBtn = $(".hx-go", cfgEl);
  const cfg = { side: "L", snd: "siren", lv: 2, eff: 2, play: 0 };   /* play : 이 시각까지 울림 */

  const updCfg = () => {
    const n = cfg.snd === "horn" ? 1 : cfg.lv;   /* 경적은 거리와 상관없이 ‘주의’ */
    cfg.eff = n;
    $(".hx-o-pin", cfgEl).textContent = cfg.side === "L" ? "D5" : "D6";
    $(".hx-o-pat", cfgEl).textContent = LV[n].name;
    $(".hx-o-duty", cfgEl).textContent = Math.round(LV[n].duty * 100) + "%";
  };

  const playCfg = () => {
    const L = LV[cfg.eff];
    cfg.play = performance.now() + 2 * (3 * L.on + 2 * L.gap + L.rest) - L.rest + 300;
    goBtn.classList.add("playing");
    if (vib) vib.side = null;   /* 처음부터 다시 울리게 */
  };

  $$(".hx-rw", cfgEl).forEach((rw) => rw.addEventListener("click", (e) => {
    const b = e.target.closest(".hx-tog");
    if (!b) return;
    $$(".hx-tog", rw).forEach((x) => x.setAttribute("aria-pressed", x === b));
    const g = rw.dataset.g;
    cfg[g] = g === "lv" ? +b.dataset.v : b.dataset.v;
    updCfg();
    playCfg();
  }));
  goBtn.addEventListener("click", playCfg);
  cueOf(cfgEl).on.push(playCfg);   /* 글 칸이 보이면 한 번 저절로 울림 */
  updCfg();

  const tryVib = (now) => {
    if (now < cfg.play) {
      vib.set(cfg.side, cfg.eff);
    } else {
      vib.set(null, 0);
      goBtn.classList.remove("playing");
    }
  };


  /* ---------- 글 칸 · 장 번호 · 진동 (매 프레임) ---------- */
  let ci = -1;
  const common = (p, now) => {
    for (const c of cues) {
      const i = seg(p, c.a, c.b), o = seg(p, c.c, c.d), v = sm(i) * (1 - sm(o));
      if (v === c.v) continue;
      c.v = v;
      c.el.style.opacity = v.toFixed(3);
      c.el.style.transform = `translate3d(0,${((1 - i) * 24 - o * 18).toFixed(1)}px,0)`;   /* 아래서 올라와 위로 빠짐 */
      const live = v > .55;
      if (live !== c.live) {
        c.live = live;
        c.el.classList.toggle("live", live);
        if (live) c.on.forEach((f) => f());
      }
    }

    let k = 0;
    for (let i = 0; i < CHAPTERS.length; i++) if (p >= CHAPTERS[i][0] - .004) k = i;
    if (k !== ci) {
      ci = k;
      chB.textContent = CHAPTERS[k][1];
      chN.textContent = CHAPTERS[k][2];
      chN.classList.remove("roll");
      void chN.offsetWidth;
      chN.classList.add("roll");
    }
    chI.style.transform = `scaleX(${p.toFixed(4)})`;

    lvH.setAttribute("transform", `translate(${(vib.ph * 300).toFixed(1)} 0)`);   /* 파형 줄 위 지금 위치 */
    vib.tick(now);
  };


  /* =====================================================
     진동 (3D) — 모터가 떨리며 켜지고, 가는 고리가 번짐 (연하게 · 가운데 모터 L2 / R2 에서만)
  ===================================================== */
  class Vib3 {
    constructor(T3, parent, motors, cam) {
      this.T3 = T3; this.parent = parent; this.M = motors; this.cam = cam;
      this.side = null; this.level = 0; this.rings = []; this.t0 = 0; this.last = -1; this.amp = 0; this.ph = 0;
      const pts = [];
      for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; pts.push(new T3.Vector3(Math.cos(a), Math.sin(a), 0)); }
      this.geo = new T3.BufferGeometry().setFromPoints(pts);
      this.band = new T3.RingGeometry(.95, 1, 96, 1);
      this.wv = 0;   /* 림을 따라 도는 물결 세기 */
      this.sc = 1;   /* 카메라 거리에 따른 고리 크기 */
    }

    set(side, level) {
      if (side !== this.side || level !== this.level) { this.side = side; this.level = level; this.t0 = performance.now(); this.last = -1; }
    }

    tick(now) {
      const L = LV[this.level];
      let env = 0;
      this.ph = 0;
      if (L && this.side) {
        const cyc = 3 * L.on + 2 * L.gap + L.rest, e = now - this.t0, t = e % cyc, per = L.on + L.gap, n = Math.floor(t / per);
        this.ph = t / cyc;
        if (n < 3 && t - n * per < L.on) {
          env = L.duty;
          const key = Math.floor(e / cyc) * 3 + n;
          if (key !== this.last) { this.last = key; this.spawn(L, now); }
        }
      }
      this.amp += (env - this.amp) * .4;
      this.wv = Math.max(this.amp, this.wv * .955);

      for (const m of this.M) {
        const on = this.side && L && (this.side === "B" || m.s === this.side);
        m.dot.material.opacity = on ? .06 + this.amp * .3 : 0;
        m.dot.quaternion.copy(this.cam.quaternion);
        m.mat.uniforms.uOp.value = m.mat.userData.o * (on ? 1 + this.amp * .7 : 1);
        const j = on && !reduce ? this.amp * 2.6 : 0;   /* 떨림 */
        m.g.position.set(m.pos.x + (Math.random() - .5) * j, m.pos.y + (Math.random() - .5) * j, (Math.random() - .5) * j);
      }

      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i], a = (now - r.t) / 1700;
        if (a < 0) continue;
        if (a >= 1) { this.parent.remove(r.l); r.l.material.dispose(); this.rings.splice(i, 1); continue; }
        r.l.scale.setScalar(14 + a * r.g * this.sc);
        r.l.material.opacity = Math.pow(1 - a, 1.8) * (.19 + .54 * r.k) * r.w;
        r.l.quaternion.copy(this.cam.quaternion);
      }
    }

    spawn(L, now) {
      if (reduce) return;
      const T3 = this.T3;
      let g = 0;
      const ring = (Kind, geo, w, dt, m) => {
        const Mat = Kind === T3.Mesh ? T3.MeshBasicMaterial : T3.LineBasicMaterial;
        const l = new Kind(geo, new Mat({ color: 0xa9dded, transparent: true, opacity: 0, blending: T3.AdditiveBlending, depthTest: false, depthWrite: false, side: T3.DoubleSide }));
        l.position.copy(m.pos);
        l.scale.setScalar(14);
        this.parent.add(l);
        this.rings.push({ l, t: now + dt, k: L.duty, w, g });
      };
      for (const m of this.M) {
        if (!((this.side === "B" || m.s === this.side) && Math.abs(m.pos.y) < 1)) continue;
        g = 125 + 110 * L.duty;
        ring(T3.Mesh, this.band, .58, 0, m);
        ring(T3.Line, this.geo, .5, 0, m);
        if (L.duty >= .7) ring(T3.Line, this.geo, .5, 140, m);   /* 셀수록 고리 하나씩 더 */
        if (L.duty >= 1) ring(T3.Line, this.geo, .36, 280, m);
      }
    }
  }


  /* =====================================================
     3D 핸들 만들기 — 못 만들면 null
  ===================================================== */
  const build3D = () => {
    const T3 = window.THREE;
    let R = null;
    try {
      R = new T3.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch (e) {
      R = null;   /* three.js 를 못 불러왔거나 WebGL 이 안 됨 */
    }
    if (!R) return null;

    R.setClearColor(0x000000, 1);
    const bctx = bl.getContext("2d");
    const scene = new T3.Scene(), cam = new T3.PerspectiveCamera(30, 1, 20, 12000), root = new T3.Group();
    scene.add(root);


    /* ---------- 재질 : 가장자리만 밝고 면은 비치는 재질 (서로 더해지는 빛) ---------- */
    const FOG = new T3.Vector2(1500, 3000), WAVE = new T3.Vector3(0, 0, 0), SCAN = new T3.Vector2(0, 0), TONE_U = { value: TONE };
    const wires = [], dl = [], COL = 0xc6ccd4, ICE = 0xb4dce8;
    const VS = `varying vec3 vN;varying vec3 vP;varying vec3 vM;varying vec2 vUv;void main(){vUv=uv;vM=position;vec4 mv=modelViewMatrix*vec4(position,1.);vP=mv.xyz;vN=normalMatrix*normal;gl_Position=projectionMatrix*mv;}`;
    const FS = `varying vec3 vN;varying vec3 vP;varying vec3 vM;varying vec2 vUv;uniform vec3 uC;uniform float uOp,uFill,uEdge,uPow,uGrid,uWk,uFlow,uBk,uLit,uTone,uSl,uKeep;uniform vec2 uN,uFog,uScan,uCut;uniform vec3 uWave;
 float ln(float x){float f=abs(fract(x-.5)-.5);float w=fwidth(x);return (1.-smoothstep(w*.5,w*1.9,f))*(1.-smoothstep(.1,.3,w));}
 void main(){if(uTone>.5&&uCut.y>uCut.x&&vUv.x>uCut.x&&vUv.x<uCut.y)discard;
 vec3 n=normalize(vN);float f=1.-abs(dot(n,normalize(-vP)));float face=gl_FrontFacing?1.:uBk;float a=(uFill*.55+uEdge*pow(f,uPow*1.12))*face;
 if(gl_FrontFacing){float l=max(dot(n,normalize(vec3(-.5,.62,.6))),0.);a+=uLit*.42*l*l;}
 a=mix(a,(uFill*.18+uEdge*1.05*pow(f,uPow*1.9))*mix(1.,face,.55),uTone*(1.-uKeep));
 if(uSl>0.&&uTone>.01){float zz=vM.z/uSl;float w2=fwidth(zz);a+=uTone*.2*(1.-smoothstep(w2*.5,w2*1.9,abs(fract(zz-.5)-.5)))*step(.0004,w2)*(1.-smoothstep(.1,.3,w2))*mix(1.,face,.5);}
 if(uGrid>0.){float g=0.;if(uN.x>0.)g+=ln(vUv.x*uN.x);if(uN.y>0.)g+=.7*ln(vUv.y*uN.y);a+=uGrid*g*(.3+.7*f)*face*(1.+2.4*uTone);}
 float x=0.;
 if(uWk>0.&&uWave.x>.001){float dA=6.2832*(uWave.z<0.?abs(vUv.x-.5):min(vUv.x,1.-vUv.x));float band=pow(.5+.5*cos(dA*11.-uWave.y*15.),5.);x+=uWk*uWave.x*exp(-dA*1.25)*(.16+band)*(.45+.55*f);}
 if(uFlow>.001)x+=uFlow*pow(.5+.5*cos((vUv.x*2.5+uWave.y*1.7)*6.2832),10.)*1.4;
 if(uScan.y>.001){float yN=vP.y/(-vP.z*.2679);x+=uScan.y*exp(-pow((yN-uScan.x)*11.,2.))*(.2+.8*f);}
 float fog=1.-.86*smoothstep(uFog.x,uFog.y,-vP.z);gl_FragColor=vec4(uC*(a*uOp*fog)+vec3(.72,.9,.97)*x*fog,1.);}`;

    const mats = [[], [], [], [], [], [], []], lns = [[], [], [], [], [], [], []], G = [];
    for (let i = 0; i < 7; i++) { G[i] = new T3.Group(); root.add(G[i]); }   /* 일곱 겹 */

    const mk = (o = {}) => {
      const m = new T3.ShaderMaterial({
        uniforms: {
          uC: { value: new T3.Color(o.c || COL) }, uOp: { value: o.op || 1 },
          uFill: { value: o.fill == null ? .03 : o.fill }, uEdge: { value: o.edge == null ? .5 : o.edge }, uPow: { value: o.pow || 2.4 },
          uGrid: { value: o.grid || 0 }, uN: { value: new T3.Vector2(...(o.n || [0, 0])) },
          uFog: { value: FOG }, uWave: { value: WAVE }, uScan: { value: SCAN },
          uWk: { value: o.wk || 0 }, uFlow: { value: 0 }, uBk: { value: o.bk == null ? .4 : o.bk }, uLit: { value: o.lit || 0 },
          uTone: TONE_U, uSl: { value: o.sl || 0 }, uKeep: { value: o.keep || 0 }, uCut: { value: new T3.Vector2(...(o.cut || [0, 0])) }
        },
        vertexShader: VS, fragmentShader: FS,
        transparent: true, blending: T3.AdditiveBlending, depthWrite: false, depthTest: false, side: T3.DoubleSide
      });
      m.extensions.derivatives = true;
      m.userData.o = o.op || 1;
      return m;
    };
    const lmat = (c, o) => {
      const m = new T3.LineBasicMaterial({ color: c, transparent: true, opacity: o, blending: T3.AdditiveBlending, depthTest: false, depthWrite: false });
      m.userData.o = o;
      return m;
    };
    const mesh = (i, geo, o = {}, par) => {
      const mt = o.mat || mk(o);
      if (!o.mat) mats[i].push(mt);
      const me = new T3.Mesh(geo, mt);
      (par || G[i]).add(me);
      if (o.e) {   /* 모서리 선 */
        const lm = lmat(o.c || COL, o.e);
        lns[i].push(lm);
        me.add(new T3.LineSegments(new T3.EdgesGeometry(geo, o.ea || 30), lm));
      }
      return me;
    };
    const line = (i, pts, c, o, loop) => {
      const lm = lmat(c, o);
      lns[i].push(lm);
      const l = new (loop ? T3.LineLoop : T3.Line)(new T3.BufferGeometry().setFromPoints(pts), lm);
      G[i].add(l);
      return l;
    };


    /* ---------- 형태 만들기 ---------- */
    /* 도넛 조각 : a = 림을 따라 도는 각(도), t = 단면을 도는 각 (0 바깥 · 90 앞 · 180 안쪽 · 270 뒤) */
    const fn = (v) => (typeof v === "function" ? v : () => v);
    const tube = (RrF, rF, a0, a1, t0, t1, na, nt) => {
      const pos = [], nor = [], uv = [], idx = [];
      RrF = fn(RrF); rF = fn(rF);
      for (let i = 0; i <= na; i++) {
        const ad = a0 + (a1 - a0) * i / na, a = ad * RAD, ca = Math.cos(a), sa = Math.sin(a), Rr = RrF(ad), r = rF(ad);
        for (let j = 0; j <= nt; j++) {
          const t = (t0 + (t1 - t0) * j / nt) * RAD, ct = Math.cos(t), st = Math.sin(t);
          pos.push((Rr + r * ct) * ca, (Rr + r * ct) * sa, r * st);
          nor.push(ct * ca, ct * sa, st);
          uv.push(a / (2 * Math.PI), t / (2 * Math.PI));
        }
      }
      for (let i = 0; i < na; i++) for (let j = 0; j < nt; j++) { const a = i * (nt + 1) + j, b = a + nt + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const g = new T3.BufferGeometry();
      g.setAttribute("position", new T3.Float32BufferAttribute(pos, 3));
      g.setAttribute("normal", new T3.Float32BufferAttribute(nor, 3));
      g.setAttribute("uv", new T3.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      return g;
    };
    /* 압출한 형태의 꼭짓점을 합쳐 면이 부드럽게 이어지게 */
    const weld = (g) => {
      const p = g.attributes.position, map = new Map(), np = [], idx = [];
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = Math.round(x * 16) + "," + Math.round(y * 16) + "," + Math.round(z * 16);
        let n = map.get(k);
        if (n === undefined) { n = np.length / 3; map.set(k, n); np.push(x, y, z); }
        idx.push(n);
      }
      const o = new T3.BufferGeometry();
      o.setAttribute("position", new T3.Float32BufferAttribute(np, 3));
      o.setAttribute("uv", new T3.Float32BufferAttribute(new Float32Array(np.length / 3 * 2), 2));
      o.setIndex(idx);
      o.computeVertexNormals();
      return o;
    };
    const ext = (pts, holes, o) => {
      const s = new T3.Shape(pts.map((p) => new T3.Vector2(p[0], p[1])));
      (holes || []).forEach((h) => s.holes.push(new T3.Path(h.map((p) => new T3.Vector2(p[0], p[1])))));
      return weld(new T3.ExtrudeGeometry(s, Object.assign({ curveSegments: 1, bevelEnabled: true }, o)));
    };
    const rrect = (w, h, r, n = 6) => {   /* 둥근 네모 윤곽 */
      const P = [], c = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
      c.forEach(([x, y, a]) => { for (let i = 0; i <= n; i++) { const t = (a + 90 * i / n) * RAD; P.push([x + r * Math.cos(t), y + r * Math.sin(t)]); } });
      return P;
    };
    const flat = (g) => {
      if (!g.attributes.uv) g.setAttribute("uv", new T3.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      return g;
    };
    const cyl = (r, h, n = 40) => flat(new T3.CylinderGeometry(r, r, h, n).rotateX(Math.PI / 2));
    const at = (m, x, y, z, rz) => { m.position.set(x, y, z); if (rz) m.rotation.z = rz * RAD; return m; };

    /* 림 굵기 : 손이 닿는 9시 · 3시 구간은 안쪽으로 더 굵음 (바깥 354 고정, 안쪽 292 → 280) */
    const grip = (ad) => { const x = ((ad % 360) + 360) % 360, dd = Math.min(Math.abs(x - 180), x, 360 - x); return sm(clamp((44 - dd) / 13)); };
    const RR = (ad) => 31 + 6 * grip(ad), RC = (ad) => 323 - 6 * grip(ad);
    const CA = [116, 133], CUT = [CA[0] / 360, CA[1] / 360];   /* 설계 톤에서 림을 잘라 단면을 보이는 자리 (도) */

    /* 1 외곽 트림 : 그립 뒤를 감싸는 반쪽 관 + 허브 뒤 커버 + 세 갈래 팔 */
    mesh(0, tube(RC, (ad) => RR(ad) + 6, 0, 360, 186, 354, 240, 14), { fill: .014, edge: .36, pow: 2.2, grid: .028, n: [72, 0], wk: .35, lit: .03, cut: CUT });
    at(mesh(0, flat(new T3.RingGeometry(298, 349, 160, 1)), { fill: .02, edge: .12 }), 0, 0, -8);
    line(0, Array.from({ length: 181 }, (_, i) => new T3.Vector3(298 * Math.cos(i * 2 * RAD), 298 * Math.sin(i * 2 * RAD), -8)), COL, .2, true);
    line(0, Array.from({ length: 181 }, (_, i) => new T3.Vector3(349 * Math.cos(i * 2 * RAD), 349 * Math.sin(i * 2 * RAD), -8)), COL, .2, true);
    {
      const g = new T3.SphereGeometry(1, 56, 18, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(-Math.PI / 2);
      at(mesh(0, g, { fill: .012, edge: .36, pow: 2, grid: .024, n: [28, 14], lit: .035, sl: .09 }), 0, -24, -16).scale.set(176, 160, 128);
    }
    at(mesh(0, cyl(47, 74, 48), { fill: .012, edge: .34, pow: 2, e: .24, lit: .03 }), 0, -24, -172);
    at(mesh(0, cyl(60, 9, 48), { fill: .012, edge: .3, e: .24 }), 0, -24, -139);
    at(mesh(0, ext(SHAPE.outer.map((p) => [p[0] * 1.035, p[1] * 1.035]), [], { depth: 10, bevelThickness: 8, bevelSize: 6, bevelSegments: 4 }), { fill: .012, edge: .3, pow: 2.2, e: .16, ea: 36, lit: .03, sl: 6 }), 0, 0, -44);

    /* 2 크롬 링 */
    mesh(1, tube(323, 3.4, 0, 360, 0, 360, 240, 8), { fill: .1, edge: .7, pow: 1.4, wk: .8, keep: .85 });

    /* 3 햅틱 모듈 : 코인 모터 여섯 개 · 받침 · 배선 · 보드 */
    const HO = { c: ICE }, motors = [];
    mesh(2, flat(new T3.TubeGeometry(new T3.CatmullRomCurve3([[-306, 0, -6], [-190, -7, -13], [-60, -3, -15], [60, -3, -15], [190, -7, -13], [306, 0, -6]].map((a) => new T3.Vector3(...a))), 90, 1.7, 6, false)), Object.assign({ fill: .12, edge: .55, pow: 1.5, keep: .8 }, HO));
    [[158, 202], [-22, 22]].forEach(([a0, a1]) => mesh(2, tube(323, 2.6, a0, a1, 0, 360, 40, 6), Object.assign({ fill: .12, edge: .6, pow: 1.4, keep: .8 }, HO)));
    MOT.forEach((m) => {
      const x = m.x - 720, y = 388 - m.y, sg = m.s === "L" ? -1 : 1;
      const mm = mk({ c: ICE, fill: .05, edge: .62, pow: 1.8, op: 1, lit: .1, keep: .75 });
      mats[2].push(mm);
      const g = new T3.Group();
      g.position.set(x, y, 0);
      G[2].add(g);
      mesh(2, cyl(13, 7.5), { mat: mm }, g);   /* 코인 모터 */
      const lm = lmat(ICE, .5);
      lns[2].push(lm);
      [[13, 3.75], [13, -3.75], [5.5, 3.95]].forEach(([r, z]) => {
        g.add(new T3.LineLoop(new T3.BufferGeometry().setFromPoints(Array.from({ length: 48 }, (_, i) => new T3.Vector3(r * Math.cos(i * 7.5 * RAD), r * Math.sin(i * 7.5 * RAD), z))), lm));
      });
      {   /* 받침 고리 */
        const c = mesh(2, new T3.TorusGeometry(16.4, .85, 6, 48, Math.PI * 1.45), Object.assign({ fill: .14, edge: .6, pow: 1.4, keep: .85 }, HO), g);
        c.rotation.z = (sg > 0 ? 180 : 0) * RAD - Math.PI * .725;
        c.position.z = -1;
      }
      const dot = new T3.Mesh(new T3.CircleGeometry(6, 32), new T3.MeshBasicMaterial({ color: 0xcfeff8, transparent: true, opacity: 0, blending: T3.AdditiveBlending, depthTest: false, depthWrite: false }));
      dot.position.set(x, y, 0);
      G[2].add(dot);
      /* 모터 → 허브 보드 배선 */
      const yb = y > 10 ? 22 : y < -10 ? -22 : 0;
      const pts = [
        new T3.Vector3(x - sg * 10, y, -4),
        new T3.Vector3(x * .82, y * .86 + (y ? 0 : 9), -15),
        new T3.Vector3(x * .52, y * .42 + (y > 10 ? 14 : y < -10 ? -12 : -10), -20),
        new T3.Vector3(x * .28, yb * .9, -15),
        new T3.Vector3(sg * 50, yb, -9)
      ];
      wires.push({ s: m.s, m: mesh(2, flat(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 64, 1.25, 5, false)), Object.assign({ fill: .2, edge: .6, pow: 1.2, keep: 1 }, HO)).material });
      motors.push({ id: m.id, s: m.s, g, pos: new T3.Vector3(x, y, 0), dot, mat: mm });
    });
    const pill = (w, h, r, d) => ext(rrect(w, h, r, 5), null, { depth: d, bevelThickness: .9, bevelSize: .9, bevelSegments: 2 });
    at(mesh(2, pill(104, 66, 12, 3), Object.assign({ fill: .04, edge: .34, e: .34, ea: 40 }, HO)), 0, 0, -12);   /* 보드 */
    at(mesh(2, pill(88, 5, 2.5, 6), Object.assign({ fill: .03, edge: .24, e: .2, ea: 40 }, HO)), 0, 26, -8);
    at(mesh(2, pill(88, 5, 2.5, 6), Object.assign({ fill: .03, edge: .24, e: .2, ea: 40 }, HO)), 0, -26, -8);
    at(mesh(2, pill(26, 20, 6, 5), Object.assign({ fill: .03, edge: .24, e: .2, ea: 40 }, HO)), -30, 0, -8);
    at(mesh(2, cyl(9, 7, 32), Object.assign({ fill: .03, edge: .3, e: .2 }, HO)), 30, 0, -5);
    for (let k = 0; k < 12; k++) {   /* 핀 */
      at(mesh(2, cyl(.7, 9, 8), Object.assign({ fill: .2, edge: .2 }, HO)), -38.5 + k * 7, 26, 3);
      if (k % 2 === 0) at(mesh(2, cyl(.7, 9, 8), Object.assign({ fill: .2, edge: .2 }, HO)), -38.5 + k * 7, -26, 3);
    }

    /* 4 가죽 림 : 두께가 있는 관 · 손이 닿는 구간은 결이 촘촘 */
    mesh(3, tube(RC, RR, 0, 360, 0, 360, 280, 32), { fill: .018, edge: .5, pow: 2.4, grid: .04, n: [60, 12], wk: 1, bk: .22, lit: .045, cut: CUT });
    mesh(3, tube(RC, (ad) => RR(ad) * .6, 0, 360, 0, 360, 200, 18), { fill: .004, edge: .12, pow: 2.4, bk: .4, cut: CUT });
    [[145, 215], [-35, 35]].forEach(([a0, a1]) => mesh(3, tube(RC, (ad) => RR(ad) + 1.2, a0, a1, 0, 360, 70, 30), { fill: .004, edge: .08, pow: 2.2, wk: .5, bk: .2 }));
    const ringAt = (a, grow) => Array.from({ length: 49 }, (_, i) => {   /* 림을 a 도에서 자른 단면 고리 */
      const t = i * 7.5 * RAD, rr = RR(a) + grow, rc = RC(a);
      return new T3.Vector3((rc + rr * Math.cos(t)) * Math.cos(a * RAD), (rc + rr * Math.cos(t)) * Math.sin(a * RAD), rr * Math.sin(t));
    });
    [35, 145, 215, 325].forEach((a) => line(3, ringAt(a, 1), COL, .55, true));   /* 그립 구간 끝 */
    [160, 180, 200, -20, 0, 20].forEach((a) => line(3, ringAt(a, .6), COL, .26, true));   /* 관의 굵기가 읽히도록 그립 구간에 몇 개 더 */

    /* 5 스포크 프레임 : 렌더 실루엣을 그대로 압출 + 양쪽 버튼 */
    const hole = SHAPE.holes.slice().sort((a, b) => b.a - a.a)[0];
    at(mesh(4, ext(SHAPE.outer, hole ? [hole.pts] : [], { depth: 32, bevelThickness: 8, bevelSize: 4.6, bevelSegments: 4 }), { fill: .03, edge: .52, pow: 2, e: .3, ea: 34, bk: .3, lit: .07, sl: 6 }), 0, 0, -18);
    [[-211, 7, 2, 2], [211, 7, 2, 3]].forEach(([x, y, nc, nr]) => {
      at(mesh(4, ext(rrect(92, 84, 32, 10), null, { depth: 8, bevelThickness: 5, bevelSize: 5, bevelSegments: 4 }), { fill: .02, edge: .34, e: .13, ea: 44, lit: .05 }), x, y, 24);
      const bw = (92 - 30) / nc, bh = (84 - 28) / nr;
      for (let i = 0; i < nc; i++) for (let j = 0; j < nr; j++) {
        at(mesh(4, ext(rrect(bw - 7, bh - 7, Math.min(bw, bh) / 2 - 4.5, 7), null, { depth: 1.5, bevelThickness: 1.6, bevelSize: 1.6, bevelSegments: 2 }), { fill: .012, edge: .2, e: .1, ea: 44 }), x + (i - (nc - 1) / 2) * bw, y + (j - (nr - 1) / 2) * bh, 38);
      }
    });

    /* 6 허브 쿠션 : 볼록한 패드 (정면도 오른쪽 반 윤곽을 좌우 대칭) */
    const hp = [[720, 283.5], [736, 284], [778, 289], [811, 295], [836, 303], [849, 312], [865, 330], [870, 340], [875, 381], [875, 406], [870, 430], [857, 460], [839, 498], [826, 515], [813, 519], [803, 532], [789, 544], [760, 557], [737, 560], [720, 561]];
    const hub = hp.map((p) => [p[0] - 720, 388 - p[1]]).concat(hp.slice(1, -1).reverse().map((p) => [720 - p[0], 388 - p[1]]));
    at(mesh(5, ext(hub, null, { depth: 18, bevelThickness: 26, bevelSize: 24, bevelOffset: -24, bevelSegments: 10 }), { fill: .02, edge: .52, pow: 2.2, e: .14, ea: 50, bk: .3, lit: .07, sl: 7 }), 0, 0, 48);

    /* 7 엠블럼 커버 */
    at(mesh(6, ext(rrect(126, 126, 62.9, 16), null, { depth: 7, bevelThickness: 5, bevelSize: 5, bevelOffset: -5, bevelSegments: 3 }), { fill: .03, edge: .55, pow: 2, e: .34, ea: 40, lit: .06 }), 0, -19, 92);
    line(6, Array.from({ length: 97 }, (_, i) => new T3.Vector3(54 * Math.cos(i * 3.75 * RAD), -19 + 54 * Math.sin(i * 3.75 * RAD), 104.4)), COL, .45, true);

    /* 설계 톤에서만 보이는 것 : 림을 한 군데 잘라 낸 단면 (가죽 · 심지 · 심선 + 빗금) · 조립 축 */
    const dline = (i, obj, o) => { obj.material = lmat(COL, 0); obj.material.userData.o = o; dl.push({ m: obj.material, i }); G[i].add(obj); return obj; };
    CA.forEach((a) => {
      const ca = Math.cos(a * RAD), sa = Math.sin(a * RAD), rc = RC(a), rr = RR(a), P = (u, v) => new T3.Vector3((rc + u) * ca, (rc + u) * sa, v);
      [rr, rr * .6, 3.4].forEach((r, k) => dline(3, new T3.LineLoop(new T3.BufferGeometry().setFromPoints(Array.from({ length: 64 }, (_, i) => P(r * Math.cos(i * 5.625 * RAD), r * Math.sin(i * 5.625 * RAD))))), k ? .7 : 1));
      const hatch = [];
      for (let k = -9; k <= 9; k++) {
        let prev = null;
        for (let j = 0; j <= 60; j++) {
          const t = -rr + 2 * rr * j / 60, u = t, v = t + k * 6.5, d = Math.hypot(u, v), inside = d < rr - .4 && d > rr * .6 + .4;
          if (inside && prev) hatch.push(P(prev[0], prev[1]), P(u, v));
          prev = inside ? [u, v] : null;
        }
      }
      dline(3, new T3.LineSegments(new T3.BufferGeometry().setFromPoints(hatch)), .42);
    });
    const axis = new T3.Line(new T3.BufferGeometry().setFromPoints([new T3.Vector3(0, 0, -1), new T3.Vector3(0, 0, 1)]), new T3.LineDashedMaterial({ color: COL, transparent: true, opacity: 0, dashSize: .03, gapSize: .012, blending: T3.AdditiveBlending, depthTest: false, depthWrite: false }));
    axis.computeLineDistances();
    root.add(axis);

    /* 그립 구간 표시 호 (2.1 에서만) */
    const zm = lmat(0xa9dded, 0);
    [[150, 210], [-30, 30]].forEach(([a0, a1]) => root.add(new T3.Line(new T3.BufferGeometry().setFromPoints(Array.from({ length: 61 }, (_, i) => { const a = (a0 + (a1 - a0) * i / 60) * RAD; return new T3.Vector3(374 * Math.cos(a), 374 * Math.sin(a), 0); })), zm)));

    /* 공간의 먼지 : 카메라가 움직일 때 깊이가 느껴지도록 */
    {
      const n = 900, p = new Float32Array(n * 3);
      let sd = 7;
      const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < n; i++) { p[i * 3] = (rnd() - .5) * 7000; p[i * 3 + 1] = -760 + rnd() * 2600; p[i * 3 + 2] = (rnd() - .5) * 7000; }
      const g = new T3.BufferGeometry();
      g.setAttribute("position", new T3.Float32BufferAttribute(p, 3));
      const tc = document.createElement("canvas");
      tc.width = tc.height = 32;
      const tx2 = tc.getContext("2d"), gr = tx2.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.35, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      tx2.fillStyle = gr;
      tx2.fillRect(0, 0, 32, 32);
      scene.add(new T3.Points(g, new T3.PointsMaterial({ map: new T3.CanvasTexture(tc), color: 0xc9d0d8, size: 11, sizeAttenuation: true, transparent: true, opacity: .13, blending: T3.AdditiveBlending, depthTest: false, depthWrite: false })));
    }

    /* 바닥 : 핸들 아래로 멀어지며 사라지는 가는 격자와 동심원 (안개 없이 공간의 깊이) */
    const FLR = new T3.Vector2(2000, 6000);
    const floorM = new T3.ShaderMaterial({
      uniforms: { uFar: { value: FLR }, uA: { value: 1 } },
      vertexShader: `varying vec3 vW;varying vec3 vP;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vP=mv.xyz;gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying vec3 vW;varying vec3 vP;uniform vec2 uFar;uniform float uA;
  float gl(float x){float f=abs(fract(x-.5)-.5);float w=fwidth(x);return (1.-smoothstep(w*.5,w*1.7,f))*(1.-smoothstep(.12,.4,w));}
  float rg(float r,float R){float w=fwidth(r);return 1.-smoothstep(w*.6,w*2.,abs(r-R));}
  void main(){float r=length(vW.xz);float g=max(gl(vW.x/180.),gl(vW.z/180.))*.42+max(gl(vW.x/900.),gl(vW.z/900.))*.6;
  float ring=rg(r,520.)+rg(r,1040.)*.8+rg(r,1700.)*.6+rg(r,2600.)*.45;
  float fade=exp(-r/1700.)*(1.-smoothstep(uFar.x,uFar.y,-vP.z));gl_FragColor=vec4(vec3(.74,.79,.85)*(g*.2+ring*.26)*fade*uA,1.);}`,
      transparent: true, blending: T3.AdditiveBlending, depthWrite: false, depthTest: false, side: T3.DoubleSide
    });
    floorM.extensions.derivatives = true;
    {
      const f = new T3.Mesh(new T3.PlaneGeometry(14000, 14000).rotateX(-Math.PI / 2), floorM);
      f.position.y = -780;
      scene.add(f);
    }

    /* 일곱 겹 번호가 붙는 자리 (겹마다) */
    const TAGP = [[0, 392, 0], [0, 344, 0], [0, 58, 0], [0, 376, 0], [0, 128, 10], [0, 128, 62], [0, 66, 98]].map((a) => new T3.Vector3(...a));

    vib = new Vib3(T3, G[2], motors, cam);


    /* ---------- 카메라 길 : 히어로 영상과 겹치지 않는 각도로, 갈수록 안으로 ---------- */
    const K = (p, ks) => {
      for (let i = 1; i < ks.length; i++) if (p <= ks[i][0]) { const a = ks[i - 1], b = ks[i]; return mix(a[1], b[1], sm(seg(p, a[0], b[0]))); }
      return ks[ks.length - 1][1];
    };
    const AZ = [[0, -17], [.1, -20], [.145, -28], [.225, -32], [.28, -74], [.36, -68], [.395, -46], [.46, -41], [.53, -62], [.7, -70], [.8, -146], [.9, -156], [1, -162]];
    const EL = [[0, 9], [.1, 11], [.145, 36], [.225, 34], [.28, 14], [.36, 9], [.395, -24], [.46, -27], [.53, 9], [.7, 10], [.8, 8], [1, 4]];
    const DS = [[0, 1800], [.1, 1720], [.145, 1600], [.225, 1540], [.28, 680], [.36, 590], [.395, 1500], [.46, 1440], [.53, 2240], [.7, 2160], [.8, 1650], [.9, 760], [1, 400]];
    const TX = [[0, 0], [.225, 0], [.28, -312], [.36, -312], [.395, 0], [.8, 0], [.9, -250], [1, -316]];
    const TY = [[0, 0], [.1, 0], [.145, -14], [.225, -14], [.28, 0], [.36, 0], [.395, 10], [.46, 10], [.53, -22], [.7, -22], [.8, 0], [1, 0]];
    const SP = [[0, 0], [.1, 0], [.145, 14], [.225, 16], [.28, 0], [.46, 0], [.53, 138], [.7, 143], [.8, 80], [.9, 50], [1, 44]];
    const SX = [[0, 0], [.225, 0], [.28, -.02], [.36, -.02], [.395, 0], [.46, 0], [.53, -.08], [.7, -.08], [.8, 0], [.9, .03], [1, .04]];

    let W = 1, H = 1, fit = 1, wide = 1, mx = 0, my = 0, tx = 0, ty = 0, act = -2, scanCi = -1, scanT = -1e9, lastTo = 0;
    let dg = null, ox = 0, oy = 0;   /* 끌어서 돌리기 */
    const lift = [0, 0, 0, 0, 0, 0, 0], tgt = new T3.Vector3(), v = new T3.Vector3();

    /* 마우스 위치만큼 살짝 기울고, 끌면 좌우 · 위아래로 돌아감 (놓으면 제자리로) */
    pin.addEventListener("pointermove", (e) => {
      const r = pin.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - .5;
      my = (e.clientY - r.top) / r.height - .5;
      if (dg) { ox = clamp(dg.ox + (e.clientX - dg.x) * .32, -110, 110); oy = clamp(dg.oy + (e.clientY - dg.y) * .22, -50, 50); }
    });
    pin.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a, input, .hx-cfg")) return;
      dg = { x: e.clientX, y: e.clientY, ox, oy };
      pin.classList.add("drag");
    });
    const endDrag = () => { dg = null; pin.classList.remove("drag"); };
    addEventListener("pointerup", endDrag);
    addEventListener("pointercancel", endDrag);

    const layout = () => {
      W = pin.clientWidth;
      H = pin.clientHeight;
      if (W < 2 || H < 2) { W = H = 0; return; }
      R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      R.setSize(W, H, false);
      cam.aspect = W / H;
      fit = Math.min(1, (.48 * W) / (.76 * H));   /* 좁은 화면 : 핸들이 잘리지 않게 멀리 */
      /* 아이맥 : 맥북(1512 × 860) 화면비보다 가로가 길면 그만큼 핸들도 크게 — 최대 1.12배 (CSS [아이맥 화면비] 와 같은 계산) */
      wide = innerWidth >= 1513 ? clamp((W / H) / (1512 / 860), 1, 1.12) : 1;
      bl.width = Math.max(2, Math.round(W / 3));
      bl.height = Math.max(2, Math.round(H / 3));
    };

    /* 3D 위치 → 화면 위치 */
    const put = (el, pos, grp, o) => {
      v.copy(pos);
      grp.localToWorld(v);
      v.project(cam);
      const x = (v.x * .5 + .5) * W, y = (-v.y * .5 + .5) * H;
      el.style.cssText = `transform:translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0);opacity:${(v.z < 1 ? o : 0).toFixed(3)}`;
    };

    const render = (p, pre, now) => {
      /* 화면 크기가 아직 0 이면 그리지 않고, 크기가 생기면 다시 잼 */
      if (W < 2 || H < 2 || pin.clientWidth !== W || pin.clientHeight !== H) { layout(); if (W < 2 || H < 2) return; }

      tx += (mx - tx) * .06;
      ty += (my - ty) * .06;
      if (!dg) { ox *= .93; oy *= .93; }
      const sw = reduce ? 0 : 1;   /* 가만히 있어도 아주 살짝 흔들림 */
      const az = (K(p, AZ) + tx * 11 - ox + sw * Math.sin(now * .00034) * 2.4) * RAD;
      const el = clamp(K(p, EL) - ty * 7 + oy + sw * Math.cos(now * .00027) * 1.2, -80, 80) * RAD;
      const d = K(p, DS) / fit / wide, sp = K(p, SP);
      const back = sm(seg(p, .72, .8)), deep = sm(seg(p, .8, 1));

      tgt.set(K(p, TX), K(p, TY), -sp * deep);
      cam.position.set(tgt.x + d * Math.sin(az) * Math.cos(el), tgt.y + d * Math.sin(el), tgt.z + d * Math.cos(az) * Math.cos(el));
      cam.lookAt(tgt);
      if (!reduce && vib.amp > .01) {   /* 진동할 때 화면도 살짝 떨림 */
        const k = vib.amp * d * .0034;
        cam.position.x += (Math.random() - .5) * k;
        cam.position.y += (Math.random() - .5) * k;
      }
      cam.setViewOffset(W, H, -K(p, SX) * W, 0, W, H);
      FOG.set(d - 400, d + 440);
      FLR.set(d * 1.5 + 900, d * 2.6 + 3800);
      vib.sc = clamp(d / 1500, .62, 1);

      /* 겹마다 밝기 : inner 안쪽이 보이기 시작 · open 겹이 벌어짐 · back 뒤에서 */
      const inner = sm(seg(p, .115, .15)), open = sm(seg(p, .46, .52));
      const show = p > .545 && p < .708, idx = show ? Math.min(6, Math.floor(seg(p, .565, .69) * 7)) : -1;   /* 2.4 지금 켜진 겹 */
      const O = [
        mix(mix(mix(.5, .26, inner), 1, open), .62, back),
        mix(mix(.7, 1, open), .8, back),
        mix(mix(mix(.2, 1.15, inner), 1.05, open), 1.3, back),
        mix(mix(mix(1, .5, inner), 1, open), .55, back),
        mix(mix(mix(1, .5, inner), 1, open), .36, back),
        mix(mix(mix(1, .5, inner), 1, open), .36, back),
        mix(mix(mix(1, .55, inner), 1, open), .36, back)
      ];
      for (let i = 0; i < 7; i++) {
        let o = O[i];
        if (idx >= 0) o *= i === idx ? 1.25 : .34;
        lift[i] += ((i === idx ? 1 : 0) - lift[i]) * .14;   /* 켜진 겹은 살짝 위로 */
        G[i].position.set(0, lift[i] * 30, (i - 3) * sp - lift[i] * 10);
        mats[i].forEach((m) => { m.userData.o = o; m.uniforms.uOp.value = o; });
        lns[i].forEach((m) => (m.opacity = m.userData.o * .7 * (1 + 1.9 * TONE) * Math.min(1.4, o)));
        O[i] = o;
      }
      dl.forEach((x) => (x.m.opacity = x.m.userData.o * TONE * Math.min(1.4, O[x.i])));
      axis.scale.z = 3.7 * sp + 130;
      axis.material.opacity = .42 * TONE * sm(clamp(sp / 70));

      scrim.style.opacity = Math.max(.55, sm(seg(p, .25, .285)) * (1 - sm(seg(p, .36, .395))), sm(seg(p, .8, .88))).toFixed(3);
      zm.opacity = .7 * sm(seg(p, .115, .16)) * (1 - sm(seg(p, .25, .275)));
      haze.style.opacity = (1 - .7 * TONE).toFixed(3);
      haze.style.transform = `scale(${(1 + p * .55).toFixed(4)}) translate3d(${(-p * 3).toFixed(2)}%,${(p * 2).toFixed(2)}%,0)`;

      /* 2.2 신호 : 왼쪽이 주의 → 접근 → 긴급 / 2.3 울려 보기 : 고른 대로 */
      if (p >= .285 && p < .372) {
        const n = p < .312 ? 1 : p < .34 ? 2 : 3;
        setLevel(n);
        vib.set("L", n);
      } else if (p >= .372 && p < .46) {
        tryVib(now);
      } else {
        vib.set(null, 0);
      }

      common(p, now);

      /* 림을 따라 도는 물결 · 배선을 따라 흐르는 빛 · 장이 바뀔 때 위에서 아래로 훑는 빛 */
      const vs = vib.side;
      WAVE.set(vib.wv, now / 1000, vs === "R" ? 1 : vs === "L" ? -1 : WAVE.z);
      wires.forEach((w) => (w.m.uniforms.uFlow.value = vs && w.s === vs ? .25 + vib.wv * .75 : 0));
      if (ci !== scanCi) { scanCi = ci; scanT = now; }
      const st = (now - scanT) / 1700;
      SCAN.set(mix(1.25, -1.3, Math.pow(clamp(st), 2.6)), st < 1 && !reduce ? .3 * sm(clamp(st * 6)) * (1 - sm(seg(st, .82, 1))) : 0);

      root.updateMatrixWorld(true);
      R.render(scene, cam);
      if (cv.width > 0 && cv.height > 0 && bl.width > 0 && bl.height > 0) {   /* 빛 번짐 : 1/3 크기로 복사 → CSS 로 흐리게 */
        bctx.globalCompositeOperation = "copy";
        bctx.drawImage(cv, 0, 0, bl.width, bl.height);
      }
      const fade = sm(clamp(pre * 1.6));   /* 섹션이 아래서 올라올 때 서서히 */
      cv.style.opacity = fade.toFixed(3);
      bl.style.opacity = (.26 * fade * (1 - .75 * TONE)).toFixed(3);

      /* 2.4 일곱 겹 번호 */
      const to = sm(seg(p, .535, .56)) * (1 - sm(seg(p, .695, .715)));
      if (to > 0 || lastTo > 0) TAGP.forEach((a, i) => put(tags[i], a, G[i], to));
      lastTo = to;
      if (idx !== act) {
        act = idx;
        rows.forEach((r, i) => r.classList.toggle("on", i === idx));
        tags.forEach((t, i) => t.classList.toggle("on", i === idx));
      }
    };

    return { layout, render };
  };


  /* =====================================================
     3D 를 못 그리면 : 정면 그림 + 글 칸 · 세기 읽기만
  ===================================================== */
  let stage = build3D();
  if (!stage) {
    cv.remove();
    bl.remove();
    const im = new Image();
    im.src = "./images/handle-ghost.webp";
    im.alt = "";
    im.className = "hx-nogl";
    pin.insertBefore(im, pin.children[1]);
    vib = { ph: 0, amp: 0, side: null, set() {}, tick() {} };
    stage = {
      layout() {},
      render(p, pre, now) {
        if (p >= .285 && p < .372) setLevel(p < .312 ? 1 : p < .34 ? 2 : 3);
        common(p, now);
      }
    };
  }


  /* =====================================================
     스크롤 루프 — 섹션이 화면 근처에 있을 때만
     ---- 스크롤 위치(0 ~ 1)를 바로 쓰지 않고 따라가게 해서 부드럽게 (한 프레임에 16%씩)
  ===================================================== */
  let p = -1, raf = 0, near = false, warned = false;

  const loop = (now) => {
    raf = near ? requestAnimationFrame(loop) : 0;   /* 다음 프레임을 먼저 예약 — 한 프레임에서 문제가 생겨도 멈추지 않게 */
    if (innerHeight < 2 || innerWidth < 2) return;
    try {
      const r = sec.getBoundingClientRect(), vh = innerHeight, total = sec.offsetHeight - vh;
      if (total > 0 && r.bottom > -vh * .3 && r.top < vh * 1.3) {
        const target = clamp(-r.top / total), pre = clamp(1 - r.top / vh);
        if (p < 0 || reduce) {
          p = target;
        } else {
          p += (target - p) * .16;
          if (Math.abs(target - p) < .00004) p = target;
        }
        stage.render(p, pre, now);
      }
    } catch (e) {
      if (!warned) { warned = true; console.warn(e); }
    }
  };

  /* 섹션이 화면 위아래 30% 안에 들어오면 계산 시작, 벗어나면 멈춤 */
  new IntersectionObserver((entries) => {
    near = entries[0].isIntersecting;
    if (near && !raf) raf = requestAnimationFrame(loop);
  }, { rootMargin: "30% 0px" }).observe(sec);

  addEventListener("resize", () => { stage.layout(); p = -1; });
})();


/* =========================================================
   [HANDLE 07 제작 — 가운데 선 방식] 2026.11.14
   ---------------------------------------------------------
   핸들 영상.zip (handle-process/process-section.js) 를 옮겨 옴
   ---- 화면 가운데 선에 걸친 영상을 찾아 단계 이름 · STEP · N / 3 · 캡션을 굴려서 바꿈
   ---- 칸 안 영상은 스크롤에 따라 살짝 위아래로 움직임 (scale 1.06)
   ---- 영상은 화면에 보일 때만 재생
   ---- 우리 방식으로 바꾼 것 : 섹션이 화면 근처에 있을 때만 매 프레임 계산 (zip 은 항상 계산)
   스타일 : interface.css [HANDLE 07 제작 — 가운데 선 방식]
   전) .mk3--zig 영상 3개 autoplay (따로 JS 없음)
========================================================= */

(() => {
  const sec = document.querySelector(".hd5 .pcs");
  if (!sec) return;

  const items = [...sec.querySelectorAll(".pcs-item")];
  const ind = sec.querySelector(".pcs-ind");
  if (!items.length || !ind) return;

  const slots = {
    ttl: ind.querySelector(".pcs-ttl"),
    num: ind.querySelector(".pcs-num"),
    cur: ind.querySelector(".pcs-cur"),
    cap: ind.querySelector(".pcs-cap")
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = -1;
  let near = false;
  let raf = 0;

  const play = (v) => {
    if (reduce) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };

  /* 화면에 보일 때만 재생 */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? play(e.target) : e.target.pause()));
  }, { rootMargin: "10% 0px" });
  sec.querySelectorAll(".pcs-item video").forEach((v) => io.observe(v));

  /* 숫자 · 글자 굴리기 */
  const roll = (slot, text) => {
    if (!slot) return;
    const old = slot.firstElementChild;
    if (old && old.textContent === String(text)) return;
    const s = document.createElement("span");
    s.textContent = text;
    s.className = "pcs-roll";
    slot.innerHTML = "";
    slot.appendChild(s);
  };

  const frame = () => {
    raf = 0;
    const cy = innerHeight / 2;
    let best = 0, bd = 1e9;

    items.forEach((it, k) => {
      const b = it.getBoundingClientRect();
      const c = b.top + b.height / 2;
      const d = (cy >= b.top - 5 && cy <= b.bottom + 5) ? 0 : Math.abs(c - cy);
      if (d < bd) { bd = d; best = k; }
      if (!reduce) {
        const off = (c - cy) / innerHeight;
        it.firstElementChild.style.transform = `translateY(${(-off * 7).toFixed(2)}%) scale(1.06)`;
      }
    });

    if (best !== current) {
      current = best;
      const d = items[best].dataset;
      roll(slots.ttl, d.title);
      roll(slots.num, d.num);
      roll(slots.cur, d.n);
      roll(slots.cap, d.cap);
    }

    if (near) raf = requestAnimationFrame(frame);
  };

  /* 섹션이 화면 위아래 200px 안에 들어오면 계산 시작, 벗어나면 멈춤 */
  new IntersectionObserver((entries) => {
    near = entries[0].isIntersecting;
    if (near && !raf) raf = requestAnimationFrame(frame);
  }, { rootMargin: "200px 0px" }).observe(sec);

  frame();   /* 처음 한 번 — 라벨 · 영상 위치 맞춰 둠 */
})();


/* =========================================================
   [맨 아래 → 히어로로] 푸터까지 다 보고 2.5초 가만히 있으면 맨 위(히어로)로 / 2026.11.09
   ---------------------------------------------------------
   모든 페이지 같은 코드 (script.js · brand.js · interface.js · experience.js · logo.js 에 똑같이 넣음
   — 한 페이지에 두 파일이 있어도 한 번만 돌게 window.__ddBackTop 로 막음)
   ---- 페이지 맨 아래(푸터 끝)에 닿고 2.5초 동안 스크롤 · 클릭 · 키 입력이 없으면 → 부드럽게 맨 위로
   ---- 올라가는 중에 휠 · 터치 · 키를 쓰면 바로 멈춤 (사용자가 우선)
   ---- 핸들 페이지(Lenis 관성 스크롤)는 Lenis 로 올림 · 움직임 줄이기 설정이면 바로 이동
========================================================= */
(() => {
  if (window.__ddBackTop) return;
  window.__ddBackTop = true;

  const WAIT = 2500;   /* 맨 아래에서 기다리는 시간 (ms) */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = 0, raf = 0, auto = false;

  /* 천천히 출발 → 빨라짐 → 끝 5% 에서 짧게 감속하며 닿음 ("촥") */
  const DD_SNAP_EASE = (k) => {
    const c = 0.95;                               /* 여기까지는 가속 (k^3) */
    if (k < c) return 0.9 * Math.pow(k / c, 3);   /* 0 → 0.9 */
    const u = (k - c) / (1 - c);                  /* 마지막 짧은 구간 : 남은 0.1 을 빠르게 감속 */
    return 0.9 + 0.1 * (1 - Math.pow(1 - u, 3));
  };

  const atBottom = () => {
    const doc = document.documentElement;
    return doc.scrollHeight > innerHeight + 200 && innerHeight + scrollY >= doc.scrollHeight - 4;
  };

  const stopAuto = () => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (auto && window.__lenis && window.__lenis.stop) { window.__lenis.stop(); window.__lenis.start(); }
    auto = false;
  };

  const goTop = () => {
    timer = 0;
    if (!atBottom()) return;
    auto = true;

    /* 핸들 페이지 : Lenis 로 */
    if (window.__lenis && typeof window.__lenis.scrollTo === "function") {
      window.__lenis.scrollTo(0, { duration: reduce ? 0 : 2.6, easing: DD_SNAP_EASE, onComplete: () => { auto = false; } });   /* 2026.11.09 (3) 막판 빠르게 · 2.6초 (전 3.2초 sine) */
      return;
    }

    if (reduce) { window.scrollTo({ top: 0, behavior: "instant" }); auto = false; return; }

    /* 2026.11.09 (2) : 더 부드럽게
       ---- 브랜드 · 어바웃 · 경험 페이지는 CSS 에 scroll-behavior: smooth 가 있어서
            매 프레임 옮길 때마다 브라우저가 한 번 더 부드럽게 따라가려다 서로 엉켜 덜컥거렸음 → behavior "instant"
       ---- 시간 1.4 ~ 2.6초 → 2.4 ~ 4초 · 곡선 cubic(처음 · 끝이 급함) → sine(물 흐르듯 완만) */
    /* 2026.11.09 (3) : 막판에 빠르게 올라가 "촥" 닿게
       ---- 처음엔 천천히 출발 → 점점 빨라져 → 맨 위에 빠르게 닿고 마지막 아주 짧게(약 0.1초) 멈춰 섬
            전) sine (처음 · 끝 모두 천천히) · 2.4 ~ 4초 → 2 ~ 3.2초 */
    const from = scrollY;
    const dur = Math.min(3200, Math.max(2000, from * 0.25));
    const t0 = performance.now();
    const ease = DD_SNAP_EASE;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo({ top: from * (1 - ease(k)), behavior: "instant" });
      if (k < 1 && auto) raf = requestAnimationFrame(step);
      else { raf = 0; auto = false; }
    };
    raf = requestAnimationFrame(step);
  };

  const check = () => {
    if (auto) return;
    clearTimeout(timer);
    timer = atBottom() ? setTimeout(goTop, WAIT) : 0;
  };

  /* 사용자가 직접 움직이면 : 올라가던 중이면 멈추고, 기다리던 시간은 처음부터 */
  const userMove = () => {
    if (auto) stopAuto();
    clearTimeout(timer);
    timer = 0;
    requestAnimationFrame(check);
  };

  addEventListener("scroll", check, { passive: true });
  addEventListener("wheel", userMove, { passive: true });
  addEventListener("touchstart", userMove, { passive: true });
  addEventListener("keydown", userMove);
  addEventListener("pointerdown", userMove);
})();
