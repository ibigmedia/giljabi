// Regenerates apps/next/public/tamagui.css from the built @my/config.
//
// Next.js copies apps/next/public/ verbatim into every build - it never
// transforms those files. Tamagui's design-system CSS (fonts, sizes,
// radius, space) is excluded from the SSR-inserted <style> tags in
// production (see NextTamaguiProvider.tsx), so this static file is the
// only place that CSS actually ships from. If it isn't regenerated after
// changing tokens (fonts.ts, themeTokens.ts, animationsApp.ts), the site
// keeps serving whatever was true the last time this script ran, no
// matter how many times the app itself gets rebuilt and deployed.
const fs = require('fs')
const path = require('path')

process.env.NODE_ENV = 'production'
process.env.TAMAGUI_TARGET = 'web'

const configPath = path.join(__dirname, '../packages/config/dist/tamagui.config.cjs')
const outputPath = path.join(__dirname, '../apps/next/public/tamagui.css')

if (!fs.existsSync(configPath)) {
  console.error(`[generate-tamagui-css] Missing ${configPath} - run "yarn build" first so @my/config is built.`)
  process.exit(1)
}

const { config } = require(configPath)
const css = config.getCSS()

if (!css || css.length < 1000) {
  console.error(`[generate-tamagui-css] Generated CSS looks suspiciously small (${css?.length ?? 0} bytes) - refusing to overwrite ${outputPath}.`)
  process.exit(1)
}

fs.writeFileSync(outputPath, css)
console.log(`[generate-tamagui-css] Wrote ${css.length} bytes to ${path.relative(process.cwd(), outputPath)}`)

// Requiring the built tamagui config leaves some timer/handle open (animations
// driver or similar) that keeps the event loop alive indefinitely, which would
// otherwise hang the `&&`-chained build command forever. Force-exit once done.
process.exit(0)
