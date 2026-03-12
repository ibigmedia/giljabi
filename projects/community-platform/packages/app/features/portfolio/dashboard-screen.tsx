'use client'

import { useState } from 'react'
import { YStack, XStack, SizableText, Button, Input, ScrollView } from '@my/ui'
import { Music, Disc, Video, BarChart3, Palette, Settings, Plus, Trash2, Edit3, Eye, Save } from '@tamagui/lucide-icons'
import { AudioVisualizer, THEMES } from './audio-visualizer'
import type { VisualizerMode } from './audio-visualizer'

type DashboardTab = 'overview' | 'releases' | 'videos' | 'visualizer' | 'settings'

const TABS: { id: DashboardTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'releases', label: 'Releases', icon: Disc },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'visualizer', label: 'Visualizer', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
]

export function PortfolioDashboardScreen() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
    const [vizMode, setVizMode] = useState<VisualizerMode>('circular')
    const [vizTheme, setVizTheme] = useState('ocean')

    return (
        <ScrollView flex={1} bg="#060612">
            <YStack maxWidth={1200} alignSelf="center" width="100%" px="$5" py="$6" gap="$6">
                {/* Header */}
                <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                        <SizableText size="$7" fontWeight="900" color="white">Artist Dashboard</SizableText>
                        <SizableText size="$3" color="rgba(255,255,255,0.4)">포트폴리오 관리 · 비주얼라이저 설정 · 퍼포먼스 분석</SizableText>
                    </YStack>
                    <Button
                        // @ts-ignore
                        style={{ background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)' }}
                        borderRadius="$full"
                        icon={<Eye size={16} color="white" />}
                    >
                        <SizableText color="white" fontWeight="600">포트폴리오 보기</SizableText>
                    </Button>
                </XStack>

                {/* Tab Navigation */}
                <XStack gap="$1" bg="rgba(255,255,255,0.04)" borderRadius="$4" p="$1">
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <Button
                                key={tab.id}
                                flex={1}
                                bg={isActive ? 'rgba(79,124,255,0.15)' : 'transparent'}
                                borderRadius="$3"
                                borderWidth={isActive ? 1 : 0}
                                borderColor={isActive ? 'rgba(79,124,255,0.3)' : 'transparent'}
                                onPress={() => setActiveTab(tab.id)}
                                gap="$2"
                            >
                                <Icon size={16} color={isActive ? '#4F7CFF' : 'rgba(255,255,255,0.4)'} />
                                <SizableText color={isActive ? '#4F7CFF' : 'rgba(255,255,255,0.4)'} size="$3" fontWeight={isActive ? '700' : '500'}>
                                    {tab.label}
                                </SizableText>
                            </Button>
                        )
                    })}
                </XStack>

                {/* Tab Content */}
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'releases' && <ReleasesTab />}
                {activeTab === 'videos' && <VideosTab />}
                {activeTab === 'visualizer' && <VisualizerTab vizMode={vizMode} setVizMode={setVizMode} vizTheme={vizTheme} setVizTheme={setVizTheme} />}
                {activeTab === 'settings' && <SettingsTab />}
            </YStack>
        </ScrollView>
    )
}

