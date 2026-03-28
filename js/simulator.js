/* ═══════════════════════════════════════════════════════════════
   ⚡ ELECTRICITY EXPLORER — simulator.js
   Additional interactive simulations & enhancements:
     • Ohm's Law interactive circuit with live ammeter/voltmeter
     • Power triangle interactive (click to find unknown)
     • Enhanced wire resistance visualisation
     • Mini circuit builder for series/parallel exploration
     • Tooltip system for canvases
     • Responsive canvas redraw coordinator
   ═══════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════
   1. OHM'S LAW INTERACTIVE CIRCUIT
   Draws a live circuit alongside the V-I graph
   ═══════════════════════════════════════ */

function drawOhmCircuit() {
    var canvas = document.getElementById('canvas-ohm');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);

    // We split the canvas: left half = circuit, right half = graph
    var splitX = W * 0.42;

    // ─── LEFT: Mini circuit ───
    var cx = splitX * 0.5;
    var cy = H * 0.5;
    var bw = splitX * 0.7;
    var bh = H * 0.55;
    var left = cx - bw / 2;
    var right = cx + bw / 2;
    var top_ = cy - bh / 2;
    var bottom = cy + bh / 2;

    var R = parseFloat(document.getElementById('slider-ohm-r').value) || 10;
    var V = parseFloat(document.getElementById('slider-ohm-v').value) || 5;
    if (R <= 0) R = 0.1;
    var I = V / R;

    // Wires
    drawWire(ctx, left, top_, right, top_);
    drawWire(ctx, right, top_, right, bottom);
    drawWire(ctx, right, bottom, left, bottom);
    drawWire(ctx, left, bottom, left, top_);

    // Battery on left (vertical)
    drawBatteryVert(ctx, left, top_ + bh * 0.25, left, top_ + bh * 0.75);

    // Resistor on top
    var rMid = (left + right) / 2;
    drawResistorHoriz(ctx, left + bw * 0.2, top_, left + bw * 0.8, R + ' Ω');

    // Ammeter on right
    var amY = cy;
    drawAmmeter(ctx, right, amY, Math.min(13, bw * 0.12));
    drawWire(ctx, right, top_, right, amY - 13);
    drawWire(ctx, right, amY + 13, right, bottom);

    // Voltmeter across resistor (dashed parallel)
    var vmY = top_ - 28;
    if (vmY < 25) vmY = 25;
    drawVoltmeter(ctx, rMid, vmY, Math.min(12, bw * 0.1));
    ctx.save();
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(rMid - 12, vmY);
    ctx.lineTo(left + bw * 0.2, vmY);
    ctx.lineTo(left + bw * 0.2, top_);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rMid + 12, vmY);
    ctx.lineTo(left + bw * 0.8, vmY);
    ctx.lineTo(left + bw * 0.8, top_);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Values
    drawText(ctx, V.toFixed(1) + ' V', left - 8, cy, 'bold 11px sans-serif', '#ffa726', 'right');
    drawText(ctx, I.toFixed(3) + ' A', right + 4, amY + 20, '10px sans-serif', '#ef5350', 'left');
    drawText(ctx, V.toFixed(1) + ' V', rMid, vmY - 16, '10px sans-serif', '#42a5f5', 'center');

    // Label
    drawCentredText(ctx, 'Circuit', splitX * 0.5, H - 10, '10px sans-serif', '#8b90a0');
}

// Override drawOhmGraph to include circuit diagram
var _origDrawOhmGraph = (typeof drawOhmGraph === 'function') ? drawOhmGraph : null;

