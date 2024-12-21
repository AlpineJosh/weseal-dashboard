import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/install-service.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  external: [
    'node-windows',
    'better-sqlite3',
    'odbc',
    'winston',
    'node-schedule'
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript()
  ]
};