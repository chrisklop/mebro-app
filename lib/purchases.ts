import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API keys - replace with your actual keys from RevenueCat dashboard
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'your-ios-key';
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'your-android-key';

export type SubscriptionTier = 'free' | 'plus' | 'pro';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  willRenew: boolean;
}

let isConfigured = false;

export async function initPurchases(userId?: string): Promise<void> {
  if (isConfigured) return;

  try {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    isConfigured = true;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

export async function loginUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Failed to log in to RevenueCat:', error);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to log out from RevenueCat:', error);
  }
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return parseCustomerInfo(customerInfo);
  } catch (error) {
    console.error('Failed to get subscription info:', error);
    return { tier: 'free', isActive: false, willRenew: false };
  }
}

function parseCustomerInfo(customerInfo: CustomerInfo): SubscriptionInfo {
  const entitlements = customerInfo.entitlements.active;

  if (entitlements['pro']) {
    return {
      tier: 'pro',
      isActive: true,
      expiresAt: entitlements['pro'].expirationDate || undefined,
      willRenew: !entitlements['pro'].willRenew === false,
    };
  }

  if (entitlements['plus']) {
    return {
      tier: 'plus',
      isActive: true,
      expiresAt: entitlements['plus'].expirationDate || undefined,
      willRenew: !entitlements['plus'].willRenew === false,
    };
  }

  return { tier: 'free', isActive: false, willRenew: false };
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null) {
      return offerings.current.availablePackages;
    }

    return [];
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error: any) {
    // User cancelled
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (error: any) {
    return { success: false, error: error.message || 'Restore failed' };
  }
}

// Helper to get usage limits based on tier
export function getUsageLimits(tier: SubscriptionTier): { daily: number } {
  switch (tier) {
    case 'pro':
      return { daily: 150 };
    case 'plus':
      return { daily: 50 };
    case 'free':
    default:
      return { daily: 15 };
  }
}

// Get price string for display
export function getPriceString(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}
