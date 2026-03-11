import { createTokens } from '@tamagui/core'
import { defaultConfig } from '@tamagui/config/v5'

// @ts-ignore Tamagui v2 RC 타입 정의에 color 속성이 누락되어 있음
const defaultColors = defaultConfig.tokens.color ?? {}

export const customTokens = createTokens({
    ...defaultConfig.tokens,
    color: {
        ...defaultColors,

        // M3 Primary Tonal Palette
        primary: '#1a6b8a',
        primaryHover: '#15586f',
        primaryPress: '#104858',
        primaryContainer: '#d0e8f2',
        onPrimaryContainer: '#0a3347',

        // M3 Secondary
        secondary: '#4f6169',
        secondaryContainer: '#d2e5ed',
        onSecondaryContainer: '#0b1d24',

        // M3 Tertiary (accent)
        tertiary: '#5d5b7d',
        tertiaryContainer: '#e3dfff',

        // M3 Surface Tonal
        backgroundBody: '#f6f9fb',
        surface: '#ffffff',
        surfaceHover: '#f0f4f7',
        surfaceDim: '#d6dde1',
        surfaceContainerLowest: '#ffffff',
        surfaceContainerLow: '#f0f4f7',
        surfaceContainer: '#eaf0f3',
        surfaceContainerHigh: '#e4ebef',
        surfaceContainerHighest: '#dfe6ea',

        // M3 Text/On-colors
        textMain: '#191c1e',
        textMuted: '#72787e',
        onSurface: '#191c1e',
        onSurfaceVariant: '#40484d',
        outline: '#70787e',
        outlineVariant: '#c0c8cd',

        // M3 Borders
        borderLight: '#e1e8ec',

        // M3 Error
        error: '#ba1a1a',
        errorContainer: '#ffdad6',

        // M3 Success
        success: '#1b6d3c',
        successContainer: '#a3f5b8',
    },
    radius: {
        ...defaultConfig.tokens.radius,
        // M3 Shape System
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 28,
        full: 9999,
        card: 16,
        button: 20,
    }
})
