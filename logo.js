/* =========================================================
   DADEULLIM — LOGO PAGE
   script.js
   ---------------------------------------------------------
   01. HERO      영상 재생 후 로고로 전환
   02. HEADER    스크롤 시 중앙 NAV 숨김 / 상단에서 복귀
   03. REVEAL    섹션 등장 모션
   04. WAVE      단계 영상 재생 제어
   05. SPECS     숫자 카운트업
   06. COLOR     HEX 복사
========================================================= */


/* =========================================================
   01. HERO
   영상 종료 → 작은 로고 이미지로 전환
========================================================= */

(function () {

  const hero =
    document.getElementById(
      "top"
    );

  const video =
    document.getElementById(
      "hero-video"
    );

  const logo =
    document.getElementById(
      "hero-logo"
    );

  const replay =
    document.getElementById(
      "hero-replay"
    );


  if (
    !hero ||
    !video ||
    !logo ||
    !replay
  ) {
    return;
  }


  /* =====================================================
     VIDEO LAST FRAME LOGO AREA

     현재 교체한 hero.mp4 기준 값.
     이 수치는 수정하지 않음.

     영상 원본:
     3840 × 2160

     영상 마지막 프레임의 로고 영역:
     x1 = 806
     x2 = 3033
     y1 = 592
     y2 = 1369
  ===================================================== */

  const SRC = {
    w: 3840,
    h: 2160,

    x1: 806,
    x2: 3033,

    y1: 592,
    y2: 1369
  };


  /* =====================================================
     LAST FRAME AUTO CALIBRATION

     영상 마지막 프레임에서
     파란색 로고 영역을 감지해서
     SRC 값을 자동으로 한 번 더 보정.

     file:// 환경 등에서 canvas 접근이 막히면
     위에 입력한 기본 SRC 값을 그대로 사용.
  ===================================================== */

  function calibrate() {

    try {

      if (
        !video.videoWidth
      ) {
        return;
      }


      const W =
        960;

      const H =
        Math.round(
          W *
          video.videoHeight /
          video.videoWidth
        );


      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        W;

      canvas.height =
        H;


      const ctx =
        canvas.getContext(
          "2d",
          {
            willReadFrequently:
              true
          }
        );


      if (
        !ctx
      ) {
        return;
      }


      ctx.drawImage(
        video,
        0,
        0,
        W,
        H
      );


      const data =
        ctx.getImageData(
          0,
          0,
          W,
          H
        ).data;


      /* 좌측 상단을 배경색 기준으로 사용 */

      const bg = [
        data[0],
        data[1],
        data[2]
      ];


      let x1 =
        W;

      let x2 =
        -1;

      let y1 =
        H;

      let y2 =
        -1;

      let count =
        0;


      for (
        let y = 0;
        y < H;
        y += 1
      ) {

        for (
          let x = 0;
          x < W;
          x += 1
        ) {

          const index =
            (
              y * W + x
            ) * 4;


          const R =
            data[index];

          const G =
            data[index + 1];

          const B =
            data[index + 2];


          const farFromBackground =
            Math.abs(
              R - bg[0]
            ) +
            Math.abs(
              G - bg[1]
            ) +
            Math.abs(
              B - bg[2]
            ) >
            28;


          /* 파란색 계열 영역 */

          const isBlue =
            B - R >
            25;


          if (
            farFromBackground &&
            isBlue
          ) {

            count +=
              1;


            if (
              x < x1
            ) {
              x1 =
                x;
            }


            if (
              x > x2
            ) {
              x2 =
                x;
            }


            if (
              y < y1
            ) {
              y1 =
                y;
            }


            if (
              y > y2
            ) {
              y2 =
                y;
            }

          }

        }

      }


      /* 감지가 불안정하면 기존 기본값 유지 */

      if (
        count < 200 ||
        x2 <= x1 ||
        y2 <= y1
      ) {
        return;
      }


      const scaleX =
        video.videoWidth /
        W;

      const scaleY =
        video.videoHeight /
        H;


      SRC.w =
        video.videoWidth;

      SRC.h =
        video.videoHeight;


      SRC.x1 =
        x1 *
        scaleX;

      SRC.x2 =
        x2 *
        scaleX;


      SRC.y1 =
        y1 *
        scaleY;

      SRC.y2 =
        y2 *
        scaleY;

    }

    catch (
      error
    ) {

      /*
       canvas 보안 제한,
       file:// 환경 등의 경우
       기존 SRC 값을 그대로 사용.
      */

    }

  }


  /* =====================================================
     VIDEO → STILL LOGO
  ===================================================== */

  function toStill(
    animate
  ) {

    if (
      hero.classList.contains(
        "is-ended"
      )
    ) {
      return;
    }


    logo.style.transition =
      "none";

    logo.style.transform =
      "none";


    if (
      animate
    ) {

      calibrate();


      const logoRect =
        logo.getBoundingClientRect();

      const heroRect =
        hero.getBoundingClientRect();


      /*
       video object-fit: cover와 동일한 비율 계산
      */

      const coverScale =
        Math.max(
          heroRect.width /
          SRC.w,

          heroRect.height /
          SRC.h
        );


      /*
       cover로 잘린 영상의 시작 위치
      */

      const offsetX =
        (
          heroRect.width -
          SRC.w *
          coverScale
        ) /
        2;


      const offsetY =
        (
          heroRect.height -
          SRC.h *
          coverScale
        ) /
        2;


      /*
       영상 마지막 프레임에서
       로고의 실제 화면 너비
      */

      const videoLogoWidth =
        (
          SRC.x2 -
          SRC.x1
        ) *
        coverScale;


      /*
       영상 속 로고 중심 좌표
      */

      const videoLogoCenterX =
        heroRect.left +
        offsetX +
        (
          SRC.x1 +
          SRC.x2
        ) /
        2 *
        coverScale;


      const videoLogoCenterY =
        heroRect.top +
        offsetY +
        (
          SRC.y1 +
          SRC.y2
        ) /
        2 *
        coverScale;


      /*
       최종 정지 이미지 로고 중심
      */

      const stillLogoCenterX =
        logoRect.left +
        logoRect.width /
        2;


      const stillLogoCenterY =
        logoRect.top +
        logoRect.height /
        2;


      /*
       영상 마지막 프레임의 로고와
       정지 이미지 로고 위치 차이
      */

      const moveX =
        videoLogoCenterX -
        stillLogoCenterX;


      const moveY =
        videoLogoCenterY -
        stillLogoCenterY;


      /*
       영상 속 로고 크기에 맞춰
       정지 이미지 로고를 먼저 확대
      */

      const logoScale =
        videoLogoWidth /
        logoRect.width;


      logo.style.transform =
        `
          translate(
            ${moveX}px,
            ${moveY}px
          )
          scale(
            ${logoScale}
          )
        `;


      /*
       브라우저에게 시작 위치를
       강제로 계산시켜 transition 실행
      */

      logo.getBoundingClientRect();


      /*
       영상 마지막 프레임 위치 →
       중앙 최종 로고 위치
      */

      logo.style.transition =
        "transform 1.6s cubic-bezier(.65,0,.25,1) .15s";


      logo.style.transform =
        "none";

    }


    hero.classList.add(
      "is-ended"
    );

  }


  /* =====================================================
     VIDEO EVENTS
  ===================================================== */

  video.addEventListener(
    "ended",
    () => {
      toStill(
        true
      );
    }
  );


  video.addEventListener(
    "error",
    () => {
      toStill(
        false
      );
    }
  );


  /* =====================================================
     INITIAL PLAY
  ===================================================== */

  const playPromise =
    video.play();


  if (
    playPromise &&
    typeof playPromise.catch ===
    "function"
  ) {

    playPromise.catch(
      () => {
        toStill(
          false
        );
      }
    );

  }


  /* =====================================================
     REDUCED MOTION
  ===================================================== */

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {

    video.pause();

    toStill(
      false
    );

  }


  /* =====================================================
     REPLAY
  ===================================================== */

  replay.addEventListener(
    "click",
    () => {

      hero.classList.remove(
        "is-ended"
      );


      logo.style.transition =
        "none";

      logo.style.transform =
        "none";


      try {

        video.currentTime =
          0;

      }

      catch (
        error
      ) {
      }


      const replayPromise =
        video.play();


      if (
        replayPromise &&
        typeof replayPromise.catch ===
        "function"
      ) {

        replayPromise.catch(
          () => {
            toStill(
              false
            );
          }
        );

      }

    }
  );

})();


