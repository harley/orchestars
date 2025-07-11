// Audio and haptic feedback utilities for ticket scanner

import type { SoundType, VibrationPattern, AudioManager, VibrationManager } from '@/types/TicketScanning'

// Audio feedback manager
class AudioFeedbackManager implements AudioManager {
  private enabled: boolean = true
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundType, AudioBuffer> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudioContext()
      this.preloadSounds()
    }
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Audio context not supported:', error)
    }
  }

  private async preloadSounds() {
    if (!this.audioContext) return

    const soundDefinitions: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
      success: { frequency: 800, duration: 200, type: 'sine' },
      error: { frequency: 300, duration: 400, type: 'sawtooth' },
      scan: { frequency: 600, duration: 100, type: 'sine' },
      checkin: { frequency: 1000, duration: 300, type: 'sine' }
    }

    for (const [soundType, config] of Object.entries(soundDefinitions)) {
      try {
        const buffer = await this.createSoundBuffer(config.frequency, config.duration, config.type)
        this.sounds.set(soundType as SoundType, buffer)
      } catch (error) {
        console.warn(`Failed to create sound for ${soundType}:`, error)
      }
    }
  }

  private async createSoundBuffer(frequency: number, duration: number, type: OscillatorType): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available')

    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * (duration / 1000)
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let sample = 0

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5))
          break
        default:
          sample = Math.sin(2 * Math.PI * frequency * t)
      }

      // Apply envelope to avoid clicks
      const envelope = Math.exp(-t * 3)
      data[i] = sample * envelope * 0.3 // Reduce volume
    }

    return buffer
  }

  play(sound: SoundType): void {
    if (!this.enabled || !this.audioContext || !this.sounds.has(sound)) return

    try {
      const buffer = this.sounds.get(sound)!
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Fade in/out to prevent clicks
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + buffer.duration - 0.01)

      source.start()
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }
}

// Vibration feedback manager
class VibrationFeedbackManager implements VibrationManager {
  private enabled: boolean = true

  vibrate(pattern: VibrationPattern = 200): void {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.warn('Vibration not supported:', error)
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }
}

// Predefined vibration patterns
export const VIBRATION_PATTERNS = {
  success: [100, 50, 100] as VibrationPattern,
  error: [200, 100, 200, 100, 200] as VibrationPattern,
  scan: 50 as VibrationPattern,
  checkin: [150, 50, 150, 50, 300] as VibrationPattern,
  warning: [100, 100, 100] as VibrationPattern
}

// Singleton instances
export const audioManager = new AudioFeedbackManager()
export const vibrationManager = new VibrationFeedbackManager()

// Convenience functions
export const playSuccessSound = () => audioManager.play('success')
export const playErrorSound = () => audioManager.play('error')
export const playScanSound = () => audioManager.play('scan')
export const playCheckinSound = () => audioManager.play('checkin')

export const vibrateSuccess = () => vibrationManager.vibrate(VIBRATION_PATTERNS.success)
export const vibrateError = () => vibrationManager.vibrate(VIBRATION_PATTERNS.error)
export const vibrateScan = () => vibrationManager.vibrate(VIBRATION_PATTERNS.scan)
export const vibrateCheckin = () => vibrationManager.vibrate(VIBRATION_PATTERNS.checkin)
export const vibrateWarning = () => vibrationManager.vibrate(VIBRATION_PATTERNS.warning)

// Combined feedback functions
export const provideFeedback = (
  type: SoundType,
  options: { sound?: boolean; vibration?: boolean } = { sound: true, vibration: true }
) => {
  if (options.sound) {
    audioManager.play(type)
  }
  
  if (options.vibration) {
    const pattern = VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.scan
    vibrationManager.vibrate(pattern)
  }
}

// Settings management
export const updateFeedbackSettings = (settings: {
  soundEnabled?: boolean
  vibrationEnabled?: boolean
}) => {
  if (settings.soundEnabled !== undefined) {
    audioManager.setEnabled(settings.soundEnabled)
  }
  if (settings.vibrationEnabled !== undefined) {
    vibrationManager.setEnabled(settings.vibrationEnabled)
  }
}

// Check device capabilities
export const getDeviceCapabilities = () => {
  return {
    hasAudio: typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext),
    hasVibration: typeof window !== 'undefined' && !!navigator.vibrate,
    hasCamera: typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  }
}

// Initialize feedback on first user interaction
export const initializeFeedback = () => {
  if (typeof window === 'undefined') return

  const initAudio = () => {
    // Resume audio context if suspended (required by some browsers)
    if (audioManager['audioContext']?.state === 'suspended') {
      audioManager['audioContext'].resume()
    }
    document.removeEventListener('click', initAudio)
    document.removeEventListener('touchstart', initAudio)
  }

  document.addEventListener('click', initAudio, { once: true })
  document.addEventListener('touchstart', initAudio, { once: true })
}
