const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const coordsEl = document.getElementById('coords');
const btnRole = document.getElementById('btn-role');
const btnSensor = document.getElementById('btn-sensor');

let isHub = true; 
let viewport = { x: 0, y: 0 }; 
let isDrawing = false;
let currentStroke = [];
let globalDrawingData = [];

// 1. 화면 해상도 및 캔버스 초기화
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}
window.addEventListener('resize', resizeCanvas);

// 2. 역할 체인지 (외부 의존성 없이 즉각 작동)
function toggleRole() {
    isHub = !isHub;
    btnRole.innerText = `모드: ${isHub ? '메인 허브 (태블릿)' : '이동식 렌즈 (폰)'}`;
    btnSensor.style.display = isHub ? 'none' : 'block';
    
    if (!isHub) {
        document.body.style.background = "#181824";
        statusEl.innerText = "상태: 이동식 렌즈 모드 (센서를 켜세요)";
    } else {
        document.body.style.background = "#0f0f16";
        viewport = { x: 0, y: 0 };
        statusEl.innerText = "상태: 단독 구동 모드 활성화";
    }
    render();
}

// 3. 안드로이드 자이로/가속도 센서 활성화 (오프라인/단독 구동 보장)
function initSensor() {
    if (window.DeviceTemplate !== undefined || 'DeviceMotionEvent' in window) {
        window.addEventListener('devicemotion', (event) => {
            if (isHub) return;

            // 안드로이드 중력가속도 벡터값 추출
            const accX = event.accelerationIncludingGravity.x || 0;
            const accY = event.accelerationIncludingGravity.y || 0;

            // 스마트폰을 책상에서 미는 방향에 맞게 뷰포트 좌표 가감
            viewport.x += accX * 2.5;
            viewport.y -= accY * 2.5;

            coordsEl.innerText = `가상 좌표: (${Math.round(viewport.x)}, ${Math.round(viewport.y)})`;
            render();
        });
        btnSensor.innerText = "공간 센서 작동 중";
        btnSensor.style.background = "#10b981";
        statusEl.innerText = "상태: 스마트폰 이동 감지 중";
    } else {
        alert("이 브라우저 또는 기기는 모션 센서를 지원하지 않습니다.");
    }
}

// 4. 초정밀 S Pen 및 드로잉 이벤트 (PointerEvents API)
canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    const pressure = e.pressure > 0 ? e.pressure : 0.5;
    
    const absX = e.clientX + viewport.x;
    const absY = e.clientY + viewport.y;
    currentStroke = [{ x: absX, y: absY, p: pressure }];
});

canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    
    const absX = e.clientX + viewport.x;
    const absY = e.clientY + viewport.y;
    const pressure = e.pressure > 0 ? e.pressure : 0.5;
    
    currentStroke.push({ x: absX, y: absY, p: pressure });
    render();
    drawStroke(currentStroke, viewport.x, viewport.y, isHub ? '#3b82f6' : '#10b981');
});

canvas.addEventListener('pointerup', () => {
    if (!isDrawing) return;
    isDrawing = false;
    
    if (currentStroke.length > 0) {
        globalDrawingData.push({
            points: currentStroke,
            color: isHub ? '#3b82f6' : '#10b981'
        });
    }
    currentStroke = [];
    render();
});

// 5. 무한 캔버스 렌더링 엔진
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 80;
    
    const startX = -viewport.x % gridSize;
    const startY = -viewport.y % gridSize;
    
    for (let x = startX; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    globalDrawingData.forEach(stroke => {
        drawStroke(stroke.points, viewport.x, viewport.y, stroke.color);
    });
}

function drawStroke(points, offsetX, offsetY, color) {
    if (points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 1; i < points.length; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i-1].x - offsetX, points[i-1].y - offsetY);
        ctx.lineTo(points[i].x - offsetX, points[i].y - offsetY);
        ctx.lineWidth = points[i].p * 8; 
        ctx.stroke();
    }
}

// 초기화
resizeCanvas();
