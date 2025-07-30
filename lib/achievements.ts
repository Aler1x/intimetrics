import { ActivityType } from '~/types';
import { getItem } from '~/hooks/useLocalStorage';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'milestone' | 'activity' | 'streak' | 'variety' | 'social';
  condition: (activities: any[], partners: any[]) => boolean;
  progress?: (activities: any[], partners: any[]) => number;
  target?: number;
  isSecret?: boolean;
}

// Helper functions for common achievement patterns
const countActivities = (activities: any[]) => activities.length;
const countActivityType = (activities: any[], type: ActivityType) =>
  activities.filter((a) => a.type === type).length;
const countUniquePartners = (activities: any[]) =>
  new Set(activities.filter((a) => a.partner && a.partner.trim()).map((a) => a.partner)).size;
const countUniqueTypes = (activities: any[]) => new Set(activities.map((a) => a.type)).size;
const getMaxPartnerCount = (activities: any[]) => {
  const partnerCounts: Record<string, number> = {};
  activities.forEach((a) => {
    if (a.partner && a.partner.trim()) {
      partnerCounts[a.partner] = (partnerCounts[a.partner] || 0) + 1;
    }
  });
  return Math.max(...Object.values(partnerCounts), 0);
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Milestone Achievements
  {
    id: 'first_time',
    title: 'First Steps',
    description: 'Log your first activity',
    icon: '🎉',
    category: 'milestone',
    target: 1,
    condition: (activities) => countActivities(activities) >= 1,
    progress: (activities) => Math.min(countActivities(activities) / 1, 1),
  },
  {
    id: 'double_digits',
    title: 'Double Digits',
    description: 'Log 10 activities',
    icon: '🔟',
    category: 'milestone',
    target: 10,
    condition: (activities) => countActivities(activities) >= 10,
    progress: (activities) => Math.min(countActivities(activities) / 10, 1),
  },
  {
    id: 'half_century',
    title: 'Half Century',
    description: 'Log 50 activities',
    icon: '🏆',
    category: 'milestone',
    target: 50,
    condition: (activities) => countActivities(activities) >= 50,
    progress: (activities) => Math.min(countActivities(activities) / 50, 1),
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Log 100 activities',
    icon: '💯',
    category: 'milestone',
    target: 100,
    condition: (activities) => countActivities(activities) >= 100,
    progress: (activities) => Math.min(countActivities(activities) / 100, 1),
  },

  // Activity Type Achievements
  {
    id: 'first_time_with_partner',
    title: 'First Time With Partner',
    description: 'Log your first activity with a partner',
    icon: '💑',
    category: 'activity',
    target: 1,
    condition: (activities) =>
      countActivities(activities) >= 1 && activities.some((a) => a.partner && a.partner.trim()),
  },
  {
    id: 'self_love',
    title: 'Self Love',
    description: 'Log 5 masturbation sessions',
    icon: '💖',
    category: 'activity',
    target: 5,
    condition: (activities) => countActivityType(activities, 'masturbation') >= 5,
    progress: (activities) => Math.min(countActivityType(activities, 'masturbation') / 5, 1),
  },
  {
    id: 'intimacy_expert',
    title: 'Intimacy Expert',
    description: 'Log 10 sex activities',
    icon: '🔥',
    category: 'activity',
    target: 10,
    condition: (activities) => countActivityType(activities, 'sex') >= 10,
    progress: (activities) => Math.min(countActivityType(activities, 'sex') / 10, 1),
  },
  {
    id: 'cuddle_master',
    title: 'Cuddle Master',
    description: 'Log 20 cuddle sessions',
    icon: '🤗',
    category: 'activity',
    target: 20,
    condition: (activities) => countActivityType(activities, 'cuddle') >= 20,
    progress: (activities) => Math.min(countActivityType(activities, 'cuddle') / 20, 1),
  },

  // Variety Achievements
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Try 3 different activity types',
    icon: '🗺️',
    category: 'variety',
    target: 3,
    condition: (activities) => countUniqueTypes(activities) >= 3,
    progress: (activities) => Math.min(countUniqueTypes(activities) / 3, 1),
  },
  {
    id: 'adventurer',
    title: 'Adventurer',
    description: 'Try all 7 activity types',
    icon: '🌟',
    category: 'variety',
    target: 7,
    condition: (activities) => countUniqueTypes(activities) >= 7,
    progress: (activities) => Math.min(countUniqueTypes(activities) / 7, 1),
  },

  // Social Achievements
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Log activities with 3 different partners',
    icon: '🦋',
    category: 'social',
    target: 3,
    condition: (activities) => countUniquePartners(activities) >= 3,
    progress: (activities) => Math.min(countUniquePartners(activities) / 3, 1),
  },
  {
    id: 'committed',
    title: 'Committed',
    description: 'Log 25 activities with the same partner',
    icon: '💑',
    category: 'social',
    target: 25,
    condition: (activities) => getMaxPartnerCount(activities) >= 25,
    progress: (activities) => Math.min(getMaxPartnerCount(activities) / 25, 1),
  },

  // Streak Achievements (simplified)
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Log 10 weekend activities',
    icon: '🗓️',
    category: 'streak',
    target: 10,
    condition: (activities) => {
      const weekendActivities = activities.filter((a) => {
        const date = new Date(a.date);
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
      return weekendActivities.length >= 10;
    },
    progress: (activities) => {
      const weekendCount = activities.filter((a) => {
        const date = new Date(a.date);
        const day = date.getDay();
        return day === 0 || day === 6;
      }).length;
      return Math.min(weekendCount / 10, 1);
    },
  },
  {
    id: 'frequent_user',
    title: 'Frequent User',
    description: 'Log activities on 7 different days',
    icon: '📅',
    category: 'streak',
    target: 7,
    condition: (activities) => {
      const uniqueDates = new Set(activities.map((a) => a.date));
      return uniqueDates.size >= 7;
    },
    progress: (activities) => {
      const uniqueDays = new Set(activities.map((a) => a.date)).size;
      return Math.min(uniqueDays / 7, 1);
    },
  },

  // Secret Achievements
  {
    id: 'best_start_of_the_year',
    title: 'Best Start of the Year',
    description: 'Have sex on January 1st',
    icon: '🎄',
    category: 'milestone',
    target: 1,
    condition: (activities) => {
      return activities.some((activity) => {
        if (activity.type !== 'sex') return false;
        const activityDate = new Date(activity.date);
        return activityDate.getMonth() === 0 && activityDate.getDate() === 1; // January 1st
      });
    },
    progress: (activities) => {
      const hasSexOnJan1 = activities.some((activity) => {
        if (activity.type !== 'sex') return false;
        const activityDate = new Date(activity.date);
        return activityDate.getMonth() === 0 && activityDate.getDate() === 1;
      });
      return hasSexOnJan1 ? 1 : 0;
    },
    isSecret: true,
  },
  {
    id: 'valentines_day',
    title: 'Valentines Day',
    description: "Have sex on Valentine's Day",
    icon: '💖',
    category: 'milestone',
    target: 1,
    condition: (activities) => {
      return activities.some((activity) => {
        if (activity.type !== 'sex') return false;
        const activityDate = new Date(activity.date);
        return activityDate.getMonth() === 1 && activityDate.getDate() === 14; // Valentine's Day
      });
    },
    isSecret: true,
  },
  {
    id: '69_day_streak',
    title: '69 Day Streak',
    description: 'Have sex for 69 consecutive days',
    icon: '🔥',
    category: 'milestone',
    target: 69,
    condition: (activities) => {
      const dates = [...new Set(activities.map((a) => a.date))].sort();
      let currentStreak = 1;
      let maxStreak = 1;

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      return maxStreak >= 69;
    },
    progress: (activities) => {
      const dates = [...new Set(activities.map((a) => a.date))].sort();
      let currentStreak = 1;
      let maxStreak = 1;

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      return Math.min(maxStreak / 69, 1);
    },
  },
  {
    id: 'activity_streak',
    title: 'Activity Streak',
    description: 'Log activities for 30 consecutive days',
    icon: '🔥',
    category: 'streak',
    target: 30,
    condition: (activities) => {
      if (activities.length === 0) return false;
      const dates = [...new Set(activities.map((a) => a.date))].sort();
      let maxStreak = 1;
      let currentStreak = 1;

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      return maxStreak >= 30;
    },
    progress: (activities) => {
      if (activities.length === 0) return 0;
      const dates = [...new Set(activities.map((a) => a.date))].sort();
      let maxStreak = 1;
      let currentStreak = 1;

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      return Math.min(maxStreak / 30, 1);
    },
  },
  {
    id: '69_sex_activities',
    title: '69 Sex Activities',
    description: 'Have sex 69 times',
    icon: '🔥',
    category: 'milestone',
    target: 69,
    condition: (activities) => countActivityType(activities, 'sex') >= 69,
    progress: (activities) => Math.min(countActivityType(activities, 'sex') / 69, 1),
  }
];

export function checkAchievements(
  activities: any[],
  partners: any[],
  unlockedAchievements: string[]
): string[] {
  const newAchievements: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedAchievements.includes(achievement.id)) {
      if (achievement.condition(activities, partners)) {
        newAchievements.push(achievement.id);
      }
    }
  }

  return newAchievements;
}

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(
  category: AchievementDefinition['category']
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getProgress(achievementId: string, activities: any[], partners: any[]): number {
  const achievement = getAchievementById(achievementId);
  if (!achievement || !achievement.progress) return 0;

  return achievement.progress(activities, partners);
}
