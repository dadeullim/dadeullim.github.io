/* =========================================================
INDEX REFRESH → ALWAYS FIRST SCREEN
---------------------------------------------------------
- INDEX에서 새로고침한 경우에만 실행
- 다른 페이지에는 영향 없음
- 브라우저의 스크롤 위치 복원 방지
- 새로고침 URL에 #hash가 남아 있어도 제거
========================================================= */
(function setupIndexRefreshReset() {
const path =
window.location.pathname
.toLowerCase();
const isIndexPage =
path.endsWith("/") ||
path.endsWith("/index.html") ||
path.endsWith("index.html");
if (
!isIndexPage
) {
return;
}
if (
"scrollRestoration"
in window.history
) {
window.history.scrollRestoration =
"manual";
}
const navigationEntry =
typeof performance.getEntriesByType ===
"function"
? performance
.getEntriesByType("navigation")[0]
: null;
const isReload =
navigationEntry
? navigationEntry.type ===
"reload"
: (
performance.navigation &&
performance.navigation.type ===
1
);
if (
!isReload
) {
return;
}
if (
window.location.hash
) {
window.history.replaceState(
null,
"",
`${window.location.pathname}${window.location.search}`
);
}
function forceTop() {
window.scrollTo(
{
top: 0,
left: 0,
behavior: "auto",
}
);
}
forceTop();
if (
document.readyState ===
"loading"
) {
document.addEventListener(
"DOMContentLoaded",
forceTop,
{
once: true,
}
);
}
window.addEventListener(
"load",
() => {
forceTop();
window.requestAnimationFrame(
forceTop
);
},
{
once: true,
}
);
})();

/* =========================================================
DADEULLIM PROPORTIONAL VIEWPORT VERSION
========================================================= */

/* =========================================================
[요소] HTML 연결
========================================================= */
const DOM = {
body: document.body,

experience:
document.querySelector("#experience"),

bridgeTransition:
document.querySelector("#bridge-transition"),

canvas:
document.querySelector("#visual-canvas"),

fallbackImages: [
...document.querySelectorAll(
".visual-fallback__image"
),
],

copySlides: [
...document.querySelectorAll(
".copy-slide"
),
],

progressBar:
document.querySelector(
"#scroll-progress-bar"
),

sceneCurrent:
document.querySelector(
"#scene-current"
),

sceneLinks: [
...document.querySelectorAll(
"[data-scene-link]"
),
],
};

/* =========================================================
[설정] 이미지 중심
========================================================= */
const IMAGE_FOCUS = [
{
x: 0.5,
y: 0.5,
},
{
x: 0.5,
y: 0.5,
},
{
x: 0.5,
y: 0.5,
},
];

/* =========================================================
[설정] 전환 구간
========================================================= */
const TRANSITION = {
firstStart: 0.035,
firstEnd: 0.365,

secondStart: 0.435,
secondEnd: 0.785,
};

/* =========================================================
[설정] 글씨 교체
========================================================= */
const TEXT_CHANGE = {
secondScene: 0.375,
thirdScene: 0.795,
};

/* =========================================================
[설정] 메뉴 이동
========================================================= */
const SCENE_STOPS = [
0,
0.395,
0.82,
];

/* =========================================================
[설정] 히어로 휠 이동
========================================================= */
const HERO_WHEEL = {
threshold: 18,
resetDelay: 140,
transitionDuration: 1650,
bridgeDuration: 980,
unlockDelay: 100,
};

const HERO_WHEEL_STOPS = [
SCENE_STOPS[0],
SCENE_STOPS[1],
SCENE_STOPS[2],
];

/* =========================================================
[화면 비율] 기준 디자인 좌표계
========================================================= */
const DESIGN_LAYOUT = {
width: 1024,
height: 665,

mobileBreakpoint: 700,

/*
 * 2026.10.07 수정 : 0.25 → 0.31
 * 전환 섹션 사진 카드가 좁아 보여서 가로만 살짝 넓힘
 * (히어로 → 카드 축소 전환도 이 값을 같이 사용)
 */
bridgeCardWidthRatio: 0.31,
bridgeCardHeightRatio: 0.64,

bridgeCardRadius: 9,

heroCopyTravel: 105,
};

function getDesignViewportMetrics() {
const viewportWidth =
Math.max(
1,
window.innerWidth
);

const viewportHeight =
Math.max(
1,
window.innerHeight
);

const designRatio =
DESIGN_LAYOUT.width /
DESIGN_LAYOUT.height;

const viewportRatio =
viewportWidth /
viewportHeight;

let width;
let height;
let left;
let top;

if (
viewportRatio >
designRatio
) {
height =
viewportHeight;

width =
height *
designRatio;

left =
(
viewportWidth -
width
) *
0.5;

top = 0;
}
else {
width =
viewportWidth;

height =
width /
designRatio;

left = 0;

top =
(
viewportHeight -
height
) *
0.5;
}

const scale =
width /
DESIGN_LAYOUT.width;

return {
viewportWidth,
viewportHeight,
width,
height,
left,
top,
scale,
};
}

function syncDesignViewportVariables() {
const metrics =
getDesignViewportMetrics();

const root =
document.documentElement;

root.style.setProperty(
"--design-safe-width",
`${metrics.width}px`
);

root.style.setProperty(
"--design-safe-height",
`${metrics.height}px`
);

root.style.setProperty(
"--design-safe-left",
`${metrics.left}px`
);

root.style.setProperty(
"--design-safe-top",
`${metrics.top}px`
);

root.style.setProperty(
"--design-scale",
String(
metrics.scale
)
);
}

/* =========================================================
[상태]
========================================================= */
const APP = {
progress: 0,

sceneIndex: -1,

renderer: null,

scrollFrame: 0,

wheelAccumulation: 0,

wheelLastTime: 0,

wheelLocked: false,

wheelAnimationFrame: 0,

bridgeHandoffActive: false,
};

const prefersReducedMotion =
window.matchMedia(
"(prefers-reduced-motion: reduce)"
).matches;

/* =========================================================
[시작]
========================================================= */
if (
document.readyState ===
"loading"
) {
document.addEventListener(
"DOMContentLoaded",
start,
{
once: true,
}
);
}
else {
start();
}

function start() {
syncDesignViewportVariables();

window.addEventListener(
"resize",
syncDesignViewportVariables,
{
passive: true,
}
);

if (
!DOM.experience ||
!DOM.canvas
) {
console.error(
"#experience 또는 #visual-canvas를 찾지 못했습니다."
);
return;
}

/* HERO 01 글자 분리
   2026.10.08 : 01·02·03 전부 분리 + 02 강조 단어 그라데이션 이어 붙이기 */
splitHeroCopy();

fitHeroEmphasisGradient();

if (document.fonts && document.fonts.ready) {
document.fonts.ready.then(
fitHeroEmphasisGradient
);
}

setupScroll();

setupHeroWheel();

/* 창 크기 변경 후 장면 위치 보정 (2026.10.07 추가) */
setupResizeSnap();

setupSceneLinks();

updateScrollState();

initializeWebGL();
}

/* =========================================================
[이미지] 준비
========================================================= */
async function initializeWebGL() {
if (
DOM.fallbackImages.length <
3
) {
console.warn(
"images/01.jpg, 02.jpg, 03.jpg를 확인해주세요."
);
return;
}

try {
const images =
await Promise.all(
DOM.fallbackImages.map(
waitForImage
)
);

APP.renderer =
createWebGLRenderer(
images
);

APP.renderer.setStage(
progressToStage(
APP.progress
),
true
);

DOM.body.classList.add(
"webgl-ready"
);
}
catch (error) {
DOM.body.classList.remove(
"webgl-ready"
);

console.warn(
"WebGL 실행 오류:",
error
);
}
}

/* =========================================================
[이미지] 로딩 확인
========================================================= */
function waitForImage(image) {
return new Promise(
(
resolve,
reject
) => {

if (
image.complete &&
image.naturalWidth >
0
) {
if (
typeof image.decode ===
"function"
) {
image
.decode()
.catch(
() => {}
)
.finally(
() => {
resolve(image);
}
);
}
else {
resolve(image);
}

return;
}

image.addEventListener(
"load",
() => {
resolve(image);
},
{
once: true,
}
);

image.addEventListener(
"error",
() => {
reject(
new Error(
`이미지 로딩 실패: ${image.src}`
)
);
},
{
once: true,
}
);
}
);
}

/* =========================================================
[스크롤] 연결
========================================================= */
function setupScroll() {
const requestUpdate =
() => {

if (
APP.scrollFrame
) {
return;
}

APP.scrollFrame =
window.requestAnimationFrame(
updateScrollState
);
};

window.addEventListener(
"scroll",
requestUpdate,
{
passive: true,
}
);

window.addEventListener(
"resize",
requestUpdate,
{
passive: true,
}
);
}

/* =========================================================
[리사이즈] 창 크기 변경 후 장면 위치 보정 — 2026.10.07 추가
---------------------------------------------------------
문제 :
- 창 크기를 바꾸면 HERO 스크롤 길이가 바뀌는데
  스크롤 위치는 그대로라서 진행도가 장면 "중간" 값이 됨
  → 사진이 전환 중간(세로 줄 효과)에서 멈추고 글씨가 겹침

해결 :
- 크기 변경 직전의 진행도를 기억
- 크기 변경이 끝나면(150ms) 가장 가까운 장면 정지점으로 다시 이동
- 모바일 주소창이 생기고 사라질 때(세로만 변경)는 무시
========================================================= */
function setupResizeSnap() {
let lastWidth =
window.innerWidth;

let savedProgress =
null;

let resizeTimer =
0;

window.addEventListener(
"resize",
() => {
/* 가로 폭이 그대로면 무시 (모바일 주소창) */
if (
window.innerWidth ===
lastWidth
) {
return;
}

/*
 * 크기 변경이 시작될 때 한 번만 저장
 * (이 시점의 APP.progress는 아직 변경 전 값)
 */
if (
savedProgress ===
null
) {
savedProgress =
APP.progress;
}

window.clearTimeout(
resizeTimer
);

resizeTimer =
window.setTimeout(
() => {
lastWidth =
window.innerWidth;

snapToNearestScene(
savedProgress
);

savedProgress =
null;
},
150
);
},
{
passive: true,
}
);
}

