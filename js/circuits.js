// ========================================
// CIRCUIT SIMULATOR - circuits.js
// Singapore O-Level Electricity App
// ========================================

// Circuit Component Classes
class CircuitComponent {
    constructor(type, x, y) {
        this.id = 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.label = '';
        this.connections = { left: null, right: null, top: null, bottom: null };
        
        // Component-specific properties
        this.setDefaultProperties();
    }
    
    setDefaultProperties() {
        switch(this.type) {
            case 'cell':
                this.voltage = 1.5;
                this.resistance = 0;
                this.icon = '🔋';
                this.name = 'Cell';
                break;
            case 'battery':
                this.voltage = 6;
                this.resistance = 0;
                this.icon = '🔋';
                this.name = 'Battery';
                break;
            case 'dc-supply':
                this.voltage = 12;
                this.resistance = 0;
                this.icon = '⚡';
                this.name = 'DC Supply';
                break;
            case 'resistor':
                this.resistance = 10;
                this.icon = '📊';
                this.name = 'Resistor';
                break;
            case 'variable-resistor':
                this.resistance = 20;
                this.minResistance = 0;
                this.maxResistance = 100;
                this.icon = '🎚️';
                this.name = 'Variable Resistor';
                break;
            case 'bulb':
                this.resistance = 15;
                this.power = 0;
                this.isOn = false;
                this.icon = '💡';
                this.name = 'Bulb';
                break;
            case 'thermistor':
                this.resistance = 10000; // 10kΩ at room temp
                this.temperature = 25;
                this.icon = '🌡️';
                this.name = 'Thermistor';
                break;
            case 'ldr':
                this.resistance = 5000; // 5kΩ at medium light
                this.lightLevel = 50;
                this.icon = '☀️';
                this.name = 'LDR';
                break;
            case 'switch-open':
            case 'switch-closed':
                this.isClosed = this.type === 'switch-closed';
                this.resistance = this.isClosed ? 0 : Infinity;
                this.icon = '🔘';
                this.name = 'Switch';
                break;
            case 'diode':
                this.forwardVoltage = 0.7;
                this.isForwardBiased = true;
                this.icon = '▶️';
                this.name = 'Diode';
                break;
            case 'led':
                this.forwardVoltage = 2.0;
                this.isForwardBiased = true;
                this.isOn = false;
                this.icon = '💡';
                this.name = 'LED';
                break;
            case 'ammeter':
                this.reading = 0;
                this.resistance = 0.001; // Very low resistance
                this.icon = '🔴';
                this.name = 'Ammeter';
                break;
            case 'voltmeter':
                this.reading = 0;
                this.resistance = 1000000; // Very high resistance
                this.icon = '🔵';
                this.name = 'Voltmeter';
                break;
            default:
                this.resistance = 0;
                this.icon = '⚪';
                this.name = 'Component';
        }
    }
    
    // Calculate thermistor resistance based on temperature
    updateThermistorResistance() {
        if (this.type === 'thermistor') {
            // NTC thermistor: R decreases as T increases
            // Simplified model: R = R25 * exp(B * (1/T - 1/298))
            const R25 = 10000; // 10kΩ at 25°C
            const B = 3950; // B constant
            const T = this.temperature + 273.15; // Convert to Kelvin
            const T25 = 298.15;
            this.resistance = R25 * Math.exp(B * (1/T - 1/T25));
        }
    }
    
    // Calculate LDR resistance based on light level
    updateLDRResistance() {
        if (this.type === 'ldr') {
            // LDR: R decreases as light increases
            // Simplified model: R = Rdark * (light/100)^(-gamma)
            const Rdark = 100000; // 100kΩ in darkness
            const gamma = 0.8;
            if (this.lightLevel <= 0) {
                this.resistance = Rdark;
            } else {
                this.resistance = Rdark * Math.pow(this.lightLevel / 100, -gamma);
            }
            this.resistance = Math.max(100, Math.min(100000, this.resistance)); // Clamp values
        }
    }
    
    rotate() {
        this.rotation = (this.rotation + 90) % 360;
    }
}

// Wire class
class Wire {
    constructor(startX, startY, endX, endY) {
        this.id = 'wire_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.startComponent = null;
        this.endComponent = null;
        this.current = 0;
    }
}

