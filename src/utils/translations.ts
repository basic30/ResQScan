// ============================================
// ResQScan Translation System
// Supports English and Hindi
// ============================================

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Navbar
    tagline: "Safety That Travels With You",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    dashboard: "Dashboard",
    home: "Home",

    // Home Page
    heroTitle: "Instant Medical Access",
    heroTitleHighlight: "When Every Second Matters.",
    heroSubtitle: "Store your critical medical information and generate a QR code that can be scanned during emergencies to instantly display life-saving data.",
    ctaButton: "Create Your Emergency QR",
    learnMore: "Learn More",

    // Features
    feature1Title: "Secure Medical Profile",
    feature1Desc: "Store your critical medical information securely with encrypted access control.",
    feature2Title: "Instant QR Access",
    feature2Desc: "Generate a unique QR code that displays your medical info instantly when scanned.",
    feature3Title: "Emergency Ready",
    feature3Desc: "High-contrast, fast-loading emergency page optimized for first responders.",
    feature4Title: "Blood Donor Network",
    feature4Desc: "Connect with blood donors in your network during critical emergencies.",
    feature5Title: "Multi-Language",
    feature5Desc: "Access emergency info in English and Hindi for wider accessibility.",
    feature6Title: "PDF Emergency Card",
    feature6Desc: "Download a professional emergency card with QR code for your wallet.",

    // How It Works
    howItWorks: "How It Works",
    step1Title: "Create Profile",
    step1Desc: "Sign up and fill in your medical information securely.",
    step2Title: "Generate QR",
    step2Desc: "Get a unique QR code linked to your emergency info.",
    step3Title: "Stay Protected",
    step3Desc: "Carry your QR card — scannable in any emergency.",

    // Stats
    statsProtected: "Lives Protected",
    statsQR: "QR Codes Generated",
    statsLanguages: "Languages Supported",
    statsDonors: "Blood Donors",

    // Auth
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your full name",
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to access your emergency dashboard",
    signupTitle: "Create Account",
    signupSubtitle: "Join ResQScan and protect yourself today",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    loginButton: "Sign In",
    signupButton: "Create Account",
    orContinue: "Or continue with",

    // Dashboard
    profileTab: "Profile",
    qrCodeTab: "QR Code",
    donorSearchTab: "Donors",
    scanHistoryTab: "Scans",
    hospitalsTab: "Hospitals",
    welcomeBack: "Welcome back",

    // Profile Fields
    fullName: "Full Name",
    age: "Age",
    bloodGroup: "Blood Group",
    selectBloodGroup: "Select Blood Group",
    allergies: "Allergies",
    allergiesPlaceholder: "e.g., Penicillin, Peanuts, Latex",
    chronicConditions: "Chronic Conditions",
    chronicConditionsPlaceholder: "e.g., Diabetes, Asthma, Hypertension",
    currentMedications: "Current Medications",
    currentMedicationsPlaceholder: "e.g., Metformin 500mg, Aspirin",
    emergencyContactName: "Emergency Contact Name",
    emergencyContactPhone: "Emergency Contact Phone",
    emergencyContactRelation: "Emergency Contact Relation",
    insuranceProvider: "Insurance Provider",
    doctorName: "Doctor Name",
    emergencyPin: "Emergency PIN",
    emergencyPinPlaceholder: "4-6 digit PIN for private data",
    bloodDonor: "Register as Blood Donor",
    bloodDonorYes: "Yes, I'm a blood donor",
    saveProfile: "Save Profile",
    profileSaved: "Profile saved successfully!",
    deleteAccount: "Delete Account",
    deleteConfirm: "Are you sure? This action cannot be undone.",
    optional: "Optional",

    // QR Code
    generateQR: "Generate QR Code",
    downloadPNG: "Download PNG",
    downloadPDF: "Download PDF Card",
    generatingQR: "Generating Secure Medical QR...",
    regenerateQR: "Regenerate QR",
    qrReady: "Your QR Code is Ready",
    qrDescription: "Print this QR code or save it to your phone. When scanned, it will display your emergency medical information.",
    noProfileQR: "Please complete your profile first to generate a QR code.",
    shareQR: "Share QR Code",

    // Emergency Page
    emergencyTitle: "EMERGENCY MEDICAL INFORMATION",
    emergencySubtitle: "Critical medical data for emergency responders",
    disclaimer: "⚠ This information is user-provided and intended for emergency reference only. Always verify with the patient or their physician when possible.",
    callEmergencyContact: "📞 Call Emergency Contact",
    findHospitals: "🏥 Find Nearby Hospitals",
    enterPin: "Enter PIN to unlock additional information",
    unlock: "Unlock",
    patientInfo: "Patient Information",
    medicalInfo: "Medical Information",
    emergencyContact: "Emergency Contact",
    additionalInfo: "Additional Information",
    relationship: "Relationship",
    noData: "No emergency data found. This QR code may be invalid.",

    // Donor Search
    searchByBloodGroup: "Search by Blood Group",
    donorDisclaimer: "⚠ Contact only in genuine emergencies. Misuse may lead to account suspension.",
    noDonorsFound: "No donors found for this blood group.",
    contactDonor: "Contact",
    donorAvailable: "donors available",

    // Scan History
    totalScans: "Total Scans",
    scanDate: "Date & Time",
    noScans: "No scans recorded yet. Share your QR code to start tracking.",
    lastScanned: "Last Scanned",
    scanActivity: "Scan Activity",

    // SOS
    sosButton: "🆘 SOS Emergency Call",
    sosDescription: "Tap to call your emergency contact immediately",

    // Hospitals
    findNearby: "Find Nearby Hospitals",
    hospitalsDesc: "Click below to search for hospitals near your current location using Google Maps.",
    openMaps: "Open Google Maps",
    emergencyNumbers: "Emergency Numbers",
    ambulance: "Ambulance",
    police: "Police",
    fire: "Fire",

    // Footer
    footerDesc: "Emergency Medical QR Card System. Your safety, always accessible.",
    footerRights: "All rights reserved.",
    madeWith: "Made with ❤️ for saving lives",
  },

  hi: {
    // Navbar
    tagline: "सुरक्षा जो आपके साथ चलती है",
    login: "लॉग इन",
    signup: "साइन अप",
    logout: "लॉग आउट",
    dashboard: "डैशबोर्ड",
    home: "होम",

    // Home Page
    heroTitle: "तत्काल चिकित्सा पहुंच",
    heroTitleHighlight: "जब हर सेकंड मायने रखता है।",
    heroSubtitle: "अपनी महत्वपूर्ण चिकित्सा जानकारी संग्रहीत करें और एक QR कोड बनाएं जिसे आपातकाल में स्कैन किया जा सके।",
    ctaButton: "अपना आपातकालीन QR बनाएं",
    learnMore: "और जानें",

    // Features
    feature1Title: "सुरक्षित मेडिकल प्रोफाइल",
    feature1Desc: "अपनी चिकित्सा जानकारी सुरक्षित रूप से एन्क्रिप्टेड एक्सेस के साथ संग्रहीत करें।",
    feature2Title: "तत्काल QR एक्सेस",
    feature2Desc: "एक अद्वितीय QR कोड बनाएं जो स्कैन होने पर आपकी मेडिकल जानकारी दिखाता है।",
    feature3Title: "आपातकाल के लिए तैयार",
    feature3Desc: "प्राथमिक चिकित्सकों के लिए अनुकूलित उच्च-कंट्रास्ट, तेज़-लोडिंग आपातकालीन पेज।",
    feature4Title: "रक्तदाता नेटवर्क",
    feature4Desc: "आपातकाल के दौरान अपने नेटवर्क में रक्तदाताओं से जुड़ें।",
    feature5Title: "बहु-भाषा",
    feature5Desc: "व्यापक पहुंच के लिए अंग्रेजी और हिंदी में आपातकालीन जानकारी।",
    feature6Title: "PDF आपातकालीन कार्ड",
    feature6Desc: "अपने बटुए के लिए QR कोड के साथ एक पेशेवर आपातकालीन कार्ड डाउनलोड करें।",

    // How It Works
    howItWorks: "यह कैसे काम करता है",
    step1Title: "प्रोफाइल बनाएं",
    step1Desc: "साइन अप करें और अपनी मेडिकल जानकारी सुरक्षित रूप से भरें।",
    step2Title: "QR जनरेट करें",
    step2Desc: "अपनी आपातकालीन जानकारी से जुड़ा एक अद्वितीय QR कोड प्राप्त करें।",
    step3Title: "सुरक्षित रहें",
    step3Desc: "अपना QR कार्ड साथ रखें — किसी भी आपातकाल में स्कैन करने योग्य।",

    // Stats
    statsProtected: "सुरक्षित जीवन",
    statsQR: "QR कोड बनाए गए",
    statsLanguages: "भाषाएं समर्थित",
    statsDonors: "रक्तदाता",

    // Auth
    emailLabel: "ईमेल पता",
    emailPlaceholder: "अपना ईमेल दर्ज करें",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "अपना पासवर्ड पुनः दर्ज करें",
    nameLabel: "पूरा नाम",
    namePlaceholder: "अपना पूरा नाम दर्ज करें",
    loginTitle: "वापसी पर स्वागत है",
    loginSubtitle: "अपने आपातकालीन डैशबोर्ड तक पहुंचने के लिए साइन इन करें",
    signupTitle: "खाता बनाएं",
    signupSubtitle: "ResQScan से जुड़ें और आज ही अपनी सुरक्षा करें",
    noAccount: "खाता नहीं है?",
    hasAccount: "पहले से खाता है?",
    loginButton: "साइन इन करें",
    signupButton: "खाता बनाएं",
    orContinue: "या जारी रखें",

    // Dashboard
    profileTab: "प्रोफाइल",
    qrCodeTab: "QR कोड",
    donorSearchTab: "रक्तदाता",
    scanHistoryTab: "स्कैन",
    hospitalsTab: "अस्पताल",
    welcomeBack: "वापसी पर स्वागत है",

    // Profile Fields
    fullName: "पूरा नाम",
    age: "उम्र",
    bloodGroup: "रक्त समूह",
    selectBloodGroup: "रक्त समूह चुनें",
    allergies: "एलर्जी",
    allergiesPlaceholder: "जैसे, पेनिसिलिन, मूंगफली",
    chronicConditions: "पुरानी बीमारियां",
    chronicConditionsPlaceholder: "जैसे, मधुमेह, अस्थमा",
    currentMedications: "वर्तमान दवाइयां",
    currentMedicationsPlaceholder: "जैसे, मेटफॉर्मिन 500mg",
    emergencyContactName: "आपातकालीन संपर्क नाम",
    emergencyContactPhone: "आपातकालीन संपर्क फ़ोन",
    emergencyContactRelation: "आपातकालीन संपर्क संबंध",
    insuranceProvider: "बीमा प्रदाता",
    doctorName: "डॉक्टर का नाम",
    emergencyPin: "आपातकालीन PIN",
    emergencyPinPlaceholder: "निजी डेटा के लिए 4-6 अंकों का PIN",
    bloodDonor: "रक्तदाता के रूप में पंजीकरण करें",
    bloodDonorYes: "हां, मैं रक्तदाता हूं",
    saveProfile: "प्रोफाइल सहेजें",
    profileSaved: "प्रोफाइल सफलतापूर्वक सहेजी गई!",
    deleteAccount: "खाता हटाएं",
    deleteConfirm: "क्या आप सुनिश्चित हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
    optional: "वैकल्पिक",

    // QR Code
    generateQR: "QR कोड बनाएं",
    downloadPNG: "PNG डाउनलोड करें",
    downloadPDF: "PDF कार्ड डाउनलोड करें",
    generatingQR: "सुरक्षित मेडिकल QR बन रहा है...",
    regenerateQR: "QR पुनः बनाएं",
    qrReady: "आपका QR कोड तैयार है",
    qrDescription: "इस QR कोड को प्रिंट करें या अपने फ़ोन में सहेजें। स्कैन करने पर यह आपकी आपातकालीन चिकित्सा जानकारी दिखाएगा।",
    noProfileQR: "QR कोड बनाने के लिए कृपया पहले अपनी प्रोफाइल पूरी करें।",
    shareQR: "QR कोड साझा करें",

    // Emergency Page
    emergencyTitle: "आपातकालीन चिकित्सा जानकारी",
    emergencySubtitle: "आपातकालीन उत्तरदाताओं के लिए महत्वपूर्ण चिकित्सा डेटा",
    disclaimer: "⚠ यह जानकारी उपयोगकर्ता द्वारा प्रदान की गई है और केवल आपातकालीन संदर्भ के लिए है।",
    callEmergencyContact: "📞 आपातकालीन संपर्क को कॉल करें",
    findHospitals: "🏥 नज़दीकी अस्पताल खोजें",
    enterPin: "अतिरिक्त जानकारी अनलॉक करने के लिए PIN दर्ज करें",
    unlock: "अनलॉक",
    patientInfo: "रोगी की जानकारी",
    medicalInfo: "चिकित्सा जानकारी",
    emergencyContact: "आपातकालीन संपर्क",
    additionalInfo: "अतिरिक्त जानकारी",
    relationship: "संबंध",
    noData: "कोई आपातकालीन डेटा नहीं मिला। यह QR कोड अमान्य हो सकता है।",

    // Donor Search
    searchByBloodGroup: "रक्त समूह से खोजें",
    donorDisclaimer: "⚠ केवल वास्तविक आपातकाल में संपर्क करें।",
    noDonorsFound: "इस रक्त समूह के लिए कोई दाता नहीं मिला।",
    contactDonor: "संपर्क करें",
    donorAvailable: "दाता उपलब्ध",

    // Scan History
    totalScans: "कुल स्कैन",
    scanDate: "तिथि और समय",
    noScans: "अभी तक कोई स्कैन रिकॉर्ड नहीं। ट्रैकिंग शुरू करने के लिए अपना QR कोड साझा करें।",
    lastScanned: "अंतिम स्कैन",
    scanActivity: "स्कैन गतिविधि",

    // SOS
    sosButton: "🆘 SOS आपातकालीन कॉल",
    sosDescription: "अपने आपातकालीन संपर्क को तुरंत कॉल करने के लिए टैप करें",

    // Hospitals
    findNearby: "नज़दीकी अस्पताल खोजें",
    hospitalsDesc: "Google Maps का उपयोग करके अपने वर्तमान स्थान के पास अस्पतालों की खोज करने के लिए नीचे क्लिक करें।",
    openMaps: "Google Maps खोलें",
    emergencyNumbers: "आपातकालीन नंबर",
    ambulance: "एम्बुलेंस",
    police: "पुलिस",
    fire: "दमकल",

    // Footer
    footerDesc: "आपातकालीन चिकित्सा QR कार्ड प्रणाली। आपकी सुरक्षा, हमेशा सुलभ।",
    footerRights: "सर्वाधिकार सुरक्षित।",
    madeWith: "जीवन बचाने के लिए ❤️ से बनाया गया",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
