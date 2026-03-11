'use client'

import { YStack, XStack, ScrollView, Paragraph, Avatar, SizableText } from '@my/ui'
import { ArrowLeft, Edit3, Save, X, Clock, Calendar } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useBlogPost, useUpdateBlogPost } from '../../hooks/useBlogs'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { useState, useEffect } from 'react'
import { Button, Input, Spinner } from 'tamagui'
import { RichEditor, markdownToHtml, htmlToMarkdown } from './rich-editor'

// 블로그 본문 읽기 모드 스타일
const BLOG_READ_CSS = `
.blog-content {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: #1a1a2e;
    line-height: 1.85;
    font-size: 17px;
    word-break: keep-all;
}
.blog-content h1 {
    font-size: 1.9em;
    font-weight: 800;
    margin: 1.4em 0 0.6em;
    color: #1a1a2e;
    line-height: 1.3;
    border-bottom: 2px solid #e8e8f0;
    padding-bottom: 0.4em;
}
.blog-content h2 {
    font-size: 1.45em;
    font-weight: 700;
    margin: 1.3em 0 0.5em;
    color: #2d2d44;
    line-height: 1.35;
}
.blog-content h3 {
    font-size: 1.2em;
    font-weight: 700;
    margin: 1.1em 0 0.4em;
    color: #3d3d5c;
}
.blog-content p {
    margin: 0 0 1.1em;
    line-height: 1.85;
}
.blog-content ul, .blog-content ol {
    margin: 0.6em 0 1.1em;
    padding-left: 1.5em;
}
.blog-content li {
    margin: 0.35em 0;
    line-height: 1.75;
}
.blog-content blockquote {
    margin: 1em 0;
    padding: 1em 1.4em;
    border-left: 4px solid #6366f1;
    background: #f8f7ff;
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: #4a4a6a;
}
.blog-content blockquote p { margin: 0; }
.blog-content strong { font-weight: 700; color: #1a1a2e; }
.blog-content em { font-style: italic; color: #4a4a6a; }
.blog-content code {
    background: #f0f0f8;
    padding: 0.12em 0.35em;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Fira Code', monospace;
}
.blog-content pre {
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 1.1em;
    border-radius: 10px;
    overflow-x: auto;
    margin: 1em 0;
    font-size: 0.9em;
}
.blog-content pre code { background: none; padding: 0; color: inherit; }
.blog-content hr { border: none; border-top: 1px solid #e8e8f0; margin: 2em 0; }
.blog-content a { color: #6366f1; text-decoration: underline; text-underline-offset: 3px; }
.blog-content a:hover { color: #4f46e5; }
.blog-content img { max-width: 100%; border-radius: 10px; margin: 1em 0; }
`