function snapToNearestScene(progress) {
/* 휠 이동 애니메이션 중이면 그쪽에 맡김 */
if (
APP.wheelLocked ||
progress ===
null
) {
return;
}

const start =
DOM.experience.offsetTop;

const distance =
Math.max(
DOM.experience.offsetHeight -
window.innerHeight,
1
);

/* HERO 구간 밖(아래 섹션)에 있으면 건드리지 않음 */
if (
progress >=
1 ||
window.scrollY >
start +
distance
) {
return;
}

/* 가장 가까운 장면 정지점 */
const target =
HERO_WHEEL_STOPS.reduce(
(nearest, stop) =>
Math.abs(stop - progress) <
Math.abs(nearest - progress)
? stop
: nearest,
HERO_WHEEL_STOPS[0]
);

window.scrollTo(
{
top:
start +
target *
distance,
left: 0,
/* CSS scroll-behavior: smooth 무시하고 바로 이동 */
behavior: "instant",
}
);

updateScrollState();
}

/* =========================================================
[휠] 히어로 장면 이동
========================================================= */
function setupHeroWheel() {
window.addEventListener(
"wheel",
handleHeroWheel,
{
passive: false,
}
);
}

/* =========================================================
[휠] 입력 처리
========================================================= */
function handleHeroWheel(event) {
const start =
DOM.experience.offsetTop;

const distance =
Math.max(
DOM.experience.offsetHeight -
window.innerHeight,
1
);

const end =
start +
distance;

const scrollY =
window.scrollY;

const tolerance =
3;

const delta =
normalizeWheelDelta(
event
);

if (
Math.abs(delta) <
0.01
) {
return;
}

const direction =
delta > 0
? 1
: -1;

if (
DOM.bridgeTransition &&
direction < 0
) {
const bridgeTop =
DOM.bridgeTransition
.getBoundingClientRect()
.top +
window.scrollY;

const bridgeDistance =
Math.max(
DOM.bridgeTransition.offsetHeight -
window.innerHeight,
1
);

const bridgeProgress =
clamp(
(
scrollY -
bridgeTop
) /
bridgeDistance,
0,
1
);

const reverseZoneEnd =
0.20;

if (
scrollY >=
bridgeTop -
tolerance &&

bridgeProgress <=
reverseZoneEnd
) {
event.preventDefault();

if (
APP.wheelLocked
) {
return;
}

const now =
performance.now();

if (
now -
APP.wheelLastTime >
HERO_WHEEL.resetDelay
) {
APP.wheelAccumulation =
0;
}

APP.wheelLastTime =
now;

APP.wheelAccumulation +=
delta;

if (
Math.abs(
APP.wheelAccumulation
) <
HERO_WHEEL.threshold
) {
return;
}

APP.wheelAccumulation =
0;

animateBridgeToHero();

return;
}
}

if (
scrollY <
start -
tolerance ||

scrollY >
end +
tolerance
) {
APP.wheelAccumulation =
0;
return;
}

const progress =
clamp(
(
scrollY -
start
) /
distance,
0,
1
);

if (
direction > 0 &&
progress >= 0.998
) {
APP.wheelAccumulation =
0;
return;
}

if (
direction < 0 &&
progress <= 0.002
) {
APP.wheelAccumulation =
0;
return;
}

event.preventDefault();

if (
APP.wheelLocked
) {
return;
}

const now =
performance.now();

if (
now -
APP.wheelLastTime >
HERO_WHEEL.resetDelay
) {
APP.wheelAccumulation =
0;
}

APP.wheelLastTime =
now;

APP.wheelAccumulation +=
delta;

if (
Math.abs(
APP.wheelAccumulation
) <
HERO_WHEEL.threshold
) {
return;
}

const gestureDirection =
APP.wheelAccumulation >
0
? 1
: -1;

APP.wheelAccumulation =
0;

if (
gestureDirection >
0 &&

progress >=
SCENE_STOPS[2] -
0.02
) {
animateHeroToBridge();
return;
}

const targetProgress =
getNextHeroWheelStop(
progress,
gestureDirection
);

if (
targetProgress ===
null
) {
return;
}

animateHeroWheelTo(
targetProgress
);
}

/* =========================================================
[휠] 입력값 통일
========================================================= */
function normalizeWheelDelta(event) {
let delta =
event.deltaY;

if (
event.deltaMode ===
1
) {
delta *=
16;
}

if (
event.deltaMode ===
2
) {
delta *=
window.innerHeight;
}

return delta;
}

/* =========================================================
[휠] 다음 정지 위치
========================================================= */
function getNextHeroWheelStop(
progress,
direction
) {
const epsilon =
0.012;

if (
direction >
0
) {
for (
let index = 0;
index <
HERO_WHEEL_STOPS.length;
index += 1
) {
const stop =
HERO_WHEEL_STOPS[index];

if (
stop >
progress +
epsilon
) {
return stop;
}
}

return null;
}

for (
let index =
HERO_WHEEL_STOPS.length -
1;

index >= 0;

index -= 1
) {
const stop =
HERO_WHEEL_STOPS[index];

if (
stop <
progress -
epsilon
) {
return stop;
}
}

return null;
}

/* =========================================================
[휠] 히어로 → 전환 섹션
========================================================= */
function animateHeroToBridge() {
if (
!DOM.bridgeTransition
) {
animateHeroWheelTo(
1
);

return;
}

const start =
DOM.experience.offsetTop;

const distance =
Math.max(
DOM.experience.offsetHeight -
window.innerHeight,
1
);

const bridgeTop =
DOM.bridgeTransition
.getBoundingClientRect()
.top +
window.scrollY;

const targetProgress =
(
bridgeTop -
start
) /
distance;

animateHeroWheelTo(
targetProgress,
HERO_WHEEL.bridgeDuration,
false
);
}

/* =========================================================
[휠] 전환 섹션 → 히어로
========================================================= */
function animateBridgeToHero() {
animateHeroWheelTo(
SCENE_STOPS[2],
HERO_WHEEL.bridgeDuration,
false
);
}

/* =========================================================
[휠] 장면 위치로 이동
========================================================= */
function animateHeroWheelTo(
targetProgress,
duration =
HERO_WHEEL.transitionDuration,
syncRenderer =
true
) {
const start =
DOM.experience.offsetTop;

const distance =
Math.max(
DOM.experience.offsetHeight -
window.innerHeight,
1
);

const startY =
window.scrollY;

const targetY =
start +
distance *
targetProgress;

if (
APP.wheelAnimationFrame
) {
window.cancelAnimationFrame(
APP.wheelAnimationFrame
);

APP.wheelAnimationFrame =
0;
}

APP.wheelLocked =
true;

const root =
document.documentElement;

const previousScrollBehavior =
root.style.scrollBehavior;

root.style.scrollBehavior =
"auto";

if (
prefersReducedMotion
) {
window.scrollTo(
0,
targetY
);

root.style.scrollBehavior =
previousScrollBehavior;

window.setTimeout(
() => {
APP.wheelLocked =
false;
},
HERO_WHEEL.unlockDelay
);

return;
}

const startTime =
performance.now();

function move(time) {
const progress =
clamp(
(
time -
startTime
) /
duration,
0,
1
);

const eased =
0.5 -
Math.cos(
progress *
Math.PI
) *
0.5;

const currentY =
startY +
(
targetY -
startY
) *
eased;

window.scrollTo(
0,
currentY
);

const currentProgress =
clamp(
(
currentY -
start
) /
distance,
0,
1
);

if (
APP.renderer &&
syncRenderer
) {
APP.renderer.setStage(
progressToStage(
currentProgress
),
true
);
}

if (
progress <
1
) {
APP.wheelAnimationFrame =
window.requestAnimationFrame(
move
);

return;
}

APP.wheelAnimationFrame =
0;

window.scrollTo(
0,
targetY
);

root.style.scrollBehavior =
previousScrollBehavior;

window.setTimeout(
() => {
APP.wheelLocked =
false;
},
HERO_WHEEL.unlockDelay
);
}

APP.wheelAnimationFrame =
window.requestAnimationFrame(
move
);
}

/* =========================================================
[스크롤] 업데이트
========================================================= */
function updateScrollState() {
APP.scrollFrame =
0;

APP.progress =
getExperienceProgress();

if (
APP.renderer &&
!APP.bridgeHandoffActive
) {
APP.renderer.setStage(
progressToStage(
APP.progress
),
APP.wheelLocked
);
}

setActiveScene(
progressToScene(
APP.progress
)
);

updateHeroCopyMotion(
APP.progress
);

/* HERO 텍스트 등장 동기화 */
syncCopyReveal();

if (
DOM.progressBar
) {
DOM.progressBar.style.transform =
`scaleY(${APP.progress})`;
}
}

