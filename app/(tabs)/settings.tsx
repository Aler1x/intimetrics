import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { useState } from 'react';
import BasicModal from '~/components/ui/basic-modal';
import { X, Trash2 } from 'lucide-react-native';
import { DefaultTheme } from '~/lib/theme';
import { useActivityStore } from '~/store/drizzle-store';
import { showToast } from '~/lib/utils';

export default function SettingsScreen() {
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const { deleteAllActivities } = useActivityStore();

  const handleDeleteAllData = async () => {
    try {
      await deleteAllActivities();
      showToast('All data deleted successfully');
      setIsDeleteConfirmModalOpen(false);
    } catch (error) {
      console.error('Error deleting all data:', error);
      showToast('Error deleting data');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className='w-full flex-row items-center justify-between mb-6'>
        <Text className='text-3xl font-bold'>Settings</Text>
      </View>

      {/* Delete All Data Card */}
      <Card className="p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <Trash2 size={20} color={DefaultTheme.colors.destructive} />
          <Text className="text-lg font-semibold ml-2">Delete All Data</Text>
        </View>
        <Text className="text-gray-600 mb-4 text-sm">
          This will permanently delete all your activities and cannot be undone. This action is irreversible.
        </Text>
        <Button 
          variant="destructive" 
          className="border-destructive"
          onPress={() => setIsDeleteConfirmModalOpen(true)}
        >
          <Text className="text-destructive font-medium">Delete All Data</Text>
        </Button>
      </Card>

      {/* Delete Confirmation Modal */}
      <BasicModal isModalOpen={isDeleteConfirmModalOpen} setIsModalOpen={setIsDeleteConfirmModalOpen} className='gap-4'>
      <View className='flex-row items-center justify-between p-2'>
          <Text className='text-lg font-semibold'>Delete All Data</Text>
          <TouchableOpacity onPress={() => setIsDeleteConfirmModalOpen(false)}>
            <X size={24} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <View className="px-2">
          <Text className="text-base mb-2">Are you sure you want to delete all your data?</Text>
          <Text className="text-sm text-gray-600">
            This action cannot be undone. All your activities will be permanently deleted.
          </Text>
        </View>

        <View className='flex-row items-center gap-2 w-full'>
          <Button 
            variant='outline' 
            className='w-[50%]' 
            onPress={() => setIsDeleteConfirmModalOpen(false)}
          >
            <Text className='font-medium'>Cancel</Text>
          </Button>
          <Button 
            variant='default' 
            className='w-[50%] bg-red-500' 
            onPress={handleDeleteAllData}
            style={{ backgroundColor: '#ef4444' }}
          >
            <Text className='font-medium text-white'>Delete</Text>
          </Button>
        </View>
      </BasicModal>
    </SafeAreaView>
  );
}