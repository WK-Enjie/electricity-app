/* ═══════════════════════════════════════════════════════════════
   ⚡ ELECTRICITY EXPLORER — builder.js  (v4 — PARALLEL FIX)
   
   ✅ Super-node analysis detects series vs parallel
   ✅ Parallel: correct 1/Rt = 1/R1 + 1/R2 calculation
   ✅ Parallel: per-branch animation (more electrons in lower-R branch)
   ✅ Series: single-loop animation (unchanged)
   ✅ Electrons follow actual wire paths
   ✅ Example circuits correctly wired
   ═══════════════════════════════════════════════════════════════ */

var GRID_COLS = 14;
var GRID_ROWS = 10;

var builder = {
    initialized: false,
    tool: 'select',
    orientation: 'h',
    components: [],
    wires: [],
    selectedComp: null,
    wireStart: null,
    gridW: 0, gridH: 0, padX: 0, padY: 0,
    animBranches: [],
    animRunning: false,
    animId: null,
    solved: false,
    solveData: null,
    hoverNode: null
};
var _compId = 0;
function nextCompId() { return ++_compId; }

/* ═══════ INIT ═══════ */
function initBuilder() {
    var c = document.getElementById('canvas-builder');
    if (!c) return;
    resizeBuilderCanvas();
    renderBuilder();
    if (!builder.initialized) {
        c.addEventListener('click', onBuilderClick);
        c.addEventListener('mousemove', onBuilderMouseMove);
        c.addEventListener('contextmenu', function(e){e.preventDefault();});
        builder.initialized = true;
    }
}
function resizeBuilderCanvas() {
    var c = document.getElementById('canvas-builder');
    if (!c) return;
    var r = c.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio||1;
    var w = r.width, h = Math.max(400, Math.min(w*0.58,540));
    c.width=w*dpr; c.height=h*dpr;
    c.style.width=w+'px'; c.style.height=h+'px';
    c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
    builder.padX=35; builder.padY=30;
    builder.gridW=(w-70)/(GRID_COLS-1);
    builder.gridH=(h-60)/(GRID_ROWS-1);
}

/* ═══════ TOOLS ═══════ */
function setBuilderTool(t) {
    builder.tool=t; builder.wireStart=null; builder.selectedComp=null;
    document.querySelectorAll('#builder-toolbar .tool-btn').forEach(function(b){
        b.classList.toggle('active',b.getAttribute('data-tool')===t);
    });
    var n={select:'Select/Edit',battery:'Place Battery',resistor:'Place Resistor',
        bulb:'Place Bulb','switch':'Place Switch',ammeter:'Place Ammeter',
        voltmeter:'Place Voltmeter',wire:'Draw Wire (click 2 nodes)','delete':'Delete'};
    var l=document.getElementById('builder-mode-label');
    if(l) l.textContent='Mode: '+(n[t]||t);
    var p=document.getElementById('comp-props'); if(p) p.style.display='none';
    var cv=document.getElementById('canvas-builder');
    if(cv) cv.style.cursor=t==='select'?'pointer':t==='delete'?'not-allowed':t==='wire'?'crosshair':'copy';
    renderBuilder();
}
function setOrientation(o) {
    builder.orientation=o;
    document.getElementById('orient-h').classList.toggle('active',o==='h');
    document.getElementById('orient-v').classList.toggle('active',o==='v');
}

/* ═══════ GRID ═══════ */
function gridToPixel(c,r){return{x:builder.padX+c*builder.gridW,y:builder.padY+r*builder.gridH};}
function pixelToGrid(px,py){
    return{col:Math.max(0,Math.min(GRID_COLS-1,Math.round((px-builder.padX)/builder.gridW))),
           row:Math.max(0,Math.min(GRID_ROWS-1,Math.round((py-builder.padY)/builder.gridH)))};
}
function nk(c,r){return c+','+r;}
function pk(key){var p=key.split(',');return{col:+p[0],row:+p[1]};}
function sameN(a,b){return a&&b&&a.col===b.col&&a.row===b.row;}

/* ═══════ COMPONENT DATA ═══════ */
function createComponent(type,col,row,ori){
    var c={id:nextCompId(),type:type,col:col,row:row,orientation:ori||'h',
        value:({battery:6,resistor:10,bulb:5,ammeter:0,voltmeter:99999,'switch':0}[type]||0),
        closed:true};
    c.terminals=getTerm(c); return c;
}
function getTerm(c){
    return c.orientation==='h'?
        [{col:c.col,row:c.row},{col:c.col+2,row:c.row}]:
        [{col:c.col,row:c.row},{col:c.col,row:c.row+2}];
}
function valLabel(c){
    if(c.type==='battery')return c.value+' V';
    if(c.type==='resistor'||c.type==='bulb')return c.value+' Ω';
    if(c.type==='switch')return c.closed?'ON':'OFF';
    return '';
}

/* ═══════ CLICK HANDLERS ═══════ */
function getClick(e){
    var c=document.getElementById('canvas-builder'),r=c.getBoundingClientRect();
    return{x:(e.clientX-r.left)*parseFloat(c.style.width)/r.width,
           y:(e.clientY-r.top)*parseFloat(c.style.height)/r.height};
}
function onBuilderClick(e){
    var m=getClick(e),nd=pixelToGrid(m.x,m.y);
    switch(builder.tool){
        case'select':selComp(nd,m.x,m.y);break;
        case'wire':handleWireDraw(nd);break;
        case'delete':delItem(m.x,m.y);break;
        default:placeComp(nd);
    }
    builder.solved=false; stopBuilderAnim(); updateCount(); renderBuilder();
}
function onBuilderMouseMove(e){
    var m=getClick(e),nd=pixelToGrid(m.x,m.y);
    var ch=!builder.hoverNode||builder.hoverNode.col!==nd.col||builder.hoverNode.row!==nd.row;
    builder.hoverNode=nd;
    var co=document.getElementById('builder-coord');
    if(co) co.textContent='Grid: ('+nd.col+', '+nd.row+')';
    if(ch&&!builder.animRunning) renderBuilder();
}

