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
  const LAY = { A: [-1, -50], B: [-1, -90], C: [-1, 120], D: [-1, -95], E: [1, -60], F: [-1, 130], G: [1, 80] };
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
        const [side, dy0] = LAY[c.k], ks = Math.min(1, R.W / 1440), dy = dy0 * ks, ey = y + dy;
        let ex = x + side * 70 * ks, tx = ex + side * 110 * ks;
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
  const ex = document.getElementById('ex'), bals = [...ex.querySelectorAll('.bal')];
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
