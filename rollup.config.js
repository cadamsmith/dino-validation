const jsBuilds = [
  // DV Core: UMD
  {
    input: './src/index.js',
    output: {
      file: 'dist/dv.umd.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true,
    },
  },
  // DV Core: ESM
  {
    input: './src/index.js',
    output: {
      file: 'dist/dv.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  },
  // DV Auto: UMD
  {
    input: './src/auto/index.js',
    output: {
      file: 'dist/dv-auto.umd.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true,
    },
  },
  // DV Auto: ESM
  {
    input: './src/auto/index.js',
    output: {
      file: 'dist/dv-auto.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  },
  // Test Helpers: JS UMD (not dist)
  {
    input: './src/testHelpers.js',
    output: {
      file: 'tests/js/dv-test-helpers.umd.js',
      format: 'umd',
      name: 'dvTestHelpers',
      sourcemap: true,
    },
  },
];

export default [...jsBuilds];
