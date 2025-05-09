import { Query } from '@cubejs-client/core';

// Define the query structure based on the HTTP request
export const getHashingDataQuery = (): Query => ({
  measures: ["metrics.cost_usd"],
  dimensions: [],
  filters: [{ "member": "metrics.workspace_name", "operator": "equals", "values": ["hashing"] }],
  timeDimensions: [{ "dimension": "metrics.period", "granularity": "day", "dateRange": ["2025-04-08", "2025-05-07"] }],
  order: { "metrics.period": "desc" },
  limit: 100
});