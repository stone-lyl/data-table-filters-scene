import { describe, it, expect } from 'vitest';
import { 
  buildQuery, 
  buildJoinQuery, 
  toColumnNames, 
  Aggregations,
  windowFunctions} from './query-builder';
import {
  type ColumnReference,
  type QueryOptions
} from '@/app/analyze-doc/types/types';

describe('query-builder', () => {
  describe('toColumnNames', () => {
    it('should format a single column reference correctly', () => {
      const column: ColumnReference = { tableName: 'users', columnName: 'name' };
      expect(toColumnNames(column)).toBe('"users"."name"');
    });

    it('should format multiple column references correctly', () => {
      const columns: ColumnReference[] = [
        { tableName: 'users', columnName: 'name' },
        { tableName: 'orders', columnName: 'total' }
      ];
      expect(toColumnNames(columns)).toBe('"users"."name", "orders"."total"');
    });
  });

  describe('Aggregations', () => {
    it('should create sum aggregation', () => {
      const column: ColumnReference = { tableName: 'orders', columnName: 'total' };
      expect(Aggregations.sum(column)).toBe('SUM("orders"."total")');
    });

    it('should create count aggregation', () => {
      const column: ColumnReference = { tableName: 'users', columnName: 'id' };
      expect(Aggregations.count(column)).toBe('COUNT("users"."id")');
    });

    it('should create avg aggregation', () => {
      const column: ColumnReference = { tableName: 'products', columnName: 'price' };
      expect(Aggregations.avg(column)).toBe('AVG("products"."price")');
    });
  });

  describe('buildQuery', () => {
    it('should build a query with group dimensions and measures', () => {
      const options: QueryOptions = {
        dataset: 'sales',
        groupDimensions: [
          { tableName: 'sales', columnName: 'region' },
          { tableName: 'sales', columnName: 'date' }
        ],
        fields: [
          { name: 'total_sales', expression: 'SUM("sales"."amount")' },
          { name: 'avg_sales', expression: 'AVG("sales"."amount")' }
        ]
      };

      const query = buildQuery(options);
      
      expect(query).toMatchInlineSnapshot(`
        "SELECT "sales"."region" AS "region", "sales"."date" AS "date", SUM("sales"."amount") AS "total_sales", AVG("sales"."amount") AS "avg_sales"
        FROM "sales"
            GROUP BY "sales"."region", "sales"."date"
        ORDER BY "sales"."region", "sales"."date""
      `);
    });

    it('should include segments in the query when provided', () => {
      const options: QueryOptions = {
        dataset: 'sales',
        groupDimensions: [
          { tableName: 'sales', columnName: 'region' }
        ],
        segments: [
          { name: 'month', expression: 'DATE_TRUNC(\'month\', "sales"."date")' }
        ],
        fields: [
          { name: 'total_sales', expression: 'SUM("sales"."amount")' }
        ]
      };

      const query = buildQuery(options);
      
      expect(query).toMatchInlineSnapshot(`
        "SELECT "sales"."region" AS "region", DATE_TRUNC('month', "sales"."date") AS "month", SUM("sales"."amount") AS "total_sales"
        FROM "sales"
            GROUP BY "sales"."region", DATE_TRUNC('month', "sales"."date")
        ORDER BY "sales"."region", DATE_TRUNC('month', "sales"."date")"
      `);
    });
  });

  describe('buildJoinQuery', () => {
    it('should build a join query with inner join', () => {
      const joinQuery = buildJoinQuery({
        left: {
          name: 'users',
          query: 'SELECT * FROM users'
        },
        right: {
          name: 'orders',
          query: 'SELECT * FROM orders'
        },
        using: ['user_id'],
        mode: 'inner'
      });

      expect(joinQuery).toMatchInlineSnapshot(`
        "WITH "users" AS (SELECT * FROM users),
        "orders" AS (SELECT * FROM orders)
        SELECT "users".*
        FROM "users"
        inner JOIN "orders"
        USING ("user_id")"
      `);
    });

    it('should include picked columns from right table when specified', () => {
      const joinQuery = buildJoinQuery({
        left: {
          name: 'users',
          query: 'SELECT * FROM users'
        },
        right: {
          name: 'orders',
          query: 'SELECT * FROM orders',
          pick: {
            prefix: 'order_',
            columns: ['id', 'date']
          }
        },
        using: ['user_id'],
        mode: 'left'
      });

      expect(joinQuery).toMatchInlineSnapshot(`
        "WITH "users" AS (SELECT * FROM users),
        "orders" AS (SELECT * FROM orders)
        SELECT "users".*, "orders"."id" AS "order_id", "orders"."date" AS "order_date"
        FROM "users"
        left JOIN "orders"
        USING ("user_id")"
      `);
    });
  });

  describe('windowFunctions', () => {
    it('should create a lag function without window definition', () => {
      const result = windowFunctions.lag('column', 1, '0');
      expect(result).toBe('LAG(column, 1, 0)');
    });

    it('should create a lag function with window definition', () => {
      const result = windowFunctions.lag('column', 1, '0', {
        partitionBy: ['group'],
        orderBy: 'date'
      });
      expect(result).toBe('LAG(column, 1, 0) OVER (PARTITION BY "group" ORDER BY "date")');
    });

    it('should handle null default value', () => {
      const result = windowFunctions.lag('column', 1, null);
      expect(result).toBe('LAG(column, 1, NULL)');
    });
  });
});
