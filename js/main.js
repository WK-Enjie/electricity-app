// ========================================
// SINGAPORE O-LEVEL ELECTRICITY APP
// Main JavaScript - Navigation & Core
// ========================================

// ===== GLOBAL STATE =====
const AppState = {
    currentSection: 'home',
    currentSubtopic: null,
    progress: {
        sectionsVisited: new Set(),
        quizzesCompleted: new Set(),
        totalSections: 6
    },
    animations: {
        running: new Map()
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ Electricity Learning App Initialized');
    
    // Initialize all modules
    initNavigation();
    initSubNavigation();
    initTabs();
    initSliders();
    initCalculators();
    initWorkedExamples();
    initMiniQuizzes();
    initSensorTabs();
    initDangerScenarios();
    initSafetyTabs();
    initProgressTracking();
    initTooltips();
    initScrollEffects();
    
    // Load saved progress
    loadProgress();
    
    // Initialize canvas drawings after a short delay
    setTimeout(() => {
        initAllCanvasDrawings();
    }, 100);
});

// ===== NAVIGATION =====
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            navigateTo(section);
        });
    });
}

function navigateTo(sectionId) {
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        AppState.currentSection = sectionId;
        
        // Track progress
        AppState.progress.sectionsVisited.add(sectionId);
        updateProgressBar();
        saveProgress();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Initialize section-specific content
        initSectionContent(sectionId);
    }
}

function initSectionContent(sectionId) {
    // Initialize canvas drawings for the section
    switch(sectionId) {
        case 'current':
            initCurrentElectricityCanvases();
            break;
        case 'circuits':
            initDCCircuitsCanvases();
            break;
        case 'practical':
            initPracticalElectricityCanvases();
            break;
        case 'simulator':
            // Simulator initializes itself
            break;
        case 'quiz':
            initQuizSection();
            break;
    }
}

// ===== SUB-NAVIGATION =====
function initSubNavigation() {
    const subNavButtons = document.querySelectorAll('.sub-nav-btn');
    
    subNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const subtopic = btn.dataset.subtopic;
            const parentNav = btn.closest('.sub-nav');
            const parentSection = btn.closest('.content-section');
            
            // Update active state
            parentNav.querySelectorAll('.sub-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Hide all subtopics in this section
            parentSection.querySelectorAll('.subtopic-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show target subtopic
            const targetSubtopic = document.getElementById(subtopic);
            if (targetSubtopic) {
                targetSubtopic.classList.add('active');
                AppState.currentSubtopic = subtopic;
                
                // Initialize subtopic-specific content
                initSubtopicContent(subtopic);
            }
        });
    });
}

function initSubtopicContent(subtopicId) {
    // Reinitialize canvases when subtopic changes
    setTimeout(() => {
        switch(subtopicId) {
            case 'current-intro':
                drawCurrentFlowAnimation();
                drawAmmeterCircuit();
                break;
            case 'pd-section':
                drawWaterAnalogy();
                drawVoltmeterCircuit();
                break;
            case 'emf-section':
                drawEMFDemo();
                drawCellsSeriesCircuit();
                break;
            case 'resistance-section':
                drawVIRTriangle();
                drawOhmsLawDemo();
                drawWireResistanceDemo();
                break;
            case 'nonohmic-section':
                initNonOhmicGraphs();
                break;
            case 'series-section':
                drawSeriesCircuit();
                break;
            case 'parallel-section':
                drawParallelCircuit();
                break;
            case 'divider-section':
                drawPotentialDivider();
                break;
            case 'power-section':
                drawPowerTriangles();
                break;
            case 'dangers-section':
                drawDangerDemo();
                break;
            case 'safety-section':
                drawSafetyDiagrams();
                break;
        }
    }, 50);
}

// ===== TABS =====
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            const tabContainer = btn.closest('.tabs-container');
            
            // Update active button
            tabContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active content
            tabContainer.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                
                // Initialize tab-specific content
                initTabContent(tabId);
            }
        });
    });
}

function initTabContent(tabId) {
    setTimeout(() => {
        switch(tabId) {
            case 'filament-tab':
                drawFilamentIVGraph();
                break;
            case 'diode-tab':
                drawDiodeIVGraph();
                break;
            case 'thermistor-tab':
                drawThermistorGraph();
                break;
            case 'ldr-tab':
                drawLDRGraph();
                break;
            case 'compare-tab':
                drawCompareAllGraph();
                break;
            case 'fuse-tab':
                drawFuseDiagram();
                break;
            case 'mcb-tab':
                drawMCBDiagram();
                break;
            case 'earth-tab':
                drawEarthingDemo();
                break;
            case 'wiring-tab':
                drawPlugDiagram();
                break;
        }
    }, 50);
}

// ===== SENSOR TABS (for Potential Divider section) =====
function initSensorTabs() {
    const sensorTabButtons = document.querySelectorAll('.sensor-tab-btn');
    
    sensorTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sensor = btn.dataset.sensor;
            
            // Update active button
            document.querySelectorAll('.sensor-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.sensor-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(sensor + '-sensor');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ===== DANGER SCENARIOS =====
function initDangerScenarios() {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    
    scenarioButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const scenario = btn.dataset.scenario;
            
            // Update active button
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active info
            document.querySelectorAll('.scenario-info').forEach(info => {
                info.classList.remove('active');
            });
            
            const targetInfo = document.getElementById(scenario + '-info');
            if (targetInfo) {
                targetInfo.classList.add('active');
            }
            
            // Update canvas demo
            updateDangerDemo(scenario);
        });
    });
}

// ===== SAFETY TABS =====
function initSafetyTabs() {
    // Already handled by general tabs init
    // Add specific handlers for safety feature demos
    
    document.getElementById('earthingNormalBtn')?.addEventListener('click', () => {
        showEarthingState('normal');
    });
    
    document.getElementById('earthingFaultBtn')?.addEventListener('click', () => {
        showEarthingState('fault');
    });
    
    document.getElementById('earthingResetBtn')?.addEventListener('click', () => {
        showEarthingState('reset');
    });
}

// ===== SLIDERS =====
function initSliders() {
    // Generic slider handler
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            handleSliderChange(e.target);
        });
        
        // Initialize display
        handleSliderChange(slider);
    });
}

