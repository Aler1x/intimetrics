import { useEffect, useState, useCallback, useRef } from 'react';
import { eq, desc, between, count } from 'drizzle-orm';
import { db } from './database';
import { activities, type Activity, type NewActivity } from '~/db/schema';
import type { ActivityType } from '~/types';
import * as SQLite from 'expo-sqlite';
import { type EventSubscription } from 'expo-modules-core';
import { type DatabaseChangeEvent } from 'expo-sqlite';

// Hook system for database updates
type UpdateHook = () => void | Promise<void>;
type HookId = string;

class ActivityUpdateHookManager {
  private hooks = new Map<HookId, UpdateHook>();

  addHook(id: HookId, hook: UpdateHook): void {
    this.hooks.set(id, hook);
  }

  removeHook(id: HookId): boolean {
    return this.hooks.delete(id);
  }

  async executeHooks(): Promise<void> {
    const promises = Array.from(this.hooks.values()).map((hook) => {
      try {
        return hook();
      } catch (error) {
        console.error('Error executing update hook:', error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  getHookCount(): number {
    return this.hooks.size;
  }

  clearAllHooks(): void {
    this.hooks.clear();
  }
}

// Global hook manager instance
const hookManager = new ActivityUpdateHookManager();

// Activity functions
const addActivity = async (
  type: ActivityType,
  date: string,
  description: string,
  partner?: string
): Promise<number> => {
  const newActivity: NewActivity = {
    type,
    date,
    description,
    partner: partner || '',
  };

  const result = await db.insert(activities).values(newActivity).returning({ id: activities.id });
  return result[0].id;
};

const removeActivity = async (id: number): Promise<void> => {
  await db.delete(activities).where(eq(activities.id, id));
};

const deleteAllActivities = async (): Promise<void> => {
  await db.delete(activities);
};

const getAllActivities = async (): Promise<Activity[]> => {
  return await db
    .select()
    .from(activities)
    .orderBy(desc(activities.date), desc(activities.createdAt));
};

const getActivitiesByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Activity[]> => {
  return await db
    .select()
    .from(activities)
    .where(between(activities.date, startDate, endDate))
    .orderBy(desc(activities.date), desc(activities.createdAt));
};

const getActivitiesByType = async (type: ActivityType): Promise<Activity[]> => {
  return await db
    .select()
    .from(activities)
    .where(eq(activities.type, type))
    .orderBy(desc(activities.date), desc(activities.createdAt));
};

const getTotalCount = async (): Promise<number> => {
  const result = await db.select({ total: count(activities.id) }).from(activities);
  return Number(result[0]?.total) || 0;
};

const getCountByType = async (type: ActivityType): Promise<number> => {
  const result = await db
    .select({ total: count(activities.id) })
    .from(activities)
    .where(eq(activities.type, type));
  return Number(result[0]?.total) || 0;
};

const getActivityCountsByDate = async (): Promise<Record<string, number>> => {
  const result = await db
    .select({
      date: activities.date,
      count: count(activities.id),
    })
    .from(activities)
    .groupBy(activities.date);

  return result.reduce(
    (acc, { date, count }) => {
      acc[date] = Number(count) || 0;
      return acc;
    },
    {} as Record<string, number>
  );
};

const getActivityCountsByType = async (
  startDate?: string,
  endDate?: string
): Promise<Record<ActivityType, number>> => {
  const query = db
    .select({
      type: activities.type,
      count: count(activities.id),
    })
    .from(activities);

  if (startDate && endDate) {
    query.where(between(activities.date, startDate, endDate));
  }

  const result = await query.groupBy(activities.type);

  const counts: Record<ActivityType, number> = {
    sex: 0,
    cuddle: 0,
    anal: 0,
    vaginal: 0,
    oral: 0,
    masturbation: 0,
    other: 0,
  };

  result.forEach(({ type, count }) => {
    if (type && count) {
      counts[type] = Number(count);
    }
  });

  return counts;
};

// React hook for activities
export function useActivityStore() {
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);
  const dbChangeListenerRef = useRef<EventSubscription | null>(null);

  const refreshActivities = useCallback(async () => {
    if (!initialized) return;
    try {
      const allActivities = await getAllActivities();
      setActivityList(allActivities);
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  }, [initialized]);

  // Database change listener
  const setupDatabaseChangeListener = useCallback(async () => {
    try {
      // Remove existing listener if any
      if (dbChangeListenerRef.current) {
        dbChangeListenerRef.current.remove();
      }

      // Add new database change listener
      const listener = async (event: DatabaseChangeEvent) => {
        if (event.tableName === 'activities') {
          refreshActivities();
          // Execute all registered hooks
          await hookManager.executeHooks();
        }
      };

      dbChangeListenerRef.current = SQLite.addDatabaseChangeListener(listener);
    } catch (error) {
      console.error('Error setting up database change listener:', error);
    }
  }, [refreshActivities]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAndLoad = async () => {
      try {
        setInitialized(true);
        const allActivities = await getAllActivities();
        setActivityList(allActivities);

        // Setup database change listener
        await setupDatabaseChangeListener();
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoad();

    // Cleanup function
    return () => {
      if (dbChangeListenerRef.current) {
        dbChangeListenerRef.current.remove();
      }
    };
  }, [setupDatabaseChangeListener]);

  const addActivityWrapper = useCallback(
    async (type: ActivityType, date: string, description: string, partner?: string) => {
      if (!initialized) return;
      try {
        await addActivity(type, date, description, partner);
        await refreshActivities();
        // Note: Achievement checking should be handled by the component using both stores
      } catch (error) {
        console.error('Error adding activity:', error);
      }
    },
    [initialized, refreshActivities]
  );

  const removeActivityWrapper = useCallback(
    async (id: number) => {
      if (!initialized) return;
      try {
        await removeActivity(id);
        await refreshActivities();
      } catch (error) {
        console.error('Error removing activity:', error);
      }
    },
    [initialized, refreshActivities]
  );

  const deleteAllActivitiesWrapper = useCallback(async () => {
    if (!initialized) return;
    try {
      await deleteAllActivities();
      await refreshActivities();
    } catch (error) {
      console.error('Error deleting all activities:', error);
    }
  }, [initialized, refreshActivities]);

  const getActivitiesByDateWrapper = useCallback(
    async (startDate: string, endDate: string) => {
      if (!initialized) return [];
      try {
        return await getActivitiesByDateRange(startDate, endDate);
      } catch (error) {
        console.error('Error getting activities by date:', error);
        return [];
      }
    },
    [initialized]
  );

  const getActivitiesByTypeWrapper = useCallback(
    async (type: ActivityType) => {
      if (!initialized) return [];
      try {
        return await getActivitiesByType(type);
      } catch (error) {
        console.error('Error getting activities by type:', error);
        return [];
      }
    },
    [initialized]
  );

  const getTotalCountWrapper = useCallback(async () => {
    if (!initialized) return 0;
    try {
      return await getTotalCount();
    } catch (error) {
      console.error('Error getting total count:', error);
      return 0;
    }
  }, [initialized]);

  const getCountByTypeWrapper = useCallback(
    async (type: ActivityType) => {
      if (!initialized) return 0;
      try {
        return await getCountByType(type);
      } catch (error) {
        console.error('Error getting count by type:', error);
        return 0;
      }
    },
    [initialized]
  );

  const getActivityCountsByDateWrapper = useCallback(async () => {
    if (!initialized) return {};
    try {
      return await getActivityCountsByDate();
    } catch (error) {
      console.error('Error getting activity counts by date:', error);
      return {};
    }
  }, [initialized]);

  const getActivityCountsByTypeWrapper = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!initialized)
        return { sex: 0, cuddle: 0, oral: 0, anal: 0, vaginal: 0, masturbation: 0, other: 0 };
      try {
        return await getActivityCountsByType(startDate, endDate);
      } catch (error) {
        console.error('Error getting activity counts by type:', error);
        return {
          sex: 0,
          cuddle: 0,
          oral: 0,
          anal: 0,
          vaginal: 0,
          masturbation: 0,
          other: 0,
        };
      }
    },
    [initialized]
  );

  // Hook management functions
  const addUpdateHook = useCallback((id: HookId, hook: UpdateHook) => {
    hookManager.addHook(id, hook);
  }, []);

  const removeUpdateHook = useCallback((id: HookId) => {
    return hookManager.removeHook(id);
  }, []);

  const getHookCount = useCallback(() => {
    return hookManager.getHookCount();
  }, []);

  const clearAllHooks = useCallback(() => {
    hookManager.clearAllHooks();
  }, []);

  return {
    activities: activityList,
    loading,
    initialized,
    addActivity: addActivityWrapper,
    removeActivity: removeActivityWrapper,
    deleteAllActivities: deleteAllActivitiesWrapper,
    getActivitiesByDate: getActivitiesByDateWrapper,
    getActivitiesByType: getActivitiesByTypeWrapper,
    getTotalCount: getTotalCountWrapper,
    getCountByType: getCountByTypeWrapper,
    getActivityCountsByDate: getActivityCountsByDateWrapper,
    getActivityCountsByType: getActivityCountsByTypeWrapper,
    refreshActivities,
    // Hook management
    addUpdateHook,
    removeUpdateHook,
    getHookCount,
    clearAllHooks,
  };
}

// Export types
export type { Activity, ActivityType };
export type { UpdateHook, HookId };
