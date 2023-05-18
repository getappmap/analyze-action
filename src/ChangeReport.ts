
// Type imports reproduced/copied from @appland/appmap.

export type TestFailure = {
  name: string;
  testLocation?: string;
  failureMessage?: string;
  failureLocation?: string;
};

export type ChangeReport = {
  testFailures: TestFailure[];
}