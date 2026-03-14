# Proximity Attendance Verification (Phase 3)

ClassSync Phase 3 introduces a secure, proximity-based attendance system designed to prevent student spoofing. It uses a combination of Bluetooth Low Energy (BLE) and WiFi signal matching to ensure students are physically present in the classroom. **Both Monitor and Student interfaces have been redesigned to meet senior Apple UI/UX standards.**

## 🛡️ Three-Tier Verification System

| Tier | Method | Technology | Range | Confidence |
|---|---|---|---|---|
| **Tier 1** | **BLE Beacon** | Bluetooth LE (iBeacon) | ~10m | 🟢 **High** (Same room) |
| **Tier 2** | **WiFi Match** | SSID Comparison | ~30m | 🟡 **Medium** (Same building) |
| **Tier 3** | **Manual Code** | 6-digit PIN | N/A | 🔴 **Low** (Flagged for review) |

---

## 🏗️ Technical Architecture

### 1. Monitor (Broadcaster)
When a Monitor starts a session:
- **BLE Advertising:** The app starts a BLE beacon using `react-native-ble-advertiser`. The beacon's Service UUID is unique to the session.
- **SSID Capture:** The app records the Monitor's current WiFi SSID to facilitate Tier 2 matching.
- **Live Dashboard:** Monitors see a pulsing status indicator when broadcasting is active and can clear "Code only" flags manually.

### 2. Student (Scanner)
When a Student attempts to mark attendance:
- **Sonars Scanning:** The app scans for the specific Service UUID of the session.
- **Auto-Detection:** If the beacon is found with sufficient RSSI, attendance is marked automatically using the encrypted session token.
- **WiFi Fallback:** If BLE fails (e.g., Bluetooth disabled), the app checks if the WiFi SSID matches the Monitor's.
- **Code Fallback:** If all proximity checks fail, the student is prompted for a 6-digit code. These entries are automatically **flagged** in the Monitor's dashboard.

### 3. Background Scanning
Using `expo-task-manager` and `expo-background-fetch`, the app performs best-effort scans (~every 15 mins) for active sessions. If a student walks into a classroom with an active beacon, the app can potentially mark them present without even opening the phone.

---

## ⚙️ Setup & Configuration

### Prerequisites
- **Physical Device:** BLE functions (advertising/scanning) do **not** work on emulators.
- **Permissions:** Android requires `ACCESS_FINE_LOCATION` for Bluetooth scanning.

### Native Configuration
If you modified the BLE libraries or permissions, you MUST run:
```bash
npx expo prebuild --platform android --clean
```

### Android Manifest
Strategic permissions are added within `android/app/src/main/AndroidManifest.xml`:
- `android.permission.BLUETOOTH_SCAN`
- `android.permission.BLUETOOTH_ADVERTISE`
- `android.permission.BLUETOOTH_CONNECT`
- `android.permission.ACCESS_FINE_LOCATION`

---

## 📂 Key Files
- `services/proximityService.ts`: Core BLE/WiFi logic.
- `services/backgroundTask.ts`: Background scanning definition.
- `app/attendance/[sessionId].tsx`: Monitor's live control panel.
- `components/sheets/AttendanceMarkSheet.tsx`: Student's proximity-aware UI.
