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


      const endWidth =
        Math.min(
          window.innerWidth *
          0.82,
          980
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
        `${lerp(
          370,
          Math.min(
            vw *
            0.82,
            980
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
          Math.min(
            vw *
            0.54,
            760
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


      const stackWidth =
        Math.min(
          vw *
          OVERVIEW_STACK_WIDTH,
          620,
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


      const stackDrop =
        vh *
        OVERVIEW_STACK_DROP;


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
   HAPTIC HANDLE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const page =
      document.body;


    if (
      !page.classList.contains(
        "handle-page"
      )
    ) {
      return;
    }


    /* 2026.10.23 : 핸들 4차 시안(.hd4)으로 바뀌어 옛 HAPTIC HANDLE LITE 동작은 쓰지 않음
       (아래 코드는 그대로 남겨 둠 — 4차 동작은 맨 아래 [HANDLE 4차]) */
    if (document.querySelector(".hd4")) {
      return;
    }


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


    const smoothstep = (
      value
    ) => {

      const progress =
        clamp(value);


      return (
        progress *
        progress *
        (
          3 -
          2 *
          progress
        )
      );
    };


    const sectionProgress =
      (
        section
      ) => {

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


    document.documentElement
      .classList.add(
        "handle-motion-ready"
      );


    /* =====================================================
       HANDLE HERO
    ===================================================== */

    const hero =
      document.querySelector(
        "[data-handle-hero]"
      );


    const heroFrames =
      hero
        ? Array.from(
            hero.querySelectorAll(
              "[data-handle-frame]"
            )
          )
        : [];


    const heroCopies =
      hero
        ? Array.from(
            hero.querySelectorAll(
              "[data-handle-copy]"
            )
          )
        : [];


    const heroProgress =
      hero?.querySelector(
        "[data-handle-progress]"
      );


    const heroCurrent =
      hero?.querySelector(
        "[data-handle-current]"
      );


    /* =====================================================
       LEFT / RIGHT GRIP
    ===================================================== */

    const grip =
      document.querySelector(
        "[data-handle-grip]"
      );


    const gripFrames =
      grip
        ? Array.from(
            grip.querySelectorAll(
              "[data-grip-frame]"
            )
          )
        : [];


    const gripCopies =
      grip
        ? Array.from(
            grip.querySelectorAll(
              "[data-grip-copy]"
            )
          )
        : [];


    /* =====================================================
       GENERIC SEQUENCE
    ===================================================== */

    const setSequence =
      (
        progress,
        frames,
        copies
      ) => {

        if (
          !frames.length
        ) {
          return 0;
        }


        const framePosition =
          progress *
          (
            frames.length -
            1
          );


        const activeIndex =
          Math.round(
            framePosition
          );


        frames.forEach(
          (
            frame,
            index
          ) => {

            const opacity =
              clamp(
                1 -
                Math.abs(
                  framePosition -
                  index
                )
              );


            const easedOpacity =
              smoothstep(
                opacity
              );


            const drift =
              (
                index -
                framePosition
              ) *
              1.25;


            frame.style
              .opacity =
              easedOpacity
                .toFixed(4);


            frame.style
              .transform =
              `scale(${(
                1.026 -
                easedOpacity *
                0.018
              ).toFixed(4)}) ` +
              `translateX(${drift.toFixed(2)}%)`;


            frame.classList.toggle(
              "is-active",
              index ===
              activeIndex
            );
          }
        );


        copies.forEach(
          (
            copy,
            index
          ) => {

            const opacity =
              clamp(
                1 -
                Math.abs(
                  framePosition -
                  index
                ) *
                1.6
              );


            const isVisible =
              opacity >
              0.015;


            copy.style
              .opacity =
              smoothstep(
                opacity
              ).toFixed(4);


            copy.style
              .transform =
              `translateY(${(
                (
                  1 -
                  opacity
                ) *
                22
              ).toFixed(2)}px)`;


            copy.style
              .visibility =
              isVisible
                ? "visible"
                : "hidden";


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


        return activeIndex;
      };


    /* =====================================================
       HANDLE HERO SEQUENCE
       FRONT → LEFT → RIGHT
    ===================================================== */

    const setHeroSequence =
      (
        progress
      ) => {

        if (
          !heroFrames.length
        ) {
          return 0;
        }


        let fromIndex =
          0;


        let toIndex =
          0;


        let blend =
          0;


        /* FRONT HOLD */

        if (
          progress <
          0.27
        ) {

          fromIndex =
            0;

          toIndex =
            0;


        /* FRONT → LEFT */

        } else if (
          progress <
          0.43
        ) {

          fromIndex =
            0;

          toIndex =
            1;


          blend =
            smoothstep(
              (
                progress -
                0.27
              ) /
              0.16
            );


        /* LEFT HOLD */

        } else if (
          progress <
          0.61
        ) {

          fromIndex =
            1;

          toIndex =
            1;


        /* LEFT → RIGHT */

        } else if (
          progress <
          0.77
        ) {

          fromIndex =
            1;

          toIndex =
            2;


          blend =
            smoothstep(
              (
                progress -
                0.61
              ) /
              0.16
            );


        /* RIGHT HOLD */

        } else {

          fromIndex =
            2;

          toIndex =
            2;
        }


        const activeIndex =
          blend >=
          0.5
            ? toIndex
            : fromIndex;


        /* =================================================
           HERO IMAGE
        ================================================== */

        heroFrames.forEach(
          (
            frame,
            index
          ) => {

            let opacity =
              0;


            if (
              fromIndex ===
              toIndex &&
              index ===
              fromIndex
            ) {

              opacity =
                1;

            } else if (
              index ===
              fromIndex
            ) {

              opacity =
                1 -
                blend;

            } else if (
              index ===
              toIndex
            ) {

              opacity =
                blend;
            }


            frame.style
              .opacity =
              opacity.toFixed(
                4
              );


            frame.style
              .transform =
              `scale(${(
                1.006 +
                (
                  1 -
                  opacity
                ) *
                0.008
              ).toFixed(4)})`;


            frame.classList.toggle(
              "is-active",
              index ===
              activeIndex
            );
          }
        );


        /* =================================================
           HERO COPY
        ================================================== */

        heroCopies.forEach(
          (
            copy,
            index
          ) => {

            let opacity =
              0;


            if (
              fromIndex ===
              toIndex &&
              index ===
              fromIndex
            ) {

              opacity =
                1;

            } else if (
              index ===
              fromIndex
            ) {

              opacity =
                1 -
                blend;

            } else if (
              index ===
              toIndex
            ) {

              opacity =
                blend;
            }


            const copyOpacity =
              smoothstep(
                opacity
              );


            copy.style
              .opacity =
              copyOpacity
                .toFixed(4);


            copy.style
              .transform =
              `translateY(${(
                (
                  1 -
                  copyOpacity
                ) *
                14
              ).toFixed(2)}px)`;


            copy.style
              .visibility =
              opacity >
              0.015
                ? "visible"
                : "hidden";


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


        return activeIndex;
      };


    /* =====================================================
       UPDATE HANDLE HERO
    ===================================================== */

    const updateHero =
      () => {

        if (
          !hero
        ) {
          return;
        }


        const progress =
          sectionProgress(
            hero
          );


        const activeIndex =
          setHeroSequence(
            progress
          );


        if (
          heroProgress
        ) {

          heroProgress.style
            .transform =
            `scaleX(${progress.toFixed(4)})`;
        }


        if (
          heroCurrent
        ) {

          heroCurrent.textContent =
            String(
              activeIndex +
              1
            ).padStart(
              2,
              "0"
            );
        }
      };


    /* =====================================================
       UPDATE LEFT / RIGHT GRIP
    ===================================================== */

    const updateGrip =
      () => {

        if (
          !grip
        ) {
          return;
        }


        setSequence(
          sectionProgress(
            grip
          ),
          gripFrames,
          gripCopies
        );
      };


    /* =====================================================
       HANDLE RENDER LOOP
    ===================================================== */

    let scrollFrame =
      0;


    const render =
      () => {

        updateHero();

        updateGrip();

        scrollFrame =
          0;
      };


    const requestRender =
      () => {

        if (
          scrollFrame
        ) {
          return;
        }


        scrollFrame =
          window
            .requestAnimationFrame(
              render
            );
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
      requestRender,
      {
        passive: true
      }
    );


    /* =====================================================
       HANDLE CONTENT REVEAL
    ===================================================== */

    const revealElements =
      Array.from(
        document.querySelectorAll(
          "[data-handle-reveal]"
        )
      );


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


                entry.target.classList.add(
                  "is-visible"
                );


                observer.unobserve(
                  entry.target
                );
              }
            );
          },
          {
            rootMargin:
              "0px 0px -12% 0px",

            threshold:
              0.08
          }
        );


      revealElements.forEach(
        (
          element
        ) => {

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


    render();
  }
);

/* =========================================================
   HAPTIC MATERIAL — 스크롤 파동
========================================================= */

(() => {
  "use strict";


  const init =
    () => {

      if (
        !document.body
          .classList.contains(
            "handle-page"
          )
      ) {
        return;
      }


      const section =
        document.querySelector(
          "#handle-detail[data-handle-material]"
        );


      if (
        !section ||
        section.dataset
          .materialBound
      ) {
        return;
      }


      const stage =
        section.querySelector(
          "[data-material-sticky]"
        );


      const photo =
        section.querySelector(
          "[data-material-image]"
        );


      const overlay =
        section.querySelector(
          "[data-material-haptics]"
        );


      const svg =
        section.querySelector(
          "[data-material-wave-svg]"
        );


      const waves =
        section.querySelector(
          "[data-material-waves]"
        );


      const dots =
        section.querySelector(
          "[data-material-dots]"
        );


      if (
        !stage ||
        !photo ||
        !overlay ||
        !svg ||
        !waves ||
        !dots
      ) {
        return;
      }


      if (
        typeof Element
          .prototype
          .animate !==
        "function"
      ) {
        return;
      }


      section.dataset
        .materialBound =
        "true";


      const NS =
        "http://www.w3.org/2000/svg";


      const cfg = {
        duration: 2800,
        layers: 2,
        radius: 200,
        interval: 3900
      };


      const points =
        [
          -40,
          0,
          40
        ].map(
          (
            angle
          ) => {

            const a =
              angle *
              Math.PI /
              180;


            return [
              833 +
              916 *
              Math.sin(
                a
              ),

              1271 -
              916 *
              Math.cos(
                a
              )
            ];
          }
        );


      const motion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        );


      const animations =
        new Set();


      let active =
        false;


      let ready =
        false;


      let timer =
        0;


      let frame =
        0;


      let geometryDirty =
        true;


      const node =
        (
          tag,
          attrs = {}
        ) => {

          const n =
            document
              .createElementNS(
                NS,
                tag
              );


          Object.entries(
            attrs
          ).forEach(
            (
              [
                key,
                value
              ]
            ) => {

              n.setAttribute(
                key,
                String(
                  value
                )
              );
            }
          );


          return n;
        };


      const animate =
        (
          target,
          keys,
          options,
          cleanup
        ) => {

          const animation =
            target.animate(
              keys,
              options
            );


          animations.add(
            animation
          );


          animation.onfinish =
            () => {

              animations.delete(
                animation
              );


              if (
                cleanup
              ) {
                cleanup();
              }


              animation.cancel();
            };


          return animation;
        };


      const atPoint =
        (
          i,
          parent
        ) => {

          const g =
            node(
              "g",
              {
                transform:
                  `translate(${points[i][0]} ${points[i][1]})`
              }
            );


          parent.appendChild(
            g
          );


          return g;
        };


      function ring(
        i,
        delay,
        strength
      ) {

        const group =
          atPoint(
            i,
            waves
          );


        const shape =
          node(
            "g",
            {
              class:
                "rip",

              fill:
                "none",

              stroke:
                "#c1e2e7",

              opacity:
                0
            }
          );


        [
          [
            24,
            0.045
          ],
          [
            10,
            0.11
          ],
          [
            3.4,
            0.42
          ]
        ].forEach(
          (
            [
              width,
              opacity
            ]
          ) => {

            shape.appendChild(
              node(
                "circle",
                {
                  r:
                    100,

                  "stroke-width":
                    width *
                    strength,

                  opacity,

                  "vector-effect":
                    "non-scaling-stroke"
                }
              )
            );
          }
        );


        group.appendChild(
          shape
        );


        const radius =
          cfg.radius *
          (
            0.7 +
            0.3 *
            strength
          );


        const peak =
          0.34 +
          0.52 *
          strength;


        const scale =
          (
            fraction
          ) =>
            `scale(${radius * fraction / 100})`;


        animate(
          shape,
          [
            {
              offset:
                0,

              transform:
                "scale(.02)",

              opacity:
                0
            },
            {
              offset:
                0.07,

              transform:
                scale(
                  0.13
                ),

              opacity:
                peak
            },
            {
              offset:
                0.22,

              transform:
                scale(
                  0.27
                ),

              opacity:
                peak *
                0.6
            },
            {
              offset:
                0.42,

              transform:
                scale(
                  0.47
                ),

              opacity:
                peak *
                0.33
            },
            {
              offset:
                0.62,

              transform:
                scale(
                  0.66
                ),

              opacity:
                peak *
                0.17
            },
            {
              offset:
                0.82,

              transform:
                scale(
                  0.85
                ),

              opacity:
                peak *
                0.06
            },
            {
              offset:
                1,

              transform:
                scale(
                  1
                ),

              opacity:
                0
            }
          ],
          {
            duration:
              cfg.duration,

            delay,

            easing:
              "linear",

            fill:
              "both"
          },
          () =>
            group.remove()
        );
      }


      function bloom(
        i
      ) {

        const group =
          atPoint(
            i,
            waves
          );


        waves.prepend(
          group
        );


        const shape =
          node(
            "circle",
            {
              r:
                100,

              class:
                "bloom",

              fill:
                "url(#handle-material-blob)",

              opacity:
                0
            }
          );


        group.appendChild(
          shape
        );


        const scale =
          (
            fraction
          ) =>
            `scale(${cfg.radius * fraction / 100})`;


        animate(
          shape,
          [
            {
              offset:
                0,

              transform:
                "scale(.03)",

              opacity:
                0
            },
            {
              offset:
                0.09,

              transform:
                scale(
                  0.14
                ),

              opacity:
                0.46
            },
            {
              offset:
                0.26,

              transform:
                scale(
                  0.28
                ),

              opacity:
                0.27
            },
            {
              offset:
                0.48,

              transform:
                scale(
                  0.47
                ),

              opacity:
                0.13
            },
            {
              offset:
                0.72,

              transform:
                scale(
                  0.67
                ),

              opacity:
                0.05
            },
            {
              offset:
                1,

              transform:
                scale(
                  0.88
                ),

              opacity:
                0
            }
          ],
          {
            duration:
              cfg.duration *
              1.2,

            easing:
              "linear",

            fill:
              "both"
          },
          () =>
            group.remove()
        );
      }


      function pulse(
        i
      ) {

        bloom(
          i
        );


        for (
          let k =
            0;
          k <
          cfg.layers;
          k++
        ) {

          ring(
            i,
            cfg.duration *
            0.16 *
            k,
            1 -
            k *
            0.18
          );
        }


        const group =
          atPoint(
            i,
            dots
          );


        const halo =
          node(
            "circle",
            {
              r:
                100,

              class:
                "halo",

              fill:
                "url(#handle-material-halo)",

              opacity:
                0
            }
          );


        group.appendChild(
          halo
        );


        animate(
          halo,
          [
            {
              offset:
                0,

              opacity:
                0,

              transform:
                "scale(.03)"
            },
            {
              offset:
                0.09,

              opacity:
                0.48,

              transform:
                "scale(.16)"
            },
            {
              offset:
                0.3,

              opacity:
                0.24,

              transform:
                "scale(.31)"
            },
            {
              offset:
                0.6,

              opacity:
                0.08,

              transform:
                "scale(.5)"
            },
            {
              offset:
                1,

              opacity:
                0,

              transform:
                "scale(.68)"
            }
          ],
          {
            duration:
              cfg.duration,

            easing:
              "linear",

            fill:
              "both"
          },
          () =>
            group.remove()
        );
      }


      function stop() {

        active =
          false;


        clearTimeout(
          timer
        );


        timer =
          0;


        section.classList.remove(
          "is-haptics-active"
        );


        animations.forEach(
          (
            animation
          ) => {

            animation.cancel();
          }
        );


        animations.clear();


        waves.replaceChildren();


        dots.replaceChildren();
      }


      function cycle() {

        if (
          !active ||
          motion.matches ||
          document.hidden
        ) {
          return;
        }


        points.forEach(
          (
            _,
            i
          ) => {

            pulse(
              i
            );
          }
        );


        timer =
          window.setTimeout(
            cycle,
            cfg.interval
          );
      }


      const positionOffset =
        (
          value,
          freeSpace
        ) => {

          if (
            value ===
            "left" ||
            value ===
            "top"
          ) {
            return 0;
          }


          if (
            value ===
            "right" ||
            value ===
            "bottom"
          ) {
            return freeSpace;
          }


          if (
            value ===
            "center"
          ) {
            return (
              freeSpace /
              2
            );
          }


          if (
            value.endsWith(
              "%"
            )
          ) {

            return (
              freeSpace *
              parseFloat(
                value
              ) /
              100
            );
          }


          return (
            parseFloat(
              value
            ) ||
            0
          );
        };


      function syncGeometry() {

        if (
          !photo.naturalWidth ||
          !photo.naturalHeight
        ) {
          return false;
        }


        const width =
          photo.clientWidth;


        const height =
          photo.clientHeight;


        if (
          !width ||
          !height
        ) {
          return false;
        }


        const scale =
          Math.max(
            width /
            photo.naturalWidth,
            height /
            photo.naturalHeight
          );


        const renderedWidth =
          photo.naturalWidth *
          scale;


        const renderedHeight =
          photo.naturalHeight *
          scale;


        const style =
          getComputedStyle(
            photo
          );


        const pos =
          style.objectPosition
            .trim()
            .split(
              /\s+/
            );


        const x =
          positionOffset(
            pos[
              0
            ],
            width -
            renderedWidth
          );


        const y =
          positionOffset(
            pos[
              1
            ] ||
            "50%",
            height -
            renderedHeight
          );


        const zoom =
          parseFloat(
            getComputedStyle(
              section
            ).getPropertyValue(
              "--material-image-scale"
            )
          ) ||
          1;


        const left =
          width /
          2 +
          zoom *
          (
            x -
            width /
            2
          ) +
          (
            zoom -
            1
          ) *
          renderedWidth /
          2;


        const top =
          height /
          2 +
          zoom *
          (
            y -
            height /
            2
          ) +
          (
            zoom -
            1
          ) *
          renderedHeight /
          2;


        section.style.setProperty(
          "--material-image-width",
          `${renderedWidth}px`
        );


        section.style.setProperty(
          "--material-image-height",
          `${renderedHeight}px`
        );


        section.style.setProperty(
          "--material-image-left",
          `${left}px`
        );


        section.style.setProperty(
          "--material-image-top",
          `${top}px`
        );


        svg.setAttribute(
          "preserveAspectRatio",
          "none"
        );


        return true;
      }


      function render() {

        frame =
          0;


        if (
          !ready
        ) {
          return;
        }


        if (
          geometryDirty
        ) {

          geometryDirty =
            false;


          if (
            !syncGeometry()
          ) {

            stop();

            return;
          }
        }


        const rect =
          section
            .getBoundingClientRect();


        const height =
          stage.clientHeight;


        const travel =
          section.offsetHeight -
          height;


        const shouldPlay =
          !motion.matches &&
          !document.hidden &&
          -rect.top >=
          height *
          0.18 &&
          -rect.top <
          travel &&
          rect.bottom >
          height;


        if (
          shouldPlay &&
          !active
        ) {

          active =
            true;


          section.classList.add(
            "is-haptics-active"
          );


          cycle();

        } else if (
          !shouldPlay &&
          active
        ) {

          stop();
        }
      }


      function requestRender() {

        if (
          !frame
        ) {

          frame =
            requestAnimationFrame(
              render
            );
        }
      }


      function resize() {

        geometryDirty =
          true;


        requestRender();
      }


      function setup() {

        if (
          !photo.naturalWidth ||
          !photo.naturalHeight
        ) {
          return;
        }


        ready =
          true;


        section.classList.add(
          "is-haptics-ready"
        );


        overlay.hidden =
          false;


        resize();
      }


      photo.addEventListener(
        "load",
        setup
      );


      photo.addEventListener(
        "error",
        () => {

          stop();


          ready =
            false;


          section.classList.remove(
            "is-haptics-ready"
          );


          overlay.hidden =
            true;
        }
      );


      window.addEventListener(
        "scroll",
        requestRender,
        {
          passive: true
        }
      );


      window.addEventListener(
        "resize",
        resize,
        {
          passive: true
        }
      );


      document.addEventListener(
        "visibilitychange",
        () => {

          if (
            document.hidden
          ) {

            stop();

          } else {

            requestRender();
          }
        }
      );


      window.addEventListener(
        "pagehide",
        stop
      );


      window.addEventListener(
        "pageshow",
        resize
      );


      const motionChange =
        () => {

          stop();

          resize();
        };


      if (
        motion.addEventListener
      ) {

        motion.addEventListener(
          "change",
          motionChange
        );

      } else {

        motion.addListener(
          motionChange
        );
      }


      if (
        typeof ResizeObserver !==
        "undefined"
      ) {

        const observer =
          new ResizeObserver(
            resize
          );


        observer.observe(
          stage
        );


        observer.observe(
          photo
        );
      }


      if (
        photo.complete
      ) {

        setup();
      }
    };


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();
  }
})();

/* =========================================================
   HAPTIC HANDLE — ASSEMBLY PROCESS VIDEOS
========================================================= */

(() => {
  "use strict";


  const init =
    () => {

      if (
        !document.body
          .classList.contains(
            "handle-page"
          )
      ) {
        return;
      }


      const section =
        document.querySelector(
          "[data-handle-process]"
        );


      if (
        !section ||
        section.dataset
          .processBound ===
        "true"
      ) {
        return;
      }


      const items =
        Array.from(
          section.querySelectorAll(
            "[data-handle-process-item]"
          )
        );


      if (
        !items.length
      ) {
        return;
      }


      section.dataset
        .processBound =
        "true";


      section.classList.add(
        "is-process-ready"
      );


      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        );


      const visibleItems =
        new Set();


      const playTimers =
        new Map();


      const videoOf =
        (
          item
        ) =>
          item.querySelector(
            "[data-handle-process-video]"
          );


      items.forEach(
        (
          item
        ) => {

          const video =
            videoOf(
              item
            );


          if (
            !video
          ) {
            return;
          }


          video.muted =
            true;


          video.defaultMuted =
            true;


          video.playsInline =
            true;


          video.setAttribute(
            "muted",
            ""
          );


          video.setAttribute(
            "playsinline",
            ""
          );
        }
      );


      const clearPlayTimer =
        (
          item
        ) => {

          const timer =
            playTimers.get(
              item
            );


          if (
            timer
          ) {

            window.clearTimeout(
              timer
            );


            playTimers.delete(
              item
            );
          }
        };


      const stopItem =
        (
          item,
          reset =
          true
        ) => {

          clearPlayTimer(
            item
          );


          const video =
            videoOf(
              item
            );


          if (
            !video
          ) {
            return;
          }


          video.pause();


          if (
            !reset
          ) {
            return;
          }


          try {

            video.currentTime =
              0;

          } catch (
            error
          ) {

            /* metadata 로드 전 */
          }
        };


      const playItem =
        (
          item
        ) => {

          clearPlayTimer(
            item
          );


          if (
            reducedMotion.matches ||
            document.hidden ||
            !visibleItems.has(
              item
            )
          ) {
            return;
          }


          const video =
            videoOf(
              item
            );


          if (
            !video
          ) {
            return;
          }


          const delay =
            Math.max(
              0,
              Number.parseInt(
                item.dataset
                  .processDelay ||
                "0",
                10
              ) ||
              0
            );


          const timer =
            window.setTimeout(
              () => {

                playTimers.delete(
                  item
                );


                if (
                  reducedMotion.matches ||
                  document.hidden ||
                  !visibleItems.has(
                    item
                  )
                ) {
                  return;
                }


                const playPromise =
                  video.play();


                if (
                  playPromise &&
                  typeof playPromise
                    .catch ===
                  "function"
                ) {

                  playPromise.catch(
                    () => {}
                  );
                }
              },
              delay
            );


          playTimers.set(
            item,
            timer
          );
        };


      const stopAll =
        (
          reset =
          true
        ) => {

          items.forEach(
            (
              item
            ) => {

              stopItem(
                item,
                reset
              );
            }
          );
        };


      const showProcess =
        () => {

          section.classList.add(
            "is-process-visible"
          );
        };


      const hideProcessIfEmpty =
        () => {

          if (
            !visibleItems.size
          ) {

            section.classList.remove(
              "is-process-visible"
            );
          }
        };


      if (
        !(
          "IntersectionObserver" in
          window
        )
      ) {

        items.forEach(
          (
            item
          ) => {

            visibleItems.add(
              item
            );
          }
        );


        showProcess();


        if (
          !reducedMotion.matches
        ) {

          items.forEach(
            playItem
          );
        }

      } else {

        const itemObserver =
          new IntersectionObserver(
            (
              entries
            ) => {

              entries.forEach(
                (
                  entry
                ) => {

                  const item =
                    entry.target;


                  if (
                    entry.isIntersecting
                  ) {

                    visibleItems.add(
                      item
                    );


                    showProcess();


                    playItem(
                      item
                    );


                    return;
                  }


                  visibleItems.delete(
                    item
                  );


                  stopItem(
                    item,
                    true
                  );


                  hideProcessIfEmpty();
                }
              );
            },
            {
              rootMargin:
                "0px 0px -8% 0px",

              threshold:
                0.22
            }
          );


        items.forEach(
          (
            item
          ) => {

            itemObserver.observe(
              item
            );
          }
        );
      }


      document.addEventListener(
        "visibilitychange",
        () => {

          if (
            document.hidden
          ) {

            stopAll(
              false
            );

            return;
          }


          if (
            !reducedMotion.matches
          ) {

            visibleItems.forEach(
              playItem
            );
          }
        }
      );


      const handleMotionChange =
        () => {

          showProcess();


          if (
            reducedMotion.matches
          ) {

            stopAll(
              true
            );

            return;
          }


          visibleItems.forEach(
            playItem
          );
        };


      if (
        reducedMotion
          .addEventListener
      ) {

        reducedMotion.addEventListener(
          "change",
          handleMotionChange
        );

      } else {

        reducedMotion.addListener(
          handleMotionChange
        );
      }


      window.addEventListener(
        "pagehide",
        () => {

          stopAll(
            false
          );
        }
      );


      if (
        reducedMotion.matches
      ) {

        showProcess();

        stopAll(
          true
        );
      }
    };


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();
  }
})();

/* =========================================================
   HUD
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const hudPage =
      document.querySelector(
        ".hud-page"
      );


    if (
      !hudPage
    ) {
      return;
    }


    /* =====================================================
       HUD REVEAL
    ===================================================== */

    const revealElements =
      Array.from(
        document.querySelectorAll(
          ".hud-reveal"
        )
      );


    const revealObserver =
      new IntersectionObserver(
        (
          entries
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
            }
          );
        },
        {
          threshold:
            0.14,

          rootMargin:
            "0px 0px -6% 0px"
        }
      );


    revealElements.forEach(
      (
        element
      ) => {

        revealObserver.observe(
          element
        );
      }
    );


    /* =====================================================
       HUD BENEFIT
    ===================================================== */

    const benefitSection =
      document.querySelector(
        ".hud-benefit"
      );


    if (
      benefitSection
    ) {

      const benefitObserver =
        new IntersectionObserver(
          (
            entries
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


                benefitSection
                  .classList.add(
                    "is-visible"
                  );
              }
            );
          },
          {
            threshold:
              0.2,

            rootMargin:
              "0px 0px -5% 0px"
          }
        );


      benefitObserver.observe(
        benefitSection
      );
    }


    /* =====================================================
       HUD FOCUS
    ===================================================== */

    const focusSection =
      document.querySelector(
        ".hud-focus"
      );


    if (
      focusSection
    ) {

      const focusObserver =
        new IntersectionObserver(
          (
            entries
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


                focusSection
                  .classList.add(
                    "is-visible"
                  );
              }
            );
          },
          {
            threshold:
              0.25,

            rootMargin:
              "0px 0px -5% 0px"
          }
        );


      focusObserver.observe(
        focusSection
      );
    }


    /* =====================================================
       HUD HERO PARALLAX
    ===================================================== */

    const heroVisual =
      document.querySelector(
        ".hud-hero__visual"
      );


    let hudScrollFrame =
      null;


    function updateHudParallax() {

      hudScrollFrame =
        null;


      if (
        !heroVisual
      ) {
        return;
      }


      const rect =
        heroVisual
          .getBoundingClientRect();


      const viewportHeight =
        window.innerHeight;


      const center =
        rect.top +
        rect.height /
        2;


      const distance =
        center -
        viewportHeight /
        2;


      const movement =
        Math.max(
          -18,
          Math.min(
            18,
            distance *
            -0.025
          )
        );


      heroVisual.style
        .transform =
        `translateY(${movement}px)`;
    }


    function handleHudScroll() {

      if (
        hudScrollFrame
      ) {
        return;
      }


      hudScrollFrame =
        requestAnimationFrame(
          updateHudParallax
        );
    }


    window.addEventListener(
      "scroll",
      handleHudScroll,
      {
        passive: true
      }
    );


    updateHudParallax();


    /* =====================================================
       INITIAL VISIBLE CHECK
    ===================================================== */

    function showVisibleHudElements() {

      const viewportHeight =
        window.innerHeight;


      revealElements.forEach(
        (
          element
        ) => {

          const rect =
            element
              .getBoundingClientRect();


          if (
            rect.top <
            viewportHeight *
            0.96 &&
            rect.bottom >
            0
          ) {

            element.classList.add(
              "is-visible"
            );
          }
        }
      );
    }


    showVisibleHudElements();
  }
);


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
   DISPLAY HERO — 위험 순간 / 2026.10.10
   ---------------------------------------------------------
   평소 3.5초 → 즉시 정지 3초 → 평소 3초 → 긴급차 양보 3초 → 반복
   섹션 data-mode 와 제목(.is-on) · 위쪽 작은 글을 바꿈
   화면에 보일 때만 돌아가고, 다른 섹션을 볼 땐 멈춤
   스타일 : interface.css 맨 아래 [DISPLAY HERO — 위험 순간]
   (디스플레이히어로8_코드.zip display-hero8.js → 따로 파일 만들지 않고 interface.js 로 정리)
========================================================= */

(() => {

  const hero =
    document.querySelector("[data-dh8]");

  if (!hero) {
    return;
  }


  const kick =
    hero.querySelector("[data-dh8-kick]");

  const titles =
    Array.from(
      hero.querySelectorAll("[data-dh8-title]")
    );


  /* [모드, 머무는 시간(ms)]  0 평소 · 1 즉시 정지 · 2 긴급차 양보 */
  const steps = [
    [0, 3500],
    [1, 3000],
    [0, 3000],
    [2, 3000],
  ];

  /* 모드별 위쪽 작은 글 */
  const kicks = [
    "평소",
    "위험 · 즉시 정지 45m",
    "긴급차 접근 · 120m",
  ];

  let i = 0;
  let timer = null;


  function step() {

    const [mode, wait] =
      steps[i];

    hero.dataset.mode =
      mode;

    titles.forEach((t, j) => {
      t.classList.toggle("is-on", j === mode);
      t.setAttribute("aria-hidden", j === mode ? "false" : "true");
    });

    if (kick) {
      kick.textContent =
        kicks[mode];
    }

    i =
      (i + 1) % steps.length;

    timer =
      setTimeout(step, wait);

  }


  /* 움직임 줄이기 설정이면 평소 화면으로 고정 */
  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }


  /* 화면에 보일 때만 돌아가게 (다른 섹션 볼 땐 멈춤) */
  new IntersectionObserver(([entry]) => {

    if (entry.isIntersecting && !timer) {
      step();
    }

    if (!entry.isIntersecting && timer) {
      clearTimeout(timer);
      timer = null;
    }

  }).observe(hero);

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
    const wrap = document.getElementById("words");
    wrap.innerHTML = W.map((x, i) => {
      const no = String(i + 1).padStart(2, "0");
      return `
      <section class="w wx" id="w${i + 1}" aria-label="${x.src}" style="--lc:${x.lc}">
        <div class="wx__left">
          <p class="wx__num tnum" aria-hidden="true"><span>${no}</span></p>
          <div class="wx__body rv">
            <p class="wx__en">${x.w}</p>
            <h2 class="wx__ko">${x.h.replace("<br>", " ")}</h2>
            <p class="wx__desc">${x.p}</p>
            <p class="wx__meta">${x.src} <i style="background:${x.lc}"></i> ${x.lv}</p>
          </div>
          <ul class="wx__icons rv" data-d="1">
            <li>${ICON.sound}<span>소리</span><b>${x.src}</b></li>
            <li>${ICON.level}<span>단계</span><b>${x.lv}</b></li>
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
    DD.onFrame(() => {
      const r = br.getBoundingClientRect();
      const b = DD.smooth(DD.clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.6)));
      br.style.setProperty("--b", b.toFixed(3));
    });
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
   [HANDLE 4차] 핸들 페이지 4차 시안 조합 / 2026.10.23
   ---------------------------------------------------------
   dadeullim-handle-4차.zip 의 assets/seq.js · hero.js · site.js · widgets.js
   + index.html 맨 아래 스크립트를 순서 그대로 옮겨 옴
   ---- handle.html 의 .hd4 가 있을 때만 실행
   ---- 이미지 시퀀스 경로 : assets/seq/ → ./images/handle-seq/
   ---- 히어로 선 · 라벨 위치(callouts.json) : 파일로 불러오지 않고 아래 값으로
   ---- Lenis(부드러운 스크롤)는 handle.html 에서 interface.js 보다 먼저 불러옴
   전) 위쪽 HAPTIC HANDLE (지금은 .hd4 가 있으면 건너뜀)
