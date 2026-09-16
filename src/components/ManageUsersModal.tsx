import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  KeyRound,
  Search,
  Users,
  UserCog,
} from 'lucide-react';
import { UserAccount, TherapistSchedule } from '../types';

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  users: Record<string, UserAccount>;
  onAddUser: (user: UserAccount, newSchedule?: TherapistSchedule) => void;
  onUpdatePassword: (username: string, newPass: string) => void;
  onDeleteUser: (username: string) => void;
  onOpenEditProfile?: (user: UserAccount) => void;
}

export const ManageUsersModal: React.FC<ManageUsersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onAddUser,
  onUpdatePassword,
  onDeleteUser,
  onOpenEditProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'directory'>('create');
  const [accountType, setAccountType] = useState<'admin' | 'staff'>('staff');

  // Form Fields
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Staff specific fields
  const [staffKey, setStaffKey] = useState('');
  const [department, setDepartment] = useState('Occupational Therapy (OT)');
  const [shift, setShift] = useState('12:30 PM TO 06:00 PM');

  // Directory UI State
  const [directorySearch, setDirectorySearch] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingPasswordUser, setEditingPasswordUser] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanName || !cleanPass) {
      setFormError('Please fill in username, full name, and password.');
      return;
    }

    if (users[cleanUser]) {
      setFormError(`An account with username "${cleanUser}" already exists.`);
      return;
    }

    if (accountType === 'admin') {
      const newAdmin: UserAccount = {
        username: cleanUser,
        name: cleanName,
        pass: cleanPass,
        role: 'admin',
        title: title.trim() || 'Admin Officer',
        staffKey: 'ALL',
        avatarInitials: cleanName.slice(0, 2).toUpperCase(),
      };
      onAddUser(newAdmin);
    } else {
      const cleanKey = (staffKey.trim() || cleanName).toUpperCase();
      const newStaff: UserAccount = {
        username: cleanUser,
        name: cleanName,
        pass: cleanPass,
        role: 'staff',
        title: title.trim() || 'Therapist Staff',
        staffKey: cleanKey,
        avatarInitials: cleanName.slice(0, 2).toUpperCase(),
      };

      const newSchedule: TherapistSchedule = {
        key: cleanKey,
        title: cleanName,
        shift: shift.trim() || '12:00 PM TO 06:00 PM',
        branch: 'MAIN PECHS BRANCH',
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
        ],
      };

      onAddUser(newStaff, newSchedule);
    }

    // Reset Form
    setUsername('');
    setName('');
    setTitle('');
    setPassword('');
    setStaffKey('');
    setActiveTab('directory');
  };

  const copyCredentials = (uname: string, pass: string) => {
    navigator.clipboard.writeText(`Username: ${uname}\nPassword: ${pass}`);
    setCopiedKey(uname);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (uname: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [uname]: !prev[uname],
    }));
  };

  const handleSaveEditedPassword = (uname: string) => {
    if (newPasswordInput.trim()) {
      onUpdatePassword(uname, newPasswordInput.trim());
      setEditingPasswordUser(null);
      setNewPasswordInput('');
    }
  };

  const userList: UserAccount[] = (Object.values(users) as UserAccount[]).filter((u: UserAccount) => {
    const q = directorySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.title.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Account Management & Credentials</h3>
              <p className="text-xs text-slate-400">
                Create new Admin or Therapist accounts and manage login IDs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-5 pt-3 border-b border-slate-800/80 flex items-center gap-3 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'directory'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Accounts Directory ({Object.keys(users).length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('admin');
                      setTitle('Assistant Manager');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      accountType === 'admin'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Admin / Manager</div>
                      <div className="text-[10px] text-slate-400">
                        Full access to all schedules & portal
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('staff');
                      setTitle('Occupational Therapist');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      accountType === 'staff'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Therapist / Staff</div>
                      <div className="text-[10px] text-slate-400">
                        Isolated view of their own schedule
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Login Username / ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={accountType === 'admin' ? 'e.g. admin5' : 'e.g. ayesha'}
                    required
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Employee will use this to sign in
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Display Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (accountType === 'staff' && !staffKey) {
                        setStaffKey(e.target.value.toUpperCase());
                      }
                    }}
                    placeholder={
                      accountType === 'admin' ? 'e.g. Dr. Farhan Ali' : 'e.g. Ms. Ayesha (OT)'
                    }
                    required
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Role Title & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      accountType === 'admin'
                        ? 'Assistant Branch Manager'
                        : 'Speech Therapist'
                    }
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Password <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                    >
                      Generate Strong
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPasswordInput ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter employee password"
                      required
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInput(!showPasswordInput)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Extra Therapist Fields */}
              {accountType === 'staff' && (
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    Therapist Schedule Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Code Key
                      </label>
                      <input
                        type="text"
                        value={staffKey}
                        onChange={(e) => setStaffKey(e.target.value.toUpperCase())}
                        placeholder="e.g. MS AYESHA"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Occupational Therapy (OT)">Occupational Therapy (OT)</option>
                        <option value="Speech Therapy (ST)">Speech Therapy (ST)</option>
                        <option value="Behavioral Therapy (BT)">Behavioral Therapy (BT)</option>
                        <option value="Physical Therapy (PT)">Physical Therapy (PT)</option>
                        <option value="Clinical Psychology">Clinical Psychology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Shift Timings
                      </label>
                      <input
                        type="text"
                        value={shift}
                        onChange={(e) => setShift(e.target.value)}
                        placeholder="12:30 PM TO 06:00 PM"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  Create {accountType === 'admin' ? 'Admin' : 'Therapist'} Account
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Directory Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  placeholder="Search accounts by username, name, or role..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Accounts List */}
              <div className="space-y-2.5">
                {userList.map((user) => {
                  const isCurrentUser = user.username === currentUser.username;
                  const isVisible = !!visiblePasswords[user.username];
                  const isEditingPass = editingPasswordUser === user.username;

                  return (
                    <div
                      key={user.username}
                      className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            user.role === 'admin'
                              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {user.avatarInitials || user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs truncate">
                              {user.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-slate-300">ID: {user.username}</span>
                            <span>•</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                user.role === 'admin'
                                  ? 'bg-indigo-500/10 text-indigo-400'
                                  : 'bg-emerald-500/10 text-emerald-400'
                              }`}
                            >
                              {user.title || (user.role === 'admin' ? 'Admin' : 'Staff')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Credentials & Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isEditingPass ? (
                          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                            <input
                              type="text"
                              value={newPasswordInput}
                              onChange={(e) => setNewPasswordInput(e.target.value)}
                              placeholder="New password"
                              className="bg-transparent text-white px-2 py-1 text-xs focus:outline-none w-28 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditedPassword(user.username)}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPasswordUser(null)}
                              className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                            <span className="text-slate-400 text-[11px]">Pass:</span>
                            <span className="font-mono text-slate-200">
                              {isVisible ? user.pass : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.username)}
                              title={isVisible ? 'Hide Password' : 'Show Password'}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyCredentials(user.username, user.pass)}
                              title="Copy ID & Password to give to employee"
                              className="text-slate-400 hover:text-emerald-400 p-1"
                            >
                              {copiedKey === user.username ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPasswordUser(user.username);
                                setNewPasswordInput(user.pass);
                              }}
                              title="Change Password"
                              className="text-slate-400 hover:text-indigo-400 p-1 text-[11px] underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        {/* Edit Full Profile Button */}
                        {onOpenEditProfile && (
                          <button
                            type="button"
                            onClick={() => onOpenEditProfile(user)}
                            title="Edit Profile, Department, Shift & Credentials"
                            className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                          >
                            <UserCog className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Edit Profile</span>
                          </button>
                        )}

                        {/* Delete User (Cannot delete yourself) */}
                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => onDeleteUser(user.username)}
                            title="Delete Account"
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
