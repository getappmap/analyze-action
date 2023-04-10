import {readFileSync} from 'fs';
import Handlebars from 'handlebars';
import {join} from 'path';
import Report from '.';
import {ChangeReport} from './ChangeReport';

const Template = Handlebars.compile(
  readFileSync(join(__dirname, 'templates', 'markdown.hbs'), 'utf8')
);

export default class MarkdownReport implements Report {
  async generateReport(changeReport: ChangeReport): Promise<string> {
    delete changeReport.sequenceDiagramDiffSnippets[''];
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
