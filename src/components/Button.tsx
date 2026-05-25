import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, ViewStyle, TextStyle, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
  fullWidth?: boolean;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, style, textStyle, gradient, fullWidth = true,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 2 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 2 }).start();

  const heights: Record<ButtonSize, number> = { sm: 40, md: 50, lg: 56 };
  const fontSizes: Record<ButtonSize, number> = { sm: 13, md: 14, lg: 15 };

  const bgColors: Record<ButtonVariant, string> = {
    primary: Colors.primary,
    secondary: Colors.primaryLight,
    outline: Colors.transparent,
    ghost: Colors.transparent,
    danger: Colors.expense,
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: '100%' }, style]}>
      <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled || loading} activeOpacity={1}>
        <View style={[
          styles.base,
          { height: heights[size], backgroundColor: bgColors[variant] },
          variant === 'outline' && styles.outline,
          disabled && styles.disabled,
        ]}>
          {loading
            ? <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white} size="small" />
            : <>{icon}<Text style={[styles.label, { fontSize: fontSizes[size] }, (variant === 'outline' || variant === 'ghost') && styles.labelDark, textStyle]}>{label}</Text></>
          }
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, gap: 8, paddingHorizontal: Spacing.xl },
  label: { color: Colors.white, fontFamily: Typography.fontSemiBold, letterSpacing: 0.1 },
  labelDark: { color: Colors.primary },
  outline: { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.transparent },
  disabled: { opacity: 0.4 },
});
