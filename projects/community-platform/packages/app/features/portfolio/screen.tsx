'use client'

import { useState, useEffect } from 'react'
import { YStack, XStack, SizableText, Button, ScrollView, Separator } from '@my/ui'
import { Play, ExternalLink, ChevronRight, Music } from '@tamagui/lucide-icons'
import { AudioVisualizer } from './audio-visualizer'
import type { VisualizerMode } from './audio-visualizer'

// --- Types ---
type Release = {
    id: string
    title: string
    artist: string
    year: number
    type: string
    coverUrl: string
    status: string
    tracks: { id: string; title: string; duration: string; plays: number; audioUrl?: string }[]
}

type MusicVideo = {
    id: string
    title: string
    youtubeUrl: string
    thumbnailUrl: string
    duration: string
    views: number
    status: string
    publishedAt: string
}

function extractYouTubeId(url: string): string | null {
    if (!url) return null
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^&?\s]+)/)
    return m ? m[1]! : null
}

// Map DB type to display type
function displayType(t: string) {
    if (t === 'Album') return 'Studio Album'
    return t
}

const TABS = ['All Releases', 'Studio Albums', 'EPs', 'Singles'] as const

export function PortfolioScreen() {
    const [releases, setReleases] = useState<Release[]>([])
    const [videos, setVideos] = useState<MusicVideo[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>('All Releases')
    const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
    const [selectedTrack, setSelectedTrack] = useState<{ title: string; artist: string; audioUrl?: string } | null>(null)
    const [vizMode, setVizMode] = useState<VisualizerMode>('circular')
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

    // Load published releases and videos from API
    useEffect(() => {
        Promise.all([
            fetch('/api/portfolio/releases').then(r => r.ok ? r.json() : []).catch(() => []),
            fetch('/api/portfolio/videos').then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([rel, vid]) => {
            // Only show published items
            const pubReleases = (rel as any[]).filter((r: any) => r.status === 'published').map((r: any) => ({
                ...r, year: Number(r.year),
                tracks: (r.tracks || []).map((t: any) => ({ ...t, plays: t.plays || 0 })),
            }))
            const pubVideos = (vid as any[]).filter((v: any) => v.status === 'published').map((v: any) => ({
                ...v, views: v.views || 0,
                publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString().slice(0, 10) : '',
            }))
            setReleases(pubReleases)
            setVideos(pubVideos)
            // Select first release/track by default
            if (pubReleases.length > 0) {
                setSelectedRelease(pubReleases[0])
                if (pubReleases[0].tracks?.[0]) setSelectedTrack({ title: pubReleases[0].tracks[0].title, artist: pubReleases[0].artist, audioUrl: pubReleases[0].tracks[0].audioUrl })
            }
        }).finally(() => setLoading(false))
    }, [])

    const filteredReleases = releases.filter(r => {
        if (activeTab === 'All Releases') return true
        if (activeTab === 'Studio Albums') return r.type === 'Album'
        if (activeTab === 'EPs') return r.type === 'EP'
        if (activeTab === 'Singles') return r.type === 'Single'
        return true
    })

    const latestRelease = releases[0]

    return (
        <ScrollView flex={1} bg="#060612">
            <YStack maxWidth={1200} alignSelf="center" width="100%" px="$5" py="$8" gap="$8">

                {/* Hero Header */}
                <YStack gap="$3">
                    <XStack gap="$3" alignItems="center">
                        <YStack
                            width={44}
                            height={44}
                            borderRadius="$3"
                            alignItems="center"
                            justifyContent="center"
                            // @ts-ignore
                            style={{ background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)' }}
                        >
                            <Music size={24} color="white" />
                        </YStack>
                        <SizableText size="$5" fontWeight="600" color="rgba(255,255,255,0.9)">Artist Portfolio</SizableText>
                    </XStack>
                    <SizableText size="$9" fontWeight="900" color="white" letterSpacing={-1}>
                        Discography & Portfolio
                    </SizableText>
                    <SizableText size="$4" color="rgba(255,255,255,0.5)" maxWidth={600}>
                        Exploring the soundscapes and visual journeys. 음악과 기술(Sound & Tech)로 섬기는 크리에이티브 미션.
                    </SizableText>
                </YStack>

                {loading && (
                    <YStack p="$8" alignItems="center">
                        <SizableText size="$4" color="rgba(255,255,255,0.5)">Loading...</SizableText>
                    </YStack>
                )}

                {!loading && releases.length === 0 && videos.length === 0 && (
                    <YStack p="$8" alignItems="center" gap="$3">
                        <SizableText size="$5" color="rgba(255,255,255,0.5)">아직 발행된 콘텐츠가 없습니다.</SizableText>
                        <SizableText size="$3" color="rgba(255,255,255,0.3)">관리자 대시보드에서 릴리스와 비디오를 추가해주세요.</SizableText>
                    </YStack>
                )}

                {!loading && releases.length > 0 && (
                    <>
                        {/* Tabs */}
                        <XStack gap="$1" borderBottomWidth={1} borderColor="rgba(255,255,255,0.1)">
                            {TABS.map(tab => (
                                <Button
                                    key={tab}
                                    bg="transparent"
                                    borderRadius={0}
                                    borderBottomWidth={2}
                                    borderColor={activeTab === tab ? '#4F7CFF' : 'transparent'}
                                    paddingHorizontal="$4"
                                    paddingVertical="$3"
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <SizableText
                                        size="$3"
                                        color={activeTab === tab ? '#4F7CFF' : 'rgba(255,255,255,0.5)'}
                                        fontWeight={activeTab === tab ? '700' : '500'}
                                    >
                                        {tab}
                                    </SizableText>
                                </Button>
                            ))}
                        </XStack>

                        {/* Albums & EPs Grid */}
                        <YStack gap="$4">
                            <XStack justifyContent="space-between" alignItems="center">
                                <SizableText size="$6" fontWeight="800" color="white">Albums & EPs</SizableText>
                            </XStack>

                            <XStack flexWrap="wrap" gap="$4">
                                {filteredReleases.map(release => (
                                    <YStack
                                        key={release.id}
                                        width="18%"
                                        minWidth={150}
                                        cursor="pointer"
                                        hoverStyle={{ opacity: 0.85 }}
                                        onPress={() => {
                                            setSelectedRelease(release)
                                            if (release.tracks?.[0]) setSelectedTrack({ title: release.tracks[0].title, artist: release.artist, audioUrl: release.tracks[0].audioUrl })
                                        }}
                                        gap="$2"
                                    >
                                        <YStack
                                            width="100%"
                                            aspectRatio={1}
                                            borderRadius="$4"
                                            overflow="hidden"
                                            position="relative"
                                            elevation="$1"
                                        >
                                            {release.coverUrl ? (
                                                // @ts-ignore
                                                <img src={release.coverUrl} alt={release.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <YStack flex={1} bg="rgba(79,124,255,0.2)" alignItems="center" justifyContent="center">
                                                    <Music size={40} color="rgba(255,255,255,0.3)" />
                                                </YStack>
                                            )}
                                            {/* Play overlay */}
                                            <YStack
                                                position="absolute"
                                                top={0} left={0} right={0} bottom={0}
                                                alignItems="center"
                                                justifyContent="center"
                                                opacity={0}
                                                hoverStyle={{ opacity: 1 }}
                                                // @ts-ignore
                                                style={{ background: 'rgba(0,0,0,0.5)', transition: 'opacity 0.2s' }}
                                            >
                                                <YStack
                                                    width={48} height={48}
                                                    borderRadius={24}
                                                    bg="white"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Play size={24} color="#060612" />
                                                </YStack>
                                            </YStack>
                                        </YStack>
                                        <SizableText size="$3" fontWeight="700" color="white" numberOfLines={1}>{release.title}</SizableText>
                                        <SizableText size="$2" color="rgba(255,255,255,0.4)">{release.year} · {displayType(release.type)}</SizableText>
                                    </YStack>
                                ))}
                            </XStack>
                        </YStack>
                    </>
                )}

                {/* Featured Videos */}
                {!loading && videos.length > 0 && (
                    <YStack gap="$4">
                        <XStack justifyContent="space-between" alignItems="center">
                            <SizableText size="$6" fontWeight="800" color="white">Featured Videos</SizableText>
                        </XStack>

                        <XStack gap="$4" flexWrap="wrap">
                            {videos.map(mv => {
                                const ytId = extractYouTubeId(mv.youtubeUrl)
                                const isPlaying = playingVideoId === mv.id
                                return (
                                    <YStack key={mv.id} flex={1} minWidth={280} maxWidth="49%" gap="$2" cursor="pointer" hoverStyle={{ opacity: 0.9 }}>
                                        <YStack
                                            width="100%"
                                            aspectRatio={16 / 9}
                                            borderRadius="$5"
                                            overflow="hidden"
                                            position="relative"
                                        >
                                            {isPlaying && ytId ? (
                                                // @ts-ignore
                                                <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                            ) : (
                                                <>
                                                    {mv.thumbnailUrl ? (
                                                        // @ts-ignore
                                                        <img src={mv.thumbnailUrl} alt={mv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : ytId ? (
                                                        // @ts-ignore
                                                        <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={mv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <YStack flex={1} bg="rgba(79,124,255,0.1)" alignItems="center" justifyContent="center">
                                                            <Play size={40} color="rgba(255,255,255,0.3)" />
                                                        </YStack>
                                                    )}
                                                    <YStack
                                                        position="absolute"
                                                        top={0} left={0} right={0} bottom={0}
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        // @ts-ignore
                                                        style={{ background: 'rgba(0,0,0,0.3)' }}
                                                        onPress={() => ytId && setPlayingVideoId(mv.id)}
                                                    >
                                                        <YStack
                                                            width={64} height={64}
                                                            borderRadius={32}
                                                            bg="rgba(255,255,255,0.9)"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Play size={32} color="#060612" />
                                                        </YStack>
                                                    </YStack>
                                                </>
                                            )}
                                        </YStack>
                                        <SizableText size="$4" fontWeight="700" color="white">{mv.title}</SizableText>
                                        <SizableText size="$2" color="rgba(255,255,255,0.4)">{mv.views} views · {mv.publishedAt}</SizableText>
                                    </YStack>
                                )
                            })}
                        </XStack>
                    </YStack>
                )}

                {/* Audio Player / Visualizer Section */}
                {!loading && releases.length > 0 && (
                    <YStack gap="$4">
                        <SizableText size="$6" fontWeight="800" color="white">Now Playing</SizableText>

                        {/* Visualizer mode selector */}
                        <XStack gap="$2">
                            {(['circular', 'bars', 'wave'] as const).map(m => (
                                <Button
                                    key={m}
                                    size="$3"
                                    bg={vizMode === m ? '#4F7CFF' : 'rgba(255,255,255,0.08)'}
                                    borderRadius="$3"
                                    onPress={() => setVizMode(m)}
                                >
                                    <SizableText color={vizMode === m ? 'white' : 'rgba(255,255,255,0.5)'} size="$2" fontWeight="600">
                                        {m === 'circular' ? 'Circular' : m === 'bars' ? 'Bars' : 'Wave'}
                                    </SizableText>
                                </Button>
                            ))}
                        </XStack>

                        <XStack gap="$5" flexWrap="wrap">
                            {/* Track list sidebar */}
                            <YStack width={260} gap="$2">
                                <SizableText size="$3" fontWeight="700" color="rgba(255,255,255,0.6)" mb="$2">Up Next</SizableText>
                                {releases.flatMap(r => (r.tracks || []).map(t => ({ ...t, artist: r.artist, release: r }))).slice(0, 5).map((track, i) => (
                                    <XStack
                                        key={i}
                                        p="$3"
                                        borderRadius="$3"
                                        bg={selectedTrack?.title === track.title ? 'rgba(79,124,255,0.15)' : 'transparent'}
                                        borderWidth={selectedTrack?.title === track.title ? 1 : 0}
                                        borderColor="#4F7CFF"
                                        cursor="pointer"
                                        hoverStyle={{ bg: 'rgba(255,255,255,0.05)' }}
                                        gap="$3"
                                        alignItems="center"
                                        onPress={() => setSelectedTrack({ title: track.title, artist: track.artist, audioUrl: track.audioUrl })}
                                    >
                                        <YStack width={40} height={40} borderRadius="$2" overflow="hidden">
                                            {track.release.coverUrl ? (
                                                // @ts-ignore
                                                <img src={track.release.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <YStack flex={1} bg="rgba(79,124,255,0.2)" alignItems="center" justifyContent="center">
                                                    <Music size={16} color="rgba(255,255,255,0.3)" />
                                                </YStack>
                                            )}
                                        </YStack>
                                        <YStack flex={1}>
                                            <SizableText size="$3" fontWeight="600" color="white" numberOfLines={1}>{track.title}</SizableText>
                                            <SizableText size="$2" color="rgba(255,255,255,0.4)">{track.artist}</SizableText>
                                        </YStack>
                                        <SizableText size="$2" color="rgba(255,255,255,0.3)">{track.duration}</SizableText>
                                    </XStack>
                                ))}
                            </YStack>

                            {/* Main visualizer */}
                            <YStack flex={1} minWidth={400}>
                                <AudioVisualizer
                                    audioUrl={selectedTrack?.audioUrl}
                                    trackTitle={selectedTrack?.title || 'Select a track'}
                                    artist={selectedTrack?.artist || ''}
                                    coverArt={selectedRelease?.coverUrl}
                                    mode={vizMode}
                                    theme="ocean"
                                />
                            </YStack>
                        </XStack>
                    </YStack>
                )}

                {/* New Release Feature */}
                {!loading && latestRelease && (
                    <YStack
                        borderRadius="$6"
                        overflow="hidden"
                        // @ts-ignore
                        style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.08))' }}
                    >
                        <XStack p="$6" gap="$6" flexWrap="wrap" alignItems="center">
                            <YStack width={200} height={200} borderRadius="$5" overflow="hidden" elevation="$2">
                                {latestRelease.coverUrl ? (
                                    // @ts-ignore
                                    <img src={latestRelease.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <YStack flex={1} bg="rgba(79,124,255,0.2)" alignItems="center" justifyContent="center">
                                        <Music size={60} color="rgba(255,255,255,0.3)" />
                                    </YStack>
                                )}
                            </YStack>
                            <YStack flex={1} minWidth={250} gap="$3">
                                <YStack bg="rgba(79,124,255,0.2)" borderRadius="$2" px="$3" py="$1" alignSelf="flex-start">
                                    <SizableText size="$1" fontWeight="700" color="#4F7CFF" letterSpacing={2}>NEW RELEASE</SizableText>
                                </YStack>
                                <SizableText size="$9" fontWeight="900" color="white">{latestRelease.title}</SizableText>
                                <SizableText size="$3" color="rgba(255,255,255,0.5)" lineHeight={22}>
                                    {latestRelease.artist} · {latestRelease.year} · {displayType(latestRelease.type)} · {latestRelease.tracks.length}곡
                                </SizableText>
                                <XStack gap="$3" mt="$2">
                                    <Button
                                        // @ts-ignore
                                        style={{ background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)' }}
                                        borderRadius="$full"
                                        paddingHorizontal="$5"
                                        icon={<Play size={16} color="white" />}
                                        onPress={() => {
                                            setSelectedRelease(latestRelease)
                                            if (latestRelease.tracks?.[0]) setSelectedTrack({ title: latestRelease.tracks[0].title, artist: latestRelease.artist, audioUrl: latestRelease.tracks[0].audioUrl })
                                        }}
                                    >
                                        <SizableText color="white" fontWeight="700">Play Now</SizableText>
                                    </Button>
                                    <Button
                                        bg="rgba(255,255,255,0.08)"
                                        borderRadius="$full"
                                        paddingHorizontal="$5"
                                        borderWidth={1}
                                        borderColor="rgba(255,255,255,0.15)"
                                        icon={<ExternalLink size={16} color="white" />}
                                    >
                                        <SizableText color="white" fontWeight="600">Share</SizableText>
                                    </Button>
                                </XStack>
                            </YStack>
                        </XStack>
                    </YStack>
                )}

            </YStack>
        </ScrollView>
    )
}
