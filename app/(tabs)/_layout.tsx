import { Tabs } from 'expo-router';
import { Award, ChartBar, List, Settings, Users } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TabBar } from '~/components/tab-bar';

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'shift',
        }}
        initialRouteName="index"
        tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => <ChartBar color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="partners"
          options={{
            title: 'Partners',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="list"
          options={{
            title: 'Activities',
            tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: 'Achievements',
            tabBarIcon: ({ color, size }) => <Award color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
