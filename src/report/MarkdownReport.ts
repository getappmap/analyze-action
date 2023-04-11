import {readFileSync} from 'fs';
import Handlebars from 'handlebars';
import {join} from 'path';
import Report from '.';
import {ChangeReport} from './ChangeReport';

const Template = Handlebars.compile(
  readFileSync(join(__dirname, 'templates', 'markdown.hbs'), 'utf8')
);

export default class MarkdownReport implements Report {
  async generateReport(changeReport: ChangeReport, baseDir: string): Promise<string> {
    // Remove the empty sequence diagram diff snippet - which can't be reasonably rendered.
    delete changeReport.sequenceDiagramDiffSnippets[''];

    // Resolve changedAppMap entry for a test failure. Note that this will not help much
    // with new test cases that fail, but it will help with modified tests that fail.
    changeReport.testFailures.forEach(failure => {
      const changedAppMap = changeReport.changedAppMaps.find(
        change => change.appmap === failure.appmap
      );
      if (changedAppMap) {
        failure.changedAppMap = changedAppMap;
      }
    });

    // Resolve the test location to a source path relative to baseDir.
    changeReport.testFailures
      .filter(failure => failure.testLocation)
      .forEach(failure => {
        (failure as any).testPath = join(baseDir, failure.testLocation!.split(':').shift()!);
      });

    // Provide a simple count of the number of differences - since Handlebars can't do math.
    changeReport.apiDiff.differenceCount =
      changeReport.apiDiff.breakingDifferences.length +
      changeReport.apiDiff.nonBreakingDifferences.length +
      changeReport.apiDiff.unclassifiedDifferences.length;
    (changeReport as any).sequenceDiagramDiffSnippetCount = Object.keys(
      changeReport.sequenceDiagramDiffSnippets
    ).length;

    return Template(changeReport);
  }
}
