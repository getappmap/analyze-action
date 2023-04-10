import {ArgumentParser} from 'argparse';
import {summarizeChanges} from './run';
import verbose from './verbose';

async function main() {
  const parser = new ArgumentParser({
    description: 'Summarize preflight report',
  });
  parser.add_argument('-v', '--verbose');
  parser.add_argument('-d', '--directory', {help: 'Program working directory'});
  parser.add_argument('--report-dir', {required: true});

  const options = parser.parse_args();

  verbose(options.verbose === 'true' || options.verbose === true);
  const directory = options.directory;
  if (directory) process.chdir(directory);
  const reportDir = options.report_dir;

  const summary = await summarizeChanges(reportDir);
  console.log(summary);
}

if (require.main === module) {
  main();
}
