import {readFileSync} from 'fs';
import Handlebars from 'handlebars';
import {join} from 'path';
import Report from '.';
import {ChangeReport} from './ChangeReport';

const Template = Handlebars.compile(
  readFileSync(join(__dirname, 'templates', 'markdown.hbs'), 'utf8')
);

function isURL(path: string): boolean {
  try {
    new URL(path);
    return true;
  } catch (e) {
    return false;
  }
}

export default class MarkdownReport implements Report {
  async generateReport(changeReport: ChangeReport, basePath: string): Promise<string> {
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
        const tokens = failure.testLocation!.split(':');
        tokens.pop();
        let testPath = tokens.join(':');
        let path: string;
        console.log(testPath, basePath);
        if (isURL(basePath)) {
          path = new URL(testPath, basePath).toString();
        } else {
          path = join(basePath, testPath);
        }
        (failure as any).testPath = path;
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
