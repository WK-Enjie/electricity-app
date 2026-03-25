// ========================================
// SINGAPORE O-LEVEL ELECTRICITY APP
// Animation & Physics Engine
// ========================================

const AnimationState = {
    currentFlow: { running: false, animationId: null, electrons: [], offset: 0 },
    series: { running: false, animationId: null, offset: 0 },
    parallel: { running: false, animationId: null, offset: 0 },
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

function clearCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
}

function drawWire(ctx, x1, y1, x2, y2, options = {}) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = options.color || Colors.wire;
    ctx.lineWidth = options.width || 3;
    ctx.stroke();
}

function drawArrow(ctx, fromX, fromY, toX, toY, options = {}) {
    const headLength = options.headLength || 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY);
    ctx.strokeStyle = options.color || Colors.wire; ctx.lineWidth = options.lineWidth || 2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fillStyle = options.color || Colors.wire; ctx.fill();
}

function drawBatterySymbol(ctx, x, y, cells = 3, options = {}) {
    const scale = options.scale || 1;
    const cellWidth = 12 * scale;
    const startX = x - (cells * cellWidth) / 2;
    ctx.strokeStyle = Colors.wire; ctx.lineWidth = 2;
    
    ctx.beginPath(); ctx.moveTo(x - 40 * scale, y); ctx.lineTo(startX, y); ctx.stroke();
    for (let i = 0; i < cells; i++) {
        const cx = startX + i * cellWidth;
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, y - 12 * scale); ctx.lineTo(cx, y + 12 * scale); ctx.stroke();
        ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + 6 * scale, y - 6 * scale); ctx.lineTo(cx + 6 * scale, y + 6 * scale); ctx.stroke();
    }
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(startX + cells * cellWidth - 6 * scale, y); ctx.lineTo(x + 40 * scale, y); ctx.stroke();
}

function drawCellSymbol(ctx, x, y, options = {}) {
    drawBatterySymbol(ctx, x, y, 1, options);
}

function drawResistorSymbol(ctx, x, y, options = {}) {
    const scale = options.scale || 1;
    const width = 40 * scale;
    const height = 15 * scale;
    
    // Draw solid background to hide the wire passing through
    ctx.fillStyle = Colors.background;
    ctx.fillRect(x - width/2, y - height/2, width, height);
    
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - width/2, y - height/2, width, height);
    
    if (options.label) {
        ctx.fillStyle = Colors.textMuted;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(options.label, x, y + 25 * scale);
    }
    if (options.value) {
        ctx.fillStyle = Colors.text;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(options.value, x, y + 4);
    }
}

function drawBulbSymbol(ctx, x, y, isOn = false, options = {}) {
    const scale = options.scale || 1;
    const radius = 15 * scale;
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

class Electron {
    constructor(path, speed = 2) { this.path = path; this.progress = Math.random(); this.speed = speed; this.size = 6; }
    update(deltaSpeed = 1) { this.progress += 0.005 * this.speed * deltaSpeed; if (this.progress >= 1) this.progress = 0; }
    getPosition() {
        const totalLength = this.getPathLength(); const targetLength = this.progress * totalLength; let currentLength = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            const segmentLength = Math.sqrt(Math.pow(this.path[i+1].x - this.path[i].x, 2) + Math.pow(this.path[i+1].y - this.path[i].y, 2));
            if (currentLength + segmentLength >= targetLength) {
                const t = (targetLength - currentLength) / segmentLength;
                return { x: this.path[i].x + (this.path[i+1].x - this.path[i].x) * t, y: this.path[i].y + (this.path[i+1].y - this.path[i].y) * t };
            }
            currentLength += segmentLength;
        }
        return this.path[this.path.length - 1];
    }
    getPathLength() {
        let length = 0;
        for (let i = 0; i < this.path.length - 1; i++) length += Math.sqrt(Math.pow(this.path[i+1].x - this.path[i].x, 2) + Math.pow(this.path[i+1].y - this.path[i].y, 2));
        return length;
    }
    draw(ctx) {
        const pos = this.getPosition();
        ctx.beginPath(); ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2); ctx.fillStyle = Colors.electron; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pos.x - 3, pos.y); ctx.lineTo(pos.x + 3, pos.y); ctx.stroke();
    }
}

