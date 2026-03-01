// Firebase Service - All database operations for ResQScan
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ==================== TYPES ====================

export interface UserProfile {
  odid: string;
  email: string;
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
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface SavedQR {
  odid: string;
  encodedData: string;
  qrLink: string;
  version: number;
  generatedAt: string;
  isActive: boolean;
  expiredVersions: number[];
}

export interface ScanRecord {
  odid: string;
  odidScanned: string;
  scannedAt: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  rating: number;
  available: boolean;
  experience: number;
  lat: number;
  lng: number;
}

// ==================== USER PROFILE OPERATIONS ====================

// Create or update user profile
export const saveUserProfile = async (odid: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', odid);
    const existing = await getDoc(userRef);
    
    if (existing.exists()) {
      await updateDoc(userRef, {
        ...profile,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        odid,
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Get user profile by odid
export const getUserProfile = async (odid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', odid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Delete user profile
export const deleteUserProfile = async (odid: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', odid));
    // Also delete associated QR and scans
    await deleteDoc(doc(db, 'qrcodes', odid));
    // Delete scan records
    const scansQuery = query(collection(db, 'scans'), where('odidScanned', '==', odid));
    const scansSnapshot = await getDocs(scansQuery);
    const deletePromises = scansSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

// ==================== QR CODE OPERATIONS ====================

// Save QR code data
export const saveQRCode = async (odid: string, qrData: Omit<SavedQR, 'odid'>): Promise<void> => {
  try {
    const qrRef = doc(db, 'qrcodes', odid);
    await setDoc(qrRef, {
      odid,
      ...qrData
    });
  } catch (error) {
    console.error('Error saving QR code:', error);
    throw error;
  }
};

// Get QR code data
export const getQRCode = async (odid: string): Promise<SavedQR | null> => {
  try {
    const qrRef = doc(db, 'qrcodes', odid);
    const docSnap = await getDoc(qrRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SavedQR;
    }
    return null;
  } catch (error) {
    console.error('Error getting QR code:', error);
    throw error;
  }
};

// Expire QR code (increment version, add to expired list)
export const expireQRCode = async (odid: string): Promise<number> => {
  try {
    const qrRef = doc(db, 'qrcodes', odid);
    const existing = await getDoc(qrRef);
    
    let newVersion = 1;
    let expiredVersions: number[] = [];
    
    if (existing.exists()) {
      const data = existing.data() as SavedQR;
      newVersion = (data.version || 1) + 1;
      expiredVersions = [...(data.expiredVersions || []), data.version || 1];
      
      await updateDoc(qrRef, {
        isActive: false,
        expiredVersions
      });
    }
    
    return newVersion;
  } catch (error) {
    console.error('Error expiring QR code:', error);
    throw error;
  }
};

// Check if QR version is expired
export const isQRVersionExpired = async (odid: string, version: number): Promise<boolean> => {
  try {
    const qrRef = doc(db, 'qrcodes', odid);
    const docSnap = await getDoc(qrRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SavedQR;
      return (data.expiredVersions || []).includes(version);
    }
    return false;
  } catch (error) {
    console.error('Error checking QR expiry:', error);
    return false;
  }
};

// ==================== SCAN RECORD OPERATIONS ====================

// Record a scan
export const recordScan = async (odidScanned: string, location?: ScanRecord['location']): Promise<void> => {
  try {
    await addDoc(collection(db, 'scans'), {
      odidScanned,
      scannedAt: new Date().toISOString(),
      location: location || null
    });
  } catch (error) {
    console.error('Error recording scan:', error);
    throw error;
  }
};

// Get scan history for a user
export const getScanHistory = async (odid: string): Promise<ScanRecord[]> => {
  try {
    const scansQuery = query(collection(db, 'scans'), where('odidScanned', '==', odid));
    const scansSnapshot = await getDocs(scansQuery);
    
    return scansSnapshot.docs.map(doc => doc.data() as ScanRecord);
  } catch (error) {
    console.error('Error getting scan history:', error);
    return [];
  }
};

// ==================== BLOOD DONOR OPERATIONS ====================

// Get blood donors by blood group
export const getBloodDonors = async (bloodGroup?: string): Promise<UserProfile[]> => {
  try {
    // Fetch ALL users to avoid Firestore missing composite index errors
    // (Firestore requires manual index creation for multiple where clauses)
    const donorsQuery = query(collection(db, 'users'));
    const donorsSnapshot = await getDocs(donorsQuery);
    
    const list = donorsSnapshot.docs.map(doc => doc.data() as UserProfile);

    // 1. Deduplicate by odid to fix the "multiple clones" bug in the database
    const uniqueMap = new Map<string, UserProfile>();
    list.forEach(user => {
      if (user.odid) {
        uniqueMap.set(user.odid, user);
      }
    });
    
    let uniqueDonors = Array.from(uniqueMap.values());

    // 2. Filter for users who are opted-in and have actually set their blood group
    uniqueDonors = uniqueDonors.filter(donor => donor.isBloodDonor === true && !!donor.bloodGroup);

    // 3. Filter by specific blood group if requested
    if (bloodGroup && bloodGroup !== 'all') {
      uniqueDonors = uniqueDonors.filter(donor => donor.bloodGroup === bloodGroup);
    }

    return uniqueDonors;
  } catch (error) {
    console.error('Error getting blood donors:', error);
    return [];
  }
};

// ==================== DOCTORS DATA ====================

// Get nearby doctors (mock data - in production, this would be from a real API)
export const getNearbyDoctors = (specialty?: string): Doctor[] => {
  const doctors: Doctor[] = [
    { id: '1', name: 'Dr. Rajesh Kumar', specialty: 'General Physician', phone: '+91 98765 43210', address: 'Apollo Clinic, Connaught Place, New Delhi', rating: 4.8, available: true, experience: 15, lat: 28.6315, lng: 77.2167 },
    { id: '2', name: 'Dr. Priya Sharma', specialty: 'Cardiologist', phone: '+91 98765 43211', address: 'Max Heart Center, Saket, New Delhi', rating: 4.9, available: true, experience: 20, lat: 28.5244, lng: 77.2066 },
    { id: '3', name: 'Dr. Amit Patel', specialty: 'Orthopedic', phone: '+91 98765 43212', address: 'Fortis Hospital, Vasant Kunj, New Delhi', rating: 4.7, available: false, experience: 12, lat: 28.5200, lng: 77.1500 },
    { id: '4', name: 'Dr. Sunita Reddy', specialty: 'Pediatrician', phone: '+91 98765 43213', address: 'Rainbow Children Hospital, Marathahalli, Bangalore', rating: 4.9, available: true, experience: 18, lat: 12.9516, lng: 77.7010 },
    { id: '5', name: 'Dr. Vikram Singh', specialty: 'Neurologist', phone: '+91 98765 43214', address: 'NIMHANS, Hosur Road, Bangalore', rating: 4.8, available: true, experience: 22, lat: 12.9426, lng: 77.5966 },
    { id: '6', name: 'Dr. Ananya Gupta', specialty: 'Dermatologist', phone: '+91 98765 43215', address: 'Skin Care Clinic, Andheri West, Mumbai', rating: 4.6, available: true, experience: 10, lat: 19.1197, lng: 72.8464 },
    { id: '7', name: 'Dr. Rohit Mehta', specialty: 'Gynecologist', phone: '+91 98765 43216', address: 'Lilavati Hospital, Bandra, Mumbai', rating: 4.9, available: true, experience: 25, lat: 19.0509, lng: 72.8294 },
    { id: '8', name: 'Dr. Kavita Nair', specialty: 'ENT Specialist', phone: '+91 98765 43217', address: 'Amrita Hospital, Kochi, Kerala', rating: 4.7, available: false, experience: 14, lat: 10.0261, lng: 76.3125 },
    { id: '9', name: 'Dr. Suresh Iyer', specialty: 'Ophthalmologist', phone: '+91 98765 43218', address: 'Sankara Nethralaya, Chennai', rating: 4.8, available: true, experience: 16, lat: 13.0569, lng: 80.2425 },
    { id: '10', name: 'Dr. Meera Krishnan', specialty: 'General Physician', phone: '+91 98765 43219', address: 'City Hospital, T. Nagar, Chennai', rating: 4.5, available: true, experience: 8, lat: 13.0418, lng: 80.2341 },
    { id: '11', name: 'Dr. Arjun Rao', specialty: 'Cardiologist', phone: '+91 98765 43220', address: 'Care Hospitals, Banjara Hills, Hyderabad', rating: 4.9, available: true, experience: 19, lat: 17.4156, lng: 78.4347 },
    { id: '12', name: 'Dr. Fatima Sheikh', specialty: 'Pediatrician', phone: '+91 98765 43221', address: 'Cloudnine Hospital, Whitefield, Bangalore', rating: 4.8, available: true, experience: 11, lat: 12.9698, lng: 77.7500 },
    { id: '13', name: 'Dr. Sanjay Verma', specialty: 'Orthopedic', phone: '+91 98765 43222', address: 'AIIMS, Ansari Nagar, New Delhi', rating: 4.9, available: true, experience: 28, lat: 28.5672, lng: 77.2100 },
    { id: '14', name: 'Dr. Lakshmi Menon', specialty: 'Neurologist', phone: '+91 98765 43223', address: 'Aster Medcity, Cheranalloor, Kochi', rating: 4.7, available: true, experience: 13, lat: 10.0159, lng: 76.3086 },
    { id: '15', name: 'Dr. Deepak Chopra', specialty: 'General Physician', phone: '+91 98765 43224', address: 'Medanta Hospital, Sector 38, Gurugram', rating: 4.6, available: false, experience: 17, lat: 28.4395, lng: 77.0266 }
  ];

  if (specialty && specialty !== 'all') {
    return doctors.filter(d => d.specialty === specialty);
  }
  return doctors;
};

// Get all doctor specialties
export const getDoctorSpecialties = (): string[] => {
  return [
    'General Physician',
    'Cardiologist',
    'Orthopedic',
    'Pediatrician',
    'Neurologist',
    'Dermatologist',
    'Gynecologist',
    'ENT Specialist',
    'Ophthalmologist'
  ];
};

// ==================== TRANSLATED PROFILE OPERATIONS ====================

// Save translated profile data
export const saveTranslatedProfile = async (
  odid: string, 
  translations: Record<string, Record<string, string>>
): Promise<void> => {
  try {
    const translationRef = doc(db, 'translations', odid);
    await setDoc(translationRef, {
      odid,
      translations,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving translations:', error);
    throw error;
  }
};

// Get translated profile data
export const getTranslatedProfile = async (
  odid: string
): Promise<Record<string, Record<string, string>> | null> => {
  try {
    const translationRef = doc(db, 'translations', odid);
    const docSnap = await getDoc(translationRef);
    
    if (docSnap.exists()) {
      return docSnap.data().translations;
    }
    return null;
  } catch (error) {
    console.error('Error getting translations:', error);
    return null;
  }
};

// ==================== PROFILE DATA BY UNIQUE ID (FOR QR SCANS) ====================

// Get profile by encoded QR data (for public scan page)
export const getProfileByQRData = async (encodedData: string): Promise<{
  profile: UserProfile | null;
  isExpired: boolean;
  version: number;
}> => {
  try {
    // Decode the QR data
    const decoded = JSON.parse(atob(encodedData));
    const odid = decoded.id;
    const version = decoded.v || 1;
    
    // Check if this version is expired
    const isExpired = await isQRVersionExpired(odid, version);
    
    // Get the profile
    const profile = await getUserProfile(odid);
    
    return { profile, isExpired, version };
  } catch (error) {
    console.error('Error getting profile by QR data:', error);
    return { profile: null, isExpired: false, version: 1 };
  }
};
