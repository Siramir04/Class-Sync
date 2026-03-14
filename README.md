# ClassSync

ClassSync is a modern, real-time class management and notification mobile application built with React Native and Expo. It helps university students stay on top of their academic schedules, receive instant updates from class monitors, and manage carryover courses seamlessly.

## 🚀 Features

- **Premium UI Overhaul (v2.4)**: Pixel-perfect redesign following Apple's Human Interface Guidelines.
- **Proximity Attendance Verification**: Automatic, fraud-proof attendance using Bluetooth (BLE) and WiFi proximity.
- **Real-time Notifications**: Get instant push alerts for lecture changes, assignments, tests, and announcements with special high-priority support for important notices.
- **Unified Class Spaces**: Join a "Space" dedicated to your specific level or department.
- **Dynamic Schedule**: A custom 7-day visual timeline showing all your upcoming lectures and events.
- **Carryover Support**: Unique ability to join individual courses from different levels without joining the entire level's space.
- **Role Management**: Monitors can create and manage posts, track read receipts, and manage attendance from a centralized command center.

For more technical details on attendance verification, see [Proximity Attendance Docs](./docs/PROXIMITY_ATTENDANCE.md).

## 🛠 Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **State Management**: Zustand
- **Navigation**: Expo Router (File-based)
- **Backend**: Firebase (Authentication, Firestore)
- **Styling**: Vanilla React Native StyleSheet with custom design tokens

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
   The app is currently configured with a Firebase instance. To use your own:
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication and Firestore.
   - Update `config/firebase.ts` with your credentials.

4. **Run the app**:
   ```bash
   npx expo start
   ```
   Scan the QR code with the **Expo Go** app on your physical device.

## 📱 Screenshots & Media

Access project walkthroughs and design documents in the [walkthrough.md](./walkthrough.md) (if available in your local environment) or check the project documentation artifacts.

## 📄 License

MIT
