const departmentStores = [
  { id: "f1-01", name: "루미에르 갤러리아", floor: 1, category: "Luxury", x: 8, y: 10, maxCapacity: 46, currentQueue: 95, arrivalRate: 8.8, avgServiceTime: 9.5 },
  { id: "f1-02", name: "벨루아 하우스", floor: 1, category: "Luxury", x: 24, y: 10, maxCapacity: 40, currentQueue: 72, arrivalRate: 7.1, avgServiceTime: 8.8 },
  { id: "f1-03", name: "아르젠트 살롱", floor: 1, category: "Luxury", x: 40, y: 10, maxCapacity: 38, currentQueue: 64, arrivalRate: 6.4, avgServiceTime: 8.2 },
  { id: "f1-04", name: "메종 오브제", floor: 1, category: "Luxury", x: 56, y: 10, maxCapacity: 36, currentQueue: 58, arrivalRate: 5.9, avgServiceTime: 7.8 },
  { id: "f1-05", name: "오닉스 워치", floor: 1, category: "Luxury", x: 72, y: 10, maxCapacity: 34, currentQueue: 66, arrivalRate: 6.8, avgServiceTime: 9.1 },
  { id: "f1-06", name: "누아르 레더", floor: 1, category: "Luxury", x: 8, y: 24, maxCapacity: 32, currentQueue: 41, arrivalRate: 4.7, avgServiceTime: 7.3 },
  { id: "f1-07", name: "세인트 루체", floor: 1, category: "Luxury", x: 24, y: 24, maxCapacity: 30, currentQueue: 34, arrivalRate: 4.1, avgServiceTime: 6.9 },
  { id: "f1-08", name: "에클라 주얼", floor: 1, category: "Luxury", x: 40, y: 24, maxCapacity: 28, currentQueue: 44, arrivalRate: 5.3, avgServiceTime: 8.4 },
  { id: "f1-09", name: "코스메 드 파리", floor: 1, category: "Cosmetic", x: 56, y: 24, maxCapacity: 52, currentQueue: 50, arrivalRate: 6.2, avgServiceTime: 5.4 },
  { id: "f1-10", name: "글로우 랩", floor: 1, category: "Cosmetic", x: 72, y: 24, maxCapacity: 48, currentQueue: 36, arrivalRate: 4.8, avgServiceTime: 4.9 },
  { id: "f1-11", name: "아틀리에 스킨", floor: 1, category: "Cosmetic", x: 8, y: 40, maxCapacity: 44, currentQueue: 31, arrivalRate: 4.2, avgServiceTime: 4.7 },
  { id: "f1-12", name: "비바 향수관", floor: 1, category: "Cosmetic", x: 24, y: 40, maxCapacity: 42, currentQueue: 47, arrivalRate: 5.6, avgServiceTime: 5.9 },
  { id: "f1-13", name: "리추얼 뷰티", floor: 1, category: "Cosmetic", x: 40, y: 40, maxCapacity: 40, currentQueue: 22, arrivalRate: 3.6, avgServiceTime: 4.5 },
  { id: "f1-14", name: "더 브로우 바", floor: 1, category: "Cosmetic", x: 56, y: 40, maxCapacity: 28, currentQueue: 24, arrivalRate: 3.8, avgServiceTime: 6.3 },
  { id: "f1-15", name: "메이크업 스튜디오", floor: 1, category: "Cosmetic", x: 72, y: 40, maxCapacity: 36, currentQueue: 38, arrivalRate: 5.1, avgServiceTime: 6.8 },
  { id: "f1-16", name: "크리스탈 팝업", floor: 1, category: "Luxury", x: 8, y: 56, maxCapacity: 60, currentQueue: 70, arrivalRate: 7.7, avgServiceTime: 6.2 },
  { id: "f1-17", name: "라운지 101", floor: 1, category: "Service", x: 24, y: 56, maxCapacity: 62, currentQueue: 18, arrivalRate: 2.8, avgServiceTime: 3.5 },
  { id: "f1-18", name: "컨시어지 데스크", floor: 1, category: "Service", x: 40, y: 56, maxCapacity: 50, currentQueue: 20, arrivalRate: 3.1, avgServiceTime: 4.1 },
  { id: "f1-19", name: "프레스티지 클럽", floor: 1, category: "Luxury", x: 56, y: 56, maxCapacity: 44, currentQueue: 52, arrivalRate: 5.8, avgServiceTime: 8.6 },
  { id: "f1-20", name: "센트럴 게이트", floor: 1, category: "Transit", x: 72, y: 56, maxCapacity: 120, currentQueue: 40, arrivalRate: 9.2, avgServiceTime: 2.1 },

  { id: "f2-01", name: "아크 컨템포러리", floor: 2, category: "Contemporary Fashion", x: 8, y: 10, maxCapacity: 44, currentQueue: 38, arrivalRate: 5.2, avgServiceTime: 5.8 },
  { id: "f2-02", name: "모노크롬 스튜디오", floor: 2, category: "Contemporary Fashion", x: 24, y: 10, maxCapacity: 40, currentQueue: 32, arrivalRate: 4.7, avgServiceTime: 5.4 },
  { id: "f2-03", name: "시티 레이어", floor: 2, category: "Contemporary Fashion", x: 40, y: 10, maxCapacity: 42, currentQueue: 30, arrivalRate: 4.4, avgServiceTime: 5.2 },
  { id: "f2-04", name: "뉴 웨이브 셀렉트", floor: 2, category: "Contemporary Fashion", x: 56, y: 10, maxCapacity: 46, currentQueue: 48, arrivalRate: 5.9, avgServiceTime: 6.1 },
  { id: "f2-05", name: "오프 그리드", floor: 2, category: "Contemporary Fashion", x: 72, y: 10, maxCapacity: 38, currentQueue: 29, arrivalRate: 4.2, avgServiceTime: 5.5 },
  { id: "f2-06", name: "에센셜 맨즈", floor: 2, category: "Contemporary Fashion", x: 8, y: 24, maxCapacity: 42, currentQueue: 27, arrivalRate: 4.0, avgServiceTime: 5.1 },
  { id: "f2-07", name: "우먼스 아틀리에", floor: 2, category: "Contemporary Fashion", x: 24, y: 24, maxCapacity: 46, currentQueue: 43, arrivalRate: 5.4, avgServiceTime: 5.9 },
  { id: "f2-08", name: "스니커 허브", floor: 2, category: "Contemporary Fashion", x: 40, y: 24, maxCapacity: 52, currentQueue: 68, arrivalRate: 7.8, avgServiceTime: 6.6 },
  { id: "f2-09", name: "데님 랩", floor: 2, category: "Contemporary Fashion", x: 56, y: 24, maxCapacity: 36, currentQueue: 22, arrivalRate: 3.5, avgServiceTime: 5.0 },
  { id: "f2-10", name: "어반 테일러", floor: 2, category: "Contemporary Fashion", x: 72, y: 24, maxCapacity: 34, currentQueue: 25, arrivalRate: 3.8, avgServiceTime: 6.4 },
  { id: "f2-11", name: "블랙 라벨", floor: 2, category: "Contemporary Fashion", x: 8, y: 40, maxCapacity: 40, currentQueue: 35, arrivalRate: 4.8, avgServiceTime: 5.7 },
  { id: "f2-12", name: "오브젝트 룩", floor: 2, category: "Contemporary Fashion", x: 24, y: 40, maxCapacity: 38, currentQueue: 19, arrivalRate: 3.0, avgServiceTime: 4.8 },
  { id: "f2-13", name: "크리에이터스 숍", floor: 2, category: "Contemporary Fashion", x: 40, y: 40, maxCapacity: 44, currentQueue: 41, arrivalRate: 5.1, avgServiceTime: 5.6 },
  { id: "f2-14", name: "로컬 디자이너스", floor: 2, category: "Contemporary Fashion", x: 56, y: 40, maxCapacity: 35, currentQueue: 24, arrivalRate: 3.9, avgServiceTime: 5.2 },
  { id: "f2-15", name: "런웨이 포스트", floor: 2, category: "Contemporary Fashion", x: 72, y: 40, maxCapacity: 48, currentQueue: 46, arrivalRate: 5.7, avgServiceTime: 6.0 },
  { id: "f2-16", name: "키즈 컨셉", floor: 2, category: "Contemporary Fashion", x: 8, y: 56, maxCapacity: 36, currentQueue: 18, arrivalRate: 3.4, avgServiceTime: 4.9 },
  { id: "f2-17", name: "액세서리 마켓", floor: 2, category: "Contemporary Fashion", x: 24, y: 56, maxCapacity: 50, currentQueue: 33, arrivalRate: 4.6, avgServiceTime: 4.2 },
  { id: "f2-18", name: "피팅 라운지", floor: 2, category: "Service", x: 40, y: 56, maxCapacity: 54, currentQueue: 28, arrivalRate: 3.7, avgServiceTime: 3.8 },
  { id: "f2-19", name: "스타일 컨시어지", floor: 2, category: "Service", x: 56, y: 56, maxCapacity: 32, currentQueue: 21, arrivalRate: 2.9, avgServiceTime: 5.0 },
  { id: "f2-20", name: "패션 브릿지", floor: 2, category: "Transit", x: 72, y: 56, maxCapacity: 110, currentQueue: 34, arrivalRate: 8.4, avgServiceTime: 2.0 },

  { id: "f3-01", name: "라이프 큐브", floor: 3, category: "Lifestyle", x: 8, y: 10, maxCapacity: 48, currentQueue: 33, arrivalRate: 4.5, avgServiceTime: 5.0 },
  { id: "f3-02", name: "홈 리빙 아카이브", floor: 3, category: "Lifestyle", x: 24, y: 10, maxCapacity: 44, currentQueue: 29, arrivalRate: 4.0, avgServiceTime: 5.4 },
  { id: "f3-03", name: "키친 오브제", floor: 3, category: "Lifestyle", x: 40, y: 10, maxCapacity: 38, currentQueue: 24, arrivalRate: 3.5, avgServiceTime: 5.2 },
  { id: "f3-04", name: "슬립 스튜디오", floor: 3, category: "Lifestyle", x: 56, y: 10, maxCapacity: 32, currentQueue: 16, arrivalRate: 2.8, avgServiceTime: 5.8 },
  { id: "f3-05", name: "그린 오브젝트", floor: 3, category: "Lifestyle", x: 72, y: 10, maxCapacity: 42, currentQueue: 37, arrivalRate: 4.9, avgServiceTime: 5.5 },
  { id: "f3-06", name: "북 라운지 시그널", floor: 3, category: "Books", x: 8, y: 24, maxCapacity: 58, currentQueue: 54, arrivalRate: 6.1, avgServiceTime: 7.0 },
  { id: "f3-07", name: "페이지 원", floor: 3, category: "Books", x: 24, y: 24, maxCapacity: 40, currentQueue: 23, arrivalRate: 3.6, avgServiceTime: 5.7 },
  { id: "f3-08", name: "아트북 셀렉트", floor: 3, category: "Books", x: 40, y: 24, maxCapacity: 34, currentQueue: 31, arrivalRate: 4.1, avgServiceTime: 6.2 },
  { id: "f3-09", name: "매거진 클럽", floor: 3, category: "Books", x: 56, y: 24, maxCapacity: 36, currentQueue: 19, arrivalRate: 3.2, avgServiceTime: 4.6 },
  { id: "f3-10", name: "키즈 라이브러리", floor: 3, category: "Books", x: 72, y: 24, maxCapacity: 46, currentQueue: 35, arrivalRate: 4.8, avgServiceTime: 6.0 },
  { id: "f3-11", name: "테크 데스크", floor: 3, category: "Lifestyle", x: 8, y: 40, maxCapacity: 44, currentQueue: 47, arrivalRate: 5.4, avgServiceTime: 6.4 },
  { id: "f3-12", name: "오디오 살롱", floor: 3, category: "Lifestyle", x: 24, y: 40, maxCapacity: 30, currentQueue: 26, arrivalRate: 3.9, avgServiceTime: 7.2 },
  { id: "f3-13", name: "문구 실험실", floor: 3, category: "Books", x: 40, y: 40, maxCapacity: 38, currentQueue: 28, arrivalRate: 3.8, avgServiceTime: 5.3 },
  { id: "f3-14", name: "리추얼 홈", floor: 3, category: "Lifestyle", x: 56, y: 40, maxCapacity: 36, currentQueue: 20, arrivalRate: 3.2, avgServiceTime: 5.1 },
  { id: "f3-15", name: "컬처 클래스룸", floor: 3, category: "Books", x: 72, y: 40, maxCapacity: 52, currentQueue: 49, arrivalRate: 5.8, avgServiceTime: 7.5 },
  { id: "f3-16", name: "플랜트 바", floor: 3, category: "Lifestyle", x: 8, y: 56, maxCapacity: 34, currentQueue: 28, arrivalRate: 4.2, avgServiceTime: 5.9 },
  { id: "f3-17", name: "테이블웨어 갤러리", floor: 3, category: "Lifestyle", x: 24, y: 56, maxCapacity: 40, currentQueue: 22, arrivalRate: 3.4, avgServiceTime: 5.0 },
  { id: "f3-18", name: "디자인 북스", floor: 3, category: "Books", x: 40, y: 56, maxCapacity: 42, currentQueue: 34, arrivalRate: 4.5, avgServiceTime: 5.8 },
  { id: "f3-19", name: "멤버스 리딩룸", floor: 3, category: "Books", x: 56, y: 56, maxCapacity: 28, currentQueue: 15, arrivalRate: 2.4, avgServiceTime: 6.5 },
  { id: "f3-20", name: "라이프 브릿지", floor: 3, category: "Transit", x: 72, y: 56, maxCapacity: 100, currentQueue: 26, arrivalRate: 7.2, avgServiceTime: 2.0 },

  { id: "f4-01", name: "에픽 가든(Epic Garden)", floor: 4, category: "Landmark Garden", x: 28, y: 16, maxCapacity: 180, currentQueue: 210, arrivalRate: 16.5, avgServiceTime: 14.0 },
  { id: "f4-02", name: "가든 테라스 바", floor: 4, category: "Signature F&B", x: 8, y: 10, maxCapacity: 64, currentQueue: 82, arrivalRate: 8.2, avgServiceTime: 8.8 },
  { id: "f4-03", name: "루프 브런치", floor: 4, category: "Signature F&B", x: 72, y: 10, maxCapacity: 58, currentQueue: 64, arrivalRate: 7.4, avgServiceTime: 8.4 },
  { id: "f4-04", name: "오로라 디저트", floor: 4, category: "Signature F&B", x: 8, y: 24, maxCapacity: 46, currentQueue: 55, arrivalRate: 6.7, avgServiceTime: 7.2 },
  { id: "f4-05", name: "포레스트 티룸", floor: 4, category: "Signature F&B", x: 72, y: 24, maxCapacity: 52, currentQueue: 48, arrivalRate: 5.9, avgServiceTime: 7.0 },
  { id: "f4-06", name: "스카이 누들", floor: 4, category: "Signature F&B", x: 8, y: 40, maxCapacity: 54, currentQueue: 42, arrivalRate: 5.6, avgServiceTime: 6.5 },
  { id: "f4-07", name: "그릴 온 더 루프", floor: 4, category: "Signature F&B", x: 72, y: 40, maxCapacity: 62, currentQueue: 58, arrivalRate: 6.9, avgServiceTime: 8.0 },
  { id: "f4-08", name: "시그니처 베이커리", floor: 4, category: "Signature F&B", x: 8, y: 56, maxCapacity: 48, currentQueue: 46, arrivalRate: 5.8, avgServiceTime: 5.4 },
  { id: "f4-09", name: "클라우드 커피", floor: 4, category: "Signature F&B", x: 24, y: 56, maxCapacity: 50, currentQueue: 44, arrivalRate: 5.6, avgServiceTime: 4.8 },
  { id: "f4-10", name: "가든 포토 스팟", floor: 4, category: "Garden Experience", x: 40, y: 56, maxCapacity: 70, currentQueue: 76, arrivalRate: 7.9, avgServiceTime: 6.6 },
  { id: "f4-11", name: "미스트 파빌리온", floor: 4, category: "Garden Experience", x: 56, y: 56, maxCapacity: 66, currentQueue: 63, arrivalRate: 6.8, avgServiceTime: 6.1 },
  { id: "f4-12", name: "센트 가든 숍", floor: 4, category: "Garden Experience", x: 72, y: 56, maxCapacity: 36, currentQueue: 29, arrivalRate: 3.9, avgServiceTime: 5.6 },
  { id: "f4-13", name: "플로럴 아틀리에", floor: 4, category: "Garden Experience", x: 8, y: 70, maxCapacity: 34, currentQueue: 27, arrivalRate: 3.6, avgServiceTime: 5.8 },
  { id: "f4-14", name: "루프 팝업 키친", floor: 4, category: "Signature F&B", x: 24, y: 70, maxCapacity: 44, currentQueue: 39, arrivalRate: 5.1, avgServiceTime: 6.3 },
  { id: "f4-15", name: "글라스 하우스", floor: 4, category: "Garden Experience", x: 40, y: 70, maxCapacity: 58, currentQueue: 51, arrivalRate: 5.7, avgServiceTime: 7.4 },
  { id: "f4-16", name: "선셋 라운지", floor: 4, category: "Signature F&B", x: 56, y: 70, maxCapacity: 60, currentQueue: 69, arrivalRate: 7.5, avgServiceTime: 8.6 },
  { id: "f4-17", name: "가든 인포 데스크", floor: 4, category: "Service", x: 72, y: 70, maxCapacity: 48, currentQueue: 24, arrivalRate: 3.1, avgServiceTime: 3.8 },
  { id: "f4-18", name: "웨이팅 라운지", floor: 4, category: "Service", x: 8, y: 82, maxCapacity: 90, currentQueue: 88, arrivalRate: 8.9, avgServiceTime: 4.2 },
  { id: "f4-19", name: "루프 브릿지", floor: 4, category: "Transit", x: 40, y: 82, maxCapacity: 120, currentQueue: 45, arrivalRate: 9.8, avgServiceTime: 2.0 },
  { id: "f4-20", name: "스카이 엘리베이터", floor: 4, category: "Transit", x: 72, y: 82, maxCapacity: 120, currentQueue: 52, arrivalRate: 10.4, avgServiceTime: 2.0 },
];

