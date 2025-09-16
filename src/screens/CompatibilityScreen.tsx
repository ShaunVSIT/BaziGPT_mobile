import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import Markdown from '../components/Markdown';
import { baziApi, CompatibilityRequest } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CompatibilityScreen = () => {
  const insets = useSafeAreaInsets();
  const [person1, setPerson1] = useState({
    birthDate: new Date(),
    birthTime: new Date(),
  });

  const [person2, setPerson2] = useState({
    birthDate: new Date(),
    birthTime: new Date(),
  });

  const [pickerState, setPickerState] = useState<{
    person: 1 | 2;
    type: 'date' | 'time';
    open: boolean;
  } | null>(null);
  const [tempValue, setTempValue] = useState<Date>(new Date());

  const [loading, setLoading] = useState(false);
  const [compatibility, setCompatibility] = useState<string | null>(null);

  useEffect(() => {
    const loadPerson1FromProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem('userProfile');
        if (saved) {
          const profile = JSON.parse(saved);
          const date = profile.birthDate ? new Date(profile.birthDate) : new Date();
          const time = profile.birthTime ? new Date(`2000-01-01T${profile.birthTime}:00`) : new Date();
          if (!isNaN(date.getTime())) {
            setPerson1((p) => ({ ...p, birthDate: date }));
          }
          if (!isNaN(time.getTime())) {
            setPerson1((p) => ({ ...p, birthTime: time }));
          }
        }
      } catch (e) {
        // ignore
      }
    };
    loadPerson1FromProfile();
  }, []);

  const handleGetCompatibility = async () => {
    try {
      setLoading(true);

      const requestData: CompatibilityRequest = {
        person1: {
          birthDate: format(person1.birthDate, 'yyyy-MM-dd'),
          birthTime: format(person1.birthTime, 'HH:mm'),
        },
        person2: {
          birthDate: format(person2.birthDate, 'yyyy-MM-dd'),
          birthTime: format(person2.birthTime, 'HH:mm'),
        },
      };

      const response = await baziApi.getCompatibility(requestData);
      setCompatibility(response.reading || response.shareableSummary || null);
    } catch (error) {
      console.error('Error getting compatibility:', error);
      Alert.alert('Error', 'Failed to get compatibility analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonCard = (
    personData: typeof person1,
    setPerson: typeof setPerson1,
    personNumber: 1 | 2,
    title: string
  ) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {/* Birth Date */}
      <TouchableOpacity
        style={styles.inputButton}
        onPress={() => { setTempValue(personNumber === 1 ? person1.birthDate : person2.birthDate); setPickerState({ person: personNumber, type: 'date', open: true }); }}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={styles.inputText}>
          Birth Date: {format(personData.birthDate, 'MMM dd, yyyy')}
        </Text>
      </TouchableOpacity>

      {/* Birth Time */}
      <TouchableOpacity
        style={styles.inputButton}
        onPress={() => { setTempValue(personNumber === 1 ? person1.birthTime : person2.birthTime); setPickerState({ person: personNumber, type: 'time', open: true }); }}
      >
        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
        <Text style={styles.inputText}>
          Birth Time: {format(personData.birthTime, 'HH:mm')}
        </Text>
      </TouchableOpacity>

      {/* Gender input removed per web parity */}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        scrollIndicatorInsets={{ top: 0, bottom: insets.bottom }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingLeft: insets.left, paddingRight: insets.right },
        ]}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.title}>Compatibility Analysis</Text>
          <Text style={styles.subtitle}>
            Discover your relationship compatibility through Bazi astrology
          </Text>
        </View>

        {renderPersonCard(person1, setPerson1, 1, 'Person 1')}
        {renderPersonCard(person2, setPerson2, 2, 'Person 2')}

        {/* Analyze Button */}
        <View style={styles.card}>
          <TouchableOpacity onPress={handleGetCompatibility} disabled={loading} activeOpacity={0.9}>
            <LinearGradient
              colors={[COLORS.primary, '#ffb74d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <>
                  <Ionicons name="heart" size={20} color={COLORS.text} />
                  <Text style={styles.submitButtonText}>Analyze Compatibility</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Compatibility Result */}
        {compatibility && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Compatibility Analysis</Text>
            <Markdown>{compatibility}</Markdown>
          </View>
        )}

        {/* Date/Time Picker */}
        {/* Date/Time Picker Modal with confirm/cancel */}
        <Modal visible={!!pickerState?.open} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <DateTimePicker
                value={tempValue}
                mode={pickerState?.type || 'date'}
                display="spinner"
                onChange={(event, selected) => {
                  if (selected) setTempValue(selected);
                }}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setPickerState(null)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={() => {
                    if (!pickerState) return;
                    if (pickerState.person === 1) {
                      if (pickerState.type === 'date') setPerson1({ ...person1, birthDate: tempValue });
                      else setPerson1({ ...person1, birthTime: tempValue });
                    } else {
                      if (pickerState.type === 'date') setPerson2({ ...person2, birthDate: tempValue });
                      else setPerson2({ ...person2, birthTime: tempValue });
                    }
                    setPickerState(null);
                  }}
                >
                  <Text style={styles.saveButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Let background component from App.tsx show through
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SIZES.md, // Reduced bottom padding
  },
  header: {
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
    paddingBottom: SIZES.sm, // Reduced bottom padding
    // paddingTop is now dynamically set using safe area insets
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)', // Semi-transparent to blend with background
    marginHorizontal: SIZES.sm, // tighter sides
    marginVertical: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.2)',
  },
  cardTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md, // Reduced margin below card title
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.md, // Reduced padding
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm, // Reduced margin between inputs
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  genderContainer: {
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  genderButton: {
    flex: 1,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  genderButtonTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    gap: SIZES.sm,
  },
  submitButtonText: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    gap: SIZES.sm,
  },
  compatibilityText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
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
});

export default CompatibilityScreen;
