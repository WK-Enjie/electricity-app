// ========================================
// SINGAPORE O-LEVEL ELECTRICITY APP
// Quiz System - quizzes.js
// ========================================

// ===== QUIZ STATE =====
const QuizState = {
    mode: null, // 'topic', 'mixed', 'timed', 'circuit'
    topic: null,
    difficulty: 'medium',
    questions: [],
    currentIndex: 0,
    answers: [],
    score: 0,
    startTime: null,
    timeLimit: null,
    timerInterval: null,
    isComplete: false
};

// ===== QUIZ STATISTICS =====
let QuizStats = {
    totalQuizzes: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestScore: 0,
    currentStreak: 0,
    topicScores: {
        current: { correct: 0, total: 0 },
        resistance: { correct: 0, total: 0 },
        nonohmic: { correct: 0, total: 0 },
        circuits: { correct: 0, total: 0 },
        divider: { correct: 0, total: 0 },
        power: { correct: 0, total: 0 },
        safety: { correct: 0, total: 0 }
    }
};

// ===== QUESTION BANK =====
const QuestionBank = {
    current: [
        {
            id: 'cur1',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'Electric current is defined as:',
            options: [
                'The rate of flow of charge',
                'The force that moves electrons',
                'The resistance to electron flow',
                'The energy carried by electrons'
            ],
            correct: 0,
            explanation: 'Electric current is defined as the rate of flow of electric charge. The formula is I = Q/t, where I is current in amperes, Q is charge in coulombs, and t is time in seconds.'
        },
        {
            id: 'cur2',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'What is the SI unit of electric current?',
            options: ['Volt (V)', 'Ampere (A)', 'Ohm (Ω)', 'Watt (W)'],
            correct: 1,
            explanation: 'The SI unit of electric current is the Ampere (A). 1 Ampere = 1 Coulomb per second.'
        },
        {
            id: 'cur3',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'If 60 C of charge flows through a wire in 20 seconds, what is the current?',
            options: ['1200 A', '3 A', '40 A', '0.33 A'],
            correct: 1,
            explanation: 'Using I = Q/t: I = 60 C ÷ 20 s = 3 A'
        },
        {
            id: 'cur4',
            type: 'fill-blank',
            difficulty: 'medium',
            question: 'A current of 2.5 A flows for 4 minutes. The charge that passes is ___ C.',
            answer: 600,
            tolerance: 0,
            explanation: 'Q = I × t = 2.5 A × (4 × 60 s) = 2.5 × 240 = 600 C'
        },
        {
            id: 'cur5',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'Conventional current flows from:',
            options: [
                'Negative to positive terminal',
                'Positive to negative terminal',
                'In both directions equally',
                'Only through resistors'
            ],
            correct: 1,
            explanation: 'Conventional current flows from the positive terminal to the negative terminal. This is opposite to the actual direction of electron flow.'
        },
        {
            id: 'cur6',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'An ammeter should be connected in:',
            options: [
                'Parallel with the component',
                'Series with the component',
                'Either series or parallel',
                'Outside the circuit'
            ],
            correct: 1,
            explanation: 'An ammeter must be connected in SERIES with the component to measure the current flowing through it. It has very low resistance to minimize its effect on the circuit.'
        },
        {
            id: 'cur7',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'Potential difference is measured in:',
            options: ['Amperes', 'Ohms', 'Volts', 'Watts'],
            correct: 2,
            explanation: 'Potential difference (voltage) is measured in Volts (V). 1 Volt = 1 Joule per Coulomb.'
        },
        {
            id: 'cur8',
            type: 'fill-blank',
            difficulty: 'hard',
            question: 'If 24 J of work is done to move 6 C of charge, the potential difference is ___ V.',
            answer: 4,
            tolerance: 0,
            explanation: 'Using V = W/Q: V = 24 J ÷ 6 C = 4 V'
        }
    ],
    
    resistance: [
        {
            id: 'res1',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'Resistance is measured in:',
            options: ['Volts', 'Amperes', 'Ohms', 'Watts'],
            correct: 2,
            explanation: 'Resistance is measured in Ohms (Ω). 1 Ohm = 1 Volt per Ampere.'
        },
        {
            id: 'res2',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'According to Ohm\'s Law, current is:',
            options: [
                'Directly proportional to resistance',
                'Inversely proportional to voltage',
                'Directly proportional to voltage (at constant temperature)',
                'Not related to voltage or resistance'
            ],
            correct: 2,
            explanation: 'Ohm\'s Law states that current is directly proportional to voltage, provided temperature and other physical conditions remain constant. I = V/R.'
        },
        {
            id: 'res3',
            type: 'fill-blank',
            difficulty: 'medium',
            question: 'A resistor has 6 V across it and 0.5 A flowing through it. Its resistance is ___ Ω.',
            answer: 12,
            tolerance: 0,
            explanation: 'Using R = V/I: R = 6 V ÷ 0.5 A = 12 Ω'
        },
        {
            id: 'res4',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'If the length of a wire is doubled, its resistance will:',
            options: [
                'Halve',
                'Double',
                'Stay the same',
                'Quadruple'
            ],
            correct: 1,
            explanation: 'Resistance is directly proportional to length (R ∝ L). If length doubles, resistance doubles.'
        },
        {
            id: 'res5',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'If the cross-sectional area of a wire is doubled, its resistance will:',
            options: [
                'Halve',
                'Double',
                'Stay the same',
                'Quadruple'
            ],
            correct: 0,
            explanation: 'Resistance is inversely proportional to cross-sectional area (R ∝ 1/A). If area doubles, resistance halves.'
        },
        {
            id: 'res6',
            type: 'calculation',
            difficulty: 'hard',
            question: 'Calculate the current flowing through a 25 Ω resistor when connected to a 10 V supply.',
            given: { V: '10 V', R: '25 Ω' },
            find: 'I',
            answer: 0.4,
            unit: 'A',
            tolerance: 0.01,
            explanation: 'Using I = V/R: I = 10 V ÷ 25 Ω = 0.4 A'
        }
    ],
    
    nonohmic: [
        {
            id: 'non1',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'Which of the following is an ohmic conductor?',
            options: [
                'Filament lamp',
                'Diode',
                'Metal wire at constant temperature',
                'Thermistor'
            ],
            correct: 2,
            explanation: 'A metal wire at constant temperature is an ohmic conductor because it obeys Ohm\'s Law - current is directly proportional to voltage.'
        },
        {
            id: 'non2',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'As current through a filament lamp increases, its resistance:',
            options: [
                'Decreases',
                'Increases',
                'Stays constant',
                'Becomes zero'
            ],
            correct: 1,
            explanation: 'As current increases, the filament heats up. Higher temperature causes more atomic vibrations, leading to more collisions with electrons, thus increasing resistance.'
        },
        {
            id: 'non3',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'A diode allows current to flow in:',
            options: [
                'Both directions equally',
                'One direction only',
                'No direction',
                'Both directions but differently'
            ],
            correct: 1,
            explanation: 'A diode allows current to flow in one direction only - from anode to cathode (forward bias). In reverse bias, it blocks current flow.'
        },
        {
            id: 'non4',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'For a silicon diode, current starts to flow significantly when the forward voltage exceeds approximately:',
            options: ['0.3 V', '0.7 V', '1.5 V', '3.0 V'],
            correct: 1,
            explanation: 'Silicon diodes have a threshold (forward) voltage of approximately 0.7 V. Below this, very little current flows.'
        },
        {
            id: 'non5',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'NTC thermistor resistance _____ as temperature increases.',
            options: ['Increases', 'Decreases', 'Stays the same', 'Becomes infinite'],
            correct: 1,
            explanation: 'NTC (Negative Temperature Coefficient) thermistors have decreasing resistance as temperature increases. More electrons are freed at higher temperatures.'
        },
        {
            id: 'non6',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'LDR resistance _____ as light intensity increases.',
            options: ['Increases', 'Decreases', 'Stays the same', 'Fluctuates'],
            correct: 1,
            explanation: 'LDR (Light Dependent Resistor) resistance decreases as light intensity increases. Light photons free more electrons, reducing resistance.'
        },
        {
            id: 'non7',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'Which component would you use in an automatic street light that turns on when it gets dark?',
            options: ['Thermistor', 'LDR', 'Diode', 'Variable resistor'],
            correct: 1,
            explanation: 'An LDR would be used because its resistance changes with light level. In darkness, its high resistance can be used to trigger the light.'
        },
        {
            id: 'non8',
            type: 'multiple-choice',
            difficulty: 'hard',
            question: 'The I-V graph of a filament lamp is:',
            options: [
                'A straight line through the origin',
                'A curve that gets steeper as V increases',
                'A curve that gets less steep as V increases',
                'A horizontal line'
            ],
            correct: 2,
            explanation: 'The I-V graph curves and gets less steep because as V increases, the filament heats up, resistance increases, and current increases at a slower rate.'
        }
    ],
    
    circuits: [
        {
            id: 'cir1',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'In a series circuit, the current:',
            options: [
                'Is different through each component',
                'Is the same through all components',
                'Is zero',
                'Depends on the voltage only'
            ],
            correct: 1,
            explanation: 'In a series circuit, there is only one path for current to flow, so the same current flows through all components.'
        },
        {
            id: 'cir2',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'In a parallel circuit, the voltage:',
            options: [
                'Is different across each branch',
                'Is the same across all branches',
                'Is zero in all branches',
                'Adds up across all branches'
            ],
            correct: 1,
            explanation: 'In a parallel circuit, all branches are connected across the same two points, so they all have the same voltage across them.'
        },
        {
            id: 'cir3',
            type: 'fill-blank',
            difficulty: 'medium',
            question: 'Two resistors of 10 Ω and 20 Ω are connected in series. The total resistance is ___ Ω.',
            answer: 30,
            tolerance: 0,
            explanation: 'For series resistors: R_total = R₁ + R₂ = 10 + 20 = 30 Ω'
        },
        {
            id: 'cir4',
            type: 'fill-blank',
            difficulty: 'hard',
            question: 'Two resistors of 6 Ω and 12 Ω are connected in parallel. The total resistance is ___ Ω.',
            answer: 4,
            tolerance: 0,
            explanation: 'For parallel resistors: 1/R = 1/R₁ + 1/R₂ = 1/6 + 1/12 = 3/12 = 1/4, so R = 4 Ω. Or use (R₁×R₂)/(R₁+R₂) = (6×12)/(6+12) = 72/18 = 4 Ω'
        },
        {
            id: 'cir5',
            type: 'calculation',
            difficulty: 'medium',
            question: 'A 12 V battery is connected to two resistors of 20 Ω and 40 Ω in series. Calculate the current.',
            given: { V: '12 V', R1: '20 Ω', R2: '40 Ω' },
            find: 'I',
            answer: 0.2,
            unit: 'A',
            tolerance: 0.01,
            explanation: 'Total R = 20 + 40 = 60 Ω. I = V/R = 12/60 = 0.2 A'
        },
        {
            id: 'cir6',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'When more resistors are added in parallel, the total resistance:',
            options: [
                'Increases',
                'Decreases',
                'Stays the same',
                'Becomes infinite'
            ],
            correct: 1,
            explanation: 'Adding resistors in parallel provides more paths for current, decreasing total resistance. Total resistance is always less than the smallest individual resistor.'
        },
        {
            id: 'cir7',
            type: 'multiple-choice',
            difficulty: 'hard',
            question: 'In a parallel circuit, more current flows through:',
            options: [
                'The larger resistance',
                'The smaller resistance',
                'Equal current through all resistors',
                'No current flows in parallel'
            ],
            correct: 1,
            explanation: 'Since V is the same across parallel branches, and I = V/R, more current flows through the path with smaller resistance.'
        }
    ],
    
    divider: [
        {
            id: 'div1',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'A potential divider is used to:',
            options: [
                'Increase voltage',
                'Obtain a fraction of the input voltage',
                'Convert AC to DC',
                'Measure current'
            ],
            correct: 1,
            explanation: 'A potential divider uses two resistors in series to divide the input voltage and obtain a smaller output voltage.'
        },
        {
            id: 'div2',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'In a potential divider with R₁ = R₂, the output voltage (across R₂) is:',
            options: [
                'Equal to input voltage',
                'Half of input voltage',
                'Zero',
                'Double the input voltage'
            ],
            correct: 1,
            explanation: 'When R₁ = R₂, Vout = Vin × R₂/(R₁+R₂) = Vin × R/(2R) = Vin/2 = half of input voltage.'
        },
        {
            id: 'div3',
            type: 'fill-blank',
            difficulty: 'medium',
            question: 'In a potential divider with Vin = 9V, R₁ = 20kΩ, R₂ = 10kΩ, the output voltage is ___ V.',
            answer: 3,
            tolerance: 0,
            explanation: 'Vout = Vin × R₂/(R₁+R₂) = 9 × 10/(20+10) = 9 × 10/30 = 3 V'
        },
        {
            id: 'div4',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'If an NTC thermistor is used as R₂ in a potential divider, when temperature increases, Vout will:',
            options: [
                'Increase',
                'Decrease',
                'Stay the same',
                'Become zero'
            ],
            correct: 1,
            explanation: 'When temperature increases, NTC thermistor resistance decreases. Since Vout = Vin × R₂/(R₁+R₂), if R₂ decreases, Vout decreases.'
        },
        {
            id: 'div5',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'If an LDR is used as R₂ in a potential divider, when light intensity increases, Vout will:',
            options: [
                'Increase',
                'Decrease',
                'Stay the same',
                'Fluctuate'
            ],
            correct: 1,
            explanation: 'When light increases, LDR resistance decreases. Since Vout ∝ R₂, Vout decreases when R₂ decreases.'
        },
        {
            id: 'div6',
            type: 'calculation',
            difficulty: 'hard',
            question: 'Design a potential divider to give 4V output from a 12V supply. If R₁ = 20kΩ, what should R₂ be?',
            given: { Vin: '12 V', Vout: '4 V', R1: '20 kΩ' },
            find: 'R₂',
            answer: 10,
            unit: 'kΩ',
            tolerance: 0.1,
            explanation: '4 = 12 × R₂/(20+R₂). 4(20+R₂) = 12R₂. 80+4R₂ = 12R₂. 80 = 8R₂. R₂ = 10 kΩ'
        }
    ],
    
    power: [
        {
            id: 'pow1',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'Electrical power is measured in:',
            options: ['Volts', 'Amperes', 'Watts', 'Joules'],
            correct: 2,
            explanation: 'Electrical power is measured in Watts (W). 1 Watt = 1 Joule per second = 1 Volt × 1 Ampere.'
        },
        {
            id: 'pow2',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'The formula for electrical power is:',
            options: ['P = I/V', 'P = V/I', 'P = V × I', 'P = V + I'],
            correct: 2,
            explanation: 'Electrical power P = V × I (voltage × current). This can also be written as P = I²R or P = V²/R.'
        },
        {
            id: 'pow3',
            type: 'fill-blank',
            difficulty: 'medium',
            question: 'A device operates at 230 V and draws 2 A. Its power rating is ___ W.',
            answer: 460,
            tolerance: 0,
            explanation: 'P = V × I = 230 × 2 = 460 W'
        },
        {
            id: 'pow4',
            type: 'fill-blank',
            difficulty: 'medium',
            question: 'An appliance rated 2300 W operates at 230 V. The current drawn is ___ A.',
            answer: 10,
            tolerance: 0,
            explanation: 'I = P/V = 2300/230 = 10 A'
        },
        {
            id: 'pow5',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: '1 kilowatt-hour (kWh) is equal to:',
            options: ['1000 J', '3600 J', '1,000,000 J', '3,600,000 J'],
            correct: 3,
            explanation: '1 kWh = 1000 W × 3600 s = 3,600,000 J = 3.6 MJ'
        },
        {
            id: 'pow6',
            type: 'calculation',
            difficulty: 'hard',
            question: 'A 1500 W air conditioner runs for 8 hours per day. Calculate the daily energy consumption in kWh.',
            given: { P: '1500 W', t: '8 hours' },
            find: 'E',
            answer: 12,
            unit: 'kWh',
            tolerance: 0.1,
            explanation: 'E = P × t = 1.5 kW × 8 h = 12 kWh'
        },
        {
            id: 'pow7',
            type: 'calculation',
            difficulty: 'hard',
            question: 'If electricity costs $0.32 per kWh, calculate the cost of running a 2000 W heater for 5 hours.',
            given: { P: '2000 W', t: '5 hours', rate: '$0.32/kWh' },
            find: 'Cost',
            answer: 3.20,
            unit: '$',
            tolerance: 0.01,
            explanation: 'Energy = 2 kW × 5 h = 10 kWh. Cost = 10 × $0.32 = $3.20'
        }
    ],
    
    safety: [
        {
            id: 'saf1',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'The live wire in a UK/Singapore 3-pin plug is colored:',
            options: ['Blue', 'Brown', 'Green and Yellow', 'Red'],
            correct: 1,
            explanation: 'The live wire is BROWN. Remember: BRowN = Bottom Right when looking at plug from front.'
        },
        {
            id: 'saf2',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'The neutral wire is colored:',
            options: ['Brown', 'Blue', 'Green and Yellow', 'Black'],
            correct: 1,
            explanation: 'The neutral wire is BLUE. Remember: BLue = Bottom Left when looking at plug from front.'
        },
        {
            id: 'saf3',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'The earth wire is colored:',
            options: ['Brown', 'Blue', 'Green and Yellow striped', 'Red'],
            correct: 2,
            explanation: 'The earth wire is GREEN and YELLOW striped. It connects to the top (longest) pin.'
        },
        {
            id: 'saf4',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'A fuse should be connected in the:',
            options: [
                'Neutral wire',
                'Earth wire',
                'Live wire',
                'Any wire'
            ],
            correct: 2,
            explanation: 'The fuse must be in the LIVE wire so that when it blows, the appliance is disconnected from the high voltage supply.'
        },
        {
            id: 'saf5',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'The purpose of the earth wire is to:',
            options: [
                'Complete the circuit',
                'Provide a safe path for fault current',
                'Increase resistance',
                'Reduce voltage'
            ],
            correct: 1,
            explanation: 'The earth wire provides a low-resistance path for current if a fault occurs (live wire touching metal case), causing the fuse to blow quickly.'
        },
        {
            id: 'saf6',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'A short circuit occurs when:',
            options: [
                'Current is too low',
                'Live and neutral wires touch directly',
                'The fuse is too large',
                'The circuit is too long'
            ],
            correct: 1,
            explanation: 'A short circuit occurs when live and neutral wires come into direct contact, bypassing the load. This causes very high current to flow.'
        },
        {
            id: 'saf7',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'Double-insulated appliances:',
            options: [
                'Need an earth wire',
                'Do not need an earth wire',
                'Are not safe',
                'Use higher voltage'
            ],
            correct: 1,
            explanation: 'Double-insulated appliances have a plastic casing that cannot become live, so they don\'t need an earth wire. They use 2-core cables.'
        },
        {
            id: 'saf8',
            type: 'fill-blank',
            difficulty: 'hard',
            question: 'An appliance rated 2000 W at 230 V should use a fuse rated at ___ A (choose from 3A, 5A, or 13A).',
            answer: 13,
            tolerance: 0,
            explanation: 'Current = P/V = 2000/230 = 8.7 A. Choose a fuse slightly higher: 13 A (not 3A or 5A as these are too low).'
        },
        {
            id: 'saf9',
            type: 'multiple-choice',
            difficulty: 'medium',
            question: 'The mains voltage in Singapore is:',
            options: ['110 V', '220 V', '230 V', '240 V'],
            correct: 2,
            explanation: 'Singapore uses 230 V AC mains supply at 50 Hz frequency.'
        },
        {
            id: 'saf10',
            type: 'multiple-choice',
            difficulty: 'hard',
            question: 'Why is the earth pin longest in a 3-pin plug?',
            options: [
                'To make it easier to insert',
                'So earth connects first and disconnects last',
                'To carry more current',
                'For aesthetic reasons'
            ],
            correct: 1,
            explanation: 'The earth pin is longest so it connects FIRST when inserting (safety established) and disconnects LAST when removing (safety maintained longest).'
        }
    ]
};