/* =========================================================
[글씨] 히어로 세로 이동
========================================================= */
function updateHeroCopyMotion(
progress
) {
if (
prefersReducedMotion ||
DOM.copySlides.length <
3
) {
return;
}

const designMetrics =
getDesignViewportMetrics();

const travel =
window.innerWidth <=
DESIGN_LAYOUT.mobileBreakpoint

? 72

: DESIGN_LAYOUT.heroCopyTravel *
designMetrics.scale;

const states = [
{
y: -travel,
opacity: 0,
},
{
y: -travel,
opacity: 0,
},
{
y: -travel,
opacity: 0,
},
];

if (
progress <=
TRANSITION.firstStart
) {
states[0].y =
0;

states[0].opacity =
1;
}

else if (
progress <
TRANSITION.firstEnd
) {
const transitionProgress =
smootherStep(
mapRange(
progress,
TRANSITION.firstStart,
TRANSITION.firstEnd
)
);

states[0].y =
travel *
transitionProgress;

states[0].opacity =
1 -
transitionProgress;

states[1].y =
-travel *
(
1 -
transitionProgress
);

states[1].opacity =
transitionProgress;
}

else if (
progress <=
TRANSITION.secondStart
) {
states[1].y =
0;

states[1].opacity =
1;
}

else if (
progress <
TRANSITION.secondEnd
) {
const transitionProgress =
smootherStep(
mapRange(
progress,
TRANSITION.secondStart,
TRANSITION.secondEnd
)
);

states[1].y =
travel *
transitionProgress;

states[1].opacity =
1 -
transitionProgress;

states[2].y =
-travel *
(
1 -
transitionProgress
);

states[2].opacity =
transitionProgress;
}

else {
states[2].y =
0;

states[2].opacity =
1;
}

DOM.copySlides.forEach(
(
slide,
index
) => {
const state =
states[index];

const opacity =
clamp(
state.opacity,
0,
1
);

slide.style.translate =
`0 ${state.y.toFixed(2)}px`;

slide.style.opacity =
opacity.toFixed(4);

slide.style.visibility =
opacity >
0.002
? "visible"
: "hidden";

slide.style.transition =
"none";

slide.setAttribute(
"aria-hidden",
String(
opacity <=
0.002
)
);
}
);
}

/* =========================================================
[글씨] 히어로 텍스트 등장 동기화

01 = 신호 정렬
02 = 신호 와이프
03 = 신호 와이프
========================================================= */
function syncCopyReveal() {
/*
 * [인트로] 2026.10.06
 * 인트로 재생 중에는 HERO 문구 등장 보류
 * → 인트로가 끝나면 [인트로] 영역에서 다시 호출
 */
if (
document.documentElement.classList.contains(
"is-intro-active"
)
) {
return;
}

DOM.copySlides.forEach(
(
slide,
index
) => {
const opacity =
parseFloat(
slide.style.opacity ||
"0"
);

if (
isSceneSettled(
index,
APP.progress
)
) {
if (
slide.dataset.revealing ===
"1"
) {
return;
}

slide.dataset.revealing =
"1";

window.requestAnimationFrame(
() => {
window.requestAnimationFrame(
() => {
slide.classList.add(
"is-revealed"
);
}
);
}
);

return;
}

if (
opacity <=
0.001
) {
slide.classList.remove(
"is-revealed"
);

delete slide.dataset.revealing;
}
}
);
}

/* =========================================================
[글씨] 배경 전환 완료 판단
========================================================= */
function isSceneSettled(
index,
progress
) {
if (
index ===
0
) {
return progress <=
TRANSITION.firstStart;
}

if (
index ===
1
) {
return (
progress >=
TRANSITION.firstEnd &&

progress <=
TRANSITION.secondStart
);
}

return progress >=
TRANSITION.secondEnd;
}

/* =========================================================
[글씨] HERO 01 글자 분리
========================================================= */
function splitHeroCopy() {
/* 2026.10.08 : HERO 01만 → HERO 01·02·03 전부 글자 분리
   (02, 03도 01과 같은 '신호 정렬' 효과를 쓰기 위해) */
const words = [
...document.querySelectorAll(
'.copy-slide .w'
),
];

let seed =
7;

const random =
() => {
seed =
(
seed * 1664525 +
1013904223
) %
4294967296;

return seed /
4294967296;
};

words.forEach(
(word) => {
if (
word.querySelector(
".c"
)
) {
return;
}

const text =
word.textContent;

const fragment =
document.createDocumentFragment();

Array.from(text).forEach(
(
character,
index
) => {
const span =
document.createElement(
"span"
);

span.className =
"c";

span.textContent =
character;

span.style.setProperty(
"--ci",
String(index)
);

span.style.setProperty(
"--jy",
(
random() *
2 -
1
).toFixed(3)
);

fragment.appendChild(
span
);
}
);

word.replaceChildren(
fragment
);
}
);
}

/* =========================================================
[글씨] HERO 02 강조 단어 그라데이션 — 2026.10.08
---- 글자를 쪼개면 단어 하나에 걸린 그라데이션(background-clip:text)이
     움직이는 글자에는 안 칠해져서 → 글자마다 같은 그라데이션을 깔고
     단어 안 위치만큼 밀어서 원래처럼 한 줄로 이어지게 함
---- em 단위로 넣어서 화면 크기가 바뀌어도 다시 계산할 필요 없음
========================================================= */
function fitHeroEmphasisGradient() {
document
.querySelectorAll(
".hero02-emphasis"
)
.forEach(
(word) => {
const size =
parseFloat(
getComputedStyle(word).fontSize
) || 1;

const wordWidth =
word.offsetWidth;

if (!wordWidth) {
return;
}

word.style.setProperty(
"--bw",
(wordWidth / size).toFixed(4)
);

word
.querySelectorAll(
".c"
)
.forEach(
(character) => {
character.style.setProperty(
"--bx",
(
(character.offsetLeft - word.offsetLeft) /
size
).toFixed(4)
);
}
);
}
);
}

/* =========================================================
[스크롤] 전체 진행도
========================================================= */
function getExperienceProgress() {
const start =
DOM.experience.offsetTop;

const distance =
Math.max(
DOM.experience.offsetHeight -
window.innerHeight,
1
);

return clamp(
(
window.scrollY -
start
) /
distance,
0,
1
);
}

/* =========================================================
[진행] 이미지 단계
========================================================= */
function progressToStage(progress) {
if (
progress <=
TRANSITION.firstStart
) {
return 0;
}

if (
progress <
TRANSITION.firstEnd
) {
return mapRange(
progress,
TRANSITION.firstStart,
TRANSITION.firstEnd
);
}

if (
progress <=
TRANSITION.secondStart
) {
return 1;
}

if (
progress <
TRANSITION.secondEnd
) {
return (
1 +
mapRange(
progress,
TRANSITION.secondStart,
TRANSITION.secondEnd
)
);
}

return 2;
}

/* =========================================================
[글씨] 장면 계산
========================================================= */
function progressToScene(progress) {
if (
progress <
TEXT_CHANGE.secondScene
) {
return 0;
}

if (
progress <
TEXT_CHANGE.thirdScene
) {
return 1;
}

return 2;
}

/* =========================================================
[글씨] 장면 표시
========================================================= */
function setActiveScene(sceneIndex) {
if (
APP.sceneIndex ===
sceneIndex
) {
return;
}

APP.sceneIndex =
sceneIndex;

DOM.copySlides.forEach(
(
slide,
index
) => {
const active =
index ===
sceneIndex;

slide.classList.toggle(
"is-active",
active
);

slide.setAttribute(
"aria-hidden",
String(
!active
)
);
}
);

DOM.fallbackImages.forEach(
(
image,
index
) => {
image.classList.toggle(
"is-active",
index ===
sceneIndex
);
}
);

if (
DOM.sceneCurrent
) {
DOM.sceneCurrent.textContent =
String(
sceneIndex +
1
).padStart(
2,
"0"
);
}
}

/* =========================================================
[메뉴] 연결
========================================================= */
function setupSceneLinks() {
DOM.sceneLinks.forEach(
(link) => {
link.addEventListener(
"click",
(event) => {
const index =
Number(
link.dataset.sceneLink
);

if (
!Number.isInteger(
index
) ||
index <
0 ||
index >
2
) {
return;
}

event.preventDefault();

scrollToScene(
index
);
}
);
}
);
}

function scrollToScene(index) {
animateHeroWheelTo(
SCENE_STOPS[index]
);
}

