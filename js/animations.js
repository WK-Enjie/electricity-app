// ========================================
// SINGAPORE O-LEVEL ELECTRICITY APP
// Animation & Physics Engine
// Part 10A: Core Functions & Current Electricity
// ========================================

// ===== GLOBAL ANIMATION STATE =====
const AnimationState = {
    currentFlow: {
        running: false,
        animationId: null,
        electrons: [],
        offset: 0
    },
    series: {
        running: false,
        animationId: null,
        offset: 0
    },
    parallel: {
        running: false,
        animationId: null,
        offset: 0
    },
    graphs: {
        filament: { animating: false, progress: 0 },
        diode: { animating: false, progress: 0 },
        thermistor: { animating: false, progress: 0 },
        ldr: { animating: false, progress: 0 }
    }
};

// ===== CANVAS UTILITY FUNCTIONS =====

function getCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    return {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        width: canvas.width,
        height: canvas.height
    };
}

function clearCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
}

function setCanvasStyles(ctx, options = {}) {
    ctx.strokeStyle = options.strokeStyle || '#fbbf24';
    ctx.fillStyle = options.fillStyle || '#fbbf24';
    ctx.lineWidth = options.lineWidth || 2;
    ctx.lineCap = options.lineCap || 'round';
    ctx.lineJoin = options.lineJoin || 'round';
    ctx.font = options.font || '14px sans-serif';
    ctx.textAlign = options.textAlign || 'center';
    ctx.textBaseline = options.textBaseline || 'middle';
}

// ===== COLOR CONSTANTS =====
const Colors = {
    wire: '#fbbf24',
    wireGlow: '#22d3ee',
    positive: '#ef4444',
    negative: '#3b82f6',
    electron: '#60a5fa',
    conventionalCurrent: '#ef4444',
    background: '#0f172a',
    grid: 'rgba(59, 130, 246, 0.1)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    green: '#10b981',
    orange: '#f59e0b',
    purple: '#8b5cf6',
    bulbOn: 'rgba(251, 191, 36, 0.4)',
    bulbGlow: '#fbbf24'
};

// ===== DRAWING HELPER FUNCTIONS =====

function drawWire(ctx, x1, y1, x2, y2, options = {}) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = options.color || Colors.wire;
    ctx.lineWidth = options.width || 3;
    ctx.stroke();
}

function drawDashedWire(ctx, x1, y1, x2, y2, offset = 0, options = {}) {
    ctx.beginPath();
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = -offset;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = options.color || Colors.wireGlow;
    ctx.lineWidth = options.width || 3;
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawCircle(ctx, x, y, radius, options = {}) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (options.fill) {
        ctx.fillStyle = options.fillColor || Colors.wire;
        ctx.fill();
    }
    if (options.stroke !== false) {
        ctx.strokeStyle = options.strokeColor || Colors.wire;
        ctx.lineWidth = options.lineWidth || 2;
        ctx.stroke();
    }
}

function drawRectangle(ctx, x, y, width, height, options = {}) {
    if (options.fill) {
        ctx.fillStyle = options.fillColor || Colors.wire;
        ctx.fillRect(x, y, width, height);
    }
    ctx.strokeStyle = options.strokeColor || Colors.wire;
    ctx.lineWidth = options.lineWidth || 2;
    ctx.strokeRect(x, y, width, height);
}

function drawText(ctx, text, x, y, options = {}) {
    ctx.fillStyle = options.color || Colors.text;
    ctx.font = options.font || '14px sans-serif';
    ctx.textAlign = options.align || 'center';
    ctx.textBaseline = options.baseline || 'middle';
    ctx.fillText(text, x, y);
}

function drawArrow(ctx, fromX, fromY, toX, toY, options = {}) {
    const headLength = options.headLength || 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = options.color || Colors.wire;
    ctx.lineWidth = options.lineWidth || 2;
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = options.color || Colors.wire;
    ctx.fill();
}

// ===== CIRCUIT SYMBOL DRAWING FUNCTIONS =====

function drawCellSymbol(ctx, x, y, options = {}) {
    const scale = options.scale || 1;
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    
    // Left wire
    ctx.beginPath();
    ctx.moveTo(x - 30 * scale, y);
    ctx.lineTo(x - 8 * scale, y);
    ctx.stroke();
    
    // Long line (positive)
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 8 * scale, y - 15 * scale);
    ctx.lineTo(x - 8 * scale, y + 15 * scale);
    ctx.stroke();
    
    // Short line (negative)
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + 4 * scale, y - 8 * scale);
    ctx.lineTo(x + 4 * scale, y + 8 * scale);
    ctx.stroke();
    
    // Right wire
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4 * scale, y);
    ctx.lineTo(x + 30 * scale, y);
    ctx.stroke();
    
    // Labels
    if (options.showLabels !== false) {
        ctx.fillStyle = Colors.positive;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', x - 15 * scale, y - 12 * scale);
        ctx.fillStyle = Colors.negative;
        ctx.fillText('−', x + 12 * scale, y - 12 * scale);
    }
}

function drawBatterySymbol(ctx, x, y, cells = 3, options = {}) {
    const scale = options.scale || 1;
    const cellWidth = 12 * scale;
    const startX = x - (cells * cellWidth) / 2;
    
    ctx.strokeStyle = Colors.wire;
    
    // Left wire
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 40 * scale, y);
    ctx.lineTo(startX, y);
    ctx.stroke();
    
    // Draw cells
    for (let i = 0; i < cells; i++) {
        const cx = startX + i * cellWidth;
        
        // Long line
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, y - 12 * scale);
        ctx.lineTo(cx, y + 12 * scale);
        ctx.stroke();
        
        // Short line
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx + 6 * scale, y - 6 * scale);
        ctx.lineTo(cx + 6 * scale, y + 6 * scale);
        ctx.stroke();
    }
    
    // Right wire
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX + cells * cellWidth - 6 * scale, y);
    ctx.lineTo(x + 40 * scale, y);
    ctx.stroke();
}

function drawResistorSymbol(ctx, x, y, options = {}) {
    const scale = options.scale || 1;
    const width = 40 * scale;
    const height = 15 * scale;
    
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    
    // Left wire
    ctx.beginPath();
    ctx.moveTo(x - 35 * scale, y);
    ctx.lineTo(x - width/2, y);
    ctx.stroke();
    
    // Rectangle
    ctx.strokeRect(x - width/2, y - height/2, width, height);
    
    // Right wire
    ctx.beginPath();
    ctx.moveTo(x + width/2, y);
    ctx.lineTo(x + 35 * scale, y);
    ctx.stroke();
    
    // Label
    if (options.label) {
        ctx.fillStyle = Colors.textMuted;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(options.label, x, y + 25 * scale);
    }
    
    // Value
    if (options.value) {
        ctx.fillStyle = Colors.text;
        ctx.font = '11px sans-serif';
        ctx.fillText(options.value, x, y);
    }
}

function drawBulbSymbol(ctx, x, y, isOn = false, options = {}) {
    const scale = options.scale || 1;
    const radius = 15 * scale;
    
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    
    // Left wire
    ctx.beginPath();
    ctx.moveTo(x - 35 * scale, y);
    ctx.lineTo(x - radius, y);
    ctx.stroke();
    
    // Circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (isOn) {
        ctx.fillStyle = Colors.bulbOn;
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = Colors.bulbGlow;
        ctx.shadowBlur = 20;
    }
    
    ctx.strokeStyle = Colors.wire;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Cross
    const crossSize = radius * 0.7;
    ctx.beginPath();
    ctx.moveTo(x - crossSize, y - crossSize);
    ctx.lineTo(x + crossSize, y + crossSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + crossSize, y - crossSize);
    ctx.lineTo(x - crossSize, y + crossSize);
    ctx.stroke();
    
    // Right wire
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + 35 * scale, y);
    ctx.stroke();
    
    // Label
    if (options.label) {
        ctx.fillStyle = Colors.textMuted;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(options.label, x, y + 30 * scale);
    }
}

function drawSwitchSymbol(ctx, x, y, isClosed = false, options = {}) {
    const scale = options.scale || 1;
    
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    
    // Left wire
    ctx.beginPath();
    ctx.moveTo(x - 35 * scale, y);
    ctx.lineTo(x - 15 * scale, y);
    ctx.stroke();
    
    // Left dot
    ctx.beginPath();
    ctx.arc(x - 12 * scale, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = Colors.wire;
    ctx.fill();
    
    // Switch arm
    ctx.beginPath();
    ctx.moveTo(x - 12 * scale, y);
    if (isClosed) {
        ctx.lineTo(x + 12 * scale, y);
    } else {
        ctx.lineTo(x + 8 * scale, y - 18 * scale);
    }
    ctx.stroke();
    
    // Right dot
    ctx.beginPath();
    ctx.arc(x + 12 * scale, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wire
    ctx.beginPath();
    ctx.moveTo(x + 15 * scale, y);
    ctx.lineTo(x + 35 * scale, y);
    ctx.stroke();
}

function drawAmmeterSymbol(ctx, x, y, reading = null, options = {}) {
    const scale = options.scale || 1;
    const radius = 18 * scale;
    
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    
    // Left wire
    ctx.beginPath();
    ctx.moveTo(x - 35 * scale, y);
    ctx.lineTo(x - radius, y);
    ctx.stroke();
    
    // Circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // A label
    ctx.fillStyle = Colors.positive;
    ctx.font = `bold ${16 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', x, y);
    
    // Right wire
    ctx.strokeStyle = Colors.wire;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + 35 * scale, y);
    ctx.stroke();
    
    // Reading
    if (reading !== null) {
        ctx.fillStyle = Colors.wireGlow;
        ctx.font = '10px sans-serif';
        ctx.fillText(reading.toFixed(2) + ' A', x, y + 30 * scale);
    }
}

function drawVoltmeterSymbol(ctx, x, y, reading = null, options = {}) {
    const scale = options.scale || 1;
    const radius = 18 * scale;
    
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    
    // Left wire
    ctx.beginPath();
    ctx.moveTo(x - 35 * scale, y);
    ctx.lineTo(x - radius, y);
    ctx.stroke();
    
    // Circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // V label
    ctx.fillStyle = Colors.negative;
    ctx.font = `bold ${16 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', x, y);
    
    // Right wire
    ctx.strokeStyle = Colors.wire;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + 35 * scale, y);
    ctx.stroke();
    
    // Reading
    if (reading !== null) {
        ctx.fillStyle = Colors.wireGlow;
        ctx.font = '10px sans-serif';
        ctx.fillText(reading.toFixed(2) + ' V', x, y + 30 * scale);
    }
}

// ===== ELECTRON ANIMATION =====

class Electron {
    constructor(path, speed = 2) {
        this.path = path; // Array of {x, y} points
        this.progress = Math.random(); // 0 to 1
        this.speed = speed;
        this.size = 6;
    }
    
    update(deltaSpeed = 1) {
        this.progress += 0.005 * this.speed * deltaSpeed;
        if (this.progress >= 1) {
            this.progress = 0;
        }
    }
    
    getPosition() {
        const totalLength = this.getPathLength();
        const targetLength = this.progress * totalLength;
        
        let currentLength = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            const segmentLength = this.getSegmentLength(this.path[i], this.path[i + 1]);
            if (currentLength + segmentLength >= targetLength) {
                const t = (targetLength - currentLength) / segmentLength;
                return {
                    x: this.path[i].x + (this.path[i + 1].x - this.path[i].x) * t,
                    y: this.path[i].y + (this.path[i + 1].y - this.path[i].y) * t
                };
            }
            currentLength += segmentLength;
        }
        
        return this.path[this.path.length - 1];
    }
    
    getPathLength() {
        let length = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            length += this.getSegmentLength(this.path[i], this.path[i + 1]);
        }
        return length;
    }
    
    getSegmentLength(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    
    draw(ctx) {
        const pos = this.getPosition();
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = Colors.electron;
        ctx.fill();
        
        // Minus sign
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x - 3, pos.y);
        ctx.lineTo(pos.x + 3, pos.y);
        ctx.stroke();
    }
}

