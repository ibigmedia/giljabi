'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { YStack, XStack, SizableText, Button } from '@my/ui'
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from '@tamagui/lucide-icons'

export type VisualizerMode = 'bars' | 'circular' | 'wave'
export type VisualizerTheme = {
    primary: string
    secondary: string
    accent: string
    bg: string
}

const THEMES: Record<string, VisualizerTheme> = {
    ocean: { primary: '#4F7CFF', secondary: '#7B61FF', accent: '#00D2FF', bg: '#0a0e27' },
    sunset: { primary: '#FF6B6B', secondary: '#FF8E53', accent: '#FFE66D', bg: '#1a0a1e' },
    forest: { primary: '#00C9A7', secondary: '#845EC2', accent: '#4FFBDF', bg: '#0a1a15' },
    neon: { primary: '#FF00FF', secondary: '#00FFFF', accent: '#FFFF00', bg: '#0a0a0a' },
}

interface AudioVisualizerProps {
    audioUrl?: string
    trackTitle?: string
    artist?: string
    coverArt?: string
    mode?: VisualizerMode
    theme?: string
    onTrackEnd?: () => void
}

export function AudioVisualizer({
    audioUrl,
    trackTitle = 'Unknown Track',
    artist = 'Unknown Artist',
    coverArt,
    mode = 'circular',
    theme = 'ocean',
    onTrackEnd,
}: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const animFrameRef = useRef<number>(0)

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.8)

    const colors: VisualizerTheme = THEMES[theme] ?? THEMES.ocean!

    const initAudio = useCallback(() => {
        if (!audioUrl || audioCtxRef.current) return

        const audio = new Audio(audioUrl)
        audio.crossOrigin = 'anonymous'
        audio.volume = volume
        audioRef.current = audio

        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
        audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
        audio.addEventListener('ended', () => { setIsPlaying(false); onTrackEnd?.() })

        const ctx = new AudioContext()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8

        const source = ctx.createMediaElementSource(audio)
        source.connect(analyser)
        analyser.connect(ctx.destination)

        audioCtxRef.current = ctx
        analyserRef.current = analyser
        sourceRef.current = source
    }, [audioUrl, volume, onTrackEnd])

    const togglePlay = useCallback(async () => {
        if (!audioRef.current) {
            initAudio()
            // Wait for next tick
            await new Promise(r => setTimeout(r, 50))
        }
        if (!audioRef.current) return

        if (audioCtxRef.current?.state === 'suspended') {
            await audioCtxRef.current.resume()
        }

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            await audioRef.current.play()
            setIsPlaying(true)
        }
    }, [isPlaying, initAudio])

    // Visualizer rendering
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = canvas.offsetWidth * 2
            canvas.height = canvas.offsetHeight * 2
        }
        resize()
        window.addEventListener('resize', resize)

        const draw = () => {
            animFrameRef.current = requestAnimationFrame(draw)
            const w = canvas.width
            const h = canvas.height

            ctx.fillStyle = colors.bg
            ctx.fillRect(0, 0, w, h)

            const analyser = analyserRef.current
            const bufferLength = analyser ? analyser.frequencyBinCount : 64
            const dataArray = new Uint8Array(bufferLength)
            analyser?.getByteFrequencyData(dataArray)

            // Background ambient glow
            const avgFreq = dataArray.reduce((a, b) => a + b, 0) / bufferLength
            const glowIntensity = avgFreq / 255

            if (mode === 'circular') {
                drawCircular(ctx, w, h, dataArray, bufferLength, colors!, glowIntensity)
            } else if (mode === 'bars') {
                drawBars(ctx, w, h, dataArray, bufferLength, colors!, glowIntensity)
            } else {
                drawWave(ctx, w, h, dataArray, bufferLength, colors!, glowIntensity)
            }
        }

        draw()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animFrameRef.current)
        }
    }, [mode, colors])

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            audioRef.current?.pause()
            audioCtxRef.current?.close()
        }
    }, [])

    const seekTo = (pct: number) => {
        if (audioRef.current && duration) {
            audioRef.current.currentTime = pct * duration
        }
    }

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60)
        const sec = Math.floor(s % 60)
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    return (
        <YStack width="100%" gap="$4">
            {/* Visualizer Canvas */}
            <YStack
                width="100%"
                height={400}
                borderRadius="$6"
                overflow="hidden"
                position="relative"
            >
                {/* @ts-ignore */}
                <canvas
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        borderRadius: 16,
                    }}
                />

                {/* Overlay: cover art + track info */}
                <YStack
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p="$5"
                    gap="$2"
                    // @ts-ignore
                    style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}
                >
                    <XStack gap="$3" alignItems="center">
                        {coverArt && (
                            <YStack width={56} height={56} borderRadius="$3" overflow="hidden" elevation="$2">
                                {/* @ts-ignore */}
                                <img src={coverArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </YStack>
                        )}
                        <YStack flex={1}>
                            <SizableText size="$5" fontWeight="800" color="white">{trackTitle}</SizableText>
                            <SizableText size="$3" color="rgba(255,255,255,0.7)">{artist}</SizableText>
                        </YStack>
                    </XStack>
                </YStack>
            </YStack>

            {/* Transport Controls */}
            <YStack
                bg="rgba(15,15,30,0.95)"
                borderRadius="$5"
                p="$4"
                gap="$3"
                // @ts-ignore
                style={{ backdropFilter: 'blur(20px)' }}
            >
                {/* Progress bar */}
                <XStack alignItems="center" gap="$3">
                    <SizableText size="$2" color="rgba(255,255,255,0.5)" fontFamily={"$mono" as any}>{formatTime(currentTime)}</SizableText>
                    <YStack flex={1} height={6} bg="rgba(255,255,255,0.1)" borderRadius="$full" overflow="hidden" cursor="pointer"
                        onPress={(e: any) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            seekTo((e.clientX - rect.left) / rect.width)
                        }}
                    >
                        <YStack
                            height="100%"
                            width={`${duration ? (currentTime / duration) * 100 : 0}%`}
                            borderRadius="$full"
                            // @ts-ignore
                            style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }}
                        />
                    </YStack>
                    <SizableText size="$2" color="rgba(255,255,255,0.5)" fontFamily={"$mono" as any}>-{formatTime(Math.max(0, duration - currentTime))}</SizableText>
                </XStack>

                {/* Buttons */}
                <XStack justifyContent="center" alignItems="center" gap="$5">
                    <Button circular size="$3" bg="transparent" icon={<Shuffle size={18} color="rgba(255,255,255,0.5)" />} />
                    <Button circular size="$3" bg="transparent" icon={<SkipBack size={20} color="white" />} />
                    <Button
                        circular
                        size="$6"
                        // @ts-ignore
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
                        elevation="$2"
                        onPress={togglePlay}
                        icon={isPlaying ? <Pause size={28} color="white" /> : <Play size={28} color="white" />}
                    />
                    <Button circular size="$3" bg="transparent" icon={<SkipForward size={20} color="white" />} />
                    <Button circular size="$3" bg="transparent" icon={<Repeat size={18} color="rgba(255,255,255,0.5)" />} />
                </XStack>

                {/* Volume */}
                <XStack alignItems="center" gap="$2" alignSelf="center" width={200}>
                    <Volume2 size={16} color="rgba(255,255,255,0.5)" />
                    <YStack flex={1} height={4} bg="rgba(255,255,255,0.1)" borderRadius="$full" overflow="hidden" cursor="pointer"
                        onPress={(e: any) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                            setVolume(v)
                            if (audioRef.current) audioRef.current.volume = v
                        }}
                    >
                        <YStack
                            height="100%"
                            width={`${volume * 100}%`}
                            borderRadius="$full"
                            bg={colors.primary as any}
                        />
                    </YStack>
                </XStack>
            </YStack>
        </YStack>
    )
}

