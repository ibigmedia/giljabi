import { CreateGroupScreen } from 'app/features/group/create-screen'
import { Stack } from 'expo-router'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Group',
        }}
      />
      <CreateGroupScreen />
    </>
  )
}
