# AnalyticsTableCore

`AnalyticsTableCore` is a powerful and flexible core component for building data analytics tables in React applications. It provides the foundation for creating feature-rich, interactive data tables with advanced functionality like filtering, sorting, grouping, and pagination.

## Overview

The `AnalyticsTableCore` component serves as the infrastructure layer for data tables, handling state management, table configuration, and layout. It uses the TanStack Table library (formerly React Table) under the hood and provides a comprehensive API for building customizable data tables.

## Key Features

- **Advanced Data Handling**: Supports filtering, sorting, grouping, and pagination
- **Customizable Layout**: Provides slots for sidebar, controls, and pagination components
- **Persistent State**: Maintains column visibility in local storage
- **URL Synchronization**: Syncs filter state with URL parameters
- **Extensible**: Supports custom event handlers for rows and headers
- **Aggregation Support**: Enables footer aggregations for data analysis

## Usage

```tsx
import { AnalyticsTableCore } from "./analytics-table-core";
import { columns } from "./columns";
import { data } from "./data";
import { filterFields } from "./constants";

export function MyAnalyticsTable() {
  return (
    <AnalyticsTableCore<MyDataType, unknown>
      columns={columns}
      data={data}
      filterFields={filterFields}
      // Additional props as needed
    />
  );
}
```

## Props

The `AnalyticsTableCore` component accepts the following props:

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | Array of column definitions for the table |
| `data` | `TData[]` | Array of data objects to display in the table |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDataChange` | `(data: TData[]) => void` | `undefined` | Callback function when data changes |
| `defaultColumnFilters` | `ColumnFiltersState` | `[]` | Initial column filters state |
| `defaultGrouping` | `GroupingState` | `[]` | Initial grouping state |
| `filterFields` | `DataTableFilterField<TData>[]` | `[]` | Fields that can be filtered |
| `footerAggregations` | `AggregationConfig<TData>[]` | `[]` | Configuration for footer aggregations |
| `sidebarSlot` | `React.ReactNode` | `undefined` | Custom sidebar component |
| `controlsSlot` | `React.ReactNode` | `undefined` | Custom controls component |
| `paginationSlot` | `React.ReactNode` | `undefined` | Custom pagination component |
| `rowEventHandlers` | `RowEventHandlersFn<TData>` | `undefined` | Event handlers for table rows |
| `headerRowEventHandlers` | `HeaderRowEventHandlersFn<TData>` | `undefined` | Event handlers for table header rows |

## Architecture

The component follows a slot-based architecture that allows for flexible composition:

```
AnalyticsTableCore
├── DataTableProvider (Context Provider)
│   ├── sidebarSlot (Custom Sidebar)
│   ├── controlsSlot (Custom Controls)
│   ├── TableRender (Table Rendering)
│   └── paginationSlot (Custom Pagination)
```

## State Management

`AnalyticsTableCore` manages several pieces of state:

- **Column Filters**: Controls filtering of data rows
- **Sorting**: Manages column sorting order
- **Grouping**: Handles row grouping by columns
- **Expanded**: Tracks which grouped rows are expanded
- **Pagination**: Manages current page and page size
- **Column Visibility**: Controls which columns are visible (persisted in localStorage)
- **Footer Aggregations**: Manages aggregation calculations in the table footer

## URL Synchronization

The component automatically synchronizes column filters with URL search parameters, enabling:

- Shareable filtered views
- Browser history navigation between different filter states
- Persistent filters across page refreshes

## Example: Creating a Complete Analytics Table

```tsx
import { AnalyticsTableCore } from "./analytics-table-core";
import { columns } from "./columns";
import { data } from "./data";
import { filterFields } from "./constants";
import { DataTableFilterControls } from "@/components/data-table/data-table-filter-controls";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

export function AnalyticsTable() {
  // Custom sidebar with filter controls
  const sidebar = (
    <div className="w-64 p-4">
      <DataTableFilterControls />
    </div>
  );
  
  // Custom controls with toolbar
  const controls = <DataTableToolbar />;
  
  // Custom pagination
  const pagination = <DataTablePagination />;
  
  return (
    <AnalyticsTableCore
      columns={columns}
      data={data}
      filterFields={filterFields}
      sidebarSlot={sidebar}
      controlsSlot={controls}
      paginationSlot={pagination}
    />
  );
}
```

## Advanced Usage: Custom Event Handlers

You can add custom event handlers to rows and header rows:

```tsx
import { AnalyticsTableCore } from "./analytics-table-core";
import { columns } from "./columns";
import { data } from "./data";

export function AnalyticsTableWithEvents() {
  // Row click handler
  const rowEventHandlers = (row) => ({
    onClick: () => {
      console.log("Row clicked:", row.original);
    },
  });
  
  // Header click handler
  const headerRowEventHandlers = (headers, index) => ({
    onClick: () => {
      console.log("Header clicked:", headers[index].id);
    },
  });
  
  return (
    <AnalyticsTableCore
      columns={columns}
      data={data}
      rowEventHandlers={rowEventHandlers}
      headerRowEventHandlers={headerRowEventHandlers}
    />
  );
}
```

## Notes

- The component uses a custom implementation of `getFacetedUniqueValues` to handle arrays of strings, but this may not work for all data types.
- Column visibility state is persisted in localStorage with the key "data-table-visibility".
- The component is designed to be used with the `DataTableProvider` context for sharing state with child components.

## Related Components

- `TableRender`: Handles the actual rendering of the table structure
- `DataTableProvider`: Provides table context to child components
- `AnalyticsTable`: Higher-level component that uses AnalyticsTableCore with predefined slots