const floorMeta = [
  { id: "f1", label: "1F", title: "1F Luxury / Cosmetic", gates: [{ x: 4, y: 48, label: "IN" }, { x: 94, y: 48, label: "IN" }, { x: 50, y: 4, label: "E" }, { x: 50, y: 94, label: "E" }] },
  { id: "f2", label: "2F", title: "2F Contemporary Fashion", gates: [{ x: 4, y: 48, label: "E" }, { x: 94, y: 48, label: "E" }, { x: 50, y: 4, label: "UP" }, { x: 50, y: 94, label: "DN" }] },
  { id: "f3", label: "3F", title: "3F Lifestyle / Books", gates: [{ x: 4, y: 48, label: "E" }, { x: 94, y: 48, label: "E" }, { x: 50, y: 4, label: "UP" }, { x: 50, y: 94, label: "DN" }] },
  { id: "f4", label: "4F", title: "4F Rooftop Epic Garden / Signature F&B", gates: [{ x: 6, y: 82, label: "IN" }, { x: 94, y: 82, label: "OUT" }, { x: 50, y: 6, label: "E" }, { x: 50, y: 94, label: "G" }] },
];

const floors = floorMeta.map((floor) => ({
  ...floor,
  stores: departmentStores.filter((storeItem) => storeItem.floor === Number(floor.label.replace("F", ""))),
}));

