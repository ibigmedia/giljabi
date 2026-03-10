import { ProfileScreen } from 'app/features/profile/screen'
import Head from 'next/head'

export default function Page() {
    return (
        <>
            <Head>
                <title>프로필</title>
            </Head>
            <ProfileScreen />
        </>
    )
}
