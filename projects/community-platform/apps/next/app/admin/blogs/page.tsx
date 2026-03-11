'use client'

import React from 'react'
import { YStack, SizableText } from '@my/ui'
import { AdminBlogsScreen } from 'app/features/admin/blogs-screen'

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

export default function AdminBlogsPage() {
    return (
        <ErrorBoundary>
            <AdminBlogsScreen />
        </ErrorBoundary>
    )
}
