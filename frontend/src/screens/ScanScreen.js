import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import SectionTitle from '../components/SectionTitle';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { predictCropDisease } from '../services/predictionService';
import { uploadScanImage, saveScanResult } from '../services/scanService';
import { CROPS } from '../constants/crops';


const SLOW_THRESHOLD_MS = 6000; // Show "taking longer" after 6s

export default function ScanScreen({ navigation }) {
  const { t, language } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [slowRequest, setSlowRequest] = useState(false);
  const [error, setError] = useState(null);
  const slowTimerRef = useRef(null);

  const pickImage = async (useCamera = false) => {
    setError(null);
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission is required');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCrop) {
      Alert.alert(t('scanSelectCrop'), t('scanSelectCrop'));
      return;
    }
    if (!imageUri) {
      Alert.alert(t('scanTitle'), t('scanInstructions'));
      return;
    }

    setAnalyzing(true);
    setSlowRequest(false);
    setError(null);

    // Start slow-request timer
    slowTimerRef.current = setTimeout(() => {
      setSlowRequest(true);
    }, SLOW_THRESHOLD_MS);

    try {
      // 1. Call the real Flask backend
      const prediction = await predictCropDisease(imageUri, selectedCrop);

      // 2. Save to Firestore in background (don't block navigation)
      saveScanInBackground(imageUri, selectedCrop, prediction);

      // 3. Navigate to Diagnosis Result with real data
      navigation.navigate('DiagnosisResult', {
        imageUri,
        cropType: selectedCrop,
        prediction, // pass the full enriched result
      });
    } catch (err) {
      console.error('Prediction error:', err);
      handlePredictionError(err);
    } finally {
      clearTimeout(slowTimerRef.current);
      setAnalyzing(false);
      setSlowRequest(false);
    }
  };

  const saveScanInBackground = async (imgUri, crop, prediction) => {
    try {
      const uploadedUrl = await uploadScanImage(imgUri);
      await saveScanResult({
        imageUrl: uploadedUrl,
        cropType: crop,
        diseaseName: prediction.diseaseName,
        confidence: prediction.confidence,
        severity: prediction.severity || 'none',
      });
    } catch (saveErr) {
      console.error('[ScanScreen] Background save error:', saveErr);
      // Don't block the user — the diagnosis is still shown
    }
  };

  const handlePredictionError = (err) => {
    const msg = err.message || '';

    if (msg === 'REQUEST_TIMEOUT') {
      setError({
        title: language === 'hi' ? 'अनुरोध समय समाप्त' : 'Request Timeout',
        message: language === 'hi'
          ? 'सर्वर ने समय पर प्रतिक्रिया नहीं दी। कृपया जांचें कि बैकएंड सर्वर चालू है और पुनः प्रयास करें।'
          : 'The server did not respond in time. Please check that the backend server is running and try again.',
      });
    } else if (msg.includes('NETWORK_ERROR') || msg === 'Network request failed') {
      setError({
        title: language === 'hi' ? 'नेटवर्क त्रुटि' : 'Network Error',
        message: language === 'hi'
          ? `बैकएंड सर्वर से कनेक्ट नहीं हो पा रहा। कृपया जांचें कि Flask सर्वर चालू है और आपका डिवाइस उसी नेटवर्क पर है।\n(${msg})`
          : `Could not connect to the backend server. Please verify the Flask server is running and your device is on the same network.\n(${msg})`,
      });
    } else if (msg.match(/^\[\d{3}\]/)) {
      // Server returned a non-OK HTTP status — error format: [STATUS] URL - message
      setError({
        title: language === 'hi' ? 'सर्वर त्रुटि' : 'Server Error',
        message: msg,
      });
    } else {
      setError({
        title: language === 'hi' ? 'विश्लेषण विफल' : 'Analysis Failed',
        message: msg || (language === 'hi' ? 'एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'An unexpected error occurred. Please try again.'),
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('scanTitle')}</Text>
        <Text style={styles.instructions}>{t('scanInstructions')}</Text>

        {/* Image Preview / Capture Area */}
        <View style={styles.imageArea}>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => { setImageUri(null); setError(null); }}
              >
                <Ionicons name="close-circle" size={28} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.framingGuide}>
              <View style={styles.frameCornerTL} />
              <View style={styles.frameCornerTR} />
              <View style={styles.frameCornerBL} />
              <View style={styles.frameCornerBR} />
              <Ionicons name="leaf-outline" size={48} color={COLORS.outlineVariant} />
              <Text style={styles.frameText}>{t('scanFrameGuide')}</Text>
            </View>
          )}
        </View>

        {/* Camera / Gallery Buttons */}
        <View style={styles.captureButtons}>
          <Button
            title={t('scanTakePhoto')}
            variant="secondary"
            icon={<Ionicons name="camera" size={18} color={COLORS.white} />}
            onPress={() => pickImage(true)}
            style={styles.captureBtn}
            disabled={analyzing}
          />
          <Button
            title={t('scanFromGallery')}
            variant="outline"
            icon={<Ionicons name="images-outline" size={18} color={COLORS.primary} />}
            onPress={() => pickImage(false)}
            style={styles.captureBtn}
            disabled={analyzing}
          />
        </View>

        {/* Crop Type Selector */}
        <SectionTitle title={t('scanSelectCrop')} />
        <View style={styles.cropGrid}>
          {CROPS.map((crop) => (
            <TouchableOpacity
              key={crop.value}
              style={[
                styles.cropChip,
                selectedCrop === crop.value && styles.cropChipSelected,
              ]}
              onPress={() => setSelectedCrop(crop.value)}
              disabled={analyzing}
            >
              <Text style={styles.cropEmoji}>{crop.icon}</Text>
              <Text
                style={[
                  styles.cropLabel,
                  selectedCrop === crop.value && styles.cropLabelSelected,
                ]}
              >
                {t(crop.key)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={24} color={COLORS.error} />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>{error.title}</Text>
              <Text style={styles.errorMessage}>{error.message}</Text>
            </View>
          </View>
        )}

        {/* Loading State */}
        {analyzing && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('scanAnalyzing')}</Text>
            {slowRequest && (
              <Text style={styles.slowText}>
                {language === 'hi'
                  ? 'सामान्य से अधिक समय लग रहा है... कृपया प्रतीक्षा करें'
                  : 'Taking longer than usual... please wait'}
              </Text>
            )}
          </View>
        )}

        {/* Analyze Button */}
        <Button
          title={error ? (language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Analysis') : t('scanTitle')}
          variant="primary"
          loading={analyzing}
          disabled={!imageUri || !selectedCrop || analyzing}
          icon={!analyzing ? <Ionicons name="scan" size={20} color={COLORS.black} /> : null}
          onPress={handleAnalyze}
          style={styles.analyzeButton}
        />

        {/* Photo Tips */}
        <SectionTitle title={t('scanTips')} />
        <Card>
          {[t('scanTip1'), t('scanTip2'), t('scanTip3'), t('scanTip4')].map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.healthy} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { padding: SPACING.marginMobile },
  title: { ...TYPOGRAPHY.headlineLg, color: COLORS.onSurface, marginBottom: SPACING.xs },
  instructions: { ...TYPOGRAPHY.bodyMd, color: COLORS.ashGray, marginBottom: SPACING.md },
  imageArea: { marginBottom: SPACING.md },
  imagePreviewContainer: { position: 'relative' },
  imagePreview: {
    width: '100%', height: 240, borderRadius: RADIUS.default,
    borderWidth: 1, borderColor: COLORS.border, resizeMode: 'cover',
  },
  removeImage: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.white, borderRadius: 14 },
  framingGuide: {
    width: '100%', height: 240, borderRadius: RADIUS.default,
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
  },
  frameText: { ...TYPOGRAPHY.bodyMd, color: COLORS.ashGray },
  frameCornerTL: { position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: COLORS.primary },
  frameCornerTR: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary },
  frameCornerBL: { position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: COLORS.primary },
  frameCornerBR: { position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary },
  captureButtons: { flexDirection: 'row', gap: SPACING.gutter, marginBottom: SPACING.md },
  captureBtn: { flex: 1 },
  cropGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cropChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.default, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  cropChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cropEmoji: { fontSize: 16 },
  cropLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, fontSize: 12 },
  cropLabelSelected: { color: COLORS.onPrimary },
  analyzeButton: { marginTop: SPACING.lg, paddingVertical: SPACING.md },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  tipText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, flex: 1 },
  // Error state
  errorCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: COLORS.error,
    borderRadius: RADIUS.default, padding: SPACING.md, marginTop: SPACING.md,
  },
  errorContent: { flex: 1 },
  errorTitle: { ...TYPOGRAPHY.buttonText, color: COLORS.error, marginBottom: 4 },
  errorMessage: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, lineHeight: 20 },
  // Loading state
  loadingCard: {
    alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLowest, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.default, padding: SPACING.lg, marginTop: SPACING.md,
  },
  loadingText: { ...TYPOGRAPHY.bodyLg, color: COLORS.onSurface, fontWeight: '500' },
  slowText: { ...TYPOGRAPHY.bodyMd, color: COLORS.warning, textAlign: 'center' },
});