// ===== CURRENT FLOW ANIMATION =====

function drawCurrentFlowAnimation() {
    const canvasData = getCanvas('currentFlowCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const voltage = parseFloat(document.getElementById('voltageSlider')?.value) || 6;
    const resistance = parseFloat(document.getElementById('resistanceSlider1')?.value) || 10;
    const current = voltage / resistance;
    
    // Circuit layout
    const margin = 50;
    const circuitWidth = width - 2 * margin;
    const circuitHeight = height - 2 * margin;
    
    // Draw circuit outline
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    
    // Top wire
    drawWire(ctx, margin, margin + 50, width - margin, margin + 50);
    
    // Right wire
    drawWire(ctx, width - margin, margin + 50, width - margin, height - margin - 50);
    
    // Bottom wire
    drawWire(ctx, width - margin, height - margin - 50, margin, height - margin - 50);
    
    // Left wire
    drawWire(ctx, margin, height - margin - 50, margin, margin + 50);
    
    // Draw battery
    drawBatterySymbol(ctx, margin + 80, margin + 50, 4);
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, margin + 80, margin + 85);
    
    // Draw resistor
    drawResistorSymbol(ctx, width - margin - 100, margin + 50, { value: `${resistance}Ω` });
    
    // Draw bulb
    const bulbOn = current > 0.1;
    drawBulbSymbol(ctx, width / 2, height - margin - 50, bulbOn);
    
    // Draw ammeter
    drawAmmeterSymbol(ctx, margin + 100, height - margin - 50, current);
    
    // Draw current flow animation if running
    if (AnimationState.currentFlow.running) {
        const offset = AnimationState.currentFlow.offset;
        
        // Animated dashed lines showing current flow
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -offset;
        ctx.strokeStyle = Colors.wireGlow;
        ctx.lineWidth = 4;
        
        // Top
        ctx.beginPath();
        ctx.moveTo(margin + 130, margin + 50);
        ctx.lineTo(width - margin - 150, margin + 50);
        ctx.stroke();
        
        // Right
        ctx.beginPath();
        ctx.moveTo(width - margin, margin + 70);
        ctx.lineTo(width - margin, height - margin - 70);
        ctx.stroke();
        
        // Bottom
        ctx.beginPath();
        ctx.moveTo(width - margin - 50, height - margin - 50);
        ctx.lineTo(width / 2 + 35, height - margin - 50);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(width / 2 - 35, height - margin - 50);
        ctx.lineTo(margin + 150, height - margin - 50);
        ctx.stroke();
        
        // Left
        ctx.beginPath();
        ctx.moveTo(margin, height - margin - 70);
        ctx.lineTo(margin, margin + 70);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Draw electrons
        AnimationState.currentFlow.electrons.forEach(electron => {
            electron.update(current);
            electron.draw(ctx);
        });
    }
    
    // Draw labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Battery', margin + 40, margin + 20);
    ctx.fillText('Resistor', width - margin - 130, margin + 20);
    ctx.fillText('Bulb', width / 2 - 15, height - margin - 90);
    ctx.fillText('Ammeter', margin + 60, height - margin - 90);
    
    // Current direction arrow
    if (AnimationState.currentFlow.running) {
        drawArrow(ctx, width - margin - 50, margin + 70, width - margin - 50, margin + 120, {
            color: Colors.conventionalCurrent,
            headLength: 12
        });
        ctx.fillStyle = Colors.conventionalCurrent;
        ctx.font = '12px sans-serif';
        ctx.fillText('I', width - margin - 35, margin + 95);
    }
}

function initCurrentFlowElectrons() {
    // Create electron path (rectangular circuit)
    const margin = 50;
    const width = 700;
    const height = 300;
    
    const path = [
        { x: margin, y: margin + 50 },
        { x: margin, y: height - margin - 50 },
        { x: width - margin, y: height - margin - 50 },
        { x: width - margin, y: margin + 50 },
        { x: margin, y: margin + 50 }
    ];
    
    // Create multiple electrons
    AnimationState.currentFlow.electrons = [];
    for (let i = 0; i < 8; i++) {
        const electron = new Electron(path, 1);
        electron.progress = i / 8;
        AnimationState.currentFlow.electrons.push(electron);
    }
}

function startCurrentFlowAnimation() {
    if (AnimationState.currentFlow.running) return;
    
    AnimationState.currentFlow.running = true;
    initCurrentFlowElectrons();
    animateCurrentFlow();
}

function stopCurrentFlowAnimation() {
    AnimationState.currentFlow.running = false;
    if (AnimationState.currentFlow.animationId) {
        cancelAnimationFrame(AnimationState.currentFlow.animationId);
    }
    drawCurrentFlowAnimation();
}

function animateCurrentFlow() {
    if (!AnimationState.currentFlow.running) return;
    
    AnimationState.currentFlow.offset += 2;
    drawCurrentFlowAnimation();
    
    AnimationState.currentFlow.animationId = requestAnimationFrame(animateCurrentFlow);
}

// ===== AMMETER CIRCUIT DIAGRAM =====

function drawAmmeterCircuit() {
    const canvasData = getCanvas('ammeterCircuit');
    if (!canvasData) return;
    
    const { ctx, canvas } = canvasData;
    const width = 400;
    const height = 200;
    
    // Clear with SVG - this is an SVG element, not canvas
    // For the actual implementation, we'll draw on canvas
}

// ===== VIR TRIANGLE =====

function drawVIRTriangle() {
    const canvasData = getCanvas('virTriangleCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const centerX = width / 2;
    const topY = 20;
    const bottomY = height - 30;
    const triangleWidth = 150;
    
    // Draw triangle
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX - triangleWidth / 2, bottomY);
    ctx.lineTo(centerX + triangleWidth / 2, bottomY);
    ctx.closePath();
    ctx.stroke();
    
    // Horizontal divider
    ctx.beginPath();
    ctx.moveTo(centerX - triangleWidth / 3, (topY + bottomY) / 2 + 10);
    ctx.lineTo(centerX + triangleWidth / 3, (topY + bottomY) / 2 + 10);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = Colors.orange;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', centerX, topY + 35);
    
    ctx.fillStyle = Colors.green;
    ctx.fillText('I', centerX - 35, bottomY - 25);
    
    ctx.fillStyle = Colors.purple;
    ctx.fillText('R', centerX + 35, bottomY - 25);
}

// ===== WATER ANALOGY =====

