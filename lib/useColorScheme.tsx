import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useMemo } from 'react';

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      colorScheme: colorScheme ?? 'dark',
      isDarkColorScheme: colorScheme === 'dark',
      setColorScheme,
      toggleColorScheme,
    }),
    [colorScheme, setColorScheme, toggleColorScheme]
  );
}
