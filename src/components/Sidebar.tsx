import React from 'react';
import {
  Clock,
  UserPlus,
  Trash2,
  LogOut,
  Calendar,
  Users,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  Coffee,
  X,
  FileSpreadsheet,
  KeyRound,
  ShieldCheck,
  Stethoscope,
  Building,
  Palette,
  Sun,
  Moon,
  Leaf,
  Sparkles,
  MapPin,
  Gem,
  Compass,
  UserCog,
} from 'lucide-react';
import { UserAccount, TherapistSchedule, PortalTheme, ActivePortalTab } from '../types';

interface SidebarProps {
  currentUser: UserAccount;
  allTherapists: TherapistSchedule[];
  selectedKey: string;
  onSelectTherapist: (key: string) => void;
  onOpenAddTherapist: () => void;
  onOpenManageUsers: () => void;
  onOpenEditCurrentTherapist?: () => void;
  onDeleteTherapist: (key: string) => void;
  stats: {
    totalSlots: number;
    bookedSlots: number;
    openSlots: number;
    breakSlots: number;
    uniquePatients: number;
  };
  hideEmptyCells: boolean;
  onToggleHideEmptyCells: (val: boolean) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onExportAllCsv: () => void;
  theme: PortalTheme;
  onSelectTheme: (t: PortalTheme) => void;
  activeTab: ActivePortalTab;
  onSelectTab: (t: ActivePortalTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  allTherapists,
  selectedKey,
  onSelectTherapist,
  onOpenAddTherapist,
  onOpenManageUsers,
  onOpenEditCurrentTherapist,
  onDeleteTherapist,
  stats,
  hideEmptyCells,
  onToggleHideEmptyCells,
  onLogout,
  mobileOpen,
  onCloseMobile,
  onExportAllCsv,
  theme,
  onSelectTheme,
  activeTab,
  onSelectTab,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const bookedPercent = stats.totalSlots > 0 ? Math.round((stats.bookedSlots / stats.totalSlots) * 100) : 0;

  // Theme styling definitions for the sidebar
  const isLight = theme === 'clinical-light';
  const isEmerald = theme === 'emerald';
  const isSapphire = theme === 'sapphire';
  const isAmethyst = theme === 'amethyst';
  const isNordic = theme === 'nordic';

  const asideBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-xl'
    : isEmerald
    ? 'bg-[#091f1a]/95 border-[#15463b] text-emerald-50 shadow-2xl'
    : isSapphire
    ? 'bg-[#0a112a]/95 border-indigo-950/80 text-white shadow-2xl'
    : isAmethyst
    ? 'bg-[#130b22]/95 border-purple-950/80 text-white shadow-2xl'
    : isNordic
    ? 'bg-[#141e2e]/95 border-slate-700/60 text-slate-100 shadow-xl'
    : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-2xl';

  const cardBg = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
    : isEmerald
    ? 'bg-[#051612]/80 border-[#15463b] text-emerald-100 shadow-inner'
    : isSapphire
    ? 'bg-[#060c22]/80 border-indigo-900/40 text-indigo-100 shadow-inner'
    : isAmethyst
    ? 'bg-[#0e071a]/80 border-purple-900/40 text-purple-100 shadow-inner'
    : isNordic
    ? 'bg-[#0d1624]/80 border-slate-700/40 text-slate-100 shadow-inner'
    : 'bg-slate-950/70 border-slate-800 text-slate-100 shadow-inner';

  const statCardBg = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-2xs'
    : isEmerald
    ? 'bg-[#08221c] border-[#15463b] text-emerald-100'
    : isSapphire
    ? 'bg-[#0a1438] border-indigo-900/60 text-indigo-100'
    : isAmethyst
    ? 'bg-[#180e2b] border-purple-900/60 text-purple-100'
    : isNordic
    ? 'bg-[#162338] border-slate-700/50 text-slate-100'
    : 'bg-slate-900 border-slate-800 text-slate-100';

  const selectBg = isLight
    ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
    : isEmerald
    ? 'bg-[#041410] border-[#15463b] text-emerald-100 focus:border-emerald-400'
    : isSapphire
    ? 'bg-[#060c22] border-indigo-800/60 text-indigo-100 focus:border-cyan-400'
    : isAmethyst
    ? 'bg-[#0d071a] border-purple-800/60 text-purple-100 focus:border-pink-400'
    : isNordic
    ? 'bg-[#0e1726] border-slate-700 text-slate-100 focus:border-cyan-400'
    : 'bg-slate-900 border-slate-700/80 text-white focus:border-cyan-500';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-80 ${asideBg} border-r flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Medical Brand Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isLight
              ? 'border-slate-200 bg-slate-50/70'
              : isEmerald
              ? 'border-[#15463b] bg-[#061814]/70'
              : isSapphire
              ? 'border-indigo-950/80 bg-[#070e24]/70'
              : isAmethyst
              ? 'border-purple-950/80 bg-[#0f071c]/70'
              : isNordic
              ? 'border-slate-700/60 bg-[#0f1726]/70'
              : 'border-slate-800/90 bg-slate-950/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center shrink-0">
              <img
                src="/therapy-hub-logo.jpg"
                alt="Therapy Hub Logo"
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain rounded-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-base tracking-tight">Therapy Hub</h2>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                    isLight
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : isEmerald
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isSapphire
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  CLINIC
                </span>
              </div>
              <p
                className={`text-[11px] font-medium flex items-center gap-1 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <Building className="w-3 h-3 text-cyan-400" />
                PECHS Main Campus
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className={`lg:hidden p-2 rounded-xl transition-colors ${
              isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
            }`}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRIMARY PORTAL NAVIGATION SWITCHER (Schedules vs Attendance) */}
        <div className="p-3 mx-4 mt-3 bg-black/20 rounded-2xl border border-slate-800/60">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onSelectTab('schedules')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedules</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('attendance')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attendance</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse absolute top-1.5 right-1.5" />
            </button>
          </div>
        </div>

        {/* Active User Info Profile */}
        <div className={`p-3.5 mx-4 my-2.5 ${cardBg} border rounded-2xl flex items-center justify-between`}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                isAdmin
                  ? 'bg-gradient-to-br from-indigo-600 to-cyan-600 text-white'
                  : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white'
              }`}
            >
              {currentUser.avatarInitials || currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isAdmin
                      ? isLight
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : isLight
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="w-3 h-3 text-indigo-500" /> : <Users className="w-3 h-3 text-emerald-500" />}
                  {currentUser.title || (isAdmin ? 'Admin' : 'Staff')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Controls Section */}
        <div className="px-4 py-1 flex-1 space-y-4 overflow-y-auto">
          {/* Select Therapist (ADMIN ONLY) */}
          {isAdmin ? (
            <div className={`space-y-2.5 ${cardBg} p-3.5 rounded-2xl border`}>
              <div className="flex items-center justify-between">
                <label
                  className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Therapist Roster
                </label>
                <button
                  type="button"
                  onClick={onOpenAddTherapist}
                  className="text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedKey}
                  onChange={(e) => onSelectTherapist(e.target.value)}
                  className={`w-full ${selectBg} border rounded-xl p-2.5 text-xs font-semibold transition-colors cursor-pointer focus:outline-none`}
                >
                  {allTherapists.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.title}
                    </option>
                  ))}
                </select>

