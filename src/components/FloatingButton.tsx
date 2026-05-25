import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../theme/colors';

interface FloatingButtonProps {
  onPress: () => void;
}

export function FloatingButton({ onPress }: FloatingButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1} style={styles.btn}>
        <Ionicons name="add" size={26} color={Colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: 56, height: 56 },
  btn: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
});
