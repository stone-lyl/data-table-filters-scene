import { Suspense } from 'react';
import { Skeleton } from '../default/skeleton';
import { CubeNonceTable } from './cube-provider';

export default function NoncePage() {
  return (

    <Suspense fallback={<Skeleton />}>
        <CubeNonceTable />
    </Suspense>
  );
}
