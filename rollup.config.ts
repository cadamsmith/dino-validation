import typescript from '@rollup/plugin-typescript';
import { readdirSync } from 'fs';
import terser from '@rollup/plugin-terser';
import { RollupOptions } from 'rollup';

// Function to get all localization files dynamically
function getLocalizationFiles() {
  const localizationDir = './src/localization';
  try {
    const files = readdirSync(localizationDir);
    return files
      .filter((file) => file.endsWith('.ts') && file.startsWith('messages_'))
      .map((file) => file.replace('.ts', ''));
  } catch (error) {
    console.warn('No localization files found:', error);
    return [];
  }
}

// Generate build configurations for all localization files
function generateLocalizationBuilds() {
  const localizationFiles = getLocalizationFiles();
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
        globals: {
          '..': 'dv',
        },
      },
      external: ['..'],
      plugins: [
        typescript({ compilerOptions: { outDir: 'dist', declaration: false } }),
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
        globals: {
          '..': 'dv',
        },
      },
      external: ['..'],
      plugins: [
        typescript({ compilerOptions: { outDir: 'dist', declaration: false } }),
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

const skipLocalizations = process.env.SKIP_LOCALIZATIONS === 'true';

const config: RollupOptions[] = [
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
  // DV Core: UMD Minified
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      entryFileNames: 'dv.umd.min.js',
      format: 'umd',
      name: 'dv',
      sourcemap: true,
    },
    plugins: [
      typescript({ compilerOptions: { outDir: 'dist', declaration: false } }),
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
        compilerOptions: {
          outDir: 'dist',
          declaration: true,
          declarationDir: 'dist/types',
          declarationMap: true,
        },
      }),
    ],
  },
  // Dynamically generated localization builds
  ...(skipLocalizations ? [] : generateLocalizationBuilds()),
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

export default [...config];
