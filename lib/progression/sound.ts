export interface BattleSoundPlayer {
  playHit(): void;
  playVictory(): void;
}

const playTone = (frequencies: readonly number[]): void => {
  if (typeof window === "undefined") return;
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) return;
  try {
    const context = new AudioContextConstructor();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    gain.connect(context.destination);
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(context.currentTime + index * 0.045);
      oscillator.stop(context.currentTime + 0.18);
    });
  } catch {
    // Audio is optional; readable feedback remains available.
  }
};

export class WebAudioBattleSoundPlayer implements BattleSoundPlayer {
  playHit(): void {
    playTone([240, 330]);
  }

  playVictory(): void {
    playTone([330, 440, 660]);
  }
}
