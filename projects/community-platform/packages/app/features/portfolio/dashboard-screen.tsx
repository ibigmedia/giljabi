'use client'

import { useState, useRef, useCallback } from 'react'
import { YStack, XStack, SizableText, Button, Input, TextArea, Separator } from '@my/ui'
import {
    Music, Disc, Video, BarChart3, Palette, Settings, Plus, Trash2, Edit3, Eye, Save,
    Upload, Image, Sparkles, Play, Link2, Youtube, X, Check,
    Clock, TrendingUp, Headphones, ExternalLink, FileAudio, Wand2,
} from '@tamagui/lucide-icons'
import { AudioVisualizer, THEMES } from './audio-visualizer'
import type { VisualizerMode } from './audio-visualizer'

// ─── Types ───────────────────────────────────────────────────────────
type DashboardTab = 'overview' | 'releases' | 'videos' | 'visualizer' | 'settings'

interface Release {
    id: string; title: string; artist: string; year: number
    type: 'Single' | 'EP' | 'Album'; coverUrl: string
    tracks: { title: string; duration: string; plays: number }[]
    status: 'published' | 'draft'
}

interface MusicVideo {
    id: string; title: string; youtubeUrl: string; thumbnailUrl: string
    duration: string; views: number; publishedAt: string; status: 'published' | 'draft'
}

// ─── Demo Data ───────────────────────────────────────────────────────
const DEMO_RELEASES: Release[] = [
    { id: '1', title: 'Run Away', artist: 'iBiG band', year: 2024, type: 'Single', coverUrl: 'https://picsum.photos/seed/album1/400/400', tracks: [{ title: 'Run Away', duration: '3:42', plays: 86 }], status: 'published' },
    { id: '2', title: 'Jesus Story', artist: 'iBiG band', year: 2024, type: 'Single', coverUrl: 'https://picsum.photos/seed/album2/400/400', tracks: [{ title: 'Jesus Story', duration: '4:17', plays: 116 }], status: 'published' },
    { id: '3', title: '성탄절 악보 (In that day)', artist: 'iBiG media', year: 2023, type: 'EP', coverUrl: 'https://picsum.photos/seed/album3/400/400', tracks: [{ title: 'In that day', duration: '3:55', plays: 191 }, { title: 'Silent Night (Remix)', duration: '4:02', plays: 88 }], status: 'published' },
    { id: '4', title: '예배 찬양 시리즈', artist: 'iBiG band', year: 2023, type: 'Album', coverUrl: 'https://picsum.photos/seed/album4/400/400', tracks: [{ title: '찬양하라 내 영혼아', duration: '5:12', plays: 245 }, { title: '주의 은혜', duration: '4:30', plays: 178 }, { title: '내 맘에 품은', duration: '3:48', plays: 119 }], status: 'published' },
    { id: '5', title: '길잡이의 노래', artist: 'iBiG media', year: 2022, type: 'Album', coverUrl: 'https://picsum.photos/seed/album5/400/400', tracks: [{ title: '길을 걸으며', duration: '4:21', plays: 302 }], status: 'draft' },
]

const DEMO_VIDEOS: MusicVideo[] = [
    { id: '1', title: 'Run Away (Official MV)', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/mv1/600/340', duration: '3:42', views: 86, publishedAt: '2024-06-15', status: 'published' },
    { id: '2', title: 'Jesus Story (Lyric Video)', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/mv2/600/340', duration: '4:17', views: 116, publishedAt: '2024-03-20', status: 'published' },
    { id: '3', title: '성탄절 악보 - Live Session', youtubeUrl: '', thumbnailUrl: 'https://picsum.photos/seed/mv3/600/340', duration: '5:30', views: 45, publishedAt: '2023-12-01', status: 'draft' },
]

const TABS: { id: DashboardTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'releases', label: 'Releases', icon: Disc },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'visualizer', label: 'Visualizer', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
]

// ─── Utility: extract YouTube ID ─────────────────────────────────────
function extractYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^&?\s]+)/)
    return m ? m[1]! : null
}

// ─── Shared Components ───────────────────────────────────────────────
function Card({ children, ...props }: any) {
    return (
        <YStack bg="$surface" borderRadius="$4" borderWidth={1} borderColor="$borderLight" elevation="$0.5" overflow="hidden" {...props}>
            {children}
        </YStack>
    )
}

// @ts-ignore - dynamic theme token strings
function Badge({ label, color = '$primary', bg = '$primaryContainer' }: { label: string; color?: any; bg?: any }) {
    return (
        <XStack bg={bg} px="$2" py="$1" borderRadius="$full">
            <SizableText size="$1" fontWeight="700" color={color}>{label}</SizableText>
        </XStack>
    )
}

function StatCard({ label, value, change, icon: Icon }: { label: string; value: string; change: string; icon: any }) {
    const isPositive = change.startsWith('+')
    return (
        <Card flex={1} minWidth={180} p="$4" gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$2" color="$textMuted" fontWeight="600">{label}</SizableText>
                <YStack bg="$primaryContainer" p="$1.5" borderRadius="$2">
                    <Icon size={14} color="$primary" />
                </YStack>
            </XStack>
            <SizableText size="$7" fontWeight="900" color="$textMain">{value}</SizableText>
            <SizableText size="$2" fontWeight="600" color={isPositive ? '$success' : '$error'}>{change}</SizableText>
        </Card>
    )
}

function DragDropZone({ label, accept, icon: Icon, onFiles }: { label: string; accept: string; icon: any; onFiles?: (f: FileList) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files.length && onFiles) onFiles(e.dataTransfer.files)
    }, [onFiles])

    return (
        <YStack
            borderWidth={2}
            borderStyle="dashed"
            borderColor={isDragging ? '$primary' : '$outlineVariant'}
            borderRadius="$4"
            bg={isDragging ? '$primaryContainer' : '$surfaceContainerLow'}
            p="$6"
            alignItems="center"
            justifyContent="center"
            gap="$2"
            cursor="pointer"
            hoverStyle={{ borderColor: '$primary', bg: '$surfaceContainerLow' }}
            onPress={() => inputRef.current?.click()}
            // @ts-ignore
            onDragOver={(e: any) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <YStack bg="$primaryContainer" p="$3" borderRadius="$full">
                <Icon size={24} color="$primary" />
            </YStack>
            <SizableText size="$3" fontWeight="600" color="$textMain">{label}</SizableText>
            <SizableText size="$2" color="$textMuted">드래그 앤 드롭 또는 클릭하여 업로드</SizableText>
            {/* @ts-ignore */}
            <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={(e: any) => { if (e.target.files?.length && onFiles) onFiles(e.target.files) }} />
        </YStack>
    )
}

