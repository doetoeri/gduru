import { uid } from './model.js';
const NS='http://www.w3.org/2000/svg';
function svgElement(tag,attrs={}){const el=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));return el;}
const wrapped = value => {
  const lines=[];
  for(const line of String(value).split('\n')){
    const chars=Array.from(line);
    for(let i=0;i<chars.length;i+=12)lines.push(chars.slice(i,i+12).join(''));
    if(!chars.length)lines.push('');
  }
  return lines.length ? lines : ['새 항목'];
};
function measure(node){const lines=wrapped(node.label);return {w:174,h:Math.max(58,lines.length*19+24),lines};}

function flowLayout(block){
  const index=new Map(block.nodes.map((node,i)=>[node.id,i]));
  const edges=block.edges.filter(edge=>index.has(edge.from)&&index.has(edge.to));
  const incoming=new Map(block.nodes.map(node=>[node.id,0]));
  const levels=new Map(block.nodes.map(node=>[node.id,0]));
  edges.forEach(edge=>incoming.set(edge.to,incoming.get(edge.to)+1));
  const queue=block.nodes.filter(node=>incoming.get(node.id)===0).map(node=>node.id);
  const seen=new Set();
  while(queue.length){const id=queue.shift();if(seen.has(id))continue;seen.add(id);for(const edge of edges.filter(e=>e.from===id)){levels.set(edge.to,Math.max(levels.get(edge.to),levels.get(id)+1));incoming.set(edge.to,incoming.get(edge.to)-1);if(!incoming.get(edge.to))queue.push(edge.to);}}
  // Imported cycles remain bounded and visible rather than locking the page.
  block.nodes.filter(node=>!seen.has(node.id)).forEach((node,i)=>levels.set(node.id,i));
  const groups=new Map();
  for(const node of block.nodes){const level=levels.get(node.id);if(!groups.has(level))groups.set(level,[]);groups.get(level).push(node);}
  const columns=Math.min(3,Math.max(...levels.values())+1);
  const positions=new Map(); let overallHeight=0;
  const rowBands=new Map();
  for(const [level,nodes] of groups){const band=Math.floor(level/3);const height=nodes.reduce((sum,node)=>sum+measure(node).h+30,0)-30;rowBands.set(band,Math.max(rowBands.get(band)||0,height));}
  const bandTop=new Map();let top=30;for(const band of [...rowBands.keys()].sort((a,b)=>a-b)){bandTop.set(band,top);top+=rowBands.get(band)+86;}overallHeight=top-56;
  for(const [level,nodes] of groups){const band=Math.floor(level/3),height=nodes.reduce((sum,node)=>sum+measure(node).h+30,0)-30;let y=bandTop.get(band)+(rowBands.get(band)-height)/2;for(const node of nodes){const box=measure(node);positions.set(node.id,{...box,x:28+(level%3)*232,y});y+=box.h+30;}}
  return {positions,edges,width:columns*232+2,height:Math.max(126,overallHeight)};
}
function mindLayout(block){
  const root=block.nodes[0],positions=new Map(),sizes=new Map(block.nodes.map(node=>[node.id,measure(node)]));
  const children=id=>block.nodes.filter(node=>node.parent===id);
  const visited=new Set();
  function branchHeight(node){if(visited.has(node.id))return sizes.get(node.id).h;visited.add(node.id);const kids=children(node.id);return Math.max(sizes.get(node.id).h,kids.reduce((sum,kid)=>sum+branchHeight(kid)+22,0)-22);}
  const heights=new Map();block.nodes.forEach(node=>{visited.clear();heights.set(node.id,branchHeight(node));});
  const branches=children(root.id);
  const left=branches.filter((_,i)=>i%2),right=branches.filter((_,i)=>!(i%2));
  const total=list=>Math.max(80,list.reduce((sum,node)=>sum+heights.get(node.id)+30,0)-30);
  const height=Math.max(total(left),total(right),sizes.get(root.id).h)+60;
  const placed=new Set([root.id]);positions.set(root.id,{...sizes.get(root.id),x:0,y:(height-sizes.get(root.id).h)/2,root:true});
  function place(node,side,depth,top){if(placed.has(node.id))return;placed.add(node.id);const box=sizes.get(node.id);positions.set(node.id,{...box,x:side*depth*238,y:top+(heights.get(node.id)-box.h)/2,branch:depth===1});let childTop=top+(heights.get(node.id)-Math.max(0,children(node.id).reduce((sum,kid)=>sum+heights.get(kid.id)+22,0)-22))/2;for(const child of children(node.id)){place(child,side,depth+1,childTop);childTop+=heights.get(child.id)+22;}}
  for(const [list,side] of [[left,-1],[right,1]]){let y=(height-total(list))/2;for(const node of list){place(node,side,1,y);y+=heights.get(node.id)+30;}}
  // Normalize disconnected imported branches into a visible extra branch.
  for(const node of block.nodes)if(!placed.has(node.id))place(node,1,1,height);
  const minX=Math.min(...[...positions.values()].map(box=>box.x));const maxX=Math.max(...[...positions.values()].map(box=>box.x+box.w));
  const maxY=Math.max(...[...positions.values()].map(box=>box.y+box.h));
  positions.forEach(box=>box.x+=28-minX);
  return {positions,edges:block.nodes.filter(node=>node.parent).map(node=>({from:node.parent,to:node.id})),width:maxX-minX+56,height:Math.max(height,maxY+28)};
}
export function renderDiagram(block,{mini=false}={}){
  const layout=block.mode==='mindmap'?mindLayout(block):flowLayout(block);
  const svg=svgElement('svg',{viewBox:`0 0 ${layout.width} ${layout.height}`,class:'diagram-svg',role:'img','aria-label':`${block.mode==='mindmap'?'마인드맵':'흐름도'}: ${block.nodes.map(node=>node.label).join(', ')}`});
  const title=svgElement('title');title.textContent=block.mode==='mindmap'?'마인드맵':'흐름도';svg.append(title);
  const markerID=`arrow-${uid()}`;
  if(block.mode==='flow'){
    const defs=svgElement('defs'),marker=svgElement('marker',{id:markerID,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'});
    marker.append(svgElement('path',{d:'M 1 1 L 9 5 L 1 9',fill:'none',stroke:'#a8bbd3','stroke-width':1.5}));defs.append(marker);svg.append(defs);
  }
  for(const edge of layout.edges){const from=layout.positions.get(edge.from),to=layout.positions.get(edge.to);if(!from||!to)continue;
    let d;
    if(block.mode==='flow' && to.x<=from.x && to.y>from.y+from.h){const x1=from.x+from.w/2,y1=from.y+from.h,x2=to.x+to.w/2,y2=to.y;d=`M${x1},${y1} C${x1},${y1+36} ${x2},${y2-36} ${x2},${y2}`;}
    else{const right=to.x>from.x;const x1=from.x+(right?from.w:0),y1=from.y+from.h/2,x2=to.x+(right?0:to.w),y2=to.y+to.h/2;const delta=Math.max(28,Math.abs(x2-x1)/2);d=`M${x1},${y1} C${x1+(right?delta:-delta)},${y1} ${x2+(right?-delta:delta)},${y2} ${x2},${y2}`;}
    const path=svgElement('path',{d,class:'connection-line'});if(block.mode==='flow')path.setAttribute('marker-end',`url(#${markerID})`);svg.append(path);
  }
  for(const node of block.nodes){const box=layout.positions.get(node.id);if(!box)continue;const group=svgElement('g',{class:box.root?'node-root':box.branch?'node-branch':'node'});group.append(svgElement('rect',{x:box.x,y:box.y,width:box.w,height:box.h,rx:9}));const label=svgElement('text',{x:box.x+box.w/2,y:box.y+(box.h-(box.lines.length-1)*19)/2+5,'text-anchor':'middle','font-size':14});box.lines.forEach((line,i)=>{const span=svgElement('tspan',{x:box.x+box.w/2,dy:i?19:0});span.textContent=line;label.append(span);});group.append(label);svg.append(group);}
  if(mini){svg.setAttribute('aria-hidden','true');svg.removeAttribute('role');}
  else svg.style.minWidth=`${layout.width}px`;
  return svg;
}
