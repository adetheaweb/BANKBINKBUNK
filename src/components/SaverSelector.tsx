/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Trash2, Edit, Target, Plus, X, Coins, CheckCircle2 } from 'lucide-react';
import { Saver, Transaction } from '../types';

interface SaverSelectorProps {
  savers: Saver[];
  activeSaverId: string | null;
  onSelectSaver: (id: string) => void;
  onAddSaver?: (name: string, targetName: string, targetAmount: number) => void;
  onDeleteSaver?: (id: string) => void;
  onUpdateSaverTarget?: (id: string, targetName: string, targetAmount: number) => void;
  transactions: Transaction[];
  isReadOnly?: boolean;
}

export default function SaverSelector({
  savers,
  activeSaverId,
  onSelectSaver,
  onAddSaver,
  onDeleteSaver,
  onUpdateSaverTarget,
  transactions,
  isReadOnly = false
}: SaverSelectorProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  
  // Form add state
  const [newName, setNewName] = useState('');
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [addError, setAddError] = useState('');

  // Form edit target state
  const [editingSaverId, setEditingSaverId] = useState<string | null>(null);
  const [editTargetName, setEditTargetName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');

  // Calculate balance helper
  const getSaverBalance = (saverId: string) => {
    return transactions
      .filter(t => t.saverId === saverId)
      .reduce((sum, t) => t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0);
  };

  // Preset quick targets
  const targetPresets = [
    { label: 'Laptop', amount: 5000000 },
    { label: 'Emas/Investasi', amount: 3000000 },
    { label: 'Smartphone', amount: 2500000 },
    { label: 'Dana Darurat', amount: 1500000 },
    { label: 'Hobi/Liburan', amount: 1000000 },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError('Nama penabung harus diisi!');
      return;
    }
    const targetAmt = parseFloat(newTargetAmount) || 0;
    if (targetAmt <= 0) {
      setAddError('Target tabungan harus lebih dari Rp 0!');
      return;
    }
    onAddSaver(newName.trim(), newTargetName.trim() || 'Tabungan Umum', targetAmt);
    
    // Reset form
    setNewName('');
    setNewTargetName('');
    setNewTargetAmount('');
    setAddError('');
    setIsAddOpen(false);
  };

  const startEditingTarget = (saver: Saver) => {
    setEditingSaverId(saver.id);
    setEditTargetName(saver.targetName);
    setEditTargetAmount(saver.targetAmount.toString());
  };

  const handleSaveEdit = (saverId: string) => {
    const editAmt = parseFloat(editTargetAmount) || 0;
    if (editAmt <= 0) return;
    onUpdateSaverTarget(saverId, editTargetName || 'Tabungan Umum', editAmt);
    setEditingSaverId(null);
  };

  // Card themes with gorgeous Hijau Toska & Kuning Emas gradients
  const gradients = [
    'from-[#0B3F38] via-[#118C7E] to-[#0A4D44] text-white shadow-[#118C7E]/25',
    'from-[#A27E1C] via-[#D4AF37] to-[#C29617] text-white shadow-[#D4AF37]/25',
    'from-[#0B3F38] via-[#2F857B] to-[#D4AF37] text-white shadow-[#118C7E]/20'
  ];

  return (
    <div id="saver-selector-section" className="space-y-5">
      {/* Header action */}
      <div className="flex items-center justify-between pb-2 border-b border-brand-border/40">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#0E3530] tracking-tight">Koleksi Nama Penabung</h2>
          <p className="text-xs text-[#49726D] font-medium">Pilih penabung aktif untuk melihat data keuangan & sasaran target.</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button
              id="manage-savers-btn"
              onClick={() => setIsManageOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#095C52] bg-[#EBF5F3]/80 hover:bg-[#EBF5F3] transition-colors rounded-xl border border-[#CBDDDA]"
            >
              Kelola
            </button>
            <button
              id="open-add-saver-btn"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-brand-sage hover:bg-brand-sage-dark transition-all rounded-xl shadow-md shadow-brand-sage/10 animate-fade-in"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Tambah Penabung
            </button>
          </div>
        )}
      </div>

      {/* Grid of Custom Styled Organic Look Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {savers.map((saver, idx) => {
          const balance = getSaverBalance(saver.id);
          const progress = Math.min(100, Math.max(0, (balance / saver.targetAmount) * 100));
          const isActive = activeSaverId === saver.id;
          const gradient = gradients[idx % gradients.length];

          return (
            <div
              id={`saver-card-${saver.id}`}
              key={saver.id}
              onClick={() => onSelectSaver && onSelectSaver(saver.id)}
              className={`relative cursor-pointer overflow-hidden rounded-2xl p-5 border transition-all duration-300 transform hover:-translate-y-1 ${
                isActive
                  ? `bg-gradient-to-br ${gradient} border-transparent ring-4 ring-[#118C7E]/20 scale-[1.01] shadow-lg`
                  : 'bg-[#EBF5F3]/60 hover:bg-[#EBF5F3]/90 border-[#CBDDDA] text-[#0E3530] hover:shadow-sm'
              }`}
            >
              {/* Background Accent Lines */}
              {isActive && (
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isActive ? 'text-white/80' : 'text-[#49726D]'}`}>
                    PENABUNG {idx + 1}
                  </span>
                  <h3 className={`text-lg font-serif font-bold tracking-tight ${isActive ? 'text-white' : 'text-[#0E3530]'}`}>
                    {saver.name}
                  </h3>
                </div>
                <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/10 text-white' : 'bg-white/80 text-[#118C7E] border border-brand-border'}`}>
                  <Coins className="h-4 w-4" />
                </div>
              </div>

              {/* Balance */}
              <div className="mb-4">
                <span className={`text-[11px] font-medium ${isActive ? 'text-white/80' : 'text-[#49726D]'}`}>Total Tabungan</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-xs font-mono font-bold ${isActive ? 'text-white/70' : 'text-[#49726D]'}`}>Rp</span>
                  <span className={`text-2xl font-bold font-mono tracking-tight ${isActive ? 'text-white' : 'text-[#0E3530]'}`}>
                    {balance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Target & Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-semibold truncate max-w-[150px] ${isActive ? 'text-white/90' : 'text-[#095C52]'}`}>
                    🎯 {saver.targetName}
                  </span>
                  <span className={`font-mono font-bold ${isActive ? 'text-white' : 'text-[#118C7E]'}`}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isActive ? 'bg-white/20' : 'bg-brand-border'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isActive ? 'bg-white' : 'bg-[#118C7E]'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] pt-0.5">
                  <span className={isActive ? 'text-white/70' : 'text-[#49726D]'}>
                    Sisa: Rp {Math.max(0, saver.targetAmount - balance).toLocaleString('id-ID')}
                  </span>
                  <span className={isActive ? 'text-white/80 font-semibold' : 'text-[#0E3530] font-semibold'}>
                    Target: Rp {saver.targetAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Active check indicator */}
              {isActive && (
                <div className="absolute top-3.5 right-3.5 animate-pulse bg-white/20 text-white rounded-full p-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 fill-[#D4AF37] text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: Tambah Penabung */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-2xl border border-brand-border animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 bg-[#F2EDE4] border-b border-[#E5E0D5]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white text-[#82927E] rounded-xl border border-[#E5E0D5]">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h3 className="font-serif font-bold text-[#3E4437]">Tambah Penabung Baru</h3>
              </div>
              <button
                id="close-add-modal-btn"
                onClick={() => {
                  setIsAddOpen(false);
                  setAddError('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 text-xs text-[#D97B5F] bg-[#D97B5F]/10 rounded-xl border border-[#D97B5F]/20 font-semibold">
                  ⚠️ {addError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider block">ID / Nama Penabung</label>
                <input
                  id="input-saver-name"
                  type="text"
                  placeholder="Contoh: Andi Saputra, Citra Lestari"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82927E]/10 focus:border-[#82927E] transition-colors text-[#3E4437]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider block">Rencana Impian (Nama Target)</label>
                <input
                  id="input-target-name"
                  type="text"
                  placeholder="Contoh: Beli Laptop, Dana Darurat, Emas"
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82927E]/10 focus:border-[#82927E] transition-colors text-[#3E4437]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider block">Nominal Target Tabungan (Rupiah)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#7A8274] text-sm font-semibold">
                    Rp
                  </div>
                  <input
                    id="input-target-amount"
                    type="number"
                    min="1000"
                    placeholder="Contoh: 1500000"
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono text-[#3E4437] bg-white border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82927E]/10 focus:border-[#82927E] transition-colors"
                  />
                </div>
              </div>

              {/* Target Presets */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-[#7A8274] uppercase tracking-wider block">Rekomendasi Rencana</span>
                <div className="flex flex-wrap gap-1.5">
                  {targetPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewTargetName(preset.label);
                        setNewTargetAmount(preset.amount.toString());
                      }}
                      className="px-2.5 py-1.5 text-xs text-[#5A6354] bg-[#F2EDE4]/40 border border-[#E5E0D5] rounded-xl hover:border-[#82927E] hover:bg-white transition-colors"
                    >
                      {preset.label} (Rp {(preset.amount/1000000).toFixed(1)}jt)
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-[#E5E0D5]/50">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#5A6354] bg-[#F2EDE4] hover:bg-[#F2EDE4]/70 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  id="submit-add-saver-btn"
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#82927E] hover:bg-[#6D7D69] rounded-xl shadow-lg shadow-[#82927E]/10 transition-colors"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Kelola Penabung */}
      {isManageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#E5E0D5] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#F2EDE4] border-b border-[#E5E0D5]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white text-[#5A6354] rounded-xl border border-[#E5E0D5]">
                  <Edit className="h-4 w-4" />
                </div>
                <h3 className="font-serif font-bold text-[#3E4437]">Kelola Nama Penabung</h3>
              </div>
              <button
                onClick={() => {
                  setIsManageOpen(false);
                  setEditingSaverId(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 max-h-[350px] overflow-y-auto space-y-4">
              {savers.length === 0 ? (
                <p className="text-sm text-brand-text-muted text-center py-6">Belum ada nama penabung.</p>
              ) : (
                savers.map((saver) => {
                  const isEditing = editingSaverId === saver.id;
                  const balance = getSaverBalance(saver.id);

                  return (
                    <div
                      key={saver.id}
                      className="p-4 bg-[#F2EDE4]/40 border border-[#E5E0D5] rounded-2xl space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-[#3E4437] text-base">{saver.name}</h4>
                          <span className="text-xs text-[#7A8274] font-mono">
                            Saldo aktif: Rp {balance.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {!isEditing ? (
                            <>
                              <button
                                onClick={() => startEditingTarget(saver)}
                                className="p-1.5 text-[#5A6354] hover:text-[#82927E] hover:bg-white rounded-xl border border-transparent hover:border-[#E5E0D5] transition-all"
                                title="Edit Target"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus penabung "${saver.name}" beserta seluruh riwayat tabungannya?`)) {
                                    onDeleteSaver(saver.id);
                                  }
                                }}
                                className="p-1.5 text-[#7A8274] hover:text-[#D97B5F] hover:bg-[#D97B5F]/10 rounded-xl border border-transparent hover:border-[#D97B5F]/10 transition-all"
                                title="Hapus Penabung"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditingSaverId(null)}
                              className="px-2.5 py-1 text-xs text-[#5A6354] bg-white border border-[#E5E0D5] rounded-lg hover:bg-[#F2EDE4]/60"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="p-3.5 bg-white border border-[#E5E0D5] rounded-2xl space-y-2 mt-2">
                          <h5 className="text-[10px] uppercase font-bold text-[#5A6354]">Edit Rencana Impian & Target</h5>
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editTargetName}
                              onChange={(e) => setEditTargetName(e.target.value)}
                              placeholder="Nama Rencana / Impian"
                              className="w-full text-xs px-3 py-2 border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#82927E] text-[#3E4437]"
                            />
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs text-[#7A8274] font-bold">Rp</span>
                              <input
                                type="number"
                                value={editTargetAmount}
                                onChange={(e) => setEditTargetAmount(e.target.value)}
                                placeholder="Target Nominal Rupiah"
                                className="w-full text-xs pl-8 pr-3 py-2 border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#82927E] text-[#3E4437] font-mono"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleSaveEdit(saver.id)}
                            className="w-full mt-1.5 px-3 py-2 text-xs text-white bg-[#82927E] hover:bg-[#6D7D69] rounded-xl font-semibold text-center"
                          >
                            Simpan Perubahan
                          </button>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1.5 text-xs text-[#5A6354]">
                          <Target className="h-3.5 w-3.5 text-[#D97B5F]" />
                          <span>Goal: <strong>{saver.targetName}</strong> (Rp {saver.targetAmount.toLocaleString('id-ID')})</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 bg-[#F2EDE4] border-t border-[#E5E0D5] flex justify-end">
              <button
                onClick={() => {
                  setIsManageOpen(false);
                  setEditingSaverId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#3E4437] bg-white border border-[#E5E0D5] hover:bg-slate-50 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
