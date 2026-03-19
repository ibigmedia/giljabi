import { DirectoryScreen } from 'app/features/directory/screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: '멤버 디렉토리',
                }}
            />
            <DirectoryScreen />
        </>
    )
}
