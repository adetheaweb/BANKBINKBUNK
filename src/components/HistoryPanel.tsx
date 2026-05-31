/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, X, ReceiptText, Printer } from 'lucide-react';
import { Saver, Transaction, TransactionType } from '../types';

interface HistoryPanelProps {
  activeSaver: Saver | null;
  savers: Saver[];
  transactions: Transaction[];
  onDeleteTransaction?: (id: string) => void;
  isReadOnly?: boolean;
}

export default function HistoryPanel({
  activeSaver,
  savers,
  transactions,
  onDeleteTransaction,
  isReadOnly = false,
}: HistoryPanelProps) {
  const [filterType, setFilterType] = useState<TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Filter transactions based on activeSaver or and properties
  const filteredTxs = transactions
    .filter((tx) => {
      // If we have an active saver chosen, show only theirs; otherwise, show all
      if (activeSaver && tx.saverId !== activeSaver.id) {
        return false;
      }
      
      // Filter by type
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Filter by search text
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const categoryMatch = tx.category.toLowerCase().includes(query);
        const noteMatch = tx.note.toLowerCase().includes(query);
        return categoryMatch || noteMatch;
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Helper formatting currency
  const formatRp = (val: number) => {
    return 'Rp' + val.toLocaleString('id-ID');
  };

  // Get matching saver name for a transaction
  const getSaverNameOfTx = (saverId: string) => {
    const s = savers.find((item) => item.id === saverId);
    return s ? s.name : 'Unknown Penabung';
  };

  return (
    <div id="history-panel" className="bg-white rounded-3xl border border-[#E5E0D5] shadow-sm overflow-hidden flex flex-col h-full">
      {/* Search and Title Top bar */}
      <div className="p-6 border-b border-[#E5E0D5]/60 bg-[#F2EDE4]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-[#3E4437] text-base">Riwayat Transaksi</h3>
            <p className="text-xs text-[#7A8274] font-medium">
              {activeSaver ? `Histori tabungan aktif: ${activeSaver.name}` : 'Menampilkan akumulasi seluruh penabung'}
            </p>
          </div>
          
          {/* Quick Stats of Filtered */}
          <span className="self-start text-[10px] font-bold text-[#5A6354] bg-[#F2EDE4] px-2.5 py-1 rounded-full border border-[#E5E0D5]">
            Ditemukan: {filteredTxs.length} Log
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4">
          <div className="relative sm:col-span-7">
            <input
              id="search-transactions"
              type="text"
              placeholder="Cari kategori atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82927E]/10 focus:border-[#82927E] transition-colors text-[#3E4437] font-medium"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#7A8274]" />
          </div>

          <div className="relative sm:col-span-5">
            <select
              id="filter-type-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TransactionType)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82927E]/10 focus:border-[#82927E] transition-colors text-[#3E4437] font-semibold"
            >
              <option value="all">Semua Tipe</option>
              <option value="deposit">📥 Setoran (+)</option>
              <option value="withdraw">📤 Penarikan (-)</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#7A8274]" />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto max-h-[460px] divide-y divide-[#E5E0D5]/50">
        {filteredTxs.length === 0 ? (
          <div className="p-8 text-center space-y-2.5">
            <p className="text-sm font-serif font-bold text-[#3E4437]">Tidak Ada Transaksi Cocok</p>
            <p className="text-xs text-[#7A8274] font-medium">
              Ubah kata kunci pencarian Anda atau silakan catat transaksi baru.
            </p>
          </div>
        ) : (
          filteredTxs.map((tx) => {
            const isDeposit = tx.type === 'deposit';
            const dateStr = new Date(tx.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const saverName = getSaverNameOfTx(tx.saverId);

            return (
              <div
                id={`tx-row-${tx.id}`}
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-4 flex items-center justify-between hover:bg-[#F2EDE4]/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {/* Badge Marker */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 border ${
                      isDeposit
                        ? 'bg-[#82927E]/10 text-[#5A6354] border-[#82927E]/20'
                        : 'bg-[#D97B5F]/10 text-[#D97B5F] border-[#D97B5F]/20'
                    }`}
                  >
                    {isDeposit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-[#3E4437] text-xs sm:text-sm truncate">
                        {tx.category}
                      </span>
                      {!activeSaver && (
                        <span className="text-[9px] font-bold text-[#5A6354] bg-[#F2EDE4]/65 px-1.5 py-0.5 rounded border border-[#E5E0D5]">
                          {saverName}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A8274] font-medium truncate max-w-[180px] sm:max-w-[280px]">
                      {tx.note}
                    </p>
                    <span className="text-[10px] text-[#7A8274]/75 font-mono">{dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold font-mono ${
                        isDeposit ? 'text-[#82927E]' : 'text-[#D97B5F]'
                      }`}
                    >
                      {isDeposit ? '+' : '-'}{formatRp(tx.amount)}
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-[#7A8274] font-bold">
                      Klik detail
                    </span>
                  </div>

                  {/* Delete Button inside log */}
                  {!isReadOnly && onDeleteTransaction && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Stop opening detail recipe modal
                        if (confirm(`Apakah Anda yakin ingin menghapus logs pencatatan tabungan senilai ${formatRp(tx.amount)}?`)) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-[#D97B5F] hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus Log"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RECEIPT DETAIL MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-brand-border">
            {/* Header */}
            <div className="px-6 py-4.5 bg-[#0B3F38] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-brand-coral" />
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#FFFEEB]/90 font-serif">Kuitansi Saving</span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 text-[#FFFEEB]/70 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-6 bg-[radial-gradient(#CBDDDA_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-wider">BANK BINK BUNK</span>
                <h4 className="text-lg font-serif font-bold text-brand-text">BUKTI TRANSAKSI</h4>
                <p className="text-xs text-brand-text-muted font-mono">ID: {selectedTx.id}</p>
              </div>

              {/* Decorative dash spacer */}
              <div className="border-t-2 border-dashed border-brand-border" />

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-text-muted font-medium">Penabung:</span>
                  <span className="font-bold text-[#0E3530]">{getSaverNameOfTx(selectedTx.saverId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted font-medium">Jenis Transaksi:</span>
                  <span
                    className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                      selectedTx.type === 'deposit'
                        ? 'bg-[#118C7E]/10 text-[#095C52] border border-[#118C7E]/20'
                        : 'bg-[#D4AF37]/10 text-[#A27E1C] border border-[#D4AF37]/20'
                    }`}
                  >
                    {selectedTx.type === 'deposit' ? 'SETORAN (+)' : 'PENARIKAN (-)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted font-medium">Kategori keuangan:</span>
                  <span className="font-semibold text-[#0E3530]">{selectedTx.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted font-medium">Tanggal input:</span>
                  <span className="font-mono text-[#0E3530]">
                    {new Date(selectedTx.date).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-brand-text-muted font-medium">Catatan:</span>
                  <span className="p-2.5 bg-[#EBF5F3]/50 rounded-xl border border-brand-border/60 text-[#0E3530] italic font-medium">
                    &ldquo;{selectedTx.note}&rdquo;
                  </span>
                </div>
              </div>

              {/* Decorative dash spacer */}
              <div className="border-t-2 border-dashed border-brand-border" />

              <div className="text-center py-2">
                <span className="text-xs text-brand-text-muted font-medium">Nominal Transaksi</span>
                <div className="text-2xl font-bold text-[#0E3530] font-mono mt-0.5">
                  {formatRp(selectedTx.amount)}
                </div>
              </div>

              <div className="text-center text-[10px] text-brand-text-muted font-semibold">
                Terima kasih telah berproses menabung dengan konsisten! 🌸
              </div>
            </div>

            {/* Footer print action */}
            <div className="px-6 py-4.5 bg-brand-sage-light border-t border-brand-border flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 border border-brand-border bg-white hover:bg-slate-50 text-brand-text px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-brand-sage" />
                Cetak Struk
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 bg-brand-sage hover:bg-brand-sage-dark text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup Bukti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
