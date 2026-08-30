import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

/**
 * Section title with optional divider line — institutional style
 */
export default function SectionTitle({ title, rightComponent, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {rightComponent}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.stackLg,
    marginBottom: SPACING.stackSm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
