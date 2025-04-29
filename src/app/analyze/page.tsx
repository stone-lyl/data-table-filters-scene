import * as React from "react";
import { columns } from "./columns";
import { data } from "./data";
import { filterFields } from "./constants";
import { DataTable } from "./data-table";
import { searchParamsCache } from "./search-params";
import { Skeleton } from "./skeleton";
import { defaultAggregations } from "../../components/data-table/aggregations";

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
        footerAggregations={defaultAggregations.slice(0, 3)}
      />
    </React.Suspense>
  );
}
