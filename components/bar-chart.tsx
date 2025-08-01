import { View, Dimensions, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { useCallback, useEffect, useState } from 'react';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import { useActivityStore } from '~/store/activity-store';
import type { ActivityType } from '~/types';
import { DefaultTheme } from '~/lib/theme';
import { Button } from './ui/button';
import { BottomModal } from './ui/modal';
import { useColumnsStore } from '~/store/columns-store';

const screenWidth = Dimensions.get('window').width;

interface BarChartProps {
  period?: 'week' | 'month' | 'year';
  filterType?: ActivityType | null;
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  masturbation: 'Masturbation',
  sex: 'Sex',
  oral: 'Oral',
  other: 'Other',
  cuddle: 'Cuddle',
  anal: 'Anal',
  vaginal: 'Vaginal',
};

function getDateRange(period: 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start: Date;

  switch (period) {
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
  }

  return { start, end };
}

export default function BarChart({ period = 'month', filterType = null }: BarChartProps) {
  const [activityCounts, setActivityCounts] = useState<Record<ActivityType, number>>({
    masturbation: 0,
    sex: 0,
    oral: 0,
    other: 0,
    cuddle: 0,
    anal: 0,
    vaginal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const { getActivityCountsByType, addUpdateHook } = useActivityStore();
  const { isColumnVisible } = useColumnsStore();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(period);
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const counts = await getActivityCountsByType(startDate, endDate);
      // Filter data if filterType is specified
      if (filterType) {
        const filteredCounts = Object.keys(counts).reduce(
          (acc, key) => {
            acc[key as ActivityType] = key === filterType ? counts[key as ActivityType] : 0;
            return acc;
          },
          {} as Record<ActivityType, number>
        );
        setActivityCounts(filteredCounts);
      } else {
        setActivityCounts(counts);
      }
    } catch (error) {
      console.error('Error loading bar chart data:', error);
    } finally {
      setLoading(false);
    }
  }, [period, filterType, getActivityCountsByType]);

  useEffect(() => {
    addUpdateHook('bar-chart', loadData);
  }, [addUpdateHook, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = Object.entries(activityCounts)
    .filter(([type]) => isColumnVisible(type as ActivityType))
    .map(([type, count]) => ({
      value: count,
      label: ACTIVITY_LABELS[type as ActivityType],
      frontColor: DefaultTheme.colors.primary,
      topLabelComponent: () => <Text className="text-xs text-foreground">{count}</Text>,
    }));

  const hasData = Object.entries(activityCounts)
    .filter(([type]) => isColumnVisible(type as ActivityType))
    .some(([, count]) => count > 0);

  return (
    <View className="rounded-lg bg-card p-4 shadow-sm">
      <Text className="mb-4 text-center text-lg font-bold">
        {filterType ? `${ACTIVITY_LABELS[filterType]} Activities` : `Activity Breakdown`}
      </Text>

      {loading ? (
        <View className="h-52 items-center justify-center bg-card">
          <ActivityIndicator size="large" color={DefaultTheme.colors.primary} />
        </View>
      ) : hasData ? (
        <GiftedBarChart
          data={chartData}
          width={screenWidth - 52}
          height={200}
          barWidth={22}
          spacing={24}
          xAxisLabelsVerticalShift={10}
          yAxisTextStyle={{
            color: DefaultTheme.colors.foreground,
            fontSize: 10,
          }}
          xAxisLabelTextStyle={{
            color: DefaultTheme.colors.foreground,
            fontSize: 10,
          }}
          noOfSections={3}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextNumberOfLines={1}
          initialSpacing={20}
          yAxisLabelWidth={20}
          yAxisLabelSuffix=""
          yAxisLabelPrefix=""
          formatYLabel={(value) => Math.round(Number(value)).toString()}
        />
      ) : (
        <View className="h-48 items-center justify-center">
          <Text className="text-center text-gray-500">
            No activities recorded in the last {period}
          </Text>
        </View>
      )}

      <Button variant="outline" className="mt-4 w-full" onPress={() => setIsStatsModalOpen(true)}>
        <Text className="text-sm font-medium">Show stats</Text>
      </Button>

      <BottomModal visible={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)}>
        {!loading && (
          <View className="mt-4 flex-row flex-wrap">
            {Object.entries(activityCounts).map(([type, count]) => (
              <View key={type} className="mb-2 w-1/2">
                <Text className="text-sm font-medium">
                  {ACTIVITY_LABELS[type as ActivityType]}: {count}
                </Text>
              </View>
            ))}
          </View>
        )}
      </BottomModal>
    </View>
  );
}
