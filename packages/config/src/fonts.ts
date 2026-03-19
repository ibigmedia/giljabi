import { createInterFont } from '@tamagui/font-inter'

const FONT_FAMILY = 'Inter, Pretendard, "Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'

export const headingFont = createInterFont({
  size: {
    6: 15,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  weight: {
    6: '400',
    7: '700',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -0.5,
    9: -1,
    10: -2,
    12: -3,
    14: -4,
    15: -5,
  },
  face: {
    700: { normal: 'InterBold' },
  },
  family: FONT_FAMILY,
})

export const bodyFont = createInterFont(
  {
    face: {
      700: { normal: 'InterBold' },
    },
    family: FONT_FAMILY,
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 12 : 12)),
  }
)