function handleSliderChange(slider) {
    const id = slider.id;
    const value = parseFloat(slider.value);
    
    // Update associated value display
    const valueDisplayId = id.replace('Slider', 'Value');
    const valueDisplay = document.getElementById(valueDisplayId);
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
    
    // Handle specific sliders
    switch(id) {
        // Current Electricity Section
        case 'voltageSlider':
        case 'resistanceSlider1':
            updateCurrentFlowDemo();
            break;
            
        case 'workDoneSlider':
        case 'chargeSlider2':
            updatePDDemo();
            break;
            
        case 'emfSlider':
        case 'cellSlider':
            updateEMFDemo();
            break;
            
        // Ohm's Law
        case 'ohmVoltageSlider':
        case 'ohmResistanceSlider':
            updateOhmsLawDemo();
            break;
            
        // Wire Resistance
        case 'wireLengthSlider':
        case 'wireThicknessSlider':
            updateWireResistanceDemo();
            break;
            
        // Non-Ohmic Conductors
        case 'filamentVoltageSlider':
            updateFilamentGraph();
            break;
            
        case 'diodeVoltageSlider':
            updateDiodeGraph();
            break;
            
        case 'thermistorTempSlider':
            updateThermistorGraph();
            break;
            
        case 'ldrIntensitySlider':
            updateLDRGraph();
            break;
            
        // DC Circuits
        case 'seriesEmfSlider':
        case 'seriesR1Slider':
        case 'seriesR2Slider':
            updateSeriesCircuit();
            break;
            
        case 'parallelEmfSlider':
        case 'parallelR1Slider':
        case 'parallelR2Slider':
            updateParallelCircuit();
            break;
            
        case 'combinedEmfSlider':
        case 'combinedR1Slider':
        case 'combinedR2Slider':
        case 'combinedR3Slider':
            updateCombinedCircuit();
            break;
            
        // Potential Divider
        case 'dividerVinSlider':
        case 'dividerR1Slider':
        case 'dividerR2Slider':
            updatePotentialDivider();
            break;
            
        case 'thermistorTempSlider2':
            updateThermistorDivider();
            break;
            
        case 'ldrLightSlider2':
            updateLDRDivider();
            break;
            
        // Practical Electricity
        case 'powerVoltageSlider':
        case 'powerWattSlider':
            updatePowerDemo();
            break;
            
        case 'energyPowerSlider':
        case 'energyTimeSlider':
            updateEnergyDemo();
            break;
            
        case 'costPowerSlider':
        case 'costHoursSlider':
        case 'costDaysSlider':
        case 'costRateSlider':
            updateCostCalculator();
            break;
            
        case 'fusePowerSlider':
        case 'fuseVoltageSlider':
            updateFuseCalculator();
            break;
    }
}

// ===== CALCULATOR FUNCTIONS =====
function initCalculators() {
    // Formula selector for power calculator
    const formulaButtons = document.querySelectorAll('.formula-btn');
    formulaButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const formula = btn.dataset.formula;
            
            // Update active button
            document.querySelectorAll('.formula-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide input groups
            document.querySelectorAll('.calc-inputs-group').forEach(group => {
                group.classList.remove('active');
            });
            
            const targetGroup = document.getElementById(formula + '-inputs');
            if (targetGroup) {
                targetGroup.classList.add('active');
            }
        });
    });
    
    // Quick select buttons for energy calculator
    const quickSelectButtons = document.querySelectorAll('.quick-select-btn');
    quickSelectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const power = btn.dataset.power;
            
            // Update active state
            document.querySelectorAll('.quick-select-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update slider and value
            const powerSlider = document.getElementById('energyPowerSlider');
            if (powerSlider) {
                powerSlider.value = power;
                handleSliderChange(powerSlider);
            }
        });
    });
}

// Current Calculator (I = Q/t)
function calculateCurrent() {
    const current = parseFloat(document.getElementById('calcCurrent')?.value);
    const charge = parseFloat(document.getElementById('calcCharge')?.value);
    const time = parseFloat(document.getElementById('calcTime')?.value);
    const resultDiv = document.getElementById('currentCalcResult');
    
    let result = '';
    
    if (!isNaN(charge) && !isNaN(time) && isNaN(current)) {
        const calcCurrent = charge / time;
        result = `<span class="calc-success">I = Q / t = ${charge} / ${time} = <strong>${calcCurrent.toFixed(3)} A</strong></span>`;
        document.getElementById('calcCurrent').value = calcCurrent.toFixed(3);
    } else if (!isNaN(current) && !isNaN(time) && isNaN(charge)) {
        const calcCharge = current * time;
        result = `<span class="calc-success">Q = I × t = ${current} × ${time} = <strong>${calcCharge.toFixed(2)} C</strong></span>`;
        document.getElementById('calcCharge').value = calcCharge.toFixed(2);
    } else if (!isNaN(current) && !isNaN(charge) && isNaN(time)) {
        const calcTime = charge / current;
        result = `<span class="calc-success">t = Q / I = ${charge} / ${current} = <strong>${calcTime.toFixed(2)} s</strong></span>`;
        document.getElementById('calcTime').value = calcTime.toFixed(2);
    } else {
        result = '<span class="calc-error">Please enter exactly two values to calculate the third.</span>';
    }
    
    if (resultDiv) resultDiv.innerHTML = result;
}

// P.D. Calculator (V = W/Q)
function calculatePD() {
    const voltage = parseFloat(document.getElementById('calcVoltage')?.value);
    const work = parseFloat(document.getElementById('calcWork')?.value);
    const charge = parseFloat(document.getElementById('calcCharge2')?.value);
    const resultDiv = document.getElementById('pdCalcResult');
    
    let result = '';
    
    if (!isNaN(work) && !isNaN(charge) && isNaN(voltage)) {
        const calcVoltage = work / charge;
        result = `<span class="calc-success">V = W / Q = ${work} / ${charge} = <strong>${calcVoltage.toFixed(2)} V</strong></span>`;
        document.getElementById('calcVoltage').value = calcVoltage.toFixed(2);
    } else if (!isNaN(voltage) && !isNaN(charge) && isNaN(work)) {
        const calcWork = voltage * charge;
        result = `<span class="calc-success">W = V × Q = ${voltage} × ${charge} = <strong>${calcWork.toFixed(2)} J</strong></span>`;
        document.getElementById('calcWork').value = calcWork.toFixed(2);
    } else if (!isNaN(voltage) && !isNaN(work) && isNaN(charge)) {
        const calcCharge = work / voltage;
        result = `<span class="calc-success">Q = W / V = ${work} / ${voltage} = <strong>${calcCharge.toFixed(2)} C</strong></span>`;
        document.getElementById('calcCharge2').value = calcCharge.toFixed(2);
    } else {
        result = '<span class="calc-error">Please enter exactly two values to calculate the third.</span>';
    }
    
    if (resultDiv) resultDiv.innerHTML = result;
}

