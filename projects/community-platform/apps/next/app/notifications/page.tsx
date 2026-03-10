'use client'

import { NotificationsScreen } from 'app/features/notifications/screen'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>알림</title>
      </Head>
      <NotificationsScreen />
    </>
  )
}
