import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TransactionFormScreen } from '../screens/TransactionFormScreen';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ITEMS = [
  { name: 'Dashboard' as const, label: 'Início', icon: 'home', iconOutline: 'home-outline' },
  { name: 'History' as const, label: 'Histórico', icon: 'receipt', iconOutline: 'receipt-outline' },
  { name: 'Reports' as const, label: 'Relatórios', icon: 'bar-chart', iconOutline: 'bar-chart-outline' },
  { name: 'Subscriptions' as const, label: 'Planos', icon: 'star', iconOutline: 'star-outline' },
  { name: 'Profile' as const, label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
];

function TabItem({ item, isFocused, onPress }: { item: typeof TAB_ITEMS[0]; isFocused: boolean; onPress: () => void }) {
  const anim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: isFocused ? 1 : 0, useNativeDriver: false, speed: 20, bounciness: 4 }).start();
  }, [isFocused]);

  const bgColor = anim.interpolate({ inputRange: [0, 1], outputRange: [Colors.transparent, Colors.primaryMuted] });

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={0.8}>
      <Animated.View style={[styles.tabPill, { backgroundColor: bgColor }]}>
        <Ionicons name={(isFocused ? item.icon : item.iconOutline) as any} size={20} color={isFocused ? Colors.primary : Colors.textMuted} />
        {isFocused && <Text style={styles.tabLabel}>{item.label}</Text>}
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => (
        <TabItem
          key={route.key}
          item={TAB_ITEMS[index]}
          isFocused={state.index === index}
          onPress={() => { if (state.index !== index) navigation.navigate(route.name); }}
        />
      ))}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Subscriptions" component={SubscriptionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="TransactionForm" component={TransactionFormScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, paddingHorizontal: 8 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  tabPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20 },
  tabLabel: { fontSize: 12, fontFamily: Typography.fontSemiBold, color: Colors.primary },
});
