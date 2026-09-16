import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  Save,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { UserAccount, TherapistSchedule, PortalTheme } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  schedule?: TherapistSchedule;
  existingUsers: Record<string, UserAccount>;
  onSave: (
    oldUsername: string,
    updatedUser: UserAccount,
    scheduleUpdates?: {
      title: string;
      department: string;
      shift: string;
      branch: string;
    }
  ) => void;
  theme?: PortalTheme;
}

const DEPARTMENTS = [
  'Occupational Therapy (OT)',
  'Speech & Language Therapy (SLT)',
  'Physiotherapy & Physical Rehab (PT)',
  'Behavioral Therapy / ABA',
  'Clinical Psychology & Psychotherapy',
  'Sensory Integration Therapy',
  'Pediatric Early Intervention',
  'Remedial Education & Special Needs',
  'Clinical Administration & Front Desk',
];

const SHIFT_PRESETS = [
  { label: '12:30 PM TO 06:00 PM', start: '12:30', end: '18:00' },
  { label: '09:00 AM TO 05:00 PM', start: '09:00', end: '17:00' },
  { label: '10:00 AM TO 04:00 PM', start: '10:00', end: '16:00' },
  { label: '01:00 PM TO 07:00 PM', start: '13:00', end: '19:00' },
  { label: '02:00 PM TO 08:00 PM', start: '14:00', end: '20:00' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  schedule,
  existingUsers,
  onSave,
  theme = 'executive',
}) => {
  const isLight = theme === 'clinical-light';

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [department, setDepartment] = useState('Occupational Therapy (OT)');
  const [shift, setShift] = useState('12:30 PM TO 06:00 PM');
  const [shiftStart, setShiftStart] = useState('12:30');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [branch, setBranch] = useState('MAIN PECHS BRANCH');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [slotDuration, setSlotDuration] = useState<number>(45);

  const [error, setError] = useState<string | null>(null);

  // Sync state with current user and schedule when opened
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setUsername(user.username || '');
      setPassword(user.pass || '');
      setShowPassword(false);
      setTitle(user.title || '');
      setRole(user.role || 'staff');
      setDepartment(user.dept || schedule?.department || 'Occupational Therapy (OT)');
      setShift(schedule?.shift || '12:30 PM TO 06:00 PM');
      setShiftStart(user.shiftStart || '12:30');
      setShiftEnd(user.shiftEnd || '18:00');
      setBranch(user.branch || schedule?.branch || 'MAIN PECHS BRANCH');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setSlotDuration(user.slotDuration || 45);
      setError(null);
    }
  }, [user, schedule, isOpen]);

  if (!isOpen || !user) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let generated = '';
    for (let i = 0; i < 9; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleApplyShiftPreset = (preset: { label: string; start: string; end: string }) => {
    setShift(preset.label);
    setShiftStart(preset.start);
    setShiftEnd(preset.end);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setError('Please enter the full name.');
      return;
    }
    if (!cleanUsername) {
      setError('Username ID cannot be empty.');
      return;
    }
    if (!cleanPassword) {
      setError('Password cannot be empty.');
      return;
    }

    // Check if username changed and is already taken
    if (cleanUsername !== user.username.toLowerCase() && existingUsers[cleanUsername]) {
      setError(`Username '${cleanUsername}' is already assigned to another account.`);
      return;
    }

    // Generate initials for avatar
    const nameParts = cleanName.replace(/^(ms\.|mr\.|dr\.|mrs\.)\s+/i, '').split(' ');
    const initials =
      nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : cleanName.slice(0, 2).toUpperCase();

    const updatedUser: UserAccount = {
      ...user,
      name: cleanName,
      username: cleanUsername,
      pass: cleanPassword,
      role,
      title: title.trim() || (role === 'admin' ? 'Admin / Manager' : 'Staff Therapist'),
      avatarInitials: initials,
      dept: department,
      shiftStart,
      shiftEnd,
      branch,
      phone: phone.trim(),
      email: email.trim(),
      slotDuration,
    };

    const scheduleUpdates = {
      title: cleanName,
      department,
      shift,
      branch,
    };

    onSave(user.username, updatedUser, scheduleUpdates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700/80'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Edit Account & Profile
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Instant Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Updating profile propagates instantly across all schedules, roster & attendance portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
              {error}
            </div>
          )}

          {/* Account Role Toggle */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  role === 'staff'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Therapist / Staff</div>
                  <div className="text-[10px] text-slate-400">Clinical schedule & personal portal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Admin / Manager</div>
                  <div className="text-[10px] text-slate-400">Full clinic control & master logs</div>
                </div>
              </button>
            </div>
          </div>

          {/* Primary Identity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Full Name / Display Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ms Shawana"
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Reflected on printable schedules & active headers
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Staff Title / Designation
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Occupational Therapist"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Login Credentials Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/25 border border-slate-800">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Login Username / ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. shawana"
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Employee logs in using this ID
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-300">
                  Password <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate New</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 pr-10 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Department & Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Department / Specialization
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Clinic Branch / Campus
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="MAIN PECHS BRANCH"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Shift Timing Details & Quick Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-black/25 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-300">
                Shift Timing (Clinical Display)
              </label>
              <span className="text-[10px] text-slate-400">Quick Presets Available</span>
            </div>

            <input
              type="text"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              placeholder="e.g. 12:30 PM TO 06:00 PM"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white uppercase focus:outline-none focus:border-indigo-500"
            />

            {/* Shift Presets */}
            <div className="flex flex-wrap gap-1.5">
              {SHIFT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyShiftPreset(p)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                    shift === p.label
                      ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Attendance 24h Window */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  GPS Check-In Window (24h)
                </label>
                <input
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  GPS Check-Out Window (24h)
                </label>
                <input
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contact Details & Session Slot Gap Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@therapyhub.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Default Slot Gap</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2 text-white text-xs cursor-pointer"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Standard)</option>
                <option value={50}>50 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Saves & propagates in 0 seconds</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes Everywhere</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
