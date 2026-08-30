import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import RiskChip from '../components/RiskChip';
import SectionTitle from '../components/SectionTitle';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { fetchWeather, evaluateFieldRisk } from '../services/weatherService';

export default function HomeScreen({ navigation }) {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [fieldRisk, setFieldRisk] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWeather = async () => {
    try {
      const data = await fetchWeather('New Delhi');
      setWeather(data);
      setFieldRisk(evaluateFieldRisk(data));
    } catch (error) {
      console.error('Weather load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeather();
    setRefreshing(false);
  };

  const getWeatherIcon = (condition) => {
    const map = {
      Clear: 'sunny',
      Clouds: 'cloudy',
      Rain: 'rainy',
      Drizzle: 'rainy',
      Thunderstorm: 'thunderstorm',
      Snow: 'snow',
      Mist: 'water',
      Fog: 'water',
      Haze: 'water',
    };
    return map[condition] || 'partly-sunny';
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
        {/* Greeting */}
        <Text style={styles.greeting}>{t('homeGreeting')} 🙏</Text>

        {/* Weather Card */}
        <Card title={t('homeWeatherTitle')} style={styles.sectionCard}>
          {weather ? (
            <View>
              <View style={styles.weatherMainRow}>
                <View style={styles.weatherTempBlock}>
                  <Ionicons name={getWeatherIcon(weather.condition)} size={40} color={COLORS.action} />
                  <Text style={styles.tempText}>{weather.temp}°C</Text>
                </View>
                <View style={styles.weatherDetailsBlock}>
                  <View style={styles.weatherDetailRow}>
                    <Ionicons name="water-outline" size={16} color={COLORS.officialBlue} />
                    <Text style={styles.weatherDetailLabel}>{t('homeHumidity')}</Text>
                    <Text style={styles.weatherDetailValue}>{weather.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetailRow}>
                    <Ionicons name="speedometer-outline" size={16} color={COLORS.officialBlue} />
                    <Text style={styles.weatherDetailLabel}>{t('homeWind')}</Text>
                    <Text style={styles.weatherDetailValue}>{weather.windSpeed} km/h</Text>
                  </View>
                  <View style={styles.weatherDetailRow}>
                    <Ionicons name="thermometer-outline" size={16} color={COLORS.officialBlue} />
                    <Text style={styles.weatherDetailLabel}>{t('homeWeatherCondition')}</Text>
                    <Text style={styles.weatherDetailValue}>{weather.conditionDesc}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.weatherCityRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.ashGray} />
                <Text style={styles.weatherCity}>{weather.city}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.loadingText}>{t('loading')}</Text>
          )}
        </Card>

        {/* Field Risk Advisory */}
        {fieldRisk && (
          <>
            <SectionTitle title={t('homeFieldRisk')} />
            <RiskChip label={t(fieldRisk.riskKey)} level={fieldRisk.level} />
            {fieldRisk.risks.length > 0 && (
              <View style={styles.riskDetails}>
                {fieldRisk.risks.map((riskKey, idx) => (
                  <View key={idx} style={styles.riskDetailRow}>
                    <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                    <Text style={styles.riskDetailText}>{t(riskKey)}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Scan CTA */}
        <View style={styles.scanCta}>
          <Button
            title={t('homeScanNow')}
            variant="primary"
            icon={<Ionicons name="scan" size={20} color={COLORS.black} />}
            onPress={() => navigation.navigate('Scan')}
            style={styles.scanButton}
          />
        </View>

        {/* Quick Actions */}
        <SectionTitle title={t('homeQuickActions')} />
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('History')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="time-outline" size={22} color={COLORS.healthy} />
            </View>
            <Text style={styles.quickActionLabel}>{t('tabHistory')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Impact')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E8EAF6' }]}>
              <Ionicons name="bar-chart-outline" size={22} color={COLORS.officialBlue} />
            </View>
            <Text style={styles.quickActionLabel}>{t('tabImpact')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Settings')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF8E1' }]}>
              <Ionicons name="settings-outline" size={22} color={COLORS.warning} />
            </View>
            <Text style={styles.quickActionLabel}>{t('tabSettings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Profile')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="person-outline" size={22} color={COLORS.diseased} />
            </View>
            <Text style={styles.quickActionLabel}>{t('settingsProfile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Alerts */}
        <SectionTitle title={t('homeRecentAlerts')} />
        <Card style={styles.alertCard}>
          <View style={styles.alertRow}>
            <View style={[styles.alertDot, { backgroundColor: COLORS.error }]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{t('homeDiseaseAlert')}</Text>
              <Text style={styles.alertDesc}>
                {language === 'hi'
                  ? 'उत्तर प्रदेश में टमाटर के अगेती झुलसा (Early Blight) का प्रकोप — किसान सतर्क रहें'
                  : 'Tomato Early Blight outbreak reported in Uttar Pradesh — farmers advised to stay alert'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.ashGray} />
          </View>
          <View style={styles.divider} />
          <View style={styles.alertRow}>
            <View style={[styles.alertDot, { backgroundColor: COLORS.warning }]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{t('homeGovSchemes')}</Text>
              <Text style={styles.alertDesc}>
                {language === 'hi'
                  ? 'PM-KISAN 17वीं किस्त जारी — अपना स्टेटस जांचें'
                  : 'PM-KISAN 17th installment released — check your status'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.ashGray} />
          </View>
        </Card>

        {/* Krishi Helpline */}
        <Card style={styles.helplineCard}>
          <View style={styles.helplineRow}>
            <Ionicons name="call" size={20} color={COLORS.onPrimary} />
            <Text style={styles.helplineText}>{t('homeKrishiHelpline')}</Text>
          </View>
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
  greeting: { ...TYPOGRAPHY.headlineLg, color: COLORS.onSurface, marginBottom: SPACING.md },
  sectionCard: { marginBottom: SPACING.md },
  weatherMainRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  weatherTempBlock: { alignItems: 'center', gap: SPACING.xs },
  tempText: { ...TYPOGRAPHY.headlineLg, fontSize: 32, color: COLORS.onSurface },
  weatherDetailsBlock: { flex: 1, gap: SPACING.sm },
  weatherDetailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  weatherDetailLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.ashGray, width: 80 },
  weatherDetailValue: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, fontWeight: '500', flex: 1 },
  weatherCityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  weatherCity: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray },
  loadingText: { ...TYPOGRAPHY.bodyMd, color: COLORS.ashGray, textAlign: 'center', paddingVertical: SPACING.lg },
  riskDetails: { marginTop: SPACING.sm, gap: SPACING.xs },
  riskDetailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingLeft: SPACING.xs },
  riskDetailText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, flex: 1 },
  scanCta: { marginTop: SPACING.lg, marginBottom: SPACING.sm },
  scanButton: { paddingVertical: SPACING.md },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.gutter },
  quickAction: {
    width: '47%',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.default,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickActionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { ...TYPOGRAPHY.buttonText, color: COLORS.onSurface, fontSize: 12 },
  alertCard: { marginBottom: SPACING.md },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertContent: { flex: 1 },
  alertTitle: { ...TYPOGRAPHY.buttonText, color: COLORS.onSurface, fontSize: 13 },
  alertDesc: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  helplineCard: { backgroundColor: COLORS.primary, marginTop: SPACING.sm },
  helplineRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, justifyContent: 'center' },
  helplineText: { ...TYPOGRAPHY.buttonText, color: COLORS.onPrimary },
});
