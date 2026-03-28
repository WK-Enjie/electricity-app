/* ═══════════════════════════════════════════════════════════════
   ⚡ ELECTRICITY EXPLORER — quizzes.js
   Quiz engine with 3 question banks:
     • Quiz 1: Current Electricity (current, PD, EMF, resistance, non-ohmic)
     • Quiz 2: DC Circuits (series, parallel, potential divider)
     • Quiz 3: Practical Electricity (power, energy, cost, safety)
   ═══════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════
   QUESTION BANKS
   ═══════════════════════════════════════ */

var quizData = {

    /* ─────────────────────────────────
       QUIZ 1: CURRENT ELECTRICITY
       ───────────────────────────────── */
    quiz1: [
        {
            q: "Electric current is defined as the:",
            opts: [
                "A) Force on a charge in an electric field",
                "B) Rate of flow of electric charge",
                "C) Energy carried by electrons",
                "D) Resistance per unit length of wire"
            ],
            ans: 1,
            explain: "Electric current is the <strong>rate of flow of electric charge</strong>. Mathematically, I = Q / t, measured in amperes (A)."
        },
        {
            q: "A charge of 15 C flows through a point in a circuit in 5 seconds. What is the current?",
            opts: [
                "A) 75 A",
                "B) 0.33 A",
                "C) 3.0 A",
                "D) 20 A"
            ],
            ans: 2,
            explain: "I = Q / t = 15 / 5 = <strong>3.0 A</strong>."
        },
        {
            q: "In which direction does conventional current flow?",
            opts: [
                "A) From negative terminal to positive terminal",
                "B) From positive terminal to negative terminal",
                "C) In the same direction as electron flow",
                "D) It depends on the type of circuit"
            ],
            ans: 1,
            explain: "Conventional current flows from <strong>positive to negative</strong> terminal. This is opposite to the actual electron flow (negative to positive)."
        },
        {
            q: "An ammeter is connected in _____ with a component and has _____ resistance.",
            opts: [
                "A) parallel; very high",
                "B) series; very high",
                "C) parallel; very low",
                "D) series; very low"
            ],
            ans: 3,
            explain: "An ammeter must be in <strong>series</strong> to measure the current flowing through the component, and it must have <strong>very low resistance</strong> so it does not significantly affect the current."
        },
        {
            q: "The potential difference across a component is defined as the:",
            opts: [
                "A) Total charge flowing per second",
                "B) Energy converted from electrical to other forms per unit charge",
                "C) Total resistance of the circuit",
                "D) Force acting on each electron"
            ],
            ans: 1,
            explain: "Potential difference (V) is the <strong>energy converted from electrical energy to other forms per unit charge</strong> passing between two points. V = W / Q."
        },
        {
            q: "A voltmeter should be connected in _____ with a component.",
            opts: [
                "A) series",
                "B) parallel",
                "C) any orientation",
                "D) alternating positions"
            ],
            ans: 1,
            explain: "A voltmeter is connected in <strong>parallel</strong> across the component to measure the potential difference. It has very high resistance to avoid drawing significant current."
        },
        {
            q: "Which statement correctly distinguishes e.m.f. from p.d.?",
            opts: [
                "A) E.m.f. is measured across a component; p.d. is measured across the source",
                "B) E.m.f. converts electrical energy to other forms; p.d. converts other forms to electrical",
                "C) E.m.f. is energy converted to electrical per unit charge; p.d. is energy converted from electrical per unit charge",
                "D) There is no difference between e.m.f. and p.d."
            ],
            ans: 2,
            explain: "E.m.f. (ε) is the energy converted from other forms <strong>to electrical energy</strong> per unit charge by the source. P.d. (V) is the energy converted <strong>from electrical energy</strong> to other forms per unit charge across a component."
        },
        {
            q: "A battery has an e.m.f. of 6.0 V and internal resistance of 0.5 Ω. When connected to a 5.5 Ω resistor, what is the terminal p.d.?",
            opts: [
                "A) 6.0 V",
                "B) 5.5 V",
                "C) 5.0 V",
                "D) 0.5 V"
            ],
            ans: 1,
            explain: "I = ε / (R + r) = 6.0 / (5.5 + 0.5) = 1.0 A. Terminal p.d. = ε − Ir = 6.0 − (1.0)(0.5) = <strong>5.5 V</strong>."
        },
        {
            q: "The resistance of a wire increases when:",
            opts: [
                "A) Its length decreases",
                "B) Its cross-sectional area increases",
                "C) Its temperature increases (for metallic conductors)",
                "D) A smaller current flows through it"
            ],
            ans: 2,
            explain: "For metallic conductors, resistance <strong>increases with temperature</strong>. Higher temperature causes more lattice vibrations, impeding electron flow. R also increases with length and decreases with cross-sectional area."
        },
        {
            q: "Which I–V graph represents a filament lamp?",
            opts: [
                "A) A straight line through the origin",
                "B) A curve that bends towards the V-axis (gradient decreasing)",
                "C) A horizontal line",
                "D) A vertical line at 0.7 V then a sharp rise"
            ],
            ans: 1,
            explain: "A filament lamp has a <strong>curve bending towards the V-axis</strong>. As current increases, the filament heats up → resistance increases → gradient of I–V graph decreases. Option D describes a semiconductor diode."
        }
    ],

    /* ─────────────────────────────────
       QUIZ 2: DC CIRCUITS
       ───────────────────────────────── */
    quiz2: [
        {
            q: "In a series circuit, which quantity is the same through all components?",
            opts: [
                "A) Voltage",
                "B) Resistance",
                "C) Current",
                "D) Power"
            ],
            ans: 2,
            explain: "In a series circuit, the <strong>current is the same</strong> at every point. I = I₁ = I₂ = I₃."
        },
        {
            q: "Two resistors of 6 Ω and 12 Ω are connected in series to a 9 V battery. What is the total resistance?",
            opts: [
                "A) 4 Ω",
                "B) 18 Ω",
                "C) 2 Ω",
                "D) 72 Ω"
            ],
            ans: 1,
            explain: "In series: R_total = R₁ + R₂ = 6 + 12 = <strong>18 Ω</strong>."
        },
        {
            q: "In a parallel circuit, which quantity is the same across all branches?",
            opts: [
                "A) Current",
                "B) Resistance",
                "C) Potential difference",
                "D) Charge"
            ],
            ans: 2,
            explain: "In a parallel circuit, the <strong>p.d. across each branch is the same</strong>. V = V₁ = V₂ = V₃."
        },
        {
            q: "Two resistors of 6 Ω and 12 Ω are connected in parallel. What is the combined resistance?",
            opts: [
                "A) 18 Ω",
                "B) 4 Ω",
                "C) 2 Ω",
                "D) 72 Ω"
            ],
            ans: 1,
            explain: "In parallel: 1/R_T = 1/6 + 1/12 = 2/12 + 1/12 = 3/12 → R_T = 12/3 = <strong>4 Ω</strong>. Note: combined resistance in parallel is always less than the smallest individual resistance."
        },
        {
            q: "In a series circuit with a 12 V battery, R₁ = 4 Ω and R₂ = 8 Ω. What is the voltage across R₂?",
            opts: [
                "A) 4 V",
                "B) 8 V",
                "C) 12 V",
                "D) 6 V"
            ],
            ans: 1,
            explain: "I = V / R_T = 12 / 12 = 1 A. V₂ = IR₂ = 1 × 8 = <strong>8 V</strong>. Alternatively, V₂ = R₂/(R₁+R₂) × V = 8/12 × 12 = 8 V."
        },
        {
            q: "The potential divider formula states that V₁/V₂ equals:",
            opts: [
                "A) R₂ / R₁",
                "B) R₁ / R₂",
                "C) R₁ × R₂",
                "D) (R₁ + R₂) / R₁"
            ],
            ans: 1,
            explain: "In a potential divider, the voltage across each resistor is proportional to its resistance: <strong>V₁/V₂ = R₁/R₂</strong>. The larger resistor gets the larger share of the voltage."
        },
        {
            q: "In a potential divider with Vs = 10 V, R₁ = 3 kΩ and R₂ = 7 kΩ, what is V₂ (across R₂)?",
            opts: [
                "A) 3 V",
                "B) 7 V",
                "C) 10 V",
                "D) 4.3 V"
            ],
            ans: 1,
            explain: "V₂ = R₂/(R₁+R₂) × Vs = 7/(3+7) × 10 = 7/10 × 10 = <strong>7 V</strong>."
        },
        {
            q: "A thermistor is placed in series with a fixed resistor in a potential divider. When temperature increases, what happens to the output voltage across the fixed resistor?",
            opts: [
                "A) It decreases",
                "B) It increases",
                "C) It stays the same",
                "D) It drops to zero"
            ],
            ans: 1,
            explain: "Temperature ↑ → Thermistor resistance ↓ → Its share of voltage ↓ → Voltage across fixed resistor <strong>increases</strong> (since total voltage is constant)."
        },
        {
            q: "In a parallel circuit with a 6 V supply, R₁ = 3 Ω and R₂ = 6 Ω. What is the total current drawn from the supply?",
            opts: [
                "A) 1 A",
                "B) 2 A",
                "C) 3 A",
                "D) 9 A"
            ],
            ans: 2,
            explain: "I₁ = V/R₁ = 6/3 = 2 A. I₂ = V/R₂ = 6/6 = 1 A. I_total = I₁ + I₂ = 2 + 1 = <strong>3 A</strong>."
        },
        {
            q: "An LDR (Light Dependent Resistor) is used in a potential divider circuit. When the light intensity increases, the resistance of the LDR:",
            opts: [
                "A) Increases",
                "B) Decreases",
                "C) Remains unchanged",
                "D) Becomes infinite"
            ],
            ans: 1,
            explain: "When light intensity increases, the resistance of an LDR <strong>decreases</strong>. More photons free more charge carriers, reducing resistance."
        }
    ],

    /* ─────────────────────────────────
       QUIZ 3: PRACTICAL ELECTRICITY
       ───────────────────────────────── */
    quiz3: [
        {
            q: "The formula for electrical power is:",
            opts: [
                "A) P = V / I",
                "B) P = I / V",
                "C) P = V × I",
                "D) P = V + I"
            ],
            ans: 2,
            explain: "Electrical power <strong>P = V × I</strong>. It can also be expressed as P = I²R or P = V²/R."
        },
        {
            q: "A 240 V kettle draws a current of 10 A. What is its power rating?",
            opts: [
                "A) 24 W",
                "B) 2400 W",
                "C) 250 W",
                "D) 2.4 W"
            ],
            ans: 1,
            explain: "P = V × I = 240 × 10 = <strong>2400 W</strong> (or 2.4 kW)."
        },
        {
            q: "The formula for electrical energy consumed is:",
            opts: [
                "A) E = P / t",
                "B) E = P × t",
                "C) E = P × V",
                "D) E = I × R"
            ],
            ans: 1,
            explain: "Electrical energy <strong>E = P × t</strong>, which can also be written as E = V × I × t."
        },
        {
            q: "A 2 kW heater is used for 3 hours. How much energy does it consume in kWh?",
            opts: [
                "A) 6 kWh",
                "B) 0.67 kWh",
                "C) 6000 kWh",
                "D) 1.5 kWh"
            ],
            ans: 0,
            explain: "Energy = Power × Time = 2 kW × 3 h = <strong>6 kWh</strong>."
        },
        {
            q: "If 1 kWh of electricity costs $0.33, what is the cost of running a 500 W fan for 10 hours?",
            opts: [
                "A) $1.65",
                "B) $16.50",
                "C) $0.165",
                "D) $3.30"
            ],
            ans: 0,
            explain: "Energy = 0.5 kW × 10 h = 5 kWh. Cost = 5 × $0.33 = <strong>$1.65</strong>."
        },
        {
            q: "Which of the following is a danger of using electricity in damp conditions?",
            opts: [
                "A) The circuit becomes more efficient",
                "B) Water conducts electricity, increasing the risk of electric shock",
                "C) It reduces the current in the circuit",
                "D) It increases the resistance of all components"
            ],
            ans: 1,
            explain: "Water conducts electricity. Damp conditions create unintended conducting paths through the body, greatly increasing the risk of <strong>electric shock</strong>."
        },
        {
            q: "A fuse should be connected in the:",
            opts: [
                "A) Neutral wire",
                "B) Earth wire",
                "C) Live wire",
                "D) Any wire"
            ],
            ans: 2,
            explain: "The fuse must be in the <strong>live wire</strong>. When it blows, it disconnects the appliance from the high-voltage supply, making it safe."
        },
        {
            q: "A 2000 W appliance operates at 250 V. What fuse rating should be used? (Available: 3 A, 5 A, 13 A)",
            opts: [
                "A) 3 A",
                "B) 5 A",
                "C) 13 A",
                "D) 20 A"
            ],
            ans: 2,
            explain: "I = P / V = 2000 / 250 = 8 A. The fuse must be rated slightly above 8 A. The next standard rating is <strong>13 A</strong>."
        },
        {
            q: "What is the purpose of the earth wire in a 3-pin plug?",
            opts: [
                "A) To carry current to the appliance",
                "B) To return current to the supply",
                "C) To provide a low-resistance path to ground in case of a fault, so the fuse blows",
                "D) To increase the power of the appliance"
            ],
            ans: 2,
            explain: "The earth wire connects the metal casing to the ground. If the live wire touches the casing, a large current flows through the earth wire → <strong>fuse blows</strong> → circuit breaks → user is protected."
        },
        {
            q: "Overloading a circuit is dangerous because:",
            opts: [
                "A) It causes the voltage to increase",
                "B) It reduces the current in the wires",
                "C) Excessive current causes wires to overheat, which may start a fire",
                "D) It causes the earth wire to melt"
            ],
            ans: 2,
            explain: "Too many high-power appliances on one circuit → <strong>excessive current</strong> → wires overheat beyond safe limits → insulation melts → <strong>fire hazard</strong>."
        }
    ]
};


