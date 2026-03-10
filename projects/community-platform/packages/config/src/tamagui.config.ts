import { defaultConfig } from '@tamagui/config/v5'
import { createTamagui } from 'tamagui'
import { bodyFont, headingFont } from './fonts'
import { animationsApp } from './animationsApp'
import { customTokens } from './themeTokens'

export const config = createTamagui({
  ...defaultConfig,
  tokens: customTokens,
  animations: animationsApp,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
})

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf { }
}
