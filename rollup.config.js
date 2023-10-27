import vue from 'rollup-plugin-vue'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/fluidcalendar.js',
    output: [
      {
        format: 'esm',
        file: 'dist/fluidcalendar.mjs',
      },
      {
        format: 'cjs',
        file: 'dist/fluidcalendar.js',
      },
    ],
    plugins: [
      nodeResolve({ moduleDirectories: ['node_modules'] }),
      vue(),
      peerDepsExternal(),
    ],
  },
]
