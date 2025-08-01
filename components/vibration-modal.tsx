import { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomModal } from '~/components/ui/modal';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import InputWithDropdown, { type SelectListData } from '~/components/ui/input-with-dropdown';
import { Switch } from '~/components/ui/switch';
import { Label } from './ui/label';

interface VibrationModalProps {
  visible: boolean;
  onClose: () => void;
}

const FEEDBACK_STYLES: SelectListData[] = [
  { id: 'light', value: 'Light' },
  { id: 'medium', value: 'Medium' },
  { id: 'heavy', value: 'Heavy' },
  { id: 'soft', value: 'Soft' },
];

const getHapticStyle = (style: string): Haptics.ImpactFeedbackStyle => {
  switch (style) {
    case 'light':
      return Haptics.ImpactFeedbackStyle.Light;
    case 'medium':
      return Haptics.ImpactFeedbackStyle.Medium;
    case 'heavy':
      return Haptics.ImpactFeedbackStyle.Heavy;
    case 'rigid':
      return Haptics.ImpactFeedbackStyle.Rigid;
    case 'soft':
      return Haptics.ImpactFeedbackStyle.Soft;
    default:
      return Haptics.ImpactFeedbackStyle.Medium;
  }
};

export default function VibrationModal({ visible, onClose }: VibrationModalProps) {
  const [intervalTime, setIntervalTime] = useState('100');
  const [feedbackStyle, setFeedbackStyle] = useState<string>('medium');
  const [isVibrating, setIsVibrating] = useState(false);
  const [isInfinite, setIsInfinite] = useState(false);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startVibration = () => {
    if (isVibrating) return;

    setIsVibrating(true);
    const intervalMs = parseInt(intervalTime) || 100;
    const hapticStyle = getHapticStyle(feedbackStyle);

    // Initial vibration
    Haptics.impactAsync(hapticStyle);

    if (isInfinite) {
      // Infinite vibration
      const interval = setInterval(() => Haptics.impactAsync(hapticStyle), intervalMs);
      vibrationIntervalRef.current = interval;
    } else {
      // Single vibration after delay
      setTimeout(() => {
        setIsVibrating(false);
      }, intervalMs);
    }
  };

  const stopVibration = () => {
    setIsVibrating(false);
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      stopVibration();
    }
  }, [visible]);

  return (
    <BottomModal visible={visible} onClose={onClose} className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold">🎉 Vibration Easter Egg</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-muted-foreground">
        Experiment with different vibration patterns and feedback styles!
      </Text>

      {/* Interval Control */}
      <Card className="p-4">
        <Text className="mb-2 font-semibold">Vibration Interval (ms)</Text>
        <Input
          value={intervalTime}
          onChangeText={setIntervalTime}
          placeholder="100"
          keyboardType="numeric"
          className="mb-2"
        />
        <Text className="text-xs text-muted-foreground">
          Set the interval between vibrations in milliseconds
        </Text>
      </Card>

      {/* Feedback Style Control */}
      <Card className="p-4">
        <Text className="mb-2 font-semibold">Feedback Style</Text>
        <InputWithDropdown
          placeholder="Select feedback style"
          value={feedbackStyle}
          setSelected={(value) => setFeedbackStyle(value?.id || 'medium')}
          data={FEEDBACK_STYLES}
          maxHeight={120}
          allowFreeText={false}
          triggerKeyboard={false}
        />
        <Text className="mt-2 text-xs text-muted-foreground">
          Choose the intensity of the haptic feedback
        </Text>
      </Card>

      {/* Infinite Vibration Toggle */}
      <Card className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-semibold">Infinite Vibration</Text>
            <Text className="text-xs text-muted-foreground">Keep vibrating until stopped</Text>
          </View>
          <Switch
            checked={isInfinite}
            onCheckedChange={setIsInfinite}
            nativeID="infinite-vibration-toggle"
          />
        </View>
      </Card>

      {!isVibrating ? (
        <Button onPress={startVibration} className="w-full">
          <Text className="text-primary-foreground">Vibrate</Text>
        </Button>
      ) : (
        <Button variant="destructive" onPress={stopVibration} className="w-full">
          <Text className="text-primary-foreground">Stop</Text>
        </Button>
      )}

      {/* Status */}
      {isVibrating && isInfinite && (
        <Card className="bg-primary/10 p-3">
          <Text className="text-center text-sm font-medium text-primary">⚡ Vibrating...</Text>
        </Card>
      )}
    </BottomModal>
  );
}
