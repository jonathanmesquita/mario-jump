/* Sound system: short retro effects made with the Web Audio API, so the
   game needs no sound files.

   Each effect is a list of notes: [frequency in Hz, start in s, length in s].
   A second frequency after the length makes the note slide to it. */
const SOUNDS = {
    jump:     { wave: 'square',   notes: [[420, 0, 0.12, 700]] },
    hit:      { wave: 'sawtooth', notes: [[240, 0, 0.25, 70]] },
    scene:    { wave: 'square',   notes: [[523, 0, 0.09], [784, 0.09, 0.14]] },
    gameover: { wave: 'square',   notes: [[392, 0, 0.18], [330, 0.18, 0.18], [262, 0.36, 0.4]] },
    win:      { wave: 'square',   notes: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.4]] },
};

const SOUND_VOLUME = 0.07;

let audioContext = null;

function playSound(name) {
    if (!settings.sound) return;

    // Browsers only allow sound after a click or key press. Every effect is
    // triggered by one, so the context is created on the first effect.
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();

    const sound = SOUNDS[name];
    const now = audioContext.currentTime;

    for (const [frequency, start, length, slideTo] of sound.notes) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = sound.wave;
        oscillator.frequency.setValueAtTime(frequency, now + start);
        if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + start + length);

        // Quick fade out so notes don't click when they stop.
        gain.gain.setValueAtTime(SOUND_VOLUME, now + start);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);

        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(now + start);
        oscillator.stop(now + start + length);
    }
}
