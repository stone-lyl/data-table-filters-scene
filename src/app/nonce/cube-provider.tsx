'use client';

import React from 'react';
import cube from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';
import { NonceTable, NonceTableProps } from './nonce-table';

// Create Cube.js API client
const cubejsApi = cube(
  process.env.NEXT_PUBLIC_CUBEJS_TOKEN! || '',
  { apiUrl: process.env.NEXT_PUBLIC_CUBEJS_API_URL! || '' }
);

export function CubeNonceTable(props: NonceTableProps) {
  return (
    <CubeProvider cubeApi={cubejsApi}>
      <NonceTable {...props} />
    </CubeProvider>
  );
}
