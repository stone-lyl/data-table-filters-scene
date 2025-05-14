import { REGIONS } from "@/constants/region";
import { TAGS } from "@/constants/tag";

export type ColumnSchema = {
  id: string;
  // name: string;
  firstName: string;
  lastName: string;
  url: string;
  public: boolean;
  active: boolean;
  regions: (typeof REGIONS)[number][];
  tags: (typeof TAGS)[number][];
  date: Date;
  p95?: number | undefined;
  cost: number;
  earning: number;
  bigNumber: string;
  btcAmount: string;
};
export interface ColumnReference {
  tableName: string;
  columnName: string;
}

export interface GenericColumnDefinition {
  name: string;
  expression: string;
}

export interface OutputableColumn {
  toString(): string;
}

export interface QueryOptions {
  /**
   * Table name of the main dataset
   */
  dataset: string;
  /**
   * Group rows by these dimensions
   */
  groupDimensions: ColumnReference[];
  /**
   * create segments from these expressions
   */
  segments?: GenericColumnDefinition[];
  fields: GenericColumnDefinition[];
}