function placeComp(nd){
    var o=builder.orientation;
    if(o==='h'&&nd.col+2>GRID_COLS-1)return;
    if(o==='v'&&nd.row+2>GRID_ROWS-1)return;
    var nc=createComponent(builder.tool,nd.col,nd.row,o);
    if(overlapCheck(nc))return;
    builder.components.push(nc);
}
function overlapCheck(nc){
    var nm=(nc.terminals[0].col+nc.terminals[1].col)/2,
        nr=(nc.terminals[0].row+nc.terminals[1].row)/2;
    for(var i=0;i<builder.components.length;i++){
        var c=builder.components[i],
            cm=(c.terminals[0].col+c.terminals[1].col)/2,
            cr=(c.terminals[0].row+c.terminals[1].row)/2;
        if(Math.abs(nm-cm)<1.5&&Math.abs(nr-cr)<1.5)return true;
    }return false;
}
function handleWireDraw(nd){
    if(!builder.wireStart){builder.wireStart={col:nd.col,row:nd.row};return;}
    var s=builder.wireStart,e={col:nd.col,row:nd.row};
    if(!sameN(s,e)){
        if(s.col===e.col||s.row===e.row){
            if(!wireEx(s,e))builder.wires.push({n1:s,n2:e});
        }else{
            var corner={col:e.col,row:s.row};
            if(!wireEx(s,corner))builder.wires.push({n1:s,n2:corner});
            if(!wireEx(corner,e))builder.wires.push({n1:corner,n2:e});
        }
    }
    builder.wireStart=null;
}
function wireEx(a,b){
    for(var i=0;i<builder.wires.length;i++){
        var w=builder.wires[i];
        if((sameN(w.n1,a)&&sameN(w.n2,b))||(sameN(w.n1,b)&&sameN(w.n2,a)))return true;
    }return false;
}
function selComp(nd,mx,my){
    builder.selectedComp=null;
    var pr=document.getElementById('comp-props');
    for(var i=builder.components.length-1;i>=0;i--){
        if(hitComp(builder.components[i],mx,my)){
            builder.selectedComp=i;
            var c=builder.components[i];
            if(c.type==='switch')c.closed=!c.closed;
            if(c.type==='resistor'||c.type==='bulb'||c.type==='battery'){
                if(pr){pr.style.display='block';
                    document.getElementById('prop-label').textContent=c.type==='battery'?'EMF:':'Resistance:';
                    document.getElementById('prop-unit').textContent=c.type==='battery'?'V':'Ω';
                    document.getElementById('prop-value').value=c.value;}
            }else{if(pr)pr.style.display='none';}
            return;
        }
    }
    if(pr)pr.style.display='none';
}
function delItem(mx,my){
    for(var i=builder.components.length-1;i>=0;i--)
        if(hitComp(builder.components[i],mx,my)){builder.components.splice(i,1);builder.selectedComp=null;return;}
    for(var w=builder.wires.length-1;w>=0;w--)
        if(hitWire(builder.wires[w],mx,my)){builder.wires.splice(w,1);return;}
}
function applyProperty(){
    if(builder.selectedComp===null)return;
    var c=builder.components[builder.selectedComp];if(!c)return;
    var v=parseFloat(document.getElementById('prop-value').value);
    if(isNaN(v)||v<=0)return;
    c.value=v;builder.solved=false;renderBuilder();
}

/* ═══════ HIT TESTING ═══════ */
function hitComp(c,mx,my){
    var t=c.terminals,p1=gridToPixel(t[0].col,t[0].row),p2=gridToPixel(t[1].col,t[1].row);
    var cx=(p1.x+p2.x)/2,cy=(p1.y+p2.y)/2;
    var hw=Math.abs(p2.x-p1.x)/2+16,hh=Math.abs(p2.y-p1.y)/2+16;
    return mx>=cx-hw&&mx<=cx+hw&&my>=cy-hh&&my<=cy+hh;
}
function hitWire(w,mx,my){
    var p1=gridToPixel(w.n1.col,w.n1.row),p2=gridToPixel(w.n2.col,w.n2.row);
    var dx=p2.x-p1.x,dy=p2.y-p1.y,l2=dx*dx+dy*dy;
    if(l2===0)return Math.hypot(mx-p1.x,my-p1.y)<10;
    var t=Math.max(0,Math.min(1,((mx-p1.x)*dx+(my-p1.y)*dy)/l2));
    return Math.hypot(mx-(p1.x+t*dx),my-(p1.y+t*dy))<10;
}

