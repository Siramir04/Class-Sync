# ClassSync 🚀

ClassSync is a modern, real-time class management and notification mobile application built with React Native and Expo. It helps university students stay on top of their academic schedules, receive instant updates from class monitors, and manage carryover courses seamlessly.

## 🌟 Key Features (v2.5+)

- **Premium iOS UI/UX**: Pixel-perfect redesign following Apple's Human Interface Guidelines. Fluid animations and intuitive layouts.
- **Advanced Identity System**: Unified `username`-based student profiles for easier space joining and attendance tracking.
- **Robust RBAC (Role-Based Access Control)**: Tieredly manage spaces with Monitors, Assistant Monitors, Lecturers, and Students.
- **Hybrid Proximity Attendance**: Dynamic QR codes refreshing every 60s, Bluetooth BLE scanning, and 6-digit backup codes.
- **Excel Attendance Reports**: Monitors can instantly export high-quality, aggregated student attendance data to Excel/XLSX.
- **Real-time Notifications**: Instant push alerts for lecture changes, assignments, tests, and announcements with special high-priority support.
- **Dynamic Timeline**: A custom 7-day visual timeline showing all your upcoming lectures and events.
- **Carryover Support**: Unique ability to join individual courses from different levels without joining the entire level's space.

## 📖 Documentation

- [**FINAL YEAR PROJECT**](./docs/FINAL_YEAR_PROJECT.md): Full project documentation, abstract, and system design.
- [**IDENTITY & RBAC Docs**](./docs/IDENTITY_AND_RBAC.md): Deep dive into permissions and roles.
- [**PROXIMITY ATTENDANCE Docs**](./docs/PROXIMITY_ATTENDANCE.md): Details on the anti-fraud attendance verification.

## 🛠 Tech Stack

- **Frontend**: React Native, Expo (SDK 54), TypeScript
- **State Management**: Zustand
- **Navigation**: Expo Router (File-based)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Attendance Logic**: BLE Advertisers & Scanning, JWT-based Dynamic QR
- **Utilities**: `xlsx` (Excel Export), `expo-sharing`, `date-fns`

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Siramir04/Class-Sync.git
   cd Class-Sync/classsync
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Configuration**:
   The app is currently configured with a demo Firebase instance. To use your own:
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication and Firestore.
   - Update `config/firebase.ts` with your credentials.

4. **Run the app**:
   ```bash
   npx expo start
   ```
   Scan the QR code with the **Expo Go** app on your physical device.

## 📱 Project Maintenance

This project follows strict iOS-native design guidelines. All styles use the centralized `constants/colors.ts` and `constants/typography.ts`.

## 🌐 Web Companion Support (v2.6+)

ClassSync now features web support via Expo Web.
- **Stable Routing:** Guaranteed initial route resolution via fallbacks and declarative redirects.
- **Hydration Safety:** Native-only components dynamically wrap to prevent web compilation errors.
- **Backend Health:** REST API connectivity verified; rules and database access fully functional.

## 📄 License

SIMPLR LABS STUDIO
