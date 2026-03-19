import { GroupDetailScreen } from 'app/features/group/detail-screen'
import { Stack, useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Group Details',
        }}
      />
      <GroupDetailScreen id={id} />
    </>
  )
}
