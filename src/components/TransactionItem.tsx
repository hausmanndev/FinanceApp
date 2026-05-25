import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Transaction, Category } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onPress?: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, category, onPress }: TransactionItemProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 2 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 2 }).start();

  const isIncome = transaction.type === 'income';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={() => onPress?.(transaction)} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1} style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: (transaction.categoryColor || Colors.primary) + '18' }]}>
          <Text style={styles.emoji}>{transaction.categoryIcon || '💰'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={1}>{transaction.description}</Text>
          <Text style={styles.meta}>{transaction.category} · {formatDate(transaction.date)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: isIncome ? Colors.income : Colors.expense }]}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          {transaction.receiptImage && <Image source={{ uri: transaction.receiptImage }} style={styles.thumbnail} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 6, borderWidth: 1, borderColor: Colors.borderLight },
  iconContainer: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 19 },
  info: { flex: 1, gap: 2 },
  description: { color: Colors.textPrimary, fontFamily: Typography.fontMedium, fontSize: 14 },
  meta: { color: Colors.textMuted, fontFamily: Typography.fontRegular, fontSize: 12 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontFamily: Typography.fontSemiBold, fontSize: 14 },
  thumbnail: { width: 26, height: 26, borderRadius: 6 },
});