// Ohm's Law Calculator (V = IR)
function calculateOhmsLaw() {
    const voltage = parseFloat(document.getElementById('calcOhmV')?.value);
    const current = parseFloat(document.getElementById('calcOhmI')?.value);
    const resistance = parseFloat(document.getElementById('calcOhmR')?.value);
    const resultDiv = document.getElementById('ohmCalcResult');
    
    let result = '';
    
    if (!isNaN(current) && !isNaN(resistance) && isNaN(voltage)) {
        const calcVoltage = current * resistance;
        result = `<span class="calc-success">V = I × R = ${current} × ${resistance} = <strong>${calcVoltage.toFixed(2)} V</strong></span>`;
        document.getElementById('calcOhmV').value = calcVoltage.toFixed(2);
    } else if (!isNaN(voltage) && !isNaN(resistance) && isNaN(current)) {
        const calcCurrent = voltage / resistance;
        result = `<span class="calc-success">I = V / R = ${voltage} / ${resistance} = <strong>${calcCurrent.toFixed(3)} A</strong></span>`;
        document.getElementById('calcOhmI').value = calcCurrent.toFixed(3);
    } else if (!isNaN(voltage) && !isNaN(current) && isNaN(resistance)) {
        const calcResistance = voltage / current;
        result = `<span class="calc-success">R = V / I = ${voltage} / ${current} = <strong>${calcResistance.toFixed(2)} Ω</strong></span>`;
        document.getElementById('calcOhmR').value = calcResistance.toFixed(2);
    } else {
        result = '<span class="calc-error">Please enter exactly two values to calculate the third.</span>';
    }
    
    if (resultDiv) resultDiv.innerHTML = result;
}

// Power Calculator
function calculatePower() {
    const activeFormula = document.querySelector('.formula-btn.active')?.dataset.formula || 'pvi';
    const resultDiv = document.getElementById('powerCalcResult');
    let result = '';
    let power = 0;
    
    switch(activeFormula) {
        case 'pvi':
            const v1 = parseFloat(document.getElementById('calcPviV')?.value);
            const i1 = parseFloat(document.getElementById('calcPviI')?.value);
            if (!isNaN(v1) && !isNaN(i1)) {
                power = v1 * i1;
                result = `<span class="calc-success">P = V × I = ${v1} × ${i1} = <strong>${power.toFixed(2)} W</strong></span>`;
            } else {
                result = '<span class="calc-error">Please enter both voltage and current.</span>';
            }
            break;
            
        case 'pir':
            const i2 = parseFloat(document.getElementById('calcPirI')?.value);
            const r1 = parseFloat(document.getElementById('calcPirR')?.value);
            if (!isNaN(i2) && !isNaN(r1)) {
                power = i2 * i2 * r1;
                result = `<span class="calc-success">P = I²R = ${i2}² × ${r1} = <strong>${power.toFixed(2)} W</strong></span>`;
            } else {
                result = '<span class="calc-error">Please enter both current and resistance.</span>';
            }
            break;
            
        case 'pvr':
            const v2 = parseFloat(document.getElementById('calcPvrV')?.value);
            const r2 = parseFloat(document.getElementById('calcPvrR')?.value);
            if (!isNaN(v2) && !isNaN(r2)) {
                power = (v2 * v2) / r2;
                result = `<span class="calc-success">P = V²/R = ${v2}² / ${r2} = <strong>${power.toFixed(2)} W</strong></span>`;
            } else {
                result = '<span class="calc-error">Please enter both voltage and resistance.</span>';
            }
            break;
    }
    
    if (resultDiv) resultDiv.innerHTML = result;
}

// Potential Divider Calculator
function calculateDivider() {
    const vin = parseFloat(document.getElementById('calcDividerVin')?.value);
    const vout = parseFloat(document.getElementById('calcDividerVout')?.value);
    const r1 = parseFloat(document.getElementById('calcDividerR1')?.value);
    const r2 = parseFloat(document.getElementById('calcDividerR2')?.value);
    const resultDiv = document.getElementById('dividerCalcResult');
    
    let result = '';
    let filledCount = [vin, vout, r1, r2].filter(v => !isNaN(v)).length;
    
    if (filledCount !== 3) {
        result = '<span class="calc-error">Please enter exactly three values to calculate the fourth.</span>';
    } else if (isNaN(vout)) {
        // Calculate Vout
        const calcVout = vin * r2 / (r1 + r2);
        result = `<span class="calc-success">V<sub>out</sub> = V<sub>in</sub> × R₂ / (R₁ + R₂) = ${vin} × ${r2} / (${r1} + ${r2}) = <strong>${calcVout.toFixed(2)} V</strong></span>`;
        document.getElementById('calcDividerVout').value = calcVout.toFixed(2);
    } else if (isNaN(vin)) {
        // Calculate Vin
        const calcVin = vout * (r1 + r2) / r2;
        result = `<span class="calc-success">V<sub>in</sub> = V<sub>out</sub> × (R₁ + R₂) / R₂ = ${vout} × (${r1} + ${r2}) / ${r2} = <strong>${calcVin.toFixed(2)} V</strong></span>`;
        document.getElementById('calcDividerVin').value = calcVin.toFixed(2);
    } else if (isNaN(r1)) {
        // Calculate R1
        const calcR1 = r2 * (vin - vout) / vout;
        result = `<span class="calc-success">R₁ = R₂ × (V<sub>in</sub> - V<sub>out</sub>) / V<sub>out</sub> = ${r2} × (${vin} - ${vout}) / ${vout} = <strong>${calcR1.toFixed(2)} kΩ</strong></span>`;
        document.getElementById('calcDividerR1').value = calcR1.toFixed(2);
    } else if (isNaN(r2)) {
        // Calculate R2
        const calcR2 = r1 * vout / (vin - vout);
        result = `<span class="calc-success">R₂ = R₁ × V<sub>out</sub> / (V<sub>in</sub> - V<sub>out</sub>) = ${r1} × ${vout} / (${vin} - ${vout}) = <strong>${calcR2.toFixed(2)} kΩ</strong></span>`;
        document.getElementById('calcDividerR2').value = calcR2.toFixed(2);
    }
    
    if (resultDiv) resultDiv.innerHTML = result;
}

