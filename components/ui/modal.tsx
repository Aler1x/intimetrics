import { Modal, ModalProps, Pressable, View } from 'react-native';
import React, { ReactNode, useCallback, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { cn } from '~/lib/utils';

export interface ModalConfig {
  defaultAnimationDuration: {
    in: number;
    out: number;
  };
  defaultBackdropOpacity: number;
  defaultEasing: any;
}

export const defaultConfig: ModalConfig = {
  defaultAnimationDuration: {
    in: 400,
    out: 250,
  },
  defaultBackdropOpacity: 0.5,
  defaultEasing: Easing.out(Easing.cubic),
};

export interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode[] | ReactNode;
  testID?: string;
}

export interface FullscreenModalProps
  extends Omit<ModalProps, 'children' | 'visible' | 'onRequestClose'>,
    BaseModalProps {
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  animationType?: 'slide' | 'fade' | 'none';
}

export interface BottomModalProps extends BaseModalProps {
  className?: string;
  backdropOpacity?: number;
  animationDuration?: {
    in?: number;
    out?: number;
  };
  enableBackdropDismiss?: boolean;
  onAnimationComplete?: (type: 'open' | 'close') => void;
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Enhanced Basic Modal Component with separate animations
 * - Backdrop: Fade in/out animation
 * - Modal Content: Slide from bottom with spring animation
 * - Backdrop tap to close with smooth animation
 */
export function BottomModal({
  visible,
  onClose,
  children,
  className,
  backdropOpacity = defaultConfig.defaultBackdropOpacity,
  animationDuration = defaultConfig.defaultAnimationDuration,
  enableBackdropDismiss = true,
  onAnimationComplete,
}: BottomModalProps) {
  const backdropOpacityValue = useSharedValue(0);
  const modalTranslateY = useSharedValue(1000);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  const animateIn = useCallback(() => {
    backdropOpacityValue.value = withTiming(1, {
      duration: animationDuration.in,
    });
    modalTranslateY.value = withTiming(
      0,
      {
        duration: animationDuration.in,
        easing: defaultConfig.defaultEasing,
      },
      (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)('open');
        }
      }
    );
  }, [backdropOpacityValue, modalTranslateY, animationDuration.in, onAnimationComplete]);

  const animateOut = useCallback(
    (callback?: () => void) => {
      backdropOpacityValue.value = withTiming(0, {
        duration: animationDuration.out,
      });
      modalTranslateY.value = withTiming(
        1000,
        {
          duration: animationDuration.out,
        },
        (finished) => {
          if (finished) {
            if (callback) {
              runOnJS(callback)();
            }
            if (onAnimationComplete) {
              runOnJS(onAnimationComplete)('close');
            }
          }
        }
      );
    },
    [backdropOpacityValue, modalTranslateY, animationDuration.out, onAnimationComplete]
  );

  useEffect(() => {
    if (visible) {
      animateIn();
    } else {
      animateOut();
    }
  }, [visible, animateIn, animateOut]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacityValue.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const handleBackdropPress = useCallback(() => {
    if (!enableBackdropDismiss) return;
    animateOut(closeModal);
  }, [enableBackdropDismiss, animateOut, closeModal]);

  const handleModalPress = useCallback(() => {
    // Prevent event bubbling
  }, []);

  return (
    <Modal
      visible={visible}
      onRequestClose={handleBackdropPress}
      onAccessibilityEscape={handleBackdropPress}
      animationType="none"
      transparent={true}>
      <AnimatedPressable
        className="flex-1 justify-end"
        style={[
          {
            backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
          },
          backdropAnimatedStyle,
        ]}
        onPress={handleBackdropPress}>
        <AnimatedPressable
          className={cn('w-full rounded-t-2xl bg-background p-6 shadow-2xl', className)}
          style={modalAnimatedStyle}
          onPress={handleModalPress}>
          {children}
        </AnimatedPressable>
      </AnimatedPressable>
    </Modal>
  );
}

export function FullscreenModal({
  visible,
  onClose,
  children,
  animationType = 'slide',
  presentationStyle = 'fullScreen',
  testID,
  ...modalProps
}: FullscreenModalProps) {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
      testID={testID}
      {...modalProps}>
      <View className="flex-1 bg-background p-4">{children}</View>
    </Modal>
  );
}