/* ═══════ RENDERING ═══════ */
function renderBuilder(){
    var c=document.getElementById('canvas-builder');if(!c)return;
    var ctx=c.getContext('2d'),W=parseFloat(c.style.width),H=parseFloat(c.style.height);
    ctx.clearRect(0,0,W,H);
    // background
    ctx.fillStyle='#0d0f16';ctx.fillRect(0,0,W,H);
    // grid lines
    ctx.save();ctx.strokeStyle='#1e2233';ctx.lineWidth=0.5;
    for(var i=0;i<GRID_COLS;i++){var a=gridToPixel(i,0),b=gridToPixel(i,GRID_ROWS-1);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    for(var j=0;j<GRID_ROWS;j++){var a2=gridToPixel(0,j),b2=gridToPixel(GRID_COLS-1,j);
        ctx.beginPath();ctx.moveTo(a2.x,a2.y);ctx.lineTo(b2.x,b2.y);ctx.stroke();}
    ctx.restore();
    // grid dots
    for(var c2=0;c2<GRID_COLS;c2++)for(var r2=0;r2<GRID_ROWS;r2++){
        var p=gridToPixel(c2,r2),hv=builder.hoverNode&&builder.hoverNode.col===c2&&builder.hoverNode.row===r2;
        ctx.save();ctx.fillStyle=hv?'#4fc3f7':'#2a3048';
        ctx.beginPath();ctx.arc(p.x,p.y,hv?4:2,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    // wires
    var wc=builder.solved?'#4fc3f7':'#8b90a0';
    for(var w=0;w<builder.wires.length;w++){
        var wr=builder.wires[w],wp1=gridToPixel(wr.n1.col,wr.n1.row),wp2=gridToPixel(wr.n2.col,wr.n2.row);
        ctx.save();ctx.strokeStyle=wc;ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(wp1.x,wp1.y);ctx.lineTo(wp2.x,wp2.y);ctx.stroke();
        ctx.fillStyle=wc;ctx.beginPath();ctx.arc(wp1.x,wp1.y,3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(wp2.x,wp2.y,3,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    // wire in progress
    if(builder.tool==='wire'&&builder.wireStart){
        var sp=gridToPixel(builder.wireStart.col,builder.wireStart.row);
        ctx.save();ctx.fillStyle='#ffa726';ctx.shadowColor='#ffa726';ctx.shadowBlur=8;
        ctx.beginPath();ctx.arc(sp.x,sp.y,5,0,Math.PI*2);ctx.fill();ctx.restore();
        if(builder.hoverNode){
            var hp=gridToPixel(builder.hoverNode.col,builder.hoverNode.row);
            ctx.save();ctx.strokeStyle='#ffa72688';ctx.lineWidth=2;ctx.setLineDash([5,5]);
            ctx.beginPath();ctx.moveTo(sp.x,sp.y);
            if(builder.wireStart.col!==builder.hoverNode.col&&builder.wireStart.row!==builder.hoverNode.row){
                var cp=gridToPixel(builder.hoverNode.col,builder.wireStart.row);ctx.lineTo(cp.x,cp.y);}
            ctx.lineTo(hp.x,hp.y);ctx.stroke();ctx.setLineDash([]);ctx.restore();
        }
    }
    // components
    for(var ci=0;ci<builder.components.length;ci++){
        var comp=builder.components[ci],t=comp.terminals;
        var p1=gridToPixel(t[0].col,t[0].row),p2=gridToPixel(t[1].col,t[1].row);
        var cx2=(p1.x+p2.x)/2,cy2=(p1.y+p2.y)/2;
        if(builder.selectedComp===ci){
            ctx.save();ctx.strokeStyle='rgba(79,195,247,0.3)';ctx.lineWidth=2;ctx.setLineDash([4,3]);
            var shw=Math.abs(p2.x-p1.x)/2+14,shh=Math.abs(p2.y-p1.y)/2+14;
            ctx.strokeRect(cx2-shw,cy2-shh,shw*2,shh*2);ctx.setLineDash([]);ctx.restore();
        }
        drawSymbol(ctx,comp,p1,p2,cx2,cy2);
        // terminal dots
        ctx.save();ctx.fillStyle='#4fc3f7';
        ctx.beginPath();ctx.arc(p1.x,p1.y,3.5,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(p2.x,p2.y,3.5,0,Math.PI*2);ctx.fill();ctx.restore();
        // value label
        var lb=valLabel(comp);
        if(lb){var lx=cx2,ly=cy2;if(comp.orientation==='h')ly-=22;else lx+=28;
            drawCentredText(ctx,lb,lx,ly,'bold 11px sans-serif','#4fc3f7');}
        // solved values
        if(builder.solved&&builder.solveData&&builder.solveData.compValues){
            var cv=builder.solveData.compValues[comp.id];
            if(cv){var ox=comp.orientation==='h'?0:-32,oy=comp.orientation==='h'?16:0;
                if(comp.type!=='battery')drawCentredText(ctx,cv.v.toFixed(2)+' V',cx2+ox,cy2+oy,'10px sans-serif','#66bb6a');
                drawCentredText(ctx,cv.i.toFixed(3)+' A',cx2+ox,cy2+oy+12,'10px sans-serif','#ef5350');
            }
        }
    }
    // placement preview
    var pl=['battery','resistor','bulb','switch','ammeter','voltmeter'];
    if(pl.indexOf(builder.tool)>=0&&builder.hoverNode){
        var nd=builder.hoverNode,ori=builder.orientation,ok=true;
        if(ori==='h'&&nd.col+2>GRID_COLS-1)ok=false;
        if(ori==='v'&&nd.row+2>GRID_ROWS-1)ok=false;
        if(ok){var pt1=gridToPixel(nd.col,nd.row),
            pt2=ori==='h'?gridToPixel(nd.col+2,nd.row):gridToPixel(nd.col,nd.row+2);
            ctx.save();ctx.globalAlpha=0.35;ctx.strokeStyle='#4fc3f7';ctx.lineWidth=2;ctx.setLineDash([4,4]);
            var pcx=(pt1.x+pt2.x)/2,pcy=(pt1.y+pt2.y)/2;
            var phw=Math.abs(pt2.x-pt1.x)/2+12,phh=Math.abs(pt2.y-pt1.y)/2+12;
            ctx.strokeRect(pcx-phw,pcy-phh,phw*2,phh*2);ctx.setLineDash([]);ctx.restore();
        }
    }
    drawCentredText(ctx,'🔨 Circuit Builder',W/2,14,'11px sans-serif','#555');
}

/* ═══════ COMPONENT SYMBOLS ═══════ */
function drawSymbol(ctx,comp,p1,p2,cx,cy){
    switch(comp.type){
        case'battery':symBat(ctx,p1,p2,cx,cy,comp);break;
        case'resistor':symRes(ctx,p1,p2,cx,cy,comp);break;
        case'bulb':symBulb(ctx,p1,p2,cx,cy,comp);break;
        case'switch':symSw(ctx,p1,p2,cx,cy,comp);break;
        case'ammeter':symMeter(ctx,p1,p2,cx,cy,'A','#ef5350');break;
        case'voltmeter':symMeter(ctx,p1,p2,cx,cy,'V','#42a5f5');break;
    }
}
function symBat(ctx,p1,p2,cx,cy,comp){
    var g=6;
    if(comp.orientation==='h'){
        drawWire(ctx,p1.x,p1.y,cx-g,cy);drawWire(ctx,cx+g,cy,p2.x,p2.y);
        ctx.save();ctx.strokeStyle='#e2e4ea';
        ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx-g,cy-14);ctx.lineTo(cx-g,cy+14);ctx.stroke();
        ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx+g,cy-8);ctx.lineTo(cx+g,cy+8);ctx.stroke();ctx.restore();
        drawText(ctx,'+',cx-g-8,cy-14,'bold 10px sans-serif','#ef5350','center');
        drawText(ctx,'−',cx+g+8,cy-14,'bold 10px sans-serif','#42a5f5','center');
    }else{
        drawWire(ctx,p1.x,p1.y,cx,cy-g);drawWire(ctx,cx,cy+g,p2.x,p2.y);
        ctx.save();ctx.strokeStyle='#e2e4ea';
        ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx-14,cy-g);ctx.lineTo(cx+14,cy-g);ctx.stroke();
        ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx-8,cy+g);ctx.lineTo(cx+8,cy+g);ctx.stroke();ctx.restore();
        drawText(ctx,'+',cx+18,cy-g,'bold 10px sans-serif','#ef5350','left');
        drawText(ctx,'−',cx+18,cy+g,'bold 10px sans-serif','#42a5f5','left');
    }
}
function symRes(ctx,p1,p2,cx,cy,comp){
    ctx.save();ctx.strokeStyle='#e2e4ea';ctx.lineWidth=2;
    if(comp.orientation==='h'){
        var rw=Math.min(builder.gridW*0.9,46),rh=16;
        drawWire(ctx,p1.x,p1.y,cx-rw/2,cy);drawWire(ctx,cx+rw/2,cy,p2.x,p2.y);
        ctx.strokeRect(cx-rw/2,cy-rh/2,rw,rh);
    }else{
        var rw2=16,rh2=Math.min(builder.gridH*0.9,46);
        drawWire(ctx,p1.x,p1.y,cx,cy-rh2/2);drawWire(ctx,cx,cy+rh2/2,p2.x,p2.y);
        ctx.strokeRect(cx-rw2/2,cy-rh2/2,rw2,rh2);
    }ctx.restore();
}
function symBulb(ctx,p1,p2,cx,cy,comp){
    var r=13;
    if(comp.orientation==='h'){drawWire(ctx,p1.x,p1.y,cx-r,cy);drawWire(ctx,cx+r,cy,p2.x,p2.y);}
    else{drawWire(ctx,p1.x,p1.y,cx,cy-r);drawWire(ctx,cx,cy+r,p2.x,p2.y);}
    var on=builder.solved&&builder.solveData&&builder.solveData.compValues&&
        builder.solveData.compValues[comp.id]&&builder.solveData.compValues[comp.id].i>0.01;
    drawBulb(ctx,cx,cy,r,on);
}
function symSw(ctx,p1,p2,cx,cy,comp){
    var d1x=p1.x+(cx-p1.x)*0.6,d1y=p1.y+(cy-p1.y)*0.6;
    var d2x=p2.x+(cx-p2.x)*0.6,d2y=p2.y+(cy-p2.y)*0.6;
    drawWire(ctx,p1.x,p1.y,d1x,d1y);drawWire(ctx,d2x,d2y,p2.x,p2.y);
    ctx.save();ctx.fillStyle='#e2e4ea';
    ctx.beginPath();ctx.arc(d1x,d1y,3.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(d2x,d2y,3.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=comp.closed?'#66bb6a':'#ef5350';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(d1x,d1y);
    if(comp.closed){ctx.lineTo(d2x,d2y);}else{
        var a=Math.atan2(d2y-d1y,d2x-d1x)-0.5,l=Math.hypot(d2x-d1x,d2y-d1y);
        ctx.lineTo(d1x+l*0.85*Math.cos(a),d1y+l*0.85*Math.sin(a));
    }ctx.stroke();ctx.restore();
}
function symMeter(ctx,p1,p2,cx,cy,letter,colour){
    var r=13;
    if(Math.abs(p2.x-p1.x)>Math.abs(p2.y-p1.y)){
        drawWire(ctx,p1.x,p1.y,cx-r,cy);drawWire(ctx,cx+r,cy,p2.x,p2.y);
    }else{drawWire(ctx,p1.x,p1.y,cx,cy-r);drawWire(ctx,cx,cy+r,p2.x,p2.y);}
    ctx.save();ctx.strokeStyle=colour;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();ctx.restore();
    drawCentredText(ctx,letter,cx,cy,'bold 12px sans-serif',colour);
}

/* ═══════════════════════════════════════════════════════════════
   PART 2 — SUPER-NODE ANALYSIS, SOLVER, ANIMATION
   ═══════════════════════════════════════════════════════════════ */


/* ═══════ UNION-FIND (for super-node detection) ═══════ */

function makeUF() {
    var parent = {};
    function find(x) {
        if (parent[x] === undefined) parent[x] = x;
        if (parent[x] !== x) parent[x] = find(parent[x]);
        return parent[x];
    }
    function union(a, b) {
        var ra = find(a), rb = find(b);
        if (ra !== rb) parent[ra] = rb;
    }
    return { find: find, union: union };
}


/* ═══════ ADJACENCY LIST ═══════ */

function buildAdj() {
    var adj = {};
    function add(k1, k2, compId) {
        if (!adj[k1]) adj[k1] = [];
        if (!adj[k2]) adj[k2] = [];
        adj[k1].push({ node: k2, compId: compId });
        adj[k2].push({ node: k1, compId: compId });
    }
    for (var i = 0; i < builder.components.length; i++) {
        var c = builder.components[i];
        add(nk(c.terminals[0].col, c.terminals[0].row),
            nk(c.terminals[1].col, c.terminals[1].row), c.id);
    }
    for (var w = 0; w < builder.wires.length; w++) {
        var wr = builder.wires[w];
        add(nk(wr.n1.col, wr.n1.row), nk(wr.n2.col, wr.n2.row), null);
    }
    return adj;
}

function findCompById(id) {
    for (var i = 0; i < builder.components.length; i++)
        if (builder.components[i].id === id) return builder.components[i];
    return null;
}


/* ═══════════════════════════════════════
   WIRE-ONLY PATH FINDER
   BFS that follows wires + ammeters + closed switches
   but NOT batteries, resistors or bulbs
   (used to find animation paths between components)
   ═══════════════════════════════════════ */

function wirePathBFS(adj, startKey, endKey) {
    if (startKey === endKey) return [startKey];
    var visited = {};
    visited[startKey] = true;
    var queue = [{ key: startKey, path: [startKey] }];

    while (queue.length > 0) {
        var cur = queue.shift();
        var neighbors = adj[cur.key] || [];
        for (var i = 0; i < neighbors.length; i++) {
            var nb = neighbors[i];
            if (visited[nb.node]) continue;

            // Filter: only allow wires, ammeters, closed switches
            if (nb.compId !== null) {
                var comp = findCompById(nb.compId);
                if (!comp) continue;
                if (comp.type === 'battery') continue;
                if (comp.type === 'resistor') continue;
                if (comp.type === 'bulb') continue;
                if (comp.type === 'switch' && !comp.closed) continue;
                // ammeter or closed switch → allowed
            }

            var newPath = cur.path.concat([nb.node]);
            if (nb.node === endKey) return newPath;

            visited[nb.node] = true;
            queue.push({ key: nb.node, path: newPath });
        }
    }
    return null;
}

function nodePathToPixels(keys) {
    var pts = [];
    for (var i = 0; i < keys.length; i++) {
        var n = pk(keys[i]);
        pts.push(gridToPixel(n.col, n.row));
    }
    return pts;
}


/* ═══════════════════════════════════════
   ★ MAIN ANALYSIS — SUPER-NODE APPROACH ★
   
   1. Union-Find merges all wire-connected nodes
      (also merges ammeter/switch terminals)
   2. Battery connects super-node A to super-node B
   3. If all loads connect A↔B → PARALLEL
   4. If loads form a chain A→...→B → SERIES
   ═══════════════════════════════════════ */

function analyseCircuit() {
    builder.solved = false;
    builder.solveData = null;
    builder.animBranches = [];
    stopBuilderAnim();

    var batteries = builder.components.filter(function (c) { return c.type === 'battery'; });
    var loads = builder.components.filter(function (c) { return c.type === 'resistor' || c.type === 'bulb'; });

    if (batteries.length === 0) { showErr('⚠️ No battery found! Place a battery first.'); return; }
    if (loads.length === 0) { showErr('⚠️ No loads! Add at least one resistor or bulb.'); return; }
    var openSw = builder.components.filter(function (c) { return c.type === 'switch' && !c.closed; });
    if (openSw.length > 0) { showErr('⚠️ A switch is open — click it with Select tool to close.'); return; }

    var adj = buildAdj();

    // ── Step 1: Union-Find on wires ──
    var uf = makeUF();
    for (var w = 0; w < builder.wires.length; w++) {
        var wr = builder.wires[w];
        uf.union(nk(wr.n1.col, wr.n1.row), nk(wr.n2.col, wr.n2.row));
    }
    // Also merge ammeter / closed-switch terminals (they're effectively wires)
    for (var i = 0; i < builder.components.length; i++) {
        var c = builder.components[i];
        if (c.type === 'ammeter' || (c.type === 'switch' && c.closed)) {
            uf.union(nk(c.terminals[0].col, c.terminals[0].row),
                     nk(c.terminals[1].col, c.terminals[1].row));
        }
    }

    // ── Step 2: Battery super-nodes ──
    var bat = batteries[0];
    var snPos = uf.find(nk(bat.terminals[0].col, bat.terminals[0].row));
    var snNeg = uf.find(nk(bat.terminals[1].col, bat.terminals[1].row));

    if (snPos === snNeg) {
        showErr('⚠️ Short circuit! Battery terminals are directly connected by wire.');
        return;
    }

    // ── Step 3: Classify loads ──
    var parallelLoads = [];  // loads that connect snPos ↔ snNeg directly
    var otherLoads = [];

    for (var j = 0; j < loads.length; j++) {
        var ld = loads[j];
        var sn0 = uf.find(nk(ld.terminals[0].col, ld.terminals[0].row));
        var sn1 = uf.find(nk(ld.terminals[1].col, ld.terminals[1].row));

        if ((sn0 === snPos && sn1 === snNeg) || (sn0 === snNeg && sn1 === snPos)) {
            parallelLoads.push(ld);
        } else {
            otherLoads.push(ld);
        }
    }

    // ── Step 4: Solve ──
    if (parallelLoads.length >= 2 && otherLoads.length === 0) {
        solveParallel(bat, parallelLoads, adj, uf, snPos, snNeg);
    } else if (parallelLoads.length <= 1 && otherLoads.length >= 0) {
        solveSeries(bat, adj, uf, snPos, snNeg);
    } else {
        showErr('⚠️ Mixed series-parallel circuit. This builder supports pure series or pure parallel. Ensure junction wires are correct.');
    }
}


/* ═══════════════════════════════════════
   SERIES SOLVER
   Traverses super-node chain from bat+ to bat-
   ═══════════════════════════════════════ */

function solveSeries(bat, adj, uf, snPos, snNeg) {
    // Build super-node adjacency via components (exclude battery)
    var nonBat = builder.components.filter(function (c) { return c.id !== bat.id; });
    var snAdj = {};

    for (var i = 0; i < nonBat.length; i++) {
        var c = nonBat[i];
        var csn0 = uf.find(nk(c.terminals[0].col, c.terminals[0].row));
        var csn1 = uf.find(nk(c.terminals[1].col, c.terminals[1].row));
        if (csn0 === csn1) continue; // merged by UF (ammeter/switch) — skip

        if (!snAdj[csn0]) snAdj[csn0] = [];
        if (!snAdj[csn1]) snAdj[csn1] = [];
        snAdj[csn0].push({ comp: c, otherSN: csn1, enterTerm: 0 });
        snAdj[csn1].push({ comp: c, otherSN: csn0, enterTerm: 1 });
    }

    // Traverse chain snPos → ... → snNeg
    var chain = [];
    var curSN = snPos;
    var visitedSN = {};
    visitedSN[curSN] = true;
    var limit = nonBat.length + 5;

    while (curSN !== snNeg && limit-- > 0) {
        var edges = snAdj[curSN] || [];
        var found = false;
        for (var j = 0; j < edges.length; j++) {
            if (visitedSN[edges[j].otherSN]) continue;
            chain.push({ comp: edges[j].comp, enterTerm: edges[j].enterTerm });
            visitedSN[edges[j].otherSN] = true;
            curSN = edges[j].otherSN;
            found = true;
            break;
        }
        if (!found) {
            showErr('⚠️ Cannot trace series loop! Make sure all components are connected end-to-end with wires.');
            return;
        }
    }
    if (curSN !== snNeg) { showErr('⚠️ Incomplete circuit path.'); return; }

    // Calculate
    var totalR = 0;
    for (var k = 0; k < chain.length; k++) {
        var cc = chain[k].comp;
        if (cc.type === 'resistor' || cc.type === 'bulb') totalR += cc.value;
    }
    if (totalR <= 0) totalR = 0.01;
    var totalI = bat.value / totalR;

    var compValues = {};
    compValues[bat.id] = { v: bat.value, i: totalI, r: 0 };
    for (var m = 0; m < chain.length; m++) {
        var cm = chain[m].comp;
        var vd = (cm.type === 'resistor' || cm.type === 'bulb') ? totalI * cm.value : 0;
        compValues[cm.id] = { v: vd, i: totalI, r: cm.value };
    }

    // Animation path (single loop)
    var animPath = buildSeriesAnimPath(bat, chain, adj);

    builder.solveData = { type: 'series', emf: bat.value, totalR: totalR, current: totalI,
        compValues: compValues, chain: chain, bat: bat };
    builder.solved = true;

    builder.animBranches = [{
        pixelPath: animPath,
        segLens: computeSegLens(animPath),
        electrons: makeElectrons(10),
        speed: 0.003 * Math.min(totalI, 3)
    }];

    displaySeriesResults(bat, chain, compValues, totalR, totalI);
    renderBuilder();
    startBuilderAnim();
}

function buildSeriesAnimPath(bat, chain, adj) {
    var path = [];
    var batK0 = nk(bat.terminals[0].col, bat.terminals[0].row);
    var batK1 = nk(bat.terminals[1].col, bat.terminals[1].row);
    var curKey = batK0;

    for (var i = 0; i < chain.length; i++) {
        var comp = chain[i].comp;
        var ei = chain[i].enterTerm;
        var xi = 1 - ei;
        var enterKey = nk(comp.terminals[ei].col, comp.terminals[ei].row);
        var exitKey  = nk(comp.terminals[xi].col, comp.terminals[xi].row);

        // Wire path: curKey → enterKey
        var wp = wirePathBFS(adj, curKey, enterKey);
        if (wp) {
            var start = path.length > 0 ? 1 : 0;
            for (var j = start; j < wp.length; j++) path.push(wp[j]);
        }

        // Through component
        if (path.length === 0 || path[path.length - 1] !== exitKey)
            path.push(exitKey);

        curKey = exitKey;
    }

    // Wire path: last exit → bat-
    var wp2 = wirePathBFS(adj, curKey, batK1);
    if (wp2) { for (var k = 1; k < wp2.length; k++) path.push(wp2[k]); }

    // Close loop through battery
    path.push(batK0);

    return nodePathToPixels(path);
}


/* ═══════════════════════════════════════
   PARALLEL SOLVER
   All loads connect the same two super-nodes
   ═══════════════════════════════════════ */

function solveParallel(bat, parallelLoads, adj, uf, snPos, snNeg) {
    // 1/Rt = 1/R1 + 1/R2 + ...
    var invRt = 0;
    for (var i = 0; i < parallelLoads.length; i++) invRt += 1 / parallelLoads[i].value;
    var totalR = 1 / invRt;
    var totalI = bat.value / totalR;

    var compValues = {};
    compValues[bat.id] = { v: bat.value, i: totalI, r: 0 };

    builder.animBranches = [];

    for (var j = 0; j < parallelLoads.length; j++) {
        var ld = parallelLoads[j];
        var brI = bat.value / ld.value;
        compValues[ld.id] = { v: bat.value, i: brI, r: ld.value };

        // Build per-branch animation path
        var animPath = buildBranchAnimPath(bat, ld, adj, uf, snPos, snNeg);
        var nE = Math.max(3, Math.round(8 * brI / totalI));

        builder.animBranches.push({
            pixelPath: animPath,
            segLens: computeSegLens(animPath),
            electrons: makeElectrons(nE),
            speed: 0.003 * Math.min(brI, 3)
        });
    }

    builder.solveData = { type: 'parallel', emf: bat.value, totalR: totalR, current: totalI,
        compValues: compValues, parallelLoads: parallelLoads, bat: bat };
    builder.solved = true;

    displayParallelResults(bat, parallelLoads, compValues, totalR, totalI);
    renderBuilder();
    startBuilderAnim();
}

function buildBranchAnimPath(bat, load, adj, uf, snPos, snNeg) {
    var path = [];
    var batK0 = nk(bat.terminals[0].col, bat.terminals[0].row);
    var batK1 = nk(bat.terminals[1].col, bat.terminals[1].row);

    // Determine which load terminal is on the + side
    var ldSn0 = uf.find(nk(load.terminals[0].col, load.terminals[0].row));
    var ei = (ldSn0 === snPos) ? 0 : 1;  // enter from + side
    var xi = 1 - ei;

    var enterKey = nk(load.terminals[ei].col, load.terminals[ei].row);
    var exitKey  = nk(load.terminals[xi].col, load.terminals[xi].row);

    // bat+ → wires → load enter
    var wp1 = wirePathBFS(adj, batK0, enterKey);
    if (wp1) { for (var a = 0; a < wp1.length; a++) path.push(wp1[a]); }
    else { path.push(batK0); path.push(enterKey); }

    // Through load
    path.push(exitKey);

    // load exit → wires → bat-
    var wp2 = wirePathBFS(adj, exitKey, batK1);
    if (wp2) { for (var b = 1; b < wp2.length; b++) path.push(wp2[b]); }
    else { path.push(batK1); }

    // Through battery back to start
    path.push(batK0);

    return nodePathToPixels(path);
}


/* ═══════════════════════════════════════
   RESULTS DISPLAY
   ═══════════════════════════════════════ */

function displaySeriesResults(bat, chain, cv, totalR, totalI) {
    var html = '';
    html += rr('⚡ Circuit Type', '<strong style="color:#42a5f5">SERIES</strong>');
    html += rr('Total EMF (ε)', bat.value.toFixed(1) + ' V');
    html += rr('Total Resistance (R<sub>T</sub> = R₁+R₂+…)', totalR.toFixed(2) + ' Ω');
    html += rr('Current (I = ε / R<sub>T</sub>)', totalI.toFixed(3) + ' A');
    html += '<hr style="border-color:#2a2e3e;margin:8px 0">';

    var vSum = 0;
    for (var i = 0; i < chain.length; i++) {
        var c = chain[i].comp, v = cv[c.id];
        if (c.type === 'resistor') {
            html += rr('▭ Resistor (' + c.value + ' Ω)',
                'V = ' + v.v.toFixed(2) + ' V, I = ' + v.i.toFixed(3) + ' A, P = ' + (v.v * v.i).toFixed(2) + ' W');
            vSum += v.v;
        } else if (c.type === 'bulb') {
            html += rr('💡 Bulb (' + c.value + ' Ω)',
                'V = ' + v.v.toFixed(2) + ' V, I = ' + v.i.toFixed(3) + ' A, P = ' + (v.v * v.i).toFixed(2) + ' W');
            vSum += v.v;
        } else if (c.type === 'ammeter') {
            html += rr('🅰️ Ammeter', v.i.toFixed(3) + ' A');
        }
    }

    html += '<hr style="border-color:#2a2e3e;margin:8px 0">';
    html += rr('Voltage check (ΣV = ε)', vSum.toFixed(2) + ' V = ' + bat.value.toFixed(1) + ' V ✓');
    html += rr('Total Power', (totalI * totalI * totalR).toFixed(2) + ' W');
    html += rr('Key rule', 'Current is the <strong>same</strong> everywhere: I = ' + totalI.toFixed(3) + ' A');

    showResults(html);
}

function displayParallelResults(bat, loads, cv, totalR, totalI) {
    var html = '';
    html += rr('⚡ Circuit Type', '<strong style="color:#66bb6a">PARALLEL</strong>');
    html += rr('Total EMF (ε)', bat.value.toFixed(1) + ' V');

    var invStr = loads.map(function (l) { return '1/' + l.value; }).join(' + ');
    html += rr('1/R<sub>T</sub> = ' + invStr, 'R<sub>T</sub> = ' + totalR.toFixed(2) + ' Ω');
    html += rr('Total Current (I = ε / R<sub>T</sub>)', totalI.toFixed(3) + ' A');
    html += '<hr style="border-color:#2a2e3e;margin:8px 0">';

    var iSum = 0;
    for (var i = 0; i < loads.length; i++) {
        var ld = loads[i], v = cv[ld.id];
        var icon = ld.type === 'bulb' ? '💡 Bulb' : '▭ Resistor';
        html += rr(icon + ' (' + ld.value + ' Ω)',
            'V = ' + v.v.toFixed(2) + ' V, I = ' + v.i.toFixed(3) + ' A, P = ' + (v.v * v.i).toFixed(2) + ' W');
        iSum += v.i;
    }

    html += '<hr style="border-color:#2a2e3e;margin:8px 0">';
    html += rr('Current check (ΣI = I<sub>T</sub>)', iSum.toFixed(3) + ' A = ' + totalI.toFixed(3) + ' A ✓');
    html += rr('Total Power', (totalI * bat.value).toFixed(2) + ' W');
    html += rr('Key rule', 'Voltage is the <strong>same</strong> across all branches: V = ' + bat.value.toFixed(1) + ' V');

    showResults(html);
}

function rr(label, value) {
    return '<div class="result-row"><span class="res-label">' + label +
           '</span><span class="res-value">' + value + '</span></div>';
}

function showResults(html) {
    var r = document.getElementById('builder-results');
    var a = document.getElementById('builder-analysis');
    a.innerHTML = html;
    r.style.display = 'block';
    setTimeout(function () { r.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 200);
}

function showErr(msg) {
    var r = document.getElementById('builder-results');
    var a = document.getElementById('builder-analysis');
    a.innerHTML = '<div class="result-row"><span class="res-warn">' + msg + '</span></div>';
    r.style.display = 'block';
}


/* ═══════════════════════════════════════
   ★ ANIMATION — MULTI-BRANCH ★
   Each branch has its own pixel path + speed
   Parallel: more electrons in lower-R branch
   Shared wires get electrons from all branches
   ═══════════════════════════════════════ */

function computeSegLens(pts) {
    var lens = [0];
    for (var i = 1; i < pts.length; i++) {
        var dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
        lens.push(lens[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    return lens;
}

function getPointAtFrac(pts, lens, totalLen, frac) {
    var target = frac * totalLen;
    for (var i = 1; i < lens.length; i++) {
        if (lens[i] >= target) {
            var segLen = lens[i] - lens[i - 1];
            var t = segLen > 0 ? (target - lens[i - 1]) / segLen : 0;
            return {
                x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
                y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t
            };
        }
    }
    return pts[pts.length - 1];
}

function makeElectrons(n) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push({ t: i / n });
    return arr;
}

function startBuilderAnim() {
    if (!builder.solved || builder.animRunning || builder.animBranches.length === 0) return;
    builder.animRunning = true;
    animateBuilder();
}

function stopBuilderAnim() {
    builder.animRunning = false;
    if (builder.animId) { cancelAnimationFrame(builder.animId); builder.animId = null; }
}

function animateBuilder() {
    if (!builder.animRunning) return;
    var sec = document.getElementById('sec-builder');
    if (!sec || !sec.classList.contains('active')) { stopBuilderAnim(); return; }

    renderBuilder(); // redraw static elements

    var canvas = document.getElementById('canvas-builder');
    var ctx = canvas.getContext('2d');

    // Animate each branch
    for (var b = 0; b < builder.animBranches.length; b++) {
        var br = builder.animBranches[b];
        if (br.pixelPath.length < 2) continue;
        var totalLen = br.segLens[br.segLens.length - 1];
        if (totalLen <= 0) continue;

        for (var e = 0; e < br.electrons.length; e++) {
            var el = br.electrons[e];
            el.t = (el.t + br.speed) % 1;
            var pos = getPointAtFrac(br.pixelPath, br.segLens, totalLen, el.t);
            drawElectron(ctx, pos.x, pos.y, 4);
        }
    }

    builder.animId = requestAnimationFrame(animateBuilder);
}


/* ═══════════════════════════════════════
   ★ EXAMPLE CIRCUITS — FIXED ★
   
   PARALLEL: uses junction wires so both loads
   share the SAME two super-nodes as the battery
   
   Key insight: 
     Super-node A = {bat+, R1_left, R2_left} 
     Super-node B = {bat−, R1_right, R2_right}
     → both loads connect A↔B → PARALLEL detected ✓
   ═══════════════════════════════════════ */

function loadExampleCircuit(type) {
    clearBuilder();

    switch (type) {

        /* ─── SERIES ─── 
           bat+(1,5)→wire up→(1,2)→wire→R1(5,2)h→wire→Bulb(9,2)h→wire down→(11,5)→wire→bat-(3,5)
        */
        case 'series':
            builder.components.push(createComponent('battery', 1, 5, 'h'));   // t: (1,5)→(3,5)
            builder.components[0].value = 12;
            builder.components.push(createComponent('resistor', 5, 2, 'h')); // t: (5,2)→(7,2)
            builder.components[1].value = 4;
            builder.components.push(createComponent('bulb', 9, 2, 'h'));     // t: (9,2)→(11,2)
            builder.components[2].value = 8;

            builder.wires = [
                { n1: { col: 1, row: 5 }, n2: { col: 1, row: 2 } },
                { n1: { col: 1, row: 2 }, n2: { col: 5, row: 2 } },
                { n1: { col: 7, row: 2 }, n2: { col: 9, row: 2 } },
                { n1: { col: 11, row: 2 }, n2: { col: 11, row: 5 } },
                { n1: { col: 11, row: 5 }, n2: { col: 3, row: 5 } }
            ];
            break;

        /* ─── PARALLEL ───
           Layout:
             bat(0,4)v: terminals (0,4)+ and (0,6)−
             R1(4,2)h:  terminals (4,2) and (6,2)
             R2(4,6)h:  terminals (4,6) and (6,6)
           
           Junction wires:
             Left junction:  (4,2)↕(4,6) — merges R1_left + R2_left
             Right junction: (6,2)↕(6,6) — merges R1_right + R2_right
           
           Super-node A = {(0,4), (0,2), (4,2), (4,6)} — all connected by wires
           Super-node B = {(0,6), (6,6), (6,2)}         — all connected by wires
           Both R1 and R2 connect A↔B → PARALLEL ✓
        */
        case 'parallel':
            builder.components.push(createComponent('battery', 0, 4, 'v'));   // (0,4)+ → (0,6)−
            builder.components[0].value = 12;
            builder.components.push(createComponent('resistor', 4, 2, 'h')); // (4,2) → (6,2)
            builder.components[1].value = 6;
            builder.components.push(createComponent('resistor', 4, 6, 'h')); // (4,6) → (6,6)
            builder.components[2].value = 12;

            builder.wires = [
                // Super-node A wires (bat+ side):
                { n1: { col: 0, row: 4 }, n2: { col: 0, row: 2 } },  // bat+ up
                { n1: { col: 0, row: 2 }, n2: { col: 4, row: 2 } },  // across to R1 left
                { n1: { col: 4, row: 2 }, n2: { col: 4, row: 6 } },  // ★ junction: R1_left ↔ R2_left

                // Super-node B wires (bat− side):
                { n1: { col: 6, row: 2 }, n2: { col: 6, row: 6 } },  // ★ junction: R1_right ↔ R2_right
                { n1: { col: 6, row: 6 }, n2: { col: 0, row: 6 } }   // across to bat−
            ];
            break;

        /* ─── POTENTIAL DIVIDER ───
           Two resistors in SERIES (vertical layout)
           with output tapped from the middle node
        */
        case 'divider':
            builder.components.push(createComponent('battery', 1, 1, 'v'));   // (1,1)+ → (1,3)−
            builder.components[0].value = 10;
            builder.components.push(createComponent('resistor', 6, 1, 'v')); // (6,1) → (6,3)
            builder.components[1].value = 3;
            builder.components.push(createComponent('resistor', 6, 5, 'v')); // (6,5) → (6,7)
            builder.components[2].value = 7;

            builder.wires = [
                { n1: { col: 1, row: 1 }, n2: { col: 6, row: 1 } },  // bat+ to R1 top
                { n1: { col: 6, row: 3 }, n2: { col: 6, row: 5 } },  // R1 bottom to R2 top
                { n1: { col: 6, row: 7 }, n2: { col: 1, row: 7 } },  // R2 bottom across
                { n1: { col: 1, row: 7 }, n2: { col: 1, row: 3 } }   // up to bat−
            ];
            break;
    }

    builder.components.forEach(function (c) { c.terminals = getTerm(c); });
    updateCount();
    renderBuilder();
}


/* ═══════════════════════════════════════
   CLEAR / UTILITIES
   ═══════════════════════════════════════ */

function clearBuilder() {
    builder.components = [];
    builder.wires = [];
    builder.selectedComp = null;
    builder.wireStart = null;
    builder.solved = false;
    builder.solveData = null;
    builder.animBranches = [];
    _compId = 0;
    stopBuilderAnim();
    var r = document.getElementById('builder-results'); if (r) r.style.display = 'none';
    var p = document.getElementById('comp-props'); if (p) p.style.display = 'none';
    updateCount();
    renderBuilder();
}

function updateCount() {
    var el = document.getElementById('builder-comp-count');
    if (el) el.textContent = 'Components: ' + builder.components.length + ', Wires: ' + builder.wires.length;
}