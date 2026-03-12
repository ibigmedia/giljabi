import { PortfolioDashboardScreen } from 'app/features/portfolio/dashboard-screen'
import Head from 'next/head'

export default function AdminPortfolioPage() {
    return (
        <>
            <Head>
                <title>Portfolio Dashboard</title>
            </Head>
            <PortfolioDashboardScreen />
        </>
    )
}
