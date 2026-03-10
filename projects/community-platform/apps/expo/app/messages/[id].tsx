import { ChatDetailScreen } from 'app/features/chat/detail-screen'
import { Stack, useLocalSearchParams } from 'expo-router'

export default function Screen() {
    const { id } = useLocalSearchParams<{ id: string }>()

    return (
        <>
            <Stack.Screen
                options={{
                    title: '채팅방',
                }}
            />
            <ChatDetailScreen id={id as string} />
        </>
    )
}
