const jsBuilds = [
  // JS UMD: main
  {
    input: './src/index.js',
    output: {
      file: 'dist/js/dino-validation.umd.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true
    },
    external: ['jquery'],
  },
];

export default [...jsBuilds];
