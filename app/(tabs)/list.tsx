import { FlashList } from '@shopify/flash-list';
import { BookHeart, Filter, X } from 'lucide-react-native';
import { TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import InputWithDropdown, { SelectListData } from '~/components/ui/input-with-dropdown';
import { BottomModal } from '~/components/ui/modal';
import { useActivityStore } from '~/store/activity-store';
import { usePartnersStore } from '~/store/partners-store';
import type { Activity } from '~/db/schema';
import { useState, useMemo, useCallback } from 'react';
import { useModal } from '~/hooks/useModal';
import DatePicker, { RangeOutput } from 'react-native-neat-date-picker';
import { DefaultTheme } from '~/lib/theme';
import { useFocusEffect } from '@react-navigation/native';
import type { ActivityType } from '~/types';

interface FilterState {
  activityType: SelectListData | null;
  partner: SelectListData | null;
  dateFrom: string | null;
  dateTo: string | null;
}

const allActivityTypes: SelectListData[] = [
  { id: 'sex', value: 'Sex' },
  { id: 'cuddle', value: 'Cuddle' },
  { id: 'oral', value: 'Oral' },
  { id: 'anal', value: 'Anal' },
  { id: 'vaginal', value: 'Vaginal' },
  { id: 'masturbation', value: 'Masturbation' },
  { id: 'other', value: 'Other' },
];

const renderActivity = (item: Activity) => {
  let text: string;

  switch (item.type) {
    case 'masturbation':
      text = 'You masturbated';
      break;
    case 'cuddle':
      text = item.partner ? `You cuddled with ${item.partner}` : 'You cuddled';
      break;
    case 'sex':
      text = item.partner ? `You had sex with ${item.partner}` : 'You had sex';
      break;
    case 'oral':
      text = item.partner ? `You had oral sex with ${item.partner}` : 'You had oral sex';
      break;
    case 'anal':
      text = item.partner ? `You had anal sex with ${item.partner}` : 'You had anal sex';
      break;
    case 'vaginal':
      text = item.partner ? `You had vaginal sex with ${item.partner}` : 'You had vaginal sex';
      break;
    default:
      text = item.partner ? `You had ${item.type} with ${item.partner}` : `You had ${item.type}`;
  }

  return (
    <Card className="mb-2 flex-col items-center justify-between p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold">{text}</Text>
        </View>
        <Badge variant="outline" className="px-2 py-1">
          <Text className="text-md">{item.date}</Text>
        </Badge>
      </View>
      <View className="w-full flex-1">
        <Text className="text-sm text-muted-foreground">{item.description}</Text>
      </View>
    </Card>
  );
};

export default function ListScreen() {
  const { activities, refreshActivities } = useActivityStore();
  const { partners } = usePartnersStore();

  const [filters, setFilters] = useState<FilterState>({
    activityType: null,
    partner: null,
    dateFrom: null,
    dateTo: null,
  });

  // Temporary filter states for modal
  const [tempFilters, setTempFilters] = useState<FilterState>({
    activityType: null,
    partner: null,
    dateFrom: null,
    dateTo: null,
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const {
    visible: isFiltersModalOpen,
    open: openFiltersModal,
    close: closeFiltersModal,
  } = useModal();

  let loading = false;


  const activityTypes = allActivityTypes;

  const partnerList = partners.map((partner) => ({
    id: partner.id.toString(),
    value: partner.name,
  }));

  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    return activities.filter((activity) => {
      // Filter by activity type
      if (filters.activityType && activity.type !== filters.activityType.id) {
        return false;
      }

      // Filter by partner
      if (filters.partner && activity.partner !== filters.partner.value) {
        return false;
      }

      // Filter by date range
      if (filters.dateFrom) {
        const activityDate = new Date(activity.date);
        const fromDate = new Date(filters.dateFrom);
        if (activityDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const activityDate = new Date(activity.date);
        const toDate = new Date(filters.dateTo);
        if (activityDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [activities, filters]);

  const handleFiltersOpen = () => {
    // Initialize temp states with current applied values
    setTempFilters(filters);
    openFiltersModal();
  };

  const handleApplyFilters = () => {
    // Apply temp states to actual states
    setFilters(tempFilters);
    closeFiltersModal();
  };

  const handleResetFilters = () => {
    // Reset temp states
    setTempFilters({
      activityType: null,
      partner: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  const clearFilters = () => {
    setFilters({
      activityType: null,
      partner: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filters.activityType) count++;
    if (filters.partner) count++;
    if (filters.dateFrom || filters.dateTo) count++; // Count date range as 1 filter
    return count;
  };

  const hasActiveFilters = countActiveFilters() > 0;

  useFocusEffect(
    useCallback(() => {
      refreshActivities();
    }, [refreshActivities])
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-3xl font-bold">
          Your <BookHeart size={22} color={DefaultTheme.colors.foreground} /> Activity Log
        </Text>
        <TouchableOpacity onPress={handleFiltersOpen} onLongPress={clearFilters}>
          <View className="flex-row items-center gap-2">
            <Filter size={24} color={DefaultTheme.colors.foreground} />
            {hasActiveFilters && (
              <Badge variant="secondary">
                <Text className="text-xs">
                  {Object.values(filters).filter(Boolean).length}
                </Text>
              </Badge>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <FlashList
        data={filteredActivities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderActivity(item)}
        onRefresh={refreshActivities}
        refreshing={loading}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-center text-muted-foreground">
              {hasActiveFilters
                ? "No activities match your filters.\nTry adjusting your filter criteria."
                : "No activities yet.\nAdd your first activity to get started."
              }
            </Text>
          </View>
        }
        className="gap-4 py-4"
      />

      <BottomModal
        visible={isFiltersModalOpen}
        onClose={closeFiltersModal}
        className="gap-5 pb-10">
        <View className="flex-row items-center justify-between p-2">
          <Text className="text-lg font-semibold">Filters</Text>
          <TouchableOpacity onPress={closeFiltersModal}>
            <X size={24} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Activity Type Filter */}
        <InputWithDropdown
          placeholder="Activity Type"
          value={tempFilters.activityType?.value || ''}
          setSelected={(value) => setTempFilters(prev => ({ ...prev, activityType: value }))}
          data={activityTypes}
          maxHeight={120}
          allowFreeText={false}
          triggerKeyboard={false}
        />

        {/* Partner Filter */}
        {tempFilters.activityType && tempFilters.activityType.id !== 'masturbation' && (
          <InputWithDropdown
            placeholder="Partner"
            value={tempFilters.partner?.value || ''}
            setSelected={(value) => setTempFilters(prev => ({ ...prev, partner: value }))}
            data={partnerList}
            maxHeight={120}
            allowFreeText={false}
            triggerKeyboard={false}
          />
        )}

        {/* Date Range Filter */}
        <Button variant="outline" onPress={() => setIsDatePickerOpen(true)}>
          {tempFilters.dateFrom && tempFilters.dateTo ? (
            <Text>{new Date(tempFilters.dateFrom).toLocaleDateString()} - {new Date(tempFilters.dateTo).toLocaleDateString()}</Text>
          ) : (
            <Text>Select Date Range</Text>
          )}
        </Button>

        <View className="w-full flex-row items-center gap-2">
          <Button variant="outline" className="w-[50%]" onPress={handleResetFilters}>
            <Text className="font-medium text-white">Reset</Text>
          </Button>
          <Button variant="default" className="w-[50%]" onPress={handleApplyFilters}>
            <Text className="font-medium text-white">Apply</Text>
          </Button>
        </View>

        <DatePicker
          isVisible={isDatePickerOpen}
          mode="range"
          onCancel={() => setIsDatePickerOpen(false)}
          onConfirm={(output: RangeOutput) => {
            setTempFilters(prev => ({
              ...prev,
              dateFrom: output.startDate?.toISOString() || null,
              dateTo: output.endDate?.toISOString() || null,
            }));
            setIsDatePickerOpen(false);
          }}
          maxDate={new Date()}
          colorOptions={{
            headerColor: DefaultTheme.colors.primary,
            selectedDateBackgroundColor: DefaultTheme.colors.primary,
            weekDaysColor: DefaultTheme.colors.primary,
            confirmButtonColor: DefaultTheme.colors.primary,
            changeYearModalColor: DefaultTheme.colors.primary,
          }}
          initialDate={new Date()}
          modalStyles={{
            position: 'absolute',
            height: Dimensions.get('screen').height,
            width: Dimensions.get('screen').width,
            top: -Dimensions.get('screen').height / 2,
            right: 0,
            zIndex: 1000,
          }}
        />

      </BottomModal>

    </SafeAreaView>
  );
}
