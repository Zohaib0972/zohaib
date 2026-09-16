import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Coffee, Clock, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { ScheduleSlot } from '../types';
import { calculateNextSlotTime } from '../utils/scheduleUtils';

interface AddSlotModalProps {
  isOpen: boolean;
  lastSlotTime?: string;
  onClose: () => void;
  onAddSlot: (slot: ScheduleSlot) => void;
}

export const AddSlotModal: React.FC<AddSlotModalProps> = ({
  isOpen,
  lastSlotTime = '',
  onClose,
  onAddSlot,
}) => {
  const [slotType, setSlotType] = useState<'session' | 'break'>('session');
  const [customDuration, setCustomDuration] = useState<number>(45);
  const [time, setTime] = useState('');
  const [breakLabel, setBreakLabel] = useState('LUNCH / PRAYER BREAK');

  // Auto-calculate next slot when opened or when type/duration/lastSlot changes
  useEffect(() => {
    if (isOpen) {
      const duration = slotType === 'break' ? 30 : customDuration;
      const computed = calculateNextSlotTime(lastSlotTime, duration);
      setTime(computed);
    }
  }, [isOpen, slotType, customDuration, lastSlotTime]);

  if (!isOpen) return null;

  const handleRecalculate = (duration: number) => {
    setCustomDuration(duration);
    const computed = calculateNextSlotTime(lastSlotTime, duration);
    setTime(computed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isBreak = slotType === 'break';
    const textVal = isBreak ? breakLabel : '';

    const newSlot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      time: time.trim() || '03:15 PM - 04:00 PM',
      isBreak,
      mon: textVal,
      tue: textVal,
      wed: textVal,
      thu: textVal,
      fri: textVal,
      sat: isBreak ? textVal : '',
    };

    onAddSlot(newSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 p-6 rounded-3xl shadow-2xl w-full max-w-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Add New Time Slot</h3>
              <p className="text-xs text-slate-400">Append clinical session or staff break</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto Gap Intelligence Banner */}
        {lastSlotTime && (
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                <span>Previous Slot:</span>
                <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  {lastSlotTime}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1 flex-wrap">
                <span>Next slot auto-calculated with</span>
                <span className="font-bold text-emerald-400">{customDuration} min gap</span>
                <ArrowRight className="w-3 h-3 text-cyan-400 inline" />
                <span className="font-mono font-bold text-white">{time}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-2">Select Slot Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSlotType('session');
                  handleRecalculate(45);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  slotType === 'session'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Patient Session</div>
                  <div className="text-[10px] text-slate-400">{customDuration} Minutes</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSlotType('break');
                  handleRecalculate(30);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  slotType === 'break'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Break Slot</div>
                  <div className="text-[10px] text-slate-400">30 Minutes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Slot Duration Interval Selector */}
          {slotType === 'session' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-slate-300">Session Duration Gap</label>
                <span className="text-[10px] text-indigo-400 font-semibold">Auto-adds interval to last end time</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '30m', val: 30 },
                  { label: '45m (Default)', val: 45 },
                  { label: '50m', val: 50 },
                  { label: '60m (1 hr)', val: 60 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleRecalculate(item.val)}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] border transition-all cursor-pointer ${
                      customDuration === item.val
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-300">Time Slot Timing</label>
              <button
                type="button"
                onClick={() => handleRecalculate(customDuration)}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-calculate</span>
              </button>
            </div>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 03:15 PM - 04:00 PM"
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Auto-filled by adding {customDuration} minutes to previous slot's end time. You can also customize manually.
            </span>
          </div>

          {slotType === 'break' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Break Description</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={breakLabel}
                  onChange={(e) => setBreakLabel(e.target.value)}
                  placeholder="LUNCH / PRAYER BREAK"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs uppercase"
                />
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {['LUNCH / PRAYER BREAK', 'TEA BREAK', 'EVALUATION & REPORTS'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBreakLabel(preset)}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Add Slot to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
