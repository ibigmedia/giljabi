import { NotificationsScreen } from 'app/features/notifications/screen'
import { Stack } from 'expo-router'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '알림',
        }}
      />
      <NotificationsScreen />
    </>
  )
}