// Clear Calculator
function clearCalculator(type) {
    switch(type) {
        case 'current':
            document.getElementById('calcCurrent').value = '';
            document.getElementById('calcCharge').value = '';
            document.getElementById('calcTime').value = '';
            document.getElementById('currentCalcResult').innerHTML = '';
            break;
        case 'pd':
            document.getElementById('calcVoltage').value = '';
            document.getElementById('calcWork').value = '';
            document.getElementById('calcCharge2').value = '';
            document.getElementById('pdCalcResult').innerHTML = '';
            break;
        case 'ohm':
            document.getElementById('calcOhmV').value = '';
            document.getElementById('calcOhmI').value = '';
            document.getElementById('calcOhmR').value = '';
            document.getElementById('ohmCalcResult').innerHTML = '';
            break;
        case 'power':
            document.querySelectorAll('.calc-inputs-group input').forEach(input => input.value = '');
            document.getElementById('powerCalcResult').innerHTML = '';
            break;
        case 'divider':
            document.getElementById('calcDividerVin').value = '';
            document.getElementById('calcDividerVout').value = '';
            document.getElementById('calcDividerR1').value = '';
            document.getElementById('calcDividerR2').value = '';
            document.getElementById('dividerCalcResult').innerHTML = '';
            break;
    }
}

// ===== WORKED EXAMPLES =====
function initWorkedExamples() {
    // Reveal buttons are handled by onclick attributes
}

function revealSolution(exampleId) {
    const solutionDiv = document.getElementById(exampleId + 'Solution');
    if (solutionDiv) {
        const content = solutionDiv.querySelector('.solution-content');
        const btn = solutionDiv.querySelector('.reveal-btn');
        
        if (content && btn) {
            content.classList.toggle('hidden');
            
            if (content.classList.contains('hidden')) {
                btn.innerHTML = '<span>👁️</span> Reveal Solution';
            } else {
                btn.innerHTML = '<span>🙈</span> Hide Solution';
            }
        }
    }
}

function toggleHint(hintId) {
    const hintContent = document.getElementById(hintId);
    if (hintContent) {
        hintContent.classList.toggle('hidden');
    }
}

// ===== MINI QUIZZES =====
function initMiniQuizzes() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    
    quizOptions.forEach(option => {
        option.addEventListener('click', () => {
            handleQuizAnswer(option);
        });
    });
}

function handleQuizAnswer(selectedOption) {
    const questionDiv = selectedOption.closest('.quiz-question');
    const feedbackDiv = questionDiv.querySelector('.quiz-feedback');
    const allOptions = questionDiv.querySelectorAll('.quiz-option');
    
    // Disable all options
    allOptions.forEach(opt => {
        opt.disabled = true;
        opt.style.pointerEvents = 'none';
    });
    
    // Check if correct
    const isCorrect = selectedOption.dataset.correct === 'true';
    
    if (isCorrect) {
        selectedOption.classList.add('correct');
        feedbackDiv.innerHTML = '<span style="color: var(--secondary-green);">✅ Correct! Well done!</span>';
        feedbackDiv.style.background = 'rgba(16, 185, 129, 0.1)';
    } else {
        selectedOption.classList.add('incorrect');
        // Find and highlight correct answer
        allOptions.forEach(opt => {
            if (opt.dataset.correct === 'true') {
                opt.classList.add('correct');
            }
        });
        feedbackDiv.innerHTML = '<span style="color: var(--secondary-red);">❌ Not quite. The correct answer is highlighted.</span>';
        feedbackDiv.style.background = 'rgba(239, 68, 68, 0.1)';
    }
    
    feedbackDiv.style.padding = '10px';
    feedbackDiv.style.borderRadius = '8px';
    feedbackDiv.style.marginTop = '10px';
}

// ===== PROGRESS TRACKING =====
function initProgressTracking() {
    updateProgressBar();
}

function updateProgressBar() {
    const visited = AppState.progress.sectionsVisited.size;
    const total = AppState.progress.totalSections;
    const percentage = Math.round((visited / total) * 100);
    
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressBar) {
        progressBar.style.setProperty('--progress', percentage + '%');
    }
    
    if (progressPercent) {
        progressPercent.textContent = percentage;
    }
}

function saveProgress() {
    const progressData = {
        sectionsVisited: Array.from(AppState.progress.sectionsVisited),
        quizzesCompleted: Array.from(AppState.progress.quizzesCompleted),
        lastSection: AppState.currentSection
    };
    
    localStorage.setItem('electricityAppProgress', JSON.stringify(progressData));
}

function loadProgress() {
    const savedData = localStorage.getItem('electricityAppProgress');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            AppState.progress.sectionsVisited = new Set(data.sectionsVisited || []);
            AppState.progress.quizzesCompleted = new Set(data.quizzesCompleted || []);
            
            updateProgressBar();
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }
}

// ===== TOOLTIPS =====
function initTooltips() {
    // Tooltips are handled by CSS using data-tooltip attribute
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    // Add scroll-based animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide');
            }
        });
    }, observerOptions);
    
    // Observe lesson containers
    document.querySelectorAll('.lesson-container, .concept-box, .demo-area').forEach(el => {
        observer.observe(el);
    });
}

// ===== UPDATE FUNCTIONS FOR DEMOS =====

// Current Flow Demo
function updateCurrentFlowDemo() {
    const voltage = parseFloat(document.getElementById('voltageSlider')?.value) || 6;
    const resistance = parseFloat(document.getElementById('resistanceSlider1')?.value) || 10;
    const current = voltage / resistance;
    
    // Update displays
    const currentDisplay = document.getElementById('currentDisplay');
    const chargeDisplay = document.getElementById('chargeDisplay');
    const speedDisplay = document.getElementById('speedDisplay');
    
    if (currentDisplay) currentDisplay.textContent = current.toFixed(2);
    if (chargeDisplay) chargeDisplay.textContent = current.toFixed(2);
    
    if (speedDisplay) {
        if (current < 0.3) speedDisplay.textContent = 'Slow';
        else if (current < 0.6) speedDisplay.textContent = 'Normal';
        else if (current < 1) speedDisplay.textContent = 'Fast';
        else speedDisplay.textContent = 'Very Fast';
    }
    
    // Redraw animation
    drawCurrentFlowAnimation();
}