function drawOhmGraphEnhanced() {
    var canvas = document.getElementById('canvas-ohm');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var R = parseFloat(document.getElementById('slider-ohm-r').value) || 10;
    var V = parseFloat(document.getElementById('slider-ohm-v').value) || 5;
    if (R <= 0) R = 0.1;
    var I = V / R;

    var splitX = W * 0.42;

    // ─── Draw mini circuit on left ───
    drawOhmCircuit();

    // ─── Draw divider line ───
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(splitX, 10);
    ctx.lineTo(splitX, H - 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ─── RIGHT: V-I Graph ───
    var pad = { left: splitX + 45, right: 20, top: 40, bottom: 45 };
    var gw = W - pad.left - pad.right;
    var gh = H - pad.top - pad.bottom;
    var ox = pad.left;
    var oy = pad.top + gh;

    var maxV = 14;
    var maxI = maxV / Math.max(R, 1);
    if (maxI < 0.5) maxI = 0.5;
    maxI = Math.ceil(maxI * 10) / 10;
    if (maxI > 15) maxI = 15;

    // Axes
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox, pad.top - 5);
    ctx.lineTo(ox, oy);
    ctx.lineTo(W - pad.right + 5, oy);
    ctx.stroke();
    ctx.restore();

    drawText(ctx, 'I (A)', ox - 5, pad.top - 15, '11px sans-serif', '#ef5350', 'center');
    drawText(ctx, 'V (V)', W - pad.right + 5, oy + 16, '11px sans-serif', '#42a5f5', 'center');
    drawCentredText(ctx, 'V–I Graph  (R = ' + R + ' Ω)', (pad.left + W - pad.right) / 2, 18, '11px sans-serif', '#8b90a0');

    // Grid
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 0.5;
    for (var vi = 0; vi <= maxV; vi += 2) {
        var xp = ox + (vi / maxV) * gw;
        ctx.beginPath();
        ctx.moveTo(xp, pad.top);
        ctx.lineTo(xp, oy);
        ctx.stroke();
        drawText(ctx, vi.toString(), xp, oy + 12, '9px sans-serif', '#8b90a0', 'center');
    }
    var iStep = maxI > 2 ? 0.5 : (maxI > 0.5 ? 0.1 : 0.05);
    for (var ii = 0; ii <= maxI + 0.001; ii += iStep) {
        var yp = oy - (ii / maxI) * gh;
        ctx.beginPath();
        ctx.moveTo(ox, yp);
        ctx.lineTo(ox + gw, yp);
        ctx.stroke();
        var roundedI = Math.round(ii * 100) / 100;
        if (iStep >= 0.5 || Math.abs(roundedI % (iStep * 2)) < 0.001) {
            drawText(ctx, roundedI.toFixed(2), ox - 6, yp, '9px sans-serif', '#8b90a0', 'right');
        }
    }
    ctx.restore();

    // Line: I = V/R
    ctx.save();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    var endV2 = Math.min(maxV, maxI * R);
    var endI2 = endV2 / R;
    var endX2 = ox + (endV2 / maxV) * gw;
    var endY2 = oy - (endI2 / maxI) * gh;
    ctx.lineTo(endX2, endY2);
    ctx.stroke();
    ctx.restore();

    // Slope label
    if (gw > 100) {
        var midLX = ox + (endV2 / maxV) * gw * 0.6;
        var midLY = oy - (endI2 / maxI) * gh * 0.6;
        drawText(ctx, 'slope = 1/R', midLX + 8, midLY - 8, '10px sans-serif', '#4fc3f7', 'left');
    }

    // Current point
    if (V <= maxV && I <= maxI) {
        var px = ox + (V / maxV) * gw;
        var py = oy - (I / maxI) * gh;

        drawDashedLine(ctx, px, py, px, oy, '#42a5f5');
        drawDashedLine(ctx, px, py, ox, py, '#ef5350');

        ctx.save();
        ctx.fillStyle = '#ffa726';
        ctx.shadowColor = '#ffa726';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (gw > 80) {
            drawText(ctx, '(' + V.toFixed(1) + 'V, ' + I.toFixed(3) + 'A)',
                px + 8, py - 10, '10px sans-serif', '#ffa726', 'left');
        }
    }

    // Label
    drawCentredText(ctx, 'V–I Graph', (pad.left + W - pad.right) / 2, H - 8, '10px sans-serif', '#8b90a0');
}

// Replace the original drawOhmGraph
drawOhmGraph = drawOhmGraphEnhanced;


/* ═══════════════════════════════════════
   2. POWER TRIANGLE INTERACTIVE
   Click on P, V, or I to highlight the formula
   ═══════════════════════════════════════ */

var powerTriHighlight = null; // 'P', 'V', 'I', or null
var powerTriAreas = [];