function drawWaterAnalogy() {
    const canvasData = getCanvas('waterAnalogyCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    // Draw water system on left
    const leftCenter = width / 4;
    
    // Water tank (high)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(leftCenter - 40, 30, 80, 50);
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.strokeRect(leftCenter - 40, 30, 80, 50);
    
    // Water tank (low)
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(leftCenter - 40, height - 80, 80, 50);
    ctx.strokeRect(leftCenter - 40, height - 80, 80, 50);
    
    // Pipe
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(leftCenter - 10, 80, 20, height - 160);
    
    // Narrow section (resistance)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(leftCenter - 5, height / 2 - 20, 10, 40);
    
    // Water flow arrows
    ctx.fillStyle = '#22d3ee';
    drawArrow(ctx, leftCenter, 100, leftCenter, 140, { color: '#22d3ee' });
    drawArrow(ctx, leftCenter, height - 100, leftCenter, height - 140, { color: '#22d3ee' });
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('High Pressure', leftCenter, 20);
    ctx.fillText('Low Pressure', leftCenter, height - 20);
    ctx.fillText('Narrow pipe', leftCenter + 50, height / 2);
    ctx.fillText('(Resistance)', leftCenter + 50, height / 2 + 15);
    
    // Draw electrical system on right
    const rightCenter = 3 * width / 4;
    
    // Battery (high V)
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    drawCellSymbol(ctx, rightCenter, 55);
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.fillText('+ve terminal', rightCenter, 20);
    
    // Wire down
    drawWire(ctx, rightCenter, 80, rightCenter, height / 2 - 30);
    
    // Resistor
    drawResistorSymbol(ctx, rightCenter, height / 2);
    
    // Wire to bottom
    drawWire(ctx, rightCenter, height / 2 + 30, rightCenter, height - 60);
    
    // Ground symbol
    ctx.beginPath();
    ctx.moveTo(rightCenter - 20, height - 60);
    ctx.lineTo(rightCenter + 20, height - 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightCenter - 12, height - 52);
    ctx.lineTo(rightCenter + 12, height - 52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightCenter - 5, height - 44);
    ctx.lineTo(rightCenter + 5, height - 44);
    ctx.stroke();
    
    ctx.fillText('−ve terminal', rightCenter, height - 20);
    
    // Current arrow
    drawArrow(ctx, rightCenter + 15, 100, rightCenter + 15, 150, { color: Colors.conventionalCurrent });
    ctx.fillStyle = Colors.conventionalCurrent;
    ctx.fillText('I', rightCenter + 30, 125);
    
    // Comparison lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = Colors.textMuted;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 30, 55);
    ctx.lineTo(width / 2 + 30, 55);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width / 2 - 30, height / 2);
    ctx.lineTo(width / 2 + 30, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // "=" signs
    ctx.fillStyle = Colors.text;
    ctx.font = '16px sans-serif';
    ctx.fillText('≈', width / 2, 55);
    ctx.fillText('≈', width / 2, height / 2);
}

// ===== VOLTMETER CIRCUIT =====

function drawVoltmeterCircuit() {
    const canvas = document.getElementById('voltmeterCircuit');
    if (!canvas || canvas.tagName !== 'svg') return;
    
    // This is an SVG element - we'll create it programmatically
    canvas.innerHTML = `
        <!-- Main circuit -->
        <line x1="50" y1="80" x2="350" y2="80" stroke="#fbbf24" stroke-width="3"/>
        <line x1="350" y1="80" x2="350" y2="180" stroke="#fbbf24" stroke-width="3"/>
        <line x1="350" y1="180" x2="50" y2="180" stroke="#fbbf24" stroke-width="3"/>
        <line x1="50" y1="180" x2="50" y2="80" stroke="#fbbf24" stroke-width="3"/>
        
        <!-- Battery -->
        <line x1="70" y1="65" x2="70" y2="95" stroke="#fbbf24" stroke-width="3"/>
        <line x1="80" y1="70" x2="80" y2="90" stroke="#fbbf24" stroke-width="5"/>
        <text x="75" y="55" fill="#f1f5f9" font-size="12" text-anchor="middle">+</text>
        
        <!-- Resistor -->
        <rect x="250" y="70" width="50" height="20" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <text x="275" y="60" fill="#94a3b8" font-size="11" text-anchor="middle">R</text>
        
        <!-- Voltmeter in parallel -->
        <line x1="240" y1="80" x2="240" y2="130" stroke="#fbbf24" stroke-width="2"/>
        <line x1="310" y1="80" x2="310" y2="130" stroke="#fbbf24" stroke-width="2"/>
        <circle cx="275" cy="130" r="20" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <text x="275" y="135" fill="#3b82f6" font-size="14" font-weight="bold" text-anchor="middle">V</text>
        <line x1="240" y1="130" x2="255" y2="130" stroke="#fbbf24" stroke-width="2"/>
        <line x1="295" y1="130" x2="310" y2="130" stroke="#fbbf24" stroke-width="2"/>
        
        <!-- Labels -->
        <text x="275" y="165" fill="#94a3b8" font-size="11" text-anchor="middle">Voltmeter in parallel</text>
        <text x="200" y="210" fill="#94a3b8" font-size="10" text-anchor="middle">Measures p.d. across R</text>
    `;
}

// ===== EMF DEMO =====

function drawEMFDemo() {
    const canvasData = getCanvas('emfDemoCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const emf = parseFloat(document.getElementById('emfSlider')?.value) || 12;
    const cells = parseInt(document.getElementById('cellSlider')?.value) || 4;
    const emfPerCell = emf / cells;
    
    // Draw energy flow concept
    const centerY = height / 2;
    
    // Battery representation
    const batteryWidth = 200;
    const batteryHeight = 100;
    const batteryX = 100;
    
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    ctx.strokeRect(batteryX, centerY - batteryHeight/2, batteryWidth, batteryHeight);
    
    // Draw cells inside
    const cellWidth = batteryWidth / cells;
    for (let i = 0; i < cells; i++) {
        const cx = batteryX + i * cellWidth + cellWidth / 2;
        
        // Positive line
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 5, centerY - 25);
        ctx.lineTo(cx - 5, centerY + 25);
        ctx.stroke();
        
        // Negative line
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx + 8, centerY - 15);
        ctx.lineTo(cx + 8, centerY + 15);
        ctx.stroke();
        
        // Cell voltage label
        ctx.fillStyle = Colors.textMuted;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${emfPerCell.toFixed(1)}V`, cx, centerY + 45);
    }
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.fillText('Chemical Energy', batteryX + batteryWidth/2, centerY - batteryHeight/2 - 20);
    ctx.fillText('→ Electrical Energy', batteryX + batteryWidth/2, centerY - batteryHeight/2 - 5);
    
    // Total EMF
    ctx.fillStyle = Colors.orange;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Total EMF = ${emf}V`, batteryX + batteryWidth/2, centerY + 75);
    
    // External circuit representation
    const circuitX = batteryX + batteryWidth + 80;
    
    // Arrow showing energy transfer
    drawArrow(ctx, batteryX + batteryWidth + 10, centerY, circuitX - 10, centerY, {
        color: Colors.green,
        headLength: 12
    });
    
    ctx.fillStyle = Colors.green;
    ctx.font = '12px sans-serif';
    ctx.fillText('Energy supplied', (batteryX + batteryWidth + circuitX) / 2, centerY - 15);
    ctx.fillText('to circuit', (batteryX + batteryWidth + circuitX) / 2, centerY + 15);
    
    // Load representation
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.strokeRect(circuitX, centerY - 40, 150, 80);
    
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.fillText('External Circuit', circuitX + 75, centerY - 55);
    ctx.fillText('(Load)', circuitX + 75, centerY);
    
    // Energy conversion labels
    ctx.fillStyle = Colors.orange;
    ctx.font = '12px sans-serif';
    ctx.fillText('Electrical → Heat/Light', circuitX + 75, centerY + 25);
}

function drawCellsSeriesCircuit() {
    const canvas = document.getElementById('cellsSeriesCircuit');
    if (!canvas || canvas.tagName !== 'svg') return;
    
    canvas.innerHTML = `
        <!-- Cells in series -->
        <line x1="20" y1="50" x2="60" y2="50" stroke="#fbbf24" stroke-width="2"/>
        
        <!-- Cell 1 -->
        <line x1="60" y1="30" x2="60" y2="70" stroke="#fbbf24" stroke-width="2"/>
        <line x1="70" y1="35" x2="70" y2="65" stroke="#fbbf24" stroke-width="4"/>
        <text x="65" y="20" fill="#94a3b8" font-size="10" text-anchor="middle">ε₁</text>
        
        <!-- Cell 2 -->
        <line x1="100" y1="30" x2="100" y2="70" stroke="#fbbf24" stroke-width="2"/>
        <line x1="110" y1="35" x2="110" y2="65" stroke="#fbbf24" stroke-width="4"/>
        <text x="105" y="20" fill="#94a3b8" font-size="10" text-anchor="middle">ε₂</text>
        
        <!-- Connecting wire -->
        <line x1="70" y1="50" x2="100" y2="50" stroke="#fbbf24" stroke-width="2"/>
        
        <!-- Cell 3 -->
        <line x1="140" y1="30" x2="140" y2="70" stroke="#fbbf24" stroke-width="2"/>
        <line x1="150" y1="35" x2="150" y2="65" stroke="#fbbf24" stroke-width="4"/>
        <text x="145" y="20" fill="#94a3b8" font-size="10" text-anchor="middle">ε₃</text>
        
        <!-- Connecting wire -->
        <line x1="110" y1="50" x2="140" y2="50" stroke="#fbbf24" stroke-width="2"/>
        
        <!-- End wire -->
        <line x1="150" y1="50" x2="480" y2="50" stroke="#fbbf24" stroke-width="2"/>
        
        <!-- Formula -->
        <text x="250" y="85" fill="#f59e0b" font-size="14" text-anchor="middle" font-family="monospace">
            ε_total = ε₁ + ε₂ + ε₃ + ...
        </text>
    `;
}

// ===== OHM'S LAW DEMO =====

function drawOhmsLawDemo() {
    const circuitCanvas = getCanvas('ohmsLawCircuitCanvas');
    const graphCanvas = getCanvas('ohmsLawGraphCanvas');
    
    if (circuitCanvas) {
        drawOhmsLawCircuit(circuitCanvas);
    }
    
    if (graphCanvas) {
        drawOhmsLawGraph(graphCanvas);
    }
}

function drawOhmsLawCircuit(canvasData) {
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const voltage = parseFloat(document.getElementById('ohmVoltageSlider')?.value) || 6;
    const resistance = parseFloat(document.getElementById('ohmResistanceSlider')?.value) || 10;
    const current = voltage / resistance;
    
    const margin = 40;
    
    // Draw simple circuit
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    
    // Outer rectangle
    ctx.beginPath();
    ctx.moveTo(margin, margin + 30);
    ctx.lineTo(width - margin, margin + 30);
    ctx.lineTo(width - margin, height - margin - 30);
    ctx.lineTo(margin, height - margin - 30);
    ctx.lineTo(margin, margin + 30);
    ctx.stroke();
    
    // Battery
    drawCellSymbol(ctx, margin + 60, margin + 30, { scale: 0.8 });
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, margin + 60, margin + 60);
    
    // Resistor
    drawResistorSymbol(ctx, width - margin - 70, margin + 30, { 
        scale: 0.9,
        value: `${resistance}Ω`
    });
    
    // Current arrow
    if (current > 0) {
        drawArrow(ctx, width / 2 - 30, height - margin - 30, width / 2 + 30, height - margin - 30, {
            color: Colors.conventionalCurrent,
            headLength: 10
        });
        ctx.fillStyle = Colors.conventionalCurrent;
        ctx.font = '14px sans-serif';
        ctx.fillText(`I = ${current.toFixed(2)}A`, width / 2, height - margin - 10);
    }
}

function drawOhmsLawGraph(canvasData) {
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const resistance = parseFloat(document.getElementById('ohmResistanceSlider')?.value) || 10;
    
    const margin = 50;
    const graphWidth = width - 2 * margin;
    const graphHeight = height - 2 * margin;
    
    // Draw axes
    ctx.strokeStyle = Colors.textMuted;
    ctx.lineWidth = 2;
    
    // Y-axis (Current)
    drawArrow(ctx, margin, height - margin, margin, margin - 10, { color: Colors.textMuted });
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('I (A)', margin, margin - 25);
    
    // X-axis (Voltage)
    drawArrow(ctx, margin, height - margin, width - margin + 10, height - margin, { color: Colors.textMuted });
    ctx.fillText('V (V)', width - margin + 10, height - margin + 25);
    
    // Origin
    ctx.fillText('0', margin - 15, height - margin + 5);
    
    // Draw V-I line for ohmic conductor
    const maxV = 12;
    const maxI = maxV / resistance;
    const scale = graphHeight / Math.max(maxI, 1.5);
    
    ctx.strokeStyle = Colors.green;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    
    for (let v = 0; v <= maxV; v += 0.5) {
        const i = v / resistance;
        const x = margin + (v / maxV) * graphWidth;
        const y = height - margin - i * scale;
        ctx.lineTo(x, Math.max(y, margin));
    }
    ctx.stroke();
    
    // Current point
    const voltage = parseFloat(document.getElementById('ohmVoltageSlider')?.value) || 6;
    const current = voltage / resistance;
    const pointX = margin + (voltage / maxV) * graphWidth;
    const pointY = height - margin - current * scale;
    
    // Draw point
    ctx.beginPath();
    ctx.arc(pointX, Math.max(pointY, margin), 8, 0, Math.PI * 2);
    ctx.fillStyle = Colors.orange;
    ctx.fill();
    
    // Draw dotted lines to axes
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = Colors.orange;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(pointX, Math.max(pointY, margin));
    ctx.lineTo(pointX, height - margin);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(margin, Math.max(pointY, margin));
    ctx.lineTo(pointX, Math.max(pointY, margin));
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Labels
    ctx.fillStyle = Colors.textMuted;
    ctx.font = '11px sans-serif';
    ctx.fillText(`R = ${resistance}Ω`, width - margin - 40, margin + 30);
    ctx.fillStyle = Colors.green;
    ctx.fillText('Straight line', width - margin - 40, margin + 50);
    ctx.fillText('= Ohmic', width - margin - 40, margin + 65);
}

// ===== WIRE RESISTANCE DEMO =====

