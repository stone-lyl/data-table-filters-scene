import useSWR from 'swr';
import { transformData } from '@/app/analyze-doc/compare/use-transform';
import { UseCubeDataResult } from '../../nonce/hooks/use-cube-data';

interface UseTransformedDataOptions {
  datasets: Record<string, UseCubeDataResult>;
  joinQuery?: string | null;
}

export function useTransformedData({ datasets, joinQuery }: UseTransformedDataOptions) {
  const primaryData = datasets.primary.data;
  const comparisonData = datasets.comparison.data;
  const isLoading = datasets.primary.isLoading || datasets.comparison.isLoading;
  const shouldFetch = joinQuery && primaryData.length && !isLoading;
  
  const { data, error, isValidating } = useSWR(
    shouldFetch ? [joinQuery!, primaryData, comparisonData] : null,
    async () => {
      return await transformData({
        primaryData,
        comparisonData
      }, joinQuery!);
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
