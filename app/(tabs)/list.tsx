import { FlashList } from '@shopify/flash-list';
import { BookHeart } from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { DefaultTheme } from '~/lib/theme';
import { Badge } from '~/components/ui/badge';
import { useActivityStore } from '~/store/drizzle-store';
import type { Activity } from '~/db/schema';
import { useEffect } from 'react';

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
    <Card className='flex-col items-center justify-between p-4 mb-2'>
      <View className='flex-row items-center justify-between'>
        <View className='flex-1'>
          <Text className='text-lg font-semibold'>{text}</Text>
        </View>
        <Badge variant='outline' className='px-2 py-1'>
          <Text className='text-md'>{item.date}</Text>
        </Badge>
      </View>
      <View className='flex-1 w-full'>
        <Text className='text-sm text-muted-foreground'>{item.description}</Text>
      </View>
    </Card>
  )
};

export default function ListScreen() {

  const { activities, refreshActivities } = useActivityStore();
  let loading = false;

  useEffect(() => {
    refreshActivities();
  }, [refreshActivities]);

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className='flex-row items-center justify-between'>
        <Text className='text-3xl font-bold'>Your <BookHeart size={22} color={DefaultTheme.colors.foreground} /> Activity Log</Text>
      </View>
      <FlashList
        data={activities || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderActivity(item)}
        onRefresh={refreshActivities}
        refreshing={loading}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className='flex-1 items-center justify-center py-8'>
            <Text className='text-muted-foreground text-center'>
              No activities yet.{'\n'}Add your first activity to get started.
            </Text>
          </View>
        }
        className='py-4 gap-4'
      />
    </SafeAreaView>
  );
}