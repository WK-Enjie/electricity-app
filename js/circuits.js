/* ═══════════════════════════════════════════════════════════════
   ⚡ ELECTRICITY EXPLORER — circuits.js
   Circuit diagram drawing functions
   All symbols follow Singapore O-Level convention:
     • Resistor = rectangle
     • Bulb = circle with cross ⊗
     • Battery = long/short lines
   ═══════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════
   1. PD CIRCUIT — Voltmeter in parallel
   ═══════════════════════════════════════ */

function drawPDCircuit() {
    var canvas = document.getElementById('canvas-pd-circuit');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var mx = W * 0.5, my = H * 0.5;
    var bw = W * 0.55, bh = H * 0.55;
    var left = mx - bw / 2, right = mx + bw / 2;
    var top_ = my - bh / 2, bottom = my + bh / 2;

    // Main circuit loop
    ctx.strokeStyle = '#e2e4ea';
    ctx.lineWidth = 2;

    // Top wire: left to right
    drawWire(ctx, left, top_, left + bw * 0.3, top_);
    drawWire(ctx, left + bw * 0.7, top_, right, top_);

    // Right wire: top to bottom
    drawWire(ctx, right, top_, right, bottom);

    // Bottom wire: right to left
    drawWire(ctx, right, bottom, left + bw * 0.65, bottom);
    drawWire(ctx, left + bw * 0.35, bottom, left, bottom);

    // Left wire: bottom to top
    drawWire(ctx, left, bottom, left, top_);

    // Battery on top
    var batX = left + bw * 0.5;
    drawBatteryHoriz(ctx, left + bw * 0.3, top_, left + bw * 0.7, top_);

    // Bulb on bottom
    var bulbX = left + bw * 0.5;
    drawBulb(ctx, bulbX, bottom, 16, true);

    // Ammeter on right side
    drawAmmeter(ctx, right, my, 14);
    drawWire(ctx, right, top_, right, my - 14);
    drawWire(ctx, right, my + 14, right, bottom);

    // Voltmeter in parallel with bulb (dashed leads)
    var vmY = bottom + 45;
    if (vmY > H - 30) vmY = H - 30;
    drawVoltmeter(ctx, bulbX, vmY, 14);

    // Dashed leads from voltmeter to either side of bulb
    ctx.save();
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(bulbX - 14, vmY);
    ctx.lineTo(left + bw * 0.35, vmY);
    ctx.lineTo(left + bw * 0.35, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bulbX + 14, vmY);
    ctx.lineTo(left + bw * 0.65, vmY);
    ctx.lineTo(left + bw * 0.65, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Labels
    drawCentredText(ctx, 'Battery', batX, top_ - 16, '12px sans-serif', '#ffa726');
    drawCentredText(ctx, 'Bulb', bulbX, bottom - 28, '12px sans-serif', '#ffee58');
    drawCentredText(ctx, 'Ammeter', right + 30, my, '11px sans-serif', '#ef5350');
    drawCentredText(ctx, 'Voltmeter', bulbX, vmY + 24, '11px sans-serif', '#42a5f5');
    drawCentredText(ctx, '(in parallel)', bulbX, vmY + 38, '10px sans-serif', '#42a5f5');
    drawCentredText(ctx, '(in series)', right + 30, my + 14, '10px sans-serif', '#ef5350');

    // Conventional current arrow
    drawArrow(ctx, left + 10, top_ - 8, right - 10, top_ - 8, '#ef5350', 8);
    drawText(ctx, 'I (conventional)', mx, top_ - 20, '10px sans-serif', '#ef5350', 'center');
}


/* ═══════════════════════════════════════
   HORIZONTAL BATTERY HELPER
   ═══════════════════════════════════════ */

function drawBatteryHoriz(ctx, x1, y, x2, y2) {
    var mx = (x1 + x2) / 2;
    var gap = 8;
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';

    // Wire to left plate
    drawWire(ctx, x1, y, mx - gap, y);
    // Wire from right plate
    drawWire(ctx, mx + gap, y, x2, y);

    // Long line (positive terminal) — left
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx - gap, y - 14);
    ctx.lineTo(mx - gap, y + 14);
    ctx.stroke();

    // Short line (negative terminal) — right
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(mx + gap, y - 8);
    ctx.lineTo(mx + gap, y + 8);
    ctx.stroke();

    // + and - labels
    drawText(ctx, '+', mx - gap - 10, y - 10, '10px sans-serif', '#ef5350', 'center');
    drawText(ctx, '−', mx + gap + 10, y - 10, '10px sans-serif', '#42a5f5', 'center');

    ctx.restore();
}


/* ═══════════════════════════════════════
   VERTICAL BATTERY HELPER
   ═══════════════════════════════════════ */

function drawBatteryVert(ctx, x, y1, x2, y2) {
    var my = (y1 + y2) / 2;
    var gap = 8;
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';

    drawWire(ctx, x, y1, x, my - gap);
    drawWire(ctx, x, my + gap, x, y2);

    // Long line (positive) — top
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 14, my - gap);
    ctx.lineTo(x + 14, my - gap);
    ctx.stroke();

    // Short line (negative) — bottom
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x - 8, my + gap);
    ctx.lineTo(x + 8, my + gap);
    ctx.stroke();

    drawText(ctx, '+', x + 18, my - gap, '10px sans-serif', '#ef5350', 'left');
    drawText(ctx, '−', x + 18, my + gap, '10px sans-serif', '#42a5f5', 'left');

    ctx.restore();
}


/* ═══════════════════════════════════════
   HORIZONTAL RESISTOR HELPER
   ═══════════════════════════════════════ */

function drawResistorHoriz(ctx, x1, y, x2, label) {
    var mx = (x1 + x2) / 2;
    var rw = Math.min(Math.abs(x2 - x1) * 0.5, 50);
    var rh = 18;

    drawWire(ctx, x1, y, mx - rw / 2, y);
    drawWire(ctx, mx + rw / 2, y, x2, y);
    drawResistor(ctx, mx, y, rw, rh, label);
}


/* ═══════════════════════════════════════
   VERTICAL RESISTOR HELPER
   ═══════════════════════════════════════ */

function drawResistorVert(ctx, x, y1, y2, label) {
    var my = (y1 + y2) / 2;
    var rh = Math.min(Math.abs(y2 - y1) * 0.4, 50);
    var rw = 18;

    drawWire(ctx, x, y1, x, my - rh / 2);
    drawWire(ctx, x, my + rh / 2, x, y2);

    // Draw vertical resistor (rectangle)
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - rw / 2, my - rh / 2, rw, rh);
    if (label) {
        drawCentredText(ctx, label, x + rw / 2 + 20, my, '12px sans-serif', '#4fc3f7');
    }
    ctx.restore();
}


