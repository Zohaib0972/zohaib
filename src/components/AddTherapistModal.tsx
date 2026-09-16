import React, { useState } from 'react';
import { X, UserPlus, Sparkles } from 'lucide-react';
import { TherapistSchedule, UserAccount } from '../types';

interface AddTherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSchedule: TherapistSchedule, newUser: UserAccount) => void;
}

export const AddTherapistModal: React.FC<AddTherapistModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [key, setKey] = useState('');
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('Occupational Therapy (OT)');
  const [shift, setShift] = useState('12:30 PM TO 06:00 PM');
  const [branch, setBranch] = useState('MAIN PECHS BRANCH');
  const [password, setPassword] = useState('staff123');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanKey = key.trim().toUpperCase();
    const cleanTitle = title.trim();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanKey || !cleanTitle || !cleanUser || !cleanPass) {
      setError('Please fill in Therapist Code Key, Display Title, Username, and Password.');
      return;
    }

    const newSchedule: TherapistSchedule = {
      key: cleanKey,
      title: cleanTitle,
      shift: shift.trim() || '12:00 PM TO 06:00 PM',
      branch: branch.trim() || 'MAIN PECHS BRANCH',
      department: department.trim(),
      slots: [
        {
          id: `slot-${Date.now()}-1`,
          time: '12:30 PM - 01:15 PM',
          isBreak: false,
          mon: '',
          tue: '',
          wed: '',
          thu: '',
          fri: '',
          sat: '',
        },
        {
          id: `slot-${Date.now()}-2`,
          time: '01:15 PM - 02:00 PM',
          isBreak: false,
          mon: '',
          tue: '',
          wed: '',
          thu: '',
          fri: '',
          sat: '',
        },
        {
          id: `slot-${Date.now()}-3`,
          time: '02:00 PM - 02:30 PM',
          isBreak: true,
          mon: 'LUNCH / PRAYER BREAK',
          tue: 'LUNCH / PRAYER BREAK',
          wed: 'LUNCH / PRAYER BREAK',
          thu: 'LUNCH / PRAYER BREAK',
          fri: 'LUNCH / PRAYER BREAK',
          sat: 'LUNCH / PRAYER BREAK',
        },
        {
          id: `slot-${Date.now()}-4`,
          time: '02:30 PM - 03:15 PM',
          isBreak: false,
          mon: '',
          tue: '',
          wed: '',
          thu: '',
          fri: '',
          sat: '',
        },
      ],
    };

    const newUser: UserAccount = {
      username: cleanUser,
      name: cleanTitle,
      pass: cleanPass,
      role: 'staff',
      title: 'Therapist Staff',
      staffKey: cleanKey,
      avatarInitials: cleanTitle.slice(0, 2).toUpperCase(),
    };

    onAdd(newSchedule, newUser);
    onClose();
  };

  const autofillTemplate = (dept: 'OT' | 'ST' | 'BT') => {
    if (dept === 'OT') {
      setKey('MS NIMRA');
      setTitle('MS. NIMRA (OT)');
      setUsername('nimra');
      setDepartment('Occupational Therapy (OT)');
      setShift('12:30 PM TO 06:00 PM');
    } else if (dept === 'ST') {
      setKey('MS AREEBA');
      setTitle('MS. AREEBA (ST)');
      setUsername('areeba');
      setDepartment('Speech Therapy (ST)');
      setShift('02:00 PM TO 07:00 PM');
    } else {
      setKey('MS HIRA');
      setTitle('MS. HIRA (BT)');
      setUsername('hira');
      setDepartment('Behavioral Therapy (BT)');
      setShift('11:00 AM TO 05:00 PM');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 p-6 rounded-2xl shadow-2xl w-full max-w-lg space-y-4 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Add New Therapist Schedule</h3>
              <p className="text-xs text-slate-400">Creates therapist roster and staff login profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Autofill Presets */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick fill sample:</span>
          <button
            type="button"
            onClick={() => autofillTemplate('OT')}
            className="text-indigo-400 hover:text-indigo-300 underline font-medium"
          >
            OT Sample
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => autofillTemplate('ST')}
            className="text-emerald-400 hover:text-emerald-300 underline font-medium"
          >
            ST Sample
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => autofillTemplate('BT')}
            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
          >
            BT Sample
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Therapist Code Key (Unique)
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. MS NIMRA"
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono uppercase text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Full Display Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MS. NIMRA (OT)"
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Login Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. nimra"
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password for staff"
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="Occupational Therapy (OT)">Occupational Therapy (OT)</option>
                <option value="Speech Therapy (ST)">Speech Therapy (ST)</option>
                <option value="Behavioral Therapy (BT)">Behavioral Therapy (BT)</option>
                <option value="Physical Therapy (PT)">Physical Therapy (PT)</option>
                <option value="Clinical Psychology">Clinical Psychology</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Shift Timing
              </label>
              <input
                type="text"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                placeholder="e.g. 12:30 PM TO 06:00 PM"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Branch Location
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="MAIN PECHS BRANCH"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Create Therapist Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
