import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { useState } from 'react';
import { Trash2 } from 'lucide-react-native';
import { DefaultTheme } from '~/lib/theme';
import { useActivityStore } from '~/store/activity-store';
import { useAchievementsStore } from '~/store/achievements-store';
import { showToast } from '~/lib/utils';
import DeleteConfirmation from '~/components/delete-confirmation';

export default function SettingsScreen() {
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const { deleteAllActivities, refreshActivities } = useActivityStore();
  const { deleteAllAchievements, refreshAchievements } = useAchievementsStore();

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

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="mb-6 w-full flex-row items-center justify-between">
        <Text className="text-3xl font-bold">Settings</Text>
      </View>

      {/* Delete All Data Card */}
      <Card className="mb-4 p-4">
        <View className="mb-3 flex-row items-center">
          <Trash2 size={20} color={DefaultTheme.colors.destructive} />
          <Text className="ml-2 text-lg font-semibold">Delete All Data</Text>
        </View>
        <Text className="mb-4 text-sm text-gray-600">
          This will permanently delete all your activities and reset all achievements. This action cannot be undone and is irreversible.
        </Text>
        <Button
          variant="destructive"
          className="border-destructive"
          onPress={() => setIsDeleteConfirmModalOpen(true)}>
          <Text className="font-medium text-primary-foreground">Delete All Data</Text>
        </Button>
      </Card>

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
    </SafeAreaView>
  );
}
