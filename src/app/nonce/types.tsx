export interface NonceRecord {
  "metrics.period.day"?: string;
  // Allow for dynamic properties
  [key: string]: string | number | boolean | undefined | unknown;
}

export type ColumnStruct =  {
  key: string;
  title: string;
  shortTitle: string;
  type: string;
  dataIndex: string;
  meta?: {
    format?: {
      type: string;
      unit?: string;
    };
    comparisons?: {
      type: string;
      member: string;
    }[];
  };
}

