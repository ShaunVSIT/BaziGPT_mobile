import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { baziApi } from '../services/api';
import { useLoading } from '../components/LoadingProvider';

const DailyScreen = () => {
  const [loading, setLoading] = useState(false);
  const { show, hide } = useLoading();
  const [forecast, setForecast] = useState<string | null>(null);
  const [pillar, setPillar] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      setHasProfile(!!profile);
      if (profile) {
        loadDailyForecast();
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const loadDailyForecast = async () => {
    try {
      setLoading(true);
      show({ title: 'Loading Daily Forecast', subtitle: 'Calculating today\'s energy...', blocking: true });
      const profile = await AsyncStorage.getItem('userProfile');

      if (!profile) {
        Alert.alert('No Profile', 'Please set up your profile first to get daily forecasts.');
        return;
      }

      const userData = JSON.parse(profile);
      // General daily forecast (cached server-side)
      const general = await baziApi.getDailyGeneralForecast();
      setPillar(general.baziPillar);

      // Personal forecast (POST), aligns with web API
      const personal = await baziApi.getDailyPersonalForecast({
        birthDate: userData.birthDate,
        birthTime: userData.birthTime,
      });
      setForecast(personal.personalForecast || general.forecast);
    } catch (error) {
      console.error('Error loading daily forecast:', error);
      Alert.alert('Error', 'Failed to load daily forecast. Please try again.');
    } finally {
      setLoading(false);
      hide();
    }
  };

  if (!hasProfile) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Profile Set</Text>
          <Text style={styles.emptySubtitle}>
            Please complete your profile in the Home screen to get personalized daily forecasts.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Forecast</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Today's Energy</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading your forecast...</Text>
            </View>
          ) : forecast ? (
            <>
              {pillar && (
                <Text style={styles.pillarText}>{pillar}</Text>
              )}
              <Text style={styles.forecastText}>{forecast}</Text>
            </>
          ) : (
            <TouchableOpacity style={styles.refreshButton} onPress={loadDailyForecast}>
              <Ionicons name="refresh" size={20} color={COLORS.text} />
              <Text style={styles.refreshButtonText}>Get Today's Forecast</Text>
            </TouchableOpacity>
          )}
        </View>

        {forecast && (
          <TouchableOpacity style={styles.refreshCard} onPress={loadDailyForecast}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.refreshCardText}>Refresh Forecast</Text>
          </TouchableOpacity>
        )}
      </View>
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
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.sm,
    marginVertical: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
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
  refreshCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.md,
    marginVertical: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  refreshCardText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
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
