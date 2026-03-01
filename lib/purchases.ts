import Purchases, {
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

const API_KEY = Platform.select({
  ios: Constants.expoConfig?.extra?.revenueCatAppleKey ?? '',
  android: Constants.expoConfig?.extra?.revenueCatGoogleKey ?? '',
}) as string;

let initialized = false;

export async function initPurchases() {
  if (initialized || !API_KEY) return;
  // Skip configuration with test keys in production builds
  // RevenueCat shows a blocking dialog and kills the app otherwise
  if (API_KEY.startsWith('test_')) return;
  try {
    Purchases.configure({ apiKey: API_KEY });
    initialized = true;
  } catch {
    initialized = false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!initialized) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);

  const entitlement = customerInfo.entitlements.active['Serenade Pro'];
  if (entitlement) {
    const premiumUntil = entitlement.expirationDate;
    await supabase.rpc('activate_premium_purchase', {
      premium_until_ts: premiumUntil,
    });
  }

  return customerInfo;
}

export async function restorePurchases() {
  const customerInfo = await Purchases.restorePurchases();

  const entitlement = customerInfo.entitlements.active['Serenade Pro'];
  if (entitlement) {
    await supabase.rpc('activate_premium_purchase', {
      premium_until_ts: entitlement.expirationDate,
    });
  }

  return customerInfo;
}

export async function identifyUser(userId: string) {
  if (!initialized) return;
  try {
    await Purchases.logIn(userId);
  } catch {
    // Silently fail
  }
}

export async function logoutUser() {
  if (!initialized) return;
  try {
    await Purchases.logOut();
  } catch {
    // Silently fail
  }
}
