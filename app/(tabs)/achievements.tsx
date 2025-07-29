import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useAchievementsStore } from '~/store/achievements-store';
import { useActivityStore } from '~/store/activity-store';
import { usePartnersStore } from '~/store/partners-store';
import { ACHIEVEMENTS, getAchievementById, getProgress } from '~/lib/achievements';
import { Badge } from '~/components/ui/badge';
import { useFocusEffect } from '@react-navigation/native';

interface AchievementCardProps {
  achievementId: string;
  isUnlocked: boolean;
  progress?: number;
}

function AchievementCard({ achievementId, isUnlocked, progress = 0 }: AchievementCardProps) {
  const achievement = getAchievementById(achievementId);

  if (!achievement) return null;

  const progressPercentage = Math.round(progress * 100);

  return (
    <Card className={`p-4 mb-3 ${isUnlocked ? 'bg-card' : 'bg-muted/50'}`}>
      <View className="flex-row items-center">
        <View className="mr-3">
          <Text className={`text-2xl ${!isUnlocked ? 'opacity-30' : ''}`}>
            {achievement.icon}
          </Text>
        </View>
        <View className="flex-1">
          <Text className={`font-semibold ${!isUnlocked ? 'opacity-60' : ''}`}>
            {achievement.isSecret && !isUnlocked ? '???' : achievement.title}
          </Text>
          <Text className={`text-sm text-muted-foreground ${!isUnlocked ? 'opacity-60' : ''}`}>
            {achievement.isSecret && !isUnlocked ? 'Hidden achievement' : achievement.description}
          </Text>
          {!isUnlocked && progress > 0 && (
            <View className="mt-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-muted-foreground">Progress</Text>
                <Text className="text-xs text-muted-foreground">{progressPercentage}%</Text>
              </View>
              <View className="h-2 bg-muted rounded-full">
                <View
                  className="h-2 bg-primary rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
            </View>
          )}
        </View>
        {isUnlocked && (
          <View className="ml-2">
            <Text className="text-xs text-green-600 font-medium">✓ Unlocked</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

export default function AchievementsScreen() {
  const { achievements: unlockedAchievements, loading: achievementsLoading, checkAndUnlockAchievements } = useAchievementsStore();
  const { activities, refreshActivities } = useActivityStore();
  const { partners, refreshPartners } = usePartnersStore();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh all stores to ensure we have the latest data
      await Promise.all([
        refreshActivities(),
        refreshPartners(),
        checkAndUnlockAchievements()
      ]);
    } catch (error) {
      console.error('Error refreshing achievements:', error);
    } finally {
      setRefreshing(false);
    }
  }, [checkAndUnlockAchievements, refreshActivities, refreshPartners]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const unlockedIds = unlockedAchievements.map(a => a.achievementId);

  const filteredAchievements = ACHIEVEMENTS.filter(achievement =>
    categoryFilter === 'all' || achievement.category === categoryFilter
  );

  const categories = [
    { id: 'all', label: 'All', count: ACHIEVEMENTS.length },
    { id: 'milestone', label: 'Milestones', count: ACHIEVEMENTS.filter(a => a.category === 'milestone').length },
    { id: 'activity', label: 'Activities', count: ACHIEVEMENTS.filter(a => a.category === 'activity').length },
    { id: 'variety', label: 'Variety', count: ACHIEVEMENTS.filter(a => a.category === 'variety').length },
    { id: 'social', label: 'Social', count: ACHIEVEMENTS.filter(a => a.category === 'social').length },
    { id: 'streak', label: 'Streaks', count: ACHIEVEMENTS.filter(a => a.category === 'streak').length },
  ];

  if (achievementsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-muted-foreground">Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold mb-2">Achievements</Text>
        <Text className="text-muted-foreground">
          {unlockedIds.length} of {ACHIEVEMENTS.length} unlocked
        </Text>
      </View>

      {/* Category Filter */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 4 }}
        >
          {categories.map((category) => (
            <Badge
              variant={categoryFilter === category.id ? 'default' : 'secondary'}
              className="elevation-10"
              key={category.id}
              onTouchEnd={() => {
                setCategoryFilter(category.id);
              }}
            >
              <Text className="text-sm">
                {category.label} ({category.count})
              </Text>
            </Badge>
          ))}
        </ScrollView>
      </View>

      {/* Achievements List */}
      <FlashList
        data={filteredAchievements}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={100}
        renderItem={({ item: achievement }) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const progress = getProgress(achievement.id, activities, partners);

          return (
            <AchievementCard
              achievementId={achievement.id}
              isUnlocked={isUnlocked}
              progress={progress}
            />
          );
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-muted-foreground">No achievements in this category</Text>
          </View>
        )}
        ListFooterComponent={() => <View className="h-12" />}
      />
    </SafeAreaView>
  );
}
