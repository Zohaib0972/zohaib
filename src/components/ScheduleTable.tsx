import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Coffee,
  Search,
  Building2,
  Sparkles,
  Grid,
  Columns,
  Layers,
  Edit3,
  UserCog,
  Zap,
  Check,
  X,
  Calendar,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from 'lucide-react';
import {
  TherapistSchedule,
  DayKey,
  DAYS_LIST,
  PortalTheme,
  BorderStyle,
  ScheduleSlot,
} from '../types';
import {
  calculateNextSlotTime,
  getLastSlotTiming,
  getSlotTimeForDay,
  calculateNextSlotTimeForDay,
} from '../utils/scheduleUtils';

interface ScheduleTableProps {
  schedule: TherapistSchedule;
  isAdmin: boolean;
  hideEmptyCells: boolean;
  onUpdateSlotTime: (slotIndex: number, newTime: string) => void;
  onUpdateSlotDayTime?: (slotIndex: number, day: DayKey, newTime: string) => void;
  onUpdateSlotCell: (slotIndex: number, day: DayKey, value: string) => void;
  onToggleBreak: (slotIndex: number) => void;
  onDeleteSlot: (slotIndex: number) => void;
  onUpdateShift: (newShift: string) => void;
  onOpenAddSlotModal: () => void;
  onAddSlot?: (slot: ScheduleSlot) => void;
  onAddSlotForDay?: (day: DayKey, customTime?: string, patientName?: string) => void;
  onOpenEditProfile?: () => void;
  theme?: PortalTheme;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedule,
  isAdmin,
  hideEmptyCells,
  onUpdateSlotTime,
  onUpdateSlotDayTime,
  onUpdateSlotCell,
  onToggleBreak,
  onDeleteSlot,
  onUpdateShift,
  onOpenAddSlotModal,
  onAddSlot,
  onAddSlotForDay,
  onOpenEditProfile,
  theme = 'executive',
}) => {
  // View Layout: 'boxes' (Day Columns with Day -> Time -> Patient Name) vs 'matrix' (Full Matrix Grid)
  const [viewLayout, setViewLayout] = useState<'boxes' | 'matrix'>('boxes');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<'all' | DayKey>('all');
  const [isEditingShift, setIsEditingShift] = useState(false);
  const [shiftInput, setShiftInput] = useState(schedule.shift);

  // Border Style State
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('refined');

  // Inline time editing state
  const [editingTimeState, setEditingTimeState] = useState<{
    slotIndex: number;
    dayKey: DayKey;
    timeValue: string;
  } | null>(null);

  // Inline cell patient editing state
  const [editingCellState, setEditingCellState] = useState<{
    slotIndex: number;
    dayKey: DayKey;
    patientValue: string;
  } | null>(null);

  const lastSlotTime = getLastSlotTiming(schedule);
  const next45mSlot = calculateNextSlotTime(lastSlotTime, 45);

  const handleQuickAdd45m = () => {
    if (!onAddSlot) return;
    const newSlot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      time: next45mSlot,
      isBreak: false,
      mon: '',
      tue: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
    };
    onAddSlot(newSlot);
  };

  const handleQuickAddForDay = (day: DayKey) => {
    if (onAddSlotForDay) {
      onAddSlotForDay(day);
    } else if (onAddSlot) {
      const nextTime = calculateNextSlotTimeForDay(schedule, day, 45);
      const newSlot: ScheduleSlot = {
        id: `slot-${day}-${Date.now()}`,
        time: nextTime,
        isBreak: false,
        mon: '',
        tue: '',
        wed: '',
        thu: '',
        fri: '',
        sat: '',
        dayTimes: {
          [day]: nextTime,
        },
      };
      onAddSlot(newSlot);
    }
  };

  const handleSaveInlineTime = () => {
    if (!editingTimeState) return;
    const { slotIndex, dayKey, timeValue } = editingTimeState;
    if (onUpdateSlotDayTime) {
      onUpdateSlotDayTime(slotIndex, dayKey, timeValue.trim());
    } else {
      onUpdateSlotTime(slotIndex, timeValue.trim());
    }
    setEditingTimeState(null);
  };

  const handleSaveInlineCell = () => {
    if (!editingCellState) return;
    const { slotIndex, dayKey, patientValue } = editingCellState;
    onUpdateSlotCell(slotIndex, dayKey, patientValue.trim());
    setEditingCellState(null);
  };

  const isLight = theme === 'clinical-light';
  const isEmerald = theme === 'emerald';
  const isSapphire = theme === 'sapphire';
  const isAmethyst = theme === 'amethyst';
  const isNordic = theme === 'nordic';

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const query = searchQuery.trim().toLowerCase();

  // Calculate counts per day
  const dayCounts = useMemo(() => {
    const counts: Record<DayKey, number> = {
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 0,
    };
    schedule.slots.forEach((slot) => {
      if (!slot.isBreak) {
        DAYS_LIST.forEach((d) => {
          if ((slot[d.key] || '').trim()) {
            counts[d.key]++;
          }
        });
      }
    });
    return counts;
  }, [schedule.slots]);

  const matchingCount = useMemo(() => {
    if (!query) return 0;
    let count = 0;
    schedule.slots.forEach((slot) => {
      DAYS_LIST.forEach((d) => {
        if ((slot[d.key] || '').toLowerCase().includes(query)) {
          count++;
        }
      });
    });
    return count;
  }, [schedule.slots, query]);

  const handleSaveShift = () => {
    if (shiftInput.trim() && shiftInput !== schedule.shift) {
      onUpdateShift(shiftInput.trim());
      setIsEditingShift(false);
    } else {
      setIsEditingShift(false);
    }
  };

  // Theme-specific styles
  const controlBarBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : isEmerald
    ? 'bg-[#08231d]/95 border-[#15463b] text-emerald-50 shadow-2xl backdrop-blur-md'
    : isSapphire
    ? 'bg-[#0a112c]/95 border-indigo-950/80 text-white shadow-2xl backdrop-blur-md'
    : isAmethyst
    ? 'bg-[#130b22]/95 border-purple-950/80 text-white shadow-2xl backdrop-blur-md'
    : isNordic
    ? 'bg-[#151f30]/95 border-slate-700/60 text-slate-100 shadow-xl backdrop-blur-md'
    : 'bg-slate-900/90 border-slate-800 text-white shadow-xl backdrop-blur-md';

  const searchInputBg = isLight
    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white'
    : isEmerald
    ? 'bg-[#04130f] border-[#15463b] text-emerald-100 placeholder:text-emerald-600 focus:border-emerald-400'
    : isSapphire
    ? 'bg-[#060c22] border-indigo-900/70 text-indigo-100 placeholder:text-indigo-400/60 focus:border-cyan-400'
    : isAmethyst
    ? 'bg-[#0d071a] border-purple-900/70 text-purple-100 placeholder:text-purple-400/60 focus:border-pink-400'
    : isNordic
    ? 'bg-[#0e1726] border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
    : 'bg-slate-950 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-cyan-500';

  const shiftBadgeBg = isLight
    ? 'bg-slate-100 border-slate-200 text-slate-800'
    : isEmerald
    ? 'bg-[#051713] border-[#15463b] text-emerald-200'
    : isSapphire
    ? 'bg-[#070e28] border-indigo-900/50 text-indigo-200'
    : isAmethyst
    ? 'bg-[#10081d] border-purple-900/50 text-purple-200'
    : isNordic
    ? 'bg-[#0f1a2a] border-slate-700/50 text-slate-200'
    : 'bg-slate-950 border-slate-800 text-slate-300';

  const tableContainerBg = isLight
    ? 'bg-white border-slate-200 shadow-xl'
    : isEmerald
    ? 'bg-[#071d18]/95 border-[#15463b]/70 shadow-2xl'
    : isSapphire
    ? 'bg-[#080f2b]/95 border-indigo-950/80 shadow-2xl'
    : isAmethyst
    ? 'bg-[#11091f]/95 border-purple-950/80 shadow-2xl'
    : isNordic
    ? 'bg-[#131d2d]/95 border-slate-700/70 shadow-2xl'
    : 'bg-slate-900/95 border-slate-800/70 shadow-2xl';

  const tableHeaderBg = isLight
    ? 'bg-slate-100/90 text-slate-800'
    : isEmerald
    ? 'bg-[#0b2d24] text-emerald-200'
    : isSapphire
    ? 'bg-[#0c163b] text-indigo-200'
    : isAmethyst
    ? 'bg-[#180d2c] text-purple-200'
    : isNordic
    ? 'bg-[#182438] text-slate-200'
    : 'bg-slate-900/90 text-slate-300';

  const colDividerClass =
    borderStyle === 'grid'
      ? isLight
        ? 'border-r border-slate-300'
        : 'border-r border-slate-700/60'
      : borderStyle === 'refined'
      ? isLight
        ? 'border-r border-slate-200/80'
        : 'border-r border-slate-800/40'
      : '';

  const filteredDays = useMemo(() => {
    if (selectedDayFilter === 'all') return DAYS_LIST;
    return DAYS_LIST.filter((d) => d.key === selectedDayFilter);
  }, [selectedDayFilter]);

  return (
    <div className="space-y-4">
      {/* Control Bar (Search, View Mode Switcher, Shift, Presets) */}
      <div className={`${controlBarBg} border p-4 rounded-3xl no-print shadow-lg`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              className={`absolute left-3.5 top-3 w-4 h-4 ${
                isEmerald
                  ? 'text-emerald-400'
                  : isSapphire
                  ? 'text-indigo-400'
                  : isAmethyst
                  ? 'text-purple-400'
                  : 'text-cyan-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name (e.g. Yahya, Mustafa)..."
              className={`w-full ${searchInputBg} border rounded-xl pl-10 pr-24 py-2.5 text-xs focus:outline-none focus:ring-1 transition-all font-medium`}
            />
            {searchQuery && (
              <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {matchingCount} found
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-white px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Shift Details & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Layout Switcher (Requested: Individual Day Boxes with Day -> Time -> Patient Name) */}
            <div className="flex items-center p-1 rounded-2xl bg-black/25 border border-slate-800/80">
              <button
                type="button"
                onClick={() => setViewLayout('boxes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'boxes'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Individual Day Boxes: Day on top, Time below, Patient Name below inside each box"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Day Columns (Individual Boxes)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('matrix')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'matrix'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Full Matrix Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Matrix Table</span>
              </button>
            </div>

            {/* Shift Badge */}
            <div className={`flex items-center gap-2 ${shiftBadgeBg} border px-3.5 py-2 rounded-xl`}>
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              {isEditingShift && isAdmin ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={shiftInput}
                    onChange={(e) => setShiftInput(e.target.value)}
                    className="bg-black/40 border border-cyan-500/50 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none"
                    placeholder="e.g. 12:30 PM TO 6:00 PM"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveShift();
                      if (e.key === 'Escape') setIsEditingShift(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveShift}
                    className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                    title="Save shift"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingShift(false)}
                    className="p-1 text-slate-400 hover:bg-slate-700/50 rounded"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block leading-tight font-bold">
                      Working Shift
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {schedule.shift}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShiftInput(schedule.shift);
                        setIsEditingShift(true);
                      }}
                      className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors"
                      title="Edit shift timings"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                {/* 1-Click +45m Auto Slot Button */}
                <button
                  type="button"
                  onClick={handleQuickAdd45m}
                  title={`Auto Gap: Add next 45-minute slot (${next45mSlot})`}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer border border-emerald-400/40"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>+ Auto Slot ({next45mSlot.split(' - ')[0]})</span>
                </button>

                {/* Custom Slot Modal */}
                <button
                  type="button"
                  onClick={onOpenAddSlotModal}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Custom Slot</span>
                </button>

                {/* Edit Profile */}
                {onOpenEditProfile && (
                  <button
                    type="button"
                    onClick={onOpenEditProfile}
                    className="border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Edit therapist profile, shift and branch"
                  >
                    <UserCog className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Day Filter Pills & Border Style Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Filter Day:
            </span>
            <button
              type="button"
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDayFilter === 'all'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              All Days (Mon - Sat)
            </button>
            {DAYS_LIST.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDayFilter(day.key)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedDayFilter === day.key
                    ? 'bg-cyan-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{day.shortLabel}</span>
                <span className="text-[10px] opacity-70 font-mono">({dayCounts[day.key] || 0})</span>
              </button>
            ))}
          </div>

          {/* Border Style Selector */}
          <div className="flex items-center gap-1 shrink-0 bg-black/20 p-1 rounded-xl border border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" /> Border:
            </span>
            <button
              type="button"
              onClick={() => setBorderStyle('refined')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                borderStyle === 'refined'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Refined Subtle
            </button>
            <button
              type="button"
              onClick={() => setBorderStyle('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                borderStyle === 'grid'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Crisp Grid
            </button>
            <button
              type="button"
              onClick={() => setBorderStyle('minimal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                borderStyle === 'minimal'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Seamless
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIMARY REQUESTED VIEW: DAY COLUMNS (Day on Top -> Time Below -> Patient Name Below) */}
      {/* ========================================================================= */}
      {viewLayout === 'boxes' ? (
        <div id="printableArea" className={`print-area ${hideEmptyCells ? 'print-hide-empty' : ''}`}>
          {/* Day Columns Container */}
          <div
            className={`grid grid-cols-1 ${
              selectedDayFilter === 'all'
                ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
                : 'grid-cols-1 max-w-xl mx-auto'
            } gap-4`}
          >
            {filteredDays.map((day) => {
              const daySlots = schedule.slots;
              const bookedCount = dayCounts[day.key] || 0;

              return (
                <div
                  key={day.key}
                  className={`flex flex-col rounded-3xl border overflow-hidden ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-md'
                      : isEmerald
                      ? 'bg-[#08231d]/90 border-[#15463b]'
                      : isSapphire
                      ? 'bg-[#0a1435]/90 border-indigo-950/80'
                      : isAmethyst
                      ? 'bg-[#150b26]/90 border-purple-950/80'
                      : isNordic
                      ? 'bg-[#152133]/90 border-slate-700/60'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  {/* Day Column Header */}
                  <div
                    className={`p-3.5 border-b flex items-center justify-between ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-900'
                        : isEmerald
                        ? 'bg-[#0b2d24] border-[#15463b] text-emerald-200'
                        : isSapphire
                        ? 'bg-[#0c163b] border-indigo-950 text-indigo-200'
                        : isAmethyst
                        ? 'bg-[#180d2c] border-purple-950 text-purple-200'
                        : isNordic
                        ? 'bg-[#182438] border-slate-700 text-slate-200'
                        : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm uppercase tracking-wider">
                          {day.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          {bookedCount} Booked
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {daySlots.length} Total Slot Windows
                      </span>
                    </div>

                    {/* Quick + Add Slot for this specific day */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleQuickAddForDay(day.key)}
                        className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer shadow-xs"
                        title={`Add next 45m slot to ${day.label}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Vertically Stacked Individual Slot Boxes */}
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[850px]">
                    {daySlots.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-2xl border-slate-800">
                        No slots configured.
                      </div>
                    ) : (
                      daySlots.map((slot, slotIndex) => {
                        const slotTime = getSlotTimeForDay(slot, day.key);
                        const patientName = slot[day.key] || '';
                        const isBreak = slot.isBreak || patientName.toUpperCase().includes('BREAK');
                        const isBooked = !!patientName.trim() && !isBreak;
                        const isVacant = !patientName.trim() && !isBreak;

                        if (hideEmptyCells && isVacant) {
                          return null;
                        }

                        const isSearchMatch =
                          query && patientName.toLowerCase().includes(query);

                        const isEditingThisTime =
                          editingTimeState?.slotIndex === slotIndex &&
                          editingTimeState?.dayKey === day.key;

                        const isEditingThisCell =
                          editingCellState?.slotIndex === slotIndex &&
                          editingCellState?.dayKey === day.key;

                        return (
                          <div
                            key={slot.id || `slot-${slotIndex}`}
                            className={`rounded-2xl p-3 border transition-all duration-200 relative group ${
                              isBreak
                                ? isLight
                                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                  : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                                : isSearchMatch
                                ? 'bg-sky-500/10 border-sky-400 shadow-md ring-1 ring-sky-400'
                                : isBooked
                                ? isLight
                                  ? 'bg-slate-50/90 border-slate-300 hover:border-cyan-500 hover:shadow-md'
                                  : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/60 hover:shadow-lg'
                                : isLight
                                ? 'bg-white border-dashed border-slate-300 opacity-75 hover:opacity-100'
                                : 'bg-slate-950/30 border-dashed border-slate-800/80 opacity-70 hover:opacity-100'
                            }`}
                          >
                            {/* 1. UPPER PART: DAY BADGE + TIME BADGE */}
                            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/50">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Day Tag */}
                                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                  {day.shortLabel}
                                </span>

                                {/* TIME BADGE (Requested: e.g. 09:45 AM TO 10:30 AM) */}
                                {isEditingThisTime ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editingTimeState.timeValue}
                                      onChange={(e) =>
                                        setEditingTimeState({
                                          ...editingTimeState,
                                          timeValue: e.target.value,
                                        })
                                      }
                                      className="bg-black/60 border border-cyan-400 rounded px-1.5 py-0.5 text-xs text-white font-mono w-36 focus:outline-none"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveInlineTime();
                                        if (e.key === 'Escape') setEditingTimeState(null);
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={handleSaveInlineTime}
                                      className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTimeState(null)}
                                      className="p-1 text-slate-400 hover:bg-slate-800 rounded"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span
                                      onClick={() => {
                                        if (isAdmin) {
                                          setEditingTimeState({
                                            slotIndex,
                                            dayKey: day.key,
                                            timeValue: slotTime,
                                          });
                                        }
                                      }}
                                      title={isAdmin ? 'Click to edit timing for this slot' : ''}
                                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border transition-all ${
                                        isAdmin ? 'cursor-pointer hover:border-cyan-400' : ''
                                      } ${
                                        isLight
                                          ? 'bg-slate-200/80 text-slate-900 border-slate-300'
                                          : 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40'
                                      }`}
                                    >
                                      <Clock3 className="w-3 h-3 text-cyan-400 shrink-0" />
                                      <span>{slotTime}</span>
                                    </span>
                                    {isAdmin && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingTimeState({
                                            slotIndex,
                                            dayKey: day.key,
                                            timeValue: slotTime,
                                          })
                                        }
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-cyan-300 cursor-pointer"
                                        title="Edit this timing"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Action Icons (Break / Delete) */}
                              {isAdmin && (
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => onToggleBreak(slotIndex)}
                                    title={isBreak ? 'Unmark Break' : 'Set as Break'}
                                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                                      isBreak
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                                    }`}
                                  >
                                    <Coffee className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteSlot(slotIndex)}
                                    title="Delete this time slot"
                                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* 2. LOWER PART: PATIENT NAME (Requested: isi k neechy paitent ka naam ajaye) */}
                            <div className="space-y-1.5">
                              {isEditingThisCell ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingCellState.patientValue}
                                    onChange={(e) =>
                                      setEditingCellState({
                                        ...editingCellState,
                                        patientValue: e.target.value,
                                      })
                                    }
                                    placeholder="Enter Patient Name..."
                                    className="w-full bg-black/70 border border-cyan-400 rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlineCell();
                                      if (e.key === 'Escape') setEditingCellState(null);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleSaveInlineCell}
                                    className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCellState(null)}
                                    className="p-1 text-slate-400 hover:bg-slate-800 rounded"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    if (isAdmin) {
                                      setEditingCellState({
                                        slotIndex,
                                        dayKey: day.key,
                                        patientValue: patientName,
                                      });
                                    }
                                  }}
                                  className={`rounded-xl p-2 transition-all ${
                                    isAdmin ? 'cursor-pointer hover:bg-white/5' : ''
                                  }`}
                                >
                                  {isBreak ? (
                                    <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                                      <Coffee className="w-3.5 h-3.5" />
                                      <span>{patientName || 'TEA / CLINICAL BREAK'}</span>
                                    </div>
                                  ) : isBooked ? (
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-black text-sm tracking-tight text-white block">
                                          {patientName}
                                        </span>
                                        {isAdmin && (
                                          <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                          Booked Session
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between text-slate-500 hover:text-cyan-400 transition-colors py-1">
                                      <span className="text-xs font-medium italic">
                                        {isAdmin ? '+ Click to assign patient' : 'Vacant Slot'}
                                      </span>
                                      {isAdmin && <Plus className="w-3.5 h-3.5 opacity-60" />}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. MATRIX GRID VIEW (Also with Day & Time displayed on top of each cell) */
        /* ========================================================================= */
        <div id="printableArea" className={`print-area ${hideEmptyCells ? 'print-hide-empty' : ''}`}>
          <div
            className={`${tableContainerBg} border rounded-3xl overflow-hidden print:border-none print:shadow-none print:bg-white transition-all`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${tableHeaderBg} print:bg-slate-100 print:text-black`}>
                    <th className="p-3.5 w-16 text-center text-xs font-bold uppercase tracking-wider">
                      #
                    </th>
                    {filteredDays.map((day) => (
                      <th
                        key={day.key}
                        className={`p-3.5 min-w-[160px] ${tableHeaderBg} ${colDividerClass} text-xs font-bold uppercase tracking-wider`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{day.label}</span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            ({dayCounts[day.key] || 0})
                          </span>
                        </div>
                      </th>
                    ))}
                    {isAdmin && (
                      <th className="p-2 w-20 text-center text-xs font-bold uppercase tracking-wider no-print">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="text-sm divide-y divide-slate-800/40">
                  {schedule.slots.map((slot, slotIndex) => (
                    <tr
                      key={slot.id || `slot-row-${slotIndex}`}
                      className="hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="p-3 text-center text-xs font-mono font-bold text-slate-400">
                        {slotIndex + 1}
                      </td>

                      {filteredDays.map((day) => {
                        const slotTime = getSlotTimeForDay(slot, day.key);
                        const patientName = slot[day.key] || '';
                        const isBreak = slot.isBreak || patientName.toUpperCase().includes('BREAK');
                        const isBooked = !!patientName.trim() && !isBreak;

                        return (
                          <td key={day.key} className={`p-2.5 ${colDividerClass}`}>
                            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2 space-y-1.5">
                              {/* Cell Timing on Top */}
                              <div className="flex items-center justify-between gap-1 text-[11px] font-mono font-bold text-cyan-300">
                                <span>{slotTime}</span>
                                {isBreak && (
                                  <span className="text-[9px] px-1.5 rounded bg-amber-500/20 text-amber-300">
                                    Break
                                  </span>
                                )}
                              </div>

                              {/* Patient Name below */}
                              {isAdmin ? (
                                <input
                                  type="text"
                                  value={patientName}
                                  onChange={(e) =>
                                    onUpdateSlotCell(slotIndex, day.key, e.target.value)
                                  }
                                  placeholder="Vacant / Click to assign"
                                  className={`w-full bg-slate-900 border border-slate-700/60 rounded px-2 py-1 text-xs font-bold ${
                                    isBreak
                                      ? 'text-amber-300'
                                      : isBooked
                                      ? 'text-white'
                                      : 'text-slate-400 placeholder:text-slate-600'
                                  }`}
                                />
                              ) : (
                                <div className="text-xs font-bold text-slate-200">
                                  {patientName || (
                                    <span className="text-slate-600 italic">Vacant</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {isAdmin && (
                        <td className="p-2 text-center no-print">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onToggleBreak(slotIndex)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                              title="Toggle Break"
                            >
                              <Coffee className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSlot(slotIndex)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                              title="Delete Slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