function drawWireResistanceDemo() {
    const canvasData = getCanvas('wireResistanceCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const length = parseFloat(document.getElementById('wireLengthSlider')?.value) || 1;
    const thicknessLevel = parseInt(document.getElementById('wireThicknessSlider')?.value) || 2;
    const material = document.getElementById('wireMaterialSelect')?.value || 'copper';
    
    const centerY = height / 2;
    const startX = 100;
    const maxWireLength = 400;
    const wireLength = (length / 3) * maxWireLength;
    const endX = startX + wireLength;
    
    // Thickness mapping
    const thicknesses = [6, 12, 20];
    const wireThickness = thicknesses[thicknessLevel - 1];
    
    // Material colors
    const materialColors = {
        'copper': '#cd7f32',
        'aluminium': '#c0c0c0',
        'nichrome': '#808080'
    };
    
    // Draw wire
    ctx.fillStyle = materialColors[material];
    ctx.beginPath();
    ctx.roundRect(startX, centerY - wireThickness/2, wireLength, wireThickness, wireThickness/4);
    ctx.fill();
    
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Terminals
    ctx.fillStyle = Colors.wire;
    ctx.fillRect(startX - 20, centerY - 15, 25, 30);
    ctx.fillRect(endX - 5, centerY - 15, 25, 30);
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Length: ${length.toFixed(1)} m`, width / 2, 30);
    
    ctx.fillText(material.charAt(0).toUpperCase() + material.slice(1), width / 2, height - 40);
    
    // Dimension arrow
    ctx.strokeStyle = Colors.textMuted;
    ctx.lineWidth = 1;
    
    // Length indicator
    drawArrow(ctx, startX, height - 80, endX, height - 80, { color: Colors.textMuted });
    drawArrow(ctx, endX, height - 80, startX, height - 80, { color: Colors.textMuted });
    ctx.fillStyle = Colors.textMuted;
    ctx.fillText('L', (startX + endX) / 2, height - 65);
    
    // Cross-section indicator
    const csX = endX + 60;
    ctx.beginPath();
    ctx.ellipse(csX, centerY, wireThickness, wireThickness * 1.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = materialColors[material];
    ctx.fill();
    ctx.strokeStyle = Colors.wire;
    ctx.stroke();
    
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.fillText('Cross', csX, centerY + wireThickness + 25);
    ctx.fillText('section A', csX, centerY + wireThickness + 40);
}

// Export functions to global scope
window.drawCurrentFlowAnimation = drawCurrentFlowAnimation;
window.startCurrentFlowAnimation = startCurrentFlowAnimation;
window.stopCurrentFlowAnimation = stopCurrentFlowAnimation;
window.drawAmmeterCircuit = drawAmmeterCircuit;
window.drawVIRTriangle = drawVIRTriangle;
window.drawWaterAnalogy = drawWaterAnalogy;
window.drawVoltmeterCircuit = drawVoltmeterCircuit;
window.drawEMFDemo = drawEMFDemo;
window.drawCellsSeriesCircuit = drawCellsSeriesCircuit;
window.drawOhmsLawDemo = drawOhmsLawDemo;
window.drawWireResistanceDemo = drawWireResistanceDemo;

console.log('⚡ Animations Part A loaded');

// ========================================
// Animation & Physics Engine
// Part 10B: I-V Graphs & Non-Ohmic Conductors
// ========================================

// ===== I-V GRAPH DRAWING FUNCTIONS =====

function drawIVGraphAxes(ctx, width, height, options = {}) {
    const margin = options.margin || 60;
    const originX = options.originX || width / 2;
    const originY = options.originY || height / 2;
    
    ctx.strokeStyle = Colors.textMuted;
    ctx.lineWidth = 2;
    
    // Y-axis (Current)
    ctx.beginPath();
    ctx.moveTo(originX, height - margin + 20);
    ctx.lineTo(originX, margin - 20);
    ctx.stroke();
    
    // Arrow head for Y
    ctx.beginPath();
    ctx.moveTo(originX, margin - 20);
    ctx.lineTo(originX - 5, margin - 10);
    ctx.lineTo(originX + 5, margin - 10);
    ctx.closePath();
    ctx.fillStyle = Colors.textMuted;
    ctx.fill();
    
    // X-axis (Voltage)
    ctx.beginPath();
    ctx.moveTo(margin - 20, originY);
    ctx.lineTo(width - margin + 20, originY);
    ctx.stroke();
    
    // Arrow head for X
    ctx.beginPath();
    ctx.moveTo(width - margin + 20, originY);
    ctx.lineTo(width - margin + 10, originY - 5);
    ctx.lineTo(width - margin + 10, originY + 5);
    ctx.closePath();
    ctx.fill();
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('I / A', originX + 25, margin - 25);
    ctx.fillText('V / V', width - margin + 10, originY + 25);
    ctx.fillText('0', originX - 15, originY + 15);
    
    return { margin, originX, originY };
}

// ===== FILAMENT LAMP I-V GRAPH =====

function drawFilamentIVGraph() {
    const canvasData = getCanvas('filamentIVCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const { margin, originX, originY } = drawIVGraphAxes(ctx, width, height);
    
    const voltage = parseFloat(document.getElementById('filamentVoltageSlider')?.value) || 0;
    
    // Draw the characteristic curve
    const graphWidth = (width - 2 * margin) / 2;
    const graphHeight = (height - 2 * margin) / 2;
    
    ctx.strokeStyle = Colors.orange;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    // Filament lamp: I increases but at decreasing rate (curve flattens)
    // Using equation: I = k * V / sqrt(1 + (V/V0)^2) to simulate increasing R
    const k = 0.15;
    const V0 = 3;
    
    for (let v = -6; v <= 6; v += 0.1) {
        const sign = v >= 0 ? 1 : -1;
        const absV = Math.abs(v);
        const i = sign * k * absV / Math.sqrt(1 + Math.pow(absV / V0, 2));
        
        const x = originX + (v / 6) * graphWidth;
        const y = originY - (i / 0.8) * graphHeight;
        
        if (v === -6) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw current point if voltage is set
    if (voltage !== 0) {
        const sign = voltage >= 0 ? 1 : -1;
        const absV = Math.abs(voltage);
        const current = sign * k * absV / Math.sqrt(1 + Math.pow(absV / V0, 2));
        
        const pointX = originX + (voltage / 6) * graphWidth;
        const pointY = originY - (current / 0.8) * graphHeight;
        
        // Point
        ctx.beginPath();
        ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
        ctx.fillStyle = Colors.green;
        ctx.fill();
        
        // Dotted lines
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = Colors.green;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(pointX, pointY);
        ctx.lineTo(pointX, originY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(pointX, pointY);
        ctx.lineTo(originX, pointY);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Update displays
        const resistance = voltage !== 0 ? Math.abs(voltage / current) : 0;
        document.getElementById('filamentVDisplay').textContent = voltage.toFixed(1);
        document.getElementById('filamentIDisplay').textContent = current.toFixed(3);
        document.getElementById('filamentRDisplay').textContent = resistance.toFixed(1);
        
        // Temperature indicator
        const temp = absV < 1 ? 'Cool' : absV < 3 ? 'Warm' : absV < 5 ? 'Hot' : 'Very Hot';
        document.getElementById('filamentTempDisplay').textContent = temp;
    }
    
    // Title and notes
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• Curved line (non-ohmic)', margin, height - 40);
    ctx.fillText('• Symmetric about origin', margin, height - 25);
    ctx.fillText('• Gradient decreases as |V| increases', margin, height - 10);
}

function updateFilamentGraph() {
    drawFilamentIVGraph();
}

function animateFilamentIVGraph() {
    AnimationState.graphs.filament.animating = true;
    AnimationState.graphs.filament.progress = -6;
    
    function animate() {
        if (!AnimationState.graphs.filament.animating) return;
        
        const slider = document.getElementById('filamentVoltageSlider');
        if (slider) {
            slider.value = AnimationState.graphs.filament.progress;
            document.getElementById('filamentVoltage').textContent = 
                AnimationState.graphs.filament.progress.toFixed(1);
        }
        
        drawFilamentIVGraph();
        
        AnimationState.graphs.filament.progress += 0.1;
        
        if (AnimationState.graphs.filament.progress <= 6) {
            requestAnimationFrame(animate);
        } else {
            AnimationState.graphs.filament.animating = false;
        }
    }
    
    animate();
}

function resetFilamentGraph() {
    AnimationState.graphs.filament.animating = false;
    const slider = document.getElementById('filamentVoltageSlider');
    if (slider) {
        slider.value = 0;
        document.getElementById('filamentVoltage').textContent = '0';
    }
    drawFilamentIVGraph();
}

// ===== DIODE I-V GRAPH =====

function drawDiodeIVGraph() {
    const canvasData = getCanvas('diodeIVCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    // Special axes for diode (asymmetric)
    const margin = 60;
    const originX = margin + 80; // Shifted right
    const originY = height / 2 + 50; // Shifted down
    
    ctx.strokeStyle = Colors.textMuted;
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(originX, height - margin + 20);
    ctx.lineTo(originX, margin - 20);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin - 20, originY);
    ctx.lineTo(width - margin + 20, originY);
    ctx.stroke();
    
    // Arrow heads
    ctx.fillStyle = Colors.textMuted;
    ctx.beginPath();
    ctx.moveTo(originX, margin - 20);
    ctx.lineTo(originX - 5, margin - 10);
    ctx.lineTo(originX + 5, margin - 10);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(width - margin + 20, originY);
    ctx.lineTo(width - margin + 10, originY - 5);
    ctx.lineTo(width - margin + 10, originY + 5);
    ctx.closePath();
    ctx.fill();
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('I / mA', originX + 30, margin - 25);
    ctx.fillText('V / V', width - margin + 10, originY + 25);
    ctx.fillText('0', originX - 15, originY + 15);
    
    const voltage = parseFloat(document.getElementById('diodeVoltageSlider')?.value) || 0;
    
    // Scale factors
    const scaleX = (width - margin - originX - 20) / 2; // For 0 to 2V range
    const scaleXneg = (originX - margin) / 3; // For -3 to 0V range
    const scaleY = (originY - margin) / 50; // For 0 to 50mA range
    
    // Draw the characteristic curve
    ctx.strokeStyle = Colors.positive;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    // Reverse bias region (very small current)
    for (let v = -3; v < 0; v += 0.1) {
        const i = -0.01; // Very small reverse current (microamps)
        const x = originX + v * scaleXneg;
        const y = originY - i * scaleY * 1000; // Scale up for visibility
        
        if (v === -3) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    // Forward bias region
    const threshold = 0.7;
    for (let v = 0; v <= 2; v += 0.02) {
        let i;
        if (v < threshold) {
            i = 0.01 * (Math.exp(v * 5) - 1); // Small current before threshold
        } else {
            i = 5 * Math.exp((v - threshold) * 3); // Exponential after threshold
        }
        i = Math.min(i, 50); // Cap at 50mA
        
        const x = originX + v * scaleX;
        const y = originY - i * scaleY;
        ctx.lineTo(x, Math.max(y, margin));
    }
    ctx.stroke();
    
    // Draw threshold voltage indicator
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = Colors.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(originX + threshold * scaleX, originY);
    ctx.lineTo(originX + threshold * scaleX, margin);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = Colors.textMuted;
    ctx.font = '11px sans-serif';
    ctx.fillText('0.7V', originX + threshold * scaleX, originY + 15);
    ctx.fillText('(threshold)', originX + threshold * scaleX, originY + 28);
    
    // Current point
    if (voltage !== 0) {
        let current;
        if (voltage < 0) {
            current = -0.01;
        } else if (voltage < threshold) {
            current = 0.01 * (Math.exp(voltage * 5) - 1);
        } else {
            current = 5 * Math.exp((voltage - threshold) * 3);
        }
        current = Math.min(Math.max(current, -1), 50);
        
        const pointX = voltage >= 0 ? 
            originX + voltage * scaleX : 
            originX + voltage * scaleXneg;
        const pointY = originY - current * scaleY;
        
        ctx.beginPath();
        ctx.arc(pointX, Math.max(pointY, margin), 8, 0, Math.PI * 2);
        ctx.fillStyle = Colors.green;
        ctx.fill();
        
        // Update displays
        document.getElementById('diodeVDisplay').textContent = voltage.toFixed(2);
        document.getElementById('diodeIDisplay').textContent = current.toFixed(2);
        document.getElementById('diodeStateDisplay').textContent = current > 0.5 ? 'ON' : 'OFF';
        document.getElementById('diodeBiasDisplay').textContent = 
            voltage > 0 ? 'Forward' : voltage < 0 ? 'Reverse' : 'None';
    }
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Forward bias', width - margin - 60, margin + 20);
    ctx.fillText('(conducting)', width - margin - 60, margin + 35);
    
    ctx.textAlign = 'right';
    ctx.fillText('Reverse bias', originX - 20, originY - 20);
    ctx.fillText('(blocking)', originX - 20, originY - 5);
}

function updateDiodeGraph() {
    drawDiodeIVGraph();
}

function animateDiodeIVGraph() {
    AnimationState.graphs.diode.animating = true;
    AnimationState.graphs.diode.progress = -3;
    
    function animate() {
        if (!AnimationState.graphs.diode.animating) return;
        
        const slider = document.getElementById('diodeVoltageSlider');
        if (slider) {
            slider.value = AnimationState.graphs.diode.progress;
            document.getElementById('diodeVoltage').textContent = 
                AnimationState.graphs.diode.progress.toFixed(1);
        }
        
        drawDiodeIVGraph();
        
        AnimationState.graphs.diode.progress += 0.05;
        
        if (AnimationState.graphs.diode.progress <= 2) {
            requestAnimationFrame(animate);
        } else {
            AnimationState.graphs.diode.animating = false;
        }
    }
    
    animate();
}

function resetDiodeGraph() {
    AnimationState.graphs.diode.animating = false;
    const slider = document.getElementById('diodeVoltageSlider');
    if (slider) {
        slider.value = 0;
        document.getElementById('diodeVoltage').textContent = '0';
    }
    drawDiodeIVGraph();
}

// ===== THERMISTOR R-T GRAPH =====

function drawThermistorGraph() {
    const canvasData = getCanvas('thermistorGraphCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const margin = 60;
    
    // Axes (R vs T)
    ctx.strokeStyle = Colors.textMuted;
    ctx.lineWidth = 2;
    
    // Y-axis (Resistance)
    drawArrow(ctx, margin, height - margin, margin, margin - 10, { color: Colors.textMuted });
    
    // X-axis (Temperature)
    drawArrow(ctx, margin, height - margin, width - margin + 10, height - margin, { color: Colors.textMuted });
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R / kΩ', margin, margin - 25);
    ctx.fillText('T / °C', width - margin, height - margin + 25);
    ctx.fillText('0', margin - 15, height - margin + 15);
    
    // Scale markers
    ctx.font = '10px sans-serif';
    ctx.fillText('100', width - margin, height - margin + 15);
    ctx.fillText('50', margin - 25, margin + (height - 2 * margin) / 2);
    
    const temperature = parseFloat(document.getElementById('thermistorTempSlider')?.value) || 25;
    
    // Graph dimensions
    const graphWidth = width - 2 * margin;
    const graphHeight = height - 2 * margin;
    
    // Draw NTC thermistor curve (R decreases as T increases)
    ctx.strokeStyle = Colors.purple;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const R25 = 10; // 10kΩ at 25°C
    const B = 3950;
    const maxR = 50; // Max R for display
    
    for (let t = 0; t <= 100; t += 1) {
        const T = t + 273.15;
        const T25 = 298.15;
        const R = R25 * Math.exp(B * (1/T - 1/T25));
        
        const x = margin + (t / 100) * graphWidth;
        const y = height - margin - (Math.min(R, maxR) / maxR) * graphHeight;
        
        if (t === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Current point
    const T = temperature + 273.15;
    const T25 = 298.15;
    const R = R25 * Math.exp(B * (1/T - 1/T25));
    
    const pointX = margin + (temperature / 100) * graphWidth;
    const pointY = height - margin - (Math.min(R, maxR) / maxR) * graphHeight;
    
    ctx.beginPath();
    ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
    ctx.fillStyle = Colors.orange;
    ctx.fill();
    
    // Dotted lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = Colors.orange;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(pointX, height - margin);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(margin, pointY);
    ctx.lineTo(pointX, pointY);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Update displays
    document.getElementById('thermTempDisplay').textContent = temperature;
    document.getElementById('thermRDisplay').textContent = R.toFixed(1);
    
    const condition = temperature < 20 ? 'Cold' : temperature < 40 ? 'Room Temp' : 
                     temperature < 60 ? 'Warm' : 'Hot';
    document.getElementById('thermCondDisplay').textContent = condition;
    
    // Note
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NTC: Resistance ↓ as Temperature ↑', margin, height - 15);
}

function updateThermistorGraph() {
    drawThermistorGraph();
}

function animateThermistorGraph() {
    AnimationState.graphs.thermistor.animating = true;
    AnimationState.graphs.thermistor.progress = 0;
    
    function animate() {
        if (!AnimationState.graphs.thermistor.animating) return;
        
        const slider = document.getElementById('thermistorTempSlider');
        if (slider) {
            slider.value = AnimationState.graphs.thermistor.progress;
            document.getElementById('thermistorTemp').textContent = 
                AnimationState.graphs.thermistor.progress;
        }
        
        drawThermistorGraph();
        
        AnimationState.graphs.thermistor.progress += 1;
        
        if (AnimationState.graphs.thermistor.progress <= 100) {
            requestAnimationFrame(animate);
        } else {
            AnimationState.graphs.thermistor.animating = false;
        }
    }
    
    animate();
}

// ===== LDR R-Light GRAPH =====

function drawLDRGraph() {
    const canvasData = getCanvas('ldrGraphCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const margin = 60;
    
    // Axes (R vs Light Intensity)
    ctx.strokeStyle = Colors.textMuted;
    ctx.lineWidth = 2;
    
    // Y-axis (Resistance)
    drawArrow(ctx, margin, height - margin, margin, margin - 10, { color: Colors.textMuted });
    
    // X-axis (Light)
    drawArrow(ctx, margin, height - margin, width - margin + 10, height - margin, { color: Colors.textMuted });
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R / kΩ', margin, margin - 25);
    ctx.fillText('Light Intensity', width - margin - 20, height - margin + 25);
    
    // Dark/Bright labels
    ctx.font = '10px sans-serif';
    ctx.fillText('Dark', margin + 30, height - margin + 15);
    ctx.fillText('Bright', width - margin - 30, height - margin + 15);
    ctx.fillText('High', margin - 20, margin + 20);
    ctx.fillText('Low', margin - 20, height - margin - 20);
    
    const intensity = parseFloat(document.getElementById('ldrIntensitySlider')?.value) || 50;
    
    // Graph dimensions
    const graphWidth = width - 2 * margin;
    const graphHeight = height - 2 * margin;
    
    // Draw LDR curve (R decreases as light increases)
    ctx.strokeStyle = Colors.orange;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const Rdark = 100; // 100kΩ in darkness
    const gamma = 0.8;
    const maxR = 100;
    
    for (let l = 1; l <= 100; l += 1) {
        const R = Rdark * Math.pow(l / 100, -gamma);
        const clampedR = Math.min(R, maxR);
        
        const x = margin + (l / 100) * graphWidth;
        const y = height - margin - (clampedR / maxR) * graphHeight;
        
        if (l === 1) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Current point
    let R;
    if (intensity <= 0) {
        R = Rdark;
    } else {
        R = Rdark * Math.pow(intensity / 100, -gamma);
    }
    R = Math.min(R, maxR);
    
    const pointX = margin + (Math.max(intensity, 1) / 100) * graphWidth;
    const pointY = height - margin - (R / maxR) * graphHeight;
    
    ctx.beginPath();
    ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
    ctx.fillStyle = Colors.green;
    ctx.fill();
    
    // Update displays
    document.getElementById('ldrIntDisplay').textContent = intensity;
    document.getElementById('ldrRDisplay').textContent = R.toFixed(1);
    
    const condition = intensity < 20 ? 'Dark' : intensity < 50 ? 'Dim' : 
                     intensity < 80 ? 'Medium Light' : 'Bright';
    document.getElementById('ldrCondDisplay').textContent = condition;
    
    // Note
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LDR: Resistance ↓ as Light ↑', margin, height - 15);
}

function updateLDRGraph() {
    drawLDRGraph();
}

function animateLDRGraph() {
    AnimationState.graphs.ldr.animating = true;
    AnimationState.graphs.ldr.progress = 0;
    
    function animate() {
        if (!AnimationState.graphs.ldr.animating) return;
        
        const slider = document.getElementById('ldrIntensitySlider');
        if (slider) {
            slider.value = AnimationState.graphs.ldr.progress;
            document.getElementById('ldrIntensity').textContent = 
                AnimationState.graphs.ldr.progress;
        }
        
        drawLDRGraph();
        
        AnimationState.graphs.ldr.progress += 1;
        
        if (AnimationState.graphs.ldr.progress <= 100) {
            requestAnimationFrame(animate);
        } else {
            AnimationState.graphs.ldr.animating = false;
        }
    }
    
    animate();
}

// ===== COMPARE ALL GRAPHS =====

function drawCompareAllGraph() {
    const canvasData = getCanvas('compareAllCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const margin = 60;
    const originX = width / 2;
    const originY = height / 2;
    
    // Draw axes
    ctx.strokeStyle = Colors.textMuted;
    ctx.lineWidth = 2;
    
    // Y-axis
    drawArrow(ctx, originX, height - margin, originX, margin - 10, { color: Colors.textMuted });
    
    // X-axis
    drawArrow(ctx, margin, originY, width - margin + 10, originY, { color: Colors.textMuted });
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('I', originX + 20, margin - 15);
    ctx.fillText('V', width - margin + 10, originY + 25);
    ctx.fillText('0', originX - 15, originY + 15);
    
    const graphWidth = (width - 2 * margin) / 2 - 20;
    const graphHeight = (height - 2 * margin) / 2 - 20;
    
    // 1. Ohmic conductor (straight line) - GREEN
    ctx.strokeStyle = Colors.green;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX - graphWidth, originY + graphHeight);
    ctx.lineTo(originX + graphWidth, originY - graphHeight);
    ctx.stroke();
    
    // 2. Filament lamp (curved, symmetric) - ORANGE
    ctx.strokeStyle = Colors.orange;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let v = -6; v <= 6; v += 0.1) {
        const sign = v >= 0 ? 1 : -1;
        const absV = Math.abs(v);
        const i = sign * 0.15 * absV / Math.sqrt(1 + Math.pow(absV / 3, 2));
        
        const x = originX + (v / 6) * graphWidth;
        const y = originY - (i / 0.6) * graphHeight;
        
        if (v === -6) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // 3. Diode (asymmetric) - RED
    ctx.strokeStyle = Colors.positive;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    // Reverse (flat near zero)
    ctx.moveTo(originX - graphWidth, originY + 5);
    ctx.lineTo(originX - graphWidth * 0.2, originY);
    
    // Forward (exponential)
    for (let v = 0; v <= 1.5; v += 0.05) {
        const i = v < 0.7 ? 0.02 * v : 0.3 * Math.exp((v - 0.7) * 3);
        const clampedI = Math.min(i, 0.8);
        
        const x = originX + (v / 1.5) * graphWidth * 0.5;
        const y = originY - (clampedI / 0.8) * graphHeight;
        ctx.lineTo(x, Math.max(y, originY - graphHeight));
    }
    ctx.stroke();
    
    // Legend
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    // Green - Ohmic
    ctx.fillStyle = Colors.green;
    ctx.fillRect(width - margin - 130, margin + 10, 20, 3);
    ctx.fillText('Ohmic conductor', width - margin - 105, margin + 15);
    
    // Orange - Filament
    ctx.fillStyle = Colors.orange;
    ctx.fillRect(width - margin - 130, margin + 30, 20, 3);
    ctx.fillText('Filament lamp', width - margin - 105, margin + 35);
    
    // Red - Diode
    ctx.fillStyle = Colors.positive;
    ctx.fillRect(width - margin - 130, margin + 50, 20, 3);
    ctx.fillText('Diode', width - margin - 105, margin + 55);
}

// ===== THERMISTOR DEMO ANIMATION =====

function drawThermistorDemo() {
    const canvasData = getCanvas('thermistorDemoCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const temp = parseFloat(document.getElementById('thermistorTempSlider')?.value) || 25;
    
    // Draw thermistor symbol
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Symbol
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - 30, centerY - 15, 60, 30);
    
    // Diagonal line with T
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY + 25);
    ctx.lineTo(centerX + 40, centerY - 25);
    ctx.stroke();
    
    ctx.fillStyle = Colors.wire;
    ctx.font = '12px sans-serif';
    ctx.fillText('T', centerX + 45, centerY - 25);
    
    // Temperature indicator (thermometer)
    const thermX = 100;
    const thermHeight = 150;
    const fillHeight = (temp / 100) * thermHeight;
    
    // Bulb
    ctx.beginPath();
    ctx.arc(thermX, height - 50, 15, 0, Math.PI * 2);
    ctx.fillStyle = temp > 50 ? '#ef4444' : temp > 25 ? '#f59e0b' : '#3b82f6';
    ctx.fill();
    
    // Tube
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(thermX - 5, height - 50 - thermHeight, 10, thermHeight);
    
    // Fill
    ctx.fillStyle = temp > 50 ? '#ef4444' : temp > 25 ? '#f59e0b' : '#3b82f6';
    ctx.fillRect(thermX - 3, height - 50 - fillHeight, 6, fillHeight);
    
    // Temperature label
    ctx.fillStyle = Colors.text;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${temp}°C`, thermX, height - 20);
    
    // Resistance display
    const R25 = 10;
    const B = 3950;
    const T = temp + 273.15;
    const T25 = 298.15;
    const R = R25 * Math.exp(B * (1/T - 1/T25));
    
    ctx.fillStyle = Colors.text;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`R = ${R.toFixed(1)} kΩ`, width - 120, centerY);
    
    // Arrow showing relationship
    ctx.fillStyle = temp > 25 ? Colors.positive : Colors.negative;
    ctx.font = '14px sans-serif';
    if (temp > 25) {
        ctx.fillText('↑ Temp → ↓ R', centerX, height - 30);
    } else {
        ctx.fillText('↓ Temp → ↑ R', centerX, height - 30);
    }
}

