export type UserRole = 'admin' | 'staff';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface DayInfo {
  key: DayKey;
  label: string;
  shortLabel: string;
}

export const DAYS_LIST: DayInfo[] = [
  { key: 'mon', label: 'Monday', shortLabel: 'Mon' },
  { key: 'tue', label: 'Tuesday', shortLabel: 'Tue' },
  { key: 'wed', label: 'Wednesday', shortLabel: 'Wed' },
  { key: 'thu', label: 'Thursday', shortLabel: 'Thu' },
  { key: 'fri', label: 'Friday', shortLabel: 'Fri' },
  { key: 'sat', label: 'Saturday', shortLabel: 'Sat' },
];

export interface UserAccount {
  username: string;
  name: string;
  pass: string;
  role: UserRole;
  title: string;
  staffKey: string; // "ALL" for admins or matching TherapistSchedule.key
  avatarInitials?: string;
  dept?: string;
  shiftStart?: string;
  shiftEnd?: string;
  branch?: string;
  phone?: string;
  email?: string;
  slotDuration?: number;
}

export interface ScheduleSlot {
  id: string;
  time: string;
  isBreak: boolean;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  dayTimes?: Partial<Record<DayKey, string>>;
}

export interface TherapistSchedule {
  key: string;
  title: string;
  shift: string;
  slots: ScheduleSlot[];
  branch?: string;
  department?: string;
}

export type ScheduleMap = Record<string, TherapistSchedule>;

export type PortalTheme =
  | 'executive'       // Midnight Executive (Slate Navy & Cyan)
  | 'clinical-light'  // Hospital Pure Light (Clean White EHR)
  | 'emerald'         // Emerald Health (Forest Green & Mint)
  | 'sapphire'        // Royal Sapphire (Electric Indigo & Cobalt)
  | 'amethyst'        // Amethyst Luxury (Deep Violet & Rose Gold)
  | 'nordic';         // Nordic Frost (Cool Slate Gray & Ice Blue)

export type BorderStyle = 'refined' | 'grid' | 'minimal';

export type ActivePortalTab = 'schedules' | 'attendance';

export interface FilterState {
  searchQuery: string;
  dayFilter: 'all' | DayKey;
  slotType: 'all' | 'sessions' | 'breaks';
}

// Attendance Portal Types
export interface GeofenceConfig {
  lat: number;
  lng: number;
  radius: number; // In meters
  officeName?: string;
}

export interface AttendanceLog {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  month: string; // YYYY-MM
  empId: string;
  empName: string;
  dept: string;
  shiftTiming: string;
  type: 'Check-In' | 'Check-Out';
  status: 'On-Time' | 'Late' | 'Check-Out';
  distance: string;
  coords: string;
  verified: boolean;
}
