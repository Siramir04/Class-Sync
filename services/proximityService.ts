import BleAdvertiser from 'react-native-ble-advertiser';
import BleManager from 'react-native-ble-manager';
import * as Network from 'expo-network';
import { Platform, NativeEventEmitter, NativeModules, PermissionsAndroid, Alert } from 'react-native';
import { AttendanceBeacon, ProximityScanResult, ProximityReading, AttendanceSession, VerificationMethod } from '../types';

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

// Company ID for BLE manufacturer data (use Apple's 0x004C for broad compatibility)
const BLE_COMPANY_ID = 0x004C;

// RSSI thresholds for signal strength classification
const RSSI_STRONG = -65;   // Very close (same room, near Monitor)
const RSSI_MEDIUM = -80;   // Same room but far
const RSSI_WEAK   = -90;   // Edge of range — prompt to move closer

// ─────────────────────────────────────────
// PERMISSION REQUESTS
// ─────────────────────────────────────────

export const requestProximityPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    // Check Android version
    const apiLevel = Platform.Version as number;
    
    const permissions = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ];

    if (apiLevel >= 31) {
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
      );
    }

    const rationale = {
      title: "Location Permission for Attendance",
      message: "ClassSync needs location permission to detect the attendance beacon. This is required by Android for Bluetooth scanning — we don't track your location.",
      buttonPositive: "Grant Permission",
      buttonNegative: "Cancel"
    };

    const results = await PermissionsAndroid.requestMultiple(permissions);

    // Filter to ensure all are granted
    return Object.values(results).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED
    );
  }
  // iOS permissions are handled via Info.plist — return true
  return true;
};

// ─────────────────────────────────────────
// MONITOR — BROADCAST BEACON
// ─────────────────────────────────────────

export const startBeaconBroadcast = async (beacon: AttendanceBeacon): Promise<void> => {
  const hasPermission = await requestProximityPermissions();
  if (!hasPermission) throw new Error('Bluetooth permission denied');

  // Encode sessionId into manufacturer data (first 16 bytes of UUID, hex encoded)
  const sessionBytes = beacon.serviceUUID.replace(/-/g, '').substring(0, 16);

  await BleAdvertiser.setCompanyId(BLE_COMPANY_ID);
  
  await BleAdvertiser.broadcast(
    beacon.serviceUUID,
    [parseInt(sessionBytes.substring(0, 2), 16), parseInt(sessionBytes.substring(2, 4), 16)],
    {
      advertiseMode: 1, // ADVERTISE_MODE_LOW_LATENCY
      txPowerLevel: 3,  // ADVERTISE_TX_POWER_HIGH
      connectable: false,
      includeDeviceName: false,
    }
  );
};

export const stopBeaconBroadcast = async (serviceUUID: string): Promise<void> => {
  await (BleAdvertiser as any).stopBroadcast(serviceUUID);
};

// ─────────────────────────────────────────
// STUDENT — SCAN FOR BEACON
// ─────────────────────────────────────────

export const scanForBeacon = (
  targetUUID: string,
  onDetected?: (rssi: number) => void,
  onNotFound?: () => void,
  timeoutMs: number = 8000
): Promise<ProximityScanResult> => {
  return new Promise(async (resolve) => {
    const hasPermission = await requestProximityPermissions();
    if (!hasPermission) {
      resolve({ detected: false });
      return;
    }

    await BleManager.start({ showAlert: false });

    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    let found = false;

    // Listen for discovered peripherals
    const discoverSubscription = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral: any) => {
        const advertisedUUIDs = peripheral.advertising?.serviceUUIDs ?? [];
        if (advertisedUUIDs.some((uuid: any) => uuid.toLowerCase() === targetUUID.toLowerCase())) {
          found = true;
          const rssi = peripheral.rssi ?? -100;
          onDetected?.(rssi);

          BleManager.stopScan();
          discoverSubscription.remove();

          resolve({
            detected: true,
            method: 'ble',
            rssi,
            signalStrength: rssi >= RSSI_STRONG ? 'strong' : rssi >= RSSI_MEDIUM ? 'medium' : 'weak',
            reading: { method: 'ble', rssi },
          });
        }
      }
    );

    // Start scanning
    await (BleManager as any).scan([targetUUID], timeoutMs / 1000, false);

    // Timeout — beacon not found
    setTimeout(() => {
      if (!found) {
        BleManager.stopScan().catch(() => {});
        discoverSubscription.remove();
        onNotFound?.();
        resolve({ detected: false });
      }
    }, timeoutMs);
  });
};

// ─────────────────────────────────────────
// WIFI MATCHING
// ─────────────────────────────────────────

export const getWifiInfo = async (): Promise<{ ssid: string | null; bssid?: string }> => {
  const networkState = await Network.getNetworkStateAsync();
  
  if (!networkState.isConnected || networkState.type !== Network.NetworkStateType.WIFI) {
    return { ssid: null };
  }

  // expo-network provides SSID on both platforms in some versions
  // Using type assertion to bypass lint if we're sure it exists in the user's environment
  return {
    ssid: (networkState as any).ssid ?? null,
  };
};

export const matchWifiNetworks = async (
  monitorSsid: string | null,
  monitorBssid?: string
): Promise<ProximityScanResult> => {
  if (!monitorSsid) return { detected: false };

  const studentWifi = await getWifiInfo();
  
  if (!studentWifi.ssid) return { detected: false };

  // Match on SSID (same network name = same campus WiFi)
  const ssidMatch = studentWifi.ssid === monitorSsid;

  if (ssidMatch) {
    return {
      detected: true,
      method: 'wifi',
      reading: {
        method: 'wifi',
        ssid: studentWifi.ssid,
        matchedMonitorBssid: false,
      },
    };
  }

  return { detected: false };
};

// ─────────────────────────────────────────
// COMBINED PROXIMITY CHECK (Student side)
// ─────────────────────────────────────────

export const checkProximity = async (
  session: AttendanceSession,
  onBleDetected?: (rssi: number) => void,
  onBleNotFound?: () => void
): Promise<ProximityScanResult> => {
  // Run BLE scan and WiFi check in parallel
  const [bleResult, wifiResult] = await Promise.all([
    scanForBeacon(session.serviceUUID, onBleDetected, onBleNotFound, 8000),
    matchWifiNetworks(session.monitorSsid ?? null),
  ]);

  // Return best result: BLE > WiFi > not detected
  if (bleResult.detected) return bleResult;
  if (wifiResult.detected) return wifiResult;
  return { detected: false };
};

// ─────────────────────────────────────────
// SIGNAL STRENGTH HELPERS
// ─────────────────────────────────────────

export const rssiToSignalBars = (rssi: number): number => {
  // Returns 0–4 bars
  if (rssi >= RSSI_STRONG) return 4;
  if (rssi >= -70) return 3;
  if (rssi >= RSSI_MEDIUM) return 2;
  if (rssi >= RSSI_WEAK) return 1;
  return 0;
};

export const rssiToMessage = (rssi: number): string => {
  if (rssi >= RSSI_STRONG) return "Signal strong — you're good";
  if (rssi >= -70) return "Signal good";
  if (rssi >= RSSI_MEDIUM) return "Move a bit closer";
  return "Move closer to mark attendance";
};

export const proximityService = {
  requestProximityPermissions,
  startBeaconBroadcast,
  stopBeaconBroadcast,
  scanForBeacon,
  getWifiInfo,
  matchWifiNetworks,
  checkProximity,
  rssiToSignalBars,
  rssiToMessage,
};
