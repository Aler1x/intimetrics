import { View, TouchableOpacity, Linking } from 'react-native';
import { BottomModal } from '~/components/ui/modal';
import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { X, Mail, Heart, Github } from 'lucide-react-native';
import { DefaultTheme } from '~/lib/theme';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AboutModal({ visible, onClose }: AboutModalProps) {
  const openEmail = () => {
    Linking.openURL(`mailto:${process.env.EXPO_PUBLIC_SUPPORT_EMAIL}`);
  };

  const openGithub = () => {
    Linking.openURL('https://github.com/aler1x');
  };

  const openMonobank = () => {
    Linking.openURL(process.env.EXPO_PUBLIC_MONOBANK_JAR || '');
  };

  return (
    <BottomModal visible={visible} onClose={onClose}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Text className="text-xl font-semibold">About</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color={DefaultTheme.colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Developer Info */}
      <Card className="mb-4 p-4">
        <View className="flex-row items-center justify-center mb-3">
          <Github size={20} color={DefaultTheme.colors.primary} />
          <Text className="ml-2 text-lg font-semibold">Developed by Alerix</Text>
        </View>
        <Text className="text-sm text-gray-600 text-center mb-3">
          Passionate developer creating useful applications
        </Text>
        <Button
          variant="outline"
          onPress={openGithub}
          className="w-full">
          <Text>Visit GitHub Profile</Text>
        </Button>
      </Card>

      {/* Support Info */}
      <Card className="mb-4 p-4">
        <View className="flex-row items-center justify-center mb-3">
          <Mail size={20} color={DefaultTheme.colors.primary} />
          <Text className="ml-2 text-lg font-semibold">Support</Text>
        </View>
        <Text className="text-sm text-gray-600 text-center mb-3">
          Need help or have questions? Get in touch!
        </Text>
        <Button
          variant="outline"
          onPress={openEmail}
          className="w-full">
          <Text>Contact Support</Text>
        </Button>
      </Card>

      {/* Monobank Support */}
      <Card className="mb-4 p-4">
        <View className="flex-row items-center justify-center mb-3">
          <Heart size={20} color={DefaultTheme.colors.primary} />
          <Text className="ml-2 text-lg font-semibold">Support via Monobank</Text>
        </View>
        <Text className="text-sm text-gray-600 text-center mb-3">
          Support the development of this app via Monobank jar
        </Text>
        <Button
          variant="default"
          onPress={openMonobank}
          className="w-full">
          <Text>Support via Monobank</Text>
        </Button>
      </Card>
    </BottomModal >
  );
}