import { AuthScreen } from 'app/features/auth/screen'
import { Stack } from 'expo-router'

export default function LoginScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Login',
                    headerShown: false,
                }}
            />
            <AuthScreen />
        </>
    )
}