function animateThermistorHeating() {
    let temp = parseFloat(document.getElementById('thermistorTempSlider')?.value) || 25;
    
    function heat() {
        if (temp >= 100) return;
        
        temp += 2;
        const slider = document.getElementById('thermistorTempSlider');
        if (slider) {
            slider.value = temp;
            document.getElementById('thermistorTemp').textContent = temp;
        }
        
        drawThermistorGraph();
        drawThermistorDemo();
        
        if (temp < 100) {
            requestAnimationFrame(heat);
        }
    }
    
    heat();
}

function animateThermistorCooling() {
    let temp = parseFloat(document.getElementById('thermistorTempSlider')?.value) || 25;
    
    function cool() {
        if (temp <= 0) return;
        
        temp -= 2;
        const slider = document.getElementById('thermistorTempSlider');
        if (slider) {
            slider.value = temp;
            document.getElementById('thermistorTemp').textContent = temp;
        }
        
        drawThermistorGraph();
        drawThermistorDemo();
        
        if (temp > 0) {
            requestAnimationFrame(cool);
        }
    }
    
    cool();
}

// Export Part B functions
window.drawFilamentIVGraph = drawFilamentIVGraph;
window.updateFilamentGraph = updateFilamentGraph;
window.animateFilamentIVGraph = animateFilamentIVGraph;
window.resetFilamentGraph = resetFilamentGraph;

