import { clsx, type ClassValue } from 'clsx';
import { Alert, Platform, ToastAndroid } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showToast(message: string, duration: number = ToastAndroid.LONG) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, duration);
  } else {
    Alert.alert(message);
  }
}