========================================================= */

(() => {
  if (!document.querySelector(".hd4")) return;

  /* 히어로 부품 라벨 A–G · 영상 시간별 위치 (전 assets/callouts.json) */
  const HANDLE_CALLOUTS = {"parts":[{"k":"A","name":"Outer trim"},{"k":"B","name":"Chrome ring"},{"k":"C","name":"Haptic module"},{"k":"D","name":"Leather rim"},{"k":"E","name":"Spoke frame"},{"k":"F","name":"Hub cushion"},{"k":"G","name":"CC2 emblem"}],"track":[[5.9,[0.2878,0.4094],[0.4122,0.2602],[0.4293,0.4639],[0.5715,0.2617],[0.6061,0.5453],[0.6501,0.6254],[0.7296,0.697]],[5.95,[0.2959,0.412],[0.4158,0.2688],[0.432,0.465],[0.5691,0.2709],[0.6021,0.544],[0.6443,0.6212],[0.7207,0.6904]],[6.0,[0.2988,0.4129],[0.4171,0.2719],[0.433,0.4654],[0.5683,0.2743],[0.6006,0.5436],[0.6422,0.6198],[0.7175,0.6882]],[6.05,[0.2988,0.4127],[0.4172,0.2718],[0.433,0.4653],[0.5684,0.2743],[0.6006,0.5436],[0.6422,0.6199],[0.7175,0.6884]],[6.1,[0.2988,0.4125],[0.4172,0.2717],[0.433,0.4652],[0.5684,0.2743],[0.6006,0.5437],[0.6422,0.6201],[0.7175,0.6886]],[6.15,[0.2987,0.4124],[0.4172,0.2716],[0.4329,0.4652],[0.5685,0.2742],[0.6006,0.5438],[0.6422,0.6202],[0.7175,0.6888]],[6.2,[0.2986,0.4122],[0.4172,0.2714],[0.4329,0.4651],[0.5686,0.2742],[0.6007,0.5439],[0.6423,0.6204],[0.7176,0.6891]],[6.25,[0.2985,0.412],[0.4172,0.2712],[0.4329,0.4651],[0.5687,0.2741],[0.6007,0.544],[0.6424,0.6206],[0.7177,0.6893]],[6.3,[0.2984,0.4118],[0.4172,0.2709],[0.4328,0.465],[0.5688,0.2739],[0.6008,0.5441],[0.6425,0.6207],[0.7178,0.6896]],[6.35,[0.2982,0.4116],[0.4172,0.2706],[0.4328,0.4649],[0.5689,0.2737],[0.6009,0.5442],[0.6426,0.621],[0.718,0.6899]],[6.4,[0.298,0.4114],[0.4171,0.2703],[0.4327,0.4648],[0.569,0.2735],[0.601,0.5443],[0.6427,0.6212],[0.7182,0.6903]],[6.45,[0.2978,0.4111],[0.417,0.27],[0.4326,0.4647],[0.5692,0.2733],[0.6011,0.5444],[0.6429,0.6214],[0.7185,0.6906]],[6.5,[0.2975,0.4109],[0.417,0.2697],[0.4325,0.4647],[0.5693,0.273],[0.6012,0.5446],[0.643,0.6216],[0.7187,0.691]],[6.55,[0.2972,0.4107],[0.4169,0.2693],[0.4324,0.4646],[0.5694,0.2727],[0.6014,0.5447],[0.6432,0.6219],[0.719,0.6914]],[6.6,[0.2969,0.4104],[0.4168,0.2689],[0.4323,0.4645],[0.5696,0.2724],[0.6015,0.5448],[0.6434,0.6222],[0.7193,0.6918]],[6.65,[0.2966,0.4102],[0.4167,0.2684],[0.4322,0.4644],[0.5697,0.2721],[0.6017,0.5449],[0.6436,0.6224],[0.7196,0.6923]],[6.7,[0.2963,0.4099],[0.4166,0.268],[0.4321,0.4643],[0.5699,0.2717],[0.6019,0.5451],[0.6439,0.6227],[0.72,0.6927]],[6.75,[0.2959,0.4096],[0.4165,0.2675],[0.432,0.4642],[0.5701,0.2713],[0.6021,0.5452],[0.6441,0.623],[0.7204,0.6932]],[6.8,[0.2955,0.4094],[0.4163,0.267],[0.4319,0.4641],[0.5702,0.2709],[0.6022,0.5453],[0.6444,0.6233],[0.7208,0.6937]],[6.85,[0.2951,0.4091],[0.4162,0.2665],[0.4317,0.464],[0.5704,0.2705],[0.6025,0.5455],[0.6447,0.6236],[0.7212,0.6941]],[6.9,[0.2947,0.4088],[0.4161,0.266],[0.4316,0.4639],[0.5706,0.27],[0.6027,0.5456],[0.6449,0.624],[0.7216,0.6946]],[6.95,[0.2942,0.4085],[0.4159,0.2655],[0.4315,0.4638],[0.5708,0.2695],[0.6029,0.5457],[0.6452,0.6243],[0.7221,0.6951]],[7.0,[0.2938,0.4083],[0.4157,0.2649],[0.4313,0.4637],[0.5709,0.269],[0.6031,0.5459],[0.6456,0.6246],[0.7226,0.6957]],[7.05,[0.2933,0.408],[0.4156,0.2643],[0.4312,0.4636],[0.5711,0.2685],[0.6033,0.546],[0.6459,0.625],[0.7231,0.6962]],[7.1,[0.2929,0.4077],[0.4154,0.2637],[0.431,0.4635],[0.5713,0.268],[0.6036,0.5462],[0.6462,0.6253],[0.7236,0.6967]],[7.15,[0.2924,0.4074],[0.4152,0.2632],[0.4308,0.4633],[0.5715,0.2675],[0.6038,0.5463],[0.6465,0.6256],[0.7241,0.6973]],[7.2,[0.2919,0.4071],[0.415,0.2625],[0.4307,0.4632],[0.5717,0.2669],[0.6041,0.5464],[0.6469,0.626],[0.7246,0.6978]],[7.25,[0.2914,0.4068],[0.4148,0.2619],[0.4305,0.4631],[0.5719,0.2664],[0.6043,0.5466],[0.6472,0.6264],[0.7252,0.6984]],[7.3,[0.2908,0.4065],[0.4147,0.2613],[0.4303,0.463],[0.5721,0.2658],[0.6046,0.5467],[0.6476,0.6267],[0.7257,0.6989]],[7.35,[0.2903,0.4062],[0.4145,0.2607],[0.4302,0.4629],[0.5723,0.2652],[0.6048,0.5469],[0.648,0.6271],[0.7263,0.6995]],[7.4,[0.2898,0.4059],[0.4143,0.26],[0.43,0.4628],[0.5725,0.2646],[0.6051,0.547],[0.6483,0.6274],[0.7268,0.7001]],[7.45,[0.2892,0.4056],[0.414,0.2594],[0.4298,0.4627],[0.5727,0.264],[0.6054,0.5472],[0.6487,0.6278],[0.7274,0.7007]],[7.5,[0.2887,0.4054],[0.4138,0.2588],[0.4296,0.4626],[0.5729,0.2634],[0.6057,0.5473],[0.6491,0.6282],[0.728,0.7012]],[7.55,[0.2882,0.4051],[0.4136,0.2581],[0.4294,0.4624],[0.5731,0.2628],[0.6059,0.5475],[0.6495,0.6285],[0.7286,0.7018]],[7.6,[0.2876,0.4048],[0.4134,0.2575],[0.4293,0.4623],[0.5733,0.2622],[0.6062,0.5476],[0.6499,0.6289],[0.7292,0.7024]],[7.65,[0.287,0.4045],[0.4132,0.2568],[0.4291,0.4622],[0.5736,0.2616],[0.6065,0.5478],[0.6503,0.6293],[0.7298,0.7029]],[7.7,[0.2865,0.4042],[0.413,0.2561],[0.4289,0.4621],[0.5738,0.261],[0.6068,0.5479],[0.6506,0.6296],[0.7303,0.7035]],[7.75,[0.2859,0.4039],[0.4128,0.2555],[0.4287,0.462],[0.574,0.2604],[0.607,0.548],[0.651,0.63],[0.7309,0.7041]],[7.8,[0.2854,0.4037],[0.4126,0.2549],[0.4285,0.4619],[0.5742,0.2598],[0.6073,0.5482],[0.6514,0.6303],[0.7315,0.7046]],[7.85,[0.2848,0.4034],[0.4123,0.2542],[0.4283,0.4618],[0.5744,0.2592],[0.6076,0.5483],[0.6518,0.6307],[0.7321,0.7052]],[7.9,[0.2843,0.4031],[0.4121,0.2536],[0.4282,0.4617],[0.5746,0.2586],[0.6079,0.5484],[0.6522,0.631],[0.7327,0.7057]],[7.95,[0.2837,0.4028],[0.4119,0.2529],[0.428,0.4616],[0.5748,0.2579],[0.6081,0.5486],[0.6526,0.6314],[0.7333,0.7063]],[8.0,[0.2832,0.4026],[0.4117,0.2523],[0.4278,0.4615],[0.5749,0.2573],[0.6084,0.5487],[0.653,0.6317],[0.7339,0.7068]],[8.05,[0.2827,0.4023],[0.4115,0.2517],[0.4276,0.4614],[0.5751,0.2568],[0.6087,0.5488],[0.6533,0.6321],[0.7344,0.7073]],[8.1,[0.2821,0.4021],[0.4113,0.2511],[0.4274,0.4613],[0.5753,0.2562],[0.6089,0.549],[0.6537,0.6324],[0.735,0.7078]],[8.15,[0.2816,0.4018],[0.4111,0.2505],[0.4273,0.4612],[0.5755,0.2556],[0.6092,0.5491],[0.6541,0.6327],[0.7356,0.7084]],[8.2,[0.2811,0.4016],[0.4109,0.2499],[0.4271,0.4611],[0.5757,0.255],[0.6094,0.5492],[0.6544,0.633],[0.7361,0.7088]],[8.25,[0.2806,0.4014],[0.4107,0.2493],[0.4269,0.461],[0.5759,0.2545],[0.6097,0.5493],[0.6548,0.6333],[0.7367,0.7093]],[8.3,[0.2801,0.4012],[0.4105,0.2488],[0.4268,0.4609],[0.576,0.2539],[0.6099,0.5494],[0.6551,0.6336],[0.7372,0.7098]],[8.35,[0.2796,0.401],[0.4102,0.2482],[0.4266,0.4608],[0.5762,0.2534],[0.6102,0.5495],[0.6555,0.6339],[0.7377,0.7102]],[8.4,[0.2791,0.4008],[0.41,0.2477],[0.4264,0.4608],[0.5763,0.2528],[0.6104,0.5496],[0.6558,0.6342],[0.7383,0.7107]],[8.45,[0.2786,0.4006],[0.4098,0.2471],[0.4263,0.4607],[0.5765,0.2522],[0.6107,0.5497],[0.6562,0.6344],[0.7388,0.7111]],[8.5,[0.2781,0.4005],[0.4095,0.2466],[0.4261,0.4606],[0.5766,0.2516],[0.611,0.5497],[0.6566,0.6347],[0.7394,0.7114]],[8.55,[0.2775,0.4004],[0.4093,0.246],[0.4259,0.4606],[0.5768,0.2509],[0.6112,0.5498],[0.657,0.6349],[0.7401,0.7118]],[8.6,[0.2769,0.4003],[0.409,0.2455],[0.4257,0.4606],[0.5769,0.2502],[0.6115,0.5498],[0.6574,0.6351],[0.7407,0.7121]],[8.65,[0.2764,0.4003],[0.4087,0.2449],[0.4255,0.4605],[0.577,0.2496],[0.6118,0.5499],[0.6578,0.6353],[0.7414,0.7125]],[8.7,[0.2758,0.4002],[0.4084,0.2444],[0.4253,0.4605],[0.5771,0.2489],[0.6121,0.5499],[0.6583,0.6355],[0.742,0.7128]],[8.75,[0.2752,0.4002],[0.4081,0.2438],[0.4251,0.4605],[0.5773,0.2481],[0.6124,0.5499],[0.6587,0.6357],[0.7427,0.7131]],[8.8,[0.2746,0.4002],[0.4077,0.2432],[0.4249,0.4605],[0.5774,0.2474],[0.6127,0.5499],[0.6592,0.6359],[0.7434,0.7133]],[8.85,[0.2739,0.4002],[0.4074,0.2427],[0.4247,0.4604],[0.5775,0.2467],[0.613,0.5499],[0.6596,0.636],[0.7441,0.7136]]]};


  /* ---------- 이미지 시퀀스 (seq.js) ---------- */
/* DADEULLIM — HANDLE SEQUENCE ENGINE (shared by 시안 1–5)
   331 frames · 1440×810 · assets/seq/0000.webp – 0330.webp
   Scene map (331 index)
   0–30 emerge · 30–80 rotate · 80–159 unscrew + explode · 159–171 zoom through rim
   175–190 housing opens · 190–199 coin out · 197–207 ripple · 204–215 short ×3
   227–246 close · 252–290 reassemble · 290–330 complete (bg keyed to black)        */
(function () {
  const N = 331, W = 1440, H = 810;
  const src = (i) => `./images/handle-seq/${String(i).padStart(4, "0")}.webp`;
  const imgs = new Array(N);
  const loaded = new Uint8Array(N);
  const listeners = new Set();

  function load(i) {
    if (imgs[i]) return;
    const im = new Image();
    im.decoding = "async";
    im.onload = () => { loaded[i] = 1; listeners.forEach((f) => f(i)); };
    im.src = src(i);
    imgs[i] = im;
  }
  // first frames now, the rest in order, a few at a time
  for (let i = 0; i < 24; i++) load(i);
  let next = 24;
  function pump() {
    let n = 0;
    while (next < N && n < 6) { load(next++); n++; }
    if (next < N) setTimeout(pump, 40);
  }
  setTimeout(pump, 200);

  function nearest(i) {
    i = Math.max(0, Math.min(N - 1, Math.round(i)));
    if (loaded[i]) return imgs[i];
    for (let d = 1; d < N; d++) {
      if (i - d >= 0 && loaded[i - d]) return imgs[i - d];
      if (i + d < N && loaded[i + d]) return imgs[i + d];
    }
    return null;
  }

  // background grey of the render at a frame (black → #d2d2d2 between 266 and 295)
  const bgStops = [[0, 0], [330, 0]];   // 4차: frames are keyed to black all the way through
  function rawAt(f) {
    for (let k = 0; k < bgStops.length - 1; k++) {
      const [a, va] = bgStops[k], [b, vb] = bgStops[k + 1];
      if (f >= a && f <= b) return Math.round(va + (vb - va) * ((f - a) / (b - a)));
    }
    return f < 0 ? 0 : 210;
  }
  // render black is lifted to graphite (screen blend) so the page is never pure black
  const LIFT = [23, 25, 28];
  const screen = (v, l) => Math.round(255 - (255 - v) * (255 - l) / 255);
  const bgAt = (f) => screen(rawAt(f), 25);
  const bgCss = (f) => { const v = rawAt(f); return `rgb(${LIFT.map((l) => screen(v, l)).join(",")})`; };

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  function progressOf(el) {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, el.offsetHeight - innerHeight));
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Player: draws frames into a canvas with cover/contain fit.
     opts: canvas, fit ('cover'|'contain'), zoom(f)->scale, focus [nx,ny]   */
  function Player(opts) {
    const c = opts.canvas, ctx = c.getContext("2d");
    const st = { f: 0, target: 0, raf: 0, rect: null, scale: 1, fx: 0.5, fy: 0.5 };
    function size() {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      st.cw = r.width; st.ch = r.height; st.dpr = dpr;
      draw(true);
    }
    function geom() {
      const fit = typeof opts.fit === "function" ? opts.fit() : (opts.fit || "cover");
      const s0 = fit === "cover" ? Math.max(st.cw / W, st.ch / H) : Math.min(st.cw / W, st.ch / H);
      const ox = opts.offsetX ? opts.offsetX() : 0;   // shift in css px (e.g. split layouts)
      const dw0 = W * s0, dh0 = H * s0;
      const dx0 = (st.cw - dw0) / 2 + ox, dy0 = (st.ch - dh0) / 2;
      const px = dx0 + st.fx * dw0, py = dy0 + st.fy * dh0;
      const dw = dw0 * st.scale, dh = dh0 * st.scale;
      return { s: s0 * st.scale, dw, dh, dx: px - st.fx * dw, dy: py - st.fy * dh };
    }
    let lastDrawn = -1;
    function draw(force) {
      const fi = Math.round(st.f);
      if (!force && fi === lastDrawn) return;
      const im = nearest(fi);
      if (!im) return;
      const g = geom();
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgb(${LIFT.join(",")})`;
      ctx.fillRect(0, 0, st.cw, st.ch);
      // edges outside the image take the render's own background
      ctx.fillStyle = bgCss(fi);
      ctx.fillRect(0, 0, st.cw, st.ch);
      ctx.fillStyle = `rgb(${LIFT.join(",")})`;
      ctx.fillRect(g.dx, g.dy, g.dw, g.dh);
      ctx.globalCompositeOperation = "screen";
      ctx.drawImage(im, g.dx, g.dy, g.dw, g.dh);
      ctx.globalCompositeOperation = "source-over";
      lastDrawn = fi;
      opts.onDraw && opts.onDraw(fi, api);
    }
    st.ts = 1; st.tfx = .5; st.tfy = .5;
    function tick() {
      const d = st.target - st.f;
      st.f = Math.abs(d) < 0.3 || reduce ? st.target : st.f + d * 0.22;
      let moved = false;
      for (const [a, b] of [["scale", "ts"], ["fx", "tfx"], ["fy", "tfy"]]) {
        const e = st[b] - st[a];
        if (e !== 0) { st[a] = Math.abs(e) < 0.0005 || reduce ? st[b] : st[a] + e * 0.08; moved = true; }
      }
      draw(moved);
      st.raf = st.f !== st.target || moved ? requestAnimationFrame(tick) : 0;
    }
    const api = {
      N,
      set(frame) { st.target = clamp(frame, 0, N - 1); if (!st.raf) st.raf = requestAnimationFrame(tick); },
      jump(frame) { st.f = st.target = clamp(frame, 0, N - 1); draw(true); },
      setView(scale, fx, fy, instant) {
        st.ts = scale; st.tfx = fx; st.tfy = fy;
        if (instant) { st.scale = scale; st.fx = fx; st.fy = fy; draw(true); }
        else if (!st.raf) st.raf = requestAnimationFrame(tick);
      },
      get frame() { return Math.round(st.f); },
      // frame-normalised point → canvas-local CSS px
      toScreen(nx, ny) { const g = geom(); return [g.dx + nx * g.dw, g.dy + ny * g.dh]; },
      redraw() { draw(true); },
      ctx, canvas: c,
    };
    listeners.add((i) => { if (Math.abs(i - Math.round(st.f)) < 3) draw(true); });
    addEventListener("resize", size);
    new ResizeObserver(size).observe(c);
    size();
    return api;
  }

  function onScroll(fn) {
    let q = 0;
    const run = () => { q = 0; fn(); };
    addEventListener("scroll", () => { if (!q) q = requestAnimationFrame(run); }, { passive: true });
    addEventListener("resize", () => { if (!q) q = requestAnimationFrame(run); });
    fn();
  }

  // map progress p (0–1) through keyed segments [[p0,f0],[p1,f1],...]
  function mapKeys(p, keys) {
    if (p <= keys[0][0]) return keys[0][1];
    for (let k = 0; k < keys.length - 1; k++) {
      const [a, fa] = keys[k], [b, fb] = keys[k + 1];
      if (p <= b) return fa + (fb - fa) * ((p - a) / (b - a || 1));
    }
    return keys[keys.length - 1][1];
  }
  const range = (p, a, b) => clamp((p - a) / (b - a));

  window.HSeq = { N, Player, onScroll, progressOf, bgAt, bgCss, LIFT, mapKeys, range, clamp, src, imgs, reduce };
})();



  /* ---------- 영상 히어로 글자 · 선 (hero.js) ---------- */
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
  const LAY = { A: [-1, -50], B: [-1, -90], C: [-1, 120], D: [1, -90], E: [1, -60], F: [1, 60], G: [1, 80] };
  let CO = null;
  /* 2026.10.23 : assets/callouts.json 을 불러오던 것 → HANDLE_CALLOUTS 값을 바로 씀 (아래 frame 시작 직전에) */

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
  function rect() {
    const r = root.getBoundingClientRect(), s = Math.max(r.width / 1920, r.height / 1080);
    return { w: 1920 * s, h: 1080 * s, x: (r.width - 1920 * s) / 2, y: (r.height - 1080 * s) / 2, W: r.width, H: r.height };
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
    const bu = eo(rng(t, 1.3, 2.0)) * (1 - rng(t, 2.35, 2.6));
    big.style.clipPath = `inset(${(1 - eo(rng(t, 1.3, 2.0))) * 100}% 0 0 0)`;
    big.style.opacity = bu > 0 ? (1 - rng(t, 2.35, 2.6)).toFixed(3) : 0;
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
        const [side, dy] = LAY[c.k], ex = x + side * 70, ey = y + dy, tx = ex + side * 110;
        const k = eo(rng(t, t0, t0 + .3)), k1 = Math.min(1, k * 2), k2 = Math.max(0, k * 2 - 1);
        const p1x = x + (ex - x) * k1, p1y = y + (ey - y) * k1;
        c.g.firstChild.setAttribute("points", k2 > 0 ? `${x},${y} ${ex},${ey} ${ex + (tx - ex) * k2},${ey}` : `${x},${y} ${p1x},${p1y}`);
        c.g.lastChild.setAttribute("cx", x); c.g.lastChild.setAttribute("cy", y); c.g.lastChild.setAttribute("r", 4 * eo(rng(t, t0, t0 + .15)));
        const full = c.d.dataset.full, n = Math.round(full.length * rng(t, t0 + .18, t0 + .5));
        c.d.textContent = full.slice(0, n);
        const wid = full.length * 8.4;
        let lx = side > 0 ? tx + 10 : tx - 10 - wid, ly = ey;
        if (lx + wid > R.W - 24) { lx = R.W - 24 - wid; ly = ey - 16; }
        if (lx < 24) { lx = 24; ly = ey - 16; }
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
  CO = HANDLE_CALLOUTS; build();
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



  /* ---------- 시퀀스 장면 · 진동 패턴 (widgets.js) ---------- */
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



  /* ---------- 섹션별 동작 (index.html 맨 아래 스크립트) ---------- */
(() => {
  const cl = (v) => Math.max(0, Math.min(1, v));
  const stops = new Map();
  const light = (st, side, pid, loop) => { stops.get(st.id) && stops.get(st.id)(); stops.set(st.id, playWheel(st, side, pid, loop)); };
  const quiet = (st) => { stops.get(st.id) && stops.get(st.id)(); stops.delete(st.id); };
  // chapter indicator
  const nav = document.getElementById('chap'), ticks = [...nav.querySelectorAll('.ticks i')], names = ['문제','아이디어','구조','방향','세기 · 리듬','체험','제작','질문'];
  const chaps = [...document.querySelectorAll('[data-chap]')];
  const updNav = () => { let k = -1; chaps.forEach((c) => { const r = c.getBoundingClientRect(); if (r.top < innerHeight * .5 && r.bottom > innerHeight * .5) k = +c.dataset.chap; });
    nav.classList.toggle('on', k >= 0); if (k < 0) return; ticks.forEach((t, i) => t.classList.toggle('on', i <= k));
    document.getElementById('chap-n').textContent = String(k + 1).padStart(2, '0'); document.getElementById('chap-t').textContent = names[k]; };
  addEventListener('scroll', () => requestAnimationFrame(updNav), { passive: true }); updNav();
  // 01 numbers one by one
  const P = document.getElementById('prob'), ps = [...P.querySelectorAll('.st')], pl = [...P.querySelectorAll('ol.steps li')];
  onProg(P, (p) => { const k = p < .36 ? 0 : p < .7 ? 1 : 2; ps.forEach((s, i) => s.classList.toggle('on', i === k)); pl.forEach((s, i) => s.classList.toggle('on', i === k)); });
  // 03 legend
  const S = document.getElementById('struct'), lis = [...S.querySelectorAll('#legend li')];
  S.addEventListener('frame', (e) => { const k = Math.max(0, Math.min(7, Math.round(7 * cl((e.detail.f - 92) / 60)))); lis.forEach((l, i) => l.classList.toggle('on', i < k)); document.getElementById('lay-n').textContent = k; });
  // 04 left then right
  const D = document.getElementById('dir'), dst = document.getElementById('d-st'), rules = [...D.querySelectorAll('.rule > div')], caps = [...D.querySelectorAll('.side-cap')]; let cur = '';
  onProg(D, (p) => { const k = p < .1 ? '' : p < .52 ? 'L' : p < .95 ? 'R' : '';
    if (k === cur) return; cur = k;
    rules.forEach((r) => r.classList.toggle('on', r.classList.contains(k))); caps.forEach((r) => r.classList.toggle('on', r.classList.contains(k)));
    if (k) light(dst, k, k === 'L' ? 2 : 1, true); else quiet(dst); });
  new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) { quiet(dst); cur = ''; } })).observe(D);
  // 05 pulses + pattern rows
  const G = document.getElementById('sig'), pcs = [...G.querySelectorAll('#pc i')], pats = [...G.querySelectorAll('.pat')];
  G.addEventListener('frame', (e) => { const f = e.detail.f, p = e.detail.p, on = [[204.5, 207.5], [208.5, 211.5], [212.5, 216]];
    pcs.forEach((c, i) => c.classList.toggle('on', f >= on[i][0] && f < on[i][1]));
    const k = p < .4 ? 0 : p < .7 ? 1 : 2; pats.forEach((r, i) => r.classList.toggle('on', i === k)); });
  // 06 configurator
  const T = document.getElementById('t-st'), st = { side: 'L', snd: 'siren', lv: 2 }, nm = { 1: '주의', 2: '접근', 3: '긴급' };
  const lvl = () => st.snd === 'horn' ? 1 : +st.lv;
  const render = () => { const P = PATTERNS[lvl()];
    document.getElementById('o-pin').textContent = st.side === 'L' ? 'D5' : 'D6'; document.getElementById('o-pat').textContent = nm[lvl()]; document.getElementById('o-duty').textContent = P.duty + '%';
    document.getElementById('hl').classList.toggle('on', st.side === 'L'); document.getElementById('hr').classList.toggle('on', st.side === 'R'); };
  const fire = () => light(T, st.side, lvl(), false);
  document.querySelectorAll('#cfg [data-g]').forEach((g) => g.querySelectorAll('button').forEach((b) => b.onclick = () => {
    g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); st[g.dataset.g] = b.dataset.v; render(); fire(); }));
  document.getElementById('go').onclick = fire; render();
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
   (옛 [DISPLAY HERO — 위험 순간] .dh8 코드는 대상이 없어 동작 안 함)
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
