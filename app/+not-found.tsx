import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center p-5">
      <Text className="mb-2.5 text-xl font-bold">Oops!</Text>
      <Text className="mb-5 text-center text-base">This screen doesn&apos;t exist.</Text>
      <Link href="/(tabs)" className="mt-4 py-4">
        <Text className="text-sm text-blue-600">Go to home screen!</Text>
      </Link>
    </View>
  );
}