// --- Overview Tab ---
function OverviewTab() {
    const stats = [
        { label: 'Total Plays', value: '24.5K', change: '+12%', color: '#4F7CFF' as const },
        { label: 'Releases', value: '5', change: '+1', color: '#7B61FF' as const },
        { label: 'Videos', value: '4', change: '+2', color: '#00D2FF' as const },
        { label: 'Followers', value: '1.2K', change: '+8%', color: '#FF6B6B' as const },
    ]

    return (
        <YStack gap="$5">
            {/* Stats Grid */}
            <XStack gap="$3" flexWrap="wrap">
                {stats.map(s => (
                    <YStack
                        key={s.label}
                        flex={1}
                        minWidth={200}
                        bg="rgba(255,255,255,0.04)"
                        borderRadius="$4"
                        borderWidth={1}
                        borderColor="rgba(255,255,255,0.06)"
                        p="$5"
                        gap="$2"
                    >
                        <SizableText size="$2" color="rgba(255,255,255,0.4)" fontWeight="600">{s.label}</SizableText>
                        <XStack alignItems="baseline" gap="$2">
                            <SizableText size="$8" fontWeight="900" color="white">{s.value}</SizableText>
                            <SizableText size="$2" color={s.color as any} fontWeight="600">{s.change}</SizableText>
                        </XStack>
                    </YStack>
                ))}
            </XStack>

            {/* Recent Activity */}
            <YStack bg="rgba(255,255,255,0.04)" borderRadius="$4" borderWidth={1} borderColor="rgba(255,255,255,0.06)" p="$5" gap="$4">
                <SizableText size="$5" fontWeight="700" color="white">Recent Activity</SizableText>
                {[
                    { icon: Music, text: '"Run Away" reached 86 plays', time: '2 hours ago' },
                    { icon: Video, text: 'New MV "Jesus Story" uploaded', time: '1 day ago' },
                    { icon: Disc, text: 'EP "성탄절 악보" published', time: '3 days ago' },
                ].map((item, i) => (
                    <XStack key={i} gap="$3" alignItems="center" py="$2">
                        <YStack
                            width={36} height={36}
                            borderRadius="$2"
                            bg="rgba(79,124,255,0.1)"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <item.icon size={16} color="#4F7CFF" />
                        </YStack>
                        <YStack flex={1}>
                            <SizableText size="$3" color="white" fontWeight="500">{item.text}</SizableText>
                        </YStack>
                        <SizableText size="$2" color="rgba(255,255,255,0.3)">{item.time}</SizableText>
                    </XStack>
                ))}
            </YStack>

            {/* Top Tracks */}
            <YStack bg="rgba(255,255,255,0.04)" borderRadius="$4" borderWidth={1} borderColor="rgba(255,255,255,0.06)" p="$5" gap="$4">
                <SizableText size="$5" fontWeight="700" color="white">Top Tracks</SizableText>
                {[
                    { rank: 1, title: 'Run Away', plays: '86', trend: 'up' },
                    { rank: 2, title: 'Jesus Story', plays: '116', trend: 'up' },
                    { rank: 3, title: '성탄절 악보', plays: '191', trend: 'stable' },
                    { rank: 4, title: '예배 찬양', plays: '542', trend: 'up' },
                ].map(track => (
                    <XStack key={track.rank} gap="$3" alignItems="center" py="$2">
                        <SizableText size="$4" fontWeight="800" color="rgba(255,255,255,0.3)" width={30} textAlign="center">
                            #{track.rank}
                        </SizableText>
                        <YStack flex={1}>
                            <SizableText size="$3" fontWeight="600" color="white">{track.title}</SizableText>
                        </YStack>
                        <XStack gap="$1" alignItems="center">
                            <BarChart3 size={12} color="#4F7CFF" />
                            <SizableText size="$2" color="rgba(255,255,255,0.5)">{track.plays} plays</SizableText>
                        </XStack>
                    </XStack>
                ))}
            </YStack>
        </YStack>
    )
}

