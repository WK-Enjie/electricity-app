// ========================================
// SINGAPORE O-LEVEL ELECTRICITY APP
// Animation & Physics Engine
// ========================================

const AnimationState = {
    currentFlow: { running: false, offset: 0 },
    series: { running: false, offset: 0 },
    parallel: { running: false, offset: 0 },
    combined: { running: false, offset: 0 },
    graphs: { filament: { progress: 0 }, diode: { progress: 0 }, thermistor: { progress: 0 }, ldr: { progress: 0 } }
};

const Colors = {
    wire: '#fbbf24', wireGlow: '#22d3ee', positive: '#ef4444', negative: '#3b82f6',
    electron: '#60a5fa', conventionalCurrent: '#ef4444', background: '#0f172a',
    text: '#f1f5f9', textMuted: '#94a3b8', green: '#10b981', orange: '#f59e0b',
    purple: '#8b5cf6', bulbOn: 'rgba(251, 191, 36, 0.4)', bulbGlow: '#fbbf24'
};

function getCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    return { canvas, ctx: canvas.getContext('2d'), width: canvas.width, height: canvas.height };
}

function clearCanvas(ctx, width, height) { ctx.clearRect(0, 0, width, height); }

function drawWire(ctx, x1, y1, x2, y2, options = {}) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = options.color || Colors.wire; ctx.lineWidth = options.width || 3; ctx.stroke();
}

function drawArrow(ctx, fromX, fromY, toX, toY, options = {}) {
    const headLength = options.headLength || 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY);
    ctx.strokeStyle = options.color || Colors.wire; ctx.lineWidth = options.lineWidth || 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fillStyle = options.color || Colors.wire; ctx.fill();
}

function drawBatterySymbol(ctx, x, y, cells = 3, options = {}) {
    const scale = options.scale || 1; const cellWidth = 12 * scale; const startX = x - (cells * cellWidth) / 2;
    ctx.strokeStyle = Colors.wire; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 40 * scale, y); ctx.lineTo(startX, y); ctx.stroke();
    for (let i = 0; i < cells; i++) {
        const cx = startX + i * cellWidth;
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, y - 12 * scale); ctx.lineTo(cx, y + 12 * scale); ctx.stroke();
        ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + 6 * scale, y - 6 * scale); ctx.lineTo(cx + 6 * scale, y + 6 * scale); ctx.stroke();
    }
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(startX + cells * cellWidth - 6 * scale, y); ctx.lineTo(x + 40 * scale, y); ctx.stroke();
}

function drawResistorSymbol(ctx, x, y, options = {}) {
    const scale = options.scale || 1; const width = 40 * scale; const height = 15 * scale;
    ctx.fillStyle = Colors.background; ctx.fillRect(x - width/2, y - height/2, width, height);
    ctx.strokeStyle = Colors.wire; ctx.lineWidth = 2; ctx.strokeRect(x - width/2, y - height/2, width, height);
    if (options.label) {
        ctx.fillStyle = Colors.textMuted; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(options.label, x, y + 25 * scale);
    }
    if (options.value) {
        ctx.fillStyle = Colors.text; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(options.value, x, y + 4);
    }
}

function drawBulbSymbol(ctx, x, y, isOn = false, options = {}) {
    const scale = options.scale || 1; const radius = 15 * scale;
    ctx.strokeStyle = Colors.wire; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isOn ? Colors.bulbOn : Colors.background;
    if (isOn) { ctx.shadowColor = Colors.bulbGlow; ctx.shadowBlur = 20; }
    ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    const cross = radius * 0.7;
    ctx.beginPath(); ctx.moveTo(x - cross, y - cross); ctx.lineTo(x + cross, y + cross); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + cross, y - cross); ctx.lineTo(x - cross, y + cross); ctx.stroke();
}

