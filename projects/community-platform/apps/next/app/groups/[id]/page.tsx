"use client"

import { GroupDetailScreen } from 'app/features/group/detail-screen'

export default function Page({ params }: { params: { id: string } }) {
  return <GroupDetailScreen id={params.id} />
}