/* =========================================================
   02. HEADER
   ---------------------------------------------------------
   CSS와 함께 동작.

   TOP:
   - 전체 헤더 표시

   SCROLL:
   - body.is-header-hidden
   - 중앙 NAV만 CSS에서 숨김
   - DADEULLIM 로고는 계속 표시

   HOT ZONE / HOVER / FOCUS:
   - body.is-header-peek
   - 중앙 NAV 다시 표시
========================================================= */

(function () {

  const body =
    document.body;

  const header =
    document.querySelector(
      ".site-header"
    );


  if (
    !header
  ) {
    return;
  }


  let pointerY =
    Infinity;

  let insideHeader =
    false;

  let focused =
    false;

  let ticking =
    false;


  const isAtTop =
    () =>
      window.scrollY <=
      24;


  const getHotZone =
    () =>
      Math.max(
        82,
        header.getBoundingClientRect().height +
        18
      );


  function updateHeader() {

    ticking =
      false;


    /*
     페이지 최상단에서는
     헤더 전체 표시
    */

    if (
      isAtTop()
    ) {

      body.classList.remove(
        "is-header-hidden",
        "is-header-peek"
      );

      return;
    }


    /*
     스크롤 상태
    */

    body.classList.add(
      "is-header-hidden"
    );


    /*
     상단 HOT ZONE,
     header hover,
     keyboard focus 시 다시 표시
    */

    const shouldPeek =
      pointerY <=
        getHotZone() ||
      insideHeader ||
      focused;


    body.classList.toggle(
      "is-header-peek",
      shouldPeek
    );

  }


  function requestHeaderUpdate() {

    if (
      ticking
    ) {
      return;
    }


    ticking =
      true;


    window.requestAnimationFrame(
      updateHeader
    );

  }


  /* SCROLL */

  window.addEventListener(
    "scroll",
    requestHeaderUpdate,
    {
      passive:
        true
    }
  );


  /* POINTER HOT ZONE */

  window.addEventListener(
    "mousemove",
    (
      event
    ) => {

      pointerY =
        event.clientY;


      requestHeaderUpdate();

    },
    {
      passive:
        true
    }
  );


  /* 브라우저 밖으로 나간 경우 */

  document.documentElement.addEventListener(
    "mouseleave",
    () => {

      pointerY =
        Infinity;


      requestHeaderUpdate();

    }
  );


  /* HEADER HOVER */

  header.addEventListener(
    "mouseenter",
    () => {

      insideHeader =
        true;


      requestHeaderUpdate();

    }
  );


  header.addEventListener(
    "mouseleave",
    (
      event
    ) => {

      insideHeader =
        false;

      pointerY =
        event.clientY;


      requestHeaderUpdate();

    }
  );


  /* KEYBOARD FOCUS */

  header.addEventListener(
    "focusin",
    () => {

      focused =
        true;


      requestHeaderUpdate();

    }
  );


  header.addEventListener(
    "focusout",
    () => {

      window.setTimeout(
        () => {

          focused =
            header.contains(
              document.activeElement
            );


          requestHeaderUpdate();

        },
        0
      );

    }
  );


  /* RESIZE */

  window.addEventListener(
    "resize",
    requestHeaderUpdate,
    {
      passive:
        true
    }
  );


  updateHeader();

})();