/* ═══════════════════════════════════════
   2. WATER ANALOGY DIAGRAM
   ═══════════════════════════════════════ */

function drawWaterAnalogy() {
    var canvas = document.getElementById('canvas-water-analogy');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var col1 = W * 0.25, col2 = W * 0.75;

    // Title
    drawCentredText(ctx, '💧 Water Analogy', W / 2, 20, 'bold 14px sans-serif', '#4fc3f7');

    // Left side: Water system
    drawCentredText(ctx, 'Water System', col1, 48, 'bold 13px sans-serif', '#29b6f6');

    // Pump (battery equivalent)
    var pumpY = H * 0.3;
    ctx.save();
    ctx.fillStyle = 'rgba(66,165,245,0.15)';
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 2;
    roundRect(ctx, col1 - 35, pumpY - 18, 70, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, '🔄 Pump', col1, pumpY, '12px sans-serif', '#42a5f5');

    // High pipe
    var highY = H * 0.18;
    ctx.save();
    ctx.strokeStyle = '#29b6f6';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(col1 - 50, highY);
    ctx.lineTo(col1 + 50, highY);
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, 'HIGH', col1, highY - 12, '10px sans-serif', '#81d4fa');

    // Low pipe
    var lowY = H * 0.82;
    ctx.save();
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(col1 - 50, lowY);
    ctx.lineTo(col1 + 50, lowY);
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, 'LOW', col1, lowY + 14, '10px sans-serif', '#64b5f6');

    // Waterwheel (bulb equivalent)
    var wheelY = H * 0.58;
    ctx.save();
    ctx.strokeStyle = '#ffee58';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(col1, wheelY, 18, 0, Math.PI * 2);
    ctx.stroke();
    // Spokes
    for (var i = 0; i < 4; i++) {
        var a = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(col1, wheelY);
        ctx.lineTo(col1 + 14 * Math.cos(a), wheelY + 14 * Math.sin(a));
        ctx.stroke();
    }
    ctx.restore();
    drawCentredText(ctx, 'Waterwheel', col1, wheelY + 30, '11px sans-serif', '#ffee58');

    // Vertical pipes
    drawWire(ctx, col1 - 50, highY, col1 - 50, wheelY - 18, '#29b6f6');
    drawWire(ctx, col1 - 50, wheelY + 18, col1 - 50, lowY, '#1565c0');
    drawWire(ctx, col1 + 50, lowY, col1 + 50, pumpY + 18, '#1565c0');
    drawWire(ctx, col1 + 50, pumpY - 18, col1 + 50, highY, '#29b6f6');

    // Water flow arrows
    drawArrow(ctx, col1 - 55, highY + 20, col1 - 55, wheelY - 30, '#29b6f6', 8);

    // ─── Right side: Electrical equivalents ───
    drawCentredText(ctx, 'Electrical Circuit', col2, 48, 'bold 13px sans-serif', '#ffa726');

    // Divider line
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(W * 0.5, 60);
    ctx.lineTo(W * 0.5, H - 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Battery
    var batY2 = H * 0.3;
    ctx.save();
    ctx.fillStyle = 'rgba(239,83,80,0.1)';
    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 2;
    roundRect(ctx, col2 - 35, batY2 - 18, 70, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, '🔋 Battery', col2, batY2, '12px sans-serif', '#ef5350');

    // Bulb
    var bulbY2 = H * 0.58;
    drawBulb(ctx, col2, bulbY2, 16, true);
    drawCentredText(ctx, 'Bulb', col2, bulbY2 + 28, '11px sans-serif', '#ffee58');

    // Wires
    drawWire(ctx, col2 - 40, batY2 - 18, col2 - 40, highY);
    drawWire(ctx, col2 + 40, highY, col2 - 40, highY);
    drawWire(ctx, col2 - 40, batY2 + 18, col2 - 40, lowY);

    drawWire(ctx, col2 + 40, batY2 - 18, col2 + 40, bulbY2 - 16);
    drawWire(ctx, col2 + 40, bulbY2 + 16, col2 + 40, lowY);
    drawWire(ctx, col2 - 40, lowY, col2 + 40, lowY);
    drawWire(ctx, col2 - 40, highY, col2 - 40, batY2 - 18);

    // Analogy labels at bottom
    var labY = H - 15;
    drawCentredText(ctx, 'Pump = Battery  |  Height = Voltage  |  Water flow = Current  |  Wheel = Bulb (load)',
        W / 2, labY, '10px sans-serif', '#8b90a0');
}


/* ═══════════════════════════════════════
   3. EMF & INTERNAL RESISTANCE CIRCUIT
   ═══════════════════════════════════════ */