// ─── Main Dashboard ──────────────────────────────────────────────────
export function PortfolioDashboardScreen() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
    const [vizMode, setVizMode] = useState<VisualizerMode>('circular')
    const [vizTheme, setVizTheme] = useState('ocean')
    const [releases, setReleases] = useState<Release[]>(DEMO_RELEASES)
    const [videos, setVideos] = useState<MusicVideo[]>(DEMO_VIDEOS)
    const [nowPlaying, setNowPlaying] = useState<{ title: string; artist: string; coverUrl: string } | null>(null)

    return (
        <YStack width="100%" gap="$5">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
                <YStack gap="$1">
                    <SizableText size="$8" fontWeight="900" color="$textMain">Artist Dashboard</SizableText>
                    <SizableText size="$3" color="$textMuted">미디어 관리 · 콘텐츠 업로드 · AI 썸네일 · 퍼포먼스</SizableText>
                </YStack>
                <XStack gap="$2">
                    <Button bg="$primary" borderRadius="$3" icon={<Eye size={16} color="white" />}>
                        <SizableText color="white" fontWeight="600">포트폴리오 보기</SizableText>
                    </Button>
                </XStack>
            </XStack>

            {/* Now Playing Mini Bar */}
            {nowPlaying && (
                <Card>
                    <XStack p="$3" gap="$3" alignItems="center" bg="$surfaceContainerLow">
                        <YStack width={40} height={40} borderRadius="$2" overflow="hidden">
                            {/* @ts-ignore */}
                            <img src={nowPlaying.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </YStack>
                        <YStack flex={1}>
                            <SizableText size="$3" fontWeight="700" color="$textMain">{nowPlaying.title}</SizableText>
                            <SizableText size="$2" color="$textMuted">{nowPlaying.artist}</SizableText>
                        </YStack>
                        <XStack gap="$2" alignItems="center">
                            <XStack bg="$primaryContainer" p="$2" borderRadius="$full" cursor="pointer">
                                <Headphones size={14} color="$primary" />
                            </XStack>
                            <XStack p="$2" cursor="pointer" onPress={() => setNowPlaying(null)}>
                                <X size={14} color="$textMuted" />
                            </XStack>
                        </XStack>
                    </XStack>
                </Card>
            )}

            {/* Tab Navigation */}
            <XStack gap="$1" bg="$surfaceContainerLow" borderRadius="$4" p="$1" flexWrap="wrap">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <XStack
                            key={tab.id}
                            flex={1}
                            minWidth={100}
                            bg={isActive ? '$surface' : 'transparent'}
                            borderRadius="$3"
                            onPress={() => setActiveTab(tab.id)}
                            gap="$2"
                            alignItems="center"
                            justifyContent="center"
                            paddingVertical="$2.5"
                            paddingHorizontal="$3"
                            cursor="pointer"
                            hoverStyle={{ bg: isActive ? '$surface' : '$surfaceHover' }}
                            elevation={isActive ? '$0.5' : undefined}
                        >
                            <Icon size={16} color={isActive ? '$primary' : '$textMuted'} />
                            <SizableText color={isActive ? '$primary' : '$textMuted'} size="$3" fontWeight={isActive ? '700' : '500'}>
                                {tab.label}
                            </SizableText>
                        </XStack>
                    )
                })}
            </XStack>

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab releases={releases} videos={videos} onPlayTrack={setNowPlaying} />}
            {activeTab === 'releases' && <ReleasesTab releases={releases} setReleases={setReleases} onPlayTrack={setNowPlaying} />}
            {activeTab === 'videos' && <VideosTab videos={videos} setVideos={setVideos} />}
            {activeTab === 'visualizer' && <VisualizerTab vizMode={vizMode} setVizMode={setVizMode} vizTheme={vizTheme} setVizTheme={setVizTheme} />}
            {activeTab === 'settings' && <SettingsTab />}
        </YStack>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════
