import { SearchScreen } from 'app/features/search/screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Search',
                }}
            />
            <SearchScreen />
        </>
    )
}
