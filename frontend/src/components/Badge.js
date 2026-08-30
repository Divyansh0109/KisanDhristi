import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

/**
 * Status badge/chip with tinted background and 1px border
 * status: 'healthy' | 'diseased' | 'warning' | 'info' | 'low' | 'medium' | 'high'
 */
const STATUS_CONFIG = {
  healthy: {
    bg: '#E8F5E9',
    border: '#2E7D32',
    text: '#2E7D32',
  },
  diseased: {
    bg: '#FFEBEE',
    border: '#C62828',
    text: '#C62828',
  },
  warning: {
    bg: '#FFF8E1',
    border: '#F57F17',
    text: '#F57F17',
  },
  info: {
    bg: '#E8EAF6',
    border: '#0C0566',
    text: '#0C0566',
  },
  low: {
    bg: '#E8F5E9',
    border: '#2E7D32',
    text: '#2E7D32',
  },
  medium: {
    bg: '#FFF8E1',
    border: '#F57F17',
    text: '#F57F17',
  },
  high: {
    bg: '#FFEBEE',
    border: '#C62828',
    text: '#C62828',
  },
};

export default function Badge({ label, status = 'info', style }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.info;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.default,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.labelBold,
    fontSize: 10,
  },
});
