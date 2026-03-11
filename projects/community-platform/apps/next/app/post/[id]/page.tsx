'use client'

import { use } from 'react'
import { PostDetailScreen } from 'app/features/post/detail-screen'

export default function Page(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    return <PostDetailScreen id={params.id} />
}
