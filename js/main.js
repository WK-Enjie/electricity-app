/* ═══════════════════════════════════════════════════════════════
   ⚡ ELECTRICITY EXPLORER — main.js
   Navigation, sidebar, page transitions, calculators, progress
   ═══════════════════════════════════════════════════════════════ */

// ─── PAGE REGISTRY ───
const PAGE_ORDER = [
    'welcome',
    'current', 'pd', 'emf', 'resistance', 'nonohmic',
    'series', 'parallel', 'divider',
    'power', 'energy', 'safety',
    'builder',
    'quiz1', 'quiz2', 'quiz3'
];

const PAGE_TITLES = {
    welcome:    '⚡ Electricity Explorer',
    current:    '⚡ Electric Current',
    pd:         '🔋 Potential Difference',
    emf:        '🔌 Electromotive Force',
    resistance: '🔧 Resistance & Ohm\'s Law',
    nonohmic:   '📈 Non-Ohmic Conductors',
    series:     '🔗 Series Circuits',
    parallel:   '🔀 Parallel Circuits',
    divider:    '⚖️ Potential Divider',
    power:      '💡 Electrical Power',
    energy:     '⚡ Energy & Cost',
    safety:     '⚠️ Dangers & Safety',
    builder: '🔨 Circuit Builder',
    quiz1:      '🎯 Quiz: Current Electricity',
    quiz2:      '🎯 Quiz: DC Circuits',
    quiz3:      '🎯 Quiz: Practical Electricity'
};

let currentPage = 'welcome';
let visitedPages = new Set(['welcome']);

// ─── DOM READY ───
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initSidebar();
    initAllSliders();
    initCalculators();
    updateProgress();

    // Check URL hash for deep linking
    const hash = window.location.hash.replace('#', '');
    if (hash && PAGE_ORDER.includes(hash)) {
        goTo(hash, false);
    }

    // Initialize canvas sizes after a brief delay to ensure layout is ready
    setTimeout(function () {
        resizeAllCanvases();
        initAllInteractives();
    }, 100);

    window.addEventListener('resize', debounce(function () {
        resizeAllCanvases();
        redrawCurrentPage();
    }, 200));
});


/* ═══════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════ */

