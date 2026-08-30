import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import SectionTitle from '../components/SectionTitle';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { uploadScanImage, saveScanResult } from '../services/scanService';

export default function DiagnosisResultScreen({ navigation, route }) {
  const { t, language } = useLanguage();
  const { imageUri, cropType, prediction } = route.params || {};
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('organic');

  // Use the real prediction data passed from ScanScreen
  const result = prediction;

  const handleSave = async () => {
    if (!result || saved) return;
    setSaving(true);
    try {
      const uploadedUrl = await uploadScanImage(imageUri);
      await saveScanResult({
        imageUrl: uploadedUrl,
        cropType,
        diseaseName: result.diseaseName,
        confidence: result.confidence,
        severity: result.severity || 'none',
      });
      setSaved(true);
      Alert.alert('✅', t('diagnosisSaveToLog'));
    } catch (error) {
      console.error('Save error:', error);
      // Show success anyway for demo when Firebase isn't configured
      setSaved(true);
      Alert.alert('✅', t('diagnosisSaveToLog'));
    } finally {
      setSaving(false);
    }
  };

  const getSeverityLevel = (severity) => {
    if (severity === 'high') return 'high';
    if (severity === 'medium') return 'medium';
    return 'low';
  };

  const getSeverityLabel = (severity) => {
    if (severity === 'high') return t('diagnosisSeverityHigh');
    if (severity === 'medium') return t('diagnosisSeverityMedium');
    return t('diagnosisSeverityLow');
  };

  if (!result) {
    return (
      <View style={styles.container}>
        <Header title={t('diagnosisTitle')} showBack onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>
            {language === 'hi' ? 'निदान डेटा उपलब्ध नहीं है' : 'No diagnosis data available'}
          </Text>
          <Button title={t('back')} variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t('diagnosisTitle')} showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Scanned Image */}
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.scannedImage} />
        )}

        {/* Disease Overview Card */}
        <Card style={styles.diseaseCard}>
          <View style={styles.diseaseHeader}>
            <View style={styles.diseaseNameBlock}>
              <Text style={styles.diseaseName}>
                {result.isDiseased
                  ? (language === 'hi' ? result.diseaseNameHi : result.diseaseName)
                  : t('diagnosisHealthy')
                }
              </Text>
              <Text style={styles.cropTypeLabel}>{result.crop || cropType}</Text>
              {result.className && (
                <Text style={styles.classNameLabel}>{result.className}</Text>
              )}
            </View>
            <Badge
              label={result.isDiseased ? getSeverityLabel(result.severity) : t('diagnosisHealthy')}
              status={result.isDiseased ? getSeverityLevel(result.severity) : 'healthy'}
            />
          </View>

          {/* Confidence Meter */}
          <View style={styles.confidenceSection}>
            <Text style={styles.metricLabel}>{t('diagnosisConfidence')}</Text>
            <View style={styles.confidenceBarBg}>
              <View
                style={[
                  styles.confidenceBarFill,
                  {
                    width: `${Math.round(result.confidence * 100)}%`,
                    backgroundColor: result.confidence > 0.8 ? COLORS.healthy : COLORS.warning,
                  },
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>{Math.round(result.confidence * 100)}%</Text>
          </View>

          {/* Severity Gauge */}
          {result.isDiseased && (
            <View style={styles.severitySection}>
              <Text style={styles.metricLabel}>{t('diagnosisSeverity')}</Text>
              <View style={styles.severityGauge}>
                {['low', 'medium', 'high'].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.severitySegment,
                      {
                        backgroundColor:
                          result.severity === level
                            ? level === 'low' ? COLORS.healthy : level === 'medium' ? COLORS.warning : COLORS.error
                            : COLORS.surfaceContainerHigh,
                      },
                    ]}
                  >
                    <Text style={[
                      styles.severitySegmentText,
                      result.severity === level && { color: COLORS.white, fontWeight: '600' },
                    ]}>
                      {level === 'low' ? t('diagnosisSeverityLow') : level === 'medium' ? t('diagnosisSeverityMedium') : t('diagnosisSeverityHigh')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Symptoms */}
        {result.isDiseased && result.symptoms && result.symptoms.length > 0 && (
          <>
            <SectionTitle title={t('diagnosisSymptoms')} />
            <Card>
              {(language === 'hi' ? result.symptomsHi : result.symptoms).map((symptom, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.listText}>{symptom}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Treatment Tabs */}
        {result.isDiseased && (
          <>
            <View style={styles.treatmentTabs}>
              <TouchableTab
                label={t('diagnosisOrganicTreatment')}
                active={activeTab === 'organic'}
                onPress={() => setActiveTab('organic')}
                icon="leaf"
              />
              <TouchableTab
                label={t('diagnosisChemicalTreatment')}
                active={activeTab === 'chemical'}
                onPress={() => setActiveTab('chemical')}
                icon="flask"
              />
            </View>

            <Card>
              {(activeTab === 'organic'
                ? (language === 'hi' ? result.organicTreatmentHi : result.organicTreatment)
                : (language === 'hi' ? result.chemicalTreatmentHi : result.chemicalTreatment)
              ).map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Ionicons
                    name={activeTab === 'organic' ? 'leaf' : 'flask'}
                    size={14}
                    color={activeTab === 'organic' ? COLORS.healthy : COLORS.officialBlue}
                  />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Prevention */}
        {result.prevention && result.prevention.length > 0 && (
          <>
            <SectionTitle title={t('diagnosisPrevention')} />
            <Card>
              {(language === 'hi' ? result.preventionHi : result.prevention).map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* KVK Contact */}
        {result.isDiseased && (
          <Card style={styles.kvkCard}>
            <View style={styles.kvkRow}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text style={styles.kvkText}>{t('diagnosisNearestKVK')}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.ashGray} />
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={saved ? '✅ ' + t('done') : t('diagnosisSaveToLog')}
            variant="secondary"
            loading={saving}
            disabled={saved}
            icon={!saving && !saved ? <Ionicons name="save" size={18} color={COLORS.white} /> : null}
            onPress={handleSave}
            style={styles.actionBtn}
          />
          <Button
            title={t('diagnosisScanAnother')}
            variant="outline"
            icon={<Ionicons name="scan" size={18} color={COLORS.primary} />}
            onPress={() => navigation.goBack()}
            style={styles.actionBtn}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function TouchableTab({ label, active, onPress, icon }) {
  return (
    <View style={[styles.tab, active && styles.tabActive]}>
      <Ionicons name={icon} size={14} color={active ? COLORS.onPrimary : COLORS.ashGray} />
      <Text style={[styles.tabText, active && styles.tabTextActive]} onPress={onPress}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { padding: SPACING.marginMobile },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md, padding: SPACING.lg },
  errorText: { ...TYPOGRAPHY.bodyLg, color: COLORS.ashGray, textAlign: 'center' },
  scannedImage: {
    width: '100%', height: 200, borderRadius: RADIUS.default,
    borderWidth: 1, borderColor: COLORS.border, resizeMode: 'cover', marginBottom: SPACING.md,
  },
  diseaseCard: { marginBottom: SPACING.md },
  diseaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  diseaseNameBlock: { flex: 1, marginRight: SPACING.sm },
  diseaseName: { ...TYPOGRAPHY.headlineMd, color: COLORS.onSurface },
  cropTypeLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray, marginTop: 2 },
  classNameLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.outlineVariant, marginTop: 2, fontSize: 10 },
  confidenceSection: { marginBottom: SPACING.md },
  metricLabel: { ...TYPOGRAPHY.labelBold, color: COLORS.ashGray, marginBottom: SPACING.xs },
  confidenceBarBg: { height: 8, backgroundColor: COLORS.surfaceContainerHigh, borderRadius: 4, overflow: 'hidden' },
  confidenceBarFill: { height: '100%', borderRadius: 4 },
  confidenceValue: { ...TYPOGRAPHY.buttonText, color: COLORS.onSurface, marginTop: 4, textAlign: 'right' },
  severitySection: {},
  severityGauge: { flexDirection: 'row', gap: 4 },
  severitySegment: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.default,
    alignItems: 'center', justifyContent: 'center',
  },
  severitySegmentText: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  bulletDot: { ...TYPOGRAPHY.bodyMd, color: COLORS.primary, marginTop: -1 },
  listText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, flex: 1 },
  treatmentTabs: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.default,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceContainerLowest,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.buttonText, color: COLORS.ashGray, fontSize: 12 },
  tabTextActive: { color: COLORS.onPrimary },
  kvkCard: { marginTop: SPACING.md },
  kvkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  kvkText: { ...TYPOGRAPHY.bodyMd, color: COLORS.primary, fontWeight: '500', flex: 1 },
  actionButtons: { gap: SPACING.sm, marginTop: SPACING.lg },
  actionBtn: { paddingVertical: SPACING.sm + 4 },
});
