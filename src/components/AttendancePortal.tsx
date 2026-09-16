import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Building2,
  Sliders,
  UserPlus,
  Search,
  Filter,
  Download,
  Trash2,
  Crosshair,
  Save,
  LogIn,
  LogOut,
  Calendar,
  Sparkles,
  Compass,
} from 'lucide-react';
import { UserAccount, PortalTheme, GeofenceConfig, AttendanceLog } from '../types';
import { DEFAULT_GEOFENCE_CONFIG, INITIAL_ATTENDANCE_LOGS } from '../data/initialData';
import { loadFromStorage, saveToStorage } from '../utils/scheduleUtils';

interface AttendancePortalProps {
  currentUser: UserAccount;
  users: Record<string, UserAccount>;
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  theme: PortalTheme;
  onRequestConfirm: (title: string, msg: string, onConfirm: () => void) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

// Haversine Distance Formula (Meters)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const AttendancePortal: React.FC<AttendancePortalProps> = ({
  currentUser,
  users,
  onAddUser,
  onDeleteUser,
  theme,
  onRequestConfirm,
  onShowToast,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // 1. Persistent Data
  const [officeConfig, setOfficeConfig] = useState<GeofenceConfig>(() =>
    loadFromStorage('geofence_config_v2', DEFAULT_GEOFENCE_CONFIG)
  );

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() =>
    loadFromStorage('geofence_logs_v2', INITIAL_ATTENDANCE_LOGS)
  );

  useEffect(() => {
    saveToStorage('geofence_config_v2', officeConfig);
  }, [officeConfig]);

  useEffect(() => {
    saveToStorage('geofence_logs_v2', attendanceLogs);
  }, [attendanceLogs]);

  // 2. Device GPS Tracking State
  const [deviceLat, setDeviceLat] = useState<number | null>(null);
  const [deviceLng, setDeviceLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'active' | 'locating' | 'denied' | 'unsupported'>('locating');

  // Office Config Form State
  const [cfgLat, setCfgLat] = useState<string>(officeConfig.lat.toString());
  const [cfgLng, setCfgLng] = useState<string>(officeConfig.lng.toString());
  const [cfgRadius, setCfgRadius] = useState<string>(officeConfig.radius.toString());

  // Register New Staff Form State
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newDept, setNewDept] = useState('Speech Therapist');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');

  // Master Log Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Live Date
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // GPS Watcher
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setDeviceLat(pos.coords.latitude);
        setDeviceLng(pos.coords.longitude);
        setGpsStatus('active');
      },
      (err) => {
        // If user denied or desktop has no GPS, show friendly message
        setGpsStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Distance & Geofence evaluation
  const distanceToOffice = useMemo(() => {
    if (deviceLat === null || deviceLng === null) return null;
    const d = calculateHaversineDistance(deviceLat, deviceLng, officeConfig.lat, officeConfig.lng);
    return Math.round(d);
  }, [deviceLat, deviceLng, officeConfig]);

  const isInsideGeofence = useMemo(() => {
    if (distanceToOffice === null) return false;
    return distanceToOffice <= officeConfig.radius;
  }, [distanceToOffice, officeConfig.radius]);

  // Today's Status for Current Employee
  const userTodayLogs = useMemo(() => {
    return attendanceLogs.filter((l) => l.empId === currentUser.username && l.date === todayStr);
  }, [attendanceLogs, currentUser.username, todayStr]);

  const hasCheckedInToday = useMemo(() => {
    return userTodayLogs.some((l) => l.type === 'Check-In' || l.status === 'On-Time' || l.status === 'Late');
  }, [userTodayLogs]);

  const hasCheckedOutToday = useMemo(() => {
    return userTodayLogs.some((l) => l.type === 'Check-Out');
  }, [userTodayLogs]);

  // Handle Mark Attendance (Single Check-in and Single Check-out)
  const handleAttendance = (type: 'Check-In' | 'Check-Out') => {
    // 1. Check if user already marked
    if (type === 'Check-In' && hasCheckedInToday) {
      onShowToast('Aap aaj ka Check-In pehle hi kar chukay hain! Ek din me do dafa allowed nahi hai.', 'error');
      return;
    }

    if (type === 'Check-Out') {
      if (hasCheckedOutToday) {
        onShowToast('Aap aaj ka Check-Out pehle hi kar chukay hain! Double Check-Out allowed nahi hai.', 'error');
        return;
      }
      if (!hasCheckedInToday) {
        onShowToast('Check-Out karne se pehle Check-In karna zaroori hai!', 'warning');
        return;
      }
    }

    // 2. Check GPS Signal
    if (deviceLat === null || deviceLng === null) {
      onShowToast('GPS location is not available yet. Please grant location permission or click "Simulate at Office" to test.', 'warning');
      return;
    }

    // 3. Geofence Boundary Check
    const dist = calculateHaversineDistance(deviceLat, deviceLng, officeConfig.lat, officeConfig.lng);
    const roundedDist = Math.round(dist);

    if (dist > officeConfig.radius) {
      onShowToast(`Attendance Blocked! You are ${roundedDist}m away from office. Allowed radius is ${officeConfig.radius}m.`, 'error');
      return;
    }

    // 4. Calculate Timing and Status
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5); // "HH:MM"
    let status: 'On-Time' | 'Late' | 'Check-Out' = type === 'Check-Out' ? 'Check-Out' : 'On-Time';

    if (type === 'Check-In') {
      const shiftStart = currentUser.shiftStart || '09:00';
      if (currentTimeStr > shiftStart) {
        status = 'Late';
      } else {
        status = 'On-Time';
      }
    }

    const newLog: AttendanceLog = {
      id: `LOG-${Date.now()}`,
      timestamp: now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      date: todayStr,
      time: currentTimeStr,
      month: now.toISOString().slice(0, 7),
      empId: currentUser.username,
      empName: currentUser.name,
      dept: currentUser.dept || currentUser.title || 'Therapist',
      shiftTiming: `${currentUser.shiftStart || '09:00'} - ${currentUser.shiftEnd || '17:00'}`,
      type: type,
      status: status,
      distance: `${roundedDist}m`,
      coords: `${deviceLat.toFixed(4)}, ${deviceLng.toFixed(4)}`,
      verified: true,
    };

    setAttendanceLogs((prev) => [newLog, ...prev]);
    onShowToast(
      status === 'Late'
        ? `Check-In Recorded as LATE (${currentTimeStr})`
        : `${type} Recorded Successfully (${roundedDist}m inside geofence)`,
      status === 'Late' ? 'warning' : 'success'
    );
  };

  // Helper to simulate office GPS for testing in dev/desktop environments
  const handleSimulateOfficeGPS = () => {
    setDeviceLat(officeConfig.lat + 0.0001);
    setDeviceLng(officeConfig.lng + 0.0001);
    setGpsStatus('active');
    onShowToast('GPS set to Office boundary coordinates (Simulation Mode)', 'info');
  };

  // Admin: Save Geofence
  const handleSaveGeofence = () => {
    const lat = parseFloat(cfgLat);
    const lng = parseFloat(cfgLng);
    const radius = parseInt(cfgRadius, 10);

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      onShowToast('Please enter valid numerical coordinates and radius.', 'error');
      return;
    }

    setOfficeConfig({
      ...officeConfig,
      lat,
      lng,
      radius,
    });
    onShowToast('Geofence settings updated successfully!', 'success');
  };

  // Admin: Set Current Device GPS as Office
  const handleSetDeviceAsOffice = () => {
    if (deviceLat === null || deviceLng === null) {
      onShowToast('Device GPS not acquired yet.', 'error');
      return;
    }
    setCfgLat(deviceLat.toFixed(8));
    setCfgLng(deviceLng.toFixed(8));
    setOfficeConfig((prev) => ({
      ...prev,
      lat: deviceLat,
      lng: deviceLng,
    }));
    onShowToast('Current Device GPS coordinates set as Office Centre!', 'success');
  };

  // Admin: Add New Staff Member
  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newId.trim().toLowerCase();
    if (!id || !newName.trim() || !newPass.trim()) {
      onShowToast('Please fill all required fields.', 'error');
      return;
    }

    if (users[id]) {
      onShowToast(`User ID '${id}' is already registered!`, 'error');
      return;
    }

    const newUser: UserAccount = {
      username: id,
      name: newName.trim(),
      pass: newPass.trim(),
      role: 'staff',
      title: newDept,
      staffKey: id.toUpperCase(),
      avatarInitials: newName.trim().slice(0, 2).toUpperCase(),
      dept: newDept,
      shiftStart: newStart,
      shiftEnd: newEnd,
    };

    onAddUser(newUser);
    setNewId('');
    setNewName('');
    setNewPass('');
    onShowToast(`Staff profile for '${newUser.name}' registered successfully!`, 'success');
  };

  // Admin: Export CSV
  const handleExportAttendanceCsv = () => {
    if (attendanceLogs.length === 0) {
      onShowToast('No attendance records to export.', 'warning');
      return;
    }

    let csv = 'Timestamp,Date,Employee ID,Employee Name,Department,Shift Timings,Action,Status,Distance,Coordinates\n';
    attendanceLogs.forEach((l) => {
      csv += `"${l.timestamp}","${l.date}","${l.empId}","${l.empName}","${l.dept}","${l.shiftTiming}","${l.type}","${l.status}","${l.distance}","${l.coords}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `TherapyHub_Attendance_Report_${todayStr}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Attendance CSV downloaded successfully', 'success');
  };

  // Admin: Clear Logs
  const handleClearLogs = () => {
    onRequestConfirm(
      'Clear All Attendance Records',
      'Are you sure you want to permanently clear all historical attendance records? This action cannot be undone.',
      () => {
        setAttendanceLogs([]);
        onShowToast('All attendance logs have been cleared.', 'info');
      }
    );
  };

  // Filter Master Logs
  const filteredMasterLogs = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    const d = deptFilter.toLowerCase().trim();
    return attendanceLogs.filter((log) => {
      const matchSearch = !s || log.empName.toLowerCase().includes(s) || log.empId.toLowerCase().includes(s);
      const matchDept = !d || (log.dept && log.dept.toLowerCase().includes(d));
      const matchStatus = statusFilter === 'ALL' || log.status === statusFilter || log.type === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [attendanceLogs, searchQuery, deptFilter, statusFilter]);

  // Analytics Stats
  const staffList: UserAccount[] = (Object.values(users) as UserAccount[]).filter(
    (u) => u.role === 'staff'
  );
  const todayLogs = attendanceLogs.filter((l) => l.date === todayStr);
  const activeStaffIds = new Set(todayLogs.map((l) => l.empId));
  const latesToday = todayLogs.filter((l) => l.status === 'Late').length;

  // Theme Styling
  const isLight = theme === 'clinical-light';
  const isEmerald = theme === 'emerald';
  const isSapphire = theme === 'sapphire';
  const isAmethyst = theme === 'amethyst';
  const isNordic = theme === 'nordic';

  const cardBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : isEmerald
    ? 'bg-[#061b15]/95 border-[#15463b] text-white shadow-xl'
    : isSapphire
    ? 'bg-[#091129]/95 border-indigo-950/80 text-white shadow-xl'
    : isAmethyst
    ? 'bg-[#140b22]/95 border-purple-950/80 text-white shadow-xl'
    : isNordic
    ? 'bg-[#151f30]/95 border-slate-700/60 text-slate-100 shadow-xl'
    : 'bg-slate-900/95 border-slate-800 text-white shadow-xl';

  const innerBoxBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : isEmerald
    ? 'bg-[#03130f] border-[#15463b]/70'
    : isSapphire
    ? 'bg-[#060c20] border-indigo-900/40'
    : isAmethyst
    ? 'bg-[#0e071a] border-purple-900/40'
    : isNordic
    ? 'bg-[#0d1624] border-slate-700/40'
    : 'bg-slate-950 border-slate-800/80';

  const inputBg = isLight
    ? 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
    : isEmerald
    ? 'bg-[#041410] border-[#15463b] text-emerald-100 focus:border-emerald-400'
    : isSapphire
    ? 'bg-[#060d24] border-indigo-800/60 text-indigo-100 focus:border-cyan-400'
    : isAmethyst
    ? 'bg-[#10081e] border-purple-800/60 text-purple-100 focus:border-pink-400'
    : isNordic
    ? 'bg-[#0e1826] border-slate-700 text-slate-100 focus:border-cyan-400'
    : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-400';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Clinical Welcome Banner */}
      <div
        className={`rounded-3xl p-6 text-white shadow-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
          isLight
            ? 'bg-gradient-to-r from-sky-700 to-indigo-800 border-sky-600'
            : isEmerald
            ? 'bg-gradient-to-r from-[#0d473a] to-[#042018] border-[#185e4e]'
            : isSapphire
            ? 'bg-gradient-to-r from-blue-900 to-indigo-950 border-indigo-800'
            : isAmethyst
            ? 'bg-gradient-to-r from-purple-950 to-[#220935] border-purple-800/50'
            : isNordic
            ? 'bg-gradient-to-r from-slate-800 to-[#122033] border-slate-700'
            : 'bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="p-1.5 rounded-2xl bg-white shadow-md border border-white/20 flex items-center justify-center shrink-0 w-fit">
            <img
              src="/therapy-hub-logo.jpg"
              alt="Therapy Hub"
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-cyan-200 border border-white/10 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Dept: {currentUser.dept || currentUser.title || 'Clinical Staff'}</span>
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-mono font-bold text-emerald-200 border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Shift: {currentUser.shiftStart || '09:00'} - {currentUser.shiftEnd || '17:00'}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{currentUser.name}</h2>
            <p className="text-xs text-slate-300 font-medium">
              Therapy Hub Smart Geofence Attendance Portal — Daily Single Check-In & Check-Out verification.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-5 text-right w-full md:w-auto flex md:flex-col justify-between items-center md:items-end shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-cyan-200 font-bold">Today's Date</span>
          <span className="text-sm font-bold font-mono text-white">{todayFormatted}</span>
        </div>
      </div>

      {/* 2. Employee / Staff GPS Attendance Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Live GPS & Single Check-In/Out Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`${cardBg} rounded-3xl p-6 border space-y-5`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-800/40">
              <h3 className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Location & Attendance</span>
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                150m Geofence
              </span>
            </div>

            {/* Daily Status Box */}
            <div className={`${innerBoxBg} border rounded-2xl p-3.5 text-xs space-y-1.5`}>
              <span className="font-bold flex items-center gap-1.5 opacity-90">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Today's Attendance Status:</span>
              </span>
              <div className="flex justify-between items-center pt-1 text-xs">
                <span>
                  Check-In:{' '}
                  <strong className={hasCheckedInToday ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {hasCheckedInToday ? 'Done ✓' : 'Not Marked'}
                  </strong>
                </span>
                <span>
                  Check-Out:{' '}
                  <strong className={hasCheckedOutToday ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {hasCheckedOutToday ? 'Done ✓' : 'Not Marked'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Live GPS Signal Card */}
            <div className={`${innerBoxBg} border rounded-2xl p-4 space-y-3`}>
              <div className="flex justify-between items-center border-b border-slate-800/40 pb-2.5">
                <span className="text-xs font-semibold text-slate-400">GPS Status:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    gpsStatus === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : gpsStatus === 'locating'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      gpsStatus === 'active' ? 'bg-emerald-400' : gpsStatus === 'locating' ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                  />
                  <span>
                    {gpsStatus === 'active'
                      ? 'GPS Active'
                      : gpsStatus === 'locating'
                      ? 'Locating...'
                      : 'GPS Unavailable'}
                  </span>
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono font-bold text-slate-100">
                    {deviceLat ? `${deviceLat.toFixed(5)}, ${deviceLng?.toFixed(5)}` : 'Awaiting GPS...'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Distance to Office:</span>
                  <span className="font-mono font-bold text-sm text-cyan-300">
                    {distanceToOffice !== null ? `${distanceToOffice} meters` : 'Calculating...'}
                  </span>
                </div>
              </div>

              {/* Geofence Status Banner */}
              {distanceToOffice !== null && (
                <div
                  className={`text-center py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                    isInsideGeofence
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {isInsideGeofence ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Inside Therapy Hub Geofence ({officeConfig.radius}m limit)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Outside Boundary ({distanceToOffice}m &gt; {officeConfig.radius}m limit)</span>
                    </>
                  )}
                </div>
              )}

              {/* Simulation test button */}
              <button
                type="button"
                onClick={handleSimulateOfficeGPS}
                className="w-full py-1.5 px-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center justify-center gap-1.5 cursor-pointer"
                title="Simulate Office GPS if browser has no GPS"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate Device at Office (PECHS)</span>
              </button>
            </div>

            {/* Attendance Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                id="btnAttendanceCheckIn"
                onClick={() => handleAttendance('Check-In')}
                disabled={hasCheckedInToday}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-950/50 transition-all flex flex-col items-center justify-center gap-1 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                <span>Check In</span>
              </button>

              <button
                type="button"
                id="btnAttendanceCheckOut"
                onClick={() => handleAttendance('Check-Out')}
                disabled={hasCheckedOutToday || !hasCheckedInToday}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-950/50 transition-all flex flex-col items-center justify-center gap-1 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <LogOut className="w-5 h-5" />
                <span>Check Out</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
              Daily 1 Check-In and 1 Check-Out verified within PECHS office boundary.
            </p>
          </div>
        </div>

        {/* Right Side: Personal Attendance History Table */}
        <div className="lg:col-span-2">
          <div className={`${cardBg} rounded-3xl p-6 border h-full flex flex-col justify-between space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3 border-slate-800/40">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>My Attendance History</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                {attendanceLogs.filter((l) => l.empId === currentUser.username).length} Records
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/40 flex-grow">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800/60">
                    <th className="p-3">Date & Timestamp</th>
                    <th className="p-3">Action Status</th>
                    <th className="p-3">Shift Window</th>
                    <th className="p-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 font-medium">
                  {attendanceLogs.filter((l) => l.empId === currentUser.username).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No attendance records logged yet.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs
                      .filter((l) => l.empId === currentUser.username)
                      .map((log) => {
                        const isLate = log.status === 'Late';
                        const isCheckOut = log.type === 'Check-Out';
                        return (
                          <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="p-3 font-mono text-slate-300">{log.timestamp}</td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                  isLate
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : isCheckOut
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 font-mono">{log.shiftTiming}</td>
                            <td className="p-3 text-right">
                              <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-xs">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verified ({log.distance})</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ADMIN ONLY: Management, Analytics, Config & Master Logs */}
      {isAdmin && (
        <div className="space-y-6 pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>Admin Attendance Control & Master Logs</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live monitoring, geofence radius settings, and staff attendance register.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Admin Mode
            </span>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={`${cardBg} rounded-2xl p-4 border flex items-center gap-3.5`}>
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-lg border border-cyan-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">Total Registered Staff</div>
                <div className="text-2xl font-black">{staffList.length}</div>
              </div>
            </div>

            <div className={`${cardBg} rounded-2xl p-4 border flex items-center gap-3.5`}>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">Present Today</div>
                <div className="text-2xl font-black text-emerald-400">{activeStaffIds.size}</div>
              </div>
            </div>

            <div className={`${cardBg} rounded-2xl p-4 border flex items-center gap-3.5 col-span-2 md:col-span-1`}>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">Lates Recorded Today</div>
                <div className="text-2xl font-black text-amber-400">{latesToday}</div>
              </div>
            </div>
          </div>

          {/* Settings & Registration Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Geofence Configuration */}
            <div className={`${cardBg} rounded-3xl p-6 border space-y-4 lg:col-span-1`}>
              <h4 className="text-sm font-bold flex items-center gap-2 border-b border-slate-800/40 pb-2.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Office Geofence Settings</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Office Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={cfgLat}
                    onChange={(e) => setCfgLat(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs font-mono`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Office Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={cfgLng}
                    onChange={(e) => setCfgLng(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs font-mono`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Allowed Radius (Meters)</label>
                  <input
                    type="number"
                    value={cfgRadius}
                    onChange={(e) => setCfgRadius(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs font-mono`}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveGeofence}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Geofence Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetDeviceAsOffice}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Set My Device GPS as Office</span>
                </button>
              </div>
            </div>

            {/* Register Staff Member */}
            <div className={`${cardBg} rounded-3xl p-6 border space-y-4 lg:col-span-2`}>
              <h4 className="text-sm font-bold flex items-center gap-2 border-b border-slate-800/40 pb-2.5">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Register Staff Member with Shift</span>
              </h4>

              <form onSubmit={handleRegisterStaff} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Username / ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. zohaib"
                      value={newId}
                      onChange={(e) => setNewId(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Zohaib"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Speech Therapist"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Shift Start</label>
                    <input
                      type="time"
                      required
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs font-mono`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Shift End</label>
                    <input
                      type="time"
                      required
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className={`w-full ${inputBg} border rounded-xl px-3 py-2 text-xs font-mono`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Staff Member</span>
                </button>
              </form>

              {/* Registered Staff Mini Table */}
              <div className="max-h-36 overflow-y-auto border border-slate-800/50 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-800/50 text-slate-400 font-bold sticky top-0">
                    <tr>
                      <th className="p-2">User ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Department</th>
                      <th className="p-2">Shift</th>
                      <th className="p-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {staffList.map((u) => (
                      <tr key={u.username} className="hover:bg-slate-800/20">
                        <td className="p-2 font-mono font-bold text-cyan-400">{u.username}</td>
                        <td className="p-2 font-semibold">{u.name}</td>
                        <td className="p-2 text-slate-400">{u.dept || u.title}</td>
                        <td className="p-2 font-mono text-slate-400">
                          {u.shiftStart || '09:00'} - {u.shiftEnd || '17:00'}
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteUser(u.username)}
                            className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                            title="Remove Staff User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Master Attendance Logs & Filter Table */}
          <div className={`${cardBg} rounded-3xl p-6 border space-y-4`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/40 pb-4">
              <div>
                <h4 className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Therapy Hub Master Attendance Records</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Real-time verifiable check-in/out timestamps, distance, and geofence status.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-8 pr-3 py-1.5 ${inputBg} border rounded-xl text-xs w-full sm:w-44`}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Filter Department..."
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className={`px-3 py-1.5 ${inputBg} border rounded-xl text-xs w-full sm:w-36`}
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-1.5 ${inputBg} border rounded-xl text-xs`}
                >
                  <option value="ALL">All Status</option>
                  <option value="On-Time">On-Time</option>
                  <option value="Late">Late</option>
                  <option value="Check-Out">Check-Out</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportAttendanceCsv}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold py-1.5 px-3 rounded-xl transition-all border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Master Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800/40 max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Shift Timing</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Distance</th>
                    <th className="p-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 font-medium">
                  {filteredMasterLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No attendance records match your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMasterLogs.map((log) => {
                      const isLate = log.status === 'Late';
                      const isCheckOut = log.type === 'Check-Out';
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-3 text-slate-400 font-mono">{log.timestamp}</td>
                          <td className="p-3 font-semibold text-slate-100">
                            {log.empName}{' '}
                            <span className="text-slate-400 font-mono text-[10px]">({log.empId})</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              {log.dept}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono">{log.shiftTiming}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                isLate
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : isCheckOut
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono">{log.distance}</td>
                          <td className="p-3 text-right">
                            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