/* ═══════════════════════════════════════
   QUIZ STATE
   ═══════════════════════════════════════ */

var quizState = {
    quiz1: { rendered: false, answered: 0, correct: 0, answers: {} },
    quiz2: { rendered: false, answered: 0, correct: 0, answers: {} },
    quiz3: { rendered: false, answered: 0, correct: 0, answers: {} }
};


/* ═══════════════════════════════════════
   QUIZ INITIALIZATION
   ═══════════════════════════════════════ */

function initQuiz(quizId) {
    var state = quizState[quizId];
    if (!state) return;

    // Only render once (unless retried)
    if (state.rendered) return;

    var questions = quizData[quizId];
    if (!questions || questions.length === 0) return;

    var container = document.getElementById(quizId + '-container');
    if (!container) return;

    container.innerHTML = '';

    // Shuffle questions for variety
    var indices = shuffleIndices(questions.length);

    // Build question cards
    for (var i = 0; i < indices.length; i++) {
        var qIdx = indices[i];
        var qData = questions[qIdx];
        var qNum = i + 1;

        var card = document.createElement('div');
        card.className = 'q-card';
        card.id = quizId + '-q' + i;

        // Question number
        var numDiv = document.createElement('div');
        numDiv.className = 'q-num';
        numDiv.textContent = 'Question ' + qNum + ' of ' + questions.length;
        card.appendChild(numDiv);

        // Question text
        var textDiv = document.createElement('div');
        textDiv.className = 'q-text';
        textDiv.innerHTML = qData.q;
        card.appendChild(textDiv);

        // Options
        var optsDiv = document.createElement('div');
        optsDiv.className = 'q-options';
        optsDiv.id = quizId + '-opts' + i;

        for (var j = 0; j < qData.opts.length; j++) {
            var optBtn = document.createElement('div');
            optBtn.className = 'q-opt';
            optBtn.setAttribute('data-quiz', quizId);
            optBtn.setAttribute('data-qindex', i);
            optBtn.setAttribute('data-oindex', j);
            optBtn.setAttribute('data-correct', qData.ans);
            optBtn.setAttribute('data-original', qIdx);

            // Letter circle
            var letterSpan = document.createElement('span');
            letterSpan.className = 'opt-letter';
            letterSpan.textContent = String.fromCharCode(65 + j); // A, B, C, D
            optBtn.appendChild(letterSpan);

            // Option text
            var optText = document.createElement('span');
            // Remove the leading "A) ", "B) " etc since we have the letter circle
            var cleanText = qData.opts[j].replace(/^[A-D]\)\s*/, '');
            optText.textContent = cleanText;
            optBtn.appendChild(optText);

            optBtn.addEventListener('click', handleQuizAnswer);
            optsDiv.appendChild(optBtn);
        }

        card.appendChild(optsDiv);

        // Explanation (hidden initially)
        var explainDiv = document.createElement('div');
        explainDiv.className = 'q-explain';
        explainDiv.id = quizId + '-explain' + i;
        explainDiv.innerHTML = '💡 ' + qData.explain;
        card.appendChild(explainDiv);

        container.appendChild(card);
    }

    // Score display (hidden initially)
    var scoreDiv = document.createElement('div');
    scoreDiv.className = 'quiz-score';
    scoreDiv.id = quizId + '-score';

    scoreDiv.innerHTML = '<h3>🎯 Quiz Complete!</h3>' +
        '<div class="score-num" id="' + quizId + '-score-num">0 / ' + questions.length + '</div>' +
        '<div class="score-msg" id="' + quizId + '-score-msg"></div>' +
        '<button class="btn-retry" onclick="retryQuiz(\'' + quizId + '\')">🔄 Try Again</button>';

    container.appendChild(scoreDiv);

    // Store shuffled indices for reference
    state.indices = indices;
    state.rendered = true;
    state.answered = 0;
    state.correct = 0;
    state.answers = {};
}


