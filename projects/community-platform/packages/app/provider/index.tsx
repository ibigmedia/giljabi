import { useColorScheme } from 'react-native'
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui'
import { config } from '@my/config'
import { ReactQueryProvider } from './react-query'

export function Provider({
  children,
  defaultTheme = 'light',
  ...rest
}: Omit<TamaguiProviderProps, 'config' | 'defaultTheme'> & { defaultTheme?: string }) {
  const colorScheme = useColorScheme()
  const theme = defaultTheme || (colorScheme === 'dark' ? 'dark' : 'light')

  return (
    <ReactQueryProvider>
      <TamaguiProvider
        config={config}
        defaultTheme={theme}
        {...rest}
      >
        {children}
      </TamaguiProvider>
    </ReactQueryProvider>
  )
}
