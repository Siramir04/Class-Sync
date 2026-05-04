import BleAdvertiser from 'react-native-ble-advertiser';
import BleManager from 'react-native-ble-manager';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import { Platform, NativeEventEmitter, NativeModules, PermissionsAndroid } from 'react-native';
import { AttendanceBeacon, ProximityScanResult, AttendanceSession } from '../types';

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

// Company ID for BLE manufacturer data (use Apple's 0x004C for broad compatibility)
const BLE_COMPANY_ID = 0x004C;

// RSSI thresholds for signal strength classification
const RSSI_STRONG = -65;   // Very close (same room, near Monitor)
const RSSI_MEDIUM = -80;   // Same room but far
const RSSI_WEAK   = -90;   // Edge of range — prompt to move closer

// Keep track of active broadcast to ensure cleanup
let activeBroadcastUUID: string | null = null;

// ─────────────────────────────────────────
// PERMISSION REQUESTS
// ─────────────────────────────────────────

export const requestProximityPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
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

    const results = await PermissionsAndroid.requestMultiple(permissions);

    const allGranted = Object.values(results).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED
    );

    if (allGranted) {
      // Check if Location Services are actually ON (required for SSID and Scanning)
      const locationEnabled = await Location.hasServicesEnabledAsync();
      return locationEnabled;
    }

    return false;
  }
  return true;
};

// ─────────────────────────────────────────
// MONITOR — BROADCAST BEACON
// ─────────────────────────────────────────

export const startBeaconBroadcast = async (beacon: AttendanceBeacon): Promise<void> => {
  const hasPermission = await requestProximityPermissions();
  if (!hasPermission) throw new Error('Bluetooth or Location services are disabled');

  // Cleanup any previous broadcast before starting new one
  if (activeBroadcastUUID) {
    await stopBeaconBroadcast(activeBroadcastUUID);
  }

  // Encode sessionId into manufacturer data
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

  activeBroadcastUUID = beacon.serviceUUID;
};

export const stopBeaconBroadcast = async (serviceUUID: string): Promise<void> => {
  try {
    await (BleAdvertiser as any).stopBroadcast(serviceUUID);
    if (activeBroadcastUUID === serviceUUID) {
        activeBroadcastUUID = null;
    }
  } catch (e) {
    console.warn('Stop broadcast error:', e);
  }
};

/**
 * Emergency stop for all broadcasts, useful for app state changes or logouts
 */
export const stopAllBroadcasts = async (): Promise<void> => {
    if (activeBroadcastUUID) {
        await stopBeaconBroadcast(activeBroadcastUUID);
    }
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
  // Check location services first - absolutely required for SSID on Android
  const locationEnabled = await Location.hasServicesEnabledAsync();
  if (!locationEnabled) {
      return { ssid: null };
  }

  const networkState = await Network.getNetworkStateAsync();
  
  if (!networkState.isConnected || networkState.type !== Network.NetworkStateType.WIFI) {
    return { ssid: null };
  }

  const ssid = (networkState as any).ssid;

  // Handle common hidden or unknown SSID cases
  if (!ssid || ssid === '<unknown ssid>' || ssid === '0x') {
      return { ssid: null };
  }

  return { ssid };
};

export const matchWifiNetworks = async (
  monitorSsid: string | null
): Promise<ProximityScanResult> => {
  if (!monitorSsid || monitorSsid === '<unknown ssid>') return { detected: false };

  const studentWifi = await getWifiInfo();
  
  if (!studentWifi.ssid) return { detected: false };

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

  if (bleResult.detected) return bleResult;
  if (wifiResult.detected) return wifiResult;
  return { detected: false };
};

export const rssiToSignalBars = (rssi: number): number => {
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
  stopAllBroadcasts,
  scanForBeacon,
  getWifiInfo,
  matchWifiNetworks,
  checkProximity,
  rssiToSignalBars,
  rssiToMessage,
};
