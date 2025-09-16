import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface UserProfile {
  birthDate: string;
  birthTime: string;
  name?: string;
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>({
    birthDate: format(new Date(), 'yyyy-MM-dd'),
    birthTime: format(new Date(), 'HH:mm'),
    name: '',
  });
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [tempValue, setTempValue] = useState<Date>(new Date());

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setTempProfile(parsedProfile);
      } else {
        setEditing(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(tempProfile));
      setProfile(tempProfile);
      setEditing(false);
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const clearProfile = () => {
    Alert.alert(
      'Clear Profile',
      'Are you sure you want to clear your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userProfile');
              setProfile(null);
              setTempProfile({
                birthDate: format(new Date(), 'yyyy-MM-dd'),
                birthTime: format(new Date(), 'HH:mm'),
                name: '',
              });
              setEditing(true);
            } catch (error) {
              console.error('Error clearing profile:', error);
            }
          },
        },
      ]
    );
  };

  const renderEditForm = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {profile ? 'Edit Profile' : 'Create Profile'}
      </Text>

      {/* Birth Date */}
      <TouchableOpacity
        style={styles.inputButton}
        onPress={() => { setTempValue(new Date(tempProfile.birthDate)); setShowPicker('date'); }}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={styles.inputText}>
          Birth Date: {format(new Date(tempProfile.birthDate), 'MMM dd, yyyy')}
        </Text>
      </TouchableOpacity>

      {/* Birth Time */}
      <TouchableOpacity
        style={styles.inputButton}
        onPress={() => { setTempValue(new Date(`2000-01-01T${tempProfile.birthTime}:00`)); setShowPicker('time'); }}
      >
        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
        <Text style={styles.inputText}>
          Birth Time: {tempProfile.birthTime}
        </Text>
      </TouchableOpacity>

      {/* Gender input removed per web parity */}

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            setEditing(false);
            if (profile) {
              setTempProfile(profile);
            }
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={saveProfile}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileView = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Your Profile</Text>

      <View style={styles.profileItem}>
        <Ionicons name="calendar" size={20} color={COLORS.primary} />
        <Text style={styles.profileLabel}>Birth Date:</Text>
        <Text style={styles.profileValue}>
          {format(new Date(profile!.birthDate), 'MMM dd, yyyy')}
        </Text>
      </View>

      <View style={styles.profileItem}>
        <Ionicons name="time" size={20} color={COLORS.primary} />
        <Text style={styles.profileLabel}>Birth Time:</Text>
        <Text style={styles.profileValue}>{profile!.birthTime}</Text>
      </View>

      {/* Gender display removed */}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setEditing(true)}
        >
          <Ionicons name="pencil" size={16} color={COLORS.text} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearProfile}
        >
          <Ionicons name="trash" size={16} color={COLORS.error} />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        scrollIndicatorInsets={{ top: 0 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your birth information for personalized readings
          </Text>
        </View>

        {editing ? renderEditForm() : profile ? renderProfileView() : renderEditForm()}

        {/* Date/Time Picker Modal with confirm/cancel */}
        <Modal visible={!!showPicker} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <DateTimePicker
                value={tempValue}
                mode={showPicker || 'date'}
                display="spinner"
                onChange={(event, selected) => { if (selected) setTempValue(selected); }}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setShowPicker(null)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={() => {
                    if (showPicker === 'date') {
                      setTempProfile({ ...tempProfile, birthDate: format(tempValue, 'yyyy-MM-dd') });
                    } else if (showPicker === 'time') {
                      setTempProfile({ ...tempProfile, birthTime: format(tempValue, 'HH:mm') });
                    }
                    setShowPicker(null);
                  }}
                >
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
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: SIZES.lg,
    alignItems: 'center',
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
    backgroundColor: COLORS.surface,
    margin: SIZES.md,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
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
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  profileLabel: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
    minWidth: 80,
  },
  profileValue: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SIZES.sm,
  },
  buttonRow: {
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
  editButton: {
    backgroundColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  clearButtonText: {
    fontSize: SIZES.body,
    color: COLORS.error,
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
});

export default ProfileScreen;
