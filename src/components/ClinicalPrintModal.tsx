import React, { useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  Calendar,
  Check,
  Building2,
  Users,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { TherapistSchedule, DAYS_LIST, ScheduleMap } from '../types';
import { exportScheduleToCsv, exportAllSchedulesToCsv } from '../utils/scheduleUtils';
import { executePrintSchedule, generateSchedulePrintHtml } from '../utils/printUtils';

interface ClinicalPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSchedule?: TherapistSchedule;
  schedules: ScheduleMap;
  isAdmin: boolean;
  hideEmptyCells: boolean;
  onToggleHideEmptyCells: (val: boolean) => void;
  initialMode?: 'single' | 'all';
}

export const ClinicalPrintModal: React.FC<ClinicalPrintModalProps> = ({
  isOpen,
  onClose,
  activeSchedule,
  schedules,
  isAdmin,
  hideEmptyCells,
  onToggleHideEmptyCells,
  initialMode = 'single',
}) => {
  const [printScope, setPrintScope] = useState<'single' | 'all'>(initialMode);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatusMessage, setPrintStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const schedulesToPreview: TherapistSchedule[] =
    printScope === 'all' && isAdmin
      ? (Object.values(schedules) as TherapistSchedule[])
      : activeSchedule
      ? [activeSchedule]
      : [];

  const handleTriggerBrowserPrint = () => {
    setIsPrinting(true);
    setPrintStatusMessage('Launching print preview...');

    try {
      const result = executePrintSchedule(schedulesToPreview, {
        hideEmptyCells,
        onSuccess: () => {
          setPrintStatusMessage('Print dialog opened! You can choose your printer or "Save as PDF".');
          setTimeout(() => setPrintStatusMessage(null), 4000);
        },
      });

      if (result.method === 'native') {
        // In case window.print was called directly
        setPrintStatusMessage('Print window triggered.');
        setTimeout(() => setPrintStatusMessage(null), 3500);
      }
    } catch (e) {
      console.error('Print trigger error:', e);
      setPrintStatusMessage('Opening clean printable page...');
      handleOpenCleanPrintView();
    } finally {
      setTimeout(() => {
        setIsPrinting(false);
      }, 500);
    }
  };

  const handleOpenCleanPrintView = () => {
    const htmlContent = generateSchedulePrintHtml(schedulesToPreview, {
      hideEmptyCells,
      todayDateFormatted,
    });

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.click();
    }
  };

  const handleExportCsv = () => {
    if (printScope === 'all' && isAdmin) {
      exportAllSchedulesToCsv(schedules);
    } else if (activeSchedule) {
      exportScheduleToCsv(activeSchedule);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in no-print">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950/60">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                Clinical Schedule Print & Export Center
              </h2>
              <p className="text-xs text-slate-400">
                Official high-resolution printout & paper schedule generator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options & Action Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Target:</span>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPrintScope('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  printScope === 'single'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Current ({activeSchedule?.title.split(' ')[0] || 'Selected'})</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setPrintScope('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    printScope === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All Staff ({Object.keys(schedules).length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Print Button - Primary */}
            <button
              type="button"
              id="btnPrintNowTop"
              onClick={handleTriggerBrowserPrint}
              disabled={isPrinting}
              className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/60 cursor-pointer transition-all active:scale-95 disabled:opacity-75"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Sending to Printer...' : 'Print Now / Save PDF'}</span>
            </button>

            {/* Standalone Printable View */}
            <button
              type="button"
              onClick={handleOpenCleanPrintView}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open standalone printable sheet in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open Printable Tab</span>
            </button>

            {/* CSV Download */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download schedule in CSV format"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Download CSV</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Bar if triggered */}
        {printStatusMessage && (
          <div className="bg-cyan-950/80 border-b border-cyan-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-cyan-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{printStatusMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleOpenCleanPrintView}
              className="underline text-cyan-300 hover:text-white font-semibold ml-2 cursor-pointer text-[11px]"
            >
              Did pop-up not open? Click here
            </button>
          </div>
        )}

        {/* Paper Sheet Preview Container (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/80">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Paper Preview (Landscape Standard)</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {schedulesToPreview.length} Schedule{schedulesToPreview.length > 1 ? 's' : ''} Ready
              </span>
            </div>

            {schedulesToPreview.map((schedule) => (
              <div
                key={schedule.key}
                className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200"
              >
                {/* Clinical Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-4 mb-4 gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="p-1 rounded-xl bg-white border border-slate-200 shadow-sm shrink-0">
                      <img
                        src="/therapy-hub-logo.jpg"
                        alt="Therapy Hub"
                        referrerPolicy="no-referrer"
                        className="h-12 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
                        THERAPY HUB - CLINICAL SCHEDULE
                      </h3>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        Therapist: {schedule.title}
                      </p>
                      <p className="text-xs text-slate-600">
                        Department: {schedule.department || 'Clinical Rehabilitation'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-700 space-y-0.5">
                    <p>
                      <strong className="text-slate-900">CAMPUS:</strong>{' '}
                      {schedule.branch || 'MAIN PECHS BRANCH'}
                    </p>
                    <p>
                      <strong className="text-slate-900">TIMING:</strong> {schedule.shift}
                    </p>
                    <p>
                      <strong className="text-slate-900">DATE:</strong> {todayDateFormatted}
                    </p>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-slate-900 p-2 uppercase w-40">Time Slot</th>
                        {DAYS_LIST.map((day) => (
                          <th key={day.key} className="border border-slate-900 p-2 uppercase">
                            {day.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.slots.map((slot, idx) => (
                        <tr
                          key={slot.id || idx}
                          className={slot.isBreak ? 'bg-amber-50/80 font-bold' : ''}
                        >
                          <td className="border border-slate-900 p-2 font-mono font-bold text-slate-900 bg-slate-50">
                            {slot.time}
                          </td>
                          {DAYS_LIST.map((day) => {
                            const val = slot[day.key];
                            return (
                              <td
                                key={day.key}
                                className={`border border-slate-900 p-2 ${
                                  slot.isBreak ? 'text-amber-900 text-center font-bold' : 'text-slate-800'
                                }`}
                              >
                                {val || (slot.isBreak ? '☕ BREAK' : '—')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signatures Line */}
                <div className="flex flex-col sm:flex-row justify-between items-end mt-10 pt-4 border-t border-slate-300 gap-6">
                  <div className="text-center w-full sm:w-56">
                    <div className="border-b border-slate-900 mb-1.5 h-10" />
                    <p className="text-xs font-bold text-slate-900 uppercase">Therapist Signature</p>
                    <p className="text-[10px] text-slate-600">{schedule.title}</p>
                  </div>
                  <div className="text-center w-full sm:w-64">
                    <div className="border-b border-slate-900 mb-1.5 h-10" />
                    <p className="text-xs font-bold text-slate-900 uppercase">Zohaib Ali</p>
                    <p className="text-[11px] text-slate-900 font-semibold">Branch Manager</p>
                    <p className="text-[10px] text-slate-500">
                      Therapy Hub {schedule.branch || 'PECHS Branch'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            In print settings, select <strong className="text-slate-200">Landscape</strong> and{' '}
            <strong className="text-slate-200">Save as PDF</strong>.
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              id="btnPrintNowBottom"
              onClick={handleTriggerBrowserPrint}
              disabled={isPrinting}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Printing...' : 'Print Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
