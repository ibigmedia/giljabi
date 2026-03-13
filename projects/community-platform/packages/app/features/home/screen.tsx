'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { YStack, XStack, ScrollView, H2, H3, Paragraph, SizableText, Button, Separator } from '@my/ui'
import { Heart, Layers, TrendingUp, Zap, BookOpen, Wifi, Users, ChevronDown, Music, Code, Globe, ArrowRight, Play, Video, Pause, X } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'

type PortfolioRelease = { id: string; title: string; artist: string; year: number; type: string; coverUrl?: string; status: string; tracks?: any[] }
type PortfolioVideo = { id: string; title: string; youtubeUrl?: string; thumbnailUrl?: string; views: number; duration: string; status: string }

function extractYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)
    return m ? m[1] : null
}

function usePortfolioData() {
    const [releases, setReleases] = useState<PortfolioRelease[]>([])
    const [videos, setVideos] = useState<PortfolioVideo[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch('/api/portfolio/releases').then(r => r.ok ? r.json() : []).catch(() => []),
            fetch('/api/portfolio/videos').then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([rel, vid]) => {
            setReleases((rel || []).filter((r: any) => r.status === 'published'))
            setVideos((vid || []).filter((v: any) => v.status === 'published'))
            setLoaded(true)
        })
    }, [])

    return { releases, videos, loaded }
}

// Media player state — manages audio + YouTube with no duplicate playback
type PlayingMedia =
    | { type: 'audio'; trackTitle: string; artist: string; audioUrl: string; coverUrl?: string }
    | { type: 'youtube'; videoId: string; title: string }
    | null

function useMediaPlayer() {
    const [playing, setPlaying] = useState<PlayingMedia>(null)
    const [audioPaused, setAudioPaused] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const playAudio = useCallback((track: { title: string; audioUrl: string; artist?: string; coverUrl?: string }) => {
        // Stop any current audio
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.src = ''
        }
        // Create new audio
        const audio = new Audio(track.audioUrl)
        audioRef.current = audio
        audio.play().catch(() => {})
        audio.onended = () => { setPlaying(null); setAudioPaused(false) }
        setPlaying({ type: 'audio', trackTitle: track.title, artist: track.artist || '', audioUrl: track.audioUrl, coverUrl: track.coverUrl })
        setAudioPaused(false)
    }, [])

    const playYouTube = useCallback((videoId: string, title: string) => {
        // Mute audio when YouTube starts
        if (audioRef.current) {
            audioRef.current.pause()
        }
        setPlaying({ type: 'youtube', videoId, title })
        setAudioPaused(false)
    }, [])

    const togglePause = useCallback(() => {
        if (playing?.type === 'audio' && audioRef.current) {
            if (audioPaused) {
                audioRef.current.play().catch(() => {})
                setAudioPaused(false)
            } else {
                audioRef.current.pause()
                setAudioPaused(true)
            }
        }
    }, [playing, audioPaused])

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.src = ''
        }
        setPlaying(null)
        setAudioPaused(false)
    }, [])

    return { playing, audioPaused, playAudio, playYouTube, togglePause, stop }
}

