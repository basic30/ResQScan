# 🚑 ResQScan — Safety That Travels With You

ResQScan is a secure, QR-based emergency medical identity system designed to provide instant access to critical life-saving information during medical emergencies.

In high-pressure situations such as road accidents, sudden collapses, or trauma cases, doctors often operate without access to essential patient information. ResQScan bridges this gap by enabling structured, secure, and instant emergency data access — without requiring app installation or login during emergencies. 

---

## 👥 Team

**Team Apex** 

---

# 🧠 Problem Statement

During medical emergencies, first responders often do not have access to:

- Blood group  
- Severe drug or food allergies  
- Chronic medical conditions (diabetes, heart disease, asthma, etc.)  
- Current medications  
- Emergency contact details  

In the **Golden Hour**, even a delay of a few minutes can significantly impact survival and treatment outcomes.

The absence of structured, instantly accessible medical identity information creates unnecessary uncertainty in high-pressure scenarios.

---

# 💡 Our Solution

ResQScan is a privacy-first, QR-based emergency medical identity system.

Users:

1. Log in securely using email authentication.
2. Create a digital emergency medical profile.
3. Generate a unique secure QR code.

When scanned, the QR instantly opens a minimal, high-contrast emergency interface displaying only essential medical information.

No app installation.  
No passwords required for responders.  
No delay.  

Just scan and access.

---

# 🔐 Privacy-First Architecture

ResQScan follows strict minimal data exposure principles:

- Each profile is linked to a randomized, non-sequential secure token (not predictable IDs).
- Database document IDs are never exposed.
- Only essential emergency data is publicly accessible.
- Sensitive or non-critical information is never displayed.
- QR codes can be revoked or regenerated instantly.
- Optional scan logging captures timestamp and location (with user consent).
- Architecture supports future role-based medical access integration.

The system displays only what is necessary to save a life.

---

# 🏗️ Tech Stack

- **Frontend:** HTML, Tailwind CSS  
- **Language:** TypeScript  
- **Animations:** Framer Motion  
- **Backend & Database:** Firebase Firestore  
- **Authentication:** Firebase Authentication (Email-based)  
- **QR Generation:** Dynamic route-based QR linking  
- **Maps Integration:** Google Maps (Nearby Hospitals & Doctors)  
- **AI Chatbot:** Gemini 2.5 Flash (Health-restricted assistant)  

---

# ⚙️ How It Works (Architecture Flow)

QR Code  
→ URL with Secure Token  
→ Token Extraction  
→ Firestore Lookup  
→ Emergency Data Fetch  
→ High-Contrast Emergency Interface Render  

This architecture ensures platform independence and universal device compatibility.

---

# ✨ Key Features

## 🔑 Authentication
- Secure email login via Firebase Authentication
- Dashboard access after authentication

## 📝 Emergency Profile Management
Users can store:
- Blood group  
- Severe allergies  
- Chronic conditions  
- Current medications  
- Emergency contact  

## 🔳 Secure QR Generation
- Unique randomized token per user
- QR downloadable as PNG
- Printable emergency card support
- QR revoke/regenerate capability

## 📱 Emergency Scan Interface
- High-contrast UI
- Large readable fonts
- One-tap emergency contact call
- One-tap SMS trigger
- Timestamp & optional location logging
- One-tap nearby hospitals via Google Maps
- Doctor availability viewing

## 🌍 Multi-Language Support
- Language toggle (English / Hindi)
- Static translation mapping
- No external translation APIs required

## 🤖 HealthBot (AI Assistant)
- Powered by **Gemini 2.5 Flash**
- Restricted strictly to health-related queries
- Provides awareness-level guidance
- Does NOT replace professional medical advice

## 📴 Offline Backup
- Emergency PDF download option
- Printable emergency card for physical carry

---

# 🎨 Accessibility & Usability

ResQScan is designed specifically for crisis environments:

- High-contrast emergency interface
- Large-font readability
- Minimal UI clutter
- Cognitive load reduction
- Optional voice read-out mode

---

# 🏢 Real-World Adoption Potential

ResQScan can be deployed in:

- Logistics & delivery companies  
- Industrial factories  
- Schools & colleges  
- Corporate safety systems  
- Public transport workforce  

It can act as a digital emergency preparedness infrastructure.

---

# 💰 Revenue Model

ResQScan follows a scalable B2B-oriented model:

- Institutional safety subscriptions  
- Enterprise workforce deployment  
- Logistics & industrial licensing  
- Premium personal features  
- Government & public health integrations (future scope)  

---

# 🚀 Scalability & Future Scope

- Government health scheme integration  
- Verified hospital extended access layer  
- AI-assisted emergency data prioritization  
- Wearable device integration  
- Institutional dashboards  
- Safety compliance reporting modules  

The modular architecture allows seamless expansion without compromising privacy.

---

# 📂 Project Structure (Example)
```
📁 src/
│
├── 📁 components/      # Reusable UI components (Navbar, Chatbot, Modals)
├── 📁 config/          # Firebase and environment configurations
├── 📁 context/         # React Context (Auth, Language, Theme, Profile)
├── 📁 pages/           # Main application pages (Auth, Dashboard, Emergency, Home)
├── 📁 services/        # Firebase Firestore logic and API calls
├── 📁 utils/           # Helper functions (Storage, Translations, Styling)
│
├── App.tsx             # Root component & routing
└── main.tsx            # Application entry point
```
---

# 🛡️ Security Considerations

- Randomized secure token generation  
- Firestore security rule planning  
- No Aadhaar or sensitive national IDs stored  
- Minimal public exposure  
- QR deactivation system  
- Controlled AI usage boundaries  

---

# 🚧 Challenges Faced

- Balancing instant accessibility with privacy  
- Designing secure token-based routing  
- Preventing predictable ID enumeration  
- Structuring emergency-first UI  
- Implementing scan logging responsibly  
- Restricting AI chatbot to safe medical boundaries  

---

# 🎯 Impact

ResQScan acts as a portable digital medical identity that travels with the individual.

It:

- Reduces uncertainty in emergency care  
- Enables faster medical decisions  
- Improves communication with families  
- Enhances institutional safety preparedness  
- Empowers individuals to control their emergency readiness  

---

# 🏁 Closing

ResQScan is not just a QR generator.

It is a bridge between uncertainty and informed action — when seconds truly matter.

Built with ❤️ by Team Apex !!

**Safety That Travels With You.**
