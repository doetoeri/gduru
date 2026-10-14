import { FORMAT, VERSION, uid, clone, COLORS, cleanHTML, plainHTML, textBlock, tableBlock, diagramBlock, makeDocument, starterDocuments, documentText, documentKind, normalizeDocument, parseBackup, hasPath } from './model.js';
import { MemoStore, DRAFT_PREFIX, recoverDrafts } from './storage.js';
import { renderDiagram } from './diagrams.js';
import { download, fileName, backup, toMarkdown, importText, standaloneHTML } from './export.js';

const $=id=>document.getElementById(id);
const store=new MemoStore();
let documents=new Map(),selectedId=null,current=null,activeBlockId=null,grid=false;
let undoStack=[],redoStack=[],lastGroup=null,lastGroupTime=0;
let editTick=0,savedTick=0,saveTimer=null,saving=null,composing=false,lastRange=null;
let diagramDraft=null,diagramBlockId=null,pendingDelete=null,menuAnchor=null,toastTimer=null;
let drag=null,lastDragAt=0,filtered=[],channel=null;
const draftKey=DRAFT_PREFIX+uid();
const dateShort=time=>new Date(time).toLocaleDateString('ko-KR',{month:'2-digit',day:'2-digit'}).replace(/\s/g,'').replace(/\.$/,'');
const titleOf=doc=>doc.title||'제목 없는 문서';
function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href',`#i-${name}`);svg.append(use);svg.setAttribute('aria-hidden','true');return svg;}
function iconButton(name,label){const button=el('button','icon-button');button.type='button';button.setAttribute('aria-label',label);button.append(icon(name));return button;}
function toast(message,error=false){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;$('toast').dataset.error=String(error);toastTimer=setTimeout(()=>{$('toast').hidden=true;},error?8000:4200);}
function saveStatus(message,state='saved'){$('save-status').textContent=message;$('save-status').dataset.state=state;}
function activeBlock(){return current?.blocks.find(block=>block.id===activeBlockId);}
function historyBefore(group=null){
  if(!current)return;
  if(group && group===lastGroup && Date.now()-lastGroupTime<950){lastGroupTime=Date.now();return;}
  undoStack.push(clone(current));if(undoStack.length>80)undoStack.shift();redoStack=[];lastGroup=group;lastGroupTime=Date.now();updateHistoryButtons();
}
function updateHistoryButtons(){$('undo').disabled=!undoStack.length;$('redo').disabled=!redoStack.length;}
function draft(){
  if(!current)return false;
  try{localStorage.setItem(draftKey,JSON.stringify(current));return true;}catch{return false;}
}
function changed(){
  if(!current)return;
  current.updatedAt=Date.now();editTick+=1;documents.set(current.id,clone(current));draft();saveStatus('저장 중…','saving');updateMeta();
  clearTimeout(saveTimer);saveTimer=setTimeout(()=>flush(),550);
}
async function flush(){
  clearTimeout(saveTimer);
  if(saving){await saving;if(current&&editTick!==savedTick)return flush();return true;}
  if(!current || editTick===savedTick)return true;
  const target=current, tick=editTick, originalId=current.id;
  const operation=(async()=>{
    try{
      const result=await store.save(clone(target));
      if(current===target){
        if(result.conflict){current.id=result.doc.id;current.title=result.doc.title;selectedId=current.id;const original=(await store.current()).find(doc=>doc.id===originalId);if(original)documents.set(originalId,original);$('document-title').value=current.title;toast('다른 탭의 수정본을 보존하고, 내 작업을 복사본으로 저장했어요.');}
        current.revision=result.doc.revision;documents.set(current.id,clone(current));savedTick=tick;
        if(editTick===tick){saveStatus('이 기기에 저장됨');try{localStorage.removeItem(draftKey);}catch{}}
      } else documents.set(result.doc.id,result.doc);
      channel?.postMessage({type:'changed',id:result.doc.id});return true;
    }catch(error){saveStatus('저장 실패 · 백업 필요','error');toast(error.message||'저장하지 못했어요. 문서 메뉴에서 백업을 내려받아 주세요.',true);return false;}
  })();
  saving=operation;const ok=await operation;saving=null;
  if(ok&&current===target&&editTick!==savedTick)return flush();return ok;
}
function updateMeta(){
  if(!current)return;$('editor-label').textContent=titleOf(current);$('document-meta').textContent=`${new Date(current.createdAt).toLocaleDateString('ko-KR')} 시작 · ${current.blocks.length}개 항목`;
  $('word-count').textContent=`${documentText(current).replace(/\s/g,'').length.toLocaleString()}자`;$('cover-color').style.background=COLORS[current.color];
  const style=activeBlock()?.style||'paragraph';$('text-style').value=style;updateHistoryButtons();
}
function focusText(id,end=true){
  const wrapper=[...$('blocks').children].find(node=>node.dataset.block===id),content=wrapper?.querySelector('.text-content,.cell-content');
  if(!content)return;content.focus();const range=document.createRange();range.selectNodeContents(content);range.collapse(!end);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
}
function activate(id){
  activeBlockId=id;for(const node of $('blocks').children)node.classList.toggle('is-active',node.dataset.block===id);
  const block=activeBlock();$('text-style').value=block?.style||'paragraph';
}
function coverFace(doc){
  const face=el('div','cover-face');const head=el('div','cover-heading');head.append(el('span','',documentKind(doc)),el('span','','MEMO'));face.append(head,el('h3','cover-title',titleOf(doc)));
  const firstText=doc.blocks.find(block=>block.type==='text'&&plainHTML(block.html));face.append(el('p','cover-excerpt',firstText?plainHTML(firstText.html):'나만의 생각을 담는 한 장.'));
  const preview=el('div','cover-miniature');const special=doc.blocks.find(block=>block.type!=='text');
  if(special?.type==='diagram')preview.append(renderDiagram(special,{mini:true}));
  else if(special?.type==='table'){const table=el('table','mini-table');table.setAttribute('aria-hidden','true');special.rows.slice(0,3).forEach(row=>{const tr=el('tr');row.slice(0,3).forEach(cell=>tr.append(el('td','',cell)));table.append(tr);});preview.append(table);}
  else for(let i=0;i<4;i++)preview.append(el('div','mini-line'));
  const meta=el('div','cover-meta');meta.append(el('span','cover-date',dateShort(doc.updatedAt)),el('span','',`${doc.blocks.length}개 항목`));face.append(preview,meta);return face;
}
function renderShelf(){
  const query=$('search').value.trim().toLocaleLowerCase();filtered=[...documents.values()].sort((a,b)=>b.updatedAt-a.updatedAt).filter(doc=>!query||documentText(doc).toLocaleLowerCase().includes(query));
  if(!filtered.some(doc=>doc.id===selectedId))selectedId=filtered[0]?.id||null;
  $('shelf').classList.toggle('is-grid',grid);$('view-toggle').setAttribute('aria-pressed',String(grid));$('view-toggle').setAttribute('aria-label',grid?'커버 플로우 보기':'격자 보기');$('view-toggle').replaceChildren(icon(grid?'flow':'grid'));
  const layout=grid?'grid':'flow';
  if($('covers').dataset.layout!==layout){$('covers').replaceChildren();$('covers').dataset.layout=layout;}
  const existing=new Map([...$('covers').children].map(node=>[node.dataset.id,node]));
  const retained=new Set();
  const index=filtered.findIndex(doc=>doc.id===selectedId);
  filtered.forEach((doc,i)=>{
    if(!grid&&Math.abs(i-index)>3)return;
    let button=existing.get(doc.id);const fresh=!button;retained.add(doc.id);
    if(fresh){button=el('button','cover');button.dataset.id=doc.id;button.style.transition='none';button.addEventListener('click',()=>{if(Date.now()-lastDragAt<350)return;if(grid||selectedId===doc.id)openDocument(doc.id);else{selectedId=doc.id;renderShelf();$('scene').focus({preventScroll:true});}});}
    const signature=`${doc.updatedAt}:${doc.revision}:${doc.color}:${doc.title}`;
    if(button.dataset.signature!==signature){
      button.dataset.signature=signature;button.dataset.color=doc.color;button.setAttribute('aria-label',`${titleOf(doc)}, ${documentKind(doc)}`);button.replaceChildren(coverFace(doc));
      if(!grid){const reflection=el('div','reflection');reflection.setAttribute('aria-hidden','true');reflection.append(coverFace(doc));button.append(reflection);}
    }
    $('covers').append(button);if(fresh)requestAnimationFrame(()=>requestAnimationFrame(()=>{button.style.transition='';}));
  });
  for(const [id,node] of existing)if(!retained.has(id))node.remove();
  $('empty').hidden=filtered.length>0;$('scene').hidden=!filtered.length;$('caption').hidden=!filtered.length||grid;
  if(!filtered.length){$('empty').querySelector('h2').textContent=query?'찾는 문서가 없어요.':'첫 생각을 담아 볼까?';$('empty').querySelector('p').textContent=query?'다른 제목이나 내용으로 찾아보세요.':'짧은 글에서 시작해 표와 지도로 이어가세요.';}
  $('library-status').textContent=store.mode==='memory'?`임시 작업 중 · ${documents.size}개 · 백업 필요`:`이 기기에 저장 · ${documents.size}개`;
  transformCovers();
}
function transformCovers(delta=0){
  const index=filtered.findIndex(doc=>doc.id===selectedId);
  for(const node of $('covers').children){const i=filtered.findIndex(doc=>doc.id===node.dataset.id),offset=i-index,distance=Math.abs(offset);const card=parseFloat(getComputedStyle(node).width);const x=offset===0?delta:Math.sign(offset)*(card*.65+(distance-1)*card*.35)+delta;
    node.style.setProperty('--x',`${x}px`);node.style.setProperty('--z',`${offset===0?5:-card*.27-distance*8}px`);node.style.setProperty('--rotate',`${offset===0?0:-Math.sign(offset)*54}deg`);node.style.zIndex=String(60-distance);node.style.opacity=distance>3?'0':distance===3?'.5':'1';node.setAttribute('aria-pressed',String(!offset));node.tabIndex=grid||!offset?0:-1;
  }
  const selected=filtered[index];if(selected){$('selected-title').textContent=titleOf(selected);$('selected-kind').textContent=`${documentKind(selected)} · ${index+1} / ${filtered.length}`;}
  $('previous').disabled=index<=0;$('next').disabled=index>=filtered.length-1;
}
function moveSelection(direction){const index=filtered.findIndex(doc=>doc.id===selectedId),next=Math.max(0,Math.min(filtered.length-1,index+direction)),focused=$('scene').contains(document.activeElement);if(filtered[next]&&next!==index){selectedId=filtered[next].id;renderShelf();if(focused)$('scene').focus({preventScroll:true});}}
async function openDocument(id,{focusTitle=false}={}){
  if(current)await flush();const doc=documents.get(id);if(!doc)return;closeMenu();current=clone(doc);selectedId=id;activeBlockId=null;undoStack=[];redoStack=[];lastGroup=null;editTick=0;savedTick=0;lastRange=null;
  $('library').hidden=true;$('editor').hidden=false;$('document-title').value=current.title;document.title=`${titleOf(current)} · memo`;renderBlocks();updateMeta();saveStatus(store.mode==='memory'?'임시 작업 · 백업 필요':'이 기기에 저장됨',store.mode==='memory'?'error':'saved');window.scrollTo(0,0);
  if(focusTitle||!current.title)$('document-title').focus();else $('back-library').focus({preventScroll:true});
}
async function showLibrary(){await flush();current=null;activeBlockId=null;$('editor').hidden=true;$('library').hidden=false;document.title='memo · gduru';closeMenu();renderShelf();$('scene').focus({preventScroll:true});}
async function createDocument(template){
  $('create-dialog').close();if(current)await flush();const doc=makeDocument(template);documents.set(doc.id,doc);
  try{const {doc:saved}=await store.save(doc);documents.set(saved.id,saved);}catch(error){toast(error.message,true);}
  await openDocument(doc.id,{focusTitle:true});
}
function addBlock(kind,style='paragraph'){
  if(!current)return;if(current.blocks.length>=500){toast('문서 하나에 500개 항목까지 담을 수 있어요.');return;}
  historyBefore();const block=kind==='text'?textBlock('',style):kind==='table'?tableBlock():diagramBlock(kind);
  const index=current.blocks.findIndex(item=>item.id===activeBlockId);current.blocks.splice(index>=0?index+1:current.blocks.length,0,block);activeBlockId=block.id;renderBlocks();changed();
  const node=[...$('blocks').children].find(node=>node.dataset.block===block.id);node?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  if(kind==='text')focusText(block.id);else if(kind==='table')node?.querySelector('.cell-content')?.focus();else openDiagram(block.id);
}
function richEditable(block){
  const content=el('div','text-content');content.dataset.style=block.style;content.dataset.placeholder=block.style==='heading'?'큰 제목':block.style==='subheading'?'작은 제목':'여기에 생각을 적어 보세요.';content.contentEditable='true';content.setAttribute('role','textbox');content.setAttribute('aria-multiline','true');content.setAttribute('aria-label',({heading:'큰 제목',subheading:'작은 제목',check:'할 일',quote:'인용'})[block.style]||'문서 본문');content.spellcheck=false;content.innerHTML=cleanHTML(block.html);
  content.addEventListener('input',()=>{if(!current)return;historyBefore(`text:${block.id}`);block.html=cleanHTML(content.innerHTML);changed();});
  content.addEventListener('keydown',event=>textKeydown(event,block,content));
  content.addEventListener('paste',event=>{event.preventDefault();historyBefore(`text:${block.id}`);const html=event.clipboardData.getData('text/html');if(html)document.execCommand('insertHTML',false,cleanHTML(html));else document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));block.html=cleanHTML(content.innerHTML);changed();});
  return content;
}
function renderBlocks(){
  $('blocks').replaceChildren();
  if(!current)return;
  for(const block of current.blocks){
    const wrapper=el('section','block');wrapper.dataset.block=block.id;wrapper.classList.toggle('is-active',block.id===activeBlockId);
    const tools=el('div','block-tools'),button=iconButton('more','항목 메뉴');button.addEventListener('click',()=>{activate(block.id);openBlockMenu(block,button);});tools.append(button);wrapper.append(tools);
    wrapper.addEventListener('focusin',()=>activate(block.id));wrapper.addEventListener('pointerdown',()=>activate(block.id));
    if(block.type==='text'){
      const content=richEditable(block);
      if(block.style==='check'){const check=el('div','check-content'),toggle=el('button','check-button',block.checked?'✓':'');toggle.setAttribute('role','checkbox');toggle.setAttribute('aria-label','할 일 완료');toggle.setAttribute('aria-checked',String(block.checked));toggle.addEventListener('click',()=>{historyBefore();block.checked=!block.checked;toggle.textContent=block.checked?'✓':'';toggle.setAttribute('aria-checked',String(block.checked));changed();});check.append(toggle,content);wrapper.append(check);}else wrapper.append(content);
    }else if(block.type==='table'){
      const scroll=el('div','table-wrap'),table=el('table','document-table');table.style.minWidth=`${Math.max(240,block.rows[0].length*100)}px`;table.setAttribute('aria-label','편집 가능한 표');
      block.rows.forEach((row,r)=>{const tr=el('tr');row.forEach((value,c)=>{const cell=el(block.header&&r===0?'th':'td'),content=el('div','cell-content',value);if(cell.tagName==='TH')cell.scope='col';content.contentEditable='true';content.setAttribute('role','textbox');content.setAttribute('aria-label',`${r+1}행 ${c+1}열`);content.dataset.row=r;content.dataset.col=c;content.spellcheck=false;
        content.addEventListener('focus',()=>{wrapper.dataset.row=r;wrapper.dataset.col=c;});content.addEventListener('input',()=>{historyBefore(`cell:${block.id}:${r}:${c}`);block.rows[r][c]=content.innerText.replace(/\r\n?/g,'\n');changed();});content.addEventListener('paste',event=>pasteCells(event,block,r,c,content));
        content.addEventListener('keydown',event=>{if(event.key==='Tab'&&!event.shiftKey&&r===block.rows.length-1&&c===row.length-1&&block.rows.length<150){event.preventDefault();historyBefore();block.rows.push(Array(row.length).fill(''));renderBlocks();changed();const next=[...$('blocks').children].find(node=>node.dataset.block===block.id)?.querySelector(`[data-row="${r+1}"][data-col="0"]`);next?.focus();}});
        cell.append(content);tr.append(cell);});table.append(tr);});scroll.append(table);wrapper.append(scroll);const caption=el('div','block-caption');caption.append(el('span','',`${block.rows.length}행 × ${block.rows[0].length}열`));const adjust=el('button','', '표 편집');adjust.prepend(icon('table'));adjust.addEventListener('click',()=>{activate(block.id);openBlockMenu(block,adjust);});caption.append(adjust);wrapper.append(caption);
    }else{
      const diagram=el('div','diagram-container');diagram.append(renderDiagram(block));wrapper.append(diagram);const caption=el('div','block-caption');caption.append(el('span','',`${block.mode==='mindmap'?'마인드맵':'흐름도'} · ${block.nodes.length}개 항목`));const edit=el('button','', '도식 편집');edit.prepend(icon('edit'));edit.addEventListener('click',()=>{activate(block.id);openDiagram(block.id);});caption.append(edit);wrapper.append(caption);
    }
    $('blocks').append(wrapper);
  }
  lastRange=null;updateMeta();
}
function textKeydown(event,block,content){
  if(composing||event.isComposing||event.keyCode===229)return;
  if(event.key==='Enter'&&!event.shiftKey&&!event.ctrlKey&&!event.metaKey){
    event.preventDefault();historyBefore();
    if(['bullet','ordered','check'].includes(block.style)&&!plainHTML(block.html)){block.style='paragraph';renderBlocks();changed();focusText(block.id);return;}
    if(current.blocks.length>=500){toast('500개 항목까지 담을 수 있어요.');return;}
    const selection=getSelection(),range=selection?.rangeCount?selection.getRangeAt(0):null;let after='';
    if(range&&content.contains(range.commonAncestorContainer)){range.deleteContents();const tail=range.cloneRange();tail.selectNodeContents(content);tail.setStart(range.endContainer,range.endOffset);const fragment=tail.extractContents(),temp=el('div');temp.append(fragment);after=cleanHTML(temp.innerHTML);}
    block.html=cleanHTML(content.innerHTML);const next=textBlock(after,['heading','subheading','quote'].includes(block.style)?'paragraph':block.style),index=current.blocks.indexOf(block);current.blocks.splice(index+1,0,next);activeBlockId=next.id;renderBlocks();changed();focusText(next.id,false);
  }else if(event.key==='Backspace'&&!plainHTML(block.html)&&current.blocks.length>1){
    event.preventDefault();historyBefore();const index=current.blocks.indexOf(block),previous=current.blocks[Math.max(0,index-1)];current.blocks.splice(index,1);activeBlockId=previous.id===block.id?current.blocks[0].id:previous.id;renderBlocks();changed();focusText(activeBlockId);
  }
}
function pasteCells(event,block,r,c,content){
  event.preventDefault();const text=event.clipboardData.getData('text/plain').replace(/\r\n?/g,'\n');historyBefore(`cell:${block.id}:${r}:${c}`);
  if(text.includes('\t')){
    const rows=text.replace(/\n$/,'').split('\n').map(row=>row.split('\t'));const width=Math.max(...rows.map(row=>row.length));if(r+rows.length>150||c+width>12){toast('표는 150행, 12열까지 붙여넣을 수 있어요.');return;}
    const targetWidth=Math.max(block.rows[0].length,c+width);block.rows.forEach(row=>{while(row.length<targetWidth)row.push('');});while(block.rows.length<r+rows.length)block.rows.push(Array(targetWidth).fill(''));rows.forEach((row,i)=>row.forEach((value,j)=>{block.rows[r+i][c+j]=value;}));renderBlocks();changed();
  }else{document.execCommand('insertText',false,text);block.rows[r][c]=content.innerText;changed();}
}

