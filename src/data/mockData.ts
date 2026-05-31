/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Saver, Transaction } from '../types';

export const INITIAL_SAVERS: Saver[] = [
  {
    id: 'saver-1',
    name: 'Ahmad Syarif',
    targetName: 'Beli Laptop Kuliah',
    targetAmount: 6000000,
    createdAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'saver-2',
    name: 'Siti Rahma',
    targetName: 'Dana Liburan Akhir Tahun',
    targetAmount: 3000000,
    createdAt: '2026-05-05T09:30:00Z',
  },
  {
    id: 'saver-3',
    name: 'Adit Pratama',
    targetName: 'Sepeda Gunung',
    targetAmount: 2500000,
    createdAt: '2026-05-10T14:20:00Z',
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    saverId: 'saver-1',
    type: 'deposit',
    amount: 1500000,
    category: 'Gaji / Pendapatan',
    note: 'Gaji magang bulan pertama',
    date: '2026-05-02T10:00:00Z',
  },
  {
    id: 'tx-2',
    saverId: 'saver-1',
    type: 'deposit',
    amount: 500000,
    category: 'Sisa Belanja',
    note: 'Sisa uang jajan bulanan',
    date: '2026-05-10T11:15:00Z',
  },
  {
    id: 'tx-3',
    saverId: 'saver-1',
    type: 'withdraw',
    amount: 250000,
    category: 'Makanan & Minuman',
    note: 'Traktir teman ulang tahun',
    date: '2026-05-12T19:30:00Z',
  },
  {
    id: 'tx-4',
    saverId: 'saver-1',
    type: 'deposit',
    amount: 300000,
    category: 'Hadiah / Kado',
    note: 'Hadiah dari paman',
    date: '2026-05-20T09:00:00Z',
  },
  {
    id: 'tx-5',
    saverId: 'saver-2',
    type: 'deposit',
    amount: 800000,
    category: 'Uang Saku / Jajan',
    note: 'Buka tabungan awal',
    date: '2026-05-06T10:00:00Z',
  },
  {
    id: 'tx-6',
    saverId: 'saver-2',
    type: 'deposit',
    amount: 450000,
    category: 'Hasil Jualan',
    note: 'Keuntungan jualan kue',
    date: '2026-05-15T16:45:00Z',
  },
  {
    id: 'tx-7',
    saverId: 'saver-2',
    type: 'withdraw',
    amount: 120000,
    category: 'Belanja / Keperluan',
    note: 'Beli kado ultah ibu',
    date: '2026-05-18T13:20:00Z',
  },
  {
    id: 'tx-8',
    saverId: 'saver-3',
    type: 'deposit',
    amount: 500000,
    category: 'Uang Saku / Jajan',
    note: 'Sengaja disisihkan',
    date: '2026-05-11T08:30:00Z',
  },
  {
    id: 'tx-9',
    saverId: 'saver-3',
    type: 'deposit',
    amount: 200000,
    category: 'Hadiah / Kado',
    note: 'Kado lebaran',
    date: '2026-05-15T15:10:00Z',
  },
];
