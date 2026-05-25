import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, Image, Modal, Dimensions, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { CATEGORIES } from '../data/mockData';
import { Button } from '../components/Button';
import { TransactionType, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');
type RouteType = RouteProp<RootStackParamList, 'TransactionForm'>;
const ACCOUNTS = ['Nubank', 'Itaú', 'Bradesco', 'XP Investimentos', 'Caixa', 'Dinheiro'];

export function TransactionFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { addTransaction } = useApp();

  const [type, setType] = useState<TransactionType>(route.params?.type ?? 'expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('Nubank');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // RN Animated toggle
  const toggleAnim = useRef(new Animated.Value(type === 'income' ? 1 : 0)).current;
  const pillWidth = (width - Spacing.screenPadding * 2 - 16) / 2;

  const handleToggle = (newType: TransactionType) => {
    setType(newType);
    Animated.spring(toggleAnim, {
      toValue: newType === 'income' ? 1 : 0,
      useNativeDriver: true, speed: 15, bounciness: 4,
    }).start();
    setSelectedCategory('');
  };

  const pillTranslate = toggleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, pillWidth] });
  const incomeOpacity = toggleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const expenseOpacity = toggleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] });

  const filteredCategories = CATEGORIES.filter(c => c.type === type || c.type === 'both');

  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permissão negada', 'Habilite o acesso à câmera nas configurações.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) { setImageUri(photo.uri); setShowCamera(false); }
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Habilite o acesso à galeria nas configurações.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const handleSave = () => {
    const rawAmount = parseFloat(amount.replace(',', '.'));
    if (!rawAmount || rawAmount <= 0) { Alert.alert('Valor inválido', 'Informe um valor maior que zero.'); return; }
    if (!description.trim()) { Alert.alert('Descrição obrigatória', 'Descreva a transação.'); return; }
    if (!selectedCategory) { Alert.alert('Categoria obrigatória', 'Selecione uma categoria.'); return; }
    const cat = CATEGORIES.find(c => c.name === selectedCategory)!;
    addTransaction({
      type, amount: rawAmount, description: description.trim(),
      category: selectedCategory, categoryIcon: cat.icon, categoryColor: cat.color,
      date: new Date().toISOString(), account: selectedAccount,
      note: note.trim() || undefined, imageUri,
    });
    navigation.goBack();
  };

  const isIncome = type === 'income';
  const accentColor = isIncome ? Colors.income : Colors.expense;
  const accentGradient = isIncome ? Colors.gradientIncome : Colors.gradientExpense;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Modal visible={showCamera} animationType="slide" statusBarTranslucent>
        <View style={styles.cameraModal}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.camBtn} onPress={() => setShowCamera(false)}>
              <Ionicons name="close" size={28} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={handleTakePhoto}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
            <View style={{ width: 52 }} />
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Nova Transação</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Toggle */}
          <View style={styles.toggleWrap}>
            <View style={styles.toggleTrack}>
              <Animated.View style={[styles.togglePill, { backgroundColor: isIncome ? Colors.income : Colors.expense, transform: [{ translateX: pillTranslate }] }]} />
              <TouchableOpacity style={styles.toggleSide} onPress={() => handleToggle('expense')}>
                <Animated.View style={[styles.toggleContent, { opacity: expenseOpacity }]}>
                  <Ionicons name="arrow-up" size={14} color={Colors.white} />
                  <Text style={styles.toggleText}>Despesa</Text>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleSide} onPress={() => handleToggle('income')}>
                <Animated.View style={[styles.toggleContent, { opacity: incomeOpacity }]}>
                  <Ionicons name="arrow-down" size={14} color={Colors.white} />
                  <Text style={styles.toggleText}>Receita</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Valor</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currencySymbol, { color: accentColor }]}>R$</Text>
              <TextInput style={[styles.amountInput, { color: accentColor }]} placeholder="0,00" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} selectionColor={accentColor} />
            </View>
            <View style={[styles.amountLine, { backgroundColor: accentColor + '50' }]} />
          </View>

          <View style={styles.fields}>
            {/* Descrição */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Descrição</Text>
              <View style={styles.fieldInput}>
                <Ionicons name="create-outline" size={18} color={Colors.textMuted} />
                <TextInput style={styles.fieldText} placeholder="Ex: Mercado, Salário..." placeholderTextColor={Colors.textMuted} value={description} onChangeText={setDescription} selectionColor={Colors.primary} />
              </View>
            </View>

            {/* Conta */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Conta</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {ACCOUNTS.map(acc => (
                    <TouchableOpacity key={acc} style={[styles.chip, selectedAccount === acc && { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary }]} onPress={() => setSelectedAccount(acc)}>
                      <Text style={[styles.chipText, selectedAccount === acc && { color: Colors.primary }]}>{acc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Categoria */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Categoria</Text>
              <View style={styles.categories}>
                {filteredCategories.map(cat => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <TouchableOpacity key={cat.id} style={[styles.catItem, isSelected && { backgroundColor: cat.color + '22', borderColor: cat.color }]} onPress={() => setSelectedCategory(cat.name)}>
                      <Text style={styles.catEmoji}>{cat.icon}</Text>
                      <Text style={[styles.catName, isSelected && { color: cat.color }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Observação */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Observação (opcional)</Text>
              <View style={[styles.fieldInput, { minHeight: 80, alignItems: 'flex-start', paddingVertical: 10 }]}>
                <Ionicons name="document-text-outline" size={18} color={Colors.textMuted} style={{ marginTop: 2 }} />
                <TextInput style={[styles.fieldText, { flex: 1, textAlignVertical: 'top' }]} placeholder="Adicione uma observação..." placeholderTextColor={Colors.textMuted} value={note} onChangeText={setNote} multiline selectionColor={Colors.primary} />
              </View>
            </View>

            {/* Comprovante */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Comprovante / Foto</Text>
              {imageUri ? (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeImage} onPress={() => setImageUri(undefined)}>
                    <Ionicons name="close-circle" size={24} color={Colors.expense} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageActions}>
                  <TouchableOpacity style={styles.imageBtn} onPress={handleOpenCamera}>
                    <View style={styles.imageBtnGrad}>
                      <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                      <Text style={styles.imageBtnText}>Câmera</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageBtn} onPress={handlePickImage}>
                    <View style={styles.imageBtnGrad}>
                      <Ionicons name="image-outline" size={24} color={Colors.primary} />
                      <Text style={styles.imageBtnText}>Galeria</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Button label={`Salvar ${isIncome ? 'Receita' : 'Despesa'}`} onPress={handleSave} gradient={accentGradient} size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.base },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.textPrimary, fontSize: Typography.md, fontFamily: Typography.fontSemiBold },
  toggleWrap: { marginBottom: Spacing.xl },
  toggleTrack: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Spacing.radiusFull, borderWidth: 1, borderColor: Colors.border, padding: 4, position: 'relative', height: 48 },
  togglePill: { position: 'absolute', top: 4, left: 4, width: (width - Spacing.screenPadding * 2 - 16) / 2, height: 40, borderRadius: Spacing.radiusFull },
  toggleSide: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  toggleContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleText: { color: Colors.white, fontSize: Typography.sm, fontFamily: Typography.fontSemiBold },
  amountBlock: { marginBottom: Spacing.xl, alignItems: 'center' },
  amountLabel: { color: Colors.textMuted, fontSize: Typography.sm, fontFamily: Typography.fontMedium, marginBottom: Spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: Typography['2xl'], fontFamily: Typography.fontBold, marginRight: 8, marginTop: 4 },
  amountInput: { fontSize: Typography['4xl'], fontFamily: Typography.fontBold, letterSpacing: -1, minWidth: 150, textAlign: 'center' },
  amountLine: { height: 2, width: '60%', borderRadius: 1, marginTop: 8 },
  fields: { gap: Spacing.xl },
  fieldGroup: { gap: 8 },
  fieldLabel: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Typography.fontMedium },
  fieldInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Spacing.radiusMd, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.base, paddingVertical: 2, gap: 10 },
  fieldText: { flex: 1, color: Colors.textPrimary, fontSize: Typography.base, fontFamily: Typography.fontRegular, paddingVertical: Spacing.md },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Spacing.radiusFull, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  chipText: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Typography.fontMedium },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: Spacing.radiusMd, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  catIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catName: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Typography.fontMedium },
  catEmoji: { fontSize: 18 },
  imageActions: { flexDirection: 'row', gap: Spacing.md },
  imageBtn: { flex: 1, borderRadius: Spacing.radiusMd, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  imageBtnGrad: { padding: Spacing.base, alignItems: 'center', gap: 6, backgroundColor: Colors.surface },
  imageBtnText: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Typography.fontMedium },
  imagePreviewWrap: { borderRadius: Spacing.radiusMd, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: 180, borderRadius: Spacing.radiusMd },
  removeImage: { position: 'absolute', top: 8, right: 8 },
  footer: { marginTop: Spacing.xl },
  cameraModal: { flex: 1, backgroundColor: Colors.black },
  camera: { flex: 1 },
  cameraControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl, backgroundColor: 'rgba(0,0,0,0.6)' },
  camBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.white },
});
