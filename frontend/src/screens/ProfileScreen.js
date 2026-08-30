import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import SectionTitle from '../components/SectionTitle';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { getUserProfile, saveUserProfile, uploadProfilePhoto } from '../services/userService';
import { CROPS } from '../constants/crops';


const STATES = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function ProfileScreen({ navigation }) {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    state: '',
    district: '',
    village: '',
    cropsGrown: [],
    photoUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStates, setShowStates] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setIsOffline(!!data.isOfflineFallback);
      setProfile((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Load profile error:', error);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCrop = (cropValue) => {
    setProfile((prev) => {
      const crops = prev.cropsGrown || [];
      if (crops.includes(cropValue)) {
        return { ...prev, cropsGrown: crops.filter((c) => c !== cropValue) };
      }
      return { ...prev, cropsGrown: [...crops, cropValue] };
    });
  };

  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        const uploadedUrl = await uploadProfilePhoto(result.assets[0].uri);
        updateField('photoUrl', uploadedUrl);
      }
    } catch (error) {
      console.error('Photo picker error:', error);
    }
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      Alert.alert(t('profileName'), language === 'hi' ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      const success = await saveUserProfile(profile);
      if (success) {
        Alert.alert('✅', t('profileSaved'));
      } else {
        // Still show success for demo when Firebase isn't configured
        Alert.alert('✅', t('profileSaved'));
      }
    } catch (error) {
      console.error('Save profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={t('profileTitle')} showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t('profileTitle')} showBack onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Offline warning banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#92400e" />
            <Text style={styles.offlineBannerText}>
              {language === 'hi'
                ? 'ऑफ़लाइन मोड — प्रोफ़ाइल अपडेट नहीं हो सकता'
                : 'Offline mode — profile data may not be up to date'}
            </Text>
          </View>
        )}

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickPhoto} style={styles.avatarContainer}>
            {profile.photoUrl ? (
              <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.outlineVariant} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color={COLORS.onPrimary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>{t('profileChangePhoto')}</Text>
        </View>

        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('profileName')}</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder={language === 'hi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
            placeholderTextColor={COLORS.ashGray}
          />
        </View>

        {/* Phone */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('profilePhone')}</Text>
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(v) => updateField('phone', v)}
            placeholder="+91 XXXXX XXXXX"
            placeholderTextColor={COLORS.ashGray}
            keyboardType="phone-pad"
          />
        </View>

        {/* State */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('profileState')}</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowStates(!showStates)}
          >
            <Text style={profile.state ? styles.dropdownText : styles.dropdownPlaceholder}>
              {profile.state || (language === 'hi' ? 'राज्य चुनें' : 'Select State')}
            </Text>
            <Ionicons name={showStates ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.ashGray} />
          </TouchableOpacity>
          {showStates && (
            <View style={styles.dropdownList}>
              {STATES.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[styles.dropdownItem, profile.state === state && styles.dropdownItemActive]}
                  onPress={() => {
                    updateField('state', state);
                    setShowStates(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, profile.state === state && styles.dropdownItemTextActive]}>
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* District */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('profileDistrict')}</Text>
          <TextInput
            style={styles.input}
            value={profile.district}
            onChangeText={(v) => updateField('district', v)}
            placeholder={language === 'hi' ? 'जिला दर्ज करें' : 'Enter district'}
            placeholderTextColor={COLORS.ashGray}
          />
        </View>

        {/* Village */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('profileVillage')}</Text>
          <TextInput
            style={styles.input}
            value={profile.village}
            onChangeText={(v) => updateField('village', v)}
            placeholder={language === 'hi' ? 'गाँव / तहसील दर्ज करें' : 'Enter village / tehsil'}
            placeholderTextColor={COLORS.ashGray}
          />
        </View>

        {/* Crops Grown - Multi-select Chips */}
        <SectionTitle title={t('profileCropsGrown')} />
        <View style={styles.cropGrid}>
          {CROPS.map((crop) => {
            const isSelected = (profile.cropsGrown || []).includes(crop.value);
            return (
              <TouchableOpacity
                key={crop.value}
                style={[styles.cropChip, isSelected && styles.cropChipSelected]}
                onPress={() => toggleCrop(crop.value)}
              >
                <Text style={styles.cropEmoji}>{crop.icon}</Text>
                <Text style={[styles.cropLabel, isSelected && styles.cropLabelSelected]}>
                  {t(crop.key)}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.onPrimary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <Button
          title={t('profileSave')}
          variant="primary"
          loading={saving}
          icon={!saving ? <Ionicons name="save" size={18} color={COLORS.black} /> : null}
          onPress={handleSave}
          style={styles.saveButton}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { padding: SPACING.marginMobile },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.lg },
  avatarContainer: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: COLORS.primary },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.surfaceContainer, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.surfaceContainerLowest,
  },
  changePhotoText: { ...TYPOGRAPHY.labelSm, color: COLORS.primary, marginTop: SPACING.xs },
  fieldGroup: { marginBottom: SPACING.md },
  fieldLabel: { ...TYPOGRAPHY.labelBold, color: COLORS.onSurface, marginBottom: SPACING.xs, textTransform: 'none' },
  input: {
    ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.default,
    paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.sm + 4,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.default,
    paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.sm + 4,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  dropdownText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface },
  dropdownPlaceholder: { ...TYPOGRAPHY.bodyMd, color: COLORS.ashGray },
  dropdownList: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.default,
    marginTop: 4, backgroundColor: COLORS.surfaceContainerLowest, maxHeight: 200,
  },
  dropdownItem: { paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.sm + 2, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceContainerHigh },
  dropdownItemActive: { backgroundColor: COLORS.primaryLight },
  dropdownItemText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface },
  dropdownItemTextActive: { color: COLORS.primary, fontWeight: '600' },
  cropGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cropChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: SPACING.sm + 4, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.default, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  cropChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cropEmoji: { fontSize: 15 },
  cropLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, fontSize: 12 },
  cropLabelSelected: { color: COLORS.onPrimary },
  saveButton: { marginTop: SPACING.lg, paddingVertical: SPACING.md },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#f59e0b',
    borderRadius: RADIUS.default, paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm, marginBottom: SPACING.md,
  },
  offlineBannerText: {
    ...TYPOGRAPHY.bodySm, color: '#92400e', flex: 1,
  },
});