const HERO_CSS = `
  .hero-section {
    position: relative;
    width: 100%;
    min-height: 480px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%);
  }
  .hero-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at 50% 30%, rgba(255,220,130,0.12) 0%, transparent 60%),
                radial-gradient(circle at 50% 20%, rgba(255,255,200,0.08) 0%, transparent 40%);
  }
  .hero-crescent {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: 15px -5px 0 0 rgba(255,220,150,0.9);
    opacity: 0.8;
  }
  .hero-stars {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
  }
  .hero-stars::before {
    content: '';
    position: absolute;
    width: 2px; height: 2px;
    background: white;
    border-radius: 50%;
    top: 30%; left: 20%;
    box-shadow:
      60px -20px 0 0 rgba(255,255,255,0.3),
      120px 40px 0 0 rgba(255,255,255,0.2),
      200px -10px 0 0 rgba(255,255,255,0.4),
      300px 30px 0 0 rgba(255,255,255,0.15),
      400px -30px 0 0 rgba(255,255,255,0.3),
      -80px 20px 0 0 rgba(255,255,255,0.25),
      -150px -10px 0 0 rgba(255,255,255,0.35),
      -250px 40px 0 0 rgba(255,255,255,0.2),
      50px 60px 0 0 rgba(255,255,255,0.15),
      350px 60px 0 0 rgba(255,255,255,0.25);
  }
  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 80px 24px 60px;
    max-width: 700px;
  }
  @media (max-width: 860px) {
    .hero-section { min-height: 380px; }
    .hero-content { padding: 60px 20px 40px; }
    .hero-crescent { width: 60px; height: 60px; top: 40px; box-shadow: 12px -4px 0 0 rgba(255,220,150,0.9); }
  }

  /* Portfolio Section */
  .portfolio-section {
    background: linear-gradient(180deg, #060612 0%, #0a0a20 40%, #0d1030 70%, #060612 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
  }
  .portfolio-section::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(79,124,255,0.12) 0%, transparent 70%);
  }
  .portfolio-section::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -80px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(123,97,255,0.08) 0%, transparent 70%);
  }
  .portfolio-album-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }
  .portfolio-album-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(79,124,255,0.15);
  }
  .portfolio-video-card {
    transition: transform 0.25s ease;
    cursor: pointer;
  }
  .portfolio-video-card:hover {
    transform: scale(1.03);
  }
  .portfolio-play-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.4);
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .portfolio-album-card:hover .portfolio-play-overlay,
  .portfolio-video-card:hover .portfolio-play-overlay {
    opacity: 1;
  }
  .equalizer-bar {
    display: inline-block;
    width: 3px;
    margin: 0 1px;
    border-radius: 2px;
    background: #4F7CFF;
    animation: equalize 0.8s ease-in-out infinite alternate;
  }
  .equalizer-bar:nth-child(1) { height: 12px; animation-delay: 0s; }
  .equalizer-bar:nth-child(2) { height: 20px; animation-delay: 0.15s; }
  .equalizer-bar:nth-child(3) { height: 8px; animation-delay: 0.3s; }
  .equalizer-bar:nth-child(4) { height: 16px; animation-delay: 0.45s; }
  .equalizer-bar:nth-child(5) { height: 10px; animation-delay: 0.6s; }
  @keyframes equalize {
    0% { height: 4px; }
    100% { height: 22px; }
  }
  @media (max-width: 860px) {
    .portfolio-featured-grid { flex-direction: column !important; }
    .portfolio-featured-info { min-width: auto !important; }
  }
  .video-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;
    background: rgba(0,0,0,0.92);
    display: flex; align-items: center; justify-content: center;
    animation: fadeInOverlay 0.25s ease;
    cursor: pointer;
  }
  .video-overlay-content {
    width: 90vw; max-width: 1100px; cursor: default;
    position: relative;
  }
  .video-overlay-content iframe {
    width: 100%; aspect-ratio: 16/9; border: none; border-radius: 12px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  }
  .video-overlay-close {
    position: absolute; top: -48px; right: 0;
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s;
  }
  .video-overlay-close:hover { background: rgba(255,255,255,0.2); }
  .video-overlay-title {
    color: rgba(255,255,255,0.8); font-size: 15px; font-weight: 600;
    margin-top: 16px; text-align: center;
  }
  @keyframes fadeInOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`