function closeMenu({restore=false}={}){
  $('menu').hidden=true;$('menu').replaceChildren();if(restore)menuAnchor?.focus({preventScroll:true});menuAnchor=null;
}
function openMenu(anchor,items){
  if(!$('menu').hidden&&menuAnchor===anchor){closeMenu();return;}
  closeMenu();menuAnchor=anchor;
  for(const item of items){
    if(!item){$('menu').append(el('hr'));continue;}
    const button=el('button',item.danger?'danger-item':'');button.setAttribute('role','menuitem');if(item.icon)button.append(icon(item.icon));button.append(el('span','',item.label));button.disabled=!!item.disabled;
    button.addEventListener('click',async()=>{closeMenu();try{await item.action();}catch(error){toast(error.message||'작업을 완료하지 못했어요.',true);}});$('menu').append(button);
  }
  $('menu').hidden=false;const rect=anchor.getBoundingClientRect(),height=$('menu').offsetHeight,width=$('menu').offsetWidth;
  $('menu').style.left=`${Math.max(12,Math.min(innerWidth-width-12,rect.right-width))}px`;$('menu').style.top=`${Math.max(12,Math.min(innerHeight-height-12,rect.bottom+8))}px`;
  $('menu').querySelector('button:not(:disabled)')?.focus({preventScroll:true});
}
function structural(action){historyBefore();action();renderBlocks();changed();}
function openBlockMenu(block,anchor){
  const index=current.blocks.indexOf(block),items=[];
  if(block.type==='table'){
    const wrapper=[...$('blocks').children].find(node=>node.dataset.block===block.id),row=Math.min(block.rows.length-1,Number(wrapper?.dataset.row??block.rows.length-1)),col=Math.min(block.rows[0].length-1,Number(wrapper?.dataset.col??block.rows[0].length-1));
    items.push({label:'아래에 행 추가',icon:'plus',disabled:block.rows.length>=150,action:()=>structural(()=>block.rows.splice(row+1,0,Array(block.rows[0].length).fill('')))},
      {label:'오른쪽에 열 추가',icon:'plus',disabled:block.rows[0].length>=12,action:()=>structural(()=>block.rows.forEach(cells=>cells.splice(col+1,0,'')))},
      {label:'선택한 행 삭제',icon:'trash',disabled:block.rows.length<=1,action:()=>structural(()=>block.rows.splice(row,1))},
      {label:'선택한 열 삭제',icon:'trash',disabled:block.rows[0].length<=1,action:()=>structural(()=>block.rows.forEach(cells=>cells.splice(col,1)))},
      {label:block.header?'머리글 행 끄기':'첫 행을 머리글로',icon:'table',action:()=>structural(()=>block.header=!block.header)},null);
  }
  if(block.type==='diagram')items.push({label:'항목과 연결 편집',icon:'edit',action:()=>openDiagram(block.id)},null);
  items.push({label:'위로 이동',disabled:index===0,action:()=>structural(()=>{current.blocks.splice(index,1);current.blocks.splice(index-1,0,block);})},
    {label:'아래로 이동',disabled:index===current.blocks.length-1,action:()=>structural(()=>{current.blocks.splice(index,1);current.blocks.splice(index+1,0,block);})},
    {label:'항목 복제',icon:'plus',disabled:current.blocks.length>=500,action:()=>structural(()=>{const copy=clone(block);copy.id=uid();current.blocks.splice(index+1,0,copy);activeBlockId=copy.id;})},null,
    {label:'항목 삭제',icon:'trash',danger:true,action:()=>structural(()=>{current.blocks.splice(index,1);if(!current.blocks.length)current.blocks.push(textBlock());activeBlockId=current.blocks[Math.min(index,current.blocks.length-1)].id;})});
  openMenu(anchor,items);
}
function historyMove(redo=false){
  if(!current)return;const source=redo?redoStack:undoStack,target=redo?undoStack:redoStack;if(!source.length)return;
  const revision=current.revision,id=current.id;target.push(clone(current));current=source.pop();current.id=id;current.revision=revision;lastGroup=null;$('document-title').value=current.title;
  if(!current.blocks.some(block=>block.id===activeBlockId))activeBlockId=current.blocks[0]?.id;
  renderBlocks();changed();focusText(activeBlockId);
}
function formatText(command){
  const block=activeBlock();if(block?.type!=='text')return;
  const content=[...$('blocks').children].find(node=>node.dataset.block===block.id)?.querySelector('.text-content');if(!content)return;historyBefore(`text:${block.id}`);content.focus({preventScroll:true});
  if(lastRange&&content.contains(lastRange.commonAncestorContainer)){const selection=getSelection();selection.removeAllRanges();selection.addRange(lastRange);}
  document.execCommand(command,false);block.html=cleanHTML(content.innerHTML);changed();try{$(command==='bold'?'bold':'italic').setAttribute('aria-pressed',String(document.queryCommandState(command)));}catch{}
}
function openDiagram(id){
  const block=current?.blocks.find(item=>item.id===id);if(block?.type!=='diagram')return;
  diagramBlockId=id;diagramDraft=clone(block);$('diagram-title').textContent=block.mode==='mindmap'?'마인드맵 편집':'흐름도 편집';$('diagram-error').textContent='';renderDiagramFields();$('diagram-dialog').showModal();
}
function diagramPreview(){$('diagram-preview').replaceChildren(renderDiagram(diagramDraft));}
function option(node,index){const item=el('option','',`${index+1} · ${node.label}`);item.value=node.id;return item;}
function renderDiagramFields(){
  if(!diagramDraft)return;
  $('node-fields').replaceChildren();$('edge-fields').replaceChildren();$('connections-section').hidden=diagramDraft.mode==='mindmap';$('add-node').disabled=diagramDraft.nodes.length>=36;
  diagramDraft.nodes.forEach((node,index)=>{
    const row=el('div','node-row'),number=el('span','node-number',String(index+1)),input=el('input');input.value=node.label;input.maxLength=80;input.setAttribute('aria-label',`${index+1}번 항목 이름`);
    input.addEventListener('input',()=>{node.label=input.value;diagramPreview();});input.addEventListener('change',()=>{if(!node.label.trim()){node.label='새 항목';input.value=node.label;}if(diagramDraft.mode==='flow')refreshEdgeOptions();});row.append(number,input);
    if(diagramDraft.mode==='mindmap'){
      if(index===0){const root=el('span','node-root-label','중심 생각');root.style.cssText='font-size:11px;color:#8190a6;width:116px;text-align:center';row.append(root);}
      else{const parent=el('select');parent.setAttribute('aria-label',`${index+1}번 항목의 상위 가지`);diagramDraft.nodes.forEach((candidate,i)=>{if(candidate.id!==node.id&&!hasPath(diagramDraft,node.id,candidate.id))parent.append(option(candidate,i));});parent.value=node.parent;parent.addEventListener('change',()=>{node.parent=parent.value;renderDiagramFields();});row.append(parent);}
    }
    const remove=iconButton('trash',`${index+1}번 항목 삭제`);remove.disabled=diagramDraft.nodes.length===1;
    remove.addEventListener('click',()=>{const replacement=node.parent||diagramDraft.nodes.find(item=>item.id!==node.id)?.id;diagramDraft.nodes=diagramDraft.nodes.filter(item=>item.id!==node.id);diagramDraft.nodes.forEach((item,i)=>{if(i===0&&diagramDraft.mode==='mindmap')item.parent=null;else if(item.parent===node.id)item.parent=replacement;});diagramDraft.edges=diagramDraft.edges.filter(edge=>edge.from!==node.id&&edge.to!==node.id);renderDiagramFields();});row.append(remove);$('node-fields').append(row);
  });
  if(diagramDraft.mode==='flow')renderEdgeFields();diagramPreview();
}
function refreshEdgeOptions(){if(diagramDraft?.mode==='flow')renderEdgeFields();}
function renderEdgeFields(){
  $('edge-fields').replaceChildren();$('add-edge').disabled=diagramDraft.nodes.length<2||diagramDraft.edges.length>=120;
  diagramDraft.edges.forEach((edge,index)=>{
    const row=el('div','edge-row'),from=el('select'),to=el('select');from.setAttribute('aria-label',`${index+1}번 연결 시작`);to.setAttribute('aria-label',`${index+1}번 연결 도착`);
    for(const [i,node] of diagramDraft.nodes.entries()){from.append(option(node,i));to.append(option(node,i));}from.value=edge.from;to.value=edge.to;
    const update=()=>{const previous={...edge};edge.from=from.value;edge.to=to.value;const others={...diagramDraft,edges:diagramDraft.edges.filter(item=>item!==edge)};
      if(edge.from===edge.to||hasPath(others,edge.to,edge.from)||others.edges.some(item=>item.from===edge.from&&item.to===edge.to)){
        edge.from=previous.from;edge.to=previous.to;from.value=edge.from;to.value=edge.to;$('diagram-error').textContent='같은 항목, 중복 연결, 순환 연결은 만들 수 없어요.';return;
      }
      $('diagram-error').textContent='';diagramPreview();
    };
    from.addEventListener('change',update);to.addEventListener('change',update);
    const remove=iconButton('trash',`${index+1}번 연결 삭제`);remove.addEventListener('click',()=>{diagramDraft.edges.splice(index,1);renderEdgeFields();diagramPreview();});row.append(from,el('span','','→'),to,remove);$('edge-fields').append(row);
  });
}
async function exportBackup(all=true){
  await flush();const docs=all?[...documents.values()]:current?[clone(current)]:[];
  download(backup(docs),all?`memo-backup-${new Date().toLocaleDateString('sv-SE')}.json`:`${fileName(current.title)}.memo.json`);toast(all?'전체 문서 백업을 내려받았어요.':'문서 백업을 내려받았어요.');
}
async function exportDocument(type){
  if(!current)return;await flush();const doc=clone(current);
  if(type==='markdown')download(toMarkdown(doc),`${fileName(doc.title)}.md`,'text/markdown;charset=utf-8');
  else if(type==='html'){toast('폰트를 담아 문서를 준비하고 있어요.');download(await standaloneHTML(doc),`${fileName(doc.title)}.html`,'text/html;charset=utf-8');toast('폰트와 도식을 포함한 문서를 내려받았어요.');}
  else if(type==='print'){
    let title=$('paper').querySelector('.print-title');if(!title){title=el('h1','print-title');$('document-title').after(title);}title.textContent=titleOf(current);await document.fonts.ready;document.title=titleOf(current);window.print();document.title=`${titleOf(current)} · memo`;
  }
}
async function duplicateDocument(){
  if(!current)return;await flush();const copy=clone(current);copy.id=uid();copy.title=`${titleOf(current)} (복사본)`;copy.revision=0;copy.createdAt=Date.now();copy.updatedAt=Date.now();
  const {doc}=await store.save(copy);documents.set(doc.id,doc);await openDocument(doc.id);toast('문서를 복제했어요.');
}
function askDelete(){if(!current)return;pendingDelete=current.id;$('confirm-title').textContent='문서를 삭제할까요?';$('confirm-dialog').showModal();}
async function importFiles(files){
  if(current)await flush();let count=0;
  for(const file of files){
    try{
      if(file.size>10*1024*1024)throw new Error('가져올 파일은 10MB 이하로 선택해 주세요.');
      const text=await file.text(),extension=file.name.split('.').pop().toLowerCase();
      const incoming=extension==='json'?parseBackup(JSON.parse(text)):['md','txt'].includes(extension)?[normalizeDocument(importText(text,file.name.replace(/\.[^.]+$/,''),extension==='md'))]:null;
      if(!incoming)throw new Error('memo 백업, Markdown, 텍스트 파일을 가져올 수 있어요.');
      for(const doc of incoming){doc.updatedAt=Date.now();const {doc:saved}=await store.save(doc);documents.set(saved.id,saved);selectedId=saved.id;count+=1;}
    }catch(error){toast(`${file.name}: ${error.message}`,true);}
  }
  $('import-file').value='';if(count){await showLibrary();toast(`${count}개 문서를 가져왔어요. 기존 문서는 그대로 보관돼요.`);}
}

