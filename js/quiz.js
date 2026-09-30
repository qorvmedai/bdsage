function initQuiz() {
    const container = document.getElementById('quiz-container');
    const startScreen = document.getElementById('quiz-start');
    const questionScreen = document.getElementById('quiz-question-screen');
    const resultScreen = document.getElementById('quiz-result');
    const startBtn = document.getElementById('quiz-start-btn');
    const retryBtn = document.getElementById('quiz-retry-btn');
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const progressText = document.getElementById('quiz-progress-text');
    const progressFill = document.getElementById('quiz-progress-fill');
    const scoreEl = document.getElementById('quiz-score');
    const messageEl = document.getElementById('quiz-message');
    
    if (!container) return;

    // Hardcoded questions as specified
    const QUESTIONS = [
        {
            question: 'What is Sagacious best known for?',
            options: ['Football', 'Marketing & Strategy', 'Music', 'Real Estate'],
            correct: 1 // B
        },
        {
            question: 'Who are the Mystics?',
            options: ['His football team', 'His clients', 'His family', 'Members of MMC'],
            correct: 3 // D
        },
        {
            question: 'Which best describes Sagacious?',
            options: ['Quiet, shy and reserved', 'Strict, serious and distant', 'Funny, calm, ambitious and business-minded', 'Loud, unserious and careless'],
            correct: 2 // C
        },
        {
            question: 'What community word is associated with him?',
            options: ['Kairo', 'Nova', 'Eriga', 'Mystica'],
            correct: 2 // C
        },
        {
            question: "What is his favourite colour?",
            options: ['Blue', 'Green', 'Red', 'Purple'],
            correct: 2 // C
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let answered = false;
    let questions = QUESTIONS; // Use hardcoded, fallback to Supabase if available

    // Try loading from Supabase, fallback to hardcoded
    async function loadQuestions() {
        if (window.SupabaseAPI && typeof window.SupabaseAPI.fetchQuizQuestions === 'function') {
            try {
                const fetched = await window.SupabaseAPI.fetchQuizQuestions();
                if (fetched && fetched.length > 0) {
                    questions = fetched.map(q => ({
                        question: q.question,
                        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                        correct: q.correct_answer
                    }));
                }
            } catch(e) {
                console.warn('[Quiz] Using hardcoded questions:', e);
            }
        }
    }

    function startQuiz() {
        currentQuestion = 0;
        score = 0;
        answered = false;
        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');
        showQuestion();
    }

    function showQuestion() {
        if (currentQuestion >= questions.length) {
            showResult();
            return;
        }
        answered = false;
        const q = questions[currentQuestion];
        questionEl.textContent = q.question;
        progressText.textContent = `${String(currentQuestion + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}`;
        progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
        
        optionsEl.innerHTML = '';
        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz__option';
            btn.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
            btn.setAttribute('type', 'button');
            btn.addEventListener('click', () => selectAnswer(index, q.correct));
            optionsEl.appendChild(btn);
        });

        // Animate question in if GSAP available
        if (window.gsap) {
            gsap.fromTo(questionEl, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4 });
            gsap.fromTo(optionsEl.children, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.08, delay: 0.1 });
        }
    }

    function selectAnswer(selected, correct) {
        if (answered) return;
        answered = true;
        const options = optionsEl.querySelectorAll('.quiz__option');
        
        if (selected === correct) {
            score++;
            options[selected].classList.add('quiz__option--correct');
        } else {
            options[selected].classList.add('quiz__option--wrong');
            options[correct].classList.add('quiz__option--correct');
        }

        // Disable all options
        options.forEach(opt => opt.style.pointerEvents = 'none');

        setTimeout(() => {
            currentQuestion++;
            showQuestion();
        }, 1200);
    }

    function showResult() {
        questionScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        scoreEl.textContent = `${score}/${questions.length}`;
        
        let message = '';
        if (score === 5) message = 'YOU KNOW THE MAN. 🎉';
        else if (score === 4) message = "YOU'VE BEEN PAYING ATTENTION.";
        else if (score === 3) message = 'NOT BAD.';
        else message = 'WE NEED TO TALK. 😂';
        messageEl.textContent = message;

        // Animate result
        if (window.gsap) {
            gsap.fromTo(scoreEl, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' });
            gsap.fromTo(messageEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.3 });
        }

        if (score >= 4 && typeof window.triggerConfetti === 'function') {
            window.triggerConfetti({ particleCount: 80 });
        }
    }

    // Event listeners
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            startBtn.textContent = 'LOADING...';
            startBtn.disabled = true;
            await loadQuestions();
            startBtn.textContent = 'START QUIZ';
            startBtn.disabled = false;
            startQuiz();
        });
    }
    if (retryBtn) retryBtn.addEventListener('click', startQuiz);
}
