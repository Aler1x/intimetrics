import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { DATABASE_NAME } from '~/lib/constants';

import * as schema from '../db/schema';

// Open the database with change listener enabled
const expo = openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
});

// Create the drizzle instance
export const db = drizzle(expo, { schema });

