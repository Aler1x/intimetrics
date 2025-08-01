import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { useEffect, useState, useRef } from 'react';
import { Trash2, Database, BarChart3, Info } from 'lucide-react-native';
import { DefaultTheme } from '~/lib/theme';
import { useActivityStore } from '~/store/activity-store';
import { useAchievementsStore } from '~/store/achievements-store';
import { showToast } from '~/lib/utils';
import DeleteConfirmation from '~/components/delete-confirmation';
import VibrationModal from '~/components/vibration-modal';
import DataManagement from '~/components/data-management';
import AboutModal from '~/components/about-modal';
import * as Haptics from 'expo-haptics';
import { useModal } from '~/hooks/useModal';
import type { ActivityType } from '~/types';
import { useColumnsStore } from '~/store/columns-store';

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  masturbation: 'Masturbation',
  sex: 'Sex',
  oral: 'Oral',
  other: 'Other',
  cuddle: 'Cuddle',
  anal: 'Anal',
  vaginal: 'Vaginal',
};

export default function SettingsScreen() {
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const {
    visible: isVibrationModalOpen,
    open: openVibrationModal,
    close: closeVibrationModal,
  } = useModal();
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const { deleteAllActivities, refreshActivities } = useActivityStore();
  const { deleteAllAchievements, refreshAchievements } = useAchievementsStore();
  const { isColumnVisible, toggleColumn } = useColumnsStore();

  const [pressing] = useState(false);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDeleteAllData = async () => {
    try {
      await deleteAllActivities();
      await deleteAllAchievements();
      // Refresh all stores to ensure UI updates properly
      await refreshActivities();
      await refreshAchievements();
      showToast('All data deleted successfully');
      setIsDeleteConfirmModalOpen(false);
    } catch (error) {
      console.error('Error deleting all data:', error);
      showToast('Error deleting data');
    }
  };

  useEffect(() => {
    if (pressing) {
      // Start continuous vibration
      const interval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 200); // Vibrate every 200ms
      vibrationIntervalRef.current = interval;
    } else {
      // Stop vibration
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
    };
  }, [pressing]);

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="mb-6 w-full flex-row items-center justify-between">
        <Text className="text-3xl font-bold">Settings</Text>
      </View>

      {/* Chart Column Configuration Card */}
      <ScrollView>
        <Card className="mb-4 p-4">
          <View className="mb-3 flex-row items-center">
            <BarChart3 size={20} color={DefaultTheme.colors.primary} />
            <Text className="ml-2 text-lg font-semibold">Chart Columns</Text>
          </View>
          <Text className="mb-4 text-sm text-gray-600">
            Choose which activity types to show in the bar chart and add activity modal.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {Object.entries(ACTIVITY_LABELS).map(([type, label]) => {
              const activityType = type as ActivityType;
              const isVisible = isColumnVisible(activityType);
              return (
                <TouchableOpacity
                  key={type}
                  className={`flex-row items-center justify-between rounded-lg border p-3 ${
                    isVisible ? 'border-primary bg-primary' : 'border-border bg-secondary'
                  }`}
                  onPress={() => {
                    toggleColumn(activityType);
                  }}>
                  <Text
                    className={`text-sm font-medium ${
                      isVisible ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Data Management Card */}
        <Card className="mb-4 p-4">
          <View className="mb-3 flex-row items-center">
            <Database size={20} color={DefaultTheme.colors.primary} />
            <Text className="ml-2 text-lg font-semibold">Data Management</Text>
          </View>
          <Text className="mb-4 text-sm text-gray-600">
            Export your data as JSON or import previously exported data for backup and restore.
          </Text>
          <Button variant="default" onPress={() => setIsDataManagementOpen(true)}>
            <Text>Manage Data</Text>
          </Button>
        </Card>

        {/* Delete All Data Card */}
        <Card className="mb-4 p-4">
          <View className="mb-3 flex-row items-center">
            <Trash2 size={20} color={DefaultTheme.colors.destructive} />
            <Text className="ml-2 text-lg font-semibold">Delete All Data</Text>
          </View>
          <Text className="mb-4 text-sm text-gray-600">
            This will permanently delete all your activities and reset all achievements. This action
            cannot be undone and is irreversible.
          </Text>
          <Button
            variant="destructive"
            className="border-destructive"
            onPress={() => setIsDeleteConfirmModalOpen(true)}>
            <Text className="font-medium text-primary-foreground">Delete All Data</Text>
          </Button>
        </Card>

        {/* About Card */}
        <Card className="mb-4 p-4">
          <View className="mb-3 flex-row items-center">
            <Info size={20} color={DefaultTheme.colors.primary} />
            <Text className="ml-2 text-lg font-semibold">About</Text>
          </View>
          <Text className="mb-4 text-sm text-gray-600">
            Information about the app, developer, and support options.
          </Text>
          <Button variant="default" onPress={() => setIsAboutModalOpen(true)}>
            <Text>About App</Text>
          </Button>
        </Card>

        <View className="h-5" />
      </ScrollView>

      {/* Easter Egg Trigger - Long press on the title */}
      <TouchableOpacity onLongPress={() => openVibrationModal()} activeOpacity={1}>
        <View className="h-8" />
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        visible={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onDelete={handleDeleteAllData}
        onCancel={() => setIsDeleteConfirmModalOpen(false)}
        title="Delete All Data"
        message="Are you sure you want to delete all your data?"
        deleteText="Delete"
        cancelText="Cancel"
        subMessage="This action cannot be undone. All your activities and achievements will be permanently deleted."
      />

      {/* Vibration Modal */}
      <VibrationModal visible={isVibrationModalOpen} onClose={() => closeVibrationModal()} />

      {/* Data Management Modal */}
      <DataManagement
        visible={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
      />

      {/* About Modal */}
      <AboutModal visible={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
    </SafeAreaView>
  );
}