function bindEvents(){
  document.querySelectorAll('[data-action="create"]').forEach(button=>button.addEventListener('click',()=>{$('create-dialog').showModal();}));
  document.querySelectorAll('[data-template]').forEach(button=>button.addEventListener('click',()=>createDocument(button.dataset.template)));
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});});
  $('search-toggle').addEventListener('click',()=>{const open=$('search').hidden;$('search').hidden=!open;$('search-toggle').setAttribute('aria-expanded',String(open));if(open)$('search').focus();else{$('search').value='';renderShelf();}});
  $('search').addEventListener('input',()=>renderShelf());$('search').addEventListener('keydown',event=>{if(event.key==='Escape'){$('search-toggle').click();$('search-toggle').focus();}});
  $('view-toggle').addEventListener('click',()=>{grid=!grid;renderShelf();});$('previous').addEventListener('click',()=>moveSelection(-1));$('next').addEventListener('click',()=>moveSelection(1));$('open-document').addEventListener('click',()=>{if(selectedId)openDocument(selectedId);});
  $('scene').addEventListener('keydown',event=>{if(grid)return;if(['ArrowLeft','ArrowRight','Home','End','Enter'].includes(event.key)){event.preventDefault();if(event.key==='Enter'&&event.target===$('scene'))openDocument(selectedId);else if(event.key==='Home'){selectedId=filtered[0]?.id;renderShelf();}else if(event.key==='End'){selectedId=filtered.at(-1)?.id;renderShelf();}else if(event.key.startsWith('Arrow'))moveSelection(event.key==='ArrowLeft'?-1:1);}});
  $('scene').addEventListener('pointerdown',event=>{if(grid||event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,horizontal:false};});
  window.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.horizontal&&Math.abs(dy)>Math.abs(dx)+10){drag=null;return;}if(Math.abs(dx)>10){drag.horizontal=true;drag.dx=dx;$('scene').classList.add('dragging');transformCovers(dx*.45);}});
  function endDrag(event){if(!drag||event.pointerId!==drag.id)return;const state=drag;drag=null;$('scene').classList.remove('dragging');if(state.horizontal){lastDragAt=Date.now();if(event.type!=='pointercancel'&&Math.abs(state.dx)>42)moveSelection(state.dx<0?1:-1);else transformCovers();}}
  window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);
  let wheelAt=0;$('scene').addEventListener('wheel',event=>{if(grid||Math.abs(event.deltaX)<=Math.abs(event.deltaY)||Math.abs(event.deltaX)<8)return;event.preventDefault();if(Date.now()-wheelAt<260)return;wheelAt=Date.now();moveSelection(event.deltaX>0?1:-1);},{passive:false});
  window.addEventListener('resize',()=>{transformCovers();closeMenu();});
  $('library-menu').addEventListener('click',()=>openMenu($('library-menu'),[
    {label:'파일 가져오기',icon:'upload',action:()=>$('import-file').click()},
    {label:'전체 문서 백업',icon:'download',action:()=>exportBackup(true)},null,
    {label:'저장 위치 안내',icon:'text',action:()=>toast('문서는 이 브라우저에 자동 저장돼요. 다른 기기로 옮기거나 브라우저 데이터를 지우기 전, 전체 백업을 내려받으세요.')}
  ]));
  $('back-library').addEventListener('click',showLibrary);
  $('document-title').addEventListener('input',()=>{if(!current)return;historyBefore('title');current.title=$('document-title').value;document.title=`${titleOf(current)} · memo`;changed();});
  $('document-title').addEventListener('focus',()=>{activeBlockId=null;lastRange=null;for(const block of $('blocks').children)block.classList.remove('is-active');});
  $('cover-color').addEventListener('click',()=>{historyBefore();current.color=(current.color+1)%COLORS.length;changed();});
  document.querySelectorAll('[data-insert]').forEach(button=>button.addEventListener('click',()=>addBlock(button.dataset.insert)));
  $('append-text').addEventListener('click',()=>{activeBlockId=current.blocks.at(-1)?.id;addBlock('text');});
  $('text-style').addEventListener('change',()=>{const style=$('text-style').value,block=activeBlock();if(block?.type==='text'){structural(()=>block.style=style);focusText(block.id);}else addBlock('text',style);});
  for(const command of ['bold','italic']){$(command).addEventListener('pointerdown',event=>{if(event.pointerType==='mouse')event.preventDefault();});$(command).addEventListener('click',()=>formatText(command));}
  $('editor').addEventListener('compositionstart',()=>{composing=true;});$('editor').addEventListener('compositionend',()=>{composing=false;});
  document.addEventListener('selectionchange',()=>{if(!current)return;const selection=getSelection();if(!selection?.rangeCount)return;const range=selection.getRangeAt(0);const content=range.commonAncestorContainer.nodeType===Node.ELEMENT_NODE?range.commonAncestorContainer:range.commonAncestorContainer.parentElement;if(content?.closest('.text-content')){lastRange=range.cloneRange();for(const command of ['bold','italic'])try{$(command).setAttribute('aria-pressed',String(document.queryCommandState(command)));}catch{}}});
  $('undo').addEventListener('click',()=>historyMove());$('redo').addEventListener('click',()=>historyMove(true));
  $('document-menu').addEventListener('click',()=>openMenu($('document-menu'),[
    {label:'인쇄 / PDF',icon:'download',action:()=>exportDocument('print')},
    {label:'문서 HTML 내보내기',icon:'download',action:()=>exportDocument('html')},
    {label:'Markdown 내보내기',icon:'download',action:()=>exportDocument('markdown')},
    {label:'문서 백업 (.json)',icon:'download',action:()=>exportBackup(false)},null,
    {label:'문서 복제',icon:'plus',action:duplicateDocument},
    {label:'문서 삭제',icon:'trash',danger:true,action:askDelete}
  ]));
  $('confirm-delete').addEventListener('click',async()=>{const id=pendingDelete;if(!id)return;await flush();try{await store.remove(id);documents.delete(id);try{localStorage.removeItem(draftKey);}catch{}current=null;pendingDelete=null;$('confirm-dialog').close();await showLibrary();channel?.postMessage({type:'changed',id});toast('문서를 삭제했어요.');}catch(error){toast(error.message,true);}});
  $('add-node').addEventListener('click',()=>{if(!diagramDraft||diagramDraft.nodes.length>=36)return;diagramDraft.nodes.push({id:uid(),label:'새 항목',parent:diagramDraft.mode==='mindmap'?diagramDraft.nodes[0].id:null});renderDiagramFields();$('node-fields').lastElementChild?.querySelector('input')?.select();});
  $('add-edge').addEventListener('click',()=>{
    if(!diagramDraft)return;let candidate=null;
    for(const from of diagramDraft.nodes){for(const to of diagramDraft.nodes){if(from.id!==to.id&&!hasPath(diagramDraft,to.id,from.id)&&!diagramDraft.edges.some(edge=>edge.from===from.id&&edge.to===to.id)){candidate={from:from.id,to:to.id};break;}}if(candidate)break;}
    if(!candidate){$('diagram-error').textContent='추가할 수 있는 연결이 없어요. 항목을 더하거나 기존 연결을 바꿔 주세요.';return;}diagramDraft.edges.push(candidate);renderEdgeFields();diagramPreview();
  });
  $('apply-diagram').addEventListener('click',()=>{try{const validated=normalizeDocument({...current,blocks:[diagramDraft]}).blocks[0];historyBefore();const index=current.blocks.findIndex(block=>block.id===diagramBlockId);if(index<0)return;current.blocks[index]=validated;renderBlocks();changed();$('diagram-dialog').close();}catch(error){$('diagram-error').textContent=error.message;}});
  $('import-file').addEventListener('change',event=>importFiles([...event.target.files]));
  document.addEventListener('pointerdown',event=>{if(!$('menu').hidden&&!$('menu').contains(event.target)&&!menuAnchor?.contains(event.target))closeMenu();});
  document.addEventListener('keydown',event=>{
    if(!$('menu').hidden){const buttons=[...$('menu').querySelectorAll('button:not(:disabled)')],index=buttons.indexOf(document.activeElement);if(event.key==='Escape'){event.preventDefault();closeMenu({restore:true});return;}if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();return;}if(event.key==='Tab')closeMenu();}
    if(!current||document.querySelector('dialog[open]')||composing||event.isComposing)return;
    if((event.ctrlKey||event.metaKey)&&!event.altKey){const key=event.key.toLowerCase();if(key==='s'){event.preventDefault();flush();}else if(key==='z'){event.preventDefault();historyMove(event.shiftKey);}else if(key==='y'){event.preventDefault();historyMove(true);}else if(key==='b'||key==='i'){if(activeBlock()?.type==='text'){event.preventDefault();formatText(key==='b'?'bold':'italic');}}}
  });
  window.addEventListener('beforeunload',event=>{if(current&&editTick!==savedTick&&!draft()){event.preventDefault();event.returnValue='';}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){draft();flush();}});
  window.addEventListener('pagehide',()=>{if(current&&editTick!==savedTick)draft();});
}
async function initialise(){
  bindEvents();
  try{
    await store.open();const docs=await store.load(starterDocuments());documents=new Map(docs.map(doc=>[doc.id,doc]));let recovered=0;
    for(const entry of recoverDrafts()){
      const existing=documents.get(entry.doc.id);
      if(!existing||entry.doc.updatedAt>existing.updatedAt){try{const {doc}=await store.save(entry.doc);documents.set(doc.id,doc);recovered+=1;localStorage.removeItem(entry.key);}catch{documents.set(entry.doc.id,entry.doc);}}
      else try{localStorage.removeItem(entry.key);}catch{}
    }
    if(recovered)toast(`${recovered}개 문서의 마지막 작업을 복구했어요.`);
    if(store.mode==='memory')toast('저장 공간에 접근할 수 없어요. 문서는 전체 백업으로 보관해 주세요.',true);
  }catch(error){store.mode='memory';toast(`저장된 문서를 읽지 못했어요. 기존 데이터는 보존했어요. ${error.message}`,true);}
  try{channel=new BroadcastChannel('gduru-memo-updates-v1');channel.onmessage=async()=>{try{const latest=await store.current();for(const doc of latest)if(doc.id!==current?.id)documents.set(doc.id,doc);const ids=new Set(latest.map(doc=>doc.id));for(const id of documents.keys())if(!ids.has(id)&&id!==current?.id)documents.delete(id);if(!current)renderShelf();}catch{}};}catch{}
  renderShelf();
}
initialise();