window.drawDiodeIVGraph = drawDiodeIVGraph;
window.updateDiodeGraph = updateDiodeGraph;
window.animateDiodeIVGraph = animateDiodeIVGraph;
window.resetDiodeGraph = resetDiodeGraph;

window.drawThermistorGraph = drawThermistorGraph;
window.updateThermistorGraph = updateThermistorGraph;
window.animateThermistorGraph = animateThermistorGraph;
window.animateThermistorHeating = animateThermistorHeating;
window.animateThermistorCooling = animateThermistorCooling;

window.drawLDRGraph = drawLDRGraph;
window.updateLDRGraph = updateLDRGraph;
window.animateLDRGraph = animateLDRGraph;

window.drawCompareAllGraph = drawCompareAllGraph;

console.log('⚡ Animations Part B loaded');

// ========================================
// Animation & Physics Engine
// Part 10C: DC Circuits, Practical & Safety
// ========================================

// ===== SERIES CIRCUIT =====

function drawSeriesCircuit() {
    const canvasData = getCanvas('seriesInteractiveCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const emf = parseFloat(document.getElementById('seriesEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('seriesR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('seriesR2Slider')?.value) || 20;
    
    const current = emf / (r1 + r2);
    const v1 = current * r1;
    const v2 = current * r2;
    
    const margin = 50;
    
    // Draw circuit
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    
    // Top wire
    drawWire(ctx, margin, margin + 50, width - margin, margin + 50);
    
    // Right wire
    drawWire(ctx, width - margin, margin + 50, width - margin, height - margin - 50);
    
    // Bottom wire
    drawWire(ctx, width - margin, height - margin - 50, margin, height - margin - 50);
    
    // Left wire
    drawWire(ctx, margin, height - margin - 50, margin, margin + 50);
    
    // Battery
    drawBatterySymbol(ctx, margin + 70, margin + 50, 3);
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${emf}V`, margin + 70, margin + 85);
    
    // Resistor 1
    drawResistorSymbol(ctx, width / 2 - 50, margin + 50, { label: 'R₁', value: `${r1}Ω` });
    ctx.fillStyle = Colors.green;
    ctx.font = '12px sans-serif';
    ctx.fillText(`V₁=${v1.toFixed(1)}V`, width / 2 - 50, margin + 90);
    
    // Resistor 2
    drawResistorSymbol(ctx, width / 2 + 80, margin + 50, { label: 'R₂', value: `${r2}Ω` });
    ctx.fillStyle = Colors.green;
    ctx.fillText(`V₂=${v2.toFixed(1)}V`, width / 2 + 80, margin + 90);
    
    // Current animation
    if (AnimationState.series.running) {
        const offset = AnimationState.series.offset;
        
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -offset;
        ctx.strokeStyle = Colors.wireGlow;
        ctx.lineWidth = 4;
        
        // Draw animated current path
        ctx.beginPath();
        ctx.moveTo(margin + 120, margin + 50);
        ctx.lineTo(width - margin, margin + 50);
        ctx.lineTo(width - margin, height - margin - 50);
        ctx.lineTo(margin, height - margin - 50);
        ctx.lineTo(margin, margin + 70);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
    
    // Current label
    ctx.fillStyle = Colors.conventionalCurrent;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`I = ${current.toFixed(2)} A`, width / 2, height - margin - 20);
    
    // Same current indicator
    drawArrow(ctx, margin + 30, height - margin - 50, margin + 80, height - margin - 50, {
        color: Colors.conventionalCurrent
    });
    ctx.fillStyle = Colors.conventionalCurrent;
    ctx.font = '12px sans-serif';
    ctx.fillText('Same I', margin + 55, height - margin - 70);
}

function startSeriesAnimation() {
    AnimationState.series.running = true;
    animateSeries();
}

function stopSeriesAnimation() {
    AnimationState.series.running = false;
    if (AnimationState.series.animationId) {
        cancelAnimationFrame(AnimationState.series.animationId);
    }
    drawSeriesCircuit();
}

function animateSeries() {
    if (!AnimationState.series.running) return;
    
    AnimationState.series.offset += 2;
    drawSeriesCircuit();
    
    AnimationState.series.animationId = requestAnimationFrame(animateSeries);
}

// ===== PARALLEL CIRCUIT =====

function drawParallelCircuit() {
    const canvasData = getCanvas('parallelInteractiveCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const emf = parseFloat(document.getElementById('parallelEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('parallelR1Slider')?.value) || 20;
    const r2 = parseFloat(document.getElementById('parallelR2Slider')?.value) || 30;
    
    const i1 = emf / r1;
    const i2 = emf / r2;
    const totalI = i1 + i2;
    
    const margin = 50;
    const branchY1 = 100;
    const branchY2 = 200;
    
    // Draw circuit
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    
    // Left side - battery
    drawWire(ctx, margin, height / 2, margin + 80, height / 2);
    drawBatterySymbol(ctx, margin + 80, height / 2, 3);
    
    // Junction to branches
    drawWire(ctx, margin + 130, height / 2, margin + 200, height / 2);
    drawWire(ctx, margin + 200, height / 2, margin + 200, branchY1);
    drawWire(ctx, margin + 200, height / 2, margin + 200, branchY2);
    
    // Top branch with R1
    drawWire(ctx, margin + 200, branchY1, width - margin - 200, branchY1);
    drawResistorSymbol(ctx, width / 2, branchY1, { label: 'R₁', value: `${r1}Ω` });
    
    // Bottom branch with R2
    drawWire(ctx, margin + 200, branchY2, width - margin - 200, branchY2);
    drawResistorSymbol(ctx, width / 2, branchY2, { label: 'R₂', value: `${r2}Ω` });
    
    // Right junction
    drawWire(ctx, width - margin - 200, branchY1, width - margin - 200, height / 2);
    drawWire(ctx, width - margin - 200, branchY2, width - margin - 200, height / 2);
    drawWire(ctx, width - margin - 200, height / 2, width - margin, height / 2);
    
    // Return wire
    drawWire(ctx, width - margin, height / 2, width - margin, height - 40);
    drawWire(ctx, width - margin, height - 40, margin, height - 40);
    drawWire(ctx, margin, height - 40, margin, height / 2);
    
    // Junction dots
    ctx.fillStyle = Colors.wire;
    ctx.beginPath();
    ctx.arc(margin + 200, height / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width - margin - 200, height / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Current labels
    ctx.fillStyle = Colors.positive;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`I₁ = ${i1.toFixed(2)}A`, width / 2, branchY1 - 20);
    ctx.fillText(`I₂ = ${i2.toFixed(2)}A`, width / 2, branchY2 + 35);
    
    // Total current
    ctx.fillStyle = Colors.conventionalCurrent;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`I_total = ${totalI.toFixed(2)}A`, width / 2, height - 20);
    
    // Voltage label
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.fillText(`V = ${emf}V`, margin + 80, height / 2 + 35);
    ctx.fillText('(same across both)', margin + 80, height / 2 + 50);
    
    // Animation
    if (AnimationState.parallel.running) {
        const offset = AnimationState.parallel.offset;
        
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -offset;
        ctx.strokeStyle = Colors.wireGlow;
        ctx.lineWidth = 4;
        
        // Animate both branches
        ctx.beginPath();
        ctx.moveTo(margin + 220, branchY1);
        ctx.lineTo(width / 2 - 35, branchY1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(margin + 220, branchY2);
        ctx.lineTo(width / 2 - 35, branchY2);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
}

function startParallelAnimation() {
    AnimationState.parallel.running = true;
    animateParallel();
}

function stopParallelAnimation() {
    AnimationState.parallel.running = false;
    if (AnimationState.parallel.animationId) {
        cancelAnimationFrame(AnimationState.parallel.animationId);
    }
    drawParallelCircuit();
}

function animateParallel() {
    if (!AnimationState.parallel.running) return;
    
    AnimationState.parallel.offset += 2;
    drawParallelCircuit();
    
    AnimationState.parallel.animationId = requestAnimationFrame(animateParallel);
}

// ===== POTENTIAL DIVIDER =====

function drawPotentialDivider() {
    const canvasData = getCanvas('dividerInteractiveCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const vin = parseFloat(document.getElementById('dividerVinSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('dividerR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('dividerR2Slider')?.value) || 10;
    
    const vout = vin * r2 / (r1 + r2);
    const vr1 = vin - vout;
    const current = vin / (r1 + r2);
    
    const centerX = width / 2;
    const margin = 30;
    
    // Draw vertical circuit
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    
    // Top (Vin)
    ctx.fillStyle = Colors.positive;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Vin = ${vin}V`, centerX, margin);
    ctx.fillText('+', centerX - 30, margin + 25);
    
    // Wire from top
    drawWire(ctx, centerX, margin + 30, centerX, margin + 60);
    
    // R1
    drawResistorSymbol(ctx, centerX, margin + 100, { 
        scale: 1,
        label: 'R₁',
        value: `${r1}kΩ`
    });
    
    // Wire between resistors
    drawWire(ctx, centerX, margin + 140, centerX, margin + 180);
    
    // Vout tap point
    ctx.fillStyle = Colors.green;
    ctx.beginPath();
    ctx.arc(centerX, margin + 160, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Vout label and wire
    drawWire(ctx, centerX, margin + 160, centerX + 80, margin + 160);
    ctx.fillStyle = Colors.green;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Vout = ${vout.toFixed(2)}V`, centerX + 90, margin + 165);
    
    // R2
    drawResistorSymbol(ctx, centerX, margin + 220, {
        scale: 1,
        label: 'R₂',
        value: `${r2}kΩ`
    });
    
    // Wire to ground
    drawWire(ctx, centerX, margin + 260, centerX, margin + 290);
    
    // Ground symbol
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 15, margin + 290);
    ctx.lineTo(centerX + 15, margin + 290);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - 10, margin + 297);
    ctx.lineTo(centerX + 10, margin + 297);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - 5, margin + 304);
    ctx.lineTo(centerX + 5, margin + 304);
    ctx.stroke();
    
    ctx.fillStyle = Colors.negative;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0V', centerX, margin + 325);
    
    // Voltage drops
    ctx.fillStyle = Colors.orange;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`VR₁ = ${vr1.toFixed(2)}V`, centerX - 50, margin + 100);
    ctx.fillText(`VR₂ = ${vout.toFixed(2)}V`, centerX - 50, margin + 220);
    
    // Current
    drawArrow(ctx, centerX + 25, margin + 80, centerX + 25, margin + 120, {
        color: Colors.conventionalCurrent,
        headLength: 8
    });
    ctx.fillStyle = Colors.conventionalCurrent;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`I=${current.toFixed(2)}mA`, centerX + 30, margin + 100);
}

// ===== POWER TRIANGLES =====

function drawPowerTriangles() {
    const canvases = [
        { id: 'pviTriangleCanvas', labels: ['P', 'V', 'I'] },
        { id: 'pirTriangleCanvas', labels: ['P', 'I²', 'R'] },
        { id: 'pvrTriangleCanvas', labels: ['P', 'V²', 'R'] }
    ];
    
    canvases.forEach(({ id, labels }) => {
        const canvasData = getCanvas(id);
        if (!canvasData) return;
        
        const { ctx, width, height } = canvasData;
        clearCanvas(ctx, width, height);
        
        const centerX = width / 2;
        const topY = 15;
        const bottomY = height - 25;
        const triWidth = 100;
        
        // Triangle
        ctx.strokeStyle = Colors.wire;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(centerX - triWidth / 2, bottomY);
        ctx.lineTo(centerX + triWidth / 2, bottomY);
        ctx.closePath();
        ctx.stroke();
        
        // Divider
        ctx.beginPath();
        ctx.moveTo(centerX - triWidth / 3, (topY + bottomY) / 2 + 8);
        ctx.lineTo(centerX + triWidth / 3, (topY + bottomY) / 2 + 8);
        ctx.stroke();
        
        // Labels
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillStyle = Colors.orange;
        ctx.fillText(labels[0], centerX, topY + 25);
        
        ctx.fillStyle = Colors.green;
        ctx.fillText(labels[1], centerX - 25, bottomY - 18);
        
        ctx.fillStyle = Colors.purple;
        ctx.fillText(labels[2], centerX + 25, bottomY - 18);
    });
}

// ===== ENERGY METER =====

function drawEnergyMeter() {
    const canvasData = getCanvas('energyMeterCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const power = parseFloat(document.getElementById('energyPowerSlider')?.value) || 1500;
    const time = parseFloat(document.getElementById('energyTimeSlider')?.value) || 2;
    const energy = (power / 1000) * time;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Meter body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(centerX - 100, centerY - 120, 200, 180, 15);
    ctx.fill();
    ctx.stroke();
    
    // Display
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(centerX - 80, centerY - 100, 160, 60);
    
    // Reading
    ctx.fillStyle = Colors.green;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(energy.toFixed(1), centerX, centerY - 60);
    
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.fillText('kWh', centerX, centerY - 35);
    
    // Spinning disc indicator
    const rotation = (Date.now() / 100) % 360;
    ctx.save();
    ctx.translate(centerX, centerY + 20);
    ctx.rotate(rotation * Math.PI / 180 * (power / 1000));
    
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = Colors.positive;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 25, -0.2, 0.2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Label
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Energy Meter', centerX, centerY + 70);
}

// ===== DANGER DEMO =====

function drawDangerDemo() {
    const canvasData = getCanvas('dangerDemoCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    // Default: draw short circuit scenario
    drawShortCircuitDemo(ctx, width, height);
}

function updateDangerDemo(scenario) {
    const canvasData = getCanvas('dangerDemoCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    switch(scenario) {
        case 'short-circuit':
            drawShortCircuitDemo(ctx, width, height);
            break;
        case 'overload':
            drawOverloadDemo(ctx, width, height);
            break;
        case 'damaged-wire':
            drawDamagedWireDemo(ctx, width, height);
            break;
        case 'water':
            drawWaterDangerDemo(ctx, width, height);
            break;
    }
}

function drawShortCircuitDemo(ctx, width, height) {
    const centerY = height / 2;
    
    // Circuit with short
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    
    // Battery
    drawBatterySymbol(ctx, 100, centerY);
    
    // Wires to short
    drawWire(ctx, 150, centerY, 300, centerY);
    drawWire(ctx, 400, centerY, 600, centerY);
    drawWire(ctx, 600, centerY, 600, centerY + 80);
    drawWire(ctx, 600, centerY + 80, 100, centerY + 80);
    drawWire(ctx, 100, centerY + 80, 100, centerY);
    
    // Normal resistor (bypassed)
    ctx.globalAlpha = 0.3;
    drawResistorSymbol(ctx, 350, centerY - 60);
    ctx.globalAlpha = 1;
    
    // Short circuit path
    ctx.strokeStyle = Colors.positive;
    ctx.lineWidth = 5;
    drawWire(ctx, 300, centerY, 400, centerY, { color: Colors.positive });
    
    // Sparks
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const sparkX = 350 + Math.cos(angle) * 20;
        const sparkY = centerY + Math.sin(angle) * 15;
        
        ctx.beginPath();
        ctx.moveTo(350, centerY);
        ctx.lineTo(sparkX, sparkY);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Labels
    ctx.fillStyle = Colors.positive;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHORT CIRCUIT!', 350, centerY + 40);
    
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.fillText('R ≈ 0 → I = V/R → Very High!', 350, centerY + 60);
    ctx.fillText('Extreme heat, fire risk!', 350, centerY + 80);
}

function drawOverloadDemo(ctx, width, height) {
    const socketY = height / 2;
    
    // Socket
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, socketY - 40, 100, 80, 10);
    ctx.fill();
    ctx.stroke();
    
    // Socket holes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(100, socketY - 25, 15, 25);
    ctx.fillRect(145, socketY - 25, 15, 25);
    ctx.fillRect(122, socketY + 5, 15, 20);
    
    // Multiple plugs/extension
    const appliances = [
        { x: 250, name: 'Kettle', current: '8.7A', icon: '🫖' },
        { x: 350, name: 'Heater', current: '4.3A', icon: '🔥' },
        { x: 450, name: 'Aircon', current: '6.5A', icon: '❄️' },
        { x: 550, name: 'Iron', current: '4.8A', icon: '👔' }
    ];
    
    // Wires from socket
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 3;
    drawWire(ctx, 180, socketY, 220, socketY);
    
    // Branch out
    appliances.forEach((app, i) => {
        drawWire(ctx, 220, socketY, app.x, socketY - 60 + i * 40);
        
        // Appliance box
        ctx.fillStyle = '#334155';
        ctx.fillRect(app.x - 30, socketY - 90 + i * 40, 60, 50);
        
        ctx.fillStyle = Colors.text;
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(app.icon, app.x, socketY - 60 + i * 40);
        
        ctx.font = '10px sans-serif';
        ctx.fillText(app.current, app.x, socketY - 35 + i * 40);
    });
    
    // Total current
    const totalCurrent = 8.7 + 4.3 + 6.5 + 4.8;
    ctx.fillStyle = Colors.positive;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Total: ${totalCurrent.toFixed(1)}A`, width / 2, height - 60);
    ctx.fillText('> 13A fuse rating!', width / 2, height - 40);
    
    // Warning
    ctx.fillStyle = '#fbbf24';
    ctx.font = '14px sans-serif';
    ctx.fillText('⚠️ OVERLOAD - Fire Risk!', width / 2, height - 15);
}

function drawDamagedWireDemo(ctx, width, height) {
    const centerY = height / 2;
    
    // Wire with damaged section
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 8;
    drawWire(ctx, 100, centerY, 280, centerY);
    drawWire(ctx, 420, centerY, 600, centerY);
    
    // Damaged section
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    
    // Exposed wires
    for (let x = 290; x < 410; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, centerY - 5);
        ctx.bezierCurveTo(x + 5, centerY - 15, x + 10, centerY + 15, x + 15, centerY + 5);
        ctx.stroke();
    }
    
    // Insulation torn
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(280, centerY - 10, 140, 20);
    
    ctx.fillStyle = '#b45309';
    ctx.fillRect(280, centerY - 5, 10, 10);
    ctx.fillRect(410, centerY - 5, 10, 10);
    
    // Spark/danger indicator
    ctx.fillStyle = '#fbbf24';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 350, centerY - 30);
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '14px sans-serif';
    ctx.fillText('Damaged Insulation', 350, centerY + 50);
    ctx.fillText('→ Exposed live wires', 350, centerY + 70);
    ctx.fillText('→ Shock & short circuit risk', 350, centerY + 90);
}

