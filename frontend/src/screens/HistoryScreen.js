import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Badge from '../components/Badge';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { fetchScanHistory } from '../services/scanService';
import { getCropEmoji } from '../constants/crops';
const FILTERS = ['all', 'diseased', 'healthy'];

export default function HistoryScreen({ navigation }) {
  const { t, language } = useLanguage();
  const [scans, setScans] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchScanHistory(undefined, 'all');
      setScans(data);
    } catch (error) {
      console.error('History load error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Apply filter + search
  useEffect(() => {
    let result = [...scans];

    // Filter by status
    if (activeFilter === 'diseased') {
      result = result.filter((s) => s.diseaseName !== 'Healthy');
    } else if (activeFilter === 'healthy') {
      result = result.filter((s) => s.diseaseName === 'Healthy');
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.cropType && s.cropType.toLowerCase().includes(q)) ||
          (s.diseaseName && s.diseaseName.toLowerCase().includes(q)) ||
          (s.timestamp && formatDate(s.timestamp).toLowerCase().includes(q))
      );
    }

    setFilteredScans(result);
  }, [scans, activeFilter, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getFilterLabel = (filter) => {
    if (filter === 'all') return t('historyFilterAll');
    if (filter === 'diseased') return t('historyFilterDiseased');
    return t('historyFilterHealthy');
  };

  const formatDate = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
        <Text style={styles.title}>{t('historyTitle')}</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.ashGray} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('historySearch')}
            placeholderTextColor={COLORS.ashGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.ashGray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
                {getFilterLabel(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Scan Cards */}
        {filteredScans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.outlineVariant} />
            <Text style={styles.emptyText}>{t('historyNoRecords')}</Text>
          </View>
        ) : (
          filteredScans.map((scan) => (
            <TouchableOpacity key={scan.id} style={styles.scanCard} activeOpacity={0.7}>
              {/* Thumbnail */}
              <View style={styles.scanThumb}>
                {scan.imageUrl ? (
                  <Image source={{ uri: scan.imageUrl }} style={styles.scanImage} />
                ) : (
                  <View style={styles.scanImagePlaceholder}>
                    <Text style={{ fontSize: 28 }}>{getCropEmoji(scan.cropType)}</Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.scanInfo}>
                <View style={styles.scanTopRow}>
                  <Text style={styles.scanDisease}>
                    {scan.diseaseName === 'Healthy' ? t('diagnosisHealthy') : scan.diseaseName}
                  </Text>
                  <Badge
                    label={scan.diseaseName === 'Healthy' ? t('diagnosisHealthy') : scan.severity || 'medium'}
                    status={scan.diseaseName === 'Healthy' ? 'healthy' : (scan.severity || 'medium')}
                  />
                </View>
                <Text style={styles.scanCrop}>{scan.cropType}</Text>
                <View style={styles.scanBottomRow}>
                  <View style={styles.scanMeta}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.ashGray} />
                    <Text style={styles.scanDate}>{formatDate(scan.timestamp)}</Text>
                  </View>
                  <View style={styles.scanMeta}>
                    <Ionicons name="analytics-outline" size={12} color={COLORS.ashGray} />
                    <Text style={styles.scanDate}>{Math.round((scan.confidence || 0) * 100)}%</Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color={COLORS.ashGray} />
            </TouchableOpacity>
          ))
        )}

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
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLowest, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.default, paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchInput: { flex: 1, ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, padding: 0 },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  filterTab: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.default,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { ...TYPOGRAPHY.buttonText, color: COLORS.ashGray, fontSize: 13 },
  filterTabTextActive: { color: COLORS.onPrimary },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyText: { ...TYPOGRAPHY.bodyMd, color: COLORS.ashGray },
  scanCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLowest, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.default, padding: SPACING.sm + 4, marginBottom: SPACING.sm,
  },
  scanThumb: { width: 56, height: 56, borderRadius: RADIUS.default, overflow: 'hidden' },
  scanImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  scanImagePlaceholder: {
    width: '100%', height: '100%', backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  scanInfo: { flex: 1, gap: 2 },
  scanTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scanDisease: { ...TYPOGRAPHY.buttonText, color: COLORS.onSurface, fontSize: 13, flex: 1, marginRight: 8 },
  scanCrop: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray },
  scanBottomRow: { flexDirection: 'row', gap: SPACING.md, marginTop: 2 },
  scanMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scanDate: { ...TYPOGRAPHY.labelSm, color: COLORS.ashGray, fontSize: 11 },
});
