import { clone, normalizeDocument, uid } from './model.js';

const DB_NAME = 'gduru-memo-v1';
const FALLBACK_KEY = 'gduru-memo-fallback-v1';
export const DRAFT_PREFIX = 'gduru-memo-draft-v1:';
const requestValue = request => new Promise((resolve,reject) => { request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
const complete = transaction => new Promise((resolve,reject) => { transaction.oncomplete=resolve; transaction.onabort=()=>reject(transaction.error || new Error('저장을 완료하지 못했어요.')); transaction.onerror=()=>reject(transaction.error); });

export class MemoStore {
  constructor(){ this.db=null; this.mode='memory'; this.memory=new Map(); this.error=null; }
  async open() {
    try {
      const request = indexedDB.open(DB_NAME,1);
      request.onupgradeneeded = () => { request.result.createObjectStore('documents',{keyPath:'id'}); request.result.createObjectStore('meta'); };
      this.db = await requestValue(request);
      this.db.onversionchange=()=>this.db.close();
      this.mode='indexeddb';
    } catch(error) {
      this.error=error;
      try { const key=`${FALLBACK_KEY}-probe`; localStorage.setItem(key,'1'); localStorage.removeItem(key); this.mode='local'; } catch { this.mode='memory'; }
    }
    return this;
  }
  async load(starters) {
    let raw=[], seeded=false;
    if(this.mode==='indexeddb') {
      const tx=this.db.transaction(['documents','meta'],'readonly');
      [raw,seeded]=await Promise.all([requestValue(tx.objectStore('documents').getAll()),requestValue(tx.objectStore('meta').get('seeded'))]);
    } else if(this.mode==='local') {
      const saved=localStorage.getItem(FALLBACK_KEY);
      if(saved) { const parsed=JSON.parse(saved); if(!Array.isArray(parsed.documents))throw new Error('저장된 문서를 읽을 수 없어요.'); raw=parsed.documents; seeded=true; }
    }
    if(!seeded && !raw.length) {
      raw=starters;
      if(this.mode==='indexeddb') { const tx=this.db.transaction(['documents','meta'],'readwrite'); const done=complete(tx); raw.forEach(doc=>tx.objectStore('documents').put(doc)); tx.objectStore('meta').put(true,'seeded'); await done; }
      else if(this.mode==='local') localStorage.setItem(FALLBACK_KEY,JSON.stringify({documents:raw}));
    }
    const docs=raw.map(doc=>normalizeDocument(doc));
    this.memory=new Map(docs.map(doc=>[doc.id,doc]));
    return docs;
  }
  async save(document) {
    const doc=clone(document);
    if(this.mode==='indexeddb') {
      const tx=this.db.transaction('documents','readwrite'); const done=complete(tx);
      const store=tx.objectStore('documents');
      let result;
      store.get(doc.id).onsuccess = event => {
        const current=event.target.result;
        if(current && current.revision>doc.revision) {
          // Preserve both tabs' edits. A stale tab writes a separate document.
          doc.id=uid(); doc.title=`${doc.title || '제목 없는 문서'} (복사본)`; doc.revision=0;
        }
        doc.revision+=1; store.put(doc); result={doc,conflict:doc.id!==document.id};
      };
      await done;
      this.memory.set(doc.id,clone(doc)); return result;
    }
    let conflict=false;
    if(this.mode==='local'){
      const raw=localStorage.getItem(FALLBACK_KEY);
      if(raw){const parsed=JSON.parse(raw);if(!Array.isArray(parsed.documents))throw new Error('기존 저장 데이터를 읽지 못해 저장을 중단했어요.');this.memory=new Map(parsed.documents.map(item=>{const valid=normalizeDocument(item);return [valid.id,valid];}));}
      const existing=this.memory.get(doc.id);
      if(existing&&existing.revision>doc.revision){doc.id=uid();doc.title=`${doc.title||'제목 없는 문서'} (복사본)`;doc.revision=0;conflict=true;}
    }
    doc.revision+=1;
    const next=new Map(this.memory); next.set(doc.id,doc);
    if(this.mode==='local') localStorage.setItem(FALLBACK_KEY,JSON.stringify({documents:[...next.values()]}));
    if(this.mode==='memory') throw new Error('이 브라우저에서 저장 공간에 접근할 수 없어요. 전체 백업으로 문서를 보관해 주세요.');
    this.memory=next; return {doc,conflict};
  }
  async remove(id) {
    if(this.mode==='indexeddb') { const tx=this.db.transaction('documents','readwrite');const done=complete(tx);tx.objectStore('documents').delete(id);await done; }
    const next=new Map(this.memory); next.delete(id);
    if(this.mode==='local')localStorage.setItem(FALLBACK_KEY,JSON.stringify({documents:[...next.values()]}));
    this.memory=next;
  }
  async current(){
    if(this.mode==='indexeddb'){const tx=this.db.transaction('documents','readonly');return (await requestValue(tx.objectStore('documents').getAll())).map(doc=>normalizeDocument(doc));}
    if(this.mode==='local'){const raw=localStorage.getItem(FALLBACK_KEY);if(raw)return JSON.parse(raw).documents.map(doc=>normalizeDocument(doc));}
    return [...this.memory.values()].map(clone);
  }
}
export function recoverDrafts(){
  const result=[];
  try {
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key?.startsWith(DRAFT_PREFIX))continue;
      try{result.push({key,doc:normalizeDocument(JSON.parse(localStorage.getItem(key)))});}catch{}
    }
  } catch{}
  return result;
}
