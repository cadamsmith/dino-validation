import type dvExport from '../dist/types/index';
import type * as testHelpers from '../dist/types/testHelpers';

declare global {
  const dv: typeof dvExport;
  const dvTestHelpers: typeof testHelpers;
}

export {};
