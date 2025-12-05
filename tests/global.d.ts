import type dvExport from '../dist/types/index';
import type testLib from './lib/index';

declare global {
  const dv: typeof dvExport;
  const dv_testLib: typeof testLib;
}

export {};
