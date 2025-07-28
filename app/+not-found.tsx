import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center p-5">
      <Text className="text-xl font-bold mb-2.5">Oops!</Text>
      <Text className="text-base text-center mb-5">This screen doesn&apos;t exist.</Text>
      <Link href="/(tabs)" className="mt-4 py-4">
        <Text className="text-sm text-blue-600">Go to home screen!</Text>
      </Link>
    </View>
  );
}