function OverviewTab({ releases, videos, onPlayTrack }: {
    releases: Release[]; videos: MusicVideo[]
    onPlayTrack: (t: { title: string; artist: string; coverUrl: string }) => void
}) {
    const totalPlays = releases.reduce((sum, r) => sum + r.tracks.reduce((s, t) => s + t.plays, 0), 0)
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0)

    return (
        <YStack gap="$4">
            {/* Stats */}
            <XStack gap="$3" flexWrap="wrap">
                <StatCard label="Total Plays" value={totalPlays.toLocaleString()} change="+12%" icon={Headphones} />
                <StatCard label="Releases" value={String(releases.length)} change={`+${releases.filter(r => r.year === 2024).length}`} icon={Disc} />
                <StatCard label="Videos" value={String(videos.length)} change={`+${videos.filter(v => v.status === 'published').length}`} icon={Video} />
                <StatCard label="Total Views" value={totalViews.toLocaleString()} change="+18%" icon={TrendingUp} />
            </XStack>

            <XStack gap="$4" flexWrap="wrap">
                {/* Quick Player */}
                <Card flex={2} minWidth={340}>
                    <YStack p="$4" gap="$3">
                        <XStack alignItems="center" gap="$2">
                            <Music size={16} color="$primary" />
                            <SizableText size="$4" fontWeight="700" color="$textMain">Quick Player</SizableText>
                        </XStack>
                        <Separator borderColor="$borderLight" />
                        {releases.slice(0, 3).map(r => (
                            <XStack key={r.id} gap="$3" alignItems="center" py="$1">
                                <YStack width={48} height={48} borderRadius="$3" overflow="hidden" position="relative" cursor="pointer"
                                    onPress={() => onPlayTrack({ title: r.title, artist: r.artist, coverUrl: r.coverUrl })}>
                                    {/* @ts-ignore */}
                                    <img src={r.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <YStack position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(0,0,0,0.3)" alignItems="center" justifyContent="center" opacity={0} hoverStyle={{ opacity: 1 }}>
                                        <Play size={18} color="white" />
                                    </YStack>
                                </YStack>
                                <YStack flex={1}>
                                    <SizableText size="$3" fontWeight="700" color="$textMain">{r.title}</SizableText>
                                    <SizableText size="$2" color="$textMuted">{r.artist} · {r.tracks[0]?.duration}</SizableText>
                                </YStack>
                                <XStack gap="$1" alignItems="center">
                                    <BarChart3 size={12} color="$primary" />
                                    <SizableText size="$2" color="$textMuted">{r.tracks.reduce((s, t) => s + t.plays, 0)}</SizableText>
                                </XStack>
                            </XStack>
                        ))}
                    </YStack>
                </Card>

                {/* Recent Activity */}
                <Card flex={1} minWidth={280}>
                    <YStack p="$4" gap="$3">
                        <XStack alignItems="center" gap="$2">
                            <Clock size={16} color="$primary" />
                            <SizableText size="$4" fontWeight="700" color="$textMain">Recent Activity</SizableText>
                        </XStack>
                        <Separator borderColor="$borderLight" />
                        {[
                            { icon: Music, text: '"Run Away" 86 plays 달성', time: '2시간 전', color: '$primary' as const },
                            { icon: Video, text: '"Jesus Story" MV 업로드', time: '1일 전', color: '$tertiary' as const },
                            { icon: Sparkles, text: 'AI 썸네일 생성 완료', time: '2일 전', color: '$secondary' as const },
                            { icon: Disc, text: 'EP "성탄절 악보" 발행', time: '3일 전', color: '$primary' as const },
                        ].map((item, i) => (
                            <XStack key={i} gap="$2" alignItems="center">
                                <YStack width={28} height={28} borderRadius="$2" bg="$surfaceContainerLow" alignItems="center" justifyContent="center">
                                    <item.icon size={13} color={item.color as any} />
                                </YStack>
                                <YStack flex={1}>
                                    <SizableText size="$2" color="$textMain" fontWeight="500">{item.text}</SizableText>
                                </YStack>
                                <SizableText size="$1" color="$textMuted">{item.time}</SizableText>
                            </XStack>
                        ))}
                    </YStack>
                </Card>
            </XStack>

            {/* Top Tracks Table */}
            <Card>
                <YStack p="$4" gap="$3">
                    <XStack alignItems="center" justifyContent="space-between">
                        <XStack alignItems="center" gap="$2">
                            <TrendingUp size={16} color="$primary" />
                            <SizableText size="$4" fontWeight="700" color="$textMain">Top Tracks</SizableText>
                        </XStack>
                    </XStack>
                    <Separator borderColor="$borderLight" />
                    {/* Header */}
                    <XStack px="$2" py="$1">
                        <SizableText size="$1" color="$textMuted" fontWeight="600" width={30}>#</SizableText>
                        <SizableText size="$1" color="$textMuted" fontWeight="600" flex={1}>TITLE</SizableText>
                        <SizableText size="$1" color="$textMuted" fontWeight="600" width={80} textAlign="right">PLAYS</SizableText>
                        <SizableText size="$1" color="$textMuted" fontWeight="600" width={60} textAlign="right">TIME</SizableText>
                    </XStack>
                    {releases.flatMap(r => r.tracks.map(t => ({ ...t, album: r.title, coverUrl: r.coverUrl, artist: r.artist })))
                        .sort((a, b) => b.plays - a.plays)
                        .slice(0, 6)
                        .map((track, i) => (
                            <XStack key={i} px="$2" py="$2" alignItems="center" borderRadius="$2"
                                hoverStyle={{ bg: '$surfaceHover' }} cursor="pointer"
                                onPress={() => onPlayTrack({ title: track.title, artist: track.artist, coverUrl: track.coverUrl })}
                            >
                                <SizableText size="$3" fontWeight="700" color="$textMuted" width={30}>{i + 1}</SizableText>
                                <XStack flex={1} gap="$2" alignItems="center">
                                    <YStack width={32} height={32} borderRadius="$2" overflow="hidden">
                                        {/* @ts-ignore */}
                                        <img src={track.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </YStack>
                                    <YStack>
                                        <SizableText size="$3" fontWeight="600" color="$textMain">{track.title}</SizableText>
                                        <SizableText size="$1" color="$textMuted">{track.album}</SizableText>
                                    </YStack>
                                </XStack>
                                <SizableText size="$3" color="$textMain" fontWeight="600" width={80} textAlign="right">{track.plays.toLocaleString()}</SizableText>
                                <SizableText size="$2" color="$textMuted" width={60} textAlign="right">{track.duration}</SizableText>
                            </XStack>
                        ))}
                </YStack>
            </Card>

            {/* Latest Videos Preview */}
            <Card>
                <YStack p="$4" gap="$3">
                    <XStack alignItems="center" gap="$2">
                        <Video size={16} color="$primary" />
                        <SizableText size="$4" fontWeight="700" color="$textMain">Latest Videos</SizableText>
                    </XStack>
                    <Separator borderColor="$borderLight" />
                    <XStack gap="$3" flexWrap="wrap">
                        {videos.slice(0, 2).map(v => {
                            const ytId = extractYouTubeId(v.youtubeUrl)
                            return (
                                <YStack key={v.id} flex={1} minWidth={260} gap="$2">
                                    <YStack width="100%" aspectRatio={16 / 9} borderRadius="$3" overflow="hidden" position="relative" bg="$surfaceDim">
                                        {ytId ? (
                                            // @ts-ignore
                                            <iframe
                                                src={`https://www.youtube.com/embed/${ytId}`}
                                                style={{ width: '100%', height: '100%', border: 'none' }}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <>
                                                {/* @ts-ignore */}
                                                <img src={v.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <YStack position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(0,0,0,0.3)" alignItems="center" justifyContent="center">
                                                    <Play size={32} color="white" />
                                                </YStack>
                                            </>
                                        )}
                                    </YStack>
                                    <XStack justifyContent="space-between" alignItems="center">
                                        <YStack>
                                            <SizableText size="$3" fontWeight="600" color="$textMain">{v.title}</SizableText>
                                            <SizableText size="$2" color="$textMuted">{v.views} views · {v.publishedAt}</SizableText>
                                        </YStack>
                                        <Badge label={v.status === 'published' ? 'Published' : 'Draft'} color={v.status === 'published' ? '$success' : '$textMuted'} bg={v.status === 'published' ? '$successContainer' : '$surfaceContainerLow'} />
                                    </XStack>
                                </YStack>
                            )
                        })}
                    </XStack>
                </YStack>
            </Card>
        </YStack>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// RELEASES TAB
// ═══════════════════════════════════════════════════════════════════════
function ReleasesTab({ releases, setReleases, onPlayTrack }: {
    releases: Release[]; setReleases: (r: Release[]) => void
    onPlayTrack: (t: { title: string; artist: string; coverUrl: string }) => void
}) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [aiPrompt, setAiPrompt] = useState('')
    const [aiGenerating, setAiGenerating] = useState(false)
    const [previewCover, setPreviewCover] = useState<string | null>(null)

    const handleAiGenerate = () => {
        setAiGenerating(true)
        // Simulate AI generation
        setTimeout(() => {
            const seed = Math.random().toString(36).slice(2, 8)
            setPreviewCover(`https://picsum.photos/seed/${seed}/400/400`)
            setAiGenerating(false)
        }, 2000)
    }

    return (
        <YStack gap="$4">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                    <SizableText size="$5" fontWeight="700" color="$textMain">Releases</SizableText>
                    <SizableText size="$2" color="$textMuted">{releases.length}개 릴리스 · {releases.filter(r => r.status === 'published').length}개 발행됨</SizableText>
                </YStack>
                <Button bg="$primary" borderRadius="$3" icon={<Plus size={16} color="white" />} onPress={() => setShowAddForm(!showAddForm)}>
                    <SizableText color="white" fontWeight="600">새 릴리스</SizableText>
                </Button>
            </XStack>

            {/* Add Release Form */}
            {showAddForm && (
                <Card>
                    <YStack p="$5" gap="$4">
                        <XStack alignItems="center" justifyContent="space-between">
                            <SizableText size="$5" fontWeight="700" color="$textMain">새 릴리스 추가</SizableText>
                            <XStack cursor="pointer" onPress={() => setShowAddForm(false)}>
                                <X size={20} color="$textMuted" />
                            </XStack>
                        </XStack>
                        <Separator borderColor="$borderLight" />

                        <XStack gap="$4" flexWrap="wrap">
                            {/* Cover Art Section */}
                            <YStack width={260} gap="$3">
                                <SizableText size="$3" fontWeight="600" color="$textMain">커버 아트</SizableText>
                                {previewCover ? (
                                    <YStack width="100%" aspectRatio={1} borderRadius="$4" overflow="hidden" position="relative">
                                        {/* @ts-ignore */}
                                        <img src={previewCover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <XStack position="absolute" top="$2" right="$2" gap="$1">
                                            <XStack bg="$success" p="$2" borderRadius="$full" cursor="pointer">
                                                <Check size={14} color="white" />
                                            </XStack>
                                            <XStack bg="$error" p="$2" borderRadius="$full" cursor="pointer" onPress={() => setPreviewCover(null)}>
                                                <X size={14} color="white" />
                                            </XStack>
                                        </XStack>
                                    </YStack>
                                ) : (
                                    <DragDropZone label="커버 이미지 업로드" accept="image/*" icon={Image} />
                                )}

                                {/* AI Thumbnail Generator */}
                                <YStack bg="$surfaceContainerLow" borderRadius="$3" p="$3" gap="$2" borderWidth={1} borderColor="$outlineVariant">
                                    <XStack alignItems="center" gap="$2">
                                        <Sparkles size={14} color="$primary" />
                                        <SizableText size="$2" fontWeight="700" color="$primary">AI 썸네일 생성</SizableText>
                                    </XStack>
                                    <Input
                                        size="$3"
                                        placeholder="예: 밤하늘에 십자가가 빛나는 미니멀 앨범 커버"
                                        value={aiPrompt}
                                        onChangeText={setAiPrompt}
                                        bg="$surface"
                                        borderColor="$borderLight"
                                    />
                                    <Button
                                        size="$3"
                                        bg="$primary"
                                        borderRadius="$3"
                                        onPress={handleAiGenerate}
                                        disabled={!aiPrompt || aiGenerating}
                                        opacity={!aiPrompt || aiGenerating ? 0.6 : 1}
                                        icon={aiGenerating ? undefined : <Wand2 size={14} color="white" />}
                                    >
                                        <SizableText color="white" fontWeight="600" size="$2">
                                            {aiGenerating ? '생성 중...' : 'AI로 생성하기'}
                                        </SizableText>
                                    </Button>
                                </YStack>
                            </YStack>

                            {/* Release Info */}
                            <YStack flex={1} minWidth={280} gap="$3">
                                <SizableText size="$3" fontWeight="600" color="$textMain">릴리스 정보</SizableText>
                                <XStack gap="$3">
                                    <YStack flex={1} gap="$1">
                                        <SizableText size="$2" color="$textMuted">타이틀</SizableText>
                                        <Input placeholder="릴리스 제목" bg="$surfaceContainerLow" borderColor="$borderLight" />
                                    </YStack>
                                    <YStack width={120} gap="$1">
                                        <SizableText size="$2" color="$textMuted">연도</SizableText>
                                        <Input placeholder="2024" bg="$surfaceContainerLow" borderColor="$borderLight" />
                                    </YStack>
                                </XStack>
                                <XStack gap="$3">
                                    <YStack flex={1} gap="$1">
                                        <SizableText size="$2" color="$textMuted">아티스트</SizableText>
                                        <Input placeholder="아티스트명" bg="$surfaceContainerLow" borderColor="$borderLight" />
                                    </YStack>
                                    <YStack width={140} gap="$1">
                                        <SizableText size="$2" color="$textMuted">타입</SizableText>
                                        <XStack gap="$2">
                                            {(['Single', 'EP', 'Album'] as const).map(t => (
                                                <XStack key={t} bg="$surfaceContainerLow" px="$3" py="$2" borderRadius="$3" cursor="pointer" borderWidth={1} borderColor="$borderLight" hoverStyle={{ bg: '$primaryContainer', borderColor: '$primary' }}>
                                                    <SizableText size="$2" fontWeight="600" color="$textMain">{t}</SizableText>
                                                </XStack>
                                            ))}
                                        </XStack>
                                    </YStack>
                                </XStack>

                                {/* Track Upload */}
                                <SizableText size="$3" fontWeight="600" color="$textMain" mt="$2">트랙 업로드</SizableText>
                                <DragDropZone label="음원 파일 업로드 (MP3, WAV, FLAC)" accept="audio/*" icon={FileAudio} />

                                <XStack gap="$2" justifyContent="flex-end" mt="$2">
                                    <Button chromeless onPress={() => setShowAddForm(false)}>
                                        <SizableText color="$textMuted" fontWeight="600">취소</SizableText>
                                    </Button>
                                    <Button bg="$primary" borderRadius="$3" icon={<Save size={14} color="white" />}>
                                        <SizableText color="white" fontWeight="600">저장</SizableText>
                                    </Button>
                                </XStack>
                            </YStack>
                        </XStack>
                    </YStack>
                </Card>
            )}

            {/* Release Cards */}
            {releases.map(release => {
                const isExpanded = expandedId === release.id
                return (
                    <Card key={release.id}>
                        <XStack p="$4" gap="$4" alignItems="center" cursor="pointer" onPress={() => setExpandedId(isExpanded ? null : release.id)} hoverStyle={{ bg: '$surfaceHover' }}>
                            <YStack width={72} height={72} borderRadius="$3" overflow="hidden">
                                {/* @ts-ignore */}
                                <img src={release.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </YStack>
                            <YStack flex={1} gap="$1">
                                <XStack alignItems="center" gap="$2">
                                    <SizableText size="$5" fontWeight="700" color="$textMain">{release.title}</SizableText>
                                    <Badge label={release.type} />
                                    <Badge label={release.status === 'published' ? '발행됨' : '임시저장'} color={release.status === 'published' ? '$success' : '$textMuted'} bg={release.status === 'published' ? '$successContainer' : '$surfaceContainerLow'} />
                                </XStack>
                                <SizableText size="$2" color="$textMuted">{release.artist} · {release.year} · {release.tracks.length}곡 · {release.tracks.reduce((s, t) => s + t.plays, 0)} plays</SizableText>
                            </YStack>
                            <XStack gap="$2">
                                <Button size="$3" circular bg="$surfaceHover" icon={<Edit3 size={14} color="$textMuted" />} />
                                <Button size="$3" circular bg="$surfaceHover" icon={<Trash2 size={14} color="$error" />}
                                    onPress={(e: any) => { e.stopPropagation(); setReleases(releases.filter(r => r.id !== release.id)) }} />
                            </XStack>
                        </XStack>

                        {/* Expanded: Track List with inline play */}
                        {isExpanded && (
                            <YStack bg="$surfaceContainerLow" p="$4" gap="$1" borderTopWidth={1} borderColor="$borderLight">
                                <XStack px="$2" py="$1">
                                    <SizableText size="$1" color="$textMuted" fontWeight="600" width={30}>#</SizableText>
                                    <SizableText size="$1" color="$textMuted" fontWeight="600" flex={1}>TITLE</SizableText>
                                    <SizableText size="$1" color="$textMuted" fontWeight="600" width={70} textAlign="right">PLAYS</SizableText>
                                    <SizableText size="$1" color="$textMuted" fontWeight="600" width={60} textAlign="right">TIME</SizableText>
                                    <YStack width={40} />
                                </XStack>
                                {release.tracks.map((track, ti) => (
                                    <XStack key={ti} px="$2" py="$2.5" alignItems="center" borderRadius="$2" hoverStyle={{ bg: '$surfaceHover' }} cursor="pointer"
                                        onPress={() => onPlayTrack({ title: track.title, artist: release.artist, coverUrl: release.coverUrl })}>
                                        <SizableText size="$3" fontWeight="600" color="$textMuted" width={30}>{ti + 1}</SizableText>
                                        <SizableText size="$3" fontWeight="600" color="$textMain" flex={1}>{track.title}</SizableText>
                                        <SizableText size="$2" color="$textMuted" width={70} textAlign="right">{track.plays.toLocaleString()}</SizableText>
                                        <SizableText size="$2" color="$textMuted" width={60} textAlign="right">{track.duration}</SizableText>
                                        <XStack width={40} justifyContent="center">
                                            <XStack bg="$primaryContainer" p="$1.5" borderRadius="$full">
                                                <Play size={12} color="$primary" />
                                            </XStack>
                                        </XStack>
                                    </XStack>
                                ))}
                                <XStack gap="$2" mt="$3" justifyContent="flex-end">
                                    <Button size="$3" chromeless icon={<Plus size={14} color="$primary" />}>
                                        <SizableText size="$2" color="$primary" fontWeight="600">트랙 추가</SizableText>
                                    </Button>
                                    <Button size="$3" chromeless icon={<Sparkles size={14} color="$primary" />}>
                                        <SizableText size="$2" color="$primary" fontWeight="600">AI 커버 재생성</SizableText>
                                    </Button>
                                </XStack>
                            </YStack>
                        )}
                    </Card>
                )
            })}
        </YStack>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// VIDEOS TAB
// ═══════════════════════════════════════════════════════════════════════
function VideosTab({ videos, setVideos }: { videos: MusicVideo[]; setVideos: (v: MusicVideo[]) => void }) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [youtubeUrl, setYoutubeUrl] = useState('')
    const [previewId, setPreviewId] = useState<string | null>(null)
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

    const handleYoutubeUrl = (url: string) => {
        setYoutubeUrl(url)
        const id = extractYouTubeId(url)
        setPreviewId(id)
    }

    return (
        <YStack gap="$4">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                    <SizableText size="$5" fontWeight="700" color="$textMain">Music Videos</SizableText>
                    <SizableText size="$2" color="$textMuted">{videos.length}개 비디오 · YouTube 링크 또는 파일 업로드</SizableText>
                </YStack>
                <Button bg="$primary" borderRadius="$3" icon={<Plus size={16} color="white" />} onPress={() => setShowAddForm(!showAddForm)}>
                    <SizableText color="white" fontWeight="600">비디오 추가</SizableText>
                </Button>
            </XStack>

            {/* Add Video Form */}
            {showAddForm && (
                <Card>
                    <YStack p="$5" gap="$4">
                        <XStack alignItems="center" justifyContent="space-between">
                            <SizableText size="$5" fontWeight="700" color="$textMain">새 비디오 추가</SizableText>
                            <XStack cursor="pointer" onPress={() => { setShowAddForm(false); setYoutubeUrl(''); setPreviewId(null) }}>
                                <X size={20} color="$textMuted" />
                            </XStack>
                        </XStack>
                        <Separator borderColor="$borderLight" />

                        {/* YouTube URL Input */}
                        <YStack gap="$2">
                            <XStack alignItems="center" gap="$2">
                                <Youtube size={18} color="#FF0000" />
                                <SizableText size="$3" fontWeight="600" color="$textMain">YouTube 링크로 추가</SizableText>
                            </XStack>
                            <XStack gap="$2">
                                <Input
                                    flex={1}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={youtubeUrl}
                                    onChangeText={handleYoutubeUrl}
                                    bg="$surfaceContainerLow"
                                    borderColor="$borderLight"
                                />
                                <Button bg={previewId ? '$success' : '$surfaceHover'} borderRadius="$3" icon={previewId ? <Check size={16} color="white" /> : <Link2 size={16} color="$textMuted" />}>
                                    <SizableText color={previewId ? 'white' : '$textMuted'} fontWeight="600">{previewId ? '확인됨' : '확인'}</SizableText>
                                </Button>
                            </XStack>

                            {/* YouTube Preview */}
                            {previewId && (
                                <YStack width="100%" maxWidth={560} aspectRatio={16 / 9} borderRadius="$4" overflow="hidden" alignSelf="center" mt="$2">
                                    {/* @ts-ignore */}
                                    <iframe
                                        src={`https://www.youtube.com/embed/${previewId}`}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </YStack>
                            )}
                        </YStack>

                        <XStack alignItems="center" gap="$3">
                            <Separator flex={1} borderColor="$borderLight" />
                            <SizableText size="$2" color="$textMuted">또는</SizableText>
                            <Separator flex={1} borderColor="$borderLight" />
                        </XStack>

                        {/* File Upload */}
                        <DragDropZone label="비디오 파일 업로드 (MP4, MOV, WebM)" accept="video/*" icon={Video} />

                        {/* Video Meta */}
                        <XStack gap="$3" flexWrap="wrap">
                            <YStack flex={1} minWidth={200} gap="$1">
                                <SizableText size="$2" color="$textMuted">제목</SizableText>
                                <Input placeholder="뮤직비디오 제목" bg="$surfaceContainerLow" borderColor="$borderLight" />
                            </YStack>
                            <YStack width={120} gap="$1">
                                <SizableText size="$2" color="$textMuted">발행일</SizableText>
                                <Input placeholder="2024-01-01" bg="$surfaceContainerLow" borderColor="$borderLight" />
                            </YStack>
                        </XStack>

                        {/* AI Thumbnail for video */}
                        <YStack bg="$surfaceContainerLow" borderRadius="$3" p="$3" gap="$2" borderWidth={1} borderColor="$outlineVariant">
                            <XStack alignItems="center" gap="$2">
                                <Sparkles size={14} color="$primary" />
                                <SizableText size="$2" fontWeight="700" color="$primary">AI 썸네일 생성 (커스텀)</SizableText>
                            </XStack>
                            <SizableText size="$1" color="$textMuted">YouTube 링크의 경우 자동으로 썸네일을 가져옵니다. 커스텀 썸네일이 필요한 경우 AI로 생성하세요.</SizableText>
                            <XStack gap="$2">
                                <Input flex={1} size="$3" placeholder="예: 노을진 바다 위 십자가 실루엣" bg="$surface" borderColor="$borderLight" />
                                <Button size="$3" bg="$primary" borderRadius="$3" icon={<Wand2 size={14} color="white" />}>
                                    <SizableText color="white" fontWeight="600" size="$2">생성</SizableText>
                                </Button>
                            </XStack>
                        </YStack>

                        <XStack gap="$2" justifyContent="flex-end">
                            <Button chromeless onPress={() => { setShowAddForm(false); setYoutubeUrl(''); setPreviewId(null) }}>
                                <SizableText color="$textMuted" fontWeight="600">취소</SizableText>
                            </Button>
                            <Button bg="$primary" borderRadius="$3" icon={<Save size={14} color="white" />}>
                                <SizableText color="white" fontWeight="600">저장</SizableText>
                            </Button>
                        </XStack>
                    </YStack>
                </Card>
            )}

            {/* Video Cards */}
            <XStack flexWrap="wrap" gap="$4">
                {videos.map(v => {
                    const ytId = extractYouTubeId(v.youtubeUrl)
                    const isPlaying = playingVideoId === v.id

                    return (
                        <YStack key={v.id} flex={1} minWidth={300} maxWidth="49%">
                            <Card>
                                {/* Video Player / Thumbnail */}
                                <YStack width="100%" aspectRatio={16 / 9} position="relative" overflow="hidden" bg="$surfaceDim">
                                    {isPlaying && ytId ? (
                                        // @ts-ignore
                                        <iframe
                                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <>
                                            {/* @ts-ignore */}
                                            <img src={v.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <YStack position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(0,0,0,0.2)" alignItems="center" justifyContent="center"
                                                cursor="pointer" opacity={0} hoverStyle={{ opacity: 1 }} onPress={() => setPlayingVideoId(v.id)}>
                                                <YStack bg="rgba(255,255,255,0.95)" width={56} height={56} borderRadius={28} alignItems="center" justifyContent="center" elevation="$2">
                                                    <Play size={24} color="$primary" />
                                                </YStack>
                                            </YStack>
                                            <YStack position="absolute" bottom="$2" right="$2" bg="rgba(0,0,0,0.75)" borderRadius="$2" px="$2" py="$1">
                                                <SizableText size="$1" color="white" fontWeight="600">{v.duration}</SizableText>
                                            </YStack>
                                            {ytId && (
                                                <YStack position="absolute" top="$2" left="$2" bg="rgba(255,0,0,0.9)" borderRadius="$2" px="$2" py="$1">
                                                    <SizableText size="$1" color="white" fontWeight="700">YouTube</SizableText>
                                                </YStack>
                                            )}
                                        </>
                                    )}
                                </YStack>

                                {/* Video Info */}
                                <YStack p="$3" gap="$2">
                                    <XStack justifyContent="space-between" alignItems="flex-start">
                                        <YStack flex={1} gap="$1">
                                            <SizableText size="$4" fontWeight="700" color="$textMain">{v.title}</SizableText>
                                            <XStack gap="$3" alignItems="center">
                                                <SizableText size="$2" color="$textMuted">{v.views} views</SizableText>
                                                <SizableText size="$2" color="$textMuted">{v.publishedAt}</SizableText>
                                                <Badge label={v.status === 'published' ? '발행됨' : '임시저장'} color={v.status === 'published' ? '$success' : '$textMuted'} bg={v.status === 'published' ? '$successContainer' : '$surfaceContainerLow'} />
                                            </XStack>
                                        </YStack>
                                        <XStack gap="$1">
                                            {isPlaying && (
                                                <Button size="$2" circular bg="$surfaceHover" icon={<X size={12} color="$textMuted" />} onPress={() => setPlayingVideoId(null)} />
                                            )}
                                            <Button size="$2" circular bg="$surfaceHover" icon={<Edit3 size={12} color="$textMuted" />} />
                                            <Button size="$2" circular bg="$surfaceHover" icon={<Trash2 size={12} color="$error" />}
                                                onPress={() => setVideos(videos.filter(vid => vid.id !== v.id))} />
                                        </XStack>
                                    </XStack>
                                </YStack>
                            </Card>
                        </YStack>
                    )
                })}
            </XStack>
        </YStack>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// VISUALIZER TAB
// ═══════════════════════════════════════════════════════════════════════
function VisualizerTab({ vizMode, setVizMode, vizTheme, setVizTheme }: {
    vizMode: VisualizerMode; setVizMode: (m: VisualizerMode) => void
    vizTheme: string; setVizTheme: (t: string) => void
}) {
    return (
        <YStack gap="$5">
            <SizableText size="$5" fontWeight="700" color="$textMain">Visualizer Settings</SizableText>

            <XStack gap="$4" flexWrap="wrap">
                {/* Controls */}
                <YStack flex={1} minWidth={300} gap="$4">
                    {/* Mode */}
                    <Card p="$4" gap="$3">
                        <SizableText size="$3" fontWeight="600" color="$textMain">Display Mode</SizableText>
                        <XStack gap="$2">
                            {(['circular', 'bars', 'wave'] as const).map(m => (
                                <YStack
                                    key={m}
                                    flex={1}
                                    bg={vizMode === m ? '$primaryContainer' : '$surfaceContainerLow'}
                                    borderWidth={2}
                                    borderColor={vizMode === m ? '$primary' : 'transparent'}
                                    borderRadius="$3"
                                    p="$3"
                                    alignItems="center"
                                    gap="$1"
                                    cursor="pointer"
                                    onPress={() => setVizMode(m)}
                                    hoverStyle={{ borderColor: '$primary' }}
                                >
                                    <SizableText size="$6" fontWeight="800" color={vizMode === m ? '$primary' : '$textMuted'}>
                                        {m === 'circular' ? '◎' : m === 'bars' ? '▊' : '∿'}
                                    </SizableText>
                                    <SizableText size="$2" fontWeight="600" color={vizMode === m ? '$primary' : '$textMuted'}>
                                        {m === 'circular' ? 'Circular' : m === 'bars' ? 'Bars' : 'Wave'}
                                    </SizableText>
                                </YStack>
                            ))}
                        </XStack>
                    </Card>

                    {/* Theme */}
                    <Card p="$4" gap="$3">
                        <SizableText size="$3" fontWeight="600" color="$textMain">Color Theme</SizableText>
                        <XStack gap="$2" flexWrap="wrap">
                            {Object.entries(THEMES).map(([name, theme]) => (
                                <YStack
                                    key={name}
                                    flex={1}
                                    minWidth={100}
                                    bg={vizTheme === name ? '$primaryContainer' : '$surfaceContainerLow'}
                                    borderWidth={2}
                                    borderColor={vizTheme === name ? '$primary' : 'transparent'}
                                    borderRadius="$3"
                                    p="$3"
                                    alignItems="center"
                                    gap="$2"
                                    cursor="pointer"
                                    onPress={() => setVizTheme(name)}
                                    hoverStyle={{ borderColor: '$primary' }}
                                >
                                    <XStack gap="$1">
                                        {/* @ts-ignore */}
                                        <YStack width={18} height={18} borderRadius={9} bg={theme.primary} />
                                        {/* @ts-ignore */}
                                        <YStack width={18} height={18} borderRadius={9} bg={theme.secondary} />
                                        {/* @ts-ignore */}
                                        <YStack width={18} height={18} borderRadius={9} bg={theme.accent} />
                                    </XStack>
                                    <SizableText size="$2" fontWeight="600" color={vizTheme === name ? '$primary' : '$textMuted'} textTransform="capitalize">{name}</SizableText>
                                </YStack>
                            ))}
                        </XStack>
                    </Card>
                </YStack>

                {/* Live Preview */}
                <YStack flex={1} minWidth={340}>
                    <Card overflow="hidden">
                        <YStack p="$3" pb="$0">
                            <SizableText size="$3" fontWeight="600" color="$textMain">Live Preview</SizableText>
                        </YStack>
                        <AudioVisualizer
                            trackTitle="Preview Mode"
                            artist="Adjust settings to preview"
                            mode={vizMode}
                            theme={vizTheme}
                        />
                    </Card>
                </YStack>
            </XStack>
        </YStack>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════════════════════
function SettingsTab() {
    return (
        <YStack gap="$4">
            <SizableText size="$5" fontWeight="700" color="$textMain">Portfolio Settings</SizableText>

            <XStack gap="$4" flexWrap="wrap">
                {/* Profile */}
                <Card flex={1} minWidth={320} p="$5" gap="$4">
                    <XStack alignItems="center" gap="$2">
                        <Music size={16} color="$primary" />
                        <SizableText size="$4" fontWeight="700" color="$textMain">아티스트 프로필</SizableText>
                    </XStack>
                    <Separator borderColor="$borderLight" />

                    {/* Profile Image */}
                    <XStack gap="$4" alignItems="center">
                        <YStack width={80} height={80} borderRadius="$full" overflow="hidden" bg="$surfaceContainerLow">
                            {/* @ts-ignore */}
                            <img src="https://picsum.photos/seed/artist/160/160" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </YStack>
                        <YStack gap="$2">
                            <Button size="$3" bg="$primaryContainer" borderRadius="$3" icon={<Upload size={14} color="$primary" />}>
                                <SizableText color="$primary" fontWeight="600" size="$2">사진 변경</SizableText>
                            </Button>
                            <Button size="$3" chromeless icon={<Sparkles size={14} color="$primary" />}>
                                <SizableText color="$primary" fontWeight="600" size="$2">AI 프로필 생성</SizableText>
                            </Button>
                        </YStack>
                    </XStack>

                    <YStack gap="$3">
                        <YStack gap="$1">
                            <SizableText size="$2" color="$textMuted">아티스트명</SizableText>
                            <Input defaultValue="iBiG media" bg="$surfaceContainerLow" borderColor="$borderLight" />
                        </YStack>
                        <YStack gap="$1">
                            <SizableText size="$2" color="$textMuted">소개글</SizableText>
                            <TextArea defaultValue="I Believe in God even in the Digital Age. 디지털 시대에도 변치 않는 믿음의 길을 만듭니다." bg="$surfaceContainerLow" borderColor="$borderLight" numberOfLines={3} />
                        </YStack>
                        <YStack gap="$1">
                            <SizableText size="$2" color="$textMuted">웹사이트</SizableText>
                            <Input defaultValue="https://giljabi.com" bg="$surfaceContainerLow" borderColor="$borderLight" />
                        </YStack>
                    </YStack>
                    <Button alignSelf="flex-end" bg="$primary" borderRadius="$3" icon={<Save size={14} color="white" />}>
                        <SizableText color="white" fontWeight="600">저장</SizableText>
                    </Button>
                </Card>

                {/* External Links */}
                <YStack flex={1} minWidth={280} gap="$4">
                    <Card p="$5" gap="$4">
                        <XStack alignItems="center" gap="$2">
                            <ExternalLink size={16} color="$primary" />
                            <SizableText size="$4" fontWeight="700" color="$textMain">소셜 & 스트리밍</SizableText>
                        </XStack>
                        <Separator borderColor="$borderLight" />
                        {[
                            { platform: 'YouTube', icon: '🎬', placeholder: 'youtube.com/c/...' },
                            { platform: 'SoundCloud', icon: '🎵', placeholder: 'soundcloud.com/...' },
                            { platform: 'Spotify', icon: '🎧', placeholder: 'open.spotify.com/artist/...' },
                            { platform: 'Apple Music', icon: '🍎', placeholder: 'music.apple.com/...' },
                            { platform: 'Instagram', icon: '📷', placeholder: 'instagram.com/...' },
                        ].map(link => (
                            <XStack key={link.platform} gap="$2" alignItems="center">
                                <SizableText size="$4" width={28} textAlign="center">{link.icon}</SizableText>
                                <YStack flex={1} gap="$0.5">
                                    <SizableText size="$1" color="$textMuted" fontWeight="600">{link.platform}</SizableText>
                                    <Input size="$3" placeholder={link.placeholder} bg="$surfaceContainerLow" borderColor="$borderLight" />
                                </YStack>
                            </XStack>
                        ))}
                        <Button alignSelf="flex-end" bg="$primary" borderRadius="$3" icon={<Save size={14} color="white" />}>
                            <SizableText color="white" fontWeight="600">저장</SizableText>
                        </Button>
                    </Card>

                    {/* Portfolio Display Settings */}
                    <Card p="$5" gap="$3">
                        <XStack alignItems="center" gap="$2">
                            <Palette size={16} color="$primary" />
                            <SizableText size="$4" fontWeight="700" color="$textMain">포트폴리오 표시 설정</SizableText>
                        </XStack>
                        <Separator borderColor="$borderLight" />
                        {[
                            { label: 'Now Playing 비주얼라이저 표시', enabled: true },
                            { label: '자동 재생 활성화', enabled: false },
                            { label: '비공개 트랙 표시', enabled: false },
                            { label: '방문자 통계 표시', enabled: true },
                        ].map((opt, i) => (
                            <XStack key={i} justifyContent="space-between" alignItems="center" py="$1">
                                <SizableText size="$3" color="$textMain">{opt.label}</SizableText>
                                <XStack
                                    width={44} height={24} borderRadius={12}
                                    bg={opt.enabled ? '$primary' : '$outlineVariant'}
                                    alignItems="center"
                                    px="$0.5"
                                    justifyContent={opt.enabled ? 'flex-end' : 'flex-start'}
                                    cursor="pointer"
                                >
                                    <YStack width={20} height={20} borderRadius={10} bg="white" elevation="$0.5" />
                                </XStack>
                            </XStack>
                        ))}
                    </Card>
                </YStack>
            </XStack>
        </YStack>
    )
}