const needs = [
  { id: "Luxury", label: "명품", share: 16 },
  { id: "Cosmetic", label: "코스메틱", share: 13 },
  { id: "Contemporary Fashion", label: "패션", share: 22 },
  { id: "Lifestyle", label: "라이프", share: 12 },
  { id: "Books", label: "북스", share: 10 },
  { id: "Signature F&B", label: "F&B", share: 15 },
  { id: "Garden Experience", label: "가든", share: 8 },
  { id: "Service", label: "서비스", share: 4 },
];

const state = {
  floorIndex: 0,
  peopleCount: 90,
  rfRatio: 55,
  speed: 1,
  running: true,
  people: [],
  congestion: new Map(),
  bypassEnabled: false,
  selectedView: "overview",
  lastTime: performance.now(),
};

const floorTabs = document.querySelector("#floorTabs");
const floorTitle = document.querySelector("#floorTitle");
const floorShell = document.querySelector("#floorShell");
const peopleLayer = document.querySelector("#peopleLayer");
const routeOverlay = document.querySelector("#routeOverlay");
const peopleCount = document.querySelector("#peopleCount");
const rfRatio = document.querySelector("#rfRatio");
const speedRange = document.querySelector("#speedRange");
const peopleCountLabel = document.querySelector("#peopleCountLabel");
const rfRatioLabel = document.querySelector("#rfRatioLabel");
const speedLabel = document.querySelector("#speedLabel");
const congestionMetric = document.querySelector("#congestionMetric");
const visitorMetric = document.querySelector("#visitorMetric");
const routeFinderMetric = document.querySelector("#routeFinderMetric");
const congestionCopy = document.querySelector("#congestionCopy");
const zoneList = document.querySelector("#zoneList");
const needGrid = document.querySelector("#needGrid");
const insightList = document.querySelector("#insightList");
const pauseBtn = document.querySelector("#pauseBtn");
const resetBtn = document.querySelector("#resetBtn");
const optimizeBtn = document.querySelector("#optimizeBtn");
const exportBtn = document.querySelector("#exportBtn");
const simState = document.querySelector("#simState");
const bypassToggle = document.querySelector("#bypassToggle");
const lambdaMetric = document.querySelector("#lambdaMetric");
const littleLMetric = document.querySelector("#littleLMetric");
const waitMetric = document.querySelector("#waitMetric");
const floorMonitor = document.querySelector("#floorMonitor");
const adminControl = document.querySelector(".admin-control");

