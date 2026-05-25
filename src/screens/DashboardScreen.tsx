import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { TransactionItem } from '../components/TransactionItem';
import { MiniChart } from '../components/MiniChart';
import { FloatingButton } from '../components/FloatingButton';
import { formatCurrency } from '../utils/formatters';
import { BALANCE_CHART_DATA } from '../data/mockData';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.screenPadding * 2;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const { transactions, balance, totalIncome, totalExpense, user, balanceVisible, toggleBalanceVisible } = useApp();
  const navigation = useNavigation<NavProp>();

  const recent = transactions.slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{user.name.split(' ')[0]}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={21} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <View style={styles.notifDot} />
              <Ionicons name="notifications-outline" size={21} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>SALDO TOTAL</Text>
            <TouchableOpacity onPress={toggleBalanceVisible} style={styles.eyeBtn}>
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            {balanceVisible ? formatCurrency(balance) : '••••••'}
          </Text>

          <View style={styles.balanceChange}>
            <Ionicons name="trending-up" size={13} color={Colors.income} />
            <Text style={styles.balanceChangeText}>+12,4% este mês</Text>
          </View>

          <View style={styles.chartWrap}>
            <MiniChart
              data={BALANCE_CHART_DATA}
              width={CHART_WIDTH - Spacing.cardPadding * 2}
              height={64}
              color={Colors.primary}
              showDots={false}
              showLabels={false}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: Colors.incomeMuted }]}>
                <Ionicons name="arrow-down" size={11} color={Colors.income} />
              </View>
              <View>
                <Text style={styles.statLabel}>Receitas</Text>
                <Text style={[styles.statValue, { color: Colors.income }]}>
                  {balanceVisible ? formatCurrency(totalIncome) : '•••••'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: Colors.expenseMuted }]}>
                <Ionicons name="arrow-up" size={11} color={Colors.expense} />
              </View>
              <View>
                <Text style={styles.statLabel}>Despesas</Text>
                <Text style={[styles.statValue, { color: Colors.expense }]}>
                  {balanceVisible ? formatCurrency(totalExpense) : '•••••'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AÇÕES RÁPIDAS */}
        <View style={styles.quickActions}>
          {[
            { icon: 'send-outline', label: 'Transferir', color: Colors.primary },
            { icon: 'add-outline', label: 'Receita', color: Colors.income },
            { icon: 'remove-outline', label: 'Despesa', color: Colors.expense },
            { icon: 'stats-chart-outline', label: 'Relatório', color: Colors.warning },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickAction}
              onPress={() => {
                if (action.label === 'Receita') navigation.navigate('TransactionForm', { type: 'income' });
                else if (action.label === 'Despesa') navigation.navigate('TransactionForm', { type: 'expense' });
              }}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: action.color + '14' }]}>
                <Ionicons name={action.icon as any} size={20} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TRANSAÇÕES RECENTES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas transações</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {recent.map(t => <TransactionItem key={t.id} transaction={t} />)}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.fab}>
        <FloatingButton onPress={() => navigation.navigate('TransactionForm')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.base },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  greeting: { color: Colors.textMuted, fontSize: Typography.sm, fontFamily: Typography.fontRegular },
  userName: { color: Colors.textPrimary, fontSize: Typography.xl, fontFamily: Typography.fontBold, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 9, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.expense, zIndex: 1, borderWidth: 1.5, borderColor: Colors.bg },

  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radius2xl,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.xl,
  },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  balanceLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: Typography.fontSemiBold, letterSpacing: 1.2 },
  eyeBtn: { padding: 4 },
  balanceAmount: { color: Colors.white, fontSize: Typography['3xl'], fontFamily: Typography.fontBold, letterSpacing: -1, marginBottom: 4 },
  balanceChange: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.base },
  balanceChangeText: { color: Colors.incomeLight, fontSize: Typography.xs, fontFamily: Typography.fontMedium },
  chartWrap: { marginBottom: Spacing.base, opacity: 0.7 },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: Spacing.base, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: Typography.xs, fontFamily: Typography.fontRegular },
  statValue: { fontSize: Typography.sm, fontFamily: Typography.fontSemiBold, marginTop: 1 },
  divider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: Spacing.base },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sectionGap },
  quickAction: { alignItems: 'center', gap: 7 },
  quickIconWrap: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  quickLabel: { color: Colors.textSecondary, fontSize: 11, fontFamily: Typography.fontMedium },

  section: { gap: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { color: Colors.textPrimary, fontSize: Typography.md, fontFamily: Typography.fontSemiBold },
  sectionLink: { color: Colors.primary, fontSize: Typography.sm, fontFamily: Typography.fontMedium },

  fab: { position: 'absolute', right: Spacing.xl, bottom: 90 },
});
