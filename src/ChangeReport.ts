// Type imports reproduced/copied from @appland/appmap.

import { Finding } from './Finding';

export type TestFailure = {
  name: string;
  testLocation?: string;
  failureMessage?: string;
  failureLocation?: string;
};

// TODO: better types
type FindingDiff = {
  new: Finding[];
  resolved: Finding[];
};

export type ChangeReport = {
  testFailures: TestFailure[];
  findingDiff: FindingDiff;
};
