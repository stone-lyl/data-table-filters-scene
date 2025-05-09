import { Query, Filter, BinaryFilter, BinaryOperator, TimeDimensionGranularity } from '@cubejs-client/core';
import sidebarMeta from '../sidebar-meta.json';

// Define additional properties we need to track that aren't in the Query type
export interface ExtendedQuery extends Query {
  comparisons?: string[];
  breakdowns?: string[];
}

// Default query state
export const defaultQuery: ExtendedQuery = {
  measures: ['metrics.cost_usd'],
  dimensions: [],
  filters: [{ member: 'metrics.workspace_name', operator: 'equals', values: ['hashing'] }],
  // comparisons: [],
  // breakdowns: [],
  timeDimensions: [{
    dimension: 'metrics.period',
    granularity: 'day' as TimeDimensionGranularity,
    dateRange: ['2025-04-08', '2025-05-07']
  }],
  limit: 100,
  order: { "metrics.period": "desc" },
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

  // Add comparison measures if needed
  if (extendedQuery.comparisons && extendedQuery.comparisons.length > 0 && query.measures) {
    // Find all measures that have the selected comparison types
    const measuresWithComparisons = getAvailableMeasures();
    
    extendedQuery.measures?.forEach(measure => {
      const measureMeta = measuresWithComparisons.find(m => m.name === measure);
      if (measureMeta && measureMeta.comparisons) {
        measureMeta.comparisons.forEach(comparison => {
          if (extendedQuery.comparisons?.includes(comparison.type) && query.measures) {
            if (!query.measures.includes(comparison.member)) {
              query.measures.push(comparison.member);
            }
          }
        });
      }
    });
  }

  return query;
};

// Create a new query with default values
export const createDefaultQuery = (): ExtendedQuery => {
  return { ...defaultQuery };
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

// Update query with selected comparisons
export const updateComparisons = (query: ExtendedQuery, selectedComparisons: string[]): ExtendedQuery => {
  return {
    ...query,
    comparisons: selectedComparisons
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
