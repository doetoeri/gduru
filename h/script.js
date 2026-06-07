// 무료 공용 시그널링 서버를 이용해 Peer 객체 생성
const peer = new Peer('chromebook-sub-monitor-unique-id'); 
const videoElement = document.getElementById('remoteVideo');
const container = document.getElementById('container');

// 📱 태블릿 설정: 신호를 기다렸다가 화면을 받음
document.getElementById('tabletBtn').addEventListener('click', () => {
    container.style.display = 'none';
    videoElement.style.display = 'block';
    
    // 크롬북이 전송하는 영상 스트림을 수신
    peer.on('call', (call) => {
        call.answer(); // 전송 수락
        call.on('stream', (remoteStream) => {
            videoElement.srcObject = remoteStream;
        });
    });
    alert('태블릿 대기 모드 시작! 이제 크롬북에서 연결하세요.');
});

// 💻 크롬북 설정: 내 화면을 캡처해서 태블릿으로 보냄
document.getElementById('chromebookBtn').addEventListener('click', async () => {
    try {
        // 크롬북 화면 캡처
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 1920, height: 1080, frameRate: 30 },
            audio: false
        });
        
        container.style.display = 'none';
        
        // 태블릿 ID로 전화(Call)를 걸어 화면 스트림 전송
        peer.call('chromebook-sub-monitor-unique-id', stream);
        
        alert('화면 전송이 시작되었습니다!');
    } catch (err) {
        console.error("화면 공유 실패:", err);
        alert("화면 공유 권한이 필요합니다.");
    }
});