function drawEMFCircuit() {
    var canvas = document.getElementById('canvas-emf');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var emf = parseFloat(document.getElementById('slider-emf').value) || 6;
    var r = parseFloat(document.getElementById('slider-int-r').value) || 0.5;
    var R = parseFloat(document.getElementById('slider-ext-r').value) || 5;

    var I = emf / (R + r);
    var Vterm = emf - I * r;
    var Vlost = I * r;

    // Circuit layout
    var cx = W * 0.5, cy = H * 0.45;
    var bw = W * 0.6, bh = H * 0.45;
    var left = cx - bw / 2, right = cx + bw / 2;
    var top_ = cy - bh / 2, bottom = cy + bh / 2;

    // ─── Battery box (internal) ───
    var batBoxW = bw * 0.4;
    var batBoxLeft = left;
    var batBoxRight = left + batBoxW;

    ctx.save();
    ctx.strokeStyle = '#ffa726';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    roundRect(ctx, batBoxLeft - 10, top_ - 25, batBoxW + 20, bh + 50, 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    drawCentredText(ctx, 'Battery (internal)', batBoxLeft + batBoxW / 2, top_ - 32,
        '11px sans-serif', '#ffa726');

    // Top wire
    drawWire(ctx, left, top_, right, top_);
    // Bottom wire
    drawWire(ctx, left, bottom, right, bottom);
    // Left wire (battery side)
    drawWire(ctx, left, top_, left, bottom);

    // Battery on left side (vertical)
    drawBatteryVert(ctx, left, top_ + bh * 0.2, left, top_ + bh * 0.45);

    // Internal resistance (small resistor inside battery box)
    var irY1 = top_ + bh * 0.55;
    var irY2 = top_ + bh * 0.85;
    drawResistorVert(ctx, left, irY1, irY2, 'r=' + r + 'Ω');

    // External resistance on right side
    var exY1 = top_ + bh * 0.2;
    var exY2 = top_ + bh * 0.8;
    drawWire(ctx, right, top_, right, exY1);
    drawWire(ctx, right, exY2, right, bottom);
    drawResistorVert(ctx, right, exY1, exY2, 'R=' + R + 'Ω');

    // Ammeter on top wire
    var amX = cx;
    drawAmmeter(ctx, amX, top_, 13);
    drawWire(ctx, left, top_, amX - 13, top_);
    drawWire(ctx, amX + 13, top_, right, top_);

    // Values display
    var infoX = W * 0.5;
    var infoY = bottom + 30;
    var dy = 18;

    drawCentredText(ctx, 'ε = ' + emf.toFixed(1) + ' V', infoX, infoY, 'bold 13px sans-serif', '#ffa726');
    drawCentredText(ctx, 'I = ' + I.toFixed(2) + ' A', infoX, infoY + dy, '13px sans-serif', '#e2e4ea');

    // Voltage indicators
    // Terminal PD (across R)
    ctx.save();
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    var vTermTop = top_ + bh * 0.2;
    var vTermBot = top_ + bh * 0.8;
    ctx.beginPath();
    ctx.moveTo(right + 24, vTermTop);
    ctx.lineTo(right + 24, vTermBot);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    drawArrow(ctx, right + 24, vTermBot, right + 24, vTermTop, '#66bb6a', 6);
    drawText(ctx, 'V = ' + Vterm.toFixed(2) + ' V', right + 30, (vTermTop + vTermBot) / 2,
        '11px sans-serif', '#66bb6a', 'left');

    // Lost volts (across r)
    ctx.save();
    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(left - 24, irY1);
    ctx.lineTo(left - 24, irY2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    drawArrow(ctx, left - 24, irY2, left - 24, irY1, '#ef5350', 6);
    drawText(ctx, 'Ir = ' + Vlost.toFixed(2) + ' V', left - 28, (irY1 + irY2) / 2,
        '11px sans-serif', '#ef5350', 'right');

    // Formula at bottom
    drawCentredText(ctx, 'ε = V + Ir  →  ' + emf.toFixed(1) + ' = ' + Vterm.toFixed(2) + ' + ' + Vlost.toFixed(2),
        W / 2, H - 15, '12px sans-serif', '#8b90a0');
}


/* ═══════════════════════════════════════
   4. SERIES CIRCUIT
   ═══════════════════════════════════════ */

function drawSeriesCircuit() {
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

    // Layout
    var cx = W * 0.5, cy = H * 0.45;
    var bw = W * 0.7, bh = H * 0.5;
    var left = cx - bw / 2, right = cx + bw / 2;
    var top_ = cy - bh / 2, bottom = cy + bh / 2;

    // Top wire — split into sections for two resistors
    var r1x = left + bw * 0.33;
    var r2x = left + bw * 0.67;

    drawWire(ctx, left, top_, r1x - 25, top_);
    drawResistorHoriz(ctx, r1x - 25, top_, r1x + 25, 'R₁');
    drawWire(ctx, r1x + 25, top_, r2x - 25, top_);
    drawResistorHoriz(ctx, r2x - 25, top_, r2x + 25, 'R₂');
    drawWire(ctx, r2x + 25, top_, right, top_);

    // Right wire
    drawWire(ctx, right, top_, right, bottom);

    // Bottom wire
    drawWire(ctx, right, bottom, left, bottom);

    // Left wire
    drawWire(ctx, left, bottom, left, top_);

    // Battery on left (vertical)
    drawBatteryVert(ctx, left, top_ + bh * 0.3, left, top_ + bh * 0.7);

    // Ammeter on bottom wire
    drawAmmeter(ctx, cx, bottom, 13);
    drawWire(ctx, left, bottom, cx - 13, bottom);
    drawWire(ctx, cx + 13, bottom, right, bottom);

    // Resistance labels with values
    drawCentredText(ctx, R1 + ' Ω', r1x, top_ - 22, 'bold 13px sans-serif', '#4fc3f7');
    drawCentredText(ctx, R2 + ' Ω', r2x, top_ - 22, 'bold 13px sans-serif', '#4fc3f7');

    // Voltage drops
    drawCentredText(ctx, V1.toFixed(1) + ' V', r1x, top_ + 28, '12px sans-serif', '#66bb6a');
    drawCentredText(ctx, V2.toFixed(1) + ' V', r2x, top_ + 28, '12px sans-serif', '#66bb6a');

    // Battery label
    drawText(ctx, V + ' V', left - 8, cy, 'bold 13px sans-serif', '#ffa726', 'right');

    // Current arrows and value
    drawArrow(ctx, left + 15, top_ - 10, r1x - 30, top_ - 10, '#ef5350', 7);
    drawCentredText(ctx, 'I = ' + I.toFixed(2) + ' A', cx, bottom + 26, '12px sans-serif', '#ef5350');

    // Convention arrow
    drawArrow(ctx, right - 5, top_ + 8, right - 5, bottom - 8, '#ef5350', 7);

    // Title
    drawCentredText(ctx, 'Series Circuit — Same current everywhere', cx, H - 12, '11px sans-serif', '#8b90a0');
}


/* ═══════════════════════════════════════
   5. PARALLEL CIRCUIT
   ═══════════════════════════════════════ */

function drawParallelCircuit() {
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

    // Layout
    var cx = W * 0.5, cy = H * 0.48;
    var bw = W * 0.65, bh = H * 0.6;
    var left = cx - bw / 2, right = cx + bw / 2;
    var top_ = cy - bh / 2, bottom = cy + bh / 2;

    // Branch spacing
    var b1y = cy - bh * 0.18; // branch 1
    var b2y = cy + bh * 0.18; // branch 2

    // Junction points
    var jLeft = left + bw * 0.25;
    var jRight = left + bw * 0.75;

    // Main top wire to junction
    drawWire(ctx, left, top_, right, top_);
    // Main bottom wire
    drawWire(ctx, left, bottom, right, bottom);
    // Left side
    drawWire(ctx, left, top_, left, bottom);
    // Right side
    drawWire(ctx, right, top_, right, bottom);

    // Junction wires splitting
    // Top to branches
    drawWire(ctx, jLeft, top_, jLeft, b1y);
    drawWire(ctx, jLeft, top_, jLeft, b2y);
    drawWire(ctx, jRight, top_, jRight, b1y);
    drawWire(ctx, jRight, top_, jRight, b2y);

    // Branch 1 (top)
    drawResistorHoriz(ctx, jLeft, b1y, jRight, 'R₁');
    drawWire(ctx, jLeft, b1y, cx - 25, b1y);
    drawWire(ctx, cx + 25, b1y, jRight, b1y);

    // Branch 2 (bottom)
    drawResistorHoriz(ctx, jLeft, b2y, jRight, 'R₂');
    drawWire(ctx, jLeft, b2y, cx - 25, b2y);
    drawWire(ctx, cx + 25, b2y, jRight, b2y);

    // Battery on left side
    drawBatteryVert(ctx, left, top_ + bh * 0.3, left, top_ + bh * 0.7);

    // Ammeter on bottom
    drawAmmeter(ctx, cx, bottom, 13);
    drawWire(ctx, left, bottom, cx - 13, bottom);
    drawWire(ctx, cx + 13, bottom, right, bottom);

    // Labels
    drawCentredText(ctx, R1 + ' Ω', cx, b1y - 20, 'bold 13px sans-serif', '#4fc3f7');
    drawCentredText(ctx, R2 + ' Ω', cx, b2y - 20, 'bold 13px sans-serif', '#4fc3f7');
    drawText(ctx, V + ' V', left - 8, cy, 'bold 13px sans-serif', '#ffa726', 'right');

    // Branch currents
    drawText(ctx, 'I₁ = ' + I1.toFixed(2) + ' A', jRight + 8, b1y, '11px sans-serif', '#ef5350', 'left');
    drawText(ctx, 'I₂ = ' + I2.toFixed(2) + ' A', jRight + 8, b2y, '11px sans-serif', '#ef5350', 'left');
    drawCentredText(ctx, 'I = ' + It.toFixed(2) + ' A', cx, bottom + 24, '12px sans-serif', '#ef5350');

    // Same voltage label
    drawCentredText(ctx, 'V = ' + V + ' V across each branch', cx, top_ - 12, '11px sans-serif', '#66bb6a');

    drawCentredText(ctx, 'Parallel Circuit — Same p.d. across each branch', cx, H - 10, '11px sans-serif', '#8b90a0');
}


/* ═══════════════════════════════════════
   6. POTENTIAL DIVIDER CIRCUIT
   ═══════════════════════════════════════ */

function drawDividerCircuit() {
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

    // Vertical layout for potential divider
    var cx = W * 0.35;
    var top_ = H * 0.12;
    var bottom = H * 0.88;
    var totalH = bottom - top_;

    // Battery on left
    var batX = cx - 60;
    drawWire(ctx, batX, top_, cx, top_);
    drawWire(ctx, batX, bottom, cx, bottom);
    drawBatteryVert(ctx, batX, top_ + totalH * 0.3, batX, top_ + totalH * 0.7);
    drawText(ctx, Vs + ' V', batX - 12, top_ + totalH * 0.5, 'bold 13px sans-serif', '#ffa726', 'right');

    // Two resistors in series (vertical)
    var r1Top = top_ + totalH * 0.12;
    var midPt = top_ + totalH * 0.5;
    var r2Bot = top_ + totalH * 0.88;

    drawWire(ctx, cx, top_, cx, r1Top);
    drawResistorVert(ctx, cx, r1Top, midPt, 'R₁');
    drawResistorVert(ctx, cx, midPt, r2Bot, 'R₂');
    drawWire(ctx, cx, r2Bot, cx, bottom);

    // R values
    drawText(ctx, R1 + ' Ω', cx + 30, (r1Top + midPt) / 2, 'bold 13px sans-serif', '#4fc3f7', 'left');
    drawText(ctx, R2 + ' Ω', cx + 30, (midPt + r2Bot) / 2, 'bold 13px sans-serif', '#4fc3f7', 'left');

    // Voltage tapping point
    ctx.save();
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.arc(cx, midPt, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Output voltage lines
    var outX = W * 0.6;
    drawWire(ctx, cx, midPt, outX, midPt, '#66bb6a');
    drawWire(ctx, cx, bottom, outX, bottom, '#66bb6a');

    // Vout label
    drawArrow(ctx, outX + 5, bottom - 5, outX + 5, midPt + 5, '#66bb6a', 7);
    drawText(ctx, 'V₂ = ' + V2.toFixed(1) + ' V', outX + 14, (midPt + bottom) / 2,
        'bold 14px sans-serif', '#66bb6a', 'left');
    drawText(ctx, '(output)', outX + 14, (midPt + bottom) / 2 + 16,
        '11px sans-serif', '#66bb6a', 'left');

    // V1 indicator
    drawArrow(ctx, outX + 5, midPt - 5, outX + 5, top_ + 5, '#42a5f5', 7);
    drawText(ctx, 'V₁ = ' + V1.toFixed(1) + ' V', outX + 14, (top_ + midPt) / 2,
        '13px sans-serif', '#42a5f5', 'left');

    // Current
    drawCentredText(ctx, 'I = ' + I.toFixed(3) + ' A', cx, bottom + 16, '12px sans-serif', '#ef5350');

    // Formula
    drawCentredText(ctx, 'V₂ = R₂/(R₁+R₂) × Vs = ' + R2 + '/' + Rt + ' × ' + Vs + ' = ' + V2.toFixed(1) + ' V',
        W / 2, H - 6, '11px sans-serif', '#8b90a0');
}


/* ═══════════════════════════════════════
   7. SENSOR CIRCUIT (Thermistor / LDR)
   ═══════════════════════════════════════ */

function drawSensorCircuit() {
    var canvas = document.getElementById('canvas-sensor');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var val = parseFloat(document.getElementById('slider-sensor').value) || 25;
    var Rfixed = 10;
    var Rsensor;
    var Vs = 5;
    var sensorLabel, sensorIcon;

    if (currentSensor === 'therm') {
        Rsensor = 50 * Math.exp(-0.03 * val);
        sensorLabel = 'Thermistor';
        sensorIcon = '🌡️';
    } else {
        Rsensor = 100 * Math.exp(-0.04 * val);
        sensorLabel = 'LDR';
        sensorIcon = '💡';
    }

    var Vout = (Rfixed / (Rfixed + Rsensor)) * Vs;
    var Vsensor = (Rsensor / (Rfixed + Rsensor)) * Vs;

    // Vertical layout
    var cx = W * 0.35;
    var top_ = H * 0.12;
    var bottom = H * 0.85;
    var totalH = bottom - top_;
    var midPt = top_ + totalH * 0.5;

    // Battery
    var batX = cx - 55;
    drawWire(ctx, batX, top_, cx, top_);
    drawWire(ctx, batX, bottom, cx, bottom);
    drawBatteryVert(ctx, batX, top_ + totalH * 0.3, batX, top_ + totalH * 0.7);
    drawText(ctx, '5 V', batX - 10, top_ + totalH * 0.5, '12px sans-serif', '#ffa726', 'right');

    // Sensor (top) — draw as resistor with special label
    var r1Top = top_ + totalH * 0.12;
    drawWire(ctx, cx, top_, cx, r1Top);

    // Sensor symbol — draw rectangle with sensor icon
    var sy = (r1Top + midPt) / 2;
    var sw = 20, sh = 45;
    ctx.save();
    ctx.strokeStyle = '#ffa726';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - sw / 2, sy - sh / 2, sw, sh);
    ctx.restore();
    drawWire(ctx, cx, r1Top, cx, sy - sh / 2);
    drawWire(ctx, cx, sy + sh / 2, cx, midPt);
    drawText(ctx, sensorIcon + ' ' + sensorLabel, cx + sw / 2 + 10, sy - 10, '12px sans-serif', '#ffa726', 'left');
    drawText(ctx, Rsensor.toFixed(1) + ' kΩ', cx + sw / 2 + 10, sy + 8, 'bold 12px sans-serif', '#ffa726', 'left');

    // Fixed resistor (bottom)
    var r2Bot = top_ + totalH * 0.88;
    drawResistorVert(ctx, cx, midPt, r2Bot, 'R');
    drawWire(ctx, cx, r2Bot, cx, bottom);
    drawText(ctx, Rfixed + ' kΩ', cx + 22, (midPt + r2Bot) / 2, '12px sans-serif', '#4fc3f7', 'left');

    // Tapping point
    ctx.save();
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.arc(cx, midPt, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Vout
    var outX = W * 0.6;
    drawWire(ctx, cx, midPt, outX, midPt, '#66bb6a');
    drawWire(ctx, cx, bottom, outX, bottom, '#66bb6a');
    drawArrow(ctx, outX + 5, bottom - 5, outX + 5, midPt + 5, '#66bb6a', 7);
    drawText(ctx, 'V_out = ' + Vout.toFixed(2) + ' V', outX + 14, (midPt + bottom) / 2,
        'bold 13px sans-serif', '#66bb6a', 'left');

    // Behaviour explanation
    var expY = H - 12;
    if (currentSensor === 'therm') {
        drawCentredText(ctx, 'Temp ↑ → R_therm ↓ → V_out ↑', W / 2, expY, '11px sans-serif', '#ffa726');
    } else {
        drawCentredText(ctx, 'Light ↑ → R_LDR ↓ → V_out ↑', W / 2, expY, '11px sans-serif', '#ffa726');
    }
}


/* ═══════════════════════════════════════
   8. POWER TRIANGLE
   ═══════════════════════════════════════ */

function drawPowerTriangle() {
    var canvas = document.getElementById('canvas-power-tri');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var cx = W * 0.5;
    var triW = Math.min(W * 0.45, 220);
    var triH = triW * 0.75;
    var topY = H * 0.2;
    var botY = topY + triH;

    // Triangle
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
    var midY = topY + triH * 0.45;
    ctx.beginPath();
    ctx.moveTo(cx - triW * 0.35, midY);
    ctx.lineTo(cx + triW * 0.35, midY);
    ctx.stroke();
    ctx.restore();

    // Labels
    drawCentredText(ctx, 'P', cx, topY + triH * 0.22, 'bold 24px Georgia, serif', '#ffa726');
    drawCentredText(ctx, 'V', cx - triW * 0.18, midY + (botY - midY) * 0.5, 'bold 24px Georgia, serif', '#42a5f5');
    drawCentredText(ctx, 'I', cx + triW * 0.18, midY + (botY - midY) * 0.5, 'bold 24px Georgia, serif', '#ef5350');
    drawCentredText(ctx, '×', cx, midY + (botY - midY) * 0.5, 'bold 18px sans-serif', '#8b90a0');

    // Formulas below
    var fy = botY + 30;
    drawCentredText(ctx, 'P = V × I', cx, fy, '14px sans-serif', '#e2e4ea');
    drawCentredText(ctx, 'V = P / I', cx - triW * 0.5, fy, '14px sans-serif', '#42a5f5');
    drawCentredText(ctx, 'I = P / V', cx + triW * 0.5, fy, '14px sans-serif', '#ef5350');

    // Extra formulas
    drawCentredText(ctx, 'Also: P = I²R    |    P = V²/R', cx, fy + 28, '13px sans-serif', '#8b90a0');

    // Instruction
    drawCentredText(ctx, 'Cover the quantity you want to find!', cx, topY - 16, '12px sans-serif', '#8b90a0');
}


/* ═══════════════════════════════════════
   9. THREE-PIN PLUG DIAGRAM
   ═══════════════════════════════════════ */

var plugClickAreas = [];

function drawPlug() {
    var canvas = document.getElementById('canvas-plug');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);
    plugClickAreas = [];

    var cx = W * 0.45, cy = H * 0.48;
    var pw = Math.min(W * 0.5, 240);
    var ph = pw * 0.85;
    var left = cx - pw / 2, top_ = cy - ph / 2;

    // Plug body
    ctx.save();
    ctx.fillStyle = '#1a1d27';
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2.5;
    roundRect(ctx, left, top_, pw, ph, 14);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    drawCentredText(ctx, '3-PIN PLUG', cx, top_ - 12, 'bold 13px sans-serif', '#4fc3f7');

    // Pin positions
    var earthX = cx, earthY = top_ + ph * 0.22;
    var liveX = cx - pw * 0.28, liveY = top_ + ph * 0.55;
    var neutralX = cx + pw * 0.28, neutralY = top_ + ph * 0.55;
    var fuseY = top_ + ph * 0.55;

    // Earth pin (top, longer)
    ctx.save();
    ctx.fillStyle = '#81c784';
    ctx.strokeStyle = '#388e3c';
    ctx.lineWidth = 2;
    roundRect(ctx, earthX - 6, earthY - 18, 12, 36, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, 'E', earthX, earthY - 26, 'bold 12px sans-serif', '#81c784');
    plugClickAreas.push({ x: earthX, y: earthY, r: 22, type: 'earth' });

    // Live pin (bottom left)
    ctx.save();
    ctx.fillStyle = '#a1887f';
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 2;
    roundRect(ctx, liveX - 5, liveY - 14, 10, 28, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, 'L', liveX, liveY - 22, 'bold 12px sans-serif', '#a1887f');
    plugClickAreas.push({ x: liveX, y: liveY, r: 20, type: 'live' });

    // Neutral pin (bottom right)
    ctx.save();
    ctx.fillStyle = '#64b5f6';
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 2;
    roundRect(ctx, neutralX - 5, neutralY - 14, 10, 28, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, 'N', neutralX, neutralY - 22, 'bold 12px sans-serif', '#64b5f6');
    plugClickAreas.push({ x: neutralX, y: neutralY, r: 20, type: 'neutral' });

    // Fuse between live and earth
    var fuseX = cx - pw * 0.14;
    ctx.save();
    ctx.fillStyle = 'rgba(239,83,80,0.2)';
    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 1.5;
    roundRect(ctx, fuseX - 18, fuseY - 6, 36, 12, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, 'FUSE', fuseX, fuseY + 16, '10px sans-serif', '#ef5350');
    plugClickAreas.push({ x: fuseX, y: fuseY, r: 20, type: 'fuse' });

    // Wire colours — cable at bottom
    var cableY = top_ + ph * 0.82;

    // Live wire (brown)
    ctx.save();
    ctx.strokeStyle = '#a1887f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(liveX, liveY + 14);
    ctx.lineTo(liveX, cableY);
    ctx.stroke();
    ctx.restore();

    // Neutral wire (blue)
    ctx.save();
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(neutralX, neutralY + 14);
    ctx.lineTo(neutralX, cableY);
    ctx.stroke();
    ctx.restore();

    // Earth wire (green/yellow)
    ctx.save();
    ctx.strokeStyle = '#81c784';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(earthX, earthY + 18);
    ctx.lineTo(earthX, cableY);
    ctx.stroke();
    ctx.restore();

    // Fuse connection (live to fuse)
    ctx.save();
    ctx.strokeStyle = '#a1887f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(liveX, liveY);
    ctx.lineTo(fuseX - 18, fuseY);
    ctx.stroke();
    ctx.restore();

    // Cable grip at bottom
    ctx.save();
    ctx.fillStyle = '#2a2e3e';
    ctx.strokeStyle = '#8b90a0';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx - pw * 0.15, cableY - 4, pw * 0.3, 14, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, 'Cable grip', cx, cableY + 20, '10px sans-serif', '#8b90a0');

    // Cable
    ctx.save();
    ctx.strokeStyle = '#8b90a0';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cableY + 10);
    ctx.lineTo(cx, top_ + ph + 10);
    ctx.stroke();
    ctx.restore();

    // Right side legend
    var legX = W * 0.78, legY = H * 0.2;
    drawText(ctx, '👆 Click a part', legX, legY, 'bold 12px sans-serif', '#8b90a0', 'center');
    drawText(ctx, 'to learn more!', legX, legY + 16, '12px sans-serif', '#8b90a0', 'center');

    // Set up click handler (only once)
    if (!canvas._plugListenerAdded) {
        canvas.addEventListener('click', handlePlugClick);
        canvas._plugListenerAdded = true;
    }
}

