import { coverflowMarkup, mountCoverflow, coverLightingEnabled, setCoverLightingEnabled } from './pincon/next/assessments/coverflow.js?v=20261011-tilt1';
import { assessmentCalendarMarkup, assessmentCalendarAnchor, currentCalendarMonth, seoulToday, shiftCalendarMonth, shiftCalendarDay } from './pincon/new/calendar.js?v=2';
import { captureAssessmentTiles, animateAssessmentView } from './pincon/new/view-motion.js?v=2';
import { TiltSwipe } from './pincon/new/tilt-swipe.js?v=2';
import { prepareDialog, openDialog, closeDialog } from './pincon/next/assessments/dialog-motion.js?v=2';
import { documentKind, documentText } from './model.js';

const $=id=>document.getElementById(id);
const themes=[0,2,4,3,1,5];
const calendarIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17M8 14h2M14 14h2M8 17.5h2"/></svg>';
const coversIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7.5h3v12H3zM18 7.5h3v12h-3z"/><rect x="8.5" y="4.5" width="7" height="15" rx=".8"/></svg>';
const tiltMessages={off:'휴대폰을 기울여 커버를 넘겨요. 기울일수록 더 빨라져요.',permission:'스위치를 다시 켜서 휴대폰의 기울기 사용을 허용해 주세요.',requesting:'휴대폰의 동작·방향 접근을 허용해 주세요.',paused:'설정을 닫고 휴대폰을 편하게 잡아 주세요. 그 자세가 기준이 돼요.',waiting:'휴대폰의 기울기 센서를 확인하고 있어요.',calibrating:'휴대폰을 잠깐 편하게 잡아 주세요. 지금 자세를 기준으로 맞춰요.',ready:'좌우로 기울이면 속도가 붙어요. 처음 자세로 돌리면 멈춰요.',denied:'센서 접근이 허용되지 않았어요. 브라우저에서 허용한 뒤 다시 켜 주세요.',unavailable:'이 기기나 브라우저에서는 기울기 센서를 사용할 수 없어요.',reduced:'기기의 ‘동작 줄이기’ 설정에 따라 기울기 제어를 쉬고 있어요.'};