/* =========================================================
[WebGL] 렌더러
========================================================= */
function createWebGLRenderer(
images,
canvas =
DOM.canvas,
sizeElement =
null,
onContextLost =
null
) {
const gl =
canvas.getContext(
"webgl",
{
alpha: false,
antialias: false,
depth: false,
stencil: false,
premultipliedAlpha: false,

/*
 * 2026.10.07 수정 : false → true
 * 멈춰 있을 때 다시 그리지 않으므로,
 * 캔버스를 DOM에서 옮겨도(브리지 전환) 마지막 화면이 유지되도록
 */
preserveDrawingBuffer: true,
powerPreference: "high-performance",
}
) ||
canvas.getContext(
"experimental-webgl"
);

if (
!gl
) {
throw new Error(
"현재 브라우저에서 WebGL을 사용할 수 없습니다."
);
}

const vertexSource = `
attribute vec2 aPosition;

varying vec2 vUv;

void main() {
vUv =
aPosition *
0.5 +
0.5;

gl_Position =
vec4(
aPosition,
0.0,
1.0
);
}
`;

const fragmentSource = `
precision mediump float;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;

uniform vec2 uTextureSize0;
uniform vec2 uTextureSize1;
uniform vec2 uTextureSize2;

uniform vec2 uFocus0;
uniform vec2 uFocus1;
uniform vec2 uFocus2;

uniform vec2 uResolution;

uniform float uStage;
uniform float uTime;
uniform float uEffectStrength;

varying vec2 vUv;

vec2 coverUv(
vec2 uv,
vec2 imageSize,
vec2 screenSize,
vec2 focus
) {
float imageRatio =
imageSize.x /
max(
imageSize.y,
1.0
);

float screenRatio =
screenSize.x /
max(
screenSize.y,
1.0
);

vec2 scale =
vec2(
1.0
);

if (
screenRatio >
imageRatio
) {
scale.y =
imageRatio /
screenRatio;
}
else {
scale.x =
screenRatio /
imageRatio;
}

scale *=
0.92;

vec2 halfScale =
scale *
0.5;

vec2 safeFocus =
clamp(
focus,
halfScale,
vec2(1.0) -
halfScale
);

return (
uv -
0.5
) *
scale +
safeFocus;
}

vec2 safeUv(vec2 uv) {
return clamp(
uv,
vec2(0.002),
vec2(0.998)
);
}

void main() {
vec2 uvBase =
vUv;

float stage =
clamp(
uStage,
0.0,
2.0
);

float progress =
stage < 1.0
? stage
: stage -
1.0;

progress =
clamp(
progress,
0.0,
1.0
);

float transitionIndex =
step(
1.0,
stage
);

vec2 currentSize =
stage < 1.0
? uTextureSize0
: uTextureSize1;

vec2 nextSize =
stage < 1.0
? uTextureSize1
: uTextureSize2;

vec2 currentFocus =
stage < 1.0
? uFocus0
: uFocus1;

vec2 nextFocus =
stage < 1.0
? uFocus1
: uFocus2;

vec2 uvCurrent =
coverUv(
uvBase,
currentSize,
uResolution,
currentFocus
);

vec2 uvNext =
coverUv(
uvBase,
nextSize,
uResolution,
nextFocus
);

if (
progress <=
0.0015
) {
vec3 startColor;

if (
stage <
1.0
) {
startColor =
texture2D(
uTexture0,
uvCurrent
).rgb;
}
else {
startColor =
texture2D(
uTexture1,
uvCurrent
).rgb;
}

gl_FragColor =
vec4(
startColor,
1.0
);

return;
}

if (
progress >=
0.9985
) {
vec3 endColor;

if (
stage <
1.0
) {
endColor =
texture2D(
uTexture1,
uvNext
).rgb;
}
else {
endColor =
texture2D(
uTexture2,
uvNext
).rgb;
}

gl_FragColor =
vec4(
endColor,
1.0
);

return;
}

float progressEased =
progress;

float transitionPulse =
sin(
progress *
3.14159265
);

transitionPulse =
pow(
max(
transitionPulse,
0.0
),
0.68
);

float fx =
clamp(
uEffectStrength,
0.5,
2.5
);

float idle =
0.020 *
transitionPulse *
fx;

float scrollAmp =
0.120 *
transitionPulse *
fx;

float timeValue =
progress *
1.45 +
transitionIndex *
1.7;

float settleT =
clamp(
(
progress -
0.70
) /
0.28,
0.0,
1.0
);

float springReturn =
sin(
settleT *
6.28318530
) *
exp(
-settleT *
3.2
);

float waveC1 =
sin(
uvBase.y *
10.0 +
timeValue
) *
0.92 +

sin(
uvBase.y *
18.0 +
timeValue *
1.2 +
2.0
) *
0.58 +

sin(
uvBase.x *
7.0 +
timeValue *
0.8
) *
0.44 +

sin(
uvBase.x *
23.0 +
uvBase.y *
11.0 +
timeValue *
1.45
) *
0.26 +

sin(
uvBase.y *
31.0 -
timeValue *
1.65 +
0.7
) *
0.20;

float waveC2 =
sin(
uvBase.x *
8.0 +
timeValue *
1.1 +
1.0
) *
0.76 +

sin(
uvBase.x *
15.0 +
timeValue *
0.9
) *
0.62 +

sin(
(
uvBase.x +
uvBase.y
) *
19.0 +
timeValue *
1.25
) *
0.28 +

sin(
uvBase.y *
27.0 +
uvBase.x *
5.0 -
timeValue
) *
0.22;

float waveN1 =
sin(
uvBase.y *
10.0 +
timeValue +
3.14
) *
0.88 +

sin(
uvBase.y *
18.0 +
timeValue *
1.2 +
5.0
) *
0.64 +

sin(
uvBase.x *
7.0 +
timeValue *
0.8 +
1.5
) *
0.48 +

sin(
uvBase.x *
24.0 +
uvBase.y *
12.0 +
timeValue *
1.35 +
2.1
) *
0.28 +

sin(
uvBase.y *
29.0 -
timeValue *
1.55
) *
0.21;

float waveN2 =
sin(
uvBase.x *
8.0 +
timeValue *
1.1 +
4.0
) *
0.78 +

sin(
uvBase.x *
15.0 +
timeValue *
0.9 +
2.0
) *
0.58 +

sin(
(
uvBase.x -
uvBase.y
) *
17.0 +
timeValue *
1.15 +
0.4
) *
0.30 +

sin(
uvBase.x *
26.0 +
timeValue *
1.05
) *
0.24;

float broadWave1 =
sin(
(
uvBase.x *
0.75 +
uvBase.y
) *
4.2 +
timeValue *
0.72
);

float broadWave2 =
sin(
(
uvBase.x -
uvBase.y *
0.82
) *
3.6 -
timeValue *
0.58 +
1.4
);

float broadWave3 =
cos(
(
uvBase.x *
0.45 +
uvBase.y *
0.72
) *
5.0 +
timeValue *
0.46 +
2.2
);

vec2 broadFlow =
vec2(
broadWave1 +
broadWave2 *
0.55 +
broadWave3 *
0.30,

broadWave2 +
broadWave1 *
0.52 -
broadWave3 *
0.26
);

vec2 waveOffsetCurrent =
(
broadFlow *
0.72 +

vec2(
waveC1,
waveC2
) *
0.28
) *
(
idle +
scrollAmp
);

vec2 waveOffsetNext =
(
broadFlow *
-0.58 +

vec2(
waveN1,
waveN2
) *
0.34
) *
(
idle +
scrollAmp
);

vec2 center =
vec2(
0.5
);

vec2 centeredUv =
uvBase -
center;

float radialDistance =
length(
centeredUv
);

float radialWave =
sin(
radialDistance *
4.2 -
timeValue *
0.48
) *
transitionPulse;

vec2 radialFlow =
centeredUv *
(
radialWave +
springReturn *
0.20
) *
0.10 *
fx;

float toCircle =
0.60 *
transitionPulse;

float rCircle =
0.5;

vec2 uvDistortCurrent =
uvCurrent +
waveOffsetCurrent +
radialFlow;

vec2 offsetCurrent =
uvDistortCurrent -
center;

float lengthCurrent =
length(
offsetCurrent
);

float newLengthCurrent =
mix(
lengthCurrent,
min(
lengthCurrent,
rCircle
),
toCircle
);

if (
lengthCurrent >
0.01
) {
uvDistortCurrent =
center +
(
offsetCurrent /
lengthCurrent
) *
newLengthCurrent;
}

vec2 uvDistortNext =
uvNext +
waveOffsetNext -
radialFlow *
0.72;

vec2 offsetNext =
uvDistortNext -
center;

float lengthNext =
length(
offsetNext
);

float newLengthNext =
mix(
lengthNext,
min(
lengthNext,
rCircle
),
toCircle
);

if (
lengthNext >
0.01
) {
uvDistortNext =
center +
(
offsetNext /
lengthNext
) *
newLengthNext;
}

uvDistortCurrent =
safeUv(
uvDistortCurrent
);

uvDistortNext =
safeUv(
uvDistortNext
);

float waveBound =
(
sin(
uvBase.x *
12.0 +
timeValue *
0.5
) *
0.10 +

sin(
uvBase.y *
10.0 +
timeValue *
0.6 +
1.0
) *
0.078 +

sin(
(
uvBase.x +
uvBase.y
) *
8.0 +
timeValue
) *
0.055 +

sin(
uvBase.x *
21.0 -
uvBase.y *
17.0 +
timeValue *
0.88
) *
0.048 +

sin(
uvBase.x *
9.0 +
uvBase.y *
25.0 -
timeValue *
0.72
) *
0.038
) *
transitionPulse *
fx *
0.72;

float mixThickness =
0.072 +
transitionPulse *
0.042 +

abs(
sin(
uvBase.x *
33.0 +
uvBase.y *
7.0 +
timeValue *
0.9
)
) *
0.016 *
transitionPulse;

float boundaryCenter =
progressEased +
waveBound;

float mixFactor =
smoothstep(
boundaryCenter -
mixThickness,
boundaryCenter +
mixThickness,
uvBase.x +
uvBase.y *
0.20
);

float shift =
(
0.003 +
transitionPulse *
0.006
) *
transitionPulse *
fx;

vec3 currentColor;
vec3 nextColor;

if (
stage <
1.0
) {
float redCurrent =
texture2D(
uTexture0,
safeUv(
uvDistortCurrent +
vec2(
shift,
0.0
)
)
).r;

float greenCurrent =
texture2D(
uTexture0,
uvDistortCurrent
).g;

float blueCurrent =
texture2D(
uTexture0,
safeUv(
uvDistortCurrent -
vec2(
shift,
0.0
)
)
).b;

float redNext =
texture2D(
uTexture1,
safeUv(
uvDistortNext +
vec2(
-shift *
0.7,
shift *
0.3
)
)
).r;

float greenNext =
texture2D(
uTexture1,
uvDistortNext
).g;

float blueNext =
texture2D(
uTexture1,
safeUv(
uvDistortNext -
vec2(
-shift *
0.7,
shift *
0.3
)
)
).b;

currentColor =
vec3(
redCurrent,
greenCurrent,
blueCurrent
);

nextColor =
vec3(
redNext,
greenNext,
blueNext
);
}

else {
float redCurrent =
texture2D(
uTexture1,
safeUv(
uvDistortCurrent +
vec2(
shift,
0.0
)
)
).r;

float greenCurrent =
texture2D(
uTexture1,
uvDistortCurrent
).g;

float blueCurrent =
texture2D(
uTexture1,
safeUv(
uvDistortCurrent -
vec2(
shift,
0.0
)
)
).b;

float redNext =
texture2D(
uTexture2,
safeUv(
uvDistortNext +
vec2(
-shift *
0.7,
shift *
0.3
)
)
).r;

float greenNext =
texture2D(
uTexture2,
uvDistortNext
).g;

float blueNext =
texture2D(
uTexture2,
safeUv(
uvDistortNext -
vec2(
-shift *
0.7,
shift *
0.3
)
)
).b;

currentColor =
vec3(
redCurrent,
greenCurrent,
blueCurrent
);

nextColor =
vec3(
redNext,
greenNext,
blueNext
);
}

float blend =
mix(
progressEased,
mixFactor,
transitionPulse *
0.46
);

vec3 finalColor =
mix(
currentColor,
nextColor,
blend
);

float cleanReturn =
smoothstep(
0.94,
0.998,
progress
);

vec3 cleanTarget;

if (
stage <
1.0
) {
cleanTarget =
texture2D(
uTexture1,
uvNext
).rgb;
}
else {
cleanTarget =
texture2D(
uTexture2,
uvNext
).rgb;
}

finalColor =
mix(
finalColor,
cleanTarget,
cleanReturn
);

gl_FragColor =
vec4(
finalColor,
1.0
);
}
`;

const program =
createProgram(
gl,
vertexSource,
fragmentSource
);

gl.useProgram(
program
);

const buffer =
gl.createBuffer();

gl.bindBuffer(
gl.ARRAY_BUFFER,
buffer
);

gl.bufferData(
gl.ARRAY_BUFFER,

new Float32Array([
-1, -1,
1, -1,
-1,  1,

-1,  1,
1, -1,
1,  1,
]),

gl.STATIC_DRAW
);

const positionLocation =
gl.getAttribLocation(
program,
"aPosition"
);

gl.enableVertexAttribArray(
positionLocation
);

gl.vertexAttribPointer(
positionLocation,
2,
gl.FLOAT,
false,
0,
0
);

const textures =
images.map(
(image) => {
return createImageTexture(
gl,
image
);
}
);

const uniforms = {
texture0:
gl.getUniformLocation(
program,
"uTexture0"
),

texture1:
gl.getUniformLocation(
program,
"uTexture1"
),

texture2:
gl.getUniformLocation(
program,
"uTexture2"
),

textureSize0:
gl.getUniformLocation(
program,
"uTextureSize0"
),

textureSize1:
gl.getUniformLocation(
program,
"uTextureSize1"
),

textureSize2:
gl.getUniformLocation(
program,
"uTextureSize2"
),

focus0:
gl.getUniformLocation(
program,
"uFocus0"
),

focus1:
gl.getUniformLocation(
program,
"uFocus1"
),

focus2:
gl.getUniformLocation(
program,
"uFocus2"
),

resolution:
gl.getUniformLocation(
program,
"uResolution"
),

stage:
gl.getUniformLocation(
program,
"uStage"
),

time:
gl.getUniformLocation(
program,
"uTime"
),

effectStrength:
gl.getUniformLocation(
program,
"uEffectStrength"
),
};

gl.uniform1i(
uniforms.texture0,
0
);

gl.uniform1i(
uniforms.texture1,
1
);

gl.uniform1i(
uniforms.texture2,
2
);

textures.forEach(
(
texture,
index
) => {
gl.activeTexture(
gl.TEXTURE0 +
index
);

gl.bindTexture(
gl.TEXTURE_2D,
texture
);
}
);

gl.uniform2f(
uniforms.textureSize0,
images[0].naturalWidth,
images[0].naturalHeight
);

gl.uniform2f(
uniforms.textureSize1,
images[1].naturalWidth,
images[1].naturalHeight
);

gl.uniform2f(
uniforms.textureSize2,
images[2].naturalWidth,
images[2].naturalHeight
);

gl.uniform2f(
uniforms.focus0,
IMAGE_FOCUS[0].x,
IMAGE_FOCUS[0].y
);

gl.uniform2f(
uniforms.focus1,
IMAGE_FOCUS[1].x,
IMAGE_FOCUS[1].y
);

gl.uniform2f(
uniforms.focus2,
IMAGE_FOCUS[2].x,
IMAGE_FOCUS[2].y
);

gl.uniform1f(
uniforms.effectStrength,
0.92
);

const state = {
targetStage: 0,
currentStage: 0,
lastTime: performance.now(),
running: true,

/*
 * 2026.10.07 추가 — 렉 개선
 * 화면이 멈춰 있으면 다시 그리지 않음
 * frame : 진행 중인 requestAnimationFrame 번호 (0 = 쉬는 중)
 * dirty : 크기가 바뀌어 한 번은 다시 그려야 함
 */
frame: 0,
dirty: true,
};

/* 쉬고 있던 렌더 루프 다시 시작 (2026.10.07 추가) */
function wake() {
if (
!state.running ||
state.frame
) {
return;
}

state.lastTime =
performance.now();

state.frame =
window.requestAnimationFrame(
render
);
}

function resize() {
const targetRect =
sizeElement
? sizeElement
.getBoundingClientRect()
: null;

const targetWidth =
Math.max(
1,
targetRect
? targetRect.width
: window.innerWidth
);

const targetHeight =
Math.max(
1,
targetRect
? targetRect.height
: window.innerHeight
);

/*
 * 2026.10.07 수정 — 모바일(1000px 이하)은 해상도 배율 1
 * (그려야 할 픽셀 수가 절반 이하로 줄어듦)
 */
const isMobile =
window.innerWidth <=
1000;

const pixelRatio =
Math.min(
window.devicePixelRatio ||
1,
isMobile
? 1
: sizeElement
? 1.75
: 1.4
);

const width =
Math.max(
1,
Math.round(
targetWidth *
pixelRatio
)
);

const height =
Math.max(
1,
Math.round(
targetHeight *
pixelRatio
)
);

if (
canvas.width !==
width ||

canvas.height !==
height
) {
canvas.width =
width;

canvas.height =
height;
}

gl.viewport(
0,
0,
width,
height
);

gl.uniform2f(
uniforms.resolution,
width,
height
);

/* 크기 변경 → 한 번 다시 그림 (2026.10.07 추가) */
state.dirty =
true;

wake();
}

function setStage(
stage,
immediate = false
) {
state.targetStage =
clamp(
stage,
0,
2
);

if (
immediate
) {
state.currentStage =
state.targetStage;

state.dirty =
true;
}

/* 단계가 바뀌면 렌더 루프 다시 시작 (2026.10.07 추가) */
wake();
}

function render(time) {
state.frame =
0;

if (
!state.running
) {
return;
}

const deltaTime =
Math.min(
(
time -
state.lastTime
) /
1000,
0.1
);

state.lastTime =
time;

const followSpeed =
prefersReducedMotion
? 100
: 18.0;

const follow =
1 -
Math.exp(
-followSpeed *
deltaTime
);

state.currentStage +=
(
state.targetStage -
state.currentStage
) *
follow;

if (
Math.abs(
state.targetStage -
state.currentStage
) <
0.00025
) {
state.currentStage =
state.targetStage;
}

const nearestStage =
Math.round(
state.currentStage
);

if (
Math.abs(
state.currentStage -
nearestStage
) <
0.00034
) {
state.currentStage =
nearestStage;
}

gl.uniform1f(
uniforms.time,
time *
0.001
);

gl.uniform1f(
uniforms.stage,
state.currentStage
);

gl.drawArrays(
gl.TRIANGLES,
0,
6
);

state.dirty =
false;

/*
 * 2026.10.07 수정 — 렉 개선
 * 목표 단계에 도착했으면 루프를 멈춤
 * (셰이더가 시간(uTime)으로 움직이지 않아서 멈춰도 화면은 같음)
 * → setStage / resize 때 wake()로 다시 시작
 */
if (
state.currentStage ===
state.targetStage
) {
return;
}

state.frame =
window.requestAnimationFrame(
render
);
}

canvas.addEventListener(
"webglcontextlost",
(event) => {
event.preventDefault();

state.running =
false;

if (
typeof onContextLost ===
"function"
) {
onContextLost();

return;
}

if (
canvas ===
DOM.canvas
) {
DOM.body.classList.remove(
"webgl-ready"
);
}
}
);

resize();

window.addEventListener(
"resize",
resize,
{
passive: true,
}
);

/* 첫 화면 그리기 (2026.10.07 : wake()로 시작) */
wake();

/* 지금 상태 그대로 한 번 다시 그리기 (2026.10.07 추가) */
function redraw() {
state.dirty =
true;

wake();
}

return {
setStage,
resize,
redraw,
};
}

