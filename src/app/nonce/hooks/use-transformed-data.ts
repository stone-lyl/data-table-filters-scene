import useSWR from 'swr';
import { transformData } from '@/app/analyze/compare/use-transform';

interface UseTransformedDataOptions {
  datasets: Record<string, unknown[]>;
  joinQuery?: string | null;
}

export function useTransformedData({ datasets, joinQuery }: UseTransformedDataOptions) {
  const shouldFetch = joinQuery && datasets.primaryData?.length;
  
  const { data, error, isValidating } = useSWR(
    shouldFetch ? [joinQuery!, datasets.primaryData, datasets.comparisonData] : null,
    async () => {
      return await transformData(datasets, joinQuery!);
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    data: data || [],
    isLoading: isValidating && !data,
    error
  };
}
