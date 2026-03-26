# Proximity Attendance Verification (ClassSync v2.5+)

ClassSync implements a robust, hybrid attendance verification system designed to minimize fraud (spoofing) while maintaining high usability. The system uses a multi-layered verification approach: **Bluetooth (BLE) Proximity**, **Dynamic QR Codes**, and **6-Digit Real-Time Access Codes**.

## 1. Core Verification Methods

### A. Bluetooth Low Energy (BLE) Verification
- **Mechanism**: The Monitor's device acts as a BLE Advertiser during a live session.
- **Student Side**: The student's app scans for the Monitor's unique `sessionId` signal.
- **Verification**: If the signal is detected within a certain RSSI threshold (approximately 5-10 meters), proximity is confirmed.
- **Benefit**: Extremely difficult to spoof compared to GPS-only solutions, as BLE requires physical closeness.

### B. Dynamic QR Code Tracking
- **Mechanism**: The Monitor's app generates a dynamic QR base64 token.
- **Rotation**: The token and QR image refresh automatically every **60 seconds**.
- **Student Side**: Students scan the QR code from the Monitor's screen.
- **Verification**: The token is validated against the real-time session state in Firestore. If the QR was scanned but belongs to an expired rotation, the join is rejected.
- **Benefit**: Prevents students from taking a photo of the QR code and sharing it with absent classmates.

### C. 6-Digit Real-Time Access Code
- **Mechanism**: Each session generates a unique 6-digit PIN.
- **Rotation**: Refreshes synchronously with the QR code (every 60s).
- **Fallback**: Students with older devices or scanning issues can manually enter this code.
- **Benefit**: Provides a reliable alternative for cases where cameras or Bluetooth fail.

---

## 2. Technical Stack

- **Bluetooth**: `react-native-ble-manager` and `react-native-ble-advertiser`.
- **QR Generation**: `react-native-qrcode-svg`.
- **State Management**: Firestore Real-time Snapshots.
- **Security Logic**: `proximityService.ts` and `attendanceService.ts`.

---

## 3. The Monitor's Workflow

1.  **Start Session**: Monitor selects a course and touches "Start Attendance".
2.  **Display QR**: The Monitor presents their device to the class. The QR and code rotate every minute.
3.  **Live List**: The Monitor sees students' names and usernames pop up in real-time as they scan.
4.  **Close Session**: Monitor ends the session. Attendance is calculated, and a summary is saved.
5.  **Export**: Monitor exports the session (or course-wide totals) to Excel.

---

## 4. Anti-Fraud Measures

1.  **Proximity Requirement**: Bluetooth ensures the student is physically near the Monitor.
2.  **Device Fingerprinting**: Prevents multiple accounts from joining from a single device (Hardware ID mapping).
3.  **Dynamic Tokens**: Time-limited QR codes make "off-site scanning" impossible.
4.  **Admin Overrides**: Monitors have the final authority to manually mark a student "Present" in rare cases of technical failure.

---

> [!IMPORTANT]
> **Bluetooth Permissions**: Both Monitor and Student MUST grant Bluetooth and Location permissions (required for scanning BLE) to use the proximity features. If permissions are denied, the system falls back to QR/Code verification only.

> [!TIP]
> **Connectivity**: This system is designed for high-density environments. It performs best in a standard classroom or lecture hall (5-20 meters). It is NOT recommended for remote or widely distributed attendance.
