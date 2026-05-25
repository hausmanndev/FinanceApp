import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: Colors.textMuted },
  premium: { label: 'Premium', color: Colors.primary },
  business: { label: 'Business', color: Colors.gold },
};

export function ProfileScreen() {
  const { user, updateUser } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const plan = PLAN_LABELS[user.plan];

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão negada', 'Habilite o acesso à galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) updateUser({ avatarUri: result.assets[0].uri });
  };

  const initials = user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const settingsSections = [
    {
      title: 'Conta',
      items: [
        { icon: 'person-outline', label: 'Editar perfil', onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento.') },
        { icon: 'mail-outline', label: user.email, onPress: () => {} },
        { icon: 'ribbon-outline', label: `Plano ${plan.label}`, color: plan.color, onPress: () => Alert.alert('Plano', `Você está no plano ${plan.label}.`) },
      ],
    },
    {
      title: 'Preferências',
      items: [
        { icon: 'notifications-outline', label: 'Notificações', toggle: true, toggleValue: notificationsEnabled, onToggle: setNotificationsEnabled },
        { icon: 'finger-print-outline', label: 'Biometria', toggle: true, toggleValue: biometricEnabled, onToggle: setBiometricEnabled },
        { icon: 'language-outline', label: 'Idioma: Português (BR)', onPress: () => {} },
      ],
    },
    {
      title: 'Dados',
      items: [
        { icon: 'download-outline', label: 'Exportar dados', onPress: () => Alert.alert('Exportar', 'Seus dados serão enviados por e-mail.') },
        { icon: 'cloud-upload-outline', label: 'Backup na nuvem', onPress: () => Alert.alert('Backup', 'Backup realizado com sucesso!') },
        { icon: 'trash-outline', label: 'Apagar todas as transações', onPress: () => Alert.alert('Atenção', 'Esta ação é irreversível.'), danger: true },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { icon: 'help-circle-outline', label: 'Central de ajuda', onPress: () => {} },
        { icon: 'chatbubble-outline', label: 'Fale conosco', onPress: () => {} },
        { icon: 'star-outline', label: 'Avaliar o app', onPress: () => {} },
        { icon: 'information-circle-outline', label: 'Versão 1.0.0', onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <Text style={styles.screenTitle}>Perfil</Text>

        {/* AVATAR CARD */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarWrap} onPress={handlePickAvatar}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.avatarEdit}>
              <Ionicons name="camera" size={11} color={Colors.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={[styles.planTag, { backgroundColor: plan.color + '14', borderColor: plan.color + '30' }]}>
            <Ionicons name="ribbon-outline" size={11} color={plan.color} />
            <Text style={[styles.planTagText, { color: plan.color }]}>Plano {plan.label}</Text>
          </View>

          <View style={styles.statsRow}>
            {[
              { label: 'Transações', value: '17' },
              { label: 'Meses ativos', value: '3' },
              { label: 'Economia', value: '28%' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* SETTINGS */}
        {settingsSections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item: any, ii) => (
                <React.Fragment key={ii}>
                  {ii > 0 && <View style={styles.itemDivider} />}
                  <TouchableOpacity style={styles.settingItem} onPress={item.toggle ? undefined : item.onPress} activeOpacity={item.toggle ? 1 : 0.7}>
                    <View style={[styles.settingIcon, { backgroundColor: (item.danger ? Colors.expense : item.color ?? Colors.primary) + '12' }]}>
                      <Ionicons name={item.icon as any} size={17} color={item.danger ? Colors.expense : item.color ?? Colors.primary} />
                    </View>
                    <Text style={[styles.settingLabel, item.danger && { color: Colors.expense }]}>{item.label}</Text>
                    {item.toggle
                      ? <Switch value={item.toggleValue} onValueChange={item.onToggle} trackColor={{ false: Colors.border, true: Colors.primaryMuted }} thumbColor={item.toggleValue ? Colors.primary : Colors.textMuted} />
                      : <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
                    }
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Sair', 'Deseja sair da sua conta?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: () => {} }])}>
          <Ionicons name="log-out-outline" size={18} color={Colors.expense} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.screenPadding },
  screenTitle: { color: Colors.textPrimary, fontSize: Typography['2xl'], fontFamily: Typography.fontBold, paddingTop: Spacing.base, marginBottom: Spacing.xl },

  profileCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.cardPadding, alignItems: 'center', marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 26, fontFamily: Typography.fontBold },
  avatarEdit: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.surface },
  userName: { color: Colors.textPrimary, fontSize: Typography.lg, fontFamily: Typography.fontBold },
  userEmail: { color: Colors.textMuted, fontSize: Typography.sm, fontFamily: Typography.fontRegular, marginTop: 2, marginBottom: 10 },
  planTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  planTagText: { fontSize: 12, fontFamily: Typography.fontSemiBold },

  statsRow: { flexDirection: 'row', width: '100%', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { color: Colors.textPrimary, fontSize: Typography.lg, fontFamily: Typography.fontBold },
  statLabel: { color: Colors.textMuted, fontSize: 11, fontFamily: Typography.fontRegular },
  statDivider: { width: 1, backgroundColor: Colors.border },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, fontFamily: Typography.fontSemiBold, letterSpacing: 0.8, marginBottom: 8, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  itemDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 16 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, color: Colors.textPrimary, fontSize: 14, fontFamily: Typography.fontMedium },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: Colors.expenseMuted, borderRadius: 14, marginTop: 4 },
  logoutText: { color: Colors.expense, fontSize: 14, fontFamily: Typography.fontSemiBold },
});