function goTo(pageId, animate) {
    if (animate === undefined) animate = true;
    if (!PAGE_ORDER.includes(pageId)) return;

    // Hide current page
    const currentEl = document.getElementById('sec-' + currentPage);
    if (currentEl) {
        currentEl.classList.remove('active');
    }

    // Show new page
    currentPage = pageId;
    visitedPages.add(pageId);
    const newEl = document.getElementById('sec-' + pageId);
    if (newEl) {
        // Small delay for transition effect
        if (animate) {
            setTimeout(function () {
                newEl.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        } else {
            newEl.classList.add('active');
            window.scrollTo(0, 0);
        }
    }

    // Update sidebar active link
    updateActiveLink(pageId);

    // Update progress bar
    updateProgress();

    // Update URL hash
    history.replaceState(null, '', '#' + pageId);

    // Update document title
    document.title = (PAGE_TITLES[pageId] || 'Electricity Explorer') + ' | O-Level Physics';

    // Close sidebar on mobile
    closeSidebar();

    // Initialize page-specific interactives
    setTimeout(function () {
        initPageInteractives(pageId);
    }, 150);
}

function updateActiveLink(pageId) {
    // Remove all active links
    document.querySelectorAll('.chapter-links li a').forEach(function (a) {
        a.classList.remove('active-link');
    });
    // Find and highlight the link that leads to this page
    document.querySelectorAll('.chapter-links li a').forEach(function (a) {
        const onclick = a.getAttribute('onclick') || '';
        if (onclick.includes("'" + pageId + "'") || onclick.includes('"' + pageId + '"')) {
            a.classList.add('active-link');
        }
    });
}

function updateProgress() {
    // Calculate progress based on visited content pages (excluding welcome)
    var contentPages = PAGE_ORDER.filter(function (p) { return p !== 'welcome'; });
    var visited = 0;
    contentPages.forEach(function (p) {
        if (visitedPages.has(p)) visited++;
    });
    var pct = Math.round((visited / contentPages.length) * 100);
    var bar = document.getElementById('progress-bar');
    if (bar) {
        bar.style.width = pct + '%';
        bar.title = pct + '% explored';
    }
}


/* ═══════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════ */

function initSidebar() {
    document.getElementById('menu-btn').addEventListener('click', openSidebar);
    document.getElementById('close-nav').addEventListener('click', closeSidebar);
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('visible');
    document.body.style.overflow = '';
}

function toggleChapter(chId) {
    var list = document.getElementById(chId + '-list');
    var arrow = document.getElementById(chId + '-arrow');
    if (!list || !arrow) return;

    var isOpen = list.classList.contains('show');
    if (isOpen) {
        list.classList.remove('show');
        arrow.classList.remove('open');
        arrow.textContent = '▸';
    } else {
        list.classList.add('show');
        arrow.classList.add('open');
        arrow.textContent = '▾';
    }
}

function initNavigation() {
    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            var idx = PAGE_ORDER.indexOf(currentPage);
            if (idx < PAGE_ORDER.length - 1) {
                e.preventDefault();
                goTo(PAGE_ORDER[idx + 1]);
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            var idx2 = PAGE_ORDER.indexOf(currentPage);
            if (idx2 > 0) {
                e.preventDefault();
                goTo(PAGE_ORDER[idx2 - 1]);
            }
        } else if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}


/* ═══════════════════════════════════════
   CANVAS UTILITIES
   ═══════════════════════════════════════ */

function resizeAllCanvases() {
    document.querySelectorAll('.canvas-wrap canvas').forEach(function (canvas) {
        resizeCanvas(canvas);
    });
}

function resizeCanvas(canvas) {
    var wrap = canvas.parentElement;
    if (!wrap) return;
    var rect = wrap.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var w = rect.width;
    var h = getCanvasHeight(canvas.id, w);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getCanvasHeight(id, width) {
    // Define aspect ratios for different canvases
    var ratios = {
        'canvas-current-flow': 0.4,
        'canvas-pd-circuit':   0.5,
        'canvas-water-analogy': 0.5,
        'canvas-emf':          0.55,
        'canvas-ohm':          0.55,
        'canvas-wire':         0.35,
        'canvas-iv':           0.55,
        'canvas-series':       0.5,
        'canvas-parallel':     0.55,
        'canvas-divider':      0.55,
        'canvas-sensor':       0.5,
        'canvas-power-tri':    0.45,
        'canvas-plug':         0.6,
        'canvas-dangers':      0.55
    };
    var ratio = ratios[id] || 0.5;
    var h = Math.round(width * ratio);
    // Min / Max
    if (h < 200) h = 200;
    if (h > 500) h = 500;
    return h;
}

// Get CSS-pixel dimensions for drawing logic
function cw(canvas) { return parseFloat(canvas.style.width); }
function ch(canvas) { return parseFloat(canvas.style.height); }


/* ═══════════════════════════════════════
   DRAWING HELPERS
   ═══════════════════════════════════════ */

function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, cw(canvas), ch(canvas));
}

// Draw rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

// Draw text centred at (x, y)
function drawCentredText(ctx, text, x, y, font, colour) {
    ctx.save();
    ctx.font = font || '14px Segoe UI, sans-serif';
    ctx.fillStyle = colour || '#e2e4ea';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Draw text left-aligned at (x, y)
function drawText(ctx, text, x, y, font, colour, align) {
    ctx.save();
    ctx.font = font || '13px Segoe UI, sans-serif';
    ctx.fillStyle = colour || '#e2e4ea';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
}

// ─── CIRCUIT SYMBOL HELPERS (Singapore O-Level convention) ───

// Draw BATTERY symbol (long/short lines)
function drawBattery(ctx, x, y, size) {
    var s = size || 20;
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';
    ctx.lineWidth = 2;

    // Long line (positive)
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.6);
    ctx.lineTo(x, y + s * 0.6);
    ctx.stroke();

    // Short line (negative)
    ctx.beginPath();
    ctx.moveTo(x + s * 0.4, y - s * 0.35);
    ctx.lineTo(x + s * 0.4, y + s * 0.35);
    ctx.stroke();

    // + and - labels
    drawText(ctx, '+', x - 6, y - s * 0.6 - 10, '11px sans-serif', '#ef5350', 'center');
    drawText(ctx, '−', x + s * 0.4 + 1, y - s * 0.35 - 10, '11px sans-serif', '#42a5f5', 'center');

    ctx.restore();
}

// Draw RESISTOR (rectangular box — Singapore/British convention)
function drawResistor(ctx, x, y, w, h, label) {
    var rw = w || 50;
    var rh = h || 20;
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'transparent';
    ctx.strokeRect(x - rw / 2, y - rh / 2, rw, rh);

    if (label) {
        drawCentredText(ctx, label, x, y, '12px Segoe UI, sans-serif', '#4fc3f7');
    }
    ctx.restore();
}

// Draw BULB (circle with cross — Singapore convention)
function drawBulb(ctx, x, y, r, on) {
    var radius = r || 14;
    ctx.save();

    // Glow if on
    if (on) {
        ctx.shadowColor = '#ffee58';
        ctx.shadowBlur = 15;
    }

    ctx.strokeStyle = on ? '#ffee58' : '#e2e4ea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Cross inside
    ctx.beginPath();
    var d = radius * 0.707; // cos(45°)
    ctx.moveTo(x - d, y - d);
    ctx.lineTo(x + d, y + d);
    ctx.moveTo(x + d, y - d);
    ctx.lineTo(x - d, y + d);
    ctx.stroke();

    ctx.restore();
}

// Draw AMMETER (circle with A)
function drawAmmeter(ctx, x, y, r) {
    var radius = r || 14;
    ctx.save();
    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    drawCentredText(ctx, 'A', x, y, 'bold 13px sans-serif', '#ef5350');
    ctx.restore();
}

// Draw VOLTMETER (circle with V)
function drawVoltmeter(ctx, x, y, r) {
    var radius = r || 14;
    ctx.save();
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    drawCentredText(ctx, 'V', x, y, 'bold 13px sans-serif', '#42a5f5');
    ctx.restore();
}

// Draw SWITCH (open or closed)
function drawSwitch(ctx, x1, y1, x2, y2, closed) {
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#e2e4ea';

    // Two dots
    ctx.beginPath();
    ctx.arc(x1, y1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y2, 3, 0, Math.PI * 2);
    ctx.fill();

    if (closed) {
        // Straight line between dots
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    } else {
        // Angled line (open switch)
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2 - 18);
        ctx.stroke();
    }
    ctx.restore();
}