// P.D. Demo
function updatePDDemo() {
    const work = parseFloat(document.getElementById('workDoneSlider')?.value) || 12;
    const charge = parseFloat(document.getElementById('chargeSlider2')?.value) || 4;
    const pd = work / charge;
    
    document.getElementById('workDisplay').textContent = work;
    document.getElementById('chargeDisplay2').textContent = charge;
    document.getElementById('pdDisplay').textContent = pd.toFixed(2);
}

// EMF Demo
function updateEMFDemo() {
    const emf = parseFloat(document.getElementById('emfSlider')?.value) || 12;
    const cells = parseFloat(document.getElementById('cellSlider')?.value) || 4;
    const emfPerCell = emf / cells;
    
    document.getElementById('totalEmfDisplay').textContent = emf;
    document.getElementById('emfPerCellDisplay').textContent = emfPerCell.toFixed(2);
}

// Ohm's Law Demo
function updateOhmsLawDemo() {
    const voltage = parseFloat(document.getElementById('ohmVoltageSlider')?.value) || 6;
    const resistance = parseFloat(document.getElementById('ohmResistanceSlider')?.value) || 10;
    const current = voltage / resistance;
    
    document.getElementById('ohmVDisplay').textContent = voltage.toFixed(1);
    document.getElementById('ohmRDisplay').textContent = resistance;
    document.getElementById('ohmIDisplay').textContent = current.toFixed(2);
    
    // Redraw
    drawOhmsLawDemo();
}

// Wire Resistance Demo
function updateWireResistanceDemo() {
    const length = parseFloat(document.getElementById('wireLengthSlider')?.value) || 1;
    const thicknessLevel = parseInt(document.getElementById('wireThicknessSlider')?.value) || 2;
    const material = document.getElementById('wireMaterialSelect')?.value || 'copper';
    
    // Thickness labels
    const thicknessLabels = ['Thin', 'Medium', 'Thick'];
    document.getElementById('wireThicknessValue').textContent = thicknessLabels[thicknessLevel - 1];
    
    // Area based on thickness (arbitrary units for demo)
    const areas = [0.5, 1.0, 2.0];
    const area = areas[thicknessLevel - 1];
    
    // Resistivity values (Ω·m)
    const resistivities = {
        'copper': 1.7e-8,
        'aluminium': 2.8e-8,
        'nichrome': 1.1e-6
    };
    
    const rho = resistivities[material];
    const resistance = (rho * length) / (area * 1e-6); // Convert mm² to m²
    
    document.getElementById('wireLDisplay').textContent = length.toFixed(1);
    document.getElementById('wireADisplay').textContent = area.toFixed(1);
    document.getElementById('wireRhoDisplay').textContent = rho.toExponential(1);
    document.getElementById('wireRDisplay').textContent = resistance.toFixed(4);
    
    // Redraw
    drawWireResistanceDemo();
}

