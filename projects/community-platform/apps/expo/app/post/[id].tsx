import { PostDetailScreen } from 'app/features/post/detail-screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Post Detail',
                    presentation: 'card',
                }}
            />
            <PostDetailScreen />
        </>
    )
}
