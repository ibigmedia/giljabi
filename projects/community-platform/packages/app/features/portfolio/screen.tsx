'use client'

import { useState } from 'react'
import { YStack, XStack, SizableText, Button, ScrollView, Separator, Avatar, Input } from '@my/ui'
import { Play, ExternalLink, ChevronRight, Music, Disc, Video, Clock } from '@tamagui/lucide-icons'
import { AudioVisualizer } from './audio-visualizer'
import type { VisualizerMode } from './audio-visualizer'

// --- Types ---
type Release = {
    id: string
    title: string
    year: string
    type: 'Studio Album' | 'EP' | 'Single' | 'Live'
    coverUrl: string
    tracks?: { title: string; artist: string; duration: string; audioUrl?: string }[]
}

type MusicVideo = {
    id: string
    title: string
    views: string
    date: string
    thumbnailUrl: string
    youtubeId: string
}

// --- Demo Data ---
const RELEASES: Release[] = [
    { id: '1', title: 'Run Away', year: '2024', type: 'Single', coverUrl: 'https://picsum.photos/seed/album1/400/400', tracks: [{ title: 'Run Away', artist: 'iBiG band', duration: '4:03', audioUrl: '' }] },
    { id: '2', title: 'Jesus Story', year: '2024', type: 'Single', coverUrl: 'https://picsum.photos/seed/album2/400/400', tracks: [{ title: 'Jesus Story', artist: 'iBiG media', duration: '3:16', audioUrl: '' }] },
    { id: '3', title: '성탄절 악보 (In that day)', year: '2023', type: 'EP', coverUrl: 'https://picsum.photos/seed/album3/400/400' },
    { id: '4', title: '예배 찬양 시리즈', year: '2023', type: 'Studio Album', coverUrl: 'https://picsum.photos/seed/album4/400/400' },
    { id: '5', title: '길잡이의 노래', year: '2022', type: 'EP', coverUrl: 'https://picsum.photos/seed/album5/400/400' },
]

const MUSIC_VIDEOS: MusicVideo[] = [
    { id: '1', title: 'Run Away (Official Music Video)', views: '86', date: '2024', thumbnailUrl: 'https://picsum.photos/seed/mv1/600/340', youtubeId: '' },
    { id: '2', title: 'Jesus Story', views: '116', date: '2024', thumbnailUrl: 'https://picsum.photos/seed/mv2/600/340', youtubeId: '' },
    { id: '3', title: '성탄절 악보 (In that day)', views: '191', date: '2023', thumbnailUrl: 'https://picsum.photos/seed/mv3/600/340', youtubeId: '' },
    { id: '4', title: '예배 찬양 시리즈', views: '542', date: '2023', thumbnailUrl: 'https://picsum.photos/seed/mv4/600/340', youtubeId: '' },
]

const TABS = ['All Releases', 'Studio Albums', 'EPs', 'Singles'] as const

export function PortfolioScreen() {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>('All Releases')
    const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
    const [selectedTrack, setSelectedTrack] = useState<{ title: string; artist: string; audioUrl?: string } | null>(null)
    const [vizMode, setVizMode] = useState<VisualizerMode>('circular')

    const filteredReleases = RELEASES.filter(r => {
        if (activeTab === 'All Releases') return true
        if (activeTab === 'Studio Albums') return r.type === 'Studio Album'
        if (activeTab === 'EPs') return r.type === 'EP'
        if (activeTab === 'Singles') return r.type === 'Single'
        return true
    })

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
                        <Button bg="transparent" icon={<ChevronRight size={16} color="#4F7CFF" />}>
                            <SizableText color="#4F7CFF" size="$3" fontWeight="600">View All</SizableText>
                        </Button>
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
                                    if (release.tracks?.[0]) setSelectedTrack(release.tracks[0])
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
                                    {/* @ts-ignore */}
                                    <img src={release.coverUrl} alt={release.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <SizableText size="$2" color="rgba(255,255,255,0.4)">{release.year} · {release.type}</SizableText>
                            </YStack>
                        ))}
                    </XStack>
                </YStack>

                {/* Featured Videos */}
                <YStack gap="$4">
                    <XStack justifyContent="space-between" alignItems="center">
                        <SizableText size="$6" fontWeight="800" color="white">Featured Videos</SizableText>
                        <Button bg="transparent" icon={<ChevronRight size={16} color="#4F7CFF" />}>
                            <SizableText color="#4F7CFF" size="$3" fontWeight="600">Browse Gallery</SizableText>
                        </Button>
                    </XStack>

                    <XStack gap="$4" flexWrap="wrap">
                        {MUSIC_VIDEOS.slice(0, 2).map(mv => (
                            <YStack key={mv.id} flex={1} minWidth={280} gap="$2" cursor="pointer" hoverStyle={{ opacity: 0.9 }}>
                                <YStack
                                    width="100%"
                                    aspectRatio={16 / 9}
                                    borderRadius="$5"
                                    overflow="hidden"
                                    position="relative"
                                >
                                    {/* @ts-ignore */}
                                    <img src={mv.thumbnailUrl} alt={mv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <YStack
                                        position="absolute"
                                        top={0} left={0} right={0} bottom={0}
                                        alignItems="center"
                                        justifyContent="center"
                                        // @ts-ignore
                                        style={{ background: 'rgba(0,0,0,0.3)' }}
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
                                </YStack>
                                <SizableText size="$4" fontWeight="700" color="white">{mv.title}</SizableText>
                                <SizableText size="$2" color="rgba(255,255,255,0.4)">{mv.views} views · {mv.date}</SizableText>
                            </YStack>
                        ))}
                    </XStack>
                </YStack>

                {/* Audio Player / Visualizer Section */}
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
                            {RELEASES.flatMap(r => (r.tracks || []).map(t => ({ ...t, release: r }))).slice(0, 5).map((track, i) => (
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
                                    onPress={() => setSelectedTrack(track)}
                                >
                                    <YStack width={40} height={40} borderRadius="$2" overflow="hidden">
                                        {/* @ts-ignore */}
                                        <img src={track.release.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

                {/* New Release Feature */}
                <YStack
                    borderRadius="$6"
                    overflow="hidden"
                    // @ts-ignore
                    style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.08))' }}
                >
                    <XStack p="$6" gap="$6" flexWrap="wrap" alignItems="center">
                        <YStack width={200} height={200} borderRadius="$5" overflow="hidden" elevation="$2">
                            {/* @ts-ignore */}
                            <img src={RELEASES[0]!.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </YStack>
                        <YStack flex={1} minWidth={250} gap="$3">
                            <YStack bg="rgba(79,124,255,0.2)" borderRadius="$2" px="$3" py="$1" alignSelf="flex-start">
                                <SizableText size="$1" fontWeight="700" color="#4F7CFF" letterSpacing={2}>NEW RELEASE</SizableText>
                            </YStack>
                            <SizableText size="$9" fontWeight="900" color="white">{RELEASES[0]!.title}</SizableText>
                            <SizableText size="$3" color="rgba(255,255,255,0.5)" lineHeight={22}>
                                사운드스케이프와 감성적 리듬으로 만들어진 최신작. 디지털 시대의 새로운 찬양과 예배를 경험하세요.
                            </SizableText>
                            <XStack gap="$3" mt="$2">
                                <Button
                                    // @ts-ignore
                                    style={{ background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)' }}
                                    borderRadius="$full"
                                    paddingHorizontal="$5"
                                    icon={<Play size={16} color="white" />}
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

            </YStack>
        </ScrollView>
    )
}
