import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ title, showBack, onBack, rightComponent }) {
  const insets = useSafeAreaInsets();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      <View style={styles.topRow}>
        {/* Left: Back button or App branding */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={COLORS.onPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandContainer}>
              <View style={styles.emblemCircle}>
                <Ionicons name="leaf" size={18} color={COLORS.action} />
              </View>
              <View>
                <Text style={styles.appName}>{t('appName')}</Text>
                <Text style={styles.appTagline}>{t('appTagline')}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Right: Language toggle + optional component */}
        <View style={styles.rightSection}>
          {rightComponent}
          <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle}>
            <Ionicons name="language" size={16} color={COLORS.primary} />
            <Text style={styles.langToggleText}>{t('langToggle')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen title if provided and not in brand mode */}
      {title && showBack && (
        <Text style={styles.screenTitle}>{title}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emblemCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appName: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onPrimary,
    fontSize: 18,
  },
  appTagline: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onPrimaryContainer,
    fontSize: 10,
  },
  screenTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onPrimary,
    marginTop: SPACING.sm,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  langToggleText: {
    ...TYPOGRAPHY.buttonText,
    color: COLORS.primary,
    fontSize: 12,
  },
});
