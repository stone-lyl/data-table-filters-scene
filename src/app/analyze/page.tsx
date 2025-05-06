import * as React from "react";
import { Suspense } from "react";
import { searchParamsCache } from "./const/search-params";
import { Skeleton } from "./components/skeleton";
import { AnalyticsTable } from "./analytics-table";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = searchParamsCache.parse(await searchParams);
  
  return (
    <Suspense fallback={<Skeleton />}>
      <AnalyticsTable search={search} />
    </Suspense>
  );
}
