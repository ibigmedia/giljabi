import { PostDetailScreen } from 'app/features/post/detail-screen'
import { Stack, useLocalSearchParams } from 'expo-router'

export default function Screen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Post Detail',
                    presentation: 'card',
                }}
            />
            <PostDetailScreen id={id} />
        </>
    )
}
