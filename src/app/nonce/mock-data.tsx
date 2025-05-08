import type { FieldType } from '@/components/data-table/types';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { formatCurrency, formatBtcAmount, formatBigNumber } from '../analyze/util/formatters';

export interface NonceRecord {
  id: string;
  period: string;
  earning: number;
  cost: number;
  hashrate: number;
  efficiency: number;
  onlineHashrate: number;
  offlineHashrate: number;
  onlineEfficiency: number;
  offlineEfficiency: number;
  onlineMiners: number;
  offlineMiners: number;
}

export const defaultColumnVisibility = {
  period: true,
  earning: true,
  cost: true,
  hashrate: true,
  efficiency: true,
  onlineHashrate: true,
  offlineHashrate: false,
  onlineEfficiency: true,
  offlineEfficiency: false,
  onlineMiners: true,
  offlineMiners: false,
};

export function generateColumns(data: NonceRecord[]): ColumnDef<NonceRecord, unknown>[] {
  if (data.length === 0) return [];

  const columns: ColumnDef<NonceRecord, unknown>[] = [
    {
      id: 'period',
      accessorKey: 'period',
      header: 'Period',
      meta: {
        fieldType: 'dimension',
        label: 'Period'
      },
      cell: ({ cell }) => {
        const value = cell.getValue();
        return format(new Date(value as string), "yyyy-MM-dd");
      },
    },
    {
      id: 'earning',
      accessorKey: 'earning',
      header: 'Earning (BTC)',
      meta: {
        fieldType: 'measure',
        label: 'Earning (BTC)'
      },
      cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return `${formatBtcAmount(value.toString())} BTC`;
      },
    },
    {
      id: 'cost',
      accessorKey: 'cost',
      header: 'Cost (USD)',
      meta: {
        fieldType: 'measure',
        label: 'Cost (USD)'
      },
      cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return `$${formatCurrency(value)}`;
      },
    },
    {
      id: 'hashrate',
      accessorKey: 'hashrate',
      header: 'Hashrate',
      meta: {
        fieldType: 'measure',
        label: 'Hashrate'
      },
      cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return `${value} TH/s`;
      },
    },
    {
      id: 'efficiency',
      accessorKey: 'efficiency',
      header: 'Efficiency',
      meta: {
        fieldType: 'measure',
        label: 'Efficiency'
      },
      cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return `${value}%`;
      },
    },
    {
      id: 'onlineHashrate',
      accessorKey: 'onlineHashrate',
      header: 'Online Hashrate',
      meta: {
        fieldType: 'measure',
        label: 'Online Hashrate'
      },
      cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return `${value} TH/s`;
      },
    },
    {
      id: 'offlineHashrate',
      accessorKey: 'offlineHashrate',
      header: 'Offline Hashrate',
      meta: {
        fieldType: 'measure',
        label: 'Offline Hashrate'
      },
      cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return `${value} TH/s`;
      },
    },
    {
      id: 'onlineEfficiency',
      accessorKey: 'onlineEfficiency',
      header: 'Online Efficiency',
      meta: {
        fieldType: 'measure',
        label: 'Online Efficiency'
      },
      cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return `${value}%`;
      },
    },
    {
      id: 'offlineEfficiency',
      accessorKey: 'offlineEfficiency',
      header: 'Offline Efficiency',
      meta: {
        fieldType: 'measure',
        label: 'Offline Efficiency'
      },
      cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return `${value}%`;
      },
    },
    {
      id: 'onlineMiners',
      accessorKey: 'onlineMiners',
      header: 'Online Miners',
      meta: {
        fieldType: 'measure',
        label: 'Online Miners'
      },
    },
    {
      id: 'offlineMiners',
      accessorKey: 'offlineMiners',
      header: 'Offline Miners',
      meta: {
        fieldType: 'measure',
        label: 'Offline Miners'
      },
    },
  ];

  // Sort columns according to defaultColumnVisibility order
  columns.sort((a, b) => {
    const aIndex = Object.keys(defaultColumnVisibility).indexOf(a.id as string);
    const bIndex = Object.keys(defaultColumnVisibility).indexOf(b.id as string);
    
    return aIndex - bIndex;
  });

  return columns;
}
