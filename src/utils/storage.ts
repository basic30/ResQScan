// ============================================
// ResQScan Local Storage Utilities
// Simulates backend database operations
// ============================================

import type { Language } from './translations';

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
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
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
    password: btoa(password),
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

// ---- Scan History (with location tracking) ----

export function recordScan(userId: string): void {
  const key = 'resqscan_scans_' + userId;
  const scans: ScanRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
  
  const scanRecord: ScanRecord = {
    userId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  // Try to get geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        scanRecord.location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        // Try reverse geocoding with a simple approach
        reverseGeocode(pos.coords.latitude, pos.coords.longitude).then(address => {
          if (address) {
            scanRecord.location!.address = address;
          }
          // Update the last scan record with location
          const currentScans: ScanRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
          if (currentScans.length > 0) {
            currentScans[currentScans.length - 1] = scanRecord;
            localStorage.setItem(key, JSON.stringify(currentScans));
          }
        });
      },
      () => {
        // Geolocation denied or failed - record without location
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  }

  scans.push(scanRecord);
  localStorage.setItem(key, JSON.stringify(scans));
}

// Simple reverse geocoding using free API
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (resp.ok) {
      const data = await resp.json();
      // Build a short address from city/town/state
      const addr = data.address;
      const parts: string[] = [];
      if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
      if (addr.state) parts.push(addr.state);
      if (addr.country) parts.push(addr.country);
      return parts.join(', ') || data.display_name?.substring(0, 60) || null;
    }
  } catch {
    // Silently fail
  }
  return null;
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
  bd?: boolean;  // blood donor
  v?: number;   // version number for expiry tracking
}

// ---- Saved QR State (Persistence) ----

export interface SavedQR {
  encodedData: string;    // The encoded QR string
  qrImageUrl: string;     // Base64 data URL of QR image
  qrLink: string;         // Full link the QR points to
  version: number;        // Version number — incremented on regenerate
  generatedAt: string;    // ISO timestamp
  isActive: boolean;      // Whether this QR is still active
}

