import { Heart, HeartCrack, Plus, Settings2, X } from 'lucide-react-native';
import { TouchableOpacity, View, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useCallback, useState } from 'react';
import { BottomModal } from '~/components/ui/modal';
import { DefaultTheme } from '~/lib/theme';
import InputWithDropdown, { SelectListData } from '~/components/ui/input-with-dropdown';
import { useActivityStore } from '~/store/activity-store';
import { usePartnersStore } from '~/store/partners-store';
import { useAchievementsStore } from '~/store/achievements-store';
import type { ActivityType } from '~/types';
import AutoResizingInput from '~/components/ui/auto-resizing-input';
import { showToast } from '~/lib/utils';
import DatePicker, { SingleOutput } from 'react-native-neat-date-picker';
import BarChartComponent from '~/components/bar-chart';
import Heatmap from '~/components/heatmap';
import { useModal } from '~/hooks/useModal';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import * as Haptics from 'expo-haptics';

const activityTypes: SelectListData[] = [
  { id: 'sex', value: 'Sex' },
  { id: 'cuddle', value: 'Cuddle' },
  { id: 'oral', value: 'Oral' },
  { id: 'anal', value: 'Anal' },
  { id: 'vaginal', value: 'Vaginal' },
  { id: 'masturbation', value: 'Masturbation' },
  { id: 'other', value: 'Other' },
];

