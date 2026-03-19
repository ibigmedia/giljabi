import { FeedScreen } from 'app/features/feed/screen'
import Head from 'next/head'

export default function FeedPage() {
    return (
        <>
            <Head>
                <title>Activity Feed</title>
            </Head>
            <FeedScreen />
        </>
    )
}
