import { Suspense } from 'react';
import { Skeleton } from '../default/skeleton';
import { NonceTable } from './nonce-table';
import { generateNonceData } from './mock-data';

export default function NoncePage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <NonceTable initialData={generateNonceData(20)} />
    </Suspense>
  );
}
