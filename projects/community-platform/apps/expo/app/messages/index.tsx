import { ChatListScreen } from 'app/features/chat/list-screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: '메시지',
                }}
            />
            <ChatListScreen />
        </>
    )
}
