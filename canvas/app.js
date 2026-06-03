const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const coordsEl = document.getElementById('coords');
const btnRole = document.getElementById('btn-role');
const btnConnect = document.getElementById('btn-connect');
const btnSensor = document.getElementById('btn-sensor');
const peerIdBox = document.getElementById('peer-id-box');

let isHub = true; 
let viewport = { x: 0, y: 0 }; 
let isDrawing = false;
let currentStroke = [];
let globalDrawingData = [];
let peer = null;
let conn = null;

// 1. 화면 해상도 및 캔버스 초기화
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}
window.addEventListener('resize', resizeCanvas);

// 2. PeerJS 기반 초저지연 P2P(WebRTC) 설정
function initP2P() {
    // 무작위 숏코드로 ID 생성 (안드로이드에서 타이핑하기 편하도록)
    const myId = 'sw-' + Math.floor(1000 + Math.random() * 9000);
    peer = new Peer(myId);

    peer.on('open', (id) => {
        statusEl.innerText = isHub ? "상태: 연결 대기 중 (허브)" : "상태: 허브 연결 준비 완료";
        if(isHub) {
            peerIdBox.style.display = 'block';
            peerIdBox.innerText = `현재 허브 ID: ${id}`;
        }
    });

    // 허브일 때: 스마트폰(렌즈)의 접속을 수락
    peer.on('connection', (connection) => {
        conn = connection;
        setupConnection();
    });
}

function connectToHub() {
    const targetId = prompt("연결할 메인 허브 ID를 입력하세요:");
    if (!targetId) return;
    
    statusEl.innerText = "허브 연결 시도 중...";
    conn = peer.connect(targetId);
    setupConnection();
}

function setupConnection() {
    conn.on('open', () => {
        statusEl.innerText = "상태: 기기 상호 연동 성공!";
        peerIdBox.style.display = 'none';
    });

    conn.on('data', (data) => {
        if (data.type === 'MOVE') {
            // 허브가 스마트폰의 위치 데이터(상대 좌표)를 받아 기록 (나중에 폰 위치 가이드 표시용)
            coordsEl.innerText = `렌즈 가상 좌표: (${Math.round(data.x)}, ${Math.round(data.y)})`;
        } else if (data.type === 'DRAW') {
            globalDrawingData.push(data.stroke);
            render();
        }
    });
}

// 3. 역할 체인지 (태블릿 모드 <-> 스마트폰 모드)
function toggleRole() {
    isHub = !isHub;
    btnRole.innerText = `모드: ${isHub ? '메인 허브 (태블릿)' : '이동식 렌즈 (폰)'}`;
    btnConnect.style.display = isHub ? 'none' : 'block';
    btnSensor.style.display = isHub ? 'none' : 'block';
    
    if (!isHub) {
        document.body.style.background = "#181824";
        peerIdBox.style.display = 'none';
        statusEl.innerText = "상태: 허브 연결 준비 완료";
    } else {
        document.body.style.background = "#0f0f16";
        viewport = { x: 0, y: 0 };
        if(peer) {
            peerIdBox.style.display = 'block';
            peerIdBox.innerText = `현재 허브 ID: ${peer.id}`;
        }
    }
    render();
}

// 4. 안드로이드 자이로/가속도 센서 활성화 및 가상 캔버스 매핑
function initSensor() {
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            if (isHub) return;

            // 안드로이드 중력가속도 벡터값 추출
            const accX = event.accelerationIncludingGravity.x || 0;
            const accY = event.accelerationIncludingGravity.y || 0;

            // 스마트폰을 책상에서 미는 방향에 맞게 뷰포트 좌표 가감 (감도 조절 가능)
            viewport.x += accX * 2.5;
            viewport.y -= accY * 2.5;

            coordsEl.innerText = `가상 좌표: (${Math.round(viewport.x)}, ${Math.round(viewport.y)})`;

            // 나의 위치 변화를 실시간으로 허브에 전송
            if (conn && conn.open) {
                conn.send({ type: 'MOVE', x: viewport.x, y: viewport.y });
            }
            render();
        });
        btnSensor.innerText = "공간 센서 작동 중";
        btnSensor.style.background = "#10b981";
    } else {
        alert("이 기기는 모션 센서를 지원하지 않습니다.");
    }
}

// 5. 초정밀 S Pen 및 드로잉 이벤트 (PointerEvents API의 압력 센서 활용)
canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    // S Pen의 압력 값 감지 (기본 마우스나 손가락은 0.5 또는 0으로 처리됨)
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
    // 현재 내가 그리는 선 임시 렌더링
    drawStroke(currentStroke, viewport.x, viewport.y, isHub ? '#3b82f6' : '#10b981');
});

canvas.addEventListener('pointerup', () => {
    if (!isDrawing) return;
    isDrawing = false;
    
    if (currentStroke.length > 0) {
        const strokeData = {
            points: currentStroke,
            color: isHub ? '#3b82f6' : '#10b981'
        };
        
        globalDrawingData.push(strokeData);
        
        // 연결된 다른 기기로 그림 데이터 실시간 동기화
        if (conn && conn.open) {
            conn.send({ type: 'DRAW', stroke: strokeData });
        }
    }
    currentStroke = [];
    render();
});

// 6. 무한 캔버스 렌더링 엔진
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 무한 공간감을 주는 격자(Grid) 가이드라인 그리기
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

    // 저장된 모든 절대 좌표 선들을 현재 뷰포트 오프셋 기준으로 상대 연산하여 렌더링
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
        // S Pen 필압에 비례하여 선 두께 실시간 확장 변조
        ctx.lineWidth = points[i].p * 8; 
        ctx.stroke();
    }
}

// 실행
resizeCanvas();
initP2P();
