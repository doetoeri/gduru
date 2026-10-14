export const FORMAT = 'gduru-memo';
export const VERSION = 1;
export const uid = () => crypto.randomUUID?.() || `m${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
export const clone = value => structuredClone(value);
export const COLORS = ['#b7caeb', '#b8d6ca', '#c9c1e6', '#dfc5a1', '#e3bed1', '#b6c3d4'];
export const STYLES = ['paragraph', 'heading', 'subheading', 'bullet', 'ordered', 'check', 'quote'];
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);

// Stored and imported rich text always passes this small allowlist. Diagrams
// are data, never executable SVG, HTML, Mermaid, or imported script.
export function cleanHTML(value) {
  const parsed = new DOMParser().parseFromString(String(value || ''), 'text/html');
  const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'BR', 'A', 'DIV', 'P']);
  const blocked = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TEMPLATE', 'LINK', 'META']);
  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE || blocked.has(node.tagName)) return document.createDocumentFragment();
    const output = allowed.has(node.tagName) ? document.createElement(node.tagName.toLowerCase()) : document.createDocumentFragment();
    if (node.tagName === 'A' && output.nodeType === Node.ELEMENT_NODE) {
      const href = node.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) { output.setAttribute('href', href); output.setAttribute('rel', 'noopener noreferrer'); }
    }
    for (const child of node.childNodes) output.append(clean(child));
    return output;
  }
  const container = document.createElement('div');
  for (const child of parsed.body.childNodes) container.append(clean(child));
  return container.innerHTML;
}
export function plainHTML(html) {
  const node = document.createElement('div');
  node.innerHTML = cleanHTML(html);
  for (const br of node.querySelectorAll('br')) br.replaceWith('\n');
  for (const el of node.querySelectorAll('div,p')) el.append('\n');
  return node.textContent.trim();
}
export const textBlock = (html = '', style = 'paragraph') => ({ id:uid(), type:'text', style, html:cleanHTML(html), checked:false });
export const tableBlock = () => ({ id:uid(), type:'table', header:true, rows:[['항목', '내용', '메모'], ['', '', ''], ['', '', '']] });
export function diagramBlock(mode = 'flow') {
  const nodes = (mode === 'mindmap' ? ['중심 생각', '첫 번째 가지', '두 번째 가지', '세 번째 가지'] : ['시작', '살펴보기', '정리하기', '완료']).map(label => ({ id:uid(), label }));
  if (mode === 'mindmap') nodes.forEach((node, i) => { node.parent = i ? nodes[0].id : null; });
  return { id:uid(), type:'diagram', mode, nodes, edges:mode === 'flow' ? nodes.slice(1).map((node,i) => ({ from:nodes[i].id, to:node.id })) : [] };
}
export function makeDocument(template = 'blank') {
  const now = Date.now();
  const blocks = template === 'blank' ? [textBlock()] : template === 'table' ? [tableBlock(), textBlock()] : [diagramBlock(template), textBlock()];
  return { id:uid(), title:'', color:({ blank:0, table:1, flow:3, mindmap:2 })[template] ?? 0, createdAt:now, updatedAt:now, revision:0, blocks };
}
export function starterDocuments() {
  const welcome = makeDocument();
  welcome.title = '생각을 구조로.';
  welcome.blocks = [textBlock('작은 생각도, 한 장에 담으면 선명해져요.', 'heading'), textBlock('글을 쓰고, 표를 더하고, 생각의 연결을 그려 보세요. 필요한 도구 네 가지로 충분해요.'), textBlock('문서를 쓰는 네 가지 방법', 'subheading'), textBlock('<b>글</b> · 제목, 본문, 목록과 할 일. 선택한 글은 굵게 또는 기울임으로.'), textBlock('<b>표</b> · 셀을 바로 편집하고, 표 메뉴에서 행과 열을 더해요.'), textBlock('<b>흐름도</b> · 순서와 분기, 서로 이어지는 과정을 그려요.'), textBlock('<b>마인드맵</b> · 중심 생각에서 가지를 뻗어 아이디어를 정리해요.'), textBlock('저장 버튼 없이 자동으로 이 브라우저에 보관해요. 다른 기기로 옮길 때는 문서함 메뉴에서 전체 백업을 내려받으세요.', 'quote'), textBlock('나만의 첫 문서 만들기', 'check')];
  const table = makeDocument('table');
  table.title = '한눈에 보는 비교표';
  table.blocks = [textBlock('선택하기 전에, 나란히 놓아 보기.'), { id:uid(), type:'table', header:true, rows:[['정리 방식','잘 맞는 생각','시작하기'],['글','맥락과 설명','한 문장부터'],['표','항목과 차이','기준 정하기'],['흐름도','순서와 분기','첫 단계부터'],['마인드맵','아이디어와 관계','중심 생각부터']] }, textBlock('표의 셀을 눌러 바로 바꿀 수 있어요. 표 왼쪽 메뉴에서 행과 열을 추가하거나 삭제해요.', 'quote')];
  const map = makeDocument('mindmap');
  map.title = '생각이 이어지는 지도';
  map.blocks[0].nodes.forEach((node,i) => { node.label = ['나의 다음 실험','궁금한 점','준비할 것','확인할 것'][i]; });
  map.blocks.unshift(textBlock('정답을 찾기 전에, 연결부터 그려 보세요.'));
  const flow = makeDocument('flow');
  flow.title = '작은 계획의 흐름';
  flow.blocks[0].nodes.forEach((node,i) => { node.label = ['질문 정하기','자료 살펴보기','실험과 관찰','결과 정리'][i]; });
  flow.blocks.unshift(textBlock('생각에서 실행까지, 한 단계씩 이어 가기.'));
  // Stable initial order; real edits are sorted by their actual save time.
  return [welcome,table,map,flow].map((doc,i) => ({ ...doc, updatedAt:Date.now() - i*1000 }));
}
export function documentText(doc) {
  return [doc.title, ...doc.blocks.map(block => block.type === 'text' ? plainHTML(block.html) : block.type === 'table' ? block.rows.map(row => row.join(' ')).join('\n') : block.nodes.map(node => node.label).join(' '))].join('\n');
}
export function documentKind(doc) {
  const types = new Set(doc.blocks.map(block => block.type === 'diagram' ? block.mode : block.type));
  const special = [...types].filter(type => type !== 'text');
  return special.length > 1 ? '글과 생각' : ({ table:'표 문서', flow:'흐름도', mindmap:'마인드맵' })[special[0]] || '글 문서';
}
export function normalizeDocument(input, { newId = false } = {}) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.blocks) || input.blocks.length > 500) throw new Error('올바른 memo 문서가 아니에요.');
  const safeText = (value,max) => typeof value === 'string' ? value.slice(0,max) : '';
  const seen = new Set();
  const blocks = input.blocks.map(block => {
    if (!block || typeof block !== 'object') throw new Error('문서 항목을 읽을 수 없어요.');
    const id = typeof block.id === 'string' && block.id.length < 100 && !seen.has(block.id) ? block.id : uid();
    seen.add(id);
    if (block.type === 'text') return { id, type:'text', style:STYLES.includes(block.style) ? block.style : 'paragraph', html:cleanHTML(safeText(block.html,200000)), checked:!!block.checked };
    if (block.type === 'table') {
      if (!Array.isArray(block.rows) || !block.rows.length || block.rows.length > 150) throw new Error('표는 1~150행이어야 해요.');
      const width = block.rows[0]?.length;
      if (!Number.isInteger(width) || width < 1 || width > 12 || block.rows.some(row => !Array.isArray(row) || row.length !== width)) throw new Error('표의 열 수가 맞지 않아요.');
      return { id,type:'table',header:!!block.header,rows:block.rows.map(row => row.map(cell => safeText(cell,20000))) };
    }
    if (block.type === 'diagram') {
      if (!['flow','mindmap'].includes(block.mode) || !Array.isArray(block.nodes) || !block.nodes.length || block.nodes.length > 36) throw new Error('도식은 1~36개 항목이어야 해요.');
      const ids = new Set();
      const nodes = block.nodes.map(node => {
        if (!node || typeof node.id !== 'string' || node.id.length > 100 || ids.has(node.id)) throw new Error('도식 항목 ID가 올바르지 않아요.');
        ids.add(node.id); return { id:node.id,label:safeText(node.label,80) || '새 항목',parent:typeof node.parent === 'string' ? node.parent : null };
      });
      const edges = Array.isArray(block.edges) ? block.edges.slice(0,120).filter(edge => edge && ids.has(edge.from) && ids.has(edge.to) && edge.from !== edge.to).map(edge => ({from:edge.from,to:edge.to})) : [];
      if (block.mode === 'mindmap') {
        nodes[0].parent = null;
        nodes.slice(1).forEach(node => { if (!ids.has(node.parent) || node.parent === node.id) node.parent = nodes[0].id; });
        for (const node of nodes) {
          const chain = new Set([node.id]); let parent = node.parent;
          while (parent) { if (chain.has(parent)) throw new Error('마인드맵 가지가 서로 순환하고 있어요.'); chain.add(parent); parent=nodes.find(n=>n.id===parent)?.parent; }
        }
      }
      return { id,type:'diagram',mode:block.mode,nodes,edges };
    }
    throw new Error('지원하지 않는 문서 항목이 있어요.');
  });
  const time = value => Number.isFinite(value) && value > 0 && value < 1e14 ? value : Date.now();
  return { id:!newId && typeof input.id === 'string' && input.id.length < 100 ? input.id : uid(),title:safeText(input.title,160),color:Number.isInteger(input.color) && input.color >= 0 && input.color < 6 ? input.color : 0,createdAt:time(input.createdAt),updatedAt:time(input.updatedAt),revision:newId ? 0 : Number.isInteger(input.revision) && input.revision >= 0 ? input.revision : 0,blocks:blocks.length ? blocks : [textBlock()] };
}
export function parseBackup(value) {
  if (value?.format !== FORMAT || value?.version !== VERSION || !Array.isArray(value.documents) || value.documents.length > 300) throw new Error('memo 백업 파일을 선택해 주세요.');
  return value.documents.map(doc => normalizeDocument(doc, { newId:true }));
}
export function hasPath(block, from, to) {
  const visited = new Set();
  const queue = [from];
  const edges = block.mode === 'mindmap' ? block.nodes.filter(node=>node.parent).map(node=>({from:node.parent,to:node.id})) : block.edges;
  while (queue.length) { const id=queue.pop(); if(id===to)return true; if(visited.has(id))continue; visited.add(id); queue.push(...edges.filter(edge=>edge.from===id).map(edge=>edge.to)); }
  return false;
}