// --- Releases Management Tab ---
function ReleasesTab() {
    return (
        <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$5" fontWeight="700" color="white">Releases</SizableText>
                <Button bg="rgba(79,124,255,0.15)" borderWidth={1} borderColor="rgba(79,124,255,0.3)" borderRadius="$3" icon={<Plus size={16} color="#4F7CFF" />}>
                    <SizableText color="#4F7CFF" fontWeight="600">Add Release</SizableText>
                </Button>
            </XStack>

            {['Run Away', 'Jesus Story', '성탄절 악보 (In that day)', '예배 찬양 시리즈', '길잡이의 노래'].map((title, i) => (
                <XStack
                    key={i}
                    bg="rgba(255,255,255,0.04)"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor="rgba(255,255,255,0.06)"
                    p="$4"
                    gap="$4"
                    alignItems="center"
                >
                    <YStack width={60} height={60} borderRadius="$3" overflow="hidden">
                        {/* @ts-ignore */}
                        <img src={`https://picsum.photos/seed/album${i + 1}/120/120`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </YStack>
                    <YStack flex={1}>
                        <SizableText size="$4" fontWeight="700" color="white">{title}</SizableText>
                        <SizableText size="$2" color="rgba(255,255,255,0.4)">{2024 - i} · {i < 2 ? 'Single' : i < 4 ? 'EP' : 'Album'}</SizableText>
                    </YStack>
                    <XStack gap="$2">
                        <Button size="$3" circular bg="rgba(255,255,255,0.06)" icon={<Edit3 size={14} color="rgba(255,255,255,0.5)" />} />
                        <Button size="$3" circular bg="rgba(255,255,255,0.06)" icon={<Trash2 size={14} color="#FF6B6B" />} />
                    </XStack>
                </XStack>
            ))}
        </YStack>
    )
}

// --- Videos Management Tab ---
function VideosTab() {
    return (
        <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$5" fontWeight="700" color="white">Music Videos</SizableText>
                <Button bg="rgba(79,124,255,0.15)" borderWidth={1} borderColor="rgba(79,124,255,0.3)" borderRadius="$3" icon={<Plus size={16} color="#4F7CFF" />}>
                    <SizableText color="#4F7CFF" fontWeight="600">Add Video</SizableText>
                </Button>
            </XStack>

            <XStack flexWrap="wrap" gap="$4">
                {['Run Away MV', 'Jesus Story', '성탄절 악보', '예배 찬양'].map((title, i) => (
                    <YStack key={i} width="48%" minWidth={250} gap="$2">
                        <YStack width="100%" aspectRatio={16 / 9} borderRadius="$4" overflow="hidden" position="relative">
                            {/* @ts-ignore */}
                            <img src={`https://picsum.photos/seed/mv${i + 1}/600/340`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <YStack position="absolute" bottom="$2" right="$2" bg="rgba(0,0,0,0.7)" borderRadius="$2" px="$2" py="$1">
                                <SizableText size="$1" color="white">{3 + i}:{(10 + i * 7).toString().padStart(2, '0')}</SizableText>
                            </YStack>
                        </YStack>
                        <XStack justifyContent="space-between" alignItems="center">
                            <SizableText size="$3" fontWeight="600" color="white">{title}</SizableText>
                            <XStack gap="$1">
                                <Button size="$2" circular bg="rgba(255,255,255,0.06)" icon={<Edit3 size={12} color="rgba(255,255,255,0.5)" />} />
                                <Button size="$2" circular bg="rgba(255,255,255,0.06)" icon={<Trash2 size={12} color="#FF6B6B" />} />
                            </XStack>
                        </XStack>
                    </YStack>
                ))}
            </XStack>
        </YStack>
    )
}

// --- Visualizer Settings Tab ---
function VisualizerTab({ vizMode, setVizMode, vizTheme, setVizTheme }: {
    vizMode: VisualizerMode; setVizMode: (m: VisualizerMode) => void
    vizTheme: string; setVizTheme: (t: string) => void
}) {
    return (
        <YStack gap="$5">
            <SizableText size="$5" fontWeight="700" color="white">Visualizer Settings</SizableText>

            {/* Mode Selector */}
            <YStack gap="$3">
                <SizableText size="$3" fontWeight="600" color="rgba(255,255,255,0.6)">Display Mode</SizableText>
                <XStack gap="$3">
                    {(['circular', 'bars', 'wave'] as const).map(m => (
                        <YStack
                            key={m}
                            flex={1}
                            bg={vizMode === m ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.04)'}
                            borderWidth={1}
                            borderColor={vizMode === m ? '#4F7CFF' : 'rgba(255,255,255,0.06)'}
                            borderRadius="$4"
                            p="$4"
                            alignItems="center"
                            gap="$2"
                            cursor="pointer"
                            onPress={() => setVizMode(m)}
                        >
                            <SizableText size="$5" fontWeight="800" color={vizMode === m ? '#4F7CFF' : 'rgba(255,255,255,0.5)'}>
                                {m === 'circular' ? '◎' : m === 'bars' ? '▊' : '∿'}
                            </SizableText>
                            <SizableText size="$3" fontWeight="600" color={vizMode === m ? '#4F7CFF' : 'rgba(255,255,255,0.5)'}>
                                {m === 'circular' ? 'Circular' : m === 'bars' ? 'Bars' : 'Wave'}
                            </SizableText>
                        </YStack>
                    ))}
                </XStack>
            </YStack>

            {/* Theme Selector */}
            <YStack gap="$3">
                <SizableText size="$3" fontWeight="600" color="rgba(255,255,255,0.6)">Color Theme</SizableText>
                <XStack gap="$3" flexWrap="wrap">
                    {Object.entries(THEMES).map(([name, theme]) => (
                        <YStack
                            key={name}
                            width={120}
                            bg={vizTheme === name ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.04)'}
                            borderWidth={2}
                            borderColor={vizTheme === name ? '#4F7CFF' : 'rgba(255,255,255,0.06)'}
                            borderRadius="$4"
                            p="$3"
                            alignItems="center"
                            gap="$2"
                            cursor="pointer"
                            onPress={() => setVizTheme(name)}
                        >
                            <XStack gap="$1">
                                {/* @ts-ignore */}
                                <YStack width={20} height={20} borderRadius={10} bg={theme.primary} />
                                {/* @ts-ignore */}
                                <YStack width={20} height={20} borderRadius={10} bg={theme.secondary} />
                                {/* @ts-ignore */}
                                <YStack width={20} height={20} borderRadius={10} bg={theme.accent} />
                            </XStack>
                            <SizableText size="$2" fontWeight="600" color="rgba(255,255,255,0.6)" textTransform="capitalize">{name}</SizableText>
                        </YStack>
                    ))}
                </XStack>
            </YStack>

            {/* Live Preview */}
            <YStack gap="$3">
                <SizableText size="$3" fontWeight="600" color="rgba(255,255,255,0.6)">Live Preview</SizableText>
                <AudioVisualizer
                    trackTitle="Preview Mode"
                    artist="Adjust settings above"
                    mode={vizMode}
                    theme={vizTheme}
                />
            </YStack>
        </YStack>
    )
}

// --- Settings Tab ---
function SettingsTab() {
    return (
        <YStack gap="$5">
            <SizableText size="$5" fontWeight="700" color="white">Portfolio Settings</SizableText>

            <YStack bg="rgba(255,255,255,0.04)" borderRadius="$4" borderWidth={1} borderColor="rgba(255,255,255,0.06)" p="$5" gap="$4">
                <SizableText size="$4" fontWeight="700" color="white">Artist Profile</SizableText>
                <YStack gap="$3">
                    <YStack gap="$1">
                        <SizableText size="$2" color="rgba(255,255,255,0.5)">Artist Name</SizableText>
                        <Input defaultValue="iBiG media" bg="rgba(255,255,255,0.06)" borderColor="rgba(255,255,255,0.1)" color="white" />
                    </YStack>
                    <YStack gap="$1">
                        <SizableText size="$2" color="rgba(255,255,255,0.5)">Bio</SizableText>
                        <Input defaultValue="I Believe in God even in the Digital Age" bg="rgba(255,255,255,0.06)" borderColor="rgba(255,255,255,0.1)" color="white" multiline numberOfLines={3} />
                    </YStack>
                    <YStack gap="$1">
                        <SizableText size="$2" color="rgba(255,255,255,0.5)">Website</SizableText>
                        <Input defaultValue="https://giljabi.com" bg="rgba(255,255,255,0.06)" borderColor="rgba(255,255,255,0.1)" color="white" />
                    </YStack>
                </YStack>
                <Button
                    alignSelf="flex-end"
                    // @ts-ignore
                    style={{ background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)' }}
                    borderRadius="$3"
                    icon={<Save size={16} color="white" />}
                >
                    <SizableText color="white" fontWeight="600">Save</SizableText>
                </Button>
            </YStack>

            <YStack bg="rgba(255,255,255,0.04)" borderRadius="$4" borderWidth={1} borderColor="rgba(255,255,255,0.06)" p="$5" gap="$4">
                <SizableText size="$4" fontWeight="700" color="white">External Links</SizableText>
                {['YouTube', 'SoundCloud', 'Spotify', 'Apple Music'].map(platform => (
                    <XStack key={platform} gap="$3" alignItems="center">
                        <SizableText size="$3" color="rgba(255,255,255,0.6)" width={120}>{platform}</SizableText>
                        {/* @ts-ignore */}
                        <Input flex={1} placeholder={`${platform} URL`} bg="rgba(255,255,255,0.06)" borderColor="rgba(255,255,255,0.1)" color="white" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </XStack>
                ))}
            </YStack>
        </YStack>
    )
}
