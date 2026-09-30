/**
 * Audio Controller — BD23 SAGA
 * Sagacious Tehilla — Level 23 Birthday Experience
 */

function initAudio() {
    const audio = document.getElementById('bd23-audio');
    const control = document.getElementById('audio-control');
    const label = document.getElementById('audio-label');
    const icon = document.getElementById('audio-icon');

    if (!audio || !control) return;

    // Ensure audio loops continuously
    audio.loop = true;
    audio.volume = 0.85;

    let isPlaying = false;

    function playAudio() {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                control.classList.add('audio-control--playing');
                if (label) label.textContent = 'BD23 SAGA ♪';
            }).catch(error => {
                console.log('[Audio] Autoplay blocked by browser policy:', error);
                isPlaying = false;
                control.classList.remove('audio-control--playing');
                if (label) label.textContent = 'PLAY BD23 SAGA';
                
                // Set up a one-time user interaction listener to play audio automatically
                setupFirstInteractionListener();
            });
        }
    }

    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        control.classList.remove('audio-control--playing');
        if (label) label.textContent = 'SOUND PAUSED';
    }

    function toggleAudio() {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    function setupFirstInteractionListener() {
        const startOnInteraction = () => {
            if (!isPlaying) {
                playAudio();
            }
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('touchstart', startOnInteraction);
            document.removeEventListener('keydown', startOnInteraction);
        };

        document.addEventListener('click', startOnInteraction, { once: true });
        document.addEventListener('touchstart', startOnInteraction, { once: true });
        document.addEventListener('keydown', startOnInteraction, { once: true });
    }

    // Event listener for audio control widget
    control.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAudio();
    });

    control.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAudio();
        }
    });

    // Expose global methods
    window.startBirthdayAudio = function() {
        playAudio();
    };

    window.pauseBirthdayAudio = function() {
        pauseAudio();
    };

    // Attempt immediate playback
    playAudio();
}
