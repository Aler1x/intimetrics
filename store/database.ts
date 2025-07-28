import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { DATABASE_NAME } from '~/lib/constants';

import * as schema from '../db/schema';

// Open the database
const expo = openDatabaseSync(DATABASE_NAME);

// Create the drizzle instance
export const db = drizzle(expo, { schema });

// Simple initialization function (migrations are handled in _layout.tsx)
export const initializeDatabase = async () => {
  // Database initialization is handled by migrations in _layout.tsx
  console.log('Database ready');
};
