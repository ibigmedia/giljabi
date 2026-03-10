'use client'

import { HomeScreen } from 'app/features/home/screen'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  return (
    <HomeScreen
      onLinkPress={() => router.push('/user/nate')}
      onLoginPress={() => router.push('/login')}
      onFeedPress={() => router.push('/feed')}
      onProfilePress={() => router.push('/profile')}
      onDirectoryPress={() => router.push('/directory')}
      onSearchPress={() => router.push('/search')}
      onNotificationsPress={() => router.push('/notifications')}
      onGroupsPress={() => router.push('/groups')}
    />
  )
}
