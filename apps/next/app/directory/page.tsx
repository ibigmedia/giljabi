import { DirectoryScreen } from 'app/features/directory/screen'
import Head from 'next/head'

export default function Page() {
    return (
        <>
            <Head>
                <title>멤버 디렉토리</title>
            </Head>
            <DirectoryScreen />
        </>
    )
}
