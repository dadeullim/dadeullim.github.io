document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  if (!body.classList.contains("experience-page")) return;

  body.classList.add("has-experience-js");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const header = document.querySelector(".site-header");

  if (header) {
    const TOP_VISIBLE_THRESHOLD = 24;
    const DEFAULT_HOT_ZONE = 82;
    const HOT_ZONE_EXTRA = 18;

    let pointerY = Infinity;
    let pointerInsideHeader = false;
    let headerFocused = false;
    let headerTicking = false;

    const getHeaderHotZoneHeight = () => {
      const headerHeight = header.getBoundingClientRect().height;
      return Math.max(DEFAULT_HOT_ZONE, headerHeight + HOT_ZONE_EXTRA);
    };

    const isHeaderAtTop = () =>
      window.scrollY <= TOP_VISIBLE_THRESHOLD;

    const isPointerInHeaderHotZone = () =>
      pointerY <= getHeaderHotZoneHeight();

    const updateHeaderScrolledClass = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 35);
    };

    const showHeader = (usePeek = false) => {
      body.classList.remove("is-header-hidden");
      body.classList.toggle("is-header-peek", usePeek);
    };

    const hideHeader = () => {
      if (isHeaderAtTop()) {
        showHeader(false);
        return;
      }
      body.classList.add("is-header-hidden");
      body.classList.remove("is-header-peek");
    };

    const updateHeaderState = () => {
      headerTicking = false;
      updateHeaderScrolledClass();

      if (isHeaderAtTop()) {
        showHeader(false);
        return;
      }

      if (
        isPointerInHeaderHotZone() ||
        pointerInsideHeader ||
        headerFocused
      ) {
        body.classList.add("is-header-hidden");
        body.classList.add("is-header-peek");
        return;
      }

      hideHeader();
    };

    const requestHeaderUpdate = () => {
      if (headerTicking) return;
      headerTicking = true;
      window.requestAnimationFrame(updateHeaderState);
    };

    window.addEventListener("scroll", requestHeaderUpdate, {
      passive: true,
    });

    window.addEventListener(
      "mousemove",
      (event) => {
        pointerY = event.clientY;
        requestHeaderUpdate();
      },
      { passive: true }
    );

    document.documentElement.addEventListener("mouseleave", () => {
      pointerY = Infinity;
      requestHeaderUpdate();
    });

    header.addEventListener("mouseenter", () => {
      pointerInsideHeader = true;
      if (!isHeaderAtTop()) {
        body.classList.add("is-header-hidden");
        body.classList.add("is-header-peek");
      }
    });

    header.addEventListener("mouseleave", (event) => {
      pointerInsideHeader = false;
      pointerY = event.clientY;
      requestHeaderUpdate();
    });

    header.addEventListener("focusin", () => {
      headerFocused = true;
      if (!isHeaderAtTop()) {
        body.classList.add("is-header-hidden");
        body.classList.add("is-header-peek");
      }
    });

    header.addEventListener("focusout", () => {
      window.setTimeout(() => {
        headerFocused = header.contains(document.activeElement);
        requestHeaderUpdate();
      }, 0);
    });

    window.addEventListener("resize", requestHeaderUpdate, {
      passive: true,
    });
    window.addEventListener("pageshow", requestHeaderUpdate);
    updateHeaderState();
  }

  if (body.classList.contains("driving-page")) {
    initDrivingPage();
  }

  if (body.classList.contains("safety-page")) {
    initSafetyPage();
  }

  function initDrivingPage() {
    const revealItems = document.querySelectorAll(
      "[data-driving-reveal]"
    );
    const solutionCards = document.querySelectorAll(
      "[data-driving-card]"
    );
    const solutionVisual = document.querySelector(
      "[data-driving-mosaic]"
    );
    const connectionText = document.querySelector(
      ".driving-connection__text"
    );
    const heroVisual =
      document.querySelector("[data-driving-liquid]") ||
      document.querySelector(".driving-hero__visual");
    const heroImage = document.querySelector(
      ".driving-hero__image"
    );

    solutionCards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 80}ms`;
    });

    if ("IntersectionObserver" in window && !reduceMotion) {
      const observer = new IntersectionObserver(
        (entries, revealObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -5% 0px",
        }
      );

      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) =>
        item.classList.add("is-visible")
      );
    }

    // 이전 버전의 단일 이미지 물결 히어로
    const initDrivingReferenceWater = async () => {
      if (!heroVisual || !heroImage || reduceMotion || !canHover) {
        return;
      }

      const oldLiquidLayer = heroVisual.querySelector(
        "[data-driving-liquid-layer]"
      );
      const oldLiquidSvg = heroVisual.querySelector(
        ".driving-hero__liquid-svg"
      );

      if (oldLiquidLayer) {
        oldLiquidLayer.style.display = "none";
      }
      if (oldLiquidSvg) {
        oldLiquidSvg.style.display = "none";
      }

      if (!heroImage.complete || !heroImage.naturalWidth) {
        await new Promise((resolve) => {
          const done = () => resolve();
          heroImage.addEventListener("load", done, { once: true });
          heroImage.addEventListener("error", done, { once: true });
        });
      }

      if (!heroImage.naturalWidth || !heroImage.naturalHeight) {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.className = "driving-hero__water-canvas";
      canvas.setAttribute("aria-hidden", "true");

      Object.assign(canvas.style, {
        position: "absolute",
        inset: "0",
        zIndex: "3",
        display: "block",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      });

      heroVisual.appendChild(canvas);

      const sourceCanvas = document.createElement("canvas");
      const sourceContext = sourceCanvas.getContext("2d", {
        alpha: false,
      });

      if (!sourceContext) {
        canvas.remove();
        return;
      }

      const gl = canvas.getContext("webgl2", {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      });

      if (!gl) {
        canvas.remove();
        return;
      }

      gl.getExtension("EXT_color_buffer_float");
      gl.getExtension("EXT_color_buffer_half_float");
      gl.getExtension("OES_texture_float_linear");

      const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

      const SIM = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_prev;
uniform vec2 u_texel;
uniform vec2 u_aspect;
uniform vec2 u_mouse;
uniform vec2 u_mousePrev;
uniform float u_strength;
uniform float u_radius;
uniform float u_damping;

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 s = texture(u_prev, v_uv).rg;
  float p = s.r;
  float v = s.g;

  float l = texture(u_prev, v_uv - vec2(u_texel.x, 0.0)).r;
  float r = texture(u_prev, v_uv + vec2(u_texel.x, 0.0)).r;
  float d = texture(u_prev, v_uv - vec2(0.0, u_texel.y)).r;
  float u = texture(u_prev, v_uv + vec2(0.0, u_texel.y)).r;

  v += (l + r + u + d - 4.0 * p) * 0.20;
  v *= 0.995;
  p += v;
  p *= u_damping;

  float dist = segDist(
    v_uv * u_aspect,
    u_mousePrev * u_aspect,
    u_mouse * u_aspect
  );

  p += u_strength * exp(
    -(dist * dist) / (u_radius * u_radius)
  );

  outColor = vec4(p, v, 0.0, 1.0);
}`;

      const DISPLAY = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_sim;