/* =========================================================
WebGL SHADER
========================================================= */
function createShader(
gl,
type,
source
) {
const shader =
gl.createShader(
type
);

if (
!shader
) {
throw new Error(
"셰이더 객체 생성 실패"
);
}

gl.shaderSource(
shader,
source
);

gl.compileShader(
shader
);

if (
!gl.getShaderParameter(
shader,
gl.COMPILE_STATUS
)
) {
const message =
gl.getShaderInfoLog(
shader
);

gl.deleteShader(
shader
);

throw new Error(
`셰이더 오류: ${message}`
);
}

return shader;
}

/* =========================================================
WEBGL PROGRAM
========================================================= */
function createProgram(
gl,
vertexSource,
fragmentSource
) {
const vertexShader =
createShader(
gl,
gl.VERTEX_SHADER,
vertexSource
);

const fragmentShader =
createShader(
gl,
gl.FRAGMENT_SHADER,
fragmentSource
);

const program =
gl.createProgram();

if (
!program
) {
throw new Error(
"WebGL 프로그램 생성 실패"
);
}

gl.attachShader(
program,
vertexShader
);

gl.attachShader(
program,
fragmentShader
);

gl.linkProgram(
program
);

if (
!gl.getProgramParameter(
program,
gl.LINK_STATUS
)
) {
const message =
gl.getProgramInfoLog(
program
);

gl.deleteProgram(
program
);

throw new Error(
`WebGL 연결 오류: ${message}`
);
}

gl.deleteShader(
vertexShader
);

gl.deleteShader(
fragmentShader
);

return program;
}

