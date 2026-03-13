'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { YStack, XStack, SizableText, ScrollView, Separator } from '@my/ui'
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
  .portfolio-page {
    background: linear-gradient(180deg, #08081a 0%, #0c0c24 30%, #060618 100%);
    min-height: 100vh;
  }
  .track-row { transition: background 0.15s; border-radius: 8px; margin: 0 8px; }
  .track-row:hover { background: rgba(255,255,255,0.04) !important; }
  .video-card { transition: transform 0.25s, box-shadow 0.25s; cursor: pointer; border-radius: 12px; overflow: hidden; }
  .video-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
  .video-card:hover .video-play-btn { opacity: 1 !important; }
  .progress-bar { cursor: pointer; }
  .progress-bar:hover { height: 6px !important; }
  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(79,124,255,0.3), transparent);
    margin: 20px 0;
  }
  @keyframes equalize {
    0% { height: 4px; }
    100% { height: 14px; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.5s ease forwards; }
  .fade-in-delay-1 { animation-delay: 0.1s; opacity: 0; }
  .fade-in-delay-2 { animation-delay: 0.2s; opacity: 0; }
`

export function PortfolioScreen() {
    const [releases, setReleases] = useState<Release[]>([])
    const [videos, setVideos] = useState<MusicVideo[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedRelease, setExpandedRelease] = useState<string | null>(null)
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)
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

    const allTracks = releases.flatMap(r => r.tracks.filter(t => t.audioUrl).map(t => ({ track: t, release: r })))
    const totalTracks = releases.reduce((s, r) => s + r.tracks.length, 0)

    const playRelease = (release: Release) => {
        const playable = release.tracks.filter(t => t.audioUrl)
        if (playable.length === 0) return
        player.play(playable[0]!, release, playable.map(t => ({ track: t, release })))
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
                <YStack maxWidth={960} alignSelf="center" width="100%" px="$4" pt="$8" pb={player.current ? 120 : 60} gap="$10">

                    {/* ===== HEADER ===== */}
                    <YStack gap="$3" className="fade-in">
                        <SizableText color="rgba(79,124,255,0.8)" size="$2" fontWeight="700" letterSpacing={3}>GILJABI</SizableText>
                        <SizableText size="$10" fontWeight="900" color="white" letterSpacing={-1}>
                            Portfolio
                        </SizableText>
                        <XStack gap="$4" alignItems="center" flexWrap="wrap">
                            <XStack gap="$2" alignItems="center">
                                <Music size={14} color="rgba(255,255,255,0.4)" />
                                <SizableText size="$2" color="rgba(255,255,255,0.4)">{releases.length} releases</SizableText>
                            </XStack>
                            <SizableText size="$2" color="rgba(255,255,255,0.15)">|</SizableText>
                            <SizableText size="$2" color="rgba(255,255,255,0.4)">{totalTracks} tracks</SizableText>
                            <SizableText size="$2" color="rgba(255,255,255,0.15)">|</SizableText>
                            <XStack gap="$2" alignItems="center">
                                <Video size={14} color="rgba(255,255,255,0.4)" />
                                <SizableText size="$2" color="rgba(255,255,255,0.4)">{videos.length} videos</SizableText>
                            </XStack>
                        </XStack>
                    </YStack>

                    {loading && (
                        <YStack p="$10" alignItems="center">
                            <SizableText color="rgba(255,255,255,0.5)" size="$4">Loading...</SizableText>
                        </YStack>
                    )}

                    {/* ===== MUSIC SECTION ===== */}
                    {!loading && releases.length > 0 && (
                        <YStack gap="$6" className="fade-in fade-in-delay-1">
                            {/* Section Title */}
                            <XStack alignItems="center" gap="$3">
                                <YStack width={4} height={24} borderRadius={2} bg="#4F7CFF" />
                                <SizableText size="$7" fontWeight="800" color="white">Music</SizableText>
                            </XStack>

                            {/* Releases */}
                            <YStack gap="$5">
                                {releases.map((release, rIdx) => {
                                    const isExpanded = expandedRelease === release.id
                                    const isCurrentRelease = player.current?.release.id === release.id
                                    const playableTracks = release.tracks.filter(t => t.audioUrl)
                                    return (
                                        <YStack
                                            key={release.id}
                                            borderRadius="$5"
                                            overflow="hidden"
                                            // @ts-ignore
                                            style={{
                                                background: isCurrentRelease
                                                    ? 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.05))'
                                                    : 'rgba(255,255,255,0.025)',
                                                border: isCurrentRelease
                                                    ? '1px solid rgba(79,124,255,0.25)'
                                                    : '1px solid rgba(255,255,255,0.05)',
                                            }}
                                        >
                                            {/* Release Header */}
                                            <XStack p="$5" gap="$5" alignItems="center" flexWrap="wrap">
                                                {/* Cover */}
                                                <YStack
                                                    width={100} height={100} borderRadius="$4" overflow="hidden"
                                                    cursor={playableTracks.length > 0 ? 'pointer' : 'default'}
                                                    onPress={() => playableTracks.length > 0 && playRelease(release)}
                                                    position="relative"
                                                    elevation="$2"
                                                >
                                                    {release.coverUrl ? (
                                                        // @ts-ignore
                                                        <img src={release.coverUrl} alt={release.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <YStack flex={1} alignItems="center" justifyContent="center"
                                                            // @ts-ignore
                                                            style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.3), rgba(123,97,255,0.2))' }}>
                                                            <Music size={36} color="rgba(255,255,255,0.4)" />
                                                        </YStack>
                                                    )}
                                                    {playableTracks.length > 0 && (
                                                        <YStack position="absolute" top={0} left={0} right={0} bottom={0} alignItems="center" justifyContent="center"
                                                            bg="rgba(0,0,0,0.35)" opacity={isCurrentRelease && !player.paused ? 1 : 0} hoverStyle={{ opacity: 1 }}
                                                            // @ts-ignore
                                                            style={{ transition: 'opacity 0.2s' }}>
                                                            {isCurrentRelease && !player.paused
                                                                ? <Volume2 size={28} color="white" />
                                                                : <Play size={28} color="white" />
                                                            }
                                                        </YStack>
                                                    )}
                                                </YStack>

                                                {/* Info */}
                                                <YStack flex={1} gap="$2" minWidth={200}>
                                                    <YStack gap="$1">
                                                        <SizableText size="$6" fontWeight="800" color="white" letterSpacing={-0.5}>{release.title}</SizableText>
                                                        <SizableText size="$3" color="#4F7CFF" fontWeight="600">{release.artist}</SizableText>
                                                    </YStack>
                                                    <XStack gap="$3" alignItems="center">
                                                        <YStack bg="rgba(255,255,255,0.06)" borderRadius="$2" px="$2.5" py="$1">
                                                            <SizableText size="$1" color="rgba(255,255,255,0.5)" fontWeight="600">{release.type}</SizableText>
                                                        </YStack>
                                                        <SizableText size="$2" color="rgba(255,255,255,0.35)">{release.year}</SizableText>
                                                        <SizableText size="$2" color="rgba(255,255,255,0.35)">{release.tracks.length}곡</SizableText>
                                                    </XStack>
                                                </YStack>

                                                {/* Actions */}
                                                <XStack gap="$2" alignItems="center">
                                                    {playableTracks.length > 0 && (
                                                        <XStack
                                                            alignItems="center" gap="$2" px="$4" py="$2.5"
                                                            borderRadius="$full" cursor="pointer"
                                                            // @ts-ignore
                                                            style={{ background: 'linear-gradient(135deg, #4F7CFF, #6366F1)' }}
                                                            hoverStyle={{ opacity: 0.9 }}
                                                            onPress={() => {
                                                                if (isCurrentRelease && !player.paused) player.togglePause()
                                                                else playRelease(release)
                                                            }}
                                                        >
                                                            {isCurrentRelease && !player.paused
                                                                ? <Pause size={14} color="white" />
                                                                : <Play size={14} color="white" />
                                                            }
                                                            <SizableText color="white" size="$2" fontWeight="700">
                                                                {isCurrentRelease && !player.paused ? 'Pause' : 'Play'}
                                                            </SizableText>
                                                        </XStack>
                                                    )}
                                                    <YStack
                                                        width={36} height={36} borderRadius="$full"
                                                        bg="rgba(255,255,255,0.06)" alignItems="center" justifyContent="center"
                                                        cursor="pointer" hoverStyle={{ bg: 'rgba(255,255,255,0.1)' }}
                                                        onPress={() => setExpandedRelease(isExpanded ? null : release.id)}
                                                    >
                                                        {isExpanded ? <ChevronUp size={16} color="rgba(255,255,255,0.5)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.5)" />}
                                                    </YStack>
                                                </XStack>
                                            </XStack>

                                            {/* Tracklist */}
                                            {isExpanded && (
                                                <YStack pb="$2">
                                                    <div className="section-divider" />
                                                    {/* Column headers */}
                                                    <XStack px="$5" py="$2" gap="$3" alignItems="center">
                                                        <SizableText width={28} textAlign="center" size="$1" color="rgba(255,255,255,0.25)" fontWeight="600">#</SizableText>
                                                        <SizableText flex={1} size="$1" color="rgba(255,255,255,0.25)" fontWeight="600" letterSpacing={1}>TITLE</SizableText>
                                                        <SizableText width={50} textAlign="right" size="$1" color="rgba(255,255,255,0.25)" fontWeight="600">
                                                            <Clock size={11} color="rgba(255,255,255,0.25)" />
                                                        </SizableText>
                                                    </XStack>
                                                    {release.tracks.map((track, idx) => {
                                                        const isCurrent = player.current?.track.id === track.id
                                                        const isPlayingThis = isCurrent && !player.paused
                                                        return (
                                                            <div key={track.id} className="track-row">
                                                                <XStack
                                                                    px="$4" py="$3" gap="$3" alignItems="center"
                                                                    bg={isCurrent ? 'rgba(79,124,255,0.06)' : 'transparent'}
                                                                    cursor={track.audioUrl ? 'pointer' : 'default'}
                                                                    onPress={() => playTrack(track, release)}
                                                                >
                                                                    <YStack width={28} alignItems="center" justifyContent="center">
                                                                        {isPlayingThis ? (
                                                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
                                                                                <span style={{ width: 2, background: '#4F7CFF', borderRadius: 1, animation: 'equalize 0.5s ease-in-out infinite alternate' }} />
                                                                                <span style={{ width: 2, background: '#4F7CFF', borderRadius: 1, animation: 'equalize 0.5s ease-in-out infinite alternate 0.15s' }} />
                                                                                <span style={{ width: 2, background: '#4F7CFF', borderRadius: 1, animation: 'equalize 0.5s ease-in-out infinite alternate 0.3s' }} />
                                                                            </div>
                                                                        ) : isCurrent ? (
                                                                            <Pause size={13} color="#4F7CFF" />
                                                                        ) : (
                                                                            <SizableText size="$2" color={track.audioUrl ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)'} fontWeight="500">{idx + 1}</SizableText>
                                                                        )}
                                                                    </YStack>
                                                                    <SizableText
                                                                        flex={1} size="$3" numberOfLines={1}
                                                                        color={isCurrent ? '#4F7CFF' : track.audioUrl ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}
                                                                        fontWeight={isCurrent ? '700' : '500'}
                                                                    >
                                                                        {track.title}
                                                                    </SizableText>
                                                                    <SizableText width={50} textAlign="right" size="$2" color="rgba(255,255,255,0.25)">
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
                        </YStack>
                    )}

                    {/* ===== VIDEOS SECTION ===== */}
                    {!loading && videos.length > 0 && (
                        <YStack gap="$6" className="fade-in fade-in-delay-2">
                            {/* Section Title */}
                            <XStack alignItems="center" gap="$3">
                                <YStack width={4} height={24} borderRadius={2} bg="#7B61FF" />
                                <SizableText size="$7" fontWeight="800" color="white">Videos</SizableText>
                            </XStack>

                            <XStack gap="$4" flexWrap="wrap">
                                {videos.map(mv => {
                                    const ytId = extractYouTubeId(mv.youtubeUrl)
                                    const isPlaying = playingVideoId === mv.id
                                    const thumb = mv.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '')
                                    return (
                                        <YStack key={mv.id} width="48%" minWidth={280} gap="$2.5">
                                            <div className="video-card">
                                                <YStack width="100%" aspectRatio={16 / 9} position="relative" bg="#0a0a1a">
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
                                                                <YStack flex={1} bg="rgba(123,97,255,0.08)" alignItems="center" justifyContent="center">
                                                                    <Video size={40} color="rgba(255,255,255,0.15)" />
                                                                </YStack>
                                                            )}
                                                            <YStack
                                                                className="video-play-btn"
                                                                position="absolute" top={0} left={0} right={0} bottom={0}
                                                                alignItems="center" justifyContent="center"
                                                                // @ts-ignore
                                                                style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6))' }}
                                                                opacity={0}
                                                            >
                                                                <YStack width={56} height={56} borderRadius={28} bg="rgba(255,255,255,0.95)" alignItems="center" justifyContent="center"
                                                                    // @ts-ignore
                                                                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                                                                    <Play size={26} color="#1a1a2e" />
                                                                </YStack>
                                                            </YStack>
                                                            {mv.duration && mv.duration !== '0:00' && (
                                                                <YStack position="absolute" bottom="$2" right="$2" bg="rgba(0,0,0,0.85)" borderRadius="$2" px="$2" py="$0.5">
                                                                    <SizableText color="white" size="$1" fontWeight="600">{mv.duration}</SizableText>
                                                                </YStack>
                                                            )}
                                                        </YStack>
                                                    )}
                                                </YStack>
                                            </div>
                                            <YStack gap="$1" px="$1">
                                                <SizableText size="$3" fontWeight="700" color="white" numberOfLines={2}>{mv.title}</SizableText>
                                                <XStack gap="$2" alignItems="center">
                                                    {mv.views > 0 && (
                                                        <XStack gap="$1" alignItems="center">
                                                            <Eye size={11} color="rgba(255,255,255,0.35)" />
                                                            <SizableText size="$1" color="rgba(255,255,255,0.35)">{formatPlays(mv.views)}</SizableText>
                                                        </XStack>
                                                    )}
                                                    {mv.publishedAt && (
                                                        <SizableText size="$1" color="rgba(255,255,255,0.25)">{mv.publishedAt}</SizableText>
                                                    )}
                                                </XStack>
                                            </YStack>
                                        </YStack>
                                    )
                                })}
                            </XStack>
                        </YStack>
                    )}

                    {/* Empty state */}
                    {!loading && releases.length === 0 && videos.length === 0 && (
                        <YStack p="$10" alignItems="center" gap="$3">
                            <Music size={48} color="rgba(255,255,255,0.15)" />
                            <SizableText size="$5" color="rgba(255,255,255,0.4)">아직 발행된 콘텐츠가 없습니다</SizableText>
                            <SizableText size="$3" color="rgba(255,255,255,0.25)">관리자 대시보드에서 릴리스와 비디오를 추가해주세요</SizableText>
                        </YStack>
                    )}

                </YStack>

                {/* ===== STICKY PLAYER BAR ===== */}
                {player.current && (
                    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
                        <div
                            className="progress-bar"
                            style={{ height: 3, background: 'rgba(255,255,255,0.06)', transition: 'height 0.15s' }}
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                player.seek((e.clientX - rect.left) / rect.width)
                            }}
                        >
                            <div style={{
                                height: '100%',
                                width: player.duration ? `${(player.progress / player.duration) * 100}%` : '0%',
                                background: 'linear-gradient(90deg, #4F7CFF, #6366F1)',
                                borderRadius: 2,
                                transition: 'width 0.3s linear',
                            }} />
                        </div>
                        <div style={{ background: 'rgba(8,8,26,0.97)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <XStack maxWidth={960} alignSelf="center" width="100%" px="$4" py="$3" gap="$3" alignItems="center">
                                <YStack width={48} height={48} borderRadius="$3" overflow="hidden" elevation="$1">
                                    {player.current.release.coverUrl ? (
                                        // @ts-ignore
                                        <img src={player.current.release.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <YStack flex={1} alignItems="center" justifyContent="center"
                                            // @ts-ignore
                                            style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.3), rgba(123,97,255,0.2))' }}>
                                            <Music size={20} color="rgba(255,255,255,0.4)" />
                                        </YStack>
                                    )}
                                </YStack>

                                <YStack flex={1} gap="$0.5" minWidth={0}>
                                    <SizableText color="white" size="$3" fontWeight="700" numberOfLines={1}>{player.current.track.title}</SizableText>
                                    <SizableText color="rgba(255,255,255,0.45)" size="$2" numberOfLines={1}>{player.current.release.artist} — {player.current.release.title}</SizableText>
                                </YStack>

                                <SizableText color="rgba(255,255,255,0.3)" size="$1">
                                    {formatTime(player.progress)} / {formatTime(player.duration)}
                                </SizableText>

                                <XStack gap="$1.5" alignItems="center">
                                    <YStack width={34} height={34} borderRadius="$full" alignItems="center" justifyContent="center" cursor="pointer" hoverStyle={{ bg: 'rgba(255,255,255,0.08)' }} onPress={player.prev}>
                                        <SkipBack size={15} color="rgba(255,255,255,0.5)" />
                                    </YStack>
                                    <YStack width={42} height={42} borderRadius="$full" alignItems="center" justifyContent="center" cursor="pointer" onPress={player.togglePause}
                                        // @ts-ignore
                                        style={{ background: 'linear-gradient(135deg, #4F7CFF, #6366F1)' }}>
                                        {player.paused ? <Play size={18} color="white" /> : <Pause size={18} color="white" />}
                                    </YStack>
                                    <YStack width={34} height={34} borderRadius="$full" alignItems="center" justifyContent="center" cursor="pointer" hoverStyle={{ bg: 'rgba(255,255,255,0.08)' }} onPress={player.next}>
                                        <SkipForward size={15} color="rgba(255,255,255,0.5)" />
                                    </YStack>
                                    <YStack width={34} height={34} borderRadius="$full" alignItems="center" justifyContent="center" cursor="pointer" hoverStyle={{ bg: 'rgba(255,255,255,0.08)' }} onPress={player.stop}>
                                        <X size={14} color="rgba(255,255,255,0.3)" />
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
