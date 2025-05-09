import { Query, Filter, BinaryFilter, BinaryOperator, TimeDimensionGranularity } from '@cubejs-client/core';
import sidebarMeta from '../sidebar-meta.json';
import { format, subDays, subYears } from 'date-fns';

// Define additional properties we need to track that aren't in the Query type
export interface ExtendedQuery extends Query {
  breakdowns?: string[];
}

const defaultQuery: ExtendedQuery = {
  measures: ['metrics.cost_usd'],
  dimensions: [],
  filters: [{ member: 'metrics.workspace_name', operator: 'equals', values: ['hashing'] }],
  // breakdowns: [],
  timeDimensions: [{
    dimension: 'metrics.period',
    granularity: 'day' as TimeDimensionGranularity,
    dateRange: ['2025-04-08', '2025-05-07']
  }],
  limit: 100,
  order: { "metrics.period": "desc" },
};

// Create a new query with default values
export const createDefaultQuery = (): ExtendedQuery => {
  return { ...defaultQuery };
};

// Get all available measures from sidebar meta
export const getAvailableMeasures = () => {
  const metaData = sidebarMeta[0];
  console.log(metaData, 'metaData')
  return metaData.measures.filter(measure => measure.isVisible).map(measure => ({
    name: measure.name,
    title: measure.title,
    shortTitle: measure.shortTitle,
    folder: getFolderForMeasure(measure.name),
    format: measure.meta?.format,
    comparisons: measure.meta?.comparisons || []
  }));
};

// Get all available dimensions from sidebar meta
export const getAvailableDimensions = () => {
  const metaData = sidebarMeta[0];
  return metaData.dimensions.filter(dimension => dimension.isVisible).map(dimension => ({
    name: dimension.name,
    title: dimension.title,
    shortTitle: dimension.shortTitle,
    type: dimension.type
  }));
};

// Get all available farm names for filtering
export const getAvailableFarmNames = () => {
  // This would typically come from an API call or the meta data
  // For now, we'll return a static list
  return ["GA - LN", "Kuching - MY", "Paris - TN"];
};

// Get folder for a measure
export const getFolderForMeasure = (measureName: string) => {
  const metaData = sidebarMeta[0];
  for (const folder of metaData.folders) {
    if (folder.members.includes(measureName)) {
      return folder.name;
    }
  }
  return null;
};

// Get available comparison types
export const getAvailableComparisonTypes = () => {
  return [
    { id: 'previous-period', name: 'Previous Period' },
    { id: '7d-ma', name: '7D MA' },
    { id: '28d-ma', name: '28D MA' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'average', name: 'Average' }
  ];
};

// Build a Cube.js query from the extended query
export const buildQuery = (extendedQuery: ExtendedQuery): Query => {
  const query: Query = {
    measures: [...(extendedQuery.measures || [])],
    dimensions: [...(extendedQuery.dimensions || [])],
    filters: extendedQuery.filters,
    timeDimensions: extendedQuery.timeDimensions,
    limit: extendedQuery.limit || 100
  };

  // Add order by time dimension if present
  if (extendedQuery.timeDimensions && extendedQuery.timeDimensions.length > 0) {
    query.order = { [extendedQuery.timeDimensions[0].dimension]: 'desc' };
  }


  return query;
};
// Update query with selected measures
export const updateMeasures = (query: ExtendedQuery, selectedMeasures: string[]): ExtendedQuery => {
  return {
    ...query,
    measures: selectedMeasures
  };
};

// Update query with selected dimensions (breakdowns)
export const updateDimensions = (query: ExtendedQuery, selectedDimensions: string[]): ExtendedQuery => {
  return {
    ...query,
    dimensions: selectedDimensions
  };
};

// Update query with selected filters
export const updateFilters = (
  query: ExtendedQuery, 
  member: string, 
  operator: BinaryOperator, 
  values: string[]
): ExtendedQuery => {
  // Create a copy of the current filters or an empty array
  const currentFilters = query.filters ? [...query.filters] : [];
  
  // Remove existing filter for this member if it exists
  const updatedFilters = currentFilters.filter((filter: Filter) => (filter as BinaryFilter).member !== member);
  
  // Add new filter if values are provided
  if (values.length > 0) {
    updatedFilters.push({ member, operator, values });
  }
  
  return {
    ...query,
    filters: updatedFilters
  };
};

// Update query with date range
export const updateDateRange = (
  query: ExtendedQuery, 
  dateRange: [string, string]
): ExtendedQuery => {
  if (!query.timeDimensions || query.timeDimensions.length === 0) return query;
  
  const updatedTimeDimensions = [...query.timeDimensions];
  updatedTimeDimensions[0] = {
    ...updatedTimeDimensions[0],
    dateRange
  };
  
  return {
    ...query,
    timeDimensions: updatedTimeDimensions
  };
};


/**
 * Creates a comparison query with a different date range but the same filters, dimensions, etc.
 * @param originalQuery - The original query state
 * @param comparisonType - The type of comparison to make ('year', '30days', or '7days')
 * @returns A new query for comparison or null if the comparison can't be made
 */
export const createComparisonQuery = (
  originalQuery: ExtendedQuery, 
  comparisonType: string
): Query | null => {
  // Check if we have a valid time dimension with date range
  if (!originalQuery.timeDimensions || 
      !originalQuery.timeDimensions[0] || 
      !originalQuery.timeDimensions[0].dateRange || 
      originalQuery.timeDimensions[0].dateRange.length !== 2) {
    return null;
  }
  
  // Get the current date range
  const currentDateRange = originalQuery.timeDimensions[0].dateRange;
  
  // Parse the current date range
  const currentFrom = new Date(currentDateRange[0]);
  const currentTo = new Date(currentDateRange[1]);
  
  // Calculate the comparison date range based on the selected option
  let comparisonFrom: Date;
  let comparisonTo: Date;
  
  switch (comparisonType) {
    case 'year':
      comparisonFrom = subYears(currentFrom, 1);
      comparisonTo = subYears(currentTo, 1);
      break;
    case '30days':
      comparisonFrom = subDays(currentFrom, 30);
      comparisonTo = subDays(currentTo, 30);
      break;
    case '7days':
      comparisonFrom = subDays(currentFrom, 7);
      comparisonTo = subDays(currentTo, 7);
      break;
    default:
      return null;
  }
  
  // Format the dates for the query
  const comparisonDateRange: [string, string] = [
    format(comparisonFrom, 'yyyy-MM-dd'),
    format(comparisonTo, 'yyyy-MM-dd')
  ];

  // Create a new query with the same structure but different date range
  const comparisonQuery = {
    ...originalQuery,
    timeDimensions: [
      {
        ...originalQuery.timeDimensions[0],
        dateRange: comparisonDateRange
      }
    ]
  };
  
  // Convert to a standard Cube.js query
  return buildQuery(comparisonQuery);
};