function handlePlugClick(e) {
    var canvas = document.getElementById('canvas-plug');
    var rect = canvas.getBoundingClientRect();
    var scaleX = cw(canvas) / rect.width;
    var scaleY = ch(canvas) / rect.height;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top) * scaleY;

    var info = document.getElementById('plug-info');

    for (var i = 0; i < plugClickAreas.length; i++) {
        var area = plugClickAreas[i];
        var dx = mx - area.x;
        var dy = my - area.y;
        if (dx * dx + dy * dy < area.r * area.r) {
            switch (area.type) {
                case 'live':
                    info.innerHTML = '<strong style="color:#a1887f">🟤 LIVE WIRE (Brown)</strong><br>' +
                        'Carries current <strong>to</strong> the appliance at high voltage (~230 V). ' +
                        'The <strong>fuse</strong> and <strong>switch</strong> must be connected in the live wire ' +
                        'so the appliance can be safely disconnected from the dangerous supply.';
                    break;
                case 'neutral':
                    info.innerHTML = '<strong style="color:#64b5f6">🔵 NEUTRAL WIRE (Blue)</strong><br>' +
                        'Completes the circuit — carries current <strong>back</strong> to the supply at ~0 V. ' +
                        'It is at low voltage but should still be treated with caution.';
                    break;
                case 'earth':
                    info.innerHTML = '<strong style="color:#81c784">🟢 EARTH WIRE (Green & Yellow)</strong><br>' +
                        'Safety wire connected to the <strong>metal casing</strong> of the appliance. ' +
                        'If a fault causes the casing to become live, current flows through the earth wire to ground → ' +
                        'large current → <strong>fuse blows</strong> → circuit broken → user safe!';
                    break;
                case 'fuse':
                    info.innerHTML = '<strong style="color:#ef5350">🔴 FUSE</strong><br>' +
                        'A thin wire that <strong>melts and breaks the circuit</strong> when current exceeds its rating. ' +
                        'Connected in the <strong>live wire</strong>. Common ratings: 3 A, 5 A, 13 A. ' +
                        'Choose a rating <strong>slightly above</strong> the normal operating current.';
                    break;
            }
            return;
        }
    }
}


