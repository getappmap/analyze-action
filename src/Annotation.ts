export type Annotation = {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: 'notice' | 'warning' | 'failure';
  message: string;
  start_column?: number;
  end_column?: number;
  title?: string;
  raw_details?: string;
};
