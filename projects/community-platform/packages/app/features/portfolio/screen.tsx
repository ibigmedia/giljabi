'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { YStack, XStack, SizableText, Button, ScrollView, Separator } from '@my/ui'
import { Play, Pause, SkipForward, SkipBack, X, Music, Video, Clock, Eye, ChevronDown, ChevronUp, Volume2 } from '@tamagui/lucide-icons'

// --- Types ---
type Track = { id: string; title: string; duration: string; plays: number; audioUrl?: string; position: number }
type Release = { id: string; title: string; artist: string; year: number; type: string; coverUrl: string; status: string; tracks: Track[] }
type MusicVideo = { id: string; title: string; youtubeUrl: string; thumbnailUrl: string; duration: string; views: number; status: string; publishedAt: string }

function extractYouTubeId(url: string): string | null {
    if (!url) return null
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^&?\s]+)/)
    return m ? m[1]! : null
}

function formatPlays(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
}

// --- Sticky Player Hook ---
function usePlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [current, setCurrent] = useState<{ track: Track; release: Release } | null>(null)
    const [paused, setPaused] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [playlist, setPlaylist] = useState<{ track: Track; release: Release }[]>([])

    const play = useCallback((track: Track, release: Release, allTracks?: { track: Track; release: Release }[]) => {
        if (!track.audioUrl) return
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
        const audio = new Audio(track.audioUrl)
        audioRef.current = audio
        audio.play().catch(() => { })
        audio.ontimeupdate = () => setProgress(audio.currentTime)
        audio.onloadedmetadata = () => setDuration(audio.duration)
        audio.onended = () => next()
        setCurrent({ track, release })
        setPaused(false)
        if (allTracks) setPlaylist(allTracks)
    }, [])

    const togglePause = useCallback(() => {
        if (!audioRef.current) return
        if (paused) { audioRef.current.play().catch(() => { }); setPaused(false) }
        else { audioRef.current.pause(); setPaused(true) }
    }, [paused])

    const stop = useCallback(() => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
        setCurrent(null); setPaused(false); setProgress(0)
    }, [])

    const seek = useCallback((pct: number) => {
        if (audioRef.current && duration) { audioRef.current.currentTime = pct * duration }
    }, [duration])

    const next = useCallback(() => {
        if (!current || playlist.length === 0) return
        const idx = playlist.findIndex(p => p.track.id === current.track.id)
        const nextItem = playlist[idx + 1]
        if (nextItem) play(nextItem.track, nextItem.release, playlist)
        else stop()
    }, [current, playlist, play, stop])

    const prev = useCallback(() => {
        if (!current || playlist.length === 0) return
        const idx = playlist.findIndex(p => p.track.id === current.track.id)
        const prevItem = playlist[idx - 1]
        if (prevItem) play(prevItem.track, prevItem.release, playlist)
    }, [current, playlist, play])

    return { current, paused, progress, duration, play, togglePause, stop, seek, next, prev }
}

function formatTime(s: number) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
}

const PAGE_CSS = `
  .portfolio-page { background: #060612; min-height: 100vh; }
  .track-row { transition: background 0.15s; }
  .track-row:hover { background: rgba(255,255,255,0.04) !important; }
  .video-card { transition: transform 0.2s; cursor: pointer; }
  .video-card:hover { transform: scale(1.02); }
  .video-card:hover .video-play-btn { opacity: 1 !important; }
  .progress-bar { cursor: pointer; position: relative; }
  .progress-bar:hover .progress-thumb { opacity: 1; }
  .progress-thumb { opacity: 0; transition: opacity 0.15s; }
  .release-card { transition: transform 0.2s, box-shadow 0.2s; }
  .release-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.3); }
`

