import { parseIssueNumber } from '../src/analyze';

describe('parseIssueNumber', () => {
  it('should return an integer when an integer is provided', () => {
    expect(parseIssueNumber(123)).toEqual(123);
  });

  it('should return an integer when a numeric string is provided', () => {
    expect(parseIssueNumber('123')).toEqual(123);
  });

  it('should return undefined when a non-numeric string is provided', () => {
    expect(parseIssueNumber('abc')).toBeUndefined();
  });

  it('should return undefined when an empty string is provided', () => {
    expect(parseIssueNumber('')).toBeUndefined();
  });

  it('should return undefined when a string with spaces is provided', () => {
    expect(parseIssueNumber('  ')).toBeUndefined();
  });

  it('should return undefined when a null value is provided', () => {
    expect(parseIssueNumber(null)).toBeUndefined();
  });

  it('should return undefined when an undefined value is provided', () => {
    expect(parseIssueNumber(undefined)).toBeUndefined();
  });

  it('should return undefined when a boolean value is provided', () => {
    expect(parseIssueNumber(true)).toBeUndefined();
    expect(parseIssueNumber(false)).toBeUndefined();
  });

  it('should return the integer part when a string with a number and letters is provided', () => {
    expect(parseIssueNumber('123abc')).toEqual(123);
  });
});
