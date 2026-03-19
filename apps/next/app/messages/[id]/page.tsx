'use client'

import { ChatDetailScreen } from 'app/features/chat/detail-screen'
import { useParams } from 'solito/navigation'

export default function Page() {
    const params = useParams<{ id: string }>()
    if (!params?.id) return null
    return <ChatDetailScreen id={params.id} />
}
