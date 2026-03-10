import { EditProfileScreen } from 'app/features/profile/edit-screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ title: '프로필 수정', headerShown: false }} />
            <EditProfileScreen />
        </>
    )
}
