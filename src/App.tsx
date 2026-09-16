import React, { useState, useEffect } from 'react';
import {
  Menu,
  Printer,
  Files,
  Download,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  KeyRound,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Sun,
  Moon,
  Leaf,
  Palette,
  MapPin,
  Gem,
  Compass,
  UserCog,
  Radio,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  UserAccount,
  ScheduleMap,
  TherapistSchedule,
  ScheduleSlot,
  DayKey,
  PortalTheme,
  ActivePortalTab,
} from './types';
import { INITIAL_USERS, INITIAL_SCHEDULE_DATA } from './data/initialData';
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEY_SCHEDULES,
  STORAGE_KEY_USERS,
  STORAGE_KEY_SESSION,
  getScheduleStats,
  exportScheduleToCsv,
  exportAllSchedulesToCsv,
  calculateNextSlotTime,
  getLastSlotTiming,
} from './utils/scheduleUtils';
import {
  initRealtimeSync,
  pushSchedulesToServer,
  pushUsersToServer,
  fetchServerClinicData,
} from './utils/realtimeSync';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { ScheduleTable } from './components/ScheduleTable';
import { AttendancePortal } from './components/AttendancePortal';
import { AddTherapistModal } from './components/AddTherapistModal';
import { AddSlotModal } from './components/AddSlotModal';
import { PrintAllStaffView } from './components/PrintAllStaffView';
import { ManageUsersModal } from './components/ManageUsersModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ConfirmDialog, ConfirmDialogState } from './components/ConfirmDialog';
import { ClinicalPrintModal } from './components/ClinicalPrintModal';