// Series Circuit
function updateSeriesCircuit() {
    const emf = parseFloat(document.getElementById('seriesEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('seriesR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('seriesR2Slider')?.value) || 20;
    
    const totalR = r1 + r2;
    const current = emf / totalR;
    const v1 = current * r1;
    const v2 = current * r2;
    
    document.getElementById('seriesTotalR').textContent = totalR;
    document.getElementById('seriesCurrent').textContent = current.toFixed(2);
    document.getElementById('seriesV1').textContent = v1.toFixed(1);
    document.getElementById('seriesV2').textContent = v2.toFixed(1);
    
    // Verification
    document.getElementById('verifyV1').textContent = v1.toFixed(1);
    document.getElementById('verifyV2').textContent = v2.toFixed(1);
    document.getElementById('verifyTotal').textContent = (v1 + v2).toFixed(1);
    
    drawSeriesCircuit();
}

// Parallel Circuit
function updateParallelCircuit() {
    const emf = parseFloat(document.getElementById('parallelEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('parallelR1Slider')?.value) || 20;
    const r2 = parseFloat(document.getElementById('parallelR2Slider')?.value) || 30;
    
    const totalR = (r1 * r2) / (r1 + r2);
    const i1 = emf / r1;
    const i2 = emf / r2;
    const totalI = i1 + i2;
    
    document.getElementById('parallelV').textContent = emf;
    document.getElementById('parallelI1').textContent = i1.toFixed(2);
    document.getElementById('parallelI2').textContent = i2.toFixed(2);
    document.getElementById('parallelTotalI').textContent = totalI.toFixed(2);
    document.getElementById('parallelTotalR').textContent = totalR.toFixed(1);
    
    // Verification
    document.getElementById('verifyI1').textContent = i1.toFixed(2);
    document.getElementById('verifyI2').textContent = i2.toFixed(2);
    document.getElementById('verifyTotalI').textContent = totalI.toFixed(2);
    
    drawParallelCircuit();
}

// Combined Circuit
function updateCombinedCircuit() {
    const emf = parseFloat(document.getElementById('combinedEmfSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('combinedR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('combinedR2Slider')?.value) || 20;
    const r3 = parseFloat(document.getElementById('combinedR3Slider')?.value) || 20;
    
    const rParallel = (r2 * r3) / (r2 + r3);
    const rTotal = r1 + rParallel;
    const current = emf / rTotal;
    
    document.getElementById('combinedRParallel').textContent = rParallel.toFixed(1);
    document.getElementById('combinedRTotal').textContent = rTotal.toFixed(1);
    document.getElementById('combinedITotal').textContent = current.toFixed(2);
    
    // Steps
    document.getElementById('stepParallelR').textContent = rParallel.toFixed(1);
    document.getElementById('stepTotalR').textContent = rTotal.toFixed(1);
    document.getElementById('stepTotalI').textContent = current.toFixed(2);
}

// Potential Divider
function updatePotentialDivider() {
    const vin = parseFloat(document.getElementById('dividerVinSlider')?.value) || 12;
    const r1 = parseFloat(document.getElementById('dividerR1Slider')?.value) || 10;
    const r2 = parseFloat(document.getElementById('dividerR2Slider')?.value) || 10;
    
    const vout = vin * r2 / (r1 + r2);
    const vr1 = vin * r1 / (r1 + r2);
    const current = vin / (r1 + r2); // in mA since R is in kΩ
    const ratio = (vout / vin) * 100;
    
    document.getElementById('dividerVR1').textContent = vr1.toFixed(2);
    document.getElementById('dividerVout').textContent = vout.toFixed(2);
    document.getElementById('dividerCurrent').textContent = current.toFixed(2);
    document.getElementById('dividerRatio').textContent = ratio.toFixed(0);
    
    // Live calculation
    document.getElementById('calcVin').textContent = vin;
    document.getElementById('calcR1').textContent = r1;
    document.getElementById('calcR2').textContent = r2;
    document.getElementById('calcR2b').textContent = r2;
    document.getElementById('calcVin2').textContent = vin;
    document.getElementById('calcR2c').textContent = r2;
    document.getElementById('calcRtotal').textContent = (r1 + r2);
    document.getElementById('calcVoutFinal').textContent = vout.toFixed(2);
    
    drawPotentialDivider();
}

// Thermistor Divider
function updateThermistorDivider() {
    const temp = parseFloat(document.getElementById('thermistorTempSlider2')?.value) || 25;
    
    // Calculate thermistor resistance
    const R25 = 10; // 10kΩ at 25°C
    const B = 3950;
    const T = temp + 273.15;
    const T25 = 298.15;
    const thermR = R25 * Math.exp(B * (1/T - 1/T25));
    
    const fixedR = 10; // 10kΩ fixed resistor
    const vin = 12;
    const vout = vin * thermR / (fixedR + thermR);
    
    document.getElementById('thermistorTempValue2').textContent = temp + '°C';
    document.getElementById('thermistorRValue').textContent = thermR.toFixed(1) + ' kΩ';
    document.getElementById('thermistorVoutValue').textContent = vout.toFixed(2) + ' V';
}

// LDR Divider
function updateLDRDivider() {
    const light = parseFloat(document.getElementById('ldrLightSlider2')?.value) || 50;
    
    // Calculate LDR resistance
    const Rdark = 100; // 100kΩ in darkness
    const gamma = 0.8;
    let ldrR;
    
    if (light <= 0) {
        ldrR = Rdark;
    } else {
        ldrR = Rdark * Math.pow(light / 100, -gamma);
    }
    ldrR = Math.max(0.1, Math.min(100, ldrR));
    
    const fixedR = 10; // 10kΩ fixed resistor
    const vin = 12;
    const vout = vin * ldrR / (fixedR + ldrR);
    
    document.getElementById('ldrLightValue2').textContent = light + '%';
    document.getElementById('ldrRValue').textContent = ldrR.toFixed(1) + ' kΩ';
    document.getElementById('ldrVoutValue').textContent = vout.toFixed(2) + ' V';
}

// Power Demo
function updatePowerDemo() {
    const voltage = parseFloat(document.getElementById('powerVoltageSlider')?.value) || 230;
    const power = parseFloat(document.getElementById('powerWattSlider')?.value) || 60;
    
    const current = power / voltage;
    const resistance = (voltage * voltage) / power;
    
    document.getElementById('powerCurrentResult').textContent = current.toFixed(2);
    document.getElementById('powerResistanceResult').textContent = Math.round(resistance);
    document.getElementById('powerWattResult').textContent = power;
    
    // Calculation lines
    document.getElementById('calcPower1').textContent = power;
    document.getElementById('calcVoltage1').textContent = voltage;
    document.getElementById('calcCurrent1').textContent = current.toFixed(2);
    document.getElementById('calcVoltage2').textContent = voltage;
    document.getElementById('calcPower2').textContent = power;
    document.getElementById('calcResistance1').textContent = Math.round(resistance);
}

// Energy Demo
function updateEnergyDemo() {
    const power = parseFloat(document.getElementById('energyPowerSlider')?.value) || 1500;
    const time = parseFloat(document.getElementById('energyTimeSlider')?.value) || 2;
    
    const energyJ = power * time * 3600; // Convert hours to seconds
    const energyKwh = (power / 1000) * time;
    
    document.getElementById('energyJoulesResult').textContent = energyJ.toLocaleString();
    document.getElementById('energyKwhResult').textContent = energyKwh.toFixed(1);
    document.getElementById('energyUnitsResult').textContent = energyKwh.toFixed(1);
    
    // Calculation lines
    document.getElementById('calcEnergyP').textContent = power;
    document.getElementById('calcEnergyT').textContent = time;
    document.getElementById('calcEnergyP2').textContent = (power / 1000).toFixed(1);
    document.getElementById('calcEnergyT2').textContent = time;
    document.getElementById('calcEnergyResult').textContent = energyKwh.toFixed(1);
}

// Cost Calculator
function updateCostCalculator() {
    const power = parseFloat(document.getElementById('costPowerSlider')?.value) || 1500;
    const hours = parseFloat(document.getElementById('costHoursSlider')?.value) || 8;
    const days = parseFloat(document.getElementById('costDaysSlider')?.value) || 30;
    const rate = parseFloat(document.getElementById('costRateSlider')?.value) || 0.32;
    
    const dailyEnergy = (power / 1000) * hours;
    const totalEnergy = dailyEnergy * days;
    const cost = totalEnergy * rate;
    
    // Update bill
    document.getElementById('billPower').textContent = power + ' W';
    document.getElementById('billHours').textContent = hours + ' hours';
    document.getElementById('billDays').textContent = days + ' days';
    document.getElementById('billEnergy').textContent = totalEnergy.toFixed(0) + ' kWh';
    document.getElementById('billRate').textContent = '$' + rate.toFixed(2) + '/kWh';
    document.getElementById('billTotal').textContent = '$' + cost.toFixed(2);
    
    // Breakdown
    document.getElementById('breakdownPower').textContent = (power / 1000).toFixed(1);
    document.getElementById('breakdownHours').textContent = hours;
    document.getElementById('breakdownDaily').textContent = dailyEnergy.toFixed(1);
    document.getElementById('breakdownDaily2').textContent = dailyEnergy.toFixed(1);
    document.getElementById('breakdownDays').textContent = days;
    document.getElementById('breakdownTotal').textContent = totalEnergy.toFixed(0);
    document.getElementById('breakdownEnergy').textContent = totalEnergy.toFixed(0);
    document.getElementById('breakdownRate').textContent = rate.toFixed(2);
    document.getElementById('breakdownCost').textContent = cost.toFixed(2);
}

// Fuse Calculator
function updateFuseCalculator() {
    const power = parseFloat(document.getElementById('fusePowerSlider')?.value) || 2000;
    const voltage = parseFloat(document.getElementById('fuseVoltageSlider')?.value) || 230;
    
    const current = power / voltage;
    let recommendation;
    
    if (current <= 3) {
        recommendation = '3A';
    } else if (current <= 5) {
        recommendation = '5A';
    } else if (current <= 13) {
        recommendation = '13A';
    } else {
        recommendation = 'Special (>13A)';
    }
    
    document.getElementById('fuseCurrentCalc').textContent = current.toFixed(1);
    document.getElementById('fuseRecommendation').textContent = recommendation;
}

// Overload Calculator
function updateOverload() {
    const checkboxes = document.querySelectorAll('.appliance-checkbox input:checked');
    let totalCurrent = 0;
    
    checkboxes.forEach(cb => {
        totalCurrent += parseFloat(cb.dataset.current);
    });
    
    const display = document.getElementById('totalCurrentDisplay');
    const indicator = document.querySelector('.status-indicator');
    const warning = document.getElementById('overloadWarning');
    
    display.textContent = totalCurrent.toFixed(2);
    
    if (totalCurrent <= 10) {
        indicator.textContent = '✅ Safe';
        indicator.className = 'status-indicator safe';
        warning?.classList.add('hidden');
    } else if (totalCurrent <= 13) {
        indicator.textContent = '⚠️ Warning';
        indicator.className = 'status-indicator warning';
        warning?.classList.add('hidden');
    } else {
        indicator.textContent = '🔥 DANGER!';
        indicator.className = 'status-indicator danger';
        warning?.classList.remove('hidden');
    }
}

// ===== ENERGY USAGE TRACKER =====
let trackerItems = [];

function addToTracker() {
    const select = document.getElementById('trackerApplianceSelect');
    const hoursInput = document.getElementById('trackerHours');
    
    const power = parseInt(select.value);
    const name = select.options[select.selectedIndex].text;
    const hours = parseFloat(hoursInput.value) || 1;
    const energy = (power / 1000) * hours;
    
    trackerItems.push({ name, power, hours, energy });
    
    updateTrackerDisplay();
}

function updateTrackerDisplay() {
    const list = document.getElementById('trackerList');
    const totalEl = document.getElementById('trackerTotalKwh');
    
    list.innerHTML = '';
    let total = 0;
    
    trackerItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'tracker-item';
        div.innerHTML = `
            <span>${item.name} × ${item.hours}h</span>
            <span>${item.energy.toFixed(2)} kWh</span>
            <button onclick="removeTrackerItem(${index})" style="background:none;border:none;cursor:pointer;color:#ef4444;">✕</button>
        `;
        list.appendChild(div);
        total += item.energy;
    });
    
    totalEl.textContent = total.toFixed(2);
}

function removeTrackerItem(index) {
    trackerItems.splice(index, 1);
    updateTrackerDisplay();
}

// ===== APPLIANCE SELECTOR =====
document.getElementById('applianceSelect')?.addEventListener('change', (e) => {
    const selected = e.target.selectedOptions[0];
    const power = parseInt(selected.dataset.power);
    
    if (power > 0) {
        const slider = document.getElementById('powerWattSlider');
        if (slider) {
            slider.value = power;
            handleSliderChange(slider);
        }
    }
});

// ===== WIRE MATERIAL SELECTOR =====
document.getElementById('wireMaterialSelect')?.addEventListener('change', () => {
    updateWireResistanceDemo();
});

// ===== CIRCUIT CONFIG BUTTONS =====
document.getElementById('configType1')?.addEventListener('click', () => {
    document.querySelectorAll('[data-config]').forEach(btn => btn.classList.remove('active'));
    document.getElementById('configType1').classList.add('active');
    updateCombinedCircuit();
});

document.getElementById('configType2')?.addEventListener('click', () => {
    document.querySelectorAll('[data-config]').forEach(btn => btn.classList.remove('active'));
    document.getElementById('configType2').classList.add('active');
    updateCombinedCircuit();
});

// ===== ANIMATION TOGGLE BUTTONS =====
document.getElementById('toggleCurrentFlow')?.addEventListener('click', function() {
    const isRunning = this.classList.toggle('active');
    if (isRunning) {
        this.innerHTML = '<span>⏹️</span> Stop Flow';
        startCurrentFlowAnimation();
    } else {
        this.innerHTML = '<span>▶️</span> Start Flow';
        stopCurrentFlowAnimation();
    }
});

document.getElementById('toggleSeriesAnimation')?.addEventListener('click', function() {
    const isRunning = this.classList.toggle('active');
    if (isRunning) {
        this.innerHTML = '<span>⏹️</span> Stop Animation';
        startSeriesAnimation();
    } else {
        this.innerHTML = '<span>▶️</span> Start Animation';
        stopSeriesAnimation();
    }
});

document.getElementById('toggleParallelAnimation')?.addEventListener('click', function() {
    const isRunning = this.classList.toggle('active');
    if (isRunning) {
        this.innerHTML = '<span>⏹️</span> Stop Animation';
        startParallelAnimation();
    } else {
        this.innerHTML = '<span>▶️</span> Start Animation';
        stopParallelAnimation();
    }
});

// ===== I-V GRAPH ANIMATION BUTTONS =====
document.getElementById('animateFilamentGraph')?.addEventListener('click', () => {
    animateFilamentIVGraph();
});

document.getElementById('resetFilamentGraph')?.addEventListener('click', () => {
    resetFilamentGraph();
});

document.getElementById('animateDiodeGraph')?.addEventListener('click', () => {
    animateDiodeIVGraph();
});

document.getElementById('resetDiodeGraph')?.addEventListener('click', () => {
    resetDiodeGraph();
});

document.getElementById('animateThermistorGraph')?.addEventListener('click', () => {
    animateThermistorGraph();
});

document.getElementById('animateLDRGraph')?.addEventListener('click', () => {
    animateLDRGraph();
});

// ===== THERMISTOR/LDR DEMO BUTTONS =====
document.getElementById('heatThermistor')?.addEventListener('click', () => {
    animateThermistorHeating();
});

document.getElementById('coolThermistor')?.addEventListener('click', () => {
    animateThermistorCooling();
});

// ===== HELPER FUNCTIONS =====

// Format number with units
function formatWithUnits(value, unit) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + ' M' + unit;
    } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + ' k' + unit;
    } else if (value >= 1) {
        return value.toFixed(2) + ' ' + unit;
    } else if (value >= 0.001) {
        return (value * 1000).toFixed(2) + ' m' + unit;
    } else {
        return (value * 1000000).toFixed(2) + ' μ' + unit;
    }
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Linear interpolation
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Map value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// ===== PLACEHOLDER FUNCTIONS FOR CANVAS DRAWINGS =====
// These will be implemented in animations.js (Part 10)

