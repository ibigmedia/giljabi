import { HomeScreen } from 'app/features/home/screen'
import { Stack, useRouter } from 'expo-router'

export default function Screen() {
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
        }}
      />
      <HomeScreen
        onLinkPress={() => router.push('/user/nate')}
        onLoginPress={() => router.push('/login')}
        onFeedPress={() => router.push('/feed')}
        onProfilePress={() => router.push('/profile')}
        onSearchPress={() => router.push('/search')}
        onNotificationsPress={() => router.push('/notifications')}
        onGroupsPress={() => router.push('/groups')}
      />
    </>
  )
}
