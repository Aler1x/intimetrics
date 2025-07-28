import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { DefaultTheme } from '~/lib/theme';

interface AutoResizingInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

const AutoResizingInput: React.FC<AutoResizingInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Type your message...',
}) => {
  const [inputHeight, setInputHeight] = useState(50);
  const inputRef = useRef<TextInput>(null);

  // Animation for send button press
  const animationProgress = useSharedValue(0);

  const handleTextChange = (newText: string) => {
    onChangeText?.(newText);

    // Calculate height based on lines
    const lines = newText.split('\n');
    const lineCount = Math.max(1, lines.length);

    /**
     * 1 line: 50px
     * 2 lines: 60px
     * 3-7 lines: 22px per line
     * 8+ lines: skip because it's too tall and broke modal
     */

    if (lineCount === 1) {
      setInputHeight(50);
    } else if (lineCount === 2) {
      setInputHeight(60);
    } else if (lineCount <= 8) {
      const newInputHeight = lineCount * 22;
      setInputHeight(newInputHeight);
    }
  };

  // Handle key press for web (Enter to send)
  const handleKeyPress = (e: any) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  // Handle input container press to focus input (especially for web)
  const handleInputContainerPress = () => {
    inputRef.current?.focus();
  };

  // Container height = input height + minimal padding for visual comfort
  const containerHeight = inputHeight + 10;

  // Simple animated styles - only animate scale, not height to avoid conflict with KeyboardAvoidingView
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(animationProgress.value, [0, 1], [1, 0.95]);
    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      style={[
        animatedContainerStyle,
        {
          height: containerHeight,
        },
      ]}
      className="overflow-hidden rounded-[10px] border border-border">
      {/* Input area */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleInputContainerPress}
        className="flex-1 px-6">
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          placeholderTextColor={DefaultTheme.colors.mutedForeground}
          multiline
          className="text-base text-foreground"
          style={{
            fontSize: 16,
            lineHeight: 20,
            height: inputHeight,
            ...(Platform.OS === 'android' && {
              marginTop: 4,
            }),
            // Remove focus outline/border
            ...(Platform.OS === 'web' && {
              outline: 'none',
              border: 'none',
            }),
          }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AutoResizingInput;