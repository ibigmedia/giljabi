import { AuthScreen } from 'app/features/auth/screen'
import Head from 'next/head'

export default function LoginPage() {
    return (
        <>
            <Head>
                <title>Sign In</title>
            </Head>
            <AuthScreen />
        </>
    )
}
