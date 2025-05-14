import { transformData } from "@/app/analyze-doc/compare/transform-data";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { UseCubeDataResult } from "../../nonce/hooks/use-cube-data";


interface UseTransformedDataOptions {
  datasets: Record<string, UseCubeDataResult>;
  joinQuery?: string | null;
}

export function useTransformedData({
  datasets,
  joinQuery,
}: UseTransformedDataOptions) {
  const primaryData = datasets.primary.data;
  const comparisonData = datasets.comparison.data;
  const isLoading = datasets.primary.isLoading || datasets.comparison.isLoading;
  const shouldFetch = joinQuery && primaryData.length && comparisonData.length && !isLoading;

  const { data, error, isValidating } = useSWR(
    shouldFetch ? [joinQuery!, primaryData, comparisonData] : null,
    async () => {
      return await transformData(
        {
          primaryData,
          comparisonData,
        },
        joinQuery!,
      );
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return {
    data: data || [],
    isLoading: isValidating && !data,
    error,
  };
}

export function useTransform(
  datasets: Record<string, unknown[]>,
  query: string,
) {
  const [result, setResult] = useState<unknown[]>([]);

  useEffect(() => {
    transformData(datasets, query).then((queryResult) => {
      setResult(queryResult);
    });
  }, [datasets, query]);

  return result;
}