function point(x, y) {
  return { x, y };
}

function currentFloor() {
  return floors[state.floorIndex];
}

function sizeOf(storeItem) {
  if (storeItem.category === "Landmark Garden") return { w: 36, h: 26 };
  if (storeItem.category === "Transit") return { w: 12, h: 9 };
  if (storeItem.category === "Service") return { w: 11, h: 9 };
  return { w: 12, h: 10 };
}

function centerOf(storeItem) {
  const size = sizeOf(storeItem);
  return point(storeItem.x + size.w / 2, storeItem.y + size.h / 2);
}

const queueEngine = {
  bypassArrivalDrop: 0.4,
  bypassWaitDrop: 0.28,
  congestionThreshold: 1,
};

function isCongestedStore(storeItem) {
  const queuePressure = storeItem.currentQueue / Math.max(storeItem.maxCapacity, 1);
  const arrivalPressure = (storeItem.arrivalRate * storeItem.avgServiceTime) / Math.max(storeItem.maxCapacity, 1);
  return queuePressure >= queueEngine.congestionThreshold || arrivalPressure >= 0.8;
}

function calculateLittleLaw(storeItem) {
  const baseLambda = storeItem.arrivalRate;
  const baseWait = storeItem.currentQueue / Math.max(baseLambda, 0.1);
  const bypassActive = state.bypassEnabled && isCongestedStore(storeItem);
  const lambda = bypassActive ? baseLambda * (1 - queueEngine.bypassArrivalDrop) : baseLambda;
  const waitTime = bypassActive ? baseWait * (1 - queueEngine.bypassWaitDrop) : baseWait;
  const queueLength = lambda * waitTime;

  return {
    baseLambda,
    lambda,
    queueLength,
    waitTime,
    bypassActive,
  };
}

