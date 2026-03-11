import type { Metadata } from 'next'
import { NextTamaguiProvider } from 'app/provider/NextTamaguiProvider'
import { AppLayout } from 'app/features/common/app-layout'
import React from 'react'

export const metadata: Metadata = {
  title: 'Giljabi Community',
  description: 'Community platform powered by Tamagui and Next.js',
  icons: '/favicon.ico',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTamaguiProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </NextTamaguiProvider>
      </body>
    </html>
  )
}
