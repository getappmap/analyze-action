import { context, getOctokit } from '@actions/github';
import { Octokit } from '@octokit/rest';
import { readFileSync } from 'fs';
import path from 'path';

import { Annotation } from './Annotation';
import { ChangeReport, TestFailure } from './ChangeReport';
import { Finding } from './Finding';
import log, { LogLevel } from './log';
import { batch } from './util';

enum AnnotationLevel {
  Notice = 'notice',
  Warning = 'warning',
  Failure = 'failure',
}

enum Conclusion {
  Failure = 'failure',
  Neutral = 'neutral',
  Sucess = 'success',
}

type AnnotationsPerLevel = {
  failures: number;
  warnings: number;
  notices: number;
};

type LocationInfo = {
  path: string;
  lineNumber: number;
};

export default class Annotator {
  private readonly changeReportPath: string;
  private readonly ref: string;
  private readonly repo: string;
  private readonly owner: string;
  public static readonly CHECK_TITLE = 'appmap-annotations';

  constructor(
    private readonly octokit: Octokit,
    reportDir: string,
    private readonly excludedDirectories: string[]
  ) {
    this.changeReportPath = path.join(reportDir, 'change-report.json');

    const pullRequest = context.payload.pull_request;
    const { owner, repo } = context.repo;

    this.ref = pullRequest ? pullRequest.head.sha : context.sha;
    this.owner = owner;
    this.repo = repo;
  }

  private readChangeReport(): ChangeReport | undefined {
    try {
      const inputContent = readFileSync(this.changeReportPath, { encoding: 'utf8' });
      return JSON.parse(inputContent);
    } catch (e) {
      return;
    }
  }

  private generateConclusion(failures: number, warnings: number, notices: number): Conclusion {
    let conclusion = Conclusion.Sucess;
    if (failures > 0) {
      conclusion = Conclusion.Failure;
    } else if (warnings > 0 || notices > 0) {
      conclusion = Conclusion.Neutral;
    }

    return conclusion;
  }

  private generateSummary(failures: number, warnings: number, notices: number): string {
    const messages = [];
    if (failures > 0) {
      const noun = failures === 1 ? 'failure' : 'failures';
      messages.push(`${failures} ${noun} found`);
    }

    if (warnings > 0) {
      const noun = warnings === 1 ? 'warning' : 'warnings';
      messages.push(`${warnings} ${noun} found`);
    }

    if (notices > 0) {
      const noun = notices === 1 ? 'notice' : 'notices';
      messages.push(`${notices} ${noun} found`);
    }

    return messages.join('\n');
  }

  private stats(annotations: Annotation[]): AnnotationsPerLevel {
    const result = { failures: 0, warnings: 0, notices: 0 };

    annotations.forEach((annotation: Annotation) => {
      const level = annotation.annotation_level;
      if (level === AnnotationLevel.Failure) {
        result.failures += 1;
      } else if (level === AnnotationLevel.Notice) {
        result.notices += 1;
      } else if (level === AnnotationLevel.Warning) {
        result.warnings += 1;
      }
    });

    return result;
  }

  private async createCheck(): Promise<number> {
    const { owner, repo, ref } = this;
    const {
      data: { id: checkRunId },
    } = await this.octokit.rest.checks.create({
      owner,
      repo,
      name: Annotator.CHECK_TITLE,
      head_sha: ref,
      status: 'in_progress',
    });

    return checkRunId;
  }

  private async updateCheck(
    checkRunId: number,
    conclusion: string,
    summary: string,
    annotations: Annotation[]
  ): Promise<void> {
    const { owner, repo } = this;
    await this.octokit.rest.checks.update({
      owner,
      repo,
      check_run_id: checkRunId,
      status: 'completed',
      conclusion,
      output: {
        title: Annotator.CHECK_TITLE,
        summary,
        annotations,
      },
    });
  }

  private fileAndLineNumberFromLocation(location: string | undefined): LocationInfo | undefined {
    if (!location) return;
    const locationTokens = location.split(':');
    const lastToken = locationTokens[locationTokens.length - 1];

    // if there are no colons in the location or the last token is not all digits
    // then we can't use this location to make an annotation in the source code
    if (locationTokens.length < 2 || !/^\d+$/.test(lastToken)) return;

    const lineNumber = Number(locationTokens.pop());
    const path = locationTokens.join(':');
    return { path, lineNumber };
  }

  private isPreferredLocation(info: LocationInfo | undefined): boolean {
    if (!info || path.isAbsolute(info.path)) return false;

    const pathComponents = info.path.split(/[\/\\]/);
    return !this.excludedDirectories.some((directory) => pathComponents.includes(directory));
  }

  public annotationFromFinding(finding: Finding): Annotation | undefined {
    const locationInfo = finding.stack.map(this.fileAndLineNumberFromLocation, this);

    const preferredLocation = locationInfo.find(this.isPreferredLocation, this);
    if (!preferredLocation) return;

    return {
      path: preferredLocation.path,
      annotation_level: AnnotationLevel.Warning,
      title: finding.ruleTitle || 'AppMap Finding',
      message: finding.message || '',
      start_line: preferredLocation.lineNumber,
      end_line: preferredLocation.lineNumber,
    };
  }

  private annotationFromTestFailure(testFailure: TestFailure | undefined): Annotation | undefined {
    if (!testFailure || !testFailure.testLocation) return;
    const { path, lineNumber } = this.fileAndLineNumberFromLocation(testFailure.testLocation) || {};
    if (!path || !lineNumber) return;

    return {
      path,
      annotation_level: AnnotationLevel.Failure,
      title: 'Test Failure',
      message: testFailure.failureMessage || '',
      start_line: lineNumber,
      end_line: lineNumber,
    };
  }

  private generateAnnotations(changeReport: ChangeReport): Annotation[] {
    const findings = changeReport?.findingDiff?.new || [];
    const findingsAnnotations = findings.map(this.annotationFromFinding, this);

    const testFailures = changeReport?.testFailures || [];
    const testAnnotations = testFailures.map(this.annotationFromTestFailure, this);

    return [...findingsAnnotations, ...testAnnotations].filter(
      (annotation) => !!annotation
    ) as Annotation[];
  }

  public async annotate(): Promise<void> {
    log(LogLevel.Info, 'Creating source code annotations...');
    const changeReport = this.readChangeReport();
    if (!changeReport) {
      log(
        LogLevel.Warn,
        'Could not create annotations because the change report was either missing or could not be parsed'
      );
      return;
    }

    const annotations = this.generateAnnotations(changeReport);
    log(LogLevel.Debug, `annotations:\n${JSON.stringify(annotations, null, 2)}`);
    const checkRunId = await this.createCheck();
    const { failures, warnings, notices } = this.stats(annotations);
    const summary = this.generateSummary(failures, warnings, notices);
    log(LogLevel.Info, summary);
    const conclusion = this.generateConclusion(failures, warnings, notices);

    // The GitHub API requires that annotations are submitted in batches of 50 elements maximum
    await Promise.all(
      batch(50, annotations).map((batch: Annotation[]) =>
        this.updateCheck(checkRunId, conclusion, summary, batch)
      )
    );
    log(LogLevel.Info, 'Finished creating source code annotations!');
  }
}