/* =========================================================
   REDUCED MOTION STATE
========================================================= */

const reduceMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


/* =========================================================
   03. REVEAL
   방향별 등장 효과
========================================================= */

const revealElements =
  document.querySelectorAll(
    [
      ".reveal",
      ".reveal-left",
      ".reveal-right",
      ".reveal-scale",
      ".burst",
      ".curtain"
    ].join(",")
  );


if (
  revealElements.length
) {

  /*
   같은 부모 안에 있는 요소들은
   순서대로 약간의 delay 적용
  */

  const revealGroups =
    new Map();


  if (
    reduceMotion
  ) {

    revealElements.forEach(
      (
        element
      ) => {

        element.classList.add(
          "in"
        );

      }
    );

  }

  else {

    /*
     clip-path / curtain 요소 때문에
     threshold는 0을 사용.
    */

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


              entry.target.classList.add(
                "in"
              );


              revealObserver.unobserve(
                entry.target
              );

            }
          );

        },
        {
          threshold:
            0,

          rootMargin:
            "0px 0px -8% 0px"
        }
      );


    revealElements.forEach(
      (
        element
      ) => {

        const parent =
          element.parentElement;


        const index =
          revealGroups.get(
            parent
          ) ||
          0;


        revealGroups.set(
          parent,
          index + 1
        );


        element.style.transitionDelay =
          `${Math.min(index, 5) * 130}ms`;


        revealObserver.observe(
          element
        );

      }
    );

  }

}


