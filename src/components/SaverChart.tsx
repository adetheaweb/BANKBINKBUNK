/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Saver, Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, PieChart, BarChart3, TrendingUp } from 'lucide-react';

interface SaverChartProps {
  activeSaver: Saver | null;
  transactions: Transaction[];
}

export default function SaverChart({ activeSaver, transactions }: SaverChartProps) {
  // Filter transactions
  const activeTxs = activeSaver
    ? transactions.filter((t) => t.saverId === activeSaver.id)
    : transactions;

  // Let's calculate: Category summaries for Deposit and Withdraw
  const depositsByCategory: { [key: string]: number } = {};
  const withdrawsByCategory: { [key: string]: number } = {};
  let totalD = 0;
  let totalW = 0;

  activeTxs.forEach((tx) => {
    if (tx.type === 'deposit') {
      depositsByCategory[tx.category] = (depositsByCategory[tx.category] || 0) + tx.amount;
      totalD += tx.amount;
    } else {
      withdrawsByCategory[tx.category] = (withdrawsByCategory[tx.category] || 0) + tx.amount;
      totalW += tx.amount;
    }
  });

  const sortedDeposits = Object.entries(depositsByCategory)
    .map(([category, amount]) => ({ category, amount, percent: totalD > 0 ? (amount / totalD) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // top 5

  const sortedWithdraws = Object.entries(withdrawsByCategory)
    .map(([category, amount]) => ({ category, amount, percent: totalW > 0 ? (amount / totalW) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // top 5

  // Render 12 months trend
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  // Calculate historical monthly data for the current year
  const monthlyStats = months.map((monthName, index) => {
    const monthTxs = activeTxs.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === currentYear && txDate.getMonth() === index;
    });

    const inAmt = monthTxs.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const outAmt = monthTxs.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + t.amount, 0);

    return {
      month: monthName,
      deposit: inAmt,
      withdraw: outAmt,
    };
  });

  // Find max value to scale the bars
  const maxVal = Math.max(
    ...monthlyStats.map(s => Math.max(s.deposit, s.withdraw)),
    100000 // minimum threshold
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Bar Chart Trend Monthly */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5E0D5] shadow-sm lg:col-span-7 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 border border-[#E5E0D5] bg-[#F2EDE4]/30 text-[#82927E] rounded-xl">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#3E4437]">Trend Menabung Bulanan</h4>
                <p className="text-[10px] text-[#7A8274] font-medium">Arus kas setoran vs penarikan tahun ini</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#82927E]" />
                <span className="text-[#7A8274]">Setoran</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97B5F]" />
                <span className="text-[#7A8274]">Tarik</span>
              </div>
            </div>
          </div>

          {/* The Bars Visualizer */}
          <div className="h-48 flex items-end justify-between gap-1 pt-6 px-2 font-mono">
            {monthlyStats.map((stat, idx) => {
              const depHeight = `${Math.max(4, (stat.deposit / maxVal) * 100)}%`;
              const witHeight = `${Math.max(4, (stat.withdraw / maxVal) * 100)}%`;
              const hasData = stat.deposit > 0 || stat.withdraw > 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Hover Popover */}
                  {hasData && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#3E4437] text-white text-[9px] p-2.5 rounded-xl shadow-xl hidden group-hover:block z-10 whitespace-nowrap leading-relaxed border border-[#E5E0D5]/20">
                      <p className="font-sans font-bold text-[#F2EDE4] text-center mb-1">{stat.month}</p>
                      <p className="text-[#84A98C] font-semibold">Setor: Rp {stat.deposit.toLocaleString('id-ID')}</p>
                      <p className="text-[#E76F51] font-semibold">Tarik: Rp {stat.withdraw.toLocaleString('id-ID')}</p>
                    </div>
                  )}

                  {/* Double Bar Pillars */}
                  <div className="w-full flex justify-center items-end gap-[3px] h-full">
                    {/* Deposit pillar */}
                    <div
                      className="w-1.5 sm:w-2 bg-[#82927E] rounded-t-sm transition-all duration-500 hover:brightness-105"
                      style={{ height: stat.deposit > 0 ? depHeight : '0%' }}
                    />
                    {/* Withdraw pillar */}
                    <div
                      className="w-1.5 sm:w-2 bg-[#D97B5F] rounded-t-sm transition-all duration-500 hover:brightness-105"
                      style={{ height: stat.withdraw > 0 ? witHeight : '0%' }}
                    />
                  </div>

                  <span className="text-[9px] text-[#7A8274] mt-2 font-bold font-sans">{stat.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Category Pie/List Breakdown */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5E0D5] shadow-sm lg:col-span-5 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 border border-[#E5E0D5] bg-[#F2EDE4]/30 text-[#82927E] rounded-xl">
              <PieChart className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#3E4437]">Alokasi Kategori</h4>
              <p className="text-[10px] text-[#7A8274] font-medium">Sektor keuangan yang paling sering tercatat</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Top deposit categories list */}
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#7A8274] flex items-center gap-1 mb-2">
                <ArrowUpRight className="h-3 w-3 text-[#82927E]" /> Sumber Setoran Terbesar
              </span>
              
              {sortedDeposits.length === 0 ? (
                <p className="text-xs text-[#7A8274] py-1 italic font-medium">Belum ada data setoran masuk.</p>
              ) : (
                <div className="space-y-2">
                  {sortedDeposits.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#5A6354]">{item.category}</span>
                        <span className="font-bold text-[#3E4437] font-mono">
                          Rp {item.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[#F2EDE4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#82927E] rounded-full animate-pulse"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top withdraw categories list */}
            <div className="pt-1.5 border-t border-[#E5E0D5]/40">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#7A8274] flex items-center gap-1 mb-2">
                <ArrowDownLeft className="h-3 w-3 text-[#D97B5F]" /> Alasan Tarik Terbesar
              </span>

              {sortedWithdraws.length === 0 ? (
                <p className="text-xs text-[#7A8274] py-1 italic font-medium">Belum ada data penarikan keluar.</p>
              ) : (
                <div className="space-y-2">
                  {sortedWithdraws.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#5A6354]">{item.category}</span>
                        <span className="font-bold text-[#3E4437] font-mono">
                          Rp {item.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[#F2EDE4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D97B5F] rounded-full"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advice Tip */}
        <div className="mt-2 p-3 bg-[#F2EDE4]/60 rounded-2xl border border-[#E5E0D5]/50 flex items-start gap-2">
          <TrendingUp className="h-4 w-4 text-[#82927E] mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed text-[#5A6354] font-medium">
            <strong>Kiat Menabung:</strong> Memupuk tabungan rutin harian meski bernilai relatif kecil akan memberikan hasil berkelanjutan dibanding setoran besar sesekali!
          </p>
        </div>
      </div>
    </div>
  );
}
