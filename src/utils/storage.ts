// ============================================
// ResQScan Local Storage Utilities
// Simulates backend database operations
// ============================================

export interface UserProfile {
  fullName: string;
  age: string;
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  insuranceProvider: string;
  doctorName: string;
  emergencyPin: string;
  isBloodDonor: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  profile: UserProfile | null;
  createdAt: string;
}

export interface ScanRecord {
  userId: string;
  timestamp: string;
  userAgent?: string;
}

// Default empty profile
export const defaultProfile: UserProfile = {
  fullName: '',
  age: '',
  bloodGroup: '',
  allergies: '',
  chronicConditions: '',
  currentMedications: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  insuranceProvider: '',
  doctorName: '',
  emergencyPin: '',
  isBloodDonor: false,
};

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}

// ---- User Management ----

export function getUsers(): User[] {
  const data = localStorage.getItem('resqscan_users');
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]): void {
  localStorage.setItem('resqscan_users', JSON.stringify(users));
}

export function createUser(email: string, password: string, name: string): User | null {
  const users = getUsers();
  if (users.find(u => u.email === email)) return null;
  
  const newUser: User = {
    id: generateId(),
    email,
    password: btoa(password), // Simple encoding (in production: bcrypt)
    name,
    profile: null,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function authenticateUser(email: string, password: string): User | null {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === btoa(password)) || null;
}

export function updateUserProfile(userId: string, profile: UserProfile): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  
  users[idx].profile = profile;
  if (profile.fullName) users[idx].name = profile.fullName;
  saveUsers(users);
  return true;
}

export function deleteUser(userId: string): boolean {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  if (filtered.length === users.length) return false;
  saveUsers(filtered);
  localStorage.removeItem('resqscan_scans_' + userId);
  return true;
}

export function getUserById(userId: string): User | null {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
}

// ---- Session Management ----

export function setSession(userId: string, token: string): void {
  localStorage.setItem('resqscan_session', JSON.stringify({ userId, token }));
}

export function getSession(): { userId: string; token: string } | null {
  const data = localStorage.getItem('resqscan_session');
  return data ? JSON.parse(data) : null;
}

export function clearSession(): void {
  localStorage.removeItem('resqscan_session');
}

export function generateToken(userId: string): string {
  return btoa(JSON.stringify({ userId, exp: Date.now() + 86400000, iat: Date.now() }));
}

// ---- Scan History ----

export function recordScan(userId: string): void {
  const key = 'resqscan_scans_' + userId;
  const scans: ScanRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
  scans.push({
    userId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
  localStorage.setItem(key, JSON.stringify(scans));
}

export function getScanHistory(userId: string): ScanRecord[] {
  const key = 'resqscan_scans_' + userId;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// ---- Blood Donor Search ----

export function searchDonors(bloodGroup: string): { name: string; phone: string; bloodGroup: string }[] {
  const users = getUsers();
  const donors = users
    .filter(u => u.profile?.isBloodDonor && u.profile?.bloodGroup === bloodGroup)
    .map(u => ({
      name: u.profile!.fullName || u.name,
      phone: u.profile!.emergencyContactPhone || 'N/A',
      bloodGroup: u.profile!.bloodGroup,
    }));

  // Add mock donors for demo
  const mockDonors: Record<string, { name: string; phone: string; bloodGroup: string }[]> = {
    'A+': [
      { name: 'Rahul Sharma', phone: '+91 98765 43210', bloodGroup: 'A+' },
      { name: 'Priya Patel', phone: '+91 87654 32109', bloodGroup: 'A+' },
    ],
    'B+': [
      { name: 'Amit Kumar', phone: '+91 76543 21098', bloodGroup: 'B+' },
      { name: 'Sneha Gupta', phone: '+91 65432 10987', bloodGroup: 'B+' },
    ],
    'O+': [
      { name: 'Vikram Singh', phone: '+91 54321 09876', bloodGroup: 'O+' },
      { name: 'Neha Verma', phone: '+91 43210 98765', bloodGroup: 'O+' },
      { name: 'Arjun Reddy', phone: '+91 32109 87654', bloodGroup: 'O+' },
    ],
    'O-': [
      { name: 'Deepak Joshi', phone: '+91 21098 76543', bloodGroup: 'O-' },
    ],
    'AB+': [
      { name: 'Kavita Nair', phone: '+91 10987 65432', bloodGroup: 'AB+' },
    ],
    'A-': [
      { name: 'Suresh Menon', phone: '+91 98712 34567', bloodGroup: 'A-' },
    ],
    'B-': [
      { name: 'Anjali Das', phone: '+91 87612 34567', bloodGroup: 'B-' },
    ],
    'AB-': [
      { name: 'Ravi Iyer', phone: '+91 76512 34567', bloodGroup: 'AB-' },
    ],
  };

  return [...donors, ...(mockDonors[bloodGroup] || [])];
}

// ---- QR Data Encoding/Decoding ----

export interface QRData {
  id: string;
  n: string;   // name
  a: string;   // age
  bg: string;  // blood group
  al: string;  // allergies
  cc: string;  // chronic conditions
  m: string;   // medications
  ecn: string; // emergency contact name
  ecp: string; // emergency contact phone
  ecr: string; // emergency contact relation
  ip?: string; // insurance provider
  dn?: string; // doctor name
  pin?: boolean; // has pin
}

export function encodeQRData(userId: string, profile: UserProfile): string {
  const data: QRData = {
    id: userId,
    n: profile.fullName,
    a: profile.age,
    bg: profile.bloodGroup,
    al: profile.allergies,
    cc: profile.chronicConditions,
    m: profile.currentMedications,
    ecn: profile.emergencyContactName,
    ecp: profile.emergencyContactPhone,
    ecr: profile.emergencyContactRelation,
    ip: profile.insuranceProvider || undefined,
    dn: profile.doctorName || undefined,
    pin: profile.emergencyPin ? true : undefined,
  };
  
  const jsonStr = JSON.stringify(data);
  const bytes = new TextEncoder().encode(jsonStr);
  const binStr = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
  return btoa(binStr);
}

export function decodeQRData(encoded: string): QRData | null {
  try {
    const binStr = atob(encoded);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

// ---- Language ----

export function getSavedLanguage(): 'en' | 'hi' {
  return (localStorage.getItem('resqscan_lang') as 'en' | 'hi') || 'en';
}

export function saveLanguage(lang: 'en' | 'hi'): void {
  localStorage.setItem('resqscan_lang', lang);
}

// ---- Initialize Mock Data ----

export function initializeMockData(): void {
  const users = getUsers();
  if (users.length === 0) {
    // Add some sample scan data for demo
    const scanKey = 'resqscan_demo_initialized';
    if (!localStorage.getItem(scanKey)) {
      localStorage.setItem(scanKey, 'true');
    }
  }
}
