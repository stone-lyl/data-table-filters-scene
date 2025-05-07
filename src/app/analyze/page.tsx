import * as React from "react";
import { Suspense } from "react";
import { searchParamsCache } from "./const/search-params";
import { Skeleton } from "./components/skeleton";
import { AnalyticsTable } from "./analytics-table";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/custom/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = searchParamsCache.parse(await searchParams);
  
  return (
    <>
      <div className="container mx-auto py-4 flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link href="/analyze-doc">View Documentation</Link>
        </Button>
      </div>
      <Suspense fallback={<Skeleton />}>
        <AnalyticsTable search={search} />
      </Suspense>
    </>  
  );
}