// ===== CURRENT FLOW & SIMPLE CIRCUITS =====
function drawCurrentFlowAnimation() {
    const c = getCanvas('currentFlowCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    const voltage = parseFloat(document.getElementById('voltageSlider')?.value) || 6;
    const resistance = parseFloat(document.getElementById('resistanceSlider1')?.value) || 10;
    const current = voltage / resistance; const margin = 50;
    
    drawWire(ctx, margin, margin + 50, width - margin, margin + 50);
    drawWire(ctx, width - margin, margin + 50, width - margin, height - margin - 50);
    drawWire(ctx, width - margin, height - margin - 50, margin, height - margin - 50);
    drawWire(ctx, margin, height - margin - 50, margin, margin + 50);
    
    drawBatterySymbol(ctx, margin + 80, margin + 50, 4);
    ctx.fillStyle = Colors.text; ctx.fillText(`${voltage}V`, margin + 80, margin + 85);
    drawResistorSymbol(ctx, width - margin - 100, margin + 50, { value: `${resistance}Ω` });
    drawBulbSymbol(ctx, width / 2, height - margin - 50, current > 0.1);
    drawAmmeterSymbol(ctx, margin + 100, height - margin - 50, current);
    
    if (AnimationState.currentFlow.running) {
        ctx.setLineDash([10, 5]); ctx.lineDashOffset = -AnimationState.currentFlow.offset;
        ctx.strokeStyle = Colors.wireGlow; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(margin + 130, margin + 50); ctx.lineTo(width - margin - 150, margin + 50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(width - margin, margin + 70); ctx.lineTo(width - margin, height - margin - 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(width - margin - 50, height - margin - 50); ctx.lineTo(width / 2 + 35, height - margin - 50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(width / 2 - 35, height - margin - 50); ctx.lineTo(margin + 150, height - margin - 50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(margin, height - margin - 70); ctx.lineTo(margin, margin + 70); ctx.stroke();
        ctx.setLineDash([]);
        AnimationState.currentFlow.electrons.forEach(e => { e.update(current); e.draw(ctx); });
    }
}

// ===== DC CIRCUITS - FLAWLESS ALIGNMENT =====

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
    ctx.fillStyle = Colors.wire;
    ctx.beginPath(); ctx.arc(50, 130, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(width-50, 130, 5, 0, Math.PI*2); ctx.fill();
}

function drawSeriesCircuit() {
    const c = getCanvas('seriesInteractiveCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    const emf = parseFloat(document.getElementById('seriesEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('seriesR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('seriesR2Slider')?.value) || 20;
    const i = emf / (r1 + r2);
    
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
    
    ctx.fillStyle = Colors.wire;
    ctx.beginPath(); ctx.arc(50, 150, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(width-50, 150, 5, 0, Math.PI*2); ctx.fill();
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
        // Type 1: R1 in series with (R2 || R3)
        drawWire(ctx, 50, 50, 50, 200); 
        drawWire(ctx, 50, 200, 250, 200); 
        drawResistorSymbol(ctx, 150, 200, { label: 'R₁', value: `${r1}Ω` });
        drawWire(ctx, 250, 200, 350, 200); drawWire(ctx, width - 50, 50, width - 50, 200); drawWire(ctx, 550, 200, width - 50, 200);
        drawWire(ctx, 350, 120, 550, 120); drawWire(ctx, 350, 120, 350, 280); drawWire(ctx, 550, 120, 550, 280); drawWire(ctx, 350, 280, 550, 280);
        drawResistorSymbol(ctx, 450, 120, { label: 'R₂', value: `${r2}Ω` }); drawResistorSymbol(ctx, 450, 280, { label: 'R₃', value: `${r3}Ω` });
        ctx.fillStyle = Colors.wire; ctx.beginPath(); ctx.arc(350, 200, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(550, 200, 5, 0, Math.PI*2); ctx.fill();
    } else {
        // Type 2: (R1 || R2) in series with R3
        drawWire(ctx, 50, 50, 50, 200); drawWire(ctx, 50, 200, 150, 200); drawWire(ctx, 350, 200, 450, 200);
        drawWire(ctx, 150, 120, 350, 120); drawWire(ctx, 150, 120, 150, 280); drawWire(ctx, 350, 120, 350, 280); drawWire(ctx, 150, 280, 350, 280);
        drawResistorSymbol(ctx, 250, 120, { label: 'R₁', value: `${r1}Ω` }); drawResistorSymbol(ctx, 250, 280, { label: 'R₂', value: `${r2}Ω` });
        ctx.fillStyle = Colors.wire; ctx.beginPath(); ctx.arc(150, 200, 5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(350, 200, 5, 0, Math.PI*2); ctx.fill();
        drawWire(ctx, 450, 200, width - 50, 200); drawResistorSymbol(ctx, 550, 200, { label: 'R₃', value: `${r3}Ω` });
        drawWire(ctx, width - 50, 200, width - 50, 50);
    }
}

// ===== PRACTICAL ELECTRICITY & SOCKET =====
function drawSocket() {
    const c = getCanvas('socketCanvas'); if(!c) return; const {ctx, width, height} = c; clearCanvas(ctx, width, height);
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(width/2 - 60, height/2 - 60, 120, 120, 10); ctx.fill(); 
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.fillRect(width/2 - 8, height/2 - 30, 16, 25); // Earth
    ctx.fillRect(width/2 - 30, height/2 + 10, 20, 15); // Neutral
    ctx.fillRect(width/2 + 10, height/2 + 10, 20, 15); // Live
    ctx.fillStyle = '#ef4444'; ctx.fillRect(width/2 + 35, height/2 - 40, 15, 20); // Switch
}

// ===== POTENTIAL DIVIDER =====
function drawPotentialDivider() {
    const c = getCanvas('dividerInteractiveCanvas'); if (!c) return; const { ctx, width, height } = c; clearCanvas(ctx, width, height);
    const vin = parseFloat(document.getElementById('dividerVinSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('dividerR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('dividerR2Slider')?.value) || 10;
    const vout = vin * r2 / (r1 + r2);
    const cx = width / 2;
    
    drawWire(ctx, cx, 50, cx, 300);
    drawResistorSymbol(ctx, cx, 120, { label: 'R₁', value: `${r1}kΩ` });
    drawResistorSymbol(ctx, cx, 240, { label: 'R₂', value: `${r2}kΩ` });
    drawWire(ctx, cx, 180, cx + 80, 180);
    
    ctx.fillStyle = Colors.positive; ctx.fillText(`Vin = ${vin}V`, cx, 30);
    ctx.fillStyle = Colors.negative; ctx.fillText('0V', cx, 320);
    ctx.fillStyle = Colors.green; ctx.fillText(`Vout = ${vout.toFixed(2)}V`, cx + 90, 175);
    ctx.beginPath(); ctx.arc(cx, 180, 5, 0, Math.PI*2); ctx.fill();
}

// ===== WIRE EXPORTS FOR MAIN.JS =====
window.drawCurrentFlowAnimation = drawCurrentFlowAnimation;
window.drawStaticSeriesCircuit = drawStaticSeriesCircuit;
window.drawSeriesCircuit = drawSeriesCircuit;
window.drawStaticParallelCircuit = drawStaticParallelCircuit;
window.drawParallelCircuit = drawParallelCircuit;
window.drawCombinedCircuit = drawCombinedCircuit;
window.drawPotentialDivider = drawPotentialDivider;
window.drawSocket = drawSocket;

window.startCurrentFlowAnimation = function() {
    if(AnimationState.currentFlow.running) return;
    AnimationState.currentFlow.running = true;
    initCurrentFlowElectrons();
    function anim() {
        if(!AnimationState.currentFlow.running) return;
        AnimationState.currentFlow.offset += 2;
        drawCurrentFlowAnimation();
        requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
};
window.stopCurrentFlowAnimation = function() { AnimationState.currentFlow.running = false; drawCurrentFlowAnimation(); };

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