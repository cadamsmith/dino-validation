const jsBuilds = [
  // DV: JS UMD
  {
    input: './src/index.js',
    output: {
      file: 'dist/js/dv.umd.js',
      format: 'umd',
      name: 'dv',
      exports: 'default',
      sourcemap: true
    }
  },
  {
    input: './src/auto/index.js',
    output: {
      file: 'dist/js/dv-auto.umd.js',
      format: 'umd',
      name: 'dv',
      exports: 'default',
      sourcemap: true
    }
  },
  // Test Helpers: JS UMD (not dist)
  {
    input: './src/testHelpers.js',
    output: {
      file: 'tests/js/dv-test-helpers.umd.js',
      format: 'umd',
      name: 'dvTestHelpers',
      sourcemap: true
    }
  },
];

export default [...jsBuilds];