// Circuit Simulator class
class CircuitSimulator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.isRunning = false;
        this.currentTool = 'wire';
        
        // Wire drawing state
        this.isDrawingWire = false;
        this.wireStart = null;
        this.tempWireEnd = null;
        
        // Drag state
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // Grid settings
        this.gridSize = 20;
        this.snapToGrid = true;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.render();
    }
    
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        
        // Tool buttons
        document.getElementById('selectTool')?.addEventListener('click', () => this.setTool('select'));
        document.getElementById('wireTool')?.addEventListener('click', () => this.setTool('wire'));
        document.getElementById('deleteTool')?.addEventListener('click', () => this.setTool('delete'));
        
        // Simulation controls
        document.getElementById('runSimulation')?.addEventListener('click', () => this.runSimulation());
        document.getElementById('stopSimulation')?.addEventListener('click', () => this.stopSimulation());
        document.getElementById('clearBoard')?.addEventListener('click', () => this.clearBoard());
        
        // Component properties
        document.getElementById('rotateComponent')?.addEventListener('click', () => this.rotateSelected());
        document.getElementById('deleteComponent')?.addEventListener('click', () => this.deleteSelected());
        
        // Property inputs
        document.getElementById('propResistance')?.addEventListener('change', (e) => {
            if (this.selectedComponent) {
                this.selectedComponent.resistance = parseFloat(e.target.value);
                this.render();
            }
        });
        
        document.getElementById('propVoltage')?.addEventListener('change', (e) => {
            if (this.selectedComponent) {
                this.selectedComponent.voltage = parseFloat(e.target.value);
                this.render();
            }
        });
        
        document.getElementById('propLabel')?.addEventListener('change', (e) => {
            if (this.selectedComponent) {
                this.selectedComponent.label = e.target.value;
                this.render();
            }
        });
        
        document.getElementById('propSwitchState')?.addEventListener('change', (e) => {
            if (this.selectedComponent && 
                (this.selectedComponent.type === 'switch-open' || 
                 this.selectedComponent.type === 'switch-closed')) {
                this.selectedComponent.isClosed = e.target.checked;
                this.selectedComponent.resistance = e.target.checked ? 0 : Infinity;
                this.render();
            }
        });
    }
    
    setTool(tool) {
        this.currentTool = tool;
        
        // Update tool button states
        document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool + 'Tool')?.classList.add('active');
        
        // Update cursor
        switch(tool) {
            case 'select':
                this.canvas.style.cursor = 'default';
                break;
            case 'wire':
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'delete':
                this.canvas.style.cursor = 'not-allowed';
                break;
        }
    }
    
    snapToGridPoint(x, y) {
        if (this.snapToGrid) {
            return {
                x: Math.round(x / this.gridSize) * this.gridSize,
                y: Math.round(y / this.gridSize) * this.gridSize
            };
        }
        return { x, y };
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        
        switch(this.currentTool) {
            case 'select':
                this.handleSelectDown(pos);
                break;
            case 'wire':
                this.handleWireDown(pos);
                break;
            case 'delete':
                this.handleDeleteAt(pos);
                break;
        }
    }
    
    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        
        if (this.isDrawingWire) {
            this.tempWireEnd = this.snapToGridPoint(pos.x, pos.y);
            this.render();
            this.drawTempWire();
        } else if (this.isDragging && this.selectedComponent) {
            const snapped = this.snapToGridPoint(pos.x - this.dragOffset.x, pos.y - this.dragOffset.y);
            this.selectedComponent.x = snapped.x;
            this.selectedComponent.y = snapped.y;
            this.render();
        }
    }
    
    handleMouseUp(e) {
        const pos = this.getMousePos(e);
        
        if (this.isDrawingWire && this.wireStart) {
            const endPoint = this.snapToGridPoint(pos.x, pos.y);
            if (this.wireStart.x !== endPoint.x || this.wireStart.y !== endPoint.y) {
                const wire = new Wire(
                    this.wireStart.x, this.wireStart.y,
                    endPoint.x, endPoint.y
                );
                this.wires.push(wire);
                this.updateWireCount();
            }
        }
        
        this.isDrawingWire = false;
        this.wireStart = null;
        this.tempWireEnd = null;
        this.isDragging = false;
        this.render();
    }
    
    handleDoubleClick(e) {
        const pos = this.getMousePos(e);
        const component = this.getComponentAt(pos);
        
        if (component) {
            // Toggle switch on double-click
            if (component.type === 'switch-open' || component.type === 'switch-closed') {
                component.isClosed = !component.isClosed;
                component.resistance = component.isClosed ? 0 : Infinity;
                this.updatePropertiesPanel();
                this.render();
                
                // Re-run simulation if running
                if (this.isRunning) {
                    this.calculateCircuit();
                }
            }
        }
    }
    
    handleSelectDown(pos) {
        const component = this.getComponentAt(pos);
        
        if (component) {
            this.selectComponent(component);
            this.isDragging = true;
            this.dragOffset = {
                x: pos.x - component.x,
                y: pos.y - component.y
            };
        } else {
            this.deselectAll();
        }
    }
    
    handleWireDown(pos) {
        const snapped = this.snapToGridPoint(pos.x, pos.y);
        this.isDrawingWire = true;
        this.wireStart = snapped;
    }
    
    handleDeleteAt(pos) {
        // Check for component
        const component = this.getComponentAt(pos);
        if (component) {
            this.deleteComponent(component);
            return;
        }
        
        // Check for wire
        const wire = this.getWireAt(pos);
        if (wire) {
            this.deleteWire(wire);
        }
    }
    
    getComponentAt(pos) {
        const tolerance = 30;
        return this.components.find(comp => {
            const dx = pos.x - comp.x;
            const dy = pos.y - comp.y;
            return Math.sqrt(dx * dx + dy * dy) < tolerance;
        });
    }
    
    getWireAt(pos) {
        const tolerance = 10;
        return this.wires.find(wire => {
            return this.distToSegment(pos, 
                { x: wire.startX, y: wire.startY }, 
                { x: wire.endX, y: wire.endY }
            ) < tolerance;
        });
    }
    
    distToSegment(p, v, w) {
        const l2 = Math.pow(w.x - v.x, 2) + Math.pow(w.y - v.y, 2);
        if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt(
            Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + 
            Math.pow(p.y - (v.y + t * (w.y - v.y)), 2)
        );
    }
    
    addComponent(type, x, y) {
        const snapped = this.snapToGridPoint(x, y);
        const component = new CircuitComponent(type, snapped.x, snapped.y);
        this.components.push(component);
        this.updateComponentCount();
        this.render();
        return component;
    }
    
    selectComponent(component) {
        this.deselectAll();
        this.selectedComponent = component;
        this.updatePropertiesPanel();
        this.render();
    }
    
    deselectAll() {
        this.selectedComponent = null;
        document.getElementById('componentProperties')?.classList.add('hidden');
        document.querySelector('.no-selection')?.classList.remove('hidden');
    }
    
    deleteComponent(component) {
        const index = this.components.indexOf(component);
        if (index > -1) {
            this.components.splice(index, 1);
            if (this.selectedComponent === component) {
                this.deselectAll();
            }
            this.updateComponentCount();
            this.render();
        }
    }
    
    deleteWire(wire) {
        const index = this.wires.indexOf(wire);
        if (index > -1) {
            this.wires.splice(index, 1);
            this.updateWireCount();
            this.render();
        }
    }
    
    deleteSelected() {
        if (this.selectedComponent) {
            this.deleteComponent(this.selectedComponent);
        }
    }
    
    rotateSelected() {
        if (this.selectedComponent) {
            this.selectedComponent.rotate();
            this.render();
        }
    }
    
    clearBoard() {
        if (confirm('Are you sure you want to clear the circuit board?')) {
            this.components = [];
            this.wires = [];
            this.selectedComponent = null;
            this.stopSimulation();
            this.updateComponentCount();
            this.updateWireCount();
            this.deselectAll();
            this.render();
        }
    }
    
    updateComponentCount() {
        const countEl = document.getElementById('componentCount');
        if (countEl) countEl.textContent = this.components.length;
    }
    
    updateWireCount() {
        const countEl = document.getElementById('wireCount');
        if (countEl) countEl.textContent = this.wires.length;
    }
    
    updatePropertiesPanel() {
        if (!this.selectedComponent) {
            this.deselectAll();
            return;
        }
        
        const comp = this.selectedComponent;
        document.querySelector('.no-selection')?.classList.add('hidden');
        document.getElementById('componentProperties')?.classList.remove('hidden');
        
        // Update header
        document.getElementById('selectedIcon').textContent = comp.icon;
        document.getElementById('selectedName').textContent = comp.name;
        
        // Update properties based on component type
        const resistanceInput = document.getElementById('propResistance');
        const voltageGroup = document.getElementById('propVoltageGroup');
        const switchGroup = document.getElementById('propSwitchGroup');
        const labelInput = document.getElementById('propLabel');
        
        // Reset visibility
        voltageGroup.style.display = 'none';
        switchGroup.style.display = 'none';
        
        // Set values
        if (resistanceInput) {
            resistanceInput.value = comp.resistance;
            resistanceInput.disabled = ['cell', 'battery', 'dc-supply', 'ammeter'].includes(comp.type);
        }
        
        if (comp.voltage !== undefined) {
            voltageGroup.style.display = 'flex';
            document.getElementById('propVoltage').value = comp.voltage;
        }
        
        if (comp.type === 'switch-open' || comp.type === 'switch-closed') {
            switchGroup.style.display = 'flex';
            document.getElementById('propSwitchState').checked = comp.isClosed;
        }
        
        if (labelInput) {
            labelInput.value = comp.label || '';
        }
    }
    
    // Rendering methods
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (subtle)
        this.drawGrid();
        
        // Draw wires
        this.drawWires();
        
        // Draw components
        this.drawComponents();
        
        // Draw selection highlight
        if (this.selectedComponent) {
            this.drawSelectionHighlight(this.selectedComponent);
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawWires() {
        this.wires.forEach(wire => {
            this.ctx.beginPath();
            this.ctx.moveTo(wire.startX, wire.startY);
            this.ctx.lineTo(wire.endX, wire.endY);
            this.ctx.strokeStyle = '#fbbf24';
            this.ctx.lineWidth = 3;
            
            if (this.isRunning && wire.current > 0) {
                // Animated current flow
                this.ctx.setLineDash([10, 5]);
                this.ctx.strokeStyle = '#22d3ee';
            } else {
                this.ctx.setLineDash([]);
            }
            
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Draw connection dots
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.beginPath();
            this.ctx.arc(wire.startX, wire.startY, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(wire.endX, wire.endY, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawTempWire() {
        if (this.wireStart && this.tempWireEnd) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.wireStart.x, this.wireStart.y);
            this.ctx.lineTo(this.tempWireEnd.x, this.tempWireEnd.y);
            this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
    
    drawComponents() {
        this.components.forEach(comp => {
            this.drawComponent(comp);
        });
    }
    
    drawComponent(comp) {
        this.ctx.save();
        this.ctx.translate(comp.x, comp.y);
        this.ctx.rotate(comp.rotation * Math.PI / 180);
        
        const color = '#fbbf24';
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 2;
        
        switch(comp.type) {
            case 'cell':
                this.drawCell();
                break;
            case 'battery':
                this.drawBattery();
                break;
            case 'resistor':
                this.drawResistor();
                break;
            case 'bulb':
                this.drawBulb(comp.isOn);
                break;
            case 'switch-open':
            case 'switch-closed':
                this.drawSwitch(comp.isClosed);
                break;
            case 'ammeter':
                this.drawAmmeter(comp.reading);
                break;
            case 'voltmeter':
                this.drawVoltmeter(comp.reading);
                break;
            case 'diode':
                this.drawDiode();
                break;
            case 'led':
                this.drawLED(comp.isOn);
                break;
            case 'thermistor':
                this.drawThermistor();
                break;
            case 'ldr':
                this.drawLDR();
                break;
            case 'variable-resistor':
                this.drawVariableResistor();
                break;
        }
        
        // Draw label if exists
        if (comp.label) {
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(comp.label, 0, 35);
        }
        
        this.ctx.restore();
    }
    
    // Component drawing methods
    drawCell() {
        // Left wire
        this.ctx.beginPath();
        this.ctx.moveTo(-30, 0);
        this.ctx.lineTo(-8, 0);
        this.ctx.stroke();
        
        // Long line (positive)
        this.ctx.beginPath();
        this.ctx.moveTo(-8, -15);
        this.ctx.lineTo(-8, 15);
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Short line (negative)
        this.ctx.beginPath();
        this.ctx.moveTo(4, -8);
        this.ctx.lineTo(4, 8);
        this.ctx.lineWidth = 6;
        this.ctx.stroke();
        
        // Right wire
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(4, 0);
        this.ctx.lineTo(30, 0);
        this.ctx.stroke();
        
        // + and - labels
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText('+', -15, -10);
        this.ctx.fillText('-', 10, -10);
    }
    
    drawBattery() {
        // Multiple cells
        for (let i = 0; i < 3; i++) {
            const offset = -15 + i * 15;
            
            // Long line
            this.ctx.beginPath();
            this.ctx.moveTo(offset, -12);
            this.ctx.lineTo(offset, 12);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Short line
            this.ctx.beginPath();
            this.ctx.moveTo(offset + 6, -6);
            this.ctx.lineTo(offset + 6, 6);
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }
        
        // Wires
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-35, 0);
        this.ctx.lineTo(-15, 0);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(27, 0);
        this.ctx.lineTo(35, 0);
        this.ctx.stroke();
    }
    
    drawResistor() {
        // Left wire
        this.ctx.beginPath();
        this.ctx.moveTo(-35, 0);
        this.ctx.lineTo(-20, 0);
        this.ctx.stroke();
        
        // Rectangle
        this.ctx.strokeRect(-20, -10, 40, 20);
        
        // Right wire
        this.ctx.beginPath();
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(35, 0);
        this.ctx.stroke();
    }
    
    drawBulb(isOn) {
        // Left wire
        this.ctx.beginPath();
        this.ctx.moveTo(-35, 0);
        this.ctx.lineTo(-18, 0);
        this.ctx.stroke();
        
        // Circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
        if (isOn) {
            this.ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
            this.ctx.fill();
            this.ctx.shadowColor = '#fbbf24';
            this.ctx.shadowBlur = 20;
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        // Cross
        this.ctx.beginPath();
        this.ctx.moveTo(-12, -12);
        this.ctx.lineTo(12, 12);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(12, -12);
        this.ctx.lineTo(-12, 12);
        this.ctx.stroke();
        
        // Right wire
        this.ctx.beginPath();
        this.ctx.moveTo(18, 0);
        this.ctx.lineTo(35, 0);
        this.ctx.stroke();
    }
    
    drawSwitch(isClosed) {
        // Left wire and dot
        this.ctx.beginPath();
        this.ctx.moveTo(-35, 0);
        this.ctx.lineTo(-15, 0);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(-12, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Switch arm
        this.ctx.beginPath();
        this.ctx.moveTo(-12, 0);
        if (isClosed) {
            this.ctx.lineTo(12, 0);
        } else {
            this.ctx.lineTo(8, -15);
        }
        this.ctx.stroke();
        
        // Right dot and wire
        this.ctx.beginPath();
        this.ctx.arc(12, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(35, 0);
        this.ctx.stroke();
    }
    
    drawAmmeter(reading) {
        // Left wire
        this.ctx.beginPath();
        this.ctx.moveTo(-35, 0);
        this.ctx.lineTo(-18, 0);
        this.ctx.stroke();
        
        // Circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // A label
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('A', 0, 0);
        
        // Right wire
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.moveTo(18, 0);
        this.ctx.lineTo(35, 0);
        this.ctx.stroke();
        
        // Reading
        if (reading > 0) {
            this.ctx.fillStyle = '#22d3ee';
            this.ctx.font = '10px sans-serif';
            this.ctx.fillText(reading.toFixed(2) + 'A', 0, 28);
        }
    }
    
    drawVoltmeter(reading) {
        // Left wire
        this.ctx.beginPath();
        this.ctx.moveTo(-35, 0);
        this.ctx.lineTo(-18, 0);
        this.ctx.stroke();
        
        // Circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // V label
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.font = 'bold 16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('V', 0, 0);
        
        // Right wire
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.moveTo(18, 0);
        this.ctx.lineTo(35, 0);
        this.ctx.stroke();
        
        // Reading
        if (reading > 0) {
            this.ctx.fillStyle = '#22d3ee';
            this.ctx.font = '10px sans-serif';
            this.ctx.fillText(reading.toFixed(2) + 'V', 0, 28);
        }
    }
    
    drawDiode() {
        // Left wire
        this.ctx.beginPath();
        this.ctx.moveTo(-35, 0);
        this.ctx.lineTo(-15, 0);
        this.ctx.stroke();
        
        // Triangle
        this.ctx.beginPath();
        this.ctx.moveTo(-15, -12);
        this.ctx.lineTo(-15, 12);
        this.ctx.lineTo(10, 0);
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Bar
        this.ctx.beginPath();
        this.ctx.moveTo(10, -12);
        this.ctx.lineTo(10, 12);
        this.ctx.stroke();
        
        // Right wire
        this.ctx.beginPath();
        this.ctx.moveTo(10, 0);
        this.ctx.lineTo(35, 0);
        this.ctx.stroke();
    }
    
    drawLED(isOn) {
        this.drawDiode();
        
        // Light rays
        this.ctx.beginPath();
        this.ctx.moveTo(15, -15);
        this.ctx.lineTo(22, -22);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(20, -12);
        this.ctx.lineTo(27, -19);
        this.ctx.stroke();
        
        // Arrow heads
        this.ctx.beginPath();
        this.ctx.moveTo(22, -22);
        this.ctx.lineTo(18, -19);
        this.ctx.lineTo(20, -23);
        this.ctx.fill();
        
        if (isOn) {
            this.ctx.shadowColor = '#ef4444';
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawThermistor() {
        this.drawResistor();
        
        // Diagonal line with T
        this.ctx.beginPath();
        this.ctx.moveTo(-25, 18);
        this.ctx.lineTo(25, -18);
        this.ctx.stroke();
        
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText('T', 28, -15);
    }
    
    drawLDR() {
        this.drawResistor();
        
        // Light arrows
        this.ctx.beginPath();
        this.ctx.moveTo(-15, -20);
        this.ctx.lineTo(-5, -12);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(-5, -25);
        this.ctx.lineTo(5, -17);
        this.ctx.stroke();
        
        // Arrow heads
        this.ctx.beginPath();
        this.ctx.moveTo(-5, -12);
        this.ctx.lineTo(-9, -15);
        this.ctx.lineTo(-6, -16);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(5, -17);
        this.ctx.lineTo(1, -20);
        this.ctx.lineTo(4, -21);
        this.ctx.fill();
    }
    
    drawVariableResistor() {
        this.drawResistor();
        
        // Arrow through
        this.ctx.beginPath();
        this.ctx.moveTo(-15, 20);
        this.ctx.lineTo(15, -15);
        this.ctx.stroke();
        
        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(15, -15);
        this.ctx.lineTo(10, -10);
        this.ctx.lineTo(12, -17);
        this.ctx.fill();
    }
    
    drawSelectionHighlight(comp) {
        this.ctx.save();
        this.ctx.translate(comp.x, comp.y);
        this.ctx.strokeStyle = '#22d3ee';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(-40, -30, 80, 60);
        this.ctx.restore();
    }
    
    // Simulation methods
    runSimulation() {
        this.isRunning = true;
        document.getElementById('runSimulation').disabled = true;
        document.getElementById('stopSimulation').disabled = false;
        document.getElementById('circuitStatus').textContent = 'Running';
        document.getElementById('circuitStatus').style.color = '#22d3ee';
        
        this.calculateCircuit();
        this.animateCurrentFlow();
    }
    
    stopSimulation() {
        this.isRunning = false;
        document.getElementById('runSimulation').disabled = false;
        document.getElementById('stopSimulation').disabled = true;
        document.getElementById('circuitStatus').textContent = 'Stopped';
        document.getElementById('circuitStatus').style.color = '#f59e0b';
        
        // Reset component states
        this.components.forEach(comp => {
            if (comp.type === 'bulb' || comp.type === 'led') {
                comp.isOn = false;
            }
            if (comp.type === 'ammeter' || comp.type === 'voltmeter') {
                comp.reading = 0;
            }
        });
        
        this.wires.forEach(wire => {
            wire.current = 0;
        });
        
        this.render();
        this.clearMeasurements();
    }
    
    calculateCircuit() {
        // Simplified circuit analysis
        // Find voltage sources
        const sources = this.components.filter(c => 
            c.type === 'cell' || c.type === 'battery' || c.type === 'dc-supply'
        );
        
        if (sources.length === 0) {
            this.showError('No power source in circuit!');
            return;
        }
        
        // Calculate total EMF
        let totalEMF = 0;
        sources.forEach(s => totalEMF += s.voltage);
        
        // Calculate total resistance
        let totalResistance = 0;
        this.components.forEach(comp => {
            if (comp.type !== 'cell' && comp.type !== 'battery' && 
                comp.type !== 'dc-supply' && comp.type !== 'voltmeter') {
                if (comp.resistance !== Infinity) {
                    totalResistance += comp.resistance;
                } else {
                    // Open switch - circuit is open
                    totalResistance = Infinity;
                }
            }
        });
        
        // Calculate current
        let current = 0;
        if (totalResistance !== Infinity && totalResistance > 0) {
            current = totalEMF / totalResistance;
        }
        
        // Update component states
        this.components.forEach(comp => {
            if (comp.type === 'ammeter') {
                comp.reading = current;
            }
            if (comp.type === 'bulb' || comp.type === 'led') {
                comp.isOn = current > 0.01;
                comp.power = current * current * comp.resistance;
            }
            if (comp.type === 'voltmeter') {
                // Simplified: show EMF
                comp.reading = totalEMF;
            }
        });
        
        // Set current in wires
        this.wires.forEach(wire => {
            wire.current = current;
        });
        
        // Update display
        this.updateMeasurements(totalEMF, current, totalResistance);
        this.render();
    }
    
    updateMeasurements(voltage, current, resistance) {
        document.getElementById('measTotalVoltage').textContent = voltage.toFixed(2);
        document.getElementById('measTotalCurrent').textContent = current.toFixed(3);
        document.getElementById('measTotalResistance').textContent = resistance === Infinity ? '∞' : resistance.toFixed(1);
        document.getElementById('measTotalPower').textContent = (voltage * current).toFixed(2);
        
        // Update component readings
        const readingsList = document.getElementById('readingsList');
        readingsList.innerHTML = '';
        
        this.components.forEach(comp => {
            if (comp.type === 'ammeter' || comp.type === 'voltmeter') {
                const item = document.createElement('div');
                item.className = 'reading-item';
                item.innerHTML = `
                    <span class="reading-name">${comp.label || comp.name}</span>
                    <span class="reading-value">${comp.reading.toFixed(3)} ${comp.type === 'ammeter' ? 'A' : 'V'}</span>
                `;
                readingsList.appendChild(item);
            } else if (comp.type === 'bulb') {
                const item = document.createElement('div');
                item.className = 'reading-item';
                item.innerHTML = `
                    <span class="reading-name">${comp.label || comp.name}</span>
                    <span class="reading-value">${comp.power?.toFixed(2) || '0'} W</span>
                `;
                readingsList.appendChild(item);
            }
        });
    }
    
    clearMeasurements() {
        document.getElementById('measTotalVoltage').textContent = '--';
        document.getElementById('measTotalCurrent').textContent = '--';
        document.getElementById('measTotalResistance').textContent = '--';
        document.getElementById('measTotalPower').textContent = '--';
        document.getElementById('readingsList').innerHTML = '';
    }
    
    animateCurrentFlow() {
        if (!this.isRunning) return;
        
        this.render();
        requestAnimationFrame(() => this.animateCurrentFlow());
    }
    
    showError(message) {
        alert(message);
        this.stopSimulation();
    }
    
    // Load example circuits
    loadExample(exampleName) {
        this.clearBoard();
        
        switch(exampleName) {
            case 'series-simple':
                this.loadSeriesSimple();
                break;
            case 'parallel-bulbs':
                this.loadParallelBulbs();
                break;
            case 'potential-divider':
                this.loadPotentialDivider();
                break;
            case 'ammeter-voltmeter':
                this.loadAmmeterVoltmeter();
                break;
        }
        
        this.render();
    }
    
    loadSeriesSimple() {
        this.addComponent('battery', 100, 200);
        this.addComponent('switch-closed', 250, 200);
        this.addComponent('bulb', 400, 200);
        
        // Add wires
        this.wires.push(new Wire(130, 200, 215, 200));
        this.wires.push(new Wire(285, 200, 365, 200));
        this.wires.push(new Wire(435, 200, 500, 200));
        this.wires.push(new Wire(500, 200, 500, 300));
        this.wires.push(new Wire(500, 300, 100, 300));
        this.wires.push(new Wire(100, 300, 100, 200));
        
        this.updateComponentCount();
        this.updateWireCount();
    }
    
    loadParallelBulbs() {
        this.addComponent('battery', 100, 200);
        this.addComponent('bulb', 400, 150);
        this.addComponent('bulb', 400, 250);
        
        // Wires for parallel
        this.wires.push(new Wire(130, 200, 250, 200));
        this.wires.push(new Wire(250, 200, 250, 150));
        this.wires.push(new Wire(250, 200, 250, 250));
        this.wires.push(new Wire(250, 150, 365, 150));
        this.wires.push(new Wire(250, 250, 365, 250));
        this.wires.push(new Wire(435, 150, 500, 150));
        this.wires.push(new Wire(435, 250, 500, 250));
        this.wires.push(new Wire(500, 150, 500, 200));
        this.wires.push(new Wire(500, 250, 500, 200));
        this.wires.push(new Wire(500, 200, 500, 320));
        this.wires.push(new Wire(500, 320, 100, 320));
        this.wires.push(new Wire(100, 320, 100, 200));
        
        this.updateComponentCount();
        this.updateWireCount();
    }
    
    loadPotentialDivider() {
        this.addComponent('dc-supply', 100, 200);
        this.components[0].voltage = 12;
        
        const r1 = this.addComponent('resistor', 350, 150);
        r1.resistance = 10000;
        r1.label = 'R1';
        
        const r2 = this.addComponent('resistor', 350, 250);
        r2.resistance = 10000;
        r2.label = 'R2';
        
        this.addComponent('voltmeter', 500, 250);
        
        this.updateComponentCount();
        this.updateWireCount();
    }
    
    loadAmmeterVoltmeter() {
        this.addComponent('battery', 100, 200);
        this.addComponent('ammeter', 250, 200);
        this.addComponent('resistor', 400, 200);
        this.addComponent('voltmeter', 400, 320);
        
        this.updateComponentCount();
        this.updateWireCount();
    }
}

// Initialize simulator when DOM is ready
let circuitSimulator;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('circuitCanvas');
    if (canvas) {
        circuitSimulator = new CircuitSimulator('circuitCanvas');
        
        // Setup drag and drop from toolbox
        setupComponentDragDrop();
        
        // Setup example modal
        setupExampleModal();
        
        // Setup symbol reference toggle
        document.getElementById('toggleSymbolRef')?.addEventListener('click', () => {
            document.getElementById('symbolRefContent')?.classList.toggle('hidden');
        });
    }
});

function setupComponentDragDrop() {
    const componentItems = document.querySelectorAll('.component-item[draggable="true"]');
    const circuitBoard = document.getElementById('circuitBoard');
    
    componentItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('componentType', item.dataset.component);
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });
    
    circuitBoard?.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    
    circuitBoard?.addEventListener('drop', (e) => {
        e.preventDefault();
        const componentType = e.dataTransfer.getData('componentType');
        if (componentType && circuitSimulator) {
            const rect = circuitBoard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            circuitSimulator.addComponent(componentType, x, y);
        }
    });
}

function setupExampleModal() {
    const modal = document.getElementById('exampleModal');
    const loadBtn = document.getElementById('loadExample');
    const closeBtn = document.getElementById('closeExampleModal');
    const exampleCards = document.querySelectorAll('.example-card');
    
    loadBtn?.addEventListener('click', () => {
        modal?.classList.remove('hidden');
    });
    
    closeBtn?.addEventListener('click', () => {
        modal?.classList.add('hidden');
    });
    
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    exampleCards.forEach(card => {
        card.addEventListener('click', () => {
            const exampleName = card.dataset.example;
            if (exampleName && circuitSimulator) {
                circuitSimulator.loadExample(exampleName);
                modal?.classList.add('hidden');
            }
        });
    });
}