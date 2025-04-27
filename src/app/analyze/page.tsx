import * as React from "react";
import { columns } from "./columns";
import { data } from "./data";
import { filterFields } from "./constants";
import { DataTable } from "./data-table";
import { searchParamsCache } from "./search-params";
import { Skeleton } from "./skeleton";
import { Calculator, ArrowDownUp, Plus } from "lucide-react";
import { AggregationConfig } from "./data-table-footer";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = searchParamsCache.parse(await searchParams);

  return (
    <React.Suspense fallback={<Skeleton />}>
      <DataTable
        columns={columns}
        data={data}
        filterFields={filterFields}
        defaultGrouping={[
          // "firstName"
        ]}
        defaultColumnFilters={Object.entries(search)
          .map(([key, value]) => ({
            id: key,
            value,
          }))
          .filter(({ value }) => value ?? undefined)}
        footerAggregations={[
          { type: 'count', label: 'Count', icon: <Calculator className="h-4 w-4 text-muted-foreground" /> },
          { type: 'average', label: 'Avg', icon: <ArrowDownUp className="h-4 w-4 text-muted-foreground" /> },
          { type: 'sum', label: 'Sum', icon: <Plus className="h-4 w-4 text-muted-foreground" /> },
        ]}
        // footerFormatters={{
        //   currency: (value: number) => {
        //     return new Intl.NumberFormat('en-US', {
        //       style: 'currency',
        //       currency: 'USD',
        //       minimumFractionDigits: 0,
        //       maximumFractionDigits: 0
        //     }).format(value);
        //   }
        // }}
      />
    </React.Suspense>
  );
}
