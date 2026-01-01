import typescript from '@rollup/plugin-typescript';
import { readdirSync } from 'fs';
import terser from '@rollup/plugin-terser';
import { RollupOptions } from 'rollup';

// Function to get all localization files dynamically
function getLocalizationFiles(locale: string) {
  const localizationDir = './src/localization';
  try {
    const files = readdirSync(localizationDir);
    return files
      .filter(
        (file) => file.endsWith(`${locale}.ts`) && file.startsWith('messages_'),
      )
      .map((file) => file.replace('.ts', ''));
  } catch (error) {
    console.warn('No localization files found:', error);
    return [];
  }
}

// Generate build configurations for all localization files
function generateLocalizationBuilds(locale = '') {
  const localizationFiles = getLocalizationFiles(locale);
  const builds: RollupOptions[] = [];

  localizationFiles.forEach((fileName) => {
    // UMD Build
    builds.push({
      input: `./src/localization/${fileName}.ts`,
      output: {
        dir: 'dist',
        entryFileNames: `localization/${fileName}.umd.js`,
        format: 'umd',
        name: 'dv',
        sourcemap: true,
        exports: 'named',
        globals: {
          '..': 'dv',
        },
      },
      external: ['..'],
      plugins: [
        typescript({
          tsconfig: './tsconfig.build.json',
          compilerOptions: { outDir: 'dist', declaration: false },
        }),
      ],
    });

    // UMD Build (minified)
    builds.push({
      input: `./src/localization/${fileName}.ts`,
      output: {
        dir: 'dist',
        entryFileNames: `localization/${fileName}.umd.min.js`,
        format: 'umd',
        name: 'dv',
        sourcemap: true,
        exports: 'named',
        globals: {
          '..': 'dv',
        },
      },
      external: ['..'],
      plugins: [
        typescript({
          tsconfig: './tsconfig.build.json',
          compilerOptions: { outDir: 'dist', declaration: false },
        }),
        terser(),
      ],
    });

    // ESM Build
    builds.push({
      input: `./src/localization/${fileName}.ts`,
      output: {
        dir: 'dist',
        entryFileNames: `localization/${fileName}.esm.js`,
        format: 'esm',
        sourcemap: true,
      },
      external: ['..'],
      plugins: [
        typescript({
          tsconfig: './tsconfig.build.json',
          compilerOptions: {
            outDir: 'dist',
            declaration: true,
            declarationDir: 'dist/types',
            declarationMap: true,
          },
        }),
      ],
    });
  });

  return builds;
}

// core builds always included
const builds: RollupOptions[] = [
  // DV Core: UMD
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      entryFileNames: 'dv.umd.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        compilerOptions: { outDir: 'dist', declaration: false },
      }),
    ],
  },
  // DV Core: UMD Minified
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      entryFileNames: 'dv.umd.min.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        compilerOptions: { outDir: 'dist', declaration: false },
      }),
      terser(),
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
        tsconfig: './tsconfig.build.json',
        compilerOptions: {
          outDir: 'dist',
          declaration: true,
          declarationDir: 'dist/types',
          declarationMap: true,
        },
      }),
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
      exports: 'named',
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

switch (process.env.BUILD_MODE) {
  case 'ci': {
    console.log('DV: RUNNING CI BUILD');
    builds.push(...generateLocalizationBuilds('fr'));
    break;
  }
  case 'full': {
    console.log('DV: RUNNING FULL BUILD');
    builds.push(...generateLocalizationBuilds());
    break;
  }
  default: {
    console.log('DV: RUNNING FULL BUILD');
    builds.push(...generateLocalizationBuilds());
    break;
  }
}

export default [...builds];