export function HomeScreen() {
    const router = useRouter()
    const { data: profile } = useCurrentUserProfile()
    const { releases, videos, loaded: portfolioLoaded } = usePortfolioData()
    const featuredRelease = releases[0]
    const totalTracks = releases.reduce((s, r) => s + (r.tracks?.length || 0), 0)
    const media = useMediaPlayer()
    const [overlayVideo, setOverlayVideo] = useState<{ ytId: string; title: string } | null>(null)

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

            {/* ===== Hero Section ===== */}
            <div className="hero-section">
                <div className="hero-crescent" />
                <div className="hero-stars" />
                <div className="hero-content">
                    <YStack gap="$4" alignItems="center">
                        <SizableText
                            color="rgba(255,220,150,0.9)"
                            size="$3"
                            fontWeight="600"
                            letterSpacing={3}
                        >
                            TEAM GILJABI · WITH IBIG
                        </SizableText>
                        <H2
                            color="white"
                            fontWeight="800"
                            fontSize={36}
                            lineHeight={48}
                            textAlign="center"
                        >
                            "I Believe in God{'\n'}even in the Digital Age"
                        </H2>
                        <Paragraph
                            color="rgba(255,255,255,0.7)"
                            size="$4"
                            textAlign="center"
                            lineHeight={26}
                            maxWidth={500}
                        >
                            디지털 시대에도 변치 않는 믿음의 길을 만듭니다.
                        </Paragraph>
                        <XStack gap="$3" mt="$4" flexWrap="wrap" justifyContent="center">
                            {profile ? (
                                <XStack
                                    alignItems="center"
                                    justifyContent="center"
                                    gap="$2"
                                    bg="rgba(255,255,255,0.15)"
                                    borderWidth={1}
                                    borderColor="rgba(255,255,255,0.3)"
                                    borderRadius="$full"
                                    hoverStyle={{ bg: 'rgba(255,255,255,0.25)' }}
                                    paddingHorizontal="$5"
                                    paddingVertical="$3"
                                    cursor="pointer"
                                    onPress={() => router.push('/feed')}
                                >
                                    <SizableText color="white" fontWeight="600">커뮤니티 들어가기</SizableText>
                                    <ArrowRight size={16} color="white" />
                                </XStack>
                            ) : (
                                <>
                                    <XStack
                                        alignItems="center"
                                        justifyContent="center"
                                        bg="white"
                                        borderRadius="$full"
                                        hoverStyle={{ opacity: 0.9 }}
                                        paddingHorizontal="$5"
                                        paddingVertical="$3"
                                        cursor="pointer"
                                        onPress={() => router.push('/login')}
                                    >
                                        <SizableText color="#1a1a2e" fontWeight="700">시작하기</SizableText>
                                    </XStack>
                                    <XStack
                                        alignItems="center"
                                        justifyContent="center"
                                        borderWidth={1}
                                        borderColor="rgba(255,255,255,0.4)"
                                        borderRadius="$full"
                                        hoverStyle={{ bg: 'rgba(255,255,255,0.1)' }}
                                        paddingHorizontal="$5"
                                        paddingVertical="$3"
                                        cursor="pointer"
                                        onPress={() => router.push('/feed')}
                                    >
                                        <SizableText color="white" fontWeight="600">둘러보기</SizableText>
                                    </XStack>
                                </>
                            )}
                        </XStack>
                    </YStack>
                </div>
            </div>

            <YStack maxWidth={1080} alignSelf="center" width="100%" px="$4" gap="$10" py="$10">

                {/* ===== WHY NOW Section ===== */}
                <YStack alignItems="center" gap="$6">
                    <YStack alignItems="center" gap="$2">
                        <XStack bg="$primaryContainer" px="$4" py="$1.5" borderRadius="$full">
                            <SizableText color="$onPrimaryContainer" fontWeight="700" size="$2" letterSpacing={2}>WHY NOW?</SizableText>
                        </XStack>
                        <H3 color="$onSurface" mt="$2" textAlign="center" fontWeight="800" fontSize={24}>
                            시대의 물음에{'\n'}길잡이가 답합니다
                        </H3>
                    </YStack>

                    <XStack flexWrap="wrap" gap="$4" width="100%">
                        {[
                            {
                                icon: Zap,
                                pTitle: "AI의 맹점과 영적 공백",
                                pDesc: "AI는 정답을 주지만, 위로를 줄 수는 없습니다.",
                                aTitle: "기술 위에 입힌 따뜻한 영성",
                                aDesc: "우리는 차가운 디지털 기술 위에 복음의 온기를 불어넣습니다. AI 도구를 사용하되, 그 중심에는 변치 않는 십자가의 위로가 있습니다."
                            },
                            {
                                icon: BookOpen,
                                pTitle: "콘텐츠 홍수, 깊이의 부재",
                                pDesc: "자극적인 콘텐츠가 넘쳐나고 사용자가 사라진 시대.",
                                aTitle: "진정성 있는 서사(Story)와 울림",
                                aDesc: "일회성 에피소드가 아닌, 삶이 축적된 진짜 이야기를 노래합니다. 다니엘 오 작가의 깊은 텍스트가 미디어와 만나 영혼의 울림을 채웁니다."
                            },
                            {
                                icon: Wifi,
                                pTitle: "사역 현장의 기술적 소외",
                                pDesc: "작은 교회와 선교지는 디지털 전환에 뒤처지고 있습니다.",
                                aTitle: "디지털 텐트메이킹(Tentmaking)",
                                aDesc: "물고기를 주는 것을 넘어 잡는 법을 나눕니다. AI와 미디어 기술 전수를 통해 자립 가능한 선교 생태계를 구축합니다."
                            },
                            {
                                icon: Users,
                                pTitle: "세대와 문화의 단절",
                                pDesc: "기성세대와 다음세대의 대화가 끊기고 있습니다.",
                                aTitle: "시대를 잇는 '통각'의 모델",
                                aDesc: "선배의 연륜과 후배의 감각이 만났습니다. 수직적 위계를 넘어 수평적 연합으로, 더 깊은 사역자들과 함께하는 열린 플랫폼을 지향합니다."
                            }
                        ].map((item, idx) => {
                            const Icon = item.icon
                            return (
                                <YStack key={idx} flex={1} minWidth={260} bg="$surface" borderRadius="$6" elevation="$0.5" overflow="hidden">
                                    <YStack p="$5" gap="$2" bg="$surfaceContainerLow">
                                        <XStack alignItems="center" gap="$2">
                                            <Icon size={16} color="$onSurfaceVariant" />
                                            <SizableText color="$onSurfaceVariant" size="$3" fontWeight="600">{item.pTitle}</SizableText>
                                        </XStack>
                                        <SizableText color="$onSurfaceVariant" size="$3" lineHeight={20}>{item.pDesc}</SizableText>
                                    </YStack>
                                    <XStack justifyContent="center" my={-12} zIndex={1}>
                                        <XStack bg="$primary" width={28} height={28} borderRadius="$full" alignItems="center" justifyContent="center" elevation="$1">
                                            <ChevronDown size={16} color="white" />
                                        </XStack>
                                    </XStack>
                                    <YStack p="$5" gap="$2" pt="$6">
                                        <SizableText color="$onSurface" size="$5" fontWeight="700">{item.aTitle}</SizableText>
                                        <Paragraph color="$onSurface" size="$3" lineHeight={22}>{item.aDesc}</Paragraph>
                                    </YStack>
                                </YStack>
                            )
                        })}
                    </XStack>
                </YStack>

            </YStack>

            {/* ===== Portfolio / Music Showcase Section ===== */}
            <div className="portfolio-section">
                <YStack maxWidth={1080} alignSelf="center" width="100%" px="$4" py="$10" gap="$6" position="relative" zIndex={1}>

                    {/* Section Header */}
                    <XStack justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap="$3">
                        <YStack gap="$1">
                            <SizableText color="#4F7CFF" fontWeight="700" size="$2" letterSpacing={2}>SOUND & VISION</SizableText>
                            <H3 color="white" fontWeight="800" fontSize={24}>음악과 영상 포트폴리오</H3>
                        </YStack>
                        {(releases.length > 0 || videos.length > 0) && (
                            <XStack gap="$4">
                                <SizableText color="rgba(255,255,255,0.4)" size="$2">{releases.length} releases · {totalTracks} tracks · {videos.length} videos</SizableText>
                            </XStack>
                        )}
                    </XStack>

                    {!portfolioLoaded ? null : releases.length === 0 && videos.length === 0 ? (
                        <YStack bg="rgba(255,255,255,0.04)" borderRadius="$5" p="$8" alignItems="center" gap="$2">
                            <Music size={36} color="rgba(255,255,255,0.2)" />
                            <SizableText color="rgba(255,255,255,0.4)" size="$3">발매된 콘텐츠가 없습니다</SizableText>
                        </YStack>
                    ) : (
                    <>
                        {/* All Releases - Compact List */}
                        {releases.length > 0 && (
                            <YStack gap="$3">
                                {releases.map((album) => {
                                    const firstTrack = album.tracks?.[0]
                                    const isPlaying = media.playing?.type === 'audio' && (media.playing as any).trackTitle === firstTrack?.title
                                    return (
                                    <XStack
                                        key={album.id}
                                        bg="rgba(255,255,255,0.04)"
                                        borderRadius="$4"
                                        overflow="hidden"
                                        borderWidth={1}
                                        borderColor={isPlaying ? 'rgba(79,124,255,0.3)' : 'rgba(255,255,255,0.06)'}
                                        alignItems="center"
                                        gap="$3"
                                        pr="$4"
                                        cursor="pointer"
                                        hoverStyle={{ bg: 'rgba(255,255,255,0.06)' }}
                                        onPress={() => {
                                            if (firstTrack?.audioUrl) {
                                                if (isPlaying) { media.togglePause() }
                                                else { media.playAudio({ title: firstTrack.title, audioUrl: firstTrack.audioUrl, artist: album.artist, coverUrl: album.coverUrl }) }
                                            } else { router.push('/portfolio') }
                                        }}
                                    >
                                        {/* Cover */}
                                        <YStack width={72} height={72} position="relative" overflow="hidden">
                                            {/* @ts-ignore */}
                                            <img src={album.coverUrl || `https://picsum.photos/seed/${album.id}/200/200`} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {firstTrack?.audioUrl && (
                                                <YStack position="absolute" top={0} left={0} right={0} bottom={0} alignItems="center" justifyContent="center" bg="rgba(0,0,0,0.3)" opacity={isPlaying ? 1 : 0} hoverStyle={{ opacity: 1 }}>
                                                    {isPlaying && !media.audioPaused ? <Pause size={20} color="white" /> : <Play size={20} color="white" />}
                                                </YStack>
                                            )}
                                        </YStack>
                                        {/* Info */}
                                        <YStack flex={1} gap="$0.5" py="$2">
                                            <SizableText color="white" size="$3" fontWeight="700" numberOfLines={1}>{album.title}</SizableText>
                                            <SizableText color="rgba(255,255,255,0.5)" size="$2" numberOfLines={1}>{album.artist} · {album.year} · {album.type} · {album.tracks?.length || 0}곡</SizableText>
                                        </YStack>
                                        {/* Play indicator */}
                                        {isPlaying && !media.audioPaused && (
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
                                                <span className="equalizer-bar" style={{ height: 8 }} />
                                                <span className="equalizer-bar" style={{ height: 14 }} />
                                                <span className="equalizer-bar" style={{ height: 6 }} />
                                                <span className="equalizer-bar" style={{ height: 12 }} />
                                            </div>
                                        )}
                                    </XStack>
                                    )
                                })}
                            </YStack>
                        )}

                        {/* All Videos */}
                        {videos.length > 0 && (
                            <YStack gap="$3">
                                <XStack alignItems="center" gap="$2" mt="$2">
                                    <Video size={16} color="#7B61FF" />
                                    <SizableText color="white" size="$4" fontWeight="700">Videos</SizableText>
                                </XStack>
                                <XStack gap="$3" flexWrap="wrap">
                                    {videos.map((mv) => {
                                        const ytId = mv.youtubeUrl ? extractYouTubeId(mv.youtubeUrl) : null
                                        const thumb = mv.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '')
                                        return (
                                        <YStack key={mv.id} width="48%" minWidth={260} gap="$2">
                                            <div className="portfolio-video-card">
                                                <YStack width="100%" aspectRatio={16 / 9} borderRadius="$4" overflow="hidden" position="relative"
                                                    onPress={() => {
                                                        if (ytId) {
                                                            media.stop()
                                                            setOverlayVideo({ ytId, title: mv.title })
                                                        }
                                                    }}
                                                    cursor="pointer"
                                                >
                                                    {thumb ? (
                                                        // @ts-ignore
                                                        <img src={thumb} alt={mv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <YStack flex={1} bg="rgba(79,124,255,0.1)" alignItems="center" justifyContent="center">
                                                            <Video size={32} color="rgba(255,255,255,0.2)" />
                                                        </YStack>
                                                    )}
                                                    <div className="portfolio-play-overlay">
                                                        <YStack width={48} height={48} borderRadius={24} bg="rgba(255,255,255,0.95)" alignItems="center" justifyContent="center"
                                                            // @ts-ignore
                                                            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                                                            <Play size={22} color="#1a1a2e" />
                                                        </YStack>
                                                    </div>
                                                    {mv.duration && mv.duration !== '0:00' && (
                                                        <YStack position="absolute" bottom="$2" right="$2" bg="rgba(0,0,0,0.8)" borderRadius="$2" px="$2" py="$0.5">
                                                            <SizableText color="white" size="$1" fontWeight="600">{mv.duration}</SizableText>
                                                        </YStack>
                                                    )}
                                                </YStack>
                                            </div>
                                            <SizableText color="white" size="$3" fontWeight="600" numberOfLines={1}>{mv.title}</SizableText>
                                            <SizableText color="rgba(255,255,255,0.4)" size="$1">{mv.views > 0 ? `${mv.views} views` : ''}</SizableText>
                                        </YStack>
                                        )
                                    })}
                                </XStack>
                            </YStack>
                        )}

                        {/* Now Playing Mini Bar */}
                        {media.playing?.type === 'audio' && (
                            <div style={{ position: 'sticky', bottom: 16, zIndex: 50 }}>
                                <XStack
                                    bg="rgba(20,20,40,0.95)"
                                    borderRadius="$4"
                                    borderWidth={1}
                                    borderColor="rgba(79,124,255,0.3)"
                                    p="$3"
                                    gap="$3"
                                    alignItems="center"
                                    // @ts-ignore
                                    style={{ backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                                >
                                    {(media.playing as any).coverUrl && (
                                        <YStack width={44} height={44} borderRadius="$2" overflow="hidden">
                                            {/* @ts-ignore */}
                                            <img src={(media.playing as any).coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </YStack>
                                    )}
                                    <YStack flex={1}>
                                        <SizableText color="white" size="$3" fontWeight="700" numberOfLines={1}>{(media.playing as any).trackTitle}</SizableText>
                                        <SizableText color="rgba(255,255,255,0.5)" size="$2" numberOfLines={1}>{(media.playing as any).artist}</SizableText>
                                    </YStack>
                                    <XStack gap="$2">
                                        <YStack width={38} height={38} borderRadius="$full" bg="#4F7CFF" alignItems="center" justifyContent="center"
                                            cursor="pointer" onPress={media.togglePause}>
                                            {media.audioPaused ? <Play size={16} color="white" /> : <Pause size={16} color="white" />}
                                        </YStack>
                                        <YStack width={38} height={38} borderRadius="$full" bg="rgba(255,255,255,0.1)" alignItems="center" justifyContent="center"
                                            cursor="pointer" onPress={media.stop}>
                                            <X size={16} color="rgba(255,255,255,0.6)" />
                                        </YStack>
                                    </XStack>
                                </XStack>
                            </div>
                        )}

                        {/* CTA */}
                        <XStack alignSelf="center" alignItems="center" gap="$2" borderRadius="$full" paddingHorizontal="$5" paddingVertical="$3" cursor="pointer" hoverStyle={{ opacity: 0.9 }}
                            onPress={() => router.push('/portfolio')}
                            // @ts-ignore
                            style={{ background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)' }}
                        >
                            <Music size={16} color="white" />
                            <SizableText color="white" fontWeight="700" size="$3">포트폴리오 전체 보기</SizableText>
                            <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
                        </XStack>
                    </>
                    )}

                </YStack>
            </div>

            <YStack maxWidth={1080} alignSelf="center" width="100%" px="$4" gap="$10" py="$10">

                {/* ===== Three Pillars Section (from WordPress) ===== */}
                <YStack alignItems="center" gap="$6">
                    <YStack
                        bg="$surfaceContainerLow"
                        borderRadius="$6"
                        p="$8"
                        width="100%"
                        alignItems="center"
                        gap="$3"
                    >
                        <SizableText color="$onSurfaceVariant" size="$2" fontWeight="600" letterSpacing={2}>
                            TEAM GILJABI · WITH IBIG
                        </SizableText>
                        <H3 color="$onSurface" fontWeight="800" fontSize={22} textAlign="center" fontStyle="italic">
                            "I Believe in God{'\n'}even in the Digital Age"
                        </H3>
                        <Paragraph color="$onSurfaceVariant" size="$3" textAlign="center" mt="$2" maxWidth={500}>
                            디지털 시대에도 변치 않는 믿음의 길을 만듭니다.
                        </Paragraph>
                    </YStack>

                    <XStack flexWrap="wrap" gap="$4" width="100%" justifyContent="center">
                        {[
                            {
                                icon: Heart,
                                title: "Resonance (공명)",
                                desc: "화려한 기술보다 중요한 것은 마음을 흐르는 진정성입니다. 실제의 이야기를 솔직히 담고 드러내어, 영적 삶을 새롭게 하는 서사적인 콘텐츠를 공명합니다.",
                                accent: '$red9'
                            },
                            {
                                icon: Layers,
                                title: "Convergence (융합)",
                                desc: "음악과 기술, 말씀과 미디어, 한국과 열방을 연결합니다. 다니엘 오 작가의 텍스트에 백형근의 미디어를 더 깊이 엮어내어 '복합적인 예배' 문화를 창출합니다.",
                                accent: '$blue9'
                            },
                            {
                                icon: TrendingUp,
                                title: "Sustainability (자생)",
                                desc: "후원에만 의존하는 사역에서 벗어납니다. AI 마케팅과 기술 자립을 통해 사역자(선교지)가 스스로 설 수 있는 패시브인컴(Passive Income) 을 만듭니다.",
                                accent: '$green9'
                            }
                        ].map((item, idx) => {
                            const Icon = item.icon
                            return (
                                <YStack
                                    key={idx}
                                    flex={1}
                                    minWidth={280}
                                    bg="$surface"
                                    borderRadius="$6"
                                    elevation="$0.5"
                                    p="$6"
                                    gap="$3"
                                    alignItems="center"
                                >
                                    <XStack
                                        width={56}
                                        height={56}
                                        borderRadius="$full"
                                        bg="$surfaceContainerHigh"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        {/* @ts-ignore */}
                                        <Icon size={28} color={item.accent} />
                                    </XStack>
                                    <SizableText color="$onSurface" size="$5" fontWeight="700" textAlign="center">
                                        {item.title}
                                    </SizableText>
                                    <Paragraph color="$onSurfaceVariant" size="$3" lineHeight={22} textAlign="center">
                                        {item.desc}
                                    </Paragraph>
                                </YStack>
                            )
                        })}
                    </XStack>
                </YStack>

            </YStack>

            <YStack maxWidth={1080} alignSelf="center" width="100%" px="$4" gap="$10" py="$10">

                {/* ===== Mission Letter ===== */}
                <YStack bg="$surface" borderRadius="$6" elevation="$1" overflow="hidden">
                    <YStack height={4} bg="$primary" />
                    <YStack p="$7" gap="$5">
                        <YStack gap="$2">
                            <SizableText color="$primary" size="$2" fontWeight="700" letterSpacing={2}>대표 인사말</SizableText>
                            <H3 color="$onSurface" fontWeight="800" fontSize={22} lineHeight={32}>
                                광야를 지나온 노래,{'\n'}이제 당신의 길잡이가 됩니다.
                            </H3>
                        </YStack>

                        <Paragraph color="$onSurface" size="$4" lineHeight={28}>
                            "활자(Story) 속에 담긴 말씀을 음악과 기술(Sound & Tech)로 짜임, AI 디지털 시대를 살아가는 성도들의 영적 길잡이가 되겠습니다."
                        </Paragraph>

                        <Paragraph color="$onSurfaceVariant" size="$3" lineHeight={26}>
                            1988년, 뜨거운 가슴으로 찬양을 부르던 청년이 있었습니다.
                            하지만 하나님은 저를 화려한 무대가 아닌, 20년의 IT 생활이라는 긴 광야로 이끄셨습니다.
                            그곳에서 저는 차갑고 낯선 기술을 익히고, 디아스포라의 외로움을 견디며 사역의 쓰임새를 다시 묻게 되었습니다.
                        </Paragraph>

                        <YStack bg="$primaryContainer" p="$4" borderRadius="$4">
                            <Paragraph color="$onPrimaryContainer" size="$3" fontWeight="600" lineHeight={24}>
                                하나님은 저를 이끌고 감당할 더 큰 기술을 모두 준비된 "이것이야말로 너에게 맡길 사역"이라고 보여주셨습니다.
                                이제 저는 다시 고백합니다. I Believe in God even in the Digital Age. AI 기술의 시대에도 하나님은 여전히 위로와 희망을 주십니다.
                            </Paragraph>
                        </YStack>

                        <YStack alignItems="flex-end" pt="$4" borderTopWidth={1} borderColor="$outlineVariant">
                            <SizableText color="$onSurface" fontWeight="700" size="$4">백형근 (David Back) 드림</SizableText>
                            <SizableText color="$onSurfaceVariant" size="$2" mt="$1">Team Giljabi 대표 / IT선교사</SizableText>
                        </YStack>
                    </YStack>
                </YStack>

                {/* ===== Domains Section ===== */}
                <YStack gap="$6">
                    <YStack alignItems="center" gap="$2">
                        <XStack bg="$primaryContainer" px="$4" py="$1.5" borderRadius="$full">
                            <SizableText color="$onPrimaryContainer" fontWeight="700" size="$2" letterSpacing={2}>사역 영역</SizableText>
                        </XStack>
                        <H3 color="$onSurface" mt="$2" textAlign="center" fontWeight="800" fontSize={22}>
                            세 가지 핵심 영역
                        </H3>
                    </YStack>

                    <XStack flexWrap="wrap" gap="$4" width="100%">
                        {[
                            {
                                icon: Music,
                                title: "Worship & Media",
                                desc: "다니엘 오 작가의 인문학적 텍스트에 백형근 대표의 감성 미디어를 입힙니다. 단순한 찬양을 넘어, 메시지가 보이는 입체적인 예배 콘텐츠를 지향합니다.",
                                tags: ["#북콘서트", "#디지털앨범", "#워십미디어"],
                                color: '$primary'
                            },
                            {
                                icon: Code,
                                title: "Digital Tentmaker",
                                desc: "작은 교회와 선교지가 기술 소외를 겪지 않도록 돕습니다. AI 활용법과 미디어 기술 교육을 통해 사역자 자립(Passive Income) 생태계를 만듭니다.",
                                tags: ["#AI사역교육", "#미디어멘토링", "#자립지원"],
                                color: '$secondary'
                            },
                            {
                                icon: Globe,
                                title: "Global Connection",
                                desc: "한국과 미국, 그리고 열방을 잇습니다. 외로운 선교지의 생명력 있는 현장을 잇고, 후원자와 사역지를 연결하는 영적 플랫폼 역할을 감당합니다.",
                                tags: ["#선교지연결", "#온라인디지털선교", "#사역"],
                                color: '$tertiary'
                            }
                        ].map((item, idx) => {
                            const Icon = item.icon
                            return (
                                <YStack key={idx} flex={1} minWidth={280} bg="$surface" borderRadius="$6" elevation="$0.5" overflow="hidden">
                                    <YStack height={100} bg="$surfaceContainerHigh" alignItems="center" justifyContent="center">
                                        <XStack bg="$surfaceContainerLowest" width={56} height={56} borderRadius="$full" alignItems="center" justifyContent="center" elevation="$1">
                                            {/* @ts-ignore */}
                                            <Icon size={28} color={item.color} />
                                        </XStack>
                                    </YStack>
                                    <YStack p="$5" gap="$3" flex={1}>
                                        <SizableText color="$onSurface" size="$6" fontWeight="700">{item.title}</SizableText>
                                        <Paragraph color="$onSurfaceVariant" size="$3" lineHeight={22} flex={1}>{item.desc}</Paragraph>
                                        <XStack flexWrap="wrap" gap="$2" mt="$1">
                                            {item.tags.map((tag, ti) => (
                                                <SizableText
                                                    key={ti}
                                                    bg="$surfaceContainerLow"
                                                    color="$onSurfaceVariant"
                                                    px="$2.5"
                                                    py="$1"
                                                    borderRadius="$full"
                                                    size="$2"
                                                    fontWeight="500"
                                                >
                                                    {tag}
                                                </SizableText>
                                            ))}
                                        </XStack>
                                    </YStack>
                                </YStack>
                            )
                        })}
                    </XStack>
                </YStack>

                {/* ===== CTA Section ===== */}
                <YStack
                    bg="$primary"
                    borderRadius="$6"
                    p="$8"
                    alignItems="center"
                    gap="$4"
                >
                    <SizableText color="white" size="$7" fontWeight="800" textAlign="center">
                        함께 걸어가실 준비가 되셨나요?
                    </SizableText>
                    <Paragraph color="rgba(255,255,255,0.8)" size="$4" textAlign="center" maxWidth={500}>
                        길잡이 커뮤니티에 참여하여 디지털 시대의 믿음의 여정을 함께하세요.
                    </Paragraph>
                    <XStack gap="$3" mt="$2" flexWrap="wrap" justifyContent="center">
                        <XStack
                            alignItems="center"
                            justifyContent="center"
                            bg="white"
                            borderRadius="$full"
                            hoverStyle={{ opacity: 0.9 }}
                            paddingHorizontal="$5"
                            paddingVertical="$3"
                            cursor="pointer"
                            onPress={() => router.push(profile ? '/feed' : '/login')}
                        >
                            <SizableText color="$primary" fontWeight="700">
                                {profile ? '커뮤니티 들어가기' : '회원가입'}
                            </SizableText>
                        </XStack>
                        <XStack
                            alignItems="center"
                            justifyContent="center"
                            borderWidth={1}
                            borderColor="rgba(255,255,255,0.5)"
                            borderRadius="$full"
                            hoverStyle={{ bg: 'rgba(255,255,255,0.1)' }}
                            paddingHorizontal="$5"
                            paddingVertical="$3"
                            cursor="pointer"
                            onPress={() => router.push('/blog')}
                        >
                            <SizableText color="white" fontWeight="600">블로그 보기</SizableText>
                        </XStack>
                    </XStack>
                </YStack>

            </YStack>

            {/* ===== Footer ===== */}
            <YStack bg="$surfaceContainerLow" borderTopWidth={1} borderColor="$outlineVariant">
                <YStack maxWidth={1080} alignSelf="center" width="100%" px="$6" py="$8">
                    <XStack flexWrap="wrap" gap="$8" justifyContent="space-between">
                        <YStack gap="$2" minWidth={200}>
                            <SizableText size="$6" fontWeight="800" color="$primary" letterSpacing={-0.5}>Giljabi</SizableText>
                            <SizableText size="$2" color="$onSurfaceVariant" lineHeight={18}>
                                디지털 시대에도 변치 않는{'\n'}믿음의 길을 만듭니다.
                            </SizableText>
                        </YStack>
                        <XStack gap="$8" flexWrap="wrap">
                            <YStack gap="$2">
                                <SizableText size="$2" fontWeight="700" color="$onSurface">커뮤니티</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant" cursor="pointer" hoverStyle={{ color: '$primary' }} onPress={() => router.push('/feed')}>공동체 나눔</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant" cursor="pointer" hoverStyle={{ color: '$primary' }} onPress={() => router.push('/groups')}>그룹</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant" cursor="pointer" hoverStyle={{ color: '$primary' }} onPress={() => router.push('/directory')}>멤버 디렉토리</SizableText>
                            </YStack>
                            <YStack gap="$2">
                                <SizableText size="$2" fontWeight="700" color="$onSurface">콘텐츠</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant" cursor="pointer" hoverStyle={{ color: '$primary' }} onPress={() => router.push('/blog')}>블로그</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant" cursor="pointer" hoverStyle={{ color: '$primary' }} onPress={() => router.push('/landing')}>사역 소개</SizableText>
                            </YStack>
                            <YStack gap="$2">
                                <SizableText size="$2" fontWeight="700" color="$onSurface">계정</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant" cursor="pointer" hoverStyle={{ color: '$primary' }} onPress={() => router.push('/profile')}>내 프로필</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant" cursor="pointer" hoverStyle={{ color: '$primary' }} onPress={() => router.push('/login')}>로그인</SizableText>
                            </YStack>
                        </XStack>
                    </XStack>
                    <Separator borderColor="$outlineVariant" my="$4" />
                    <SizableText size="$1" color="$onSurfaceVariant" textAlign="center">
                        © 2026 Giljabi.com · Team Giljabi · I Believe in God even in the Digital Age
                    </SizableText>
                </YStack>
            </YStack>
            {/* ===== VIDEO OVERLAY MODAL ===== */}
            {overlayVideo && (
                <div className="video-overlay" onClick={() => setOverlayVideo(null)}>
                    <div className="video-overlay-content" onClick={(e) => e.stopPropagation()}>
                        <div className="video-overlay-close" onClick={() => setOverlayVideo(null)}>
                            <X size={18} color="white" />
                        </div>
                        {/* @ts-ignore */}
                        <iframe
                            src={`https://www.youtube.com/embed/${overlayVideo.ytId}?autoplay=1&rel=0`}
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                        />
                        <div className="video-overlay-title">{overlayVideo.title}</div>
                    </div>
                </div>
            )}
        </ScrollView>
    )
}
