import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

/**
 * Button variants:
 * - 'primary'   → Mustard Yellow bg, black text (primary CTA)
 * - 'secondary' → Deep Green bg, white text
 * - 'outline'   → Green border, green text, transparent bg
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) {
  const buttonStyles = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    disabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    variant === 'primary' && styles.primaryLabel,
    variant === 'secondary' && styles.secondaryLabel,
    variant === 'outline' && styles.outlineLabel,
    disabled && styles.disabledLabel,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? COLORS.primary : variant === 'primary' ? COLORS.black : COLORS.white}
        />
      ) : (
        <>
          {icon}
          <Text style={labelStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.stackSm + 4,
    paddingHorizontal: SPACING.stackMd,
    borderRadius: RADIUS.default,
    gap: SPACING.sm,
  },
  primary: {
    backgroundColor: COLORS.action,
  },
  secondary: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...TYPOGRAPHY.buttonText,
  },
  primaryLabel: {
    color: COLORS.black,
  },
  secondaryLabel: {
    color: COLORS.white,
  },
  outlineLabel: {
    color: COLORS.primary,
  },
  disabledLabel: {
    color: COLORS.ashGray,
  },
});
