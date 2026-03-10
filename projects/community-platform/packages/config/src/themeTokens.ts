import { createTokens } from '@tamagui/core'
import { defaultConfig } from '@tamagui/config/v5'

// BuddyBoss 기본 컬러 스타일을 반영한 커스텀 토큰 세트
export const customTokens = createTokens({
    ...defaultConfig.tokens,
    color: {
        primaryLight: '#21759b',   // BuddyBoss 특유의 블루
        primaryDark: '#124157',    // 다크 모드 블루
        backgroundLight: '#f3f4f6',// 페이스북/링크드인 스타일 회색 배경
        surfaceLight: '#ffffff',   // 카드 배경
    },
})
