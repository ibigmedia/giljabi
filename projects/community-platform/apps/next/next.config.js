/** @type {import('next').NextConfig} */
module.exports = {
  typescript: {
    // 프로덕션 빌드 시 TS 에러를 감지하기 위해 false 설정
    ignoreBuildErrors: false,
  },
  transpilePackages: [
    'solito',
    'react-native-web',
    '@tamagui/react-native-svg',
    '@tamagui/next-theme',
    '@tamagui/lucide-icons',
    'expo-linking',
    'expo-constants',
    'expo-modules-core',
    'expo-web-browser',
    'expo-auth-session',
    'expo-crypto',
  ],
  experimental: {
    scrollRestoration: true,
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
      'react-native-svg': '@tamagui/react-native-svg',
      'react-native-safe-area-context': './shims/react-native-safe-area-context.js',
    },
    resolveExtensions: [
      '.web.tsx',
      '.web.ts',
      '.web.js',
      '.web.jsx',
      '.tsx',
      '.ts',
      '.js',
      '.jsx',
      '.json',
    ],
  },
}