// ===== INITIALIZATION =====

function initQuizSection() {
    loadQuizStats();
    updateStatsDisplay();
    initDifficultyButtons();
    console.log('Quiz section initialized');
}

function initDifficultyButtons() {
    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            diffButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            QuizState.difficulty = btn.dataset.difficulty;
        });
    });
}

// ===== START QUIZ FUNCTIONS =====

function startTopicQuiz() {
    const topic = document.getElementById('topicSelect').value;
    QuizState.mode = 'topic';
    QuizState.topic = topic;
    QuizState.difficulty = null; // All difficulties
    
    const questions = getQuestionsForTopic(topic, 10);
    startQuiz(questions, getTopicName(topic));
}

function startMixedQuiz() {
    QuizState.mode = 'mixed';
    QuizState.topic = null;
    
    const questions = getMixedQuestions(10, QuizState.difficulty);
    startQuiz(questions, 'Mixed Topics');
}

function startTimedQuiz() {
    const timeLimit = parseInt(document.getElementById('timeLimit').value);
    QuizState.mode = 'timed';
    QuizState.timeLimit = timeLimit;
    
    const questions = getMixedQuestions(10, 'medium');
    startQuiz(questions, 'Timed Challenge');
    startTimer(timeLimit);
}

function startCircuitQuiz() {
    QuizState.mode = 'circuit';
    
    // Get calculation questions
    const questions = getCircuitQuestions(8);
    startQuiz(questions, 'Circuit Analysis');
}

