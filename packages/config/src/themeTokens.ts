import { createTokens } from '@tamagui/core'
import { defaultConfig } from '@tamagui/config/v5'

// @ts-ignore Tamagui v2 RC 타입 정의에 color 속성이 누락되어 있음
const defaultColors = defaultConfig.tokens.color ?? {}

export const customTokens = createTokens({
    ...defaultConfig.tokens,
    color: {
        ...defaultColors,

        // ── M3 Primary Tonal Palette ──
        primary: '#0077b6',
        primaryHover: '#006298',
        primaryPress: '#004e7a',
        primaryContainer: '#c8e6f5',
        onPrimaryContainer: '#00344d',
        primaryFixed: '#c8e6f5',
        primaryFixedDim: '#8ecae6',
        onPrimaryFixed: '#00344d',
        inversePrimary: '#8ecae6',

        // ── M3 Secondary ──
        secondary: '#4a6572',
        secondaryContainer: '#cde5ee',
        onSecondaryContainer: '#061f28',

        // ── M3 Tertiary (accent) ──
        tertiary: '#5c5b7e',
        tertiaryContainer: '#e2dfff',
        onTertiaryContainer: '#191837',

        // ── M3 Surface Tonal (Light) ──
        backgroundBody: '#f4f7fa',
        surface: '#ffffff',
        surfaceHover: '#eef2f6',
        surfaceDim: '#d4dbe0',
        surfaceContainerLowest: '#ffffff',
        surfaceContainerLow: '#eef2f6',
        surfaceContainer: '#e8edf1',
        surfaceContainerHigh: '#e2e8ec',
        surfaceContainerHighest: '#dce3e8',
        inverseSurface: '#2e3134',
        inverseOnSurface: '#eff1f4',

        // ── M3 Text/On-colors ──
        textMain: '#191c1e',
        textMuted: '#6b7278',
        onSurface: '#191c1e',
        onSurfaceVariant: '#3f484e',
        outline: '#6f787e',
        outlineVariant: '#bfc8cd',

        // ── M3 Borders ──
        borderLight: '#dee5ea',

        // ── M3 Error ──
        error: '#ba1a1a',
        errorContainer: '#ffdad6',
        onError: '#ffffff',
        onErrorContainer: '#410002',

        // ── M3 Success ──
        success: '#1b6d3c',
        successContainer: '#a3f5b8',
        onSuccessContainer: '#002110',

        // ── M3 Warning ──
        warning: '#7c5800',
        warningContainer: '#ffdea3',
        onWarningContainer: '#271900',
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
        button: 12,
        container: 24,
    }
})

// ── 표준 콘텐츠 너비 ──
export const CONTENT_WIDTH = {
    narrow: 640,
    medium: 800,
    wide: 960,
    full: 1100,
} as const
