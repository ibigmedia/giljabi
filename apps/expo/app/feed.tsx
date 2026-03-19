import { FeedScreen } from 'app/features/feed/screen'
import { Stack } from 'expo-router'

export default function FeedScreenRoute() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Activity Feed',
                }}
            />
            <FeedScreen />
        </>
    )
}
