'use strict';
const DATE = '2026-10-02', TZ = '+09:00';
// Keep the existing itinerary and localStorage keys so the redesign keeps user data.
const base = [
  {id:'lunch',time:'12:40',end:'13:35',title:'점심 + 시험 끝 휴식',place:'김포',icon:'🍚'},
  {id:'depart',time:'14:00',end:'14:35',title:'김포공항 출발',place:'마곡 한강버스 선착장',icon:'🚇',leave:10},
  {id:'river',time:'15:30',end:'16:17',title:'한강버스',place:'마곡 → 여의도',icon:'🚢',fixed:true,leave:20},
  {id:'picnic',time:'16:50',end:'18:15',title:'노들섬 피크닉',place:'노들섬',icon:'🧺',leave:30},
  {id:'fest',time:'18:30',end:'19:40',title:'빛섬축제',place:'노들섬',icon:'✨',fixed:true,leave:15},
  {id:'dinner',time:'19:50',end:'20:30',title:'저녁',place:'노들섬',icon:'🍜'},
  {id:'move',time:'20:50',end:'21:25',title:'남산으로 이동',place:'노들섬 → 남산케이블카',icon:'🚕',leave:10},
  {id:'cable',time:'21:25',end:'21:40',title:'남산케이블카',place:'남산',icon:'🚠',leave:5},
  {id:'namsan',time:'21:40',end:'22:20',title:'남산 야경',place:'N서울타워 주변',icon:'🗼'},
  {id:'home',time:'22:35',title:'귀가',place:'김포 방향',icon:'🏠'}
];
const $ = s => document.querySelector(s);
const money = n => '₩ ' + Math.round(n).toLocaleString('ko-KR');
const at = t => new Date(`${DATE}T${t}:00${TZ}`);
const mins = (a,b) => Math.ceil((a-b)/60000);
const timeFormat = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const dateFormat = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'});
const clock = d => timeFormat.format(d);
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(key,fallback){try{const value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value)}catch{return fallback}}
function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{toast('저장 공간을 사용할 수 없어요. 이 화면에서만 유지됩니다.');return false}}
let delay=Number(read('trip-delay',0));
if(!Number.isFinite(delay))delay=0;
delay=Math.max(-30,Math.min(90,delay));
let expenses=read('trip-expenses',[]);
expenses=Array.isArray(expenses)?expenses.filter(x=>x&&typeof x.name==='string'&&typeof x.id==='string'&&Number.isFinite(x.amount)&&x.amount>0):[];
let check=read('trip-check',{});
if(!check||typeof check!=='object'||Array.isArray(check))check={};
let budget=Number(read('trip-budget',50000));
if(!Number.isFinite(budget)||budget<=0)budget=50000;
let cat='교통',payer='me',lastNotice='',lastMinute='',toastTimer,deletedExpense=null;
const cats=['교통','식사','간식','입장·체험','기타'];
const packing=['교통카드','보조배터리','얇은 겉옷','돗자리','물','물티슈'];
function effective(){return base.map(x=>{let start=at(x.time),end=x.end?at(x.end):null;if(!x.fixed&&delay){start=new Date(+start+delay*60000);if(end)end=new Date(+end+delay*60000)}return {...x,start,end}})}
function tick(force=false){
  const now=new Date();
  $('#clock').textContent=clock(now);
  const minuteKey=Math.floor(+now/60000)+':'+delay;
  if(!force&&minuteKey===lastMinute)return;
  lastMinute=minuteKey;
  const s=effective(),ordered=[...s].sort((a,b)=>a.start-b.start),today=dateFormat.format(now);
  const active=ordered.filter(x=>x.end&&now>=x.start&&now<x.end);
  const past=ordered.filter(x=>x.start<=now);
  const current=active[active.length-1]||past[past.length-1];
  const next=ordered.find(x=>x.start>now),before=now<ordered[0].start,finished=!next&&now>=ordered[ordered.length-1].start;
  const tomorrow=dateFormat.format(new Date(+now+86400000))===DATE;
  const dayLabel=today===DATE?'오늘':tomorrow?'내일':'10월 2일';
  $('#currentIcon').textContent=finished?'🏠':current?.icon||'🗓️';
  $('#currentTitle').textContent=finished?'잘 다녀왔어요.':current?.title||'여행 전';
  $('#currentPlace').textContent=finished?'이제, 조심히 집으로.':current?.place||`${dayLabel} ${clock(ordered[0].start)}부터 시작`;
  let tone='rest',headline='',sub='';
  if(next){
    $('#nextTitle').textContent=`${next.icon} ${next.title}`;
    $('#nextTime').textContent=clock(next.start);
    $('#nextTime').dateTime=next.start.toISOString();
    const leave=new Date(+next.start-(next.leave??10)*60000),r=mins(leave,now);
    if(before&&today!==DATE){headline=`${dayLabel}, 가볍게 떠나요.`;sub=`${dayLabel} ${clock(next.start)} 첫 일정 · 준비물만 미리 챙겨 두세요.`}
    else if(r>60){headline=before?'천천히 준비해도 괜찮아요.':'조금 더 머물러도 좋아요.';sub=`${clock(leave)} 출발 권장 · 약 ${Math.floor(r/60)}시간 ${r%60}분 남았어요.`}
    else if(r>20){headline=`여기서 ${r}분 더 있어도 돼요.`;sub=`${clock(leave)}부터 이동 준비`}
    else if(r>10){tone='good';headline=`${r}분 뒤 출발 준비`;sub='아직 여유 있어요. 천천히 챙겨요.'}
    else if(r>0){tone='ready';headline=`${r}분 뒤쯤 출발해야 돼!`;sub=`${clock(leave)} 출발 권장`}
    else{tone='go';headline='지금 출발하세요.';sub=`${next.title} 시작까지 ${Math.max(0,mins(next.start,now))}분`}
    const key=next.id+'-'+r;
    if(today===DATE&&[10,5,0].includes(r)&&key!==lastNotice&&'Notification' in window&&Notification.permission==='granted'){
      lastNotice=key;
      try{new Notification(r===0?'지금 출발!':`${r}분 뒤 출발`,{body:`${next.title} · ${next.place}`});if(navigator.vibrate)navigator.vibrate(120)}catch{/* Some mobile browsers allow permissions but do not support this constructor. */}
    }
  }else{$('#nextTitle').textContent='오늘의 여행 완료';$('#nextTime').textContent='—';$('#nextTime').removeAttribute('datetime');headline='오늘 하루도, 좋은 기억으로.';sub='빠뜨린 짐은 없는지 마지막으로 확인해요.'}
  $('#statusCard').className=`paper status ${tone}`;
  $('#departHeadline').textContent=headline;$('#departSub').textContent=sub;
  const start=ordered[0].start,end=s.find(x=>x.id==='home').start,progress=Math.max(0,Math.min(100,(now-start)/(end-start)*100));
  $('#tripProgress').style.width=progress+'%';$('.progress').setAttribute('aria-valuenow',Math.round(progress));
  $('#progressText').textContent=progress===0?'아직 시작 전':progress===100?'여정 완료':Math.round(progress)+'% 지나가는 중';
  renderTimeline(now,s,current?.id);renderPlan(now,today,dayLabel);
}
function renderTimeline(now,s,currentId){
  $('#timeline').innerHTML=s.map(x=>`<div class="item ${x.end&&now>=x.end?'done':''} ${x.id===currentId&&x.end&&now<x.end?'current':''}" ${x.id===currentId&&x.end&&now<x.end?'aria-current="step"':''}><time class="tm" datetime="${x.start.toISOString()}">${clock(x.start)}</time><div class="dot" aria-hidden="true">${x.icon}</div><div class="txt"><b>${x.title}</b><span>${x.place}</span>${x.fixed?'<em class="fixed">고정</em>':''}</div></div>`).join('');
  $('#delayText').textContent=(delay>0?'+':'')+delay+'분';
}
function renderPlan(now,today,dayLabel){
  const [h,m]=clock(now).split(':').map(Number),minute=h*60+m;
  let text=`${dayLabel}은 15:30 한강버스만 놓치지 않으면 원안 그대로.`;
  if(today===DATE){if(minute<1250)text='원안 유지. 노들섬을 서두를 이유 없음.';else if(minute<1280)text='남산은 가능. 야경 체류를 30~40분으로 압축.';else if(minute<1310)text='노들섬 추가 체류는 끝. 남산케이블카로 바로 이동.';else text='남산 막차 리스크가 큼. 귀가를 우선.'}
  else if(today>DATE)text='계획과 조금 달랐어도 괜찮아. 오늘의 좋은 장면을 기억해 두기.';
  $('#planB').textContent=text;
}
function renderMoney(){
  const total=expenses.reduce((a,x)=>a+x.amount,0),shared=expenses.filter(x=>x.shared),sum=shared.reduce((a,x)=>a+x.amount,0),mine=shared.filter(x=>x.payer==='me').reduce((a,x)=>a+x.amount,0),owe=mine-sum/2,percent=Math.min(100,total/budget*100);
  $('#spent').textContent=money(total);$('#budgetText').textContent=`예산 ${money(budget)}`;
  $('#budgetBar').style.width=percent+'%';$('.budgetbar').setAttribute('aria-valuenow',Math.round(percent));
  $('.budgetbar').setAttribute('aria-valuetext',total>budget?`예산보다 ${money(total-budget)} 더 사용`:`예산의 ${Math.round(percent)}% 사용`);
  $('#settleText').textContent=owe>0?`친구 → 나 ${money(owe)}`:owe<0?`나 → 친구 ${money(Math.abs(owe))}`:'정산 완료';
  $('#receipts').innerHTML=expenses.length?expenses.slice(-4).reverse().map(x=>`<div class="receipt"><div class="receipt-copy"><span>${escapeHTML(x.cat||'기타')} · ${x.shared?'같이 쓴 돈':'개인 지출'}</span><b>${escapeHTML(x.name)}</b></div><strong>${money(x.amount)}</strong><button class="delete-expense" data-del="${escapeHTML(x.id)}" aria-label="${escapeHTML(x.name)} 지출 삭제">×</button></div>`).join(''):'<p class="receipt-empty">첫 번째 영수증을 기다리고 있어요.</p>';
}
function saveMoney(){persist('trip-expenses',expenses);renderMoney()}
function renderChecks(){
  $('#checks').innerHTML=packing.map(x=>`<label class="${check[x]?'on':''}"><input type="checkbox" data-check="${x}" ${check[x]?'checked':''}><span>${x}</span></label>`).join('');
  updateCheckCount();
}
function updateCheckCount(){$('#checkCount').textContent=`${packing.filter(x=>check[x]).length} / ${packing.length}`}
function toast(message,undo=false){
  clearTimeout(toastTimer);$('#toastText').textContent=message;$('#undoDelete').hidden=!undo;$('#toast').classList.add('on');
  toastTimer=setTimeout(()=>{$('#toast').classList.remove('on');$('#undoDelete').hidden=true;deletedExpense=null},undo?6000:3000);
}
$('#receipts').addEventListener('click',e=>{
  const button=e.target.closest('[data-del]');if(!button)return;
  const index=expenses.findIndex(x=>x.id===button.dataset.del);if(index<0)return;
  deletedExpense={item:expenses[index],index};expenses.splice(index,1);saveMoney();toast('영수증을 떼어냈어요.',true);$('#undoDelete').focus({preventScroll:true});
});
$('#undoDelete').onclick=()=>{if(!deletedExpense)return;expenses.splice(deletedExpense.index,0,deletedExpense.item);deletedExpense=null;saveMoney();toast('영수증을 다시 붙였어요.');$('#addExpense').focus({preventScroll:true})};
$('#checks').addEventListener('change',e=>{const input=e.target;if(!input.matches('[data-check]'))return;check[input.dataset.check]=input.checked;input.closest('label').classList.toggle('on',input.checked);persist('trip-check',check);updateCheckCount()});
for(const button of document.querySelectorAll('[data-delay]'))button.onclick=()=>{delay=Math.max(-30,Math.min(90,delay+Number(button.dataset.delay)));persist('trip-delay',delay);tick(true)};
$('[data-reset]').onclick=()=>{delay=0;persist('trip-delay',0);tick(true)};
function updateNotificationLabel(){if('Notification' in window&&Notification.permission==='granted')$('#notifyBtn').textContent='✓ 출발 알림 켜짐'}
$('#notifyBtn').onclick=async()=>{
  if(!('Notification' in window)){toast('이 브라우저는 알림을 지원하지 않아요. 화면의 출발 시간을 확인해 주세요.');return}
  try{const permission=await Notification.requestPermission();toast(permission==='granted'?'이 화면을 열어 두면 출발 시간을 알려드려요.':'알림 권한을 켜야 출발 알림을 받을 수 있어요.');updateNotificationLabel()}catch{toast('알림을 켤 수 없어요. 화면의 출발 시간을 확인해 주세요.')}
};
$('#cats').innerHTML=cats.map((x,i)=>`<button type="button" data-cat="${x}" class="${i===0?'sel':''}" aria-pressed="${i===0}">${x}</button>`).join('');
function selectChip(container,attribute,value){for(const button of document.querySelectorAll(`${container} button`)){const selected=button.dataset[attribute]===value;button.classList.toggle('sel',selected);button.setAttribute('aria-pressed',selected)}}
$('#cats').onclick=e=>{const b=e.target.closest('[data-cat]');if(b){cat=b.dataset.cat;selectChip('#cats','cat',cat)}};
$('#payers').onclick=e=>{const b=e.target.closest('[data-payer]');if(b){payer=b.dataset.payer;selectChip('#payers','payer',payer)}};
$('#addExpense').onclick=()=>{$('#expenseForm').reset();cat='교통';payer='me';selectChip('#cats','cat',cat);selectChip('#payers','payer',payer);$('#modal').showModal();$('#expName').focus()};
$('#closeExpense').onclick=()=>$('#modal').close();
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))$('#modal').close()});
$('#modal').addEventListener('close',()=>$('#addExpense').focus({preventScroll:true}));
$('#expenseForm').onsubmit=e=>{
  e.preventDefault();const name=$('#expName').value.trim(),amount=Number($('#expAmount').value);
  if(!name||!Number.isFinite(amount)||amount<1||amount>100000000||!Number.isInteger(amount))return;
  expenses.push({id:Date.now()+Math.random()+'',name,amount,cat,payer,shared:$('#shared').checked});saveMoney();$('#modal').close();toast('지출을 붙였어요.');
};
renderMoney();renderChecks();updateNotificationLabel();tick();
setInterval(tick,1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick(true)});
