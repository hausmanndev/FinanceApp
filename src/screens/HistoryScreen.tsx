// ============================================================
// HISTORY — Histórico de transações com busca e filtros
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { TransactionItem } from '../components/TransactionItem';
import { groupByMonth, formatCurrency } from '../utils/formatters';
import { TransactionType } from '../types';

type FilterType = 'all' | TransactionType;

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'income', label: 'Receitas' },
  { key: 'expense', label: 'Despesas' },
];

export function HistoryScreen() {
  const { transactions } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    let result = transactions;
    if (filter !== 'all') {
      result = result.filter(t => t.type === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q)
      );
    }
    return result;
  }, [transactions, filter, search]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const totalFiltered = filtered.reduce((acc, t) =>
    t.type === 'income' ? acc + t.amount : acc - t.amount, 0
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── SEARCH ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar transações..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            selectionColor={Colors.primary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── FILTERS ── */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.filterChip,
                filter === opt.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(opt.key)}
            >
              {filter === opt.key && opt.key !== 'all' && (
                <View style={[
                  styles.filterDot,
                  { backgroundColor: opt.key === 'income' ? Colors.income : Colors.expense }
                ]} />
              )}
              <Text style={[
                styles.filterText,
                filter === opt.key && styles.filterTextActive,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── SUMMARY ── */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryCount}>
          {filtered.length} transaç{filtered.length !== 1 ? 'ões' : 'ão'}
        </Text>
        <Text style={[
          styles.summaryTotal,
          { color: totalFiltered >= 0 ? Colors.income : Colors.expense }
        ]}>
          {totalFiltered >= 0 ? '+' : ''}{formatCurrency(totalFiltered)}
        </Text>
      </View>

      {/* ── LIST ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {grouped.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma transação</Text>
            <Text style={styles.emptySubtitle}>
              {search ? 'Tente buscar por outro termo.' : 'Adicione uma transação para começar.'}
            </Text>
          </View>
        ) : (
          grouped.map(group => (
            <View key={group.key} style={styles.group}>
              {/* Month header */}
              <View style={styles.monthHeader}>
                <Text style={styles.monthTitle}>{group.label}</Text>
                <View style={styles.monthStats}>
                  <Text style={[styles.monthStat, { color: Colors.income }]}>
                    +{formatCurrency(
                      group.data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                    )}
                  </Text>
                  <Text style={styles.monthStatSep}>·</Text>
                  <Text style={[styles.monthStat, { color: Colors.expense }]}>
                    -{formatCurrency(
                      group.data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                    )}
                  </Text>
                </View>
              </View>

              {group.data
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((t, i) => (
                  <TransactionItem key={t.id} transaction={t} index={i} />
                ))}
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography['2xl'],
    fontFamily: Typography.fontBold,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontFamily: Typography.fontRegular,
  },
  filtersWrap: { marginBottom: Spacing.md },
  filters: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 5,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.base,
  },
  summaryCount: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
  },
  summaryTotal: {
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
  },
  list: {
    paddingHorizontal: Spacing.screenPadding,
  },
  group: {
    marginBottom: Spacing.xl,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
    textTransform: 'capitalize',
  },
  monthStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthStat: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
  },
  monthStatSep: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.lg,
    fontFamily: Typography.fontSemiBold,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    fontFamily: Typography.fontRegular,
    textAlign: 'center',
  },
});