export default function App() {
  // 1. Core State
  const [users, setUsers] = useState<Record<string, UserAccount>>(() =>
    loadFromStorage(STORAGE_KEY_USERS, INITIAL_USERS)
  );

  const [schedules, setSchedules] = useState<ScheduleMap>(() =>
    loadFromStorage(STORAGE_KEY_SCHEDULES, INITIAL_SCHEDULE_DATA)
  );

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    loadFromStorage<UserAccount | null>(STORAGE_KEY_SESSION, null)
  );

  // 6 Themes: executive, clinical-light, emerald, sapphire, amethyst, nordic
  const [theme, setTheme] = useState<PortalTheme>(() =>
    loadFromStorage<PortalTheme>('therapy_hub_theme_v1', 'executive')
  );

  // Active Portal Tab: 'schedules' or 'attendance'
  const [activePortalTab, setActivePortalTab] = useState<ActivePortalTab>('schedules');

  const [selectedKey, setSelectedKey] = useState<string>('MS SHAWANA');
  const [hideEmptyCells, setHideEmptyCells] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isAddTherapistOpen, setIsAddTherapistOpen] = useState<boolean>(false);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState<boolean>(false);
  const [isManageUsersOpen, setIsManageUsersOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editingProfileUser, setEditingProfileUser] = useState<UserAccount | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printModalMode, setPrintModalMode] = useState<'single' | 'all'>('single');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');

  // Confirmation dialog state (prevents iframe alert/confirm blocking)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Real-time synchronization state
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('Live Online Sync Active');
  const isSyncingRef = React.useRef<boolean>(false);

  // Handle native browser print events
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintMode('single');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // 2. Real-Time Online Server Synchronization & Multi-Device SSE
  useEffect(() => {
    // A. Fetch existing data from server on startup
    fetchServerClinicData().then((serverData) => {
      if (serverData) {
        if (serverData.schedules && Object.keys(serverData.schedules).length > 0) {
          isSyncingRef.current = true;
          setSchedules(serverData.schedules);
        }
        if (serverData.users && Object.keys(serverData.users).length > 0) {
          isSyncingRef.current = true;
          setUsers(serverData.users);
        }
      }
    });

    // B. Subscribe to real-time events stream (Server-Sent Events & BroadcastChannel)
    const unsubscribe = initRealtimeSync({
      onSchedulesUpdate: (newSchedules) => {
        isSyncingRef.current = true;
        setSchedules(newSchedules);
      },
      onUsersUpdate: (newUsers) => {
        isSyncingRef.current = true;
        setUsers(newUsers);
      },
      onStatusChange: (status, info) => {
        setSyncStatus(status);
        if (info) setSyncStatusMsg(info);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // LocalStorage & Server Sync for Schedules
  useEffect(() => {
    saveToStorage(STORAGE_KEY_SCHEDULES, schedules);
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    pushSchedulesToServer(schedules);
  }, [schedules]);

  // LocalStorage & Server Sync for Users
  useEffect(() => {
    saveToStorage(STORAGE_KEY_USERS, users);
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    pushUsersToServer(users);
  }, [users]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_SESSION, currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveToStorage('therapy_hub_theme_v1', theme);
  }, [theme]);

  // Ensure selected key is valid whenever user or schedules change
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'staff') {
      setSelectedKey(currentUser.staffKey);
    } else {
      const keys = Object.keys(schedules);
      if (!schedules[selectedKey] && keys.length > 0) {
        setSelectedKey(keys[0]);
      }
    }
  }, [currentUser, schedules, selectedKey]);

  // 3. Helper toast notification
  const triggerToast = (msg: string = 'Saved Successfully') => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 4. Authentication handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'staff') {
      setSelectedKey(user.staffKey);
    }
    triggerToast(`Welcome, ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
  };

  // 5. Schedule Modification Handlers
  const activeStaffKey =
    currentUser?.role === 'staff' ? currentUser.staffKey : selectedKey;
  const activeSchedule: TherapistSchedule | undefined = schedules[activeStaffKey];
  const isAdmin = currentUser?.role === 'admin';

  const handleUpdateSlotTime = (slotIndex: number, newTime: string) => {
    if (!isAdmin || !activeSchedule) return;

    setSchedules((prev) => {
      const current = prev[activeStaffKey];
      if (!current) return prev;
      const updatedSlots = [...current.slots];
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        time: newTime,
      };
      return {
        ...prev,
        [activeStaffKey]: {
          ...current,
          slots: updatedSlots,
        },
      };
    });
  };

  const handleUpdateSlotDayTime = (slotIndex: number, day: DayKey, newTime: string) => {
    if (!isAdmin || !activeSchedule) return;

    setSchedules((prev) => {
      const current = prev[activeStaffKey];
      if (!current) return prev;
      const updatedSlots = [...current.slots];
      const slot = updatedSlots[slotIndex];
      const dayTimes = { ...(slot.dayTimes || {}) };
      dayTimes[day] = newTime;
      updatedSlots[slotIndex] = {
        ...slot,
        dayTimes,
      };
      return {
        ...prev,
        [activeStaffKey]: {
          ...current,
          slots: updatedSlots,
        },
      };
    });
    triggerToast(`Timing updated for ${day.toUpperCase()}`);
  };

  const handleAddSlotForDay = (day: DayKey, customTime?: string, patientName?: string) => {
    if (!isAdmin || !activeSchedule) return;

    const lastTime = getLastSlotTiming(activeSchedule, day);
    const computedTime = customTime || (lastTime ? calculateNextSlotTime(lastTime, 45) : '09:45 AM - 10:30 AM');

    const newSlot: ScheduleSlot = {
      id: `slot-${day}-${Date.now()}`,
      time: computedTime,
      isBreak: false,
      mon: '',
      tue: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      dayTimes: {
        [day]: computedTime,
      },
    };
    if (patientName) {
      newSlot[day] = patientName;
    }

    setSchedules((prev) => {
      const current = prev[activeStaffKey];
      if (!current) return prev;
      return {
        ...prev,
        [activeStaffKey]: {
          ...current,
          slots: [...current.slots, newSlot],
        },
      };
    });
    triggerToast(`Added new slot for ${day.toUpperCase()} (${computedTime})`);
  };

  const handleUpdateSlotCell = (slotIndex: number, day: DayKey, value: string) => {
    if (!isAdmin || !activeSchedule) return;

    setSchedules((prev) => {
      const current = prev[activeStaffKey];
      if (!current) return prev;
      const updatedSlots = [...current.slots];
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        [day]: value,
      };
      return {
        ...prev,
        [activeStaffKey]: {
          ...current,
          slots: updatedSlots,
        },
      };
    });
  };

  const handleToggleBreak = (slotIndex: number) => {
    if (!isAdmin || !activeSchedule) return;

    setSchedules((prev) => {
      const current = prev[activeStaffKey];
      if (!current) return prev;
      const updatedSlots = [...current.slots];
      const slot = updatedSlots[slotIndex];
      const newBreakState = !slot.isBreak;

      updatedSlots[slotIndex] = {
        ...slot,
        isBreak: newBreakState,
        mon: newBreakState ? 'BREAK' : '',
        tue: newBreakState ? 'BREAK' : '',
        wed: newBreakState ? 'BREAK' : '',
        thu: newBreakState ? 'BREAK' : '',
        fri: newBreakState ? 'BREAK' : '',
        sat: newBreakState ? 'BREAK' : '',
      };

      return {
        ...prev,
        [activeStaffKey]: {
          ...current,
          slots: updatedSlots,
        },
      };
    });
    triggerToast('Slot converted successfully');
  };

  const handleDeleteSlot = (slotIndex: number) => {
    if (!isAdmin || !activeSchedule) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Time Slot',
      message: 'Are you sure you want to delete this time slot from the schedule?',
      onConfirm: () => {
        setSchedules((prev) => {
          const current = prev[activeStaffKey];
          if (!current) return prev;
          const updatedSlots = current.slots.filter((_, i) => i !== slotIndex);
          return {
            ...prev,
            [activeStaffKey]: {
              ...current,
              slots: updatedSlots,
            },
          };
        });
        triggerToast('Time slot removed');
      },
    });
  };

  const handleAddSlot = (newSlot: ScheduleSlot) => {
    if (!isAdmin || !activeSchedule) return;

    setSchedules((prev) => {
      const current = prev[activeStaffKey];
      if (!current) return prev;
      return {
        ...prev,
        [activeStaffKey]: {
          ...current,
          slots: [...current.slots, newSlot],
        },
      };
    });
    triggerToast('New time slot added');
  };

  const handleUpdateShift = (newShift: string) => {
    if (!isAdmin || !activeSchedule) return;

    setSchedules((prev) => {
      const current = prev[activeStaffKey];
      if (!current) return prev;
      return {
        ...prev,
        [activeStaffKey]: {
          ...current,
          shift: newShift,
        },
      };
    });
    triggerToast('Shift timings updated');
  };

  const handleAddTherapist = (newTherapist: TherapistSchedule) => {
    if (!isAdmin) return;

    setSchedules((prev) => ({
      ...prev,
      [newTherapist.key]: newTherapist,
    }));
    setSelectedKey(newTherapist.key);
    triggerToast(`Therapist ${newTherapist.title} added!`);
  };

  const handleDeleteTherapist = (therapistKey: string) => {
    if (!isAdmin) return;
    const keys = Object.keys(schedules);
    if (keys.length <= 1) {
      triggerToast('Cannot delete the only therapist');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Remove Therapist Roster',
      message: `Are you sure you want to permanently remove ${schedules[therapistKey]?.title || 'this therapist'}?`,
      onConfirm: () => {
        setSchedules((prev) => {
          const copy = { ...prev };
          delete copy[therapistKey];
          return copy;
        });

        const remainingKeys = keys.filter((k) => k !== therapistKey);
        setSelectedKey(remainingKeys[0]);
        triggerToast('Therapist removed successfully');
      },
    });
  };

  const handleAddUser = (newUser: UserAccount) => {
    setUsers((prev) => ({
      ...prev,
      [newUser.username]: newUser,
    }));
    triggerToast(`User account for ${newUser.name} created!`);
  };

  const handleUpdatePassword = (username: string, newPass: string) => {
    setUsers((prev) => {
      const target = prev[username];
      if (!target) return prev;
      return {
        ...prev,
        [username]: {
          ...target,
          pass: newPass,
        },
      };
    });
    triggerToast(`Password updated for ${username}`);
  };

  const handleDeleteUser = (username: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to delete user account '${username}'?`,
      onConfirm: () => {
        setUsers((prev) => {
          const copy = { ...prev };
          delete copy[username];
          return copy;
        });
        triggerToast(`User account '${username}' deleted`);
      },
    });
  };

  const handleOpenEditProfileForUser = (targetUser: UserAccount) => {
    setEditingProfileUser(targetUser);
    setIsEditProfileOpen(true);
  };

  const handleOpenEditProfileForActiveTherapist = () => {
    if (!activeSchedule) return;

    // Find account by staffKey or matching name or username
    const allUsersList = Object.values(users) as UserAccount[];
    let matchedUser = allUsersList.find(
      (u) =>
        (u.staffKey && u.staffKey === activeStaffKey) ||
        u.name.trim().toLowerCase() === activeSchedule.title.trim().toLowerCase()
    );

    if (!matchedUser) {
      // Create a virtual user account object for this therapist
      const cleanKey = activeStaffKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      matchedUser = {
        username: cleanKey,
        name: activeSchedule.title,
        pass: '123456',
        role: 'staff',
        title: activeSchedule.title,
        staffKey: activeStaffKey,
        dept: activeSchedule.department,
        shiftStart: '12:30',
        shiftEnd: '18:00',
        branch: activeSchedule.branch || 'MAIN PECHS BRANCH',
        slotDuration: 45,
      };
    }

    setEditingProfileUser(matchedUser);
    setIsEditProfileOpen(true);
  };

  const handleSaveUserProfile = (
    oldUsername: string,
    updatedUser: UserAccount,
    scheduleUpdates?: { title: string; department: string; shift: string; branch: string }
  ) => {
    // 1. Update users dictionary (handling username rename cleanly if applicable)
    setUsers((prev) => {
      const copy = { ...prev };
      if (oldUsername !== updatedUser.username) {
        delete copy[oldUsername];
      }
      copy[updatedUser.username] = updatedUser;
      return copy;
    });

    // 2. If staffKey is linked to a therapist schedule, update schedule meta immediately in real-time
    const targetStaffKey = updatedUser.staffKey || activeStaffKey;
    if (targetStaffKey && targetStaffKey !== 'ALL') {
      setSchedules((prev) => {
        const currentSched = prev[targetStaffKey];
        if (!currentSched) return prev;
        return {
          ...prev,
          [targetStaffKey]: {
            ...currentSched,
            title: scheduleUpdates?.title || updatedUser.name,
            department: scheduleUpdates?.department || updatedUser.dept || currentSched.department,
            shift: scheduleUpdates?.shift || currentSched.shift,
            branch: scheduleUpdates?.branch || updatedUser.branch || currentSched.branch,
          },
        };
      });
    }

    // 3. If currently logged in user was modified, update currentUser state
    if (currentUser && currentUser.username === oldUsername) {
      setCurrentUser(updatedUser);
    }

    triggerToast(`Profile for ${updatedUser.name} updated & synced in seconds!`);
  };

  const handleResetToDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to Default Clinic Data',
      message: 'Are you sure you want to reset all schedules and staff to defaults?',
      onConfirm: () => {
        setSchedules(INITIAL_SCHEDULE_DATA);
        setSelectedKey('MS SHAWANA');
        triggerToast('Reset to original sample data');
      },
    });
  };

  // CSV Exports
  const handleExportSingleCsv = () => {
    if (activeSchedule) {
      exportScheduleToCsv(activeSchedule);
      triggerToast('Schedule CSV exported');
    }
  };

  const handleExportAllCsv = () => {
    exportAllSchedulesToCsv(schedules);
    triggerToast('All schedules exported to CSV');
  };

  // Print Handlers
  const handlePrintIndividual = () => {
    setPrintModalMode('single');
    setIsPrintModalOpen(true);
  };

  const handlePrintAllStaff = () => {
    setPrintModalMode('all');
    setIsPrintModalOpen(true);
  };

  // Unauthenticated screen
  if (!currentUser) {
    return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} theme={theme} />;
  }

  // Active statistics
  const stats = activeSchedule
    ? getScheduleStats(activeSchedule)
    : { totalSlots: 0, bookedSlots: 0, openSlots: 0, breakSlots: 0, uniquePatients: 0 };

  const allTherapistsList = Object.values(schedules);

  // Theme-specific Background & Accents
  const isLight = theme === 'clinical-light';
  const isEmerald = theme === 'emerald';
  const isSapphire = theme === 'sapphire';
  const isAmethyst = theme === 'amethyst';
  const isNordic = theme === 'nordic';

  const mainBg = isLight
    ? 'bg-[#f8fafc] text-slate-900'
    : isEmerald
    ? 'bg-[#030e0b] text-emerald-50'
    : isSapphire
    ? 'bg-[#040817] text-indigo-50'
    : isAmethyst
    ? 'bg-[#0a0512] text-purple-50'
    : isNordic
    ? 'bg-[#0b121c] text-slate-100'
    : 'bg-[#060913] text-slate-100';

  const headerBorderColor = isLight
    ? 'border-slate-200'
    : isEmerald
    ? 'border-[#15463b]/70'
    : isSapphire
    ? 'border-indigo-950/80'
    : isAmethyst
    ? 'border-purple-950/80'
    : isNordic
    ? 'border-slate-800/80'
    : 'border-slate-800/80';

  return (
    <div className={`min-h-screen flex ${mainBg} antialiased selection:bg-cyan-500 selection:text-white`}>
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        allTherapists={allTherapistsList}
        selectedKey={selectedKey}
        onSelectTherapist={(k) => setSelectedKey(k)}
        onOpenAddTherapist={() => setIsAddTherapistOpen(true)}
        onOpenManageUsers={() => setIsManageUsersOpen(true)}
        onOpenEditCurrentTherapist={handleOpenEditProfileForActiveTherapist}
        onDeleteTherapist={handleDeleteTherapist}
        stats={stats}
        hideEmptyCells={hideEmptyCells}
        onToggleHideEmptyCells={(v) => setHideEmptyCells(v)}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onExportAllCsv={handleExportAllCsv}
        theme={theme}
        onSelectTheme={setTheme}
        activeTab={activePortalTab}
        onSelectTab={setActivePortalTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Header Bar */}
        <div
          className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b ${headerBorderColor} pb-5 no-print`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2.5 rounded-xl border shrink-0 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Portal Tab Switcher (Schedules vs Attendance) */}
            <div className="flex items-center bg-black/25 p-1 rounded-2xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => setActivePortalTab('schedules')}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activePortalTab === 'schedules'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Clinical Schedules</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePortalTab('attendance')}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
                  activePortalTab === 'attendance'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Attendance Portal</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </button>
            </div>

            {/* Live Online Multi-Device Sync Indicator */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
                syncStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : syncStatus === 'syncing'
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 animate-pulse'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
              title="Real-time multi-device sync: Changes sync in seconds across all online devices"
            >
              <span className="relative flex h-2 w-2">
                {syncStatus === 'connected' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    syncStatus === 'connected'
                      ? 'bg-emerald-400'
                      : syncStatus === 'syncing'
                      ? 'bg-cyan-400'
                      : 'bg-amber-400'
                  }`}
                ></span>
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono tracking-tight">{syncStatusMsg}</span>
            </div>
          </div>

          {/* Right Header Controls: 6 Themes Quick Picker & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Quick 6 Themes Switcher */}
            <div
              className={`flex items-center p-1 rounded-2xl border ${
                isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* Midnight */}
              <button
                type="button"
                onClick={() => setTheme('executive')}
                title="Midnight Executive"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  theme === 'executive'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              {/* Hospital */}
              <button
                type="button"
                onClick={() => setTheme('clinical-light')}
                title="Hospital Pure Light"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  theme === 'clinical-light'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              {/* Emerald */}
              <button
                type="button"
                onClick={() => setTheme('emerald')}
                title="Emerald Health"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  theme === 'emerald'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
              </button>

              {/* Sapphire */}
              <button
                type="button"
                onClick={() => setTheme('sapphire')}
                title="Royal Sapphire"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  theme === 'sapphire'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gem className="w-3.5 h-3.5" />
              </button>

              {/* Amethyst */}
              <button
                type="button"
                onClick={() => setTheme('amethyst')}
                title="Amethyst Luxury"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  theme === 'amethyst'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              {/* Nordic */}
              <button
                type="button"
                onClick={() => setTheme('nordic')}
                title="Nordic Frost"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  theme === 'nordic'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* If on schedules tab, show schedule actions */}
            {activePortalTab === 'schedules' && (
              <>
                {/* Manage Accounts (Admin Only) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsManageUsersOpen(true)}
                    className="border border-indigo-500/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300"
                  >
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">Accounts & IDs</span>
                  </button>
                )}

                {/* Print Individual Schedule Button */}
                <button
                  type="button"
                  id="btnPrintScheduleHeader"
                  onClick={handlePrintIndividual}
                  className="text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-cyan-950/60"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Schedule</span>
                </button>

                {/* Print All Staff (Admin Only) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handlePrintAllStaff}
                    className="border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs bg-slate-900 hover:bg-slate-800 text-slate-200"
                  >
                    <Files className="w-4 h-4 text-cyan-400" />
                    <span className="hidden md:inline">Print All Staff</span>
                  </button>
                )}

                {/* Export CSV */}
                <button
                  type="button"
                  onClick={handleExportSingleCsv}
                  className="border border-slate-700/80 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-200"
                  title="Export this schedule to CSV"
                >
                  <Download className="w-4 h-4 opacity-70" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                {/* Reset to initial data */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    title="Reset sample schedule data"
                    className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dynamic View: Attendance Portal OR Schedules Table */}
        {activePortalTab === 'attendance' ? (
          <AttendancePortal
            currentUser={currentUser}
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            theme={theme}
            onRequestConfirm={(title, msg, onConfirm) =>
              setConfirmDialog({
                isOpen: true,
                title,
                message: msg,
                onConfirm,
              })
            }
            onShowToast={triggerToast}
          />
        ) : (
          <>
            {/* Therapist Schedule Header Banner */}
            {activeSchedule && (
              <div
                className={`p-4 sm:p-5 rounded-3xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
                  isLight
                    ? 'bg-white border-slate-200'
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
                <div className="flex items-center gap-3.5">
                  <div className="p-1 rounded-2xl bg-white shadow-md border border-slate-200/90 flex items-center justify-center shrink-0">
                    <img
                      src="/therapy-hub-logo.jpg"
                      alt="Therapy Hub"
                      referrerPolicy="no-referrer"
                      className="h-12 w-auto object-contain rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black">{activeSchedule.title}</h2>
                      {activeSchedule.department && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                          {activeSchedule.department}
                        </span>
                      )}
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-cyan-400" />
                        {activeSchedule.branch || 'PECHS Main Campus'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-2">
                      <span>Clinical Schedule & Session Roster</span>
                      <span className="w-1 h-1 rounded-full bg-slate-500" />
                      <span className="text-cyan-400 font-mono font-bold">Shift: {activeSchedule.shift}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2 sm:flex-col sm:items-end w-full sm:w-auto justify-between">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleOpenEditProfileForActiveTherapist}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98 mb-1"
                      title="Edit Therapist Profile, Department & Shift"
                    >
                      <UserCog className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Capacity Status
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                    {stats.bookedSlots} / {stats.totalSlots} Slots Booked
                  </span>
                </div>
              </div>
            )}

            {/* Schedule Table Component */}
            {activeSchedule ? (
              <div className={printMode === 'all' ? 'no-print' : ''}>
                <ScheduleTable
                  schedule={activeSchedule}
                  isAdmin={isAdmin}
                  hideEmptyCells={hideEmptyCells}
                  onUpdateSlotTime={handleUpdateSlotTime}
                  onUpdateSlotDayTime={handleUpdateSlotDayTime}
                  onUpdateSlotCell={handleUpdateSlotCell}
                  onToggleBreak={handleToggleBreak}
                  onDeleteSlot={handleDeleteSlot}
                  onUpdateShift={handleUpdateShift}
                  onOpenAddSlotModal={() => setIsAddSlotOpen(true)}
                  onAddSlot={handleAddSlot}
                  onAddSlotForDay={handleAddSlotForDay}
                  onOpenEditProfile={handleOpenEditProfileForActiveTherapist}
                  theme={theme}
                />
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-500" />
                <h3 className="text-base font-bold mb-1">No Schedule Selected</h3>
                <p className="text-xs">
                  Please select a therapist from the sidebar roster or create a new profile.
                </p>
              </div>
            )}
          </>
        )}

        {/* Dedicated Pure-Print View for All Staff */}
        {printMode === 'all' && (
          <PrintAllStaffView schedules={schedules} hideEmptyCells={hideEmptyCells} />
        )}
      </main>

      {/* Admin Add Therapist Modal */}
      {isAdmin && (
        <AddTherapistModal
          isOpen={isAddTherapistOpen}
          onClose={() => setIsAddTherapistOpen(false)}
          onAdd={handleAddTherapist}
        />
      )}

      {/* Admin Add Slot Modal */}
      {isAdmin && (
        <AddSlotModal
          isOpen={isAddSlotOpen}
          onClose={() => setIsAddSlotOpen(false)}
          onAddSlot={handleAddSlot}
        />
      )}

      {/* Admin User Accounts Management Modal */}
      {currentUser && (
        <ManageUsersModal
          isOpen={isManageUsersOpen}
          onClose={() => setIsManageUsersOpen(false)}
          currentUser={currentUser}
          users={users}
          onAddUser={handleAddUser}
          onUpdatePassword={handleUpdatePassword}
          onDeleteUser={handleDeleteUser}
          onOpenEditProfile={handleOpenEditProfileForUser}
        />
      )}

      {/* Full Profile & Account Editor Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => {
            setIsEditProfileOpen(false);
            setEditingProfileUser(null);
          }}
          user={editingProfileUser}
          schedule={activeSchedule}
          existingUsers={users}
          onSave={handleSaveUserProfile}
          theme={theme}
        />
      )}

      {/* Official Clinical Print & Export Center */}
      <ClinicalPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        activeSchedule={activeSchedule}
        schedules={schedules}
        isAdmin={isAdmin}
        hideEmptyCells={hideEmptyCells}
        onToggleHideEmptyCells={setHideEmptyCells}
        initialMode={printModalMode}
      />

      {/* Custom Non-Blocking Confirmation Dialog */}
      <ConfirmDialog
        state={confirmDialog}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
