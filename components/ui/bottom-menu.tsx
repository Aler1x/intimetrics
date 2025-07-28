import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface BottomMenuExpandableProps {
  isDarkTheme?: boolean;
}

const BottomMenuExpandable: React.FC<BottomMenuExpandableProps> = ({ isDarkTheme = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Animated values
  const menuWidth = useSharedValue(140);
  const menuHeight = useSharedValue(60);
  const rotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const itemsOpacity = useSharedValue(0);
  const expandedItemsTranslateY = useSharedValue(50);
  const containerTranslateX = useSharedValue(0);
  const blurOpacity = useSharedValue(0);
  const chatOpacity = useSharedValue(1);

  // Theme colors
  const themeColors = {
    menuBg: isDarkTheme ? '#1C1C1E' : '#FFFFFF',
    iconColor: isDarkTheme ? '#FFFFFF' : '#000000',
    textColor: isDarkTheme ? '#FFFFFF' : '#000000',
    textSecondary: isDarkTheme ? '#8E8E93' : '#6D6D70',
    accentColor: '#AFFF00',
    shadowColor: isDarkTheme ? '#000000' : '#000000',
    border: isDarkTheme ? '#38383A' : '#E5E5E7',
    separator: isDarkTheme ? '#38383A' : '#E5E5E7',
  };

  // Handle expansion function
  const handleExpand = () => {
    if (!isExpanded) {
      // Haptic feedback on opening
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Calculate offset to center expanded menu
      const expandedWidth = screenWidth - 40;
      const currentWidth = 140;
      const centerOffset = (expandedWidth - currentWidth) / 2;

      // Expansion animation
      menuWidth.value = withSpring(expandedWidth, { damping: 20, stiffness: 150 });
      menuHeight.value = withSpring(280, { damping: 20, stiffness: 150 });
      containerTranslateX.value = withSpring(-centerOffset, { damping: 20, stiffness: 150 });
      rotation.value = withSpring(45, { damping: 20, stiffness: 150 });

      // Blur animation
      blurOpacity.value = withTiming(1, { duration: 200 });

      // Chat animation - fade out
      chatOpacity.value = withTiming(0, { duration: 150 });

      // Text animations with delay
      setTimeout(() => {
        textOpacity.value = withTiming(1, { duration: 200 });
        itemsOpacity.value = withTiming(1, { duration: 250 });
        expandedItemsTranslateY.value = withSpring(0, { damping: 18, stiffness: 120 });
      }, 200);

      runOnJS(setIsExpanded)(true);
    } else {
      // Closing animation
      textOpacity.value = withTiming(0, { duration: 150 });
      itemsOpacity.value = withTiming(0, { duration: 150 });
      expandedItemsTranslateY.value = withSpring(50, { damping: 18, stiffness: 120 });
      blurOpacity.value = withTiming(0, { duration: 200 });

      // Chat logo return animation
      setTimeout(() => {
        chatOpacity.value = withSpring(1, { damping: 15, stiffness: 120 });
      }, 100);

      setTimeout(() => {
        menuWidth.value = withSpring(140, { damping: 20, stiffness: 150 });
        menuHeight.value = withSpring(60, { damping: 20, stiffness: 150 });
        containerTranslateX.value = withSpring(0, { damping: 20, stiffness: 150 });
        rotation.value = withSpring(0, { damping: 20, stiffness: 150 });
      }, 150);

      runOnJS(setIsExpanded)(false);
    }
  };

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: containerTranslateX.value }],
  }));

  const animatedMenuStyle = useAnimatedStyle(() => ({
    width: menuWidth.value,
    height: menuHeight.value,
  }));

  const animatedPlusIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedChatStyle = useAnimatedStyle(() => ({
    opacity: chatOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedExpandedItemsStyle = useAnimatedStyle(() => ({
    opacity: itemsOpacity.value,
    transform: [{ translateY: expandedItemsTranslateY.value }],
  }));

  const animatedBlurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  // Menu items data
  const menuItems = [
    { id: 1, icon: 'chatbubble-outline', text: 'Chat', color: themeColors.accentColor },
    { id: 2, icon: 'search-outline', text: 'Search', color: '#FF9500' },
    { id: 3, icon: 'heart-outline', text: 'Favorites', color: '#FF3B30' },
    { id: 4, icon: 'person-outline', text: 'Profile', color: '#34C759' },
    { id: 5, icon: 'settings-outline', text: 'Settings', color: '#8E8E93' },
    { id: 6, icon: 'notifications-outline', text: 'Notifications', color: '#FF2D92' },
    { id: 7, icon: 'bookmark-outline', text: 'Bookmarks', color: '#5856D6' },
    { id: 8, icon: 'camera-outline', text: 'Camera', color: '#32D74B' },
    { id: 9, icon: 'mail-outline', text: 'Messages', color: '#007AFF' },
    { id: 10, icon: 'calendar-outline', text: 'Calendar', color: '#FF3B30' },
  ];

  return (
    <>
      {/* Blur overlay - clickable to close */}
      {isExpanded && (
        <Animated.View style={[styles.blurOverlay, animatedBlurStyle]}>
          <TouchableOpacity style={styles.blurTouchable} activeOpacity={1} onPress={handleExpand}>
            <BlurView
              intensity={20}
              style={[
                styles.blurView,
                { backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' },
              ]}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View
        style={[styles.container, animatedContainerStyle, { left: (screenWidth - 140) / 2 }]}>
        <Animated.View
          style={[
            styles.menu,
            animatedMenuStyle,
            {
              backgroundColor: themeColors.menuBg,
              shadowColor: themeColors.shadowColor,
              shadowOpacity: isDarkTheme ? 0.4 : 0.15,
              borderColor: themeColors.border,
            },
          ]}>
          {/* Compact menu (initial state) */}
          {!isExpanded && (
            <View style={styles.compactMenu}>
              <TouchableOpacity style={styles.chatSection}>
                <Animated.View style={[animatedChatStyle, styles.chatContainer]}>
                  <Ionicons name="chatbubble-outline" size={20} color={themeColors.accentColor} />
                  <Text style={[styles.chatText, { color: themeColors.textColor }]}>Chat</Text>
                </Animated.View>
              </TouchableOpacity>

              {/* Separator */}
              <View style={[styles.separator, { backgroundColor: themeColors.separator }]} />

              <TouchableOpacity onPress={handleExpand} style={styles.plusButton}>
                <Animated.View style={animatedPlusIconStyle}>
                  <Ionicons name="add" size={20} color={themeColors.accentColor} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          )}

          {/* Expanded menu */}
          {isExpanded && (
            <View style={styles.expandedMenu}>
              {/* Header */}
              <View style={styles.header}>
                <Animated.Text
                  style={[animatedTextStyle, styles.headerTitle, { color: themeColors.textColor }]}>
                  Menu Principal
                </Animated.Text>

                <TouchableOpacity onPress={handleExpand}>
                  <Animated.View style={animatedPlusIconStyle}>
                    <Ionicons name="add" size={28} color={themeColors.accentColor} />
                  </Animated.View>
                </TouchableOpacity>
              </View>

              {/* Header separator */}
              <Animated.View
                style={[
                  animatedTextStyle,
                  styles.headerSeparator,
                  { backgroundColor: themeColors.separator },
                ]}
              />

              {/* Scrollable menu items */}
              <Animated.View style={[animatedExpandedItemsStyle, styles.itemsContainer]}>
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}>
                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.menuItem,
                        { marginBottom: index < menuItems.length - 1 ? 8 : 0 },
                      ]}>
                      <View style={styles.iconContainer}>
                        <Ionicons name={item.icon as any} size={24} color={item.color} />
                      </View>

                      <View style={styles.textContainer}>
                        <Text style={[styles.itemText, { color: themeColors.textColor }]}>
                          {item.text}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={themeColors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  // Blur overlay styles
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  blurTouchable: {
    flex: 1,
  },
  blurView: {
    flex: 1,
  },

  // Container styles
  container: {
    position: 'absolute',
    bottom: 32,
    zIndex: 1000,
  },
  menu: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },

  // Compact menu styles
  compactMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chatSection: {
    flex: 1,
  },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  chatText: {
    marginLeft: 4,
    fontSize: 20,
    fontFamily: 'InstrumentSerif-Italic',
  },
  separator: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  plusButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Expanded menu styles
  expandedMenu: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif-Italic',
  },
  headerSeparator: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },

  // Menu items styles
  itemsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '400',
  },
});

export default BottomMenuExpandable;