import { FORMAT, VERSION, escapeHTML, cleanHTML, plainHTML, textBlock, tableBlock, makeDocument } from './model.js';
import { renderDiagram } from './diagrams.js';

export function download(content,name,type='application/json'){
  const blob=content instanceof Blob?content:new Blob([content],{type});
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export const fileName = title => (title||'제목 없는 문서').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,100);
export function backup(documents){return JSON.stringify({format:FORMAT,version:VERSION,exportedAt:new Date().toISOString(),documents},null,2);}
function inlineMarkdown(html){
  const node=document.createElement('div');node.innerHTML=cleanHTML(html);
  for(const el of node.querySelectorAll('b,strong'))el.replaceWith(`**${el.textContent}**`);
  for(const el of node.querySelectorAll('i,em'))el.replaceWith(`*${el.textContent}*`);
  for(const el of node.querySelectorAll('br'))el.replaceWith('\n');
  for(const el of node.querySelectorAll('div,p'))el.append('\n');
  return node.textContent.trim();
}
export function toMarkdown(doc){
  const output=[`# ${doc.title||'제목 없는 문서'}`,''];let number=0;
  const label=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/[\r\n]/g,' ');
  for(const block of doc.blocks){
    if(block.type==='text'){
      const content=inlineMarkdown(block.html),prefix=({heading:'## ',subheading:'### ',bullet:'- ',quote:'> ',check:`- [${block.checked?'x':' '}] `})[block.style]||'';
      if(block.style==='ordered')number+=1;else number=0;
      output.push(`${block.style==='ordered'?`${number}. `:prefix}${content}`,'');
    } else if(block.type==='table'){
      const row=cells=>`| ${cells.map(cell=>cell.replace(/\|/g,'\\|').replace(/\n/g,'<br>')).join(' | ')} |`;
      const rows=block.header?block.rows:[Array(block.rows[0].length).fill(''),...block.rows];
      output.push(row(rows[0]),row(rows[0].map(()=>'---')),...rows.slice(1).map(row),'');
    } else {
      const map=new Map(block.nodes.map((node,i)=>[node.id,`n${i}`]));output.push('```mermaid');
      if(block.mode==='flow'){output.push('flowchart TD',...block.nodes.map(node=>`  ${map.get(node.id)}["${label(node.label)}"]`),...block.edges.map(edge=>`  ${map.get(edge.from)} --> ${map.get(edge.to)}`));}
      else{output.push('mindmap');const visit=(node,depth)=>{output.push(`${'  '.repeat(depth)}${map.get(node.id)}["${label(node.label)}"]`);block.nodes.filter(child=>child.parent===node.id).forEach(child=>visit(child,depth+1));};visit(block.nodes[0],1);}
      output.push('```','');
    }
  }
  return output.join('\n');
}
export function importText(content,title,markdown=false){
  const doc=makeDocument();doc.title=title;doc.blocks=[];
  const lines=content.replace(/\r\n?/g,'\n').split('\n');let first=true;
  const tableCells=line=>line.trim().replace(/^\|/,'').replace(/\|$/,'').split(/(?<!\\)\|/).map(cell=>cell.trim().replace(/\\\|/g,'|').replace(/<br\s*\/?>/gi,'\n'));
  for(let i=0;i<lines.length;i++){
    const line=lines[i];if(!line.trim())continue;
    if(markdown && first && /^#\s+/.test(line)){doc.title=line.replace(/^#\s+/,'').slice(0,160);first=false;continue;}first=false;
    if(markdown && line.includes('|') && lines[i+1] && /^\s*\|?\s*:?-{3,}/.test(lines[i+1])){
      const rows=[tableCells(line)];i+=1;while(lines[i+1]?.includes('|'))rows.push(tableCells(lines[++i]));
      const width=Math.min(12,Math.max(...rows.map(row=>row.length)));doc.blocks.push({...tableBlock(),rows:rows.slice(0,150).map(row=>Array.from({length:width},(_,j)=>row[j]||''))});continue;
    }
    // Import code blocks as visible text. No input is executed.
    if(markdown && /^```/.test(line)){
      const code=[];while(i+1<lines.length&&!/^```/.test(lines[i+1]))code.push(lines[++i]);if(i+1<lines.length)i+=1;doc.blocks.push(textBlock(escapeHTML(code.join('\n')).replace(/\n/g,'<br>'),'quote'));continue;
    }
    const match=markdown?line.match(/^(#{2,3})\s+|^([-*])\s+\[([ xX])\]\s+|^[-*]\s+|^\d+\.\s+|^>\s?/):null;
    const style=!match?'paragraph':match[1]==='##'?'heading':match[1]==='###'?'subheading':match[2]?'check':/^\d/.test(match[0])?'ordered':/^>/.test(match[0])?'quote':'bullet';
    let html=escapeHTML(match?line.slice(match[0].length):line);
    if(markdown)html=html.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
    const block=textBlock(html,style);block.checked=match?.[3]?.toLowerCase()==='x';doc.blocks.push(block);
    if(doc.blocks.length>500)throw new Error('글은 500개 항목까지 가져올 수 있어요.');
  }
  if(!doc.blocks.length)doc.blocks=[textBlock()];return doc;
}
export function documentHTML(doc){
  return doc.blocks.map(block=>{
    if(block.type==='text')return `<div class="block">${block.style==='check'?`<div class="check-content"><span class="check-button" aria-checked="${block.checked}">${block.checked?'✓':''}</span>`:''}<div class="text-content" data-style="${block.style}">${cleanHTML(block.html)}</div>${block.style==='check'?'</div>':''}</div>`;
    if(block.type==='table')return `<div class="block table-wrap"><table class="document-table">${block.rows.map((row,i)=>`<tr>${row.map(cell=>`<${block.header&&i===0?'th':'td'}><div class="cell-content">${escapeHTML(cell)}</div></${block.header&&i===0?'th':'td'}>`).join('')}</tr>`).join('')}</table></div>`;
    return `<div class="block"><div class="diagram-container">${renderDiagram(block).outerHTML}</div></div>`;
  }).join('');
}
async function base64Font(path){
  const response=await fetch(new URL(path,import.meta.url));if(!response.ok)throw new Error('폰트를 불러오지 못했어요. 연결 후 다시 내보내 주세요.');
  const bytes=new Uint8Array(await response.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary);
}
export async function standaloneHTML(doc){
  const [regular,semibold,cssResponse]=await Promise.all([base64Font('./fonts/memo-sans-regular.woff'),base64Font('./fonts/memo-sans-semibold.woff'),fetch(new URL('./memo.css',import.meta.url))]);
  if(!cssResponse.ok)throw new Error('문서 스타일을 불러오지 못했어요.');
  const css=(await cssResponse.text()).replace('./fonts/memo-sans-regular.woff',`data:font/woff;base64,${regular}`).replace('./fonts/memo-sans-semibold.woff',`data:font/woff;base64,${semibold}`);
  const title=escapeHTML(doc.title||'제목 없는 문서');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}\nbody{background:#f0f3f7;padding:40px 20px}.paper{min-height:0}.exported-title{font-size:36px;font-weight:600;letter-spacing:-.05em;line-height:1.4;margin:0 0 24px;overflow-wrap:anywhere}@media(max-width:600px){body{padding:12px}.paper{padding:30px 24px}.exported-title{font-size:28px}}@media print{body{padding:0}.exported-title{font-size:26pt}}</style></head><body><article class="paper"><header class="paper-heading"><p class="eyebrow">GDURU / MEMO</p><h1 class="exported-title">${title}</h1></header><div class="blocks">${documentHTML(doc)}</div><footer class="paper-footer"><span>gduru / memo</span><span>${escapeHTML(new Date(doc.updatedAt).toLocaleDateString('ko-KR'))}</span></footer></article></body></html>`;
}
