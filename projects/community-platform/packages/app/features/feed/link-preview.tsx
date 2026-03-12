'use client'

import { useState, useEffect } from 'react'
import { YStack, XStack, SizableText, Spinner } from '@my/ui'
import { ExternalLink, Play } from '@tamagui/lucide-icons'

interface LinkPreviewData {
    url: string
    title?: string | null
    description?: string | null
    image?: string | null
    siteName?: string | null
    favicon?: string | null
}

// YouTube URL patterns
function getYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]!
    }
    return null
}

// Extract all URLs from text
export function extractUrls(text: string): string[] {
    if (!text) return []
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const matches = text.match(urlRegex)
    return matches ? Array.from(new Set(matches)) : []
}

// YouTube embed component
function YouTubeEmbed({ videoId }: { videoId: string }) {
    return (
        <YStack borderRadius="$4" overflow="hidden" mt="$2">
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '12px',
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video"
                />
            </div>
        </YStack>
    )
}

// Generic link preview card
function LinkPreviewCard({ data }: { data: LinkPreviewData }) {
    const handleClick = (e: any) => {
        e.stopPropagation()
        window.open(data.url, '_blank', 'noopener,noreferrer')
    }

    const domain = (() => {
        try { return new URL(data.url).hostname.replace('www.', '') } catch { return '' }
    })()

    return (
        <YStack
            mt="$2"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$outlineVariant"
            overflow="hidden"
            cursor="pointer"
            hoverStyle={{ borderColor: '$primary', elevation: '$1' }}
            onPress={handleClick}
        >
            {/* OG Image */}
            {data.image && (
                <YStack height={180} overflow="hidden">
                    {/* @ts-ignore */}
                    <img
                        src={data.image}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                </YStack>
            )}

            {/* Info */}
            <YStack p="$3" gap="$1.5" bg="$surfaceContainerLow">
                {/* Site name / domain */}
                <XStack alignItems="center" gap="$2">
                    {data.favicon && (
                        // @ts-ignore
                        <img
                            src={data.favicon}
                            alt=""
                            style={{ width: 16, height: 16, borderRadius: 3 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                    )}
                    <SizableText size="$1" color="$onSurfaceVariant" fontWeight="500">
                        {data.siteName || domain}
                    </SizableText>
                    <ExternalLink size={12} color="$onSurfaceVariant" />
                </XStack>

                {/* Title */}
                {data.title && data.title !== data.url && (
                    <SizableText size="$3" fontWeight="700" color="$onSurface" numberOfLines={2}>
                        {data.title}
                    </SizableText>
                )}

                {/* Description */}
                {data.description && (
                    <SizableText size="$2" color="$onSurfaceVariant" numberOfLines={2} lineHeight={18}>
                        {data.description}
                    </SizableText>
                )}
            </YStack>
        </YStack>
    )
}

// Single link preview with loading
function SingleLinkPreview({ url }: { url: string }) {
    const [data, setData] = useState<LinkPreviewData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)

        fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
            .then(res => res.json())
            .then(d => { if (!cancelled) setData(d) })
            .catch(() => { if (!cancelled) setData({ url, title: url }) })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [url])

    if (loading) {
        return (
            <XStack mt="$2" p="$3" bg="$surfaceContainerLow" borderRadius="$4" gap="$2" alignItems="center">
                <Spinner size="small" color="$primary" />
                <SizableText size="$2" color="$onSurfaceVariant">링크 미리보기 로딩중...</SizableText>
            </XStack>
        )
    }

    if (!data) return null

    return <LinkPreviewCard data={data} />
}

// Main component: renders all link previews for a post
export function PostLinkPreviews({ content }: { content: string }) {
    const urls = extractUrls(content)
    if (urls.length === 0) return null

    // Max 3 previews
    const limitedUrls = urls.slice(0, 3)

    return (
        <YStack>
            {limitedUrls.map((url, i) => {
                const youtubeId = getYouTubeId(url)
                if (youtubeId) {
                    return <YouTubeEmbed key={i} videoId={youtubeId} />
                }
                return <SingleLinkPreview key={i} url={url} />
            })}
        </YStack>
    )
}

// Compose preview: shows removable link previews while composing a post
export function ComposeLinkPreviews({ text, dismissedUrls, onDismiss }: {
    text: string
    dismissedUrls: string[]
    onDismiss: (url: string) => void
}) {
    const urls = extractUrls(text).filter(u => !dismissedUrls.includes(u)).slice(0, 3)
    if (urls.length === 0) return null

    return (
        <YStack gap="$2">
            {urls.map((url, i) => {
                const youtubeId = getYouTubeId(url)
                return (
                    <YStack key={url} position="relative">
                        {/* Dismiss button */}
                        <XStack
                            position="absolute"
                            top={8}
                            right={8}
                            zIndex={10}
                            bg="rgba(0,0,0,0.6)"
                            borderRadius="$full"
                            width={24}
                            height={24}
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            hoverStyle={{ bg: 'rgba(0,0,0,0.8)' }}
                            onPress={() => onDismiss(url)}
                        >
                            <SizableText color="white" size="$1" fontWeight="700">✕</SizableText>
                        </XStack>

                        {youtubeId ? (
                            <YouTubeEmbed videoId={youtubeId} />
                        ) : (
                            <SingleLinkPreview url={url} />
                        )}
                    </YStack>
                )
            })}
        </YStack>
    )
}