function drawWaterDangerDemo(ctx, width, height) {
    const centerY = height / 2;
    
    // Electrical appliance
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, centerY - 50, 120, 80, 10);
    ctx.fill();
    ctx.stroke();
    
    // Power cord
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 4;
    drawWire(ctx, 220, centerY, 280, centerY);
    
    // Water droplets
    ctx.fillStyle = '#3b82f6';
    for (let i = 0; i < 8; i++) {
        const x = 300 + Math.random() * 200;
        const y = 50 + Math.random() * (height - 100);
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Drip shape
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.quadraticCurveTo(x + 8, y, x, y + 8);
        ctx.quadraticCurveTo(x - 8, y, x, y - 12);
        ctx.fill();
    }
    
    // Hand reaching
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(500, centerY, 40, 25, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Danger zone
    ctx.strokeStyle = Colors.positive;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(350, centerY, 100, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Labels
    ctx.fillStyle = Colors.positive;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DANGER ZONE', 350, centerY + 130);
    
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.fillText('Water conducts electricity!', 350, centerY + 150);
    ctx.fillText('Never touch with wet hands', 350, centerY + 170);
}

// ===== SAFETY DIAGRAMS =====

function drawSafetyDiagrams() {
    drawFuseDiagram();
    drawEarthingDemo();
    drawPlugDiagram();
}

function drawFuseDiagram() {
    const canvasData = getCanvas('fuseDiagramCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const centerY = height / 2;
    
    // Fuse casing
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, centerY - 15, 200, 30, 5);
    ctx.fill();
    ctx.stroke();
    
    // Metal caps
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(100, centerY - 10, 30, 20);
    ctx.fillRect(270, centerY - 10, 30, 20);
    
    // Fuse wire
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(130, centerY);
    ctx.lineTo(270, centerY);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Thin wire (low melting point)', 200, centerY + 40);
    ctx.fillText('Melts when current too high', 200, centerY + 55);
    
    // Rating
    ctx.fillStyle = Colors.orange;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('13A', 200, centerY - 25);
}

function drawMCBDiagram() {
    const canvasData = getCanvas('mcbDiagramCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    // MCB body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.fillRect(150, 30, 100, 120);
    ctx.strokeRect(150, 30, 100, 120);
    
    // Switch
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(180, 50, 40, 30);
    
    // Label
    ctx.fillStyle = Colors.text;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ON', 200, 70);
    
    // Rating label
    ctx.fillStyle = Colors.text;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('32A', 200, 120);
    
    ctx.font = '12px sans-serif';
    ctx.fillText('Circuit Breaker', 200, height - 20);
    ctx.fillText('(Reusable)', 200, height - 5);
}

function drawEarthingDemo() {
    const canvasData = getCanvas('earthingDemoCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    // Appliance with metal casing
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = Colors.wire;
    ctx.lineWidth = 2;
    ctx.fillRect(250, 80, 200, 150);
    ctx.strokeRect(250, 80, 200, 150);
    
    // Label
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Metal Casing', 350, 160);
    
    // Wires entering
    // Live (brown)
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    drawWire(ctx, 100, 100, 250, 100);
    ctx.fillStyle = '#92400e';
    ctx.font = '10px sans-serif';
    ctx.fillText('L', 90, 100);
    
    // Neutral (blue)  
    ctx.strokeStyle = '#3b82f6';
    drawWire(ctx, 100, 130, 250, 130);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('N', 90, 130);
    
    // Earth (green-yellow to casing)
    ctx.strokeStyle = '#22c55e';
    drawWire(ctx, 100, 160, 250, 160);
    drawWire(ctx, 250, 160, 250, 230);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('E', 90, 160);
    
    // Earth wire going to ground
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    drawWire(ctx, 250, 230, 250, height - 40);
    
    // Ground symbol
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
        const y = height - 40 + i * 8;
        const halfWidth = 20 - i * 5;
        ctx.beginPath();
        ctx.moveTo(250 - halfWidth, y);
        ctx.lineTo(250 + halfWidth, y);
        ctx.stroke();
    }
    
    // Explanation
    ctx.fillStyle = Colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Earth wire connected', 470, 160);
    ctx.fillText('to metal casing', 470, 175);
    ctx.fillText('If fault: current flows', 470, 200);
    ctx.fillText('safely to ground', 470, 215);
}

function showEarthingState(state) {
    const canvasData = getCanvas('earthingDemoCanvas');
    if (!canvasData) return;
    
    // Redraw with different state
    drawEarthingDemo();
    
    const { ctx, width, height } = canvasData;
    const explanationDiv = document.getElementById('earthingExplanation');
    
    if (state === 'fault') {
        // Draw fault current path
        ctx.strokeStyle = Colors.positive;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]);
        
        // Fault from live to casing
        ctx.beginPath();
        ctx.moveTo(350, 100);
        ctx.lineTo(350, 230);
        ctx.lineTo(250, 230);
        ctx.stroke();
        
        // Sparks
        ctx.fillStyle = '#fbbf24';
        ctx.font = '20px sans-serif';
        ctx.fillText('⚡', 340, 140);
        
        ctx.setLineDash([]);
        
        // Large current to earth
        ctx.strokeStyle = Colors.wireGlow;
        ctx.lineWidth = 6;
        drawWire(ctx, 250, 230, 250, height - 40, { color: Colors.wireGlow });
        
        // Fuse blows indicator
        ctx.fillStyle = Colors.positive;
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('FUSE BLOWS!', 100, 80);
        
        if (explanationDiv) {
            explanationDiv.innerHTML = '<p style="color: #22d3ee;">⚡ <strong>Fault detected!</strong> Large current flows through earth wire → Fuse blows → Circuit safe!</p>';
        }
    } else if (state === 'normal') {
        if (explanationDiv) {
            explanationDiv.innerHTML = '<p>Normal operation. No current through earth wire. Earth is a safety backup.</p>';
        }
    } else {
        if (explanationDiv) {
            explanationDiv.innerHTML = '<p>Click "Simulate Fault" to see what happens when the live wire touches the metal casing.</p>';
        }
    }
}

