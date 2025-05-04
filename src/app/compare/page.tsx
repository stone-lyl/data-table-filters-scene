import * as React from "react";
import { Suspense } from "react";
import CompareTable from "./compare-table";

export default function ComparePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Data Comparison</h1>
      <Suspense fallback={<div>Loading comparison data...</div>}>
        <CompareTable />
      </Suspense>
    </div>
  );
}
