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


  const OVERVIEW_CARD_MAX =
    620;


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
        .display-page .display-overview .display-info__image {
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 30px 70px rgba(0, 0, 0, 0.55),
            0 6px 18px rgba(0, 0, 0, 0.38),
            0 0 0 1px rgba(255, 255, 255, 0.07) !important;
        }

        .display-page .display-overview .display-info__image img {
          display: block;
          border-radius: 12px;
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


      const textGap =
        vw >
        1100
          ? 52
          : 34;


      const textWidth =
        overviewTexts[
          0
        ]
          ? overviewTexts[
              0
            ].offsetWidth
          : 190;


      const sideMargin =
        26;


      const zigzagTarget =
        Math.min(
          OVERVIEW_CARD_ZIGZAG,
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
            0.44,
            OVERVIEW_CARD_MAX
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
