import dedent from 'dedent';
import { ColumnReference, QueryOptions, OutputableColumn } from '../types/types';

export const Aggregations = {
  sum: (column: ColumnReference) => `SUM(${toColumnNames(column)})`,
  count: (column: ColumnReference) => `COUNT(${toColumnNames(column)})`,
  avg: (column: ColumnReference) => `AVG(${toColumnNames(column)})`,
  min: (column: ColumnReference) => `MIN(${toColumnNames(column)})`,
  max: (column: ColumnReference) => `MAX(${toColumnNames(column)})`,
};

class OutputColumn {
  constructor(public expression: string, public name: string) {}

  static fromDimension(column: ColumnReference) {
    return new OutputColumn(`${toColumnNames(column)}`, column.columnName);
  }

  static fromDateDimension(column: ColumnReference) {
    return new OutputColumn(
      `${toColumnNames(column)}::timestamp`,
      column.columnName
    );
  }

  toString() {
    return `${this.expression} AS "${this.name}"`;
  }
}

export function toColumnNames(columns: ColumnReference | ColumnReference[]) {
  if (!Array.isArray(columns)) {
    columns = [columns];
  }
  return columns
    .map(({ tableName, columnName }) => `"${tableName}"."${columnName}"`)
    .join(', ');
}

export function buildQuery(options: QueryOptions) {
  const outputColumns: OutputableColumn[] = options.groupDimensions.map((g) =>
    OutputColumn.fromDimension(g)
  );

  const groupByColumns = options.groupDimensions.map((g) => toColumnNames(g));
  options.segments?.forEach((seg) => {
    groupByColumns.push(seg.expression);
    outputColumns.push(new OutputColumn(seg.expression, seg.name));
  });

  options.fields.forEach((m) => {
    outputColumns.push(new OutputColumn(m.expression, m.name));
  });

  return dedent`
    SELECT ${outputColumns.map((c) => c.toString()).join(', ')}
    FROM "${options.dataset}"
    GROUP BY ${groupByColumns.join(', ')}
    ORDER BY ${groupByColumns.join(', ')}
  `;
}

export function buildJoinQuery({
  left,
  right,
  using,
  mode,
}: {
  left: {
    /**
     * The name of the left table
     */
    name: string;
    /**
     * The query to join
     */
    query: string;
  };
  right: {
    /**
     * The name of the right table
     */
    name: string;
    /**
     * The query to join
     */
    query: string;
    /**
     * Pick columns from the right table into the result as a struct
     */
    pick?: {
      /**
       * column prefix
       */
      prefix: string;
      columns: string[];
    };
  };
  mode: 'inner' | 'left' | 'right' | 'full';
  /**
   * Columns to join
   */
  using: string[];
}) {
  const pick = right.pick;
  const columnsFromRight = pick
    ? `, ${pick.columns
        .map((it) => `"${right.name}"."${it}" AS "${pick.prefix}${it}"`)
        .join(', ')}`
    : '';
  return dedent`
  WITH "${left.name}" AS (${left.query}),
  "${right.name}" AS (${right.query})
  SELECT "${left.name}".*${columnsFromRight}
  FROM "${left.name}"
  ${mode} JOIN "${right.name}"
  USING (${using.map((it) => `"${it}"`).join(', ')})
  `;
}

export interface WindowDef {
  partitionBy: string[];
  orderBy: string;
}

function quoteColumnName(columnOrTable: string) {
  return `"${columnOrTable}"`;
}

function buildWindowDef({ partitionBy, orderBy }: WindowDef) {
  return `PARTITION BY ${partitionBy
    .map(quoteColumnName)
    .join(', ')} ORDER BY ${quoteColumnName(orderBy)}`;
}

export const windowFunctions = {
  lag: (
    expr: string,
    offset: number,
    defaultValue?: string | null,
    window?: WindowDef
  ) => {
    let result = `LAG(${expr}, ${offset}, ${
      defaultValue == null ? 'NULL' : defaultValue
    })`;

    if (window) {
      result += ` OVER (${buildWindowDef(window)})`;
    }
    return result;
  },
};
