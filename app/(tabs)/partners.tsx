import { TouchableOpacity, View, ToastAndroid } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Plus, X, Trash2, Heart } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomModal } from '~/components/ui/modal';
import { useState, useCallback } from 'react';
import { Input } from '~/components/ui/input';
import { DefaultTheme } from '~/lib/theme';
import InputWithDropdown, { type SelectListData } from '~/components/ui/input-with-dropdown';
import { usePartnersStore } from '~/store/partners-store';
import { Card } from '~/components/ui/card';
import type { ListPartner, RelationshipType } from '~/types';
import { showToast } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { useFocusEffect } from 'expo-router';
import DeleteConfirmation from '~/components/delete-confirmation';
import * as Haptics from 'expo-haptics';

const relationshipTypes: SelectListData[] = [
  { id: 'friend', value: 'Friend' },
  { id: 'partner', value: 'Partner' },
  { id: 'casual', value: 'Casual' },
  { id: 'other', value: 'Other' },
];

const renderPartner = (
  item: ListPartner,
  setPartnerToDelete: (partner: ListPartner) => void,
  setIsDeleteConfirmModalOpen: (isOpen: boolean) => void
) => (
  <Card
    className="mb-2 flex-row items-center justify-between p-4"
    onTouchEnd={() => {
      if (item.activityCount === 1) {
        showToast(`${item.name} was your one night stand!`);
      }
      if (item.activityCount > 2 && item.activityCount < 10) {
        showToast(`${item.name} has ${item.activityCount} activities`);
      }
      if (item.activityCount >= 10 && item.activityCount < 100) {
        showToast(`So fucking awesome!`);
      }
      if (item.activityCount > 100) {
        showToast('Bed broken now!');
      }
      if (item.activityCount === 0) {
        showToast(`${item.name} has no activities`);
      }
    }}>
    <View className="flex-1">
      <Text className="text-lg font-semibold">{item.name}</Text>
      {item.relationshipType && (
        <Text className="text-sm capitalize text-muted-foreground">{item.relationshipType}</Text>
      )}
    </View>
    {item.activityCount > 0 && (
      <Badge variant="default" className="text-xs">
        <Text className="text-md">{item.activityCount}</Text>
      </Badge>
    )}
    <TouchableOpacity
      className="p-2"
      onPress={() => {
        setPartnerToDelete(item);
        setIsDeleteConfirmModalOpen(true);
      }}>
      <Trash2 size={20} color={DefaultTheme.colors.destructive} />
    </TouchableOpacity>
  </Card>
);

export default function PartnersScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relationshipType, setRelationshipType] = useState<SelectListData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<ListPartner | null>(null);
  const { partners, addPartner, removePartner, refreshPartners } = usePartnersStore();
  let loading = false;

  const handleAddPartner = async () => {
    if (!name.trim() || !relationshipType?.id) return;

    setIsSubmitting(true);
    try {
      await addPartner(name.trim(), relationshipType.id as RelationshipType);
      setName('');
      setRelationshipType(null);
      setIsModalOpen(false);
      showToast('Partner added successfully');
    } catch (error) {
      showToast('Error adding partner', ToastAndroid.SHORT);
      console.error('Error adding partner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setName('');
    setRelationshipType(null);
    setIsModalOpen(false);
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    await removePartner(partnerToDelete.id);
    setPartnerToDelete(null);
    setIsDeleteConfirmModalOpen(false);
  };

  useFocusEffect(
    useCallback(() => {
      refreshPartners();
    }, [refreshPartners])
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="w-full flex-row items-center justify-between">
        <Text className="text-3xl font-bold">
          Your <Heart size={22} color={DefaultTheme.colors.foreground} /> Partners
        </Text>
      </View>

      <FlashList
        data={partners || []}
        renderItem={({ item }) =>
          renderPartner(item, setPartnerToDelete, setIsDeleteConfirmModalOpen)
        }
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={10}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-center text-muted-foreground">
              No partners yet.{'\n'}Add your first partner to get started.
            </Text>
          </View>
        }
        onRefresh={refreshPartners}
        refreshing={loading}
        className="gap-4 py-4"
        ListFooterComponent={() => <View className="h-20" />}
      />

      <View className="absolute bottom-0 left-0 right-0 items-center pb-28">
        <Button
          variant="default"
          className="w-[50%]"
          onPress={() => setIsModalOpen(true)}
          onLongPress={() => {
            showToast('Enough!', 10);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }}
          style={{
            elevation: 10,
          }}>
          <View className="flex-row items-center gap-2">
            <Plus size={24} color="white" />
            <Text className="font-medium text-white">Add Partner</Text>
          </View>
        </Button>
      </View>

      <BottomModal visible={isModalOpen} onClose={handleModalClose} className="gap-5 pb-10">
        <View className="flex-row items-center justify-between p-2">
          <Text className="text-lg font-semibold">Add new sexual partner</Text>
          <TouchableOpacity onPress={handleModalClose}>
            <X size={24} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <Input
          placeholder="Name"
          value={name}
          onChangeText={setName}
          className="rounded-[10px] px-4"
        />

        <InputWithDropdown
          placeholder="Relationship Type"
          value={relationshipType?.value}
          setSelected={setRelationshipType}
          data={relationshipTypes}
          maxHeight={160}
          triggerKeyboard={false}
        />

        <View className="flex-row gap-3">
          <Button
            className="flex-1 bg-primary"
            onPress={handleAddPartner}
            disabled={!name.trim() || isSubmitting}>
            <Text className="text-white">{isSubmitting ? 'Adding...' : 'Add'}</Text>
          </Button>
        </View>
      </BottomModal>

      <DeleteConfirmation
        visible={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onDelete={handleDeletePartner}
        onCancel={() => setIsDeleteConfirmModalOpen(false)}
        title="Delete Partner"
        message={`Are you sure you want to delete ${partnerToDelete?.name}?`}
        deleteText="Delete"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
}
