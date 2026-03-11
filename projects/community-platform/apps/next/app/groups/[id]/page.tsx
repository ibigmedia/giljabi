"use client"

import { use } from 'react'
import { GroupDetailScreen } from 'app/features/group/detail-screen'

export default function Page(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  return <GroupDetailScreen id={params.id} />
}
