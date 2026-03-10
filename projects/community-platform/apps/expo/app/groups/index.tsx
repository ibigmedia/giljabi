import { GroupListScreen } from 'app/features/group/list-screen'
import { Stack } from 'expo-router'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Groups',
        }}
      />
      <GroupListScreen />
    </>
  )
}
