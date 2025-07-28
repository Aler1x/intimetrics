import { View, Dimensions } from 'react-native';
import { Text } from '~/components/ui/text';
import { useEffect, useState } from 'react';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { AbstractChartConfig } from 'react-native-chart-kit/dist/AbstractChart';
import { useActivityStore, ActivityType } from '~/store/drizzle-store';
import { DefaultTheme } from '~/lib/theme';
import { Button } from './ui/button';
import BasicModal from './ui/basic-modal';

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
  const { getActivityCountsByType } = useActivityStore();

  useEffect(() => {
    const loadData = async () => {
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
    };

    loadData();
  }, [period, filterType, getActivityCountsByType]);

  const data = {
    labels: Object.keys(activityCounts).map((type) => ACTIVITY_LABELS[type as ActivityType]),
    datasets: [
      {
        data: Object.values(activityCounts),
      },
    ],
  };

  const chartConfig: AbstractChartConfig = {
    backgroundColor: DefaultTheme.colors.muted,
    backgroundGradientFrom: DefaultTheme.colors.muted,
    backgroundGradientTo: DefaultTheme.colors.muted,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(195, 158, 136, ${opacity})`, // primary color with opacity
    labelColor: (opacity = 1) => `rgba(205, 214, 244, ${opacity})`, // foreground color with opacity
    propsForLabels: {
      fontSize: 10,
    },
    barPercentage: 0.6,
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
    formatXLabel: (value) => {
      return value.length > 7 ? value.slice(0, 7) + '...' : value;
    },
  };

  const hasData = Object.values(activityCounts).some((count) => count > 0);

  return (
    <View className="rounded-lg bg-card p-4 shadow-sm">
      <Text className="mb-4 text-lg font-bold">
        {filterType ? `${ACTIVITY_LABELS[filterType]} Activities` : `Activity Breakdown`}
      </Text>

      {loading ? (
        <View className="h-48 items-center justify-center">
          <Text className="text-center text-gray-500">Loading...</Text>
        </View>
      ) : hasData ? (
        <RNBarChart
          data={data}
          width={screenWidth - 52}
          height={200}
          chartConfig={chartConfig}
          showValuesOnTopOfBars
          fromZero
          yAxisLabel="x"
          yAxisSuffix=""
          style={{
            borderRadius: 10,
            marginHorizontal: 'auto',
          }}
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

      <BasicModal isModalOpen={isStatsModalOpen} setIsModalOpen={setIsStatsModalOpen}>
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
      </BasicModal>
    </View>
  );
}
