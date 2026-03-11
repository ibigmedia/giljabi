'use client'

import { BlogDetailScreen } from 'app/features/blog/detail-screen'
import { useParams } from 'next/navigation'

export default function BlogDetailPage() {
    const params = useParams()
    const id = params?.id as string
    
    return <BlogDetailScreen id={id} />
}
