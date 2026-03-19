'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { YStack, XStack, ScrollView, H2, SizableText, Button } from '@my/ui'
import { Play, Pause, X, Music, Video, Users, ArrowRight, MessageCircle, BookOpen } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'

// --- Types ---
type PortfolioRelease = {
  id: string; title: string; artist: string; year: number; type: string
  coverUrl?: string; status: string; tracks?: any[]
}
type PortfolioVideo = {
  id: string; title: string; youtubeUrl?: string; thumbnailUrl?: string
  views: number; duration: string; status: string
}

// --- Helpers ---
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

// --- Data fetching ---
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

// --- Media player hook ---
type PlayingMedia =
  | { type: 'audio'; trackTitle: string; artist: string; audioUrl: string; coverUrl?: string; releaseTitle?: string }
  | { type: 'youtube'; videoId: string; title: string }
  | null

function useMediaPlayer() {
  const [playing, setPlaying] = useState<PlayingMedia>(null)
  const [audioPaused, setAudioPaused] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    try {
      const ch = new BroadcastChannel('giljabi-media')
      channelRef.current = ch
      ch.onmessage = (e) => {
        if (e.data === 'stop') {
          if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
          setPlaying(null); setAudioPaused(false)
        }
      }
      return () => ch.close()
    } catch { /* BroadcastChannel not supported */ }
  }, [])

  const broadcastStop = () => { try { channelRef.current?.postMessage('stop') } catch {} }

  const playAudio = useCallback((track: { title: string; audioUrl: string; artist?: string; coverUrl?: string; releaseTitle?: string }) => {
    broadcastStop()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    const audio = new Audio(track.audioUrl)
    audioRef.current = audio
    audio.play().catch(() => {})
    audio.onended = () => { setPlaying(null); setAudioPaused(false) }
    setPlaying({ type: 'audio', trackTitle: track.title, artist: track.artist || '', audioUrl: track.audioUrl, coverUrl: track.coverUrl, releaseTitle: track.releaseTitle })
    setAudioPaused(false)
  }, [])

  const playYouTube = useCallback((videoId: string, title: string) => {
    broadcastStop()
    if (audioRef.current) { audioRef.current.pause() }
    setPlaying({ type: 'youtube', videoId, title })
    setAudioPaused(false)
  }, [])

  const togglePause = useCallback(() => {
    if (playing?.type === 'audio' && audioRef.current) {
      if (audioPaused) { audioRef.current.play().catch(() => {}); setAudioPaused(false) }
      else { audioRef.current.pause(); setAudioPaused(true) }
    }
  }, [playing, audioPaused])

  const stop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    setPlaying(null); setAudioPaused(false)
  }, [])

  return { playing, audioPaused, playAudio, playYouTube, togglePause, stop }
}

// --- Sticky audio bar (portal) ---
function AudioBar({ playing, audioPaused, togglePause, stop }: {
  playing: PlayingMedia; audioPaused: boolean; togglePause: () => void; stop: () => void
}) {
  if (!playing || playing.type !== 'audio') return null
  return createPortal(
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #1a237e, #283593)', padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 12, color: '#fff',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.3)',
    }}>
      {playing.coverUrl && (
        <img src={playing.coverUrl} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {playing.trackTitle}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>{playing.artist}</div>
      </div>
      <button onClick={togglePause} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        {audioPaused ? <Play size={18} /> : <Pause size={18} />}
      </button>
      <button onClick={stop} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <X size={16} />
      </button>
    </div>,
    document.body
  )
}

// --- YouTube modal (portal) ---
function YouTubeModal({ playing, stop }: { playing: PlayingMedia; stop: () => void }) {
  if (!playing || playing.type !== 'youtube') return null
  return createPortal(
    <div onClick={stop} style={{
      position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 720, aspectRatio: '16/9', position: 'relative' }}>
        <iframe
          src={`https://www.youtube.com/embed/${playing.videoId}?autoplay=1`}
          allow="autoplay; encrypted-media" allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
        />
        <button onClick={stop} style={{
          position: 'absolute', top: -40, right: 0, background: 'none', border: 'none',
          color: '#fff', cursor: 'pointer', fontSize: 28,
        }}>✕</button>
      </div>
    </div>,
    document.body
  )
}

// --- CSS ---
const PAGE_CSS = `
  .home-hero {
    background: linear-gradient(160deg, #0a1628 0%, #1a3a5c 100%);
    padding: 80px 24px 60px;
    text-align: center;
  }
  .card-scroll { display: flex; gap: 16px; overflow-x: auto; padding: 4px 0 12px; scroll-snap-type: x mandatory; }
  .card-scroll::-webkit-scrollbar { height: 4px; }
  .card-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }
  .release-card, .video-card, .community-card {
    flex-shrink: 0; scroll-snap-align: start; border-radius: 14px;
    overflow: hidden; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
  }
  .release-card:hover, .video-card:hover, .community-card:hover {
    transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  .release-card { width: 180px; background: var(--color-surfaceContainerLow, #f5f5f5); }
  .video-card { width: 280px; background: var(--color-surfaceContainerLow, #f5f5f5); }
  .community-card { width: 240px; background: var(--color-surfaceContainerLow, #f5f5f5); padding: 24px 20px; }
  .play-overlay {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.35); opacity: 0; transition: opacity 0.2s;
  }
  .release-card:hover .play-overlay, .video-card:hover .play-overlay { opacity: 1; }
`

