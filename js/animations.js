/* ═══════════════════════════════════════════════════════════════
   ⚡ ELECTRICITY EXPLORER — animations.js
   Animated visualisations:
     • Current flow with electrons
     • I–V characteristic graphs (ohmic, filament, diode)
     • Water analogy animation
   ═══════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════
   1. CURRENT FLOW ANIMATION
   Moving electrons around a circuit loop
   ═══════════════════════════════════════ */

var currentFlowAnim = null;
var currentFlowElectrons = [];
var currentFlowRunning = false;

function startCurrentFlowAnimation() {
    var canvas = document.getElementById('canvas-current-flow');
    if (!canvas) return;
    resizeCanvas(canvas);

    // Stop any previous animation
    if (currentFlowAnim) {
        cancelAnimationFrame(currentFlowAnim);
        currentFlowAnim = null;
    }

    // Create electron positions along the circuit path
    initCurrentFlowElectrons(canvas);
    currentFlowRunning = true;
    animateCurrentFlow();
}

function initCurrentFlowElectrons(canvas) {
    currentFlowElectrons = [];
    var numElectrons = 14;
    for (var i = 0; i < numElectrons; i++) {
        currentFlowElectrons.push({
            t: i / numElectrons,  // parameter 0..1 along path
            speed: 0.002
        });
    }
}

function getCircuitPath(W, H) {
    // Rectangular circuit path — returns array of {x, y} waypoints
    var pad = 0.12;
    var left = W * pad;
    var right = W * (1 - pad);
    var top_ = H * 0.18;
    var bottom = H * 0.78;
    var bulbX = W * 0.5;
    var batX = W * 0.5;

    // Path goes clockwise (conventional current direction: + terminal → top → right → bottom → left → − terminal)
    // Electron flow is opposite (counter-clockwise for our animation: bottom-left → top-left → top-right → bottom-right)
    return [
        { x: left, y: bottom },      // 0: bottom-left
        { x: left, y: top_ },        // 1: top-left
        { x: bulbX - 18, y: top_ },  // 2: before bulb (top)
        { x: bulbX + 18, y: top_ },  // 3: after bulb (top)
        { x: right, y: top_ },       // 4: top-right
        { x: right, y: bottom },     // 5: bottom-right
        { x: batX + 10, y: bottom }, // 6: before battery (bottom, − terminal)
        { x: batX - 10, y: bottom }  // 7: after battery (bottom, + terminal)
    ];
}

function getPointOnPath(path, t) {
    // t is 0..1, interpolate along the path segments
    var totalSegs = path.length;
    var scaledT = ((t % 1) + 1) % 1; // wrap
    var segFloat = scaledT * totalSegs;
    var segIdx = Math.floor(segFloat);
    var segT = segFloat - segIdx;

    var p1 = path[segIdx % totalSegs];
    var p2 = path[(segIdx + 1) % totalSegs];

    return {
        x: p1.x + (p2.x - p1.x) * segT,
        y: p1.y + (p2.y - p1.y) * segT
    };
}