function aggregateLittleLaw(stores) {
  const metrics = stores.map(calculateLittleLaw);
  const lambda = metrics.reduce((sum, item) => sum + item.lambda, 0);
  const queueLength = metrics.reduce((sum, item) => sum + item.queueLength, 0);
  const waitTime = lambda ? queueLength / lambda : 0;
  const bypassedStores = metrics.filter((item) => item.bypassActive).length;

  return { lambda, queueLength, waitTime, bypassedStores };
}

function calculateFloorPressure(floor) {
  const metrics = floor.stores.map((storeItem) => {
    const queue = calculateLittleLaw(storeItem);
    return Math.min(100, Math.round((queue.queueLength / Math.max(storeItem.maxCapacity, 1)) * 100));
  });

  return metrics.length ? Math.round(metrics.reduce((sum, level) => sum + level, 0) / metrics.length) : 0;
}

function pickNeed() {
  const visibleCategories = new Set(currentFloor().stores.map((item) => item.category));
  const availableNeeds = needs.filter((need) => visibleCategories.has(need.id));
  const pool = availableNeeds.length ? availableNeeds : needs;
  const total = pool.reduce((sum, need) => sum + need.share, 0);
  let roll = Math.random() * total;

  for (const need of pool) {
    roll -= need.share;
    if (roll <= 0) return need.id;
  }

  return pool[0].id;
}

