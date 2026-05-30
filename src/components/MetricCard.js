import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  bg: '#0a0e27',
  card: '#131840',
  cardBorder: '#1e2556',
  accent: '#4a7cff',
  success: '#00ff88',
  danger: '#ff4466',
  warning: '#ffaa00',
  text: '#e8eaff',
  textDim: '#7a7fa8',
  textMuted: '#4a4f7a',
};

export default function MetricCard({ title, value, subtitle, color, icon, style }) {
  return (
    <View style={[styles.card, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, color && { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    alignItems: 'center',
    minWidth: '47%',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export { COLORS };
