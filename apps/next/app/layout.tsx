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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            word-break: keep-all;
            overflow-wrap: break-word;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          * { -webkit-tap-highlight-color: transparent; }
        `}} />
      </head>
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
