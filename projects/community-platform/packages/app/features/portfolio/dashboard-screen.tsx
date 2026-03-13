'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { YStack, XStack, SizableText, Button, Input, TextArea, Separator } from '@my/ui'
import {
    Music, Disc, Video, BarChart3, Palette, Settings, Plus, Trash2, Edit3, Eye, Save,
    Upload, Image, Sparkles, Play, Youtube, X, Check,
    Clock, TrendingUp, Headphones, ExternalLink, FileAudio, Wand2,
} from '@tamagui/lucide-icons'
import { AudioVisualizer, THEMES } from './audio-visualizer'
import type { VisualizerMode } from './audio-visualizer'

// ─── Types ───────────────────────────────────────────────────────────
type DashboardTab = 'overview' | 'releases' | 'videos' | 'visualizer' | 'settings'

interface Track {
    id: string; title: string; duration: string; plays: number; audioUrl?: string
}

interface Release {
    id: string; title: string; artist: string; year: number
    type: 'Single' | 'EP' | 'Album'; coverUrl: string
    tracks: Track[]; status: 'published' | 'draft'
}

interface MusicVideo {
    id: string; title: string; youtubeUrl: string; thumbnailUrl: string
    duration: string; views: number; publishedAt: string; status: 'published' | 'draft'
}

// ─── Helpers ─────────────────────────────────────────────────────────
let _idCounter = 100
function genId() { return String(++_idCounter) }

function extractYouTubeId(url: string): string | null {
    if (!url) return null
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^&?\s]+)/)
    return m ? m[1]! : null
}

// ─── API helpers ─────────────────────────────────────────────────────
async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(path)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

