import typescript from '@rollup/plugin-typescript';

const jsBuilds = [
  // DV Core: UMD
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      entryFileNames: 'dv.umd.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true,
    },
    plugins: [
      typescript({ compilerOptions: { outDir: 'dist', declaration: false } }),
    ],
  },
  // DV Core: ESM
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      entryFileNames: 'dv.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript({
        compilerOptions: {
          outDir: 'dist',
          declaration: true,
          declarationDir: 'dist/types',
          declarationMap: true,
        },
      }),
    ],
  },
  // DV Localization: UMD
  {
    input: './src/localization/messages_fr.ts',
    output: {
      dir: 'dist',
      entryFileNames: 'localization/messages_fr.umd.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true,
      globals: {
        '..': 'dv',
      },
    },
    external: ['..'],
    plugins: [
      typescript({ compilerOptions: { outDir: 'dist', declaration: false } }),
    ],
  },
  // Test Helpers: JS UMD (not dist)
  {
    input: './tests/lib/index.ts',
    output: {
      dir: 'tests/lib',
      entryFileNames: 'dv-test-lib.umd.js',
      format: 'umd',
      name: 'dv_testLib',
      sourcemap: true,
    },
    plugins: [
      typescript({
        compilerOptions: {
          outDir: 'tests/lib',
          declaration: false,
        },
      }),
    ],
  },
];

export default [...jsBuilds];
