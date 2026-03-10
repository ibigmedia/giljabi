import React from 'react'
import { ProfileScreen } from '../profile/screen'

export function UserDetailScreen({ id }: { id: string }) {
  if (!id) {
    return null
  }

  return <ProfileScreen id={id} />
}