export default function HomeScreen() {
  const {
    visible: isAddActivityModalOpen,
    open: openAddActivityModal,
    close: closeAddActivityModal,
  } = useModal();
  const {
    visible: isSettingsModalOpen,
    open: openSettingsModal,
    close: closeSettingsModal,
  } = useModal();
  // const { visible: isLogConfirmModalOpen, open: openLogConfirmModal, close: closeLogConfirmModal, toggle: toggleLogConfirmModal } = useModal();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [partner, setPartner] = useState<SelectListData | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>('');
  const [type, setType] = useState<SelectListData | null>(null);

  const { getItem, setItem } = useLocalStorage();
  const [mainHeart, setMainHeart] = useState(getItem('main_heart') === 'true');

  // Chart filtering states (applied)
  const [chartFilter, setChartFilter] = useState<SelectListData | null>(null);
  const [chartPeriod, setChartPeriod] = useState<SelectListData>({ id: 'month', value: 'Month' });

  // Temporary filter states for modal
  const [tempChartFilter, setTempChartFilter] = useState<SelectListData | null>(null);
  const [tempChartPeriod, setTempChartPeriod] = useState<SelectListData>({
    id: 'month',
    value: 'Month',
  });

  const { partners, refreshPartners } = usePartnersStore();
  const { addActivity, refreshActivities } = useActivityStore();
  const { refreshAchievements, checkAndUnlockAchievements } = useAchievementsStore();

  const partnerList = partners.map((partner) => ({
    id: partner.id.toString(),
    value: partner.name,
  }));

  const chartFilterOptions: SelectListData[] = [
    { id: '', value: 'All Activities' },
    ...activityTypes,
  ];

  const periodOptions: SelectListData[] = [
    { id: 'week', value: 'Week' },
    { id: 'month', value: 'Month' },
    { id: 'year', value: 'Year' },
  ];

  const handleAddActivity = async () => {
    if (!type || !date || (type.id !== 'masturbation' && !partner)) return;

    try {
      await addActivity(type.id as ActivityType, date, description, partner?.value);
      showToast('Activity added successfully');

      // Explicitly refresh activities to ensure charts update
      await refreshActivities();
      // Check for new achievements after adding activity
      const newAchievements = await checkAndUnlockAchievements();

      // Show achievement notifications
      if (newAchievements && newAchievements.length > 0) {
        for (const achievementId of newAchievements) {
          const achievement = await import('~/lib/achievements').then((m) =>
            m.getAchievementById(achievementId)
          );
          if (achievement) {
            showToast(`🎉 Achievement Unlocked: ${achievement.title}!`);
          }
        }
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      showToast('Error adding activity');
    } finally {
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    setPartner(null);
    setType(null);
    setDescription('');
    setIsDatePickerOpen(false);
    setDate('');
    closeAddActivityModal();
  };

  const handleSettingsOpen = () => {
    // Initialize temp states with current applied values
    setTempChartFilter(chartFilter);
    setTempChartPeriod(chartPeriod);
    openSettingsModal();
  };

  const handleApplyFilters = () => {
    // Apply temp states to actual states
    setChartFilter(tempChartFilter);
    setChartPeriod(tempChartPeriod);
    closeSettingsModal();
  };

  const handleResetFilters = () => {
    // Reset temp states
    setTempChartFilter(null);
    setTempChartPeriod({ id: 'month', value: 'Month' });
  };

  const onRefresh = useCallback(() => {
    refreshActivities();
    refreshPartners();
    refreshAchievements();
  }, [refreshActivities, refreshPartners, refreshAchievements]);

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-3xl font-bold">Your</Text>
          <TouchableOpacity
            onPress={() => {
              setMainHeart(!mainHeart);
              if (mainHeart) {
                setItem('main_heart', 'false');
                showToast('Oh no! You broke the heart!', 10);
              } else {
                setItem('main_heart', 'true');
                showToast('You fixed the heart!', 10);
              }
            }}
            className="px-2">
            {mainHeart ? (
              <Heart size={22} color={DefaultTheme.colors.foreground} />
            ) : (
              <HeartCrack size={22} color={DefaultTheme.colors.foreground} />
            )}
          </TouchableOpacity>
          <Text className="text-3xl font-bold">Activity</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={handleSettingsOpen}>
            <Settings2 size={24} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={openLogConfirmModal}>
            <List size={22} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity> */}
        </View>
      </View>
      <ScrollView
        className="flex-1 py-2"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={false} />}>
        <View className="mb-6 gap-4">
          <BarChartComponent
            period={chartPeriod?.id as 'week' | 'month' | 'year'}
            filterType={chartFilter?.id ? (chartFilter.id as ActivityType) : null}
          />
          <Heatmap
            period={chartPeriod?.id as 'week' | 'month' | 'year'}
            filterType={chartFilter?.id ? (chartFilter.id as ActivityType) : null}
          />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 items-center pb-28">
        <Button
          variant="default"
          className="w-[50%]"
          onPress={openAddActivityModal}
          onLongPress={() => {
            showToast('Enough!', 10);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }}
          style={{
            elevation: 10,
          }}>
          <View className="flex-row items-center gap-2">
            <Plus size={24} color="white" />
            <Text className="font-medium text-white">Add Activity</Text>
          </View>
        </Button>
      </View>

      <BottomModal
        visible={isAddActivityModalOpen}
        onClose={handleModalClose}
        className="gap-5 pb-10">
        <View className="flex-row items-center justify-between p-2">
          <Text className="text-lg font-semibold">Add Activity</Text>
          <TouchableOpacity onPress={handleModalClose}>
            <X size={24} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <InputWithDropdown
          placeholder="Type"
          value={type?.value || ''}
          setSelected={setType}
          data={activityTypes}
          maxHeight={180}
          allowFreeText={false}
          triggerKeyboard={false}
        />

        {type?.id !== 'masturbation' && (
          <InputWithDropdown
            placeholder="Partner"
            value={partner?.value || ''}
            setSelected={setPartner}
            data={partnerList}
            maxHeight={120}
            allowFreeText={true}
            triggerKeyboard={false}
          />
        )}

        <Button variant="outline" onPress={() => setIsDatePickerOpen(true)}>
          {date ? <Text>{date}</Text> : <Text>Select Date</Text>}
        </Button>

        <DatePicker
          isVisible={isDatePickerOpen}
          mode="single"
          onCancel={() => setIsDatePickerOpen(false)}
          onConfirm={(output: SingleOutput) => {
            setDate(output.dateString || '');
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

        <AutoResizingInput
          placeholder="Describe your experience..."
          value={description}
          onChangeText={setDescription}
        />

        <Button variant="default" className="w-full" onPress={handleAddActivity}>
          <Text className="font-medium text-white">Add Activity</Text>
        </Button>
      </BottomModal>

      <BottomModal
        visible={isSettingsModalOpen}
        onClose={closeSettingsModal}
        className="gap-5 pb-10">
        <View className="flex-row items-center justify-between p-2">
          <Text className="text-lg font-semibold">Settings</Text>
          <TouchableOpacity onPress={closeSettingsModal}>
            <X size={24} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <InputWithDropdown
          placeholder="Filter Activity"
          value={tempChartFilter?.value || 'All Activities'}
          setSelected={setTempChartFilter}
          data={chartFilterOptions}
          maxHeight={120}
          allowFreeText={false}
        />

        <InputWithDropdown
          placeholder="Period"
          value={tempChartPeriod?.value || 'Month'}
          setSelected={setTempChartPeriod}
          data={periodOptions}
          maxHeight={120}
          allowFreeText={false}
          triggerKeyboard={false}
        />

        <View className="w-full flex-row items-center gap-2">
          <Button variant="outline" className="w-[50%]" onPress={handleResetFilters}>
            <Text className="font-medium text-white">Reset</Text>
          </Button>
          <Button variant="default" className="w-[50%]" onPress={handleApplyFilters}>
            <Text className="font-medium text-white">Apply</Text>
          </Button>
        </View>
      </BottomModal>

      {/* <FullscreenModal
        visible={isLogConfirmModalOpen}
        onClose={closeLogConfirmModal}
        className="gap-5 pb-10">
        <Text>Settings</Text>
      </FullscreenModal> */}
    </SafeAreaView>
  );
}
