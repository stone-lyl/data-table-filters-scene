# 数据分析表格文档


`AnalyticsTableCore` 是一个强大而灵活的核心组件，用于在 React 应用程序中构建数据分析表格。它为创建功能丰富、交互式的数据表格提供了基础，支持分组、聚合计算、数据对比、分页、过滤、排序、和横向虚拟滚动等高级功能。

## 主要特性

- **虚拟化表格**：高效处理大型数据集，只渲染可见区域的行和列
- **固定表头和表尾**：在滚动浏览大型数据集时保持重要信息可见
- **聚合计算**：使用 Decimal.js 进行高精度的数据聚合，如求和、计数、平均值等
- **数据分组**：支持多级分组，对相关数据进行层次分析
- **数据对比**：支持数据对比，显示当前值、变化量和变化率
- **高级过滤**：使用复杂条件过滤数据，支持多种数据类型
- **列自定义**：显示/隐藏列并根据需要调整大小
- **状态持久化**：在本地存储中维护列可见性和过滤器状态
- **URL 同步**：将过滤器状态与 URL 参数同步，便于分享和恢复视图
- **可扩展性**：支持行和表头的自定义事件处理
- **加载状态**：内置加载状态和自定义加载组件支持

## 概述

`AnalyticsTableCore` 组件作为数据表格的基础层，处理状态管理、表格配置和布局。它底层使用 TanStack Table 库和 TanStack Virtual 库，提供了全面的 API 来构建高性能、可定制的数据表格。


## 架构

该组件遵循基于插槽的架构，允许灵活组合：

```
AnalyticsTableCore
├── DataTableProvider (上下文提供者)
│   ├── sidebarSlot (自定义侧边栏)
│   ├── controlsSlot (自定义控件)
│   ├── TableRender (表格渲染)
│   │   ├── VirtualizedTableHeader (虚拟化表头)
│   │   ├── VirtualizedTableBody (虚拟化表体)
│   │   └── DataTableFooter (表格页脚与聚合)
│   └── paginationSlot (自定义分页)
```

## 实现

分析表格由几个关键组件构建：

```tsx
// 渲染分析表格的主组件
<AnalyticsTable search={search} data={data} />

// 带聚合功能的核心表格功能 (客户端组件)
<AnalyticsTableCoreClient
  columns={columns}
  data={data}
  footerAggregations={aggregations}
  tableClassName="max-h-[850px] rounded-md border"
/>

// 带固定表头和表尾的表格渲染
<TableRender
  onRow={rowEventHandlers}
  onHeaderRow={headerRowEventHandlers}
/>

// 带聚合的表尾
<DataTableFooter sticky={true} />
```

## 状态管理

`AnalyticsTableCore` 管理多个状态：

- **列过滤器**：控制数据行的过滤
- **排序**：管理列排序顺序，可以进行自定义排序
- **分组**：处理按列分组的行，支持多级分组
- **分页**：管理当前页面和页面大小
- **列可见性**：控制哪些列可见（在 localStorage 中持久化）
- **表尾聚合**：管理表尾中的聚合计算

## URL 同步

该组件自动将列过滤器与 URL 搜索参数同步，实现：

- 可共享的过滤视图
- 在不同过滤状态之间的浏览器历史导航
- 页面刷新后过滤器持久化

## 行分组（Row Grouping）

`AnalyticsTableCore` 提供了强大的行分组功能，允许用户按照一个或多个列对数据进行分组，以便更好地分析和理解数据关系。

<video width="320" height="240" controls>
  <source src="https://github.com/user-attachments/assets/7ae11d0a-901a-4867-9f41-a9b633ebdd26" type="video/mp4">
  您的浏览器不支持视频标签
</video>


### 主要特性

- **多级分组**：支持按多个列进行嵌套分组，创建层次结构视图
- **可展开/折叠**：用户可以展开或折叠分组，以便专注于特定数据集
- **分组聚合**：自动计算每个分组的聚合值（如总和、平均值、计数等）
- **分组持久化**：分组状态可以保存在应用状态中，在会话之间保持一致
- **智能列筛选**：自动识别可分组的维度列，仅显示有意义的分组选项

### 实现方式

分组功能通过 TanStack Table 的 `getGroupedRowModel` 和 `getExpandedRowModel` 实现：

```tsx
const table = useReactTable({
  // 其他配置...
  state: { grouping, expanded, /* 其他状态... */ },
  onGroupingChange: setGrouping,
  onExpandedChange: setExpanded,
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
});
```

### 分组按钮组件

`DataTableGroupButtons` 组件提供了直观的用户界面，允许用户快速切换不同的分组维度：

