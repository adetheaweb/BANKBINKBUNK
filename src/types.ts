/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Saver {
  id: string;
  name: string;
  targetName: string;
  targetAmount: number;
  createdAt: string;
  password?: string;
}

export interface Transaction {
  id: string;
  saverId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  category: string;
  note: string;
  date: string;
}

export type TransactionType = 'all' | 'deposit' | 'withdraw';

export const CATEGORIES = {
  deposit: [
    'Uang Saku / Jajan',
    'Gaji / Pendapatan',
    'Hadiah / Kado',
    'Sisa Belanja',
    'Hasil Jualan',
    'Lainnya'
  ],
  withdraw: [
    'Makanan & Minuman',
    'Belanja / Keperluan',
    'Pendidikan & Buku',
    'Hiburan / Hobi',
    'Transportasi',
    'Dana Darurat',
    'Lainnya'
  ]
};
