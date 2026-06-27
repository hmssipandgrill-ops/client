import { useRef, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useNotificationSound() {
  const [soundEnabled, setSoundEnabled] = useLocalStorage('hms_sound', true)
  const audioCtxRef = useRef(null)

  const getCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  // Three-tone "new order" chime
  const playNewOrder = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = getCtx()
      const notes = [880, 1100, 880]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 0.3)
      })
    } catch {
      // AudioContext not available (e.g. SSR or blocked)
    }
  }, [soundEnabled])

  // Two-tone "order ready" chime
  const playOrderReady = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = getCtx()
      const notes = [660, 880]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2)
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.2)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.4)
        osc.start(ctx.currentTime + i * 0.2)
        osc.stop(ctx.currentTime + i * 0.2 + 0.4)
      })
    } catch {}
  }, [soundEnabled])

  // Single low "alert" tone
  const playAlert = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [soundEnabled])

  return { soundEnabled, setSoundEnabled, playNewOrder, playOrderReady, playAlert }
}