// The PinCon renderer, physics, lighting, sensor, calendar and view-motion
// modules are mirrored without changing their implementation. This adapter
// supplies memo records and replaces assessment-specific metadata only.
export class MemoLibrary {
  constructor({getDocuments,getStorageMode,onOpen,onNew,onSelected,onBackup,onImport}){
    Object.assign(this,{getDocuments,getStorageMode,onOpen,onSelected});
    this.view='covers';this.month=currentCalendarMonth();this.selectedDay='';this.anchor={};this.signature='';this.stopMotion=()=>{};
    this.tilt=new TiltSwipe();
    this.tilt.onchange=({enabled,status})=>{
      $('tilt-enabled').checked=enabled;$('tilt-enabled').disabled=status==='requesting';
      $('tilt-status').textContent=status==='paused'&&this.view==='calendar'?'커버 보기에서 사용할 수 있어요. 돌아오면 현재 자세를 기준으로 맞춰요.':tiltMessages[status];
    };
    $('tilt-enabled').addEventListener('change',event=>this.tilt.setEnabled(event.target.checked));
    $('cover-lighting').checked=coverLightingEnabled();
    $('cover-lighting').addEventListener('change',event=>setCoverLightingEnabled(event.target.checked));
    $('startup-enabled').checked=window.PINCON_STARTUP?.enabled!==false;
    $('startup-enabled').addEventListener('change',event=>{
      const enabled=event.target.checked;
      if(window.PINCON_STARTUP){window.PINCON_STARTUP.enabled=enabled;if(!enabled)window.PINCON_STARTUP.dismiss?.();}
      try{localStorage.setItem('pincon-startup-enabled-v1',enabled?'on':'off');if(enabled)localStorage.removeItem('pincon-startup-day-v1');}catch{}
    });
    prepareDialog($('preferences'));
    $('settings').addEventListener('click',()=>{this.updateStatus();openDialog($('preferences'));});
    $('add').addEventListener('click',()=>{window.PINCON_STARTUP?.dismiss?.();onNew();});
    $('backup-action').addEventListener('click',onBackup);$('import-action').addEventListener('click',onImport);
    $('search').addEventListener('input',()=>this.render());
    $('view-toggle').addEventListener('click',()=>this.toggleView());
    this.observer=new MutationObserver(()=>this.syncActivity());
    for(const dialog of document.querySelectorAll('dialog'))this.observer.observe(dialog,{attributes:true,attributeFilter:['open']});
    this.observer.observe($('covers'),{attributes:true,attributeFilter:['aria-busy']});
    this.selectionObserver=new MutationObserver(()=>{
      const id=$('covers').querySelector('.pc-cover[aria-pressed="true"]')?.dataset.assessmentId;
      if(id)this.onSelected?.(id);
    });
    this.selectionObserver.observe($('covers'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
    document.addEventListener('pincon-startup-end',()=>this.syncActivity());
    $('covers').addEventListener('click',event=>this.calendarClick(event));
    $('covers').addEventListener('focusin',event=>{if(!event.target.matches('.pc-calendar-number'))return;$('covers').querySelectorAll('.pc-calendar-number').forEach(button=>button.tabIndex=button===event.target?0:-1);});
    $('covers').addEventListener('keydown',event=>this.calendarKey(event));
    this.updateViewButton();this.tilt.notify();
  }
  rows(){
    const query=$('search').value.trim().toLocaleLowerCase();
    return this.getDocuments().sort((a,b)=>b.updatedAt-a.updatedAt).filter(doc=>!query||documentText(doc).toLocaleLowerCase().includes(query)).map(doc=>({id:doc.id,detailKey:doc.id,title:doc.title||'제목 없는 문서',subject:documentKind(doc),kind:'개인 문서',dueDate:seoulToday(doc.updatedAt),createdAtMs:doc.createdAt,doc}));
  }
  updateStatus(){
    const count=this.getDocuments().length,memory=this.getStorageMode()==='memory';
    $('library-status').textContent=`${memory?'임시 작업 중 · 백업 필요':'이 기기에 저장'} · ${count}개`;
    $('preferences-status').textContent=`문서 ${count}개 · ${memory?'임시 작업 중. 백업으로 보관해 주세요.':'이 브라우저에 저장됨'}`;
    $('connection').hidden=!memory;$('connection').textContent='임시 작업 중 · 전체 백업으로 보관해 주세요.';
  }
  adapt(root,rows){
    const byId=new Map(rows.map(row=>[row.id,row.doc]));
    for(const node of root.querySelectorAll('.pc-cover,.pc-calendar-tile')){
      const doc=byId.get(node.dataset.assessmentId);if(!doc)continue;
      for(let i=0;i<6;i++)node.classList.remove(`pc-theme-${i}`);node.classList.add(`pc-theme-${themes[doc.color]}`);
      for(const face of node.querySelectorAll('.pc-face')){
        const badge=face.querySelector('.pc-deadline>span:last-child');if(badge)badge.textContent='수정';
        const meta=face.querySelector('.pc-meta');if(meta){meta.children[0].textContent=`${doc.blocks.length}개 항목`;meta.children[1].textContent='이 기기에 저장';}
      }
    }
    root.querySelector('.pc-flow')?.setAttribute('aria-label','개인 문서');
    root.querySelector('.pc-scene')?.setAttribute('aria-label','문서 커버플로우. 좌우 드래그 또는 방향키로 선택하고 가운데 커버를 누르면 문서를 엽니다.');
    const empty=root.querySelector('.pc-flow-empty p,.pc-calendar-empty');if(empty)empty.textContent=$('search').value.trim()?'찾는 문서가 없습니다.':'저장된 문서가 없습니다. 오른쪽 아래 ＋로 시작하세요.';
    const grid=root.querySelector('.pc-calendar-grid');if(grid)grid.setAttribute('aria-label',`${this.month} 문서 수정일`);
    for(const button of root.querySelectorAll('.pc-calendar-number,.pc-calendar-more'))button.setAttribute('aria-label',button.getAttribute('aria-label').replace(/수행평가/g,'문서'));
    const noDate=root.querySelector('.pc-calendar-unscheduled h2');if(noDate)noDate.firstChild.textContent='날짜 확인 필요 ';
    const emptyDay=root.querySelector('.pc-calendar-agenda .muted');if(emptyDay)emptyDay.textContent='이날 수정한 문서가 없습니다.';
  }
  render({transition=false,focusId=''}={}){
    const rows=this.rows(),next=JSON.stringify([this.view,this.month,this.selectedDay,this.anchor.id,this.anchor.date,$('search').value,rows.map(row=>[row.id,row.title,row.subject,row.dueDate,row.doc.updatedAt,row.doc.revision,row.doc.color,row.doc.blocks.length])]);
    if(next!==this.signature){
      const before=transition?captureAssessmentTiles($('covers')):[];this.stopMotion();
      const scrollTop=$('covers').querySelector('.pc-calendar')?.scrollTop||0;this.signature=next;
      $('covers').innerHTML=this.view==='calendar'?assessmentCalendarMarkup(rows,this.month,this.selectedDay,undefined,this.anchor):coverflowMarkup(rows,'memo-personal');
      this.adapt($('covers'),rows);$('covers').setAttribute('aria-label',this.view==='calendar'?'문서 수정일 달력':'문서 커버플로우');
      if(window.PINCON_STARTUP?.mode==='full'&&!window.PINCON_STARTUP.finished)document.documentElement.style.setProperty('--pc-startup-elapsed',`${performance.now()-window.PINCON_STARTUP.startAt}ms`);
      mountCoverflow($('covers'),(id,trigger)=>{this.stopMotion();this.onOpen(id,trigger);},{startup:window.PINCON_STARTUP,tilt:this.tilt});
      if(transition&&this.view==='calendar'&&this.anchor.id){
        const target=$('covers').querySelector('[data-calendar-anchor="true"]'),calendar=$('covers').querySelector('.pc-calendar');
        if(target&&calendar){const rect=target.getBoundingClientRect(),bounds=calendar.getBoundingClientRect();if(rect.bottom>bounds.bottom-88||rect.top<bounds.top+16)calendar.scrollTop+=rect.top-bounds.top-Math.max(24,(calendar.clientHeight-rect.height)/2);}
      }
      if(transition)this.stopMotion=animateAssessmentView($('covers'),before);else if(this.view==='calendar')$('covers').querySelector('.pc-calendar')?.scrollTo(0,scrollTop);
    }
    if(focusId&&this.view==='covers')this.focusId(focusId);
    this.updateStatus();this.syncActivity();
  }
  focusId(id){
    const scene=$('covers').querySelector('.pc-scene');if(!scene)return;
    const cards=[...scene.querySelectorAll('.pc-cover')],index=cards.findIndex(card=>card.dataset.assessmentId===id),selected=cards.findIndex(card=>card.getAttribute('aria-pressed')==='true');
    if(index<0||index===selected)return;
    scene.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));
    for(let i=0;i<index;i++)scene.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  }
  syncActivity(){
    this.tilt.setActive(this.view==='covers'&&!$('covers').hasAttribute('aria-busy')&&!document.querySelector('dialog[open]')&&window.PINCON_STARTUP?.finished!==false);this.tilt.notify();
  }
  updateViewButton(){
    $('view-toggle').innerHTML=this.view==='calendar'?coversIcon:calendarIcon;const label=this.view==='calendar'?'커버 보기':'달력 보기';$('view-toggle').setAttribute('aria-label',label);$('view-toggle').setAttribute('title',label);
  }
  toggleView(){
    window.PINCON_STARTUP?.dismiss?.();
    if(this.view==='covers'){const selected=$('covers').querySelector('.pc-cover[aria-pressed="true"]');this.anchor=assessmentCalendarAnchor(this.rows(),selected?.dataset.assessmentId);this.month=this.anchor.month;this.selectedDay='';}
    this.view=this.view==='covers'?'calendar':'covers';this.updateViewButton();this.render({transition:true});$('view-status').textContent=this.view==='calendar'?`${Number(this.month.slice(0,4))}년 ${Number(this.month.slice(5))}월 달력 보기`:'커버 보기';
  }
  calendarClick(event){
    if(this.view!=='calendar')return;
    const navigation=event.target.closest('[data-calendar-month]');
    if(navigation){const value=navigation.dataset.calendarMonth;this.month=value==='today'?currentCalendarMonth():shiftCalendarMonth(this.month,Number(value));this.selectedDay='';this.anchor={};this.render({transition:true});$('covers').querySelector(`[data-calendar-month="${value}"]`)?.focus({preventScroll:true});return;}
    const day=event.target.closest('[data-calendar-day]');
    if(day){this.selectedDay=day.dataset.calendarDay;this.render();const heading=$('calendar-day-title');heading?.focus({preventScroll:true});heading?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
    const tile=event.target.closest('.pc-calendar-tile');if(tile)this.onOpen(tile.dataset.assessmentId,tile);
  }
  calendarKey(event){
    if(!event.target.matches('.pc-calendar-number')||event.ctrlKey||event.metaKey||event.altKey)return;
    const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key];if(!delta)return;
    event.preventDefault();const date=shiftCalendarDay(event.target.dataset.calendarDay,delta);if(!$('covers').querySelector(`.pc-calendar-number[data-calendar-day="${date}"]`)){this.month=date.slice(0,7);this.selectedDay='';this.render();}$('covers').querySelector(`.pc-calendar-number[data-calendar-day="${date}"]`)?.focus({preventScroll:true});
  }
}