function pickDestination(needId) {
  const floorStores = currentFloor().stores;
  const candidates = floorStores.filter((item) => item.category === needId);
  const fallback = floorStores.filter((item) => item.category !== "Transit");
  const pool = candidates.length ? candidates : fallback;
  return pool[Math.floor(Math.random() * pool.length)];
}

function gatePoint() {
  const gates = currentFloor().gates;
  const gate = gates[Math.floor(Math.random() * gates.length)];
  return point(gate.x, gate.y);
}

function occupancyNear(pointValue, radius = 12) {
  return state.people.reduce((sum, person) => {
    const dx = person.x - pointValue.x;
    const dy = person.y - pointValue.y;
    return sum + (Math.hypot(dx, dy) < radius ? 1 : 0);
  }, 0);
}

function buildRoute(start, destination, usesRouteFinder) {
  const target = centerOf(destination);
  const candidates = [
    [start, point(16, start.y), point(16, 48), point(target.x, 48), target],
    [start, point(50, start.y), point(50, 22), point(target.x, 22), target],
    [start, point(84, start.y), point(84, 50), point(target.x, 50), target],
    [start, point(start.x, target.y), target],
  ];

  if (!usesRouteFinder) return candidates[3];

  return candidates
    .map((route) => {
      const distance = route.reduce((sum, routePoint, index) => {
        if (index === 0) return 0;
        const previous = route[index - 1];
        return sum + Math.hypot(routePoint.x - previous.x, routePoint.y - previous.y);
      }, 0);
      const crowdPenalty = route.reduce((sum, routePoint) => sum + occupancyNear(routePoint), 0);
      const queuePenalty = destination.currentQueue / Math.max(destination.maxCapacity, 1);
      const servicePenalty = destination.avgServiceTime / 4;
      return { route, score: distance + crowdPenalty * 4 + queuePenalty * 12 + servicePenalty };
    })
    .sort((a, b) => a.score - b.score)[0].route;
}

function createPerson(index) {
  const need = pickNeed();
  const destination = pickDestination(need);
  const start = gatePoint();
  const usesRouteFinder = Math.random() * 100 < state.rfRatio;
  const route = buildRoute(start, destination, usesRouteFinder);
  const element = document.createElement("span");

  element.className = usesRouteFinder ? "person rf" : "person";
  element.title = `${usesRouteFinder ? "RouteFinder" : "Direct"} · ${destination.name}`;
  element.style.left = `${start.x}%`;
  element.style.top = `${start.y}%`;
  peopleLayer.appendChild(element);

  return { id: index, need, destination, usesRouteFinder, route, segment: 0, progress: Math.random() * 0.75, speed: 0.045 + Math.random() * 0.055, x: start.x, y: start.y, element };
}

function rebuildPeople() {
  peopleLayer.innerHTML = "";
  state.people = Array.from({ length: state.peopleCount }, (_, index) => createPerson(index));
  renderRouteOverlay();
  updateStats();
}

function reroutePerson(person) {
  const start = point(person.x, person.y);
  person.need = pickNeed();
  person.destination = pickDestination(person.need);
  person.usesRouteFinder = Math.random() * 100 < state.rfRatio;
  person.route = buildRoute(start, person.destination, person.usesRouteFinder);
  person.segment = 0;
  person.progress = 0;
  person.speed = 0.045 + Math.random() * 0.055;
  person.element.className = person.usesRouteFinder ? "person rf" : "person";
  person.element.title = `${person.usesRouteFinder ? "RouteFinder" : "Direct"} · ${person.destination.name}`;
}

function movePeople(deltaSeconds) {
  for (const person of state.people) {
    const to = person.route[person.segment + 1];
    if (!to) {
      reroutePerson(person);
      continue;
    }

    person.progress += person.speed * state.speed * deltaSeconds;
    if (person.progress >= 1) {
      person.segment += 1;
      person.progress = 0;
      if (person.segment >= person.route.length - 1) {
        reroutePerson(person);
        continue;
      }
    }

    const nextFrom = person.route[person.segment];
    const nextTo = person.route[person.segment + 1];
    person.x = nextFrom.x + (nextTo.x - nextFrom.x) * person.progress;
    person.y = nextFrom.y + (nextTo.y - nextFrom.y) * person.progress;
    person.element.style.left = `${person.x}%`;
    person.element.style.top = `${person.y}%`;
  }
}

function calculateCongestion() {
  const result = new Map();

  for (const item of currentFloor().stores) {
    const c = centerOf(item);
    const movingCount = state.people.reduce((sum, person) => {
      const dx = person.x - c.x;
      const dy = person.y - c.y;
      return sum + (Math.hypot(dx, dy) < 10 ? 1 : 0);
    }, 0);
    const queueMetrics = calculateLittleLaw(item);
    const queuePressure = queueMetrics.queueLength / Math.max(item.maxCapacity, 1);
    const arrivalPressure = (queueMetrics.lambda * item.avgServiceTime) / Math.max(item.maxCapacity, 1);
    const level = Math.min(100, Math.round(queuePressure * 58 + arrivalPressure * 24 + (movingCount / item.maxCapacity) * 180));
    result.set(item.id, { count: movingCount, level, queueMetrics });
  }

  state.congestion = result;
}