// --- Main component ---
export function HomeScreen() {
  const router = useRouter()
  const { releases, videos, loaded } = usePortfolioData()
  const media = useMediaPlayer()

  const handlePlayFirstTrack = (release: PortfolioRelease) => {
    const track = release.tracks?.[0]
    if (track?.audioUrl) {
      media.playAudio({ title: track.title, audioUrl: track.audioUrl, artist: release.artist, coverUrl: release.coverUrl, releaseTitle: release.title })
    } else {
      router.push('/portfolio')
    }
  }

  const handlePlayVideo = (video: PortfolioVideo) => {
    const vid = video.youtubeUrl ? extractYouTubeId(video.youtubeUrl) : null
    if (vid) media.playYouTube(vid, video.title)
  }

  const communityItems = [
    { icon: MessageCircle, title: '소통', desc: '실시간 채팅과 피드로 음악인들과 교류하세요' },
    { icon: BookOpen, title: '블로그', desc: '음악 이야기와 제작 노하우를 공유하세요' },
    { icon: Users, title: '그룹', desc: '관심사가 같은 뮤지션들과 함께하세요' },
  ]

  return (
    <YStack flex={1}>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      {/* Hero */}
      <div className="home-hero">
        <YStack maxWidth={960} alignSelf="center" gap="$4" alignItems="center" width="100%">
          <SizableText size="$3" color="rgba(255,255,255,0.6)" fontWeight="500" letterSpacing={2}>
            GILJABI MUSIC MINISTRY
          </SizableText>
          <SizableText size="$9" color="#fff" fontWeight="800" textAlign="center" lineHeight={48}>
            음악으로 하나님의{'\n'}사랑을 전합니다
          </SizableText>
          <SizableText size="$4" color="rgba(255,255,255,0.75)" textAlign="center" maxWidth={480}>
            길잡이 뮤직 커뮤니티에서 함께 찬양하고, 나누고, 성장하세요
          </SizableText>
          <XStack gap="$3" marginTop="$4" flexWrap="wrap" justifyContent="center">
            <Button
              size="$4" backgroundColor="#fff" color="#0a1628" fontWeight="700"
              borderRadius={24} pressStyle={{ opacity: 0.85 }}
              onPress={() => router.push('/feed')}
            >
              시작하기
            </Button>
            <Button
              size="$4" backgroundColor="transparent" color="#fff" fontWeight="600"
              borderRadius={24} borderWidth={1.5} borderColor="rgba(255,255,255,0.5)"
              pressStyle={{ opacity: 0.85 }}
              onPress={() => router.push('/portfolio')}
            >
              둘러보기
            </Button>
          </XStack>
        </YStack>
      </div>

      {/* Content */}
      <YStack maxWidth={960} alignSelf="center" width="100%" px="$4" gap="$5" paddingVertical="$5">

        {/* Portfolio Section */}
        {loaded && releases.length > 0 && (
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H2 size="$7" color="$onSurface" fontWeight="700">
                <Music size={22} color="$primary" /> 음악
              </H2>
              <Button size="$2" chromeless color="$primary" iconAfter={ArrowRight} onPress={() => router.push('/portfolio')}>
                전체보기
              </Button>
            </XStack>
            <div className="card-scroll">
              {releases.map(release => (
                <div key={release.id} className="release-card" onClick={() => handlePlayFirstTrack(release)}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
                    <img
                      src={release.coverUrl || '/placeholder-album.png'}
                      alt={release.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div className="play-overlay">
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={22} color="#0a1628" fill="#0a1628" />
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {release.title}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                      {release.artist} · {release.year}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </YStack>
        )}

        {/* Video Section */}
        {loaded && videos.length > 0 && (
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H2 size="$7" color="$onSurface" fontWeight="700">
                <Video size={22} color="$primary" /> 영상
              </H2>
              <Button size="$2" chromeless color="$primary" iconAfter={ArrowRight} onPress={() => router.push('/portfolio')}>
                전체보기
              </Button>
            </XStack>
            <div className="card-scroll">
              {videos.map(video => {
                const ytId = video.youtubeUrl ? extractYouTubeId(video.youtubeUrl) : null
                const thumb = video.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '')
                return (
                  <div key={video.id} className="video-card" onClick={() => handlePlayVideo(video)}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                      {thumb && <img src={thumb} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                      <div className="play-overlay">
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={26} color="#fff" fill="#fff" />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {video.title}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                        {video.duration}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </YStack>
        )}

        {/* Community Section */}
        <YStack gap="$3">
          <H2 size="$7" color="$onSurface" fontWeight="700">커뮤니티</H2>
          <div className="card-scroll">
            {communityItems.map(item => {
              const Icon = item.icon
              return (
                <div key={item.title} className="community-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primaryContainer, #e8def8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Icon size={22} color="var(--color-primary, #6750A4)" />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.65, lineHeight: '1.5' }}>{item.desc}</div>
                </div>
              )
            })}
          </div>
        </YStack>
      </YStack>

      {/* Footer */}
      <YStack paddingVertical="$5" px="$4" alignItems="center" opacity={0.5}>
        <SizableText size="$2" textAlign="center">
          &copy; 2025 길잡이 뮤직 커뮤니티
        </SizableText>
      </YStack>

      {/* Media overlays */}
      <AudioBar playing={media.playing} audioPaused={media.audioPaused} togglePause={media.togglePause} stop={media.stop} />
      <YouTubeModal playing={media.playing} stop={media.stop} />
    </YStack>
  )
}