function drawPowerTriangleEnhanced() {
    var canvas = document.getElementById('canvas-power-tri');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);
    powerTriAreas = [];

    var cx = W * 0.5;
    var triW = Math.min(W * 0.4, 200);
    var triH = triW * 0.75;
    var topY = H * 0.22;
    var botY = topY + triH;
    var midY = topY + triH * 0.45;

    // ─── Triangle ───
    ctx.save();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx - triW / 2, botY);
    ctx.lineTo(cx + triW / 2, botY);
    ctx.closePath();
    ctx.stroke();

    // Horizontal divider
    ctx.beginPath();
    ctx.moveTo(cx - triW * 0.35, midY);
    ctx.lineTo(cx + triW * 0.35, midY);
    ctx.stroke();

    // Vertical divider between V and I
    ctx.beginPath();
    ctx.moveTo(cx, midY);
    ctx.lineTo(cx, botY);
    ctx.stroke();
    ctx.restore();

    // ─── Clickable regions ───
    var pCentre = { x: cx, y: topY + (midY - topY) * 0.5 };
    var vCentre = { x: cx - triW * 0.18, y: midY + (botY - midY) * 0.5 };
    var iCentre = { x: cx + triW * 0.18, y: midY + (botY - midY) * 0.5 };

    powerTriAreas = [
        { x: pCentre.x, y: pCentre.y, r: triW * 0.22, label: 'P' },
        { x: vCentre.x, y: vCentre.y, r: triW * 0.2, label: 'V' },
        { x: iCentre.x, y: iCentre.y, r: triW * 0.2, label: 'I' }
    ];

    // ─── Highlight selected ───
    if (powerTriHighlight) {
        var hlArea = powerTriAreas.find(function (a) { return a.label === powerTriHighlight; });
        if (hlArea) {
            ctx.save();
            ctx.fillStyle = 'rgba(79,195,247,0.15)';
            ctx.beginPath();
            if (powerTriHighlight === 'P') {
                // Highlight top section
                ctx.moveTo(cx, topY + 2);
                ctx.lineTo(cx - triW * 0.35, midY);
                ctx.lineTo(cx + triW * 0.35, midY);
                ctx.closePath();
            } else if (powerTriHighlight === 'V') {
                // Highlight bottom-left
                ctx.moveTo(cx - triW * 0.35, midY);
                ctx.lineTo(cx - triW / 2, botY);
                ctx.lineTo(cx, botY);
                ctx.lineTo(cx, midY);
                ctx.closePath();
            } else if (powerTriHighlight === 'I') {
                // Highlight bottom-right
                ctx.moveTo(cx, midY);
                ctx.lineTo(cx, botY);
                ctx.lineTo(cx + triW / 2, botY);
                ctx.lineTo(cx + triW * 0.35, midY);
                ctx.closePath();
            }
            ctx.fill();
            ctx.restore();
        }
    }

    // ─── Labels inside triangle ───
    var pCol = powerTriHighlight === 'P' ? '#ffa726' : '#ffa726';
    var vCol = powerTriHighlight === 'V' ? '#42a5f5' : '#42a5f5';
    var iCol = powerTriHighlight === 'I' ? '#ef5350' : '#ef5350';

    var pFont = powerTriHighlight === 'P' ? 'bold 28px Georgia, serif' : 'bold 22px Georgia, serif';
    var vFont = powerTriHighlight === 'V' ? 'bold 28px Georgia, serif' : 'bold 22px Georgia, serif';
    var iFont = powerTriHighlight === 'I' ? 'bold 28px Georgia, serif' : 'bold 22px Georgia, serif';

    drawCentredText(ctx, 'P', pCentre.x, pCentre.y, pFont, pCol);
    drawCentredText(ctx, 'V', vCentre.x, vCentre.y, vFont, vCol);
    drawCentredText(ctx, 'I', iCentre.x, iCentre.y, iFont, iCol);
    drawCentredText(ctx, '×', cx, midY + (botY - midY) * 0.5, '16px sans-serif', '#8b90a0');

    // ─── Formula display based on selection ───
    var fy = botY + 25;
    var formulaText = '';
    var formulaCol = '#e2e4ea';

    if (powerTriHighlight === 'P') {
        formulaText = 'Cover P  →  P = V × I';
        formulaCol = '#ffa726';
        drawCentredText(ctx, '(Cover what you want to find)', cx, topY - 12, '11px sans-serif', '#8b90a0');
    } else if (powerTriHighlight === 'V') {
        formulaText = 'Cover V  →  V = P / I';
        formulaCol = '#42a5f5';
    } else if (powerTriHighlight === 'I') {
        formulaText = 'Cover I  →  I = P / V';
        formulaCol = '#ef5350';
    } else {
        formulaText = '👆 Click P, V or I to find the formula!';
        formulaCol = '#8b90a0';
    }

    drawCentredText(ctx, formulaText, cx, fy, 'bold 14px sans-serif', formulaCol);

    // ─── Extra formulas ───
    var fy2 = fy + 24;
    drawCentredText(ctx, 'Also:  P = I²R    |    P = V²/R', cx, fy2, '12px sans-serif', '#8b90a0');

    // ─── All three formulas listed ───
    var fy3 = fy2 + 24;
    var thirdW = (W - 40) / 3;
    drawCentredText(ctx, 'P = V × I', 20 + thirdW * 0.5, fy3, '12px sans-serif',
        powerTriHighlight === 'P' ? '#ffa726' : '#555');
    drawCentredText(ctx, 'V = P / I', 20 + thirdW * 1.5, fy3, '12px sans-serif',
        powerTriHighlight === 'V' ? '#42a5f5' : '#555');
    drawCentredText(ctx, 'I = P / V', 20 + thirdW * 2.5, fy3, '12px sans-serif',
        powerTriHighlight === 'I' ? '#ef5350' : '#555');

    // ─── Click handler ───
    if (!canvas._powerTriListenerAdded) {
        canvas.addEventListener('click', handlePowerTriClick);
        canvas._powerTriListenerAdded = true;
    }
}