async function apiPost<T>(path: string, body: any): Promise<T> {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

async function apiPut<T>(path: string, body: any): Promise<T> {
    const res = await fetch(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

async function apiDelete(path: string): Promise<void> {
    const res = await fetch(path, { method: 'DELETE' })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
}

async function uploadFile(file: File, folder: string): Promise<{ url: string; name: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const res = await fetch('/api/portfolio/upload', { method: 'POST', body: formData })
    const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    if (!res.ok) {
        throw new Error(data.error || `업로드 실패 (${res.status})`)
    }
    return data
}

// ─── Shared UI ───────────────────────────────────────────────────────
function Card({ children, ...props }: any) {
    return (
        <YStack bg="$surface" borderRadius="$4" borderWidth={1} borderColor="$borderLight" elevation="$0.5" overflow="hidden" {...props}>
            {children}
        </YStack>
    )
}

function Badge({ label, color, bg }: { label: string; color?: any; bg?: any }) {
    return (
        <XStack bg={bg || '$primaryContainer'} px="$2" py="$1" borderRadius="$full">
            <SizableText size="$1" fontWeight="700" color={color || '$primary'}>{label}</SizableText>
        </XStack>
    )
}

function DragDropZone({ label, accept, icon: Icon, onFiles, folder, onUploaded }: { label: string; accept: string; icon: any; onFiles?: (f: FileList) => void; folder?: string; onUploaded?: (url: string, name: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const handleFiles = useCallback(async (files: FileList) => {
        const file = files[0]
        if (!file) return
        setFileName(file.name)
        setUploadError(null)
        onFiles?.(files)

        // Auto-upload if folder and onUploaded are provided
        if (folder && onUploaded) {
            setUploading(true)
            try {
                const result = await uploadFile(file, folder)
                onUploaded(result.url, file.name)
            } catch (err: any) {
                setUploadError(err.message || '업로드 실패')
            } finally {
                setUploading(false)
            }
        }
    }, [onFiles, folder, onUploaded])

    return (
        <YStack
            borderWidth={2} borderStyle="dashed"
            borderColor={isDragging ? '$primary' : fileName ? '$success' : '$outlineVariant'}
            borderRadius="$4"
            bg={isDragging ? '$primaryContainer' : '$surfaceContainerLow'}
            p="$5" alignItems="center" gap="$2" cursor="pointer"
            hoverStyle={{ borderColor: '$primary', bg: '$surfaceContainerLow' }}
            onPress={() => inputRef.current?.click()}
            // @ts-ignore
            onDragOver={(e: any) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e: any) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files) }}
        >
            <YStack bg={uploading ? '$primaryContainer' : fileName ? '$successContainer' : '$primaryContainer'} p="$2.5" borderRadius="$full">
                {uploading ? <Upload size={20} color="$primary" /> : fileName ? <Check size={20} color="$success" /> : <Icon size={20} color="$primary" />}
            </YStack>
            <SizableText size="$3" fontWeight="600" color="$textMain">{uploading ? '업로드 중...' : fileName || label}</SizableText>
            <SizableText size="$2" color="$textMuted">{uploading ? '잠시 기다려주세요' : fileName ? '클릭하여 변경' : '드래그 앤 드롭 또는 클릭'}</SizableText>
            {uploadError && <SizableText size="$2" color="$error">{uploadError}</SizableText>}
            {/* @ts-ignore */}
            <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
                onChange={(e: any) => { if (e.target.files?.length) handleFiles(e.target.files) }} />
        </YStack>
    )
}

// ─── AI Thumbnail Generator (shared) ─────────────────────────────────
function AiThumbnailGenerator({ onGenerated }: { currentUrl?: string; onGenerated: (url: string) => void }) {
    const [prompt, setPrompt] = useState('')
    const [generating, setGenerating] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [optimized, setOptimized] = useState<string | null>(null)

    const generate = async () => {
        if (!prompt.trim()) return
        setGenerating(true)
        setError(null)
        setOptimized(null)
        try {
            const data = await apiPost<{ imageUrl: string; optimizedPrompt?: string }>('/api/portfolio/ai-thumbnail', { prompt: prompt.trim() })
            setPreviewUrl(data.imageUrl)
            if (data.optimizedPrompt && data.optimizedPrompt !== prompt.trim()) {
                setOptimized(data.optimizedPrompt)
            }
        } catch (err: any) {
            setError('AI 이미지 생성 실패. 다시 시도해주세요.')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <YStack bg="$surfaceContainerLow" borderRadius="$3" p="$3" gap="$2" borderWidth={1} borderColor="$outlineVariant">
            <XStack alignItems="center" gap="$2">
                <Sparkles size={14} color="$primary" />
                <SizableText size="$2" fontWeight="700" color="$primary">AI 썸네일 생성 (Claude + Pollinations)</SizableText>
            </XStack>
            {previewUrl && (
                <YStack width="100%" maxWidth={200} aspectRatio={1} borderRadius="$3" overflow="hidden" alignSelf="center" bg="$surfaceContainerHigh">
                    {/* @ts-ignore */}
                    <img
                        src={previewUrl}
                        alt="AI Generated"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => { e.target.style.display = 'none' }}
                    />
                    <SizableText size="$1" color="$textLight" textAlign="center" mt="$1" position="absolute" bottom={4} left={0} right={0}>AI 생성 이미지 (로딩 중일 수 있음)</SizableText>
                </YStack>
            )}
            {optimized && <SizableText size="$1" color="$textMuted" numberOfLines={2}>Claude 최적화: {optimized}</SizableText>}
            {error && <SizableText size="$2" color="$error">{error}</SizableText>}
            <Input
                size="$3" placeholder="예: 밤하늘에 십자가가 빛나는 앨범 커버"
                value={prompt} onChangeText={setPrompt}
                bg="$surface" borderColor="$borderLight"
            />
            <XStack gap="$2">
                <Button size="$3" bg="$primary" borderRadius="$3" flex={1}
                    onPress={generate} disabled={!prompt.trim() || generating}
                    opacity={!prompt.trim() || generating ? 0.6 : 1}
                    icon={generating ? undefined : <Wand2 size={14} color="white" />}>
                    <SizableText color="white" fontWeight="600" size="$2">
                        {generating ? '생성 중...' : '생성하기'}
                    </SizableText>
                </Button>
                {previewUrl && (
                    <>
                        <Button size="$3" bg="$success" borderRadius="$3" icon={<Check size={14} color="white" />}
                            onPress={() => { onGenerated(previewUrl); setPreviewUrl(null); setPrompt('') }}>
                            <SizableText color="white" fontWeight="600" size="$2">적용</SizableText>
                        </Button>
                        <Button size="$3" bg="$error" borderRadius="$3" icon={<X size={14} color="white" />}
                            onPress={() => setPreviewUrl(null)}>
                            <SizableText color="white" fontWeight="600" size="$2">취소</SizableText>
                        </Button>
                    </>
                )}
            </XStack>
        </YStack>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
export function PortfolioDashboardScreen() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
    const [vizMode, setVizMode] = useState<VisualizerMode>('circular')
    const [vizTheme, setVizTheme] = useState('ocean')
    const [releases, setReleases] = useState<Release[]>([])
    const [videos, setVideos] = useState<MusicVideo[]>([])
    const [nowPlaying, setNowPlaying] = useState<{ title: string; artist: string; coverUrl: string } | null>(null)
    const [loading, setLoading] = useState(true)

    // Load data from API on mount
    useEffect(() => {
        Promise.all([
            apiGet<any[]>('/api/portfolio/releases').catch(() => []),
            apiGet<any[]>('/api/portfolio/videos').catch(() => []),
        ]).then(([rel, vid]) => {
            setReleases(rel.map((r: any) => ({
                ...r, year: Number(r.year),
                tracks: (r.tracks || []).map((t: any) => ({ ...t, plays: t.plays || 0 })),
            })))
            setVideos(vid.map((v: any) => ({
                ...v, views: v.views || 0,
                publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString().slice(0, 10) : '',
            })))
        }).finally(() => setLoading(false))
    }, [])

    const TABS: { id: DashboardTab; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'releases', label: 'Releases', icon: Disc },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'visualizer', label: 'Visualizer', icon: Palette },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    return (
        <YStack width="100%" gap="$5">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
                <YStack gap="$1">
                    <SizableText size="$8" fontWeight="900" color="$textMain">Artist Dashboard</SizableText>
                    <SizableText size="$3" color="$textMuted">미디어 관리 · 콘텐츠 업로드 · AI 썸네일 · 퍼포먼스</SizableText>
                </YStack>
                <Button bg="$primary" borderRadius="$3" icon={<Eye size={16} color="white" />}>
                    <SizableText color="white" fontWeight="600">포트폴리오 보기</SizableText>
                </Button>
            </XStack>

            {/* Now Playing Mini Bar */}
            {nowPlaying && (
                <Card>
                    <XStack p="$3" gap="$3" alignItems="center" bg="$primaryContainer">
                        <YStack width={40} height={40} borderRadius="$2" overflow="hidden">
                            {/* @ts-ignore */}
                            <img src={nowPlaying.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </YStack>
                        <Headphones size={16} color="$primary" />
                        <YStack flex={1}>
                            <SizableText size="$3" fontWeight="700" color="$onPrimaryContainer">{nowPlaying.title}</SizableText>
                            <SizableText size="$2" color="$onPrimaryContainer" opacity={0.7}>{nowPlaying.artist}</SizableText>
                        </YStack>
                        <SizableText size="$2" color="$primary" fontWeight="600">Now Playing</SizableText>
                        <XStack bg="$surface" p="$2" borderRadius="$full" cursor="pointer" onPress={() => setNowPlaying(null)}>
                            <X size={14} color="$textMuted" />
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
                        <XStack key={tab.id} flex={1} minWidth={100}
                            bg={isActive ? '$surface' : 'transparent'}
                            borderRadius="$3" onPress={() => setActiveTab(tab.id)}
                            gap="$2" alignItems="center" justifyContent="center"
                            paddingVertical="$2.5" paddingHorizontal="$3" cursor="pointer"
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

            {loading && (
                <Card p="$6" alignItems="center">
                    <SizableText size="$4" color="$textMuted">데이터를 불러오는 중...</SizableText>
                </Card>
            )}
            {!loading && activeTab === 'overview' && <OverviewTab releases={releases} videos={videos} onPlay={setNowPlaying} />}
            {!loading && activeTab === 'releases' && <ReleasesTab releases={releases} setReleases={setReleases} onPlay={setNowPlaying} />}
            {!loading && activeTab === 'videos' && <VideosTab videos={videos} setVideos={setVideos} />}
            {activeTab === 'visualizer' && <VisualizerTab vizMode={vizMode} setVizMode={setVizMode} vizTheme={vizTheme} setVizTheme={setVizTheme} />}
            {activeTab === 'settings' && <SettingsTab />}
        </YStack>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════════════
function OverviewTab({ releases, videos, onPlay }: {
    releases: Release[]; videos: MusicVideo[]
    onPlay: (t: { title: string; artist: string; coverUrl: string }) => void
}) {
    const totalPlays = releases.reduce((s, r) => s + r.tracks.reduce((a, t) => a + t.plays, 0), 0)
    const totalViews = videos.reduce((s, v) => s + v.views, 0)

    return (
        <YStack gap="$4">
            {/* Stats */}
            <XStack gap="$3" flexWrap="wrap">
                {[
                    { label: 'Total Plays', value: totalPlays.toLocaleString(), change: '+12%', icon: Headphones },
                    { label: 'Releases', value: String(releases.length), change: `+${releases.filter(r => r.year === 2024).length}`, icon: Disc },
                    { label: 'Videos', value: String(videos.length), change: `+${videos.filter(v => v.status === 'published').length}`, icon: Video },
                    { label: 'Total Views', value: totalViews.toLocaleString(), change: '+18%', icon: TrendingUp },
                ].map(s => (
                    <Card key={s.label} flex={1} minWidth={180} p="$4" gap="$2">
                        <XStack justifyContent="space-between" alignItems="center">
                            <SizableText size="$2" color="$textMuted" fontWeight="600">{s.label}</SizableText>
                            <YStack bg="$primaryContainer" p="$1.5" borderRadius="$2">
                                <s.icon size={14} color="$primary" />
                            </YStack>
                        </XStack>
                        <SizableText size="$7" fontWeight="900" color="$textMain">{s.value}</SizableText>
                        <SizableText size="$2" fontWeight="600" color="$success">{s.change}</SizableText>
                    </Card>
                ))}
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
                        {releases.slice(0, 4).map(r => (
                            <XStack key={r.id} gap="$3" alignItems="center" py="$1" cursor="pointer"
                                hoverStyle={{ bg: '$surfaceHover' }} borderRadius="$2" px="$1"
                                onPress={() => onPlay({ title: r.title, artist: r.artist, coverUrl: r.coverUrl })}>
                                <YStack width={44} height={44} borderRadius="$2" overflow="hidden" position="relative">
                                    {/* @ts-ignore */}
                                    <img src={r.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <YStack position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(0,0,0,0.25)" alignItems="center" justifyContent="center">
                                        <Play size={16} color="white" />
                                    </YStack>
                                </YStack>
                                <YStack flex={1}>
                                    <SizableText size="$3" fontWeight="700" color="$textMain">{r.title}</SizableText>
                                    <SizableText size="$2" color="$textMuted">{r.artist} · {r.tracks[0]?.duration}</SizableText>
                                </YStack>
                                <XStack gap="$1" alignItems="center">
                                    <BarChart3 size={12} color="$primary" />
                                    <SizableText size="$2" color="$textMuted">{r.tracks.reduce((a, t) => a + t.plays, 0)}</SizableText>
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
                            { icon: Music, text: `"${releases[0]?.title}" ${releases[0]?.tracks[0]?.plays} plays`, time: '2시간 전' },
                            { icon: Video, text: `"${videos[0]?.title}" 업로드됨`, time: '1일 전' },
                            { icon: Sparkles, text: 'AI 썸네일 생성 완료', time: '2일 전' },
                            { icon: Disc, text: `"${releases[2]?.title}" 발행됨`, time: '3일 전' },
                        ].map((item, i) => (
                            <XStack key={i} gap="$2" alignItems="center">
                                <YStack width={28} height={28} borderRadius="$2" bg="$primaryContainer" alignItems="center" justifyContent="center">
                                    <item.icon size={13} color="$primary" />
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

            {/* Top Tracks */}
            <Card>
                <YStack p="$4" gap="$3">
                    <XStack alignItems="center" gap="$2">
                        <TrendingUp size={16} color="$primary" />
                        <SizableText size="$4" fontWeight="700" color="$textMain">Top Tracks</SizableText>
                    </XStack>
                    <Separator borderColor="$borderLight" />
                    <XStack px="$2" py="$1">
                        <SizableText size="$1" color="$textMuted" fontWeight="600" width={30}>#</SizableText>
                        <SizableText size="$1" color="$textMuted" fontWeight="600" flex={1}>TITLE</SizableText>
                        <SizableText size="$1" color="$textMuted" fontWeight="600" width={80} textAlign="right">PLAYS</SizableText>
                        <SizableText size="$1" color="$textMuted" fontWeight="600" width={60} textAlign="right">TIME</SizableText>
                    </XStack>
                    {releases.flatMap(r => r.tracks.map(t => ({ ...t, album: r.title, coverUrl: r.coverUrl, artist: r.artist })))
                        .sort((a, b) => b.plays - a.plays).slice(0, 6)
                        .map((track, i) => (
                            <XStack key={track.id} px="$2" py="$2" alignItems="center" borderRadius="$2"
                                hoverStyle={{ bg: '$surfaceHover' }} cursor="pointer"
                                onPress={() => onPlay({ title: track.title, artist: track.artist, coverUrl: track.coverUrl })}>
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

            {/* Latest Videos */}
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
                                    <YStack width="100%" aspectRatio={16 / 9} borderRadius="$3" overflow="hidden" bg="$surfaceDim">
                                        {ytId ? (
                                            // @ts-ignore
                                            <iframe src={`https://www.youtube.com/embed/${ytId}`} style={{ width: '100%', height: '100%', border: 'none' }}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
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
                                    <SizableText size="$3" fontWeight="600" color="$textMain">{v.title}</SizableText>
                                    <SizableText size="$2" color="$textMuted">{v.views} views · {v.publishedAt}</SizableText>
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
// RELEASES TAB — full CRUD
// ═══════════════════════════════════════════════════════════════════════
function ReleasesTab({ releases, setReleases, onPlay }: {
    releases: Release[]; setReleases: (r: Release[]) => void
    onPlay: (t: { title: string; artist: string; coverUrl: string }) => void
}) {
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // form fields
    const [fTitle, setFTitle] = useState('')
    const [fArtist, setFArtist] = useState('iBiG band')
    const [fYear, setFYear] = useState('2024')
    const [fType, setFType] = useState<Release['type']>('Single')
    const [fCover, setFCover] = useState('')
    const [fStatus, setFStatus] = useState<Release['status']>('draft')
    const [fTracks, setFTracks] = useState<Track[]>([])

    // new track form
    const [newTrackTitle, setNewTrackTitle] = useState('')
    const [newTrackDuration, setNewTrackDuration] = useState('')

    const resetForm = () => {
        setFTitle(''); setFArtist('iBiG band'); setFYear('2024'); setFType('Single')
        setFCover(''); setFStatus('draft'); setFTracks([]); setEditingId(null)
        setNewTrackTitle(''); setNewTrackDuration('')
    }

    const openAddForm = () => {
        resetForm()
        setShowForm(true)
    }

    const openEditForm = (r: Release) => {
        setFTitle(r.title); setFArtist(r.artist); setFYear(String(r.year))
        setFType(r.type); setFCover(r.coverUrl); setFStatus(r.status)
        setFTracks([...r.tracks]); setEditingId(r.id)
        setShowForm(true)
    }

    const [saving, setSaving] = useState(false)

    const saveRelease = async () => {
        if (!fTitle.trim() || saving) return
        setSaving(true)
        try {
            const payload = {
                title: fTitle.trim(), artist: fArtist.trim(),
                year: parseInt(fYear) || 2024, type: fType,
                coverUrl: fCover || undefined,
                tracks: fTracks.length ? fTracks : [{ title: fTitle.trim(), duration: '0:00', plays: 0 }],
                status: fStatus,
            }
            if (editingId) {
                const updated = await apiPut<Release>(`/api/portfolio/releases/${editingId}`, payload)
                setReleases(releases.map(r => r.id === editingId ? { ...updated, tracks: updated.tracks || [] } : r))
            } else {
                const created = await apiPost<Release>('/api/portfolio/releases', payload)
                setReleases([{ ...created, tracks: created.tracks || [] }, ...releases])
            }
            setShowForm(false)
            resetForm()
        } catch (err) {
            alert('저장 실패. 다시 시도해주세요.')
        } finally {
            setSaving(false)
        }
    }

    const deleteRelease = async (id: string) => {
        try {
            await apiDelete(`/api/portfolio/releases/${id}`)
            setReleases(releases.filter(r => r.id !== id))
            if (editingId === id) { setShowForm(false); resetForm() }
        } catch {
            alert('삭제 실패.')
        }
    }

    const addTrackToForm = () => {
        if (!newTrackTitle.trim()) return
        setFTracks([...fTracks, { id: genId(), title: newTrackTitle.trim(), duration: newTrackDuration || '0:00', plays: 0 }])
        setNewTrackTitle(''); setNewTrackDuration('')
    }

    const removeTrackFromForm = (tid: string) => {
        setFTracks(fTracks.filter(t => t.id !== tid))
    }

    // inline add track to existing release (save via API)
    const addTrackToRelease = async (releaseId: string) => {
        const rel = releases.find(r => r.id === releaseId)
        if (!rel) return
        const newTracks = [...rel.tracks, { id: genId(), title: `New Track ${rel.tracks.length + 1}`, duration: '0:00', plays: 0 }]
        try {
            const updated = await apiPut<Release>(`/api/portfolio/releases/${releaseId}`, { ...rel, tracks: newTracks })
            setReleases(releases.map(r => r.id === releaseId ? { ...updated, tracks: updated.tracks || [] } : r))
        } catch { /* optimistic update fallback */
            setReleases(releases.map(r => r.id === releaseId ? { ...r, tracks: newTracks } : r))
        }
    }

    // inline regenerate AI cover via API
    const [regenId, setRegenId] = useState<string | null>(null)
    const regenerateCover = async (releaseId: string) => {
        const rel = releases.find(r => r.id === releaseId)
        if (!rel) return
        setRegenId(releaseId)
        try {
            const data = await apiPost<{ imageUrl: string }>('/api/portfolio/ai-thumbnail', { prompt: `${rel.title} ${rel.artist} album cover art` })
            const updated = await apiPut<Release>(`/api/portfolio/releases/${releaseId}`, { ...rel, coverUrl: data.imageUrl, tracks: rel.tracks })
            setReleases(releases.map(r => r.id === releaseId ? { ...updated, tracks: updated.tracks || [] } : r))
        } catch {
            alert('AI 커버 생성 실패')
        } finally {
            setRegenId(null)
        }
    }

    // toggle publish status (save via API)
    const toggleStatus = async (releaseId: string) => {
        const rel = releases.find(r => r.id === releaseId)
        if (!rel) return
        const newStatus = rel.status === 'published' ? 'draft' : 'published'
        try {
            await apiPut(`/api/portfolio/releases/${releaseId}`, { ...rel, status: newStatus, tracks: rel.tracks })
            setReleases(releases.map(r => r.id === releaseId ? { ...r, status: newStatus } : r))
        } catch {
            alert('상태 변경 실패')
        }
    }

    return (
        <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                    <SizableText size="$5" fontWeight="700" color="$textMain">Releases</SizableText>
                    <SizableText size="$2" color="$textMuted">{releases.length}개 릴리스 · {releases.filter(r => r.status === 'published').length}개 발행됨</SizableText>
                </YStack>
                <Button bg="$primary" borderRadius="$3" icon={<Plus size={16} color="white" />} onPress={openAddForm}>
                    <SizableText color="white" fontWeight="600">새 릴리스</SizableText>
                </Button>
            </XStack>

            {/* Add / Edit Form */}
            {showForm && (
                <Card>
                    <YStack p="$5" gap="$4">
                        <XStack alignItems="center" justifyContent="space-between">
                            <SizableText size="$5" fontWeight="700" color="$textMain">{editingId ? '릴리스 수정' : '새 릴리스 추가'}</SizableText>
                            <XStack cursor="pointer" onPress={() => { setShowForm(false); resetForm() }}><X size={20} color="$textMuted" /></XStack>
                        </XStack>
                        <Separator borderColor="$borderLight" />

                        <XStack gap="$4" flexWrap="wrap">
                            {/* Cover */}
                            <YStack width={240} gap="$3">
                                <SizableText size="$3" fontWeight="600" color="$textMain">커버 아트</SizableText>
                                {fCover ? (
                                    <YStack width="100%" aspectRatio={1} borderRadius="$4" overflow="hidden" position="relative">
                                        {/* @ts-ignore */}
                                        <img src={fCover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <XStack position="absolute" top="$2" right="$2" gap="$1">
                                            <XStack bg="rgba(0,0,0,0.6)" p="$2" borderRadius="$full" cursor="pointer" onPress={() => setFCover('')}>
                                                <X size={14} color="white" />
                                            </XStack>
                                        </XStack>
                                    </YStack>
                                ) : (
                                    <DragDropZone label="커버 이미지 업로드" accept="image/*" icon={Image}
                                        folder="covers"
                                        onUploaded={(url) => setFCover(url)} />
                                )}
                                <AiThumbnailGenerator currentUrl={fCover} onGenerated={setFCover} />
                            </YStack>

                            {/* Info + Tracks */}
                            <YStack flex={1} minWidth={280} gap="$3">
                                <SizableText size="$3" fontWeight="600" color="$textMain">릴리스 정보</SizableText>
                                <XStack gap="$3">
                                    <YStack flex={1} gap="$1">
                                        <SizableText size="$2" color="$textMuted">타이틀 *</SizableText>
                                        <Input value={fTitle} onChangeText={setFTitle} placeholder="릴리스 제목" bg="$surfaceContainerLow" borderColor="$borderLight" />
                                    </YStack>
                                    <YStack width={90} gap="$1">
                                        <SizableText size="$2" color="$textMuted">연도</SizableText>
                                        <Input value={fYear} onChangeText={setFYear} placeholder="2024" bg="$surfaceContainerLow" borderColor="$borderLight" />
                                    </YStack>
                                </XStack>
                                <XStack gap="$3">
                                    <YStack flex={1} gap="$1">
                                        <SizableText size="$2" color="$textMuted">아티스트</SizableText>
                                        <Input value={fArtist} onChangeText={setFArtist} placeholder="아티스트명" bg="$surfaceContainerLow" borderColor="$borderLight" />
                                    </YStack>
                                    <YStack gap="$1">
                                        <SizableText size="$2" color="$textMuted">타입</SizableText>
                                        <XStack gap="$2">
                                            {(['Single', 'EP', 'Album'] as const).map(t => (
                                                <XStack key={t} bg={fType === t ? '$primaryContainer' : '$surfaceContainerLow'} px="$3" py="$2" borderRadius="$3"
                                                    cursor="pointer" borderWidth={1} borderColor={fType === t ? '$primary' : '$borderLight'}
                                                    onPress={() => setFType(t)}>
                                                    <SizableText size="$2" fontWeight="600" color={fType === t ? '$primary' : '$textMain'}>{t}</SizableText>
                                                </XStack>
                                            ))}
                                        </XStack>
                                    </YStack>
                                </XStack>

                                {/* Track list */}
                                <YStack gap="$2" mt="$2">
                                    <SizableText size="$3" fontWeight="600" color="$textMain">트랙 ({fTracks.length}곡)</SizableText>
                                    {fTracks.map((t, i) => (
                                        <XStack key={t.id} gap="$2" alignItems="center" bg="$surfaceContainerLow" p="$2" borderRadius="$2">
                                            <SizableText size="$2" color="$textMuted" width={20}>{i + 1}</SizableText>
                                            <SizableText size="$3" color="$textMain" flex={1} fontWeight="500">{t.title}</SizableText>
                                            <SizableText size="$2" color="$textMuted">{t.duration}</SizableText>
                                            <XStack cursor="pointer" onPress={() => removeTrackFromForm(t.id)} p="$1">
                                                <Trash2 size={12} color="$error" />
                                            </XStack>
                                        </XStack>
                                    ))}
                                    <XStack gap="$2" alignItems="center">
                                        <Input flex={1} size="$3" value={newTrackTitle} onChangeText={setNewTrackTitle} placeholder="트랙 제목" bg="$surfaceContainerLow" borderColor="$borderLight" />
                                        <Input width={70} size="$3" value={newTrackDuration} onChangeText={setNewTrackDuration} placeholder="3:42" bg="$surfaceContainerLow" borderColor="$borderLight" />
                                        <Button size="$3" bg="$primaryContainer" borderRadius="$2" onPress={addTrackToForm} icon={<Plus size={14} color="$primary" />}>
                                            <SizableText size="$2" color="$primary" fontWeight="600">추가</SizableText>
                                        </Button>
                                    </XStack>
                                    <DragDropZone label="음원 파일 업로드 (MP3, WAV, FLAC)" accept="audio/*" icon={FileAudio}
                                        folder="audio"
                                        onUploaded={(url, name) => {
                                            const trackName = name.replace(/\.[^.]+$/, '')
                                            setFTracks(prev => [...prev, { id: genId(), title: trackName, duration: '0:00', plays: 0, audioUrl: url }])
                                        }} />
                                </YStack>

                                {/* Status */}
                                <XStack gap="$2" alignItems="center" mt="$2">
                                    <SizableText size="$2" color="$textMuted">상태:</SizableText>
                                    <XStack gap="$2">
                                        {(['draft', 'published'] as const).map(s => (
                                            <XStack key={s} bg={fStatus === s ? (s === 'published' ? '$successContainer' : '$surfaceContainerHigh') : '$surfaceContainerLow'}
                                                px="$3" py="$1.5" borderRadius="$full" cursor="pointer"
                                                borderWidth={1} borderColor={fStatus === s ? (s === 'published' ? '$success' : '$outline') : '$borderLight'}
                                                onPress={() => setFStatus(s)}>
                                                <SizableText size="$2" fontWeight="600" color={fStatus === s ? (s === 'published' ? '$success' : '$textMain') : '$textMuted'}>
                                                    {s === 'draft' ? '임시저장' : '발행'}
                                                </SizableText>
                                            </XStack>
                                        ))}
                                    </XStack>
                                </XStack>

                                <XStack gap="$2" justifyContent="flex-end" mt="$3">
                                    <Button chromeless onPress={() => { setShowForm(false); resetForm() }}>
                                        <SizableText color="$textMuted" fontWeight="600">취소</SizableText>
                                    </Button>
                                    <Button bg="$primary" borderRadius="$3" icon={<Save size={14} color="white" />}
                                        onPress={saveRelease} opacity={!fTitle.trim() || saving ? 0.5 : 1} disabled={!fTitle.trim() || saving}>
                                        <SizableText color="white" fontWeight="600">{saving ? '저장 중...' : editingId ? '수정 완료' : '저장'}</SizableText>
                                    </Button>
                                </XStack>
                            </YStack>
                        </XStack>
                    </YStack>
                </Card>
            )}

            {/* Release list */}
            {releases.map(release => {
                const isExpanded = expandedId === release.id
                return (
                    <Card key={release.id}>
                        <XStack p="$4" gap="$4" alignItems="center" cursor="pointer"
                            onPress={() => setExpandedId(isExpanded ? null : release.id)}
                            hoverStyle={{ bg: '$surfaceHover' }}>
                            <YStack width={64} height={64} borderRadius="$3" overflow="hidden">
                                {/* @ts-ignore */}
                                <img src={release.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </YStack>
                            <YStack flex={1} gap="$1">
                                <XStack alignItems="center" gap="$2" flexWrap="wrap">
                                    <SizableText size="$5" fontWeight="700" color="$textMain">{release.title}</SizableText>
                                    <Badge label={release.type} />
                                    <Badge label={release.status === 'published' ? '발행됨' : '임시저장'}
                                        color={release.status === 'published' ? '$success' : '$textMuted'}
                                        bg={release.status === 'published' ? '$successContainer' : '$surfaceContainerLow'} />
                                </XStack>
                                <SizableText size="$2" color="$textMuted">{release.artist} · {release.year} · {release.tracks.length}곡 · {release.tracks.reduce((a, t) => a + t.plays, 0)} plays</SizableText>
                            </YStack>
                            <XStack gap="$2">
                                <Button size="$3" circular bg="$surfaceHover" icon={<Edit3 size={14} color="$primary" />}
                                    onPress={(e: any) => { e.stopPropagation(); openEditForm(release) }} />
                                <Button size="$3" circular bg="$surfaceHover" icon={<Trash2 size={14} color="$error" />}
                                    onPress={(e: any) => { e.stopPropagation(); deleteRelease(release.id) }} />
                            </XStack>
                        </XStack>

                        {isExpanded && (
                            <YStack bg="$surfaceContainerLow" p="$4" gap="$2" borderTopWidth={1} borderColor="$borderLight">
                                <XStack px="$2" py="$1">
                                    <SizableText size="$1" color="$textMuted" fontWeight="600" width={30}>#</SizableText>
                                    <SizableText size="$1" color="$textMuted" fontWeight="600" flex={1}>TITLE</SizableText>
                                    <SizableText size="$1" color="$textMuted" fontWeight="600" width={70} textAlign="right">PLAYS</SizableText>
                                    <SizableText size="$1" color="$textMuted" fontWeight="600" width={60} textAlign="right">TIME</SizableText>
                                    <YStack width={40} />
                                </XStack>
                                {release.tracks.map((track, ti) => (
                                    <XStack key={track.id} px="$2" py="$2" alignItems="center" borderRadius="$2"
                                        hoverStyle={{ bg: '$surfaceHover' }} cursor="pointer"
                                        onPress={() => onPlay({ title: track.title, artist: release.artist, coverUrl: release.coverUrl })}>
                                        <SizableText size="$3" fontWeight="600" color="$textMuted" width={30}>{ti + 1}</SizableText>
                                        <SizableText size="$3" fontWeight="600" color="$textMain" flex={1}>{track.title}</SizableText>
                                        <SizableText size="$2" color="$textMuted" width={70} textAlign="right">{track.plays.toLocaleString()}</SizableText>
                                        <SizableText size="$2" color="$textMuted" width={60} textAlign="right">{track.duration}</SizableText>
                                        <XStack width={40} justifyContent="center">
                                            <XStack bg="$primaryContainer" p="$1.5" borderRadius="$full"><Play size={12} color="$primary" /></XStack>
                                        </XStack>
                                    </XStack>
                                ))}
                                <Separator borderColor="$borderLight" mt="$2" />
                                <XStack gap="$2" mt="$2" flexWrap="wrap">
                                    <Button size="$3" bg="$primaryContainer" borderRadius="$3" icon={<Plus size={14} color="$primary" />}
                                        onPress={() => addTrackToRelease(release.id)}>
                                        <SizableText size="$2" color="$primary" fontWeight="600">트랙 추가</SizableText>
                                    </Button>
                                    <Button size="$3" bg="$primaryContainer" borderRadius="$3" icon={<Sparkles size={14} color="$primary" />}
                                        onPress={() => regenerateCover(release.id)} disabled={regenId === release.id}
                                        opacity={regenId === release.id ? 0.5 : 1}>
                                        <SizableText size="$2" color="$primary" fontWeight="600">{regenId === release.id ? 'AI 생성 중...' : 'AI 커버 재생성'}</SizableText>
                                    </Button>
                                    <Button size="$3" bg={release.status === 'published' ? '$surfaceContainerLow' : '$successContainer'} borderRadius="$3"
                                        icon={release.status === 'published' ? <X size={14} color="$textMuted" /> : <Check size={14} color="$success" />}
                                        onPress={() => toggleStatus(release.id)}>
                                        <SizableText size="$2" color={release.status === 'published' ? '$textMuted' : '$success'} fontWeight="600">
                                            {release.status === 'published' ? '비공개로 전환' : '발행하기'}
                                        </SizableText>
                                    </Button>
                                    <Button size="$3" bg="$surfaceContainerLow" borderRadius="$3" icon={<Edit3 size={14} color="$primary" />}
                                        onPress={() => openEditForm(release)}>
                                        <SizableText size="$2" color="$primary" fontWeight="600">수정</SizableText>
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
// VIDEOS TAB — full CRUD + YouTube embed
// ═══════════════════════════════════════════════════════════════════════
function VideosTab({ videos, setVideos }: { videos: MusicVideo[]; setVideos: (v: MusicVideo[]) => void }) {
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [playingId, setPlayingId] = useState<string | null>(null)

    // form
    const [fTitle, setFTitle] = useState('')
    const [fYoutube, setFYoutube] = useState('')
    const [fThumb, setFThumb] = useState('')
    const [fDuration, setFDuration] = useState('')
    const [fDate, setFDate] = useState('')
    const [fStatus, setFStatus] = useState<MusicVideo['status']>('draft')

    const ytPreviewId = extractYouTubeId(fYoutube)

    const resetForm = () => {
        setFTitle(''); setFYoutube(''); setFThumb(''); setFDuration(''); setFDate(''); setFStatus('draft'); setEditingId(null)
    }

    const openEdit = (v: MusicVideo) => {
        setFTitle(v.title); setFYoutube(v.youtubeUrl); setFThumb(v.thumbnailUrl)
        setFDuration(v.duration); setFDate(v.publishedAt); setFStatus(v.status); setEditingId(v.id)
        setShowForm(true)
    }

    const [saving, setSaving] = useState(false)

    const saveVideo = async () => {
        if (!fTitle.trim() || saving) return
        setSaving(true)
        try {
            const ytId = extractYouTubeId(fYoutube)
            const thumb = fThumb || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined)
            const payload = {
                title: fTitle.trim(), youtubeUrl: fYoutube || undefined, thumbnailUrl: thumb,
                duration: fDuration || '0:00', views: editingId ? (videos.find(v => v.id === editingId)?.views || 0) : 0,
                status: fStatus,
            }
            if (editingId) {
                const updated = await apiPut<MusicVideo>(`/api/portfolio/videos/${editingId}`, payload)
                setVideos(videos.map(v => v.id === editingId ? { ...updated, publishedAt: new Date(updated.publishedAt).toISOString().slice(0, 10) } : v))
            } else {
                const created = await apiPost<MusicVideo>('/api/portfolio/videos', payload)
                setVideos([{ ...created, publishedAt: new Date(created.publishedAt).toISOString().slice(0, 10) }, ...videos])
            }
            setShowForm(false); resetForm()
        } catch {
            alert('저장 실패. 다시 시도해주세요.')
        } finally {
            setSaving(false)
        }
    }

    const deleteVideo = async (id: string) => {
        try {
            await apiDelete(`/api/portfolio/videos/${id}`)
            setVideos(videos.filter(v => v.id !== id))
        } catch {
            alert('삭제 실패.')
        }
    }

    return (
        <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                    <SizableText size="$5" fontWeight="700" color="$textMain">Music Videos</SizableText>
                    <SizableText size="$2" color="$textMuted">{videos.length}개 비디오 · YouTube 링크 또는 파일 업로드</SizableText>
                </YStack>
                <Button bg="$primary" borderRadius="$3" icon={<Plus size={16} color="white" />}
                    onPress={() => { resetForm(); setShowForm(!showForm) }}>
                    <SizableText color="white" fontWeight="600">비디오 추가</SizableText>
                </Button>
            </XStack>

            {/* Add / Edit Form */}
            {showForm && (
                <Card>
                    <YStack p="$5" gap="$4">
                        <XStack alignItems="center" justifyContent="space-between">
                            <SizableText size="$5" fontWeight="700" color="$textMain">{editingId ? '비디오 수정' : '새 비디오 추가'}</SizableText>
                            <XStack cursor="pointer" onPress={() => { setShowForm(false); resetForm() }}><X size={20} color="$textMuted" /></XStack>
                        </XStack>
                        <Separator borderColor="$borderLight" />

                        {/* YouTube URL */}
                        <YStack gap="$2">
                            <XStack alignItems="center" gap="$2">
                                <Youtube size={18} color="#FF0000" />
                                <SizableText size="$3" fontWeight="600" color="$textMain">YouTube 링크</SizableText>
                                {ytPreviewId && <Badge label="유효한 링크" color="$success" bg="$successContainer" />}
                            </XStack>
                            <Input value={fYoutube} onChangeText={setFYoutube}
                                placeholder="https://www.youtube.com/watch?v=..."
                                bg="$surfaceContainerLow" borderColor={ytPreviewId ? '$success' : '$borderLight'} />
                            {ytPreviewId && (
                                <YStack width="100%" maxWidth={480} aspectRatio={16 / 9} borderRadius="$4" overflow="hidden" alignSelf="center" mt="$1">
                                    {/* @ts-ignore */}
                                    <iframe src={`https://www.youtube.com/embed/${ytPreviewId}`}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                </YStack>
                            )}
                        </YStack>

                        {!ytPreviewId && (
                            <>
                                <XStack alignItems="center" gap="$3">
                                    <Separator flex={1} borderColor="$borderLight" />
                                    <SizableText size="$2" color="$textMuted">또는 파일 업로드</SizableText>
                                    <Separator flex={1} borderColor="$borderLight" />
                                </XStack>
                                <DragDropZone label="비디오 파일 업로드 (MP4, MOV)" accept="video/*" icon={Video} />
                            </>
                        )}

                        <XStack gap="$3" flexWrap="wrap">
                            <YStack flex={1} minWidth={200} gap="$1">
                                <SizableText size="$2" color="$textMuted">제목 *</SizableText>
                                <Input value={fTitle} onChangeText={setFTitle} placeholder="뮤직비디오 제목" bg="$surfaceContainerLow" borderColor="$borderLight" />
                            </YStack>
                            <YStack width={100} gap="$1">
                                <SizableText size="$2" color="$textMuted">길이</SizableText>
                                <Input value={fDuration} onChangeText={setFDuration} placeholder="3:42" bg="$surfaceContainerLow" borderColor="$borderLight" />
                            </YStack>
                            <YStack width={130} gap="$1">
                                <SizableText size="$2" color="$textMuted">발행일</SizableText>
                                <Input value={fDate} onChangeText={setFDate} placeholder="2024-01-01" bg="$surfaceContainerLow" borderColor="$borderLight" />
                            </YStack>
                        </XStack>

                        {/* Custom thumbnail */}
                        <YStack gap="$2">
                            <SizableText size="$3" fontWeight="600" color="$textMain">커스텀 썸네일</SizableText>
                            {fThumb ? (
                                <XStack gap="$3" alignItems="center">
                                    <YStack width={120} aspectRatio={16 / 9} borderRadius="$3" overflow="hidden">
                                        {/* @ts-ignore */}
                                        <img src={fThumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </YStack>
                                    <Button size="$3" chromeless onPress={() => setFThumb('')}>
                                        <SizableText size="$2" color="$error" fontWeight="600">제거</SizableText>
                                    </Button>
                                </XStack>
                            ) : (
                                <YStack gap="$2">
                                    <SizableText size="$2" color="$textMuted">
                                        {ytPreviewId ? 'YouTube 썸네일이 자동으로 사용됩니다. AI로 커스텀 생성도 가능합니다.' : '썸네일을 업로드하거나 AI로 생성하세요.'}
                                    </SizableText>
                                    <DragDropZone label="썸네일 이미지 업로드" accept="image/*" icon={Image}
                                        folder="thumbnails"
                                        onUploaded={(url) => setFThumb(url)} />
                                </YStack>
                            )}
                            <AiThumbnailGenerator currentUrl={fThumb} onGenerated={setFThumb} />
                        </YStack>

                        {/* Status */}
                        <XStack gap="$2" alignItems="center">
                            <SizableText size="$2" color="$textMuted">상태:</SizableText>
                            {(['draft', 'published'] as const).map(s => (
                                <XStack key={s} bg={fStatus === s ? (s === 'published' ? '$successContainer' : '$surfaceContainerHigh') : '$surfaceContainerLow'}
                                    px="$3" py="$1.5" borderRadius="$full" cursor="pointer"
                                    borderWidth={1} borderColor={fStatus === s ? (s === 'published' ? '$success' : '$outline') : '$borderLight'}
                                    onPress={() => setFStatus(s)}>
                                    <SizableText size="$2" fontWeight="600" color={fStatus === s ? (s === 'published' ? '$success' : '$textMain') : '$textMuted'}>
                                        {s === 'draft' ? '임시저장' : '발행'}
                                    </SizableText>
                                </XStack>
                            ))}
                        </XStack>

                        <XStack gap="$2" justifyContent="flex-end">
                            <Button chromeless onPress={() => { setShowForm(false); resetForm() }}>
                                <SizableText color="$textMuted" fontWeight="600">취소</SizableText>
                            </Button>
                            <Button bg="$primary" borderRadius="$3" icon={<Save size={14} color="white" />}
                                onPress={saveVideo} opacity={!fTitle.trim() || saving ? 0.5 : 1} disabled={!fTitle.trim() || saving}>
                                <SizableText color="white" fontWeight="600">{saving ? '저장 중...' : editingId ? '수정 완료' : '저장'}</SizableText>
                            </Button>
                        </XStack>
                    </YStack>
                </Card>
            )}

            {/* Video grid */}
            <XStack flexWrap="wrap" gap="$4">
                {videos.map(v => {
                    const ytId = extractYouTubeId(v.youtubeUrl)
                    const isPlaying = playingId === v.id

                    return (
                        <YStack key={v.id} flex={1} minWidth={300} maxWidth="49%">
                            <Card>
                                <YStack width="100%" aspectRatio={16 / 9} position="relative" overflow="hidden" bg="$surfaceDim">
                                    {isPlaying && ytId ? (
                                        // @ts-ignore
                                        <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                    ) : (
                                        <>
                                            {/* @ts-ignore */}
                                            <img src={v.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {ytId && (
                                                <YStack position="absolute" top={0} left={0} right={0} bottom={0}
                                                    bg="rgba(0,0,0,0.15)" alignItems="center" justifyContent="center"
                                                    cursor="pointer" hoverStyle={{ bg: 'rgba(0,0,0,0.35)' }}
                                                    onPress={() => setPlayingId(v.id)}>
                                                    <YStack bg="rgba(255,255,255,0.95)" width={56} height={56} borderRadius={28} alignItems="center" justifyContent="center">
                                                        <Play size={24} color="$primary" />
                                                    </YStack>
                                                </YStack>
                                            )}
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

                                <YStack p="$3" gap="$2">
                                    <XStack justifyContent="space-between" alignItems="flex-start">
                                        <YStack flex={1} gap="$1">
                                            <SizableText size="$4" fontWeight="700" color="$textMain">{v.title}</SizableText>
                                            <XStack gap="$2" alignItems="center" flexWrap="wrap">
                                                <SizableText size="$2" color="$textMuted">{v.views} views · {v.publishedAt}</SizableText>
                                                <Badge label={v.status === 'published' ? '발행됨' : '임시저장'}
                                                    color={v.status === 'published' ? '$success' : '$textMuted'}
                                                    bg={v.status === 'published' ? '$successContainer' : '$surfaceContainerLow'} />
                                            </XStack>
                                        </YStack>
                                        <XStack gap="$1">
                                            {isPlaying && (
                                                <Button size="$2" circular bg="$surfaceHover" icon={<X size={12} color="$textMuted" />}
                                                    onPress={() => setPlayingId(null)} />
                                            )}
                                            <Button size="$2" circular bg="$surfaceHover" icon={<Edit3 size={12} color="$primary" />}
                                                onPress={() => openEdit(v)} />
                                            <Button size="$2" circular bg="$surfaceHover" icon={<Trash2 size={12} color="$error" />}
                                                onPress={() => deleteVideo(v.id)} />
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
                <YStack flex={1} minWidth={300} gap="$4">
                    <Card p="$4" gap="$3">
                        <SizableText size="$3" fontWeight="600" color="$textMain">Display Mode</SizableText>
                        <XStack gap="$2">
                            {(['circular', 'bars', 'wave'] as const).map(m => (
                                <YStack key={m} flex={1}
                                    bg={vizMode === m ? '$primaryContainer' : '$surfaceContainerLow'}
                                    borderWidth={2} borderColor={vizMode === m ? '$primary' : 'transparent'}
                                    borderRadius="$3" p="$3" alignItems="center" gap="$1" cursor="pointer"
                                    onPress={() => setVizMode(m)} hoverStyle={{ borderColor: '$primary' }}>
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
                    <Card p="$4" gap="$3">
                        <SizableText size="$3" fontWeight="600" color="$textMain">Color Theme</SizableText>
                        <XStack gap="$2" flexWrap="wrap">
                            {Object.entries(THEMES).map(([name, theme]) => (
                                <YStack key={name} flex={1} minWidth={100}
                                    bg={vizTheme === name ? '$primaryContainer' : '$surfaceContainerLow'}
                                    borderWidth={2} borderColor={vizTheme === name ? '$primary' : 'transparent'}
                                    borderRadius="$3" p="$3" alignItems="center" gap="$2" cursor="pointer"
                                    onPress={() => setVizTheme(name)} hoverStyle={{ borderColor: '$primary' }}>
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
                <YStack flex={1} minWidth={340}>
                    <Card overflow="hidden">
                        <YStack p="$3" pb="$0">
                            <SizableText size="$3" fontWeight="600" color="$textMain">Live Preview</SizableText>
                        </YStack>
                        <AudioVisualizer trackTitle="Preview Mode" artist="Settings above" mode={vizMode} theme={vizTheme} />
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
    const [artistName, setArtistName] = useState('iBiG media')
    const [bio, setBio] = useState('I Believe in God even in the Digital Age. 디지털 시대에도 변치 않는 믿음의 길을 만듭니다.')
    const [website, setWebsite] = useState('https://giljabi.com')
    const [profileImg, setProfileImg] = useState('https://picsum.photos/seed/artist/160/160')
    const [saved, setSaved] = useState(false)
    const [links, setLinks] = useState<Record<string, string>>({})

    const [toggles, setToggles] = useState({
        visualizer: true, autoplay: false, privateTracks: false, stats: true,
    })

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <SizableText size="$5" fontWeight="700" color="$textMain">Portfolio Settings</SizableText>
                {saved && <Badge label="저장됨!" color="$success" bg="$successContainer" />}
            </XStack>

            <XStack gap="$4" flexWrap="wrap">
                <Card flex={1} minWidth={320} p="$5" gap="$4">
                    <XStack alignItems="center" gap="$2">
                        <Music size={16} color="$primary" />
                        <SizableText size="$4" fontWeight="700" color="$textMain">아티스트 프로필</SizableText>
                    </XStack>
                    <Separator borderColor="$borderLight" />

                    <XStack gap="$4" alignItems="center">
                        <YStack width={80} height={80} borderRadius="$full" overflow="hidden" bg="$surfaceContainerLow">
                            {/* @ts-ignore */}
                            <img src={profileImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </YStack>
                        <YStack gap="$2">
                            <Button size="$3" bg="$primaryContainer" borderRadius="$3" icon={<Upload size={14} color="$primary" />}
                                onPress={() => {
                                    // TODO: real file upload
                                    const input = document.createElement('input')
                                    input.type = 'file'; input.accept = 'image/*'
                                    input.onchange = (e: any) => {
                                        if (e.target.files?.[0]) setProfileImg(URL.createObjectURL(e.target.files[0]))
                                    }
                                    input.click()
                                }}>
                                <SizableText color="$primary" fontWeight="600" size="$2">사진 변경</SizableText>
                            </Button>
                            <Button size="$3" chromeless icon={<Sparkles size={14} color="$primary" />}
                                onPress={async () => {
                                    try {
                                        const data = await apiPost<{ imageUrl: string }>('/api/portfolio/ai-thumbnail', { prompt: `${artistName} profile photo, professional musician portrait` })
                                        setProfileImg(data.imageUrl)
                                    } catch { alert('AI 프로필 생성 실패') }
                                }}>
                                <SizableText color="$primary" fontWeight="600" size="$2">AI 프로필 생성</SizableText>
                            </Button>
                        </YStack>
                    </XStack>

                    <YStack gap="$3">
                        <YStack gap="$1">
                            <SizableText size="$2" color="$textMuted">아티스트명</SizableText>
                            <Input value={artistName} onChangeText={setArtistName} bg="$surfaceContainerLow" borderColor="$borderLight" />
                        </YStack>
                        <YStack gap="$1">
                            <SizableText size="$2" color="$textMuted">소개글</SizableText>
                            <TextArea value={bio} onChangeText={setBio} bg="$surfaceContainerLow" borderColor="$borderLight" numberOfLines={3} />
                        </YStack>
                        <YStack gap="$1">
                            <SizableText size="$2" color="$textMuted">웹사이트</SizableText>
                            <Input value={website} onChangeText={setWebsite} bg="$surfaceContainerLow" borderColor="$borderLight" />
                        </YStack>
                    </YStack>
                    <Button alignSelf="flex-end" bg="$primary" borderRadius="$3" icon={<Save size={14} color="white" />} onPress={handleSave}>
                        <SizableText color="white" fontWeight="600">저장</SizableText>
                    </Button>
                </Card>

                <YStack flex={1} minWidth={280} gap="$4">
                    <Card p="$5" gap="$4">
                        <XStack alignItems="center" gap="$2">
                            <ExternalLink size={16} color="$primary" />
                            <SizableText size="$4" fontWeight="700" color="$textMain">소셜 & 스트리밍</SizableText>
                        </XStack>
                        <Separator borderColor="$borderLight" />
                        {[
                            { key: 'youtube', label: 'YouTube', icon: '🎬', ph: 'youtube.com/c/...' },
                            { key: 'soundcloud', label: 'SoundCloud', icon: '🎵', ph: 'soundcloud.com/...' },
                            { key: 'spotify', label: 'Spotify', icon: '🎧', ph: 'open.spotify.com/...' },
                            { key: 'apple', label: 'Apple Music', icon: '🍎', ph: 'music.apple.com/...' },
                            { key: 'instagram', label: 'Instagram', icon: '📷', ph: 'instagram.com/...' },
                        ].map(l => (
                            <XStack key={l.key} gap="$2" alignItems="center">
                                <SizableText size="$4" width={28} textAlign="center">{l.icon}</SizableText>
                                <YStack flex={1} gap="$0.5">
                                    <SizableText size="$1" color="$textMuted" fontWeight="600">{l.label}</SizableText>
                                    <Input size="$3" value={links[l.key] || ''} onChangeText={v => setLinks({ ...links, [l.key]: v })}
                                        placeholder={l.ph} bg="$surfaceContainerLow" borderColor="$borderLight" />
                                </YStack>
                            </XStack>
                        ))}
                        <Button alignSelf="flex-end" bg="$primary" borderRadius="$3" icon={<Save size={14} color="white" />} onPress={handleSave}>
                            <SizableText color="white" fontWeight="600">저장</SizableText>
                        </Button>
                    </Card>

                    <Card p="$5" gap="$3">
                        <XStack alignItems="center" gap="$2">
                            <Palette size={16} color="$primary" />
                            <SizableText size="$4" fontWeight="700" color="$textMain">표시 설정</SizableText>
                        </XStack>
                        <Separator borderColor="$borderLight" />
                        {([
                            { key: 'visualizer' as const, label: 'Now Playing 비주얼라이저 표시' },
                            { key: 'autoplay' as const, label: '자동 재생 활성화' },
                            { key: 'privateTracks' as const, label: '비공개 트랙 표시' },
                            { key: 'stats' as const, label: '방문자 통계 표시' },
                        ]).map(opt => (
                            <XStack key={opt.key} justifyContent="space-between" alignItems="center" py="$1">
                                <SizableText size="$3" color="$textMain">{opt.label}</SizableText>
                                <XStack width={44} height={24} borderRadius={12}
                                    bg={toggles[opt.key] ? '$primary' : '$outlineVariant'}
                                    alignItems="center" px="$0.5" cursor="pointer"
                                    justifyContent={toggles[opt.key] ? 'flex-end' : 'flex-start'}
                                    onPress={() => setToggles({ ...toggles, [opt.key]: !toggles[opt.key] })}>
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