function animateCurrentFlow() {
    if (!currentFlowRunning) return;

    var canvas = document.getElementById('canvas-current-flow');
    if (!canvas) { currentFlowRunning = false; return; }

    // Check if this page is still visible
    var section = document.getElementById('sec-current');
    if (!section || !section.classList.contains('active')) {
        currentFlowRunning = false;
        return;
    }

    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var currentVal = parseFloat(document.getElementById('slider-current').value) || 1;
    var speedFactor = currentVal / 2.5; // normalise speed

    // Get circuit path
    var path = getCircuitPath(W, H);

    var pad = 0.12;
    var left = W * pad;
    var right = W * (1 - pad);
    var top_ = H * 0.18;
    var bottom = H * 0.78;
    var bulbX = W * 0.5;
    var batX = W * 0.5;

    // ─── Draw circuit wires ───
    ctx.save();
    ctx.strokeStyle = '#3a4a5e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (var w = 1; w < path.length; w++) {
        ctx.lineTo(path[w].x, path[w].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // ─── Draw battery on bottom ───
    drawBatteryHoriz(ctx, batX - 30, bottom, batX + 30, bottom);
    drawCentredText(ctx, 'Battery', batX, bottom + 22, '11px sans-serif', '#ffa726');

    // ─── Draw bulb on top ───
    var brightness = Math.min(currentVal / 3, 1);
    drawBulb(ctx, bulbX, top_, 16, brightness > 0.15);

    // Glow effect around bulb based on current
    if (brightness > 0.15) {
        ctx.save();
        var glowR = 20 + brightness * 25;
        var grd = ctx.createRadialGradient(bulbX, top_, 16, bulbX, top_, glowR);
        grd.addColorStop(0, 'rgba(255,238,88,' + (brightness * 0.4) + ')');
        grd.addColorStop(1, 'rgba(255,238,88,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(bulbX, top_, glowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    drawCentredText(ctx, 'Bulb', bulbX, top_ - 28, '11px sans-serif', '#ffee58');

    // ─── Draw ammeter on right side ───
    var amY = (top_ + bottom) / 2;
    drawAmmeter(ctx, right, amY, 14);
    drawWire(ctx, right, top_, right, amY - 14);
    drawWire(ctx, right, amY + 14, right, bottom);
    drawText(ctx, currentVal.toFixed(1) + ' A', right + 20, amY, 'bold 12px sans-serif', '#ef5350', 'left');

    // ─── Move and draw electrons ───
    for (var e = 0; e < currentFlowElectrons.length; e++) {
        var el = currentFlowElectrons[e];
        // Update position (electrons move counter-clockwise = opposite to conventional)
        el.t -= 0.0015 * speedFactor;
        if (el.t < 0) el.t += 1;

        var pos = getPointOnPath(path, el.t);
        drawElectron(ctx, pos.x, pos.y, 5);
    }

    // ─── Conventional current arrow (clockwise, red) ───
    drawArrow(ctx, left + 20, top_ - 8, right - 20, top_ - 8, '#ef5350', 8);
    drawCentredText(ctx, 'Conventional current (+ → −)', W / 2, top_ - 20, '10px sans-serif', '#ef5350');

    // ─── Electron flow arrow (counter-clockwise, blue) ───
    drawArrow(ctx, right - 20, bottom + 10, left + 20, bottom + 10, '#42a5f5', 8);
    drawCentredText(ctx, 'Electron flow (− → +)', W / 2, bottom + 24, '10px sans-serif', '#42a5f5');

    // ─── Info box ───
    drawText(ctx, 'I = ' + currentVal.toFixed(1) + ' A', 14, H - 16, '12px sans-serif', '#4fc3f7', 'left');
    drawText(ctx, 'Speed ∝ Current', 14, H - 32, '10px sans-serif', '#8b90a0', 'left');

    // Loop
    currentFlowAnim = requestAnimationFrame(animateCurrentFlow);
}

// Stop animation when leaving current page
function stopCurrentFlowAnimation() {
    currentFlowRunning = false;
    if (currentFlowAnim) {
        cancelAnimationFrame(currentFlowAnim);
        currentFlowAnim = null;
    }
}


/* ═══════════════════════════════════════
   2. I–V CHARACTERISTIC GRAPHS
   For ohmic, filament lamp, semiconductor diode
   ═══════════════════════════════════════ */

var ivAnimProgress = 0;
var ivAnimId = null;
var ivAnimRunning = false;

function drawIVGraph() {
    // Reset animation
    ivAnimProgress = 0;
    if (ivAnimId) {
        cancelAnimationFrame(ivAnimId);
        ivAnimId = null;
    }
    ivAnimRunning = true;
    animateIVGraph();
}

function animateIVGraph() {
    if (!ivAnimRunning) return;

    var canvas = document.getElementById('canvas-iv');
    if (!canvas) { ivAnimRunning = false; return; }

    var section = document.getElementById('sec-nonohmic');
    if (!section || !section.classList.contains('active')) {
        ivAnimRunning = false;
        return;
    }

    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    // Graph area
    var pad = { left: 60, right: 30, top: 45, bottom: 55 };
    var gw = W - pad.left - pad.right;
    var gh = H - pad.top - pad.bottom;
    var ox = pad.left + gw / 2;  // origin at centre (for diode negative region)
    var oy = pad.top + gh / 2;

    // Draw axes through centre
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';
    ctx.lineWidth = 1.5;
    // Horizontal axis (V)
    ctx.beginPath();
    ctx.moveTo(pad.left - 5, oy);
    ctx.lineTo(pad.left + gw + 5, oy);
    ctx.stroke();
    // Vertical axis (I)
    ctx.beginPath();
    ctx.moveTo(ox, pad.top - 5);
    ctx.lineTo(ox, pad.top + gh + 5);
    ctx.stroke();
    ctx.restore();

    // Axis labels
    drawText(ctx, 'V', pad.left + gw + 10, oy, '13px sans-serif', '#42a5f5', 'left');
    drawText(ctx, 'I', ox, pad.top - 15, '13px sans-serif', '#ef5350', 'center');
    drawText(ctx, '0', ox - 10, oy + 14, '11px sans-serif', '#8b90a0', 'center');

    // Animate progress (0 to 1)
    if (ivAnimProgress < 1) {
        ivAnimProgress += 0.015;
        if (ivAnimProgress > 1) ivAnimProgress = 1;
    }

    // Draw based on selected conductor
    switch (currentConductor) {
        case 'ohmic':
            drawOhmicIV(ctx, ox, oy, gw, gh, pad, ivAnimProgress);
            break;
        case 'filament':
            drawFilamentIV(ctx, ox, oy, gw, gh, pad, ivAnimProgress);
            break;
        case 'diode':
            drawDiodeIV(ctx, ox, oy, gw, gh, pad, ivAnimProgress);
            break;
    }

    // Title
    var titles = {
        ohmic: 'Ohmic Conductor (e.g. Constantan Wire)',
        filament: 'Filament Lamp',
        diode: 'Semiconductor Diode'
    };
    drawCentredText(ctx, 'I–V Characteristic: ' + (titles[currentConductor] || ''),
        W / 2, 20, 'bold 12px sans-serif', '#4fc3f7');

    if (ivAnimProgress < 1) {
        ivAnimId = requestAnimationFrame(animateIVGraph);
    } else {
        ivAnimRunning = false;
        // Draw hover instruction
        drawCentredText(ctx, '(Graph complete)', W / 2, H - 12, '10px sans-serif', '#8b90a0');
    }
}


/* ─── Ohmic conductor I–V ─── */
function drawOhmicIV(ctx, ox, oy, gw, gh, pad, progress) {
    var halfGW = gw / 2;
    var halfGH = gh / 2;

    // Straight line through origin: I = V/R
    // Scale: V from -6 to +6, I from -0.6 to +0.6
    var maxV = 6;
    var maxI = 0.6;

    // Grid lines
    drawIVGrid(ctx, ox, oy, halfGW, halfGH, maxV, maxI, 2, 0.2);

    ctx.save();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();

    var steps = Math.floor(200 * progress);
    for (var i = 0; i <= steps; i++) {
        var t = (i / 200) * 2 - 1; // -1 to +1
        var V = t * maxV;
        var I = V / 10; // R = 10Ω

        var px = ox + (V / maxV) * halfGW;
        var py = oy - (I / maxI) * halfGH;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Label
    if (progress > 0.8) {
        drawText(ctx, 'Straight line', ox + halfGW * 0.5, oy - halfGH * 0.6,
            'bold 12px sans-serif', '#66bb6a', 'left');
        drawText(ctx, '→ Constant R', ox + halfGW * 0.5, oy - halfGH * 0.6 + 16,
            '11px sans-serif', '#66bb6a', 'left');
        drawText(ctx, 'R = V/I = constant', ox + halfGW * 0.5, oy - halfGH * 0.6 + 32,
            '11px sans-serif', '#8b90a0', 'left');
    }
}


/* ─── Filament lamp I–V ─── */
function drawFilamentIV(ctx, ox, oy, gw, gh, pad, progress) {
    var halfGW = gw / 2;
    var halfGH = gh / 2;
    var maxV = 6;
    var maxI = 0.8;

    drawIVGrid(ctx, ox, oy, halfGW, halfGH, maxV, maxI, 2, 0.2);

    // Filament lamp: symmetric S-curve through origin
    // I increases less steeply as V increases (R increases with temperature)
    ctx.save();
    ctx.strokeStyle = '#ffa726';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();

    var steps = Math.floor(200 * progress);
    for (var i = 0; i <= steps; i++) {
        var t = (i / 200) * 2 - 1; // -1 to +1
        var V = t * maxV;
        // Non-linear: I = k * V^(1/2) for filament (simplified)
        // Use: I = 0.25 * sign(V) * |V|^0.6
        var I = 0.22 * Math.sign(V) * Math.pow(Math.abs(V), 0.6);

        var px = ox + (V / maxV) * halfGW;
        var py = oy - (I / maxI) * halfGH;

        py = clamp(py, pad.top, pad.top + gh);

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Dashed straight line for comparison
    if (progress > 0.5) {
        ctx.save();
        ctx.strokeStyle = 'rgba(79,195,247,0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ox - halfGW, oy + halfGH * 0.8);
        ctx.lineTo(ox + halfGW, oy - halfGH * 0.8);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        drawText(ctx, '(ohmic line for comparison)', ox + halfGW * 0.2, oy - halfGH * 0.85,
            '10px sans-serif', 'rgba(79,195,247,0.5)', 'left');
    }

    // Labels
    if (progress > 0.8) {
        drawText(ctx, 'Curve bends', ox + halfGW * 0.3, oy - halfGH * 0.45,
            'bold 12px sans-serif', '#ffa726', 'left');
        drawText(ctx, '→ R increases', ox + halfGW * 0.3, oy - halfGH * 0.45 + 16,
            '11px sans-serif', '#ffa726', 'left');
        drawText(ctx, '(temp ↑ → R ↑)', ox + halfGW * 0.3, oy - halfGH * 0.45 + 32,
            '11px sans-serif', '#8b90a0', 'left');
    }
}


/* ─── Semiconductor diode I–V ─── */
function drawDiodeIV(ctx, ox, oy, gw, gh, pad, progress) {
    var halfGW = gw / 2;
    var halfGH = gh / 2;
    var maxV = 2;     // forward to 2V
    var minV = -2;    // reverse to -2V
    var maxI = 1.2;   // forward current up to ~1.2 units
    var minI = -0.1;  // tiny reverse current

    // Custom grid for diode
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 0.5;

    // V grid
    for (var v = -2; v <= 2; v += 0.5) {
        var xp = ox + (v / maxV) * halfGW;
        ctx.beginPath();
        ctx.moveTo(xp, pad.top);
        ctx.lineTo(xp, pad.top + gh);
        ctx.stroke();
        if (v === Math.round(v)) {
            drawText(ctx, v.toFixed(0), xp, oy + 14, '10px sans-serif', '#8b90a0', 'center');
        }
    }
    // I grid
    for (var ia = -0.2; ia <= 1.2; ia += 0.2) {
        var yp = oy - (ia / maxI) * halfGH;
        if (yp >= pad.top && yp <= pad.top + gh) {
            ctx.beginPath();
            ctx.moveTo(pad.left, yp);
            ctx.lineTo(pad.left + gw, yp);
            ctx.stroke();
            drawText(ctx, ia.toFixed(1), ox - 8, yp, '10px sans-serif', '#8b90a0', 'right');
        }
    }
    ctx.restore();

    // Threshold voltage line
    var threshX = ox + (0.7 / maxV) * halfGW;
    drawDashedLine(ctx, threshX, pad.top, threshX, pad.top + gh, '#ef535066');
    if (progress > 0.5) {
        drawText(ctx, '~0.7V', threshX + 4, pad.top + 10, '10px sans-serif', '#ef5350', 'left');
        drawText(ctx, '(threshold)', threshX + 4, pad.top + 22, '9px sans-serif', '#ef535099', 'left');
    }

    // Diode I–V curve
    ctx.save();
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();

    var steps = Math.floor(300 * progress);
    var firstPoint = true;

    for (var i = 0; i <= steps; i++) {
        var t = i / 300; // 0 to 1
        // Map t: first half = reverse bias (-2V to 0V), second half = forward (0V to 2V)
        var V;
        if (t < 0.4) {
            V = -2 + (t / 0.4) * 2; // -2 to 0
        } else {
            V = ((t - 0.4) / 0.6) * 2; // 0 to 2
        }

        var I;
        if (V < 0) {
            // Reverse bias — tiny leakage current
            I = -0.02;
        } else if (V < 0.6) {
            // Below threshold — almost zero
            I = 0.005 * Math.exp(V * 2);
        } else {
            // Forward bias — exponential rise
            I = 0.005 * Math.exp(V * 2) + 0.1 * Math.pow(V - 0.5, 3);
        }

        I = clamp(I, minI, maxI);

        var px = ox + (V / maxV) * halfGW;
        var py = oy - (I / maxI) * halfGH;
        py = clamp(py, pad.top, pad.top + gh);
        px = clamp(px, pad.left, pad.left + gw);

        if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    ctx.restore();

    // Labels
    if (progress > 0.6) {
        // Forward bias region
        drawText(ctx, 'Forward bias', ox + halfGW * 0.4, oy - halfGH * 0.7,
            'bold 12px sans-serif', '#66bb6a', 'center');
        drawText(ctx, '(conducts)', ox + halfGW * 0.4, oy - halfGH * 0.7 + 15,
            '11px sans-serif', '#66bb6a', 'center');
    }
    if (progress > 0.3) {
        // Reverse bias region
        drawText(ctx, 'Reverse bias', ox - halfGW * 0.5, oy + halfGH * 0.3,
            'bold 12px sans-serif', '#ef5350', 'center');
        drawText(ctx, '(no current)', ox - halfGW * 0.5, oy + halfGH * 0.3 + 15,
            '11px sans-serif', '#ef5350', 'center');
    }

    // Diode symbol at bottom right
    if (progress > 0.9) {
        drawDiodeSymbol(ctx, pad.left + gw - 50, pad.top + gh - 30);
    }
}


/* ─── Diode circuit symbol ─── */
function drawDiodeSymbol(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';
    ctx.fillStyle = '#e2e4ea';
    ctx.lineWidth = 2;

    // Triangle
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.stroke();

    // Bar
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.stroke();

    // Leads
    ctx.beginPath();
    ctx.moveTo(x - 22, y);
    ctx.lineTo(x - 10, y);
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 22, y);
    ctx.stroke();

    ctx.restore();
}


/* ─── I–V Grid Helper ─── */
function drawIVGrid(ctx, ox, oy, halfGW, halfGH, maxV, maxI, vStep, iStep) {
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 0.5;

    // Vertical grid lines (V values)
    for (var v = -maxV; v <= maxV; v += vStep) {
        var xp = ox + (v / maxV) * halfGW;
        ctx.beginPath();
        ctx.moveTo(xp, oy - halfGH);
        ctx.lineTo(xp, oy + halfGH);
        ctx.stroke();
        if (v !== 0) {
            drawText(ctx, v.toFixed(0), xp, oy + 14, '10px sans-serif', '#8b90a0', 'center');
        }
    }

    // Horizontal grid lines (I values)
    for (var i = -maxI; i <= maxI; i += iStep) {
        if (Math.abs(i) < 0.001) continue;
        var yp = oy - (i / maxI) * halfGH;
        ctx.beginPath();
        ctx.moveTo(ox - halfGW, yp);
        ctx.lineTo(ox + halfGW, yp);
        ctx.stroke();
        // Label every other line
        var rounded = Math.round(i * 100) / 100;
        if (Math.abs(rounded % (iStep * 2)) < 0.001 || iStep >= 0.2) {
            drawText(ctx, rounded.toFixed(1), ox - 8, yp, '10px sans-serif', '#8b90a0', 'right');
        }
    }
    ctx.restore();
}


/* ═══════════════════════════════════════
   3. WATER ANALOGY ANIMATION
   Optional: animate water drops flowing
   ═══════════════════════════════════════ */

var waterDrops = [];
var waterAnimId = null;
var waterAnimRunning = false;

function startWaterAnimation() {
    var canvas = document.getElementById('canvas-water-analogy');
    if (!canvas) return;

    if (waterAnimId) {
        cancelAnimationFrame(waterAnimId);
    }

    // Initialize water drops on the left side (pipe system)
    waterDrops = [];
    for (var i = 0; i < 8; i++) {
        waterDrops.push({
            t: i / 8,
            speed: 0.003
        });
    }
    waterAnimRunning = true;
    animateWater();
}

function getWaterPath(W, H) {
    var col1 = W * 0.25;
    var highY = H * 0.18;
    var lowY = H * 0.82;
    var pumpY = H * 0.3;
    var wheelY = H * 0.58;

    // Clockwise path for water drops
    return [
        { x: col1 + 50, y: pumpY - 18 },  // out of pump top
        { x: col1 + 50, y: highY },         // top right
        { x: col1 - 50, y: highY },         // top left
        { x: col1 - 50, y: wheelY - 18 },   // before wheel
        { x: col1 - 50, y: wheelY + 18 },   // after wheel
        { x: col1 - 50, y: lowY },          // bottom left
        { x: col1 + 50, y: lowY },          // bottom right
        { x: col1 + 50, y: pumpY + 18 }     // back to pump
    ];
}

function animateWater() {
    if (!waterAnimRunning) return;

    var canvas = document.getElementById('canvas-water-analogy');
    if (!canvas) { waterAnimRunning = false; return; }

    var section = document.getElementById('sec-pd');
    if (!section || !section.classList.contains('active')) {
        waterAnimRunning = false;
        return;
    }

    // Draw the static water analogy first
    drawWaterAnalogy();

    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    var path = getWaterPath(W, H);

    // Animate water drops
    for (var i = 0; i < waterDrops.length; i++) {
        var drop = waterDrops[i];
        drop.t += drop.speed;
        if (drop.t > 1) drop.t -= 1;

        var pos = getPointOnPath(path, drop.t);

        ctx.save();
        ctx.fillStyle = '#29b6f6';
        ctx.shadowColor = '#29b6f6';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    waterAnimId = requestAnimationFrame(animateWater);
}

function stopWaterAnimation() {
    waterAnimRunning = false;
    if (waterAnimId) {
        cancelAnimationFrame(waterAnimId);
        waterAnimId = null;
    }
}


/* ═══════════════════════════════════════
   4. SERIES CIRCUIT ELECTRON ANIMATION
   ═══════════════════════════════════════ */

var seriesElectrons = [];
var seriesAnimId = null;
var seriesAnimRunning = false;

function startSeriesAnimation() {
    var canvas = document.getElementById('canvas-series');
    if (!canvas) return;

    if (seriesAnimId) cancelAnimationFrame(seriesAnimId);

    seriesElectrons = [];
    for (var i = 0; i < 10; i++) {
        seriesElectrons.push({ t: i / 10 });
    }
    seriesAnimRunning = true;
    animateSeriesCircuit();
}

function getSeriesPath(W, H) {
    var cx = W * 0.5;
    var bw = W * 0.7, bh = H * 0.5;
    var left = cx - bw / 2, right = cx + bw / 2;
    var top_ = (H * 0.45) - bh / 2;
    var bottom = (H * 0.45) + bh / 2;

    return [
        { x: left, y: bottom },
        { x: left, y: top_ },
        { x: left + bw * 0.33, y: top_ },
        { x: left + bw * 0.67, y: top_ },
        { x: right, y: top_ },
        { x: right, y: bottom }
    ];
}

function animateSeriesCircuit() {
    if (!seriesAnimRunning) return;

    var canvas = document.getElementById('canvas-series');
    if (!canvas) { seriesAnimRunning = false; return; }

    var section = document.getElementById('sec-series');
    if (!section || !section.classList.contains('active')) {
        seriesAnimRunning = false;
        return;
    }

    var V = parseFloat(document.getElementById('slider-ser-v').value) || 12;
    var R1 = parseFloat(document.getElementById('slider-ser-r1').value) || 4;
    var R2 = parseFloat(document.getElementById('slider-ser-r2').value) || 8;
    var Rt = R1 + R2;
    var I = V / Rt;
    var speedFactor = I / 1.5;

    // Draw static circuit
    drawSeriesCircuit();

    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    var path = getSeriesPath(W, H);

    // Move and draw electrons
    for (var i = 0; i < seriesElectrons.length; i++) {
        var el = seriesElectrons[i];
        el.t -= 0.002 * speedFactor;
        if (el.t < 0) el.t += 1;
        var pos = getPointOnPath(path, el.t);
        drawElectron(ctx, pos.x, pos.y, 4);
    }

    seriesAnimId = requestAnimationFrame(animateSeriesCircuit);
}

function stopSeriesAnimation() {
    seriesAnimRunning = false;
    if (seriesAnimId) {
        cancelAnimationFrame(seriesAnimId);
        seriesAnimId = null;
    }
}


/* ═══════════════════════════════════════
   5. PARALLEL CIRCUIT ELECTRON ANIMATION
   ═══════════════════════════════════════ */

var parallelElectrons1 = [];
var parallelElectrons2 = [];
var parallelAnimId = null;
var parallelAnimRunning = false;

function startParallelAnimation() {
    var canvas = document.getElementById('canvas-parallel');
    if (!canvas) return;

    if (parallelAnimId) cancelAnimationFrame(parallelAnimId);

    parallelElectrons1 = [];
    parallelElectrons2 = [];
    for (var i = 0; i < 6; i++) {
        parallelElectrons1.push({ t: i / 6 });
    }
    for (var j = 0; j < 4; j++) {
        parallelElectrons2.push({ t: j / 4 });
    }
    parallelAnimRunning = true;
    animateParallelCircuit();
}

function getParallelPath1(W, H) {
    var cx = W * 0.5, cy = H * 0.48;
    var bw = W * 0.65, bh = H * 0.6;
    var left = cx - bw / 2, right = cx + bw / 2;
    var top_ = cy - bh / 2, bottom = cy + bh / 2;
    var b1y = cy - bh * 0.18;
    var jLeft = left + bw * 0.25;
    var jRight = left + bw * 0.75;

    return [
        { x: left, y: bottom },
        { x: left, y: top_ },
        { x: jLeft, y: top_ },
        { x: jLeft, y: b1y },
        { x: jRight, y: b1y },
        { x: jRight, y: top_ },
        { x: right, y: top_ },
        { x: right, y: bottom }
    ];
}

function getParallelPath2(W, H) {
    var cx = W * 0.5, cy = H * 0.48;
    var bw = W * 0.65, bh = H * 0.6;
    var left = cx - bw / 2, right = cx + bw / 2;
    var top_ = cy - bh / 2, bottom = cy + bh / 2;
    var b2y = cy + bh * 0.18;
    var jLeft = left + bw * 0.25;
    var jRight = left + bw * 0.75;

    return [
        { x: left, y: bottom },
        { x: left, y: top_ },
        { x: jLeft, y: top_ },
        { x: jLeft, y: b2y },
        { x: jRight, y: b2y },
        { x: jRight, y: top_ },
        { x: right, y: top_ },
        { x: right, y: bottom }
    ];
}

function animateParallelCircuit() {
    if (!parallelAnimRunning) return;

    var canvas = document.getElementById('canvas-parallel');
    if (!canvas) { parallelAnimRunning = false; return; }

    var section = document.getElementById('sec-parallel');
    if (!section || !section.classList.contains('active')) {
        parallelAnimRunning = false;
        return;
    }

    var V = parseFloat(document.getElementById('slider-par-v').value) || 12;
    var R1 = parseFloat(document.getElementById('slider-par-r1').value) || 6;
    var R2 = parseFloat(document.getElementById('slider-par-r2').value) || 12;
    var I1 = V / R1;
    var I2 = V / R2;
    var maxI = Math.max(I1, I2, 1);

    // Draw static circuit
    drawParallelCircuit();

    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    var path1 = getParallelPath1(W, H);
    var path2 = getParallelPath2(W, H);

    // Branch 1 electrons — speed proportional to I1
    var speed1 = 0.002 * (I1 / maxI);
    for (var i = 0; i < parallelElectrons1.length; i++) {
        var el1 = parallelElectrons1[i];
        el1.t -= speed1;
        if (el1.t < 0) el1.t += 1;
        var pos1 = getPointOnPath(path1, el1.t);
        drawElectron(ctx, pos1.x, pos1.y, 4);
    }

    // Branch 2 electrons — speed proportional to I2
    var speed2 = 0.002 * (I2 / maxI);
    for (var j = 0; j < parallelElectrons2.length; j++) {
        var el2 = parallelElectrons2[j];
        el2.t -= speed2;
        if (el2.t < 0) el2.t += 1;
        var pos2 = getPointOnPath(path2, el2.t);
        drawElectron(ctx, pos2.x, pos2.y, 4);
    }

    parallelAnimId = requestAnimationFrame(animateParallelCircuit);
}

function stopParallelAnimation() {
    parallelAnimRunning = false;
    if (parallelAnimId) {
        cancelAnimationFrame(parallelAnimId);
        parallelAnimId = null;
    }
}


/* ═══════════════════════════════════════
   6. DIVIDER CIRCUIT ANIMATION
   ═══════════════════════════════════════ */

var dividerElectrons = [];
var dividerAnimId = null;
var dividerAnimRunning = false;

function startDividerAnimation() {
    var canvas = document.getElementById('canvas-divider');
    if (!canvas) return;

    if (dividerAnimId) cancelAnimationFrame(dividerAnimId);

    dividerElectrons = [];
    for (var i = 0; i < 8; i++) {
        dividerElectrons.push({ t: i / 8 });
    }
    dividerAnimRunning = true;
    animateDividerCircuit();
}

function getDividerPath(W, H) {
    var cx = W * 0.35;
    var batX = cx - 60;
    var top_ = H * 0.12;
    var bottom = H * 0.88;

    return [
        { x: batX, y: bottom },
        { x: batX, y: top_ },
        { x: cx, y: top_ },
        { x: cx, y: top_ + (bottom - top_) * 0.5 },
        { x: cx, y: bottom },
        { x: batX, y: bottom }
    ];
}

function animateDividerCircuit() {
    if (!dividerAnimRunning) return;

    var canvas = document.getElementById('canvas-divider');
    if (!canvas) { dividerAnimRunning = false; return; }

    var section = document.getElementById('sec-divider');
    if (!section || !section.classList.contains('active')) {
        dividerAnimRunning = false;
        return;
    }

    var Vs = parseFloat(document.getElementById('slider-div-vs').value) || 12;
    var R1 = parseFloat(document.getElementById('slider-div-r1').value) || 4;
    var R2 = parseFloat(document.getElementById('slider-div-r2').value) || 8;
    var I = Vs / (R1 + R2);
    var speedFactor = I / 1;

    // Draw static circuit
    drawDividerCircuit();

    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    var path = getDividerPath(W, H);

    for (var i = 0; i < dividerElectrons.length; i++) {
        var el = dividerElectrons[i];
        el.t -= 0.0015 * speedFactor;
        if (el.t < 0) el.t += 1;
        var pos = getPointOnPath(path, el.t);
        drawElectron(ctx, pos.x, pos.y, 4);
    }

    dividerAnimId = requestAnimationFrame(animateDividerCircuit);
}

function stopDividerAnimation() {
    dividerAnimRunning = false;
    if (dividerAnimId) {
        cancelAnimationFrame(dividerAnimId);
        dividerAnimId = null;
    }
}


/* ═══════════════════════════════════════
   MASTER ANIMATION CONTROLLER
   Start/stop animations based on current page
   ═══════════════════════════════════════ */

// Override the initPageInteractives to include animations
var _originalInitPage = (typeof initPageInteractives === 'function') ? initPageInteractives : null;

// We hook into the page change to manage animations
function manageAnimations(pageId) {
    // Stop all animations
    stopCurrentFlowAnimation();
    stopWaterAnimation();
    stopSeriesAnimation();
    stopParallelAnimation();
    stopDividerAnimation();

    if (ivAnimId) {
        cancelAnimationFrame(ivAnimId);
        ivAnimId = null;
        ivAnimRunning = false;
    }

    // Start relevant animation
    switch (pageId) {
        case 'current':
            setTimeout(startCurrentFlowAnimation, 200);
            break;
        case 'pd':
            setTimeout(startWaterAnimation, 200);
            break;
        case 'nonohmic':
            setTimeout(function () { drawIVGraph(); }, 200);
            break;
        case 'series':
            setTimeout(startSeriesAnimation, 200);
            break;
        case 'parallel':
            setTimeout(startParallelAnimation, 200);
            break;
        case 'divider':
            setTimeout(startDividerAnimation, 200);
            break;
    }
}

// Patch into goTo function — listen for page changes
(function () {
    var originalGoTo = window.goTo;
    window.goTo = function (pageId, animate) {
        if (typeof originalGoTo === 'function') {
            originalGoTo(pageId, animate);
        }
        // Manage animations after page change
        setTimeout(function () {
            manageAnimations(pageId);
        }, 250);
    };
})();

// Start animation for initial page
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        manageAnimations(currentPage || 'welcome');
    }, 500);
});