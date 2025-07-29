import { LayoutChangeEvent, View } from 'react-native';
import { useLinkBuilder } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useState } from 'react';
import { DefaultTheme } from '~/lib/theme';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder();
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(buttonWidth * state.index);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    };
  });

  return (
    <View className="absolute bottom-10 mx-20 flex-row items-center justify-between rounded-2xl bg-primary py-3 shadow-lg" onLayout={onTabbarLayout}>
      <Animated.View
        style={[animatedStyle, {
          position: 'absolute',
          bottom: 2,
          left: 5,
          height: 45,
          width: 45,
          borderRadius: 13,
          backgroundColor: DefaultTheme.colors.card,
        }]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const Icon = options.tabBarIcon as React.ComponentType<{ color: string; size: number }>;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withTiming(buttonWidth * index, {
            duration: 150,
          }); 

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
            className="flex-1 items-center justify-center"
            pressColor="transparent">
            <Icon color={isFocused ? '#cdd6f4' : '#1e1e2e'} size={28} />
          </PlatformPressable>
        );
      })}
    </View>
  );
}