function classify(level) {
  if (level >= 68) return "hot";
  if (level >= 38) return "warm";
  return "cool";
}

function renderFloor() {
  const floor = currentFloor();
  floorTitle.textContent = floor.title;
  floorShell.innerHTML = "";

  for (const item of floor.stores) {
    const size = sizeOf(item);
    const node = document.createElement("button");
    node.type = "button";
    node.className = `store store-${item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    node.dataset.storeId = item.id;
    node.style.left = `${item.x}%`;
    node.style.top = `${item.y}%`;
    node.style.width = `${size.w}%`;
    node.style.height = `${size.h}%`;
    node.innerHTML = `<span class="store-name">${item.name}</span><span class="store-count">0</span>`;
    node.addEventListener("click", () => focusStore(item));
    floorShell.appendChild(node);
  }

  for (const gate of floor.gates) {
    const node = document.createElement("span");
    node.className = "gate";
    node.style.left = `${gate.x}%`;
    node.style.top = `${gate.y}%`;
    node.textContent = gate.label;
    floorShell.appendChild(node);
  }

  const axis = document.createElement("span");
  axis.className = "corridor-label";
  axis.style.left = "42%";
  axis.style.top = "47%";
  axis.textContent = "Main Corridor";
  floorShell.appendChild(axis);
}

function renderFloorTabs() {
  floorTabs.innerHTML = floors
    .map((floor, index) => `<button class="floor-tab${index === state.floorIndex ? " active" : ""}" type="button" data-floor="${index}">${floor.label}</button>`)
    .join("");

  floorTabs.querySelectorAll("[data-floor]").forEach((button) => {
    button.addEventListener("click", () => {
      state.floorIndex = Number(button.dataset.floor);
      renderFloorTabs();
      renderFloor();
      rebuildPeople();
    });
  });
}

function renderNeedMix() {
  needGrid.innerHTML = needs.map((need) => `<article class="need-card"><strong>${need.label}</strong><span>${need.share}%</span></article>`).join("");
}

function renderRouteOverlay() {
  const routes = state.people.filter((person) => person.usesRouteFinder).slice(0, 18);
  routeOverlay.innerHTML = routes
    .map((person) => `<polyline points="${person.route.map((routePoint) => `${routePoint.x},${routePoint.y}`).join(" ")}"></polyline>`)
    .join("");
}

function updateStoreHeat() {
  floorShell.querySelectorAll(".store").forEach((node) => {
    const info = state.congestion.get(node.dataset.storeId);
    const level = info?.level ?? 0;
    node.classList.remove("hot", "warm", "cool");
    node.classList.add(classify(level));
    node.querySelector(".store-count").textContent = `${level}%`;
  });
}

function updateZoneList() {
  const rows = currentFloor().stores
    .map((item) => ({ ...item, ...(state.congestion.get(item.id) ?? { count: 0, level: 0 }) }))
    .sort((a, b) => b.level - a.level)
    .slice(0, 6);

  zoneList.innerHTML = rows
    .map((item) => `<article class="zone-row ${classify(item.level)}"><header><span>${item.name}</span><strong>${item.level}%</strong></header><div class="zone-bar"><span style="width:${item.level}%"></span></div></article>`)
    .join("");
}

function renderAdminPanel() {
  const floorMetrics = floors.map((floor) => ({
    ...floor,
    pressure: calculateFloorPressure(floor),
    queue: aggregateLittleLaw(floor.stores),
  }));
  const currentQueue = aggregateLittleLaw(currentFloor().stores);

  adminControl.classList.toggle("bypass-active", state.bypassEnabled);
  lambdaMetric.textContent = currentQueue.lambda.toFixed(1);
  littleLMetric.textContent = Math.round(currentQueue.queueLength);
  waitMetric.textContent = currentQueue.waitTime.toFixed(1);

  floorMonitor.innerHTML = floorMetrics
    .map((floor) => {
      const active = floor.id === currentFloor().id ? " active" : "";
      const bypassCopy = floor.queue.bypassedStores ? ` · ${floor.queue.bypassedStores} bypass` : "";
      return `<article class="floor-monitor-row ${classify(floor.pressure)}${active}">
        <strong>${floor.label}</strong>
        <div class="floor-monitor-bar"><i style="width:${floor.pressure}%"></i></div>
        <span>${floor.pressure}%${bypassCopy}</span>
      </article>`;
    })
    .join("");
}

function updateStats() {
  calculateCongestion();
  updateStoreHeat();
  updateZoneList();
  renderAdminPanel();

  const levels = [...state.congestion.values()].map((item) => item.level);
  const average = levels.length ? Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length) : 0;
  const hotCount = levels.filter((level) => level >= 68).length;

  congestionMetric.textContent = average;
  visitorMetric.textContent = state.peopleCount;
  routeFinderMetric.textContent = `${state.rfRatio}%`;
  peopleCountLabel.textContent = state.peopleCount;
  rfRatioLabel.textContent = `${state.rfRatio}%`;
  speedLabel.textContent = `${state.speed.toFixed(1)}x`;
  congestionCopy.textContent = hotCount ? `${hotCount}개 구역이 혼잡합니다. 대기열과 실시간 이동량을 함께 반영합니다.` : "현재 층은 안정적인 분산 흐름입니다.";
}

function renderInsights() {
  const viewLead = {
    overview: { title: "Overview 모드", body: "80개 매장의 대기열, 유입률, 평균 체류 시간을 기반으로 혼잡도를 계산합니다." },
    live: { title: "Live Flow 모드", body: "초록 점은 RouteFinder 추천 동선입니다. 혼잡 매장을 피하되 방문 목적 카테고리는 유지합니다." },
    b2b: { title: "B2B Zones 모드", body: "입점 브랜드 관점에서 대기열 압력과 공간 운영 리스크를 확인합니다." },
    b2c: { title: "B2C Routes 모드", body: "방문객의 니즈를 유지하면서 상대적으로 덜 막히는 후보 경로를 선택합니다." },
    insights: { title: "Insights 모드", body: "혼잡 상위 매장과 RouteFinder 재라우팅 판단을 요약합니다." },
  }[state.selectedView];

  const hot = [...state.congestion.entries()]
    .map(([id, info]) => ({ store: currentFloor().stores.find((item) => item.id === id), ...info }))
    .filter((item) => item.store)
    .sort((a, b) => b.level - a.level)
    .slice(0, 3);

  const items = hot.map((item) => ({
    title: `${item.store.name} 혼잡도 ${item.level}%`,
    body: `대기 ${item.store.currentQueue}명, 분당 유입 ${item.store.arrivalRate}명, 평균 처리 ${item.store.avgServiceTime}분입니다.`,
  }));

  insightList.innerHTML = [viewLead, ...items]
    .map((item) => `<article class="insight-card"><strong>${item.title}</strong><p>${item.body}</p></article>`)
    .join("");
}

function focusStore(storeItem) {
  insightList.innerHTML = `<article class="insight-card"><strong>${storeItem.name}</strong><p>${storeItem.floor}층 · ${storeItem.category} · 최대 수용 ${storeItem.maxCapacity}명 · 현재 대기 ${storeItem.currentQueue}명. RouteFinder는 같은 목적군 안에서 덜 혼잡한 동선을 우선 계산합니다.</p></article>`;
}

function optimizeRoutes() {
  state.rfRatio = Math.min(100, state.rfRatio + 15);
  rfRatio.value = state.rfRatio;

  for (const person of state.people) {
    if (Math.random() * 100 < state.rfRatio) {
      person.usesRouteFinder = true;
      person.route = buildRoute(point(person.x, person.y), person.destination, true);
      person.segment = 0;
      person.progress = 0;
      person.element.className = "person rf";
    }
  }

  renderRouteOverlay();
  updateStats();
  renderInsights();
}

function exportSnapshot() {
  const payload = {
    floor: currentFloor().title,
    stores: currentFloor().stores,
    people: state.peopleCount,
    routeFinderUse: state.rfRatio,
    dynamicBypass: state.bypassEnabled,
    littleLaw: aggregateLittleLaw(currentFloor().stores),
    congestion: [...state.congestion.entries()],
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "routefinder-snapshot.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function bindControls() {
  peopleCount.addEventListener("input", () => {
    state.peopleCount = Number(peopleCount.value);
    rebuildPeople();
  });

  rfRatio.addEventListener("input", () => {
    state.rfRatio = Number(rfRatio.value);
    rebuildPeople();
  });

  speedRange.addEventListener("input", () => {
    state.speed = Number(speedRange.value);
    updateStats();
  });

  bypassToggle.addEventListener("change", () => {
    state.bypassEnabled = bypassToggle.checked;
    updateStats();
    renderInsights();
  });

  pauseBtn.addEventListener("click", () => {
    state.running = !state.running;
    pauseBtn.textContent = state.running ? "Pause" : "Resume";
    simState.textContent = state.running ? "RUNNING" : "PAUSED";
  });

  resetBtn.addEventListener("click", rebuildPeople);
  optimizeBtn.addEventListener("click", optimizeRoutes);
  exportBtn.addEventListener("click", exportSnapshot);

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-view]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.selectedView = button.dataset.view;
      renderInsights();
    });
  });

  document.querySelector("[data-action='overview']").addEventListener("click", (event) => {
    event.preventDefault();
    state.selectedView = "overview";
    document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item.dataset.view === "overview"));
    renderInsights();
  });
}

function tick(time) {
  const deltaSeconds = Math.min(0.08, (time - state.lastTime) / 1000) * 60;
  state.lastTime = time;

  if (state.running) {
    movePeople(deltaSeconds);
    updateStats();
    if (Math.floor(time / 1000) % 3 === 0) {
      renderRouteOverlay();
      renderInsights();
    }
  }

  requestAnimationFrame(tick);
}

renderFloorTabs();
renderNeedMix();
renderFloor();
bindControls();
rebuildPeople();
renderInsights();
requestAnimationFrame(tick);
