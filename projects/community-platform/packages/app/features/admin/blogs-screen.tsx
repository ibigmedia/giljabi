import { useState } from 'react'
import { YStack, XStack, ScrollView, H3, Paragraph, Avatar, Button, Separator, Input, Spinner, SizableText } from '@my/ui'
import { MessageSquare, Trash, PenTool, Sparkles } from '@tamagui/lucide-icons'
import { useBlogPosts, useDeleteBlogPost, useCreateBlogPost, useGenerateAIBlog } from '../../hooks/useBlogs'
import type { BlogPost } from '../../hooks/useBlogs'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { useRouter } from 'solito/navigation'

export function AdminBlogsScreen() {
    const { data: posts, isLoading } = useBlogPosts()
    const { mutate: deletePost } = useDeleteBlogPost()
    const { mutate: createPost, isPending: isCreating } = useCreateBlogPost()
    const { mutate: generateAI, isPending: isGeneratingAI } = useGenerateAIBlog()
    const { data: currentUserProfile } = useCurrentUserProfile()
    
    const router = useRouter()
    
    const [showNewForm, setShowNewForm] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [prompt, setPrompt] = useState('')

    const handleCreate = () => {
        if (!title.trim() || !currentUserProfile?.id) return
        createPost({ 
            title, 
            content, 
            authorId: currentUserProfile.id,
            isPublished: true 
        }, {
            onSuccess: () => {
                setTitle('')
                setContent('')
                setShowNewForm(false)
            }
        })
    }

    const handleAIGenerate = () => {
        if (!prompt.trim()) return
        generateAI(prompt, {
            onSuccess: (data) => {
                setTitle(data.title)
                setContent(data.content)
            }
        })
    }

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack maxWidth={1000} alignSelf="center" width="100%" px="$4" py="$8" gap="$6">
                <XStack justifyContent="space-between" alignItems="center">
                    <H3 color="$textMain" fontWeight="bold">블로그 관리 (CMS)</H3>
                    <Button 
                        bg="$primary" 
                        icon={<PenTool size={16} color="white" />} 
                        onPress={() => setShowNewForm(!showNewForm)}
                    >
                        <SizableText color="white">새 글 작성</SizableText>
                    </Button>
                </XStack>

                {showNewForm && (
                    <YStack bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$borderLight" gap="$4">
                        <H3 size="$5" fontWeight="bold" color="$textMain">새 블로그 포스트 작성</H3>
                        
                        <YStack gap="$2" bg="$backgroundBody" p="$3" borderRadius="$2">
                            <SizableText color="$textMain" fontWeight="bold" size="$3" mb="$1">💡 AI 작성 어시스턴트</SizableText>
                            <XStack gap="$2" alignItems="center">
                                <Input 
                                    flex={1}
                                    placeholder="어떤 주제로 글을 작성할까요? (ex: 디지털 사역의 미래)"
                                    value={prompt}
                                    onChangeText={setPrompt}
                                    size="$3"
                                />
                                <Button 
                                    bg="$color5" 
                                    icon={isGeneratingAI ? <Spinner /> : <Sparkles size={16} color="$primary" />} 
                                    onPress={handleAIGenerate}
                                    disabled={!prompt.trim() || isGeneratingAI}
                                >
                                    {isGeneratingAI ? <Spinner /> : <SizableText color="$textMain">AI 자동 생성</SizableText>}
                                </Button>
                            </XStack>
                        </YStack>

                        <Separator borderColor="$borderLight" my="$2" />

                        <Input 
                            placeholder="글 제목" 
                            value={title} 
                            onChangeText={setTitle} 
                            bg="$backgroundBody"
                            size="$4"
                            fontWeight="bold"
                        />
                        <Input 
                            placeholder="본문 내용 (인라인 에디터에서 추후 수정 가능)" 
                            value={content} 
                            onChangeText={setContent} 
                            bg="$backgroundBody"
                            size="$4"
                            multiline
                            numberOfLines={6}
                        />
                        
                        <XStack justifyContent="flex-end" gap="$2">
                            <Button bg="transparent" onPress={() => setShowNewForm(false)}><SizableText color="$textMuted">취소</SizableText></Button>
                            <Button 
                                bg="$primary" 
                                disabled={!title.trim() || isCreating || !currentUserProfile}
                                onPress={handleCreate}
                            >
                                {isCreating ? <Spinner /> : <SizableText color="white">발행하기</SizableText>}
                            </Button>
                        </XStack>
                    </YStack>
                )}

                <YStack bg="$surface" borderRadius="$card" borderWidth={1} borderColor="$borderLight" overflow="hidden">
                    <XStack bg="$backgroundBody" p="$3" borderBottomWidth={1} borderColor="$borderLight">
                        <Paragraph flex={1} fontWeight="bold" color="$textMuted">제목</Paragraph>
                        <Paragraph width={120} fontWeight="bold" color="$textMuted">작성자</Paragraph>
                        <Paragraph width={100} fontWeight="bold" color="$textMuted">상태</Paragraph>
                        <Paragraph width={80} textAlign="center" fontWeight="bold" color="$textMuted">관리</Paragraph>
                    </XStack>

                    {isLoading ? (
                        <YStack p="$6" alignItems="center">
                            <Spinner color="$primary" />
                        </YStack>
                    ) : posts?.length === 0 ? (
                        <YStack p="$6" alignItems="center">
                            <Paragraph color="$textMuted">등록된 블로그 게시물이 없습니다.</Paragraph>
                        </YStack>
                    ) : (
                        posts?.map((post: BlogPost) => (
                            <XStack key={post.id} p="$3" borderBottomWidth={1} borderColor="$borderLight" alignItems="center">
                                <YStack flex={1} onPress={() => router.push(`/blog/${post.id}`)} cursor="pointer">
                                    <Paragraph fontWeight="bold" color="$textMain" hoverStyle={{ color: '$primary' }}>
                                        {post.title}
                                    </Paragraph>
                                    <Paragraph size="$2" color="$textMuted" numberOfLines={1}>
                                        {post.excerpt || post.content?.slice(0, 50) || ''}
                                    </Paragraph>
                                </YStack>
                                <XStack width={120} gap="$2" alignItems="center">
                                    <Avatar circular size="$2" bg="$color5">
                                        <Avatar.Fallback bg="$color5" />
                                    </Avatar>
                                    <Paragraph size="$2" color="$textMain">{post.author?.username || 'Unknown'}</Paragraph>
                                </XStack>
                                <Paragraph width={100} size="$2" color={post.isPublished ? "$primary" : "$textMuted"}>
                                    {post.isPublished ? '발행됨' : '임시저장'}
                                </Paragraph>
                                <XStack width={80} justifyContent="center">
                                    <Button 
                                        icon={<Trash size={16} color="$red10" />} 
                                        size="$2" 
                                        circular 
                                        bg="transparent" 
                                        hoverStyle={{ bg: '$red2' }}
                                        onPress={() => deletePost(post.id)}
                                    />
                                </XStack>
                            </XStack>
                        ))
                    )}
                </YStack>
            </YStack>
        </ScrollView>
    )
}
