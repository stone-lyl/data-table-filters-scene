import type { FieldType } from '@/components/data-table/types';

export interface NonceRecord {
  // Cube.js data fields
  "metrics.period.day"?: string;
  "metrics.cost_usd"?: string | number;
  
  // Legacy fields for backward compatibility
  period?: string;
  earning?: number;
  cost?: number;
  hashrate?: number;
  efficiency?: number;
  onlineHashrate?: number;
  offlineHashrate?: number;
  onlineEfficiency?: number;
  offlineEfficiency?: number;
  onlineMiners?: number;
  offlineMiners?: number;
  
  // Allow for dynamic properties
  [key: string]: string | number | boolean | undefined | unknown;
}

export const defaultColumnVisibility = {
  // Cube.js data fields
  "day": true,
  "cost_usd": true,
  
  // Legacy fields for backward compatibility
  period: false,
  earning: false,
  cost: false,
  hashrate: false,
  efficiency: false,
  onlineHashrate: false,
  offlineHashrate: false,
  onlineEfficiency: false,
  offlineEfficiency: false,
  onlineMiners: false,
  offlineMiners: false,
};
// resultSet.tableColumns()
const columnsStruct = [
  {

      "key": "metrics.period.day",
      "title": "Metrics Period",
      "shortTitle": "Period",
      "type": "time",
      "dataIndex": "metrics.period.day"
  },
  {
      "key": "metrics.cost_usd",
      "type": "number",
      "meta": {
          "format": {
              "type": "currency",
              "unit": "USD"
          },
          "comparisons": [
              {
                  "type": "weekly-moving-average",
                  "member": "metrics.cost_usd_curr_week_avg"
              },
              {
                  "type": "monthly-moving-average",
                  "member": "metrics.cost_usd_curr_month_avg"
              }
          ]
      },
      "dataIndex": "metrics.cost_usd",
      "title": "Metrics Cost (USD)",
      "shortTitle": "Cost (USD)"
  }
];
// resultSet.tablePivot()
const dataStruct =[
  {
      "metrics.period.day": "2025-05-05T00:00:00.000",
      "metrics.cost_usd": "72878.0150"
  },
  {
      "metrics.period.day": "2025-05-06T00:00:00.000",
      "metrics.cost_usd": "72896.6686"
  },
  {
      "metrics.period.day": "2025-05-07T00:00:00.000",
      "metrics.cost_usd": "72824.3941"
  }
]
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

