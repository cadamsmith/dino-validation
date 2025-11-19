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
    plugins: [typescript({ compilerOptions: { outDir: 'dist', declaration: false } })],
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
    plugins: [typescript({ 
      compilerOptions: { 
        outDir: 'dist', 
        declaration: true,
        declarationDir: 'dist/types',
        declarationMap: true
      } 
    })],
  },
  // DV Auto: UMD
  {
    input: './src/auto/index.js',
    output: {
      dir: 'dist',
      entryFileNames: 'dv-auto.umd.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true,
    },
    plugins: [typescript({ compilerOptions: { outDir: 'dist', declaration: false } })],
  },
  // DV Auto: ESM
  {
    input: './src/auto/index.js',
    output: {
      dir: 'dist',
      entryFileNames: 'dv-auto.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [typescript({ 
      compilerOptions: { 
        outDir: 'dist', 
        declaration: true,
        declarationDir: 'dist/types/auto',
        declarationMap: true
      } 
    })],
  },
  // Test Helpers: JS UMD (not dist)
  {
    input: './src/testHelpers.ts',
    output: {
      dir: 'tests/js',
      entryFileNames: 'dv-test-helpers.umd.js',
      format: 'umd',
      name: 'dvTestHelpers',
      sourcemap: true,
    },
    plugins: [typescript({ compilerOptions: { outDir: 'tests/js', declaration: false } })],
  },
];

export default [...jsBuilds];
