/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck, HelpCircle } from 'lucide-react';
import { Saver, Transaction } from '../types';

interface SavingsOverviewProps {
  activeSaver: Saver | null;
  savers: Saver[];
  transactions: Transaction[];
}

export default function SavingsOverview({ activeSaver, savers, transactions }: SavingsOverviewProps) {
  // 1. Total Pool Balance (All savers combined)
  const totalPoolBalance = transactions.reduce((sum, t) => {
    return t.type === 'deposit' ? sum + t.amount : sum - t.amount;
  }, 0);

  // 2. Active Saver Stats
  const activeSaverTransactions = activeSaver 
    ? transactions.filter(t => t.saverId === activeSaver.id) 
    : [];

  const activeBalance = activeSaverTransactions.reduce((sum, t) => {
    return t.type === 'deposit' ? sum + t.amount : sum - t.amount;
  }, 0);

  const activeTotalDeposit = activeSaverTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeTotalWithdraw = activeSaverTransactions
    .filter(t => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeSavingRate = activeTotalDeposit > 0 
    ? Math.max(0, 100 - (activeTotalWithdraw / activeTotalDeposit) * 100) 
    : 0;

  // 3. Target Stats
  const targetName = activeSaver ? activeSaver.targetName : 'Belum Ditentukan';
  const targetAmount = activeSaver ? activeSaver.targetAmount : 0;
  const progressPercent = targetAmount > 0 ? Math.min(100, (activeBalance / targetAmount) * 100) : 0;

  // Visual text for motivating savers
  const getMotivationalText = (percentage: number) => {
    if (percentage === 0) return 'Mulai setoran pertama Anda untuk menumbuhkan impian sehat!';
    if (percentage < 25) return 'Awal yang baik! Setiap rupiah adalah pupuk bagi impian Anda.';
    if (percentage < 50) return 'Hampir setengah jalan! Terus rawat kebiasaan menabung sehat ini.';
    if (percentage < 75) return 'Lebih dari separuh target! Impian Anda tumbuh subur dan rindang.';
    if (percentage < 100) return 'Sangat dekat! Satu atau dua langkah lagi menuju pencapaian optimal.';
    return 'Luar biasa 🎉 Target tabungan telah tercapai sepenuhnya! Selamat!';
  };

  return (
    <div id="savings-overview-section" className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Saldo Aktif Penabung */}
        <div className="bg-[#EBF5F3]/80 p-5 rounded-2xl border border-brand-border flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Saldo {activeSaver ? activeSaver.name : 'Penabung'}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-semibold text-brand-text-muted">Rp</span>
                <span className="text-2xl font-bold font-mono text-brand-text tracking-tight animate-fade-in">
                  {activeBalance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-white text-brand-sage rounded-xl border border-[#CBDDDA]">
              <Wallet className="h-4.5 w-4.5 text-[#118C7E]" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#CBDDDA] flex items-center justify-between text-xs text-brand-text-muted">
            <span>Sisa s/d Tujuan</span>
            <span className="font-mono font-semibold text-brand-sage">
              Rp {Math.max(0, targetAmount - activeBalance).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Card 2: Total Setoran (In) */}
        <div className="bg-[#EBF5F3]/80 p-5 rounded-2xl border border-brand-border flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Akumulasi Deposit</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-semibold text-brand-text-muted">Rp</span>
                <span className="text-2xl font-bold font-mono text-brand-sage-dark tracking-tight">
                  {activeTotalDeposit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-white text-[#118C7E] rounded-xl border border-[#CBDDDA]">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#CBDDDA] flex items-center justify-between text-xs text-brand-text-muted">
            <span>Frekuensi Setor</span>
            <span className="font-semibold text-brand-text font-mono">
              {activeSaverTransactions.filter(t => t.type === 'deposit').length} kali
            </span>
          </div>
        </div>

        {/* Card 3: Total Penarikan (Out) */}
        <div className="bg-[#FFFAEA]/80 p-5 rounded-2xl border border-brand-border flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[#A27E1C] uppercase tracking-wider block">Akumulasi Penarikan</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-semibold text-[#A27E1C]">Rp</span>
                <span className="text-2xl font-bold font-mono text-[#D4AF37] tracking-tight">
                  {activeTotalWithdraw.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-white text-[#D4AF37] rounded-xl border border-[#FBE6A0]">
              <ArrowDownLeft className="h-4.5 w-4.5 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#FBE6A0] flex items-center justify-between text-xs text-[#A27E1C]">
            <span>Frekuensi Tarik</span>
            <span className="font-semibold text-[#0E3530] font-mono">
              {activeSaverTransactions.filter(t => t.type === 'withdraw').length} kali
            </span>
          </div>
        </div>

        {/* Card 4: Total Kas Gabungan (All Savers) */}
        <div className="bg-gradient-to-br from-[#0B3F38] to-[#062924] text-white p-5 rounded-2xl border border-brand-coral/20 shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-brand-coral uppercase tracking-wider block">Total Kas Kolektif</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-medium text-brand-sage-light/75">Rp</span>
                <span className="text-2xl font-bold font-mono text-[#FFFEEB] tracking-tight">
                  {totalPoolBalance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-white/10 text-[#D4AF37] rounded-xl border border-[#D4AF37]/20">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-coral" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#FFFEEB]/85">
            <span>Jumlah Penabung</span>
            <span className="font-bold text-brand-coral font-mono">
              {savers.length} Orang
            </span>
          </div>
        </div>

      </div>

      {/* Target Progress Card */}
      {activeSaver && (
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-brand-sage-dark bg-[#EBF5F3] rounded-full border border-brand-border uppercase tracking-wider">
                  Target Menabung Keluarga
                </span>
                <span className="text-xs text-brand-text-muted">Dimulai sejak {new Date(activeSaver.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-brand-text mt-1.5">
                🎯 {targetName}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-brand-text-muted block font-medium">Status Pencapaian</span>
              <span className="text-xl font-bold text-brand-coral font-mono">{progressPercent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Large Progress bar */}
          <div className="relative w-full h-4 bg-brand-sage-light rounded-full overflow-hidden border border-brand-border/60 mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-sage to-brand-coral transition-all duration-700 shadow-inner"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-brand-text-muted">
            <p className="font-medium text-brand-sage-dark italic">
              &ldquo;{getMotivationalText(progressPercent)}&rdquo;
            </p>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-brand-text font-bold">Rp {activeBalance.toLocaleString('id-ID')}</span>
              <span>/</span>
              <span className="text-brand-text-muted font-medium">Rp {targetAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