export function BlogDetailScreen({ id }: { id: string }) {
    const router = useRouter()
    const { data: post, isLoading } = useBlogPost(id)
    const { mutate: updatePost, isPending: isUpdating } = useUpdateBlogPost()
    const { data: currentUserProfile } = useCurrentUserProfile()

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editHtml, setEditHtml] = useState('')

    useEffect(() => {
        if (post) {
            setEditTitle(post.title)
            setEditHtml(markdownToHtml(post.content))
        }
    }, [post])

    if (isLoading) {
        return (
            <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    if (!post) {
        return (
            <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody" gap="$3">
                <SizableText color="$onSurface" size="$5">포스트를 찾을 수 없습니다.</SizableText>
                <Button bg="$primaryContainer" borderRadius="$full" onPress={() => router.back()}>
                    <SizableText color="$onPrimaryContainer" fontWeight="600">뒤로 가기</SizableText>
                </Button>
            </YStack>
        )
    }

    const canEdit = currentUserProfile?.id === post.authorId || currentUserProfile?.role === 'ADMIN' || currentUserProfile?.role === 'EDITOR'

    const handleSave = () => {
        if (!editTitle.trim()) return
        const content = htmlToMarkdown(editHtml)
        updatePost({ id, title: editTitle, content }, {
            onSuccess: () => setIsEditing(false)
        })
    }

    const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric'
    })
    const readingTime = Math.max(1, Math.ceil(post.content.length / 500))

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <style dangerouslySetInnerHTML={{ __html: BLOG_READ_CSS }} />

            <YStack maxWidth={780} alignSelf="center" width="100%" px="$4" py="$6" gap="$5">
                {/* Back Button */}
                <XStack
                    cursor="pointer"
                    onPress={() => router.back()}
                    alignItems="center"
                    gap="$2"
                    hoverStyle={{ opacity: 0.7 }}
                    alignSelf="flex-start"
                >
                    <ArrowLeft size={18} color="$onSurfaceVariant" />
                    <SizableText color="$onSurfaceVariant" fontWeight="600" size="$3">블로그 목록</SizableText>
                </XStack>

                {isEditing ? (
                    /* ── Edit Mode with Rich Editor ── */
                    <YStack bg="$surface" borderRadius="$6" elevation="$1" p="$6" gap="$4">
                        <XStack justifyContent="space-between" alignItems="center">
                            <SizableText color="$onSurface" size="$7" fontWeight="700">글 편집</SizableText>
                            <XStack gap="$2">
                                <Button
                                    size="$3"
                                    bg="$surfaceContainerHigh"
                                    borderRadius="$full"
                                    icon={<X size={16} color="$onSurfaceVariant" />}
                                    onPress={() => setIsEditing(false)}
                                >
                                    <SizableText color="$onSurfaceVariant">취소</SizableText>
                                </Button>
                                <Button
                                    size="$3"
                                    bg="$primary"
                                    borderRadius="$full"
                                    icon={isUpdating ? <Spinner size="small" color="white" /> : <Save size={16} color="white" />}
                                    onPress={handleSave}
                                >
                                    <SizableText color="white" fontWeight="600">저장</SizableText>
                                </Button>
                            </XStack>
                        </XStack>
                        <Input
                            size="$5"
                            value={editTitle}
                            onChangeText={setEditTitle}
                            fontWeight="bold"
                            placeholder="제목"
                            borderRadius="$4"
                        />
                        <RichEditor
                            content={editHtml}
                            onChange={setEditHtml}
                            placeholder="본문을 작성하세요..."
                        />
                    </YStack>
                ) : (
                    /* ── Read Mode with Markdown Rendering ── */
                    <YStack gap="$5">
                        {/* Hero Image */}
                        {post.mediaUrl && (
                            <YStack width="100%" height={400} borderRadius="$6" overflow="hidden">
                                {/* @ts-ignore */}
                                <img
                                    src={post.mediaUrl}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </YStack>
                        )}

                        {/* Article Header */}
                        <YStack gap="$4">
                            <SizableText
                                color="$onSurface"
                                size="$7"
                                fontWeight="700"
                                lineHeight={48}
                            >
                                {post.title}
                            </SizableText>

                            {post.excerpt && (
                                <Paragraph
                                    color="$onSurfaceVariant"
                                    size="$5"
                                    lineHeight={28}
                                    fontStyle="italic"
                                    opacity={0.85}
                                >
                                    {post.excerpt}
                                </Paragraph>
                            )}

                            {/* Meta Info Bar */}
                            <XStack
                                gap="$4"
                                alignItems="center"
                                py="$4"
                                borderTopWidth={1}
                                borderBottomWidth={1}
                                borderColor="$outlineVariant"
                                flexWrap="wrap"
                            >
                                <XStack gap="$2.5" alignItems="center">
                                    <Avatar circular size="$4" bg="$primaryContainer">
                                        <Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                        <Avatar.Fallback bg="$primaryContainer" />
                                    </Avatar>
                                    <YStack>
                                        <SizableText size="$4" fontWeight="700" color="$onSurface">
                                            {post.author?.username || '알 수 없음'}
                                        </SizableText>
                                        <SizableText size="$2" color="$onSurfaceVariant">작성자</SizableText>
                                    </YStack>
                                </XStack>

                                <YStack width={1} height={32} bg="$outlineVariant" />

                                <XStack gap="$1.5" alignItems="center">
                                    <Calendar size={15} color="$onSurfaceVariant" />
                                    <SizableText size="$3" color="$onSurfaceVariant">{formattedDate}</SizableText>
                                </XStack>

                                <YStack width={1} height={32} bg="$outlineVariant" />

                                <XStack gap="$1.5" alignItems="center">
                                    <Clock size={15} color="$onSurfaceVariant" />
                                    <SizableText size="$3" color="$onSurfaceVariant">읽는 시간 약 {readingTime}분</SizableText>
                                </XStack>

                                {canEdit && (
                                    <>
                                        <YStack flex={1} />
                                        <Button
                                            size="$3"
                                            bg="$surfaceContainerLow"
                                            borderRadius="$full"
                                            icon={<Edit3 size={16} color="$onSurfaceVariant" />}
                                            onPress={() => setIsEditing(true)}
                                            hoverStyle={{ bg: '$surfaceContainerHigh' }}
                                        >
                                            <SizableText color="$onSurfaceVariant" fontWeight="600">편집</SizableText>
                                        </Button>
                                    </>
                                )}
                            </XStack>
                        </YStack>

                        {/* Article Body */}
                        <YStack
                            bg="$surface"
                            borderRadius="$6"
                            elevation="$0.5"
                            p="$6"
                            $sm={{ px: '$4', py: '$5' }}
                        >
                            <div
                                className="blog-content"
                                dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
                            />
                        </YStack>
                    </YStack>
                )}

                {/* Footer */}
                <YStack alignItems="center" py="$6" borderTopWidth={1} borderColor="$outlineVariant" mt="$4">
                    <SizableText size="$2" color="$onSurfaceVariant">
                        &copy; 2026 - Giljabi.com
                    </SizableText>
                </YStack>
            </YStack>
        </ScrollView>
    )
}
