import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Card from '../components/Card';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function SettingsScreen({ navigation }) {
  const { t, language, setLanguage } = useLanguage();
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [diseaseAlerts, setDiseaseAlerts] = useState(true);
  const [offlineSync, setOfflineSync] = useState(false);

  const settingsGroups = [
    {
      title: t('settingsLanguage'),
      items: [
        {
          icon: 'language',
          label: t('settingsLanguage'),
          type: 'language',
        },
      ],
    },
    {
      title: t('settingsNotifications'),
      items: [
        {
          icon: 'cloudy',
          label: t('settingsWeatherAlerts'),
          type: 'toggle',
          value: weatherAlerts,
          onToggle: setWeatherAlerts,
        },
        {
          icon: 'bug',
          label: t('settingsDiseaseAlerts'),
          type: 'toggle',
          value: diseaseAlerts,
          onToggle: setDiseaseAlerts,
        },
      ],
    },
    {
      title: t('settingsOfflineSync'),
      items: [
        {
          icon: 'cloud-download',
          label: t('settingsOfflineSync'),
          type: 'toggle',
          value: offlineSync,
          onToggle: setOfflineSync,
        },
        {
          icon: 'trash-outline',
          label: t('settingsClearCache'),
          type: 'action',
          onPress: () => console.log('Clear cache'),
        },
      ],
    },
    {
      title: t('settingsProfile'),
      items: [
        {
          icon: 'person-circle',
          label: t('settingsProfile'),
          type: 'nav',
          onPress: () => navigation.navigate('Profile'),
        },
      ],
    },
    {
      title: t('settingsAbout'),
      items: [
        {
          icon: 'information-circle',
          label: t('settingsAbout'),
          type: 'nav',
          onPress: () => {},
        },
        {
          icon: 'code-slash',
          label: t('settingsVersion'),
          type: 'info',
        },
        {
          icon: 'shield-checkmark',
          label: t('settingsPrivacyPolicy'),
          type: 'nav',
          onPress: () => {},
        },
        {
          icon: 'heart',
          label: t('settingsDeveloper'),
          type: 'info',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('settingsTitle')}</Text>

        {settingsGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Card contentStyle={{ padding: 0 }}>
              {group.items.map((item, iIdx) => (
                <View key={iIdx}>
                  {iIdx > 0 && <View style={styles.divider} />}

                  {item.type === 'language' ? (
                    <View style={styles.settingRow}>
                      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <View style={styles.langButtons}>
                        <TouchableOpacity
                          style={[styles.langBtn, language === LANGUAGES.EN && styles.langBtnActive]}
                          onPress={() => setLanguage(LANGUAGES.EN)}
                        >
                          <Text style={[styles.langBtnText, language === LANGUAGES.EN && styles.langBtnTextActive]}>
                            {t('settingsLanguageEn')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.langBtn, language === LANGUAGES.HI && styles.langBtnActive]}
                          onPress={() => setLanguage(LANGUAGES.HI)}
                        >
                          <Text style={[styles.langBtnText, language === LANGUAGES.HI && styles.langBtnTextActive]}>
                            {t('settingsLanguageHi')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : item.type === 'toggle' ? (
                    <View style={styles.settingRow}>
                      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: COLORS.surfaceContainerHigh, true: COLORS.primaryLight }}
                        thumbColor={item.value ? COLORS.primary : COLORS.ashGray}
                      />
                    </View>
                  ) : item.type === 'nav' ? (
                    <TouchableOpacity style={styles.settingRow} onPress={item.onPress}>
                      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.ashGray} />
                    </TouchableOpacity>
                  ) : item.type === 'action' ? (
                    <TouchableOpacity style={styles.settingRow} onPress={item.onPress}>
                      <Ionicons name={item.icon} size={20} color={COLORS.error} />
                      <Text style={[styles.settingLabel, { color: COLORS.error }]}>{item.label}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.settingRow}>
                      <Ionicons name={item.icon} size={20} color={COLORS.ashGray} />
                      <Text style={[styles.settingLabel, { color: COLORS.ashGray }]}>{item.label}</Text>
                    </View>
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>{t('settingsLogout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { padding: SPACING.marginMobile },
  title: { ...TYPOGRAPHY.headlineLg, color: COLORS.onSurface, marginBottom: SPACING.md },
  group: { marginBottom: SPACING.md },
  groupTitle: { ...TYPOGRAPHY.labelBold, color: COLORS.ashGray, marginBottom: SPACING.sm },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 4,
  },
  settingLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, flex: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  langButtons: { flexDirection: 'row', gap: 4 },
  langBtn: {
    paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.default, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  langBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langBtnText: { ...TYPOGRAPHY.labelBold, color: COLORS.ashGray, fontSize: 11, textTransform: 'none' },
  langBtnTextActive: { color: COLORS.onPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md, marginTop: SPACING.md,
    borderWidth: 1, borderColor: COLORS.error, borderRadius: RADIUS.default,
  },
  logoutText: { ...TYPOGRAPHY.buttonText, color: COLORS.error },
});
