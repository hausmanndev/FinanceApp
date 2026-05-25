import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { SubscriptionPlan } from '../types';

interface Plan {
  id: SubscriptionPlan;
  name: string;
  price: string;
  priceNote: string;
  features: { label: string; included: boolean }[];
  accent: string;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'free', name: 'Free', price: 'R$ 0', priceNote: 'para sempre', accent: Colors.textMuted,
    features: [
      { label: 'Até 50 transações/mês', included: true },
      { label: 'Histórico básico', included: true },
      { label: 'Dashboard simples', included: true },
      { label: 'Relatórios avançados', included: false },
      { label: 'Exportação PDF', included: false },
      { label: 'Sincronização cloud', included: false },
    ],
  },
  {
    id: 'premium', name: 'Premium', price: 'R$ 14,90', priceNote: 'por mês', accent: Colors.primary, badge: 'Popular',
    features: [
      { label: 'Transações ilimitadas', included: true },
      { label: 'Histórico completo', included: true },
      { label: 'Dashboard avançado', included: true },
      { label: 'Relatórios avançados', included: true },
      { label: 'Exportação PDF', included: true },
      { label: 'Sincronização cloud', included: true },
    ],
  },
  {
    id: 'business', name: 'Business', price: 'R$ 39,90', priceNote: 'por mês', accent: Colors.gold, badge: 'Completo',
    features: [
      { label: 'Tudo do Premium', included: true },
      { label: 'IA financeira', included: true },
      { label: 'Metas financeiras', included: true },
      { label: 'Suporte prioritário', included: true },
      { label: 'Relatórios empresariais', included: true },
      { label: 'Multi-usuário', included: true },
    ],
  },
];

function PlanCard({ plan, isActive, onSelect }: { plan: Plan; isActive: boolean; onSelect: () => void }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 2 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 2 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={onSelect} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}
        style={[styles.planCard, { borderColor: isActive ? plan.accent : Colors.border, borderWidth: isActive ? 2 : 1 }]}>

        <View style={styles.planHeader}>
          <View>
            {plan.badge && (
              <View style={[styles.badge, { backgroundColor: plan.accent + '15', borderColor: plan.accent + '40' }]}>
                <Text style={[styles.badgeText, { color: plan.accent }]}>{plan.badge}</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.planPrice, { color: plan.accent }]}>{plan.price}</Text>
              <Text style={styles.planPriceNote}> / {plan.priceNote}</Text>
            </View>
          </View>
          <View style={[styles.planRadio, { borderColor: isActive ? plan.accent : Colors.border }]}>
            {isActive && <View style={[styles.planRadioInner, { backgroundColor: plan.accent }]} />}
          </View>
        </View>

        <View style={styles.planDivider} />

        <View style={styles.featureList}>
          {plan.features.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <Ionicons
                name={f.included ? 'checkmark' : 'close'}
                size={14}
                color={f.included ? plan.accent : Colors.textDisabled}
              />
              <Text style={[styles.featureText, !f.included && styles.featureTextDim]}>{f.label}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function SubscriptionScreen() {
  const { activePlan, setActivePlan } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(activePlan);
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setActivePlan(selectedPlan);
    setShowModal(false);
  };

  const currentPlan = PLANS.find(p => p.id === selectedPlan);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar plano</Text>
            <Text style={styles.modalBody}>
              Você está selecionando o plano <Text style={{ fontFamily: Typography.fontBold }}>{currentPlan?.name}</Text> por <Text style={{ fontFamily: Typography.fontBold }}>{currentPlan?.price}</Text>.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirm}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Planos</Text>
          <Text style={styles.subtitle}>Escolha o plano ideal para você</Text>
        </View>

        <View style={styles.planList}>
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: currentPlan?.accent ?? Colors.primary }]}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.ctaBtnText}>
            {selectedPlan === activePlan ? 'Plano atual' : `Selecionar ${currentPlan?.name}`}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.screenPadding },

  header: { paddingTop: Spacing.base, marginBottom: Spacing.xl },
  title: { color: Colors.textPrimary, fontSize: Typography['2xl'], fontFamily: Typography.fontBold },
  subtitle: { color: Colors.textMuted, fontSize: Typography.sm, fontFamily: Typography.fontRegular, marginTop: 3 },

  planList: { gap: 12, marginBottom: 20 },

  planCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1, marginBottom: 6 },
  badgeText: { fontSize: 10, fontFamily: Typography.fontSemiBold, letterSpacing: 0.3 },
  planName: { color: Colors.textPrimary, fontSize: Typography.lg, fontFamily: Typography.fontBold },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  planPrice: { fontSize: Typography['2xl'], fontFamily: Typography.fontBold },
  planPriceNote: { color: Colors.textMuted, fontSize: Typography.sm, fontFamily: Typography.fontRegular },
  planRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  planRadioInner: { width: 11, height: 11, borderRadius: 6 },

  planDivider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: 14 },

  featureList: { gap: 9 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  featureText: { color: Colors.textSecondary, fontSize: 13, fontFamily: Typography.fontRegular },
  featureTextDim: { color: Colors.textDisabled },

  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  ctaBtnText: { color: Colors.white, fontSize: 15, fontFamily: Typography.fontSemiBold },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modalCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { color: Colors.textPrimary, fontSize: Typography.lg, fontFamily: Typography.fontBold, marginBottom: 8 },
  modalBody: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Typography.fontRegular, lineHeight: 22, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  modalCancelText: { color: Colors.textSecondary, fontSize: 14, fontFamily: Typography.fontMedium },
  modalConfirm: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  modalConfirmText: { color: Colors.white, fontSize: 14, fontFamily: Typography.fontSemiBold },
});