/* ═══════════════════════════════════════
   ANSWER HANDLER
   ═══════════════════════════════════════ */

function handleQuizAnswer(e) {
    var target = e.currentTarget;
    var quizId = target.getAttribute('data-quiz');
    var qIndex = parseInt(target.getAttribute('data-qindex'));
    var oIndex = parseInt(target.getAttribute('data-oindex'));
    var correctIndex = parseInt(target.getAttribute('data-correct'));
    var state = quizState[quizId];

    // Check if already answered
    if (state.answers[qIndex] !== undefined) return;

    // Record answer
    state.answers[qIndex] = oIndex;
    state.answered++;

    var isCorrect = (oIndex === correctIndex);
    if (isCorrect) state.correct++;

    // Get all options for this question
    var optsContainer = document.getElementById(quizId + '-opts' + qIndex);
    var allOpts = optsContainer.querySelectorAll('.q-opt');

    // Mark all options
    for (var i = 0; i < allOpts.length; i++) {
        var opt = allOpts[i];
        var thisIdx = parseInt(opt.getAttribute('data-oindex'));
        opt.classList.add('chosen');

        if (thisIdx === correctIndex) {
            opt.classList.add('correct');
        } else if (thisIdx === oIndex && !isCorrect) {
            opt.classList.add('wrong');
        }
    }

    // Show explanation
    var explainDiv = document.getElementById(quizId + '-explain' + qIndex);
    if (explainDiv) {
        // Add correct/wrong prefix
        var prefix = isCorrect
            ? '<span style="color:#66bb6a">✅ Correct!</span> '
            : '<span style="color:#ef5350">❌ Incorrect.</span> ';
        explainDiv.innerHTML = prefix + explainDiv.innerHTML;
        explainDiv.classList.add('show');
    }

    // Highlight question card border
    var card = document.getElementById(quizId + '-q' + qIndex);
    if (card) {
        card.style.borderLeftWidth = '4px';
        card.style.borderLeftColor = isCorrect ? '#66bb6a' : '#ef5350';
    }

    // Scroll explanation into view smoothly
    if (explainDiv) {
        setTimeout(function () {
            explainDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // Check if all questions answered
    var totalQs = quizData[quizId].length;
    if (state.answered >= totalQs) {
        showQuizScore(quizId);
    }
}


/* ═══════════════════════════════════════
   SCORE DISPLAY
   ═══════════════════════════════════════ */

function showQuizScore(quizId) {
    var state = quizState[quizId];
    var total = quizData[quizId].length;
    var correct = state.correct;
    var pct = Math.round((correct / total) * 100);

    var scoreDiv = document.getElementById(quizId + '-score');
    if (!scoreDiv) return;

    // Update numbers
    var numDiv = document.getElementById(quizId + '-score-num');
    if (numDiv) numDiv.textContent = correct + ' / ' + total + '  (' + pct + '%)';

    // Message based on score
    var msgDiv = document.getElementById(quizId + '-score-msg');
    if (msgDiv) {
        var msg = '';
        var emoji = '';
        if (pct === 100) {
            emoji = '🌟';
            msg = 'Perfect score! Outstanding mastery!';
        } else if (pct >= 80) {
            emoji = '🎉';
            msg = 'Excellent! You have a strong understanding!';
        } else if (pct >= 60) {
            emoji = '👍';
            msg = 'Good effort! Review the explanations for questions you missed.';
        } else if (pct >= 40) {
            emoji = '📖';
            msg = 'Keep studying! Re-read the topic sections and try again.';
        } else {
            emoji = '💪';
            msg = 'Don\'t give up! Go through the topics again carefully, then retry.';
        }
        msgDiv.innerHTML = emoji + ' ' + msg;
    }

    // Show score card
    scoreDiv.classList.add('show');

    // Scroll to score
    setTimeout(function () {
        scoreDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}


/* ═══════════════════════════════════════
   RETRY QUIZ
   ═══════════════════════════════════════ */

function retryQuiz(quizId) {
    // Reset state
    quizState[quizId] = {
        rendered: false,
        answered: 0,
        correct: 0,
        answers: {}
    };

    // Clear container
    var container = document.getElementById(quizId + '-container');
    if (container) container.innerHTML = '';

    // Re-initialize (reshuffled)
    initQuiz(quizId);

    // Scroll to top of quiz
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ═══════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════ */

// Fisher-Yates shuffle — returns array of shuffled indices
function shuffleIndices(n) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(i);

    for (var j = arr.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var temp = arr[j];
        arr[j] = arr[k];
        arr[k] = temp;
    }
    return arr;
}