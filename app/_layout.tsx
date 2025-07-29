import { Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@react-navigation/native';
import '~/app/global.css';
import { useColorScheme } from '~/lib/useColorScheme';
import { DefaultTheme } from '~/lib/theme';
import { StatusBar } from 'expo-status-bar';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, SQLiteProvider } from 'expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';
import { DATABASE_NAME } from '~/lib/constants';
import { ActivityIndicator, View } from 'react-native';
import { Suspense, useMemo } from 'react';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

const expoDb = openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
});

const db = drizzle(expoDb);

export default function Layout() {
  const { isDarkColorScheme } = useColorScheme();
  const { success, error } = useMigrations(db, migrations);
  useDrizzleStudio(expoDb);

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => DefaultTheme, []);

  if (error) {
    console.error(error);
  }

  if (!success) {
    return (
      <SafeAreaProvider>
        <ThemeProvider value={theme}>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDarkColorScheme ? 'white' : 'black'} />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <Suspense
          fallback={
            <View className="flex-1 items-center justify-center bg-background">
              <ActivityIndicator size="large" color={'white'} />
            </View>
          }>
          <SQLiteProvider databaseName={DATABASE_NAME} useSuspense>
            <StatusBar style={'light'} />
            <Stack screenOptions={{ headerShown: false, animation: 'none' }} initialRouteName="(tabs)">
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <PortalHost />
          </SQLiteProvider>
        </Suspense>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
