import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { fetchAggregateStats } from '../services/scanService';

export default function ImpactScreen({ navigation }) {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await fetchAggregateStats();
      setStats(data);
    } catch (error) {
      console.error('Impact stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <Text style={styles.title}>{t('impactTitle')}</Text>

        {stats && (
          <>
            {/* Key Metrics Grid */}
            <View style={styles.metricsGrid}>
              <MetricCard
                icon="scan-circle"
                iconColor="#0C0566"
                iconBg="#E8EAF6"
                label={t('impactTotalScans')}
                value={stats.totalScans.toString()}
              />
              <MetricCard
                icon="bug"
                iconColor="#C62828"
                iconBg="#FFEBEE"
                label={t('impactDiseasesDetected')}
                value={stats.diseasesDetected.toString()}
              />
              <MetricCard
                icon="leaf"
                iconColor="#2E7D32"
                iconBg="#E8F5E9"
                label={t('impactHealthyRatio')}
                value={`${stats.healthyRatio}%`}
              />
              <MetricCard
                icon="trending-up"
                iconColor="#F57F17"
                iconBg="#FFF8E1"
                label={t('impactYieldSaved')}
                value={`${stats.estimatedYieldSaved}q`}
              />
            </View>

            {/* Top Diseases */}
            <SectionTitle title={t('impactTopDiseases')} />
            <Card>
              {stats.topDiseases.map((disease, idx) => (
                <View key={idx} style={styles.diseaseRow}>
                  <View style={styles.diseaseRank}>
                    <Text style={styles.rankText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.diseaseInfo}>
                    <Text style={styles.diseaseName}>{disease.name}</Text>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${disease.percentage}%`,
                            backgroundColor: idx === 0 ? COLORS.error : idx === 1 ? COLORS.warning : COLORS.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.diseaseCount}>{disease.count}</Text>
                  <Text style={styles.diseasePercent}>{disease.percentage}%</Text>
                </View>
              ))}
            </Card>

            {/* Scan Trends */}
            <SectionTitle title={t('impactScanTrends')} />
            <Card>
              <View style={styles.chartContainer}>
                {stats.monthlyTrends.map((point, idx) => {
                  const maxCount = Math.max(...stats.monthlyTrends.map((p) => p.count), 1);
                  const barHeight = Math.max(4, (point.count / maxCount) * 120);
                  return (
                    <View key={idx} style={styles.barColumn}>
                      <Text style={styles.barValue}>{point.count}</Text>
                      <View style={[styles.bar, { height: barHeight }]} />
                      <Text style={styles.barLabel}>{point.month}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Government Advisory */}
            <SectionTitle title={t('impactGovtAdvisory')} />
            <Card style={styles.advisoryCard}>
              <View style={styles.advisoryRow}>
                <View style={styles.advisoryIcon}>
                  <Ionicons name="megaphone" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.advisoryContent}>
                  <Text style={styles.advisoryTitle}>{t('impactRegionalSurveillance')}</Text>
                  <Text style={styles.advisoryDesc}>
                    {language === 'hi'
                      ? 'कृषि विभाग ने रबी सीजन के लिए रोग निगरानी अभियान शुरू किया। किसानों से अनुरोध है कि वे अपनी फसलों की नियमित जांच करें।'
                      : 'Department of Agriculture has launched disease surveillance campaign for Rabi season. Farmers are requested to regularly monitor their crops.'}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.advisoryRow}>
                <View style={[styles.advisoryIcon, { backgroundColor: '#FFF8E1' }]}>
                  <Ionicons name="information-circle" size={20} color={COLORS.warning} />
                </View>
                <View style={styles.advisoryContent}>
                  <Text style={styles.advisoryTitle}>
                    {language === 'hi' ? 'जैविक खेती प्रोत्साहन' : 'Organic Farming Incentive'}
                  </Text>
                  <Text style={styles.advisoryDesc}>
                    {language === 'hi'
                      ? 'परम्परागत कृषि विकास योजना (PKVY) के तहत जैविक खेती अपनाने वाले किसानों को ₹50,000/हेक्टेयर सहायता उपलब्ध।'
                      : 'Under PKVY scheme, farmers adopting organic farming eligible for ₹50,000/hectare assistance.'}
                  </Text>
                </View>
              </View>
            </Card>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function MetricCard({ icon, iconColor, iconBg, label, value }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { padding: SPACING.marginMobile },
  title: { ...TYPOGRAPHY.headlineLg, color: COLORS.onSurface, marginBottom: SPACING.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.gutter },
  metricCard: {
    width: '47%', backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.default,
    padding: SPACING.md, alignItems: 'center', gap: SPACING.xs,
  },
  metricIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  metricValue: { ...TYPOGRAPHY.headlineLg, color: COLORS.onSurface, fontSize: 22 },
  metricLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray, textAlign: 'center' },
  diseaseRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceContainerHigh,
  },
  diseaseRank: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { ...TYPOGRAPHY.labelBold, color: COLORS.ashGray, fontSize: 11, textTransform: 'none' },
  diseaseInfo: { flex: 1, gap: 4 },
  diseaseName: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, fontWeight: '500', fontSize: 13 },
  progressBarBg: { height: 6, backgroundColor: COLORS.surfaceContainerHigh, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  diseaseCount: { ...TYPOGRAPHY.buttonText, color: COLORS.onSurface, fontSize: 13, width: 28, textAlign: 'right' },
  diseasePercent: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray, width: 32, textAlign: 'right' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, paddingTop: SPACING.md },
  barColumn: { alignItems: 'center', gap: 4 },
  bar: { width: 32, backgroundColor: COLORS.primary, borderRadius: 2 },
  barValue: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray, fontSize: 10 },
  barLabel: { ...TYPOGRAPHY.labelBold, color: COLORS.ashGray, fontSize: 10, textTransform: 'none' },
  advisoryCard: { marginBottom: SPACING.md },
  advisoryRow: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.xs },
  advisoryIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
  },
  advisoryContent: { flex: 1, gap: 2 },
  advisoryTitle: { ...TYPOGRAPHY.buttonText, color: COLORS.onSurface, fontSize: 13 },
  advisoryDesc: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray, lineHeight: 18 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
});
