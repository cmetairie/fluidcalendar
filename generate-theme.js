import fs from 'fs/promises'
import { colors } from './theme.js'
import { TinyColor } from '@ctrl/tinycolor'

const scssContent = Object.keys(colors)
  .map((key) => {
    const color = new TinyColor(colors[key])
    const highlight = color.brighten(10).saturate(10).toHexString()
    return `--${key}: ${colors[key]};--${key}-highlight: ${highlight};`
  })
  .join('\n')

const scss = `:root {
  ${scssContent}
}`

fs.writeFile('src/assets/vars.scss', scss)
