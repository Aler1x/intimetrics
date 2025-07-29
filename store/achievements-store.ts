import { useEffect, useState, useCallback, useRef } from 'react';
import { count, eq, desc } from 'drizzle-orm';
import { db } from './database';
import {
  achievements,
  type Achievement,
  type NewAchievement,
  type Activity,
  partners,
  activities,
} from '~/db/schema';
import { checkAchievements } from '~/lib/achievements';
import type { ListPartner } from '~/types';

// Achievement functions
const addAchievement = async (achievementId: string): Promise<number> => {
  const newAchievement: NewAchievement = {
    achievementId,
  };

  const result = await db
    .insert(achievements)
    .values(newAchievement)
    .returning({ id: achievements.id });
  return result[0].id;
};

const getAllAchievements = async (): Promise<Achievement[]> => {
  return await db.select().from(achievements).orderBy(desc(achievements.unlockedAt));
};

const deleteAllAchievements = async (): Promise<void> => {
  await db.delete(achievements);
};

const checkAndUnlockAchievements = async (
  allActivities: Activity[],
  allPartners: ListPartner[]
): Promise<string[]> => {
  const unlockedAchievements = await getAllAchievements();
  const unlockedIds = unlockedAchievements.map((a) => a.achievementId);
  const newAchievements = checkAchievements(allActivities, allPartners, unlockedIds);

  // Add new achievements to database
  for (const achievementId of newAchievements) {
    await addAchievement(achievementId);
  }

  return newAchievements;
};

// React hook for achievements
export function useAchievementsStore() {
  const [achievementsList, setAchievementsList] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAndLoad = async () => {
      try {
        setInitialized(true);
        const allAchievements = await getAllAchievements();
        setAchievementsList(allAchievements);
      } catch (error) {
        console.error('Error initializing achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoad();
  }, []);

  const refreshAchievements = useCallback(async () => {
    if (!initialized) return;
    try {
      const allAchievements = await getAllAchievements();
      setAchievementsList(allAchievements);
    } catch (error) {
      console.error('Error refreshing achievements:', error);
    }
  }, [initialized]);

  const checkAndUnlockAchievementsWrapper = useCallback(async () => {
    if (!initialized) return [];
    try {
      // Get current activities and partners from the database
      const allActivities = await db
        .select()
        .from(activities)
        .orderBy(desc(activities.date), desc(activities.createdAt));
      const allPartners = await db
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

      const newAchievements = await checkAndUnlockAchievements(allActivities, allPartners);
      // Always refresh achievements to update progress bars
      await refreshAchievements();
      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }, [initialized, refreshAchievements]);

  const deleteAllAchievementsWrapper = useCallback(async () => {
    if (!initialized) return;
    try {
      await deleteAllAchievements();
      await refreshAchievements();
    } catch (error) {
      console.error('Error deleting all achievements:', error);
    }
  }, [initialized, refreshAchievements]);

  return {
    achievements: achievementsList,
    loading,
    initialized,
    refreshAchievements,
    checkAndUnlockAchievements: checkAndUnlockAchievementsWrapper,
    deleteAllAchievements: deleteAllAchievementsWrapper,
  };
}

// Export types
export type { Achievement };
