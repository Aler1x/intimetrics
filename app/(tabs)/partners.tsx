import { TouchableOpacity, View, ToastAndroid } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Plus, X, Trash2, Heart } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import BasicModal from '~/components/ui/basic-modal';
import { useEffect, useState } from 'react';
import { Input } from '~/components/ui/input';
import { DefaultTheme } from '~/lib/theme';
import InputWithDropdown, { type SelectListData } from '~/components/ui/input-with-dropdown';
import { usePartnersStore } from '~/store/drizzle-store';
import { Card } from '~/components/ui/card';
import type { ListPartner, RelationshipType } from '~/types';
import { showToast } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';

const relationshipTypes: SelectListData[] = [
  { id: 'friend', value: 'Friend' },
  { id: 'partner', value: 'Partner' },
  { id: 'casual', value: 'Casual' },
  { id: 'one-night-stand', value: 'One-Night Stand' },
  { id: 'long-term', value: 'Long-Term' },
  { id: 'other', value: 'Other' },
];

const renderPartner = (item: ListPartner, removePartner: (id: number) => void) => (
  <Card className='flex-row items-center justify-between p-4 mb-2'>
    <View className='flex-1'>
      <Text className='text-lg font-semibold'>{item.name}</Text>
      {item.relationshipType && (
        <Text className='text-sm text-muted-foreground capitalize'>{item.relationshipType}</Text>
      )}
    </View>
    {item.activityCount > 0 && (
      <Badge variant='default' className='text-xs'>
        <Text className='text-md'>{item.activityCount}</Text>
      </Badge>
    )}
    <TouchableOpacity
      className='p-2'
      onPress={() => {
        removePartner(item.id);
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

  useEffect(() => {
    refreshPartners();
  }, [refreshPartners]);

  return (
    <SafeAreaView className='flex-1 bg-background p-4'>
      <View className='w-full flex-row items-center justify-between'>
        <Text className='text-3xl font-bold'>Your <Heart size={22} color={DefaultTheme.colors.foreground} /> Partners</Text>
      </View>

      <FlashList
        data={partners || []}
        renderItem={({ item }) => renderPartner(item, removePartner)}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={10}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className='flex-1 items-center justify-center py-8'>
            <Text className='text-muted-foreground text-center'>
              No partners yet.{'\n'}Add your first partner to get started.
            </Text>
          </View>
        }
        onRefresh={refreshPartners}
        refreshing={loading}
        className='py-4 gap-4'
      />

      <View className='absolute bottom-0 left-0 right-0 items-center pb-28'>
        <Button
          variant='default'
          className='w-[50%]'
          onPress={() => setIsModalOpen(true)}
          style={{
            elevation: 10,
          }}>
          <View className='flex-row items-center gap-2'>
            <Plus size={24} color='white' />
            <Text className='font-medium text-white'>Add Partner</Text>
          </View>
        </Button>
      </View>

      <BasicModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} className='gap-5 pb-10'>
        <View className='flex-row items-center justify-between p-2'>
          <Text className='text-lg font-semibold'>Add new sexual partner</Text>
          <TouchableOpacity onPress={handleModalClose}>
            <X size={24} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <Input
          placeholder='Name'
          value={name}
          onChangeText={setName}
          className='rounded-[10px] px-4'
        />

        <InputWithDropdown
          placeholder='Relationship Type'
          value={relationshipType?.value}
          setSelected={setRelationshipType}
          data={relationshipTypes}
          maxHeight={120}
        />

        <View className='flex-row gap-3'>
          <Button
            className='flex-1 bg-primary'
            onPress={handleAddPartner}
            disabled={!name.trim() || isSubmitting}>
            <Text className='text-white'>
              {isSubmitting ? 'Adding...' : 'Add'}
            </Text>
          </Button>
        </View>
      </BasicModal>
    </SafeAreaView>
  );
}