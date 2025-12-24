import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { chatColors, chatBorderRadius, chatShadows } from './chatTheme';

export function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let isMounted = true;

    const createAnimation = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease,
            delay,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ])
      );

    const checkAndAnimate = async () => {
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      if (!isMounted) return;
      if (reduceMotion) {
        dot1.setValue(0.6);
        dot2.setValue(0.6);
        dot3.setValue(0.6);
      } else {
        animationRef.current = Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 150),
          createAnimation(dot3, 300),
        ]);
        animationRef.current.start();
      }
    };

    checkAndAnimate();
    return () => {
      isMounted = false;
      animationRef.current?.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [dot1, dot2, dot3]);

  const getDotStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      },
    ],
  });

  return (
    <View
      style={styles.container}
      accessibilityLabel="AI正在思考"
      accessibilityRole="text"
    >
      <View style={styles.avatar}>
        <Ionicons name="sparkles" size={14} color={chatColors.surface} />
      </View>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    ...chatShadows.sm,
  },
  bubble: {
    backgroundColor: chatColors.surface,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: chatBorderRadius.lg,
    borderTopLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    ...chatShadows.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: chatColors.textSecondary,
  },
});
