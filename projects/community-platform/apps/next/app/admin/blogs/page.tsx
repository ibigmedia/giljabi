'use client'

import React from 'react'
import { YStack, SizableText } from '@my/ui'

class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: string }
> {
    constructor(props: any) {
        super(props)
        this.state = { hasError: false, error: '' }
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.message + '\n' + error.stack }
    }
    render() {
        if (this.state.hasError) {
            return (
                <YStack p="$6" gap="$4">
                    <SizableText size="$6" color="$red10" fontWeight="bold">Blog Page Error</SizableText>
                    <SizableText size="$3" color="$textMuted" whiteSpace="pre-wrap">{this.state.error}</SizableText>
                </YStack>
            )
        }
        return this.props.children
    }
}

// Lazy import to catch module-level errors
const AdminBlogsScreen = React.lazy(() =>
    import('app/features/admin/blogs-screen').then(mod => ({ default: mod.AdminBlogsScreen }))
)

export default function AdminBlogsPage() {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={
                <YStack p="$6">
                    <SizableText color="$textMuted">블로그 관리 로딩 중...</SizableText>
                </YStack>
            }>
                <AdminBlogsScreen />
            </React.Suspense>
        </ErrorBoundary>
    )
}