                {onOpenEditCurrentTherapist && (
                  <button
                    type="button"
                    onClick={onOpenEditCurrentTherapist}
                    title="Edit Selected Therapist Profile"
                    className="bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 p-2.5 rounded-xl transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                  >
                    <UserCog className="w-4 h-4 text-cyan-400" />
                  </button>
                )}

                {allTherapists.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteTherapist(selectedKey)}
                    title="Remove Selected Therapist"
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Accounts & IDs Manager Button */}
              <button
                type="button"
                onClick={onOpenManageUsers}
                className="w-full mt-2 border border-indigo-500/40 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Manage Accounts & Passwords</span>
              </button>
            </div>
          ) : (
            <div
              className={`p-3 border rounded-2xl text-xs flex items-start gap-2.5 ${
                isLight
                  ? 'bg-sky-50 border-sky-200 text-sky-900'
                  : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Staff Portal Access</span>
                <span className="text-[11px] opacity-85 leading-relaxed">
                  Viewing assigned schedules and marking your daily GPS geofence attendance.
                </span>
              </div>
            </div>
          )}

          {/* Quick Summary Stats with Progress Bar */}
          <div className={`space-y-2.5 ${cardBg} p-3.5 rounded-2xl border`}>
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                Schedule Capacity
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">{bookedPercent}% Booked</span>
            </div>

            {/* Visual Capacity Bar */}
            <div
              className={`w-full h-2 rounded-full overflow-hidden ${
                isLight ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            >
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-500 to-emerald-500"
                style={{ width: `${bookedPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className={`${statCardBg} border p-2.5 rounded-xl`}>
                <div
                  className={`flex items-center gap-1.5 text-[10px] mb-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-cyan-500" />
                  <span>Total Slots</span>
                </div>
                <div className={`font-extrabold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {stats.totalSlots}
                </div>
              </div>

              <div className={`${statCardBg} border p-2.5 rounded-xl`}>
                <div
                  className={`flex items-center gap-1.5 text-[10px] mb-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Booked</span>
                </div>
                <div className="font-extrabold text-emerald-500 text-base">{stats.bookedSlots}</div>
              </div>

              <div className={`${statCardBg} border p-2.5 rounded-xl`}>
                <div
                  className={`flex items-center gap-1.5 text-[10px] mb-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <Users className="w-3 h-3 text-indigo-500" />
                  <span>Available</span>
                </div>
                <div className={`font-extrabold text-base ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {stats.openSlots}
                </div>
              </div>

              <div className={`${statCardBg} border p-2.5 rounded-xl`}>
                <div
                  className={`flex items-center gap-1.5 text-[10px] mb-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <Coffee className="w-3 h-3 text-amber-500" />
                  <span>Break Slots</span>
                </div>
                <div className="font-extrabold text-amber-500 text-base">{stats.breakSlots}</div>
              </div>
            </div>
          </div>

          {/* 6 LUXURY THEMES SELECTOR */}
          <div
            className={`space-y-2.5 pt-3 border-t ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block flex items-center gap-1.5 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-cyan-500" />
                Portal Themes (6 Options)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {theme === 'executive'
                  ? 'Midnight'
                  : theme === 'clinical-light'
                  ? 'Hospital'
                  : theme === 'emerald'
                  ? 'Emerald'
                  : theme === 'sapphire'
                  ? 'Sapphire'
                  : theme === 'amethyst'
                  ? 'Amethyst'
                  : 'Nordic'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* 1. Midnight Executive */}
              <button
                type="button"
                onClick={() => onSelectTheme('executive')}
                title="Midnight Executive (Slate Navy & Cyan)"
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  theme === 'executive'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm ring-1 ring-cyan-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Midnight</span>
              </button>

              {/* 2. Hospital Pure Light */}
              <button
                type="button"
                onClick={() => onSelectTheme('clinical-light')}
                title="Pure Clinical Light (Hospital White)"
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  theme === 'clinical-light'
                    ? 'bg-sky-100 border-sky-500 text-sky-900 shadow-sm ring-1 ring-sky-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Hospital</span>
              </button>

              {/* 3. Emerald Health */}
              <button
                type="button"
                onClick={() => onSelectTheme('emerald')}
                title="Emerald Health (Forest Green & Mint)"
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  theme === 'emerald'
                    ? 'bg-[#09332a] border-emerald-400 text-emerald-300 shadow-sm ring-1 ring-emerald-400/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Emerald</span>
              </button>

              {/* 4. Royal Sapphire */}
              <button
                type="button"
                onClick={() => onSelectTheme('sapphire')}
                title="Royal Sapphire (Deep Navy & Electric Indigo)"
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  theme === 'sapphire'
                    ? 'bg-indigo-950 border-indigo-400 text-indigo-200 shadow-sm ring-1 ring-indigo-400/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Gem className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sapphire</span>
              </button>

              {/* 5. Amethyst Luxury */}
              <button
                type="button"
                onClick={() => onSelectTheme('amethyst')}
                title="Amethyst Luxury (Midnight Violet & Rose Gold)"
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  theme === 'amethyst'
                    ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-sm ring-1 ring-purple-400/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Amethyst</span>
              </button>

              {/* 6. Nordic Frost */}
              <button
                type="button"
                onClick={() => onSelectTheme('nordic')}
                title="Nordic Frost (Cool Graphite Slate & Ice Blue)"
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  theme === 'nordic'
                    ? 'bg-slate-800 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-400/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-cyan-300" />
                <span>Nordic</span>
              </button>
            </div>
          </div>

          {/* Print Preferences */}
          <div
            className={`space-y-2.5 pt-2 border-t ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block px-1 flex items-center gap-1.5 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Print Options
            </span>
            <label
              className={`flex items-center gap-2.5 text-xs cursor-pointer p-2.5 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <input
                type="checkbox"
                checked={hideEmptyCells}
                onChange={(e) => onToggleHideEmptyCells(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-medium text-[11px]">Hide Empty Cells on Print</span>
            </label>
          </div>

          {/* Admin Batch CSV Export */}
          {isAdmin && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onExportAllCsv}
                className={`w-full border p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Export All Schedules CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Logout */}
        <div
          className={`p-4 border-t ${
            isLight
              ? 'border-slate-200 bg-slate-50/70'
              : 'border-slate-800/90 bg-slate-950/40'
          }`}
        >
          <button
            onClick={onLogout}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border ${
              isLight
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
