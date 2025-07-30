import { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { BottomModal } from '~/components/ui/modal';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useActivityStore } from '~/store/activity-store';
import { usePartnersStore } from '~/store/partners-store';
import { useAchievementsStore } from '~/store/achievements-store';
import { showToast } from '~/lib/utils';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Download, Upload, Database } from 'lucide-react-native';
import { DefaultTheme } from '~/lib/theme';

interface DataManagementProps {
  visible: boolean;
  onClose: () => void;
}

interface ExportData {
  version: string;
  exportDate: string;
  activities: any[];
  partners: any[];
  achievements: any[];
}

export default function DataManagement({ visible, onClose }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { activities, refreshActivities } = useActivityStore();
  const { partners, refreshPartners } = usePartnersStore();
  const { achievements, refreshAchievements } = useAchievementsStore();

  const exportData = async () => {
    setIsExporting(true);
    try {
      const exportData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        activities,
        partners,
        achievements,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `intimetrics-backup-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Data',
        });
      } else {
        showToast('Data exported successfully');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Error exporting data');
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async () => {
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        setIsImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const importedData: ExportData = JSON.parse(fileContent);

      // Validate the imported data structure
      if (!importedData.version || !importedData.activities || !importedData.partners || !importedData.achievements) {
        throw new Error('Invalid data format');
      }

      // Show confirmation dialog
      Alert.alert(
        'Import Data',
        `This will replace all current data with ${importedData.activities.length} activities, ${importedData.partners.length} partners, and ${importedData.achievements.length} achievements. Are you sure?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                // Import the data using the store functions
                await importDataToDatabase(importedData);
                showToast('Data imported successfully');
                onClose();
              } catch (error) {
                console.error('Error importing data:', error);
                showToast('Error importing data');
              } finally {
                setIsImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error importing data:', error);
      showToast('Error importing data');
      setIsImporting(false);
    }
  };

  const importDataToDatabase = async (importedData: ExportData) => {
    const { db } = await import('~/store/database');
    const { activities: activitiesTable, partners: partnersTable, achievements: achievementsTable } = await import('~/db/schema');

    // Clear existing data
    await db.delete(activitiesTable);
    await db.delete(partnersTable);
    await db.delete(achievementsTable);

    // Import activities
    if (importedData.activities.length > 0) {
      await db.insert(activitiesTable).values(importedData.activities);
    }

    // Import partners
    if (importedData.partners.length > 0) {
      await db.insert(partnersTable).values(importedData.partners);
    }

    // Import achievements
    if (importedData.achievements.length > 0) {
      await db.insert(achievementsTable).values(importedData.achievements);
    }

    // Refresh all stores
    await refreshActivities();
    await refreshPartners();
    await refreshAchievements();
  };

  return (
    <BottomModal visible={visible} onClose={onClose} className='gap-4'>
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold">Data Management</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-muted-foreground">
        Export your data as JSON or import previously exported data.
      </Text>

      {/* Export Data */}
      <Card className="p-4">
        <View className="mb-3 flex-row items-center">
          <Download size={20} color={DefaultTheme.colors.primary} />
          <Text className="ml-2 text-lg font-semibold">Export Data</Text>
        </View>
        <Text className="mb-4 text-sm text-gray-600">
          Export all your activities, partners, and achievements as a JSON file.
        </Text>
        <View className="flex-row items-center justify-between">
          <Button
            onPress={exportData}
            disabled={isExporting}
            className="bg-primary w-full">
            <Text className="text-primary-foreground">
              {isExporting ? 'Exporting...' : 'Export'}
            </Text>
          </Button>
        </View>
      </Card>

      {/* Import Data */}
      <Card className="p-4">
        <View className="mb-3 flex-row items-center">
          <Upload size={20} color={DefaultTheme.colors.secondary} />
          <Text className="ml-2 text-lg font-semibold">Import Data</Text>
        </View>
        <Text className="mb-4 text-sm text-gray-600">
          Import previously exported data. This will replace all current data.
        </Text>
        <Button
          variant="default"
          onPress={importData}
          disabled={isImporting}
          className="bg-secondary">
          <Text className={isImporting ? 'text-muted-foreground' : 'text-secondary-foreground'}>
            {isImporting ? 'Importing...' : 'Import'}
          </Text>
        </Button>
      </Card>

      {/* Data Info */}
      <Card className="p-4">
        <View className="mb-3 flex-row items-center">
          <Database size={20} color="#6b7280" />
          <Text className="ml-2 text-lg font-semibold">Data Summary</Text>
        </View>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted-foreground">Activities:</Text>
            <Text className="text-sm font-medium">{activities.length}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted-foreground">Partners:</Text>
            <Text className="text-sm font-medium">{partners.length}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted-foreground">Achievements:</Text>
            <Text className="text-sm font-medium">{achievements.length}</Text>
          </View>
        </View>
      </Card>
    </BottomModal>
  );
} 