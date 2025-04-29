import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getColors } from '../../constants/colors';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  gradientColors?: string[];
  textColor?: string;
  textStyle?: any;
  showGlow?: boolean;
  animationDuration?: number;
  text?: string;
}

export function CircularProgress({
  progress,
  size = 40,
  strokeWidth = 3,
  backgroundColor,
  progressColor,
  gradientColors,
  textColor,
  textStyle,
  showGlow = false,
  animationDuration = 300,
  text,
}: CircularProgressProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const radius = (size / 2) - (strokeWidth * 2);
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animated stroke offset
  const animatedStrokeOffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
  }, [progress, animationDuration]);

  const defaultGradient = [
    progressColor || colors.primary,
    progressColor ? `${progressColor}90` : `${colors.primary}90`,
  ];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow effect layer */}
      {showGlow && (
        <View
          style={[
            {
              position: 'absolute',
              width: size + strokeWidth * 2,
              height: size + strokeWidth * 2,
              borderRadius: size / 2 + strokeWidth,
              shadowColor: progressColor || colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: strokeWidth * 2,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
              backgroundColor: 'transparent',
            },
          ]}
        />
      )}

      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor || `${colors.primary}20`}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.3}
        />

        {/* Gradient Definition */}
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors?.[0] || defaultGradient[0]} />
            <Stop offset="100%" stopColor={gradientColors?.[1] || defaultGradient[1]} />
          </LinearGradient>
        </Defs>

        {/* Animated Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animatedStrokeOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Percentage Text */}
      <Text
        style={[
          styles.text,
          {
            fontSize: size * 0.2,
            color: textColor || colors.text,
            position: 'absolute',
          },
          textStyle,
        ]}
      >
        {text || Math.round(progress)}
      </Text>
    </View>
  );
}

// Animated Circle component for native driver support
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  text: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});