function drawPlugDiagram() {
    const canvasData = getCanvas('plugDiagramCanvas');
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    clearCanvas(ctx, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    
    // Plug body (back view)
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(centerX - 100, centerY - 100, 200, 180, 15);
    ctx.fill();
    ctx.stroke();
    
    // Earth pin (top, largest)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(centerX - 8, centerY - 85, 16, 50);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E', centerX, centerY - 55);
    
    // Live pin (right when viewing from back)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(centerX + 40, centerY - 20, 12, 40);
    ctx.fillStyle = '#92400e';
    ctx.fillText('L', centerX + 46, centerY + 5);
    
    // Neutral pin (left when viewing from back)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(centerX - 52, centerY - 20, 12, 40);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('N', centerX - 46, centerY + 5);
    
    // Fuse
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(centerX + 30, centerY + 30, 40, 20);
    ctx.fillStyle = '#1e293b';
    ctx.font = '10px sans-serif';
    ctx.fillText('FUSE', centerX + 50, centerY + 44);
    
    // Cable grip area
    ctx.fillStyle = '#64748b';
    ctx.fillRect(centerX - 30, centerY + 55, 60, 25);
    ctx.fillStyle = Colors.text;
    ctx.font = '8px sans-serif';
    ctx.fillText('CABLE GRIP', centerX, centerY + 70);
    
    // Wire colors legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#92400e';
    ctx.fillRect(centerX + 120, centerY - 80, 30, 12);
    ctx.fillStyle = Colors.text;
    ctx.fillText('Live (Brown)', centerX + 155, centerY - 70);
    
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(centerX + 120, centerY - 60, 30, 12);
    ctx.fillStyle = Colors.text;
    ctx.fillText('Neutral (Blue)', centerX + 155, centerY - 50);
    
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(centerX + 120, centerY - 40, 30, 12);
    ctx.fillStyle = Colors.text;
    ctx.fillText('Earth (G/Y)', centerX + 155, centerY - 30);
    
    // View label
    ctx.fillStyle = Colors.textMuted;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('(View from back of plug)', centerX, height - 30);
}

// Export Part C functions
window.drawSeriesCircuit = drawSeriesCircuit;
window.startSeriesAnimation = startSeriesAnimation;
window.stopSeriesAnimation = stopSeriesAnimation;

window.drawParallelCircuit = drawParallelCircuit;
window.startParallelAnimation = startParallelAnimation;
window.stopParallelAnimation = stopParallelAnimation;

window.drawPotentialDivider = drawPotentialDivider;
window.drawPowerTriangles = drawPowerTriangles;
window.drawEnergyMeter = drawEnergyMeter;

window.drawDangerDemo = drawDangerDemo;
window.updateDangerDemo = updateDangerDemo;

window.drawSafetyDiagrams = drawSafetyDiagrams;
window.drawFuseDiagram = drawFuseDiagram;
window.drawMCBDiagram = drawMCBDiagram;
window.drawEarthingDemo = drawEarthingDemo;
window.showEarthingState = showEarthingState;
window.drawPlugDiagram = drawPlugDiagram;

// Initialize all drawings when this script loads
window.initAllCanvasDrawings = function() {
    console.log('Initializing all canvas drawings...');
    
    // Only draw if the relevant canvas exists
    if (document.getElementById('virTriangleCanvas')) drawVIRTriangle();
    if (document.getElementById('currentFlowCanvas')) drawCurrentFlowAnimation();
};

console.log('⚡ Animations Part C loaded');