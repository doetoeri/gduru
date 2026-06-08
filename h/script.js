// 안전한 무작위 ID 생성을 위해 현재 시간 활용
const uniqueId = 'monitor-' + Math.floor(Math.random() * 100000);
let peer;
const videoElement = document.getElementById('remoteVideo');
const container = document.getElementById('container');

// 📱 태블릿 설정 (수신자)
document.getElementById('tabletBtn').addEventListener('click', () => {
    // 태블릿 전용 고유 ID로 Peer 생성
    peer = new Peer('tablet-display-target');
    
    peer.on('open', (id) => {
        container.innerHTML = `<h3>📱 태블릿 대기 중...</h3><p>이제 크롬북에서 연결 버튼을 누르세요.</p>`;
    });

    // 크롬북이 화면을 보내오면 받아서 띄우기
    peer.on('call', (call) => {
        call.answer(); // 응답
        call.on('stream', (remoteStream) => {
            container.style.display = 'none';
            videoElement.style.display = 'block';
            videoElement.srcObject = remoteStream;
        });
    });

    peer.on('error', (err) => {
        alert("태블릿 연결 오류: " + err.type);
    });
});

// 💻 크롬북 설정 (송신자)
document.getElementById('chromebookBtn').addEventListener('click', async () => {
    peer = new Peer('chromebook-sender');

    peer.on('open', async (id) => {
        try {
            // 크롬북 화면 캡처 권한 요청
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: 30 },
                audio: false
            });
            
            container.innerHTML = `<h3>💻 화면 전송 중!</h3><p>태블릿 확인해 보세요.</p>`;
            
            // 태블릿(tablet-display-target)을 향해 화면 스트림 전송
            peer.call('tablet-display-target', stream);
            
        } catch (err) {
            alert("화면 캡처 실패: " + err.message);
        }
    });

    peer.on('error', (err) => {
        alert("크롬북 연결 오류: " + err.type);
    });
});
// 안전한 무작위 ID 생성을 위해 현재 시간 활용
const uniqueId = 'monitor-' + Math.floor(Math.random() * 100000);
let peer;
const videoElement = document.getElementById('remoteVideo');
const container = document.getElementById('container');

// 📱 태블릿 설정 (수신자)
document.getElementById('tabletBtn').addEventListener('click', () => {
    // 태블릿 전용 고유 ID로 Peer 생성
    peer = new Peer('tablet-display-target');
    
    peer.on('open', (id) => {
        container.innerHTML = `<h3>📱 태블릿 대기 중...</h3><p>이제 크롬북에서 연결 버튼을 누르세요.</p>`;
    });

    // 크롬북이 화면을 보내오면 받아서 띄우기
    peer.on('call', (call) => {
        call.answer(); // 응답
        call.on('stream', (remoteStream) => {
            container.style.display = 'none';
            videoElement.style.display = 'block';
            videoElement.srcObject = remoteStream;
        });
    });

    peer.on('error', (err) => {
        alert("태블릿 연결 오류: " + err.type);
    });
});

// 💻 크롬북 설정 (송신자)
document.getElementById('chromebookBtn').addEventListener('click', async () => {
    peer = new Peer('chromebook-sender');

    peer.on('open', async (id) => {
        try {
            // 크롬북 화면 캡처 권한 요청
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: 30 },
                audio: false
            });
            
            container.innerHTML = `<h3>💻 화면 전송 중!</h3><p>태블릿 확인해 보세요.</p>`;
            
            // 태블릿(tablet-display-target)을 향해 화면 스트림 전송
            peer.call('tablet-display-target', stream);
            
        } catch (err) {
            alert("화면 캡처 실패: " + err.message);
        }
    });

    peer.on('error', (err) => {
        alert("크롬북 연결 오류: " + err.type);
    });
});