```tsx
<DataTableGroupButtons />
```

### 使用示例

```tsx
<AnalyticsTableCoreClient
  columns={columns}
  data={data}
  defaultGrouping={["storeRegion", "paymentMethod"]} // 默认按区域和支付方式分组
  controlsSlot={<DataTableGroupButtons />} // 添加分组按钮到控件区
  // 其他配置...
/>
```

### 列定义中的分组配置

在列定义中，可以配置列的分组相关属性：

```tsx
const columns = [
  {
    id: "storeRegion",
    header: "区域",
    accessorKey: "storeRegion",
    enableGrouping: true, // 启用分组
    meta: {
      fieldType: "dimension" // 标记为维度列，使其显示在分组按钮中
    },
    aggregationFn: customSum, // 自定义聚合函数在 row grouping 时
  },
  // 其他列...
];
```

## 数据比较（Compare）

![compare](https://github.com/user-attachments/assets/37c2d1b3-2ae7-4226-99e2-cf315c65c86e)

数据比较功能允许用户比较不同时间段或不同条件下的数据，以便识别趋势、变化和异常。这是数据分析中的关键功能，特别适用于财务分析、性能监控和业务指标跟踪。

### 主要特性

- **时间比较**：比较不同时间段的数据（如今年与去年、本月与上月）
- **可视化差异**：通过颜色编码和箭头直观显示变化方向和幅度
- **百分比和绝对值比较**：同时显示绝对变化和百分比变化
- **自定义格式化**：支持货币、百分比、数字等多种格式化选项
- **详细工具提示**：悬停时显示详细的比较信息

### 核心组件

#### 1. ComparisonCell 组件

`ComparisonCell` 是一个灵活的组件，用于显示当前值与比较值之间的差异：

```tsx
<ComparisonCell 
  data={{
    currentValue: 100,
    previousValue: 80,
    currentDate: "2024-05-01",
    previousDate: "2024-04-01"
  }}
  formatInfo={{ type: "currency", unit: "$" }}
  comparisonType="both" // "absolute", "percentage", 或 "both"
  showDate={true}
/>
```

#### 2. 查询构建工具

比较功能依赖于强大的查询构建工具，支持：

- **表连接**：通过 `buildJoinQuery` 函数连接当前和历史数据表
- **聚合函数**：使用 `Aggregations` 对象进行数据聚合（sum、count、avg等）
- **窗口函数**：使用 `windowFunctions` 进行时间序列分析（如 lag 函数）

```tsx
// 构建当前年度查询
const currentYearQuery = buildQuery({
  dataset: currentYearTableName,
  groupDimensions: groupDims(currentYearTableName),
  segments: [{ name: 'yearMonth', expression: `datetrunc('month', "date"::timestamp)` }],
  fields: [
    totalAmount(currentYearTableName),
    { name: 'periodKey', expression: `"yearMonth"` }
  ],
});

// 构建上一年度查询
const lastYearQuery = buildQuery({
  dataset: lastYearTableName,
  groupDimensions: groupDims(lastYearTableName),
  segments: [{ name: 'yearMonth', expression: `datetrunc('month', "date"::timestamp)` }],
  fields: [
    totalAmount(lastYearTableName),
    { name: 'periodKey', expression: 'date_add("yearMonth", INTERVAL 1 YEAR)' }
  ],
});

// 连接两个查询
const query = buildJoinQuery({
  left: { name: 'currentYearResult', query: currentYearQuery },
  right: {
    name: 'lastYearResult',
    query: lastYearQuery,
    pick: { prefix: 'c_', columns: ['totalAmount'] }
  },
  using: ['storeRegion', 'paymentMethod', 'periodKey'],
  mode: 'left'
});
```

#### 3. 数据转换

`useTransformedData` 钩子用于处理和转换比较数据：

```tsx
  const data = useTransformedData({
    datasets: {
      primary: currentYearData,
      comparison: lastYearData
    },
    joinQuery: query
  });
```

### 实际应用

比较功能在以下场景特别有用：

- **财务仪表板**：比较不同时期的收入、支出和利润
- **销售分析**：比较不同区域、产品或时间段的销售表现
- **性能监控**：比较系统或应用程序在不同条件下的性能指标
- **趋势分析**：识别数据随时间的变化趋势和模式

### 自定义比较单元格

可以使用 `customComparisonFormatterFactory` 创建自定义比较格式化器：

```tsx
const customFormatter = customComparisonFormatterFactory(
  (value) => `${value.toFixed(2)}元`,  // 值格式化函数
  false  // 是否隐藏百分比
);

<ComparisonCell 
  data={data}
  customComparisonFormatter={customFormatter}
/>

```


## 聚合配置

<video width="320" height="240" controls>
  <source src="https://github.com/user-attachments/assets/d23fc822-a612-4325-9531-63d4a953ca9f" type="video/mp4">
  您的浏览器不支持视频标签
</video>

```ts
export interface AggregationConfig<TData> {
  type: AggregationType; // 聚合类型, 如 sum, count 等
  label: string; // 聚合标签，如 "总和", "计数" 等
  icon: React.ReactElement; // 聚合图标
  aggregationMethod?: (columnId: string, values: any[], table: Table<TData>) => React.ReactNode; // 聚合逻辑，例如求和、计数等
  isTotal?: boolean; // 是否使用所有行（true）或仅使用分页的叶子行（false）
}
```

通过 `footerAggregations` 属性配置聚合：

```tsx
const defaultAggregations = [
  {
    type: "sum",
    label: "总和",
    aggregationMethod: (columnId, values, table) => {
      // 自定义聚合逻辑
      return sum(values);
    }
  },
  {
    type: "count",
    label: "计数",
    aggregationMethod: (columnId, values, table) => {
      return values.length;
  }
  }
];
```

## 粘性表尾

<video width="320" height="240" controls>
  <source src="https://github.com/user-attachments/assets/4f745b0e-1677-47ec-91e2-9844cbe5d8b7" type="video/mp4">
  您的浏览器不支持视频标签
</video>
`AnalyticsTableCore` 提供了粘性表尾（Sticky Footer）功能，这些功能在处理大型数据集时特别有用。

### 粘性表尾

```tsx
// 在表尾组件中实现粘性效果
<TableFooter 
  data-testid="table-footer" 
  className={cn("bg-background sticky bottom-0 z-20 grid")} 
>
  {/* 表尾内容 */}
</TableFooter>
```

## Row & HeaderRow 事件处理

```tsx
export interface RowEventHandlers {
  onDoubleClick: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
}

/**
 * Type for a function that generates row event handlers
 */
export type RowEventHandlersFn<TData> = (row: Row<TData>, rowIndex: number) => RowEventHandlers;

/**
 * Type definition for header row event handlers
 */
export interface HeaderRowEventHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

/**
 * Type for a function that generates header row event handlers
 */
export type HeaderRowEventHandlersFn<TData> = (columns: Header<TData, unknown>[], index: number) => HeaderRowEventHandlers;

```

### 使用示例
您可以为行和表头行添加自定义事件处理程序：

```tsx
export function AnalyticsTableWithEvents() {
  // 行点击处理程序
  const rowEventHandlers = (row) => ({
    onClick: () => {
      console.log("行被点击:", row.original);
    },
  });
  
  // 表头点击处理程序
  const headerRowEventHandlers = (headers, index) => ({
    onClick: () => {
      console.log("表头被点击:", headers[index].id);
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

## 横向虚拟滚动(性能优化)

`AnalyticsTableCore` 实现了高效的横向虚拟滚动，使其能够处理大量列的数据表格，同时保持出色的性能。

### 核心特性

**动态列渲染**：只渲染当前可见视口中的列，显著减少 DOM 节点数量

### 技术实现

与垂直虚拟滚动不同，横向虚拟滚动使用特殊的填充策略，在表格左右两侧添加虚拟元素，而非使用绝对定位：

```tsx
const virtualPadding = React.useMemo(() => {
  let left: number | null = null;
  let right: number | null = null;

  if (columnVirtualizer && virtualColumns?.length) {
    left = virtualColumns[0]?.start ?? null;
    right =
      columnVirtualizer.getTotalSize() -
      (virtualColumns[virtualColumns.length - 1]?.end ?? null);
  }

  return { left, right };
}, [columnVirtualizer, virtualColumns]);
```


## 属性

`AnalyticsTableCore` 组件接受以下属性：

### 必需属性

`AnalyticsTableCore` 组件需要这些属性：

```
属性        类型                          描述
--------   ---------------------------   --------------------------------------
columns    ColumnDef<TData, TValue>[]    表格的列定义数组
data       TData[]                       表格中显示的数据对象数组
```

### 可选属性

这些属性是可选的，提供额外功能：

```
属性                   类型                            默认值         描述
--------------------  ------------------------------  -----------   ---------------------------------
onDataChange          (data: TData[]) => void         undefined     数据更改时的回调函数
defaultColumnFilters  ColumnFiltersState              []            初始列过滤器状态
defaultGrouping       GroupingState                   []            初始分组状态
filterFields          DataTableFilterField<TData>[]   []            可以过滤的字段
footerAggregations    AggregationConfig<TData>[]      []            表尾聚合配置
sidebarSlot           React.ReactNode                 undefined     自定义侧边栏组件
controlsSlot          React.ReactNode                 undefined     自定义控件组件
paginationSlot        React.ReactNode                 undefined     自定义分页组件
```

## 示例：创建完整的分析表格

```tsx
import { AnalyticsTableCore } from "./analytics-table-core";
import { columns } from "./columns";
import { data } from "./data";
import { filterFields } from "./constants";
import { DataTableFilterControls } from "@/components/data-table/data-table-filter-controls";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

export function AnalyticsTable() {
  // 带过滤控件的自定义侧边栏
  const sidebar = (
    <div className="w-64 p-4">
      <DataTableFilterControls />
    </div>
  );
  
  // 带工具栏的自定义控件
  const controls = <DataTableToolbar />;
  
  // 自定义分页
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




## 示例页面展示

`AnalyticsTableCoreClient` 组件在不同场景下的应用展示通过三个不同的演示页面实现，每个页面展示了该组件的不同功能和特性。

### 1. 基础数据分析页面 (/analyze)

`/analyze` 页面是一个全功能的数据分析平台演示，展示了 `AnalyticsTableCoreClient` 的核心功能：

- **完整的表格功能**：包括排序、过滤、分组和分页
- **侧边栏集成**：展示了侧边栏插槽的使用方式
- **自定义控件**：包括过滤命令、工具栏、页脚按钮和分组按钮
- **URL 同步**：演示了如何将过滤器状态与 URL 参数同步
- **行编辑功能**：展示了行编辑模式的集成

```tsx
// 基础数据分析页面的实现
export default async function Page({
  searchParams,
}) {
  const search = searchParamsCache.parse(await searchParams);
  
  return (
    <Suspense fallback={<Skeleton />}>
      <AnalyticsTable search={search} />
    </Suspense>
  );
}
```

### 2. 数据比较页面 (/compare)

`/compare` 页面专注于展示 `AnalyticsTableCoreClient` 的数据比较功能，允许用户直观地比较不同数据集：

- **多表格布局**：同时显示多个相关数据表
- **表连接功能**：展示如何连接不同数据源进行比较
- **比较可视化**：使用特殊的单元格渲染器显示数据变化
- **时间序列分析**：展示不同时间段的数据对比

```tsx
// 数据比较页面的实现
export default function ComparePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">数据比较</h1>
      <Suspense fallback={<div>加载比较数据中...</div>}>
        <CompareTable />
      </Suspense>
    </div>
  );
}
```

### 3. 数据分析仪表板 (/nonce)

`/nonce` 页面展示了 `AnalyticsTableCoreClient` 与外部数据源（Cube.js）的集成，展示了如何将该组件用于实时数据分析场景：

- **外部数据源集成**：与 Cube.js 数据分析平台的无缝集成
- **实时数据分析**：展示了如何处理和分析实时数据
- **自定义侧边栏**：包含特定于挖矿性能的过滤器和控件
- **时间比较选择器**：允许用户选择不同的时间范围进行比较

```tsx
// 数据分析仪表板的实现
export function CubeNonceTable(props) {
  return (
    <CubeProvider cubeApi={cubejsApi}>
      <NonceTable {...props} />
    </CubeProvider>
  );
}
```

### 各页面的优势和特点

| 页面 | 主要功能 | 适用场景 |
|---------|------------|------------|
| /analyze | 全功能数据分析表格 | 通用数据分析、数据浏览和管理 |
| /compare | 数据比较和连接 | 财务分析、销售比较、趋势分析 |
| /nonce | 外部数据源集成 | 实时仪表板、性能监控、数据可视化 |

这三个演示页面展示了 `AnalyticsTableCoreClient` 组件的灵活性和可定制性，说明它可以适应各种不同的数据分析需求和场景。


## 最佳实践

- **数据准备**：在分析前清理和规范化数据
- **列选择**：只显示相关列，避免信息过载
- **聚合选择**：选择提供有意义见解的聚合
- **分组策略**：以突出重要模式的方式对数据进行分组
- **过滤组合**：结合使用过滤器缩小到特定见解

## 相关组件

- `TableRender`：处理表格结构的实际渲染
- `DataTableProvider`：为子组件提供表格上下文
- `AnalyticsTable`：使用预定义插槽的 AnalyticsTableCore 的高级组件

## 注意事项

- 该组件使用 `getFacetedUniqueValues` 的自定义实现来处理字符串数组，但这可能不适用于所有数据类型。
- 列可见性状态在 localStorage 中持久化，键为 "data-table-visibility"。
- 该组件设计为与 `DataTableProvider` 上下文一起使用，以与子组件共享状态。
