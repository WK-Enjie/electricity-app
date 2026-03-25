// ========================================
// SINGAPORE O-LEVEL ELECTRICITY APP
// Main JavaScript - Navigation & Core logic
// ========================================

const AppState = { currentSection: 'home', currentSubtopic: null };

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSubNavigation();
    initSliders();
    setTimeout(() => { initAllCanvasDrawings(); }, 100);
});

function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.section).classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            initAllCanvasDrawings();
        });
    });
}

function initSubNavigation() {
    document.querySelectorAll('.sub-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parentNav = btn.closest('.sub-nav');
            const parentSection = btn.closest('.content-section');
            parentNav.querySelectorAll('.sub-nav-btn').forEach(b => b.classList.remove('active'));
            parentSection.querySelectorAll('.subtopic-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.subtopic).classList.add('active');
            initAllCanvasDrawings();
        });
    });
}

function initSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => handleSliderChange(e.target));
        handleSliderChange(slider); // Init value on load
    });

    // Checkboxes for overload calculator
    document.querySelectorAll('.appliance-checkbox input').forEach(cb => {
        cb.addEventListener('change', updateOverload);
    });
    
    // Config buttons for Combined Circuit
    document.getElementById('configType1')?.addEventListener('click', function() {
        document.getElementById('configType2').classList.remove('active');
        this.classList.add('active');
        updateCombinedCircuit();
    });
    document.getElementById('configType2')?.addEventListener('click', function() {
        document.getElementById('configType1').classList.remove('active');
        this.classList.add('active');
        updateCombinedCircuit();
    });

    // Animation toggles
    document.getElementById('toggleCurrentFlow')?.addEventListener('click', function() {
        if(this.classList.toggle('active')) { this.innerHTML = '<span>⏹️</span> Stop Flow'; window.startCurrentFlowAnimation(); }
        else { this.innerHTML = '<span>▶️</span> Start Flow'; window.stopCurrentFlowAnimation(); }
    });
    document.getElementById('toggleSeriesAnimation')?.addEventListener('click', function() {
        if(this.classList.toggle('active')) { this.innerHTML = '<span>⏹️</span> Stop Animation'; window.startSeriesAnimation(); }
        else { this.innerHTML = '<span>▶️</span> Start Animation'; window.stopSeriesAnimation(); }
    });
    document.getElementById('toggleParallelAnimation')?.addEventListener('click', function() {
        if(this.classList.toggle('active')) { this.innerHTML = '<span>⏹️</span> Stop Animation'; window.startParallelAnimation(); }
        else { this.innerHTML = '<span>▶️</span> Start Animation'; window.stopParallelAnimation(); }
    });
}

function handleSliderChange(slider) {
    const valueDisplay = document.getElementById(slider.id.replace('Slider', 'Value'));
    if (valueDisplay) valueDisplay.textContent = slider.value;

    if(slider.id.includes('series')) updateSeriesCircuit();
    if(slider.id.includes('parallel')) updateParallelCircuit();
    if(slider.id.includes('combined')) updateCombinedCircuit();
    if(slider.id.includes('divider')) updatePotentialDivider();
    if(slider.id.includes('power')) updatePowerDemo();
    if(slider.id.includes('energy')) updateEnergyDemo();
    if(slider.id.includes('cost')) updateCostCalculator();
    if(slider.id.includes('voltage') && !slider.id.includes('power')) { if(window.drawCurrentFlowAnimation) window.drawCurrentFlowAnimation(); }
}