// Draw CELL (single)
function drawCell(ctx, x, y, size) {
    var s = size || 16;
    ctx.save();
    ctx.strokeStyle = '#e2e4ea';
    ctx.lineWidth = 2;
    // Long line
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.6);
    ctx.lineTo(x, y + s * 0.6);
    ctx.stroke();
    // Short line
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.35, y - s * 0.35);
    ctx.lineTo(x + s * 0.35, y + s * 0.35);
    ctx.stroke();
    ctx.restore();
}

// Draw wire (line between two points)
function drawWire(ctx, x1, y1, x2, y2, colour) {
    ctx.save();
    ctx.strokeStyle = colour || '#e2e4ea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

// Draw arrow
function drawArrow(ctx, x1, y1, x2, y2, colour, headLen) {
    var hl = headLen || 10;
    var angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.strokeStyle = colour || '#e2e4ea';
    ctx.fillStyle = colour || '#e2e4ea';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(angle - Math.PI / 6), y2 - hl * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - hl * Math.cos(angle + Math.PI / 6), y2 - hl * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Draw dashed line
function drawDashedLine(ctx, x1, y1, x2, y2, colour) {
    ctx.save();
    ctx.strokeStyle = colour || '#8b90a0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

// Draw electron (moving charge dot)
function drawElectron(ctx, x, y, r) {
    var radius = r || 5;
    ctx.save();
    ctx.fillStyle = '#42a5f5';
    ctx.shadowColor = '#42a5f5';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // minus sign
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 2.5, y);
    ctx.lineTo(x + 2.5, y);
    ctx.stroke();
    ctx.restore();
}


/* ═══════════════════════════════════════
   CALCULATORS
   ═══════════════════════════════════════ */

function initCalculators() {
    // Auto-calculate on input change
    bindAutoCalc('calc-cur-q', calcCurrent);
    bindAutoCalc('calc-cur-t', calcCurrent);
    bindAutoCalc('calc-pd-w', calcPD);
    bindAutoCalc('calc-pd-q', calcPD);
    bindAutoCalc('calc-pow-v', calcPower);
    bindAutoCalc('calc-pow-i', calcPower);
    bindAutoCalc('calc-en-p', calcEnergy);
    bindAutoCalc('calc-en-h', calcEnergy);
    bindAutoCalc('calc-en-d', calcEnergy);
    bindAutoCalc('calc-en-rate', calcEnergy);
    bindAutoCalc('calc-fuse-p', calcFuse);
    bindAutoCalc('calc-fuse-v', calcFuse);
}

function bindAutoCalc(inputId, calcFn) {
    var el = document.getElementById(inputId);
    if (el) {
        el.addEventListener('input', calcFn);
    }
}

// 1. Current calculator: I = Q / t
function calcCurrent() {
    var q = parseFloat(document.getElementById('calc-cur-q').value) || 0;
    var t = parseFloat(document.getElementById('calc-cur-t').value) || 0.001;
    if (t <= 0) t = 0.001;
    var i = q / t;
    document.getElementById('res-current').innerHTML =
        'I = Q / t = ' + q + ' / ' + t + ' = <strong>' + i.toFixed(2) + ' A</strong>';
}

// 2. PD calculator: V = W / Q
function calcPD() {
    var w = parseFloat(document.getElementById('calc-pd-w').value) || 0;
    var q = parseFloat(document.getElementById('calc-pd-q').value) || 0.001;
    if (q <= 0) q = 0.001;
    var v = w / q;
    document.getElementById('res-pd').innerHTML =
        'V = W / Q = ' + w + ' / ' + q + ' = <strong>' + v.toFixed(2) + ' V</strong>';
}

// 3. Power calculator: P = VI
function calcPower() {
    var v = parseFloat(document.getElementById('calc-pow-v').value) || 0;
    var i = parseFloat(document.getElementById('calc-pow-i').value) || 0;
    var p = v * i;
    var kw = p / 1000;
    var txt = 'P = V × I = ' + v + ' × ' + i + ' = <strong>' + p.toFixed(1) + ' W';
    if (p >= 1000) txt += ' = ' + kw.toFixed(2) + ' kW';
    txt += '</strong>';
    document.getElementById('res-power').innerHTML = txt;
}

// 4. Energy / Cost calculator
function calcEnergy() {
    var p = parseFloat(document.getElementById('calc-en-p').value) || 0;
    var h = parseFloat(document.getElementById('calc-en-h').value) || 0;
    var d = parseFloat(document.getElementById('calc-en-d').value) || 1;
    var rate = parseFloat(document.getElementById('calc-en-rate').value) || 0;

    var pkw = p / 1000;
    var totalH = h * d;
    var kwh = pkw * totalH;
    var joules = p * totalH * 3600;
    var cost = kwh * rate;

    var html = '';
    html += '<p>Power = ' + p + ' W = <strong>' + pkw.toFixed(3) + ' kW</strong></p>';
    html += '<p>Total time = ' + h + ' h/day × ' + d + ' days = <strong>' + totalH.toFixed(1) + ' h</strong></p>';
    html += '<p>Energy = ' + pkw.toFixed(3) + ' kW × ' + totalH.toFixed(1) + ' h = <strong>' + kwh.toFixed(2) + ' kWh</strong></p>';
    html += '<p>Energy = <strong>' + joules.toExponential(2) + ' J</strong></p>';
    html += '<p>💰 Cost = ' + kwh.toFixed(2) + ' × $' + rate.toFixed(2) + ' = <strong>$' + cost.toFixed(2) + '</strong></p>';
    document.getElementById('res-energy').innerHTML = html;
}

// 5. Fuse rating calculator
function calcFuse() {
    var p = parseFloat(document.getElementById('calc-fuse-p').value) || 0;
    var v = parseFloat(document.getElementById('calc-fuse-v').value) || 240;
    if (v <= 0) v = 1;
    var i = p / v;

    // Standard fuse ratings
    var fuses = [3, 5, 13];
    var chosen = 13;
    for (var f = 0; f < fuses.length; f++) {
        if (fuses[f] >= i) {
            chosen = fuses[f];
            break;
        }
    }

    var html = '';
    html += '<p>Normal operating current I = P / V = ' + p + ' / ' + v + ' = <strong>' + i.toFixed(2) + ' A</strong></p>';
    html += '<p>Recommended fuse: <strong>' + chosen + ' A</strong>';
    html += ' <span style="font-size:0.82rem;color:#8b90a0">(next standard rating above ' + i.toFixed(2) + ' A)</span></p>';

    if (i > 13) {
        html += '<p style="color:#ef5350">⚠️ Current exceeds 13 A — this appliance needs a dedicated circuit!</p>';
    }

    document.getElementById('res-fuse').innerHTML = html;
}


/* ═══════════════════════════════════════
   SLIDER BINDINGS
   ═══════════════════════════════════════ */

function initAllSliders() {
    // Current flow
    bindSlider('slider-current', 'lbl-current-val', function (v) {
        if (typeof animateCurrentFlow === 'function') animateCurrentFlow();
    }, 1);

    // EMF
    bindSlider('slider-emf', 'lbl-emf', updateEMF, 1);
    bindSlider('slider-int-r', 'lbl-int-r', updateEMF, 1);
    bindSlider('slider-ext-r', 'lbl-ext-r', updateEMF, 1);

    // Ohm's Law
    bindSlider('slider-ohm-r', 'lbl-ohm-r', updateOhm, 0);
    bindSlider('slider-ohm-v', 'lbl-ohm-v', updateOhm, 1);

    // Wire
    bindSlider('slider-wire-len', 'lbl-wire-len', updateWire, 1);
    bindSlider('slider-wire-dia', 'lbl-wire-dia', updateWire, 1);

    // Series
    bindSlider('slider-ser-v', 'lbl-ser-v', updateSeries, 0);
    bindSlider('slider-ser-r1', 'lbl-ser-r1', updateSeries, 0);
    bindSlider('slider-ser-r2', 'lbl-ser-r2', updateSeries, 0);

    // Parallel
    bindSlider('slider-par-v', 'lbl-par-v', updateParallel, 0);
    bindSlider('slider-par-r1', 'lbl-par-r1', updateParallel, 0);
    bindSlider('slider-par-r2', 'lbl-par-r2', updateParallel, 0);

    // Divider
    bindSlider('slider-div-vs', 'lbl-div-vs', updateDivider, 0);
    bindSlider('slider-div-r1', 'lbl-div-r1', updateDivider, 0);
    bindSlider('slider-div-r2', 'lbl-div-r2', updateDivider, 0);

    // Sensor
    bindSlider('slider-sensor', 'lbl-sensor', updateSensor, 0);
}

function bindSlider(sliderId, labelId, callback, decimals) {
    var slider = document.getElementById(sliderId);
    if (!slider) return;
    slider.addEventListener('input', function () {
        var val = parseFloat(slider.value);
        var label = document.getElementById(labelId);
        if (label) {
            label.textContent = (decimals !== undefined) ? val.toFixed(decimals) : val;
        }
        if (callback) callback();
    });
}


/* ═══════════════════════════════════════
   EMF UPDATE
   ═══════════════════════════════════════ */

function updateEMF() {
    var emf = parseFloat(document.getElementById('slider-emf').value);
    var r = parseFloat(document.getElementById('slider-int-r').value);
    var R = parseFloat(document.getElementById('slider-ext-r').value);

    var I = emf / (R + r);
    var Vterm = emf - I * r;
    var lost = I * r;

    document.getElementById('emf-i').textContent = I.toFixed(2);
    document.getElementById('emf-v').textContent = Vterm.toFixed(2);
    document.getElementById('emf-lost').textContent = lost.toFixed(2);

    if (typeof drawEMFCircuit === 'function') drawEMFCircuit();
}


/* ═══════════════════════════════════════
   OHM'S LAW UPDATE
   ═══════════════════════════════════════ */

function updateOhm() {
    var R = parseFloat(document.getElementById('slider-ohm-r').value);
    var V = parseFloat(document.getElementById('slider-ohm-v').value);
    if (R <= 0) R = 0.1;
    var I = V / R;
    document.getElementById('res-ohm').innerHTML =
        'I = V / R = ' + V.toFixed(1) + ' / ' + R + ' = <strong>' + I.toFixed(3) + ' A</strong>';

    if (typeof drawOhmGraph === 'function') drawOhmGraph();
}


/* ═══════════════════════════════════════
   WIRE RESISTANCE UPDATE
   ═══════════════════════════════════════ */

function updateWire() {
    var len = parseFloat(document.getElementById('slider-wire-len').value);
    var dia = parseFloat(document.getElementById('slider-wire-dia').value);

    // Resistance ∝ length / area. Use resistivity of nichrome ~ 1.1e-6 Ω·m
    var radius_m = (dia / 2) * 1e-3;
    var area = Math.PI * radius_m * radius_m;
    var rho = 1.1e-6; // nichrome
    var R = (rho * len) / area;

    document.getElementById('res-wire').innerHTML =
        'Resistance ≈ <strong>' + R.toFixed(2) + ' Ω</strong>';

    if (typeof drawWireDemo === 'function') drawWireDemo();
}


/* ═══════════════════════════════════════
   SERIES CIRCUIT UPDATE
   ═══════════════════════════════════════ */

function updateSeries() {
    var V = parseFloat(document.getElementById('slider-ser-v').value);
    var R1 = parseFloat(document.getElementById('slider-ser-r1').value);
    var R2 = parseFloat(document.getElementById('slider-ser-r2').value);
    var Rt = R1 + R2;
    var I = V / Rt;
    var V1 = I * R1;
    var V2 = I * R2;

    var html = '';
    html += '<p>R<sub>total</sub> = ' + R1 + ' + ' + R2 + ' = <strong>' + Rt + ' Ω</strong></p>';
    html += '<p>I = V / R<sub>T</sub> = ' + V + ' / ' + Rt + ' = <strong>' + I.toFixed(3) + ' A</strong></p>';
    html += '<p>V₁ = IR₁ = ' + I.toFixed(3) + ' × ' + R1 + ' = <strong>' + V1.toFixed(2) + ' V</strong></p>';
    html += '<p>V₂ = IR₂ = ' + I.toFixed(3) + ' × ' + R2 + ' = <strong>' + V2.toFixed(2) + ' V</strong></p>';
    html += '<p>Check: V₁ + V₂ = ' + V1.toFixed(2) + ' + ' + V2.toFixed(2) + ' = <strong>' + (V1 + V2).toFixed(2) + ' V ✓</strong></p>';
    document.getElementById('res-series').innerHTML = html;

    if (typeof drawSeriesCircuit === 'function') drawSeriesCircuit();
}


/* ═══════════════════════════════════════
   PARALLEL CIRCUIT UPDATE
   ═══════════════════════════════════════ */

function updateParallel() {
    var V = parseFloat(document.getElementById('slider-par-v').value);
    var R1 = parseFloat(document.getElementById('slider-par-r1').value);
    var R2 = parseFloat(document.getElementById('slider-par-r2').value);
    var Rt = (R1 * R2) / (R1 + R2);
    var It = V / Rt;
    var I1 = V / R1;
    var I2 = V / R2;

    var html = '';
    html += '<p>1/R<sub>T</sub> = 1/' + R1 + ' + 1/' + R2 + '</p>';
    html += '<p>R<sub>T</sub> = <strong>' + Rt.toFixed(2) + ' Ω</strong></p>';
    html += '<p>I<sub>total</sub> = V/R<sub>T</sub> = ' + V + '/' + Rt.toFixed(2) + ' = <strong>' + It.toFixed(3) + ' A</strong></p>';
    html += '<p>I₁ = V/R₁ = ' + V + '/' + R1 + ' = <strong>' + I1.toFixed(3) + ' A</strong></p>';
    html += '<p>I₂ = V/R₂ = ' + V + '/' + R2 + ' = <strong>' + I2.toFixed(3) + ' A</strong></p>';
    html += '<p>Check: I₁ + I₂ = ' + I1.toFixed(3) + ' + ' + I2.toFixed(3) + ' = <strong>' + (I1 + I2).toFixed(3) + ' A ✓</strong></p>';
    document.getElementById('res-parallel').innerHTML = html;

    if (typeof drawParallelCircuit === 'function') drawParallelCircuit();
}


/* ═══════════════════════════════════════
   POTENTIAL DIVIDER UPDATE
   ═══════════════════════════════════════ */

function updateDivider() {
    var Vs = parseFloat(document.getElementById('slider-div-vs').value);
    var R1 = parseFloat(document.getElementById('slider-div-r1').value);
    var R2 = parseFloat(document.getElementById('slider-div-r2').value);
    var Rt = R1 + R2;
    var V1 = (R1 / Rt) * Vs;
    var V2 = (R2 / Rt) * Vs;
    var I = Vs / Rt;

    var html = '';
    html += '<p>V₁ = R₁/(R₁+R₂) × V<sub>s</sub> = ' + R1 + '/' + Rt + ' × ' + Vs + ' = <strong>' + V1.toFixed(2) + ' V</strong></p>';
    html += '<p>V₂ = R₂/(R₁+R₂) × V<sub>s</sub> = ' + R2 + '/' + Rt + ' × ' + Vs + ' = <strong>' + V2.toFixed(2) + ' V</strong></p>';
    html += '<p>Current I = V<sub>s</sub>/(R₁+R₂) = <strong>' + I.toFixed(3) + ' A</strong></p>';
    html += '<p>Ratio V₁:V₂ = R₁:R₂ = <strong>' + R1 + ':' + R2 + '</strong></p>';
    document.getElementById('res-divider').innerHTML = html;

    // Update voltage bars
    var v1bar = document.getElementById('v1-bar');
    var v2bar = document.getElementById('v2-bar');
    if (v1bar && v2bar) {
        v1bar.style.flex = V1;
        v2bar.style.flex = V2;
        document.getElementById('v1-label').textContent = 'V₁ = ' + V1.toFixed(1) + ' V';
        document.getElementById('v2-label').textContent = 'V₂ = ' + V2.toFixed(1) + ' V';
    }

    if (typeof drawDividerCircuit === 'function') drawDividerCircuit();
}


/* ═══════════════════════════════════════
   SENSOR DIVIDER
   ═══════════════════════════════════════ */

var currentSensor = 'therm'; // 'therm' or 'ldr'

function selectSensor(type) {
    currentSensor = type;
    // Update tab buttons
    var tabs = document.querySelectorAll('#sec-divider .tab-bar:last-of-type .tab-btn');
    tabs.forEach(function (btn) { btn.classList.remove('active'); });
    if (type === 'therm') {
        if (tabs[0]) tabs[0].classList.add('active');
        document.getElementById('sensor-label').innerHTML = 'Temperature: <strong id="lbl-sensor">' +
            document.getElementById('slider-sensor').value + '</strong> °C';
        document.getElementById('slider-sensor').min = 0;
        document.getElementById('slider-sensor').max = 100;
    } else {
        if (tabs[1]) tabs[1].classList.add('active');
        document.getElementById('sensor-label').innerHTML = 'Light level: <strong id="lbl-sensor">' +
            document.getElementById('slider-sensor').value + '</strong> %';
        document.getElementById('slider-sensor').min = 0;
        document.getElementById('slider-sensor').max = 100;
    }
    updateSensor();
}

function updateSensor() {
    var val = parseFloat(document.getElementById('slider-sensor').value);
    var label = document.getElementById('lbl-sensor');
    if (label) label.textContent = val;

    var Rfixed = 10; // 10 kΩ fixed resistor
    var Rsensor;
    var Vs = 5; // 5V supply

    if (currentSensor === 'therm') {
        // Thermistor: R decreases with temperature
        // Approximate: R = 50 * exp(-0.03 * T) kΩ
        Rsensor = 50 * Math.exp(-0.03 * val);
    } else {
        // LDR: R decreases with light
        // Approximate: R = 100 * exp(-0.04 * light) kΩ
        Rsensor = 100 * Math.exp(-0.04 * val);
    }

    var Vout = (Rfixed / (Rfixed + Rsensor)) * Vs;
    var Vsensor = (Rsensor / (Rfixed + Rsensor)) * Vs;

    var html = '';
    html += '<p>R<sub>sensor</sub> ≈ <strong>' + Rsensor.toFixed(1) + ' kΩ</strong></p>';
    html += '<p>R<sub>fixed</sub> = <strong>' + Rfixed + ' kΩ</strong></p>';
    html += '<p>V<sub>out</sub> (across fixed R) = <strong>' + Vout.toFixed(2) + ' V</strong></p>';
    html += '<p>V<sub>sensor</sub> = <strong>' + Vsensor.toFixed(2) + ' V</strong></p>';
    document.getElementById('res-sensor').innerHTML = html;

    if (typeof drawSensorCircuit === 'function') drawSensorCircuit();
}


/* ═══════════════════════════════════════
   NON-OHMIC CONDUCTOR TABS
   ═══════════════════════════════════════ */

var currentConductor = 'ohmic';

var conductorDescriptions = {
    ohmic: '<strong>Ohmic Conductor</strong> (e.g. constantan wire at constant temperature)<br><br>' +
        'The I–V graph is a <strong>straight line through the origin</strong>. The resistance is <strong>constant</strong> ' +
        'because the temperature does not change significantly.<br><br>' +
        '✅ Obeys Ohm\'s Law: V ∝ I',

    filament: '<strong>Filament Lamp</strong><br><br>' +
        'As current increases, the filament heats up → temperature rises → resistance increases.<br>' +
        'The I–V curve <strong>bends towards the V-axis</strong> (gradient decreases).<br><br>' +
        '❌ Does NOT obey Ohm\'s Law — resistance is NOT constant.',

    diode: '<strong>Semiconductor Diode</strong><br><br>' +
        '<strong>Forward bias</strong> (V > ~0.7 V): Current increases steeply once the threshold voltage is exceeded.<br>' +
        '<strong>Reverse bias</strong> (V < 0): Almost zero current — very high resistance.<br><br>' +
        '❌ Does NOT obey Ohm\'s Law — allows current in <strong>one direction only</strong>.'
};

function showConductor(type) {
    currentConductor = type;
    // Update tabs
    document.querySelectorAll('#conductor-tabs .tab-btn').forEach(function (btn) {
        btn.classList.remove('active');
    });
    var tabs = document.querySelectorAll('#conductor-tabs .tab-btn');
    if (type === 'ohmic' && tabs[0]) tabs[0].classList.add('active');
    if (type === 'filament' && tabs[1]) tabs[1].classList.add('active');
    if (type === 'diode' && tabs[2]) tabs[2].classList.add('active');

    document.getElementById('conductor-desc').innerHTML = conductorDescriptions[type] || '';

    if (typeof drawIVGraph === 'function') drawIVGraph();
}


/* ═══════════════════════════════════════
   PAGE-SPECIFIC INITIALIZATION
   ═══════════════════════════════════════ */

function initAllInteractives() {
    // Only init the current page
    initPageInteractives(currentPage);
}

function initPageInteractives(pageId) {
    switch (pageId) {
        case 'current':
            resizeCanvasById('canvas-current-flow');
            if (typeof startCurrentFlowAnimation === 'function') startCurrentFlowAnimation();
            break;
        case 'pd':
            resizeCanvasById('canvas-pd-circuit');
            resizeCanvasById('canvas-water-analogy');
            if (typeof drawPDCircuit === 'function') drawPDCircuit();
            if (typeof drawWaterAnalogy === 'function') drawWaterAnalogy();
            break;
        case 'emf':
            resizeCanvasById('canvas-emf');
            updateEMF();
            break;
        case 'resistance':
            resizeCanvasById('canvas-ohm');
            resizeCanvasById('canvas-wire');
            updateOhm();
            updateWire();
            break;
        case 'nonohmic':
            resizeCanvasById('canvas-iv');
            showConductor(currentConductor);
            break;
        case 'series':
            resizeCanvasById('canvas-series');
            updateSeries();
            break;
        case 'parallel':
            resizeCanvasById('canvas-parallel');
            updateParallel();
            break;
        case 'divider':
            resizeCanvasById('canvas-divider');
            resizeCanvasById('canvas-sensor');
            updateDivider();
            updateSensor();
            break;
        case 'power':
            resizeCanvasById('canvas-power-tri');
            if (typeof drawPowerTriangle === 'function') drawPowerTriangle();
            break;
        case 'safety':
            resizeCanvasById('canvas-plug');
            resizeCanvasById('canvas-dangers');
            if (typeof drawPlug === 'function') drawPlug();
            if (typeof drawDangerRoom === 'function') drawDangerRoom();
            break;
        case 'builder':
            resizeCanvasById('canvas-builder');
            if (typeof initBuilder === 'function') initBuilder();
            break;
        case 'quiz1':
            if (typeof initQuiz === 'function') initQuiz('quiz1');
            break;
        case 'quiz2':
            if (typeof initQuiz === 'function') initQuiz('quiz2');
            break;
        case 'quiz3':
            if (typeof initQuiz === 'function') initQuiz('quiz3');
            break;
    }
}

function resizeCanvasById(id) {
    var canvas = document.getElementById(id);
    if (canvas) resizeCanvas(canvas);
}

function redrawCurrentPage() {
    initPageInteractives(currentPage);
}


/* ═══════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════ */

function debounce(fn, delay) {
    var timer;
    return function () {
        clearTimeout(timer);
        var args = arguments;
        var context = this;
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}