function initAllCanvasDrawings() {
    // Initialize all canvas drawings
    console.log('Initializing canvas drawings...');
}

function initCurrentElectricityCanvases() {
    drawCurrentFlowAnimation();
    drawAmmeterCircuit();
    drawWaterAnalogy();
    drawVoltmeterCircuit();
    drawVIRTriangle();
}

function initDCCircuitsCanvases() {
    drawSeriesCircuit();
    drawParallelCircuit();
    drawPotentialDivider();
}

function initPracticalElectricityCanvases() {
    drawPowerTriangles();
    drawEnergyMeter();
    drawDangerDemo();
}

function initNonOhmicGraphs() {
    drawFilamentIVGraph();
    drawDiodeIVGraph();
    drawThermistorGraph();
    drawLDRGraph();
    drawCompareAllGraph();
}

// Placeholder drawing functions - implemented in animations.js
function drawCurrentFlowAnimation() { /* Implemented in animations.js */ }
function drawAmmeterCircuit() { /* Implemented in animations.js */ }
function drawWaterAnalogy() { /* Implemented in animations.js */ }
function drawVoltmeterCircuit() { /* Implemented in animations.js */ }
function drawEMFDemo() { /* Implemented in animations.js */ }
function drawCellsSeriesCircuit() { /* Implemented in animations.js */ }
function drawVIRTriangle() { /* Implemented in animations.js */ }
function drawOhmsLawDemo() { /* Implemented in animations.js */ }
function drawWireResistanceDemo() { /* Implemented in animations.js */ }
function drawFilamentIVGraph() { /* Implemented in animations.js */ }
function drawDiodeIVGraph() { /* Implemented in animations.js */ }
function drawThermistorGraph() { /* Implemented in animations.js */ }
function drawLDRGraph() { /* Implemented in animations.js */ }
function drawCompareAllGraph() { /* Implemented in animations.js */ }
function drawSeriesCircuit() { /* Implemented in animations.js */ }
function drawParallelCircuit() { /* Implemented in animations.js */ }
function drawPotentialDivider() { /* Implemented in animations.js */ }
function drawPowerTriangles() { /* Implemented in animations.js */ }
function drawEnergyMeter() { /* Implemented in animations.js */ }
function drawDangerDemo() { /* Implemented in animations.js */ }
function drawSafetyDiagrams() { /* Implemented in animations.js */ }
function drawFuseDiagram() { /* Implemented in animations.js */ }
function drawMCBDiagram() { /* Implemented in animations.js */ }
function drawEarthingDemo() { /* Implemented in animations.js */ }
function drawPlugDiagram() { /* Implemented in animations.js */ }