uniform sampler2D u_src;
uniform vec2 u_texel;
uniform float u_refract;

void main() {
  float l = texture(u_sim, v_uv - vec2(u_texel.x, 0.0)).r;
  float r = texture(u_sim, v_uv + vec2(u_texel.x, 0.0)).r;
  float d = texture(u_sim, v_uv - vec2(0.0, u_texel.y)).r;
  float u = texture(u_sim, v_uv + vec2(0.0, u_texel.y)).r;
  float p = texture(u_sim, v_uv).r;

  vec3 normal = normalize(
    vec3(-(r - l), -(u - d), 0.12)
  );
  vec2 offset = normal.xy * u_refract;

  vec3 col;
  col.r = texture(u_src, v_uv + offset * 1.000).r;
  col.g = texture(u_src, v_uv + offset * 0.978).g;
  col.b = texture(u_src, v_uv + offset * 0.956).b;

  vec3 lightDir = normalize(vec3(-0.55, 0.75, 0.55));
  float spec = pow(max(dot(normal, lightDir), 0.0), 48.0);

  col += spec * vec3(0.55, 0.72, 0.95);
  col += p * 0.06;

  outColor = vec4(col, 1.0);
}`;

      const compileShader = (type, source) => {
        const shader = gl.createShader(type);
        if (!shader) {
          throw new Error("Water shader creation failed.");
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const message =
            gl.getShaderInfoLog(shader) || "Unknown shader error";
          gl.deleteShader(shader);
          throw new Error(message);
        }

        return shader;
      };

      const createProgram = (vertexSource, fragmentSource) => {
        const program = gl.createProgram();
        if (!program) {
          throw new Error("Water program creation failed.");
        }

        const vertexShader = compileShader(
          gl.VERTEX_SHADER,
          vertexSource
        );
        const fragmentShader = compileShader(
          gl.FRAGMENT_SHADER,
          fragmentSource
        );

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.bindAttribLocation(program, 0, "a_pos");
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          const message =
            gl.getProgramInfoLog(program) ||
            "Unknown program link error";
          gl.deleteProgram(program);
          throw new Error(message);
        }

        return program;
      };

      let simProgram;
      let displayProgram;

      try {
        simProgram = createProgram(VERT, SIM);
        displayProgram = createProgram(VERT, DISPLAY);
      } catch (error) {
        console.warn("DADEULLIM water ripple shader error:", error);
        canvas.remove();
        return;
      }

      const vao = gl.createVertexArray();
      const buffer = gl.createBuffer();

      if (!vao || !buffer) {
        canvas.remove();
        return;
      }

      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const makeTarget = (width, height) => {
        const texture = gl.createTexture();
        const framebuffer = gl.createFramebuffer();

        if (!texture || !framebuffer) {
          throw new Error("Water render target creation failed.");
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA16F,
          width,
          height,
          0,
          gl.RGBA,
          gl.HALF_FLOAT,
          null
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MAG_FILTER,
          gl.LINEAR
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_S,
          gl.CLAMP_TO_EDGE
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_T,
          gl.CLAMP_TO_EDGE
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          texture,
          0
        );
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return {
          tex: texture,
          fbo: framebuffer,
          w: width,
          h: height,
        };
      };

      const deleteTarget = (target) => {
        if (!target) return;
        gl.deleteTexture(target.tex);
        gl.deleteFramebuffer(target.fbo);
      };

      const sourceTexture = gl.createTexture();
      if (!sourceTexture) {
        canvas.remove();
        return;
      }

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR
      );
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.LINEAR
      );
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
      );
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
      );

      const uSim = {
        prev: gl.getUniformLocation(simProgram, "u_prev"),
        texel: gl.getUniformLocation(simProgram, "u_texel"),
        aspect: gl.getUniformLocation(simProgram, "u_aspect"),
        mouse: gl.getUniformLocation(simProgram, "u_mouse"),
        mousePrev: gl.getUniformLocation(simProgram, "u_mousePrev"),
        strength: gl.getUniformLocation(simProgram, "u_strength"),
        radius: gl.getUniformLocation(simProgram, "u_radius"),
        damping: gl.getUniformLocation(simProgram, "u_damping"),
      };

      const uDisplay = {
        sim: gl.getUniformLocation(displayProgram, "u_sim"),
        src: gl.getUniformLocation(displayProgram, "u_src"),
        texel: gl.getUniformLocation(displayProgram, "u_texel"),
        refract: gl.getUniformLocation(displayProgram, "u_refract"),
      };

      const params = {
        refract: 0.10,
        radius: 0.03,
        damping: 0.995,
      };

      const SUBSTEPS = 2;

      let A = null;
      let B = null;
      let simWidth = 2;
      let simHeight = 2;
      let viewWidth = 2;
      let viewHeight = 2;
      let disposed = false;
      let firstFrameRendered = false;

      const drawHeroSource = (width, height) => {
        sourceCanvas.width = width;
        sourceCanvas.height = height;

        sourceContext.fillStyle = "#ffffff";
        sourceContext.fillRect(0, 0, width, height);

        const imageWidth = heroImage.naturalWidth;
        const imageHeight = heroImage.naturalHeight;
        const scale = Math.max(
          width / imageWidth,
          height / imageHeight
        );
        const drawWidth = imageWidth * scale;
        const drawHeight = imageHeight * scale;
        const drawX = (width - drawWidth) * 0.5;
        const drawY = (height - drawHeight) * 0.5;

        sourceContext.drawImage(
          heroImage,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        );
      };

      const resize = () => {
        if (disposed) return;

        const rect = heroVisual.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        viewWidth = Math.max(1, Math.round(rect.width * dpr));
        viewHeight = Math.max(1, Math.round(rect.height * dpr));

        canvas.width = viewWidth;
        canvas.height = viewHeight;

        drawHeroSource(viewWidth, viewHeight);

        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sourceCanvas
        );

        const scale = Math.min(
          1,
          720 / Math.max(viewWidth, viewHeight)
        );
        simWidth = Math.max(2, Math.round(viewWidth * scale));
        simHeight = Math.max(2, Math.round(viewHeight * scale));

        deleteTarget(A);
        deleteTarget(B);

        A = makeTarget(simWidth, simHeight);
        B = makeTarget(simWidth, simHeight);
      };

      resize();

      const resizeObserver =
        "ResizeObserver" in window
          ? new ResizeObserver(resize)
          : null;

      if (resizeObserver) {
        resizeObserver.observe(heroVisual);
      }

      window.addEventListener("resize", resize, {
        passive: true,
      });

      let mouse = { x: 0.5, y: 0.5 };
      let previousMouse = { x: 0.5, y: 0.5 };
      let pending = 0;
      let inside = false;

      const toUV = (clientX, clientY) => {
        const rect = heroVisual.getBoundingClientRect();
        return {
          x: clamp((clientX - rect.left) / rect.width, 0, 1),
          y: clamp(1.0 - (clientY - rect.top) / rect.height, 0, 1),
        };
      };

      const onMove = (clientX, clientY) => {
        const uv = toUV(clientX, clientY);

        if (!inside) {
          previousMouse = uv;
          inside = true;
        } else {
          previousMouse = mouse;
        }

        mouse = uv;

        const speed = Math.hypot(
          mouse.x - previousMouse.x,
          mouse.y - previousMouse.y
        );

        pending = Math.min(0.16, 0.03 + speed * 2.4);
      };

      const handleMouseMove = (event) => {
        onMove(event.clientX, event.clientY);
      };

      const handleMouseLeave = () => {
        inside = false;
        pending = 0;
      };

      const handlePointerDown = (event) => {
        onMove(event.clientX, event.clientY);
        pending = 0.45;
      };

      heroVisual.addEventListener(
        "mousemove",
        handleMouseMove,
        { passive: true }
      );
      heroVisual.addEventListener(
        "mouseleave",
        handleMouseLeave,
        { passive: true }
      );
      heroVisual.addEventListener(
        "pointerdown",
        handlePointerDown,
        { passive: true }
      );

      let animationFrameId = null;

      const frame = () => {
        if (disposed) return;

        animationFrameId = window.requestAnimationFrame(frame);
        if (document.hidden || !A || !B) return;

        for (let i = 0; i < SUBSTEPS; i += 1) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, B.fbo);
          gl.viewport(0, 0, simWidth, simHeight);
          gl.useProgram(simProgram);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, A.tex);

          gl.uniform1i(uSim.prev, 0);
          gl.uniform2f(
            uSim.texel,
            1 / simWidth,
            1 / simHeight
          );
          gl.uniform2f(
            uSim.aspect,
            simWidth / simHeight,
            1
          );
          gl.uniform2f(uSim.mouse, mouse.x, mouse.y);
          gl.uniform2f(
            uSim.mousePrev,
            previousMouse.x,
            previousMouse.y
          );
          gl.uniform1f(
            uSim.strength,
            i === 0 ? pending : 0
          );
          gl.uniform1f(uSim.radius, params.radius);
          gl.uniform1f(uSim.damping, params.damping);
          gl.drawArrays(gl.TRIANGLES, 0, 3);

          const swap = A;
          A = B;
          B = swap;
        }

        pending *= 0.5;
        if (pending < 0.0005) {
          pending = 0;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, viewWidth, viewHeight);
        gl.useProgram(displayProgram);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, A.tex);
        gl.uniform1i(uDisplay.sim, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
        gl.uniform1i(uDisplay.src, 1);

        gl.uniform2f(
          uDisplay.texel,
          1 / simWidth,
          1 / simHeight
        );
        gl.uniform1f(uDisplay.refract, params.refract);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        if (!firstFrameRendered) {
          firstFrameRendered = true;
          heroImage.style.visibility = "hidden";
        }
      };

      frame();

      const cleanup = () => {
        disposed = true;

        if (animationFrameId !== null) {
          window.cancelAnimationFrame(animationFrameId);
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
        }

        window.removeEventListener("resize", resize);
        heroVisual.removeEventListener(
          "mousemove",
          handleMouseMove
        );
        heroVisual.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );
        heroVisual.removeEventListener(
          "pointerdown",
          handlePointerDown
        );

        deleteTarget(A);
        deleteTarget(B);
        gl.deleteTexture(sourceTexture);
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(simProgram);
        gl.deleteProgram(displayProgram);

        heroImage.style.visibility = "";
        canvas.remove();
      };

      window.addEventListener("pagehide", cleanup, {
        once: true,
      });
    };

    initDrivingReferenceWater();

    if (reduceMotion) return;

    const updateSolutionMotion = () => {
      if (!solutionVisual) return;

      const rect = solutionVisual.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        return;
      }

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distance = viewportCenter - elementCenter;
      const speeds = [0.008, -0.01, 0.009, -0.007];

      solutionCards.forEach((card, index) => {
        const movement = clamp(
          distance * speeds[index],
          -7,
          7
        );
        card.style.translate = `0 ${movement}px`;
      });
    };

    const updateConnectionText = () => {
      if (!connectionText) return;

      const rect = connectionText.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(viewportCenter - elementCenter);
      const range = window.innerHeight * 0.58;
      const progress = 1 - clamp(distance / range, 0, 1);

      connectionText.style.opacity =
        0.55 + progress * 0.45;
    };

    let drivingTicking = false;

    const updateDrivingScroll = () => {
      updateSolutionMotion();
      updateConnectionText();
      drivingTicking = false;
    };

    const handleDrivingScroll = () => {
      if (drivingTicking) return;
      drivingTicking = true;
      window.requestAnimationFrame(updateDrivingScroll);
    };

    window.addEventListener("scroll", handleDrivingScroll, {
      passive: true,
    });

    updateDrivingScroll();
  }

  function initSafetyPage() {
    const safetyRevealItems = document.querySelectorAll(
      "[data-safety-reveal]"
    );

    if ("IntersectionObserver" in window && !reduceMotion) {
      const safetyRevealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -6% 0px",
        }
      );

      safetyRevealItems.forEach((item, index) => {
        if (item.dataset.safetyReveal === "stack-card") {
          item.style.transitionDelay = `${index * 70}ms`;
        }
        safetyRevealObserver.observe(item);
      });
    } else {
      safetyRevealItems.forEach((item) => {
        item.classList.add("is-visible");
      });
    }

    const carousel = document.querySelector(
      "[data-safety-carousel]"
    );
    const cards = Array.from(
      document.querySelectorAll("[data-safety-card]")
    );

    if (carousel && cards.length) {
      initSafetyCarousel(carousel, cards);
    }

    const stackCards = document.querySelectorAll(
      "[data-safety-stack-card]"
    );

    if (canHover && stackCards.length) {
      stackCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
          card.classList.add("is-hovered");
        });
        card.addEventListener("mouseleave", () => {
          card.classList.remove("is-hovered");
        });
      });
    }
  }

  function initSafetyCarousel(carousel, cards) {
    const CENTER_DURATION = 3000;
    const CAPTION_SHOW_DELAY = 250;
    const CAPTION_HIDE_DELAY = 2350;

    const track = carousel.querySelector("[data-safety-track]");
    const captionBox = carousel.querySelector(
      "[data-safety-caption-box]"
    );
    const captionTitle = carousel.querySelector(
      "[data-safety-caption-title]"
    );
    const captionDescription = carousel.querySelector(
      "[data-safety-caption-description]"
    );

    if (!track || !cards.length) return;

    track
      .querySelectorAll(".is-marquee-clone")
      .forEach((clone) => {
        clone.remove();
      });

    const originalCards = Array.from(
      track.querySelectorAll(
        "[data-safety-card]:not(.is-marquee-clone)"
      )
    );

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("is-marquee-clone");
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      track.appendChild(clone);
    });

    const marqueeCards = Array.from(
      track.querySelectorAll("[data-safety-card]")
    );

    let centerTimer = null;
    let captionShowTimer = null;
    let captionHideTimer = null;
    let focusCard = null;
    let isFocused = false;

    const pauseMarquee = () => {
      carousel.classList.add("is-paused");
    };

    const resumeMarquee = () => {
      if (isFocused || document.hidden || reduceMotion) return;
      carousel.classList.remove("is-paused");
    };

    const hideCaption = () => {
      if (!captionBox) return;
      captionBox.classList.remove("is-visible");
      captionBox.setAttribute("aria-hidden", "true");
    };

    const showCaption = (selectedCard) => {
      if (
        !captionBox ||
        !captionTitle ||
        !captionDescription
      ) {
        return;
      }

      captionTitle.textContent =
        selectedCard.dataset.safetyTitle || "";
      captionDescription.textContent =
        selectedCard.dataset.safetyCaption || "";

      captionBox.setAttribute("aria-hidden", "false");
      captionBox.classList.add("is-visible");
    };

    const clearTimers = () => {
      if (centerTimer !== null) {
        window.clearTimeout(centerTimer);
        centerTimer = null;
      }
      if (captionShowTimer !== null) {
        window.clearTimeout(captionShowTimer);
        captionShowTimer = null;
      }
      if (captionHideTimer !== null) {
        window.clearTimeout(captionHideTimer);
        captionHideTimer = null;
      }
    };

    const hideCenterCard = () => {
      clearTimers();
      hideCaption();

      if (!focusCard) {
        carousel.classList.remove("has-centered-card");
        isFocused = false;
        resumeMarquee();
        return;
      }

      focusCard.classList.remove("is-visible");
      const cardToRemove = focusCard;
      focusCard = null;

      window.setTimeout(() => {
        cardToRemove.remove();
        carousel.classList.remove("has-centered-card");
        isFocused = false;
        resumeMarquee();
      }, 650);
    };

    const showCenterCard = (selectedCard) => {
      if (isFocused) return;

      isFocused = true;
      clearTimers();
      hideCaption();
      pauseMarquee();
      carousel.classList.add("has-centered-card");

      focusCard = selectedCard.cloneNode(true);
      focusCard.classList.remove("safety-carousel__card");
      focusCard.classList.remove("is-marquee-clone");
      focusCard.classList.add("safety-carousel__focus-card");
      focusCard.removeAttribute("data-safety-card");
      focusCard.removeAttribute("data-position");
      focusCard.removeAttribute("aria-hidden");
      focusCard.tabIndex = -1;
      carousel.appendChild(focusCard);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (focusCard) {
            focusCard.classList.add("is-visible");
          }
        });
      });

      captionShowTimer = window.setTimeout(() => {
        showCaption(selectedCard);
      }, CAPTION_SHOW_DELAY);

      captionHideTimer = window.setTimeout(() => {
        hideCaption();
      }, CAPTION_HIDE_DELAY);

      centerTimer = window.setTimeout(() => {
        hideCenterCard();
      }, CENTER_DURATION);
    };

    marqueeCards.forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
        showCenterCard(card);
      });
    });

    originalCards.forEach((card) => {
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showCenterCard(card);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isFocused) {
        hideCenterCard();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        pauseMarquee();
        return;
      }
      resumeMarquee();
    });

    if (captionBox) {
      captionBox.setAttribute("aria-hidden", "true");
    }

    if (reduceMotion) {
      pauseMarquee();
    } else {
      resumeMarquee();
    }
  }
});

/* =========================================================
   DRIVING ONE MOMENT — “사이렌 한 번, 세 개의 감각이 동시에.”
   2026.10.07 추가 (123.zip drive-moment.js 정리)
   ---------------------------------------------------------
   화면이 고정된 동안 스크롤하면 재생선이 지나가며
   소리 입력 → 판단 → HUD → 핸들 → 디스플레이 트랙이 차례로 켜지고,
   오른쪽 실내 사진의 해당 부위(HUD · 핸들 · 디스플레이)가 빛남.

   원본은 GSAP ScrollTrigger 사용 → 이 페이지는 GSAP을 쓰지 않아서
   원본에 있던 스크롤 이벤트 방식으로 동작 (보이는 결과는 같음)
   스타일 : experience.css 맨 아래 [DRIVING ONE MOMENT]
========================================================= */

(() => {
  "use strict";

  const root = document.querySelector(".dp-a1");
  if (!root) return;

  const $ = (selector, el = root) => el.querySelector(selector);
  const $$ = (selector, el = root) =>
    Array.from(el.querySelectorAll(selector));
  const clamp = (value, min = 0, max = 1) =>
    Math.max(min, Math.min(max, value));


  /* ---------------------------------------------------------
     01. 요소
  --------------------------------------------------------- */

  const trackEl = $(".dp-a1__track");
  const rows = $$(".dp-a1__row");
  const head = $(".dp-a1__head");
  const lane = $(".dp-a1__lane");
  const hots = $$(".dp-hot");

  if (!trackEl || !rows.length) return;


  /* ---------------------------------------------------------
     02. 트랙마다 켜지는 시점 (0 ~ 1)
     소리 입력 / 판단 / HUD / 핸들 / 디스플레이
  --------------------------------------------------------- */

  const START = [0, 0.16, 0.34, 0.46, 0.6];


  /* ---------------------------------------------------------
     03. 진행도(p)에 맞춰 화면 갱신
  --------------------------------------------------------- */

  const render = (p) => {
    /* 앞뒤 여유 구간을 뺀 실제 재생 진행도 */
    const q = clamp((p - 0.05) / 0.85);

    /* 재생선 위치 */
    if (lane && head) {
      head.style.left =
        lane.offsetLeft + lane.offsetWidth * q + "px";
    }

    const active = [];

    /* 트랙 막대 채우기 + 켜짐 표시 */
    rows.forEach((row, index) => {
      const bar = $(".dp-a1__bar", row);
      const start = START[index];
      const fill = clamp((q - start) / (1 - start));

      bar.style.left = start * 100 + "%";
      bar.style.width = fill * (1 - start) * 100 + "%";

      const on = q > start;
      row.classList.toggle("on", on);

      if (on) active.push(row.dataset.k);
    });

    /* 켜진 감각에 맞춰 사진 위 표시 */
    hots.forEach((hot) => {
      hot.classList.toggle("on", active.includes(hot.dataset.k));
    });
  };


  /* ---------------------------------------------------------
     04. 스크롤 → 진행도
     (requestAnimationFrame 으로 한 프레임에 한 번만 계산)
  --------------------------------------------------------- */

  let ticking = false;

  const update = () => {
    ticking = false;

    const rect = trackEl.getBoundingClientRect();
    const distance = Math.max(1, rect.height - window.innerHeight);

    render(clamp(-rect.top / distance));
  };

  const requestUpdate = () => {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);

  update();
})();


/* =========================================================
   SAFETY HERO — 글자 속 이미지 / 2026.10.10
   ---------------------------------------------------------
   스크롤 진행값을 CSS 변수로 넣어 줌
   --p : 섹션을 얼마나 내렸는지 0 → 1
   --k : 사진이 열리는 정도 0 → 1 (p 의 앞 60% 동안 다 열림)
   스타일 : experience.css 맨 아래 [SAFETY HERO — 글자 속 이미지]
   (안전히어로4_코드.zip safety-hero4.js → 따로 파일 만들지 않고 experience.js 로 정리)
   2026.10.10 : '글자 영역에서 차오름 → 넓어짐' 전환 시도 후 되돌림 (원래 열림 모션 유지)
========================================================= */

(() => {

  const hero =
    document.querySelector("[data-sh4]");

  if (!hero) {
    return;
  }


  const clamp = (v, a = 0, b = 1) =>
    Math.min(b, Math.max(a, v));

  let ticking =
    false;


  function update() {

    ticking =
      false;

    const r =
      hero.getBoundingClientRect();

    /* 섹션을 얼마나 내렸는지 0 → 1 */
    const p =
      clamp(-r.top / (r.height - innerHeight));

    hero.style.setProperty(
      "--p",
      p.toFixed(4)
    );

    /* 앞 60% 동안 사진이 다 열림 (숫자 클수록 빨리) */
    hero.style.setProperty(
      "--k",
      clamp(p * 1.6).toFixed(4)
    );

  }


  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  addEventListener("resize", update);

  update();

})();
