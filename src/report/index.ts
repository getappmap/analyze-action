import type {DiffOutcome} from 'openapi-diff';
import type {Finding} from '@appland/scanner';
import type {Metadata} from '@appland/models';

export interface ChangedAppMap {
  appmap: string;
  sourceDiff?: string;
  sequenceDiagramDiff?: string;
}

export interface ScanConfiguration {
  checks: Array<{rule: string}>;
  timestampMs: number;
}

export interface Diff<T> {
  base: T;
  head: T;
}

export interface ComparisonResult {
  testFailures: Array<string>;
  newAppMaps: Array<string>;
  changedAppMaps: Array<ChangedAppMap>;
  newFindings: Array<Finding>;
  resolvedFindings: Array<Finding>;
  apiDiff: DiffOutcome;
  sequenceDiagramDiffSnippets: {[key: string]: Array<string>};
  scanConfiguration: Diff<ScanConfiguration>;
  appMapMetadata: Diff<Map<string, Metadata>>;
}

export default interface Report {
  generateReport(comparisonResult: ComparisonResult): Promise<string> | string;
}