// --- Drawing functions ---

function drawCircular(ctx: CanvasRenderingContext2D, w: number, h: number, data: Uint8Array, len: number, colors: VisualizerTheme, glow: number) {
    const cx = w / 2, cy = h / 2
    const baseRadius = Math.min(w, h) * 0.22
    const maxBarH = Math.min(w, h) * 0.18

    // Ambient glow
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius + maxBarH)
    gradient.addColorStop(0, `${colors.primary}${Math.floor(glow * 40).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    // Rotating particles
    const time = Date.now() / 1000
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2 + time * 0.3
        const dist = baseRadius + maxBarH * 0.8 + Math.sin(time + i) * 20
        const x = cx + Math.cos(angle) * dist
        const y = cy + Math.sin(angle) * dist
        const size = 2 + glow * 4
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `${colors.accent}${Math.floor((0.2 + glow * 0.3) * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
    }

    // Circular bars
    const bars = Math.min(len, 80)
    for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
        const val = data[i]! / 255
        const barH = val * maxBarH

        const x1 = cx + Math.cos(angle) * baseRadius
        const y1 = cy + Math.sin(angle) * baseRadius
        const x2 = cx + Math.cos(angle) * (baseRadius + barH)
        const y2 = cy + Math.sin(angle) * (baseRadius + barH)

        const barGrad = ctx.createLinearGradient(x1, y1, x2, y2)
        barGrad.addColorStop(0, colors.primary)
        barGrad.addColorStop(0.5, colors.secondary)
        barGrad.addColorStop(1, colors.accent)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = barGrad
        ctx.lineWidth = Math.max(2, (w / bars) * 0.5)
        ctx.lineCap = 'round'
        ctx.stroke()
    }

    // Inner circle with glow
    ctx.beginPath()
    ctx.arc(cx, cy, baseRadius * 0.75, 0, Math.PI * 2)
    ctx.fillStyle = `${colors.bg}`
    ctx.fill()
    ctx.strokeStyle = `${colors.primary}88`
    ctx.lineWidth = 2
    ctx.stroke()

    // Pulsing ring
    ctx.beginPath()
    ctx.arc(cx, cy, baseRadius * (0.75 + glow * 0.05), 0, Math.PI * 2)
    ctx.strokeStyle = `${colors.accent}${Math.floor(glow * 100).toString(16).padStart(2, '0')}`
    ctx.lineWidth = 1.5
    ctx.stroke()
}

