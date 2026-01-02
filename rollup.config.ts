import typescript from '@rollup/plugin-typescript';
import { readdirSync, readFileSync } from 'fs';
import terser from '@rollup/plugin-terser';
import { RollupOptions } from 'rollup';

// Read package.json for version
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Copyright banner for dist files (preserved in minified builds with /*! syntax)
const banner = `/*!
 * dino-validation v${pkg.version}
 * ${pkg.homepage}
 *
 * Copyright (c) Jörn Zaefferer (jQuery Validation)
 * Copyright (c) ${new Date().getFullYear()} Adam Smith (dino-validation - vanilla JS port)
 *
 * Released under the MIT License
 * ${pkg.homepage}/blob/main/LICENSE
 */
`;

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

function coreBuilds(): RollupOptions[] {
  return [
    // DV Core: UMD
    {
      input: './src/index.ts',
      output: {
        dir: 'dist',
        entryFileNames: 'dv.js',
        format: 'umd',
        name: 'dv',
        banner,
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
        entryFileNames: 'dv.min.js',
        format: 'umd',
        name: 'dv',
        banner,
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
        banner,
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
  ];
}

// Generate build configurations for all localization files
function localizationBuilds(locale = ''): RollupOptions[] {
  const localizationFiles = getLocalizationFiles(locale);
  const builds: RollupOptions[] = [];

  localizationFiles.forEach((fileName) => {
    // UMD Build
    builds.push({
      input: `./src/localization/${fileName}.ts`,
      output: {
        dir: 'dist',
        entryFileNames: `localization/${fileName}.js`,
        format: 'umd',
        name: 'dv',
        banner,
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
        entryFileNames: `localization/${fileName}.min.js`,
        format: 'umd',
        name: 'dv',
        banner,
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
        banner,
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

function testLibBuild(): RollupOptions {
  // Test Helpers: JS UMD (not dist)
  return {
    input: './tests/lib/index.ts',
    output: {
      dir: 'tests/lib',
      entryFileNames: 'dv-test-lib.js',
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
  };
}

const builds: RollupOptions[] = [];

const buildMode = process.env.NODE_ENV?.trim()?.toLowerCase() ?? '';

switch (buildMode) {
  case '':
  case 'ci': {
    console.log('DV: RUNNING CI BUILD');
    builds.push(...coreBuilds(), ...localizationBuilds('fr'), testLibBuild());
    break;
  }
  case 'full': {
    console.log('DV: RUNNING FULL BUILD');
    builds.push(...coreBuilds(), ...localizationBuilds(), testLibBuild());
    break;
  }
  default: {
    console.error('DV: UNKNOWN BUILD MODE, failed to execute build');
    break;
  }
}

export default [...builds];