function drawAmmeterSymbol(ctx, x, y, reading = null) {
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = Colors.background; ctx.fill(); ctx.strokeStyle = Colors.wire; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = Colors.positive; ctx.font = `bold 16px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A', x, y);
    if (reading !== null) { ctx.fillStyle = Colors.wireGlow; ctx.font = '10px sans-serif'; ctx.fillText(reading.toFixed(2) + ' A', x, y + 30); }
}

// ===== DC CIRCUITS - ALIGNMENT & DRAWING =====

function drawStaticSeriesCircuit() {
    const c = getCanvas('seriesCircuitCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    drawWire(ctx, 50, 50, width - 50, 50); drawWire(ctx, width - 50, 50, width - 50, height - 50);
    drawWire(ctx, width - 50, height - 50, 50, height - 50); drawWire(ctx, 50, height - 50, 50, 50);
    drawBatterySymbol(ctx, width/2, 50, 3);
    drawResistorSymbol(ctx, width/2 - 80, height - 50, { label: 'R₁' });
    drawResistorSymbol(ctx, width/2 + 80, height - 50, { label: 'R₂' });
}

function drawStaticParallelCircuit() {
    const c = getCanvas('parallelCircuitCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    drawWire(ctx, 50, 50, width - 50, 50); drawBatterySymbol(ctx, width/2, 50, 3);
    drawWire(ctx, 50, 50, 50, 220); drawWire(ctx, width - 50, 50, width - 50, 220);
    drawWire(ctx, 50, 130, width - 50, 130); drawWire(ctx, 50, 220, width - 50, 220);
    drawResistorSymbol(ctx, width/2, 130, { label: 'R₁' });
    drawResistorSymbol(ctx, width/2, 220, { label: 'R₂' });
    ctx.fillStyle = Colors.wire; ctx.beginPath(); ctx.arc(50, 130, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(width-50, 130, 5, 0, Math.PI*2); ctx.fill();
}

function drawSeriesCircuit() {
    const c = getCanvas('seriesInteractiveCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    const emf = parseFloat(document.getElementById('seriesEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('seriesR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('seriesR2Slider')?.value) || 20;
    
    drawWire(ctx, 50, 50, width - 50, 50); drawWire(ctx, width - 50, 50, width - 50, height - 50);
    drawWire(ctx, width - 50, height - 50, 50, height - 50); drawWire(ctx, 50, height - 50, 50, 50);
    drawBatterySymbol(ctx, width/2, 50, 3);
    ctx.fillStyle = Colors.text; ctx.fillText(`${emf}V`, width/2, 20);
    drawResistorSymbol(ctx, width/2 - 80, height - 50, { label: 'R₁', value: `${r1}Ω` });
    drawResistorSymbol(ctx, width/2 + 80, height - 50, { label: 'R₂', value: `${r2}Ω` });
    
    if (AnimationState.series.running) {
        ctx.setLineDash([10, 5]); ctx.lineDashOffset = -AnimationState.series.offset; ctx.strokeStyle = Colors.wireGlow; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(width/2 + 40, 50); ctx.lineTo(width-50, 50); ctx.lineTo(width-50, height-50); ctx.lineTo(width/2 + 130, height-50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(width/2 - 130, height-50); ctx.lineTo(50, height-50); ctx.lineTo(50, 50); ctx.lineTo(width/2 - 40, 50); ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawParallelCircuit() {
    const c = getCanvas('parallelInteractiveCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    const emf = parseFloat(document.getElementById('parallelEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('parallelR1Slider')?.value) || 20;
    const r2 = parseFloat(document.getElementById('parallelR2Slider')?.value) || 30;
    
    drawWire(ctx, 50, 50, width - 50, 50); drawBatterySymbol(ctx, width/2, 50, 3);
    ctx.fillStyle = Colors.text; ctx.fillText(`${emf}V`, width/2, 20);
    drawWire(ctx, 50, 50, 50, 250); drawWire(ctx, width - 50, 50, width - 50, 250);
    drawWire(ctx, 50, 150, width - 50, 150); drawWire(ctx, 50, 250, width - 50, 250);
    
    drawResistorSymbol(ctx, width/2, 150, { label: 'R₁', value: `${r1}Ω` });
    drawResistorSymbol(ctx, width/2, 250, { label: 'R₂', value: `${r2}Ω` });
    
    ctx.fillStyle = Colors.wire; ctx.beginPath(); ctx.arc(50, 150, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(width-50, 150, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = Colors.positive; ctx.fillText(`I₁ = ${(emf/r1).toFixed(2)}A`, width/2, 120); ctx.fillText(`I₂ = ${(emf/r2).toFixed(2)}A`, width/2, 220);
    
    if (AnimationState.parallel.running) {
        ctx.setLineDash([10, 5]); ctx.lineDashOffset = -AnimationState.parallel.offset; ctx.strokeStyle = Colors.wireGlow; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(60, 150); ctx.lineTo(width/2 - 40, 150); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(60, 250); ctx.lineTo(width/2 - 40, 250); ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawCombinedCircuit() {
    const c = getCanvas('combinedCircuitCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    const emf = parseFloat(document.getElementById('combinedEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('combinedR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('combinedR2Slider')?.value) || 20;
    const r3 = parseFloat(document.getElementById('combinedR3Slider')?.value) || 20;
    const isType1 = document.getElementById('configType1')?.classList.contains('active');

    drawWire(ctx, 50, 50, width - 50, 50); drawBatterySymbol(ctx, width/2, 50, 3);
    ctx.fillStyle = Colors.text; ctx.fillText(`${emf}V`, width/2, 20);

    if (isType1) {
        drawWire(ctx, 50, 50, 50, 200); drawWire(ctx, 50, 200, 250, 200); drawResistorSymbol(ctx, 150, 200, { label: 'R₁', value: `${r1}Ω` });
        drawWire(ctx, 250, 200, 350, 200); drawWire(ctx, width - 50, 50, width - 50, 200); drawWire(ctx, 550, 200, width - 50, 200);
        drawWire(ctx, 350, 120, 550, 120); drawWire(ctx, 350, 120, 350, 280); drawWire(ctx, 550, 120, 550, 280); drawWire(ctx, 350, 280, 550, 280);
        drawResistorSymbol(ctx, 450, 120, { label: 'R₂', value: `${r2}Ω` }); drawResistorSymbol(ctx, 450, 280, { label: 'R₃', value: `${r3}Ω` });
        ctx.fillStyle = Colors.wire; ctx.beginPath(); ctx.arc(350, 200, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(550, 200, 5, 0, Math.PI*2); ctx.fill();
    } else {
        drawWire(ctx, 50, 50, 50, 200); drawWire(ctx, 50, 200, 150, 200); drawWire(ctx, 350, 200, 450, 200);
        drawWire(ctx, 150, 120, 350, 120); drawWire(ctx, 150, 120, 150, 280); drawWire(ctx, 350, 120, 350, 280); drawWire(ctx, 150, 280, 350, 280);
        drawResistorSymbol(ctx, 250, 120, { label: 'R₁', value: `${r1}Ω` }); drawResistorSymbol(ctx, 250, 280, { label: 'R₂', value: `${r2}Ω` });
        ctx.fillStyle = Colors.wire; ctx.beginPath(); ctx.arc(150, 200, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(350, 200, 5, 0, Math.PI*2); ctx.fill();
        drawWire(ctx, 450, 200, width - 50, 200); drawResistorSymbol(ctx, 550, 200, { label: 'R₃', value: `${r3}Ω` });
        drawWire(ctx, width - 50, 200, width - 50, 50);
    }

    if (AnimationState.combined.running) {
        ctx.setLineDash([10, 5]); ctx.lineDashOffset = -AnimationState.combined.offset; ctx.strokeStyle = Colors.wireGlow; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(width/2 + 40, 50); ctx.lineTo(width-50, 50); ctx.lineTo(width-50, 200); ctx.lineTo(isType1 ? 550 : 600, 200); ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawStaticPotentialDivider() {
    const c = getCanvas('potentialDividerCanvas'); if(!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    const cx = width / 2;
    drawWire(ctx, cx - 100, 50, cx + 100, 50); drawBatterySymbol(ctx, cx, 50, 3);
    drawWire(ctx, cx - 100, 50, cx - 100, 300); drawWire(ctx, cx + 100, 50, cx + 100, 300); drawWire(ctx, cx - 100, 300, cx + 100, 300);
    ctx.clearRect(cx - 110, 100, 20, 150); // Break wire for resistors
    drawResistorSymbol(ctx, cx - 100, 120, { label: 'R₁' }); drawResistorSymbol(ctx, cx - 100, 220, { label: 'R₂' });
    drawWire(ctx, cx - 100, 170, cx + 20, 170); drawWire(ctx, cx - 100, 270, cx + 20, 270);
    ctx.beginPath(); ctx.arc(cx + 20, 170, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 20, 270, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = Colors.text; ctx.fillText('V_out', cx + 40, 220);
}

function drawPotentialDivider() {
    const c = getCanvas('dividerInteractiveCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    const vin = parseFloat(document.getElementById('dividerVinSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('dividerR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('dividerR2Slider')?.value) || 10;
    const vout = vin * r2 / (r1 + r2); const cx = width / 2;
    
    drawWire(ctx, cx, 50, cx, 300);
    drawResistorSymbol(ctx, cx, 120, { label: 'R₁', value: `${r1}kΩ` });
    drawResistorSymbol(ctx, cx, 240, { label: 'R₂', value: `${r2}kΩ` });
    drawWire(ctx, cx, 180, cx + 80, 180);
    
    ctx.fillStyle = Colors.positive; ctx.fillText(`Vin = ${vin}V`, cx, 30);
    ctx.fillStyle = Colors.negative; ctx.fillText('0V', cx, 320);
    ctx.fillStyle = Colors.green; ctx.fillText(`Vout = ${vout.toFixed(2)}V`, cx + 90, 175);
    ctx.beginPath(); ctx.arc(cx, 180, 5, 0, Math.PI*2); ctx.fill();
}

// ===== PRACTICAL ELECTRICITY & SAFETY COMPONENTS =====

function drawSocket() {
    const c = getCanvas('socketCanvas'); if(!c) return; const {ctx, width, height} = c; clearCanvas(ctx, width, height);
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(width/2 - 60, height/2 - 60, 120, 120, 10); ctx.fill(); 
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.fillRect(width/2 - 8, height/2 - 30, 16, 25); // Earth
    ctx.fillRect(width/2 - 30, height/2 + 10, 20, 15); // Neutral
    ctx.fillRect(width/2 + 10, height/2 + 10, 20, 15); // Live
    ctx.fillStyle = '#ef4444'; ctx.fillRect(width/2 + 35, height/2 - 40, 15, 20); // Switch
}

function drawDangerDemo(scenario = 'short-circuit') {
    const c = getCanvas('dangerDemoCanvas'); if(!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    
    drawWire(ctx, 100, 100, width - 100, 100); drawWire(ctx, 100, 100, 100, 250);
    drawWire(ctx, width - 100, 100, width - 100, 250); drawWire(ctx, 100, 250, width - 100, 250);
    drawBatterySymbol(ctx, width/2, 100, 4); drawResistorSymbol(ctx, width/2, 250, { label: 'Appliance' });
    
    ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
    if (scenario === 'short-circuit') {
        ctx.strokeStyle = Colors.negative; drawWire(ctx, width/2 - 60, 150, width/2 + 60, 150, { color: Colors.negative });
        drawWire(ctx, width/2 - 60, 150, width/2 - 60, 250, { color: Colors.negative });
        drawWire(ctx, width/2 + 60, 150, width/2 + 60, 250, { color: Colors.negative });
        ctx.fillText('💥 FIRE!', width/2, 140);
    } else if (scenario === 'overload') {
        drawWire(ctx, 150, 180, width - 150, 180); drawWire(ctx, 150, 220, width - 150, 220);
        drawResistorSymbol(ctx, width/2, 180, { label: 'Appliance 2' }); drawResistorSymbol(ctx, width/2, 220, { label: 'Appliance 3' });
        ctx.fillText('🔥 OVERHEAT!', width/2, 150);
    } else if (scenario === 'damaged-wire') {
        ctx.clearRect(100 - 15, 150, 30, 50); ctx.strokeStyle = '#ef4444';
        ctx.beginPath(); ctx.moveTo(100, 150); ctx.lineTo(90, 175); ctx.lineTo(110, 185); ctx.lineTo(100, 200); ctx.stroke();
        ctx.fillText('⚡ SHOCK HAZARD!', width/2, 180);
    } else if (scenario === 'water') {
        ctx.fillText('💧 Water conducts electricity!', width/2, 200);
        ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(width/2 - 50, 250, 20, 0, Math.PI*2); ctx.fill();
    }
}

function drawFuseDiagram() {
    const c = getCanvas('fuseDiagramCanvas'); if(!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    ctx.strokeStyle = Colors.textMuted; ctx.lineWidth = 4; ctx.strokeRect(100, 50, 200, 50);
    ctx.fillStyle = Colors.wire; ctx.fillRect(80, 50, 20, 50); ctx.fillRect(300, 50, 20, 50);
    ctx.strokeStyle = Colors.wire; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(100, 75); ctx.lineTo(300, 75); ctx.stroke();
    ctx.fillStyle = Colors.text; ctx.textAlign = 'center'; ctx.font = '14px sans-serif'; 
    ctx.fillText('Glass/Ceramic Tube', 200, 35); ctx.fillText('Thin Fuse Wire', 200, 125);
}

function drawMCBDiagram() {
    const c = getCanvas('mcbDiagramCanvas'); if(!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    ctx.strokeStyle = Colors.textMuted; ctx.lineWidth = 2; ctx.strokeRect(150, 20, 100, 140);
    ctx.fillStyle = Colors.negative; ctx.fillRect(180, 40, 40, 20); // Switch Handle
    ctx.strokeStyle = Colors.orange; ctx.lineWidth = 3;
    for(let i=0; i<4; i++) { ctx.beginPath(); ctx.arc(200, 90 + i*10, 15, 0, Math.PI); ctx.stroke(); }
    ctx.fillStyle = Colors.text; ctx.textAlign = 'center'; ctx.font = '14px sans-serif';
    ctx.fillText('Switch (Resettable)', 200, 10); ctx.fillText('Electromagnet Coil', 200, 175);
}

function drawEarthingDemo(state = 'normal') {
    const c = getCanvas('earthingDemoCanvas'); if(!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4; ctx.strokeRect(300, 100, 150, 150); // Casing
    ctx.fillStyle = Colors.text; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Metal Casing', 375, 90);
    ctx.beginPath(); ctx.arc(375, 175, 40, 0, Math.PI*2); ctx.stroke(); ctx.fillText('Motor', 375, 180);
    
    // Live
    ctx.strokeStyle = '#8b4513'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(100, 150); ctx.lineTo(335, 150); ctx.stroke();
    ctx.fillStyle = '#8b4513'; ctx.fillText('Live', 150, 140);
    // Neutral
    ctx.strokeStyle = '#3b82f6'; ctx.beginPath(); ctx.moveTo(100, 200); ctx.lineTo(335, 200); ctx.stroke();
    ctx.fillStyle = '#3b82f6'; ctx.fillText('Neutral', 150, 190);
    // Earth
    ctx.strokeStyle = '#22c55e'; ctx.beginPath(); ctx.moveTo(100, 100); ctx.lineTo(300, 100); ctx.stroke();
    ctx.fillStyle = '#22c55e'; ctx.fillText('Earth', 150, 90);
    
    if(state === 'fault') {
        ctx.strokeStyle = '#8b4513'; ctx.beginPath(); ctx.moveTo(315, 150); ctx.lineTo(300, 120); ctx.stroke();
        ctx.setLineDash([5, 5]); ctx.strokeStyle = Colors.negative;
        ctx.beginPath(); ctx.moveTo(300, 120); ctx.lineTo(300, 100); ctx.lineTo(100, 100); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = Colors.negative; ctx.fillText('Fault Current flows to Earth!', 375, 280); ctx.fillText('Fuse Blows', 150, 120);
    }
}

function drawPlugDiagram() {
    const c = getCanvas('plugDiagramCanvas'); if(!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    ctx.strokeStyle = Colors.textMuted; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(100, 50, 250, 250, 20); ctx.stroke();
    ctx.fillStyle = '#22c55e'; ctx.fillRect(210, 70, 30, 60); ctx.fillStyle = Colors.text; ctx.font = '14px sans-serif'; ctx.fillText('Earth (E)', 225, 55);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(130, 160, 30, 60); ctx.fillText('Neutral (N)', 145, 145);
    ctx.fillStyle = '#8b4513'; ctx.fillRect(290, 160, 30, 60); ctx.fillText('Live (L)', 305, 145);
    ctx.fillStyle = Colors.textMuted; ctx.fillRect(290, 100, 20, 50); ctx.fillStyle = Colors.text; ctx.fillText('Fuse', 330, 125);
    ctx.fillRect(175, 260, 100, 20); ctx.fillText('Cable Grip', 225, 305);
}

function drawSafetySystem() {
    const c = getCanvas('safetySystemCanvas'); if(!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    drawWire(ctx, 50, 150, 650, 150, {color: '#8b4513'}); // Live
    drawWire(ctx, 50, 200, 650, 200, {color: '#3b82f6'}); // Neutral
    drawWire(ctx, 50, 100, 550, 100, {color: '#22c55e'}); // Earth
    
    ctx.fillStyle = Colors.text; ctx.font = '14px sans-serif'; ctx.fillText('230V Mains', 80, 130);
    ctx.fillStyle = Colors.background; ctx.fillRect(150, 120, 60, 100); ctx.strokeStyle = Colors.textMuted; ctx.strokeRect(150, 120, 60, 100);
    ctx.fillStyle = Colors.text; ctx.fillText('MCB', 180, 175);
    ctx.fillStyle = Colors.background; ctx.fillRect(300, 130, 40, 40); ctx.beginPath(); ctx.moveTo(300, 150); ctx.lineTo(330, 135); ctx.strokeStyle = Colors.wire; ctx.stroke();
    ctx.fillStyle = Colors.text; ctx.fillText('Switch', 320, 120);
    ctx.fillStyle = Colors.background; ctx.fillRect(500, 120, 100, 100); ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(500, 120, 100, 100);
    ctx.fillStyle = Colors.text; ctx.fillText('Appliance', 550, 175);
    ctx.beginPath(); ctx.moveTo(550, 100); ctx.lineTo(550, 120); ctx.strokeStyle = '#22c55e'; ctx.stroke();
}

// ===== EXPORTS =====
window.drawStaticPotentialDivider = drawStaticPotentialDivider;
window.drawPotentialDivider = drawPotentialDivider;
window.drawStaticSeriesCircuit = drawStaticSeriesCircuit;
window.drawSeriesCircuit = drawSeriesCircuit;
window.drawStaticParallelCircuit = drawStaticParallelCircuit;
window.drawParallelCircuit = drawParallelCircuit;
window.drawCombinedCircuit = drawCombinedCircuit;
window.drawSocket = drawSocket;
window.drawDangerDemo = drawDangerDemo;
window.drawFuseDiagram = drawFuseDiagram;
window.drawMCBDiagram = drawMCBDiagram;
window.drawEarthingDemo = drawEarthingDemo;
window.drawPlugDiagram = drawPlugDiagram;
window.drawSafetySystem = drawSafetySystem;

window.startSeriesAnimation = function() {
    if(AnimationState.series.running) return; AnimationState.series.running = true;
    function anim() { if(!AnimationState.series.running) return; AnimationState.series.offset += 2; drawSeriesCircuit(); requestAnimationFrame(anim); }
    requestAnimationFrame(anim);
};
window.stopSeriesAnimation = function() { AnimationState.series.running = false; drawSeriesCircuit(); };

window.startParallelAnimation = function() {
    if(AnimationState.parallel.running) return; AnimationState.parallel.running = true;
    function anim() { if(!AnimationState.parallel.running) return; AnimationState.parallel.offset += 2; drawParallelCircuit(); requestAnimationFrame(anim); }
    requestAnimationFrame(anim);
};
window.stopParallelAnimation = function() { AnimationState.parallel.running = false; drawParallelCircuit(); };

window.startCombinedAnimation = function() {
    if(AnimationState.combined.running) return; AnimationState.combined.running = true;
    function anim() { if(!AnimationState.combined.running) return; AnimationState.combined.offset += 2; drawCombinedCircuit(); requestAnimationFrame(anim); }
    requestAnimationFrame(anim);
};
window.stopCombinedAnimation = function() { AnimationState.combined.running = false; drawCombinedCircuit(); };