function updateSeriesCircuit() {
    const emf = parseFloat(document.getElementById('seriesEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('seriesR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('seriesR2Slider')?.value) || 20;
    const current = emf / (r1 + r2);
    
    safeSet('seriesTotalR', (r1 + r2));
    safeSet('seriesCurrent', current.toFixed(2));
    safeSet('seriesV1', (current * r1).toFixed(1));
    safeSet('seriesV2', (current * r2).toFixed(1));
    safeSet('verifyV1', (current * r1).toFixed(1));
    safeSet('verifyV2', (current * r2).toFixed(1));
    safeSet('verifyTotal', emf.toFixed(1));
    
    if(window.drawSeriesCircuit) window.drawSeriesCircuit();
}

function updateParallelCircuit() {
    const emf = parseFloat(document.getElementById('parallelEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('parallelR1Slider')?.value) || 20;
    const r2 = parseFloat(document.getElementById('parallelR2Slider')?.value) || 30;
    const i1 = emf / r1; const i2 = emf / r2; const totalR = (r1 * r2) / (r1 + r2);
    
    safeSet('parallelV', emf);
    safeSet('parallelI1', i1.toFixed(2));
    safeSet('parallelI2', i2.toFixed(2));
    safeSet('parallelTotalI', (i1 + i2).toFixed(2));
    safeSet('parallelTotalR', totalR.toFixed(1));
    safeSet('verifyI1', i1.toFixed(2));
    safeSet('verifyI2', i2.toFixed(2));
    safeSet('verifyTotalI', (i1 + i2).toFixed(2));
    
    if(window.drawParallelCircuit) window.drawParallelCircuit();
}

function updateCombinedCircuit() {
    const emf = parseFloat(document.getElementById('combinedEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('combinedR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('combinedR2Slider')?.value) || 20;
    const r3 = parseFloat(document.getElementById('combinedR3Slider')?.value) || 20;
    const isType1 = document.getElementById('configType1')?.classList.contains('active');
    
    let rTotal, rParallel, current;
    if(isType1) {
        rParallel = (r2 * r3) / (r2 + r3);
        rTotal = r1 + rParallel;
    } else {
        rParallel = (r1 * r2) / (r1 + r2);
        rTotal = r3 + rParallel;
    }
    current = emf / rTotal;
    
    safeSet('combinedRParallel', rParallel.toFixed(1));
    safeSet('combinedRTotal', rTotal.toFixed(1));
    safeSet('combinedITotal', current.toFixed(2));
    safeSet('stepParallelR', rParallel.toFixed(1));
    safeSet('stepTotalR', rTotal.toFixed(1));
    safeSet('stepTotalI', current.toFixed(2));
    
    if(window.drawCombinedCircuit) window.drawCombinedCircuit();
}

function updatePotentialDivider() {
    const vin = parseFloat(document.getElementById('dividerVinSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('dividerR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('dividerR2Slider')?.value) || 10;
    const vout = vin * r2 / (r1 + r2);
    
    safeSet('dividerVR1', (vin - vout).toFixed(2));
    safeSet('dividerVout', vout.toFixed(2));
    safeSet('dividerCurrent', (vin / (r1 + r2)).toFixed(2));
    safeSet('dividerRatio', ((vout / vin) * 100).toFixed(0));
    
    safeSet('calcVin', vin); safeSet('calcR1', r1); safeSet('calcR2', r2); safeSet('calcR2b', r2);
    safeSet('calcVin2', vin); safeSet('calcR2c', r2); safeSet('calcRtotal', (r1 + r2)); safeSet('calcVoutFinal', vout.toFixed(2));
    
    if(window.drawPotentialDivider) window.drawPotentialDivider();
}

function updatePowerDemo() {
    const v = parseFloat(document.getElementById('powerVoltageSlider')?.value) || 230;
    const p = parseFloat(document.getElementById('powerWattSlider')?.value) || 60;
    const i = p / v; const r = (v * v) / p;
    
    safeSet('powerCurrentResult', i.toFixed(2));
    safeSet('powerResistanceResult', Math.round(r));
    safeSet('powerWattResult', p);
    
    safeSet('calcPower1', p); safeSet('calcVoltage1', v); safeSet('calcCurrent1', i.toFixed(2));
    safeSet('calcVoltage2', v); safeSet('calcPower2', p); safeSet('calcResistance1', Math.round(r));
}

function updateEnergyDemo() {
    const p = parseFloat(document.getElementById('energyPowerSlider')?.value) || 1500;
    const t = parseFloat(document.getElementById('energyTimeSlider')?.value) || 2;
    const kwh = (p / 1000) * t;
    
    safeSet('energyJoulesResult', (p * t * 3600).toLocaleString());
    safeSet('energyKwhResult', kwh.toFixed(1));
    safeSet('energyUnitsResult', kwh.toFixed(1));
    
    safeSet('calcEnergyP', p); safeSet('calcEnergyT', t);
    safeSet('calcEnergyP2', (p / 1000).toFixed(1)); safeSet('calcEnergyT2', t);
    safeSet('calcEnergyResult', kwh.toFixed(1));
}

function updateCostCalculator() {
    const power = parseFloat(document.getElementById('costPowerSlider')?.value) || 1500;
    const hours = parseFloat(document.getElementById('costHoursSlider')?.value) || 8;
    const days = parseFloat(document.getElementById('costDaysSlider')?.value) || 30;
    const rate = parseFloat(document.getElementById('costRateSlider')?.value) || 0.32;
    
    const dailyEnergy = (power / 1000) * hours;
    const totalEnergy = dailyEnergy * days;
    const cost = totalEnergy * rate;
    
    safeSet('billPower', power + ' W');
    safeSet('billHours', hours + ' hours');
    safeSet('billDays', days + ' days');
    safeSet('billEnergy', totalEnergy.toFixed(0) + ' kWh');
    safeSet('billRate', '$' + rate.toFixed(2) + '/kWh');
    safeSet('billTotal', '$' + cost.toFixed(2));
    
    safeSet('breakdownPower', (power / 1000).toFixed(1));
    safeSet('breakdownHours', hours);
    safeSet('breakdownDaily', dailyEnergy.toFixed(1));
    safeSet('breakdownDaily2', dailyEnergy.toFixed(1));
    safeSet('breakdownDays', days);
    safeSet('breakdownTotal', totalEnergy.toFixed(0));
    safeSet('breakdownEnergy', totalEnergy.toFixed(0));
    safeSet('breakdownRate', rate.toFixed(2));
    safeSet('breakdownCost', cost.toFixed(2));
}

function updateOverload() {
    let totalCurrent = 0;
    document.querySelectorAll('.appliance-checkbox input:checked').forEach(cb => {
        totalCurrent += parseFloat(cb.dataset.current);
    });
    
    safeSet('totalCurrentDisplay', totalCurrent.toFixed(2));
    const indicator = document.querySelector('.status-indicator');
    const warning = document.getElementById('overloadWarning');
    
    if (totalCurrent <= 10) {
        indicator.textContent = '✅ Safe'; indicator.className = 'status-indicator safe';
        if(warning) warning.classList.add('hidden');
    } else if (totalCurrent <= 13) {
        indicator.textContent = '⚠️ Warning'; indicator.className = 'status-indicator warning';
        if(warning) warning.classList.add('hidden');
    } else {
        indicator.textContent = '🔥 DANGER (Fuse Blown)!'; indicator.className = 'status-indicator danger';
        if(warning) warning.classList.remove('hidden');
    }
}

function safeSet(id, value) {
    const el = document.getElementById(id);
    if(el) el.textContent = value;
}

function initAllCanvasDrawings() {
    if(window.drawStaticSeriesCircuit) window.drawStaticSeriesCircuit();
    if(window.drawSeriesCircuit) window.drawSeriesCircuit();
    if(window.drawStaticParallelCircuit) window.drawStaticParallelCircuit();
    if(window.drawParallelCircuit) window.drawParallelCircuit();
    if(window.drawCombinedCircuit) window.drawCombinedCircuit();
    if(window.drawPotentialDivider) window.drawPotentialDivider();
    if(window.drawSocket) window.drawSocket();
}

window.updateOverload = updateOverload;