/* =========================================================
   04. WAVE VIDEO
   화면에 들어왔을 때만 재생
========================================================= */

(function () {

  const videos =
    Array.from(
      document.querySelectorAll(
        ".step video"
      )
    );


  if (
    !videos.length
  ) {
    return;
  }


  if (
    reduceMotion
  ) {

    videos.forEach(
      (
        video
      ) => {

        video.pause();

      }
    );


    return;
  }


  const videoObserver =
    new IntersectionObserver(
      (
        entries
      ) => {

        entries.forEach(
          (
            entry
          ) => {

            const currentVideo =
              entry.target;


            if (
              entry.isIntersecting
            ) {

              const promise =
                currentVideo.play();


              if (
                promise &&
                typeof promise.catch ===
                "function"
              ) {

                promise.catch(
                  () => {
                  }
                );

              }

            }

            else {

              currentVideo.pause();

            }

          }
        );

      },
      {
        threshold:
          0.2
      }
    );


  videos.forEach(
    (
      video
    ) => {

      videoObserver.observe(
        video
      );

    }
  );

})();


/* =========================================================
   05. CONSTRUCTION SPECS
   숫자 카운트업
========================================================= */

const specsElement =
  document.querySelector(
    ".specs"
  );


if (
  specsElement &&
  !reduceMotion
) {

  const specsObserver =
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
              .querySelectorAll(
                "b[data-count]"
              )
              .forEach(
                (
                  numberElement
                ) => {

                  const target =
                    parseFloat(
                      numberElement.dataset.count
                    );


                  const decimals =
                    Number(
                      numberElement.dataset.decimals
                    ) ||
                    0;


                  const suffix =
                    numberElement.dataset.suffix ||
                    "";


                  const duration =
                    1100;


                  let startTime =
                    null;


                  function animateNumber(
                    timestamp
                  ) {

                    if (
                      !startTime
                    ) {

                      startTime =
                        timestamp;

                    }


                    const progress =
                      Math.min(
                        (
                          timestamp -
                          startTime
                        ) /
                        duration,
                        1
                      );


                    const eased =
                      1 -
                      Math.pow(
                        1 -
                        progress,
                        3
                      );


                    numberElement.textContent =
                      (
                        target *
                        eased
                      ).toFixed(
                        decimals
                      ) +
                      suffix;


                    if (
                      progress <
                      1
                    ) {

                      window.requestAnimationFrame(
                        animateNumber
                      );

                    }

                  }


                  numberElement.textContent =
                    decimals
                      ?
                      `0.${"0".repeat(decimals)}${suffix}`
                      :
                      `0${suffix}`;


                  window.requestAnimationFrame(
                    animateNumber
                  );

                }
              );


            specsObserver.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold:
          0.4
      }
    );


  specsObserver.observe(
    specsElement
  );

}


/* =========================================================
   06. COLOR COPY
   HEX 클릭 → 클립보드 복사
========================================================= */

const toast =
  document.getElementById(
    "toast"
  );


document
  .querySelectorAll(
    ".color-block"
  )
  .forEach(
    (
      swatch
    ) => {

      swatch.addEventListener(
        "click",
        async () => {

          const hex =
            swatch.dataset.hex;


          if (
            !hex
          ) {
            return;
          }


          try {

            await navigator.clipboard.writeText(
              hex
            );

          }

          catch (
            error
          ) {

            /*
             file:// 또는 권한 제한 환경에서는
             clipboard API가 실패할 수 있음.
            */

          }


          if (
            !toast
          ) {
            return;
          }


          toast.textContent =
            `${hex} 복사됨`;


          toast.classList.add(
            "show"
          );


          window.clearTimeout(
            toast.hideTimer
          );


          toast.hideTimer =
            window.setTimeout(
              () => {

                toast.classList.remove(
                  "show"
                );

              },
              1400
            );

        }
      );

    }
  );