function startQuiz(questions, title) {
    QuizState.questions = questions;
    QuizState.currentIndex = 0;
    QuizState.answers = new Array(questions.length).fill(null);
    QuizState.score = 0;
    QuizState.startTime = Date.now();
    QuizState.isComplete = false;
    
    // Update UI
    document.getElementById('quizTitle').textContent = title;
    document.getElementById('quizTopic').textContent = QuizState.topic ? getTopicName(QuizState.topic) : 'All Topics';
    document.getElementById('totalQuestions').textContent = questions.length;
    
    // Show quiz container, hide mode selection and results
    document.querySelector('.quiz-mode-selection').classList.add('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    
    // Generate navigation dots
    generateQuizDots(questions.length);
    
    // Show first question
    showQuestion(0);
    
    // Show/hide timer
    if (QuizState.mode === 'timed') {
        document.getElementById('quizTimer').classList.remove('hidden');
    } else {
        document.getElementById('quizTimer').classList.add('hidden');
    }
}

// ===== QUESTION RETRIEVAL =====

function getQuestionsForTopic(topic, count) {
    const topicQuestions = QuestionBank[topic] || [];
    return shuffleArray([...topicQuestions]).slice(0, count);
}

function getMixedQuestions(count, difficulty) {
    let allQuestions = [];
    
    Object.keys(QuestionBank).forEach(topic => {
        QuestionBank[topic].forEach(q => {
            allQuestions.push({ ...q, topic: topic });
        });
    });
    
    // Filter by difficulty if specified
    if (difficulty && difficulty !== 'all') {
        allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    }
    
    return shuffleArray(allQuestions).slice(0, count);
}

function getCircuitQuestions(count) {
    let calcQuestions = [];
    
    Object.keys(QuestionBank).forEach(topic => {
        QuestionBank[topic].forEach(q => {
            if (q.type === 'calculation' || q.type === 'fill-blank') {
                calcQuestions.push({ ...q, topic: topic });
            }
        });
    });
    
    return shuffleArray(calcQuestions).slice(0, count);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getTopicName(topic) {
    const names = {
        current: 'Current Electricity',
        resistance: 'Resistance & Ohm\'s Law',
        nonohmic: 'Non-Ohmic Conductors',
        circuits: 'DC Circuits',
        divider: 'Potential Divider',
        power: 'Power & Energy',
        safety: 'Electrical Safety'
    };
    return names[topic] || topic;
}

// ===== DISPLAY QUESTION =====

function showQuestion(index) {
    QuizState.currentIndex = index;
    const question = QuizState.questions[index];
    const questionArea = document.getElementById('questionArea');
    
    // Update progress
    document.getElementById('currentQuestion').textContent = index + 1;
    const progress = ((index + 1) / QuizState.questions.length) * 100;
    document.getElementById('quizProgressFill').style.width = progress + '%';
    
    // Update navigation dots
    updateQuizDots();
    
    // Generate question HTML
    let html = `
        <div class="question-card">
            <div class="question-header">
                <div class="question-number">${index + 1}</div>
                <div class="question-meta">
                    <span class="question-difficulty ${question.difficulty}">${question.difficulty}</span>
                    ${question.topic ? `<span class="question-topic-tag">${getTopicName(question.topic)}</span>` : ''}
                </div>
            </div>
            
            <div class="question-text">${question.question}</div>
    `;
    
    // Add question-specific content
    switch (question.type) {
        case 'multiple-choice':
            html += generateMultipleChoiceHTML(question, index);
            break;
        case 'fill-blank':
            html += generateFillBlankHTML(question, index);
            break;
        case 'calculation':
            html += generateCalculationHTML(question, index);
            break;
    }
    
    // Add feedback area (hidden initially)
    html += `<div class="question-feedback hidden" id="feedback-${index}"></div>`;
    
    html += '</div>';
    
    questionArea.innerHTML = html;
    
    // Restore previous answer if exists
    restoreAnswer(index);
    
    // Update navigation buttons
    updateNavigationButtons();
}

function generateMultipleChoiceHTML(question, index) {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    let html = '<div class="answer-options">';
    
    question.options.forEach((option, i) => {
        const isAnswered = QuizState.answers[index] !== null;
        const isSelected = QuizState.answers[index] === i;
        const isCorrect = i === question.correct;
        
        let classes = 'answer-option';
        if (isSelected) classes += ' selected';
        if (isAnswered && isCorrect) classes += ' correct';
        if (isAnswered && isSelected && !isCorrect) classes += ' incorrect';
        if (isAnswered) classes += ' disabled';
        
        html += `
            <div class="${classes}" onclick="selectAnswer(${index}, ${i})" data-option="${i}">
                <span class="option-letter">${letters[i]}</span>
                <span class="option-text">${option}</span>
                <span class="option-indicator">
                    ${isAnswered && isCorrect ? '✓' : ''}
                    ${isAnswered && isSelected && !isCorrect ? '✗' : ''}
                </span>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function generateFillBlankHTML(question, index) {
    const answered = QuizState.answers[index] !== null;
    const userAnswer = QuizState.answers[index];
    
    let inputClass = 'fill-blank-input';
    if (answered) {
        inputClass += isAnswerCorrect(question, userAnswer) ? ' correct' : ' incorrect';
    }
    
    return `
        <div class="fill-blank-container">
            <span>Answer: </span>
            <input type="number" 
                   class="${inputClass}" 
                   id="fill-input-${index}"
                   value="${userAnswer !== null ? userAnswer : ''}"
                   ${answered ? 'disabled' : ''}
                   onchange="submitFillBlank(${index})"
                   onkeypress="if(event.key==='Enter')submitFillBlank(${index})">
            <span class="fill-blank-unit">${question.unit || ''}</span>
        </div>
    `;
}

function generateCalculationHTML(question, index) {
    const answered = QuizState.answers[index] !== null;
    const userAnswer = QuizState.answers[index];
    
    let html = '<div class="calculation-workspace">';
    
    // Given values
    if (question.given) {
        html += '<div class="calculation-given"><h5>Given:</h5><div class="given-values">';
        Object.entries(question.given).forEach(([key, value]) => {
            html += `<div class="given-item"><span class="label">${key} = </span><span class="value">${value}</span></div>`;
        });
        html += '</div></div>';
    }
    
    // Answer input
    let inputClass = 'calc-input-field';
    if (answered) {
        inputClass += isAnswerCorrect(question, userAnswer) ? ' correct' : ' incorrect';
    }
    
    html += `
        <div class="calculation-answer">
            <label>Find ${question.find}: </label>
            <input type="number" 
                   class="${inputClass}"
                   id="calc-input-${index}"
                   value="${userAnswer !== null ? userAnswer : ''}"
                   ${answered ? 'disabled' : ''}
                   step="0.01"
                   onchange="submitCalculation(${index})"
                   onkeypress="if(event.key==='Enter')submitCalculation(${index})">
            <span class="calc-unit">${question.unit}</span>
        </div>
    </div>`;
    
    return html;
}

// ===== ANSWER HANDLING =====

function selectAnswer(questionIndex, optionIndex) {
    if (QuizState.answers[questionIndex] !== null) return; // Already answered
    
    QuizState.answers[questionIndex] = optionIndex;
    const question = QuizState.questions[questionIndex];
    const isCorrect = optionIndex === question.correct;
    
    // Update UI
    const options = document.querySelectorAll('.answer-option');
    options.forEach((opt, i) => {
        opt.classList.add('disabled');
        if (i === question.correct) {
            opt.classList.add('correct');
        }
        if (i === optionIndex && !isCorrect) {
            opt.classList.add('incorrect');
        }
        if (i === optionIndex) {
            opt.classList.add('selected');
        }
    });
    
    // Show feedback
    showFeedback(questionIndex, isCorrect, question.explanation);
    
    // Update score
    if (isCorrect) QuizState.score++;
    
    // Update dot
    updateQuizDots();
    
    // Auto-advance after delay
    setTimeout(() => {
        if (questionIndex < QuizState.questions.length - 1) {
            // Enable next button highlight
            document.getElementById('nextQuestionBtn').classList.add('pulse');
        } else {
            // Last question - show submit button
            document.getElementById('nextQuestionBtn').classList.add('hidden');
            document.getElementById('submitQuizBtn').classList.remove('hidden');
        }
    }, 1500);
}

function submitFillBlank(questionIndex) {
    const input = document.getElementById(`fill-input-${questionIndex}`);
    const userAnswer = parseFloat(input.value);
    
    if (isNaN(userAnswer)) return;
    
    QuizState.answers[questionIndex] = userAnswer;
    const question = QuizState.questions[questionIndex];
    const isCorrect = isAnswerCorrect(question, userAnswer);
    
    // Update UI
    input.disabled = true;
    input.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Show feedback
    let explanation = question.explanation;
    if (!isCorrect) {
        explanation = `The correct answer is ${question.answer}. ` + explanation;
    }
    showFeedback(questionIndex, isCorrect, explanation);
    
    if (isCorrect) QuizState.score++;
    updateQuizDots();
}

function submitCalculation(questionIndex) {
    const input = document.getElementById(`calc-input-${questionIndex}`);
    const userAnswer = parseFloat(input.value);
    
    if (isNaN(userAnswer)) return;
    
    QuizState.answers[questionIndex] = userAnswer;
    const question = QuizState.questions[questionIndex];
    const isCorrect = isAnswerCorrect(question, userAnswer);
    
    // Update UI
    input.disabled = true;
    input.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Show feedback
    let explanation = question.explanation;
    if (!isCorrect) {
        explanation = `The correct answer is ${question.answer} ${question.unit}. ` + explanation;
    }
    showFeedback(questionIndex, isCorrect, explanation);
    
    if (isCorrect) QuizState.score++;
    updateQuizDots();
}

function isAnswerCorrect(question, userAnswer) {
    const tolerance = question.tolerance || 0;
    return Math.abs(userAnswer - question.answer) <= tolerance;
}

function showFeedback(questionIndex, isCorrect, explanation) {
    const feedbackDiv = document.getElementById(`feedback-${questionIndex}`);
    if (!feedbackDiv) return;
    
    feedbackDiv.className = `question-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.innerHTML = `
        <div class="feedback-header">
            <span class="feedback-icon">${isCorrect ? '✅' : '❌'}</span>
            <span class="feedback-title">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
        </div>
        <div class="feedback-explanation">${explanation}</div>
    `;
    feedbackDiv.classList.remove('hidden');
}

function restoreAnswer(index) {
    const answer = QuizState.answers[index];
    if (answer === null) return;
    
    const question = QuizState.questions[index];
    
    // Re-trigger the answer display
    if (question.type === 'multiple-choice') {
        // Already handled by generateMultipleChoiceHTML
    }
}

// ===== NAVIGATION =====

function generateQuizDots(count) {
    const dotsContainer = document.getElementById('quizDots');
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'quiz-dot';
        dot.onclick = () => goToQuestion(i);
        dotsContainer.appendChild(dot);
    }
}

function updateQuizDots() {
    const dots = document.querySelectorAll('.quiz-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('current', 'answered', 'incorrect');
        
        if (i === QuizState.currentIndex) {
            dot.classList.add('current');
        }
        
        if (QuizState.answers[i] !== null) {
            dot.classList.add('answered');
            
            const question = QuizState.questions[i];
            if (question.type === 'multiple-choice' && QuizState.answers[i] !== question.correct) {
                dot.classList.add('incorrect');
            }
        }
    });
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');
    const submitBtn = document.getElementById('submitQuizBtn');
    
    prevBtn.disabled = QuizState.currentIndex === 0;
    
    if (QuizState.currentIndex === QuizState.questions.length - 1) {
        nextBtn.classList.add('hidden');
        
        // Show submit only if all questions answered
        const allAnswered = QuizState.answers.every(a => a !== null);
        if (allAnswered) {
            submitBtn.classList.remove('hidden');
        }
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

function previousQuestion() {
    if (QuizState.currentIndex > 0) {
        showQuestion(QuizState.currentIndex - 1);
    }
}

function nextQuestion() {
    document.getElementById('nextQuestionBtn').classList.remove('pulse');
    
    if (QuizState.currentIndex < QuizState.questions.length - 1) {
        showQuestion(QuizState.currentIndex + 1);
    }
}

function goToQuestion(index) {
    showQuestion(index);
}

// ===== TIMER =====

function startTimer(seconds) {
    QuizState.timeLimit = seconds;
    updateTimerDisplay(seconds);
    
    QuizState.timerInterval = setInterval(() => {
        seconds--;
        updateTimerDisplay(seconds);
        
        if (seconds <= 30) {
            document.getElementById('quizTimer').classList.add('warning');
        }
        
        if (seconds <= 0) {
            clearInterval(QuizState.timerInterval);
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timerValue').textContent = 
        `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function stopTimer() {
    if (QuizState.timerInterval) {
        clearInterval(QuizState.timerInterval);
        QuizState.timerInterval = null;
    }
}

// ===== SUBMIT & RESULTS =====

function submitQuiz() {
    stopTimer();
    QuizState.isComplete = true;
    
    // Calculate final score
    const totalQuestions = QuizState.questions.length;
    const correctAnswers = QuizState.score;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Update stats
    updateQuizStats(percentage);
    
    // Show results
    showResults(correctAnswers, totalQuestions, percentage);
}

function showResults(correct, total, percentage) {
    // Hide quiz container
    document.getElementById('quizContainer').classList.add('hidden');
    
    // Show results
    const resultsDiv = document.getElementById('quizResults');
    resultsDiv.classList.remove('hidden');
    
    // Update icon and title based on score
    const resultsIcon = document.getElementById('resultsIcon');
    const resultsTitle = document.getElementById('resultsTitle');
    const scoreGrade = document.getElementById('scoreGrade');
    
    if (percentage >= 90) {
        resultsIcon.textContent = '🏆';
        resultsTitle.textContent = 'Excellent!';
        scoreGrade.textContent = 'Outstanding performance!';
        scoreGrade.className = 'score-grade excellent';
    } else if (percentage >= 70) {
        resultsIcon.textContent = '🎉';
        resultsTitle.textContent = 'Well Done!';
        scoreGrade.textContent = 'Great job!';
        scoreGrade.className = 'score-grade good';
    } else if (percentage >= 50) {
        resultsIcon.textContent = '👍';
        resultsTitle.textContent = 'Good Effort!';
        scoreGrade.textContent = 'Keep practicing!';
        scoreGrade.className = 'score-grade average';
    } else {
        resultsIcon.textContent = '📚';
        resultsTitle.textContent = 'Keep Learning!';
        scoreGrade.textContent = 'Review the topics and try again!';
        scoreGrade.className = 'score-grade poor';
    }
    
    // Update score display
    document.getElementById('scoreValue').textContent = percentage;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('totalCount').textContent = total;
    
    // Animate score ring
    const scoreRing = document.getElementById('scoreRingFill');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    
    setTimeout(() => {
        scoreRing.style.strokeDashoffset = offset;
        
        // Change color based on score
        if (percentage >= 70) {
            scoreRing.style.stroke = '#10b981';
        } else if (percentage >= 50) {
            scoreRing.style.stroke = '#f59e0b';
        } else {
            scoreRing.style.stroke = '#ef4444';
        }
    }, 100);
    
    // Generate topic breakdown
    generateBreakdown();
    
    // Generate answer review
    generateReview();
}

function generateBreakdown() {
    const breakdownDiv = document.getElementById('breakdownBars');
    breakdownDiv.innerHTML = '';
    
    // Group questions by topic
    const topicResults = {};
    
    QuizState.questions.forEach((q, i) => {
        const topic = q.topic || QuizState.topic || 'general';
        if (!topicResults[topic]) {
            topicResults[topic] = { correct: 0, total: 0 };
        }
        topicResults[topic].total++;
        
        // Check if answer was correct
        const answer = QuizState.answers[i];
        if (q.type === 'multiple-choice' && answer === q.correct) {
            topicResults[topic].correct++;
        } else if ((q.type === 'fill-blank' || q.type === 'calculation') && 
                   isAnswerCorrect(q, answer)) {
            topicResults[topic].correct++;
        }
    });
    
    // Create breakdown bars
    Object.entries(topicResults).forEach(([topic, results]) => {
        const percent = Math.round((results.correct / results.total) * 100);
        const colorClass = percent >= 70 ? 'good' : percent >= 50 ? 'average' : 'poor';
        
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        item.innerHTML = `
            <span class="breakdown-label">${getTopicName(topic)}</span>
            <div class="breakdown-bar">
                <div class="breakdown-fill ${colorClass}" style="width: 0%;"></div>
            </div>
            <span class="breakdown-percent">${results.correct}/${results.total}</span>
        `;
        breakdownDiv.appendChild(item);
        
        // Animate bar
        setTimeout(() => {
            item.querySelector('.breakdown-fill').style.width = percent + '%';
        }, 300);
    });
}

function generateReview() {
    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = '';
    
    QuizState.questions.forEach((q, i) => {
        const answer = QuizState.answers[i];
        let isCorrect = false;
        let yourAnswer = 'Not answered';
        let correctAnswer = '';
        
        if (q.type === 'multiple-choice') {
            isCorrect = answer === q.correct;
            yourAnswer = answer !== null ? q.options[answer] : 'Not answered';
            correctAnswer = q.options[q.correct];
        } else {
            isCorrect = answer !== null && isAnswerCorrect(q, answer);
            yourAnswer = answer !== null ? answer + ' ' + (q.unit || '') : 'Not answered';
            correctAnswer = q.answer + ' ' + (q.unit || '');
        }
        
        const item = document.createElement('div');
        item.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
        item.innerHTML = `
            <div class="review-number">${i + 1}</div>
            <div class="review-content">
                <div class="review-question">${q.question.substring(0, 100)}${q.question.length > 100 ? '...' : ''}</div>
                <div class="review-answer">
                    <span class="your-answer">Your answer: ${yourAnswer}</span>
                    ${!isCorrect ? `<br><span class="correct-ans">Correct: ${correctAnswer}</span>` : ''}
                </div>
            </div>
        `;
        reviewList.appendChild(item);
    });
}

// ===== QUIZ ACTIONS =====

function retryQuiz() {
    // Restart with same questions
    startQuiz(QuizState.questions, document.getElementById('quizTitle').textContent);
}

function newQuiz() {
    // Go back to mode selection
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizContainer').classList.add('hidden');
    document.querySelector('.quiz-mode-selection').classList.remove('hidden');
    
    // Reset state
    QuizState.questions = [];
    QuizState.answers = [];
    QuizState.score = 0;
    QuizState.currentIndex = 0;
}

function exitQuiz() {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        stopTimer();
        newQuiz();
    }
}

function shareResults() {
    const percentage = Math.round((QuizState.score / QuizState.questions.length) * 100);
    const text = `I scored ${percentage}% on the O-Level Electricity Quiz! 🎯⚡ Test your knowledge too!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'O-Level Electricity Quiz Results',
            text: text
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// ===== STATISTICS =====

function updateQuizStats(percentage) {
    QuizStats.totalQuizzes++;
    QuizStats.totalCorrect += QuizState.score;
    QuizStats.totalQuestions += QuizState.questions.length;
    
    if (percentage > QuizStats.bestScore) {
        QuizStats.bestScore = percentage;
    }
    
    if (percentage >= 70) {
        QuizStats.currentStreak++;
    } else {
        QuizStats.currentStreak = 0;
    }
    
    // Update topic scores
    QuizState.questions.forEach((q, i) => {
        const topic = q.topic || QuizState.topic || 'current';
        if (QuizStats.topicScores[topic]) {
            QuizStats.topicScores[topic].total++;
            
            const answer = QuizState.answers[i];
            if (q.type === 'multiple-choice' && answer === q.correct) {
                QuizStats.topicScores[topic].correct++;
            } else if ((q.type === 'fill-blank' || q.type === 'calculation') && 
                       answer !== null && isAnswerCorrect(q, answer)) {
                QuizStats.topicScores[topic].correct++;
            }
        }
    });
    
    saveQuizStats();
    updateStatsDisplay();
}

function updateStatsDisplay() {
    document.getElementById('totalQuizzesTaken').textContent = QuizStats.totalQuizzes;
    
    const avgScore = QuizStats.totalQuestions > 0 
        ? Math.round((QuizStats.totalCorrect / QuizStats.totalQuestions) * 100) 
        : 0;
    document.getElementById('averageScore').textContent = avgScore + '%';
    document.getElementById('bestScore').textContent = QuizStats.bestScore + '%';
    document.getElementById('currentStreak').textContent = QuizStats.currentStreak;
    
    // Update mastery bars
    Object.entries(QuizStats.topicScores).forEach(([topic, scores]) => {
        const percent = scores.total > 0 
            ? Math.round((scores.correct / scores.total) * 100) 
            : 0;
        
        const fill = document.querySelector(`.mastery-fill[data-topic="${topic}"]`);
        const percentSpan = fill?.parentElement?.nextElementSibling;
        
        if (fill) {
            fill.style.width = percent + '%';
        }
        if (percentSpan) {
            percentSpan.textContent = percent + '%';
        }
    });
}

function saveQuizStats() {
    localStorage.setItem('quizStats', JSON.stringify(QuizStats));
}

function loadQuizStats() {
    const saved = localStorage.getItem('quizStats');
    if (saved) {
        try {
            QuizStats = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading quiz stats:', e);
        }
    }
}

function resetStats() {
    if (confirm('Are you sure you want to reset all quiz statistics?')) {
        QuizStats = {
            totalQuizzes: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            bestScore: 0,
            currentStreak: 0,
            topicScores: {
                current: { correct: 0, total: 0 },
                resistance: { correct: 0, total: 0 },
                nonohmic: { correct: 0, total: 0 },
                circuits: { correct: 0, total: 0 },
                divider: { correct: 0, total: 0 },
                power: { correct: 0, total: 0 },
                safety: { correct: 0, total: 0 }
            }
        };
        saveQuizStats();
        updateStatsDisplay();
    }
}

// ===== EXPORT =====
window.initQuizSection = initQuizSection;
window.startTopicQuiz = startTopicQuiz;
window.startMixedQuiz = startMixedQuiz;
window.startTimedQuiz = startTimedQuiz;
window.startCircuitQuiz = startCircuitQuiz;
window.selectAnswer = selectAnswer;
window.submitFillBlank = submitFillBlank;
window.submitCalculation = submitCalculation;
window.previousQuestion = previousQuestion;
window.nextQuestion = nextQuestion;
window.goToQuestion = goToQuestion;
window.submitQuiz = submitQuiz;
window.retryQuiz = retryQuiz;
window.newQuiz = newQuiz;
window.exitQuiz = exitQuiz;
window.shareResults = shareResults;
window.resetStats = resetStats;

console.log('⚡ Quiz system loaded');