export function PortfolioScreen() {
    const [releases, setReleases] = useState<Release[]>([])
    const [videos, setVideos] = useState<MusicVideo[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedRelease, setExpandedRelease] = useState<string | null>(null)
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState<'music' | 'videos'>('music')
    const player = usePlayer()

    useEffect(() => {
        Promise.all([
            fetch('/api/portfolio/releases').then(r => r.ok ? r.json() : []).catch(() => []),
            fetch('/api/portfolio/videos').then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([rel, vid]) => {
            const pubReleases = (rel as any[]).filter((r: any) => r.status === 'published').map((r: any) => ({
                ...r, year: Number(r.year),
                tracks: (r.tracks || []).map((t: any, i: number) => ({ ...t, plays: t.plays || 0, position: t.position || i }))
                    .sort((a: Track, b: Track) => a.position - b.position),
            }))
            const pubVideos = (vid as any[]).filter((v: any) => v.status === 'published').map((v: any) => ({
                ...v, views: v.views || 0,
                publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString().slice(0, 10) : '',
            }))
            setReleases(pubReleases)
            setVideos(pubVideos)
            if (pubReleases.length > 0) setExpandedRelease(pubReleases[0]!.id)
        }).finally(() => setLoading(false))
    }, [])

    // Build flat playlist from all releases
    const allTracks = releases.flatMap(r => r.tracks.filter(t => t.audioUrl).map(t => ({ track: t, release: r })))
    const totalTracks = releases.reduce((s, r) => s + r.tracks.length, 0)

    const playRelease = (release: Release) => {
        const playable = release.tracks.filter(t => t.audioUrl)
        if (playable.length === 0) return
        const relPlaylist = playable.map(t => ({ track: t, release }))
        player.play(playable[0]!, release, relPlaylist)
        setPlayingVideoId(null)
    }

    const playTrack = (track: Track, release: Release) => {
        if (!track.audioUrl) return
        player.play(track, release, allTracks)
        setPlayingVideoId(null)
    }

    const playVideo = (videoId: string) => {
        player.stop()
        setPlayingVideoId(videoId)
    }

    return (
        <ScrollView flex={1}>
            <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
            <div className="portfolio-page">
                <YStack maxWidth={960} alignSelf="center" width="100%" px="$4" pt="$8" pb={player.current ? 120 : 40} gap="$6">

                    {/* Header */}
                    <YStack gap="$2">
                        <SizableText size="$10" fontWeight="900" color="white" letterSpacing={-1}>Portfolio</SizableText>
                        <SizableText size="$3" color="rgba(255,255,255,0.5)">
                            {releases.length} releases · {totalTracks} tracks · {videos.length} videos
                        </SizableText>
                    </YStack>

                    {/* Section Tabs */}
                    <XStack gap="$1" borderBottomWidth={1} borderColor="rgba(255,255,255,0.1)">
                        {[
                            { key: 'music' as const, label: 'Music', icon: Music, count: releases.length },
                            { key: 'videos' as const, label: 'Videos', icon: Video, count: videos.length },
                        ].map(tab => (
                            <XStack
                                key={tab.key}
                                alignItems="center"
                                gap="$2"
                                paddingHorizontal="$4"
                                paddingVertical="$3"
                                borderBottomWidth={2}
                                borderColor={activeSection === tab.key ? '#4F7CFF' : 'transparent'}
                                cursor="pointer"
                                onPress={() => setActiveSection(tab.key)}
                            >
                                <tab.icon size={16} color={activeSection === tab.key ? '#4F7CFF' : 'rgba(255,255,255,0.5)'} />
                                <SizableText
                                    size="$3"
                                    color={activeSection === tab.key ? '#4F7CFF' : 'rgba(255,255,255,0.5)'}
                                    fontWeight={activeSection === tab.key ? '700' : '500'}
                                >
                                    {tab.label}
                                </SizableText>
                                <SizableText
                                    size="$1"
                                    color={activeSection === tab.key ? '#4F7CFF' : 'rgba(255,255,255,0.3)'}
                                    bg={activeSection === tab.key ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.06)'}
                                    px="$2" py="$0.5" borderRadius="$full"
                                >
                                    {tab.count}
                                </SizableText>
                            </XStack>
                        ))}
                    </XStack>

                    {loading && (
                        <YStack p="$10" alignItems="center">
                            <SizableText color="rgba(255,255,255,0.5)" size="$4">Loading...</SizableText>
                        </YStack>
                    )}

                    {/* ===== MUSIC SECTION ===== */}
                    {!loading && activeSection === 'music' && (
                        <YStack gap="$5">
                            {releases.length === 0 ? (
                                <YStack p="$8" alignItems="center" gap="$3">
                                    <Music size={48} color="rgba(255,255,255,0.2)" />
                                    <SizableText size="$5" color="rgba(255,255,255,0.4)">아직 발행된 음반이 없습니다</SizableText>
                                </YStack>
                            ) : releases.map(release => {
                                const isExpanded = expandedRelease === release.id
                                const isCurrentRelease = player.current?.release.id === release.id
                                const playableTracks = release.tracks.filter(t => t.audioUrl)
                                return (
                                    <YStack key={release.id} borderRadius="$5" overflow="hidden" bg="rgba(255,255,255,0.03)" borderWidth={1} borderColor={isCurrentRelease ? 'rgba(79,124,255,0.3)' : 'rgba(255,255,255,0.06)'}>
                                        {/* Release Header */}
                                        <XStack p="$4" gap="$4" alignItems="center" flexWrap="wrap">
                                            {/* Cover Art */}
                                            <YStack
                                                width={80} height={80} borderRadius="$3" overflow="hidden"
                                                cursor={playableTracks.length > 0 ? 'pointer' : 'default'}
                                                onPress={() => playableTracks.length > 0 && playRelease(release)}
                                                position="relative"
                                            >
                                                {release.coverUrl ? (
                                                    // @ts-ignore
                                                    <img src={release.coverUrl} alt={release.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <YStack flex={1} bg="rgba(79,124,255,0.15)" alignItems="center" justifyContent="center">
                                                        <Music size={32} color="rgba(255,255,255,0.3)" />
                                                    </YStack>
                                                )}
                                                {playableTracks.length > 0 && (
                                                    <YStack position="absolute" top={0} left={0} right={0} bottom={0} alignItems="center" justifyContent="center" bg="rgba(0,0,0,0.3)" opacity={isCurrentRelease && !player.paused ? 1 : 0} hoverStyle={{ opacity: 1 }}>
                                                        {isCurrentRelease && !player.paused
                                                            ? <Volume2 size={24} color="white" />
                                                            : <Play size={24} color="white" />
                                                        }
                                                    </YStack>
                                                )}
                                            </YStack>

                                            {/* Release Info */}
                                            <YStack flex={1} gap="$1" minWidth={200}>
                                                <SizableText size="$5" fontWeight="800" color="white">{release.title}</SizableText>
                                                <XStack gap="$2" alignItems="center" flexWrap="wrap">
                                                    <SizableText size="$2" color="#4F7CFF" fontWeight="600">{release.artist}</SizableText>
                                                    <SizableText size="$2" color="rgba(255,255,255,0.3)">·</SizableText>
                                                    <SizableText size="$2" color="rgba(255,255,255,0.4)">{release.year}</SizableText>
                                                    <SizableText size="$2" color="rgba(255,255,255,0.3)">·</SizableText>
                                                    <SizableText size="$2" color="rgba(255,255,255,0.4)">{release.type}</SizableText>
                                                    <SizableText size="$2" color="rgba(255,255,255,0.3)">·</SizableText>
                                                    <SizableText size="$2" color="rgba(255,255,255,0.4)">{release.tracks.length}곡</SizableText>
                                                </XStack>
                                            </YStack>

                                            {/* Play All + Expand */}
                                            <XStack gap="$2" alignItems="center">
                                                {playableTracks.length > 0 && (
                                                    <Button
                                                        size="$3"
                                                        bg="#4F7CFF"
                                                        borderRadius="$full"
                                                        icon={isCurrentRelease && !player.paused ? <Pause size={14} color="white" /> : <Play size={14} color="white" />}
                                                        onPress={() => {
                                                            if (isCurrentRelease && !player.paused) player.togglePause()
                                                            else playRelease(release)
                                                        }}
                                                    >
                                                        <SizableText color="white" size="$2" fontWeight="700">
                                                            {isCurrentRelease && !player.paused ? 'Pause' : 'Play All'}
                                                        </SizableText>
                                                    </Button>
                                                )}
                                                <YStack
                                                    width={36} height={36} borderRadius="$full"
                                                    bg="rgba(255,255,255,0.06)" alignItems="center" justifyContent="center"
                                                    cursor="pointer"
                                                    onPress={() => setExpandedRelease(isExpanded ? null : release.id)}
                                                >
                                                    {isExpanded ? <ChevronUp size={18} color="rgba(255,255,255,0.5)" /> : <ChevronDown size={18} color="rgba(255,255,255,0.5)" />}
                                                </YStack>
                                            </XStack>
                                        </XStack>

                                        {/* Track List */}
                                        {isExpanded && (
                                            <YStack>
                                                <Separator borderColor="rgba(255,255,255,0.06)" />
                                                {/* Column Headers */}
                                                <XStack px="$4" py="$2" gap="$3" alignItems="center">
                                                    <SizableText width={28} textAlign="center" size="$1" color="rgba(255,255,255,0.3)" fontWeight="600">#</SizableText>
                                                    <SizableText flex={1} size="$1" color="rgba(255,255,255,0.3)" fontWeight="600">TITLE</SizableText>
                                                    <SizableText width={50} textAlign="right" size="$1" color="rgba(255,255,255,0.3)" fontWeight="600">PLAYS</SizableText>
                                                    <SizableText width={50} textAlign="right" size="$1" color="rgba(255,255,255,0.3)" fontWeight="600">
                                                        <Clock size={12} color="rgba(255,255,255,0.3)" />
                                                    </SizableText>
                                                </XStack>
                                                {release.tracks.map((track, idx) => {
                                                    const isCurrent = player.current?.track.id === track.id
                                                    const isPlayingThis = isCurrent && !player.paused
                                                    return (
                                                        <div key={track.id} className="track-row">
                                                            <XStack
                                                                px="$4" py="$3" gap="$3" alignItems="center"
                                                                bg={isCurrent ? 'rgba(79,124,255,0.08)' : 'transparent'}
                                                                cursor={track.audioUrl ? 'pointer' : 'default'}
                                                                onPress={() => playTrack(track, release)}
                                                            >
                                                                {/* Track Number / Play Icon */}
                                                                <YStack width={28} alignItems="center" justifyContent="center">
                                                                    {isPlayingThis ? (
                                                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 14 }}>
                                                                            <span style={{ width: 2, height: '60%', background: '#4F7CFF', borderRadius: 1, animation: 'equalize 0.6s ease-in-out infinite alternate' }} />
                                                                            <span style={{ width: 2, height: '100%', background: '#4F7CFF', borderRadius: 1, animation: 'equalize 0.6s ease-in-out infinite alternate 0.2s' }} />
                                                                            <span style={{ width: 2, height: '40%', background: '#4F7CFF', borderRadius: 1, animation: 'equalize 0.6s ease-in-out infinite alternate 0.4s' }} />
                                                                        </div>
                                                                    ) : isCurrent ? (
                                                                        <Pause size={14} color="#4F7CFF" />
                                                                    ) : track.audioUrl ? (
                                                                        <SizableText size="$2" color="rgba(255,255,255,0.4)" fontWeight="500">{idx + 1}</SizableText>
                                                                    ) : (
                                                                        <SizableText size="$2" color="rgba(255,255,255,0.2)" fontWeight="500">{idx + 1}</SizableText>
                                                                    )}
                                                                </YStack>

                                                                {/* Title */}
                                                                <SizableText
                                                                    flex={1} size="$3" numberOfLines={1}
                                                                    color={isCurrent ? '#4F7CFF' : track.audioUrl ? 'white' : 'rgba(255,255,255,0.35)'}
                                                                    fontWeight={isCurrent ? '700' : '500'}
                                                                >
                                                                    {track.title}
                                                                </SizableText>

                                                                {/* Plays */}
                                                                <SizableText width={50} textAlign="right" size="$2" color="rgba(255,255,255,0.3)">
                                                                    {track.plays > 0 ? formatPlays(track.plays) : '-'}
                                                                </SizableText>

                                                                {/* Duration */}
                                                                <SizableText width={50} textAlign="right" size="$2" color="rgba(255,255,255,0.3)">
                                                                    {track.duration}
                                                                </SizableText>
                                                            </XStack>
                                                        </div>
                                                    )
                                                })}
                                            </YStack>
                                        )}
                                    </YStack>
                                )
                            })}
                        </YStack>
                    )}

                    {/* ===== VIDEOS SECTION ===== */}
                    {!loading && activeSection === 'videos' && (
                        <YStack gap="$4">
                            {videos.length === 0 ? (
                                <YStack p="$8" alignItems="center" gap="$3">
                                    <Video size={48} color="rgba(255,255,255,0.2)" />
                                    <SizableText size="$5" color="rgba(255,255,255,0.4)">아직 발행된 영상이 없습니다</SizableText>
                                </YStack>
                            ) : (
                                <XStack gap="$4" flexWrap="wrap">
                                    {videos.map(mv => {
                                        const ytId = extractYouTubeId(mv.youtubeUrl)
                                        const isPlaying = playingVideoId === mv.id
                                        const thumb = mv.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '')
                                        return (
                                            <YStack key={mv.id} width="48%" minWidth={280} gap="$2">
                                                <div className="video-card">
                                                    <YStack width="100%" aspectRatio={16 / 9} borderRadius="$4" overflow="hidden" position="relative">
                                                        {isPlaying && ytId ? (
                                                            <>
                                                                {/* @ts-ignore */}
                                                                <iframe
                                                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                                                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                                                    allow="autoplay; encrypted-media" allowFullScreen
                                                                />
                                                                <YStack
                                                                    position="absolute" top="$2" right="$2"
                                                                    bg="rgba(0,0,0,0.7)" borderRadius="$full" p="$1.5"
                                                                    cursor="pointer" zIndex={10}
                                                                    onPress={() => setPlayingVideoId(null)}
                                                                >
                                                                    <X size={14} color="white" />
                                                                </YStack>
                                                            </>
                                                        ) : (
                                                            <YStack
                                                                flex={1}
                                                                cursor={ytId ? 'pointer' : 'default'}
                                                                onPress={() => { if (ytId) playVideo(mv.id) }}
                                                            >
                                                                {thumb ? (
                                                                    // @ts-ignore
                                                                    <img src={thumb} alt={mv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <YStack flex={1} bg="rgba(79,124,255,0.1)" alignItems="center" justifyContent="center">
                                                                        <Video size={40} color="rgba(255,255,255,0.2)" />
                                                                    </YStack>
                                                                )}
                                                                {/* Play button overlay */}
                                                                <YStack
                                                                    className="video-play-btn"
                                                                    position="absolute" top={0} left={0} right={0} bottom={0}
                                                                    alignItems="center" justifyContent="center"
                                                                    bg="rgba(0,0,0,0.3)" opacity={0}
                                                                >
                                                                    <YStack width={56} height={56} borderRadius={28} bg="rgba(255,0,0,0.85)" alignItems="center" justifyContent="center">
                                                                        <Play size={28} color="white" />
                                                                    </YStack>
                                                                </YStack>
                                                                {/* Duration badge */}
                                                                {mv.duration && mv.duration !== '0:00' && (
                                                                    <YStack position="absolute" bottom="$2" right="$2" bg="rgba(0,0,0,0.8)" borderRadius="$2" px="$2" py="$0.5">
                                                                        <SizableText color="white" size="$1" fontWeight="600">{mv.duration}</SizableText>
                                                                    </YStack>
                                                                )}
                                                            </YStack>
                                                        )}
                                                    </YStack>
                                                </div>
                                                <SizableText size="$3" fontWeight="700" color="white" numberOfLines={2}>{mv.title}</SizableText>
                                                <XStack gap="$2" alignItems="center">
                                                    {mv.views > 0 && (
                                                        <XStack gap="$1" alignItems="center">
                                                            <Eye size={12} color="rgba(255,255,255,0.4)" />
                                                            <SizableText size="$1" color="rgba(255,255,255,0.4)">{formatPlays(mv.views)}</SizableText>
                                                        </XStack>
                                                    )}
                                                    {mv.publishedAt && (
                                                        <SizableText size="$1" color="rgba(255,255,255,0.3)">{mv.publishedAt}</SizableText>
                                                    )}
                                                </XStack>
                                            </YStack>
                                        )
                                    })}
                                </XStack>
                            )}
                        </YStack>
                    )}
                </YStack>

                {/* ===== STICKY PLAYER BAR ===== */}
                {player.current && (
                    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
                        {/* Progress bar - clickable */}
                        <div
                            className="progress-bar"
                            style={{ height: 4, background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                player.seek((e.clientX - rect.left) / rect.width)
                            }}
                        >
                            <div style={{
                                height: '100%',
                                width: player.duration ? `${(player.progress / player.duration) * 100}%` : '0%',
                                background: '#4F7CFF',
                                borderRadius: 2,
                                transition: 'width 0.3s linear',
                            }} />
                        </div>
                        <div style={{ background: 'rgba(10,10,25,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <XStack maxWidth={960} alignSelf="center" width="100%" px="$4" py="$3" gap="$3" alignItems="center">
                                {/* Cover */}
                                <YStack width={48} height={48} borderRadius="$2" overflow="hidden">
                                    {player.current.release.coverUrl ? (
                                        // @ts-ignore
                                        <img src={player.current.release.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <YStack flex={1} bg="rgba(79,124,255,0.15)" alignItems="center" justifyContent="center">
                                            <Music size={20} color="rgba(255,255,255,0.3)" />
                                        </YStack>
                                    )}
                                </YStack>

                                {/* Track Info */}
                                <YStack flex={1} gap="$0.5" minWidth={0}>
                                    <SizableText color="white" size="$3" fontWeight="700" numberOfLines={1}>{player.current.track.title}</SizableText>
                                    <SizableText color="rgba(255,255,255,0.5)" size="$2" numberOfLines={1}>{player.current.release.artist} — {player.current.release.title}</SizableText>
                                </YStack>

                                {/* Time */}
                                <SizableText color="rgba(255,255,255,0.4)" size="$1" display="none" $sm={{ display: 'flex' }}>
                                    {formatTime(player.progress)} / {formatTime(player.duration)}
                                </SizableText>

                                {/* Controls */}
                                <XStack gap="$2" alignItems="center">
                                    <YStack width={36} height={36} borderRadius="$full" alignItems="center" justifyContent="center" cursor="pointer" hoverStyle={{ bg: 'rgba(255,255,255,0.08)' }} onPress={player.prev}>
                                        <SkipBack size={16} color="rgba(255,255,255,0.6)" />
                                    </YStack>
                                    <YStack width={42} height={42} borderRadius="$full" bg="#4F7CFF" alignItems="center" justifyContent="center" cursor="pointer" onPress={player.togglePause}>
                                        {player.paused ? <Play size={20} color="white" /> : <Pause size={20} color="white" />}
                                    </YStack>
                                    <YStack width={36} height={36} borderRadius="$full" alignItems="center" justifyContent="center" cursor="pointer" hoverStyle={{ bg: 'rgba(255,255,255,0.08)' }} onPress={player.next}>
                                        <SkipForward size={16} color="rgba(255,255,255,0.6)" />
                                    </YStack>
                                    <YStack width={36} height={36} borderRadius="$full" alignItems="center" justifyContent="center" cursor="pointer" hoverStyle={{ bg: 'rgba(255,255,255,0.08)' }} onPress={player.stop}>
                                        <X size={16} color="rgba(255,255,255,0.4)" />
                                    </YStack>
                                </XStack>
                            </XStack>
                        </div>
                    </div>
                )}
            </div>
        </ScrollView>
    )
}
