import { REGIONS } from "@/constants/region";
import { TAGS } from "@/constants/tag";

export type ColumnSchema = {
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
