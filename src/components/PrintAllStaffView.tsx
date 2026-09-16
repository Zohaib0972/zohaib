import React from 'react';
import { ScheduleMap, DAYS_LIST, TherapistSchedule } from '../types';

interface PrintAllStaffViewProps {
  schedules: ScheduleMap;
  hideEmptyCells: boolean;
  printMode: 'single' | 'all';
}

export const PrintAllStaffView: React.FC<PrintAllStaffViewProps> = ({
  schedules,
  hideEmptyCells,
  printMode,
}) => {
  if (printMode !== 'all') return null;

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      id="printAllContainer"
      className={`print:block ${hideEmptyCells ? 'print-hide-empty' : ''}`}
    >
      {(Object.values(schedules) as TherapistSchedule[]).map((schedule, idx) => (
        <div key={schedule.key} className="page-break p-4 mb-8">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <img
                src="/therapy-hub-logo.jpg"
                alt="Therapy Hub"
                referrerPolicy="no-referrer"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-black uppercase tracking-wide m-0">
                  THERAPY HUB - CLINICAL SCHEDULE
                </h1>
                <p className="text-xs text-slate-800 font-semibold mt-0.5">
                  Therapist: {schedule.title}
                </p>
                <p className="text-[11px] text-slate-600">
                  Department: {schedule.department || 'Clinical Rehabilitation'}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-800">
              <p className="m-0">
                <b>BRANCH:</b> {schedule.branch || 'MAIN PECHS BRANCH'}
              </p>
              <p className="mt-0.5 mb-0">
                <b>SHIFT:</b> {schedule.shift}
              </p>
              <p className="mt-0.5 mb-0">
                <b>PRINTED:</b> {todayDateFormatted}
              </p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-black">
                <th className="border border-slate-800 p-2 font-bold w-44 uppercase">
                  Time Slot
                </th>
                {DAYS_LIST.map((d) => (
                  <th key={d.key} className="border border-slate-800 p-2 font-bold uppercase">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.slots.map((slot, sIdx) => (
                <tr
                  key={slot.id || sIdx}
                  className={slot.isBreak ? 'bg-slate-100 font-bold' : ''}
                >
                  <td className="border border-slate-800 p-2 font-bold font-mono text-[11px]">{slot.time}</td>
                  {DAYS_LIST.map((d) => {
                    const dayTime = slot.dayTimes?.[d.key] || slot.time;
                    const patientName = slot[d.key] || '';
                    return (
                      <td key={d.key} className="border border-slate-800 p-2 align-top">
                        <div className="text-[10px] text-slate-600 font-mono font-bold mb-0.5">
                          {dayTime}
                        </div>
                        <div className="font-bold text-black text-xs">
                          {patientName || (slot.isBreak ? 'BREAK' : '-')}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-10 pt-4 border-t border-slate-300">
            <div className="text-center w-48">
              <div className="border-b border-black mb-1.5 h-10" />
              <p className="text-xs font-bold text-black uppercase">Therapist Signature</p>
              <p className="text-[10px] text-slate-600">{schedule.title}</p>
            </div>
            <div className="text-center w-60">
              <div className="border-b border-black mb-1.5 h-10" />
              <p className="text-xs font-bold text-black uppercase">Zohaib Ali</p>
              <p className="text-[11px] text-black font-semibold">Branch Manager</p>
              <p className="text-[10px] text-slate-500">Therapy Hub {schedule.branch || 'PECHS Branch'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
