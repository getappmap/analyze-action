import { ArgumentParser } from 'argparse';
import { summarizeChanges } from './run';
import verbose from './verbose';
import ReportOptions from './ReportOptions';

async function main() {
  const parser = new ArgumentParser({
    description: 'Summarize the analysis report',
  });
  parser.add_argument('-v', '--verbose', { type: Boolean });
  parser.add_argument('-d', '--directory', { help: 'Program working directory' });
  parser.add_argument('--appmap-command', { default: 'appmap' });
  parser.add_argument('--report-dir', { required: true });
  parser.add_argument('--source-url');
  parser.add_argument('--appmap-url');

  const options = parser.parse_args();

  verbose(options.verbose === 'true' || options.verbose === true);
  const directory = options.directory;
  if (directory) process.chdir(directory);
  const reportDir = options.report_dir;

  const reportOptions = {} as ReportOptions;
  if (options.appmap_command) reportOptions.appmapCommand = options.appmap_command;
  if (options.source_url) reportOptions.sourceURL = new URL(options.source_url);
  if (options.appmap_url) reportOptions.appmapURL = new URL(options.appmap_url);

  await summarizeChanges(reportDir, reportOptions);
}

if (require.main === module) {
  main();
}
