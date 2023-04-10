import {ChangeReport} from './ChangeReport';

export default interface Report {
  generateReport(changeReport: ChangeReport): Promise<string> | string;
}
