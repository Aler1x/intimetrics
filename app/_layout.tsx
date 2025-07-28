import { Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@react-navigation/native';
import '~/app/global.css';
import { useColorScheme } from '~/lib/useColorScheme';
import { DefaultTheme } from '~/lib/theme';
import { StatusBar } from 'expo-status-bar';
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';
import { DATABASE_NAME } from '~/lib/constants';
import { ActivityIndicator, View } from 'react-native';
import { Suspense } from 'react';

const expoDb = openDatabaseSync(DATABASE_NAME);

const db = drizzle(expoDb);

export default function Layout() {
  const { isDarkColorScheme } = useColorScheme();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    console.error(error);
  }

  if (!success) {
    return (
      <SafeAreaProvider>
        <ThemeProvider value={isDarkColorScheme ? DefaultTheme : DefaultTheme}>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color={isDarkColorScheme ? 'white' : 'black'} />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <Suspense fallback={
          <View className='flex-1 items-center justify-center bg-background'>
            <ActivityIndicator size='large' color={'white'} />
          </View>
        }>
          <SQLiteProvider databaseName={DATABASE_NAME} useSuspense>
            <StatusBar style={'light'} />
            <Stack screenOptions={{ headerShown: false }}
              initialRouteName='(tabs)'
            >
              <Stack.Screen name='(tabs)' />
              <Stack.Screen name='+not-found' />
            </Stack>
            <PortalHost />
          </SQLiteProvider>
        </Suspense>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
