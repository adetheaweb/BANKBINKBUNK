/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, NotepadText, Calendar, Plus, Wallet } from 'lucide-react';
import { Saver, CATEGORIES } from '../types';

interface TransactionPanelProps {
  activeSaver: Saver | null;
  activeBalance: number;
  onAddTransaction: (
    saverId: string,
    type: 'deposit' | 'withdraw',
    amount: number,
    category: string,
    note: string,
    date: string
  ) => void;
}

export default function TransactionPanel({
  activeSaver,
  activeBalance,
  onAddTransaction,
}: TransactionPanelProps) {
  const [txType, setTxType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Set default category and date on mount/type change
  useEffect(() => {
    const list = CATEGORIES[txType];
    if (list && list.length > 0) {
      setCategory(list[0]);
    }
    // Set date to today's date in local YYYY-MM-DD
    const today = new Date().toISOString().substring(0, 10);
    setDate(today);
  }, [txType]);

  const quickPresets = [20000, 50000, 100000, 200000, 500000, 1000000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSaver) {
      setErrorMsg('Pilih penabung aktif terlebih dahulu!');
      return;
    }

    const txAmount = parseFloat(amount) || 0;
    if (txAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari Rp 0!');
      return;
    }

    if (txType === 'withdraw' && txAmount > activeBalance) {
      setErrorMsg(
        `Saldo tidak mencukupi! Saldo aktif ${activeSaver.name} adalah Rp ${activeBalance.toLocaleString(
          'id-ID'
        )}`
      );
      return;
    }

    // Success transaction
    onAddTransaction(
      activeSaver.id,
      txType,
      txAmount,
      category,
      note.trim() || `Transaksi ${txType === 'deposit' ? 'Setoran' : 'Penarikan'}`,
      new Date(date).toISOString()
    );

    // Dynamic success animation trigger
    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 2000);

    // Clear form inputs
    setAmount('');
    setNote('');
    setErrorMsg('');
  };

  if (!activeSaver) {
    return (
      <div className="bg-[#F2EDE4]/40 border border-[#E5E0D5] rounded-3xl p-6 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
        <div className="p-3 bg-white rounded-2xl text-[#82927E] border border-[#E5E0D5] shadow-sm">
          <Wallet className="h-7 w-7" />
        </div>
        <h4 className="font-serif font-bold text-[#3E4437] text-lg">Belum Ada Penabung Aktif</h4>
        <p className="text-xs text-[#7A8274] max-w-xs leading-relaxed font-medium">
          Silakan pilih atau tambahkan nama penabung terlebih dahulu di daftar atas untuk memulai pencatatan uang tabungan baru.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E5E0D5] shadow-sm overflow-hidden">
      {/* Header Form */}
      <div className="border-b border-[#E5E0D5]/60 px-6 py-4.5 flex items-center justify-between bg-[#F2EDE4]/30">
        <div>
          <h3 className="font-serif font-bold text-brand-text text-base">Catat Tabungan</h3>
          <p className="text-xs text-brand-text-muted font-medium">Mencatat transaksi untuk <strong>{activeSaver.name}</strong></p>
        </div>
        {successAnimation && (
          <span className="text-[10px] font-bold text-white bg-[#118C7E] px-2.5 py-1 rounded-full animate-bounce">
            Tercatat! ✓
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {errorMsg && (
          <div className="p-3.5 text-xs text-brand-coral bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Segment Toggler */}
        <div className="grid grid-cols-2 p-1.5 bg-brand-sage-light rounded-xl border border-brand-border/60">
          <button
            type="button"
            onClick={() => {
              setTxType('deposit');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              txType === 'deposit'
                ? 'bg-white text-[#118C7E] shadow-sm font-bold'
                : 'text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Setor / Tabung
          </button>
          <button
            type="button"
            onClick={() => {
              setTxType('withdraw');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              txType === 'withdraw'
                ? 'bg-white text-brand-coral shadow-sm font-bold'
                : 'text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            Tarik Tunai
          </button>
        </div>

        {/* Input Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-sage-dark uppercase tracking-wider block">
            Nominal {txType === 'deposit' ? 'Setoran' : 'Penarikan'} (Rupiah)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-muted font-bold text-sm">
              Rp
            </span>
            <input
              id="tx-amount-input"
              type="number"
              placeholder="0"
              min="100"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrorMsg('');
              }}
              className="w-full pl-10 pr-4 py-3 font-mono text-lg font-bold text-brand-text bg-brand-sage-light/40 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage/15 focus:border-brand-sage transition-colors"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Pilihan Cepat</span>
          <div className="grid grid-cols-3 gap-1.5">
            {quickPresets.map((presetAmt) => (
              <button
                key={presetAmt}
                type="button"
                onClick={() => {
                  setAmount(presetAmt.toString());
                  setErrorMsg('');
                }}
                className={`py-1.5 px-2 bg-brand-sage-light/30 hover:bg-brand-sage-light/60 border border-brand-border text-brand-text font-bold font-mono text-xs rounded-lg transition-colors text-center cursor-pointer ${
                  amount === presetAmt.toString()
                    ? txType === 'deposit'
                      ? 'border-[#118C7E] bg-[#118C7E]/10 text-brand-sage-dark'
                      : 'border-[#D97B5F] bg-[#D97B5F]/10 text-[#D97B5F]'
                    : ''
                }`}
              >
                +Rp {presetAmt >= 1000000 ? `${(presetAmt / 1000000).toFixed(1)}jt` : `${presetAmt / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider block">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82927E]/10 focus:border-[#82927E] text-[#3E4437] font-medium"
            >
              {CATEGORIES[txType].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider block">Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82927E]/10 focus:border-[#82927E] text-[#3E4437] font-medium"
              />
              <Calendar className="absolute right-3 top-2.5 h-3.5 w-3.5 text-[#7A8274] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Note / Catatan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider block">Catatan / Deskripsi</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Contoh: Menyisihkan uang kado / sisa bonus harian"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82927E]/10 focus:border-[#82927E] text-[#3E4437] font-medium"
            />
            <NotepadText className="absolute left-3 top-2.5 h-4 w-4 text-[#7A8274] pointer-events-none" />
          </div>
        </div>

        {/* Submit button */}
        <button
          id="submit-transaction-btn"
          type="submit"
          className={`w-full py-3 px-4 font-bold text-sm text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer ${
            txType === 'deposit'
              ? 'bg-[#82927E] hover:bg-[#6D7D69] shadow-[#82927E]/10'
              : 'bg-[#D97B5F] hover:bg-[#C86B51] shadow-[#D97B5F]/10'
          }`}
        >
          <Plus className="h-4 w-4" />
          Konfirmasi {txType === 'deposit' ? 'Setor Uang' : 'Tarik Uang'}
        </button>
      </form>
    </div>
  );
}
