import vue from 'rollup-plugin-vue'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import css from 'rollup-plugin-import-css'
import { nodeResolve } from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
// import commonjs from '@rollup/plugin-commonjs'

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
      // commonjs(),
      nodeResolve({ moduleDirectories: ['node_modules'] }),
      // commonjs(),
      css(),
      vue(),
      peerDepsExternal(),
    ],
  },
]