function updateFilamentGraph() { /* Implemented in animations.js */ }
function updateDiodeGraph() { /* Implemented in animations.js */ }
function updateThermistorGraph() { /* Implemented in animations.js */ }
function updateLDRGraph() { /* Implemented in animations.js */ }
function updateDangerDemo() { /* Implemented in animations.js */ }
function showEarthingState() { /* Implemented in animations.js */ }

function startCurrentFlowAnimation() { /* Implemented in animations.js */ }
function stopCurrentFlowAnimation() { /* Implemented in animations.js */ }
function startSeriesAnimation() { /* Implemented in animations.js */ }
function stopSeriesAnimation() { /* Implemented in animations.js */ }
function startParallelAnimation() { /* Implemented in animations.js */ }
function stopParallelAnimation() { /* Implemented in animations.js */ }

function animateFilamentIVGraph() { /* Implemented in animations.js */ }
function resetFilamentGraph() { /* Implemented in animations.js */ }
function animateDiodeIVGraph() { /* Implemented in animations.js */ }
function resetDiodeGraph() { /* Implemented in animations.js */ }
function animateThermistorGraph() { /* Implemented in animations.js */ }
function animateLDRGraph() { /* Implemented in animations.js */ }
function animateThermistorHeating() { /* Implemented in animations.js */ }
function animateThermistorCooling() { /* Implemented in animations.js */ }

function initQuizSection() { /* Implemented in quizzes.js */ }

// ===== ADDITIONAL CSS FOR CALCULATORS =====
// Add these styles to your CSS if not already present
const additionalStyles = `
.calc-success {
    color: var(--secondary-green);
}

.calc-error {
    color: var(--secondary-red);
}

.calc-result {
    margin-top: 15px;
    padding: 15px;
    background: var(--bg-dark);
    border-radius: var(--radius-md);
    font-family: monospace;
    font-size: 1.1rem;
}

.calc-result:empty {
    display: none;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// ===== EXPORT FOR USE IN OTHER MODULES =====
window.AppState = AppState;
window.navigateTo = navigateTo;
window.revealSolution = revealSolution;
window.toggleHint = toggleHint;
window.calculateCurrent = calculateCurrent;
window.calculatePD = calculatePD;
window.calculateOhmsLaw = calculateOhmsLaw;
window.calculatePower = calculatePower;
window.calculateDivider = calculateDivider;
window.clearCalculator = clearCalculator;
window.addToTracker = addToTracker;
window.removeTrackerItem = removeTrackerItem;
window.updateOverload = updateOverload;

console.log('⚡ Main.js loaded successfully');