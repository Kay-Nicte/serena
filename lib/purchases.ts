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
  Purchases.configure({ apiKey: API_KEY });
  initialized = true;
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(pkg: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);

  // Determine premium_until from the active entitlement
  const entitlement = customerInfo.entitlements.active['Serenade Pro'];
  if (entitlement) {
    const premiumUntil = entitlement.expirationDate;

    // Update Supabase immediately (webhook is the backup)
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
  await Purchases.logIn(userId);
}

export async function logoutUser() {
  if (!initialized) return;
  await Purchases.logOut();
}
