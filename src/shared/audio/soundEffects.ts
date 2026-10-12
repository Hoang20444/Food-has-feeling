/**
 * Procedural audio synthesizer using Web Audio API.
 *
 * Zero external audio files required. Produces warm, cozy, low-poly-style
 * sound effects and lo-fi radio humming directly in the browser.
 */

let audioCtx: AudioContext | null = null
let isMuted = false
let radioOsc1: OscillatorNode | null = null
let radioOsc2: OscillatorNode | null = null
let radioGain: GainNode | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export const soundEffects = {
  getMuted: () => isMuted,
  setMuted: (muted: boolean) => {
    isMuted = muted
    if (muted && radioGain) {
      radioGain.gain.setValueAtTime(0, audioCtx?.currentTime || 0)
    }
  },
  toggleMute: () => {
    soundEffects.setMuted(!isMuted)
    return isMuted
  },

  /** Warm ceramic clink for Plate */
  playPlateClink: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.04)
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.3)
  },

  /** Gentle warm chime / steam bubble for Mug */
  playMugWarmth: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, now) // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12) // E5

    gain.gain.setValueAtTime(0.07, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.36)
  },

  /** Playful spring and click for Toaster */
  playToasterPop: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Spring ping
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08)
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.22)

    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.26)
  },

  /** Soft whistle tone for Kettle */
  playKettleWhistle: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(784, now) // G5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18) // A5
    osc.frequency.exponentialRampToValueAtTime(784, now + 0.4)

    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.06, now + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.46)
  },

  /** Continuous cozy lo-fi hum & tune for Radio */
  startRadioHum: () => {
    if (isMuted || radioOsc1) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    radioGain = ctx.createGain()
    radioGain.gain.setValueAtTime(0.001, now)
    radioGain.gain.linearRampToValueAtTime(0.045, now + 0.2)

    radioOsc1 = ctx.createOscillator()
    radioOsc1.type = 'triangle'
    radioOsc1.frequency.setValueAtTime(196, now) // G3

    radioOsc2 = ctx.createOscillator()
    radioOsc2.type = 'sine'
    radioOsc2.frequency.setValueAtTime(293.66, now) // D4

    // Bandpass filter for vintage lo-fi radio warmth
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(450, now)
    filter.Q.setValueAtTime(2.5, now)

    radioOsc1.connect(filter)
    radioOsc2.connect(filter)
    filter.connect(radioGain)
    radioGain.connect(ctx.destination)

    radioOsc1.start(now)
    radioOsc2.start(now)
  },

  stopRadioHum: () => {
    if (!radioGain || !audioCtx) return
    const now = audioCtx.currentTime
    radioGain.gain.linearRampToValueAtTime(0.0001, now + 0.15)
    setTimeout(() => {
      try {
        radioOsc1?.stop()
        radioOsc2?.stop()
      } catch {}
      radioOsc1?.disconnect()
      radioOsc2?.disconnect()
      radioGain?.disconnect()
      radioOsc1 = null
      radioOsc2 = null
      radioGain = null
    }, 180)
  },

  /** Ethereal magical 3-chord chime when the Kitchen Wakes Up */
  playAwakeningChime: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const time = now + idx * 0.12

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0.001, time)
      gain.gain.linearRampToValueAtTime(0.08, time + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(time)
      osc.stop(time + 0.65)
    })
  },

  /** Soft curious vocal chirp for Berry */
  playBerryChirp: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(620, now)
    osc.frequency.exponentialRampToValueAtTime(940, now + 0.1)
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.22)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.07, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.26)
  },

  /** Playful double bounce chirp for Berry */
  playBerryGiggle: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    ;[0, 0.12].forEach((offset, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + offset

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(idx === 0 ? 780 : 980, start)
      osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 920 : 1100, start + 0.08)

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.linearRampToValueAtTime(0.06, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.15)
    })
  },

  /** Subtle soft rustle when Berry emerges from hiding */
  playBerryRustle: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.linearRampToValueAtTime(520, now + 0.15)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.04, now + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.22)
  },

  /** Soft bubbly upward pop tone when grabbing an object */
  playGrabPop: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(260, now)
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.08)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.09, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.13)
  },

  /** Cozy hollow wooden/ceramic tap when placing an object onto a surface */
  playDropTap: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Low wooden body thump
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.09)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.11)

    // Crisp contact click
    const click = ctx.createOscillator()
    const clickGain = ctx.createGain()
    click.type = 'sine'
    click.frequency.setValueAtTime(1400, now)
    click.frequency.exponentialRampToValueAtTime(400, now + 0.02)
    clickGain.gain.setValueAtTime(0.04, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
    click.connect(clickGain)
    clickGain.connect(ctx.destination)
    click.start(now)
    click.stop(now + 0.035)
  },

  /** Delicate, warm sparkle chime when a special friendship relationship is discovered */
  playFriendshipChime: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Ethereal rising triad: F#5 (739.99), A5 (880), C#6 (1108.73), E6 (1318.51)
    const freqs = [739.99, 880, 1108.73, 1318.51]
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.09

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.linearRampToValueAtTime(0.065, start + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.48)
    })
  },

  /** Playful descending spring wobble sound when dropped in an invalid area */
  playWobbleReturn: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Vibrato downward slide
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.linearRampToValueAtTime(280, now + 0.25)

    // Gentle amplitude flutter
    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.32)
  },

  /** Tiny subtle tick on hover */
  playGentleTouch: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    gain.gain.setValueAtTime(0.02, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.045)
  },

  /** Delicate morning bird chirps */
  playMorningBirds: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const pitches = [1975, 2349, 2793, 2349] // B6, D7, F7, D7
    pitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.075

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, start + 0.04)

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.linearRampToValueAtTime(0.035, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.065)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.07)
    })
  },

  /** Soft evening cricket chirps */
  playEveningCrickets: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + i * 0.06

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(4500, start)

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.linearRampToValueAtTime(0.02, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.045)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.05)
    }
  },

  /** Cozy mechanical camera shutter click and film advance */
  playCameraShutter: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Crisp shutter snap
    const snap = ctx.createOscillator()
    const snapGain = ctx.createGain()
    snap.type = 'triangle'
    snap.frequency.setValueAtTime(1200, now)
    snap.frequency.exponentialRampToValueAtTime(180, now + 0.035)

    snapGain.gain.setValueAtTime(0.12, now)
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    snap.connect(snapGain)
    snapGain.connect(ctx.destination)
    snap.start(now)
    snap.stop(now + 0.045)

    // Secondary mechanical click
    const click = ctx.createOscillator()
    const clickGain = ctx.createGain()
    click.type = 'square'
    click.frequency.setValueAtTime(800, now + 0.06)
    click.frequency.exponentialRampToValueAtTime(200, now + 0.09)

    clickGain.gain.setValueAtTime(0.06, now + 0.06)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    click.connect(clickGain)
    clickGain.connect(ctx.destination)
    click.start(now + 0.06)
    click.stop(now + 0.11)

    // Soft whirring film advance
    const whir = ctx.createOscillator()
    const whirGain = ctx.createGain()
    whir.type = 'sine'
    whir.frequency.setValueAtTime(320, now + 0.12)
    whir.frequency.linearRampToValueAtTime(480, now + 0.3)

    whirGain.gain.setValueAtTime(0.001, now + 0.12)
    whirGain.gain.linearRampToValueAtTime(0.03, now + 0.18)
    whirGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    whir.connect(whirGain)
    whirGain.connect(ctx.destination)
    whir.start(now + 0.12)
    whir.stop(now + 0.36)
  },

  /** Nurturing purr / warm heart flutter when comforting a friend */
  playCarePurr: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Warm chord (C5, G5, C6) rising gently
    const freqs = [523.25, 783.99, 1046.5]
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, now + 0.3)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.045, now + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.52)
    })
  },

  /** Magical starry chime sweep when brushing away a small mess */
  playCleanSparkle: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Rising pentatonic harp sweep
    const sweep = [659.25, 783.99, 987.77, 1318.51, 1567.98] // E5, G5, B5, E6, G6
    sweep.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.05

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.linearRampToValueAtTime(0.05, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.3)
    })
  },
}


