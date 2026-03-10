'use client'

import {
  Anchor,
  Button,
  H1,
  Paragraph,
  Separator,
  Sheet,
  SwitchThemeButton,
  useToastController,
  XStack,
  YStack,
} from '@my/ui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { Platform } from 'react-native'

export function HomeScreen({ onLinkPress, onLoginPress, onFeedPress, onProfilePress, onDirectoryPress, onSearchPress, onNotificationsPress, onGroupsPress }: { onLinkPress?: () => void, onLoginPress?: () => void, onFeedPress?: () => void, onProfilePress?: () => void, onDirectoryPress?: () => void, onSearchPress?: () => void, onNotificationsPress?: () => void, onGroupsPress?: () => void }) {

  return (
    <YStack
      flex={1}
      justify="center"
      items="center"
      gap="$8"
      p="$4"
      bg="$background"
    >
      <XStack
        position="absolute"
        width="100%"
        t="$6"
        gap="$6"
        justify="center"
        flexWrap="wrap"
        $sm={{ position: 'relative', t: 0 }}
      >
        {Platform.OS === 'web' && <SwitchThemeButton />}
      </XStack>

      <YStack gap="$4">
        <H1
          text="center"
          color="$color12"
        >
          커뮤니티 플랫폼 MVP
        </H1>
        <Paragraph
          color="$color10"
          text="center"
        >
          BuddyBoss 벤치마킹 기반의 독립형 환경입니다.
        </Paragraph>
        <Separator />
      </YStack>

      <XStack gap="$4" flexWrap="wrap" justifyContent="center">
        <Button onPress={onLoginPress}>
          로그인 / 회원가입
        </Button>
        <Button onPress={onFeedPress} bg="$primaryLight">
          커뮤니티 피드 들어가기
        </Button>
        <Button onPress={onProfilePress} bg="$color5">
          내 프로필
        </Button>
        <Button onPress={onDirectoryPress} bg="$color5">
          멤버 디렉토리
        </Button>
        <Button onPress={onSearchPress} bg="$color5">
          통합 검색
        </Button>
        <Button onPress={onNotificationsPress} bg="$color5">
          알림
        </Button>
        <Button onPress={onGroupsPress} bg="$color5">
          그룹 (Groups)
        </Button>
        <Button onPress={onLinkPress}>
          프로필 보기 샘플 (네이트)
        </Button>
      </XStack>

      <SheetDemo />
    </YStack>
  )
}

function SheetDemo() {
  const toast = useToastController()

  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(0)

  return (
    <>
      <Button
        size="$6"
        icon={open ? ChevronDown : ChevronUp}
        circular
        onPress={() => setOpen((x) => !x)}
      />
      <Sheet
        modal
        transition="medium"
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          bg="$shadow4"
          transition="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle bg="$color8" />
        <Sheet.Frame
          items="center"
          justify="center"
          gap="$10"
          bg="$color2"
        >
          <XStack gap="$2">
            <Paragraph text="center">Made by</Paragraph>
            <Anchor
              color="$blue10"
              href="https://twitter.com/natebirdman"
              target="_blank"
            >
              @natebirdman,
            </Anchor>
            <Anchor
              color="$blue10"
              href="https://github.com/tamagui/tamagui"
              target="_blank"
              rel="noreferrer"
            >
              give it a ⭐️
            </Anchor>
          </XStack>

          <Button
            size="$6"
            circular
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
              toast.show('Sheet closed!', {
                message: 'Just showing how toast works...',
              })
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
