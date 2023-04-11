import {ChangeReport} from './ChangeReport';

export default interface Report {
  generateReport(changeReport: ChangeReport, baseDir: string): Promise<string> | string;
}