/* ═══════════════════════════════════════
   10. DANGER ROOM — Spot the Danger Game
   ═══════════════════════════════════════ */

var dangerItems = [];
var foundDangers = [];

function drawDangerRoom() {
    var canvas = document.getElementById('canvas-dangers');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);
    dangerItems = [];

    // ─── Room background ───
    // Floor
    ctx.save();
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, H * 0.65, W, H * 0.35);
    // Wall
    ctx.fillStyle = '#252538';
    ctx.fillRect(0, 0, W, H * 0.65);
    // Wall-floor line
    ctx.strokeStyle = '#3a3a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.65);
    ctx.lineTo(W, H * 0.65);
    ctx.stroke();
    ctx.restore();

    // ─── Room title ───
    drawCentredText(ctx, '⚠️ Find 5 electrical dangers in this room!', W / 2, 20, 'bold 13px sans-serif', '#ffa726');

    // ─── Danger 1: Overloaded socket (too many plugs) ───
    var d1x = W * 0.15, d1y = H * 0.55;
    // Socket plate
    ctx.save();
    ctx.fillStyle = '#3a3a4a';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    roundRect(ctx, d1x - 20, d1y - 12, 40, 24, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // Multiple plugs stacked (overloaded extension)
    ctx.save();
    ctx.fillStyle = '#5a5a6a';
    for (var p = 0; p < 4; p++) {
        roundRect(ctx, d1x - 15 + p * 6, d1y + 12 + p * 5, 14, 8, 2);
        ctx.fill();
    }
    ctx.restore();
    drawCentredText(ctx, '🔌🔌🔌🔌', d1x, d1y + 40, '12px sans-serif', '#e2e4ea');

    dangerItems.push({
        x: d1x, y: d1y + 15, r: 35, found: false,
        msg: '🔥 <strong>Overloaded socket!</strong> — Too many appliances on one socket → excessive current → overheating → fire risk.'
    });

    // ─── Danger 2: Water near electrical appliance ───
    var d2x = W * 0.45, d2y = H * 0.52;
    // Tap/faucet
    ctx.save();
    ctx.fillStyle = '#546e7a';
    roundRect(ctx, d2x - 8, d2y - 25, 16, 25, 3);
    ctx.fill();
    // Water drops
    ctx.fillStyle = '#42a5f5';
    ctx.beginPath();
    ctx.arc(d2x - 3, d2y + 5, 3, 0, Math.PI * 2);
    ctx.arc(d2x + 4, d2y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Socket near water
    ctx.save();
    ctx.fillStyle = '#3a3a4a';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    roundRect(ctx, d2x + 20, d2y - 8, 24, 16, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawCentredText(ctx, '💧🔌', d2x + 10, d2y + 30, '14px sans-serif', '#e2e4ea');

    dangerItems.push({
        x: d2x + 10, y: d2y + 5, r: 35, found: false,
        msg: '💧 <strong>Water near socket!</strong> — Water conducts electricity → risk of electric shock. Keep sockets away from wet areas.'
    });

    // ─── Danger 3: Damaged wire insulation ───
    var d3x = W * 0.75, d3y = H * 0.72;
    // Wire with exposed section
    ctx.save();
    ctx.strokeStyle = '#8b90a0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(d3x - 40, d3y);
    ctx.lineTo(d3x + 40, d3y);
    ctx.stroke();
    // Exposed copper section
    ctx.strokeStyle = '#ff7043';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(d3x - 8, d3y);
    ctx.lineTo(d3x + 8, d3y);
    ctx.stroke();
    // Spark effect
    ctx.fillStyle = '#ffee58';
    ctx.font = '14px sans-serif';
    ctx.fillText('⚡', d3x - 4, d3y - 10);
    ctx.restore();

    dangerItems.push({
        x: d3x, y: d3y, r: 30, found: false,
        msg: '⚡ <strong>Damaged insulation!</strong> — Exposed wires can cause electric shock or short circuit → fire.'
    });

    // ─── Danger 4: Heater with cloth draped on it ───
    var d4x = W * 0.85, d4y = H * 0.45;
    // Heater shape
    ctx.save();
    ctx.fillStyle = '#5d4037';
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 1.5;
    roundRect(ctx, d4x - 18, d4y - 25, 36, 50, 5);
    ctx.fill();
    ctx.stroke();
    // Heating lines
    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 1.5;
    for (var hl = 0; hl < 3; hl++) {
        var hy = d4y - 12 + hl * 12;
        ctx.beginPath();
        ctx.moveTo(d4x - 10, hy);
        ctx.quadraticCurveTo(d4x - 5, hy - 4, d4x, hy);
        ctx.quadraticCurveTo(d4x + 5, hy + 4, d4x + 10, hy);
        ctx.stroke();
    }
    // Cloth draped on top
    ctx.fillStyle = 'rgba(156,39,176,0.4)';
    ctx.beginPath();
    ctx.moveTo(d4x - 22, d4y - 25);
    ctx.quadraticCurveTo(d4x, d4y - 35, d4x + 25, d4y - 22);
    ctx.lineTo(d4x + 20, d4y - 10);
    ctx.quadraticCurveTo(d4x, d4y - 18, d4x - 18, d4y - 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    dangerItems.push({
        x: d4x, y: d4y - 15, r: 30, found: false,
        msg: '🔥 <strong>Cloth on heater!</strong> — Covering a heater with flammable material → overheating → fire risk.'
    });

    // ─── Danger 5: Child poking socket with metal object ───
    var d5x = W * 0.35, d5y = H * 0.82;
    // Socket on wall near floor
    ctx.save();
    ctx.fillStyle = '#3a3a4a';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    roundRect(ctx, d5x - 14, d5y - 10, 28, 20, 3);
    ctx.fill();
    ctx.stroke();
    // Pin holes
    ctx.fillStyle = '#222';
    ctx.fillRect(d5x - 8, d5y - 4, 4, 8);
    ctx.fillRect(d5x + 4, d5y - 4, 4, 8);
    ctx.restore();
    // Metal object (fork/screwdriver)
    ctx.save();
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(d5x + 14, d5y);
    ctx.lineTo(d5x + 40, d5y + 15);
    ctx.stroke();
    ctx.fillStyle = '#bdbdbd';
    ctx.beginPath();
    ctx.arc(d5x + 40, d5y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawText(ctx, '🍴', d5x + 35, d5y + 8, '12px sans-serif', '#e2e4ea', 'left');

    dangerItems.push({
        x: d5x + 10, y: d5y, r: 35, found: false,
        msg: '⚠️ <strong>Metal object in socket!</strong> — Inserting conductors into sockets → direct electric shock → can be fatal.'
    });

    // ─── Draw found markers ───
    for (var d = 0; d < dangerItems.length; d++) {
        if (foundDangers.indexOf(d) !== -1) {
            ctx.save();
            ctx.strokeStyle = '#ef5350';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(dangerItems[d].x, dangerItems[d].y, dangerItems[d].r, 0, Math.PI * 2);
            ctx.stroke();
            // Tick
            ctx.fillStyle = '#ef5350';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✓', dangerItems[d].x, dangerItems[d].y - dangerItems[d].r - 5);
            ctx.restore();
        }
    }

    // Click handler
    if (!canvas._dangerListenerAdded) {
        canvas.addEventListener('click', handleDangerClick);
        canvas._dangerListenerAdded = true;
    }
}

function handleDangerClick(e) {
    var canvas = document.getElementById('canvas-dangers');
    var rect = canvas.getBoundingClientRect();
    var scaleX = cw(canvas) / rect.width;
    var scaleY = ch(canvas) / rect.height;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top) * scaleY;

    for (var i = 0; i < dangerItems.length; i++) {
        var d = dangerItems[i];
        var dx = mx - d.x;
        var dy = my - d.y;
        if (dx * dx + dy * dy < d.r * d.r) {
            if (foundDangers.indexOf(i) === -1) {
                foundDangers.push(i);
                document.getElementById('danger-count').textContent = foundDangers.length;

                // Add feedback
                var fb = document.getElementById('danger-feedback');
                var div = document.createElement('div');
                div.className = 'found-item';
                div.innerHTML = d.msg;
                fb.appendChild(div);

                // Redraw to show circle
                drawDangerRoom();

                // Check if all found
                if (foundDangers.length >= 5) {
                    var congrats = document.createElement('div');
                    congrats.className = 'found-item';
                    congrats.innerHTML = '🎉 <strong>Well done!</strong> You found all 5 dangers! Stay safe around electricity!';
                    congrats.style.borderColor = '#66bb6a';
                    congrats.style.background = 'rgba(102,187,106,0.1)';
                    fb.appendChild(congrats);
                }
            }
            return;
        }
    }
}


/* ═══════════════════════════════════════
   11. OHM'S LAW V-I GRAPH
   ═══════════════════════════════════════ */

function drawOhmGraph() {
    var canvas = document.getElementById('canvas-ohm');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var R = parseFloat(document.getElementById('slider-ohm-r').value) || 10;
    var V = parseFloat(document.getElementById('slider-ohm-v').value) || 5;
    var I = V / R;

    // Graph area
    var pad = { left: 60, right: 30, top: 40, bottom: 50 };
    var gw = W - pad.left - pad.right;
    var gh = H - pad.top - pad.bottom;
    var ox = pad.left, oy = pad.top + gh; // origin

    // Max scales
    var maxV = 14;
    var maxI = maxV / Math.max(R, 1);
    if (maxI < 1) maxI = 1;
    maxI = Math.ceil(maxI * 10) / 10;

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

    // Labels
    drawText(ctx, 'I (A)', ox - 5, pad.top - 15, '12px sans-serif', '#ef5350', 'center');
    drawText(ctx, 'V (V)', W - pad.right + 5, oy + 18, '12px sans-serif', '#42a5f5', 'center');
    drawCentredText(ctx, 'V–I Graph (Ohmic Conductor, R = ' + R + ' Ω)', W / 2, 20, '12px sans-serif', '#8b90a0');

    // Grid lines and scale
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 0.5;
    for (var vi = 0; vi <= maxV; vi += 2) {
        var xp = ox + (vi / maxV) * gw;
        ctx.beginPath();
        ctx.moveTo(xp, pad.top);
        ctx.lineTo(xp, oy);
        ctx.stroke();
        drawText(ctx, vi.toString(), xp, oy + 14, '10px sans-serif', '#8b90a0', 'center');
    }
    var iStep = maxI > 2 ? 0.5 : (maxI > 0.5 ? 0.1 : 0.05);
    for (var ii = 0; ii <= maxI; ii += iStep) {
        var yp = oy - (ii / maxI) * gh;
        ctx.beginPath();
        ctx.moveTo(ox, yp);
        ctx.lineTo(ox + gw, yp);
        ctx.stroke();
        if (Math.abs(ii % (iStep * 2)) < 0.001 || iStep >= 0.5) {
            drawText(ctx, ii.toFixed(2), ox - 8, yp, '10px sans-serif', '#8b90a0', 'right');
        }
    }
    ctx.restore();

    // Ohm's law line (V = IR, so I = V/R)
    ctx.save();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    var endV = Math.min(maxV, maxI * R);
    var endI = endV / R;
    var endX = ox + (endV / maxV) * gw;
    var endY = oy - (endI / maxI) * gh;
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    // Current point
    if (V <= maxV && I <= maxI) {
        var px = ox + (V / maxV) * gw;
        var py = oy - (I / maxI) * gh;

        // Dashed lines to axes
        drawDashedLine(ctx, px, py, px, oy, '#42a5f5');
        drawDashedLine(ctx, px, py, ox, py, '#ef5350');

        // Point
        ctx.save();
        ctx.fillStyle = '#ffa726';
        ctx.shadowColor = '#ffa726';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Value label
        drawText(ctx, '(' + V.toFixed(1) + ' V, ' + I.toFixed(3) + ' A)',
            px + 10, py - 10, '11px sans-serif', '#ffa726', 'left');
    }
}


/* ═══════════════════════════════════════
   12. WIRE RESISTANCE DEMO
   ═══════════════════════════════════════ */

function drawWireDemo() {
    var canvas = document.getElementById('canvas-wire');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = cw(canvas), H = ch(canvas);
    clearCanvas(ctx, canvas);

    var len = parseFloat(document.getElementById('slider-wire-len').value) || 1;
    var dia = parseFloat(document.getElementById('slider-wire-dia').value) || 1;

    // Visual wire
    var wireLeft = W * 0.15;
    var wireMaxW = W * 0.7;
    var wireW = wireMaxW * (len / 3); // scale with length
    var wireH = 6 + dia * 8; // scale with diameter
    var wireY = H * 0.45;

    // Background wire track (max size)
    ctx.save();
    ctx.strokeStyle = '#2a2e3e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(wireLeft, wireY - wireMaxW * 0.05, wireMaxW, wireMaxW * 0.1);
    ctx.setLineDash([]);
    ctx.restore();

    // Actual wire
    ctx.save();
    var grad = ctx.createLinearGradient(wireLeft, wireY - wireH / 2, wireLeft, wireY + wireH / 2);
    grad.addColorStop(0, '#ff9800');
    grad.addColorStop(0.5, '#ffb74d');
    grad.addColorStop(1, '#e65100');
    ctx.fillStyle = grad;
    roundRect(ctx, wireLeft, wireY - wireH / 2, wireW, wireH, 4);
    ctx.fill();
    ctx.restore();

    // Labels
    drawCentredText(ctx, 'Length: ' + len.toFixed(1) + ' m', wireLeft + wireW / 2, wireY - wireH / 2 - 18,
        '12px sans-serif', '#ffa726');
    drawCentredText(ctx, 'Diameter: ' + dia.toFixed(1) + ' mm', wireLeft + wireW / 2, wireY + wireH / 2 + 20,
        '12px sans-serif', '#42a5f5');

    // Arrows showing length
    if (wireW > 40) {
        drawArrow(ctx, wireLeft, wireY + wireH / 2 + 35, wireLeft + wireW, wireY + wireH / 2 + 35, '#ffa726', 6);
        drawArrow(ctx, wireLeft + wireW, wireY + wireH / 2 + 35, wireLeft, wireY + wireH / 2 + 35, '#ffa726', 6);
    }

    // Explanation
    var radius_m = (dia / 2) * 1e-3;
    var area = Math.PI * radius_m * radius_m;
    var rho = 1.1e-6;
    var R = (rho * len) / area;

    drawCentredText(ctx, 'R = ρL / A = (' + rho.toExponential(1) + ' × ' + len.toFixed(1) + ') / ' +
        area.toExponential(2) + ' = ' + R.toFixed(2) + ' Ω',
        W / 2, H - 15, '11px sans-serif', '#8b90a0');
}