export function getSavedQR(userId: string): SavedQR | null {
  try {
    const key = `resqscan_qr_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveQR(userId: string, qr: SavedQR): void {
  const key = `resqscan_qr_${userId}`;
  localStorage.setItem(key, JSON.stringify(qr));
}

export function expireQR(userId: string): number {
  // Expire current QR and return the new version number
  const existing = getSavedQR(userId);
  const oldVersion = existing?.version || 0;
  
  // Store expired version numbers so scan page can detect them
  const expiredKey = `resqscan_expired_versions_${userId}`;
  const expiredVersions: number[] = JSON.parse(localStorage.getItem(expiredKey) || '[]');
  if (oldVersion > 0) {
    expiredVersions.push(oldVersion);
    localStorage.setItem(expiredKey, JSON.stringify(expiredVersions));
  }
  
  // Clear the saved QR
  localStorage.removeItem(`resqscan_qr_${userId}`);
  
  return oldVersion + 1;
}

export function isQRVersionExpired(userId: string, version: number): boolean {
  const expiredKey = `resqscan_expired_versions_${userId}`;
  const expiredVersions: number[] = JSON.parse(localStorage.getItem(expiredKey) || '[]');
  return expiredVersions.includes(version);
}

export function encodeQRData(userId: string, profile: UserProfile, version: number = 1): string {
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
    bd: profile.isBloodDonor || undefined,
    v: version,
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

export function getSavedLanguage(): Language {
  return (localStorage.getItem('resqscan_lang') as Language) || 'en';
}

export function saveLanguage(lang: Language): void {
  localStorage.setItem('resqscan_lang', lang);
}

// ---- Theme ----

export type Theme = 'dark' | 'light';

export function getSavedTheme(): Theme {
  return (localStorage.getItem('resqscan_theme') as Theme) || 'dark';
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem('resqscan_theme', theme);
}

// ---- Doctors Nearby Data ----

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  rating: number;
  available: boolean;
  experience: string;
  lat?: number;
  lng?: number;
}

export function getNearbyDoctors(specialty?: string): Doctor[] {
  const allDoctors: Doctor[] = [
    { id: 'd1', name: 'Dr. Anil Kumar Sharma', specialty: 'General Physician', phone: '+91 98765 11111', address: '12, MG Road, Sector 4, New Delhi - 110001', rating: 4.8, available: true, experience: '15 years', lat: 28.6139, lng: 77.2090 },
    { id: 'd2', name: 'Dr. Priya Mehta', specialty: 'Cardiologist', phone: '+91 98765 22222', address: '45, Heart Care Centre, Bandra West, Mumbai - 400050', rating: 4.9, available: true, experience: '20 years', lat: 19.0596, lng: 72.8295 },
    { id: 'd3', name: 'Dr. Rajesh Gupta', specialty: 'Orthopedic', phone: '+91 98765 33333', address: '78, Bone & Joint Clinic, Salt Lake, Kolkata - 700091', rating: 4.5, available: false, experience: '12 years', lat: 22.5726, lng: 88.3639 },
    { id: 'd4', name: 'Dr. Sneha Reddy', specialty: 'Pediatrician', phone: '+91 98765 44444', address: '23, Children\'s Health Center, Jubilee Hills, Hyderabad - 500033', rating: 4.7, available: true, experience: '10 years', lat: 17.4319, lng: 78.4095 },
    { id: 'd5', name: 'Dr. Mohammed Iqbal', specialty: 'Neurologist', phone: '+91 98765 55555', address: '56, Brain & Spine Institute, Koramangala, Bangalore - 560034', rating: 4.6, available: true, experience: '18 years', lat: 12.9352, lng: 77.6245 },
    { id: 'd6', name: 'Dr. Kavita Singh', specialty: 'Dermatologist', phone: '+91 98765 66666', address: '34, Skin Care Clinic, Aliganj, Lucknow - 226024', rating: 4.4, available: true, experience: '8 years', lat: 26.8946, lng: 80.9430 },
    { id: 'd7', name: 'Dr. Suresh Patel', specialty: 'General Physician', phone: '+91 98765 77777', address: '89, Family Health Clinic, Navrangpura, Ahmedabad - 380009', rating: 4.3, available: false, experience: '22 years', lat: 23.0365, lng: 72.5611 },
    { id: 'd8', name: 'Dr. Ananya Das', specialty: 'Gynecologist', phone: '+91 98765 88888', address: '67, Women\'s Health Centre, Park Street, Kolkata - 700016', rating: 4.8, available: true, experience: '14 years', lat: 22.5520, lng: 88.3515 },
    { id: 'd9', name: 'Dr. Vikram Joshi', specialty: 'ENT Specialist', phone: '+91 98765 99999', address: '11, ENT Care Hospital, Deccan, Pune - 411004', rating: 4.5, available: true, experience: '16 years', lat: 18.5089, lng: 73.8400 },
    { id: 'd10', name: 'Dr. Nandini Iyer', specialty: 'Ophthalmologist', phone: '+91 98765 00000', address: '92, Clear Vision Eye Centre, T. Nagar, Chennai - 600017', rating: 4.7, available: true, experience: '11 years', lat: 13.0418, lng: 80.2341 },
    { id: 'd11', name: 'Dr. Arjun Malhotra', specialty: 'Cardiologist', phone: '+91 87654 11111', address: '15, Heart Institute, Civil Lines, Jaipur - 302006', rating: 4.6, available: true, experience: '19 years', lat: 26.9124, lng: 75.7873 },
    { id: 'd12', name: 'Dr. Fatima Khan', specialty: 'Pediatrician', phone: '+91 87654 22222', address: '38, Kids Care Hospital, Charbagh, Lucknow - 226004', rating: 4.4, available: false, experience: '9 years', lat: 26.8580, lng: 80.9210 },
    { id: 'd13', name: 'Dr. Ramesh Verma', specialty: 'Orthopedic', phone: '+91 87654 33333', address: '51, Joint & Bone Hospital, Sector 22, Chandigarh - 160022', rating: 4.8, available: true, experience: '25 years', lat: 30.7333, lng: 76.7794 },
    { id: 'd14', name: 'Dr. Deepa Nair', specialty: 'Dermatologist', phone: '+91 87654 44444', address: '73, Glow Skin Clinic, MG Road, Kochi - 682016', rating: 4.3, available: true, experience: '7 years', lat: 9.9816, lng: 76.2999 },
    { id: 'd15', name: 'Dr. Sanjay Mukherjee', specialty: 'Neurologist', phone: '+91 87654 55555', address: '29, Neuro Wellness Centre, Gariahat, Kolkata - 700019', rating: 4.9, available: true, experience: '23 years', lat: 22.5186, lng: 88.3668 },
  ];

  if (specialty && specialty !== 'all') {
    return allDoctors.filter(d => d.specialty === specialty);
  }
  return allDoctors;
}

export function getDoctorSpecialties(): string[] {
  return [
    'General Physician',
    'Cardiologist',
    'Orthopedic',
    'Pediatrician',
    'Neurologist',
    'Dermatologist',
    'Gynecologist',
    'ENT Specialist',
    'Ophthalmologist',
  ];
}

// ---- Initialize Mock Data ----

export function initializeMockData(): void {
  const users = getUsers();
  if (users.length === 0) {
    const scanKey = 'resqscan_demo_initialized';
    if (!localStorage.getItem(scanKey)) {
      localStorage.setItem(scanKey, 'true');
    }
  }
}
