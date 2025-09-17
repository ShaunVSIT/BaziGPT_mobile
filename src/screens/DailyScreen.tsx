import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { baziApi } from '../services/api';
import { useLoading } from '../components/LoadingProvider';
import Markdown from '../components/Markdown';
import { formatForecastToMarkdown } from '../utils/text';

const DailyScreen = () => {
  const navigation = useNavigation<any>();
  const [generalLoading, setGeneralLoading] = useState(true);
  const { show, hide } = useLoading();
  const [generalForecast, setGeneralForecast] = useState<string | null>(null);
  const [pillar, setPillar] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalForecast, setPersonalForecast] = useState<string | null>(null);
  const [profileBirthDate, setProfileBirthDate] = useState<string | null>(null);
  const [profileBirthTime, setProfileBirthTime] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    checkProfile();
    loadGeneralForecast();
  }, []);

  const checkProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      setHasProfile(!!profile);
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          if (parsed?.birthDate) setProfileBirthDate(parsed.birthDate);
          if (parsed?.birthTime) setProfileBirthTime(parsed.birthTime);
          // Prefill local pickers
          if (parsed?.birthDate) {
            const d = new Date(parsed.birthDate);
            if (!isNaN(d.getTime())) setBirthDate(d);
          }
          if (parsed?.birthTime) {
            const t = new Date(`2000-01-01T${parsed.birthTime}:00`);
            if (!isNaN(t.getTime())) setBirthTime(t);
          }
        } catch { }
      } else {
        setProfileBirthDate(null);
        setProfileBirthTime(null);
        setBirthDate(null);
        setBirthTime(null);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const loadGeneralForecast = async () => {
    try {
      setGeneralLoading(true);
      const general = await baziApi.getDailyGeneralForecast();
      setPillar(general.baziPillar);
      setGeneralForecast(general.forecast);
    } catch (error) {
      console.error('Error loading general forecast:', error);
      Alert.alert('Error', 'Failed to load today\'s forecast. Please try again.');
    } finally {
      setGeneralLoading(false);
    }
  };

  const loadPersonalForecast = async () => {
    try {
      setPersonalLoading(true);
      show({ title: "Personalizing Today", subtitle: 'Calculating your alignment...', blocking: true });
      if (!birthDate) {
        return;
      }
      const personal = await baziApi.getDailyPersonalForecast({
        birthDate: format(birthDate, 'yyyy-MM-dd'),
        birthTime: birthTime ? format(birthTime, 'HH:mm') : undefined,
      });
      setPersonalForecast(personal.personalForecast);
    } catch (error) {
      console.error('Error loading personal forecast:', error);
      Alert.alert('Error', 'Failed to load your personal daily reading.');
    } finally {
      setPersonalLoading(false);
      hide();
    }
  };

  const onTogglePersonal = async () => {
    // Only toggle visibility; fetching happens explicitly on button press
    setPersonalOpen((open) => !open);
  };

  // Always show the general forecast section; personal is optional

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: SIZES.xl }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Forecast</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Today's Energy</Text>
          </View>

          {generalLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading today\'s forecast...</Text>
            </View>
          ) : generalForecast ? (
            <>
              {pillar && (
                <Text style={styles.pillarText}>{pillar}</Text>
              )}
              <Markdown>{formatForecastToMarkdown(generalForecast, { forceLastSentenceParagraph: true })}</Markdown>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.accordionButton} onPress={onTogglePersonal} activeOpacity={0.9}>
                <Text style={styles.accordionButtonText}>HOW DOES TODAY AFFECT ME?</Text>
                <Ionicons name={personalOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.text} />
              </TouchableOpacity>

              {personalOpen && (
                <View style={styles.accordionContent}>
                  {personalLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.loadingText}>Personalizing...</Text>
                    </View>
                  ) : personalForecast ? (
                    <Markdown>{formatForecastToMarkdown(personalForecast)}</Markdown>
                  ) : (
                    <View>
                      {/* Birth Date */}
                      <TouchableOpacity
                        style={styles.inputButton}
                        onPress={() => { setTempDate(birthDate || new Date()); setOpenDatePicker(true); }}
                      >
                        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.inputText}>
                          Birth Date: {birthDate ? format(birthDate, 'MMM dd, yyyy') : 'Select'}
                        </Text>
                      </TouchableOpacity>

                      {/* Birth Time */}
                      <TouchableOpacity
                        style={styles.inputButton}
                        onPress={() => { setTempTime(birthTime || new Date()); setOpenTimePicker(true); }}
                      >
                        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.inputText}>
                          Birth Time: {birthTime ? format(birthTime, 'HH:mm') : '--:--'}
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.helperText}>Prefilled from your profile if available.</Text>

                      <TouchableOpacity style={styles.refreshButton} onPress={loadPersonalForecast}>
                        <Ionicons name="sparkles" size={20} color={COLORS.text} />
                        <Text style={styles.refreshButtonText}>Get Personal Daily Forecast</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity style={styles.refreshButton} onPress={loadGeneralForecast}>
              <Ionicons name="refresh" size={20} color={COLORS.text} />
              <Text style={styles.refreshButtonText}>Retry Loading</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* No refresh for general forecast; it is cached for the day */}

        {/* Date Picker Modal */}
        <Modal visible={openDatePicker} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(event, selected) => {
                  if (selected) setTempDate(selected);
                }}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setOpenDatePicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => { setBirthDate(tempDate); setOpenDatePicker(false); }}>
                  <Text style={styles.saveButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Time Picker Modal */}
        <Modal visible={openTimePicker} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={(event, selected) => {
                  if (selected) setTempTime(selected);
                }}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setOpenTimePicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => { setBirthTime(tempTime); setOpenTimePicker(false); }}>
                  <Text style={styles.saveButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: SIZES.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  date: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    marginHorizontal: SIZES.sm,
    marginVertical: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  cardTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  loadingText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
  },
  forecastText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
  },
  pillarText: {
    fontSize: SIZES.h5,
    color: COLORS.primary,
    marginBottom: SIZES.sm,
    fontWeight: '700',
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    gap: SIZES.sm,
  },
  refreshButtonText: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  accordionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
    borderRadius: SIZES.radius,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionButtonText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: SIZES.body,
  },
  accordionContent: {
    marginTop: SIZES.sm,
    gap: SIZES.sm,
  },
  refreshCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    marginHorizontal: SIZES.md,
    marginVertical: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.2)',
  },
  refreshCardText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.15)',
  },
  inputText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    padding: SIZES.sm,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.15)',
    marginBottom: SIZES.xs,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
    marginLeft: SIZES.xs,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: SIZES.body,
    fontWeight: '600',
    marginLeft: SIZES.xs,
  },
  noteText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  helperText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    padding: SIZES.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    gap: SIZES.xs,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  cancelButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  emptySubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DailyScreen;
