import Handlebars from 'handlebars/runtime';
import Report, {ComparisonResult} from '.';
import Template from './templates/markdown.hbs';

export default class MarkdownReport implements Report {
  async generateReport(comparisonResult: ComparisonResult): Promise<string> {
    return Handlebars.compile(Template)(comparisonResult);
  }
}
