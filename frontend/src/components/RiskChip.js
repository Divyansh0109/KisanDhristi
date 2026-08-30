import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

/**
 * Risk assessment chip with icon for field risk advisories
 * level: 'low' | 'medium' | 'high'
 */
const RISK_CONFIG = {
  low: {
    bg: '#E8F5E9',
    border: '#2E7D32',
    text: '#2E7D32',
    icon: 'shield-checkmark-outline',
  },
  medium: {
    bg: '#FFF8E1',
    border: '#F57F17',
    text: '#F57F17',
    icon: 'warning-outline',
  },
  high: {
    bg: '#FFEBEE',
    border: '#C62828',
    text: '#C62828',
    icon: 'alert-circle-outline',
  },
};

export default function RiskChip({ label, level = 'low', style }) {
  const config = RISK_CONFIG[level] || RISK_CONFIG.low;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <Ionicons name={config.icon} size={16} color={config.text} />
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.stackSm + 2,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.default,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  text: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '500',
    flex: 1,
  },
});
