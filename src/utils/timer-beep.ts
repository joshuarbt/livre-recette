let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return null;
  }

  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContextCtor();
  }

  return sharedContext;
}

/** Short double-beep when a cooking timer reaches zero. */
export function playTimerCompleteBeep(): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const audio = context;

  void audio.resume().then(() => {
    const now = audio.currentTime;

    function tone(startAt: number, frequency: number, duration: number): void {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.02);
    }

    tone(now, 880, 0.18);
    tone(now + 0.22, 1175, 0.22);
  });
}
