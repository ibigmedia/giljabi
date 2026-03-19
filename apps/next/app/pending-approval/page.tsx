'use client'

import { YStack, SizableText, Button } from '@my/ui'
import { useRouter } from 'next/navigation'
import { Clock } from '@tamagui/lucide-icons'

export default function PendingApprovalPage() {
  const router = useRouter()

  return (
    <YStack flex={1} justify="center" items="center" p="$4" bg="$backgroundBody">
      <YStack
        width="100%"
        maxWidth={420}
        gap="$4"
        bg="$surface"
        p="$7"
        borderRadius="$xl"
        elevation="$2"
        alignItems="center"
      >
        <YStack
          bg="$warningContainer"
          borderRadius="$full"
          p="$4"
        >
          <Clock size={40} color="$warning" />
        </YStack>

        <SizableText size="$7" fontWeight="800" color="$onSurface" textAlign="center">
          승인 대기 중
        </SizableText>

        <SizableText color="$onSurfaceVariant" size="$4" textAlign="center" lineHeight="$5">
          가입 신청이 완료되었습니다.{'\n'}
          관리자 승인 후 이용 가능합니다.{'\n'}
          승인까지 잠시 기다려 주세요.
        </SizableText>

        <Button
          mt="$4"
          bg="$primary"
          borderRadius="$button"
          onPress={() => router.push('/login')}
          hoverStyle={{ opacity: 0.9 }}
          size="$5"
          width="100%"
        >
          <SizableText color="white" fontWeight="700">로그인 페이지로 돌아가기</SizableText>
        </Button>
      </YStack>
    </YStack>
  )
}
