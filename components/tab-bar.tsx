import { View } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View className="absolute bottom-10 mx-20 flex-row items-center justify-between rounded-full bg-primary py-3 shadow-lg">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const Icon = options.tabBarIcon as React.ComponentType<{ color: string; size: number }>;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center rounded-full"
            pressColor="transparent">
            <Icon color={isFocused ? '#cdd6f4' : '#1e1e2e'} size={28} />
          </PlatformPressable>
        );
      })}
    </View>
  );
}
