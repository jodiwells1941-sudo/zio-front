import React from 'react';
import type { TransferRow } from '../types';

export default function StatusTd({ status }: { status: TransferRow['status'] }) {
  const cls =
    status == 2
      ? 'status-pending'
      : status === 1
        ? 'status-confirmed'
        : 'status-cancelled';

  return <td className={cls}>{status === 1 ? 'Completed' : 'Failed'}</td>;
}