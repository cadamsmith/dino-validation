const jsBuilds = [
  // JS UMD: main
  {
    input: './src/index.js',
    output: {
      file: 'dist/js/dv.umd.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true
    }
  },
  // JS UMD: test helpers
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