function drawBars(ctx: CanvasRenderingContext2D, w: number, h: number, data: Uint8Array, len: number, colors: VisualizerTheme, glow: number) {
    const bars = Math.min(len, 64)
    const gap = 4
    const barW = (w - gap * (bars + 1)) / bars

    // Ambient
    const grad = ctx.createLinearGradient(0, h, 0, 0)
    grad.addColorStop(0, `${colors.primary}15`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    for (let i = 0; i < bars; i++) {
        const val = data[i]! / 255
        const barH = val * h * 0.85
        const x = gap + i * (barW + gap)

        // Bar gradient
        const barGrad = ctx.createLinearGradient(x, h, x, h - barH)
        barGrad.addColorStop(0, colors.primary)
        barGrad.addColorStop(0.5, colors.secondary)
        barGrad.addColorStop(1, colors.accent)

        // Glow
        ctx.shadowColor = colors.primary
        ctx.shadowBlur = glow * 20
        ctx.fillStyle = barGrad
        ctx.beginPath()
        ctx.roundRect(x, h - barH, barW, barH, [barW / 2, barW / 2, 0, 0])
        ctx.fill()
        ctx.shadowBlur = 0

        // Reflection
        ctx.fillStyle = `${colors.primary}15`
        ctx.beginPath()
        ctx.roundRect(x, h, barW, barH * 0.3, [0, 0, barW / 2, barW / 2])
        ctx.fill()
    }
}

function drawWave(ctx: CanvasRenderingContext2D, w: number, h: number, data: Uint8Array, len: number, colors: VisualizerTheme, glow: number) {
    const cy = h / 2
    const points = Math.min(len, 128)

    // Multiple wave layers
    for (let layer = 0; layer < 3; layer++) {
        const amp = (h * 0.3) * (1 - layer * 0.25)
        const alpha = 1 - layer * 0.3

        ctx.beginPath()
        ctx.moveTo(0, cy)

        for (let i = 0; i <= points; i++) {
            const x = (i / points) * w
            const val = (data[i % len]! / 255) * amp
            const offset = Math.sin(Date.now() / 1000 + i * 0.1 + layer) * 10
            const y = cy + (i % 2 === 0 ? val : -val) + offset
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        }

        ctx.strokeStyle = layer === 0 ? colors.primary : layer === 1 ? colors.secondary : colors.accent
        ctx.lineWidth = 3 - layer
        ctx.globalAlpha = alpha
        ctx.stroke()
        ctx.globalAlpha = 1

        // Fill under wave
        ctx.lineTo(w, cy)
        ctx.lineTo(0, cy)
        ctx.closePath()
        ctx.fillStyle = `${layer === 0 ? colors.primary : colors.secondary}08`
        ctx.fill()
    }
}

export { THEMES }
