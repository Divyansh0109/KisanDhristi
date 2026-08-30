import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

/**
 * Flat card component — 1px border, no shadow (Bharat Civil Service Interface)
 */
export default function Card({ children, title, headerRight, style, contentStyle }) {
  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.headerText}>{title}</Text>
          {headerRight}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.default,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.stackSm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    ...TYPOGRAPHY.buttonText,
    color: COLORS.onSurface,
  },
  content: {
    padding: SPACING.md,
  },
});