function handlePowerTriClick(e) {
    var canvas = document.getElementById('canvas-power-tri');
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var scaleX = cw(canvas) / rect.width;
    var scaleY = ch(canvas) / rect.height;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top) * scaleY;

    var clicked = null;
    for (var i = 0; i < powerTriAreas.length; i++) {
        var area = powerTriAreas[i];
        var dx = mx - area.x;
        var dy = my - area.y;
        if (dx * dx + dy * dy < area.r * area.r) {
            clicked = area.label;
            break;
        }
    }

    if (clicked) {
        // Toggle: click same again to deselect
        powerTriHighlight = (powerTriHighlight === clicked) ? null : clicked;
    } else {
        powerTriHighlight = null;
    }

    drawPowerTriangleEnhanced();
}

// Replace original
drawPowerTriangle = drawPowerTriangleEnhanced;


/* ═══════════════════════════════════════
   3. ENHANCED WIRE RESISTANCE DEMO
   Shows cross-section view + electron analogy
   ═══════════════════════════════════════ */

function drawWireDemoEnhanced() {
    var canvas = document.getElementById('canvas-wire');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var len = parseFloat(document.getElementById('slider-wire-len').value) || 1;
    var dia = parseFloat(document.getElementById('slider-wire-dia').value) || 1;

    var radius_m = (dia / 2) * 1e-3;
    var area = Math.PI * radius_m * radius_m;
    var rho = 1.1e-6;
    var R = (rho * len) / area;

    // ─── SIDE VIEW (top half) ───
    var wireLeft = W * 0.12;
    var wireMaxW = W * 0.5;
    var wireW = wireMaxW * (len / 3);
    var maxThick = 30;
    var wireH = 4 + dia * (maxThick / 3);
    var wireY = H * 0.32;

    drawCentredText(ctx, 'Side View', wireLeft + wireMaxW * 0.5, H * 0.08, 'bold 11px sans-serif', '#8b90a0');

    // Ghost max outline
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(wireLeft, wireY - maxThick / 2, wireMaxW, maxThick);
    ctx.setLineDash([]);
    ctx.restore();

    // Actual wire
    ctx.save();
    var grad = ctx.createLinearGradient(wireLeft, wireY - wireH / 2, wireLeft, wireY + wireH / 2);
    grad.addColorStop(0, '#ff9800');
    grad.addColorStop(0.3, '#ffcc80');
    grad.addColorStop(0.5, '#ffe0b2');
    grad.addColorStop(0.7, '#ffcc80');
    grad.addColorStop(1, '#e65100');
    ctx.fillStyle = grad;
    roundRect(ctx, wireLeft, wireY - wireH / 2, wireW, wireH, 3);
    ctx.fill();
    ctx.restore();

    // Length arrow
    if (wireW > 30) {
        drawArrow(ctx, wireLeft, wireY + wireH / 2 + 16, wireLeft + wireW, wireY + wireH / 2 + 16, '#ffa726', 5);
        drawArrow(ctx, wireLeft + wireW, wireY + wireH / 2 + 16, wireLeft, wireY + wireH / 2 + 16, '#ffa726', 5);
        drawCentredText(ctx, len.toFixed(1) + ' m', wireLeft + wireW / 2, wireY + wireH / 2 + 30, '10px sans-serif', '#ffa726');
    }

    // ─── CROSS-SECTION VIEW (top-right) ───
    var csX = W * 0.78;
    var csY = H * 0.32;
    var maxR = 30;
    var csR = 5 + (dia / 3) * (maxR - 5);

    drawCentredText(ctx, 'Cross Section', csX, H * 0.08, 'bold 11px sans-serif', '#8b90a0');

    // Ghost max circle
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(csX, csY, maxR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Actual cross-section
    ctx.save();
    var csGrad = ctx.createRadialGradient(csX - csR * 0.3, csY - csR * 0.3, 0, csX, csY, csR);
    csGrad.addColorStop(0, '#ffe0b2');
    csGrad.addColorStop(0.5, '#ffb74d');
    csGrad.addColorStop(1, '#e65100');
    ctx.fillStyle = csGrad;
    ctx.beginPath();
    ctx.arc(csX, csY, csR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Diameter arrow on cross-section
    drawArrow(ctx, csX - csR - 3, csY, csX + csR + 3, csY, '#42a5f5', 4);
    drawArrow(ctx, csX + csR + 3, csY, csX - csR - 3, csY, '#42a5f5', 4);
    drawCentredText(ctx, dia.toFixed(1) + ' mm', csX, csY + csR + 16, '10px sans-serif', '#42a5f5');

    // ─── BOTTOM: Explanation & Resistance ───
    var infoY = H * 0.65;
    var dy = 18;

    drawCentredText(ctx, '── Resistance Calculation ──', W / 2, infoY, 'bold 12px sans-serif', '#4fc3f7');
    drawCentredText(ctx, 'R = ρL / A', W / 2, infoY + dy, '14px Georgia, serif', '#4fc3f7');
    drawCentredText(ctx, 'ρ (nichrome) = ' + rho.toExponential(1) + ' Ω·m', W / 2, infoY + dy * 2, '11px sans-serif', '#8b90a0');
    drawCentredText(ctx, 'A = π(d/2)² = ' + area.toExponential(2) + ' m²', W / 2, infoY + dy * 3, '11px sans-serif', '#8b90a0');
    drawCentredText(ctx, 'R = ' + R.toFixed(2) + ' Ω', W / 2, infoY + dy * 4, 'bold 14px sans-serif', '#ffa726');

    // ─── Factor summary icons ───
    var sumY = H - 18;
    drawCentredText(ctx, '📏 ↑ Length → ↑ R    |    ⭕ ↑ Area → ↓ R    |    🌡️ ↑ Temp → ↑ R (metals)', W / 2, sumY, '10px sans-serif', '#8b90a0');
}

// Replace original
drawWireDemo = drawWireDemoEnhanced;


/* ═══════════════════════════════════════
   4. SERIES / PARALLEL BRIGHTNESS COMPARISON
   Visual bulb brightness based on current
   ═══════════════════════════════════════ */

function drawBulbBrightness(ctx, x, y, r, current) {
    // Brightness scales with current (0 to ~3A mapped to 0..1)
    var brightness = clamp(current / 2.5, 0, 1);
    var on = brightness > 0.05;

    // Draw bulb with glow proportional to current
    drawBulb(ctx, x, y, r, on);

    if (on) {
        ctx.save();
        var glowR = r + brightness * 20;
        var grd = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowR);
        grd.addColorStop(0, 'rgba(255,238,88,' + (brightness * 0.35) + ')');
        grd.addColorStop(0.5, 'rgba(255,200,50,' + (brightness * 0.15) + ')');
        grd.addColorStop(1, 'rgba(255,238,88,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Show current value below
    drawCentredText(ctx, current.toFixed(2) + ' A', x, y + r + 14, '9px sans-serif', '#ef5350');
}


/* ═══════════════════════════════════════
   5. ENHANCED SERIES CIRCUIT
   (with electron animation hook + bulbs)
   ═══════════════════════════════════════ */

var _origDrawSeries = drawSeriesCircuit;

function drawSeriesCircuitEnhanced() {
    var canvas = document.getElementById('canvas-series');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var V = parseFloat(document.getElementById('slider-ser-v').value) || 12;
    var R1 = parseFloat(document.getElementById('slider-ser-r1').value) || 4;
    var R2 = parseFloat(document.getElementById('slider-ser-r2').value) || 8;
    var Rt = R1 + R2;
    var I = V / Rt;
    var V1 = I * R1;
    var V2 = I * R2;

    var cx = W * 0.5, cy = H * 0.42;
    var bw = W * 0.72, bh = H * 0.45;
    var left = cx - bw / 2, right = cx + bw / 2;
    var top_ = cy - bh / 2, bottom = cy + bh / 2;

    var r1x = left + bw * 0.33;
    var r2x = left + bw * 0.67;

    // Wires
    drawWire(ctx, left, top_, r1x - 28, top_);
    drawWire(ctx, r1x + 28, top_, r2x - 28, top_);
    drawWire(ctx, r2x + 28, top_, right, top_);
    drawWire(ctx, right, top_, right, bottom);
    drawWire(ctx, right, bottom, left, bottom);
    drawWire(ctx, left, bottom, left, top_);

    // Resistors
    drawResistorHoriz(ctx, r1x - 28, top_, r1x + 28, 'R₁');
    drawResistorHoriz(ctx, r2x - 28, top_, r2x + 28, 'R₂');

    // Battery
    drawBatteryVert(ctx, left, top_ + bh * 0.25, left, top_ + bh * 0.75);

    // Ammeter
    drawAmmeter(ctx, cx, bottom, 13);
    drawWire(ctx, left, bottom, cx - 13, bottom);
    drawWire(ctx, cx + 13, bottom, right, bottom);

    // Values
    drawCentredText(ctx, R1 + ' Ω', r1x, top_ - 20, 'bold 12px sans-serif', '#4fc3f7');
    drawCentredText(ctx, R2 + ' Ω', r2x, top_ - 20, 'bold 12px sans-serif', '#4fc3f7');

    // Voltage drop brackets
    ctx.save();
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 1.5;
    // V1 bracket
    ctx.beginPath();
    ctx.moveTo(r1x - 28, top_ + 22);
    ctx.lineTo(r1x - 28, top_ + 28);
    ctx.lineTo(r1x + 28, top_ + 28);
    ctx.lineTo(r1x + 28, top_ + 22);
    ctx.stroke();
    drawCentredText(ctx, V1.toFixed(1) + ' V', r1x, top_ + 40, '11px sans-serif', '#66bb6a');

    // V2 bracket
    ctx.beginPath();
    ctx.moveTo(r2x - 28, top_ + 22);
    ctx.lineTo(r2x - 28, top_ + 28);
    ctx.lineTo(r2x + 28, top_ + 28);
    ctx.lineTo(r2x + 28, top_ + 22);
    ctx.stroke();
    drawCentredText(ctx, V2.toFixed(1) + ' V', r2x, top_ + 40, '11px sans-serif', '#66bb6a');
    ctx.restore();

    // Battery label
    drawText(ctx, V + ' V', left - 8, cy, 'bold 12px sans-serif', '#ffa726', 'right');

    // Current
    drawArrow(ctx, left + 15, top_ - 10, r1x - 35, top_ - 10, '#ef5350', 6);
    drawCentredText(ctx, 'I = ' + I.toFixed(2) + ' A', cx, bottom + 22, 'bold 12px sans-serif', '#ef5350');

    // Current arrow on right side
    drawArrow(ctx, right + 8, top_ + 10, right + 8, bottom - 10, '#ef5350', 6);

    // Equation at very bottom
    drawCentredText(ctx, 'V₁ + V₂ = ' + V1.toFixed(1) + ' + ' + V2.toFixed(1) + ' = ' + (V1 + V2).toFixed(1) + ' V = Vs ✓',
        cx, H - 10, '11px sans-serif', '#8b90a0');
}

drawSeriesCircuit = drawSeriesCircuitEnhanced;


/* ═══════════════════════════════════════
   6. ENHANCED PARALLEL CIRCUIT
   ═══════════════════════════════════════ */

var _origDrawParallel = drawParallelCircuit;

function drawParallelCircuitEnhanced() {
    var canvas = document.getElementById('canvas-parallel');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var V = parseFloat(document.getElementById('slider-par-v').value) || 12;
    var R1 = parseFloat(document.getElementById('slider-par-r1').value) || 6;
    var R2 = parseFloat(document.getElementById('slider-par-r2').value) || 12;
    var I1 = V / R1;
    var I2 = V / R2;
    var It = I1 + I2;
    var Rt = (R1 * R2) / (R1 + R2);

    var cx = W * 0.5, cy = H * 0.45;
    var bw = W * 0.68, bh = H * 0.55;
    var left = cx - bw / 2, right = cx + bw / 2;
    var top_ = cy - bh / 2, bottom = cy + bh / 2;

    var b1y = cy - bh * 0.17;
    var b2y = cy + bh * 0.17;

    var jLeft = left + bw * 0.22;
    var jRight = left + bw * 0.78;

    // Main wires
    drawWire(ctx, left, top_, right, top_);
    drawWire(ctx, left, bottom, right, bottom);
    drawWire(ctx, left, top_, left, bottom);
    drawWire(ctx, right, top_, right, bottom);

    // Junction wires
    drawWire(ctx, jLeft, top_, jLeft, b1y);
    drawWire(ctx, jLeft, top_, jLeft, b2y);
    drawWire(ctx, jRight, top_, jRight, b1y);
    drawWire(ctx, jRight, top_, jRight, b2y);

    // Junction dots
    ctx.save();
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(jLeft, top_, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(jRight, top_, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Branch 1 resistor
    drawResistorHoriz(ctx, jLeft, b1y, jRight, 'R₁');
    // Branch 2 resistor
    drawResistorHoriz(ctx, jLeft, b2y, jRight, 'R₂');

    // Battery
    drawBatteryVert(ctx, left, top_ + bh * 0.3, left, top_ + bh * 0.7);

    // Ammeter on bottom
    drawAmmeter(ctx, cx, bottom, 13);
    drawWire(ctx, left, bottom, cx - 13, bottom);
    drawWire(ctx, cx + 13, bottom, right, bottom);

    // Labels
    drawCentredText(ctx, R1 + ' Ω', cx, b1y - 18, 'bold 12px sans-serif', '#4fc3f7');
    drawCentredText(ctx, R2 + ' Ω', cx, b2y - 18, 'bold 12px sans-serif', '#4fc3f7');
    drawText(ctx, V + ' V', left - 8, cy, 'bold 12px sans-serif', '#ffa726', 'right');

    // Branch current arrows
    var arrowX = jRight + 10;
    drawArrow(ctx, arrowX, b1y - 6, arrowX, b1y + 6, '#ef5350', 5);
    drawText(ctx, 'I₁=' + I1.toFixed(2) + 'A', arrowX + 8, b1y, '10px sans-serif', '#ef5350', 'left');

    drawArrow(ctx, arrowX, b2y - 6, arrowX, b2y + 6, '#ef5350', 5);
    drawText(ctx, 'I₂=' + I2.toFixed(2) + 'A', arrowX + 8, b2y, '10px sans-serif', '#ef5350', 'left');

    // Total current
    drawCentredText(ctx, 'I = I₁ + I₂ = ' + It.toFixed(2) + ' A', cx, bottom + 22, 'bold 12px sans-serif', '#ef5350');

    // Same voltage highlight
    ctx.save();
    ctx.strokeStyle = 'rgba(102,187,106,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(jLeft - 2, b1y - 14, jRight - jLeft + 4, b2y - b1y + 28);
    ctx.setLineDash([]);
    ctx.restore();
    drawCentredText(ctx, 'Same V = ' + V + ' V', cx, top_ - 12, '11px sans-serif', '#66bb6a');

    // R_total at bottom
    drawCentredText(ctx, 'R_T = ' + Rt.toFixed(2) + ' Ω  (always < smallest R)', cx, H - 10, '11px sans-serif', '#8b90a0');
}

drawParallelCircuit = drawParallelCircuitEnhanced;


/* ═══════════════════════════════════════
   7. ENHANCED DIVIDER CIRCUIT
   ═══════════════════════════════════════ */

var _origDrawDivider = drawDividerCircuit;

function drawDividerCircuitEnhanced() {
    var canvas = document.getElementById('canvas-divider');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var Vs = parseFloat(document.getElementById('slider-div-vs').value) || 12;
    var R1 = parseFloat(document.getElementById('slider-div-r1').value) || 4;
    var R2 = parseFloat(document.getElementById('slider-div-r2').value) || 8;
    var Rt = R1 + R2;
    var I = Vs / Rt;
    var V1 = (R1 / Rt) * Vs;
    var V2 = (R2 / Rt) * Vs;

    // Vertical layout
    var cx = W * 0.32;
    var top_ = H * 0.1;
    var bottom = H * 0.88;
    var totalH = bottom - top_;
    var midPt = top_ + totalH * 0.5;

    // Battery
    var batX = cx - 55;
    drawWire(ctx, batX, top_, cx, top_);
    drawWire(ctx, batX, bottom, cx, bottom);
    drawBatteryVert(ctx, batX, top_ + totalH * 0.3, batX, top_ + totalH * 0.7);
    drawText(ctx, Vs + ' V', batX - 10, top_ + totalH * 0.5, 'bold 12px sans-serif', '#ffa726', 'right');

    // Two resistors in series (vertical)
    var r1Top = top_ + totalH * 0.12;
    var r2Bot = top_ + totalH * 0.88;

    drawWire(ctx, cx, top_, cx, r1Top);
    drawResistorVert(ctx, cx, r1Top, midPt, 'R₁');
    drawResistorVert(ctx, cx, midPt, r2Bot, 'R₂');
    drawWire(ctx, cx, r2Bot, cx, bottom);

    drawText(ctx, R1 + ' Ω', cx + 28, (r1Top + midPt) / 2, 'bold 12px sans-serif', '#4fc3f7', 'left');
    drawText(ctx, R2 + ' Ω', cx + 28, (midPt + r2Bot) / 2, 'bold 12px sans-serif', '#4fc3f7', 'left');

    // Tapping point with highlight
    ctx.save();
    ctx.fillStyle = '#66bb6a';
    ctx.shadowColor = '#66bb6a';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, midPt, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Output voltage lines
    var outX = W * 0.55;
    drawWire(ctx, cx, midPt, outX, midPt, '#66bb6a');
    drawWire(ctx, cx, bottom, outX, bottom, '#66bb6a');

    // Output terminal dots
    ctx.save();
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.arc(outX, midPt, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(outX, bottom, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // V2 output arrow
    drawArrow(ctx, outX + 8, bottom - 5, outX + 8, midPt + 5, '#66bb6a', 7);
    drawText(ctx, 'V₂ = ' + V2.toFixed(1) + ' V', outX + 18, (midPt + bottom) / 2 - 8,
        'bold 14px sans-serif', '#66bb6a', 'left');
    drawText(ctx, '(output)', outX + 18, (midPt + bottom) / 2 + 8,
        '11px sans-serif', '#66bb6a', 'left');

    // V1 arrow
    drawArrow(ctx, outX + 8, midPt - 5, outX + 8, top_ + 5, '#42a5f5', 7);
    drawText(ctx, 'V₁ = ' + V1.toFixed(1) + ' V', outX + 18, (top_ + midPt) / 2,
        '13px sans-serif', '#42a5f5', 'left');

    // Current arrow
    drawArrow(ctx, cx + 6, r1Top + 5, cx + 6, midPt - 10, '#ef5350', 5);
    drawCentredText(ctx, 'I = ' + I.toFixed(3) + ' A', cx, bottom + 14, '11px sans-serif', '#ef5350');

    // ─── Right side: Bar chart ───
    var barLeft = W * 0.73;
    var barW = W * 0.15;
    var barTop = top_ + totalH * 0.1;
    var barH = totalH * 0.7;

    drawCentredText(ctx, 'Voltage Share', barLeft + barW / 2, barTop - 16, 'bold 11px sans-serif', '#8b90a0');

    // Total bar background
    ctx.save();
    ctx.strokeStyle = '#3a3a5a';
    ctx.lineWidth = 1;
    ctx.strokeRect(barLeft, barTop, barW, barH);
    ctx.restore();

    // V1 portion (top, blue)
    var v1H = (V1 / Vs) * barH;
    ctx.save();
    ctx.fillStyle = 'rgba(66,165,245,0.3)';
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 1;
    ctx.fillRect(barLeft, barTop, barW, v1H);
    ctx.strokeRect(barLeft, barTop, barW, v1H);
    ctx.restore();
    drawCentredText(ctx, 'V₁', barLeft + barW / 2, barTop + v1H / 2 - 8, 'bold 12px sans-serif', '#42a5f5');
    drawCentredText(ctx, V1.toFixed(1) + 'V', barLeft + barW / 2, barTop + v1H / 2 + 8, '10px sans-serif', '#42a5f5');

    // V2 portion (bottom, green)
    var v2H = (V2 / Vs) * barH;
    ctx.save();
    ctx.fillStyle = 'rgba(102,187,106,0.3)';
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 1;
    ctx.fillRect(barLeft, barTop + v1H, barW, v2H);
    ctx.strokeRect(barLeft, barTop + v1H, barW, v2H);
    ctx.restore();
    drawCentredText(ctx, 'V₂', barLeft + barW / 2, barTop + v1H + v2H / 2 - 8, 'bold 12px sans-serif', '#66bb6a');
    drawCentredText(ctx, V2.toFixed(1) + 'V', barLeft + barW / 2, barTop + v1H + v2H / 2 + 8, '10px sans-serif', '#66bb6a');

    // Formula
    drawCentredText(ctx, 'V₂ = R₂/(R₁+R₂) × Vs = ' + R2 + '/' + Rt + ' × ' + Vs + ' = ' + V2.toFixed(1) + ' V',
        W / 2, H - 5, '10px sans-serif', '#8b90a0');
}

drawDividerCircuit = drawDividerCircuitEnhanced;


/* ═══════════════════════════════════════
   8. CANVAS TOOLTIP / HOVER INFO SYSTEM
   Shows coordinates and values on hover
   ═══════════════════════════════════════ */

function addCanvasTooltip(canvasId, tooltipFn) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || canvas._tooltipAdded) return;

    canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = cw(canvas) / rect.width;
        var scaleY = ch(canvas) / rect.height;
        var mx = (e.clientX - rect.left) * scaleX;
        var my = (e.clientY - rect.top) * scaleY;

        if (tooltipFn) tooltipFn(canvas, mx, my);
    });

    canvas._tooltipAdded = true;
}


/* ═══════════════════════════════════════
   9. INITIALISATION HOOK
   Connect enhanced functions on page load
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    // The enhanced draw functions are already assigned above via reassignment
    // This ensures first-load canvases get the enhanced versions

    // Add keyboard shortcut info
    console.log('⚡ Electricity Explorer loaded!');
    console.log('Keyboard shortcuts: ← → to navigate, Esc to close sidebar');
});