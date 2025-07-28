import { Heart, Plus, Settings2, X } from 'lucide-react-native';
import { TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import BasicModal from '~/components/ui/basic-modal';
import { DefaultTheme } from '~/lib/theme';
import InputWithDropdown, { SelectListData } from '~/components/ui/input-with-dropdown';
import { useActivityStore, usePartnersStore, ActivityType } from '~/store/drizzle-store';
import AutoResizingInput from '~/components/ui/auto-resizing-input';
import { showToast } from '~/lib/utils';
import DatePicker, { SingleOutput } from 'react-native-neat-date-picker';
import BarChart from '~/components/bar-chart';
import Heatmap from '~/components/heatmap';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [partner, setPartner] = useState<SelectListData | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>('');
  const [type, setType] = useState<SelectListData | null>(null);

  // Chart filtering states (applied)
  const [chartFilter, setChartFilter] = useState<SelectListData | null>(null);
  const [chartPeriod, setChartPeriod] = useState<SelectListData>({ id: 'month', value: 'Month' });

  // Temporary filter states for modal
  const [tempChartFilter, setTempChartFilter] = useState<SelectListData | null>(null);
  const [tempChartPeriod, setTempChartPeriod] = useState<SelectListData>({
    id: 'month',
    value: 'Month',
  });

  const { partners } = usePartnersStore();
  const { addActivity } = useActivityStore();

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
    setIsModalOpen(false);
  };

  const handleSettingsOpen = () => {
    // Initialize temp states with current applied values
    setTempChartFilter(chartFilter);
    setTempChartPeriod(chartPeriod);
    setIsSettingsModalOpen(true);
  };

  const handleApplyFilters = () => {
    // Apply temp states to actual states
    setChartFilter(tempChartFilter);
    setChartPeriod(tempChartPeriod);
    setIsSettingsModalOpen(false);
  };

  const handleResetFilters = () => {
    // Reset temp states
    setTempChartFilter(null);
    setTempChartPeriod({ id: 'month', value: 'Month' });
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-3xl font-bold">
          Your <Heart size={22} color={DefaultTheme.colors.foreground} /> Activity
        </Text>
        <TouchableOpacity onPress={handleSettingsOpen}>
          <Settings2 size={22} color={DefaultTheme.colors.foreground} />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 py-2" showsVerticalScrollIndicator={false}>
        <View className="mb-6 gap-4">
          <BarChart
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
          onPress={() => setIsModalOpen(true)}
          style={{
            elevation: 10,
          }}>
          <View className="flex-row items-center gap-2">
            <Plus size={24} color="white" />
            <Text className="font-medium text-white">Add Activity</Text>
          </View>
        </Button>
      </View>

      <BasicModal
        isModalOpen={isModalOpen}
        setIsModalOpen={handleModalClose}
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
          maxHeight={120}
          allowFreeText={false}
        />

        <InputWithDropdown
          placeholder="Partner"
          value={partner?.value || ''}
          setSelected={setPartner}
          data={partnerList}
          maxHeight={120}
          allowFreeText={true}
        />

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
          colorOptions={{
            headerColor: DefaultTheme.colors.primary,
            selectedDateBackgroundColor: DefaultTheme.colors.primary,
            weekDaysColor: DefaultTheme.colors.primary,
            confirmButtonColor: DefaultTheme.colors.primary,
            changeYearModalColor: DefaultTheme.colors.primary,
          }}
          initialDate={new Date()}
        />

        <AutoResizingInput
          placeholder="Describe your experience..."
          value={description}
          onChangeText={setDescription}
        />

        <Button variant="default" className="w-full" onPress={handleAddActivity}>
          <Text className="font-medium text-white">Add Activity</Text>
        </Button>
      </BasicModal>

      <BasicModal
        isModalOpen={isSettingsModalOpen}
        setIsModalOpen={setIsSettingsModalOpen}
        className="gap-5 pb-10">
        <View className="flex-row items-center justify-between p-2">
          <Text className="text-lg font-semibold">Settings</Text>
          <TouchableOpacity onPress={() => setIsSettingsModalOpen(false)}>
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
      </BasicModal>
    </SafeAreaView>
  );
}
