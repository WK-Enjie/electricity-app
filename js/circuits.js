// ========================================
// CIRCUIT SIMULATOR - circuits.js
// Singapore O-Level Electricity App
// ========================================

function calculateSafeParallel(r1, r2) {
    if (r1 === 0 || r2 === 0) return 0; 
    if (!isFinite(r1)) return r2;
    if (!isFinite(r2)) return r1;
    return (r1 * r2) / (r1 + r2);
}

class CircuitComponent {
    constructor(type, x, y) {
        this.id = 'comp_' + Date.now();
        this.type = type;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.label = '';
        this.setDefaultProperties();
    }
    
    setDefaultProperties() {
        switch(this.type) {
            case 'cell': this.voltage = 1.5; this.resistance = 0; this.icon = '🔋'; this.name = 'Cell'; break;
            case 'battery': this.voltage = 6; this.resistance = 0; this.icon = '🔋'; this.name = 'Battery'; break;
            case 'resistor': this.resistance = 10; this.icon = '📊'; this.name = 'Resistor'; break;
            case 'bulb': this.resistance = 15; this.power = 0; this.isOn = false; this.icon = '💡'; this.name = 'Bulb'; break;
            case 'switch-open': case 'switch-closed':
                this.isClosed = this.type === 'switch-closed';
                this.resistance = this.isClosed ? 0 : Infinity;
                this.icon = '🔘'; this.name = 'Switch'; break;
            case 'ammeter': this.reading = 0; this.resistance = 0.001; this.icon = '🔴'; this.name = 'Ammeter'; break;
            case 'voltmeter': this.reading = 0; this.resistance = 1000000; this.icon = '🔵'; this.name = 'Voltmeter'; break;
            default: this.resistance = 0; this.icon = '⚪'; this.name = 'Component';
        }
    }
    
    rotate() { this.rotation = (this.rotation + 90) % 360; }
}

class Wire {
    constructor(startX, startY, endX, endY) {
        this.startX = startX; this.startY = startY; this.endX = endX; this.endY = endY; this.current = 0;
    }
}

class CircuitSimulator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.components = []; this.wires = []; this.selectedComponent = null;
        this.isRunning = false; this.currentTool = 'wire'; this.isDrawingWire = false;
        this.gridSize = 20; this.snapToGrid = true;
        this.init();
    }
    
    init() { this.setupEventListeners(); this.render(); }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.getElementById('runSimulation')?.addEventListener('click', () => this.runSimulation());
        document.getElementById('stopSimulation')?.addEventListener('click', () => this.stopSimulation());
        document.getElementById('clearBoard')?.addEventListener('click', () => this.clearBoard());
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    
    snapToGridPoint(x, y) {
        return this.snapToGrid ? { x: Math.round(x/this.gridSize)*this.gridSize, y: Math.round(y/this.gridSize)*this.gridSize } : { x, y };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        this.isDrawingWire = true;
        this.wireStart = this.snapToGridPoint(pos.x, pos.y);
    }
    
    handleMouseMove(e) {
        if (this.isDrawingWire) {
            this.tempWireEnd = this.snapToGridPoint(this.getMousePos(e).x, this.getMousePos(e).y);
            this.render(); this.drawTempWire();
        }
    }
    
    handleMouseUp(e) {
        if (this.isDrawingWire && this.wireStart) {
            const endPoint = this.snapToGridPoint(this.getMousePos(e).x, this.getMousePos(e).y);
            if (this.wireStart.x !== endPoint.x || this.wireStart.y !== endPoint.y) {
                this.wires.push(new Wire(this.wireStart.x, this.wireStart.y, endPoint.x, endPoint.y));
            }
        }
        this.isDrawingWire = false; this.wireStart = null; this.tempWireEnd = null; this.render();
    }

    addComponent(type, x, y) {
        const snapped = this.snapToGridPoint(x, y);
        const comp = new CircuitComponent(type, snapped.x, snapped.y);
        this.components.push(comp); this.render(); return comp;
    }

    clearBoard() {
        this.components = []; this.wires = []; this.stopSimulation(); this.render();
    }

    drawTempWire() {
        if (this.wireStart && this.tempWireEnd) {
            this.ctx.beginPath(); this.ctx.moveTo(this.wireStart.x, this.wireStart.y); this.ctx.lineTo(this.tempWireEnd.x, this.tempWireEnd.y);
            this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)'; this.ctx.lineWidth = 3; this.ctx.stroke();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWires(); this.drawComponents();
    }

    drawWires() {
        this.wires.forEach(wire => {
            this.ctx.beginPath(); this.ctx.moveTo(wire.startX, wire.startY); this.ctx.lineTo(wire.endX, wire.endY);
            this.ctx.strokeStyle = (this.isRunning && wire.current > 0) ? '#22d3ee' : '#fbbf24';
            this.ctx.lineWidth = 3; this.ctx.stroke();
        });
    }

    drawComponents() {
        this.components.forEach(comp => {
            this.ctx.save(); this.ctx.translate(comp.x, comp.y); this.ctx.rotate(comp.rotation * Math.PI / 180);
            this.ctx.strokeStyle = '#fbbf24'; this.ctx.lineWidth = 2;
            
            if(comp.type === 'battery') {
                this.ctx.beginPath(); this.ctx.moveTo(-15, -12); this.ctx.lineTo(-15, 12); this.ctx.stroke();
                this.ctx.beginPath(); this.ctx.moveTo(15, -6); this.ctx.lineTo(15, 6); this.ctx.lineWidth = 4; this.ctx.stroke();
            } else if(comp.type === 'resistor') {
                this.ctx.fillStyle = '#0f172a'; this.ctx.fillRect(-20, -10, 40, 20); this.ctx.strokeRect(-20, -10, 40, 20);
            } else if(comp.type === 'bulb') {
                this.ctx.beginPath(); this.ctx.arc(0, 0, 18, 0, Math.PI * 2); this.ctx.fillStyle = comp.isOn ? 'rgba(251,191,36,0.4)' : '#0f172a'; this.ctx.fill(); this.ctx.stroke();
                this.ctx.beginPath(); this.ctx.moveTo(-12, -12); this.ctx.lineTo(12, 12); this.ctx.stroke();
                this.ctx.beginPath(); this.ctx.moveTo(12, -12); this.ctx.lineTo(-12, 12); this.ctx.stroke();
            } else if(comp.type === 'switch-open') {
                this.ctx.beginPath(); this.ctx.moveTo(-12, 0); this.ctx.lineTo(8, -15); this.ctx.stroke();
            }
            this.ctx.restore();
        });
    }

    runSimulation() { this.isRunning = true; document.getElementById('circuitStatus').textContent = 'Running'; this.render(); }
    stopSimulation() { this.isRunning = false; document.getElementById('circuitStatus').textContent = 'Stopped'; this.render(); }
}

let circuitSimulator;
document.addEventListener('DOMContentLoaded', () => {
    circuitSimulator = new CircuitSimulator('circuitCanvas');
    
    // Setup Drag and Drop
    document.querySelectorAll('.component-item[draggable="true"]').forEach(item => {
        item.addEventListener('dragstart', (e) => e.dataTransfer.setData('componentType', item.dataset.component));
    });
    
    const circuitBoard = document.getElementById('circuitBoard');
    circuitBoard?.addEventListener('dragover', (e) => e.preventDefault());
    circuitBoard?.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('componentType');
        if (type && circuitSimulator) circuitSimulator.addComponent(type, e.offsetX, e.offsetY);
    });
});