/* =========================================================
TEXTURE
========================================================= */
function createImageTexture(
gl,
image
) {
const texture =
gl.createTexture();

if (
!texture
) {
throw new Error(
"이미지 텍스처 생성 실패"
);
}

gl.bindTexture(
gl.TEXTURE_2D,
texture
);

gl.pixelStorei(
gl.UNPACK_FLIP_Y_WEBGL,
true
);

gl.pixelStorei(
gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
false
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

gl.texImage2D(
gl.TEXTURE_2D,
0,
gl.RGBA,
gl.RGBA,
gl.UNSIGNED_BYTE,
fitTextureImage(
gl,
image
)
);

return texture;
}

/* =========================================================
[WebGL] 텍스처 크기 제한 — 2026.10.07 추가
---------------------------------------------------------
- 모바일 GPU는 보통 4096px 넘는 텍스처를 못 그림
  → 화면이 아예 안 나오던 원인
- 기기 한도(MAX_TEXTURE_SIZE)와
  데스크톱 2560px / 모바일 1600px 중 작은 값으로 줄여서 올림
- 비율은 그대로 유지
========================================================= */
function fitTextureImage(
gl,
image
) {
const sourceWidth =
image.naturalWidth ||
image.width;

const sourceHeight =
image.naturalHeight ||
image.height;

const isMobile =
window.innerWidth <=
1000;

const maxSize =
Math.min(
gl.getParameter(
gl.MAX_TEXTURE_SIZE
) ||
4096,
isMobile
? 1600
: 2560
);

const scale =
Math.min(
1,
maxSize /
Math.max(
sourceWidth,
sourceHeight
)
);

/* 이미 충분히 작으면 그대로 */
if (
scale >=
1
) {
return image;
}

const resized =
document.createElement(
"canvas"
);

resized.width =
Math.round(
sourceWidth *
scale
);

resized.height =
Math.round(
sourceHeight *
scale
);

resized
.getContext(
"2d"
)
.drawImage(
image,
0,
0,
resized.width,
resized.height
);

return resized;
}

/* =========================================================
NUMBER UTILS
========================================================= */
function clamp(
value,
minimum,
maximum
) {
return Math.min(
Math.max(
value,
minimum
),
maximum
);
}

function mapRange(
value,
start,
end
) {
if (
Math.abs(
end -
start
) <
0.0001
) {
return 0;
}

return clamp(
(
value -
start
) /
(
end -
start
),
0,
1
);
}

function smootherStep(value) {
const safeValue =
clamp(
value,
0,
1
);

return (
safeValue *
safeValue *
safeValue *
(
safeValue *
(
safeValue *
6 -
15
) +
10
)
);
}

/* =========================================================
상세 페이지 인터랙션
========================================================= */
(function setupCaseInteractions() {
const reducedMotion =
window.matchMedia(
"(prefers-reduced-motion: reduce)"
).matches;

function startInteractions() {
const productImage =
document.querySelector(
".case-product__visual"
);

const mainMockup =
document.querySelector(
".case-main-mockup"
);

const floatingCards = [
...document.querySelectorAll(
".case-floating-card"
),
];

const productContent =
document.querySelector(
".case-product__content"
);

const typeTargets = [
document.querySelector(
".case-product__brand"
),

document.querySelector(
".case-product__type"
),

document.querySelector(
".case-product__label"
),

...document.querySelectorAll(
".case-product__description p"
),
].filter(
Boolean
);

if (
reducedMotion
) {
[
productImage,
mainMockup,
...floatingCards,
]
.filter(Boolean)
.forEach(
(element) => {
element.classList.add(
"is-shown"
);
}
);

return;
}

document.documentElement
.classList.add(
"motion-enabled"
);

const revealItems = [
productImage,
mainMockup,
...floatingCards,
].filter(
Boolean
);

const revealObserver =
new IntersectionObserver(
(entries) => {
entries.forEach(
(entry) => {
if (
!entry.isIntersecting
) {
return;
}

entry.target
.classList.add(
"is-shown"
);

revealObserver
.unobserve(
entry.target
);
}
);
},
{
threshold: 0.16,
rootMargin:
"0px 0px -8% 0px",
}
);

revealItems.forEach(
(element) => {
revealObserver.observe(
element
);
}
);

const typingData =
typeTargets.map(
(element) => {
const text =
element.textContent
.replace(
/\s+/g,
" "
)
.trim();

const height =
element
.getBoundingClientRect()
.height;

element.classList.add(
"type-target"
);

element.setAttribute(
"aria-label",
text
);

element.style.minHeight =
`${height}px`;

element.textContent =
"";

return {
element,
text,
};
}
);

function typeText(
element,
text,
speed
) {
return new Promise(
(resolve) => {
let index =
0;

element.classList.add(
"is-typing"
);

function writeCharacter() {
index +=
1;

element.textContent =
text.slice(
0,
index
);

if (
index <
text.length
) {
window.setTimeout(
writeCharacter,
speed
);

return;
}

element.classList.remove(
"is-typing"
);

resolve();
}

writeCharacter();
}
);
}

function wait(time) {
return new Promise(
(resolve) => {
window.setTimeout(
resolve,
time
);
}
);
}

async function playTyping() {
const speeds = [
55,
35,
45,
12,
12,
];

for (
let index = 0;
index <
typingData.length;
index += 1
) {
const item =
typingData[index];

await typeText(
item.element,
item.text,
speeds[index] ||
12
);

await wait(
130
);
}
}

if (
productContent &&
typingData.length
) {
const typingObserver =
new IntersectionObserver(
(entries) => {
entries.forEach(
(entry) => {
if (
!entry.isIntersecting
) {
return;
}

playTyping();

typingObserver
.unobserve(
entry.target
);
}
);
},
{
threshold: 0.35,
rootMargin:
"0px 0px -12% 0px",
}
);

typingObserver.observe(
productContent
);
}
}

if (
document.readyState ===
"loading"
) {
document.addEventListener(
"DOMContentLoaded",
startInteractions,
{
once: true,
}
);
}
else {
startInteractions();
}
})();

/* =========================================================
전환 섹션 인터랙션
========================================================= */
(function setupBridgeTransition() {
const section =
document.querySelector(
"#bridge-transition"
);

if (
!section
) {
console.warn(
"#bridge-transition 섹션을 찾을 수 없습니다."
);

return;
}

const sticky =
section.querySelector(
".bridge-transition__sticky"
);

const frame =
section.querySelector(
"#bridge-transition-frame"
) ||
section.querySelector(
".bridge-transition__frame"
);

const visualStage =
document.querySelector(
"#visual-stage"
);

const heroCopy =
document.querySelector(
"#copy-stage"
);

const heroProgress =
document.querySelector(
".scroll-progress"
);

const heroStatus =
document.querySelector(
"#scene-status"
);

const carryImage =
section.querySelector(
"[data-bridge-carry]"
);

const flashLayer =
section.querySelector(
"[data-bridge-flash]"
);

const flashImage =
section.querySelector(
"#bridge-flash-image"
);

const mainImages = [
...section.querySelectorAll(
"[data-bridge-image]"
),
];

const scenes = [
...section.querySelectorAll(
"[data-bridge-scene]"
),
];

const counter =
section.querySelector(
"#bridge-transition-counter"
);

if (
!sticky ||
!frame ||
!visualStage ||
!carryImage ||
!flashLayer ||
!flashImage ||
mainImages.length <
3 ||
scenes.length <
3
) {
console.warn(
"전환에 필요한 HTML 요소를 찾지 못했습니다."
);

return;
}

const handoffFlashImage =
document.createElement(
"img"
);

handoffFlashImage.className =
"bridge-handoff-flash-image";

handoffFlashImage.alt =
"";

handoffFlashImage.setAttribute(
"aria-hidden",
"true"
);

visualStage.appendChild(
handoffFlashImage
);

let bridgeCanvas =
frame.querySelector(
".bridge-transition__webgl"
);

if (
!bridgeCanvas
) {
bridgeCanvas =
document.createElement(
"canvas"
);

bridgeCanvas.className =
"bridge-transition__webgl";

bridgeCanvas.setAttribute(
"aria-hidden",
"true"
);

frame.appendChild(
bridgeCanvas
);
}

const visualOriginalParent =
visualStage.parentElement;

const visualOriginalNextSibling =
visualStage.nextElementSibling;

let handoffBackdrop =
document.querySelector(
".bridge-handoff-backdrop"
);

if (
!handoffBackdrop
) {
handoffBackdrop =
document.createElement(
"div"
);

handoffBackdrop.className =
"bridge-handoff-backdrop";

document.body.appendChild(
handoffBackdrop
);
}

/*
 * 2026.10.07 수정
 * 02-1 / 02-2 → 웹용으로 줄인 -web.jpg 사용 (02-3은 원래 1920px)
 */
const flashSources = [
"./images/02-1-web.jpg",
"./images/02-2-web.jpg",
"./images/02-3.jpg",
"./images/02-1-web.jpg",
"./images/02-2-web.jpg",
"./images/02-3.jpg",
];

let handoffStart =
0;

let sectionTop =
0;

let sectionBottom =
0;

let scrollDistance =
1;

let animationFrame =
0;

let visualMounted =
false;

let activeFlash =
-1;

let activeHandoffFlash =
-1;

let activeMainImage =
-1;

let activeScene =
-1;

let bridgeRenderer =
null;

function clamp(
value,
minimum,
maximum
) {
return Math.min(
Math.max(
value,
minimum
),
maximum
);
}

function mix(
start,
end,
progress
) {
return (
start +
(
end -
start
) *
progress
);
}

function smoothStep(
start,
end,
value
) {
if (
start ===
end
) {
return value >=
end
? 1
: 0;
}

const progress =
clamp(
(
value -
start
) /
(
end -
start
),
0,
1
);

return (
progress *
progress *
(
3 -
2 *
progress
)
);
}

function getBridgeCardMetrics() {
const isMobile =
window.innerWidth <=
DESIGN_LAYOUT.mobileBreakpoint;

if (
isMobile
) {
return {
width:
window.innerWidth *
0.58,

/*
 * 2026.10.07 수정 : 모바일 카드 높이 0.60 → 0.50
 * 카드 아래에 설명 글이 들어갈 자리 확보 (설명이 카드와 겹치던 문제)
 */
height:
window.innerHeight *
0.50,

radius:
6,
};
}

const designMetrics =
getDesignViewportMetrics();

return {
width:
designMetrics.width *
DESIGN_LAYOUT.bridgeCardWidthRatio,

height:
designMetrics.height *
DESIGN_LAYOUT.bridgeCardHeightRatio,

radius:
DESIGN_LAYOUT.bridgeCardRadius *
designMetrics.scale,
};
}

function setLayerOpacity(
element,
opacity
) {
if (
!element
) {
return;
}

const value =
clamp(
opacity,
0,
1
);

element.style.opacity =
String(
value
);

element.style.visibility =
value >
0
? "visible"
: "hidden";
}

function setHeroInterfaceOpacity(
opacity
) {
const value =
String(
clamp(
opacity,
0,
1
)
);

[
heroCopy,
heroProgress,
heroStatus,
]
.filter(
Boolean
)
.forEach(
(element) => {
element.style.opacity =
value;
}
);
}

function clearHeroInterfaceOpacity() {
[
heroCopy,
heroProgress,
heroStatus,
]
.filter(
Boolean
)
.forEach(
(element) => {
element.style.removeProperty(
"opacity"
);
}
);
}

function mountVisualStage() {
if (
visualMounted
) {
return;
}

visualStage.style.opacity =
"1";

visualStage.style.visibility =
"visible";

document.body.appendChild(
visualStage
);

visualStage.classList.add(
"is-bridge-handoff"
);

visualStage.style.pointerEvents =
"none";

handoffBackdrop.classList.add(
"is-active"
);

visualMounted =
true;

if (
typeof APP !==
"undefined"
) {
APP.bridgeHandoffActive =
true;
}

setLayerOpacity(
handoffFlashImage,
0
);

if (
typeof setActiveScene ===
"function"
) {
setActiveScene(
2
);
}

if (
typeof APP !==
"undefined" &&
APP.renderer
) {
APP.renderer.setStage(
2,
true
);
}
}

function restoreVisualStage() {
if (
!visualMounted
) {
return;
}

handoffBackdrop.classList.remove(
"is-active"
);

visualStage.classList.remove(
"is-bridge-handoff"
);

[
"width",
"height",
"border-radius",
"opacity",
"visibility",
"pointer-events",
].forEach(
(property) => {
visualStage.style.removeProperty(
property
);
}
);

clearHeroInterfaceOpacity();

setLayerOpacity(
handoffFlashImage,
0
);

activeHandoffFlash =
-1;

if (
typeof APP !==
"undefined"
) {
APP.bridgeHandoffActive =
false;
}

if (
visualOriginalNextSibling &&
visualOriginalNextSibling.parentElement ===
visualOriginalParent
) {
visualOriginalParent.insertBefore(
visualStage,
visualOriginalNextSibling
);
}
else {
visualOriginalParent.appendChild(
visualStage
);
}

visualMounted =
false;

/*
 * 2026.10.07 추가
 * 캔버스를 원래 자리로 옮긴 뒤 한 번 다시 그림
 * (사진이 사라져 보이던 문제)
 */
if (
typeof APP !==
"undefined" &&
APP.renderer
) {
APP.renderer.setStage(
progressToStage(
getExperienceProgress()
),
true
);

APP.renderer.redraw();
}
}

function setFlashImage(index) {
if (
index <
0 ||
index >=
flashSources.length ||
activeFlash ===
index
) {
return;
}

activeFlash =
index;

flashImage.src =
flashSources[index];
}

function setHandoffFlashImage(index) {
if (
index <
0 ||
index >
2 ||
activeHandoffFlash ===
index
) {
return;
}

activeHandoffFlash =
index;

handoffFlashImage.src =
flashSources[index];
}

function setMainImage(index) {
if (
index <
0 ||
index >=
mainImages.length ||
activeMainImage ===
index
) {
return;
}

activeMainImage =
index;

mainImages.forEach(
(
image,
imageIndex
) => {
const active =
imageIndex ===
index;

setLayerOpacity(
image,
active
? 1
: 0
);

image.style.zIndex =
active
? "3"
: "1";
}
);

if (
counter
) {
counter.textContent =
`${String(
index +
1
).padStart(
2,
"0"
)} / 03`;
}
}

function hideMainImages() {
activeMainImage =
-1;

mainImages.forEach(
(image) => {
setLayerOpacity(
image,
0
);
}
);
}

function setScene(index) {
if (
activeScene ===
index
) {
return;
}

activeScene =
index;

scenes.forEach(
(
scene,
sceneIndex
) => {
const active =
sceneIndex ===
index;

scene.classList.toggle(
"is-active",
active
);

scene.setAttribute(
"aria-hidden",
String(
!active
)
);
}
);
}

function setBridgeScene(index) {
setScene(
index
);

if (
counter
) {
counter.textContent =
`${String(
index +
1
).padStart(
2,
"0"
)} / 03`;
}
}

function preloadFlashImages() {
flashSources.forEach(
(source) => {
const image =
new Image();

image.src =
source;
}
);
}

async function initializeBridgeWebGL() {
if (
DOM.fallbackImages.length <
3
) {
return;
}

try {
const bridgeImages =
mainImages.map(
(item) =>
item.querySelector(
"img"
)
);

const images =
await Promise.all(
bridgeImages.map(
waitForImage
)
);

bridgeRenderer =
createWebGLRenderer(
images,
bridgeCanvas,
frame,
() => {
frame.classList.remove(
"is-webgl-ready"
);

bridgeRenderer =
null;
}
);

bridgeRenderer.setStage(
0,
true
);

bridgeRenderer.resize();

frame.classList.add(
"is-webgl-ready"
);

requestUpdate();
}
catch (error) {
bridgeRenderer =
null;

frame.classList.remove(
"is-webgl-ready"
);

console.warn(
"전환 WebGL 실행 오류:",
error
);
}
}

function measure() {
syncDesignViewportVariables();

sectionTop =
section
.getBoundingClientRect()
.top +
window.scrollY;

const heroStart =
DOM.experience.offsetTop;

const heroDistance =
Math.max(
DOM.experience.offsetHeight -
window.innerHeight,
1
);

const thirdSceneStop =
heroStart +
heroDistance *
SCENE_STOPS[2];

handoffStart =
Math.min(
sectionTop -
window.innerHeight,
thirdSceneStop
);

sectionBottom =
sectionTop +
section.offsetHeight;

scrollDistance =
Math.max(
section.offsetHeight -
window.innerHeight,
1
);

if (
bridgeRenderer
) {
bridgeRenderer.resize();
}

requestUpdate();
}

function update() {
animationFrame =
0;

const scrollY =
window.scrollY;

/*
 * 2026.10.07 수정 : >= → > (+ 2px 여유)
 * 전환 시작점이 HERO 03 정지점과 똑같아서
 * 03 장면에 도착하자마자 이미지가 맨 위(z-index 9)로 올라와
 * 03 글씨 / 이미지를 덮어 사라지는 문제
 * → 정지점에서는 HERO 03을 그대로 보여주고,
 *   그보다 아래로 스크롤해야 전환 시작
 */
const handoffActive =
scrollY >
handoffStart + 2 &&
scrollY <
sectionTop;

const bridgeActive =
scrollY >=
sectionTop &&
scrollY <
sectionBottom;

if (
!handoffActive &&
!bridgeActive
) {
restoreVisualStage();
return;
}

const cardMetrics =
getBridgeCardMetrics();

const cardWidth =
cardMetrics.width;

const cardHeight =
cardMetrics.height;

const cardRadius =
cardMetrics.radius;

sticky.style.setProperty(
"--bridge-frame-width",
`${cardWidth}px`
);

sticky.style.setProperty(
"--bridge-frame-height",
`${cardHeight}px`
);

sticky.style.setProperty(
"--bridge-frame-radius",
`${cardRadius}px`
);

sticky.style.setProperty(
"--bridge-shadow-opacity",
"0.14"
);

if (
handoffActive
) {
mountVisualStage();

sticky.style.visibility =
"hidden";

frame.style.opacity =
"0";

if (
bridgeRenderer
) {
bridgeRenderer.setStage(
0,
true
);
}

sticky.style.setProperty(
"--bridge-layout-opacity",
"0"
);

const handoffProgress =
clamp(
(
scrollY -
handoffStart
) /
Math.max(
sectionTop -
handoffStart,
1
),
0,
1
);

const shrinkProgress =
smoothStep(
0,
0.92,
handoffProgress
);

const frameWidth =
mix(
window.innerWidth,
cardWidth,
shrinkProgress
);

const frameHeight =
mix(
window.innerHeight,
cardHeight,
shrinkProgress
);

const frameRadius =
mix(
0,
cardRadius,
shrinkProgress
);

visualStage.style.width =
`${frameWidth}px`;

visualStage.style.height =
`${frameHeight}px`;

visualStage.style.borderRadius =
`${frameRadius}px`;

setLayerOpacity(
visualStage,
1
);

setLayerOpacity(
carryImage,
0
);

setLayerOpacity(
flashLayer,
0
);

hideMainImages();

setScene(
-1
);

const heroOpacity =
1 -
smoothStep(
0,
0.18,
handoffProgress
);

setHeroInterfaceOpacity(
heroOpacity
);

const shrinkFlashStart =
0.0;

const shrinkFlashEnd =
0.30;

const flashReveal =
smoothStep(
shrinkFlashStart,
shrinkFlashStart +
0.012,
handoffProgress
);

setLayerOpacity(
handoffFlashImage,
flashReveal
);

if (
handoffProgress <
shrinkFlashEnd
) {
const shrinkFlashProgress =
clamp(
(
handoffProgress -
shrinkFlashStart
) /
(
shrinkFlashEnd -
shrinkFlashStart
),
0,
0.999999
);

const flashFrameCount =
7;

const flashFrame =
Math.min(
flashFrameCount -
1,
Math.floor(
shrinkFlashProgress *
flashFrameCount
)
);

const flashIndex =
flashFrame %
3;

setHandoffFlashImage(
flashIndex
);

if (
counter
) {
counter.textContent =
`${String(
flashIndex +
1
).padStart(
2,
"0"
)} / 03`;
}

return;
}

setHandoffFlashImage(
0
);

setLayerOpacity(
handoffFlashImage,
1
);

if (
counter
) {
counter.textContent =
"01 / 03";
}

return;
}

restoreVisualStage();

frame.style.opacity =
"1";

sticky.style.visibility =
"visible";

setHeroInterfaceOpacity(
0
);

const progress =
clamp(
(
scrollY -
sectionTop
) /
scrollDistance,
0,
1
);

sticky.style.setProperty(
"--bridge-layout-opacity",
"1"
);

if (
bridgeRenderer
) {
bridgeRenderer.resize();
}

const bridgeProgress =
clamp(
progress /
0.90,
0,
1
);

let bridgeStage =
0;

let bridgeScene =
0;

if (
bridgeProgress <
0.22
) {
bridgeStage =
0;

bridgeScene =
0;
}

else if (
bridgeProgress <
0.32
) {
bridgeStage =
mapRange(
bridgeProgress,
0.22,
0.32
);

bridgeScene =
bridgeProgress <
0.27
? 0
: 1;
}

else if (
bridgeProgress <
0.52
) {
bridgeStage =
1;

bridgeScene =
1;
}

else if (
bridgeProgress <
0.62
) {
bridgeStage =
1 +
mapRange(
bridgeProgress,
0.52,
0.62
);

bridgeScene =
bridgeProgress <
0.57
? 1
: 2;
}

else {
bridgeStage =
2;

bridgeScene =
2;
}

if (
bridgeRenderer
) {
bridgeRenderer.setStage(
bridgeStage,
false
);

hideMainImages();
}
else {
setMainImage(
bridgeScene
);
}

setBridgeScene(
bridgeScene
);

if (
progress >=
0.90
) {
if (
bridgeRenderer
) {
bridgeRenderer.setStage(
2,
false
);
}
else {
setMainImage(
2
);
}

setBridgeScene(
2
);

sticky.style.setProperty(
"--bridge-layout-opacity",
"1"
);
}
}

function requestUpdate() {
if (
animationFrame
) {
return;
}

animationFrame =
window.requestAnimationFrame(
update
);
}

window.addEventListener(
"scroll",
requestUpdate,
{
passive: true,
}
);

window.addEventListener(
"resize",
measure,
{
passive: true,
}
);

window.addEventListener(
"load",
measure,
{
once: true,
}
);

preloadFlashImages();

setFlashImage(
0
);

initializeBridgeWebGL();

measure();

})();

/* =========================================================
INDEX HEADER AUTO HIDE / TOP EDGE REVEAL
========================================================= */
(function setupIndexHeaderAutoHide() {
const body =
document.body;

const header =
document.querySelector(
".site-header"
);

if (
!body ||
!header
) {
return;
}

const TOP_VISIBLE_THRESHOLD =
24;

const DEFAULT_HOT_ZONE =
82;

const HOT_ZONE_EXTRA =
18;

let pointerY =
Infinity;

let pointerInsideHeader =
false;

let headerFocused =
false;

let ticking =
false;

function getHotZoneHeight() {
const headerHeight =
header
.getBoundingClientRect()
.height;

return Math.max(
DEFAULT_HOT_ZONE,
headerHeight +
HOT_ZONE_EXTRA
);
}

function isAtTop() {
return (
window.scrollY <=
TOP_VISIBLE_THRESHOLD
);
}

function isPointerInHotZone() {
return (
pointerY <=
getHotZoneHeight()
);
}

function showHeader(
usePeek = false
) {
body.classList.remove(
"is-header-hidden"
);

if (
usePeek
) {
body.classList.add(
"is-header-peek"
);
}
else {
body.classList.remove(
"is-header-peek"
);
}
}

function hideHeader() {
if (
isAtTop()
) {
showHeader(
false
);

return;
}

body.classList.add(
"is-header-hidden"
);

body.classList.remove(
"is-header-peek"
);
}

function updateHeaderState() {
ticking =
false;

if (
isAtTop()
) {
showHeader(
false
);

return;
}

if (
isPointerInHotZone() ||
pointerInsideHeader ||
headerFocused
) {
body.classList.add(
"is-header-hidden"
);

body.classList.add(
"is-header-peek"
);

return;
}

hideHeader();
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
updateHeaderState
);
}

window.addEventListener(
"scroll",
requestHeaderUpdate,
{
passive: true,
}
);

window.addEventListener(
"mousemove",
(event) => {
pointerY =
event.clientY;

requestHeaderUpdate();
},
{
passive: true,
}
);

document.documentElement
.addEventListener(
"mouseleave",
() => {
pointerY =
Infinity;

requestHeaderUpdate();
}
);

header.addEventListener(
"mouseenter",
() => {
pointerInsideHeader =
true;

if (
!isAtTop()
) {
body.classList.add(
"is-header-hidden"
);

body.classList.add(
"is-header-peek"
);
}
}
);

header.addEventListener(
"mouseleave",
(event) => {
pointerInsideHeader =
false;

pointerY =
event.clientY;

requestHeaderUpdate();
}
);

header.addEventListener(
"focusin",
() => {
headerFocused =
true;

if (
!isAtTop()
) {
body.classList.add(
"is-header-hidden"
);

body.classList.add(
"is-header-peek"
);
}
}
);

header.addEventListener(
"focusout",
() => {
window.setTimeout(
() => {
headerFocused =
header.contains(
document.activeElement
);

requestHeaderUpdate();
},
0
);
}
);

window.addEventListener(
"resize",
requestHeaderUpdate,
{
passive: true,
}
);

updateHeaderState();

})();
/* =========================================================
[인트로] INDEX INTRO — 2026.10.06
---------------------------------------------------------
- 처음 접속했을 때만 images/intro.mp4 재생
  (같은 탭에서 이미 봤다면 head 스크립트가 재생하지 않음)
- 영상이 끝나기 직전(페이드 아웃 전) 패널이 위로 걷힘
- 패널이 다 걷히면 HERO 01 문구 등장
- SKIP 버튼 / ESC 키로 바로 넘기기
- 영상을 불러오지 못하면 바로 HERO 시작
========================================================= */
(function setupIndexIntro() {

  const root =
    document.documentElement;

  const intro =
    document.querySelector("#site-intro");

  const video =
    document.querySelector("#site-intro-video");

  const skipButton =
    document.querySelector("#site-intro-skip");


  /* 인트로 HTML이 없는 페이지 → 잠금만 해제 */
  if (
    !intro ||
    !video
  ) {
    root.classList.remove("is-intro-active");
    return;
  }


  /* 이미 본 경우 → 인트로 요소 제거 */
  if (
    !root.classList.contains("is-intro-active")
  ) {
    intro.remove();
    return;
  }


  /* ---------------------------------------------------------
     [인트로] 타이밍 설정
  --------------------------------------------------------- */
  const INTRO = {
    /* 영상 끝 몇 초 전에 패널을 걷을지 (끝부분 페이드 아웃 전)
       2026.10.14 : 1.0 → 0.3
       새 영상(intro-v12)은 마지막 장면이 HERO 01 과 같아서
       거의 끝까지 보여 준 뒤 겹쳐 사라지게 */
    exitBeforeEnd: 0.3,

    /* 패널이 사라지는 시간 — style.css INDEX INTRO v12 와 동일
       2026.10.14 : 위로 걷힘 0.9초 → 겹쳐 사라짐 1.1초 */
    leaveDuration:
      prefersReducedMotion
        ? 0
        : 1100,

    /* 영상이 멈추거나 로드가 안 될 때 최대 대기 시간 */
    maxDuration: 25000,
  };

  let isLeaving =
    false;


  /* ---------------------------------------------------------
     [인트로] 패널 걷기 시작
  --------------------------------------------------------- */
  function leaveIntro() {
    if (
      isLeaving
    ) {
      return;
    }

    isLeaving =
      true;

    root.classList.add("is-intro-leaving");

    window.setTimeout(
      finishIntro,
      INTRO.leaveDuration
    );
  }


  /* ---------------------------------------------------------
     [인트로] 종료 → HERO 시작
  --------------------------------------------------------- */
  function finishIntro() {
    try {
      sessionStorage.setItem(
        "dadeullim-intro-played",
        "1"
      );
    } catch (error) {}

    video.pause();

    intro.remove();

    root.classList.remove(
      "is-intro-active",
      "is-intro-leaving"
    );

    window.scrollTo(
      {
        top: 0,
        left: 0,
        behavior: "auto",
      }
    );

    /* 보류했던 HERO 01 문구 등장 */
    if (
      typeof syncCopyReveal ===
      "function"
    ) {
      window.requestAnimationFrame(
        syncCopyReveal
      );
    }
  }


  /* ---------------------------------------------------------
     [인트로] 재생
  --------------------------------------------------------- */
  video.muted =
    true;

  video.addEventListener(
    "timeupdate",
    () => {
      const duration =
        video.duration;

      if (
        Number.isFinite(duration) &&
        video.currentTime >=
          duration - INTRO.exitBeforeEnd
      ) {
        leaveIntro();
      }
    }
  );

  video.addEventListener(
    "ended",
    leaveIntro
  );

  video.addEventListener(
    "error",
    leaveIntro
  );

  const playRequest =
    video.play();

  /* 자동 재생이 막힌 경우 → 바로 HERO */
  if (
    playRequest &&
    typeof playRequest.catch ===
    "function"
  ) {
    playRequest.catch(
      leaveIntro
    );
  }

  window.setTimeout(
    leaveIntro,
    INTRO.maxDuration
  );


  /* ---------------------------------------------------------
     [인트로] SKIP / ESC
  --------------------------------------------------------- */
  if (
    skipButton
  ) {
    skipButton.addEventListener(
      "click",
      leaveIntro
    );
  }

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key ===
        "Escape"
      ) {
        leaveIntro();
      }
    }
  );

})();
