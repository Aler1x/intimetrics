import { useEffect, useState, useCallback, useRef } from 'react';
import { eq, desc, between, sum, count } from 'drizzle-orm';
import { db, initializeDatabase } from './database';
import {
  activities,
  partners,
  type Activity,
  type Partner,
  type NewActivity,
  type NewPartner,
} from '~/db/schema';
import type { ListPartner, ActivityType, RelationshipType } from '~/types';

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

// Partner functions
const addPartner = async (name: string, relationshipType?: RelationshipType): Promise<number> => {
  const newPartner: NewPartner = {
    name,
    relationshipType: relationshipType as RelationshipType | null,
  };

  const result = await db.insert(partners).values(newPartner).returning({ id: partners.id });
  return result[0].id;
};

const getAllPartners = async (): Promise<ListPartner[]> => {
  const result = await db
    .select({
      id: partners.id,
      name: partners.name,
      relationshipType: partners.relationshipType,
      createdAt: partners.createdAt,
      activityCount: count(activities.id),
    })
    .from(partners)
    .leftJoin(activities, eq(partners.name, activities.partner))
    .groupBy(partners.id)
    .orderBy(desc(partners.createdAt));

  return result;
};

const removePartner = async (id: number): Promise<void> => {
  await db.delete(partners).where(eq(partners.id, id));
};

const updatePartner = async (
  id: number,
  name: string,
  relationshipType?: RelationshipType
): Promise<void> => {
  await db
    .update(partners)
    .set({
      name,
      relationshipType: relationshipType as RelationshipType | null,
    })
    .where(eq(partners.id, id));
};

// React hook for activities
export function useActivityStore() {
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAndLoad = async () => {
      try {
        await initializeDatabase();
        setInitialized(true);
        const allActivities = await getAllActivities();
        setActivityList(allActivities);
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoad();
  }, []);

  const refreshActivities = useCallback(async () => {
    if (!initialized) return;
    try {
      const allActivities = await getAllActivities();
      setActivityList(allActivities);
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  }, [initialized]);

  const addActivityWrapper = useCallback(
    async (type: ActivityType, date: string, description: string, partner?: string) => {
      if (!initialized) return;
      try {
        await addActivity(type, date, description, partner);
        await refreshActivities();
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
  };
}

// React hook for partners
export function usePartnersStore() {
  const [partnerList, setPartnerList] = useState<ListPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAndLoad = async () => {
      try {
        await initializeDatabase();
        setInitialized(true);
        const allPartners = await getAllPartners();
        setPartnerList(allPartners);
      } catch (error) {
        console.error('Error initializing partners:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoad();
  }, []);

  const refreshPartners = useCallback(async () => {
    if (!initialized) return;
    try {
      const allPartners = await getAllPartners();
      setPartnerList(allPartners);
    } catch (error) {
      console.error('Error refreshing partners:', error);
    }
  }, [initialized]);

  const addPartnerWrapper = useCallback(
    async (name: string, relationshipType?: RelationshipType) => {
      if (!initialized) return;
      try {
        await addPartner(name, relationshipType);
        await refreshPartners();
      } catch (error) {
        console.error('Error adding partner:', error);
      }
    },
    [initialized, refreshPartners]
  );

  const removePartnerWrapper = useCallback(
    async (id: number) => {
      if (!initialized) return;
      try {
        await removePartner(id);
        await refreshPartners();
      } catch (error) {
        console.error('Error removing partner:', error);
      }
    },
    [initialized, refreshPartners]
  );

  const updatePartnerWrapper = useCallback(
    async (id: number, name: string, relationshipType?: RelationshipType) => {
      if (!initialized) return;
      try {
        await updatePartner(id, name, relationshipType);
        await refreshPartners();
      } catch (error) {
        console.error('Error updating partner:', error);
      }
    },
    [initialized, refreshPartners]
  );

  return {
    partners: partnerList,
    loading,
    initialized,
    addPartner: addPartnerWrapper,
    removePartner: removePartnerWrapper,
    updatePartner: updatePartnerWrapper,
    refreshPartners,
  };
}

// Export types
export type { Activity, Partner, ActivityType };
