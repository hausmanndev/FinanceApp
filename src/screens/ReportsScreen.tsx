import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { BarChart, DonutChart } from '../components/MiniChart';
import { formatCurrency } from '../utils/formatters';
import { MONTHLY_DATA } from '../data/mockData';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.screenPadding * 2;
type Period = '7d' | '30d' | '3m' | '12m';

export function ReportsScreen() {
  const { transactions } = useApp();
  const [period, setPeriod] = useState<Period>('30d');

  const periods: { key: Period; label: string }[] = [
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: '3m', label: '3 meses' },
    { key: '12m', label: '12 meses' },
  ];

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    return { income, expense, savings, savingsRate };
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const map = new Map<string, { total: number; icon: string; color: string; count: number }>();
    expenses.forEach(t => {
      const existing = map.get(t.category) ?? { total: 0, icon: t.categoryIcon, color: t.categoryColor, count: 0 };
      map.set(t.category, { ...existing, total: existing.total + t.amount, count: existing.count + 1 });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data, percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0 }))
      .sort((a, b) => b.total - a.total).slice(0, 5);
  }, [transactions]);

  const donutSegments = categoryBreakdown.map(c => ({ value: c.total, color: c.color, label: c.name }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <Text style={styles.title}>Relatórios</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="download-outline" size={19} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* PERIOD SELECTOR */}
        <View style={styles.periodRow}>
          {periods.map(p => (
            <TouchableOpacity key={p.key} style={[styles.periodChip, period === p.key && styles.periodChipActive]} onPress={() => setPeriod(p.key)}>
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* OVERVIEW CARDS */}
        <View style={styles.overviewGrid}>
          <View style={[styles.overviewCard, { backgroundColor: Colors.incomeMuted, borderColor: Colors.income + '30' }]}>
            <View style={[styles.overviewIcon, { backgroundColor: Colors.income + '20' }]}>
              <Ionicons name="arrow-down" size={15} color={Colors.income} />
            </View>
            <Text style={[styles.overviewLabel, { color: Colors.income }]}>Receitas</Text>
            <Text style={[styles.overviewValue, { color: Colors.income }]}>{formatCurrency(stats.income)}</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: Colors.expenseMuted, borderColor: Colors.expense + '30' }]}>
            <View style={[styles.overviewIcon, { backgroundColor: Colors.expense + '20' }]}>
              <Ionicons name="arrow-up" size={15} color={Colors.expense} />
            </View>
            <Text style={[styles.overviewLabel, { color: Colors.expense }]}>Despesas</Text>
            <Text style={[styles.overviewValue, { color: Colors.expense }]}>{formatCurrency(stats.expense)}</Text>
          </View>
        </View>

        {/* SAVINGS CARD */}
        <View style={styles.savingsCard}>
          <View style={styles.savingsLeft}>
            <Text style={styles.savingsLabel}>Economia do período</Text>
            <Text style={[styles.savingsValue, { color: stats.savings >= 0 ? Colors.income : Colors.expense }]}>
              {stats.savings >= 0 ? '+' : ''}{formatCurrency(stats.savings)}
            </Text>
          </View>
          <View style={styles.savingsRate}>
            <Text style={styles.savingsRateNum}>{stats.savingsRate.toFixed(0)}%</Text>
            <Text style={styles.savingsRateLabel}>taxa de poupança</Text>
          </View>
        </View>

        {/* BAR CHART */}
        <View style={styles.chartCard}>
          <View style={styles.chartCardHeader}>
            <Text style={styles.chartCardTitle}>Receitas vs Despesas</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.income }]} /><Text style={styles.legendText}>Receita</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.expense }]} /><Text style={styles.legendText}>Despesa</Text></View>
            </View>
          </View>
          <BarChart data={MONTHLY_DATA} width={CHART_WIDTH - Spacing.cardPadding * 2} height={130} />
        </View>

        {/* DONUT */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Gastos por categoria</Text>
          <View style={styles.donutRow}>
            <DonutChart segments={donutSegments} size={130} strokeWidth={20} />
            <View style={styles.donutLabels}>
              {categoryBreakdown.slice(0, 4).map((cat, i) => (
                <View key={i} style={styles.donutLabelItem}>
                  <View style={styles.donutLabelLeft}>
                    <View style={[styles.donutLabelDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.donutLabelName} numberOfLines={1}>{cat.name}</Text>
                  </View>
                  <Text style={styles.donutLabelPct}>{cat.percentage.toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* TOP EXPENSES */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Maiores gastos</Text>
          <View style={styles.topList}>
            {categoryBreakdown.slice(0, 5).map((cat, i) => (
              <View key={i} style={styles.topItem}>
                <Text style={styles.topRankNum}>#{i + 1}</Text>
                <View style={[styles.topIcon, { backgroundColor: cat.color + '18' }]}>
                  <Ionicons name={cat.icon as any} size={15} color={cat.color} />
                </View>
                <View style={styles.topInfo}>
                  <Text style={styles.topName}>{cat.name}</Text>
                  <View style={styles.topBarBg}>
                    <View style={[styles.topBarFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
                  </View>
                </View>
                <View style={styles.topRight}>
                  <Text style={styles.topValue}>{formatCurrency(cat.total)}</Text>
                  <Text style={styles.topPct}>{cat.percentage.toFixed(0)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FINANCIAL SCORE */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <View>
              <Text style={styles.healthTitle}>Score Financeiro</Text>
              <Text style={styles.healthSub}>Últimos 3 meses</Text>
            </View>
            <View style={styles.healthScoreWrap}>
              <Text style={styles.healthScoreNum}>84</Text>
              <Text style={styles.healthScoreLabel}>/100</Text>
            </View>
          </View>
          <View style={styles.healthBarBg}>
            <View style={[styles.healthBarFill, { width: '84%' }]} />
          </View>
          {[
            { label: 'Taxa de poupança', score: 'Ótima', color: Colors.income },
            { label: 'Controle de gastos', score: 'Boa', color: Colors.income },
            { label: 'Diversificação', score: 'Regular', color: Colors.warning },
          ].map((item, i) => (
            <View key={i} style={styles.healthItem}>
              <Text style={styles.healthItemLabel}>{item.label}</Text>
              <Text style={[styles.healthItemScore, { color: item.color }]}>{item.score}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.screenPadding },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.base, marginBottom: Spacing.xl },
  title: { color: Colors.textPrimary, fontSize: Typography['2xl'], fontFamily: Typography.fontBold },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },

  periodRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xl },
  periodChip: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  periodChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  periodText: { color: Colors.textSecondary, fontSize: Typography.xs, fontFamily: Typography.fontMedium },
  periodTextActive: { color: Colors.primary },

  overviewGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  overviewCard: { flex: 1, borderRadius: 16, padding: Spacing.base, gap: 4, borderWidth: 1 },
  overviewIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  overviewLabel: { fontSize: 11, fontFamily: Typography.fontSemiBold, letterSpacing: 0.4 },
  overviewValue: { fontSize: Typography.lg, fontFamily: Typography.fontBold },

  savingsCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.base, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  savingsLeft: { flex: 1 },
  savingsLabel: { color: Colors.textMuted, fontSize: 12, fontFamily: Typography.fontRegular },
  savingsValue: { fontSize: Typography.xl, fontFamily: Typography.fontBold, marginTop: 2 },
  savingsRate: { alignItems: 'flex-end' },
  savingsRateNum: { color: Colors.textPrimary, fontSize: Typography['2xl'], fontFamily: Typography.fontBold },
  savingsRateLabel: { color: Colors.textMuted, fontSize: 11, fontFamily: Typography.fontRegular },

  chartCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.base, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  chartCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  chartCardTitle: { color: Colors.textPrimary, fontSize: Typography.md, fontFamily: Typography.fontSemiBold, marginBottom: 12 },
  chartLegend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.textSecondary, fontSize: 11, fontFamily: Typography.fontRegular },

  donutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  donutLabels: { flex: 1, gap: 8 },
  donutLabelItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  donutLabelLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  donutLabelDot: { width: 9, height: 9, borderRadius: 5 },
  donutLabelName: { color: Colors.textSecondary, fontSize: 12, fontFamily: Typography.fontRegular, flex: 1 },
  donutLabelPct: { color: Colors.textPrimary, fontSize: 12, fontFamily: Typography.fontSemiBold },

  topList: { gap: 12 },
  topItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topRankNum: { color: Colors.textMuted, fontSize: 11, fontFamily: Typography.fontSemiBold, width: 22 },
  topIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topInfo: { flex: 1, gap: 4 },
  topName: { color: Colors.textPrimary, fontSize: 13, fontFamily: Typography.fontMedium },
  topBarBg: { height: 5, backgroundColor: Colors.border, borderRadius: 3 },
  topBarFill: { height: 5, borderRadius: 3 },
  topRight: { alignItems: 'flex-end' },
  topValue: { color: Colors.textPrimary, fontSize: 13, fontFamily: Typography.fontSemiBold },
  topPct: { color: Colors.textMuted, fontSize: 11, fontFamily: Typography.fontRegular },

  healthCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.base, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  healthTitle: { color: Colors.textPrimary, fontSize: Typography.md, fontFamily: Typography.fontSemiBold },
  healthSub: { color: Colors.textMuted, fontSize: 12, fontFamily: Typography.fontRegular, marginTop: 2 },
  healthScoreWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  healthScoreNum: { color: Colors.primary, fontSize: Typography['2xl'], fontFamily: Typography.fontBold },
  healthScoreLabel: { color: Colors.textMuted, fontSize: 13, fontFamily: Typography.fontRegular },
  healthBarBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, marginBottom: 14 },
  healthBarFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  healthItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  healthItemLabel: { color: Colors.textSecondary, fontSize: 13, fontFamily: Typography.fontRegular },
  healthItemScore: { fontSize: 13, fontFamily: Typography.fontSemiBold },
});
