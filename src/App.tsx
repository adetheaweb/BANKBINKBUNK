/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Leaf, RefreshCw, Layers, Coins, Sparkles, HelpCircle, ArrowRight, Lock, User, LogIn, LogOut, Key, Users } from 'lucide-react';
import { Saver, Transaction } from './types';
import { INITIAL_SAVERS, INITIAL_TRANSACTIONS } from './data/mockData';
import SaverSelector from './components/SaverSelector';
import SavingsOverview from './components/SavingsOverview';
import TransactionPanel from './components/TransactionPanel';
import HistoryPanel from './components/HistoryPanel';
import SaverChart from './components/SaverChart';

export default function App() {
  // 1. Initialize states from localStorage or defaults
  const [savers, setSavers] = useState<Saver[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeSaverId, setActiveSaverId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'setor' | 'riwayat' | 'analisis'>('all');

  // Authentication states
  const [userRole, setUserRole] = useState<'admin' | 'saver' | null>(() => {
    return (localStorage.getItem('savings_app_role') as 'admin' | 'saver' | null) || null;
  });
  const [loggedInSaverId, setLoggedInSaverId] = useState<string | null>(() => {
    return localStorage.getItem('savings_app_logged_in_saver_id') || null;
  });

  // Login forms state
  const [loginTab, setLoginTab] = useState<'saver' | 'admin'>('saver');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedSaverLoginId, setSelectedSaverLoginId] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Load savers
    let storedSavers = localStorage.getItem('savings_app_savers');
    let storedTxs = localStorage.getItem('savings_app_transactions');
    let storedActiveId = localStorage.getItem('savings_app_active_saver_id');

    // Force clear if it contains seed data 'Ahmad Syarif' to start fully blank for the user
    if (storedSavers && storedSavers.includes('Ahmad Syarif')) {
      storedSavers = null;
      storedTxs = null;
      storedActiveId = null;
      localStorage.removeItem('savings_app_savers');
      localStorage.removeItem('savings_app_transactions');
      localStorage.removeItem('savings_app_active_saver_id');
    }

    let currentSavers: Saver[] = [];
    if (storedSavers && storedTxs) {
      const parsedSavers = JSON.parse(storedSavers);
      setSavers(parsedSavers);
      setTransactions(JSON.parse(storedTxs));
      currentSavers = parsedSavers;
      
      if (storedActiveId && parsedSavers.some((s: Saver) => s.id === storedActiveId)) {
        setActiveSaverId(storedActiveId);
      } else if (parsedSavers.length > 0) {
        setActiveSaverId(parsedSavers[0].id);
      }
    } else {
      // Start empty! No mock seeds
      setSavers([]);
      setTransactions([]);
      currentSavers = [];
      setActiveSaverId(null);
      
      localStorage.setItem('savings_app_savers', JSON.stringify([]));
      localStorage.setItem('savings_app_transactions', JSON.stringify([]));
      localStorage.removeItem('savings_app_active_saver_id');
    }

    // Set default selected saver in login dropdown
    if (currentSavers.length > 0) {
      const activeIdFromStorage = localStorage.getItem('savings_app_logged_in_saver_id');
      if (activeIdFromStorage && currentSavers.some(s => s.id === activeIdFromStorage)) {
        setSelectedSaverLoginId(activeIdFromStorage);
      } else {
        setSelectedSaverLoginId(currentSavers[0].id);
      }
    }
  }, []);

  // Helper saving arrays back to persistence layer
  const persistData = (newSavers: Saver[], newTxs: Transaction[], newActiveId: string | null) => {
    setSavers(newSavers);
    setTransactions(newTxs);
    setActiveSaverId(newActiveId);

    localStorage.setItem('savings_app_savers', JSON.stringify(newSavers));
    localStorage.setItem('savings_app_transactions', JSON.stringify(newTxs));
    if (newActiveId) {
      localStorage.setItem('savings_app_active_saver_id', newActiveId);
    } else {
      localStorage.removeItem('savings_app_active_saver_id');
    }

    // Keep selected login dropdown synced
    if (newSavers.length > 0 && !newSavers.some(s => s.id === selectedSaverLoginId)) {
      setSelectedSaverLoginId(newSavers[0].id);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername.trim() === 'admin' && adminPassword === 'admin123') {
      setUserRole('admin');
      localStorage.setItem('savings_app_role', 'admin');
      setLoginError('');
    } else {
      setLoginError('Username atau password admin salah.');
    }
  };

  const handleSaverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaverLoginId) {
      setLoginError('Sistem tidak mendeteksi adanya data Penabung. Silakan buat dahulu lewat Login Admin!');
      return;
    }
    setUserRole('saver');
    setLoggedInSaverId(selectedSaverLoginId);
    setActiveSaverId(selectedSaverLoginId);
    localStorage.setItem('savings_app_role', 'saver');
    localStorage.setItem('savings_app_logged_in_saver_id', selectedSaverLoginId);
    localStorage.setItem('savings_app_active_saver_id', selectedSaverLoginId);
    setLoginError('');
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInSaverId(null);
    localStorage.removeItem('savings_app_role');
    localStorage.removeItem('savings_app_logged_in_saver_id');
    setAdminUsername('');
    setAdminPassword('');
    setLoginError('');
  };

  // 2. Action: Select Saver
  const handleSelectSaver = (id: string) => {
    setActiveSaverId(id);
    localStorage.setItem('savings_app_active_saver_id', id);
  };

  // 3. Action: Add Saver
  const handleAddSaver = (name: string, targetName: string, targetAmount: number) => {
    const newSaver: Saver = {
      id: `saver-${Date.now()}`,
      name,
      targetName,
      targetAmount,
      createdAt: new Date().toISOString()
    };

    const updatedSavers = [...savers, newSaver];
    persistData(updatedSavers, transactions, newSaver.id);
  };

  // 4. Action: Delete Saver
  const handleDeleteSaver = (id: string) => {
    const updatedSavers = savers.filter(s => s.id !== id);
    // Also prune their related transactions
    const updatedTxs = transactions.filter(t => t.saverId !== id);
    
    // Choose next active saver, or null if empty
    let nextActiveId: string | null = null;
    if (updatedSavers.length > 0) {
      nextActiveId = id === activeSaverId ? updatedSavers[0].id : activeSaverId;
    }

    persistData(updatedSavers, updatedTxs, nextActiveId);
  };

  // 5. Action: Update Saver Goal Target
  const handleUpdateSaverTarget = (id: string, targetName: string, targetAmount: number) => {
    const updatedSavers = savers.map(s => {
      if (s.id === id) {
        return { ...s, targetName, targetAmount };
      }
      return s;
    });
    persistData(updatedSavers, transactions, activeSaverId);
  };

  // 6. Action: Add Transaction (Setoran / Penarikan)
  const handleAddTransaction = (
    saverId: string,
    type: 'deposit' | 'withdraw',
    amount: number,
    category: string,
    note: string,
    date: string
  ) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      saverId,
      type,
      amount,
      category,
      note,
      date
    };

    const updatedTxs = [...transactions, newTx];
    persistData(savers, updatedTxs, activeSaverId);
  };

  // 7. Action: Delete single Transaction log
  const handleDeleteTransaction = (id: string) => {
    const updatedTxs = transactions.filter(t => t.id !== id);
    persistData(savers, updatedTxs, activeSaverId);
  };

  const handleResetEmpty = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan seluruh data tabungan di aplikasi ini?')) {
      persistData([], [], null);
    }
  };

  // Active saver pointer calculation
  const activeSaver = savers.find(s => s.id === (userRole === 'saver' ? loggedInSaverId : activeSaverId)) || null;
  const activeSaverBalance = activeSaver
    ? transactions
        .filter(t => t.saverId === activeSaver.id)
        .reduce((sum, t) => t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0)
    : 0;

  // Total balance pooled
  const totalPoolBalance = transactions.reduce((sum, t) => {
    return t.type === 'deposit' ? sum + t.amount : sum - t.amount;
  }, 0);

  // Filters savers list to pass to children
  const visibleSavers = userRole === 'saver'
    ? savers.filter(s => s.id === loggedInSaverId)
    : savers;

  // Render login screen if no user is authenticated
  if (userRole === null) {
    return (
      <div className="min-h-screen bg-brand-bg text-[#0E3530] font-sans antialiased flex flex-col md:flex-row items-stretch overflow-x-hidden">
        {/* Branding banner panel */}
        <div className="flex-1 bg-brand-sidebar text-[#FFFEEB] p-8 md:p-16 flex flex-col justify-between relative overflow-hidden min-h-[300px] md:min-h-screen">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-sage/15 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-coral/15 rounded-full blur-3xl pointer-events-none -translate-x-20 translate-y-20" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-brand-coral rounded-xl flex items-center justify-center text-brand-sidebar shadow-lg shrink-0">
              <Leaf className="h-5 w-5 text-[#0B3F38]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-brand-coral block leading-none">Aplikasi</span>
              <span className="text-xl font-serif italic font-bold text-white">BANK BINK BUNK</span>
            </div>
          </div>

          <div className="my-auto py-10 max-w-lg relative z-10">
            <span className="px-3 py-1 bg-brand-coral/20 text-brand-coral rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4 border border-brand-coral/30">
              🌱 Tabungan Keluarga Sehat
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight tracking-tight mb-4">
              Pupuk Impian Anda, Mulai Menabung Hari Ini.
            </h1>
            <p className="text-brand-sage-light/80 text-sm md:text-base leading-relaxed font-light">
              Sebuah platform tabungan kolektif keluarga yang aman dan modern dengan perpaduan warna <strong className="text-brand-coral">Hijau Toska</strong> & <strong className="text-brand-coral">Kuning Emas</strong> yang mewah. Kelola penabung & catat keuangan secara akurat dalam satu genggaman.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 text-xs text-brand-sage-light/60 relative z-10 font-medium">
            &copy; 2026 BANK BINK BUNK • Sesi Tersimpan Secara Aman di Penyimpanan Lokal Browser.
          </div>
        </div>

        {/* Form authentication panel */}
        <div className="flex-1 p-6 md:p-16 flex items-center justify-center bg-transparent">
          <div className="w-full max-w-md space-y-8 bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-brand-border shadow-md">
            <div className="text-center">
              <div className="inline-flex w-12 h-12 bg-brand-sage-light rounded-2xl items-center justify-center text-brand-sage mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-brand-text">Selamat Datang</h2>
              <p className="text-xs text-brand-text-muted font-semibold mt-1">Silakan pilih jenis pintu masuk Anda di bawah.</p>
            </div>

            {/* Segment Toggler */}
            <div className="grid grid-cols-2 p-1 bg-brand-sage-light rounded-2xl border border-brand-border/60 mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginTab('saver');
                  setLoginError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                  loginTab === 'saver'
                    ? 'bg-white text-brand-text shadow-sm font-extrabold border border-brand-border/50'
                    : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Penabung
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginTab('admin');
                  setLoginError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                  loginTab === 'admin'
                    ? 'bg-white text-brand-text shadow-sm font-extrabold border border-brand-border/50'
                    : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Admin Input
              </button>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2 animate-pulse">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Form: Saver view-only login */}
            {loginTab === 'saver' && (
              <form onSubmit={handleSaverLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">
                    Pilih Nama Penabung
                  </label>
                  {savers.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-brand-sage-light border border-brand-border text-center text-xs text-brand-text-muted space-y-1.5">
                      <p className="font-extrabold text-brand-text">Tidak Ada Penabung Terdaftar</p>
                      <p className="leading-relaxed">Silakan masuk sebagai <strong>Admin Input</strong> terlebih dahulu untuk mendaftarkan nama/anggota penabung keluarga pertama Anda.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedSaverLoginId}
                        onChange={(e) => {
                          setSelectedSaverLoginId(e.target.value);
                          setLoginError('');
                        }}
                        className="w-full pl-11 pr-4 py-3 text-sm font-semibold text-brand-text bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage/10 focus:border-brand-sage cursor-pointer"
                      >
                        {savers.map((s) => (
                          <option key={s.id} value={s.id}>
                            👤 {s.name} ({s.targetName})
                          </option>
                        ))}
                      </select>
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-brand-text-muted pointer-events-none" />
                    </div>
                  )}
                </div>

                <div className="p-4 bg-brand-sage-light/60 rounded-2xl border border-brand-border flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-brand-coral shrink-0 mt-0.5" />
                  <p className="text-[11px] text-brand-text-muted leading-relaxed font-semibold">
                    Sebagai Penabung, Anda dapat melacak pencapaian rencana impian s/d 100%, memeriksa rincian transaksi masuk & keluar, melihat grafik bulanan, serta mencetak struk kuitansi resmi.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={savers.length === 0}
                  className={`w-full py-3 px-4 font-bold text-sm text-white bg-brand-sage hover:bg-brand-sage-dark rounded-xl shadow-md shadow-brand-sage/10 transition-all flex items-center justify-center gap-2 cursor-pointer duration-150 ${
                    savers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Masuk ke Rekening Saya
                </button>
              </form>
            )}

            {/* Form: Admin role login */}
            {loginTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Contoh: admin"
                      value={adminUsername}
                      onChange={(e) => {
                        setAdminUsername(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-xs text-brand-text bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage/10 focus:border-brand-sage font-semibold"
                      required
                    />
                    <User className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-brand-text-muted pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Masukkan password admin..."
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-xs text-brand-text bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage/10 focus:border-brand-sage font-semibold"
                      required
                    />
                    <Key className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-brand-text-muted pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 font-bold text-sm text-white bg-brand-sidebar hover:opacity-90 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer duration-150"
                >
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  Masuk sebagai Pengelola
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans antialiased flex flex-col lg:flex-row">
      
      {/* SIDEBAR NAVIGATION - Matches BANK BINK BUNK from Design HTML */}
      <aside className="w-full lg:w-72 bg-brand-sidebar border-b lg:border-b-0 lg:border-r border-brand-border flex flex-col p-6 lg:p-8 shrink-0">
        <div className="flex items-center justify-between lg:block mb-6 lg:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-sage rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-brand-sage block leading-none">Aplikasi</span>
              <span className="text-xl font-serif italic font-bold text-brand-sage-dark">BANK BINK BUNK</span>
            </div>
          </div>
          
          {/* Mobile responsive Quick Seeds / Session header buttons */}
          <div className="flex lg:hidden gap-1.5 flex-wrap items-center">
            {userRole === 'admin' ? (
              <button
                onClick={handleResetEmpty}
                className="p-1.5 text-brand-text-muted hover:text-[#D97B5F] duration-150 cursor-pointer"
                title="Kosongkan Data"
              >
                <Layers className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-[10px] bg-[#82927E]/10 border border-[#82927E]/20 text-[#3E4437] font-semibold px-2 py-0.5 rounded-full">
                👤 {activeSaver?.name}
              </span>
            )}
            
            <button
              id="mobile-logout-btn"
              onClick={handleLogout}
              className="p-1.5 text-[#D97B5F] hover:text-[#C86B51] hover:bg-[#D97B5F]/10 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all ml-1"
              title="Keluar Akun"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-4 lg:pb-0 lg:space-y-1.5 flex-1 border-b lg:border-b-0 border-brand-border/40 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm rounded-xl transition-all font-semibold whitespace-nowrap shrink-0 ${
              activeTab === 'all'
                ? 'bg-white text-brand-sage-dark shadow-sm border border-brand-border'
                : 'text-brand-text-muted hover:bg-white/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeTab === 'all' ? 'bg-brand-sage' : 'bg-transparent'}`}></span>
            {userRole === 'admin' ? 'Semua Ringkasan' : 'Ringkasan Saya'}
          </button>
          
          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('setor')}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm rounded-xl transition-all font-semibold whitespace-nowrap shrink-0 ${
                activeTab === 'setor'
                  ? 'bg-white text-brand-sage-dark shadow-sm border border-brand-border'
                  : 'text-brand-text-muted hover:bg-white/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'setor' ? 'bg-brand-sage' : 'bg-transparent'}`}></span>
              Catat Tabungan
            </button>
          )}

          <button
            onClick={() => setActiveTab('riwayat')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm rounded-xl transition-all font-semibold whitespace-nowrap shrink-0 ${
              activeTab === 'riwayat'
                ? 'bg-white text-brand-sage-dark shadow-sm border border-brand-border'
                : 'text-brand-text-muted hover:bg-white/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeTab === 'riwayat' ? 'bg-brand-sage' : 'bg-transparent'}`}></span>
            Riwayat Transaksi
          </button>
          <button
            onClick={() => setActiveTab('analisis')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm rounded-xl transition-all font-semibold whitespace-nowrap shrink-0 ${
              activeTab === 'analisis'
                ? 'bg-white text-brand-sage-dark shadow-sm border border-brand-border'
                : 'text-brand-text-muted hover:bg-white/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeTab === 'analisis' ? 'bg-brand-sage' : 'bg-transparent'}`}></span>
            Grafik Analisis
          </button>
        </nav>

        {/* Profile Card & Logout Widget on Desktop */}
        <div className="hidden lg:block mt-auto pb-4 border-b border-brand-border/60 mb-4 pt-4">
          <div className="bg-[#F2EDE4]/40 p-4 rounded-2xl border border-[#E5E0D5]/60 space-y-3">
            <div className="flex gap-2.5 items-center">
              <div className="w-9 h-9 rounded-full bg-[#3E4437] text-white flex items-center justify-center font-serif text-sm font-bold shadow-sm shrink-0">
                {userRole === 'admin' ? 'A' : activeSaver?.name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-extrabold text-[#7A8274] leading-none uppercase tracking-wider">
                  {userRole === 'admin' ? 'Sesi Admin' : 'Sesi Penabung'}
                </p>
                <p className="text-xs font-serif font-bold text-[#3E4437] mt-1 truncate">
                  {userRole === 'admin' ? 'Keluarga Budiman' : activeSaver?.name}
                </p>
              </div>
            </div>

            <button
              id="desktop-logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#D97B5F] bg-[#D97B5F]/15 hover:bg-[#D97B5F]/20 transition-all rounded-xl cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar Akun
            </button>
          </div>
        </div>

        {/* Action triggers in Sidebar on Desktop (Admin only) */}
        {userRole === 'admin' && (
          <div className="hidden lg:flex flex-col gap-1.5 pb-4 border-b border-brand-border/60 mb-4">
            <button
              onClick={handleResetEmpty}
              className="w-full flex items-center justify-between text-left p-2.5 rounded-xl hover:bg-red-50/40 text-[11px] text-brand-text-muted hover:text-brand-coral transition-colors duration-150 cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <Layers className="h-3.5 w-3.5 text-brand-coral" />
                Kosongkan Semua Data
              </span>
            </button>
          </div>
        )}

        {/* Motivational Sidebar Tips Widget - Matches Design HTML */}
        <div className="mt-6 lg:mt-auto p-4 bg-brand-coral/10 rounded-2xl border border-brand-coral/20">
          <p className="text-[10px] uppercase tracking-widest text-[#D97B5F] font-extrabold mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Tips Menabung
          </p>
          <p className="text-xs text-brand-text-muted leading-relaxed italic">
            "Menabung sedikit demi sedikit, lama-lama menjadi bukit. Investasikan masa depan Anda hari ini."
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT PORTAL CONTAINER */}
      <main className="flex-1 flex flex-col p-5 sm:p-8 lg:p-10 overflow-x-hidden">
        
        {/* Warm Cozy Natural Header Section - Natural Tones Style */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-brand-border">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-text tracking-tight mb-1.5">
              Halo, {userRole === 'admin' ? 'Keluarga Budiman' : (activeSaver ? activeSaver.name : 'Penabung')}
            </h2>
            <p className="text-brand-text-muted text-sm font-medium">
              {userRole === 'admin' 
                ? 'Sesi Admin: Anda memiliki akses penuh untuk menambah nama, mencatat setoran, penarikan, & mengelola data.'
                : 'Sesi Penabung: Pantau total saldo tabungan, grafik analisis pertumbuhan, dan rincian transaksi Anda secara aman.'}
            </p>
          </div>
          <div className="text-left md:text-right bg-gradient-to-br from-[#0B3F38] to-[#062924] text-white py-3.5 px-5 rounded-2xl border border-brand-coral/20 shadow-md">
            <p className="text-[10px] uppercase tracking-widest text-brand-coral font-bold">
              {userRole === 'admin' ? 'Total Tabungan Kolektif' : 'Saldo Tabungan Saya'}
            </p>
            <p className="text-2xl md:text-3xl font-bold font-mono tracking-tight mt-0.5 text-[#FFFEEB]">
              Rp {(userRole === 'admin' ? totalPoolBalance : activeSaverBalance).toLocaleString('id-ID')}
            </p>
          </div>
        </header>

        {/* Tab-driven layout for better view & spacing */}
        <div className="space-y-6">
          
          {/* Tab 1: Always show Saver list so they can switch profiles and click Add Saver */}
          <section id="saver-selectors-container">
            <SaverSelector
              savers={visibleSavers}
              activeSaverId={userRole === 'saver' ? loggedInSaverId : activeSaverId}
              onSelectSaver={userRole === 'saver' ? undefined : handleSelectSaver}
              onAddSaver={userRole === 'saver' ? undefined : handleAddSaver}
              onDeleteSaver={userRole === 'saver' ? undefined : handleDeleteSaver}
              onUpdateSaverTarget={userRole === 'saver' ? undefined : handleUpdateSaverTarget}
              transactions={transactions}
              isReadOnly={userRole === 'saver'}
            />
          </section>

          {/* Dynamic Content Views */}
          {activeTab === 'all' && (
            <div className="space-y-6">
              {/* Module: Main stats overview */}
              <section id="overview-metrics-container">
                <SavingsOverview
                  activeSaver={activeSaver}
                  savers={visibleSavers}
                  transactions={transactions}
                />
              </section>

              {/* Module: Grid transaction creator + charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {userRole === 'admin' ? (
                  <>
                    <div className="lg:col-span-4">
                      <TransactionPanel
                        activeSaver={activeSaver}
                        activeBalance={activeSaverBalance}
                        onAddTransaction={handleAddTransaction}
                      />
                    </div>
                    <div className="lg:col-span-8">
                      <HistoryPanel
                        activeSaver={activeSaver}
                        savers={savers}
                        transactions={transactions}
                        onDeleteTransaction={handleDeleteTransaction}
                        isReadOnly={false}
                      />
                    </div>
                  </>
                ) : (
                  <div className="lg:col-span-12">
                    <HistoryPanel
                      activeSaver={activeSaver}
                      savers={savers}
                      transactions={transactions}
                      isReadOnly={true}
                    />
                  </div>
                )}
              </div>

              {/* Module: Chart insights */}
              <section id="analytical-insight-container" className="pt-4">
                <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
                  <h3 className="text-base font-extrabold text-[#5A6354] mb-4 font-serif italic">Analisis Pertumbuhan Tabungan</h3>
                  <SaverChart
                    activeSaver={activeSaver}
                    transactions={transactions}
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'setor' && userRole === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <TransactionPanel
                  activeSaver={activeSaver}
                  activeBalance={activeSaverBalance}
                  onAddTransaction={handleAddTransaction}
                />
              </div>
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-brand-border space-y-4">
                <h3 className="font-serif italic font-bold text-lg text-brand-sage-dark">
                  Informasi Setoran Terakhir {activeSaver ? activeSaver.name : ''}
                </h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  Menabung secara konsisten Rp 10.000 atau Rp 20.000 setiap sore dapat membuat target cepat tercapai. Pastikan data yang dimasukkan sudah benar.
                </p>
                
                {/* Micro savings metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-brand-sidebar rounded-xl border border-brand-border">
                    <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Jumlah Setoran</span>
                    <span className="text-xl font-mono font-bold text-brand-text">
                      {transactions.filter(t => t.saverId === activeSaverId && t.type === 'deposit').length} kali
                    </span>
                  </div>
                  <div className="p-3 bg-brand-sidebar rounded-xl border border-brand-border">
                    <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Penarikan Mandiri</span>
                    <span className="text-xl font-mono font-bold text-brand-text">
                      {transactions.filter(t => t.saverId === activeSaverId && t.type === 'withdraw').length} kali
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="space-y-2">
              <HistoryPanel
                activeSaver={activeSaver}
                savers={savers}
                transactions={transactions}
                onDeleteTransaction={userRole === 'admin' ? handleDeleteTransaction : undefined}
                isReadOnly={userRole === 'saver'}
              />
            </div>
          )}

          {activeTab === 'analisis' && (
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
              <h3 className="text-base font-extrabold text-[#5A6354] mb-4 font-serif italic">Analisi Alur Keuangan & Chart</h3>
              <SaverChart
                activeSaver={activeSaver}
                transactions={transactions}
              />
            </div>
          )}
        </div>

        {/* Natural footer */}
        <footer className="mt-12 pt-6 border-t border-brand-border text-center space-y-2">
          <p className="text-[11px] text-brand-text-muted font-medium">
            Sistem Tabungan Digital &copy; 2026. Data disimpan secara mandiri dan offline di penyimpanan browser Anda (Local Storage).
          </p>
          <div className="flex justify-center gap-1 text-[10px] text-brand-sage-dark/80 font-mono">
            <span>#BankBinkBunk</span>
            <span>•</span>
            <span>#PertumbuhanSehat</span>
            <span>•</span>
            <span>#KolektifCerdas</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
