import {Metadata} from '@appland/models';
import Finding from './Finding';

export type AppMapLink = string;
export type SequenceDiagramLink = string;
// AppMap file path, without the .appmap.json extension.
export type AppMapName = string;
// hex digest of an AppMap's canonical sequence diagram.
export type AppMapDigest = string;

export type ChangedAppMap = {
  appmap: string;
  sourceDiff?: string | undefined;
  sequenceDiagramDiff?: SequenceDiagramLink;
};

export type TestFailure = {
  appmap: string;
  changedAppMap?: ChangedAppMap;
  name: string;
  testLocation?: string;
};

export type ChangeReport = {
  testFailures: TestFailure[];
  newAppMaps: AppMapLink[];
  changedAppMaps: ChangedAppMap[];
  newFindings: Finding[];
  resolvedFindings: Finding[];
  apiDiff: any;
  scanConfiguration: {
    base: any;
    head: any;
  };
  appMapMetadata: {
    base: Record<AppMapName, Metadata>;
    head: Record<AppMapName, Metadata>;
  };
  sequenceDiagramDiffSnippets: Record<string, AppMapLink[]>;
};
